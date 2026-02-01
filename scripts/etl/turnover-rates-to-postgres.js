#!/usr/bin/env node

/**
 * Turnover Rates ETL to Postgres
 *
 * Simple ETL script that reads turnover rates from a single-sheet Excel
 * and upserts to fact_turnover_summary_rates in Neon Postgres.
 *
 * Usage:
 *   node scripts/etl/turnover-rates-to-postgres.js
 *   node scripts/etl/turnover-rates-to-postgres.js --input file.xlsx
 *   node scripts/etl/turnover-rates-to-postgres.js --dry-run
 *
 * Excel Format (single sheet "Turnover_Rates"):
 *   | Category | Period | Rate | Benchmark | Benchmark_Year |
 *   |----------|--------|------|-----------|----------------|
 *   | Faculty  | FY24   | 7.7  | 9.1       | 2023-24        |
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

// Valid categories
const VALID_CATEGORIES = ['Faculty', 'Staff Exempt', 'Staff Non-Exempt', 'Total'];

/**
 * Compare fiscal periods chronologically
 * Handles formats: FY2024, FY2025, Q1_FY2026, Q4_FY2025, etc.
 * Returns the most recent period from an array
 * @param {string[]} periods - Array of fiscal period strings
 * @returns {string} - Most recent period
 */
function getMostRecentPeriod(periods) {
  if (!periods || periods.length === 0) return null;

  return periods.sort((a, b) => {
    // Extract fiscal year (always 4 digits after FY)
    const fyMatchA = a.match(/FY(\d{4})/);
    const fyMatchB = b.match(/FY(\d{4})/);
    const fyA = fyMatchA ? parseInt(fyMatchA[1], 10) : 0;
    const fyB = fyMatchB ? parseInt(fyMatchB[1], 10) : 0;

    // Compare fiscal years first
    if (fyA !== fyB) return fyA - fyB;

    // Same fiscal year - check for quarters
    const qMatchA = a.match(/^Q(\d)/);
    const qMatchB = b.match(/^Q(\d)/);
    const qA = qMatchA ? parseInt(qMatchA[1], 10) : 5; // Full FY sorts after Q4
    const qB = qMatchB ? parseInt(qMatchB[1], 10) : 5;

    return qA - qB;
  }).pop();
}

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
${colors.cyan}Turnover Rates ETL to Postgres${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node scripts/etl/turnover-rates-to-postgres.js
  node scripts/etl/turnover-rates-to-postgres.js --input file.xlsx
  node scripts/etl/turnover-rates-to-postgres.js --dry-run

${colors.yellow}Options:${colors.reset}
  -i, --input FILE      Input Excel file path (default: source-metrics/turnover/turnover-rates-input.xlsx)
  --dry-run             Preview without database writes
  -v, --verbose         Show detailed output
  -h, --help            Show this help message

${colors.yellow}Excel Format:${colors.reset}
  Single sheet with columns:
  - Category: Faculty, Staff Exempt, Staff Non-Exempt, Total
  - Period: FY24, FY25, Q1_FY26, etc.
  - Rate: Turnover rate percentage (e.g., 7.7)
  - Benchmark: Higher Ed benchmark percentage
  - Benchmark_Year: Academic year (e.g., 2023-24)

${colors.yellow}Examples:${colors.reset}
  # Load default file
  npm run etl:turnover-rates

  # Dry run to preview
  npm run etl:turnover-rates -- --dry-run

  # Specify custom file
  npm run etl:turnover-rates -- --input custom-rates.xlsx
`);
}

/**
 * Find the default input file
 */
function findDefaultInputFile() {
  const turnoverDir = path.join(__dirname, '..', '..', 'source-metrics', 'turnover');
  const defaultFile = path.join(turnoverDir, 'turnover-rates-input.xlsx');

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
 * Validate a row of data
 * @param {Object} row - Row object from Excel
 * @param {number} rowIndex - 1-based row index
 * @returns {Object} - { valid: boolean, errors: string[], data: Object }
 */
function validateRow(row, rowIndex) {
  const errors = [];

  // Required fields - use ?? to preserve 0 values
  const category = ((row.Category ?? row.category) ?? '').toString().trim();
  const period = ((row.Period ?? row.period) ?? '').toString().trim();
  const rateValue = row.Rate ?? row.rate;
  const rate = rateValue !== undefined && rateValue !== '' ? parseFloat(rateValue) : NaN;

  // Optional fields - use ?? to preserve 0 values
  const benchmarkValue = row.Benchmark ?? row.benchmark;
  const benchmark = benchmarkValue !== undefined && benchmarkValue !== ''
    ? parseFloat(benchmarkValue)
    : null;
  const benchmarkYear = (row.Benchmark_Year || row.benchmark_year || '').toString().trim() || null;

  // Validate category
  if (!category) {
    errors.push('Missing Category');
  } else if (!VALID_CATEGORIES.includes(category)) {
    errors.push(`Invalid Category "${category}". Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  // Validate period
  if (!period) {
    errors.push('Missing Period');
  } else if (!/^(FY\d{2}|Q[1-4]_FY\d{2})$/.test(period)) {
    errors.push(`Invalid Period format "${period}". Use FY24, FY25, Q1_FY26, etc.`);
  }

  // Validate rate
  if (isNaN(rate)) {
    errors.push('Invalid or missing Rate');
  } else if (rate < 0 || rate > 100) {
    errors.push(`Rate ${rate} out of range (0-100)`);
  }

  // Validate benchmark if present
  if (benchmark !== null && (isNaN(benchmark) || benchmark < 0 || benchmark > 100)) {
    errors.push(`Benchmark ${benchmark} out of range (0-100)`);
  }

  // Convert period to fiscal_year format for database
  // FY24 -> FY2024, Q1_FY26 -> Q1_FY2026
  let fiscalYear = period;
  if (/^FY\d{2}$/.test(period)) {
    fiscalYear = `FY20${period.slice(2)}`;
  } else if (/^Q[1-4]_FY\d{2}$/.test(period)) {
    const [quarter, fy] = period.split('_');
    fiscalYear = `${quarter}_FY20${fy.slice(2)}`;
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      fiscalYear,
      category,
      turnoverRate: rate,
      higherEdAvg: benchmark,
      benchmarkSource: benchmarkYear ? `CUPA ${benchmarkYear}` : null,
      originalPeriod: period
    }
  };
}

/**
 * Upsert turnover rates to Postgres
 */
async function upsertTurnoverRates(rates, sourceFile, dryRun = false) {
  let inserted = 0;
  let updated = 0;
  let errored = 0;

  for (const rate of rates) {
    if (dryRun) {
      console.log(`  [DRY RUN] Would upsert: ${rate.category} / ${rate.fiscalYear}: ${rate.turnoverRate}%`);
      if (rate.higherEdAvg) {
        console.log(`            Benchmark: ${rate.higherEdAvg}% (${rate.benchmarkSource})`);
      }
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_turnover_summary_rates (
          fiscal_year, category, turnover_rate, higher_ed_avg, benchmark_source, source_file
        )
        VALUES (
          ${rate.fiscalYear}, ${rate.category}, ${rate.turnoverRate},
          ${rate.higherEdAvg}, ${rate.benchmarkSource}, ${sourceFile}
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

      if (result[0]?.inserted) {
        inserted++;
      } else {
        updated++;
      }
    } catch (error) {
      console.error(`  ${colors.red}Error upserting ${rate.category}/${rate.fiscalYear}:${colors.reset} ${error.message}`);
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
  console.log(`${colors.cyan}   Turnover Rates ETL to Postgres${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

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
    console.error(`${colors.red}Error: No input file found.${colors.reset}`);
    console.log(`Run: node scripts/generate-turnover-rates-template.js to create the template`);
    process.exit(1);
  }

  if (!fs.existsSync(sourceFile)) {
    console.error(`${colors.red}Error: File not found: ${sourceFile}${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.blue}Loading Excel: ${path.basename(sourceFile)}${colors.reset}`);

  // Load Excel data
  const workbook = loadExcelFile(sourceFile);
  const sheetNames = getSheetNames(workbook);

  // Find Turnover_Rates sheet or use first sheet
  let sheetName = sheetNames.find(s => s.toLowerCase().includes('turnover'));
  if (!sheetName) {
    sheetName = sheetNames[0];
  }

  const rows = sheetToJSON(workbook, sheetName);
  console.log(`${colors.green}✓${colors.reset} Loaded ${rows.length} rows from sheet "${sheetName}"\n`);

  // Validate rows
  console.log(`${colors.blue}Validating data...${colors.reset}`);
  const validatedRows = [];
  let validationErrors = 0;

  rows.forEach((row, index) => {
    // Skip empty rows
    if (!row.Category && !row.category && !row.Period && !row.period) {
      return;
    }

    const result = validateRow(row, index + 2); // +2 for 1-based + header row

    if (result.valid) {
      validatedRows.push(result.data);
    } else {
      console.log(`  ${colors.yellow}Row ${index + 2}:${colors.reset} ${result.errors.join(', ')}`);
      validationErrors++;
    }
  });

  if (validationErrors > 0) {
    console.log(`${colors.yellow}⚠${colors.reset} ${validationErrors} validation error(s)\n`);
  } else {
    console.log(`${colors.green}✓${colors.reset} All ${validatedRows.length} rows valid\n`);
  }

  if (validatedRows.length === 0) {
    console.error(`${colors.red}Error: No valid rows to process.${colors.reset}`);
    process.exit(1);
  }

  // Display summary by period
  const periodSummary = {};
  validatedRows.forEach(row => {
    if (!periodSummary[row.fiscalYear]) {
      periodSummary[row.fiscalYear] = [];
    }
    periodSummary[row.fiscalYear].push(row);
  });

  console.log(`${colors.cyan}Data Summary:${colors.reset}`);
  Object.entries(periodSummary).sort().forEach(([period, data]) => {
    console.log(`  ${period}:`);
    data.forEach(row => {
      const benchmarkInfo = row.higherEdAvg ? ` (Benchmark: ${row.higherEdAvg}%)` : '';
      console.log(`    ${row.category}: ${row.turnoverRate}%${benchmarkInfo}`);
    });
  });
  console.log('');

  // Start audit log
  let loadId = null;
  if (!options.dryRun) {
    loadId = await startAuditLog({
      loadType: 'turnover-rates',
      sourceFile: path.basename(sourceFile),
      periodDate: new Date().toISOString().split('T')[0],
      fiscalPeriod: getMostRecentPeriod(Object.keys(periodSummary))
    });
    console.log(`${colors.blue}Audit log started (ID: ${loadId})${colors.reset}\n`);
  }

  // Upsert to database
  console.log(`${colors.blue}${options.dryRun ? '[DRY RUN] ' : ''}Upserting to database...${colors.reset}`);
  const { inserted, updated, errored } = await upsertTurnoverRates(
    validatedRows,
    path.basename(sourceFile),
    options.dryRun
  );

  console.log(`\n${colors.green}✓${colors.reset} Inserted: ${inserted}, Updated: ${updated}, Errors: ${errored}`);

  // Complete audit log
  if (loadId) {
    await completeAuditLog(loadId, {
      recordsRead: rows.length,
      recordsInserted: inserted,
      recordsUpdated: updated,
      recordsErrored: errored + validationErrors,
      status: errored > 0 ? 'completed_with_errors' : 'completed',
      errorMessage: errored > 0 ? `${errored} records failed to upsert` : null
    });
  }

  // Verification query
  if (!options.dryRun) {
    console.log(`\n${colors.cyan}Verification:${colors.reset}`);
    const verifyResult = await sql`
      SELECT fiscal_year, category, turnover_rate, higher_ed_avg, benchmark_source
      FROM fact_turnover_summary_rates
      ORDER BY fiscal_year,
        CASE category
          WHEN 'Faculty' THEN 1
          WHEN 'Staff Exempt' THEN 2
          WHEN 'Staff Non-Exempt' THEN 3
          WHEN 'Total' THEN 4
        END
      LIMIT 20
    `;

    verifyResult.forEach(row => {
      const benchmark = row.higher_ed_avg ? ` (HE Avg: ${row.higher_ed_avg}%)` : '';
      console.log(`  ${row.fiscal_year} / ${row.category}: ${row.turnover_rate}%${benchmark}`);
    });
  }

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.green}✓ Turnover Rates ETL Complete${colors.reset}`);
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
  validateRow,
  VALID_CATEGORIES
};
