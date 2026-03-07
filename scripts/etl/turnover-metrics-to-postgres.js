#!/usr/bin/env node

/**
 * Turnover Metrics ETL to Postgres
 *
 * Processes Turnover_Metrics_Master.xlsx and loads to Neon Postgres
 * - Reads all sheets from the Excel file
 * - Validates data structure
 * - Upserts to appropriate fact tables
 *
 * Usage:
 *   node scripts/etl/turnover-metrics-to-postgres.js
 *   node scripts/etl/turnover-metrics-to-postgres.js --dry-run
 *   node scripts/etl/turnover-metrics-to-postgres.js --input file.xlsx
 */

const fs = require('fs');
const path = require('path');
const { sql, endPool, startAuditLog, completeAuditLog, checkConnection, getPool, upsert } = require('./neon-client');

const { sheetToJSON } = require('../utils/excel-helpers');
const { colors, printBanner, printComplete } = require('../utils/formatting');
const { parseArgs } = require('../utils/cli-parser');
const { loadWorkbook, findDefaultInputFile, validateRequiredSheets } = require('../utils/workbook-loader');
const { loadConfig } = require('../utils/config-loader');
const { createErrorHandler, retryWithBackoff, ErrorType } = require('../utils/error-handler');

const config = loadConfig();
const EXPECTED_SHEETS = config.expected_sheets.turnover_metrics;
const DEVIATION_DEFAULTS = config.deviation_defaults;

/**
 * Extract fiscal year from Metadata sheet
 */
function extractFiscalYearFromMetadata(workbook) {
  try {
    const rows = sheetToJSON(workbook, 'Metadata');
    const fyRow = rows.find(r => r.field === 'fiscal_year');
    if (fyRow && fyRow.value) {
      const fy = fyRow.value.toString().trim();
      if (/^FY\d{4}$/.test(fy)) {
        return fy;
      }
      console.warn(`${colors.yellow}Warning: Invalid fiscal_year format in Metadata: ${fy}${colors.reset}`);
    }
  } catch (error) {
    console.warn(`${colors.yellow}Warning: Could not read Metadata sheet: ${error.message}${colors.reset}`);
  }
  return null;
}

/**
 * Upsert Summary Rates
 */
async function upsertSummaryRates(workbook, sourceFile, dryRun, errorHandler) {
  const sheetName = 'Summary_Rates';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (dryRun) {
      console.log(`    [DRY RUN] ${row.fiscal_year}/${row.category}: ${row.turnover_rate}%`);
      inserted++;
      continue;
    }

    try {
      const result = await retryWithBackoff(() => upsert(getPool(), 'fact_turnover_summary_rates', {
        fiscal_year: row.fiscal_year,
        category: row.category,
        turnover_rate: row.turnover_rate,
        prior_year_rate: row.prior_year_rate || null,
        change: row.change || null,
        trend: row.trend || null,
        source_file: sourceFile
      }, ['fiscal_year', 'category']));
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      const errorType = errorHandler.handleError(error, row, i);
      errored++;
      if (errorType === ErrorType.FATAL) throw error;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Turnover Rates Table (includes higher ed avg)
 */
async function upsertTurnoverRatesTable(workbook, sourceFile, dryRun, errorHandler) {
  const sheetName = 'Turnover_Rates_Table';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (dryRun) {
      console.log(`    [DRY RUN] ${row.fiscal_year}/${row.category}: ${row.turnover_rate}% (HE Avg: ${row.higher_ed_avg}%)`);
      inserted++;
      continue;
    }

    try {
      const result = await retryWithBackoff(() => upsert(getPool(), 'fact_turnover_summary_rates', {
        fiscal_year: row.fiscal_year,
        category: row.category,
        turnover_rate: row.turnover_rate,
        higher_ed_avg: row.higher_ed_avg || null,
        benchmark_source: row.source || null,
        source_file: sourceFile
      }, ['fiscal_year', 'category']));
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      const errorType = errorHandler.handleError(error, row, i);
      errored++;
      if (errorType === ErrorType.FATAL) throw error;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Higher Ed Benchmarks
 */
async function upsertHigherEdBenchmarks(workbook, sourceFile, dryRun, errorHandler) {
  const sheetName = 'Higher_Ed_Averages';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (dryRun) {
      console.log(`    [DRY RUN] ${row.fiscal_year}/${row.category}: ${row.higher_ed_avg}%`);
      inserted++;
      continue;
    }

    try {
      const result = await retryWithBackoff(() => upsert(getPool(), 'fact_higher_ed_benchmarks', {
        fiscal_year: row.fiscal_year,
        category: row.category,
        higher_ed_avg: row.higher_ed_avg,
        source: row.source || null,
        source_file: sourceFile
      }, ['fiscal_year', 'category']));
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      const errorType = errorHandler.handleError(error, row, i);
      errored++;
      if (errorType === ErrorType.FATAL) throw error;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Turnover Breakdown
 */
async function upsertTurnoverBreakdown(workbook, sourceFile, dryRun, errorHandler) {
  const sheetName = 'Turnover_Breakdown';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (dryRun) {
      console.log(`    [DRY RUN] ${row.fiscal_year}/${row.category}: Vol ${row.voluntary}%, Invol ${row.involuntary}%, Retire ${row.retirement}%`);
      inserted++;
      continue;
    }

    try {
      const result = await retryWithBackoff(() => upsert(getPool(), 'fact_turnover_breakdown', {
        fiscal_year: row.fiscal_year,
        category: row.category,
        involuntary: row.involuntary || 0,
        voluntary: row.voluntary || 0,
        retirement: row.retirement || 0,
        total: row.total,
        source_file: sourceFile
      }, ['fiscal_year', 'category']));
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      const errorType = errorHandler.handleError(error, row, i);
      errored++;
      if (errorType === ErrorType.FATAL) throw error;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Staff Deviation
 */
async function upsertStaffDeviation(workbook, sourceFile, dryRun, errorHandler) {
  const sheetName = 'Staff_Deviation';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  const avgRow = rows.find(r => r.is_average === true);
  const avgRate = avgRow ? avgRow.turnover_rate : DEVIATION_DEFAULTS.staff_avg;

  console.log(`  ${sheetName}: ${rows.length} rows (avg: ${avgRate}%)`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const deviation = parseFloat((row.turnover_rate - avgRate).toFixed(1));

    if (dryRun) {
      console.log(`    [DRY RUN] ${row.department}: ${row.turnover_rate}% (dev: ${deviation > 0 ? '+' : ''}${deviation})`);
      inserted++;
      continue;
    }

    try {
      const result = await retryWithBackoff(() => upsert(getPool(), 'fact_staff_turnover_deviation', {
        fiscal_year: row.fiscal_year,
        department: row.department,
        turnover_rate: row.turnover_rate,
        is_average: row.is_average || false,
        deviation_from_avg: deviation,
        source_file: sourceFile
      }, ['fiscal_year', 'department']));
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      const errorType = errorHandler.handleError(error, row, i);
      errored++;
      if (errorType === ErrorType.FATAL) throw error;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Faculty Deviation
 */
async function upsertFacultyDeviation(workbook, sourceFile, dryRun, errorHandler) {
  const sheetName = 'Faculty_Deviation';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  const avgRow = rows.find(r => r.is_average === true);
  const avgRate = avgRow ? avgRow.turnover_rate : DEVIATION_DEFAULTS.faculty_avg;

  console.log(`  ${sheetName}: ${rows.length} rows (avg: ${avgRate}%)`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const deviation = parseFloat((row.turnover_rate - avgRate).toFixed(1));

    if (dryRun) {
      console.log(`    [DRY RUN] ${row.school}: ${row.turnover_rate}% (dev: ${deviation > 0 ? '+' : ''}${deviation})`);
      inserted++;
      continue;
    }

    try {
      const result = await retryWithBackoff(() => upsert(getPool(), 'fact_faculty_turnover_deviation', {
        fiscal_year: row.fiscal_year,
        school: row.school,
        turnover_rate: row.turnover_rate,
        is_average: row.is_average || false,
        deviation_from_avg: deviation,
        source_file: sourceFile
      }, ['fiscal_year', 'school']));
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      const errorType = errorHandler.handleError(error, row, i);
      errored++;
      if (errorType === ErrorType.FATAL) throw error;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Historical Rates
 */
async function upsertHistoricalRates(workbook, sourceFile, dryRun, errorHandler) {
  const sheetName = 'Historical_Rates';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (dryRun) {
      console.log(`    [DRY RUN] ${row.fiscal_year}: ${row.total_turnover_rate}%`);
      inserted++;
      continue;
    }

    try {
      const result = await retryWithBackoff(() => upsert(getPool(), 'fact_historical_turnover_rates', {
        fiscal_year: row.fiscal_year,
        total_turnover_rate: row.total_turnover_rate,
        source_file: sourceFile
      }, ['fiscal_year']));
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      const errorType = errorHandler.handleError(error, row, i);
      errored++;
      if (errorType === ErrorType.FATAL) throw error;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Length of Service
 */
async function upsertLengthOfService(workbook, sourceFile, dryRun, errorHandler) {
  const sheetName = 'Length_of_Service';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (dryRun) {
      console.log(`    [DRY RUN] ${row.employee_type}/${row.tenure_band}: ${row.percentage}% (${row.count})`);
      inserted++;
      continue;
    }

    try {
      const result = await retryWithBackoff(() => upsert(getPool(), 'fact_turnover_length_of_service', {
        fiscal_year: row.fiscal_year,
        employee_type: row.employee_type,
        tenure_band: row.tenure_band,
        percentage: row.percentage,
        count: row.count,
        source_file: sourceFile
      }, ['fiscal_year', 'employee_type', 'tenure_band']));
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      const errorType = errorHandler.handleError(error, row, i);
      errored++;
      if (errorType === ErrorType.FATAL) throw error;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Retirements by FY
 */
async function upsertRetirementsByFY(workbook, sourceFile, dryRun, errorHandler) {
  const sheetName = 'Retirements_by_FY';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (dryRun) {
      console.log(`    [DRY RUN] ${row.fiscal_year}: F=${row.faculty}, SE=${row.staff_exempt}, SNE=${row.staff_non_exempt}, Total=${row.total}`);
      inserted++;
      continue;
    }

    try {
      const result = await retryWithBackoff(() => upsert(getPool(), 'fact_retirements_by_fy', {
        fiscal_year: row.fiscal_year,
        faculty: row.faculty || 0,
        staff_exempt: row.staff_exempt || 0,
        staff_non_exempt: row.staff_non_exempt || 0,
        total: row.total || 0,
        source_file: sourceFile
      }, ['fiscal_year']));
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      const errorType = errorHandler.handleError(error, row, i);
      errored++;
      if (errorType === ErrorType.FATAL) throw error;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Retirement Trends (Faculty + Staff)
 */
async function upsertRetirementTrends(workbook, sourceFile, dryRun, errorHandler) {
  let inserted = 0, updated = 0, errored = 0;

  // Faculty trends
  const facultyRows = sheetToJSON(workbook, 'Faculty_Retirement_Trends');
  console.log(`  Faculty_Retirement_Trends: ${facultyRows.length} rows`);

  for (let i = 0; i < facultyRows.length; i++) {
    const row = facultyRows[i];
    if (dryRun) {
      console.log(`    [DRY RUN] Faculty/${row.year}: Age=${row.avg_age}, LOS=${row.avg_los}`);
      inserted++;
      continue;
    }

    try {
      const result = await retryWithBackoff(() => upsert(getPool(), 'fact_retirement_trends', {
        year: row.year,
        employee_type: 'Faculty',
        avg_age: row.avg_age,
        avg_los: row.avg_los,
        source_file: sourceFile
      }, ['year', 'employee_type']));
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      const errorType = errorHandler.handleError(error, row, i);
      errored++;
      if (errorType === ErrorType.FATAL) throw error;
    }
  }

  // Staff trends
  const staffRows = sheetToJSON(workbook, 'Staff_Retirement_Trends');
  console.log(`  Staff_Retirement_Trends: ${staffRows.length} rows`);

  for (let i = 0; i < staffRows.length; i++) {
    const row = staffRows[i];
    if (dryRun) {
      console.log(`    [DRY RUN] Staff/${row.year}: Age=${row.avg_age}, LOS=${row.avg_los}`);
      inserted++;
      continue;
    }

    try {
      const result = await retryWithBackoff(() => upsert(getPool(), 'fact_retirement_trends', {
        year: row.year,
        employee_type: 'Staff',
        avg_age: row.avg_age,
        avg_los: row.avg_los,
        source_file: sourceFile
      }, ['year', 'employee_type']));
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      const errorType = errorHandler.handleError(error, row, i);
      errored++;
      if (errorType === ErrorType.FATAL) throw error;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Age Distribution (Faculty + Staff)
 */
async function upsertAgeDistribution(workbook, sourceFile, dryRun, fiscalYear, errorHandler) {
  let inserted = 0, updated = 0, errored = 0;

  if (!fiscalYear) {
    console.error(`  ${colors.red}Error: fiscalYear is required for age distribution${colors.reset}`);
    return { inserted: 0, updated: 0, errored: 1 };
  }

  // Faculty distribution
  const facultyRows = sheetToJSON(workbook, 'Faculty_Age_Distribution');
  console.log(`  Faculty_Age_Distribution: ${facultyRows.length} rows`);

  for (let i = 0; i < facultyRows.length; i++) {
    const row = facultyRows[i];
    if (dryRun) {
      console.log(`    [DRY RUN] Faculty/${row.category}: ${row.percentage}%`);
      inserted++;
      continue;
    }

    try {
      const result = await retryWithBackoff(() => upsert(getPool(), 'fact_retirement_age_distribution', {
        fiscal_year: fiscalYear,
        employee_type: 'Faculty',
        category: row.category,
        percentage: row.percentage,
        color: row.color || null,
        source_file: sourceFile
      }, ['fiscal_year', 'employee_type', 'category']));
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      const errorType = errorHandler.handleError(error, row, i);
      errored++;
      if (errorType === ErrorType.FATAL) throw error;
    }
  }

  // Staff distribution
  const staffRows = sheetToJSON(workbook, 'Staff_Age_Distribution');
  console.log(`  Staff_Age_Distribution: ${staffRows.length} rows`);

  for (let i = 0; i < staffRows.length; i++) {
    const row = staffRows[i];
    if (dryRun) {
      console.log(`    [DRY RUN] Staff/${row.category}: ${row.percentage}%`);
      inserted++;
      continue;
    }

    try {
      const result = await retryWithBackoff(() => upsert(getPool(), 'fact_retirement_age_distribution', {
        fiscal_year: fiscalYear,
        employee_type: 'Staff',
        category: row.category,
        percentage: row.percentage,
        color: row.color || null,
        source_file: sourceFile
      }, ['fiscal_year', 'employee_type', 'category']));
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      const errorType = errorHandler.handleError(error, row, i);
      errored++;
      if (errorType === ErrorType.FATAL) throw error;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Faculty Retirement by School
 */
async function upsertFacultyRetirementBySchool(workbook, sourceFile, dryRun, fiscalYear, errorHandler) {
  const sheetName = 'Faculty_Retirement_School';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  if (!fiscalYear) {
    console.error(`  ${colors.red}Error: fiscalYear is required for faculty retirement by school${colors.reset}`);
    return { inserted: 0, updated: 0, errored: 1 };
  }

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (dryRun) {
      console.log(`    [DRY RUN] ${row.school}: ${row.count} faculty`);
      inserted++;
      continue;
    }

    try {
      const result = await retryWithBackoff(() => upsert(getPool(), 'fact_faculty_retirement_by_school', {
        fiscal_year: fiscalYear,
        school: row.school,
        count: row.count,
        source_file: sourceFile
      }, ['fiscal_year', 'school']));
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      const errorType = errorHandler.handleError(error, row, i);
      errored++;
      if (errorType === ErrorType.FATAL) throw error;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs('turnover-metrics-to-postgres', [
    { flags: '--input,-i', key: 'input', type: 'string', description: 'Input Excel file path (default: auto-detect)' },
    { flags: '--fiscal-year,-fy', key: 'fiscalYear', type: 'string', description: 'Fiscal year (e.g., FY2025). Default: read from Metadata sheet' }
  ], {
    title: 'Turnover Metrics ETL to Postgres',
    usage: [
      'node scripts/etl/turnover-metrics-to-postgres.js',
      'node scripts/etl/turnover-metrics-to-postgres.js --dry-run',
      'node scripts/etl/turnover-metrics-to-postgres.js --input file.xlsx'
    ],
    examples: [
      '# Load turnover metrics',
      'npm run etl:turnover',
      '# Dry run to preview changes',
      'npm run etl:turnover -- --dry-run'
    ]
  });

  printBanner('Turnover Metrics ETL to Postgres');

  if (options.dryRun) {
    console.log(`${colors.yellow}[DRY RUN MODE] No database writes will be made${colors.reset}\n`);
  }

  // Check connection
  console.log(`${colors.blue}Checking database connection...${colors.reset}`);
  const connected = await checkConnection();

  if (!connected) {
    console.error(`${colors.red}Failed to connect to database.${colors.reset}`);
    process.exit(1);
  }
  console.log(`${colors.green}✓${colors.reset} Connected\n`);

  // Find input file
  const turnoverDir = path.join(__dirname, '..', '..', 'source-metrics', 'turnover');
  let sourceFile = options.input || findDefaultInputFile(turnoverDir, 'Turnover_Metrics_Master.xlsx');

  if (!sourceFile) {
    console.error(`${colors.red}Error: No input file found. Specify with --input or run generate-turnover-excel-template.js first.${colors.reset}`);
    process.exit(1);
  }

  if (!fs.existsSync(sourceFile)) {
    console.error(`${colors.red}Error: File not found: ${sourceFile}${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.blue}Loading Excel: ${path.basename(sourceFile)}${colors.reset}`);

  // Load workbook
  const { workbook, sheetNames } = loadWorkbook(sourceFile);
  const sheetValidation = validateRequiredSheets(workbook, EXPECTED_SHEETS);

  if (sheetValidation.missing.length > 0) {
    console.error(`${colors.red}Missing required sheets: ${sheetValidation.missing.join(', ')}${colors.reset}`);
    await endPool();
    process.exit(1);
  }

  console.log(`${colors.green}✓${colors.reset} Loaded ${sheetNames.length} sheets\n`);

  if (options.validateOnly) {
    const resolved = sheetValidation.present.map(s => `  ${s}`).join('\n');
    console.log(`${colors.green}✓${colors.reset} Sheet validation passed. Found sheets:\n${resolved}`);
    await endPool();
    process.exit(0);
  }

  // Determine fiscal year
  let fiscalYear = options.fiscalYear;
  if (!fiscalYear) {
    fiscalYear = extractFiscalYearFromMetadata(workbook);
    if (fiscalYear) {
      console.log(`${colors.blue}Fiscal year from Metadata sheet: ${fiscalYear}${colors.reset}`);
    } else {
      console.error(`${colors.red}Error: No fiscal year specified. Use --fiscal-year or add fiscal_year to Metadata sheet.${colors.reset}`);
      process.exit(1);
    }
  } else {
    console.log(`${colors.blue}Fiscal year from CLI: ${fiscalYear}${colors.reset}`);
  }
  console.log('');

  // Start audit log
  let loadId = null;
  if (!options.dryRun) {
    loadId = await startAuditLog({
      loadType: 'turnover_metrics',
      sourceFile: path.basename(sourceFile),
      periodDate: new Date().toISOString().split('T')[0],
      fiscalPeriod: fiscalYear
    });
    console.log(`${colors.blue}Audit log started (ID: ${loadId})${colors.reset}\n`);
  }

  // Process each sheet type
  console.log(`${colors.blue}Processing sheets...${colors.reset}`);
  const results = { totalInserted: 0, totalUpdated: 0, totalErrored: 0 };
  const sourceFileName = path.basename(sourceFile);
  const errorHandler = createErrorHandler('turnover-metrics-to-postgres');

  const handlers = [
    () => upsertSummaryRates(workbook, sourceFileName, options.dryRun, errorHandler),
    () => upsertTurnoverRatesTable(workbook, sourceFileName, options.dryRun, errorHandler),
    () => upsertHigherEdBenchmarks(workbook, sourceFileName, options.dryRun, errorHandler),
    () => upsertTurnoverBreakdown(workbook, sourceFileName, options.dryRun, errorHandler),
    () => upsertStaffDeviation(workbook, sourceFileName, options.dryRun, errorHandler),
    () => upsertFacultyDeviation(workbook, sourceFileName, options.dryRun, errorHandler),
    () => upsertHistoricalRates(workbook, sourceFileName, options.dryRun, errorHandler),
    () => upsertLengthOfService(workbook, sourceFileName, options.dryRun, errorHandler),
    () => upsertRetirementsByFY(workbook, sourceFileName, options.dryRun, errorHandler),
    () => upsertRetirementTrends(workbook, sourceFileName, options.dryRun, errorHandler),
    () => upsertAgeDistribution(workbook, sourceFileName, options.dryRun, fiscalYear, errorHandler),
    () => upsertFacultyRetirementBySchool(workbook, sourceFileName, options.dryRun, fiscalYear, errorHandler)
  ];

  for (const handler of handlers) {
    const r = await handler();
    results.totalInserted += r.inserted;
    results.totalUpdated += r.updated;
    results.totalErrored += r.errored;
  }

  // Print error report before audit completion
  errorHandler.printErrorReport();

  // Summary
  console.log(`\n${colors.cyan}Summary:${colors.reset}`);
  console.log(`  Inserted: ${results.totalInserted}`);
  console.log(`  Updated: ${results.totalUpdated}`);
  console.log(`  Errors: ${results.totalErrored}`);

  // Complete audit log
  if (loadId) {
    await completeAuditLog(loadId, {
      recordsRead: results.totalInserted + results.totalUpdated + results.totalErrored,
      recordsInserted: results.totalInserted,
      recordsUpdated: results.totalUpdated,
      recordsErrored: results.totalErrored,
      status: results.totalErrored > 0 ? 'completed_with_errors' : 'completed',
      errorMessage: results.totalErrored > 0 ? `${results.totalErrored} records failed` : null
    });
  }

  printComplete('Turnover Metrics ETL Complete');
  await endPool();
}

main().catch(async error => {
  console.error(`\n${colors.red}Fatal error: ${error.message}${colors.reset}`);
  console.error(error.stack);
  await endPool();
  process.exit(1);
});
