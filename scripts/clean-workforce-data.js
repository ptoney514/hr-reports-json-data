#!/usr/bin/env node

/**
 * Workforce Data Cleaner
 *
 * Processes raw Oracle HCM workforce Excel exports and converts to clean JSON
 * - Reads Excel from source-metrics/workforce/raw/
 * - Removes PII
 * - Categorizes employees
 * - Generates JSON matching staticData.js format
 * - Creates audit trail
 * - Saves to source-metrics/workforce/cleaned/
 *
 * Usage:
 *   node scripts/clean-workforce-data.js --input file.xlsx --quarter FY25_Q2
 *   node scripts/clean-workforce-data.js --input file.xlsx --date 2024-12-31
 */

const fs = require('fs');
const path = require('path');

// Import utilities
const {
  loadExcelFile,
  sheetToJSON,
  getSheetNames,
  excelDateToJSDate,
  formatDate,
  isExcelDate
} = require('./utils/excel-helpers');

const {
  getFiscalPeriodKey,
  getFiscalQuarter,
  getFiscalYear,
  parseFiscalPeriodKey,
  getQuarterDatesFromKey
} = require('./utils/fiscal-calendar');

const {
  removePII,
  createPIIReport,
  PII_FIELDS
} = require('./utils/pii-removal');

const {
  validateWorkforceRow,
  createValidationReport
} = require('./utils/validation');

const {
  createAuditTrail,
  generateAuditReport,
  saveAuditTrail,
  logTransformation
} = require('./utils/audit-generator');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Assignment category classifications (from existing methodology)
const BENEFIT_ELIGIBLE_CATEGORIES = ['F12', 'F09', 'F10', 'F11', 'PT12', 'PT10', 'PT9', 'PT11'];
const STUDENT_CATEGORIES = ['SUE', 'CWS'];
const SPECIAL_CATEGORIES = ['HSP', 'TEMP', 'NBE', 'PRN'];

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: null,
    quarter: null,
    date: null,
    output: null,
    dryRun: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
      case '-i':
        options.input = args[++i];
        break;
      case '--quarter':
      case '-q':
        options.quarter = args[++i];
        break;
      case '--date':
      case '-d':
        options.date = args[++i];
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
${colors.cyan}Workforce Data Cleaner${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node scripts/clean-workforce-data.js --input file.xlsx --quarter FY25_Q2
  node scripts/clean-workforce-data.js --input file.xlsx --date 2024-12-31

${colors.yellow}Options:${colors.reset}
  -i, --input FILE      Input Excel file path (required)
  -q, --quarter PERIOD  Fiscal period (e.g., FY25_Q2)
  -d, --date DATE       Report date (YYYY-MM-DD format)
  -o, --output DIR      Output directory (default: auto-generated)
  --dry-run             Preview changes without saving files

${colors.yellow}Examples:${colors.reset}
  # Process Q2 FY25 workforce data
  node scripts/clean-workforce-data.js \\
    --input source-metrics/workforce/raw/workforce_dec2024.xlsx \\
    --quarter FY25_Q2

  # Process with specific date
  node scripts/clean-workforce-data.js \\
    --input data.xlsx \\
    --date 2024-12-31

${colors.yellow}Notes:${colors.reset}
  - Input file should be from source-metrics/workforce/raw/
  - Output will be saved to source-metrics/workforce/cleaned/[QUARTER]/
  - Audit trail will be generated automatically
  - PII will be automatically removed
`);
}

/**
 * Categorize employee based on assignment category
 */
function categorizeEmployee(assignmentCategory) {
  if (!assignmentCategory) return 'unknown';

  const category = assignmentCategory.toString().trim().toUpperCase();

  // Benefit-eligible (Faculty/Staff)
  if (BENEFIT_ELIGIBLE_CATEGORIES.includes(category)) {
    // Faculty categories
    if (category.startsWith('F')) {
      return 'faculty';
    }
    // Staff categories (PT)
    return 'staff';
  }

  // Students
  if (STUDENT_CATEGORIES.includes(category)) {
    return 'student';
  }

  // Special categories
  if (SPECIAL_CATEGORIES.includes(category)) {
    return category.toLowerCase();
  }

  return 'other';
}

/**
 * Process workforce Excel file
 */
function processWorkforceExcel(filePath, options = {}) {
  const transformations = [];
  let stats = {
    totalRows: 0,
    validRows: 0,
    invalidRows: 0,
    emptyRowsSkipped: 0,
    duplicatesRemoved: 0
  };

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}   Workforce Data Cleaner${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  // Load Excel file
  console.log(`${colors.blue}Loading Excel file...${colors.reset}`);
  const workbook = loadExcelFile(filePath);
  transformations.push(logTransformation('Loaded Excel file', { path: path.basename(filePath) }));

  // Get sheet names
  const sheetNames = getSheetNames(workbook);
  console.log(`${colors.green}✓${colors.reset} Found ${sheetNames.length} sheets: ${sheetNames.join(', ')}`);

  // Use first sheet (or specified sheet)
  const sheetName = options.sheet || sheetNames[0];
  console.log(`${colors.blue}Processing sheet: ${sheetName}${colors.reset}`);

  // Convert to JSON
  const rawData = sheetToJSON(workbook, sheetName);
  stats.totalRows = rawData.length;
  console.log(`${colors.green}✓${colors.reset} Loaded ${rawData.length} rows`);
  transformations.push(logTransformation('Converted Excel to JSON', { rows: rawData.length }));

  // Process rows
  console.log(`\n${colors.blue}Processing data...${colors.reset}`);

  const processedData = [];
  const categoryCounts = {};
  const locationCounts = { omaha: 0, phoenix: 0 };
  const piiFieldsRemoved = new Set();

  rawData.forEach((row, index) => {
    // Skip header row if it exists
    if (index === 0 && row.__rowNum__ === 1) {
      stats.emptyRowsSkipped++;
      return;
    }

    // Skip empty rows
    const hasData = Object.values(row).some(val => val !== null && val !== undefined && val !== '');
    if (!hasData) {
      stats.emptyRowsSkipped++;
      return;
    }

    // Remove PII
    const cleanedRow = removePII(row, { hashIds: true });

    // Track which PII fields were removed
    Object.keys(row).forEach(key => {
      if (!cleanedRow[key] && row[key]) {
        piiFieldsRemoved.add(key);
      }
    });

    // Convert Excel dates
    Object.keys(cleanedRow).forEach(key => {
      if (isExcelDate(cleanedRow[key])) {
        const jsDate = excelDateToJSDate(cleanedRow[key]);
        cleanedRow[key] = formatDate(jsDate);
      }
    });

    // Categorize employee (handle various column name formats)
    const assignmentCategory =
      row['Assignment Category Code'] ||
      row['Assignment Category'] ||
      row['assignment_category'] ||
      row['assignment_category_code'] ||
      row['ASSIGNMENT_CATEGORY'] ||
      row['ASSIGNMENT_CATEGORY_CODE'];

    const employeeCategory = categorizeEmployee(assignmentCategory);
    cleanedRow.employeeCategory = employeeCategory;

    // Also store the original category code for reference
    if (assignmentCategory) {
      cleanedRow.assignmentCategoryCode = assignmentCategory;
    }

    // Count by category
    categoryCounts[employeeCategory] = (categoryCounts[employeeCategory] || 0) + 1;

    // Track location (if available - handle various column names)
    const location =
      row['Location'] ||
      row['location'] ||
      row['LOCATION'] ||
      row['State'];
    if (location) {
      const locationLower = location.toString().toLowerCase();
      if (locationLower.includes('phoenix')) {
        locationCounts.phoenix++;
      } else if (locationLower.includes('omaha')) {
        locationCounts.omaha++;
      }
    }

    processedData.push(cleanedRow);
    stats.validRows++;
  });

  console.log(`${colors.green}✓${colors.reset} Processed ${stats.validRows} valid rows`);
  console.log(`${colors.yellow}!${colors.reset} Skipped ${stats.emptyRowsSkipped} empty rows`);
  transformations.push(logTransformation('Removed PII and categorized employees', {
    valid: stats.validRows,
    skipped: stats.emptyRowsSkipped
  }));

  // Generate summary
  console.log(`\n${colors.cyan}Category Breakdown:${colors.reset}`);
  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`  ${category}: ${count}`);
  });

  console.log(`\n${colors.cyan}Location Breakdown:${colors.reset}`);
  console.log(`  Omaha: ${locationCounts.omaha}`);
  console.log(`  Phoenix: ${locationCounts.phoenix}`);
  console.log(`  Unknown: ${stats.validRows - locationCounts.omaha - locationCounts.phoenix}`);

  return {
    data: processedData,
    stats,
    transformations,
    categoryCounts,
    locationCounts,
    piiFieldsRemoved: Array.from(piiFieldsRemoved)
  };
}

/**
 * Generate workforce summary in staticData.js format
 */
function generateWorkforceSummary(result, reportDate) {
  const { categoryCounts, locationCounts, data } = result;

  const summary = {
    reportingDate: formatDate(new Date(reportDate)),
    totalEmployees: data.length,
    faculty: categoryCounts.faculty || 0,
    staff: categoryCounts.staff || 0,
    hsp: categoryCounts.hsp || 0,
    temp: (categoryCounts.temp || 0) + (categoryCounts.nbe || 0) + (categoryCounts.prn || 0),
    students: categoryCounts.student || 0,
    jesuits: categoryCounts.jesuit || 0,
    other: categoryCounts.other || 0,
    locations: {
      "Omaha Campus": locationCounts.omaha,
      "Phoenix Campus": locationCounts.phoenix
    },
    categories: categoryCounts
  };

  return summary;
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs();

  // Validate input
  if (!options.input) {
    console.error(`${colors.red}Error: Input file is required${colors.reset}`);
    printHelp();
    process.exit(1);
  }

  // Determine report date
  let reportDate;
  let fiscalPeriod;

  if (options.quarter) {
    try {
      const { fiscalYear, quarter } = parseFiscalPeriodKey(options.quarter);
      const dates = getQuarterDatesFromKey(options.quarter);
      reportDate = formatDate(dates.end);
      fiscalPeriod = options.quarter;
    } catch (error) {
      console.error(`${colors.red}Error: Invalid quarter format${colors.reset}`);
      console.error(error.message);
      process.exit(1);
    }
  } else if (options.date) {
    reportDate = options.date;
    fiscalPeriod = getFiscalPeriodKey(new Date(reportDate));
  } else {
    console.error(`${colors.red}Error: Either --quarter or --date is required${colors.reset}`);
    printHelp();
    process.exit(1);
  }

  console.log(`${colors.cyan}Report Date: ${reportDate}${colors.reset}`);
  console.log(`${colors.cyan}Fiscal Period: ${fiscalPeriod}${colors.reset}\n`);

  // Process file
  const result = processWorkforceExcel(options.input, options);

  // Generate summary
  const summary = generateWorkforceSummary(result, reportDate);

  // Create output directory
  const outputDir = options.output || path.join(
    __dirname,
    '..',
    'source-metrics',
    'workforce',
    'cleaned',
    fiscalPeriod
  );

  if (!options.dryRun) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save cleaned data
  const dataOutputPath = path.join(outputDir, 'workforce_cleaned.json');
  const summaryOutputPath = path.join(outputDir, 'workforce_summary.json');

  if (!options.dryRun) {
    fs.writeFileSync(dataOutputPath, JSON.stringify(result.data, null, 2));
    fs.writeFileSync(summaryOutputPath, JSON.stringify(summary, null, 2));
    console.log(`\n${colors.green}✓${colors.reset} Saved cleaned data: ${dataOutputPath}`);
    console.log(`${colors.green}✓${colors.reset} Saved summary: ${summaryOutputPath}`);
  } else {
    console.log(`\n${colors.yellow}[DRY RUN]${colors.reset} Would save to: ${dataOutputPath}`);
    console.log(`${colors.yellow}[DRY RUN]${colors.reset} Would save to: ${summaryOutputPath}`);
  }

  // Generate audit trail
  const auditTrail = createAuditTrail({
    source: 'Oracle HCM',
    sourceFile: options.input,
    dataType: 'workforce',
    fiscalPeriod,
    stats: result.stats
  });

  const auditReport = generateAuditReport(auditTrail, {
    transformations: result.transformations,
    piiRemoved: result.piiFieldsRemoved,
    warnings: result.stats.emptyRowsSkipped > 0
      ? [`Skipped ${result.stats.emptyRowsSkipped} empty rows`]
      : []
  });

  const auditPath = path.join(outputDir, 'AUDIT_TRAIL.md');

  if (!options.dryRun) {
    saveAuditTrail(auditReport, auditPath);
    console.log(`${colors.green}✓${colors.reset} Saved audit trail: ${auditPath}`);
  } else {
    console.log(`${colors.yellow}[DRY RUN]${colors.reset} Would save audit trail to: ${auditPath}`);
  }

  // Summary
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.green}✓ Processing Complete${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`\n${colors.cyan}Summary:${colors.reset}`);
  console.log(`  Total Employees: ${summary.totalEmployees}`);
  console.log(`  Faculty: ${summary.faculty}`);
  console.log(`  Staff: ${summary.staff}`);
  console.log(`  HSP: ${summary.hsp}`);
  console.log(`  Temp: ${summary.temp}`);
  console.log(`  Students: ${summary.students}`);
  console.log(`  Quality Score: ${auditTrail.qualityScore}/100\n`);

  if (options.dryRun) {
    console.log(`${colors.yellow}This was a dry run. No files were saved.${colors.reset}\n`);
  } else {
    console.log(`${colors.green}Next steps:${colors.reset}`);
    console.log(`  1. Review audit trail: ${path.basename(auditPath)}`);
    console.log(`  2. Verify data quality score is acceptable (>70)`);
    console.log(`  3. Run merge script to update staticData.js`);
    console.log(`  4. Test dashboard with new data\n`);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = {
  processWorkforceExcel,
  generateWorkforceSummary,
  categorizeEmployee
};
