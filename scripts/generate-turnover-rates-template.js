#!/usr/bin/env node

/**
 * Generate Turnover Rates Excel Template
 *
 * Creates turnover-rates-input.xlsx pre-populated with historical
 * turnover rate data from FY24 through Q1 FY26.
 *
 * Usage:
 *   node scripts/generate-turnover-rates-template.js
 *
 * User workflow:
 *   1. Run this script to generate the template
 *   2. Open the Excel file and add new quarters as received
 *   3. Run ETL to load to Neon: npm run etl:turnover-rates
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'source-metrics', 'turnover');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'turnover-rates-input.xlsx');

// Historical turnover rates data
// Source: TurnoverDashboard + HR slides
const TURNOVER_RATES_DATA = [
  // FY24 data
  { Category: 'Faculty', Period: 'FY24', Rate: 7.7, Benchmark: 9.1, Benchmark_Year: '2023-24' },
  { Category: 'Staff Exempt', Period: 'FY24', Rate: 13.6, Benchmark: 16.7, Benchmark_Year: '2023-24' },
  { Category: 'Staff Non-Exempt', Period: 'FY24', Rate: 17.8, Benchmark: 19.9, Benchmark_Year: '2023-24' },
  { Category: 'Total', Period: 'FY24', Rate: 12.8, Benchmark: 14.1, Benchmark_Year: '2023-24' },

  // FY25 data
  { Category: 'Faculty', Period: 'FY25', Rate: 6.1, Benchmark: 8.7, Benchmark_Year: '2024-25' },
  { Category: 'Staff Exempt', Period: 'FY25', Rate: 12.6, Benchmark: 15.0, Benchmark_Year: '2024-25' },
  { Category: 'Staff Non-Exempt', Period: 'FY25', Rate: 15.3, Benchmark: 20.7, Benchmark_Year: '2024-25' },
  { Category: 'Total', Period: 'FY25', Rate: 11.2, Benchmark: 13.8, Benchmark_Year: '2024-25' },

  // Q1 FY26 data
  { Category: 'Faculty', Period: 'Q1_FY26', Rate: 2.3, Benchmark: 8.7, Benchmark_Year: '2024-25' },
  { Category: 'Staff Exempt', Period: 'Q1_FY26', Rate: 16.5, Benchmark: 15.0, Benchmark_Year: '2024-25' },
  { Category: 'Staff Non-Exempt', Period: 'Q1_FY26', Rate: 13.8, Benchmark: 20.7, Benchmark_Year: '2024-25' },
  { Category: 'Total', Period: 'Q1_FY26', Rate: 10.8, Benchmark: 13.8, Benchmark_Year: '2024-25' }
];

/**
 * Main execution
 */
function main() {
  console.log('\n========================================');
  console.log('  Generate Turnover Rates Template');
  console.log('========================================\n');

  // Ensure directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUTPUT_DIR}`);
  }

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Create Turnover_Rates sheet
  const worksheet = XLSX.utils.json_to_sheet(TURNOVER_RATES_DATA);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 18 },  // Category
    { wch: 10 },  // Period
    { wch: 8 },   // Rate
    { wch: 10 },  // Benchmark
    { wch: 14 }   // Benchmark_Year
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Turnover_Rates');

  // Add Instructions sheet
  const instructions = [
    { Instruction: 'How to use this template:' },
    { Instruction: '' },
    { Instruction: '1. Open the Turnover_Rates sheet' },
    { Instruction: '2. Add new rows for each new quarter/fiscal year as data is received' },
    { Instruction: '3. Save the file' },
    { Instruction: '4. Run: npm run etl:turnover-rates -- --input "source-metrics/turnover/turnover-rates-input.xlsx"' },
    { Instruction: '' },
    { Instruction: 'Column Definitions:' },
    { Instruction: '  Category: Faculty, Staff Exempt, Staff Non-Exempt, or Total' },
    { Instruction: '  Period: FY24, FY25, Q1_FY26, Q2_FY26, etc.' },
    { Instruction: '  Rate: Turnover rate percentage (e.g., 7.7 for 7.7%)' },
    { Instruction: '  Benchmark: Higher Ed benchmark percentage' },
    { Instruction: '  Benchmark_Year: Academic year for benchmark (e.g., 2024-25)' },
    { Instruction: '' },
    { Instruction: 'Period Format Examples:' },
    { Instruction: '  FY24 - Full fiscal year 2024' },
    { Instruction: '  FY25 - Full fiscal year 2025' },
    { Instruction: '  Q1_FY26 - Quarter 1 of fiscal year 2026' },
    { Instruction: '  Q2_FY26 - Quarter 2 of fiscal year 2026' }
  ];

  const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
  instructionsSheet['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

  // Write workbook
  XLSX.writeFile(workbook, OUTPUT_FILE);

  console.log(`✓ Created: ${OUTPUT_FILE}`);
  console.log(`\nData Summary:`);
  console.log(`  - ${TURNOVER_RATES_DATA.length} rows pre-populated`);
  console.log(`  - Periods: FY24, FY25, Q1_FY26`);
  console.log(`  - Categories: Faculty, Staff Exempt, Staff Non-Exempt, Total`);
  console.log(`\nNext Steps:`);
  console.log(`  1. Open the Excel file to review/update data`);
  console.log(`  2. Run ETL: npm run etl:turnover-rates`);
  console.log('\n========================================\n');
}

main();
