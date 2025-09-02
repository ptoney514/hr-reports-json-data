/**
 * Inspect Excel Data Structure
 * Debug script to understand the Excel file format
 */

const XLSX = require('xlsx');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../source-metrics/turnover/fy25/Terms Since 2017 Detail PT.xlsx');

function inspectData() {
  console.log('Inspecting Excel file:', INPUT_FILE);
  
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(INPUT_FILE);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Get raw data with dates as numbers
    const rawData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
    console.log(`\nTotal records: ${rawData.length}`);
    
    // Get column headers
    const headers = Object.keys(rawData[0] || {});
    console.log('\nColumn headers:');
    headers.forEach(h => console.log(`  - ${h}`));
    
    // Show first few records
    console.log('\nFirst 5 records (showing key fields):');
    rawData.slice(0, 5).forEach((row, idx) => {
      console.log(`\nRecord ${idx + 1}:`);
      console.log(`  Empl Num: ${row['Empl Num'] || row['Employee Number'] || 'N/A'}`);
      console.log(`  Term Date: ${row['Term Date'] || row['Termination Date'] || 'N/A'}`);
      console.log(`  Hire Date: ${row['Hire Date'] || row['Hire Dt'] || 'N/A'}`);
      console.log(`  Fac Staff: ${row['Fac Staff'] || row['Faculty Staff'] || 'N/A'}`);
      console.log(`  Assignment Category: ${row['Assignment Category'] || row['Asgn Category'] || 'N/A'}`);
      console.log(`  Term Reason 2: ${row['Term Reason 2'] || row['Termination Reason'] || 'N/A'}`);
      
      // Try to parse date if it exists
      const termDateField = row['Term Date'] || row['Termination Date'];
      if (termDateField) {
        if (typeof termDateField === 'number') {
          // Excel date number - convert to JS date
          const date = new Date((termDateField - 25569) * 86400 * 1000);
          console.log(`  Term Date (parsed): ${date.toISOString().split('T')[0]}`);
        } else {
          console.log(`  Term Date (raw): ${termDateField}`);
        }
      }
    });
    
    // Check date ranges
    console.log('\nChecking date ranges in data...');
    let minDate = null;
    let maxDate = null;
    let dateCount = 0;
    
    rawData.forEach(row => {
      const termDateField = row['Term Date'] || row['Termination Date'];
      if (termDateField) {
        let date;
        if (typeof termDateField === 'number') {
          date = new Date((termDateField - 25569) * 86400 * 1000);
        } else {
          date = new Date(termDateField);
        }
        
        if (!isNaN(date.getTime())) {
          dateCount++;
          if (!minDate || date < minDate) minDate = date;
          if (!maxDate || date > maxDate) maxDate = date;
        }
      }
    });
    
    console.log(`\nRecords with valid Term Dates: ${dateCount}`);
    if (minDate && maxDate) {
      console.log(`Date range: ${minDate.toISOString().split('T')[0]} to ${maxDate.toISOString().split('T')[0]}`);
      
      // Check FY25 range
      const fy25Start = new Date('2024-07-01');
      const fy25End = new Date('2025-06-30');
      let fy25Count = 0;
      
      rawData.forEach(row => {
        const termDateField = row['Term Date'] || row['Termination Date'];
        if (termDateField) {
          let date;
          if (typeof termDateField === 'number') {
            date = new Date((termDateField - 25569) * 86400 * 1000);
          } else {
            date = new Date(termDateField);
          }
          
          if (!isNaN(date.getTime()) && date >= fy25Start && date <= fy25End) {
            fy25Count++;
          }
        }
      });
      
      console.log(`\nRecords in FY25 range (2024-07-01 to 2025-06-30): ${fy25Count}`);
    }
    
    // Check assignment categories
    console.log('\nAssignment Categories found:');
    const categories = {};
    rawData.forEach(row => {
      const cat = row['Assignment Category'] || row['Asgn Category'] || 'Unknown';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
    
  } catch (error) {
    console.error('Error inspecting file:', error);
  }
}

inspectData();