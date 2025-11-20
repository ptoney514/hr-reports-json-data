#!/usr/bin/env node

/**
 * Extract Q1 FY26 Workforce Data
 * Filters cleaned workforce data to Q1 FY26 snapshot (2025-09-30)
 * and calculates metrics according to WORKFORCE_METHODOLOGY.md
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

// Paths
const CLEANED_JSON = path.join(__dirname, '../source-metrics/workforce/cleaned/FY26_Q1/workforce_cleaned.json');
const OUTPUT_JSON = path.join(__dirname, '../source-metrics/workforce/cleaned/FY26_Q1/q1_fy26_workforce_snapshot.json');

// Q1 FY26 snapshot date
const Q1_FY26_DATE = '2025-09-30';

console.log(`${colors.cyan}========================================${colors.reset}`);
console.log(`${colors.cyan}  Q1 FY26 Workforce Data Extractor${colors.reset}`);
console.log(`${colors.cyan}========================================${colors.reset}\n`);

// Load cleaned data
console.log(`${colors.cyan}Loading cleaned workforce data...${colors.reset}`);
const cleanedData = JSON.parse(fs.readFileSync(CLEANED_JSON, 'utf-8'));
console.log(`${colors.green}✓${colors.reset} Loaded ${cleanedData.length.toLocaleString()} total records\n`);

// Filter to Q1 FY26 snapshot
console.log(`${colors.cyan}Filtering to Q1 FY26 snapshot (${Q1_FY26_DATE})...${colors.reset}`);
const q1fy26Records = cleanedData.filter(record => {
  const endDate = record['END DATE'] || record['End Date'] || record['endDate'];
  // Handle different date formats
  if (!endDate) return false;

  // Convert date to YYYY-MM-DD format
  let dateStr;
  if (typeof endDate === 'string') {
    if (endDate.includes('/')) {
      // Format: M/D/YYYY or MM/DD/YYYY
      const [month, day, year] = endDate.split('/');
      dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else {
      dateStr = endDate.substring(0, 10); // Handle ISO format
    }
  } else if (typeof endDate === 'number') {
    // Excel serial date - skip for now
    return false;
  }

  return dateStr === Q1_FY26_DATE;
});

console.log(`${colors.green}✓${colors.reset} Found ${q1fy26Records.length.toLocaleString()} Q1 FY26 records\n`);

if (q1fy26Records.length === 0) {
  console.error(`${colors.red}✗ No records found for ${Q1_FY26_DATE}${colors.reset}`);
  console.log(`\nSample date values from dataset:`);
  const sampleDates = [...new Set(cleanedData.slice(0, 100).map(r =>
    r['END DATE'] || r['End Date'] || r['endDate']
  ))].slice(0, 10);
  sampleDates.forEach(date => console.log(`  - ${date}`));
  process.exit(1);
}

// Categorize employees according to WORKFORCE_METHODOLOGY.md
console.log(`${colors.cyan}Categorizing employees by methodology...${colors.reset}`);

const categories = {
  benefitEligibleFaculty: [],
  benefitEligibleStaff: [],
  houseStaffPhysicians: [],
  studentWorkers: [],
  nonBenefitEligible: []
};

const locationBreakdown = {
  omaha: { faculty: 0, staff: 0, hsp: 0, students: 0, temp: 0 },
  phoenix: { faculty: 0, staff: 0, hsp: 0, students: 0, temp: 0 }
};

const assignmentCategoryCount = {};

q1fy26Records.forEach(record => {
  const personType = (record['Person Type'] || record['personType'] || '').toUpperCase();
  const assignmentCategory = (record['Assignment Category Code'] || record['assignmentCategory'] || '').toUpperCase();
  const gradeCode = (record['Grade Code'] || record['grade'] || record['Grade'] || '').toUpperCase();
  const location = (record['Location'] || record['location'] || 'Omaha').toLowerCase();
  const campus = location.includes('phoen') ? 'phoenix' : 'omaha';

  // Count assignment categories
  if (assignmentCategory) {
    assignmentCategoryCount[assignmentCategory] = (assignmentCategoryCount[assignmentCategory] || 0) + 1;
  }

  // Categorize according to WORKFORCE_METHODOLOGY.md (UPDATED 2025-11-19 with Grade R exclusion)

  // 1. House Staff Physicians (HSR code)
  if (assignmentCategory === 'HSR') {
    categories.houseStaffPhysicians.push(record);
    locationBreakdown[campus].hsp++;
  }
  // 2. Student Workers (SUE, CWS codes)
  else if (['SUE', 'CWS'].includes(assignmentCategory)) {
    categories.studentWorkers.push(record);
    locationBreakdown[campus].students++;
  }
  // 3. Non-Benefit Eligible (TEMP, NBE, PRN codes)
  else if (['TEMP', 'NBE', 'PRN'].includes(assignmentCategory)) {
    categories.nonBenefitEligible.push(record);
    locationBreakdown[campus].temp++;
  }
  // 4. EXCLUDE Grade R (Residents/Fellows) - Even if F12/PT12 assignment
  else if (gradeCode && gradeCode.startsWith('R')) {
    // Grade R = Residents/Fellows (PT, OT, Pharmacy) - NOT benefit-eligible
    categories.nonBenefitEligible.push(record);
    locationBreakdown[campus].temp++;
  }
  // 5. Benefit-Eligible (F and PT codes, EXCLUDING Grade R) - Use Person Type to determine Staff vs Faculty
  else if (['F12', 'F11', 'F10', 'F09', 'PT12', 'PT11', 'PT10', 'PT9'].includes(assignmentCategory)) {
    if (personType === 'FACULTY') {
      categories.benefitEligibleFaculty.push(record);
      locationBreakdown[campus].faculty++;
    } else if (personType === 'STAFF') {
      categories.benefitEligibleStaff.push(record);
      locationBreakdown[campus].staff++;
    } else {
      // Unknown person type - categorize as Other for now
      categories.nonBenefitEligible.push(record);
      locationBreakdown[campus].temp++;
    }
  } else {
    // Unknown assignment category
    categories.nonBenefitEligible.push(record);
    locationBreakdown[campus].temp++;
  }
});

console.log(`${colors.green}✓${colors.reset} Categorization complete\n`);

// Calculate summary metrics
const summary = {
  total: {
    count: q1fy26Records.length,
    oma: locationBreakdown.omaha.faculty + locationBreakdown.omaha.staff +
         locationBreakdown.omaha.hsp + locationBreakdown.omaha.students + locationBreakdown.omaha.temp,
    phx: locationBreakdown.phoenix.faculty + locationBreakdown.phoenix.staff +
         locationBreakdown.phoenix.hsp + locationBreakdown.phoenix.students + locationBreakdown.phoenix.temp
  },
  faculty: {
    count: categories.benefitEligibleFaculty.length,
    oma: locationBreakdown.omaha.faculty,
    phx: locationBreakdown.phoenix.faculty
  },
  staff: {
    count: categories.benefitEligibleStaff.length,
    oma: locationBreakdown.omaha.staff,
    phx: locationBreakdown.phoenix.staff
  },
  houseStaffPhysicians: {
    count: categories.houseStaffPhysicians.length,
    oma: locationBreakdown.omaha.hsp,
    phx: locationBreakdown.phoenix.hsp
  },
  studentWorkers: {
    count: categories.studentWorkers.length,
    oma: locationBreakdown.omaha.students,
    phx: locationBreakdown.phoenix.students
  },
  temporary: {
    count: categories.nonBenefitEligible.length,
    oma: locationBreakdown.omaha.temp,
    phx: locationBreakdown.phoenix.temp
  }
};

// Display results
console.log(`${colors.cyan}Q1 FY26 Workforce Summary:${colors.reset}`);
console.log(`  Total: ${summary.total.count.toLocaleString()} (OMA: ${summary.total.oma.toLocaleString()}, PHX: ${summary.total.phx.toLocaleString()})`);
console.log(`  Benefit-Eligible Faculty: ${summary.faculty.count.toLocaleString()} (OMA: ${summary.faculty.oma.toLocaleString()}, PHX: ${summary.faculty.phx.toLocaleString()})`);
console.log(`  Benefit-Eligible Staff: ${summary.staff.count.toLocaleString()} (OMA: ${summary.staff.oma.toLocaleString()}, PHX: ${summary.staff.phx.toLocaleString()})`);
console.log(`  House Staff Physicians: ${summary.houseStaffPhysicians.count.toLocaleString()} (OMA: ${summary.houseStaffPhysicians.oma.toLocaleString()}, PHX: ${summary.houseStaffPhysicians.phx.toLocaleString()})`);
console.log(`  Student Workers: ${summary.studentWorkers.count.toLocaleString()} (OMA: ${summary.studentWorkers.oma.toLocaleString()}, PHX: ${summary.studentWorkers.phx.toLocaleString()})`);
console.log(`  Temporary/Non-Benefit: ${summary.temporary.count.toLocaleString()} (OMA: ${summary.temporary.oma.toLocaleString()}, PHX: ${summary.temporary.phx.toLocaleString()})\n`);

console.log(`${colors.cyan}Assignment Category Breakdown:${colors.reset}`);
Object.entries(assignmentCategoryCount)
  .sort((a, b) => b[1] - a[1])
  .forEach(([category, count]) => {
    console.log(`  ${category}: ${count.toLocaleString()}`);
  });

// Prepare output data
const outputData = {
  reportingDate: '9/30/25',
  quarter: 'Q1 FY26',
  fiscalPeriod: 'July 2025 - September 2025',
  summary,
  employeeGroups: [
    {
      group: "Benefit-Eligible Faculty",
      faculty: summary.faculty.count,
      staff: 0,
      hsp: 0,
      students: 0,
      total: summary.faculty.count
    },
    {
      group: "Benefit-Eligible Staff",
      faculty: 0,
      staff: summary.staff.count,
      hsp: 0,
      students: 0,
      total: summary.staff.count
    },
    {
      group: "House Staff Physicians",
      faculty: 0,
      staff: 0,
      hsp: summary.houseStaffPhysicians.count,
      students: 0,
      total: summary.houseStaffPhysicians.count
    },
    {
      group: "Student Workers",
      faculty: 0,
      staff: 0,
      hsp: 0,
      students: summary.studentWorkers.count,
      total: summary.studentWorkers.count
    },
    {
      group: "Temporary Employees",
      faculty: 0,
      staff: 0,
      hsp: 0,
      students: 0,
      total: summary.temporary.count
    }
  ],
  locationDetails: {
    omaha: {
      faculty: locationBreakdown.omaha.faculty,
      staff: locationBreakdown.omaha.staff,
      hsp: locationBreakdown.omaha.hsp,
      students: locationBreakdown.omaha.students,
      temp: locationBreakdown.omaha.temp,
      total: summary.total.oma
    },
    phoenix: {
      faculty: locationBreakdown.phoenix.faculty,
      staff: locationBreakdown.phoenix.staff,
      hsp: locationBreakdown.phoenix.hsp,
      students: locationBreakdown.phoenix.students,
      temp: locationBreakdown.phoenix.temp,
      total: summary.total.phx
    }
  },
  assignmentCategories: assignmentCategoryCount
};

// Save output
console.log(`\n${colors.cyan}Saving Q1 FY26 snapshot data...${colors.reset}`);
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(outputData, null, 2));
console.log(`${colors.green}✓${colors.reset} Saved to: ${OUTPUT_JSON}\n`);

console.log(`${colors.cyan}========================================${colors.reset}`);
console.log(`${colors.green}✓ Extraction Complete${colors.reset}`);
console.log(`${colors.cyan}========================================${colors.reset}\n`);

console.log(`${colors.yellow}Next steps:${colors.reset}`);
console.log(`  1. Review snapshot data: q1_fy26_workforce_snapshot.json`);
console.log(`  2. Update QUARTERLY_WORKFORCE_DATA in staticData.js`);
console.log(`  3. Run tests to validate data`);
console.log(`  4. Update dashboard component\n`);
