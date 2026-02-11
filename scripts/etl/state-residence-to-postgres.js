#!/usr/bin/env node

/**
 * State Residence Data ETL to Postgres
 *
 * Loads benefit-eligible employee counts by state of residence
 * into fact_employee_state_residence table.
 *
 * Input: JSON file with { "NE": 2218, "AZ": 487, ... } format
 *
 * Usage:
 *   node scripts/etl/state-residence-to-postgres.js --file data.json --quarter FY26_Q3
 *   node scripts/etl/state-residence-to-postgres.js --file data.json --date 2026-03-31
 *   node scripts/etl/state-residence-to-postgres.js --file data.json --quarter FY26_Q3 --dry-run
 */

const fs = require('fs');
const path = require('path');
const { sql, endPool, startAuditLog, completeAuditLog, checkConnection } = require('./neon-client');

const {
  getQuarterDatesFromKey,
  getFiscalPeriodKey
} = require('../utils/fiscal-calendar');

const { formatDate } = require('../utils/excel-helpers');

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
    file: null,
    quarter: null,
    date: null,
    dryRun: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--file':
      case '-f':
        options.file = args[++i];
        break;
      case '--quarter':
      case '-q':
        options.quarter = args[++i];
        break;
      case '--date':
      case '-d':
        options.date = args[++i];
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
${colors.cyan}State Residence ETL to Postgres${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node scripts/etl/state-residence-to-postgres.js --file data.json --quarter FY26_Q3
  node scripts/etl/state-residence-to-postgres.js --file data.json --date 2026-03-31

${colors.yellow}Options:${colors.reset}
  -f, --file FILE       Input JSON file (e.g., { "NE": 2218, "AZ": 487 })
  -q, --quarter PERIOD  Fiscal period (e.g., FY26_Q3)
  -d, --date DATE       Period date (YYYY-MM-DD format)
  --dry-run             Preview without database writes
  -h, --help            Show this help

${colors.yellow}Input JSON Format:${colors.reset}
  {
    "NE": 2218,
    "AZ": 487,
    "IA": 9,
    "MN": 5
  }
`);
}

/**
 * Validate state codes against dim_us_states
 */
async function validateStateCodes(stateCodes) {
  const result = await sql`SELECT state_code FROM dim_us_states`;
  const validCodes = new Set(result.map(r => r.state_code.trim()));

  const invalid = stateCodes.filter(code => !validCodes.has(code));
  return { validCodes, invalid };
}

/**
 * Upsert state residence data
 */
async function upsertResidenceData(data, periodDate, sourceFile, dryRun = false) {
  let inserted = 0;
  let updated = 0;
  let errored = 0;

  for (const [stateCode, count] of Object.entries(data)) {
    if (dryRun) {
      console.log(`  [DRY RUN] Would upsert: ${stateCode} = ${count}`);
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_employee_state_residence (
          period_date, state_code, employee_count, source_file
        )
        VALUES (${periodDate}, ${stateCode}, ${count}, ${sourceFile})
        ON CONFLICT (period_date, state_code)
        DO UPDATE SET
          employee_count = EXCLUDED.employee_count,
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
      console.error(`  Error upserting ${stateCode}: ${error.message}`);
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
  console.log(`${colors.cyan}   State Residence ETL to Postgres${colors.reset}`);
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
  if (!options.file) {
    console.error(`${colors.red}Error: --file is required${colors.reset}`);
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

  // Load JSON data
  const filePath = path.resolve(options.file);
  console.log(`${colors.blue}Loading JSON: ${filePath}${colors.reset}`);

  if (!fs.existsSync(filePath)) {
    console.error(`${colors.red}Error: File not found: ${filePath}${colors.reset}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const stateEntries = Object.entries(data);
  const totalEmployees = stateEntries.reduce((sum, [, count]) => sum + count, 0);

  console.log(`${colors.green}✓${colors.reset} Loaded ${stateEntries.length} states, ${totalEmployees.toLocaleString()} total employees\n`);

  // Validate state codes
  console.log(`${colors.blue}Validating state codes...${colors.reset}`);
  const { invalid } = await validateStateCodes(Object.keys(data));

  if (invalid.length > 0) {
    console.error(`${colors.red}Error: Invalid state codes: ${invalid.join(', ')}${colors.reset}`);
    console.error(`${colors.yellow}Run the dim_us_states seed first.${colors.reset}`);
    await endPool();
    process.exit(1);
  }
  console.log(`${colors.green}✓${colors.reset} All state codes valid\n`);

  // Print summary
  console.log(`${colors.cyan}Data Summary:${colors.reset}`);
  stateEntries
    .sort((a, b) => b[1] - a[1])
    .forEach(([state, count]) => {
      console.log(`  ${state}: ${count.toLocaleString()}`);
    });
  console.log(`  ${'─'.repeat(20)}`);
  console.log(`  Total: ${totalEmployees.toLocaleString()}\n`);

  // Start audit log
  let loadId = null;
  if (!options.dryRun) {
    loadId = await startAuditLog({
      loadType: 'state_residence',
      sourceFile: path.basename(filePath),
      periodDate,
      fiscalPeriod
    });
    console.log(`${colors.blue}Audit log started (ID: ${loadId})${colors.reset}\n`);
  }

  // Upsert data
  console.log(`${colors.blue}${options.dryRun ? '[DRY RUN] ' : ''}Upserting to database...${colors.reset}`);
  const { inserted, updated, errored } = await upsertResidenceData(
    data,
    periodDate,
    path.basename(filePath),
    options.dryRun
  );

  console.log(`${colors.green}✓${colors.reset} Inserted: ${inserted}, Updated: ${updated}, Errors: ${errored}\n`);

  // Complete audit log
  if (loadId) {
    await completeAuditLog(loadId, {
      recordsRead: stateEntries.length,
      recordsInserted: inserted,
      recordsUpdated: updated,
      recordsErrored: errored,
      status: 'completed',
      errorMessage: errored > 0 ? `${errored} records failed` : null
    });
  }

  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.green}✓ State Residence ETL Complete${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  await endPool();
}

main().catch(async error => {
  console.error(`\n${colors.red}Fatal error: ${error.message}${colors.reset}`);
  console.error(error.stack);
  await endPool();
  process.exit(1);
});
