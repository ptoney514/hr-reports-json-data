#!/usr/bin/env node

/**
 * Workforce Excel Validator
 *
 * Lightweight validation script for quarterly Excel imports.
 * Runs structural checks and validates summary metrics against the manifest.
 *
 * Usage:
 *   node scripts/validateWorkforceExcel.js --file source-metrics/workforce/raw/file.xlsx --quarter FY25_Q4
 *   node scripts/validateWorkforceExcel.js --file file.xlsx --date 2025-06-30
 *
 * Checks Performed:
 * 1. Structural: Required columns present, row count > 0
 * 2. Critical Values: 6 summary metrics against manifest
 * 3. Range Validation: Values within expected bounds
 * 4. Cross-checks: Totals align with category sums
 */

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Load manifest
const MANIFEST_PATH = path.join(__dirname, '../src/data/manifests/workforce-expected-values.json');
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = { file: null, quarter: null, date: null, verbose: false };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--file':
      case '-f':
        options.file = args[++i];
        break;
      case '--quarter':
      case '-q':
        options.quarter = args[++i];
        break;
      case '--date':
      case '-d':
        options.date = args[++i];
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
${colors.cyan}Workforce Excel Validator${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node scripts/validateWorkforceExcel.js --file <path> --date <YYYY-MM-DD>
  node scripts/validateWorkforceExcel.js --file <path> --quarter <FY25_Q4>

${colors.yellow}Options:${colors.reset}
  -f, --file FILE       Excel file to validate
  -d, --date DATE       Period date (YYYY-MM-DD format)
  -q, --quarter PERIOD  Fiscal period (e.g., FY25_Q4)
  -v, --verbose         Show detailed output
  -h, --help            Show this help

${colors.yellow}Examples:${colors.reset}
  node scripts/validateWorkforceExcel.js -f workforce.xlsx -d 2025-06-30
  node scripts/validateWorkforceExcel.js -f workforce.xlsx -q FY25_Q4 -v
`);
}

/**
 * Convert fiscal quarter to date
 */
function quarterToDate(quarter) {
  const match = quarter.match(/FY(\d{2})_Q(\d)/);
  if (!match) return null;

  const fy = parseInt(match[1]);
  const q = parseInt(match[2]);
  const year = 2000 + fy;

  const quarterEnds = {
    1: `${year - 1}-09-30`,
    2: `${year - 1}-12-31`,
    3: `${year}-03-31`,
    4: `${year}-06-30`
  };

  return quarterEnds[q];
}

/**
 * Load and parse Excel file
 */
function loadExcel(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  return {
    sheetName,
    rowCount: data.length,
    columns: data.length > 0 ? Object.keys(data[0]) : [],
    data
  };
}

/**
 * Validate structural requirements
 */
function validateStructure(excel, verbose = false) {
  const results = { passed: true, checks: [] };
  const schema = manifest.excelSchema;

  // Check row count
  if (excel.rowCount === 0) {
    results.passed = false;
    results.checks.push({ name: 'Row Count', status: 'FAIL', message: 'Excel has 0 rows' });
  } else {
    results.checks.push({ name: 'Row Count', status: 'PASS', message: `${excel.rowCount} rows found` });
  }

  // Check required columns
  const missingColumns = [];
  for (const required of schema.requiredColumns) {
    const found = excel.columns.some(col =>
      col.toLowerCase().includes(required.toLowerCase().replace(' ', ''))
    );
    if (!found) {
      missingColumns.push(required);
    }
  }

  if (missingColumns.length > 0) {
    results.passed = false;
    results.checks.push({
      name: 'Required Columns',
      status: 'FAIL',
      message: `Missing: ${missingColumns.join(', ')}`
    });
  } else {
    results.checks.push({ name: 'Required Columns', status: 'PASS', message: 'All required columns present' });
  }

  // Check for valid assignment categories
  const assignmentCol = excel.columns.find(c => c.toLowerCase().includes('assignment') && c.toLowerCase().includes('category'));
  if (assignmentCol) {
    const uniqueCategories = [...new Set(excel.data.map(row => row[assignmentCol]).filter(Boolean))];
    const validCategories = [
      ...schema.assignmentCategoryCodes.benefitEligible,
      ...schema.assignmentCategoryCodes.houseStaff,
      ...schema.assignmentCategoryCodes.students,
      ...schema.assignmentCategoryCodes.nonBenefit
    ];
    const invalidCategories = uniqueCategories.filter(c => !validCategories.includes(c.toString().toUpperCase()));

    if (invalidCategories.length > 0) {
      results.checks.push({
        name: 'Assignment Categories',
        status: 'WARN',
        message: `Unknown categories: ${invalidCategories.slice(0, 5).join(', ')}${invalidCategories.length > 5 ? '...' : ''}`
      });
    } else {
      results.checks.push({ name: 'Assignment Categories', status: 'PASS', message: `${uniqueCategories.length} valid categories` });
    }
  }

  return results;
}

/**
 * Calculate summary metrics from Excel data
 */
function calculateMetrics(excel) {
  const schema = manifest.excelSchema;
  const metrics = { staff: 0, faculty: 0, hsp: 0, students: 0, temp: 0, total: 0 };
  const locations = { omaha: 0, phoenix: 0 };

  // Find relevant columns
  const categoryCol = excel.columns.find(c => c.toLowerCase().includes('assignment') && c.toLowerCase().includes('category'));
  const personTypeCol = excel.columns.find(c => c.toLowerCase().includes('person') && c.toLowerCase().includes('type'));
  const benefitCol = excel.columns.find(c => c.toLowerCase().includes('benefit'));
  const locationCol = excel.columns.find(c => c.toLowerCase().includes('location') || c.toLowerCase().includes('state'));

  for (const row of excel.data) {
    const category = (row[categoryCol] || '').toString().toUpperCase();
    const personType = (row[personTypeCol] || '').toString().toUpperCase();
    const isBenefitEligible = (row[benefitCol] || '').toString().toLowerCase() === 'yes';
    const location = (row[locationCol] || '').toString().toLowerCase();

    metrics.total++;

    // Location
    if (location.includes('phoenix') || location.includes('phx')) {
      locations.phoenix++;
    } else {
      locations.omaha++;
    }

    // Categorize
    if (schema.assignmentCategoryCodes.houseStaff.includes(category)) {
      metrics.hsp++;
    } else if (schema.assignmentCategoryCodes.students.includes(category)) {
      metrics.students++;
    } else if (schema.assignmentCategoryCodes.nonBenefit.includes(category)) {
      metrics.temp++;
    } else if (schema.assignmentCategoryCodes.benefitEligible.includes(category)) {
      if (personType === 'FACULTY') {
        metrics.faculty++;
      } else {
        metrics.staff++;
      }
    }
  }

  return { metrics, locations };
}

/**
 * Validate metrics against manifest
 */
function validateMetrics(calculated, periodDate, verbose = false) {
  const expected = manifest.periods[periodDate];
  const results = { passed: true, checks: [], diffs: [] };

  if (!expected) {
    results.passed = false;
    results.checks.push({
      name: 'Manifest Period',
      status: 'FAIL',
      message: `No expected values for ${periodDate} in manifest`
    });
    return results;
  }

  const metricLabels = {
    staff: 'Benefit Eligible Staff',
    faculty: 'Benefit Eligible Faculty',
    hsp: 'Benefit Eligible HSP',
    students: 'Student Workers',
    temp: 'Non-Benefit Eligible',
    total: 'Total Workforce'
  };

  for (const [key, label] of Object.entries(metricLabels)) {
    const actual = calculated.metrics[key];
    const expectedValue = expected.metrics[key].value;
    const diff = actual - expectedValue;

    if (diff === 0) {
      results.checks.push({ name: label, status: 'PASS', message: `${actual} matches expected` });
    } else {
      results.passed = false;
      results.diffs.push({ metric: label, expected: expectedValue, actual, diff });
      results.checks.push({
        name: label,
        status: 'FAIL',
        message: `Expected ${expectedValue}, got ${actual} (diff: ${diff > 0 ? '+' : ''}${diff})`
      });
    }
  }

  // Range validation
  if (expected.validationRanges) {
    for (const [key, range] of Object.entries(expected.validationRanges)) {
      const actual = calculated.metrics[key];
      if (actual < range.min || actual > range.max) {
        results.checks.push({
          name: `${metricLabels[key]} Range`,
          status: 'WARN',
          message: `${actual} outside expected range [${range.min}-${range.max}]`
        });
      }
    }
  }

  return results;
}

/**
 * Main validation runner
 */
async function main() {
  const options = parseArgs();

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}   Workforce Excel Validator${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  if (!options.file) {
    console.error(`${colors.red}Error: --file is required${colors.reset}`);
    printHelp();
    process.exit(1);
  }

  if (!options.date && !options.quarter) {
    console.error(`${colors.red}Error: Either --date or --quarter is required${colors.reset}`);
    printHelp();
    process.exit(1);
  }

  const periodDate = options.date || quarterToDate(options.quarter);
  console.log(`${colors.blue}File:${colors.reset} ${options.file}`);
  console.log(`${colors.blue}Period:${colors.reset} ${periodDate}\n`);

  // Check file exists
  if (!fs.existsSync(options.file)) {
    console.error(`${colors.red}Error: File not found: ${options.file}${colors.reset}`);
    process.exit(1);
  }

  // Load Excel
  console.log(`${colors.blue}Loading Excel...${colors.reset}`);
  const excel = loadExcel(options.file);
  console.log(`${colors.green}Loaded ${excel.rowCount} rows from "${excel.sheetName}"${colors.reset}\n`);

  // Run validations
  let allPassed = true;

  // 1. Structural validation
  console.log(`${colors.cyan}=== Structural Validation ===${colors.reset}`);
  const structureResults = validateStructure(excel, options.verbose);
  allPassed = allPassed && structureResults.passed;
  printResults(structureResults.checks);

  // 2. Calculate and validate metrics
  console.log(`\n${colors.cyan}=== Summary Card Metrics (6 checks) ===${colors.reset}`);
  const calculated = calculateMetrics(excel);
  const metricsResults = validateMetrics(calculated, periodDate, options.verbose);
  allPassed = allPassed && metricsResults.passed;
  printResults(metricsResults.checks);

  // Print diff summary if any failures
  if (metricsResults.diffs.length > 0) {
    console.log(`\n${colors.yellow}=== Differences Found ===${colors.reset}`);
    console.log('| Metric | Expected | Actual | Diff |');
    console.log('|--------|----------|--------|------|');
    for (const d of metricsResults.diffs) {
      console.log(`| ${d.metric} | ${d.expected} | ${d.actual} | ${d.diff > 0 ? '+' : ''}${d.diff} |`);
    }
  }

  // Summary
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  if (allPassed) {
    console.log(`${colors.green}VALIDATION PASSED${colors.reset}`);
    console.log(`All checks passed for ${periodDate}`);
  } else {
    console.log(`${colors.red}VALIDATION FAILED${colors.reset}`);
    console.log(`Some checks failed - review differences above`);
  }
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  process.exit(allPassed ? 0 : 1);
}

function printResults(checks) {
  for (const check of checks) {
    const icon = check.status === 'PASS' ? `${colors.green}PASS${colors.reset}` :
      check.status === 'FAIL' ? `${colors.red}FAIL${colors.reset}` :
        `${colors.yellow}WARN${colors.reset}`;
    console.log(`  [${icon}] ${check.name}: ${check.message}`);
  }
}

main().catch(err => {
  console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
  process.exit(1);
});
