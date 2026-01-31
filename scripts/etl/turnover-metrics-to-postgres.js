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
const { sql, endPool, startAuditLog, completeAuditLog, checkConnection } = require('./neon-client');

// Import existing utilities
const {
  loadExcelFile,
  sheetToJSON,
  getSheetNames
} = require('../utils/excel-helpers');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Expected sheet names
const EXPECTED_SHEETS = [
  'Summary_Rates',
  'Turnover_Rates_Table',
  'Higher_Ed_Averages',
  'Turnover_Breakdown',
  'Staff_Deviation',
  'Faculty_Deviation',
  'Historical_Rates',
  'Length_of_Service',
  'Retirements_by_FY',
  'Faculty_Retirement_Trends',
  'Faculty_Age_Distribution',
  'Faculty_Retirement_School',
  'Staff_Retirement_Trends',
  'Staff_Age_Distribution',
  'Metadata'
];

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: null,
    dryRun: false,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
      case '-i':
        options.input = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
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
${colors.cyan}Turnover Metrics ETL to Postgres${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node scripts/etl/turnover-metrics-to-postgres.js
  node scripts/etl/turnover-metrics-to-postgres.js --dry-run
  node scripts/etl/turnover-metrics-to-postgres.js --input file.xlsx

${colors.yellow}Options:${colors.reset}
  -i, --input FILE      Input Excel file path (default: auto-detect)
  --dry-run             Preview without database writes
  -v, --verbose         Show detailed output
  -h, --help            Show this help message

${colors.yellow}Examples:${colors.reset}
  # Load turnover metrics
  npm run etl:turnover

  # Dry run to preview changes
  npm run etl:turnover -- --dry-run
`);
}

/**
 * Find the default input file
 */
function findDefaultInputFile() {
  const turnoverDir = path.join(__dirname, '..', '..', 'source-metrics', 'turnover');
  const defaultFile = path.join(turnoverDir, 'Turnover_Metrics_Master.xlsx');

  if (fs.existsSync(defaultFile)) {
    return defaultFile;
  }

  // Fall back to any xlsx file in the directory
  if (fs.existsSync(turnoverDir)) {
    const files = fs.readdirSync(turnoverDir)
      .filter(f => f.endsWith('.xlsx') && !f.startsWith('~'))
      .sort();

    if (files.length > 0) {
      return path.join(turnoverDir, files[0]);
    }
  }

  return null;
}

/**
 * Load and validate Excel workbook
 */
function loadWorkbook(filePath) {
  const workbook = loadExcelFile(filePath);
  const sheetNames = getSheetNames(workbook);

  console.log(`${colors.blue}Validating sheets...${colors.reset}`);
  console.log(`  Found ${sheetNames.length} sheets`);

  const missingSheets = EXPECTED_SHEETS.filter(s => !sheetNames.includes(s));
  if (missingSheets.length > 0) {
    console.warn(`${colors.yellow}Warning: Missing expected sheets:${colors.reset} ${missingSheets.join(', ')}`);
  }

  return { workbook, sheetNames };
}

/**
 * Upsert Summary Rates
 */
async function upsertSummaryRates(workbook, sourceFile, dryRun) {
  const sheetName = 'Summary_Rates';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (const row of rows) {
    if (dryRun) {
      console.log(`    [DRY RUN] ${row.fiscal_year}/${row.category}: ${row.turnover_rate}%`);
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_turnover_summary_rates (
          fiscal_year, category, turnover_rate, prior_year_rate, change, trend, source_file
        )
        VALUES (
          ${row.fiscal_year}, ${row.category}, ${row.turnover_rate},
          ${row.prior_year_rate || null}, ${row.change || null}, ${row.trend || null}, ${sourceFile}
        )
        ON CONFLICT (fiscal_year, category)
        DO UPDATE SET
          turnover_rate = EXCLUDED.turnover_rate,
          prior_year_rate = EXCLUDED.prior_year_rate,
          change = EXCLUDED.change,
          trend = EXCLUDED.trend,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Turnover Rates Table (includes higher ed avg)
 */
async function upsertTurnoverRatesTable(workbook, sourceFile, dryRun) {
  const sheetName = 'Turnover_Rates_Table';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (const row of rows) {
    if (dryRun) {
      console.log(`    [DRY RUN] ${row.fiscal_year}/${row.category}: ${row.turnover_rate}% (HE Avg: ${row.higher_ed_avg}%)`);
      inserted++;
      continue;
    }

    try {
      // Upsert to summary rates with benchmark
      const result = await sql`
        INSERT INTO fact_turnover_summary_rates (
          fiscal_year, category, turnover_rate, higher_ed_avg, benchmark_source, source_file
        )
        VALUES (
          ${row.fiscal_year}, ${row.category}, ${row.turnover_rate},
          ${row.higher_ed_avg || null}, ${row.source || null}, ${sourceFile}
        )
        ON CONFLICT (fiscal_year, category)
        DO UPDATE SET
          turnover_rate = EXCLUDED.turnover_rate,
          higher_ed_avg = EXCLUDED.higher_ed_avg,
          benchmark_source = EXCLUDED.benchmark_source,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Higher Ed Benchmarks
 */
async function upsertHigherEdBenchmarks(workbook, sourceFile, dryRun) {
  const sheetName = 'Higher_Ed_Averages';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (const row of rows) {
    if (dryRun) {
      console.log(`    [DRY RUN] ${row.fiscal_year}/${row.category}: ${row.higher_ed_avg}%`);
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_higher_ed_benchmarks (
          fiscal_year, category, higher_ed_avg, source, source_file
        )
        VALUES (
          ${row.fiscal_year}, ${row.category}, ${row.higher_ed_avg}, ${row.source || null}, ${sourceFile}
        )
        ON CONFLICT (fiscal_year, category)
        DO UPDATE SET
          higher_ed_avg = EXCLUDED.higher_ed_avg,
          source = EXCLUDED.source,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Turnover Breakdown
 */
async function upsertTurnoverBreakdown(workbook, sourceFile, dryRun) {
  const sheetName = 'Turnover_Breakdown';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (const row of rows) {
    if (dryRun) {
      console.log(`    [DRY RUN] ${row.fiscal_year}/${row.category}: Vol ${row.voluntary}%, Invol ${row.involuntary}%, Retire ${row.retirement}%`);
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_turnover_breakdown (
          fiscal_year, category, involuntary, voluntary, retirement, total, source_file
        )
        VALUES (
          ${row.fiscal_year}, ${row.category}, ${row.involuntary || 0},
          ${row.voluntary || 0}, ${row.retirement || 0}, ${row.total}, ${sourceFile}
        )
        ON CONFLICT (fiscal_year, category)
        DO UPDATE SET
          involuntary = EXCLUDED.involuntary,
          voluntary = EXCLUDED.voluntary,
          retirement = EXCLUDED.retirement,
          total = EXCLUDED.total,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Staff Deviation
 */
async function upsertStaffDeviation(workbook, sourceFile, dryRun) {
  const sheetName = 'Staff_Deviation';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  // Find average for deviation calculation
  const avgRow = rows.find(r => r.is_average === true);
  const avgRate = avgRow ? avgRow.turnover_rate : 13.6;

  console.log(`  ${sheetName}: ${rows.length} rows (avg: ${avgRate}%)`);

  for (const row of rows) {
    const deviation = parseFloat((row.turnover_rate - avgRate).toFixed(1));

    if (dryRun) {
      console.log(`    [DRY RUN] ${row.department}: ${row.turnover_rate}% (dev: ${deviation > 0 ? '+' : ''}${deviation})`);
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_staff_turnover_deviation (
          fiscal_year, department, turnover_rate, is_average, deviation_from_avg, source_file
        )
        VALUES (
          ${row.fiscal_year}, ${row.department}, ${row.turnover_rate},
          ${row.is_average || false}, ${deviation}, ${sourceFile}
        )
        ON CONFLICT (fiscal_year, department)
        DO UPDATE SET
          turnover_rate = EXCLUDED.turnover_rate,
          is_average = EXCLUDED.is_average,
          deviation_from_avg = EXCLUDED.deviation_from_avg,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Faculty Deviation
 */
async function upsertFacultyDeviation(workbook, sourceFile, dryRun) {
  const sheetName = 'Faculty_Deviation';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  // Find average for deviation calculation
  const avgRow = rows.find(r => r.is_average === true);
  const avgRate = avgRow ? avgRow.turnover_rate : 6.3;

  console.log(`  ${sheetName}: ${rows.length} rows (avg: ${avgRate}%)`);

  for (const row of rows) {
    const deviation = parseFloat((row.turnover_rate - avgRate).toFixed(1));

    if (dryRun) {
      console.log(`    [DRY RUN] ${row.school}: ${row.turnover_rate}% (dev: ${deviation > 0 ? '+' : ''}${deviation})`);
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_faculty_turnover_deviation (
          fiscal_year, school, turnover_rate, is_average, deviation_from_avg, source_file
        )
        VALUES (
          ${row.fiscal_year}, ${row.school}, ${row.turnover_rate},
          ${row.is_average || false}, ${deviation}, ${sourceFile}
        )
        ON CONFLICT (fiscal_year, school)
        DO UPDATE SET
          turnover_rate = EXCLUDED.turnover_rate,
          is_average = EXCLUDED.is_average,
          deviation_from_avg = EXCLUDED.deviation_from_avg,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Historical Rates
 */
async function upsertHistoricalRates(workbook, sourceFile, dryRun) {
  const sheetName = 'Historical_Rates';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (const row of rows) {
    if (dryRun) {
      console.log(`    [DRY RUN] ${row.fiscal_year}: ${row.total_turnover_rate}%`);
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_historical_turnover_rates (
          fiscal_year, total_turnover_rate, source_file
        )
        VALUES (
          ${row.fiscal_year}, ${row.total_turnover_rate}, ${sourceFile}
        )
        ON CONFLICT (fiscal_year)
        DO UPDATE SET
          total_turnover_rate = EXCLUDED.total_turnover_rate,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Length of Service
 */
async function upsertLengthOfService(workbook, sourceFile, dryRun) {
  const sheetName = 'Length_of_Service';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (const row of rows) {
    if (dryRun) {
      console.log(`    [DRY RUN] ${row.employee_type}/${row.tenure_band}: ${row.percentage}% (${row.count})`);
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_turnover_length_of_service (
          fiscal_year, employee_type, tenure_band, percentage, count, source_file
        )
        VALUES (
          ${row.fiscal_year}, ${row.employee_type}, ${row.tenure_band},
          ${row.percentage}, ${row.count}, ${sourceFile}
        )
        ON CONFLICT (fiscal_year, employee_type, tenure_band)
        DO UPDATE SET
          percentage = EXCLUDED.percentage,
          count = EXCLUDED.count,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Retirements by FY
 */
async function upsertRetirementsByFY(workbook, sourceFile, dryRun) {
  const sheetName = 'Retirements_by_FY';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (const row of rows) {
    if (dryRun) {
      console.log(`    [DRY RUN] ${row.fiscal_year}: F=${row.faculty}, SE=${row.staff_exempt}, SNE=${row.staff_non_exempt}, Total=${row.total}`);
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_retirements_by_fy (
          fiscal_year, faculty, staff_exempt, staff_non_exempt, total, source_file
        )
        VALUES (
          ${row.fiscal_year}, ${row.faculty || 0}, ${row.staff_exempt || 0},
          ${row.staff_non_exempt || 0}, ${row.total || 0}, ${sourceFile}
        )
        ON CONFLICT (fiscal_year)
        DO UPDATE SET
          faculty = EXCLUDED.faculty,
          staff_exempt = EXCLUDED.staff_exempt,
          staff_non_exempt = EXCLUDED.staff_non_exempt,
          total = EXCLUDED.total,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Retirement Trends (Faculty + Staff)
 */
async function upsertRetirementTrends(workbook, sourceFile, dryRun) {
  let inserted = 0, updated = 0, errored = 0;

  // Faculty trends
  const facultyRows = sheetToJSON(workbook, 'Faculty_Retirement_Trends');
  console.log(`  Faculty_Retirement_Trends: ${facultyRows.length} rows`);

  for (const row of facultyRows) {
    if (dryRun) {
      console.log(`    [DRY RUN] Faculty/${row.year}: Age=${row.avg_age}, LOS=${row.avg_los}`);
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_retirement_trends (
          year, employee_type, avg_age, avg_los, source_file
        )
        VALUES (
          ${row.year}, 'Faculty', ${row.avg_age}, ${row.avg_los}, ${sourceFile}
        )
        ON CONFLICT (year, employee_type)
        DO UPDATE SET
          avg_age = EXCLUDED.avg_age,
          avg_los = EXCLUDED.avg_los,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  // Staff trends
  const staffRows = sheetToJSON(workbook, 'Staff_Retirement_Trends');
  console.log(`  Staff_Retirement_Trends: ${staffRows.length} rows`);

  for (const row of staffRows) {
    if (dryRun) {
      console.log(`    [DRY RUN] Staff/${row.year}: Age=${row.avg_age}, LOS=${row.avg_los}`);
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_retirement_trends (
          year, employee_type, avg_age, avg_los, source_file
        )
        VALUES (
          ${row.year}, 'Staff', ${row.avg_age}, ${row.avg_los}, ${sourceFile}
        )
        ON CONFLICT (year, employee_type)
        DO UPDATE SET
          avg_age = EXCLUDED.avg_age,
          avg_los = EXCLUDED.avg_los,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Age Distribution (Faculty + Staff)
 */
async function upsertAgeDistribution(workbook, sourceFile, dryRun) {
  let inserted = 0, updated = 0, errored = 0;
  const fiscalYear = 'FY2025';  // Current year

  // Faculty distribution
  const facultyRows = sheetToJSON(workbook, 'Faculty_Age_Distribution');
  console.log(`  Faculty_Age_Distribution: ${facultyRows.length} rows`);

  for (const row of facultyRows) {
    if (dryRun) {
      console.log(`    [DRY RUN] Faculty/${row.category}: ${row.percentage}%`);
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_retirement_age_distribution (
          fiscal_year, employee_type, category, percentage, color, source_file
        )
        VALUES (
          ${fiscalYear}, 'Faculty', ${row.category}, ${row.percentage}, ${row.color || null}, ${sourceFile}
        )
        ON CONFLICT (fiscal_year, employee_type, category)
        DO UPDATE SET
          percentage = EXCLUDED.percentage,
          color = EXCLUDED.color,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  // Staff distribution
  const staffRows = sheetToJSON(workbook, 'Staff_Age_Distribution');
  console.log(`  Staff_Age_Distribution: ${staffRows.length} rows`);

  for (const row of staffRows) {
    if (dryRun) {
      console.log(`    [DRY RUN] Staff/${row.category}: ${row.percentage}%`);
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_retirement_age_distribution (
          fiscal_year, employee_type, category, percentage, color, source_file
        )
        VALUES (
          ${fiscalYear}, 'Staff', ${row.category}, ${row.percentage}, ${row.color || null}, ${sourceFile}
        )
        ON CONFLICT (fiscal_year, employee_type, category)
        DO UPDATE SET
          percentage = EXCLUDED.percentage,
          color = EXCLUDED.color,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Faculty Retirement by School
 */
async function upsertFacultyRetirementBySchool(workbook, sourceFile, dryRun) {
  const sheetName = 'Faculty_Retirement_School';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;
  const fiscalYear = 'FY2025';

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (const row of rows) {
    if (dryRun) {
      console.log(`    [DRY RUN] ${row.school}: ${row.count} faculty`);
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_faculty_retirement_by_school (
          fiscal_year, school, count, source_file
        )
        VALUES (
          ${fiscalYear}, ${row.school}, ${row.count}, ${sourceFile}
        )
        ON CONFLICT (fiscal_year, school)
        DO UPDATE SET
          count = EXCLUDED.count,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
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
  console.log(`${colors.cyan}   Turnover Metrics ETL to Postgres${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

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
  let sourceFile = options.input || findDefaultInputFile();

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
  console.log(`${colors.green}✓${colors.reset} Loaded ${sheetNames.length} sheets\n`);

  // Start audit log
  let loadId = null;
  if (!options.dryRun) {
    loadId = await startAuditLog({
      loadType: 'turnover_metrics',
      sourceFile: path.basename(sourceFile),
      periodDate: new Date().toISOString().split('T')[0],
      fiscalPeriod: 'FY25'
    });
    console.log(`${colors.blue}Audit log started (ID: ${loadId})${colors.reset}\n`);
  }

  // Process each sheet type
  console.log(`${colors.blue}Processing sheets...${colors.reset}`);
  const results = {
    totalInserted: 0,
    totalUpdated: 0,
    totalErrored: 0
  };

  const sourceFileName = path.basename(sourceFile);

  // Summary Rates
  let r = await upsertSummaryRates(workbook, sourceFileName, options.dryRun);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

  // Turnover Rates Table
  r = await upsertTurnoverRatesTable(workbook, sourceFileName, options.dryRun);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

  // Higher Ed Benchmarks
  r = await upsertHigherEdBenchmarks(workbook, sourceFileName, options.dryRun);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

  // Turnover Breakdown
  r = await upsertTurnoverBreakdown(workbook, sourceFileName, options.dryRun);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

  // Staff Deviation
  r = await upsertStaffDeviation(workbook, sourceFileName, options.dryRun);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

  // Faculty Deviation
  r = await upsertFacultyDeviation(workbook, sourceFileName, options.dryRun);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

  // Historical Rates
  r = await upsertHistoricalRates(workbook, sourceFileName, options.dryRun);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

  // Length of Service
  r = await upsertLengthOfService(workbook, sourceFileName, options.dryRun);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

  // Retirements by FY
  r = await upsertRetirementsByFY(workbook, sourceFileName, options.dryRun);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

  // Retirement Trends
  r = await upsertRetirementTrends(workbook, sourceFileName, options.dryRun);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

  // Age Distribution
  r = await upsertAgeDistribution(workbook, sourceFileName, options.dryRun);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

  // Faculty Retirement by School
  r = await upsertFacultyRetirementBySchool(workbook, sourceFileName, options.dryRun);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

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
      status: results.totalErrored > 0 ? 'completed' : 'completed',
      errorMessage: results.totalErrored > 0 ? `${results.totalErrored} records failed` : null
    });
  }

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.green}✓ Turnover Metrics ETL Complete${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  await endPool();
}

main().catch(async error => {
  console.error(`\n${colors.red}Fatal error: ${error.message}${colors.reset}`);
  console.error(error.stack);
  await endPool();
  process.exit(1);
});
