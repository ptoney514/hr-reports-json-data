#!/usr/bin/env node
const { loadExcelFile, getSheetNames, getColumnHeaders, sheetToJSON } = require('./utils/excel-helpers');

const filePath = process.argv[2];
const workbook = loadExcelFile(filePath);
const sheetNames = getSheetNames(workbook);

console.log(`File: ${filePath}\n`);
console.log(`Total sheets: ${sheetNames.length}\n`);

sheetNames.forEach((sheetName, index) => {
  console.log(`\n=== Sheet ${index + 1}: "${sheetName}" ===`);

  try {
    const headers = getColumnHeaders(workbook, sheetName);
    console.log(`Columns (${headers.length}):`);
    headers.slice(0, 20).forEach((h, i) => console.log(`  [${i}] ${h}`));
    if (headers.length > 20) console.log(`  ... and ${headers.length - 20} more`);

    const data = sheetToJSON(workbook, sheetName);
    console.log(`\nRows: ${data.length}`);

    if (data.length > 0) {
      console.log('\nFirst row sample:');
      console.log(JSON.stringify(data[0], null, 2).substring(0, 500));
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
});
