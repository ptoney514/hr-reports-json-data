#!/usr/bin/env node
const { readExcelToJSON } = require('./utils/excel-helpers');

const filePath = process.argv[2];
const data = readExcelToJSON(filePath);

console.log('Total rows:', data.length);
console.log('\nFirst 3 rows:');
console.log(JSON.stringify(data.slice(0, 3), null, 2));

console.log('\nSample Assignment Category Code values:');
const categories = new Set();
data.slice(0, 100).forEach(row => {
  if (row['Assignment Category Code']) {
    categories.add(row['Assignment Category Code']);
  }
});
console.log(Array.from(categories));
