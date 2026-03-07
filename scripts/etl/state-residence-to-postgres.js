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
const { sql, getPool, upsert } = require('./neon-client');
const { getQuarterDatesFromKey, getFiscalPeriodKey } = require('../utils/fiscal-calendar');
const { formatDate } = require('../utils/excel-helpers');
const { colors, info, success, warning, error: logError, dryRunPrefix } = require('../utils/formatting');
const { parseArgs } = require('../utils/cli-parser');
const { runETL, startAudit, completeAudit } = require('../utils/etl-runner');

const SCRIPT_OPTIONS = [
  { flags: '--file,-f', key: 'file', type: 'string', description: 'Input JSON file (e.g., { "NE": 2218, "AZ": 487 })' },
  { flags: '--quarter,-q', key: 'quarter', type: 'string', description: 'Fiscal period (e.g., FY26_Q3)' },
  { flags: '--date,-d', key: 'date', type: 'string', description: 'Period date (YYYY-MM-DD format)' }
];

const HELP_CONFIG = {
  title: 'State Residence ETL to Postgres',
  usage: [
    'node scripts/etl/state-residence-to-postgres.js --file data.json --quarter FY26_Q3',
    'node scripts/etl/state-residence-to-postgres.js --file data.json --date 2026-03-31'
  ],
  notes: [
    'Input JSON Format: { "NE": 2218, "AZ": 487, "IA": 9, "MN": 5 }'
  ]
};

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
      const result = await upsert(getPool(), 'fact_employee_state_residence', {
        period_date: periodDate,
        state_code: stateCode,
        employee_count: count,
        source_file: sourceFile
      }, ['period_date', 'state_code']);

      if (result.inserted) { inserted++; } else { updated++; }
    } catch (err) {
      console.error(`  Error upserting ${stateCode}: ${err.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

const options = parseArgs('state-residence-to-postgres', SCRIPT_OPTIONS, HELP_CONFIG);

runETL({
  title: 'State Residence ETL to Postgres',
  loadType: 'state_residence',
  dryRun: options.dryRun,
  run: async () => {
    // Validate input
    if (!options.file) {
      logError('Error: --file is required');
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

    // Load JSON data
    const filePath = path.resolve(options.file);
    info(`Loading JSON: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      logError(`Error: File not found: ${filePath}`);
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const stateEntries = Object.entries(data);
    const totalEmployees = stateEntries.reduce((sum, [, count]) => sum + count, 0);

    success(`Loaded ${stateEntries.length} states, ${totalEmployees.toLocaleString()} total employees\n`);

    // Validate state codes
    info('Validating state codes...');
    const { invalid } = await validateStateCodes(Object.keys(data));

    if (invalid.length > 0) {
      logError(`Error: Invalid state codes: ${invalid.join(', ')}`);
      warning('Run the dim_us_states seed first.');
      process.exit(1);
    }
    success('All state codes valid\n');

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
    const loadId = await startAudit({
      loadType: 'state_residence',
      sourceFile: filePath,
      periodDate,
      fiscalPeriod,
      dryRun: options.dryRun
    });

    // Upsert data
    info(`${dryRunPrefix(options.dryRun)}Upserting to database...`);
    const { inserted, updated, errored } = await upsertResidenceData(
      data,
      periodDate,
      path.basename(filePath),
      options.dryRun
    );

    success(`Inserted: ${inserted}, Updated: ${updated}, Errors: ${errored}\n`);

    await completeAudit(loadId, { recordsRead: stateEntries.length, inserted, updated, errored });

    return { inserted, updated, errored, sourceFile: filePath, periodDate, fiscalPeriod };
  }
});
