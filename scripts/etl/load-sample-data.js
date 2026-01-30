#!/usr/bin/env node

/**
 * Load Sample Data from JSON Files to Neon
 *
 * Loads existing JSON data from staticData.js and JSON files into Postgres
 *
 * Usage:
 *   node scripts/etl/load-sample-data.js
 *   node scripts/etl/load-sample-data.js --dry-run
 */

const fs = require('fs');
const path = require('path');
const { sql, endPool, checkConnection, startAuditLog, completeAuditLog } = require('./neon-client');
const { hashValue } = require('../utils/pii-removal');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const isDryRun = process.argv.includes('--dry-run');

/**
 * Load workforce data from staticData.js
 */
async function loadWorkforceData() {
  console.log(`\n${colors.blue}Loading workforce data...${colors.reset}`);

  // Read staticData.js and extract WORKFORCE_DATA
  const staticDataPath = path.join(__dirname, '..', '..', 'src', 'data', 'staticData.js');
  const content = fs.readFileSync(staticDataPath, 'utf-8');

  // Extract the WORKFORCE_DATA object using regex
  const workforceMatch = content.match(/export const WORKFORCE_DATA = ({[\s\S]*?});[\s\n]*(?:export|$)/);
  if (!workforceMatch) {
    console.log(`${colors.yellow}  Could not parse WORKFORCE_DATA from staticData.js${colors.reset}`);
    return { inserted: 0, updated: 0 };
  }

  // Parse the JavaScript object (convert to JSON-compatible format)
  let workforceDataStr = workforceMatch[1]
    .replace(/\/\/.*$/gm, '') // Remove single-line comments
    .replace(/(\w+):/g, '"$1":') // Quote property names
    .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas

  let workforceData;
  try {
    workforceData = eval('(' + workforceMatch[1] + ')');
  } catch (e) {
    console.log(`${colors.yellow}  Could not eval WORKFORCE_DATA: ${e.message}${colors.reset}`);
    return { inserted: 0, updated: 0 };
  }

  let inserted = 0;
  let updated = 0;

  // Process each period
  for (const [periodDate, data] of Object.entries(workforceData)) {
    console.log(`  Processing ${periodDate}...`);

    // Insert aggregate workforce snapshot for Omaha
    if (data.locationDetails?.omaha) {
      const omaha = data.locationDetails.omaha;
      if (!isDryRun) {
        try {
          const result = await sql`
            INSERT INTO fact_workforce_snapshots (
              period_date, location, school_id, category_code,
              headcount, faculty_count, staff_count, hsp_count, student_count, temp_count,
              source_file
            ) VALUES (
              ${periodDate}, 'omaha', NULL, NULL,
              ${data.locations?.["Omaha Campus"] || 0},
              ${omaha.faculty || 0},
              ${omaha.staff || 0},
              ${omaha.hsp || 0},
              ${omaha.students || 0},
              ${omaha.temp || 0},
              'staticData.js'
            )
            ON CONFLICT (period_date, location, school_id, category_code)
            DO UPDATE SET
              headcount = EXCLUDED.headcount,
              faculty_count = EXCLUDED.faculty_count,
              staff_count = EXCLUDED.staff_count,
              hsp_count = EXCLUDED.hsp_count,
              student_count = EXCLUDED.student_count,
              temp_count = EXCLUDED.temp_count,
              loaded_at = NOW()
            RETURNING (xmax = 0) AS is_insert
          `;
          if (result[0]?.is_insert) inserted++;
          else updated++;
        } catch (e) {
          console.log(`    ${colors.red}Error:${colors.reset} ${e.message}`);
        }
      } else {
        console.log(`    [DRY RUN] Would insert Omaha: ${data.locations?.["Omaha Campus"] || 0} employees`);
        inserted++;
      }
    }

    // Insert aggregate workforce snapshot for Phoenix
    if (data.locationDetails?.phoenix) {
      const phoenix = data.locationDetails.phoenix;
      if (!isDryRun) {
        try {
          const result = await sql`
            INSERT INTO fact_workforce_snapshots (
              period_date, location, school_id, category_code,
              headcount, faculty_count, staff_count, hsp_count, student_count, temp_count,
              source_file
            ) VALUES (
              ${periodDate}, 'phoenix', NULL, NULL,
              ${data.locations?.["Phoenix Campus"] || 0},
              ${phoenix.faculty || 0},
              ${phoenix.staff || 0},
              ${phoenix.hsp || 0},
              ${phoenix.students || 0},
              ${phoenix.temp || 0},
              'staticData.js'
            )
            ON CONFLICT (period_date, location, school_id, category_code)
            DO UPDATE SET
              headcount = EXCLUDED.headcount,
              faculty_count = EXCLUDED.faculty_count,
              staff_count = EXCLUDED.staff_count,
              hsp_count = EXCLUDED.hsp_count,
              student_count = EXCLUDED.student_count,
              temp_count = EXCLUDED.temp_count,
              loaded_at = NOW()
            RETURNING (xmax = 0) AS is_insert
          `;
          if (result[0]?.is_insert) inserted++;
          else updated++;
        } catch (e) {
          console.log(`    ${colors.red}Error:${colors.reset} ${e.message}`);
        }
      } else {
        console.log(`    [DRY RUN] Would insert Phoenix: ${data.locations?.["Phoenix Campus"] || 0} employees`);
        inserted++;
      }
    }
  }

  console.log(`  ${colors.green}✓${colors.reset} Workforce: ${inserted} inserted, ${updated} updated`);
  return { inserted, updated };
}

/**
 * Load turnover data from fy25TurnoverData.json
 */
async function loadTurnoverData() {
  console.log(`\n${colors.blue}Loading turnover data...${colors.reset}`);

  const turnoverPath = path.join(__dirname, '..', '..', 'src', 'data', 'fy25TurnoverData.json');
  const turnoverData = JSON.parse(fs.readFileSync(turnoverPath, 'utf-8'));

  let inserted = 0;
  let updated = 0;
  let errored = 0;

  const termReasonMap = {
    'Resigned': 'RESIGN',
    'Retirement': 'RETIRE',
    'End Assignment': 'END_ASSIGNMENT',
    'Better Opportunity': 'RESIGN_OPPORTUNITY',
    'Personal Reasons': 'RESIGN_PERSONAL',
    'Reduction In Force': 'LAYOFF',
    'Reduction in Force': 'LAYOFF',
    'Job Abandonment': 'TERM_CONDUCT',
    'Relocation': 'RESIGN_RELOCATION',
    'Invol - Perfromance': 'TERM_PERFORMANCE',
    'Invol Performance': 'TERM_PERFORMANCE',
    'Going to School': 'RESIGN',
    'Care Family Member': 'RESIGN_PERSONAL',
    'Retirement Ineligble': 'RETIRE',
    'Death': 'DEATH',
    'Not Specified': 'OTHER'
  };

  // Get reason IDs from database
  const reasons = await sql`SELECT reason_id, reason_code FROM dim_term_reasons`;
  const reasonIdMap = {};
  reasons.forEach(r => { reasonIdMap[r.reason_code] = r.reason_id; });

  // Get top term reasons and their counts
  const termReasons = turnoverData.termReasons || {};
  const reasonCounts = Object.entries(termReasons);

  // Quarter date mappings for FY25
  const quarterDates = {
    'Q1': '2024-09-30',
    'Q2': '2024-12-31',
    'Q3': '2025-03-31',
    'Q4': '2025-06-30'
  };

  // Process each quarter's employees
  for (const [quarter, qData] of Object.entries(turnoverData.quarterly || {})) {
    const periodDate = quarterDates[quarter];
    const employees = qData.employees || [];

    console.log(`  Processing FY25 ${quarter}: ${employees.length} terminations...`);

    for (let i = 0; i < employees.length; i++) {
      const employeeId = employees[i];
      const employeeHash = hashValue(employeeId);

      // Simulate termination date within the quarter
      const termDate = periodDate;

      // Assign a reason based on distribution
      let assignedReason = 'RESIGN';
      const rand = Math.random() * 100;
      let cumulative = 0;
      for (const [reason, pct] of Object.entries(turnoverData.termReasonPercentages || {})) {
        cumulative += pct;
        if (rand <= cumulative) {
          assignedReason = termReasonMap[reason] || 'RESIGN';
          break;
        }
      }

      const reasonId = reasonIdMap[assignedReason] || reasonIdMap['RESIGN'];

      // Determine termination type
      let termType = 'voluntary';
      let isVoluntary = true;
      if (assignedReason.startsWith('TERM_') || assignedReason === 'LAYOFF') {
        termType = 'involuntary';
        isVoluntary = false;
      } else if (assignedReason.startsWith('RETIRE')) {
        termType = 'retirement';
      }

      // Assign tenure based on years of service distribution
      let tenureBucket = '1-3yr';
      let yearsOfService = 2;
      const yosRand = Math.random() * 222;
      const yosDist = turnoverData.yearsOfService || {};
      let yosCumulative = 0;
      for (const [bucket, count] of Object.entries(yosDist)) {
        yosCumulative += count;
        if (yosRand <= yosCumulative) {
          tenureBucket = bucket.replace('-', '-').replace('0-1', '<1yr').replace('20+', '10+yr')
            .replace('1-3', '1-3yr').replace('3-5', '3-5yr').replace('5-10', '5-10yr')
            .replace('10-15', '10+yr').replace('15-20', '10+yr');
          // Approximate years
          if (bucket === '0-1') yearsOfService = 0.5;
          else if (bucket === '1-3') yearsOfService = 2;
          else if (bucket === '3-5') yearsOfService = 4;
          else if (bucket === '5-10') yearsOfService = 7;
          else yearsOfService = 15;
          break;
        }
      }

      if (!isDryRun) {
        try {
          const result = await sql`
            INSERT INTO fact_terminations (
              employee_hash, period_date, termination_date,
              location, reason_id, reason_raw, termination_type, is_voluntary,
              years_of_service, tenure_bucket, source_file
            ) VALUES (
              ${employeeHash}, ${periodDate}, ${termDate},
              'omaha', ${reasonId}, ${assignedReason}, ${termType}, ${isVoluntary},
              ${yearsOfService}, ${tenureBucket}, 'fy25TurnoverData.json'
            )
            ON CONFLICT (employee_hash, termination_date)
            DO UPDATE SET
              period_date = EXCLUDED.period_date,
              reason_id = EXCLUDED.reason_id,
              termination_type = EXCLUDED.termination_type,
              is_voluntary = EXCLUDED.is_voluntary,
              years_of_service = EXCLUDED.years_of_service,
              tenure_bucket = EXCLUDED.tenure_bucket,
              loaded_at = NOW()
            RETURNING (xmax = 0) AS is_insert
          `;
          if (result[0]?.is_insert) inserted++;
          else updated++;
        } catch (e) {
          errored++;
        }
      } else {
        inserted++;
      }
    }
  }

  console.log(`  ${colors.green}✓${colors.reset} Turnover: ${inserted} inserted, ${updated} updated, ${errored} errors`);
  return { inserted, updated, errored };
}

/**
 * Load exit survey data from fy25ExitSurveyAnalysis.json
 */
async function loadExitSurveyData() {
  console.log(`\n${colors.blue}Loading exit survey data...${colors.reset}`);

  const surveyPath = path.join(__dirname, '..', '..', 'src', 'data', 'fy25ExitSurveyAnalysis.json');
  const surveyData = JSON.parse(fs.readFileSync(surveyPath, 'utf-8'));

  let inserted = 0;
  let updated = 0;

  const quarterDates = {
    'Q1': '2024-09-30',
    'Q2': '2024-12-31',
    'Q3': '2025-03-31',
    'Q4': '2025-06-30'
  };

  // Process each quarter's survey metrics
  for (const [quarter, metrics] of Object.entries(surveyData.quarterlyMetrics || {})) {
    const periodDate = quarterDates[quarter];
    const responses = metrics.responses || 0;
    const scores = metrics.satisfactionScores || {};

    console.log(`  Processing FY25 ${quarter}: ${responses} survey responses...`);

    // Create synthetic survey records
    for (let i = 0; i < responses; i++) {
      const employeeHash = hashValue(`survey_${quarter}_${i}_${Date.now()}`);

      // Add some variance to scores
      const variance = () => (Math.random() - 0.5) * 0.8;

      const wouldRecommend = Math.random() * 100 < metrics.wouldRecommend;
      const conductConcerns = Math.random() * 100 < metrics.conductConcerns;

      if (!isDryRun) {
        try {
          const result = await sql`
            INSERT INTO fact_exit_surveys (
              employee_hash, period_date,
              career_development, management_support, work_life_balance,
              compensation, benefits, job_satisfaction,
              would_recommend, conduct_concerns, has_comments,
              source_file
            ) VALUES (
              ${employeeHash}, ${periodDate},
              ${Math.max(1, Math.min(5, (scores.careerDevelopment || 2.5) + variance()))},
              ${Math.max(1, Math.min(5, (scores.managementSupport || 2.9) + variance()))},
              ${Math.max(1, Math.min(5, (scores.workLifeBalance || 3.2) + variance()))},
              ${Math.max(1, Math.min(5, (scores.compensation || 2.8) + variance()))},
              ${Math.max(1, Math.min(5, (scores.benefits || 3.4) + variance()))},
              ${Math.max(1, Math.min(5, (scores.jobSatisfaction || 3.2) + variance()))},
              ${wouldRecommend}, ${conductConcerns}, false,
              'fy25ExitSurveyAnalysis.json'
            )
            ON CONFLICT (employee_hash, period_date)
            DO UPDATE SET
              career_development = EXCLUDED.career_development,
              management_support = EXCLUDED.management_support,
              work_life_balance = EXCLUDED.work_life_balance,
              compensation = EXCLUDED.compensation,
              benefits = EXCLUDED.benefits,
              job_satisfaction = EXCLUDED.job_satisfaction,
              would_recommend = EXCLUDED.would_recommend,
              conduct_concerns = EXCLUDED.conduct_concerns,
              loaded_at = NOW()
            RETURNING (xmax = 0) AS is_insert
          `;
          if (result[0]?.is_insert) inserted++;
          else updated++;
        } catch (e) {
          // Skip duplicates silently
        }
      } else {
        inserted++;
      }
    }
  }

  console.log(`  ${colors.green}✓${colors.reset} Exit Surveys: ${inserted} inserted, ${updated} updated`);
  return { inserted, updated };
}

/**
 * Main function
 */
async function main() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}   Load Sample Data to Neon${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);

  if (isDryRun) {
    console.log(`\n${colors.yellow}DRY RUN MODE - No data will be written${colors.reset}`);
  }

  // Check connection
  console.log(`\n${colors.blue}Checking database connection...${colors.reset}`);
  const connected = await checkConnection();
  if (!connected) {
    console.error(`${colors.red}Failed to connect to database.${colors.reset}`);
    process.exit(1);
  }
  console.log(`${colors.green}✓${colors.reset} Connected`);

  // Start audit log
  let loadId = null;
  if (!isDryRun) {
    loadId = await startAuditLog({
      loadType: 'sample_data',
      sourceFile: 'staticData.js + JSON files',
      periodDate: '2025-06-30',
      fiscalPeriod: 'FY25'
    });
  }

  // Load data
  const workforceResult = await loadWorkforceData();
  const turnoverResult = await loadTurnoverData();
  const surveyResult = await loadExitSurveyData();

  // Complete audit log
  if (loadId) {
    await completeAuditLog(loadId, {
      recordsRead: 0,
      recordsInserted: workforceResult.inserted + turnoverResult.inserted + surveyResult.inserted,
      recordsUpdated: workforceResult.updated + turnoverResult.updated + surveyResult.updated,
      recordsErrored: turnoverResult.errored || 0,
      status: 'completed'
    });
  }

  // Verify data
  console.log(`\n${colors.blue}Verifying loaded data...${colors.reset}`);

  const counts = await sql`
    SELECT
      (SELECT COUNT(*) FROM fact_workforce_snapshots) as workforce,
      (SELECT COUNT(*) FROM fact_terminations) as terminations,
      (SELECT COUNT(*) FROM fact_exit_surveys) as surveys
  `;

  console.log(`  fact_workforce_snapshots: ${counts[0].workforce} rows`);
  console.log(`  fact_terminations: ${counts[0].terminations} rows`);
  console.log(`  fact_exit_surveys: ${counts[0].surveys} rows`);

  // Verify FY25 termination count
  const fy25Terms = await sql`
    SELECT COUNT(*) as count FROM fact_terminations
    WHERE period_date >= '2024-07-01' AND period_date <= '2025-06-30'
  `;
  console.log(`\n  ${colors.cyan}FY25 Terminations: ${fy25Terms[0].count} (expected: 222)${colors.reset}`);

  if (parseInt(fy25Terms[0].count) === 222) {
    console.log(`  ${colors.green}✓ Count matches!${colors.reset}`);
  } else {
    console.log(`  ${colors.yellow}! Count differs from expected${colors.reset}`);
  }

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.green}✓ Sample data load complete!${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  await endPool();
}

main().catch(async error => {
  console.error(`\n${colors.red}Fatal error: ${error.message}${colors.reset}`);
  console.error(error.stack);
  await endPool();
  process.exit(1);
});
