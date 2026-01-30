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
const { sql, endPool, startAuditLog, completeAuditLog, checkConnection } = require('./neon-client');
const { hashValue } = require('../utils/pii-removal');
const { getQuarterDatesFromKey, formatDate } = require('../utils/fiscal-calendar');

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
    input: null,
    quarter: null,
    fromJson: false,
    file: null,
    dryRun: false
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
      case '--from-json':
        options.fromJson = true;
        break;
      case '--file':
        options.file = args[++i];
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

function printHelp() {
  console.log(`
${colors.cyan}Exit Surveys ETL to Postgres${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node scripts/etl/exit-surveys-to-postgres.js --from-json --file surveys.json --quarter FY25_Q2

${colors.yellow}Options:${colors.reset}
  -i, --input FILE      Input file path
  -q, --quarter PERIOD  Fiscal period (e.g., FY25_Q2)
  --from-json           Load from JSON
  --file FILE           JSON file path
  --dry-run             Preview without database writes
`);
}

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
    // Get employee hash
    const employeeId = row.employee_id || row.employeeId || row['Employee ID'] || row['Empl ID'];
    const employeeHash = employeeId ? hashValue(employeeId.toString()) : `anon_${Date.now()}_${Math.random()}`;

    // Extract scores (handle various column naming conventions)
    const careerDevelopment = normalizeScore(
      row.career_development || row.careerDevelopment || row['Career Development']
    );
    const managementSupport = normalizeScore(
      row.management_support || row.managementSupport || row['Management Support'] || row.supervisor
    );
    const workLifeBalance = normalizeScore(
      row.work_life_balance || row.workLifeBalance || row['Work Life Balance'] || row.balance
    );
    const compensation = normalizeScore(
      row.compensation || row.Compensation || row.salary
    );
    const benefits = normalizeScore(
      row.benefits || row.Benefits
    );
    const jobSatisfaction = normalizeScore(
      row.job_satisfaction || row.jobSatisfaction || row['Job Satisfaction']
    );
    const overallSatisfaction = normalizeScore(
      row.overall || row.Overall || row.overall_satisfaction || row['Overall Satisfaction']
    );

    // Binary questions
    const wouldRecommend = parseBoolean(
      row.would_recommend || row.wouldRecommend || row['Would Recommend'] || row.recommend
    );
    const conductConcerns = parseBoolean(
      row.conduct_concerns || row.conductConcerns || row['Conduct Concerns'] || row.concerns
    );

    // Check if has comments (boolean only, not the text)
    const hasComments = !!(row.comments || row.Comments || row.feedback);

    // Survey date
    const surveyDate = row.survey_date || row.surveyDate || row.date || null;

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
      const result = await sql`
        INSERT INTO fact_exit_surveys (
          employee_hash, period_date, survey_date, termination_id,
          career_development, management_support, work_life_balance,
          compensation, benefits, job_satisfaction, overall_satisfaction,
          would_recommend, conduct_concerns, has_comments,
          source_file
        )
        VALUES (
          ${employeeHash}, ${periodDate}, ${surveyDate}, ${terminationId},
          ${careerDevelopment}, ${managementSupport}, ${workLifeBalance},
          ${compensation}, ${benefits}, ${jobSatisfaction}, ${overallSatisfaction},
          ${wouldRecommend}, ${conductConcerns}, ${hasComments},
          ${path.basename(sourceFile)}
        )
        ON CONFLICT (employee_hash, period_date)
        DO UPDATE SET
          survey_date = EXCLUDED.survey_date,
          termination_id = COALESCE(EXCLUDED.termination_id, fact_exit_surveys.termination_id),
          career_development = EXCLUDED.career_development,
          management_support = EXCLUDED.management_support,
          work_life_balance = EXCLUDED.work_life_balance,
          compensation = EXCLUDED.compensation,
          benefits = EXCLUDED.benefits,
          job_satisfaction = EXCLUDED.job_satisfaction,
          overall_satisfaction = EXCLUDED.overall_satisfaction,
          would_recommend = EXCLUDED.would_recommend,
          conduct_concerns = EXCLUDED.conduct_concerns,
          has_comments = EXCLUDED.has_comments,
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
      console.error(`  Error upserting survey: ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored, skipped };
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs();

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}   Exit Surveys ETL to Postgres${colors.reset}`);
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

  if (!options.quarter) {
    console.error(`${colors.red}Error: --quarter is required${colors.reset}`);
    printHelp();
    process.exit(1);
  }

  // Load data
  const sourceFile = options.file || options.input;
  console.log(`${colors.blue}Loading: ${sourceFile}${colors.reset}`);
  const rows = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
  console.log(`${colors.green}✓${colors.reset} Loaded ${rows.length} survey responses\n`);

  // Start audit log
  const periodDate = formatDate(getQuarterDatesFromKey(options.quarter).end);
  let loadId = null;

  if (!options.dryRun) {
    loadId = await startAuditLog({
      loadType: 'exit_surveys',
      sourceFile: path.basename(sourceFile),
      periodDate,
      fiscalPeriod: options.quarter
    });
    console.log(`${colors.blue}Audit log started (ID: ${loadId})${colors.reset}\n`);
  }

  // Process surveys
  console.log(`${colors.blue}${options.dryRun ? '[DRY RUN] ' : ''}Processing exit surveys...${colors.reset}`);
  const { inserted, updated, errored, skipped } = await processExitSurveys(rows, options, sourceFile);

  console.log(`\n${colors.green}✓${colors.reset} Results:`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Errors: ${errored}`);
  console.log(`  Skipped: ${skipped}\n`);

  // Complete audit log
  if (loadId) {
    await completeAuditLog(loadId, {
      recordsRead: rows.length,
      recordsInserted: inserted,
      recordsUpdated: updated,
      recordsErrored: errored,
      status: 'completed'
    });
  }

  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.green}✓ Exit Surveys ETL Complete${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  await endPool();
}

main().catch(async error => {
  console.error(`\n${colors.red}Fatal error: ${error.message}${colors.reset}`);
  await endPool();
  process.exit(1);
});
