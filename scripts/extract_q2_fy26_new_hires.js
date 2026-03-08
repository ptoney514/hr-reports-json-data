#!/usr/bin/env node
/**
 * Extract Q2 FY26 New Hire Data for Recruiting Dashboard
 * Generates bySchool, byMonth, and demographics data for benefit-eligible Faculty and Staff
 *
 * Methodology: Same as Q1 — benefit-eligible codes, exclude Grade R, dedup by Empl num
 * Uses Person Type for faculty/staff classification (matches workforce methodology)
 *
 * Data Source: Oracle HCM export (New Emp List since FY20 to Q1FY25 1031 PT 12-9-2025.xlsx)
 * Reporting Period: Q2 FY26 (October 1 - December 31, 2025)
 */
const { loadExcelFile, sheetToJSON, excelDateToJSDate } = require('./utils/excel-helpers');

const EXCEL_PATH = 'source-metrics/workforce-headcount/New Emp List since FY20 to Q1FY25 1031 PT 12-9-2025.xlsx';
const SHEET_NAME = 'Q2 FY2026';

// Benefit-eligible assignment categories (per WORKFORCE_METHODOLOGY.md)
const BENEFIT_ELIGIBLE_CODES = ['F12', 'F11', 'F10', 'F09', 'PT12', 'PT11', 'PT10', 'PT9'];

// Q2 FY26 date range
const Q2_START = new Date(2025, 9, 1);   // Oct 1, 2025
const Q2_END = new Date(2025, 11, 31);   // Dec 31, 2025

// Month names for byMonth breakdown
const MONTH_NAMES = ['October 2025', 'November 2025', 'December 2025'];
const MONTH_INDICES = [9, 10, 11]; // 0-indexed months

// Ethnicity color mapping (matches Q1 dashboard)
const ETHNICITY_COLORS = {
  'White': '#3B82F6',
  'Not Disclosed': '#9CA3AF',
  'Asian': '#10B981',
  'Hispanic or Latino': '#F59E0B',
  'Black or African American': '#EF4444',
  'Two or More Races': '#8B5CF6',
  'More than one Ethnicity': '#8B5CF6',
  'Native Hawaiian or Other Pacific Islander': '#06B6D4',
  'American Indian or Alaska Native': '#D97706'
};

// Age band color mapping (matches Q1 dashboard)
const AGE_COLORS = {
  'Under 20': '#06B6D4',
  '21-30': '#3B82F6',
  '20-30': '#3B82F6',
  '31-40': '#10B981',
  '41-50': '#F59E0B',
  '51-60': '#8B5CF6',
  '61+': '#EF4444',
  '61 Plus': '#EF4444'
};

// Normalize age band labels to match Q1 display
function normalizeAgeBand(band) {
  if (!band || band.trim() === '') return null;
  const b = band.trim();
  if (b === '20-30') return '21-30';
  if (b === '61 Plus') return '61+';
  if (b === 'Under 20') return 'Under 20';
  return b;
}

// Normalize ethnicity labels to match Q1 display
function normalizeEthnicity(eth) {
  if (!eth || eth.trim() === '') return 'Not Disclosed';
  const lower = eth.trim().toLowerCase();
  if (lower === 'not disclosed') return 'Not Disclosed';
  if (lower.includes('hispanic') || lower.includes('latino')) return 'Hispanic or Latino';
  if (lower === 'more than one ethnicity') return 'More than one Ethnicity';
  if (lower === 'two or more races') return 'More than one Ethnicity';
  return eth.trim();
}

// Classify employee type based on Person Type
function classify(row) {
  const pt = (row['Person Type'] || '').trim().toUpperCase();
  return pt === 'FACULTY' ? 'faculty' : 'staff';
}

// Normalize location
function normalizeLocation(location) {
  if (!location) return 'Omaha';
  const loc = String(location).trim();
  if (loc.includes('Phoenix') || loc.toUpperCase().includes('PHX')) return 'Phoenix';
  return 'Omaha';
}

console.log('='.repeat(80));
console.log('Q2 FY26 NEW HIRE DATA EXTRACTION');
console.log('='.repeat(80) + '\n');

// Load data
const wb = loadExcelFile(EXCEL_PATH);
const rows = sheetToJSON(wb, SHEET_NAME);
console.log(`Total rows in ${SHEET_NAME}: ${rows.length}`);

// Filter for benefit-eligible
const beRows = rows.filter(r => {
  const cat = (r['Assignment Category Code'] || '').toUpperCase();
  return BENEFIT_ELIGIBLE_CODES.includes(cat);
});
console.log(`Benefit-eligible rows: ${beRows.length}`);

// Exclude Grade R (residents/fellows)
const nonGradeR = beRows.filter(r => {
  const grade = (r['Grade Code'] || '').toString().trim();
  return !grade.startsWith('R');
});
const gradeRExcluded = beRows.length - nonGradeR.length;
if (gradeRExcluded > 0) {
  console.log(`Excluded ${gradeRExcluded} Grade R employees (Residents/Fellows)`);
}

// Filter by hire date in Q2 range
const q2Hires = nonGradeR.filter(r => {
  const hireDateRaw = r['Current Hire Date'];
  if (!hireDateRaw) return false;

  let hireDate;
  if (typeof hireDateRaw === 'number') {
    hireDate = excelDateToJSDate(hireDateRaw);
  } else if (typeof hireDateRaw === 'string') {
    hireDate = new Date(hireDateRaw);
  } else {
    return false;
  }

  if (!hireDate || isNaN(hireDate.getTime())) return false;
  return hireDate >= Q2_START && hireDate <= Q2_END;
});
console.log(`Q2 FY26 hires (Oct-Dec 2025): ${q2Hires.length}`);

// Deduplicate by Empl num
const seen = new Set();
const uniqueHires = q2Hires.filter(r => {
  const id = r['Empl num'];
  if (seen.has(id)) return false;
  seen.add(id);
  return true;
});
console.log(`Unique benefit-eligible new hires: ${uniqueHires.length}`);

// === CLASSIFICATION ===
uniqueHires.forEach(r => {
  r._type = classify(r);
  r._location = normalizeLocation(r['Location']);

  const hireDateRaw = r['Current Hire Date'];
  if (typeof hireDateRaw === 'number') {
    r._hireDate = excelDateToJSDate(hireDateRaw);
  } else {
    r._hireDate = new Date(hireDateRaw);
  }
});

const facultyCount = uniqueHires.filter(r => r._type === 'faculty').length;
const staffCount = uniqueHires.filter(r => r._type === 'staff').length;
const omaCount = uniqueHires.filter(r => r._location === 'Omaha').length;
const phxCount = uniqueHires.filter(r => r._location === 'Phoenix').length;

console.log(`\nSummary: ${uniqueHires.length} total (${facultyCount} faculty, ${staffCount} staff)`);
console.log(`Campus: ${omaCount} Omaha, ${phxCount} Phoenix`);

// === BY SCHOOL ===
const schoolMap = {};
uniqueHires.forEach(r => {
  const school = (r['New School'] || 'Other').trim();
  if (!schoolMap[school]) schoolMap[school] = { faculty: 0, staff: 0 };
  schoolMap[school][r._type]++;
});

const bySchool = Object.entries(schoolMap)
  .map(([school, counts]) => ({
    school,
    faculty: counts.faculty,
    staff: counts.staff,
    total: counts.faculty + counts.staff
  }))
  .sort((a, b) => b.total - a.total);

console.log('\n=== BY SCHOOL ===');
bySchool.forEach(s => console.log(`  ${s.school}: ${s.total} (${s.faculty}F, ${s.staff}S)`));

// === BY MONTH ===
const monthMap = {};
MONTH_NAMES.forEach(m => { monthMap[m] = { faculty: 0, staff: 0 }; });

uniqueHires.forEach(r => {
  if (!r._hireDate) return;
  const monthIdx = r._hireDate.getMonth();
  const idx = MONTH_INDICES.indexOf(monthIdx);
  if (idx >= 0) {
    monthMap[MONTH_NAMES[idx]][r._type]++;
  }
});

const byMonth = MONTH_NAMES.map(month => ({
  month,
  faculty: monthMap[month].faculty,
  staff: monthMap[month].staff,
  total: monthMap[month].faculty + monthMap[month].staff
}));

console.log('\n=== BY MONTH ===');
byMonth.forEach(m => console.log(`  ${m.month}: ${m.total} (${m.faculty}F, ${m.staff}S)`));

// === DEMOGRAPHICS: GENDER ===
let femaleCount = 0, maleCount = 0;
uniqueHires.forEach(r => {
  const gender = (r['Gender'] || '').trim();
  if (gender === 'F') femaleCount++;
  else if (gender === 'M') maleCount++;
});

const total = uniqueHires.length;
const gender = {
  female: femaleCount,
  male: maleCount,
  femalePercentage: Math.round((femaleCount / total) * 1000) / 10,
  malePercentage: Math.round((maleCount / total) * 1000) / 10
};

console.log('\n=== GENDER ===');
console.log(`  Female: ${femaleCount} (${gender.femalePercentage}%)`);
console.log(`  Male: ${maleCount} (${gender.malePercentage}%)`);

// === DEMOGRAPHICS: ETHNICITY ===
const ethMap = {};
uniqueHires.forEach(r => {
  const eth = normalizeEthnicity(r['Employee Ethnicity']);
  ethMap[eth] = (ethMap[eth] || 0) + 1;
});

const ethnicity = Object.entries(ethMap)
  .sort((a, b) => b[1] - a[1])
  .map(([category, count]) => ({
    category,
    count,
    percentage: Math.round((count / total) * 1000) / 10,
    color: ETHNICITY_COLORS[category] || '#6B7280'
  }));

console.log('\n=== ETHNICITY ===');
ethnicity.forEach(e => console.log(`  ${e.category}: ${e.count} (${e.percentage}%)`));

// === DEMOGRAPHICS: AGE DISTRIBUTION ===
const ageMap = {};
uniqueHires.forEach(r => {
  const band = normalizeAgeBand(r['Age Band']);
  if (band) {
    ageMap[band] = (ageMap[band] || 0) + 1;
  }
});

// Sort age bands in logical order
const AGE_ORDER = ['Under 20', '21-30', '31-40', '41-50', '51-60', '61+'];
const ageDistribution = AGE_ORDER
  .filter(band => ageMap[band])
  .map(band => ({
    band,
    count: ageMap[band],
    percentage: Math.round((ageMap[band] / total) * 1000) / 10,
    color: AGE_COLORS[band] || '#6B7280'
  }));

console.log('\n=== AGE DISTRIBUTION ===');
ageDistribution.forEach(a => console.log(`  ${a.band}: ${a.count} (${a.percentage}%)`));

// === OUTPUT ===
console.log('\n' + '='.repeat(80));
console.log('READY TO ADD TO DASHBOARD');
console.log('='.repeat(80));

const output = {
  bySchool,
  byMonth,
  demographics: {
    gender,
    ethnicity,
    ageDistribution
  }
};

console.log('\n// Add these fields to Q2_FY26_DATA in RecruitingQ1FY26Dashboard.jsx:');
console.log(JSON.stringify(output, null, 2));
