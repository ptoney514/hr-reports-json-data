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
const { sql, endPool, checkConnection, getPool, upsert } = require('./neon-client');

const { excelDateToJSDate, formatDate, isExcelDate, sheetToJSON, loadExcelFile } = require('../utils/excel-helpers');
const { getQuarterDatesFromKey } = require('../utils/fiscal-calendar');
const { hashValue } = require('../utils/pii-removal');
const { colors, printBanner, printComplete, success, info, error: logError } = require('../utils/formatting');
const { parseArgs } = require('../utils/cli-parser');
const { startAudit, completeAudit } = require('../utils/etl-runner');
const { loadConfig } = require('../utils/config-loader');
const { createResolver, validateHeaders } = require('../utils/column-resolver');
const { loadSchoolLookup, findSchoolId } = require('../utils/school-lookup');
const { autoDetectLargestSheet } = require('../utils/workbook-loader');
const { createErrorHandler, retryWithBackoff, ErrorType } = require('../utils/error-handler');

const config = loadConfig();
const resolve = createResolver('terminations-to-postgres');

const SCRIPT_OPTIONS = [
  { flags: '--input,-i', key: 'input', type: 'string', description: 'Input Excel file path' },
  { flags: '--quarter,-q', key: 'quarter', type: 'string', description: 'Fiscal period (e.g., FY25_Q2)' },
  { flags: '--fiscal-year,--fy', key: 'fiscalYear', type: 'string', description: 'Fiscal year to filter (e.g., 2025)' },
  { flags: '--from-json', key: 'fromJson', type: 'boolean', description: 'Load from JSON instead of Excel' },
  { flags: '--file', key: 'file', type: 'string', description: 'JSON file path (with --from-json)' }
];

const HELP_CONFIG = {
  title: 'Terminations Data ETL to Postgres',
  usage: [
    'node scripts/etl/terminations-to-postgres.js --input file.xlsx --fiscal-year 2025',
    'node scripts/etl/terminations-to-postgres.js --from-json --file cleaned.json --quarter FY25_Q2'
  ]
};

/**
 * Categorize termination type from reason text
 * (Too complex for config - kept in code)
 */
function categorizeTerminationType(reason1, reason2) {
  const reason = (reason1 || reason2 || '').toString().toLowerCase();

  for (const [catName, catDef] of Object.entries(config.termination_reasons.category_keywords)) {
    for (const keyword of catDef.keywords) {
      if (reason.includes(keyword)) {
        return { type: catName, isVoluntary: catDef.is_voluntary };
      }
    }
  }

  return { type: 'voluntary', isVoluntary: true };
}

/**
 * Match raw reason to reason_id using keyword-to-code config
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

  // Try keyword matching from config
  for (const [code, keywords] of Object.entries(config.termination_reasons.keyword_to_code)) {
    for (const kw of keywords) {
      if (reasonLower.includes(kw)) {
        const match = reasonLookup.find(r => r.reason_code === code);
        if (match) return match.reason_id;
      }
    }
  }

  const other = reasonLookup.find(r => r.reason_code === config.termination_reasons.default_code);
  return other?.reason_id || null;
}

/**
 * Calculate tenure and bucket using config-driven buckets
 */
function calculateTenure(hireDate, termDate) {
  if (!hireDate || !termDate) return { years: null, bucket: null };

  const hire = new Date(hireDate);
  const term = new Date(termDate);
  if (isNaN(hire) || isNaN(term)) return { years: null, bucket: null };

  const diffMs = term - hire;
  // Fix: negative tenure = invalid data
  if (diffMs < 0) return { years: null, bucket: null };

  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);

  let bucket = null;
  for (const b of config.tenure_buckets) {
    const maxOk = b.max_years === null || years < b.max_years;
    if (years >= b.min_years && maxOk) {
      bucket = b.label;
      break;
    }
  }

  return { years: Math.round(years * 100) / 100, bucket };
}

/**
 * Process and upsert terminations
 */
async function processTerminations(rows, options, sourceFile) {
  const schoolLookup = await loadSchoolLookup();
  const reasonLookup = await sql`SELECT reason_id, reason_code, reason_label FROM dim_term_reasons`;
  const errorHandler = createErrorHandler('terminations-to-postgres');

  let inserted = 0;
  let updated = 0;
  let errored = 0;
  let skipped = 0;

  // Determine filter dates if needed
  let filterStart, filterEnd;
  if (options.fiscalYear) {
    const fy = parseInt(options.fiscalYear);
    filterStart = new Date(fy - 1, 6, 1);
    filterEnd = new Date(fy, 5, 30);
  } else if (options.quarter) {
    const dates = getQuarterDatesFromKey(options.quarter);
    filterStart = dates.start;
    filterEnd = dates.end;
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      // Get termination date
      let termDateRaw = resolve(row, 'term_date');
      let termDate = termDateRaw;
      if (isExcelDate(termDateRaw)) {
        termDate = formatDate(excelDateToJSDate(termDateRaw));
      }
      if (!termDate) { skipped++; continue; }

      // Filter by date range
      if (filterStart && filterEnd) {
        const termDateObj = new Date(termDate);
        if (termDateObj < filterStart || termDateObj > filterEnd) { skipped++; continue; }
      }

      // Get hire date
      let hireDateRaw = resolve(row, 'hire_date');
      let hireDate = hireDateRaw;
      if (isExcelDate(hireDateRaw)) {
        hireDate = formatDate(excelDateToJSDate(hireDateRaw));
      }

      // Get employee hash - skip rows without employee ID to avoid anonymous hash duplication
      const employeeId = resolve(row, 'employee_id');
      if (!employeeId) { skipped++; continue; }
      const employeeHash = hashValue(employeeId.toString());

      // Get termination reason
      const reason1 = resolve(row, 'term_reason_1');
      const reason2 = resolve(row, 'term_reason_2');
      const { type: termType, isVoluntary } = categorizeTerminationType(reason1, reason2);
      const reasonId = matchReasonId(reason1 || reason2, reasonLookup);

      // Calculate tenure
      const { years: tenureYears, bucket: tenureBucket } = calculateTenure(hireDate, termDate);

      // Get location
      const locationRaw = resolve(row, 'location') || '';
      const location = locationRaw.toString().toLowerCase().includes(config.locations.detection_keyword) ? 'phoenix' : 'omaha';

      // Get school
      const schoolRaw = resolve(row, 'school_terminations') || resolve(row, 'school') || '';
      const schoolId = findSchoolId(schoolRaw, schoolLookup);

      // Get category code
      const categoryCode = (resolve(row, 'assignment_category') || '').toString().toUpperCase() || null;

      // Determine period date
      let periodDate;
      if (options.quarter) {
        periodDate = formatDate(getQuarterDatesFromKey(options.quarter).end);
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

      const result = await retryWithBackoff(() => upsert(getPool(), 'fact_terminations', {
        employee_hash: employeeHash,
        period_date: periodDate,
        termination_date: termDate,
        location,
        school_id: schoolId,
        category_code: categoryCode,
        reason_id: reasonId,
        reason_raw: reason1 || reason2 || 'Unknown',
        termination_type: termType,
        is_voluntary: isVoluntary,
        hire_date: hireDate,
        years_of_service: tenureYears,
        tenure_bucket: tenureBucket,
        source_file: path.basename(sourceFile)
      }, ['employee_hash', 'termination_date']));

      if (result.inserted) { inserted++; } else { updated++; }
    } catch (err) {
      const errorType = errorHandler.handleError(err, row, i);
      errored++;
      if (errorType === ErrorType.FATAL) {
        errorHandler.printErrorReport();
        throw err;
      }
    }
  }

  errorHandler.printErrorReport();
  return { inserted, updated, errored, skipped };
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs('terminations-to-postgres', SCRIPT_OPTIONS, HELP_CONFIG);

  printBanner('Terminations ETL to Postgres');

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
  if (!options.quarter && !options.fiscalYear) {
    logError('Error: Either --quarter or --fiscal-year is required');
    process.exit(1);
  }

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
    const { sheetName } = autoDetectLargestSheet(workbook);
    rows = sheetToJSON(workbook, sheetName);
    success(`Loaded ${rows.length} rows from sheet "${sheetName}"\n`);
  }

  // Validate headers
  const validation = validateHeaders(rows, 'terminations-to-postgres');
  if (!validation.valid) {
    const details = validation.missing
      .map(m => `  ${m.field} (tried: ${m.tried.join(', ')})`)
      .join('\n');
    logError(`Missing required columns for terminations:\n${details}`);
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

  // Start audit log
  const fiscalPeriod = options.quarter || `FY${options.fiscalYear?.toString().slice(-2)}`;
  const periodDate = options.quarter
    ? formatDate(getQuarterDatesFromKey(options.quarter).end)
    : `${options.fiscalYear}-06-30`;

  const loadId = await startAudit({
    loadType: 'terminations',
    sourceFile,
    periodDate,
    fiscalPeriod,
    dryRun: options.dryRun
  });

  // Process terminations
  info(`${options.dryRun ? '[DRY RUN] ' : ''}Processing terminations...`);
  const { inserted, updated, errored, skipped } = await processTerminations(rows, options, sourceFile);

  success('Results:');
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Errors: ${errored}`);
  console.log(`  Skipped (filtered/no date/no ID): ${skipped}\n`);

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
  await completeAudit(loadId, {
    recordsRead: rows.length,
    inserted, updated, errored
  });

  printComplete('Terminations ETL Complete');
  await endPool();
}

main().catch(async err => {
  console.error(`\n${colors.red}Fatal error: ${err.message}${colors.reset}`);
  console.error(err.stack);
  await endPool();
  process.exit(1);
});

module.exports = {
  categorizeTerminationType,
  calculateTenure
};
