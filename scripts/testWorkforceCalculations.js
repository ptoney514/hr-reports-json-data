const fs = require('fs');
const csv = require('csv-parser');

// Define categories matching WorkforceAudit logic
const BE_CATEGORIES = ['F12', 'F11', 'F09', 'F10', 'PT12', 'PT9', 'PT11', 'PT10'];
const STUDENT_CATEGORIES = ['SUE', 'CWS'];
const TEMP_CATEGORIES = ['TEMP', 'NBE', 'PRN'];

// Counters for each date
const results = {
  '6/30/25': {
    total: 0,
    beStaff: 0,
    beFaculty: 0,
    hsp: 0,
    students: 0,
    temp: 0,
    categories: {}
  },
  '6/30/24': {
    total: 0,
    beStaff: 0,
    beFaculty: 0,
    hsp: 0,
    students: 0,
    temp: 0,
    categories: {}
  }
};

// Read and process CSV
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
    
    // Only process our target dates
    if (endDate === '6/30/25' || endDate === '6/30/24') {
      const personType = cleanRow['Person Type'];
      const assignmentCategory = cleanRow['Assignment Category Code'];
      
      results[endDate].total++;
      
      // Track assignment categories
      if (!results[endDate].categories[assignmentCategory]) {
        results[endDate].categories[assignmentCategory] = 0;
      }
      results[endDate].categories[assignmentCategory]++;
      
      // Categorize employees using exact same logic as WorkforceAudit
      if (assignmentCategory === 'HSR') {
        results[endDate].hsp++;
      } else if (STUDENT_CATEGORIES.includes(assignmentCategory)) {
        results[endDate].students++;
      } else if (TEMP_CATEGORIES.includes(assignmentCategory)) {
        results[endDate].temp++;
      } else if (personType === 'FACULTY' && BE_CATEGORIES.includes(assignmentCategory)) {
        results[endDate].beFaculty++;
      } else if (personType === 'STAFF' && BE_CATEGORIES.includes(assignmentCategory)) {
        results[endDate].beStaff++;
      }
    }
  })
  .on('end', () => {
    console.log('\n=== Workforce Calculation Test Results ===\n');
    
    // Expected values from staticData.js
    const expected = {
      '6/30/25': {
        total: 5037,
        beFaculty: 689,
        beStaff: 1448,
        hsp: 612,
        students: 1714,
        temp: 574
      },
      '6/30/24': {
        total: 4774,
        beFaculty: 786,
        beStaff: 1323,
        hsp: 608,
        students: 1491,
        temp: 566
      }
    };
    
    // Display results for each date
    ['6/30/25', '6/30/24'].forEach(date => {
      console.log(`\n📅 ${date} Results:`);
      console.log('─'.repeat(50));
      
      const r = results[date];
      const e = expected[date];
      
      console.log(`Total Records: ${r.total} (expected: ${e.total}) ${r.total === e.total ? '✅' : '❌'}`);
      console.log(`BE Faculty: ${r.beFaculty} (expected: ${e.beFaculty}) ${r.beFaculty === e.beFaculty ? '✅' : '❌'}`);
      console.log(`BE Staff: ${r.beStaff} (expected: ${e.beStaff}) ${r.beStaff === e.beStaff ? '✅' : '❌'}`);
      console.log(`HSP: ${r.hsp} (expected: ${e.hsp}) ${r.hsp === e.hsp ? '✅' : '❌'}`);
      console.log(`Students: ${r.students} (expected: ${e.students}) ${r.students === e.students ? '✅' : '❌'}`);
      console.log(`Temp: ${r.temp} (expected: ${e.temp}) ${r.temp === e.temp ? '✅' : '❌'}`);
      
      const sum = r.beFaculty + r.beStaff + r.hsp + r.students + r.temp;
      console.log(`\nSum of categories: ${sum}`);
      console.log(`Uncategorized: ${r.total - sum}`);
      
      // Show breakdown of assignment categories
      console.log('\nTop Assignment Categories:');
      const sorted = Object.entries(r.categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      sorted.forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count}`);
      });
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('\n✨ Test complete!\n');
  })
  .on('error', (err) => {
    console.error('Error reading CSV:', err);
  });