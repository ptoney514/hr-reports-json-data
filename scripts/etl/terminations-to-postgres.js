#!/usr/bin/env node

/**
 * Terminations Data ETL to Postgres
 *
 * Processes termination Excel data and loads to Neon Postgres
 * - Reads Excel from source-metrics/terminations/raw/
 * - Removes PII (hashes employee IDs)
 * - Categorizes termination types
 * - Calculates tenure
 * - Upserts to fact_terminations
 *
 * Usage:
 *   node scripts/etl/terminations-to-postgres.js --input file.xlsx --fiscal-year 2025
 *   node scripts/etl/terminations-to-postgres.js --from-json --file cleaned.json --quarter FY25_Q2
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

const { removePII, hashValue } = require('../utils/pii-removal');

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
    input: null,
    quarter: null,
    fiscalYear: null,
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
      case '--fiscal-year':
      case '--fy':
        options.fiscalYear = args[++i];
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
${colors.cyan}Terminations Data ETL to Postgres${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node scripts/etl/terminations-to-postgres.js --input file.xlsx --fiscal-year 2025
  node scripts/etl/terminations-to-postgres.js --from-json --file cleaned.json --quarter FY25_Q2

${colors.yellow}Options:${colors.reset}
  -i, --input FILE      Input Excel file path
  -q, --quarter PERIOD  Fiscal period (e.g., FY25_Q2)
  --fy, --fiscal-year   Fiscal year to filter (e.g., 2025)
  --from-json           Load from JSON instead of Excel
  --file FILE           JSON file path (with --from-json)
  --dry-run             Preview without database writes
`);
}

/**
 * Categorize termination type from reason text
 */
function categorizeTerminationType(reason1, reason2) {
  const reason = (reason1 || reason2 || '').toString().toLowerCase();

  // Retirement
  if (reason.includes('retire')) {
    return { type: 'retirement', isVoluntary: true };
  }

  // Voluntary
  if (
    reason.includes('resignation') ||
    reason.includes('resign') ||
    reason.includes('voluntary') ||
    reason.includes('better opportunity') ||
    reason.includes('personal') ||
    reason.includes('career change') ||
    reason.includes('end assignment') ||
    reason.includes('relocation')
  ) {
    return { type: 'voluntary', isVoluntary: true };
  }

  // Involuntary
  if (
    reason.includes('termination') ||
    reason.includes('involuntary') ||
    reason.includes('performance') ||
    reason.includes('policy') ||
    reason.includes('layoff') ||
    reason.includes('reduction') ||
    reason.includes('conduct') ||
    reason.includes('probation')
  ) {
    return { type: 'involuntary', isVoluntary: false };
  }

  // Default to voluntary if unclear
  return { type: 'voluntary', isVoluntary: true };
}

/**
 * Calculate tenure and bucket
 */
function calculateTenure(hireDate, termDate) {
  if (!hireDate || !termDate) return { years: null, bucket: null };

  const hire = new Date(hireDate);
  const term = new Date(termDate);

  if (isNaN(hire) || isNaN(term)) return { years: null, bucket: null };

  const diffMs = term - hire;
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);

  let bucket;
  if (years < 1) bucket = '<1yr';
  else if (years < 3) bucket = '1-3yr';
  else if (years < 5) bucket = '3-5yr';
  else if (years < 10) bucket = '5-10yr';
  else bucket = '10+yr';

  return { years: Math.round(years * 100) / 100, bucket };
}

/**
 * Map raw reason to reason_id from dim_term_reasons
 */
async function loadReasonLookup() {
  const reasons = await sql`SELECT reason_id, reason_code, reason_label FROM dim_term_reasons`;
  return reasons;
}

/**
 * Find best matching reason ID
 */
function matchReasonId(reasonText, reasonLookup) {
  if (!reasonText) return null;

  const reasonLower = reasonText.toLowerCase();

  // Try exact match on label
  for (const r of reasonLookup) {
    if (r.reason_label.toLowerCase() === reasonLower) {
      return r.reason_id;
    }
  }

  // Try keyword matching
  const keywords = {
    'RESIGN': ['resign', 'resignation'],
    'RESIGN_CAREER': ['career change', 'career'],
    'RESIGN_RELOCATION': ['relocation', 'relocate', 'moving'],
    'RESIGN_PERSONAL': ['personal'],
    'RESIGN_OPPORTUNITY': ['better opportunity', 'opportunity', 'new position'],
    'RESIGN_COMPENSATION': ['compensation', 'salary', 'pay'],
    'RESIGN_HEALTH': ['health', 'medical'],
    'END_ASSIGNMENT': ['end assignment', 'assignment end', 'contract end'],
    'END_TEMP': ['temporary', 'temp'],
    'RETIRE': ['retire', 'retirement'],
    'RETIRE_EARLY': ['early retire'],
    'TERM_PERFORMANCE': ['performance'],
    'TERM_POLICY': ['policy'],
    'TERM_CONDUCT': ['conduct'],
    'LAYOFF': ['layoff', 'reduction in force', 'rif'],
    'POSITION_ELIM': ['position elimination', 'eliminated'],
    'DEATH': ['death', 'deceased']
  };

  for (const [code, terms] of Object.entries(keywords)) {
    for (const term of terms) {
      if (reasonLower.includes(term)) {
        const match = reasonLookup.find(r => r.reason_code === code);
        if (match) return match.reason_id;
      }
    }
  }

  // Default to OTHER
  const other = reasonLookup.find(r => r.reason_code === 'OTHER');
  return other?.reason_id || null;
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
 * Process and upsert terminations
 */
async function processTerminations(rows, options, sourceFile) {
  const schoolLookup = await loadSchoolLookup();
  const reasonLookup = await loadReasonLookup();

  let inserted = 0;
  let updated = 0;
  let errored = 0;
  let skipped = 0;

  // Determine filter dates if needed
  let filterStart, filterEnd;
  if (options.fiscalYear) {
    const fy = parseInt(options.fiscalYear);
    filterStart = new Date(fy - 1, 6, 1); // July 1
    filterEnd = new Date(fy, 5, 30); // June 30
  } else if (options.quarter) {
    const dates = getQuarterDatesFromKey(options.quarter);
    filterStart = dates.start;
    filterEnd = dates.end;
  }

  for (const row of rows) {
    // Get termination date
    let termDateRaw = row['Term Date'] || row['Termination Date'] || row.term_date || row.termination_date;
    let termDate = termDateRaw;

    if (isExcelDate(termDateRaw)) {
      termDate = formatDate(excelDateToJSDate(termDateRaw));
    }

    if (!termDate) {
      skipped++;
      continue;
    }

    // Filter by date range
    if (filterStart && filterEnd) {
      const termDateObj = new Date(termDate);
      if (termDateObj < filterStart || termDateObj > filterEnd) {
        skipped++;
        continue;
      }
    }

    // Get hire date
    let hireDateRaw = row['Hire Date'] || row.hire_date || row.hireDate;
    let hireDate = hireDateRaw;

    if (isExcelDate(hireDateRaw)) {
      hireDate = formatDate(excelDateToJSDate(hireDateRaw));
    }

    // Get employee hash
    const employeeId = row['Employee ID'] || row['Empl ID'] || row['Empl Num'] || row.employee_id || row.employeeId;
    const employeeHash = employeeId ? hashValue(employeeId.toString()) : `anon_${Date.now()}_${Math.random()}`;

    // Get termination reason
    const reason1 = row['Term Reason 1'] || row.term_reason_1 || row.termination_reason;
    const reason2 = row['Term Reason 2'] || row.term_reason_2;
    const { type: termType, isVoluntary } = categorizeTerminationType(reason1, reason2);
    const reasonId = matchReasonId(reason1 || reason2, reasonLookup);

    // Calculate tenure
    const { years: tenureYears, bucket: tenureBucket } = calculateTenure(hireDate, termDate);

    // Get location
    const locationRaw = row.Location || row.location || row.State || '';
    const location = locationRaw.toString().toLowerCase().includes('phoenix') ? 'phoenix' : 'omaha';

    // Get school
    const schoolRaw = row.School || row.school || row['VP Area'] || '';
    let schoolId = null;
    if (schoolRaw) {
      const schoolLower = schoolRaw.toLowerCase();
      schoolId = schoolLookup[schoolLower];
      if (!schoolId) {
        for (const [key, id] of Object.entries(schoolLookup)) {
          if (key.includes(schoolLower) || schoolLower.includes(key)) {
            schoolId = id;
            break;
          }
        }
      }
    }

    // Get category code
    const categoryCode = (
      row['Assignment Category Code'] ||
      row['Assignment Category'] ||
      row.assignment_category ||
      ''
    ).toString().toUpperCase() || null;

    // Determine period date
    let periodDate;
    if (options.quarter) {
      const dates = getQuarterDatesFromKey(options.quarter);
      periodDate = formatDate(dates.end);
    } else if (options.fiscalYear) {
      periodDate = `${options.fiscalYear}-06-30`;
    } else {
      periodDate = termDate;
    }

    if (options.dryRun) {
      console.log(`  [DRY RUN] Would upsert: ${employeeHash.substring(0, 8)}... | ${termDate} | ${termType}`);
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_terminations (
          employee_hash, period_date, termination_date,
          location, school_id, category_code,
          reason_id, reason_raw, termination_type, is_voluntary,
          hire_date, years_of_service, tenure_bucket,
          source_file
        )
        VALUES (
          ${employeeHash}, ${periodDate}, ${termDate},
          ${location}, ${schoolId}, ${categoryCode},
          ${reasonId}, ${reason1 || reason2 || 'Unknown'}, ${termType}, ${isVoluntary},
          ${hireDate}, ${tenureYears}, ${tenureBucket},
          ${path.basename(sourceFile)}
        )
        ON CONFLICT (employee_hash, termination_date)
        DO UPDATE SET
          period_date = EXCLUDED.period_date,
          location = EXCLUDED.location,
          school_id = EXCLUDED.school_id,
          category_code = EXCLUDED.category_code,
          reason_id = EXCLUDED.reason_id,
          reason_raw = EXCLUDED.reason_raw,
          termination_type = EXCLUDED.termination_type,
          is_voluntary = EXCLUDED.is_voluntary,
          hire_date = EXCLUDED.hire_date,
          years_of_service = EXCLUDED.years_of_service,
          tenure_bucket = EXCLUDED.tenure_bucket,
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
      console.error(`  Error upserting termination: ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored, skipped };
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs();

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}   Terminations ETL to Postgres${colors.reset}`);
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

  if (!options.quarter && !options.fiscalYear) {
    console.error(`${colors.red}Error: Either --quarter or --fiscal-year is required${colors.reset}`);
    printHelp();
    process.exit(1);
  }

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

    // Auto-detect sheet with most rows
    let targetSheet = sheetNames[0];
    let maxRows = 0;
    for (const name of sheetNames) {
      const data = sheetToJSON(workbook, name);
      if (data.length > maxRows) {
        maxRows = data.length;
        targetSheet = name;
      }
    }

    rows = sheetToJSON(workbook, targetSheet);
    console.log(`${colors.green}✓${colors.reset} Loaded ${rows.length} rows from sheet "${targetSheet}"\n`);
  }

  // Start audit log
  const fiscalPeriod = options.quarter || `FY${options.fiscalYear?.toString().slice(-2)}`;
  const periodDate = options.quarter
    ? formatDate(getQuarterDatesFromKey(options.quarter).end)
    : `${options.fiscalYear}-06-30`;

  let loadId = null;
  if (!options.dryRun) {
    loadId = await startAuditLog({
      loadType: 'terminations',
      sourceFile: path.basename(sourceFile),
      periodDate,
      fiscalPeriod
    });
    console.log(`${colors.blue}Audit log started (ID: ${loadId})${colors.reset}\n`);
  }

  // Process terminations
  console.log(`${colors.blue}${options.dryRun ? '[DRY RUN] ' : ''}Processing terminations...${colors.reset}`);
  const { inserted, updated, errored, skipped } = await processTerminations(rows, options, sourceFile);

  console.log(`\n${colors.green}✓${colors.reset} Results:`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Errors: ${errored}`);
  console.log(`  Skipped (filtered/no date): ${skipped}\n`);

  // Verify count matches expected (FY25 = 222)
  if (options.fiscalYear === '2025' || options.fiscalYear === 2025) {
    const count = await sql`
      SELECT COUNT(*) as total FROM fact_terminations
      WHERE period_date = '2025-06-30'
    `;
    console.log(`${colors.cyan}FY25 Verification: ${count[0].total} terminations (expected: 222)${colors.reset}`);
    if (count[0].total !== 222) {
      console.log(`${colors.yellow}  Warning: Count does not match expected 222${colors.reset}`);
    }
  }

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

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.green}✓ Terminations ETL Complete${colors.reset}`);
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
  categorizeTerminationType,
  calculateTenure
};
