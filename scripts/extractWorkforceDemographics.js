#!/usr/bin/env node

/**
 * Extract Workforce Demographics Script
 * 
 * This script extracts demographic data (gender, ethnicity, age) for benefit eligible
 * employees from the Excel workforce data file and formats it for staticData.js
 * 
 * Usage: node scripts/extractWorkforceDemographics.js
 */

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Configuration
const INPUT_FILE = path.join(__dirname, '../source-metrics/workforce-headcount/New Emp List since FY20 to Q1FY25 1031 PT.xlsx');
const OUTPUT_FILE = path.join(__dirname, '../src/data/workforce-demographics.json');

// Excel serial date for 6/30/2025
const JUNE_30_2025 = 45838;

// Benefit eligible categories (excludes HSPs)
const BENEFIT_ELIGIBLE_CATEGORIES = ['F12', 'F11', 'F09', 'F10', 'PT12', 'PT9', 'PT11', 'PT10'];

function extractDemographics() {
  console.log('====================================');
  console.log('Workforce Demographics Extraction');
  console.log('====================================\n');
  
  try {
    // Read the Excel file
    console.log(`Reading Excel file: ${path.basename(INPUT_FILE)}`);
    const workbook = XLSX.readFile(INPUT_FILE);
    
    // Get the main data sheet
    const sheet1 = workbook.Sheets['Sheet1'];
    const allData = XLSX.utils.sheet_to_json(sheet1);
    
    console.log(`Total rows in Excel: ${allData.length.toLocaleString()}`);
    
    // Filter for employees with END DATE = 6/30/2025
    const currentEmployees = allData.filter(row => row['END DATE'] === JUNE_30_2025);
    console.log(`Employees as of 6/30/2025: ${currentEmployees.length.toLocaleString()}`);
    
    // Filter for benefit eligible employees (excluding HSPs)
    const benefitEligible = currentEmployees.filter(row => 
      BENEFIT_ELIGIBLE_CATEGORIES.includes(row['Assignment Category Code'])
    );
    
    // Separate by person type
    const facultyBE = benefitEligible.filter(r => r['Person Type'] === 'FACULTY');
    const staffBE = benefitEligible.filter(r => r['Person Type'] === 'STAFF');
    
    console.log(`\n=== Benefit Eligible Counts ===`);
    console.log(`  Faculty: ${facultyBE.length}`);
    console.log(`  Staff: ${staffBE.length}`);
    console.log(`  Total: ${benefitEligible.length}`);
    
    // Build demographic data structure
    const demographics = {
      reportDate: '2025-06-30',
      source: 'New Emp List since FY20 to Q1FY25 1031 PT.xlsx',
      totals: {
        faculty: facultyBE.length,
        staff: staffBE.length,
        combined: benefitEligible.length
      },
      gender: {
        faculty: {
          male: facultyBE.filter(e => e['Gender'] === 'M').length,
          female: facultyBE.filter(e => e['Gender'] === 'F').length
        },
        staff: {
          male: staffBE.filter(e => e['Gender'] === 'M').length,
          female: staffBE.filter(e => e['Gender'] === 'F').length
        }
      },
      ethnicity: {
        faculty: {},
        staff: {}
      },
      ageBands: {
        faculty: {},
        staff: {}
      }
    };
    
    // Process ethnicity data with consolidation
    const consolidateEthnicity = (ethnicityStr) => {
      if (!ethnicityStr) return 'Not Disclosed';
      
      // Normalize ethnicity categories
      const normalized = ethnicityStr.trim();
      
      if (normalized.toLowerCase().includes('not disclosed')) {
        return 'Not Disclosed';
      }
      if (normalized === 'More than one Ethnicity' || normalized === 'Two or more races') {
        return 'Two or More Races';
      }
      if (normalized.includes('Hispanic or Latino')) {
        return 'Hispanic or Latino';
      }
      if (normalized === 'Native Hawaiian or other Pacific Islander') {
        return 'Pacific Islander';
      }
      
      return normalized;
    };
    
    // Count ethnicities
    facultyBE.forEach(emp => {
      const ethnicity = consolidateEthnicity(emp['Employee Ethnicity']);
      demographics.ethnicity.faculty[ethnicity] = (demographics.ethnicity.faculty[ethnicity] || 0) + 1;
    });
    
    staffBE.forEach(emp => {
      const ethnicity = consolidateEthnicity(emp['Employee Ethnicity']);
      demographics.ethnicity.staff[ethnicity] = (demographics.ethnicity.staff[ethnicity] || 0) + 1;
    });
    
    // Count age bands
    facultyBE.forEach(emp => {
      const ageBand = emp['Age Band'] || 'Unknown';
      demographics.ageBands.faculty[ageBand] = (demographics.ageBands.faculty[ageBand] || 0) + 1;
    });
    
    staffBE.forEach(emp => {
      const ageBand = emp['Age Band'] || 'Unknown';
      demographics.ageBands.staff[ageBand] = (demographics.ageBands.staff[ageBand] || 0) + 1;
    });
    
    // Sort ethnicity data by count (descending)
    const sortByCount = (obj) => {
      return Object.fromEntries(
        Object.entries(obj).sort((a, b) => b[1] - a[1])
      );
    };
    
    demographics.ethnicity.faculty = sortByCount(demographics.ethnicity.faculty);
    demographics.ethnicity.staff = sortByCount(demographics.ethnicity.staff);
    
    // Write to JSON file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(demographics, null, 2));
    console.log(`\n✅ Demographic data written to: ${OUTPUT_FILE}`);
    
    // Display summary statistics
    console.log('\n=== Summary Statistics ===\n');
    
    // Gender distribution
    console.log('Gender Distribution:');
    const facultyFemalePct = ((demographics.gender.faculty.female / demographics.totals.faculty) * 100).toFixed(1);
    const facultyMalePct = ((demographics.gender.faculty.male / demographics.totals.faculty) * 100).toFixed(1);
    const staffFemalePct = ((demographics.gender.staff.female / demographics.totals.staff) * 100).toFixed(1);
    const staffMalePct = ((demographics.gender.staff.male / demographics.totals.staff) * 100).toFixed(1);
    
    console.log(`  Faculty: ${facultyFemalePct}% Female, ${facultyMalePct}% Male`);
    console.log(`  Staff: ${staffFemalePct}% Female, ${staffMalePct}% Male`);
    
    // Top ethnicities
    console.log('\nTop 5 Ethnicities:');
    console.log('  Faculty:');
    Object.entries(demographics.ethnicity.faculty).slice(0, 5).forEach(([eth, count]) => {
      const pct = ((count / demographics.totals.faculty) * 100).toFixed(1);
      console.log(`    - ${eth}: ${count} (${pct}%)`);
    });
    console.log('  Staff:');
    Object.entries(demographics.ethnicity.staff).slice(0, 5).forEach(([eth, count]) => {
      const pct = ((count / demographics.totals.staff) * 100).toFixed(1);
      console.log(`    - ${eth}: ${count} (${pct}%)`);
    });
    
    // Age distribution
    console.log('\nAge Distribution:');
    const ageBandOrder = ['20-30', '31-40', '41-50', '51-60', '61 Plus', '61-70', '71-80', '71+'];
    
    console.log('  Faculty:');
    ageBandOrder.forEach(band => {
      if (demographics.ageBands.faculty[band]) {
        const count = demographics.ageBands.faculty[band];
        const pct = ((count / demographics.totals.faculty) * 100).toFixed(1);
        console.log(`    ${band}: ${count} (${pct}%)`);
      }
    });
    
    console.log('  Staff:');
    ageBandOrder.forEach(band => {
      if (demographics.ageBands.staff[band]) {
        const count = demographics.ageBands.staff[band];
        const pct = ((count / demographics.totals.staff) * 100).toFixed(1);
        console.log(`    ${band}: ${count} (${pct}%)`);
      }
    });
    
    // Output formatted text for manual insertion into staticData.js
    console.log('\n=== Copy this into staticData.js (2025-06-30 entry) ===\n');
    console.log('    // Demographic data for Benefit Eligible Employees (as of 6/30/25)');
    console.log('    // Source: New Emp List since FY20 to Q1FY25 1031 PT.xlsx');
    console.log('    demographics: {');
    console.log('      totals: {');
    console.log(`        faculty: ${demographics.totals.faculty},`);
    console.log(`        staff: ${demographics.totals.staff},`);
    console.log(`        combined: ${demographics.totals.combined}`);
    console.log('      },');
    console.log('      gender: {');
    console.log('        faculty: {');
    console.log(`          male: ${demographics.gender.faculty.male},`);
    console.log(`          female: ${demographics.gender.faculty.female}`);
    console.log('        },');
    console.log('        staff: {');
    console.log(`          male: ${demographics.gender.staff.male},`);
    console.log(`          female: ${demographics.gender.staff.female}`);
    console.log('        }');
    console.log('      },');
    console.log('      ethnicity: {');
    console.log('        faculty: {');
    Object.entries(demographics.ethnicity.faculty).forEach(([eth, count], idx, arr) => {
      const comma = idx < arr.length - 1 ? ',' : '';
      console.log(`          '${eth}': ${count}${comma}`);
    });
    console.log('        },');
    console.log('        staff: {');
    Object.entries(demographics.ethnicity.staff).forEach(([eth, count], idx, arr) => {
      const comma = idx < arr.length - 1 ? ',' : '';
      console.log(`          '${eth}': ${count}${comma}`);
    });
    console.log('        }');
    console.log('      },');
    console.log('      ageBands: {');
    console.log('        faculty: {');
    let firstAge = true;
    ageBandOrder.forEach(band => {
      if (demographics.ageBands.faculty[band]) {
        if (!firstAge) console.log(',');
        process.stdout.write(`          '${band}': ${demographics.ageBands.faculty[band]}`);
        firstAge = false;
      }
    });
    console.log('\n        },');
    console.log('        staff: {');
    firstAge = true;
    ageBandOrder.forEach(band => {
      if (demographics.ageBands.staff[band]) {
        if (!firstAge) console.log(',');
        process.stdout.write(`          '${band}': ${demographics.ageBands.staff[band]}`);
        firstAge = false;
      }
    });
    console.log('\n        }');
    console.log('      }');
    console.log('    },');
    
    console.log('\n✅ Process completed successfully!');
    console.log('====================================\n');
    
  } catch (error) {
    console.error('❌ Error processing workforce data:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  extractDemographics();
}

module.exports = { extractDemographics };