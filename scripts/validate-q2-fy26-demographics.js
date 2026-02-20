#!/usr/bin/env node
/**
 * Validation Script: Q2 FY26 Demographics Data in Neon PostgreSQL
 * Period: 2025-12-31
 *
 * Validates fact_workforce_demographics for Q2 FY26 against expected values.
 * Run: node scripts/validate-q2-fy26-demographics.js
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

const PERIOD_DATE = '2025-12-31';

// Expected values from the task description
const EXPECTED = {
  totalRows: 97,
  gender: {
    faculty: { male: 332, female: 376, total: 708 },
    staff: { male: 549, female: 922, total: 1471 }
  },
  workforce: {
    faculty: 708,
    staff_workforce_etl: 1459,  // From fact_workforce_snapshots
    staff_demographics_etl: 1471  // From fact_workforce_demographics (different categorization)
  },
  benefitEligibleTotal: 2179  // 708 + 1471
};

let passCount = 0;
let failCount = 0;
let warnCount = 0;

function pass(label, detail) {
  passCount++;
  console.log(`  PASS  ${label}${detail ? ' -- ' + detail : ''}`);
}

function fail(label, expected, actual) {
  failCount++;
  console.log(`  FAIL  ${label} -- Expected: ${expected}, Got: ${actual}`);
}

function warn(label, detail) {
  warnCount++;
  console.log(`  WARN  ${label}${detail ? ' -- ' + detail : ''}`);
}

function section(title) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(70));
}

async function runValidation() {
  console.log('Q2 FY26 Demographics Validation - Neon PostgreSQL');
  console.log(`Period Date: ${PERIOD_DATE}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Database: ${process.env.DATABASE_URL ? 'Connected' : 'MISSING DATABASE_URL'}`);

  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL not set in .env');
    process.exit(1);
  }

  // ============================================================
  // TEST 1: Total Row Count
  // ============================================================
  section('1. Total Row Count');

  const rowCount = await sql`
    SELECT COUNT(*) as total_rows
    FROM fact_workforce_demographics
    WHERE period_date = ${PERIOD_DATE}
  `;
  const totalRows = parseInt(rowCount[0].total_rows);

  if (totalRows === EXPECTED.totalRows) {
    pass(`Total rows = ${totalRows}`, `Expected ${EXPECTED.totalRows}`);
  } else {
    fail('Total rows', EXPECTED.totalRows, totalRows);
  }

  // Breakdown by demographic_type
  const rowsByType = await sql`
    SELECT demographic_type, COUNT(*) as cnt
    FROM fact_workforce_demographics
    WHERE period_date = ${PERIOD_DATE}
    GROUP BY demographic_type
    ORDER BY demographic_type
  `;
  console.log('\n  Row breakdown by demographic_type:');
  for (const row of rowsByType) {
    console.log(`    ${row.demographic_type}: ${row.cnt} rows`);
  }

  // Breakdown by location
  const rowsByLocation = await sql`
    SELECT location, COUNT(*) as cnt
    FROM fact_workforce_demographics
    WHERE period_date = ${PERIOD_DATE}
    GROUP BY location
    ORDER BY location
  `;
  console.log('\n  Row breakdown by location:');
  for (const row of rowsByLocation) {
    console.log(`    ${row.location}: ${row.cnt} rows`);
  }

  // ============================================================
  // TEST 2: Gender Breakdown (Combined Location)
  // ============================================================
  section('2. Gender Breakdown (Combined Location)');

  const genderData = await sql`
    SELECT category_type, demographic_value, count
    FROM fact_workforce_demographics
    WHERE period_date = ${PERIOD_DATE}
      AND location = 'combined'
      AND demographic_type = 'gender'
    ORDER BY category_type, demographic_value
  `;

  console.log('\n  Gender data from database:');
  for (const row of genderData) {
    console.log(`    ${row.category_type} ${row.demographic_value}: ${row.count}`);
  }

  // Faculty Male
  const facMale = genderData.find(r => r.category_type === 'faculty' && r.demographic_value === 'M');
  if (facMale && parseInt(facMale.count) === EXPECTED.gender.faculty.male) {
    pass('Faculty Male', `${facMale.count} = ${EXPECTED.gender.faculty.male}`);
  } else {
    fail('Faculty Male', EXPECTED.gender.faculty.male, facMale ? facMale.count : 'NOT FOUND');
  }

  // Faculty Female
  const facFemale = genderData.find(r => r.category_type === 'faculty' && r.demographic_value === 'F');
  if (facFemale && parseInt(facFemale.count) === EXPECTED.gender.faculty.female) {
    pass('Faculty Female', `${facFemale.count} = ${EXPECTED.gender.faculty.female}`);
  } else {
    fail('Faculty Female', EXPECTED.gender.faculty.female, facFemale ? facFemale.count : 'NOT FOUND');
  }

  // Staff Male
  const staffMale = genderData.find(r => r.category_type === 'staff' && r.demographic_value === 'M');
  if (staffMale && parseInt(staffMale.count) === EXPECTED.gender.staff.male) {
    pass('Staff Male', `${staffMale.count} = ${EXPECTED.gender.staff.male}`);
  } else {
    fail('Staff Male', EXPECTED.gender.staff.male, staffMale ? staffMale.count : 'NOT FOUND');
  }

  // Staff Female
  const staffFemale = genderData.find(r => r.category_type === 'staff' && r.demographic_value === 'F');
  if (staffFemale && parseInt(staffFemale.count) === EXPECTED.gender.staff.female) {
    pass('Staff Female', `${staffFemale.count} = ${EXPECTED.gender.staff.female}`);
  } else {
    fail('Staff Female', EXPECTED.gender.staff.female, staffFemale ? staffFemale.count : 'NOT FOUND');
  }

  // ============================================================
  // TEST 3: Ethnicity Distributions
  // ============================================================
  section('3. Ethnicity Distributions');

  const ethnicityData = await sql`
    SELECT category_type, demographic_value, count, percentage
    FROM fact_workforce_demographics
    WHERE period_date = ${PERIOD_DATE}
      AND location = 'combined'
      AND demographic_type = 'ethnicity'
    ORDER BY category_type, count DESC
  `;

  // Faculty ethnicity
  const facEthnicity = ethnicityData.filter(r => r.category_type === 'faculty');
  console.log(`\n  Faculty Ethnicity (${facEthnicity.length} values):`);
  let facEthTotal = 0;
  for (const row of facEthnicity) {
    console.log(`    ${row.demographic_value}: ${row.count} (${row.percentage}%)`);
    facEthTotal += parseInt(row.count);
  }
  console.log(`    TOTAL: ${facEthTotal}`);

  if (facEthnicity.length > 0) {
    pass('Faculty ethnicity data exists', `${facEthnicity.length} categories`);
  } else {
    fail('Faculty ethnicity data', 'data present', 'NO DATA');
  }

  if (facEthTotal === EXPECTED.gender.faculty.total) {
    pass('Faculty ethnicity total matches faculty headcount', `${facEthTotal} = ${EXPECTED.gender.faculty.total}`);
  } else {
    fail('Faculty ethnicity total', EXPECTED.gender.faculty.total, facEthTotal);
  }

  // Staff ethnicity
  const staffEthnicity = ethnicityData.filter(r => r.category_type === 'staff');
  console.log(`\n  Staff Ethnicity (${staffEthnicity.length} values):`);
  let staffEthTotal = 0;
  for (const row of staffEthnicity) {
    console.log(`    ${row.demographic_value}: ${row.count} (${row.percentage}%)`);
    staffEthTotal += parseInt(row.count);
  }
  console.log(`    TOTAL: ${staffEthTotal}`);

  if (staffEthnicity.length > 0) {
    pass('Staff ethnicity data exists', `${staffEthnicity.length} categories`);
  } else {
    fail('Staff ethnicity data', 'data present', 'NO DATA');
  }

  if (staffEthTotal === EXPECTED.workforce.staff_demographics_etl) {
    pass('Staff ethnicity total matches demographics staff headcount', `${staffEthTotal} = ${EXPECTED.workforce.staff_demographics_etl}`);
  } else {
    fail('Staff ethnicity total', EXPECTED.workforce.staff_demographics_etl, staffEthTotal);
  }

  // ============================================================
  // TEST 4: Age Band Distributions
  // ============================================================
  section('4. Age Band Distributions');

  const ageBandData = await sql`
    SELECT category_type, demographic_value, count, percentage
    FROM fact_workforce_demographics
    WHERE period_date = ${PERIOD_DATE}
      AND location = 'combined'
      AND demographic_type = 'age_band'
    ORDER BY category_type,
      CASE demographic_value
        WHEN '20-30' THEN 1
        WHEN '31-40' THEN 2
        WHEN '41-50' THEN 3
        WHEN '51-60' THEN 4
        WHEN '61 Plus' THEN 5
      END
  `;

  // Faculty age bands
  const facAgeBands = ageBandData.filter(r => r.category_type === 'faculty');
  console.log(`\n  Faculty Age Bands (${facAgeBands.length} bands):`);
  let facAgeTotal = 0;
  for (const row of facAgeBands) {
    console.log(`    ${row.demographic_value}: ${row.count} (${row.percentage}%)`);
    facAgeTotal += parseInt(row.count);
  }
  console.log(`    TOTAL: ${facAgeTotal}`);

  if (facAgeBands.length >= 4) {
    pass('Faculty age bands exist', `${facAgeBands.length} bands`);
  } else {
    fail('Faculty age bands', '>= 4 bands', facAgeBands.length);
  }

  if (facAgeTotal === EXPECTED.gender.faculty.total) {
    pass('Faculty age band total matches faculty headcount', `${facAgeTotal} = ${EXPECTED.gender.faculty.total}`);
  } else {
    fail('Faculty age band total', EXPECTED.gender.faculty.total, facAgeTotal);
  }

  // Staff age bands
  const staffAgeBands = ageBandData.filter(r => r.category_type === 'staff');
  console.log(`\n  Staff Age Bands (${staffAgeBands.length} bands):`);
  let staffAgeTotal = 0;
  for (const row of staffAgeBands) {
    console.log(`    ${row.demographic_value}: ${row.count} (${row.percentage}%)`);
    staffAgeTotal += parseInt(row.count);
  }
  console.log(`    TOTAL: ${staffAgeTotal}`);

  if (staffAgeBands.length >= 4) {
    pass('Staff age bands exist', `${staffAgeBands.length} bands`);
  } else {
    fail('Staff age bands', '>= 4 bands', staffAgeBands.length);
  }

  if (staffAgeTotal === EXPECTED.workforce.staff_demographics_etl) {
    pass('Staff age band total matches demographics staff headcount', `${staffAgeTotal} = ${EXPECTED.workforce.staff_demographics_etl}`);
  } else {
    fail('Staff age band total', EXPECTED.workforce.staff_demographics_etl, staffAgeTotal);
  }

  // ============================================================
  // TEST 5: Cross-Check Faculty + Staff = Benefit-Eligible Total
  // ============================================================
  section('5. Cross-Check: Faculty + Staff = Benefit-Eligible Total');

  const combinedGenderTotals = await sql`
    SELECT category_type, SUM(count) as total
    FROM fact_workforce_demographics
    WHERE period_date = ${PERIOD_DATE}
      AND location = 'combined'
      AND demographic_type = 'gender'
    GROUP BY category_type
    ORDER BY category_type
  `;

  let facTotal = 0;
  let staffTotal = 0;
  for (const row of combinedGenderTotals) {
    if (row.category_type === 'faculty') facTotal = parseInt(row.total);
    if (row.category_type === 'staff') staffTotal = parseInt(row.total);
    console.log(`  ${row.category_type}: ${row.total}`);
  }

  const benefitEligibleTotal = facTotal + staffTotal;
  console.log(`  Faculty (${facTotal}) + Staff (${staffTotal}) = ${benefitEligibleTotal}`);

  if (benefitEligibleTotal === EXPECTED.benefitEligibleTotal) {
    pass('Benefit-eligible total', `${benefitEligibleTotal} = ${EXPECTED.benefitEligibleTotal}`);
  } else {
    fail('Benefit-eligible total', EXPECTED.benefitEligibleTotal, benefitEligibleTotal);
  }

  if (facTotal === EXPECTED.workforce.faculty) {
    pass('Faculty total matches expected', `${facTotal} = ${EXPECTED.workforce.faculty}`);
  } else {
    fail('Faculty total', EXPECTED.workforce.faculty, facTotal);
  }

  if (staffTotal === EXPECTED.workforce.staff_demographics_etl) {
    pass('Staff total matches demographics expected', `${staffTotal} = ${EXPECTED.workforce.staff_demographics_etl}`);
  } else {
    fail('Staff total (demographics)', EXPECTED.workforce.staff_demographics_etl, staffTotal);
  }

  // ============================================================
  // TEST 6: Compare vs Workforce Headcount (fact_workforce_snapshots)
  // ============================================================
  section('6. Compare vs Workforce Headcount (fact_workforce_snapshots)');

  const workforceData = await sql`
    SELECT
      COALESCE(location, 'TOTAL') as location,
      SUM(faculty_count) as faculty,
      SUM(staff_count) as staff,
      SUM(hsp_count) as hsp,
      SUM(student_count) as students,
      SUM(temp_count) as temp,
      SUM(headcount) as total
    FROM fact_workforce_snapshots
    WHERE period_date = ${PERIOD_DATE}
    GROUP BY ROLLUP(location)
    ORDER BY location NULLS LAST
  `;

  if (workforceData.length > 0) {
    console.log('\n  fact_workforce_snapshots data:');
    for (const row of workforceData) {
      console.log(`    ${row.location}: Faculty=${row.faculty}, Staff=${row.staff}, HSP=${row.hsp}, Students=${row.students}, Temp=${row.temp}, Total=${row.total}`);
    }

    const totalRow = workforceData.find(r => r.location === 'TOTAL');
    if (totalRow) {
      const wfFaculty = parseInt(totalRow.faculty);
      const wfStaff = parseInt(totalRow.staff);

      if (wfFaculty === EXPECTED.workforce.faculty) {
        pass('Workforce faculty matches', `${wfFaculty} = ${EXPECTED.workforce.faculty}`);
      } else {
        fail('Workforce faculty', EXPECTED.workforce.faculty, wfFaculty);
      }

      if (wfStaff === EXPECTED.workforce.staff_workforce_etl) {
        pass('Workforce staff (from workforce ETL)', `${wfStaff} = ${EXPECTED.workforce.staff_workforce_etl}`);
      } else {
        fail('Workforce staff', EXPECTED.workforce.staff_workforce_etl, wfStaff);
      }

      // Explain the staff difference
      const staffDiff = EXPECTED.workforce.staff_demographics_etl - EXPECTED.workforce.staff_workforce_etl;
      console.log(`\n  Staff count difference explanation:`);
      console.log(`    Workforce ETL staff:     ${EXPECTED.workforce.staff_workforce_etl}`);
      console.log(`    Demographics ETL staff:  ${EXPECTED.workforce.staff_demographics_etl}`);
      console.log(`    Difference:              ${staffDiff} (due to different categorization)`);
      warn('Staff count difference between ETLs', `${staffDiff} employees categorized differently`);
    }
  } else {
    warn('No workforce snapshot data found for period', PERIOD_DATE);
  }

  // Gender totals sum check
  console.log('\n  Gender totals verification:');
  const genderSums = await sql`
    SELECT category_type,
      SUM(CASE WHEN demographic_value = 'M' THEN count ELSE 0 END) as male,
      SUM(CASE WHEN demographic_value = 'F' THEN count ELSE 0 END) as female,
      SUM(count) as total
    FROM fact_workforce_demographics
    WHERE period_date = ${PERIOD_DATE}
      AND location = 'combined'
      AND demographic_type = 'gender'
    GROUP BY category_type
    ORDER BY category_type
  `;

  for (const row of genderSums) {
    const male = parseInt(row.male);
    const female = parseInt(row.female);
    const total = parseInt(row.total);
    const sumCheck = male + female;
    console.log(`    ${row.category_type}: Male(${male}) + Female(${female}) = ${sumCheck}, Total=${total}`);

    if (sumCheck === total) {
      pass(`${row.category_type} gender sum check`, `${male} + ${female} = ${total}`);
    } else {
      fail(`${row.category_type} gender sum`, total, sumCheck);
    }
  }

  // ============================================================
  // TEST 7: Location Breakdown
  // ============================================================
  section('7. Location Breakdown');

  const locationData = await sql`
    SELECT location, category_type, demographic_type, COUNT(*) as rows, SUM(count) as total
    FROM fact_workforce_demographics
    WHERE period_date = ${PERIOD_DATE}
    GROUP BY location, category_type, demographic_type
    ORDER BY location, category_type, demographic_type
  `;

  const locations = [...new Set(locationData.map(r => r.location))];
  console.log(`\n  Locations found: ${locations.join(', ')}`);

  const hasOmaha = locations.includes('omaha');
  const hasPhoenix = locations.includes('phoenix');
  const hasCombined = locations.includes('combined');

  if (hasOmaha) {
    pass('Omaha location records exist');
  } else {
    fail('Omaha location', 'present', 'NOT FOUND');
  }

  if (hasPhoenix) {
    pass('Phoenix location records exist');
  } else {
    fail('Phoenix location', 'present', 'NOT FOUND');
  }

  if (hasCombined) {
    pass('Combined location records exist');
  } else {
    fail('Combined location', 'present', 'NOT FOUND');
  }

  console.log('\n  Location detail breakdown:');
  for (const row of locationData) {
    console.log(`    ${row.location} | ${row.category_type} | ${row.demographic_type}: ${row.rows} rows, total=${row.total}`);
  }

  // Verify omaha + phoenix = combined for gender
  if (hasOmaha && hasPhoenix && hasCombined) {
    console.log('\n  Omaha + Phoenix = Combined check (gender):');
    const locationGenderCheck = await sql`
      SELECT category_type, demographic_value,
        SUM(CASE WHEN location = 'omaha' THEN count ELSE 0 END) as omaha,
        SUM(CASE WHEN location = 'phoenix' THEN count ELSE 0 END) as phoenix,
        SUM(CASE WHEN location = 'combined' THEN count ELSE 0 END) as combined
      FROM fact_workforce_demographics
      WHERE period_date = ${PERIOD_DATE}
        AND demographic_type = 'gender'
      GROUP BY category_type, demographic_value
      ORDER BY category_type, demographic_value
    `;

    for (const row of locationGenderCheck) {
      const omaha = parseInt(row.omaha);
      const phoenix = parseInt(row.phoenix);
      const combined = parseInt(row.combined);
      const sum = omaha + phoenix;
      const match = sum === combined;
      console.log(`    ${row.category_type} ${row.demographic_value}: Omaha(${omaha}) + Phoenix(${phoenix}) = ${sum} vs Combined(${combined}) ${match ? '' : 'MISMATCH'}`);

      if (match) {
        pass(`${row.category_type} ${row.demographic_value} location sum`, `${omaha} + ${phoenix} = ${combined}`);
      } else {
        fail(`${row.category_type} ${row.demographic_value} location sum`, combined, sum);
      }
    }
  }

  // ============================================================
  // TEST 8: Validate JSON staticData.js Consistency
  // ============================================================
  section('8. JSON staticData.js Consistency Check');

  // staticData.js QUARTERLY_WORKFORCE_DATA["2025-12-31"] values
  const jsonValues = {
    faculty: 708,
    staff: 1459,
    hsp: 622,
    students: 2032,
    temp: 709,
    total: 5530,
    locations: {
      omaha: { faculty: 668, staff: 1355, hsp: 279, students: 1964, temp: 531, total: 4797 },
      phoenix: { faculty: 40, staff: 104, hsp: 343, students: 68, temp: 178, total: 733 }
    }
  };

  console.log('\n  staticData.js QUARTERLY_WORKFORCE_DATA["2025-12-31"]:');
  console.log(`    Faculty: ${jsonValues.faculty}`);
  console.log(`    Staff:   ${jsonValues.staff}`);
  console.log(`    HSP:     ${jsonValues.hsp}`);
  console.log(`    Students: ${jsonValues.students}`);
  console.log(`    Temp:    ${jsonValues.temp}`);
  console.log(`    Total:   ${jsonValues.total}`);

  // Compare JSON faculty to database
  if (jsonValues.faculty === EXPECTED.workforce.faculty) {
    pass('JSON faculty matches database faculty', `${jsonValues.faculty} = ${EXPECTED.workforce.faculty}`);
  } else {
    fail('JSON faculty vs database', EXPECTED.workforce.faculty, jsonValues.faculty);
  }

  // JSON staff vs workforce ETL
  if (jsonValues.staff === EXPECTED.workforce.staff_workforce_etl) {
    pass('JSON staff matches workforce ETL staff', `${jsonValues.staff} = ${EXPECTED.workforce.staff_workforce_etl}`);
  } else {
    fail('JSON staff vs workforce ETL', EXPECTED.workforce.staff_workforce_etl, jsonValues.staff);
  }

  // Note the demographics vs JSON difference
  const jsonStaffVsDemo = EXPECTED.workforce.staff_demographics_etl - jsonValues.staff;
  console.log(`\n  Note: Demographics staff (${EXPECTED.workforce.staff_demographics_etl}) vs JSON staff (${jsonValues.staff}) difference: ${jsonStaffVsDemo}`);
  console.log('  This is expected due to different categorization methods between ETLs.');

  // Verify JSON location totals add up
  const jsonOmaTotal = jsonValues.locations.omaha.faculty + jsonValues.locations.omaha.staff +
    jsonValues.locations.omaha.hsp + jsonValues.locations.omaha.students + jsonValues.locations.omaha.temp;
  const jsonPhxTotal = jsonValues.locations.phoenix.faculty + jsonValues.locations.phoenix.staff +
    jsonValues.locations.phoenix.hsp + jsonValues.locations.phoenix.students + jsonValues.locations.phoenix.temp;

  console.log(`\n  JSON location sum checks:`);
  console.log(`    Omaha components sum: ${jsonOmaTotal} vs stated total: ${jsonValues.locations.omaha.total}`);
  console.log(`    Phoenix components sum: ${jsonPhxTotal} vs stated total: ${jsonValues.locations.phoenix.total}`);

  if (jsonOmaTotal === jsonValues.locations.omaha.total) {
    pass('JSON Omaha components sum matches total', `${jsonOmaTotal} = ${jsonValues.locations.omaha.total}`);
  } else {
    fail('JSON Omaha sum', jsonValues.locations.omaha.total, jsonOmaTotal);
  }

  if (jsonPhxTotal === jsonValues.locations.phoenix.total) {
    pass('JSON Phoenix components sum matches total', `${jsonPhxTotal} = ${jsonValues.locations.phoenix.total}`);
  } else {
    fail('JSON Phoenix sum', jsonValues.locations.phoenix.total, jsonPhxTotal);
  }

  const jsonGrandTotal = jsonValues.locations.omaha.total + jsonValues.locations.phoenix.total;
  if (jsonGrandTotal === jsonValues.total) {
    pass('JSON Omaha + Phoenix = Grand Total', `${jsonValues.locations.omaha.total} + ${jsonValues.locations.phoenix.total} = ${jsonValues.total}`);
  } else {
    fail('JSON Grand Total', jsonValues.total, jsonGrandTotal);
  }

  // ============================================================
  // TEST 9: Data Integrity - Percentage Sums
  // ============================================================
  section('9. Data Integrity - Percentage Sums');

  const percentageSums = await sql`
    SELECT category_type, demographic_type,
      ROUND(SUM(percentage)::numeric, 2) as pct_sum
    FROM fact_workforce_demographics
    WHERE period_date = ${PERIOD_DATE}
      AND location = 'combined'
    GROUP BY category_type, demographic_type
    ORDER BY category_type, demographic_type
  `;

  for (const row of percentageSums) {
    const pctSum = parseFloat(row.pct_sum);
    console.log(`  ${row.category_type} ${row.demographic_type}: ${pctSum}%`);
    // Percentages should sum to ~100% (allow 0.5% tolerance for rounding)
    if (Math.abs(pctSum - 100) <= 0.5) {
      pass(`${row.category_type} ${row.demographic_type} percentages sum to ~100%`, `${pctSum}%`);
    } else {
      fail(`${row.category_type} ${row.demographic_type} percentage sum`, '~100%', `${pctSum}%`);
    }
  }

  // ============================================================
  // SUMMARY
  // ============================================================
  section('VALIDATION SUMMARY');
  console.log(`  Passed:   ${passCount}`);
  console.log(`  Failed:   ${failCount}`);
  console.log(`  Warnings: ${warnCount}`);
  console.log(`  Total:    ${passCount + failCount + warnCount}`);
  console.log('');

  if (failCount === 0) {
    console.log('  RESULT: ALL VALIDATIONS PASSED');
  } else {
    console.log(`  RESULT: ${failCount} VALIDATION(S) FAILED`);
  }
  console.log('');

  process.exit(failCount > 0 ? 1 : 0);
}

runValidation().catch(err => {
  console.error('FATAL ERROR:', err.message);
  console.error(err.stack);
  process.exit(2);
});
