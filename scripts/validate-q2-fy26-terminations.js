#!/usr/bin/env node

/**
 * Q2 FY26 Termination Data Validation Script
 *
 * Validates data loaded into fact_terminations for period_date = '2025-12-31'
 * against expected ETL output values.
 *
 * Checks:
 * 1. Total count (~60 unique terminations)
 * 2. Voluntary/Involuntary/Retirement split (54/3/3)
 * 3. Location split (omaha=54, phoenix=6)
 * 4. Tenure distribution
 * 5. Q2 vs Q1 FY26 comparison
 * 6. Audit trail verification
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function pass(label) {
  return `${colors.green}PASS${colors.reset} ${label}`;
}
function fail(label) {
  return `${colors.red}FAIL${colors.reset} ${label}`;
}
function warn(label) {
  return `${colors.yellow}WARN${colors.reset} ${label}`;
}
function info(label) {
  return `${colors.blue}INFO${colors.reset} ${label}`;
}

const Q2_PERIOD = '2025-12-31';
const Q1_PERIOD = '2025-09-30';

let passCount = 0;
let failCount = 0;
let warnCount = 0;

function check(condition, passMsg, failMsg) {
  if (condition) {
    console.log(`  ${pass(passMsg)}`);
    passCount++;
  } else {
    console.log(`  ${fail(failMsg)}`);
    failCount++;
  }
}

function warning(msg) {
  console.log(`  ${warn(msg)}`);
  warnCount++;
}

async function main() {
  console.log(`\n${colors.cyan}${colors.bold}================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  Q2 FY26 Termination Data Validation${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  Period: ${Q2_PERIOD} (Oct-Dec 2025)${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}================================================${colors.reset}\n`);

  // ========================================
  // 0. Connection Check
  // ========================================
  console.log(`${colors.bold}[0] Database Connection${colors.reset}`);
  try {
    const connTest = await sql`SELECT current_database() AS db, current_user AS usr`;
    console.log(`  ${info(`Connected to "${connTest[0].db}" as "${connTest[0].usr}"`)}`);
  } catch (err) {
    console.error(`  ${fail(`Cannot connect: ${err.message}`)}`);
    process.exit(1);
  }

  // ========================================
  // 1. Total Count
  // ========================================
  console.log(`\n${colors.bold}[1] Total Count Check${colors.reset}`);
  console.log(`  Expected: ~60 unique terminations (63 processed, 3 upsert updates on same employee_hash + termination_date)`);

  const totalResult = await sql`
    SELECT COUNT(*) AS total
    FROM fact_terminations
    WHERE period_date = ${Q2_PERIOD}
  `;
  const totalCount = parseInt(totalResult[0].total);
  console.log(`  Actual:   ${totalCount}`);

  check(
    totalCount === 60,
    `Total count is exactly 60`,
    `Total count is ${totalCount}, expected 60`
  );

  // Also check distinct employee hashes
  const distinctResult = await sql`
    SELECT COUNT(DISTINCT employee_hash) AS distinct_employees
    FROM fact_terminations
    WHERE period_date = ${Q2_PERIOD}
  `;
  const distinctEmployees = parseInt(distinctResult[0].distinct_employees);
  console.log(`  Distinct employee hashes: ${distinctEmployees}`);

  check(
    distinctEmployees === totalCount,
    `All employee_hash values are unique for this period (${distinctEmployees} = ${totalCount})`,
    `Duplicate employee hashes detected: ${distinctEmployees} distinct vs ${totalCount} total`
  );

  // ========================================
  // 2. Voluntary / Involuntary / Retirement Split
  // ========================================
  console.log(`\n${colors.bold}[2] Termination Type Split${colors.reset}`);
  console.log(`  Expected: voluntary=54, involuntary=3, retirement=3`);

  const typeSplit = await sql`
    SELECT
      termination_type,
      COUNT(*) AS cnt
    FROM fact_terminations
    WHERE period_date = ${Q2_PERIOD}
    GROUP BY termination_type
    ORDER BY termination_type
  `;

  const typeMap = {};
  typeSplit.forEach(r => { typeMap[r.termination_type] = parseInt(r.cnt); });

  console.log(`  Actual:   voluntary=${typeMap.voluntary || 0}, involuntary=${typeMap.involuntary || 0}, retirement=${typeMap.retirement || 0}`);

  check(
    typeMap.voluntary === 54,
    `Voluntary count = 54`,
    `Voluntary count = ${typeMap.voluntary || 0}, expected 54`
  );
  check(
    typeMap.involuntary === 3,
    `Involuntary count = 3`,
    `Involuntary count = ${typeMap.involuntary || 0}, expected 3`
  );
  check(
    typeMap.retirement === 3,
    `Retirement count = 3`,
    `Retirement count = ${typeMap.retirement || 0}, expected 3`
  );

  // Verify is_voluntary consistency
  const voluntaryConsistency = await sql`
    SELECT
      termination_type,
      is_voluntary,
      COUNT(*) AS cnt
    FROM fact_terminations
    WHERE period_date = ${Q2_PERIOD}
    GROUP BY termination_type, is_voluntary
    ORDER BY termination_type, is_voluntary
  `;

  console.log(`\n  is_voluntary consistency check:`);
  let voluntaryOk = true;
  voluntaryConsistency.forEach(r => {
    const expected = (r.termination_type === 'voluntary' || r.termination_type === 'retirement');
    const actual = r.is_voluntary;
    const status = (expected === actual) ? colors.green + 'OK' : colors.red + 'MISMATCH';
    console.log(`    ${r.termination_type}: is_voluntary=${r.is_voluntary} (n=${r.cnt}) ${status}${colors.reset}`);
    if (expected !== actual) voluntaryOk = false;
  });

  check(
    voluntaryOk,
    `is_voluntary flag consistent with termination_type`,
    `is_voluntary flag inconsistent with termination_type`
  );

  // ========================================
  // 3. Location Split
  // ========================================
  console.log(`\n${colors.bold}[3] Location Split${colors.reset}`);
  console.log(`  Expected: omaha=54, phoenix=6`);

  const locationSplit = await sql`
    SELECT
      location,
      COUNT(*) AS cnt
    FROM fact_terminations
    WHERE period_date = ${Q2_PERIOD}
    GROUP BY location
    ORDER BY location
  `;

  const locMap = {};
  locationSplit.forEach(r => { locMap[r.location] = parseInt(r.cnt); });

  console.log(`  Actual:   omaha=${locMap.omaha || 0}, phoenix=${locMap.phoenix || 0}`);

  check(
    locMap.omaha === 54,
    `Omaha count = 54`,
    `Omaha count = ${locMap.omaha || 0}, expected 54`
  );
  check(
    locMap.phoenix === 6,
    `Phoenix count = 6`,
    `Phoenix count = ${locMap.phoenix || 0}, expected 6`
  );

  // ========================================
  // 4. Tenure Distribution
  // ========================================
  console.log(`\n${colors.bold}[4] Tenure Distribution${colors.reset}`);
  console.log(`  Expected: <1yr=14, 1-3yr=36 (or extended: 1-3yr=35, 10-15yr=2, 15-20yr=1, 20+yr=3)`);

  const tenureDist = await sql`
    SELECT
      tenure_bucket,
      COUNT(*) AS cnt
    FROM fact_terminations
    WHERE period_date = ${Q2_PERIOD}
    GROUP BY tenure_bucket
    ORDER BY
      CASE tenure_bucket
        WHEN '<1yr' THEN 1
        WHEN '1-3yr' THEN 2
        WHEN '3-5yr' THEN 3
        WHEN '5-10yr' THEN 4
        WHEN '10+yr' THEN 5
        ELSE 6
      END
  `;

  const tenureMap = {};
  tenureDist.forEach(r => { tenureMap[r.tenure_bucket] = parseInt(r.cnt); });

  console.log(`  Actual distribution:`);
  tenureDist.forEach(r => {
    console.log(`    ${r.tenure_bucket || '(null)'}: ${r.cnt}`);
  });

  check(
    tenureMap['<1yr'] === 14,
    `<1yr count = 14`,
    `<1yr count = ${tenureMap['<1yr'] || 0}, expected 14`
  );

  // The ETL uses buckets: <1yr, 1-3yr, 3-5yr, 5-10yr, 10+yr
  // User mentioned extended buckets (10-15yr, 15-20yr, 20+yr) but the schema uses 10+yr
  // So 1-3yr should be 36 or possibly split between 1-3yr and higher buckets
  const totalBucketed = Object.values(tenureMap).reduce((a, b) => a + b, 0);
  console.log(`  Total bucketed: ${totalBucketed}`);

  // Check if 1-3yr is around 35-36
  if (tenureMap['1-3yr'] === 36) {
    check(true, `1-3yr count = 36 (matches simple distribution)`, '');
  } else if (tenureMap['1-3yr'] === 35) {
    console.log(`  ${info('1-3yr = 35, checking for extended distribution...')}`);
    check(true, `1-3yr count = 35 (matches extended distribution)`, '');
  } else {
    check(false, '', `1-3yr count = ${tenureMap['1-3yr'] || 0}, expected 35-36`);
  }

  // Show all buckets beyond <1yr and 1-3yr
  const otherBuckets = Object.entries(tenureMap)
    .filter(([k]) => k !== '<1yr' && k !== '1-3yr')
    .map(([k, v]) => `${k}=${v}`)
    .join(', ');
  if (otherBuckets) {
    console.log(`  Other buckets: ${otherBuckets}`);
  }

  // Tenure statistics
  const tenureStats = await sql`
    SELECT
      MIN(years_of_service) AS min_tenure,
      MAX(years_of_service) AS max_tenure,
      AVG(years_of_service)::NUMERIC(5,2) AS avg_tenure,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY years_of_service) AS median_tenure,
      COUNT(*) FILTER (WHERE years_of_service IS NULL) AS null_tenure
    FROM fact_terminations
    WHERE period_date = ${Q2_PERIOD}
  `;

  console.log(`\n  Tenure statistics:`);
  console.log(`    Min: ${tenureStats[0].min_tenure} years`);
  console.log(`    Max: ${tenureStats[0].max_tenure} years`);
  console.log(`    Avg: ${tenureStats[0].avg_tenure} years`);
  console.log(`    Median: ${parseFloat(tenureStats[0].median_tenure).toFixed(2)} years`);
  console.log(`    Null tenure: ${tenureStats[0].null_tenure}`);

  check(
    parseInt(tenureStats[0].null_tenure) === 0,
    `No null tenure values`,
    `${tenureStats[0].null_tenure} records have null tenure`
  );

  // ========================================
  // 5. Q2 vs Q1 FY26 Comparison
  // ========================================
  console.log(`\n${colors.bold}[5] Q2 vs Q1 FY26 Comparison${colors.reset}`);
  console.log(`  Q1 expected: 73 benefit-eligible terms (including 15 Grade R HSP)`);

  const q1Total = await sql`
    SELECT COUNT(*) AS total
    FROM fact_terminations
    WHERE period_date = ${Q1_PERIOD}
  `;
  const q1Count = parseInt(q1Total[0].total);

  console.log(`  Q1 FY26 (${Q1_PERIOD}): ${q1Count} terminations`);
  console.log(`  Q2 FY26 (${Q2_PERIOD}): ${totalCount} terminations`);

  if (q1Count > 0) {
    const changePercent = (((totalCount - q1Count) / q1Count) * 100).toFixed(1);
    console.log(`  Change: ${changePercent}% (${totalCount - q1Count} difference)`);

    check(
      totalCount < q1Count * 2 && totalCount > q1Count * 0.3,
      `Q2 count (${totalCount}) is within reasonable range vs Q1 (${q1Count})`,
      `Q2 count (${totalCount}) seems unreasonable vs Q1 (${q1Count})`
    );
  } else {
    warning(`No Q1 FY26 data found (period_date = ${Q1_PERIOD})`);
  }

  // Compare type distributions across quarters
  const quarterComparison = await sql`
    SELECT
      period_date,
      termination_type,
      COUNT(*) AS cnt
    FROM fact_terminations
    WHERE period_date IN (${Q1_PERIOD}, ${Q2_PERIOD})
    GROUP BY period_date, termination_type
    ORDER BY period_date, termination_type
  `;

  if (quarterComparison.length > 0) {
    console.log(`\n  Type comparison (Q1 vs Q2):`);
    const qtrMap = {};
    quarterComparison.forEach(r => {
      if (!qtrMap[r.period_date]) qtrMap[r.period_date] = {};
      qtrMap[r.period_date][r.termination_type] = parseInt(r.cnt);
    });

    const types = ['voluntary', 'involuntary', 'retirement'];
    console.log(`    ${'Type'.padEnd(15)} ${'Q1'.padStart(6)} ${'Q2'.padStart(6)}`);
    console.log(`    ${''.padEnd(15, '-')} ${''.padEnd(6, '-')} ${''.padEnd(6, '-')}`);
    types.forEach(t => {
      const q1Val = qtrMap[Q1_PERIOD]?.[t] || 0;
      const q2Val = qtrMap[Q2_PERIOD]?.[t] || 0;
      console.log(`    ${t.padEnd(15)} ${String(q1Val).padStart(6)} ${String(q2Val).padStart(6)}`);
    });
    const q1Sum = Object.values(qtrMap[Q1_PERIOD] || {}).reduce((a, b) => a + b, 0);
    const q2Sum = Object.values(qtrMap[Q2_PERIOD] || {}).reduce((a, b) => a + b, 0);
    console.log(`    ${'TOTAL'.padEnd(15)} ${String(q1Sum).padStart(6)} ${String(q2Sum).padStart(6)}`);
  }

  // Compare location distribution across quarters
  const locationComparison = await sql`
    SELECT
      period_date,
      location,
      COUNT(*) AS cnt
    FROM fact_terminations
    WHERE period_date IN (${Q1_PERIOD}, ${Q2_PERIOD})
    GROUP BY period_date, location
    ORDER BY period_date, location
  `;

  if (locationComparison.length > 0) {
    console.log(`\n  Location comparison (Q1 vs Q2):`);
    const locQtr = {};
    locationComparison.forEach(r => {
      if (!locQtr[r.period_date]) locQtr[r.period_date] = {};
      locQtr[r.period_date][r.location] = parseInt(r.cnt);
    });

    console.log(`    ${'Location'.padEnd(15)} ${'Q1'.padStart(6)} ${'Q2'.padStart(6)}`);
    console.log(`    ${''.padEnd(15, '-')} ${''.padEnd(6, '-')} ${''.padEnd(6, '-')}`);
    ['omaha', 'phoenix'].forEach(loc => {
      const q1Val = locQtr[Q1_PERIOD]?.[loc] || 0;
      const q2Val = locQtr[Q2_PERIOD]?.[loc] || 0;
      console.log(`    ${loc.padEnd(15)} ${String(q1Val).padStart(6)} ${String(q2Val).padStart(6)}`);
    });
  }

  // ========================================
  // 6. Category Code Distribution
  // ========================================
  console.log(`\n${colors.bold}[6] Assignment Category Distribution${colors.reset}`);
  console.log(`  Note: DB stores all 60 terms unfiltered. Source Excel had 64 in date range,`);
  console.log(`  with 39 benefit-eligible after excluding TEMP/SUE/CWS.`);

  const categoryDist = await sql`
    SELECT
      COALESCE(category_code, '(null)') AS category_code,
      COUNT(*) AS cnt
    FROM fact_terminations
    WHERE period_date = ${Q2_PERIOD}
    GROUP BY category_code
    ORDER BY cnt DESC
  `;

  console.log(`\n  Category breakdown:`);
  let benefitEligible = 0;
  let nonBenefitEligible = 0;
  const nonBECodes = ['TEMP', 'SUE', 'CWS', 'NBE', 'PRN'];

  categoryDist.forEach(r => {
    const code = r.category_code;
    const cnt = parseInt(r.cnt);
    const isBE = !nonBECodes.includes(code) && code !== '(null)';
    const marker = isBE ? '' : ' (non-benefit-eligible)';
    console.log(`    ${code.padEnd(10)} ${String(cnt).padStart(4)}${marker}`);
    if (isBE) {
      benefitEligible += cnt;
    } else if (nonBECodes.includes(code)) {
      nonBenefitEligible += cnt;
    }
  });

  console.log(`\n  Benefit-eligible terms: ${benefitEligible}`);
  console.log(`  Non-benefit-eligible terms: ${nonBenefitEligible}`);
  console.log(`  Total: ${benefitEligible + nonBenefitEligible}`);

  // Cross-check: user mentioned 39 benefit-eligible after filtering TEMP=16, SUE=7
  if (benefitEligible > 0) {
    console.log(`\n  Cross-check: Source Excel had 39 benefit-eligible after TEMP/SUE/CWS filtering`);
    if (benefitEligible === 39) {
      check(true, `Benefit-eligible count matches expected 39`, '');
    } else {
      warning(`Benefit-eligible count is ${benefitEligible}, source expectation was 39`);
    }
  }

  // ========================================
  // 7. Termination Date Range Check
  // ========================================
  console.log(`\n${colors.bold}[7] Termination Date Range Check${colors.reset}`);
  console.log(`  Expected: All termination_dates between 2025-10-01 and 2025-12-31 (Q2 FY26)`);

  const dateRange = await sql`
    SELECT
      MIN(termination_date) AS min_date,
      MAX(termination_date) AS max_date,
      COUNT(*) FILTER (WHERE termination_date < '2025-10-01') AS before_range,
      COUNT(*) FILTER (WHERE termination_date > '2025-12-31') AS after_range,
      COUNT(*) FILTER (WHERE termination_date BETWEEN '2025-10-01' AND '2025-12-31') AS in_range
    FROM fact_terminations
    WHERE period_date = ${Q2_PERIOD}
  `;

  console.log(`  Date range: ${dateRange[0].min_date} to ${dateRange[0].max_date}`);
  console.log(`  In range (Oct-Dec 2025): ${dateRange[0].in_range}`);
  console.log(`  Before range: ${dateRange[0].before_range}`);
  console.log(`  After range: ${dateRange[0].after_range}`);

  check(
    parseInt(dateRange[0].before_range) === 0 && parseInt(dateRange[0].after_range) === 0,
    `All termination dates within Q2 FY26 range`,
    `${dateRange[0].before_range} before range, ${dateRange[0].after_range} after range`
  );

  // Monthly distribution within Q2
  const monthlyDist = await sql`
    SELECT
      TO_CHAR(termination_date, 'YYYY-MM') AS month,
      COUNT(*) AS cnt
    FROM fact_terminations
    WHERE period_date = ${Q2_PERIOD}
    GROUP BY TO_CHAR(termination_date, 'YYYY-MM')
    ORDER BY month
  `;

  console.log(`\n  Monthly distribution within Q2:`);
  monthlyDist.forEach(r => {
    console.log(`    ${r.month}: ${r.cnt} terminations`);
  });

  // ========================================
  // 8. Data Quality Checks
  // ========================================
  console.log(`\n${colors.bold}[8] Data Quality Checks${colors.reset}`);

  // Check for null termination_type
  const nullTypes = await sql`
    SELECT COUNT(*) AS cnt
    FROM fact_terminations
    WHERE period_date = ${Q2_PERIOD} AND termination_type IS NULL
  `;
  check(
    parseInt(nullTypes[0].cnt) === 0,
    `No null termination_type values`,
    `${nullTypes[0].cnt} records have null termination_type`
  );

  // Check for null location
  const nullLocations = await sql`
    SELECT COUNT(*) AS cnt
    FROM fact_terminations
    WHERE period_date = ${Q2_PERIOD} AND location IS NULL
  `;
  check(
    parseInt(nullLocations[0].cnt) === 0,
    `No null location values`,
    `${nullLocations[0].cnt} records have null location`
  );

  // Check for null employee_hash
  const nullHashes = await sql`
    SELECT COUNT(*) AS cnt
    FROM fact_terminations
    WHERE period_date = ${Q2_PERIOD} AND employee_hash IS NULL
  `;
  check(
    parseInt(nullHashes[0].cnt) === 0,
    `No null employee_hash values`,
    `${nullHashes[0].cnt} records have null employee_hash`
  );

  // Check for null hire_date (should ideally be populated)
  const nullHireDates = await sql`
    SELECT COUNT(*) AS cnt
    FROM fact_terminations
    WHERE period_date = ${Q2_PERIOD} AND hire_date IS NULL
  `;
  if (parseInt(nullHireDates[0].cnt) > 0) {
    warning(`${nullHireDates[0].cnt} records have null hire_date`);
  } else {
    check(true, `All records have hire_date populated`, '');
  }

  // Check for reason_raw populated
  const nullReasons = await sql`
    SELECT COUNT(*) AS cnt
    FROM fact_terminations
    WHERE period_date = ${Q2_PERIOD} AND (reason_raw IS NULL OR reason_raw = '')
  `;
  if (parseInt(nullReasons[0].cnt) > 0) {
    warning(`${nullReasons[0].cnt} records have null/empty reason_raw`);
  } else {
    check(true, `All records have reason_raw populated`, '');
  }

  // Check source_file is set
  const sourceFiles = await sql`
    SELECT DISTINCT source_file
    FROM fact_terminations
    WHERE period_date = ${Q2_PERIOD}
  `;
  console.log(`\n  Source files: ${sourceFiles.map(r => r.source_file).join(', ')}`);
  check(
    sourceFiles.length > 0 && sourceFiles.every(r => r.source_file),
    `Source file recorded for all records`,
    `Missing source_file in some records`
  );

  // ========================================
  // 9. Audit Trail Check
  // ========================================
  console.log(`\n${colors.bold}[9] Audit Trail${colors.reset}`);

  const auditLogs = await sql`
    SELECT
      load_id,
      load_type,
      source_file,
      period_date,
      fiscal_period,
      records_read,
      records_inserted,
      records_updated,
      records_errored,
      status,
      started_at,
      completed_at
    FROM audit_data_loads
    WHERE load_type = 'terminations'
      AND (period_date = ${Q2_PERIOD} OR fiscal_period LIKE '%Q2%FY26%' OR fiscal_period LIKE '%FY26%Q2%')
    ORDER BY started_at DESC
    LIMIT 5
  `;

  if (auditLogs.length === 0) {
    warning(`No audit log entries found for Q2 FY26 terminations`);

    // Try broader search
    const broaderAudit = await sql`
      SELECT load_id, load_type, period_date, fiscal_period, records_inserted, records_updated, status, started_at
      FROM audit_data_loads
      WHERE load_type = 'terminations'
      ORDER BY started_at DESC
      LIMIT 5
    `;
    if (broaderAudit.length > 0) {
      console.log(`\n  Recent termination audit logs:`);
      broaderAudit.forEach(r => {
        console.log(`    ID=${r.load_id} | period=${r.period_date} | fiscal=${r.fiscal_period} | ins=${r.records_inserted} upd=${r.records_updated} | ${r.status} | ${r.started_at}`);
      });
    }
  } else {
    console.log(`  Found ${auditLogs.length} audit log entries for Q2 FY26:`);
    auditLogs.forEach(r => {
      console.log(`    Load ID: ${r.load_id}`);
      console.log(`      Source: ${r.source_file}`);
      console.log(`      Period: ${r.period_date} (${r.fiscal_period})`);
      console.log(`      Read: ${r.records_read}, Inserted: ${r.records_inserted}, Updated: ${r.records_updated}, Errors: ${r.records_errored}`);
      console.log(`      Status: ${r.status}`);
      console.log(`      Time: ${r.started_at} -> ${r.completed_at}`);
    });

    const latestAudit = auditLogs[0];
    check(
      latestAudit.status === 'completed',
      `Latest load completed successfully`,
      `Latest load status: ${latestAudit.status}`
    );
    check(
      parseInt(latestAudit.records_errored) === 0,
      `No errors in latest load`,
      `${latestAudit.records_errored} errors in latest load`
    );
  }

  // ========================================
  // 10. Reason Distribution (Supplementary)
  // ========================================
  console.log(`\n${colors.bold}[10] Termination Reason Distribution${colors.reset}`);

  const reasonDist = await sql`
    SELECT
      reason_raw,
      termination_type,
      COUNT(*) AS cnt
    FROM fact_terminations
    WHERE period_date = ${Q2_PERIOD}
    GROUP BY reason_raw, termination_type
    ORDER BY cnt DESC
    LIMIT 15
  `;

  console.log(`  Top reasons:`);
  reasonDist.forEach(r => {
    console.log(`    ${String(r.cnt).padStart(4)} | ${r.termination_type.padEnd(12)} | ${r.reason_raw}`);
  });

  // ========================================
  // 11. Cross-Period Totals (All Periods)
  // ========================================
  console.log(`\n${colors.bold}[11] All Periods Overview${colors.reset}`);

  const allPeriods = await sql`
    SELECT
      period_date,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE termination_type = 'voluntary') AS voluntary,
      COUNT(*) FILTER (WHERE termination_type = 'involuntary') AS involuntary,
      COUNT(*) FILTER (WHERE termination_type = 'retirement') AS retirement
    FROM fact_terminations
    GROUP BY period_date
    ORDER BY period_date
  `;

  console.log(`  ${'Period'.padEnd(14)} ${'Total'.padStart(6)} ${'Vol'.padStart(6)} ${'Invol'.padStart(6)} ${'Ret'.padStart(6)}`);
  console.log(`  ${''.padEnd(14, '-')} ${''.padEnd(6, '-')} ${''.padEnd(6, '-')} ${''.padEnd(6, '-')} ${''.padEnd(6, '-')}`);
  allPeriods.forEach(r => {
    const periodStr = r.period_date.toISOString ? r.period_date.toISOString().split('T')[0] : r.period_date;
    const marker = periodStr === Q2_PERIOD ? ' <-- Q2 FY26' : '';
    console.log(`  ${String(periodStr).padEnd(14)} ${String(r.total).padStart(6)} ${String(r.voluntary).padStart(6)} ${String(r.involuntary).padStart(6)} ${String(r.retirement).padStart(6)}${marker}`);
  });

  // ========================================
  // SUMMARY
  // ========================================
  console.log(`\n${colors.cyan}${colors.bold}================================================${colors.reset}`);
  console.log(`${colors.bold}  VALIDATION SUMMARY${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}================================================${colors.reset}`);
  console.log(`  ${colors.green}Passed: ${passCount}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${failCount}${colors.reset}`);
  console.log(`  ${colors.yellow}Warnings: ${warnCount}${colors.reset}`);
  console.log();

  if (failCount === 0) {
    console.log(`  ${colors.green}${colors.bold}ALL VALIDATION CHECKS PASSED${colors.reset}`);
  } else {
    console.log(`  ${colors.red}${colors.bold}${failCount} VALIDATION CHECK(S) FAILED${colors.reset}`);
  }

  console.log(`\n${colors.cyan}${colors.bold}================================================${colors.reset}\n`);

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(`\nFatal error: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
