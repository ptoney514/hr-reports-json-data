#!/usr/bin/env node

/**
 * Internal Mobility Data ETL to Postgres
 *
 * Processes internal mobility (promotions, transfers, etc.) and loads to Neon Postgres
 * - Reads from cleaned JSON or existing staticData
 * - Categorizes action types
 * - Upserts to fact_mobility_events
 *
 * Usage:
 *   node scripts/etl/mobility-to-postgres.js --from-json --file mobility.json --quarter FY25_Q2
 *   node scripts/etl/mobility-to-postgres.js --from-static --quarter FY25_Q2
 */

const fs = require('fs');
const path = require('path');
const { sql, endPool, startAuditLog, completeAuditLog, checkConnection } = require('./neon-client');
const { hashValue } = require('../utils/pii-removal');
const { getQuarterDatesFromKey, formatDate } = require('../utils/fiscal-calendar');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    fromJson: false,
    fromStatic: false,
    file: null,
    quarter: null,
    dryRun: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--from-json':
        options.fromJson = true;
        break;
      case '--from-static':
        options.fromStatic = true;
        break;
      case '--file':
        options.file = args[++i];
        break;
      case '--quarter':
      case '-q':
        options.quarter = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
${colors.cyan}Internal Mobility ETL to Postgres${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node scripts/etl/mobility-to-postgres.js --from-json --file mobility.json --quarter FY25_Q2
  node scripts/etl/mobility-to-postgres.js --from-static --quarter FY25_Q2

${colors.yellow}Options:${colors.reset}
  --from-json           Load from JSON file
  --from-static         Load from existing staticData.js
  --file FILE           JSON file path
  -q, --quarter PERIOD  Fiscal period (e.g., FY25_Q2)
  --dry-run             Preview without database writes
`);
}

/**
 * Categorize action type from reason/action text
 */
function categorizeActionType(action, reason) {
  const combined = ((action || '') + ' ' + (reason || '')).toLowerCase();

  if (combined.includes('promot')) return 'promotion';
  if (combined.includes('demot')) return 'demotion';
  if (combined.includes('transfer')) return 'transfer';
  if (combined.includes('reclass')) return 'reclassification';
  if (combined.includes('lateral')) return 'lateral';

  // Default based on grade change
  return 'transfer';
}

/**
 * Load school lookup
 */
async function loadSchoolLookup() {
  const schools = await sql`SELECT school_id, code, name FROM dim_schools`;
  const lookup = {};

  schools.forEach(s => {
    lookup[s.code.toLowerCase()] = s.school_id;
    lookup[s.name.toLowerCase()] = s.school_id;
  });

  return lookup;
}

/**
 * Match school name to ID
 */
function findSchoolId(schoolName, lookup) {
  if (!schoolName) return null;

  const schoolLower = schoolName.toLowerCase();
  let schoolId = lookup[schoolLower];

  if (!schoolId) {
    for (const [key, id] of Object.entries(lookup)) {
      if (key.includes(schoolLower) || schoolLower.includes(key)) {
        schoolId = id;
        break;
      }
    }
  }

  return schoolId || null;
}

/**
 * Process and upsert mobility events
 */
async function processMobilityEvents(rows, options, sourceFile) {
  const schoolLookup = await loadSchoolLookup();

  let inserted = 0;
  let updated = 0;
  let errored = 0;

  const periodDate = options.quarter
    ? formatDate(getQuarterDatesFromKey(options.quarter).end)
    : null;

  for (const row of rows) {
    // Get employee hash
    const employeeId = row.employee_id || row.employeeId || row['Employee ID'];
    const employeeHash = employeeId ? hashValue(employeeId.toString()) : `anon_${Date.now()}_${Math.random()}`;

    // Get effective date
    const effectiveDate = row.effective_date || row.effectiveDate || row.date;
    if (!effectiveDate) continue;

    // Categorize action
    const actionType = categorizeActionType(row.action, row.reason);
    const reasonCode = row.reason_code || row.reasonCode || row.reason || null;

    // Before state
    const beforeSchool = row.before_school || row.beforeSchool || row.from_school || row.fromSchool;
    const beforeSchoolId = findSchoolId(beforeSchool, schoolLookup);
    const beforeGrade = row.before_grade || row.beforeGrade || row.from_grade || null;
    const beforeJobFamily = row.before_job_family || row.beforeJobFamily || null;

    // After state
    const afterSchool = row.after_school || row.afterSchool || row.to_school || row.toSchool;
    const afterSchoolId = findSchoolId(afterSchool, schoolLookup);
    const afterGrade = row.after_grade || row.afterGrade || row.to_grade || null;
    const afterJobFamily = row.after_job_family || row.afterJobFamily || null;

    // Flags
    const isCrossSchool = beforeSchoolId !== afterSchoolId && beforeSchoolId !== null && afterSchoolId !== null;
    const isCrossDepartment = row.is_cross_department || row.isCrossDepartment || false;

    // Grade change calculation
    let gradeChange = null;
    if (beforeGrade && afterGrade) {
      const beforeNum = parseInt(beforeGrade.replace(/\D/g, '')) || 0;
      const afterNum = parseInt(afterGrade.replace(/\D/g, '')) || 0;
      if (beforeNum && afterNum) {
        gradeChange = afterNum - beforeNum;
      }
    }

    if (options.dryRun) {
      console.log(`  [DRY RUN] Would upsert: ${employeeHash.substring(0, 8)}... | ${effectiveDate} | ${actionType}`);
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_mobility_events (
          employee_hash, period_date, effective_date,
          action_type, reason_code,
          before_school_id, before_grade_code, before_job_family,
          after_school_id, after_grade_code, after_job_family,
          is_cross_school, is_cross_department, grade_change,
          source_file
        )
        VALUES (
          ${employeeHash}, ${periodDate}, ${effectiveDate},
          ${actionType}, ${reasonCode},
          ${beforeSchoolId}, ${beforeGrade}, ${beforeJobFamily},
          ${afterSchoolId}, ${afterGrade}, ${afterJobFamily},
          ${isCrossSchool}, ${isCrossDepartment}, ${gradeChange},
          ${path.basename(sourceFile)}
        )
        ON CONFLICT (employee_hash, effective_date, action_type)
        DO UPDATE SET
          period_date = EXCLUDED.period_date,
          reason_code = EXCLUDED.reason_code,
          before_school_id = EXCLUDED.before_school_id,
          before_grade_code = EXCLUDED.before_grade_code,
          before_job_family = EXCLUDED.before_job_family,
          after_school_id = EXCLUDED.after_school_id,
          after_grade_code = EXCLUDED.after_grade_code,
          after_job_family = EXCLUDED.after_job_family,
          is_cross_school = EXCLUDED.is_cross_school,
          is_cross_department = EXCLUDED.is_cross_department,
          grade_change = EXCLUDED.grade_change,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;

      if (result[0]?.inserted) {
        inserted++;
      } else {
        updated++;
      }
    } catch (error) {
      console.error(`  Error upserting mobility event: ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs();

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}   Internal Mobility ETL to Postgres${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  // Check connection
  console.log(`${colors.blue}Checking database connection...${colors.reset}`);
  const connected = await checkConnection();

  if (!connected) {
    console.error(`${colors.red}Failed to connect to database.${colors.reset}`);
    process.exit(1);
  }
  console.log(`${colors.green}✓${colors.reset} Connected\n`);

  // Validate input
  if (!options.fromJson && !options.fromStatic) {
    console.error(`${colors.red}Error: Either --from-json or --from-static is required${colors.reset}`);
    printHelp();
    process.exit(1);
  }

  if (!options.quarter) {
    console.error(`${colors.red}Error: --quarter is required${colors.reset}`);
    printHelp();
    process.exit(1);
  }

  // Load data
  let rows;
  let sourceFile;

  if (options.fromStatic) {
    // Load from existing internalMobilityData.js
    const dataPath = path.join(__dirname, '..', '..', 'src', 'data', 'internalMobilityData.js');
    console.log(`${colors.blue}Loading from staticData: ${dataPath}${colors.reset}`);

    // Read and parse the module
    const content = fs.readFileSync(dataPath, 'utf-8');
    // Extract data using regex (simple approach)
    const match = content.match(/export\s+const\s+\w+\s*=\s*(\[[\s\S]*?\]);/);
    if (match) {
      // This is a simplified approach - in production you might use require() or import()
      console.log(`${colors.yellow}Note: Loading from static data requires manual data extraction${colors.reset}`);
      rows = [];
    } else {
      rows = [];
    }
    sourceFile = dataPath;
    console.log(`${colors.green}✓${colors.reset} Would load from static (${rows.length} records)\n`);
  } else {
    sourceFile = options.file;
    console.log(`${colors.blue}Loading JSON: ${sourceFile}${colors.reset}`);
    rows = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
    console.log(`${colors.green}✓${colors.reset} Loaded ${rows.length} mobility events\n`);
  }

  if (rows.length === 0) {
    console.log(`${colors.yellow}No mobility events to process.${colors.reset}`);
    await endPool();
    return;
  }

  // Start audit log
  const periodDate = formatDate(getQuarterDatesFromKey(options.quarter).end);
  let loadId = null;

  if (!options.dryRun) {
    loadId = await startAuditLog({
      loadType: 'mobility',
      sourceFile: path.basename(sourceFile),
      periodDate,
      fiscalPeriod: options.quarter
    });
    console.log(`${colors.blue}Audit log started (ID: ${loadId})${colors.reset}\n`);
  }

  // Process events
  console.log(`${colors.blue}${options.dryRun ? '[DRY RUN] ' : ''}Processing mobility events...${colors.reset}`);
  const { inserted, updated, errored } = await processMobilityEvents(rows, options, sourceFile);

  console.log(`\n${colors.green}✓${colors.reset} Results:`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Errors: ${errored}\n`);

  // Complete audit log
  if (loadId) {
    await completeAuditLog(loadId, {
      recordsRead: rows.length,
      recordsInserted: inserted,
      recordsUpdated: updated,
      recordsErrored: errored,
      status: 'completed'
    });
  }

  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.green}✓ Mobility ETL Complete${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  await endPool();
}

main().catch(async error => {
  console.error(`\n${colors.red}Fatal error: ${error.message}${colors.reset}`);
  await endPool();
  process.exit(1);
});
