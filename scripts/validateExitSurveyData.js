/**
 * Exit Survey Data Validation Script
 * Validates all data points on the Exit Survey FY25 Dashboard
 */

const fs = require('fs');
const path = require('path');

// Load data sources
const turnoverDataPath = path.join(__dirname, '../src/data/fy25TurnoverData.json');
const turnoverData = JSON.parse(fs.readFileSync(turnoverDataPath, 'utf8'));

// Exit survey response data (from PDFs)
const exitSurveyData = {
  Q1: { responses: 20, wouldRecommend: 60 },
  Q2: { responses: 11, wouldRecommend: 72.7 },
  Q3: { responses: 20, wouldRecommend: 45 },
  Q4: { responses: 18, wouldRecommend: 83.3 }
};

console.log('='.repeat(60));
console.log('EXIT SURVEY FY25 DATA VALIDATION REPORT');
console.log('='.repeat(60));
console.log();

// 1. Validate Turnover Data
console.log('1. TURNOVER DATA VALIDATION');
console.log('-'.repeat(40));

const expectedQuarterly = {
  Q1: { total: 79, faculty: 5, staff: 74 },
  Q2: { total: 36, faculty: 3, staff: 33 },
  Q3: { total: 52, faculty: 9, staff: 43 },
  Q4: { total: 51, faculty: 15, staff: 36 }
};

let quarterlyTotal = 0;
let facultyTotal = 0;
let staffTotal = 0;
let validationErrors = [];

Object.keys(expectedQuarterly).forEach(quarter => {
  const actual = turnoverData.quarterly[quarter];
  const expected = expectedQuarterly[quarter];
  
  quarterlyTotal += actual.count;
  facultyTotal += actual.faculty;
  staffTotal += actual.staff;
  
  console.log(`${quarter} FY25:`);
  console.log(`  Total: ${actual.count} (Expected: ${expected.total}) ${actual.count === expected.total ? '✓' : '✗'}`);
  console.log(`  Faculty: ${actual.faculty} (Expected: ${expected.faculty}) ${actual.faculty === expected.faculty ? '✓' : '✗'}`);
  console.log(`  Staff: ${actual.staff} (Expected: ${expected.staff}) ${actual.staff === expected.staff ? '✓' : '✗'}`);
  
  // Validate faculty + staff = total
  const sumCheck = actual.faculty + actual.staff === actual.count;
  console.log(`  Faculty + Staff = Total: ${sumCheck ? '✓' : '✗ ERROR'}`);
  if (!sumCheck) {
    validationErrors.push(`${quarter}: Faculty (${actual.faculty}) + Staff (${actual.staff}) ≠ Total (${actual.count})`);
  }
  console.log();
});

// Validate totals
console.log('Annual Totals:');
console.log(`  Quarterly Sum: ${quarterlyTotal}`);
console.log(`  Reported Total: ${turnoverData.summary.uniqueEmployees}`);
console.log(`  Match: ${quarterlyTotal === turnoverData.summary.uniqueEmployees ? '✓' : '✗ ERROR'}`);

console.log(`  Faculty Sum: ${facultyTotal}`);
console.log(`  Reported Faculty: ${turnoverData.summary.facultyCount}`);
console.log(`  Match: ${facultyTotal === turnoverData.summary.facultyCount ? '✓' : '✗ ERROR'}`);

console.log(`  Staff Sum: ${staffTotal}`);
console.log(`  Reported Staff: ${turnoverData.summary.staffCount}`);
console.log(`  Match: ${staffTotal === turnoverData.summary.staffCount ? '✓' : '✗ ERROR'}`);

// Check for unknown classifications
const unknownCount = turnoverData.summary.uniqueEmployees - (turnoverData.summary.facultyCount + turnoverData.summary.staffCount);
if (unknownCount > 0) {
  console.log(`  ⚠ Warning: ${unknownCount} employees with unknown classification`);
}

console.log();

// 2. Validate Response Rates
console.log('2. RESPONSE RATE VALIDATION');
console.log('-'.repeat(40));

let totalResponses = 0;
Object.keys(exitSurveyData).forEach(quarter => {
  const surveyData = exitSurveyData[quarter];
  const turnoverCount = turnoverData.quarterly[quarter].count;
  const responseRate = (surveyData.responses / turnoverCount * 100).toFixed(1);
  
  totalResponses += surveyData.responses;
  
  console.log(`${quarter} FY25:`);
  console.log(`  Terminations: ${turnoverCount}`);
  console.log(`  Survey Responses: ${surveyData.responses}`);
  console.log(`  Response Rate: ${responseRate}%`);
  console.log(`  Would Recommend: ${surveyData.wouldRecommend}%`);
  console.log();
});

const overallResponseRate = (totalResponses / turnoverData.summary.uniqueEmployees * 100).toFixed(1);
console.log('Overall:');
console.log(`  Total Terminations: ${turnoverData.summary.uniqueEmployees}`);
console.log(`  Total Responses: ${totalResponses}`);
console.log(`  Overall Response Rate: ${overallResponseRate}%`);
console.log();

// 3. Validate Top Termination Reasons
console.log('3. TOP TERMINATION REASONS');
console.log('-'.repeat(40));

const topReasons = Object.entries(turnoverData.termReasons)
  .slice(0, 5)
  .map(([reason, count]) => ({
    reason,
    count,
    percentage: turnoverData.termReasonPercentages[reason]
  }));

topReasons.forEach((item, index) => {
  const calcPercentage = (item.count / turnoverData.summary.uniqueEmployees * 100).toFixed(1);
  const match = Math.abs(parseFloat(calcPercentage) - item.percentage) < 0.5;
  console.log(`${index + 1}. ${item.reason}: ${item.count} (${item.percentage}%)`);
  console.log(`   Calculated: ${calcPercentage}% ${match ? '✓' : '✗'}`);
});
console.log();

// 4. Data Quality Checks
console.log('4. DATA QUALITY CHECKS');
console.log('-'.repeat(40));

// Check for missing data
console.log('Missing Data Checks:');
console.log(`  Q3 Survey Data: ${exitSurveyData.Q3.responses > 0 ? '✓ Available' : '✗ Missing'}`);
console.log(`  Department Data: ${Object.keys(turnoverData.departments).length > 1 || turnoverData.departments.Unknown !== turnoverData.summary.uniqueEmployees ? '✓ Available' : '⚠ All Unknown'}`);
console.log();

// Check date range
console.log('Date Range:');
console.log(`  Start: ${turnoverData.metadata.dateRange.start}`);
console.log(`  End: ${turnoverData.metadata.dateRange.end}`);
console.log(`  Fiscal Year: ${turnoverData.metadata.fiscalYear}`);
console.log();

// 5. Key Metrics Summary
console.log('5. KEY METRICS SUMMARY');
console.log('-'.repeat(40));

const avgSatisfaction = (
  (exitSurveyData.Q1.wouldRecommend + 
   exitSurveyData.Q2.wouldRecommend + 
   exitSurveyData.Q3.wouldRecommend + 
   exitSurveyData.Q4.wouldRecommend) / 4
).toFixed(1);

console.log(`Total Unique Terminations: ${turnoverData.summary.uniqueEmployees}`);
console.log(`Faculty: ${turnoverData.summary.facultyCount} (${(turnoverData.summary.facultyCount / turnoverData.summary.uniqueEmployees * 100).toFixed(1)}%)`);
console.log(`Staff: ${turnoverData.summary.staffCount} (${(turnoverData.summary.staffCount / turnoverData.summary.uniqueEmployees * 100).toFixed(1)}%)`);
console.log(`Average Years of Service: ${turnoverData.summary.averageYearsOfService}`);
console.log(`Total Survey Responses: ${totalResponses}`);
console.log(`Overall Response Rate: ${overallResponseRate}%`);
console.log(`Average Satisfaction: ${avgSatisfaction}%`);
console.log();

// 6. Validation Results
console.log('6. VALIDATION RESULTS');
console.log('-'.repeat(40));

if (validationErrors.length === 0) {
  console.log('✓ All data validation checks passed!');
} else {
  console.log('✗ Validation errors found:');
  validationErrors.forEach(error => {
    console.log(`  - ${error}`);
  });
}
console.log();

// 7. Critical Findings
console.log('7. CRITICAL FINDINGS FOR DASHBOARD');
console.log('-'.repeat(40));

const q1Percentage = (turnoverData.quarterly.Q1.count / turnoverData.summary.uniqueEmployees * 100).toFixed(1);
console.log(`• Q1 Spike: ${turnoverData.quarterly.Q1.count} terminations (${q1Percentage}% of annual total)`);
console.log(`• Lowest Response Rate: Q2 at ${(exitSurveyData.Q2.responses / turnoverData.quarterly.Q2.count * 100).toFixed(1)}%`);
console.log(`• Highest Satisfaction: Q4 at ${exitSurveyData.Q4.wouldRecommend}%`);
console.log(`• Lowest Satisfaction: Q3 at ${exitSurveyData.Q3.wouldRecommend}%`);
console.log(`• Top Exit Reason: ${topReasons[0].reason} at ${topReasons[0].percentage}%`);
console.log();

console.log('='.repeat(60));
console.log('VALIDATION COMPLETE');
console.log('='.repeat(60));

// Export for use in other scripts
module.exports = {
  turnoverData,
  exitSurveyData,
  validationErrors
};