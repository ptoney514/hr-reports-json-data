#!/usr/bin/env node
/**
 * Quick script to inspect Excel file columns
 */
const { loadExcelFile, getSheetNames, getColumnHeaders } = require('./utils/excel-helpers');

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node scripts/inspect-excel-columns.js <file.xlsx>');
  process.exit(1);
}

const workbook = loadExcelFile(filePath);
const sheetNames = getSheetNames(workbook);

console.log('Sheet Names:', sheetNames);
console.log('\nColumns in first sheet:');

const headers = getColumnHeaders(workbook, sheetNames[0]);
headers.forEach((header, index) => {
  console.log(`  [${index}] ${header}`);
});
