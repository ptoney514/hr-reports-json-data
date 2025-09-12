const fs = require('fs');
const csv = require('csv-parser');

// Define BE categories
const BE_CATEGORIES = ['F12', 'F11', 'F09', 'F10', 'PT12', 'PT9', 'PT11', 'PT10'];

// Counters
let unknownPersonType = 0;
let blankPersonType = 0;
let facultyCount = 0;
let staffCount = 0;
let otherPersonTypes = {};
let beWithUnknownType = [];

// Read and process CSV for 6/30/24
fs.createReadStream('public/source-metrics/workforce/fy25/New Emp List since FY20 to Q1FY25 1031 PT.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Clean field names and values
    const cleanRow = {};
    Object.keys(row).forEach(key => {
      const cleanKey = key.trim();
      cleanRow[cleanKey] = row[key]?.trim ? row[key].trim() : row[key];
    });

    const endDate = cleanRow['END DATE'];
    
    // Only process 6/30/24
    if (endDate === '6/30/24') {
      const personType = cleanRow['Person Type'];
      const assignmentCategory = cleanRow['Assignment Category Code'];
      
      // Check BE categories
      if (BE_CATEGORIES.includes(assignmentCategory)) {
        if (!personType || personType === '') {
          blankPersonType++;
          beWithUnknownType.push({
            empNum: cleanRow['Empl num'],
            name: `${cleanRow['Last Name']}, ${cleanRow['First Name']}`,
            category: assignmentCategory,
            job: cleanRow['Job Name']
          });
        } else if (personType === 'FACULTY') {
          facultyCount++;
        } else if (personType === 'STAFF') {
          staffCount++;
        } else {
          if (!otherPersonTypes[personType]) {
            otherPersonTypes[personType] = 0;
          }
          otherPersonTypes[personType]++;
          beWithUnknownType.push({
            empNum: cleanRow['Empl num'],
            name: `${cleanRow['Last Name']}, ${cleanRow['First Name']}`,
            personType: personType,
            category: assignmentCategory,
            job: cleanRow['Job Name']
          });
        }
      }
    }
  })
  .on('end', () => {
    console.log('\n=== Investigation of 6/30/24 Discrepancy ===\n');
    
    console.log('BE Category Employees by Person Type:');
    console.log(`  FACULTY: ${facultyCount}`);
    console.log(`  STAFF: ${staffCount}`);
    console.log(`  Blank/Empty: ${blankPersonType}`);
    
    if (Object.keys(otherPersonTypes).length > 0) {
      console.log('\n  Other Person Types:');
      Object.entries(otherPersonTypes).forEach(([type, count]) => {
        console.log(`    ${type}: ${count}`);
      });
    }
    
    const totalBE = facultyCount + staffCount + blankPersonType + 
                    Object.values(otherPersonTypes).reduce((a, b) => a + b, 0);
    console.log(`\n  Total BE: ${totalBE}`);
    
    console.log('\nExpected from staticData.js:');
    console.log('  Faculty: 786');
    console.log('  Staff: 1323');
    console.log('  Total: 2109');
    
    console.log('\nDiscrepancy Analysis:');
    console.log(`  Faculty difference: ${786 - facultyCount} (expected - actual)`);
    console.log(`  Staff difference: ${1323 - staffCount} (expected - actual)`);
    
    if (beWithUnknownType.length > 0) {
      console.log(`\n📋 First 10 BE employees with unusual Person Type:`);
      beWithUnknownType.slice(0, 10).forEach(emp => {
        console.log(`  ${emp.empNum}: ${emp.name}`);
        console.log(`    Person Type: "${emp.personType || '(blank)'}", Category: ${emp.category}`);
        console.log(`    Job: ${emp.job}`);
      });
    }
    
    console.log('\n✨ Investigation complete!\n');
  })
  .on('error', (err) => {
    console.error('Error reading CSV:', err);
  });