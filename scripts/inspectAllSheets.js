/**
 * Inspect All Sheets in Excel File
 * Check all sheets and data structure
 */

const XLSX = require('xlsx');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../source-metrics/turnover/fy25/Terms Since 2017 Detail PT.xlsx');

function inspectAllSheets() {
  console.log('Inspecting Excel file:', INPUT_FILE);
  
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(INPUT_FILE);
    
    console.log(`\nFound ${workbook.SheetNames.length} sheet(s):`);
    workbook.SheetNames.forEach(name => console.log(`  - ${name}`));
    
    // Inspect each sheet
    workbook.SheetNames.forEach((sheetName, idx) => {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`SHEET ${idx + 1}: ${sheetName}`);
      console.log('='.repeat(50));
      
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { raw: true });
      
      console.log(`Records: ${data.length}`);
      
      if (data.length > 0) {
        // Get column headers
        const headers = Object.keys(data[0]);
        console.log('\nColumn headers:');
        headers.forEach(h => console.log(`  - ${h}`));
        
        // Show first 3 records completely
        console.log('\nFirst 3 records (all fields):');
        data.slice(0, 3).forEach((row, idx) => {
          console.log(`\n--- Record ${idx + 1} ---`);
          Object.entries(row).forEach(([key, value]) => {
            // Check if value might be a date
            if (typeof value === 'number' && value > 40000 && value < 50000) {
              const date = new Date((value - 25569) * 86400 * 1000);
              console.log(`  ${key}: ${value} (date: ${date.toISOString().split('T')[0]})`);
            } else {
              console.log(`  ${key}: ${value}`);
            }
          });
        });
        
        // Look for date-like columns
        console.log('\nSearching for date columns...');
        const firstRow = data[0];
        Object.entries(firstRow).forEach(([key, value]) => {
          // Check if column name suggests it's a date
          if (key.toLowerCase().includes('date') || 
              key.toLowerCase().includes('dt') ||
              key.toLowerCase().includes('term') ||
              key.toLowerCase().includes('hire')) {
            console.log(`  Potential date column: ${key} (sample value: ${value})`);
          }
        });
        
        // Look for employee/ID columns
        console.log('\nSearching for employee ID columns...');
        Object.entries(firstRow).forEach(([key, value]) => {
          if (key.toLowerCase().includes('empl') || 
              key.toLowerCase().includes('employee') ||
              key.toLowerCase().includes('id') ||
              key.toLowerCase().includes('num')) {
            console.log(`  Potential ID column: ${key} (sample value: ${value})`);
          }
        });
      }
    });
    
  } catch (error) {
    console.error('Error inspecting file:', error);
  }
}

inspectAllSheets();