#!/usr/bin/env node
/**
 * Extract Q2 FY26 demographics (gender, ethnicity, age x gender)
 * for benefit-eligible faculty & staff from the workforce Excel.
 * Uses Person Type for faculty/staff classification (matches workforce methodology).
 */
const { loadExcelFile, sheetToJSON } = require('./utils/excel-helpers');

const wb = loadExcelFile('source-metrics/workforce-headcount/New Emp List since FY20 to Q1FY25 1031 PT 12-9-2025.xlsx');
const rows = sheetToJSON(wb, 'Q2 FY2026');

const activeRows = rows.filter(r => r['END DATE'] === 46022);
const benefitEligible = ['F12', 'F09', 'F10', 'F11', 'PT12', 'PT10', 'PT9', 'PT11'];

const beRows = activeRows.filter(r => {
  const cat = (r['Assignment Category Code'] || '').toUpperCase();
  return benefitEligible.includes(cat);
});

// Classify using Person Type (matches workforce methodology)
const classify = (r) => {
  const pt = (r['Person Type'] || '').trim().toUpperCase();
  return pt === 'FACULTY' ? 'faculty' : 'staff';
};

// Normalize ethnicity to match Q1 FY26 display labels
const normalizeEthnicity = (eth) => {
  if (!eth || eth.trim() === '') return 'Not Disclosed';
  const lower = eth.trim().toLowerCase();
  if (lower === 'not disclosed') return 'Not Disclosed';
  if (lower.includes('hispanic') || lower.includes('latino')) return 'Hispanic or Latino';
  if (lower === 'more than one ethnicity') return 'Two or More Races';
  if (lower === 'two or more races') return 'Two or More Races';
  return eth.trim();
};

// ---- GENDER ----
const genderData = { faculty: { F: 0, M: 0 }, staff: { F: 0, M: 0 } };
beRows.forEach(r => {
  const type = classify(r);
  const gender = (r['Gender'] || '').trim();
  if (gender === 'F' || gender === 'M') genderData[type][gender]++;
});

const facTotal = genderData.faculty.F + genderData.faculty.M;
const staffTotal = genderData.staff.F + genderData.staff.M;

console.log('=== GENDER ===');
console.log('Faculty: F=' + genderData.faculty.F + ' M=' + genderData.faculty.M + ' total=' + facTotal);
console.log('  Female%: ' + (genderData.faculty.F / facTotal * 100).toFixed(1));
console.log('  Male%: ' + (genderData.faculty.M / facTotal * 100).toFixed(1));
console.log('Staff: F=' + genderData.staff.F + ' M=' + genderData.staff.M + ' total=' + staffTotal);
console.log('  Female%: ' + (genderData.staff.F / staffTotal * 100).toFixed(1));
console.log('  Male%: ' + (genderData.staff.M / staffTotal * 100).toFixed(1));

// ---- ETHNICITY (normalized) ----
const ethData = { faculty: {}, staff: {} };
beRows.forEach(r => {
  const type = classify(r);
  const eth = normalizeEthnicity(r['Employee Ethnicity']);
  ethData[type][eth] = (ethData[type][eth] || 0) + 1;
});

console.log('\n=== ETHNICITY (normalized) ===');
console.log('Faculty (' + facTotal + '):');
Object.entries(ethData.faculty).sort((a, b) => b[1] - a[1]).forEach(([e, c]) => {
  console.log('  ' + e + ': ' + c + ' (' + (c / facTotal * 100).toFixed(1) + '%)');
});
console.log('Staff (' + staffTotal + '):');
Object.entries(ethData.staff).sort((a, b) => b[1] - a[1]).forEach(([e, c]) => {
  console.log('  ' + e + ': ' + c + ' (' + (c / staffTotal * 100).toFixed(1) + '%)');
});

// ---- AGE x GENDER ----
const ageGender = { faculty: {}, staff: {} };
beRows.forEach(r => {
  const type = classify(r);
  const gender = (r['Gender'] || '').trim();
  const ageBand = (r['Age Band'] || '').trim();
  if (!ageBand || (gender !== 'F' && gender !== 'M')) return;
  if (!ageGender[type][ageBand]) ageGender[type][ageBand] = { F: 0, M: 0 };
  ageGender[type][ageBand][gender]++;
});

const bandOrder = ['Under 20', '20-30', '31-40', '41-50', '51-60', '61 Plus'];

console.log('\n=== AGE x GENDER ===');
console.log('Faculty:');
bandOrder.forEach(band => {
  const c = ageGender.faculty[band];
  if (c) console.log('  ' + band + ': F=' + c.F + ' M=' + c.M + ' total=' + (c.F + c.M));
});
console.log('Staff:');
bandOrder.forEach(band => {
  const c = ageGender.staff[band];
  if (c) console.log('  ' + band + ': F=' + c.F + ' M=' + c.M + ' total=' + (c.F + c.M));
});
