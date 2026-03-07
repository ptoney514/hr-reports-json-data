#!/usr/bin/env node

/**
 * Exit Surveys Data ETL to Postgres
 *
 * Processes exit survey data and loads to Neon Postgres
 * - Reads from cleaned JSON or Excel
 * - Links to terminations where possible
 * - Extracts numeric scores only (no free text for PII safety)
 * - Upserts to fact_exit_surveys
 *
 * Usage:
 *   node scripts/etl/exit-surveys-to-postgres.js --from-json --file surveys.json --quarter FY25_Q2
 */

const fs = require('fs');
const path = require('path');
const { sql, getPool, upsert } = require('./neon-client');
const { hashValue } = require('../utils/pii-removal');
const { getQuarterDatesFromKey, formatDate } = require('../utils/fiscal-calendar');
const { colors, info, success, error: logError, dryRunPrefix } = require('../utils/formatting');
const { parseArgs } = require('../utils/cli-parser');
const { runETL, startAudit, completeAudit } = require('../utils/etl-runner');
const { resolveColumn } = require('../utils/column-resolver');

const SCRIPT_OPTIONS = [
  { flags: '--input,-i', key: 'input', type: 'string', description: 'Input file path' },
  { flags: '--quarter,-q', key: 'quarter', type: 'string', description: 'Fiscal period (e.g., FY25_Q2)' },
  { flags: '--from-json', key: 'fromJson', type: 'boolean', description: 'Load from JSON' },
  { flags: '--file', key: 'file', type: 'string', description: 'JSON file path' }
];

const HELP_CONFIG = {
  title: 'Exit Surveys ETL to Postgres',
  usage: [
    'node scripts/etl/exit-surveys-to-postgres.js --from-json --file surveys.json --quarter FY25_Q2'
  ]
};

/**
 * Normalize score to 1-5 scale
 */
function normalizeScore(value) {
  if (value === null || value === undefined || value === '') return null;

  const num = parseFloat(value);
  if (isNaN(num)) return null;

  // If already in 1-5 range, use as-is
  if (num >= 1 && num <= 5) return Math.round(num * 100) / 100;

  // If in 0-100 range, convert to 1-5
  if (num >= 0 && num <= 100) return Math.round((num / 20) * 100) / 100;

  return null;
}

/**
 * Extract boolean from various formats
 */
function parseBoolean(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value;

  const str = value.toString().toLowerCase().trim();
  if (['yes', 'true', '1', 'y'].includes(str)) return true;
  if (['no', 'false', '0', 'n'].includes(str)) return false;

  return null;
}

/**
 * Process and upsert exit surveys
 */
async function processExitSurveys(rows, options, sourceFile) {
  let inserted = 0;
  let updated = 0;
  let errored = 0;
  let skipped = 0;

  const periodDate = options.quarter
    ? formatDate(getQuarterDatesFromKey(options.quarter).end)
    : null;

  for (const row of rows) {
    // Get employee ID - skip rows without one to avoid anonymous hash duplication
    const employeeId = resolveColumn(row, 'employee_id_exit_survey');
    if (!employeeId) {
      skipped++;
      continue;
    }
    const employeeHash = hashValue(employeeId.toString());

    // Extract scores using column resolver
    const careerDevelopment = normalizeScore(resolveColumn(row, 'career_development'));
    const managementSupport = normalizeScore(resolveColumn(row, 'management_support'));
    const workLifeBalance = normalizeScore(resolveColumn(row, 'work_life_balance'));
    const compensation = normalizeScore(resolveColumn(row, 'compensation'));
    const benefits = normalizeScore(resolveColumn(row, 'benefits'));
    const jobSatisfaction = normalizeScore(resolveColumn(row, 'job_satisfaction'));
    const overallSatisfaction = normalizeScore(resolveColumn(row, 'overall_satisfaction'));

    // Binary questions
    const wouldRecommend = parseBoolean(resolveColumn(row, 'would_recommend'));
    const conductConcerns = parseBoolean(resolveColumn(row, 'conduct_concerns'));

    // Check if has comments (boolean only, not the text)
    const hasComments = !!(resolveColumn(row, 'has_comments'));

    // Survey date
    const surveyDate = resolveColumn(row, 'survey_date');

    // Try to link to termination
    let terminationId = null;
    if (employeeHash && periodDate) {
      const termMatch = await sql`
        SELECT termination_id FROM fact_terminations
        WHERE employee_hash = ${employeeHash}
        AND period_date = ${periodDate}
        LIMIT 1
      `;
      if (termMatch.length > 0) {
        terminationId = termMatch[0].termination_id;
      }
    }

    if (options.dryRun) {
      console.log(`  [DRY RUN] Would upsert survey: ${employeeHash.substring(0, 8)}... | overall: ${overallSatisfaction}`);
      inserted++;
      continue;
    }

    try {
      const result = await upsert(getPool(), 'fact_exit_surveys', {
        employee_hash: employeeHash,
        period_date: periodDate,
        survey_date: surveyDate,
        termination_id: terminationId,
        career_development: careerDevelopment,
        management_support: managementSupport,
        work_life_balance: workLifeBalance,
        compensation,
        benefits,
        job_satisfaction: jobSatisfaction,
        overall_satisfaction: overallSatisfaction,
        would_recommend: wouldRecommend,
        conduct_concerns: conductConcerns,
        has_comments: hasComments,
        source_file: path.basename(sourceFile)
      }, ['employee_hash', 'period_date'], {
        customSetClauses: {
          termination_id: 'COALESCE(EXCLUDED.termination_id, fact_exit_surveys.termination_id)'
        }
      });

      if (result.inserted) { inserted++; } else { updated++; }
    } catch (err) {
      console.error(`  Error upserting survey: ${err.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored, skipped };
}

const options = parseArgs('exit-surveys-to-postgres', SCRIPT_OPTIONS, HELP_CONFIG);

runETL({
  title: 'Exit Surveys ETL to Postgres',
  loadType: 'exit_surveys',
  dryRun: options.dryRun,
  run: async () => {
    // Validate input
    if (!options.input && !options.fromJson) {
      logError('Error: Either --input or --from-json is required');
      process.exit(1);
    }

    if (!options.quarter) {
      logError('Error: --quarter is required');
      process.exit(1);
    }

    // Load data
    const sourceFile = options.file || options.input;
    info(`Loading: ${sourceFile}`);
    const rows = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
    success(`Loaded ${rows.length} survey responses\n`);

    // Start audit log
    const periodDate = formatDate(getQuarterDatesFromKey(options.quarter).end);
    const loadId = await startAudit({
      loadType: 'exit_surveys',
      sourceFile,
      periodDate,
      fiscalPeriod: options.quarter,
      dryRun: options.dryRun
    });

    // Process surveys
    info(`${dryRunPrefix(options.dryRun)}Processing exit surveys...`);
    const { inserted, updated, errored, skipped } = await processExitSurveys(rows, options, sourceFile);

    console.log(`\n${colors.green}✓${colors.reset} Results:`);
    console.log(`  Inserted: ${inserted}`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Errors: ${errored}`);
    console.log(`  Skipped: ${skipped}\n`);

    await completeAudit(loadId, { recordsRead: rows.length, inserted, updated, errored });

    return { inserted, updated, errored, sourceFile, periodDate, fiscalPeriod: options.quarter };
  }
});
