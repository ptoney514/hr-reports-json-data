#!/usr/bin/env node

/**
 * Internal Mobility Data ETL to Postgres
 *
 * Processes internal mobility (promotions, transfers, etc.) and loads to Neon Postgres
 * - Reads from cleaned JSON or existing staticData
 * - Categorizes action types
 * - Upserts to fact_mobility_events
 *
 * Usage:
 *   node scripts/etl/mobility-to-postgres.js --from-json --file mobility.json --quarter FY25_Q2
 *   node scripts/etl/mobility-to-postgres.js --from-static --quarter FY25_Q2
 */

const fs = require('fs');
const path = require('path');
const { sql } = require('./neon-client');
const { hashValue } = require('../utils/pii-removal');
const { getQuarterDatesFromKey, formatDate } = require('../utils/fiscal-calendar');
const { colors, info, success, warning, error: logError, dryRunPrefix } = require('../utils/formatting');
const { parseArgs } = require('../utils/cli-parser');
const { runETL, startAudit, completeAudit } = require('../utils/etl-runner');
const { loadSchoolLookup, findSchoolId } = require('../utils/school-lookup');
const { loadConfig } = require('../utils/config-loader');
const { resolveColumn } = require('../utils/column-resolver');

const SCRIPT_OPTIONS = [
  { flags: '--from-json', key: 'fromJson', type: 'boolean', description: 'Load from JSON file' },
  { flags: '--from-static', key: 'fromStatic', type: 'boolean', description: 'Load from existing staticData.js' },
  { flags: '--file', key: 'file', type: 'string', description: 'JSON file path' },
  { flags: '--quarter,-q', key: 'quarter', type: 'string', description: 'Fiscal period (e.g., FY25_Q2)' }
];

const HELP_CONFIG = {
  title: 'Internal Mobility ETL to Postgres',
  usage: [
    'node scripts/etl/mobility-to-postgres.js --from-json --file mobility.json --quarter FY25_Q2',
    'node scripts/etl/mobility-to-postgres.js --from-static --quarter FY25_Q2'
  ]
};

/**
 * Categorize action type from reason/action text using config keywords
 */
function categorizeActionType(action, reason) {
  const combined = ((action || '') + ' ' + (reason || '')).toLowerCase();
  const config = loadConfig();
  const actionKeywords = config.mobility_actions.keyword_to_type;

  for (const [actionType, keywords] of Object.entries(actionKeywords)) {
    for (const keyword of keywords) {
      if (combined.includes(keyword)) return actionType;
    }
  }

  return config.mobility_actions.default_type;
}

/**
 * Process and upsert mobility events
 */
async function processMobilityEvents(rows, options, sourceFile) {
  const schoolLookup = await loadSchoolLookup();

  let inserted = 0;
  let updated = 0;
  let errored = 0;
  let skipped = 0;

  const periodDate = options.quarter
    ? formatDate(getQuarterDatesFromKey(options.quarter).end)
    : null;

  for (const row of rows) {
    // Get employee ID - skip rows without one to avoid anonymous hash duplication
    const employeeId = resolveColumn(row, 'employee_id_mobility');
    if (!employeeId) {
      skipped++;
      continue;
    }
    const employeeHash = hashValue(employeeId.toString());

    // Get effective date
    const effectiveDate = resolveColumn(row, 'effective_date');
    if (!effectiveDate) {
      skipped++;
      continue;
    }

    // Categorize action
    const actionType = categorizeActionType(row.action, row.reason);
    const reasonCode = resolveColumn(row, 'reason_code');

    // Before state
    const beforeSchool = resolveColumn(row, 'before_school');
    const beforeSchoolId = findSchoolId(beforeSchool, schoolLookup);
    const beforeGrade = resolveColumn(row, 'before_grade');
    const beforeJobFamily = resolveColumn(row, 'before_job_family');

    // After state
    const afterSchool = resolveColumn(row, 'after_school');
    const afterSchoolId = findSchoolId(afterSchool, schoolLookup);
    const afterGrade = resolveColumn(row, 'after_grade');
    const afterJobFamily = resolveColumn(row, 'after_job_family');

    // Flags
    const isCrossSchool = beforeSchoolId !== afterSchoolId && beforeSchoolId !== null && afterSchoolId !== null;
    const isCrossDepartment = resolveColumn(row, 'is_cross_department') || false;

    // Grade change calculation
    let gradeChange = null;
    if (beforeGrade && afterGrade) {
      const beforeNum = parseInt(beforeGrade.replace(/\D/g, '')) || 0;
      const afterNum = parseInt(afterGrade.replace(/\D/g, '')) || 0;
      if (beforeNum && afterNum) {
        gradeChange = afterNum - beforeNum;
      }
    }

    if (options.dryRun) {
      console.log(`  [DRY RUN] Would upsert: ${employeeHash.substring(0, 8)}... | ${effectiveDate} | ${actionType}`);
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_mobility_events (
          employee_hash, period_date, effective_date,
          action_type, reason_code,
          before_school_id, before_grade_code, before_job_family,
          after_school_id, after_grade_code, after_job_family,
          is_cross_school, is_cross_department, grade_change,
          source_file
        )
        VALUES (
          ${employeeHash}, ${periodDate}, ${effectiveDate},
          ${actionType}, ${reasonCode},
          ${beforeSchoolId}, ${beforeGrade}, ${beforeJobFamily},
          ${afterSchoolId}, ${afterGrade}, ${afterJobFamily},
          ${isCrossSchool}, ${isCrossDepartment}, ${gradeChange},
          ${path.basename(sourceFile)}
        )
        ON CONFLICT (employee_hash, effective_date, action_type)
        DO UPDATE SET
          period_date = EXCLUDED.period_date,
          reason_code = EXCLUDED.reason_code,
          before_school_id = EXCLUDED.before_school_id,
          before_grade_code = EXCLUDED.before_grade_code,
          before_job_family = EXCLUDED.before_job_family,
          after_school_id = EXCLUDED.after_school_id,
          after_grade_code = EXCLUDED.after_grade_code,
          after_job_family = EXCLUDED.after_job_family,
          is_cross_school = EXCLUDED.is_cross_school,
          is_cross_department = EXCLUDED.is_cross_department,
          grade_change = EXCLUDED.grade_change,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;

      if (result[0]?.inserted) {
        inserted++;
      } else {
        updated++;
      }
    } catch (err) {
      console.error(`  Error upserting mobility event: ${err.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored, skipped };
}

const options = parseArgs('mobility-to-postgres', SCRIPT_OPTIONS, HELP_CONFIG);

runETL({
  title: 'Internal Mobility ETL to Postgres',
  loadType: 'mobility',
  dryRun: options.dryRun,
  run: async () => {
    // Validate input
    if (!options.fromJson && !options.fromStatic) {
      logError('Error: Either --from-json or --from-static is required');
      process.exit(1);
    }

    if (!options.quarter) {
      logError('Error: --quarter is required');
      process.exit(1);
    }

    // Load data
    let rows;
    let sourceFile;

    if (options.fromStatic) {
      const dataPath = path.join(__dirname, '..', '..', 'src', 'data', 'internalMobilityData.js');
      info(`Loading from staticData: ${dataPath}`);

      const content = fs.readFileSync(dataPath, 'utf-8');
      const match = content.match(/export\s+const\s+\w+\s*=\s*(\[[\s\S]*?\]);/);
      if (match) {
        warning('Note: Loading from static data requires manual data extraction');
        rows = [];
      } else {
        rows = [];
      }
      sourceFile = dataPath;
      success(`Would load from static (${rows.length} records)\n`);
    } else {
      sourceFile = options.file;
      info(`Loading JSON: ${sourceFile}`);
      rows = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
      success(`Loaded ${rows.length} mobility events\n`);
    }

    if (rows.length === 0) {
      warning('No mobility events to process.');
      return { inserted: 0, updated: 0, errored: 0, sourceFile, periodDate: null, fiscalPeriod: options.quarter };
    }

    const periodDate = formatDate(getQuarterDatesFromKey(options.quarter).end);
    const loadId = await startAudit({
      loadType: 'mobility',
      sourceFile,
      periodDate,
      fiscalPeriod: options.quarter,
      dryRun: options.dryRun
    });

    info(`${dryRunPrefix(options.dryRun)}Processing mobility events...`);
    const { inserted, updated, errored, skipped } = await processMobilityEvents(rows, options, sourceFile);

    console.log(`\n${colors.green}✓${colors.reset} Results:`);
    console.log(`  Inserted: ${inserted}`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Errors: ${errored}`);
    if (skipped > 0) console.log(`  Skipped (no ID/date): ${skipped}`);
    console.log('');

    await completeAudit(loadId, { recordsRead: rows.length, inserted, updated, errored });

    return { inserted, updated, errored, sourceFile, periodDate, fiscalPeriod: options.quarter };
  }
});
