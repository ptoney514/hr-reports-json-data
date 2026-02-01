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
 * Filter rows by End Date matching the target quarter end date
 * The Excel file contains historical data across multiple quarters
 *
 * @param {Array} rows - All rows from Excel
 * @param {string} targetDate - Target date in YYYY-MM-DD format (e.g., '2025-09-30')
 * @returns {Array} Filtered rows matching the target end date
 */
function filterByEndDate(rows, targetDate) {
  return rows.filter(row => {
    const endDate = row['END DATE'] || row['End Date'] || row['endDate'] || row['end_date'];

    if (!endDate) return false;

    let dateStr;

    if (typeof endDate === 'string') {
      if (endDate.includes('/')) {
        // Format: M/D/YYYY or MM/DD/YYYY
        const parts = endDate.split('/');
        if (parts.length === 3) {
          const [month, day, year] = parts;
          dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      } else if (endDate.includes('-')) {
        // ISO format YYYY-MM-DD
        dateStr = endDate.substring(0, 10);
      }
    } else if (typeof endDate === 'number') {
      // Excel serial date number - convert using helper
      try {
        const jsDate = excelDateToJSDate(endDate);
        dateStr = formatDate(jsDate);
      } catch {
        return false;
      }
    } else if (endDate instanceof Date) {
      dateStr = formatDate(endDate);
    }

    return dateStr === targetDate;
  });
}

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
    dryRun: false,
    sheet: null
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
      case '--sheet':
      case '-s':
        options.sheet = args[++i];
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
  -s, --sheet NAME      Excel sheet name (auto-detects largest sheet if not specified)
  --from-json           Load from JSON instead of Excel
  --file FILE           JSON file path (with --from-json)
  --dry-run             Preview without database writes
`);
}

/**
 * Categorize employee based on assignment category, person type, and grade code
 * Uses WORKFORCE_METHODOLOGY.md v2.1 rules:
 * - HSR code OR Grade R = House Staff Physicians
 * - SUE, CWS = Student Workers
 * - TEMP, NBE, PRN = Non-Benefit Eligible (Temp)
 * - Benefit-eligible (F/PT codes): Use Person Type to determine Faculty vs Staff
 *
 * @param {Object} row - Full employee row with all fields
 * @returns {Object} { type, isBenefitEligible, code }
 */
function categorizeEmployee(row) {
  if (!row) return { type: 'other', isBenefitEligible: false, code: 'UNKNOWN' };

  const assignmentCategory = (
    row['Assignment Category Code'] ||
    row['Assignment Category'] ||
    row.assignment_category ||
    row.assignment_category_code ||
    row.assignmentCategoryCode ||
    ''
  ).toString().trim().toUpperCase();

  const personType = (
    row['Person Type'] ||
    row['personType'] ||
    row.person_type ||
    ''
  ).toString().trim().toUpperCase();

  const gradeCode = (
    row['Grade Code'] ||
    row['Grade'] ||
    row.grade ||
    row.gradeCode ||
    ''
  ).toString().trim().toUpperCase();

  // 1. House Staff Physicians (HSR code OR Grade R)
  if (assignmentCategory === 'HSR' || assignmentCategory === 'HSP') {
    return { type: 'hsp', isBenefitEligible: true, code: assignmentCategory };
  }

  // 2. Grade R employees go to HSP (Residents/Fellows)
  if (gradeCode && gradeCode.startsWith('R')) {
    return { type: 'hsp', isBenefitEligible: true, code: assignmentCategory || 'GRADE_R' };
  }

  // 3. Student Workers (SUE, CWS)
  if (STUDENT_CATEGORIES.includes(assignmentCategory)) {
    return { type: 'student', isBenefitEligible: false, code: assignmentCategory };
  }

  // 4. Non-Benefit Eligible (TEMP, NBE, PRN)
  if (assignmentCategory === 'TEMP' || assignmentCategory === 'NBE' || assignmentCategory === 'PRN') {
    return { type: 'temp', isBenefitEligible: false, code: assignmentCategory };
  }

  // 5. Benefit-Eligible - Use Person Type to determine Faculty vs Staff
  if (BENEFIT_ELIGIBLE_CATEGORIES.includes(assignmentCategory)) {
    if (personType === 'FACULTY') {
      return { type: 'faculty', isBenefitEligible: true, code: assignmentCategory };
    } else if (personType === 'STAFF' || personType === 'EMPLOYEE') {
      return { type: 'staff', isBenefitEligible: true, code: assignmentCategory };
    } else {
      // Unknown person type with benefit-eligible code - default to staff
      return { type: 'staff', isBenefitEligible: true, code: assignmentCategory };
    }
  }

  return { type: 'other', isBenefitEligible: false, code: assignmentCategory || 'UNKNOWN' };
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

    // Categorize employee using full row (for Person Type, Grade Code access)
    const { type, code } = categorizeEmployee(row);

    // Use the code from categorization (may be assignment category or GRADE_R)
    const categoryCode = code || 'UNKNOWN';

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

    // Determine which sheet to use
    let sheetName;
    if (options.sheet) {
      // User specified sheet
      sheetName = options.sheet;
      if (!sheetNames.includes(sheetName)) {
        console.error(`${colors.red}Error: Sheet "${sheetName}" not found. Available: ${sheetNames.join(', ')}${colors.reset}`);
        await endPool();
        process.exit(1);
      }
    } else {
      // Auto-detect: find sheet with most rows (likely the main data sheet)
      let maxRows = 0;
      sheetNames.forEach(name => {
        const testRows = sheetToJSON(workbook, name);
        if (testRows.length > maxRows) {
          maxRows = testRows.length;
          sheetName = name;
        }
      });
      console.log(`${colors.cyan}Auto-detected sheet with most data: "${sheetName}"${colors.reset}`);
    }

    rows = sheetToJSON(workbook, sheetName);
    console.log(`${colors.green}✓${colors.reset} Loaded ${rows.length} rows from sheet "${sheetName}"\n`);

    // Remove PII
    console.log(`${colors.blue}Removing PII...${colors.reset}`);
    rows = rows.map(row => removePII(row, { hashIds: true }));
    console.log(`${colors.green}✓${colors.reset} PII removed\n`);

    // Filter by End Date to get snapshot for target quarter
    console.log(`${colors.blue}Filtering to End Date: ${periodDate}...${colors.reset}`);
    const originalCount = rows.length;
    rows = filterByEndDate(rows, periodDate);
    console.log(`${colors.green}✓${colors.reset} Filtered: ${rows.length} of ${originalCount} rows match End Date ${periodDate}\n`);

    if (rows.length === 0) {
      console.error(`${colors.red}Error: No rows found with End Date = ${periodDate}${colors.reset}`);
      console.log(`\n${colors.yellow}Tip: Check that the Excel file contains data for this quarter.${colors.reset}`);
      console.log(`${colors.yellow}Expected End Date format: YYYY-MM-DD or M/D/YYYY${colors.reset}\n`);
      await endPool();
      process.exit(1);
    }
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

  // Calculate summary with location breakdown
  const summary = {
    total: rows.length,
    faculty: aggregations.reduce((sum, a) => sum + a.facultyCount, 0),
    staff: aggregations.reduce((sum, a) => sum + a.staffCount, 0),
    hsp: aggregations.reduce((sum, a) => sum + a.hspCount, 0),
    students: aggregations.reduce((sum, a) => sum + a.studentCount, 0),
    temp: aggregations.reduce((sum, a) => sum + a.tempCount, 0)
  };

  const locationBreakdown = {
    omaha: {
      faculty: aggregations.filter(a => a.location === 'omaha').reduce((sum, a) => sum + a.facultyCount, 0),
      staff: aggregations.filter(a => a.location === 'omaha').reduce((sum, a) => sum + a.staffCount, 0),
      hsp: aggregations.filter(a => a.location === 'omaha').reduce((sum, a) => sum + a.hspCount, 0),
      students: aggregations.filter(a => a.location === 'omaha').reduce((sum, a) => sum + a.studentCount, 0),
      temp: aggregations.filter(a => a.location === 'omaha').reduce((sum, a) => sum + a.tempCount, 0)
    },
    phoenix: {
      faculty: aggregations.filter(a => a.location === 'phoenix').reduce((sum, a) => sum + a.facultyCount, 0),
      staff: aggregations.filter(a => a.location === 'phoenix').reduce((sum, a) => sum + a.staffCount, 0),
      hsp: aggregations.filter(a => a.location === 'phoenix').reduce((sum, a) => sum + a.hspCount, 0),
      students: aggregations.filter(a => a.location === 'phoenix').reduce((sum, a) => sum + a.studentCount, 0),
      temp: aggregations.filter(a => a.location === 'phoenix').reduce((sum, a) => sum + a.tempCount, 0)
    }
  };

  console.log(`${colors.cyan}Summary:${colors.reset}`);
  console.log(`  Total: ${summary.total}`);
  console.log(`  Faculty: ${summary.faculty} (OMA: ${locationBreakdown.omaha.faculty}, PHX: ${locationBreakdown.phoenix.faculty})`);
  console.log(`  Staff: ${summary.staff} (OMA: ${locationBreakdown.omaha.staff}, PHX: ${locationBreakdown.phoenix.staff})`);
  console.log(`  HSP: ${summary.hsp} (OMA: ${locationBreakdown.omaha.hsp}, PHX: ${locationBreakdown.phoenix.hsp})`);
  console.log(`  Students: ${summary.students} (OMA: ${locationBreakdown.omaha.students}, PHX: ${locationBreakdown.phoenix.students})`);
  console.log(`  Temp: ${summary.temp} (OMA: ${locationBreakdown.omaha.temp}, PHX: ${locationBreakdown.phoenix.temp})\n`);

  // Expected values for Q1 FY26 validation
  if (periodDate === '2025-09-30') {
    console.log(`${colors.yellow}Expected Q1 FY26 Values:${colors.reset}`);
    console.log(`  Faculty: 697 (OMA: 657, PHX: 40)`);
    console.log(`  Staff: 1419 (OMA: 1318, PHX: 101)`);
    console.log(`  HSP: 625 (OMA: 282, PHX: 343)`);
    console.log(`  Students: 2157 (OMA: 2088, PHX: 69)`);
    console.log(`  Temp: 630 (OMA: 489, PHX: 141)`);
    console.log(`  Total: 5528\n`);
  }

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
  aggregateWorkforceData,
  filterByEndDate
};
