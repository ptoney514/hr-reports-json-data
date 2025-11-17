#!/usr/bin/env node

/**
 * Calculate FY26 Q1 Exit Survey Response Rate
 *
 * Filters termination data to ONLY benefit-eligible Staff + Faculty
 * Calculates response rates overall and by department
 *
 * Usage: node scripts/calculate-fy26-q1-response-rate.js
 */

const fs = require('fs');
const { parse } = require('csv-parse/sync');

// Configuration
const TERMINATION_CSV = '/Users/pernelltoney/My Projects/01 -production/hr-reports-json-data/source-metrics/terminations/cleaned/FY25_Q4/terminations_cleaned.csv';
const SURVEY_RESPONSES = 15; // From exit survey data

// Exit survey data by department (from staticData.js)
// Mapping both School names and VP Area codes
const SURVEY_RESPONSES_BY_SCHOOL = {
  // Traditional Schools
  'Medicine': 3,                          // School of Medicine
  'Dentistry': 3,                         // School of Dentistry
  'Athletics': 1,                         // Athletics
  // VP Areas / Administrative Units
  'VPSL': 3,                              // Student Life
  'VPIT': 2,                              // Information Technology
  'VPUR': 2,                              // University Relations (1) + University Communications (1)
  'Provost': 1,                           // Center For Faculty Excellence (CFE)
  'SueSucs': 0                            // Student Success (no responses)
};

// Assignment categories to EXCLUDE (not eligible for exit surveys)
const EXCLUDED_CATEGORIES = ['TEMP', 'HSR', 'CWS', 'SUE', 'PRN', 'NBE', 'F09'];

// Employee categories to INCLUDE (benefit-eligible only)
const INCLUDED_EMPLOYEE_TYPES = ['Faculty', 'Staff Exempt', 'Staff Non-Exempt'];

console.log('\n' + '='.repeat(80));
console.log('FY26 Q1 EXIT SURVEY RESPONSE RATE CALCULATION');
console.log('='.repeat(80) + '\n');

// Read termination CSV
console.log(`📂 Reading termination data from: ${TERMINATION_CSV}`);
const content = fs.readFileSync(TERMINATION_CSV, 'utf-8');
const terminationData = parse(content, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  relax_column_count: true
});

console.log(`✓ Loaded ${terminationData.length} total termination records\n`);

// Filter to Q1 FY26 only
const q1fy26Terminations = terminationData.filter(row => {
  return row.Termination_Fiscal_Period === 'Q1 FY26';
});

console.log(`📅 Q1 FY26 Terminations (7/1/25 - 9/30/25): ${q1fy26Terminations.length} total\n`);

// Filter to benefit-eligible only (Staff + Faculty, excluding TEMP/HSR/etc)
const benefitEligibleTerminations = q1fy26Terminations.filter(row => {
  // Must be Staff or Faculty employee category
  const isStaffOrFaculty = INCLUDED_EMPLOYEE_TYPES.includes(row.Employee_Category);

  // Must NOT be in excluded assignment categories
  const notExcluded = !EXCLUDED_CATEGORIES.includes(row.Assignment_Category);

  // Should have Cobra Eligible benefit status (additional safety check)
  const isBenefitEligible = row.Benefit_Program_Description === 'Cobra Eligible';

  return isStaffOrFaculty && notExcluded && isBenefitEligible;
});

console.log(`✅ BENEFIT-ELIGIBLE Terminations (Staff + Faculty only): ${benefitEligibleTerminations.length}\n`);

// Show breakdown of excluded records
const excluded = {
  temp: q1fy26Terminations.filter(r => r.Assignment_Category === 'TEMP').length,
  hsr: q1fy26Terminations.filter(r => r.Assignment_Category === 'HSR').length,
  students: q1fy26Terminations.filter(r => ['CWS', 'SUE'].includes(r.Assignment_Category)).length,
  other: q1fy26Terminations.filter(r => ['PRN', 'NBE', 'F09'].includes(r.Assignment_Category)).length
};

console.log('📊 EXCLUDED FROM EXIT SURVEY DENOMINATOR:');
console.log('─'.repeat(80));
console.log(`  TEMP (Temporary workers):        ${excluded.temp}`);
console.log(`  HSR (House Staff Residents):     ${excluded.hsr}`);
console.log(`  CWS/SUE (Students):              ${excluded.students}`);
console.log(`  PRN/NBE/F09 (Other non-BE):      ${excluded.other}`);
console.log(`  ─────────────────────────────────────`);
console.log(`  Total Excluded:                  ${excluded.temp + excluded.hsr + excluded.students + excluded.other}`);
console.log();

// Calculate overall response rate
const responseRate = Math.round((SURVEY_RESPONSES / benefitEligibleTerminations.length) * 1000) / 10;

console.log('📈 RESPONSE RATE CALCULATION:');
console.log('─'.repeat(80));
console.log(`  Survey Responses:                ${SURVEY_RESPONSES}`);
console.log(`  Benefit-Eligible Terminations:   ${benefitEligibleTerminations.length}`);
console.log(`  Response Rate:                   ${responseRate}%`);
console.log();

// Group by School for department-level response rates
const schoolCounts = {};
benefitEligibleTerminations.forEach(row => {
  const school = row.School || 'Other';
  schoolCounts[school] = (schoolCounts[school] || 0) + 1;
});

// Sort by count descending
const schoolArray = Object.keys(schoolCounts).map(school => ({
  school,
  terminations: schoolCounts[school],
  surveyResponses: SURVEY_RESPONSES_BY_SCHOOL[school] || 0,
  responseRate: SURVEY_RESPONSES_BY_SCHOOL[school]
    ? Math.round((SURVEY_RESPONSES_BY_SCHOOL[school] / schoolCounts[school]) * 1000) / 10
    : 0
})).sort((a, b) => b.terminations - a.terminations);

console.log('🏢 DEPARTMENT-LEVEL RESPONSE RATES (by School):');
console.log('─'.repeat(80));
console.log('School/Department'.padEnd(40) + 'Terms'.padEnd(10) + 'Responses'.padEnd(12) + 'Rate');
console.log('─'.repeat(80));

schoolArray.forEach(dept => {
  const rate = dept.responseRate > 0 ? `${dept.responseRate}%` : '-';
  console.log(
    dept.school.padEnd(40) +
    dept.terminations.toString().padEnd(10) +
    dept.surveyResponses.toString().padEnd(12) +
    rate
  );
});

console.log('─'.repeat(80));
const totalTerms = schoolArray.reduce((sum, d) => sum + d.terminations, 0);
const totalResps = schoolArray.reduce((sum, d) => sum + d.surveyResponses, 0);
console.log(
  'TOTAL'.padEnd(40) +
  totalTerms.toString().padEnd(10) +
  totalResps.toString().padEnd(12) +
  `${Math.round((totalResps / totalTerms) * 1000) / 10}%`
);
console.log();

// Output JSON for staticData.js
console.log('📝 UPDATES FOR staticData.js:');
console.log('─'.repeat(80));
console.log(`\nQ1 FY26 ("2025-09-30") updates:`);
console.log(`  totalExits: ${benefitEligibleTerminations.length},`);
console.log(`  responseRate: ${responseRate},`);
console.log();

console.log('Department response rates (update departmentExits array with actual termination counts):');
console.log('[');
schoolArray.filter(d => d.surveyResponses > 0).forEach((dept, index, array) => {
  const isLast = index === array.length - 1;
  console.log(`  { department: "School of ${dept.school}", exits: ${dept.terminations}, responses: ${dept.surveyResponses}, responseRate: "${dept.responseRate}%" }${isLast ? '' : ','}`);
});
console.log(']');
console.log();

console.log('='.repeat(80) + '\n');

// Export data for further processing
module.exports = {
  totalBenefitEligible: benefitEligibleTerminations.length,
  responseRate,
  schoolBreakdown: schoolArray
};
