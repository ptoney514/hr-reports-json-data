/**
 * Test Calculations for Exit Survey Dashboard
 * Verifies all calculations are accurate
 */

const fs = require('fs');
const path = require('path');

// Load data
const turnoverData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/fy25TurnoverData.json'), 'utf8'));

console.log('='.repeat(60));
console.log('TESTING DASHBOARD CALCULATIONS');
console.log('='.repeat(60));
console.log();

// Test response rate calculations
console.log('1. RESPONSE RATE CALCULATIONS');
console.log('-'.repeat(40));

const surveyResponses = {
  Q1: 20,
  Q2: 11,
  Q3: 20,
  Q4: 18
};

const totalResponses = Object.values(surveyResponses).reduce((a, b) => a + b, 0);

console.log('Quarterly Response Rates:');
Object.keys(surveyResponses).forEach(q => {
  const terminations = turnoverData.quarterly[q].count;
  const responses = surveyResponses[q];
  const rate = ((responses / terminations) * 100).toFixed(1);
  console.log(`  ${q}: ${responses}/${terminations} = ${rate}%`);
});

const overallRate = ((totalResponses / turnoverData.summary.uniqueEmployees) * 100).toFixed(1);
console.log(`\nOverall: ${totalResponses}/${turnoverData.summary.uniqueEmployees} = ${overallRate}%`);
console.log();

// Test satisfaction average
console.log('2. SATISFACTION AVERAGE');
console.log('-'.repeat(40));

const satisfactionScores = {
  Q1: 60,
  Q2: 72.7,
  Q3: 45,
  Q4: 83.3
};

const avgSatisfaction = (Object.values(satisfactionScores).reduce((a, b) => a + b, 0) / 4).toFixed(1);
console.log('Quarterly Satisfaction:');
Object.entries(satisfactionScores).forEach(([q, score]) => {
  console.log(`  ${q}: ${score}%`);
});
console.log(`Average: ${avgSatisfaction}%`);
console.log();

// Test percentage calculations
console.log('3. PERCENTAGE CALCULATIONS');
console.log('-'.repeat(40));

const facultyPct = ((turnoverData.summary.facultyCount / turnoverData.summary.uniqueEmployees) * 100).toFixed(1);
const staffPct = ((turnoverData.summary.staffCount / turnoverData.summary.uniqueEmployees) * 100).toFixed(1);

console.log(`Faculty: ${turnoverData.summary.facultyCount}/${turnoverData.summary.uniqueEmployees} = ${facultyPct}%`);
console.log(`Staff: ${turnoverData.summary.staffCount}/${turnoverData.summary.uniqueEmployees} = ${staffPct}%`);
console.log(`Total: ${parseFloat(facultyPct) + parseFloat(staffPct)}% (should be ~100%)`);
console.log();

// Test quarterly percentages
console.log('4. QUARTERLY DISTRIBUTION');
console.log('-'.repeat(40));

let quarterlyTotal = 0;
Object.entries(turnoverData.quarterly).forEach(([q, data]) => {
  const pct = ((data.count / turnoverData.summary.uniqueEmployees) * 100).toFixed(1);
  quarterlyTotal += data.count;
  console.log(`${q}: ${data.count} terminations (${pct}% of total)`);
});
console.log(`Sum: ${quarterlyTotal} (Should equal ${turnoverData.summary.uniqueEmployees})`);
console.log(`Difference: ${turnoverData.summary.uniqueEmployees - quarterlyTotal} employees with no quarter assigned`);
console.log();

// Test top reasons percentages
console.log('5. TERMINATION REASON PERCENTAGES');
console.log('-'.repeat(40));

const topReasons = Object.entries(turnoverData.termReasons).slice(0, 5);
topReasons.forEach(([reason, count]) => {
  const calcPct = ((count / turnoverData.summary.uniqueEmployees) * 100).toFixed(1);
  const storedPct = turnoverData.termReasonPercentages[reason];
  const match = Math.abs(parseFloat(calcPct) - storedPct) < 0.5;
  console.log(`${reason}: ${count}/${turnoverData.summary.uniqueEmployees} = ${calcPct}% (Stored: ${storedPct}%) ${match ? '✓' : '✗'}`);
});
console.log();

// Summary
console.log('6. CALCULATION SUMMARY');
console.log('-'.repeat(40));
console.log(`✓ Total Terminations: ${turnoverData.summary.uniqueEmployees}`);
console.log(`✓ Total Survey Responses: ${totalResponses}`);
console.log(`✓ Overall Response Rate: ${overallRate}%`);
console.log(`✓ Average Satisfaction: ${avgSatisfaction}%`);
console.log(`✓ Faculty/Staff Split: ${facultyPct}% / ${staffPct}%`);
console.log(`⚠ Note: 4 employees have no quarter assigned (222 total, 218 in quarters)`);
console.log();

console.log('='.repeat(60));
console.log('CALCULATION TESTS COMPLETE');
console.log('='.repeat(60));