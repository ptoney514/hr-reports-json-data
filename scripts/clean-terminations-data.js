#!/usr/bin/env node

/**
 * Terminations Data Cleaner
 *
 * Processes raw Oracle HCM termination Excel exports and converts to clean JSON
 * - Reads Excel from source-metrics/terminations/raw/
 * - Removes PII
 * - Categorizes termination types (voluntary, involuntary, retirement)
 * - Calculates tenure
 * - Generates JSON matching staticData.js format
 * - Creates audit trail
 * - Saves to source-metrics/terminations/cleaned/
 *
 * Usage:
 *   node scripts/clean-terminations-data.js --input file.xlsx --quarter FY25_Q2
 *   node scripts/clean-terminations-data.js --input file.xlsx --date 2024-12-31
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
  parseFiscalPeriodKey,
  getQuarterDatesFromKey,
  isDateInFiscalYear,
  getFiscalYear
} = require('./utils/fiscal-calendar');

const {
  removePII,
  createPIIReport
} = require('./utils/pii-removal');

const {
  validateTerminationRow,
  createValidationReport
} = require('./utils/validation');

const {
  createAuditTrail,
  generateAuditReport,
  saveAuditTrail
} = require('./utils/audit-generator');

// Color codes
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
  const options = {
    input: null,
    quarter: null,
    date: null,
    fiscalYear: null,
    output: null,
    dryRun: false,
    sheet: null
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
      case '--fiscal-year':
      case '--fy':
        options.fiscalYear = args[++i];
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--sheet':
        options.sheet = args[++i];
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
${colors.cyan}Terminations Data Cleaner${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node scripts/clean-terminations-data.js --input file.xlsx --quarter FY25_Q2
  node scripts/clean-terminations-data.js --input file.xlsx --fiscal-year 2025

${colors.yellow}Options:${colors.reset}
  -i, --input FILE       Input Excel file path (required)
  -q, --quarter PERIOD   Fiscal period (e.g., FY25_Q2)
  --fy, --fiscal-year FY Fiscal year to filter (e.g., 2025 for FY25)
  -d, --date DATE        Report date (YYYY-MM-DD format)
  --sheet NAME           Sheet name to process (default: auto-detect)
  -o, --output DIR       Output directory (default: auto-generated)
  --dry-run              Preview changes without saving files

${colors.yellow}Examples:${colors.reset}
  # Process all FY25 terminations
  node scripts/clean-terminations-data.js \\
    --input source-metrics/terms/fy25/terms.xlsx \\
    --fiscal-year 2025

  # Process specific quarter
  node scripts/clean-terminations-data.js \\
    --input data.xlsx \\
    --quarter FY25_Q2

${colors.yellow}Notes:${colors.reset}
  - Filters terminations by Term Date within fiscal year/quarter
  - Removes PII automatically
  - Categorizes as Voluntary, Involuntary, or Retirement
  - Calculates tenure (days, years)
`);
}

/**
 * Categorize termination type
 */
function categorizeTerminationType(termReason1, termReason2) {
  const reason = (termReason1 || termReason2 || '').toString().toLowerCase();

  // Retirement
  if (reason.includes('retire')) {
    return 'Retirement';
  }

  // Voluntary
  if (
    reason.includes('resignation') ||
    reason.includes('resign') ||
    reason.includes('voluntary') ||
    reason.includes('better opportunity') ||
    reason.includes('personal') ||
    reason.includes('career change') ||
    reason.includes('end assignment')
  ) {
    return 'Voluntary';
  }

  // Involuntary
  if (
    reason.includes('termination') ||
    reason.includes('involuntary') ||
    reason.includes('performance') ||
    reason.includes('policy') ||
    reason.includes('layoff') ||
    reason.includes('reduction')
  ) {
    return 'Involuntary';
  }

  // Default to voluntary if unclear
  return 'Voluntary';
}

/**
 * Calculate tenure in days
 */
function calculateTenure(hireDate, termDate) {
  if (!hireDate || !termDate) return null;

  const hire = typeof hireDate === 'string' ? new Date(hireDate) : hireDate;
  const term = typeof termDate === 'string' ? new Date(termDate) : termDate;

  if (isNaN(hire) || isNaN(term)) return null;

  const diffMs = term - hire;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Process terminations Excel file
 */
function processTerminationsExcel(filePath, options = {}) {
  const transformations = [];
  let stats = {
    totalRows: 0,
    validRows: 0,
    invalidRows: 0,
    emptyRowsSkipped: 0,
    filteredOut: 0
  };

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}   Terminations Data Cleaner${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  // Load Excel file
  console.log(`${colors.blue}Loading Excel file...${colors.reset}`);
  const workbook = loadExcelFile(filePath);

  // Get sheet names and select the one with data
  const sheetNames = getSheetNames(workbook);
  console.log(`${colors.green}✓${colors.reset} Found ${sheetNames.length} sheets: ${sheetNames.join(', ')}`);

  // Auto-detect sheet with most rows
  let targetSheet = options.sheet;
  if (!targetSheet) {
    let maxRows = 0;
    sheetNames.forEach(name => {
      const data = sheetToJSON(workbook, name);
      if (data.length > maxRows) {
        maxRows = data.length;
        targetSheet = name;
      }
    });
  }

  console.log(`${colors.blue}Processing sheet: ${targetSheet}${colors.reset}`);

  // Convert to JSON
  const rawData = sheetToJSON(workbook, targetSheet);
  stats.totalRows = rawData.length;
  console.log(`${colors.green}✓${colors.reset} Loaded ${rawData.length} rows`);

  // Filter by fiscal year/quarter if specified
  let filterStartDate, filterEndDate;

  if (options.fiscalYear) {
    const fy = parseInt(options.fiscalYear);
    filterStartDate = new Date(fy - 1, 6, 1); // July 1
    filterEndDate = new Date(fy, 5, 30); // June 30
    console.log(`${colors.blue}Filtering for FY${options.fiscalYear}: ${formatDate(filterStartDate)} to ${formatDate(filterEndDate)}${colors.reset}`);
  } else if (options.quarter) {
    const { start, end } = getQuarterDatesFromKey(options.quarter);
    filterStartDate = start;
    filterEndDate = end;
    console.log(`${colors.blue}Filtering for ${options.quarter}: ${formatDate(start)} to ${formatDate(end)}${colors.reset}`);
  }

  // Process rows
  console.log(`\n${colors.blue}Processing data...${colors.reset}`);

  const processedData = [];
  const typeCounts = { Voluntary: 0, Involuntary: 0, Retirement: 0 };
  const reasonCounts = {};
  const schoolCounts = {};
  const piiFieldsRemoved = new Set();

  rawData.forEach((row, index) => {
    // Skip empty rows
    const hasData = Object.values(row).some(val => val !== null && val !== undefined && val !== '');
    if (!hasData) {
      stats.emptyRowsSkipped++;
      return;
    }

    // Convert Excel dates
    const termDateRaw = row['Term Date'] || row['Termination Date'] || row['term_date'];
    const hireDateRaw = row['Hire Date'] || row['hire_date'];

    let termDate = termDateRaw;
    let hireDate = hireDateRaw;

    if (isExcelDate(termDateRaw)) {
      termDate = formatDate(excelDateToJSDate(termDateRaw));
    }

    if (isExcelDate(hireDateRaw)) {
      hireDate = formatDate(excelDateToJSDate(hireDateRaw));
    }

    // Filter by date if specified
    if (filterStartDate && filterEndDate && termDate) {
      const term = new Date(termDate);
      if (term < filterStartDate || term > filterEndDate) {
        stats.filteredOut++;
        return;
      }
    }

    // Remove PII
    const cleanedRow = removePII(row, { hashIds: true });

    // Track PII removal
    Object.keys(row).forEach(key => {
      if (!cleanedRow[key] && row[key]) {
        piiFieldsRemoved.add(key);
      }
    });

    // Add termination info
    const termReason1 = row['Term Reason 1'] || row['term_reason_1'];
    const termReason2 = row['Term Reason 2'] || row['term_reason_2'];
    const terminationType = categorizeTerminationType(termReason1, termReason2);

    cleanedRow.termination_date = termDate;
    cleanedRow.hire_date = hireDate;
    cleanedRow.termination_type = terminationType;
    cleanedRow.termination_reason = termReason1 || termReason2 || 'Unknown';

    // Calculate tenure
    if (hireDate && termDate) {
      const tenureDays = calculateTenure(hireDate, termDate);
      if (tenureDays !== null) {
        cleanedRow.tenure_days = tenureDays;
        cleanedRow.tenure_years = (tenureDays / 365).toFixed(1);
      }
    }

    // Track school/department
    const school = row['School'] || row['school'] || row['VP Area'];
    if (school) {
      cleanedRow.school = school;
      schoolCounts[school] = (schoolCounts[school] || 0) + 1;
    }

    // Count by type
    typeCounts[terminationType]++;

    // Count by reason
    const reason = cleanedRow.termination_reason;
    reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;

    processedData.push(cleanedRow);
    stats.validRows++;
  });

  console.log(`${colors.green}✓${colors.reset} Processed ${stats.validRows} valid terminations`);
  console.log(`${colors.yellow}!${colors.reset} Skipped ${stats.emptyRowsSkipped} empty rows`);
  if (stats.filteredOut > 0) {
    console.log(`${colors.yellow}!${colors.reset} Filtered out ${stats.filteredOut} rows (outside date range)`);
  }

  // Summary
  console.log(`\n${colors.cyan}Termination Type Breakdown:${colors.reset}`);
  Object.entries(typeCounts).forEach(([type, count]) => {
    const pct = ((count / stats.validRows) * 100).toFixed(1);
    console.log(`  ${type}: ${count} (${pct}%)`);
  });

  console.log(`\n${colors.cyan}Top Termination Reasons:${colors.reset}`);
  const topReasons = Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  topReasons.forEach(([reason, count]) => {
    console.log(`  ${reason}: ${count}`);
  });

  return {
    data: processedData,
    stats,
    transformations,
    typeCounts,
    reasonCounts,
    schoolCounts,
    piiFieldsRemoved: Array.from(piiFieldsRemoved)
  };
}

/**
 * Generate terminations summary
 */
function generateTerminationsSummary(result, reportDate) {
  const { typeCounts, reasonCounts, schoolCounts, data, stats } = result;

  // Top exit reasons
  const exitReasons = Object.entries(reasonCounts)
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: ((count / stats.validRows) * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // School turnover
  const schoolTurnover = Object.entries(schoolCounts)
    .map(([school, count]) => ({
      school,
      departures: count
    }))
    .sort((a, b) => b.departures - a.departures)
    .slice(0, 10);

  const summary = {
    reportingDate: formatDate(new Date(reportDate)),
    totalTerminations: stats.validRows,
    voluntaryCount: typeCounts.Voluntary || 0,
    involuntaryCount: typeCounts.Involuntary || 0,
    retirementCount: typeCounts.Retirement || 0,
    voluntaryPct: ((typeCounts.Voluntary / stats.validRows) * 100).toFixed(1),
    involuntaryPct: ((typeCounts.Involuntary / stats.validRows) * 100).toFixed(1),
    retirementPct: ((typeCounts.Retirement / stats.validRows) * 100).toFixed(1),
    exitReasons,
    schoolTurnover
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

  if (!options.quarter && !options.fiscalYear && !options.date) {
    console.error(`${colors.red}Error: Either --quarter, --fiscal-year, or --date is required${colors.reset}`);
    printHelp();
    process.exit(1);
  }

  // Determine fiscal period
  let fiscalPeriod, reportDate;

  if (options.quarter) {
    const dates = getQuarterDatesFromKey(options.quarter);
    reportDate = formatDate(dates.end);
    fiscalPeriod = options.quarter;
  } else if (options.fiscalYear) {
    const fy = parseInt(options.fiscalYear);
    reportDate = `${fy}-06-30`; // End of fiscal year
    fiscalPeriod = `FY${options.fiscalYear.toString().slice(-2)}`;
  } else {
    reportDate = options.date;
    fiscalPeriod = getFiscalPeriodKey(new Date(reportDate));
  }

  console.log(`${colors.cyan}Report Date: ${reportDate}${colors.reset}`);
  console.log(`${colors.cyan}Fiscal Period: ${fiscalPeriod}${colors.reset}\n`);

  // Process file
  const result = processTerminationsExcel(options.input, options);

  // Generate summary
  const summary = generateTerminationsSummary(result, reportDate);

  // Create output directory
  const outputDir = options.output || path.join(
    __dirname,
    '..',
    'source-metrics',
    'terminations',
    'cleaned',
    fiscalPeriod
  );

  if (!options.dryRun) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save files
  const dataPath = path.join(outputDir, 'terminations_cleaned.json');
  const summaryPath = path.join(outputDir, 'terminations_summary.json');

  if (!options.dryRun) {
    fs.writeFileSync(dataPath, JSON.stringify(result.data, null, 2));
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`\n${colors.green}✓${colors.reset} Saved cleaned data: ${dataPath}`);
    console.log(`${colors.green}✓${colors.reset} Saved summary: ${summaryPath}`);
  } else {
    console.log(`\n${colors.yellow}[DRY RUN]${colors.reset} Would save to: ${dataPath}`);
    console.log(`${colors.yellow}[DRY RUN]${colors.reset} Would save to: ${summaryPath}`);
  }

  // Generate audit trail
  const auditTrail = createAuditTrail({
    source: 'Oracle HCM',
    sourceFile: options.input,
    dataType: 'terminations',
    fiscalPeriod,
    stats: result.stats
  });

  const auditReport = generateAuditReport(auditTrail, {
    transformations: result.transformations,
    piiRemoved: result.piiFieldsRemoved,
    warnings: result.stats.filteredOut > 0 ? [`Filtered ${result.stats.filteredOut} records outside date range`] : []
  });

  const auditPath = path.join(outputDir, 'AUDIT_TRAIL.md');

  if (!options.dryRun) {
    saveAuditTrail(auditReport, auditPath);
    console.log(`${colors.green}✓${colors.reset} Saved audit trail: ${auditPath}`);
  }

  // Summary
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.green}✓ Processing Complete${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);
  console.log(`Total Terminations: ${summary.totalTerminations}`);
  console.log(`  Voluntary: ${summary.voluntaryCount} (${summary.voluntaryPct}%)`);
  console.log(`  Involuntary: ${summary.involuntaryCount} (${summary.involuntaryPct}%)`);
  console.log(`  Retirement: ${summary.retirementCount} (${summary.retirementPct}%)`);
  console.log(`  Quality Score: ${auditTrail.qualityScore}/100\n`);

  if (options.dryRun) {
    console.log(`${colors.yellow}This was a dry run. No files were saved.${colors.reset}\n`);
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
  processTerminationsExcel,
  generateTerminationsSummary,
  categorizeTerminationType,
  calculateTenure
};
