#!/usr/bin/env node

/**
 * Workforce Data ETL to Postgres
 *
 * Processes workforce Excel data and loads to Neon Postgres
 * - Reads Excel from source-metrics/workforce/raw/
 * - Removes PII
 * - Categorizes employees
 * - Upserts to fact_workforce_snapshots
 *
 * Usage:
 *   node scripts/etl/workforce-to-postgres.js --input file.xlsx --quarter FY25_Q2
 *   node scripts/etl/workforce-to-postgres.js --from-json --file workforce_cleaned.json
 */

const fs = require('fs');
const path = require('path');
const { sql, endPool, startAuditLog, completeAuditLog, checkConnection } = require('./neon-client');

// Import existing utilities
const {
  loadExcelFile,
  sheetToJSON,
  getSheetNames,
  excelDateToJSDate,
  formatDate,
  isExcelDate
} = require('../utils/excel-helpers');

const {
  getFiscalPeriodKey,
  parseFiscalPeriodKey,
  getQuarterDatesFromKey
} = require('../utils/fiscal-calendar');

const { removePII } = require('../utils/pii-removal');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Assignment category classifications
const BENEFIT_ELIGIBLE_CATEGORIES = ['F12', 'F09', 'F10', 'F11', 'PT12', 'PT10', 'PT9', 'PT11'];
const STUDENT_CATEGORIES = ['SUE', 'CWS'];
const SPECIAL_CATEGORIES = ['HSP', 'HSR', 'TEMP', 'NBE', 'PRN'];

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: null,
    quarter: null,
    date: null,
    fromJson: false,
    file: null,
    dryRun: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
      case '-i':
        options.input = args[++i];
        break;
      case '--quarter':
      case '-q':
        options.quarter = args[++i];
        break;
      case '--date':
      case '-d':
        options.date = args[++i];
        break;
      case '--from-json':
        options.fromJson = true;
        break;
      case '--file':
        options.file = args[++i];
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

/**
 * Print help message
 */
function printHelp() {
  console.log(`
${colors.cyan}Workforce Data ETL to Postgres${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node scripts/etl/workforce-to-postgres.js --input file.xlsx --quarter FY25_Q2
  node scripts/etl/workforce-to-postgres.js --from-json --file cleaned.json --quarter FY25_Q2

${colors.yellow}Options:${colors.reset}
  -i, --input FILE      Input Excel file path
  -q, --quarter PERIOD  Fiscal period (e.g., FY25_Q2)
  -d, --date DATE       Report date (YYYY-MM-DD format)
  --from-json           Load from JSON instead of Excel
  --file FILE           JSON file path (with --from-json)
  --dry-run             Preview without database writes
`);
}

/**
 * Categorize employee based on assignment category
 */
function categorizeEmployee(assignmentCategory) {
  if (!assignmentCategory) return { type: 'other', isBenefitEligible: false };

  const category = assignmentCategory.toString().trim().toUpperCase();

  if (BENEFIT_ELIGIBLE_CATEGORIES.includes(category)) {
    const type = category.startsWith('F') ? 'faculty' : 'staff';
    return { type, isBenefitEligible: true, code: category };
  }

  if (STUDENT_CATEGORIES.includes(category)) {
    return { type: 'student', isBenefitEligible: false, code: category };
  }

  if (category === 'HSP' || category === 'HSR') {
    return { type: 'hsp', isBenefitEligible: false, code: category };
  }

  if (category === 'TEMP' || category === 'NBE' || category === 'PRN') {
    return { type: 'temp', isBenefitEligible: false, code: category };
  }

  return { type: 'other', isBenefitEligible: false, code: category || 'UNKNOWN' };
}

/**
 * Aggregate data for database insert
 */
function aggregateWorkforceData(rows, periodDate) {
  const aggregations = {};

  rows.forEach(row => {
    // Get location
    const locationRaw = row.Location || row.location || row.LOCATION || row.State || '';
    const location = locationRaw.toString().toLowerCase().includes('phoenix') ? 'phoenix' : 'omaha';

    // Get assignment category
    const categoryCode = row['Assignment Category Code'] ||
      row['Assignment Category'] ||
      row.assignment_category ||
      row.assignment_category_code ||
      row.assignmentCategoryCode ||
      'UNKNOWN';

    const { type, isBenefitEligible } = categorizeEmployee(categoryCode);

    // Get school/org
    const schoolRaw = row.School || row.school || row['VP Area'] || row.Department || '';
    const school = schoolRaw.toString().trim();

    // Create aggregation key
    const key = `${location}|${categoryCode}|${school}`;

    if (!aggregations[key]) {
      aggregations[key] = {
        periodDate,
        location,
        categoryCode: categoryCode.toUpperCase(),
        school,
        headcount: 0,
        facultyCount: 0,
        staffCount: 0,
        hspCount: 0,
        studentCount: 0,
        tempCount: 0
      };
    }

    aggregations[key].headcount++;

    switch (type) {
      case 'faculty':
        aggregations[key].facultyCount++;
        break;
      case 'staff':
        aggregations[key].staffCount++;
        break;
      case 'hsp':
        aggregations[key].hspCount++;
        break;
      case 'student':
        aggregations[key].studentCount++;
        break;
      case 'temp':
        aggregations[key].tempCount++;
        break;
    }
  });

  return Object.values(aggregations);
}

/**
 * Load school ID lookup from database
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
 * Upsert workforce data to Postgres
 */
async function upsertWorkforceData(aggregations, sourceFile, dryRun = false) {
  const schoolLookup = await loadSchoolLookup();

  let inserted = 0;
  let updated = 0;
  let errored = 0;

  for (const agg of aggregations) {
    // Try to match school
    let schoolId = null;
    if (agg.school) {
      const schoolLower = agg.school.toLowerCase();
      schoolId = schoolLookup[schoolLower] || null;

      // Try partial match
      if (!schoolId) {
        for (const [key, id] of Object.entries(schoolLookup)) {
          if (key.includes(schoolLower) || schoolLower.includes(key)) {
            schoolId = id;
            break;
          }
        }
      }
    }

    if (dryRun) {
      console.log(`  [DRY RUN] Would upsert: ${agg.location}/${agg.categoryCode}/${agg.school}: ${agg.headcount}`);
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_workforce_snapshots (
          period_date, location, school_id, category_code,
          headcount, faculty_count, staff_count, hsp_count, student_count, temp_count,
          source_file
        )
        VALUES (
          ${agg.periodDate}, ${agg.location}, ${schoolId}, ${agg.categoryCode},
          ${agg.headcount}, ${agg.facultyCount}, ${agg.staffCount}, ${agg.hspCount}, ${agg.studentCount}, ${agg.tempCount},
          ${sourceFile}
        )
        ON CONFLICT (period_date, location, school_id, category_code)
        DO UPDATE SET
          headcount = EXCLUDED.headcount,
          faculty_count = EXCLUDED.faculty_count,
          staff_count = EXCLUDED.staff_count,
          hsp_count = EXCLUDED.hsp_count,
          student_count = EXCLUDED.student_count,
          temp_count = EXCLUDED.temp_count,
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
      console.error(`  Error upserting ${agg.location}/${agg.categoryCode}: ${error.message}`);
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
  console.log(`${colors.cyan}   Workforce ETL to Postgres${colors.reset}`);
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
  if (!options.input && !options.fromJson) {
    console.error(`${colors.red}Error: Either --input or --from-json is required${colors.reset}`);
    printHelp();
    process.exit(1);
  }

  if (!options.quarter && !options.date) {
    console.error(`${colors.red}Error: Either --quarter or --date is required${colors.reset}`);
    printHelp();
    process.exit(1);
  }

  // Determine period date
  let periodDate, fiscalPeriod;

  if (options.quarter) {
    const dates = getQuarterDatesFromKey(options.quarter);
    periodDate = formatDate(dates.end);
    fiscalPeriod = options.quarter;
  } else {
    periodDate = options.date;
    fiscalPeriod = getFiscalPeriodKey(new Date(periodDate));
  }

  console.log(`${colors.cyan}Period Date: ${periodDate}${colors.reset}`);
  console.log(`${colors.cyan}Fiscal Period: ${fiscalPeriod}${colors.reset}\n`);

  // Load data
  let rows;
  let sourceFile;

  if (options.fromJson) {
    sourceFile = options.file || options.input;
    console.log(`${colors.blue}Loading JSON: ${sourceFile}${colors.reset}`);
    rows = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
    console.log(`${colors.green}✓${colors.reset} Loaded ${rows.length} rows\n`);
  } else {
    sourceFile = options.input;
    console.log(`${colors.blue}Loading Excel: ${sourceFile}${colors.reset}`);
    const workbook = loadExcelFile(sourceFile);
    const sheetNames = getSheetNames(workbook);
    const sheetName = sheetNames[0];
    rows = sheetToJSON(workbook, sheetName);
    console.log(`${colors.green}✓${colors.reset} Loaded ${rows.length} rows from sheet "${sheetName}"\n`);

    // Remove PII
    console.log(`${colors.blue}Removing PII...${colors.reset}`);
    rows = rows.map(row => removePII(row, { hashIds: true }));
    console.log(`${colors.green}✓${colors.reset} PII removed\n`);
  }

  // Start audit log
  let loadId = null;
  if (!options.dryRun) {
    loadId = await startAuditLog({
      loadType: 'workforce',
      sourceFile: path.basename(sourceFile),
      periodDate,
      fiscalPeriod
    });
    console.log(`${colors.blue}Audit log started (ID: ${loadId})${colors.reset}\n`);
  }

  // Aggregate data
  console.log(`${colors.blue}Aggregating workforce data...${colors.reset}`);
  const aggregations = aggregateWorkforceData(rows, periodDate);
  console.log(`${colors.green}✓${colors.reset} Created ${aggregations.length} aggregations\n`);

  // Calculate summary
  const summary = {
    total: rows.length,
    faculty: aggregations.reduce((sum, a) => sum + a.facultyCount, 0),
    staff: aggregations.reduce((sum, a) => sum + a.staffCount, 0),
    hsp: aggregations.reduce((sum, a) => sum + a.hspCount, 0),
    students: aggregations.reduce((sum, a) => sum + a.studentCount, 0),
    temp: aggregations.reduce((sum, a) => sum + a.tempCount, 0)
  };

  console.log(`${colors.cyan}Summary:${colors.reset}`);
  console.log(`  Total: ${summary.total}`);
  console.log(`  Faculty: ${summary.faculty}`);
  console.log(`  Staff: ${summary.staff}`);
  console.log(`  HSP: ${summary.hsp}`);
  console.log(`  Students: ${summary.students}`);
  console.log(`  Temp: ${summary.temp}\n`);

  // Upsert to database
  console.log(`${colors.blue}${options.dryRun ? '[DRY RUN] ' : ''}Upserting to database...${colors.reset}`);
  const { inserted, updated, errored } = await upsertWorkforceData(
    aggregations,
    path.basename(sourceFile),
    options.dryRun
  );

  console.log(`${colors.green}✓${colors.reset} Inserted: ${inserted}, Updated: ${updated}, Errors: ${errored}\n`);

  // Complete audit log
  if (loadId) {
    await completeAuditLog(loadId, {
      recordsRead: rows.length,
      recordsInserted: inserted,
      recordsUpdated: updated,
      recordsErrored: errored,
      status: errored > 0 ? 'completed' : 'completed',
      errorMessage: errored > 0 ? `${errored} records failed` : null
    });
  }

  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.green}✓ Workforce ETL Complete${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  await endPool();
}

main().catch(async error => {
  console.error(`\n${colors.red}Fatal error: ${error.message}${colors.reset}`);
  console.error(error.stack);
  await endPool();
  process.exit(1);
});

module.exports = {
  categorizeEmployee,
  aggregateWorkforceData
};
