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
const { sql, endPool, checkConnection, getPool, upsert } = require('./neon-client');

const { excelDateToJSDate, formatDate, loadExcelFile, sheetToJSON, getSheetNames } = require('../utils/excel-helpers');
const { getFiscalPeriodKey, getQuarterDatesFromKey } = require('../utils/fiscal-calendar');
const { removePII } = require('../utils/pii-removal');
const { colors, printBanner, printComplete, success, info, error: logError } = require('../utils/formatting');
const { parseArgs } = require('../utils/cli-parser');
const { startAudit, completeAudit } = require('../utils/etl-runner');
const { loadConfig } = require('../utils/config-loader');
const { createResolver, validateHeaders } = require('../utils/column-resolver');
const { loadSchoolLookup, findSchoolId } = require('../utils/school-lookup');
const { autoDetectLargestSheet } = require('../utils/workbook-loader');
const { createErrorHandler, retryWithBackoff, ErrorType } = require('../utils/error-handler');

const config = loadConfig();
const resolve = createResolver('workforce-to-postgres');

const SCRIPT_OPTIONS = [
  { flags: '--input,-i', key: 'input', type: 'string', description: 'Input Excel file path' },
  { flags: '--quarter,-q', key: 'quarter', type: 'string', description: 'Fiscal period (e.g., FY25_Q2)' },
  { flags: '--date,-d', key: 'date', type: 'string', description: 'Report date (YYYY-MM-DD format)' },
  { flags: '--sheet,-s', key: 'sheet', type: 'string', description: 'Excel sheet name (auto-detects largest if not specified)' },
  { flags: '--from-json', key: 'fromJson', type: 'boolean', description: 'Load from JSON instead of Excel' },
  { flags: '--file', key: 'file', type: 'string', description: 'JSON file path (with --from-json)' }
];

const HELP_CONFIG = {
  title: 'Workforce Data ETL to Postgres',
  usage: [
    'node scripts/etl/workforce-to-postgres.js --input file.xlsx --quarter FY25_Q2',
    'node scripts/etl/workforce-to-postgres.js --from-json --file cleaned.json --quarter FY25_Q2'
  ]
};

/**
 * Filter rows by End Date matching the target quarter end date
 */
function filterByEndDate(rows, targetDate) {
  return rows.filter(row => {
    const endDate = resolve(row, 'end_date');
    if (!endDate) return false;

    let dateStr;
    if (typeof endDate === 'string') {
      if (endDate.includes('/')) {
        const parts = endDate.split('/');
        if (parts.length === 3) {
          const [month, day, year] = parts;
          dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      } else if (endDate.includes('-')) {
        dateStr = endDate.substring(0, 10);
      }
    } else if (typeof endDate === 'number') {
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
 * Categorize employee based on assignment category, person type, and grade code
 * (5-level cascading priority - kept in code, must NOT be config-driven)
 */
function categorizeEmployee(row) {
  if (!row) return { type: 'other', isBenefitEligible: false, code: 'UNKNOWN' };

  const assignmentCategory = (resolve(row, 'assignment_category') || '').toString().trim().toUpperCase();
  const personType = (resolve(row, 'person_type') || '').toString().trim().toUpperCase();
  const gradeCode = (resolve(row, 'grade_code') || '').toString().trim().toUpperCase();

  // 1. House Staff Physicians (HSR/HSP codes)
  if (config.categories.house_staff.includes(assignmentCategory)) {
    return { type: 'hsp', isBenefitEligible: true, code: assignmentCategory };
  }

  // 2. Grade R employees go to HSP (Residents/Fellows)
  if (gradeCode && gradeCode.startsWith(config.grade_codes.house_staff_prefix)) {
    return { type: 'hsp', isBenefitEligible: true, code: assignmentCategory || 'GRADE_R' };
  }

  // 3. Student Workers
  if (config.categories.student.includes(assignmentCategory)) {
    return { type: 'student', isBenefitEligible: false, code: assignmentCategory };
  }

  // 4. Non-Benefit Eligible (TEMP, NBE, PRN)
  if (config.categories.temp.includes(assignmentCategory)) {
    return { type: 'temp', isBenefitEligible: false, code: assignmentCategory };
  }

  // 5. Benefit-Eligible - Use Person Type to determine Faculty vs Staff
  if (config.categories.benefit_eligible.includes(assignmentCategory)) {
    if (config.person_types.faculty.includes(personType)) {
      return { type: 'faculty', isBenefitEligible: true, code: assignmentCategory };
    } else if (config.person_types.staff.includes(personType)) {
      return { type: 'staff', isBenefitEligible: true, code: assignmentCategory };
    } else {
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
    const locationRaw = resolve(row, 'location') || '';
    const location = locationRaw.toString().toLowerCase().includes(config.locations.detection_keyword) ? 'phoenix' : 'omaha';

    const { type, code } = categorizeEmployee(row);
    const categoryCode = code || 'UNKNOWN';

    const schoolRaw = resolve(row, 'school') || '';
    const school = schoolRaw.toString().trim();

    const key = `${location}|${categoryCode}|${school}`;

    if (!aggregations[key]) {
      aggregations[key] = {
        periodDate, location, categoryCode: categoryCode.toUpperCase(), school,
        headcount: 0, facultyCount: 0, staffCount: 0,
        hspCount: 0, studentCount: 0, tempCount: 0
      };
    }

    aggregations[key].headcount++;

    switch (type) {
      case 'faculty': aggregations[key].facultyCount++; break;
      case 'staff': aggregations[key].staffCount++; break;
      case 'hsp': aggregations[key].hspCount++; break;
      case 'student': aggregations[key].studentCount++; break;
      case 'temp': aggregations[key].tempCount++; break;
    }
  });

  return Object.values(aggregations);
}

/**
 * Upsert workforce data to Postgres
 */
async function upsertWorkforceData(aggregations, sourceFile, dryRun = false) {
  const schoolLookup = await loadSchoolLookup();
  const errorHandler = createErrorHandler('workforce-to-postgres');

  let inserted = 0;
  let updated = 0;
  let errored = 0;

  for (let i = 0; i < aggregations.length; i++) {
    const agg = aggregations[i];
    const schoolId = agg.school ? findSchoolId(agg.school, schoolLookup) : null;

    if (dryRun) {
      console.log(`  [DRY RUN] Would upsert: ${agg.location}/${agg.categoryCode}/${agg.school}: ${agg.headcount}`);
      inserted++;
      continue;
    }

    try {
      const result = await retryWithBackoff(() => upsert(getPool(), 'fact_workforce_snapshots', {
        period_date: agg.periodDate,
        location: agg.location,
        school_id: schoolId,
        category_code: agg.categoryCode,
        headcount: agg.headcount,
        faculty_count: agg.facultyCount,
        staff_count: agg.staffCount,
        hsp_count: agg.hspCount,
        student_count: agg.studentCount,
        temp_count: agg.tempCount,
        source_file: sourceFile
      }, ['period_date', 'location', 'school_id', 'category_code']));

      if (result.inserted) { inserted++; } else { updated++; }
    } catch (err) {
      const errorType = errorHandler.handleError(err, agg, i);
      errored++;
      if (errorType === ErrorType.FATAL) {
        errorHandler.printErrorReport();
        throw err;
      }
    }
  }

  errorHandler.printErrorReport();
  return { inserted, updated, errored };
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs('workforce-to-postgres', SCRIPT_OPTIONS, HELP_CONFIG);

  printBanner('Workforce ETL to Postgres');

  // Check connection
  info('Checking database connection...');
  const connected = await checkConnection();
  if (!connected) {
    logError('Failed to connect to database.');
    process.exit(1);
  }
  success('Connected\n');

  // Validate input
  if (!options.input && !options.fromJson) {
    logError('Error: Either --input or --from-json is required');
    process.exit(1);
  }
  if (!options.quarter && !options.date) {
    logError('Error: Either --quarter or --date is required');
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
    info(`Loading JSON: ${sourceFile}`);
    rows = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
    success(`Loaded ${rows.length} rows\n`);
  } else {
    sourceFile = options.input;
    info(`Loading Excel: ${sourceFile}`);
    const workbook = loadExcelFile(sourceFile);

    // Determine which sheet to use
    let sheetName;
    if (options.sheet) {
      sheetName = options.sheet;
      const sheetNames = getSheetNames(workbook);
      if (!sheetNames.includes(sheetName)) {
        logError(`Error: Sheet "${sheetName}" not found. Available: ${sheetNames.join(', ')}`);
        await endPool();
        process.exit(1);
      }
    } else {
      const detected = autoDetectLargestSheet(workbook);
      sheetName = detected.sheetName;
      console.log(`${colors.cyan}Auto-detected sheet with most data: "${sheetName}"${colors.reset}`);
    }

    rows = sheetToJSON(workbook, sheetName);
    success(`Loaded ${rows.length} rows from sheet "${sheetName}"\n`);

    // Validate headers
    const validation = validateHeaders(rows, 'workforce-to-postgres');
    if (!validation.valid) {
      const details = validation.missing
        .map(m => `  ${m.field} (tried: ${m.tried.join(', ')})`)
        .join('\n');
      logError(`Missing required columns for workforce:\n${details}`);
      await endPool();
      process.exit(1);
    }
    if (options.validateOnly) {
      const resolved = Object.entries(validation.resolved)
        .map(([field, alias]) => `  ${field} -> "${alias}"`)
        .join('\n');
      success(`Header validation passed. Resolved columns:\n${resolved}`);
      await endPool();
      process.exit(0);
    }

    // Remove PII
    info('Removing PII...');
    rows = rows.map(row => removePII(row, { hashIds: true }));
    success('PII removed\n');

    // Filter by End Date to get snapshot for target quarter
    info(`Filtering to End Date: ${periodDate}...`);
    const originalCount = rows.length;
    rows = filterByEndDate(rows, periodDate);
    success(`Filtered: ${rows.length} of ${originalCount} rows match End Date ${periodDate}\n`);

    if (rows.length === 0) {
      logError(`Error: No rows found with End Date = ${periodDate}`);
      console.log(`\n${colors.yellow}Tip: Check that the Excel file contains data for this quarter.${colors.reset}`);
      console.log(`${colors.yellow}Expected End Date format: YYYY-MM-DD or M/D/YYYY${colors.reset}\n`);
      await endPool();
      process.exit(1);
    }
  }

  // Start audit log
  const loadId = await startAudit({
    loadType: 'workforce',
    sourceFile,
    periodDate,
    fiscalPeriod,
    dryRun: options.dryRun
  });

  // Aggregate data
  info('Aggregating workforce data...');
  const aggregations = aggregateWorkforceData(rows, periodDate);
  success(`Created ${aggregations.length} aggregations\n`);

  // Calculate summary with location breakdown
  const summary = {
    total: rows.length,
    faculty: aggregations.reduce((sum, a) => sum + a.facultyCount, 0),
    staff: aggregations.reduce((sum, a) => sum + a.staffCount, 0),
    hsp: aggregations.reduce((sum, a) => sum + a.hspCount, 0),
    students: aggregations.reduce((sum, a) => sum + a.studentCount, 0),
    temp: aggregations.reduce((sum, a) => sum + a.tempCount, 0)
  };

  const byLoc = (loc, field) => aggregations.filter(a => a.location === loc).reduce((sum, a) => sum + a[field], 0);

  console.log(`${colors.cyan}Summary:${colors.reset}`);
  console.log(`  Total: ${summary.total}`);
  console.log(`  Faculty: ${summary.faculty} (OMA: ${byLoc('omaha', 'facultyCount')}, PHX: ${byLoc('phoenix', 'facultyCount')})`);
  console.log(`  Staff: ${summary.staff} (OMA: ${byLoc('omaha', 'staffCount')}, PHX: ${byLoc('phoenix', 'staffCount')})`);
  console.log(`  HSP: ${summary.hsp} (OMA: ${byLoc('omaha', 'hspCount')}, PHX: ${byLoc('phoenix', 'hspCount')})`);
  console.log(`  Students: ${summary.students} (OMA: ${byLoc('omaha', 'studentCount')}, PHX: ${byLoc('phoenix', 'studentCount')})`);
  console.log(`  Temp: ${summary.temp} (OMA: ${byLoc('omaha', 'tempCount')}, PHX: ${byLoc('phoenix', 'tempCount')})\n`);

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
  info(`${options.dryRun ? '[DRY RUN] ' : ''}Upserting to database...`);
  const { inserted, updated, errored } = await upsertWorkforceData(
    aggregations, path.basename(sourceFile), options.dryRun
  );
  success(`Inserted: ${inserted}, Updated: ${updated}, Errors: ${errored}\n`);

  // Complete audit log
  await completeAudit(loadId, {
    recordsRead: rows.length,
    inserted, updated, errored
  });

  printComplete('Workforce ETL Complete');
  await endPool();
}

main().catch(async err => {
  console.error(`\n${colors.red}Fatal error: ${err.message}${colors.reset}`);
  console.error(err.stack);
  await endPool();
  process.exit(1);
});

module.exports = {
  categorizeEmployee,
  aggregateWorkforceData,
  filterByEndDate
};
