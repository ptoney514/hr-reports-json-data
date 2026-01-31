#!/usr/bin/env node

/**
 * Demographics Data ETL to Postgres
 *
 * Processes workforce Excel data and loads demographic data to Neon Postgres
 * - Reads Excel from source-metrics/workforce-headcount/
 * - Filters for benefit-eligible employees
 * - Aggregates by gender, ethnicity, and age bands
 * - Upserts to fact_workforce_demographics
 *
 * Usage:
 *   node scripts/etl/demographics-to-postgres.js --date 2025-06-30
 *   node scripts/etl/demographics-to-postgres.js --input file.xlsx --date 2025-06-30
 *   node scripts/etl/demographics-to-postgres.js --dry-run --date 2025-06-30
 */

const fs = require('fs');
const path = require('path');
const { sql, endPool, startAuditLog, completeAuditLog, checkConnection } = require('./neon-client');

// Import existing utilities
const {
  loadExcelFile,
  sheetToJSON,
  getSheetNames
} = require('../utils/excel-helpers');

const {
  getFiscalPeriodKey,
  getQuarterDatesFromKey
} = require('../utils/fiscal-calendar');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Assignment category classifications for benefit-eligible
const BENEFIT_ELIGIBLE_CATEGORIES = ['F12', 'F11', 'F09', 'F10', 'PT12', 'PT10', 'PT9', 'PT11'];

// Date constants for filtering
const EXCEL_DATE_MAP = {
  '2025-06-30': 45838,  // FY25 Q4
  '2025-03-31': 45747,  // FY25 Q3
  '2024-12-31': 45657,  // FY25 Q2
  '2024-09-30': 45565,  // FY25 Q1
  '2024-06-30': 45473   // FY24 Q4
};

// Ethnicity normalization map - normalizes Excel values to match staticData.js format
// Keys must be lowercase for the normalizeEthnicity lookup
const ETHNICITY_NORMALIZATION = {
  'i am hispanic or latino.': 'Hispanic or Latino'
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: null,
    date: null,
    quarter: null,
    dryRun: false,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
      case '-i':
        options.input = args[++i];
        break;
      case '--date':
      case '-d':
        options.date = args[++i];
        break;
      case '--quarter':
      case '-q':
        options.quarter = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
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

/**
 * Print help message
 */
function printHelp() {
  console.log(`
${colors.cyan}Demographics Data ETL to Postgres${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node scripts/etl/demographics-to-postgres.js --date 2025-06-30
  node scripts/etl/demographics-to-postgres.js --input file.xlsx --date 2025-06-30
  node scripts/etl/demographics-to-postgres.js --quarter FY25_Q4

${colors.yellow}Options:${colors.reset}
  -i, --input FILE      Input Excel file path (default: auto-detect)
  -d, --date DATE       Report date (YYYY-MM-DD format)
  -q, --quarter PERIOD  Fiscal period (e.g., FY25_Q4)
  --dry-run             Preview without database writes
  -v, --verbose         Show detailed output
  -h, --help            Show this help message

${colors.yellow}Examples:${colors.reset}
  # Load FY25 Q4 demographics
  npm run etl:demographics -- --date 2025-06-30

  # Dry run to preview changes
  npm run etl:demographics -- --date 2025-06-30 --dry-run
`);
}

/**
 * Normalize ethnicity values for consistency
 */
function normalizeEthnicity(ethnicity) {
  if (!ethnicity) return 'Not Disclosed';
  const trimmed = ethnicity.trim();

  // Check normalization map
  if (ETHNICITY_NORMALIZATION[trimmed.toLowerCase()]) {
    return ETHNICITY_NORMALIZATION[trimmed.toLowerCase()];
  }

  return trimmed;
}

/**
 * Determine location from row data
 */
function getLocation(row) {
  const locationRaw = row.Location || row.location || row.LOCATION || row.State || '';
  return locationRaw.toString().toLowerCase().includes('phoenix') ? 'phoenix' : 'omaha';
}

/**
 * Check if employee is benefit eligible
 */
function isBenefitEligible(assignmentCategory) {
  if (!assignmentCategory) return false;
  const code = assignmentCategory.toString().trim().toUpperCase();
  return BENEFIT_ELIGIBLE_CATEGORIES.includes(code);
}

/**
 * Get person type (faculty/staff)
 */
function getPersonType(row) {
  const personType = row['Person Type'] || row.personType || '';
  return personType.toString().toUpperCase() === 'FACULTY' ? 'faculty' : 'staff';
}

/**
 * Parse demographic data from Excel row
 */
function parseDemographicRow(row) {
  return {
    gender: row['Gender'] || row.gender || null,
    ethnicity: row['Employee Ethnicity'] || row['Ethnicity'] || row.ethnicity || null,
    ageBand: row['Age Band'] || row['AgeBand'] || row.ageBand || null,
    assignmentCategory: row['Assignment Category Code'] || row.assignmentCategoryCode || null,
    personType: getPersonType(row),
    location: getLocation(row)
  };
}

/**
 * Aggregate demographics data
 */
function aggregateDemographics(rows, periodDate) {
  const aggregations = {
    gender: {},
    ethnicity: {},
    age_band: {}
  };

  rows.forEach(row => {
    const demo = parseDemographicRow(row);

    // Skip non-benefit-eligible
    if (!isBenefitEligible(demo.assignmentCategory)) return;

    const location = demo.location;
    const category = demo.personType;

    // Aggregate gender
    if (demo.gender) {
      const genderKey = `${location}|${category}|${demo.gender}`;
      if (!aggregations.gender[genderKey]) {
        aggregations.gender[genderKey] = {
          periodDate,
          location,
          categoryType: category,
          demographicType: 'gender',
          demographicValue: demo.gender,
          count: 0
        };
      }
      aggregations.gender[genderKey].count++;

      // Also aggregate combined location
      const combinedKey = `combined|${category}|${demo.gender}`;
      if (!aggregations.gender[combinedKey]) {
        aggregations.gender[combinedKey] = {
          periodDate,
          location: 'combined',
          categoryType: category,
          demographicType: 'gender',
          demographicValue: demo.gender,
          count: 0
        };
      }
      aggregations.gender[combinedKey].count++;
    }

    // Aggregate ethnicity (normalize blank/null to "Not Disclosed")
    {
      const ethnicity = normalizeEthnicity(demo.ethnicity || '');
      const ethnicityKey = `${location}|${category}|${ethnicity}`;
      if (!aggregations.ethnicity[ethnicityKey]) {
        aggregations.ethnicity[ethnicityKey] = {
          periodDate,
          location,
          categoryType: category,
          demographicType: 'ethnicity',
          demographicValue: ethnicity,
          count: 0
        };
      }
      aggregations.ethnicity[ethnicityKey].count++;

      // Also aggregate combined location
      const combinedKey = `combined|${category}|${ethnicity}`;
      if (!aggregations.ethnicity[combinedKey]) {
        aggregations.ethnicity[combinedKey] = {
          periodDate,
          location: 'combined',
          categoryType: category,
          demographicType: 'ethnicity',
          demographicValue: ethnicity,
          count: 0
        };
      }
      aggregations.ethnicity[combinedKey].count++;
    }

    // Aggregate age bands
    if (demo.ageBand) {
      const ageBandKey = `${location}|${category}|${demo.ageBand}`;
      if (!aggregations.age_band[ageBandKey]) {
        aggregations.age_band[ageBandKey] = {
          periodDate,
          location,
          categoryType: category,
          demographicType: 'age_band',
          demographicValue: demo.ageBand,
          count: 0
        };
      }
      aggregations.age_band[ageBandKey].count++;

      // Also aggregate combined location
      const combinedKey = `combined|${category}|${demo.ageBand}`;
      if (!aggregations.age_band[combinedKey]) {
        aggregations.age_band[combinedKey] = {
          periodDate,
          location: 'combined',
          categoryType: category,
          demographicType: 'age_band',
          demographicValue: demo.ageBand,
          count: 0
        };
      }
      aggregations.age_band[combinedKey].count++;
    }
  });

  // Flatten all aggregations
  return [
    ...Object.values(aggregations.gender),
    ...Object.values(aggregations.ethnicity),
    ...Object.values(aggregations.age_band)
  ];
}

/**
 * Calculate percentages within each category
 */
function calculatePercentages(aggregations) {
  // Group by location, category, and demographic type to get totals
  const totals = {};

  aggregations.forEach(agg => {
    const key = `${agg.location}|${agg.categoryType}|${agg.demographicType}`;
    totals[key] = (totals[key] || 0) + agg.count;
  });

  return aggregations.map(agg => {
    const key = `${agg.location}|${agg.categoryType}|${agg.demographicType}`;
    const total = totals[key];
    const percentage = total > 0 ? Math.round((agg.count / total) * 10000) / 100 : 0;
    return { ...agg, percentage };
  });
}

/**
 * Upsert demographics data to Postgres
 */
async function upsertDemographicsData(aggregations, sourceFile, dryRun = false) {
  let inserted = 0;
  let updated = 0;
  let errored = 0;

  for (const agg of aggregations) {
    if (dryRun) {
      console.log(`  [DRY RUN] Would upsert: ${agg.location}/${agg.categoryType}/${agg.demographicType}/${agg.demographicValue}: ${agg.count}`);
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_workforce_demographics (
          period_date, location, category_type, demographic_type, demographic_value,
          count, percentage, source_file
        )
        VALUES (
          ${agg.periodDate}, ${agg.location}, ${agg.categoryType}, ${agg.demographicType}, ${agg.demographicValue},
          ${agg.count}, ${agg.percentage}, ${sourceFile}
        )
        ON CONFLICT (period_date, location, category_type, demographic_type, demographic_value)
        DO UPDATE SET
          count = EXCLUDED.count,
          percentage = EXCLUDED.percentage,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;

      if (result[0]?.inserted) {
        inserted++;
      } else {
        updated++;
      }
    } catch (error) {
      console.error(`  ${colors.red}Error upserting ${agg.location}/${agg.categoryType}/${agg.demographicType}:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Find the default input file
 */
function findDefaultInputFile() {
  const workforceDir = path.join(__dirname, '..', '..', 'source-metrics', 'workforce-headcount');

  // Look for the main workforce file
  const candidates = [
    'New Emp List since FY20 to Q1FY25 1031 PT.xlsx',
    'New Emp List since FY20 to Q1FY25 1031 PT 12-9-2025.xlsx'
  ];

  for (const candidate of candidates) {
    const fullPath = path.join(workforceDir, candidate);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  // Fall back to any xlsx file in the directory
  const files = fs.readdirSync(workforceDir)
    .filter(f => f.endsWith('.xlsx') && !f.startsWith('~'))
    .sort();

  if (files.length > 0) {
    return path.join(workforceDir, files[0]);
  }

  return null;
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs();

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}   Demographics ETL to Postgres${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  // Check connection
  console.log(`${colors.blue}Checking database connection...${colors.reset}`);
  const connected = await checkConnection();

  if (!connected) {
    console.error(`${colors.red}Failed to connect to database.${colors.reset}`);
    process.exit(1);
  }
  console.log(`${colors.green}✓${colors.reset} Connected\n`);

  // Determine period date
  let periodDate;

  if (options.date) {
    periodDate = options.date;
  } else if (options.quarter) {
    const dates = getQuarterDatesFromKey(options.quarter);
    periodDate = dates.end.toISOString().split('T')[0];
  } else {
    // Default to FY25 Q4
    periodDate = '2025-06-30';
    console.log(`${colors.yellow}No date specified, using default: ${periodDate}${colors.reset}`);
  }

  const fiscalPeriod = getFiscalPeriodKey(new Date(periodDate));

  console.log(`${colors.cyan}Period Date: ${periodDate}${colors.reset}`);
  console.log(`${colors.cyan}Fiscal Period: ${fiscalPeriod}${colors.reset}\n`);

  // Get the Excel date filter value
  const excelEndDate = EXCEL_DATE_MAP[periodDate];
  if (!excelEndDate) {
    console.warn(`${colors.yellow}Warning: No Excel date mapping for ${periodDate}, will load all current employees${colors.reset}`);
  }

  // Find input file
  let sourceFile = options.input || findDefaultInputFile();

  if (!sourceFile) {
    console.error(`${colors.red}Error: No input file found. Specify with --input${colors.reset}`);
    process.exit(1);
  }

  if (!fs.existsSync(sourceFile)) {
    console.error(`${colors.red}Error: File not found: ${sourceFile}${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.blue}Loading Excel: ${path.basename(sourceFile)}${colors.reset}`);

  // Load Excel data
  const workbook = loadExcelFile(sourceFile);
  const sheetNames = getSheetNames(workbook);
  const sheetName = sheetNames[0];
  let rows = sheetToJSON(workbook, sheetName);

  console.log(`${colors.green}✓${colors.reset} Loaded ${rows.length.toLocaleString()} rows from sheet "${sheetName}"\n`);

  // Filter for current employees (END DATE matches period)
  if (excelEndDate) {
    console.log(`${colors.blue}Filtering for employees as of ${periodDate} (END DATE = ${excelEndDate})...${colors.reset}`);
    rows = rows.filter(row => row['END DATE'] === excelEndDate);
    console.log(`${colors.green}✓${colors.reset} ${rows.length.toLocaleString()} employees as of ${periodDate}\n`);
  }

  // Filter for benefit eligible
  console.log(`${colors.blue}Filtering for benefit-eligible employees...${colors.reset}`);
  const benefitEligible = rows.filter(row => isBenefitEligible(row['Assignment Category Code']));

  const facultyCount = benefitEligible.filter(r => getPersonType(r) === 'faculty').length;
  const staffCount = benefitEligible.filter(r => getPersonType(r) === 'staff').length;

  console.log(`${colors.green}✓${colors.reset} ${benefitEligible.length.toLocaleString()} benefit-eligible employees`);
  console.log(`  Faculty: ${facultyCount.toLocaleString()}`);
  console.log(`  Staff: ${staffCount.toLocaleString()}\n`);

  // Start audit log
  let loadId = null;
  if (!options.dryRun) {
    loadId = await startAuditLog({
      loadType: 'demographics',
      sourceFile: path.basename(sourceFile),
      periodDate,
      fiscalPeriod
    });
    console.log(`${colors.blue}Audit log started (ID: ${loadId})${colors.reset}\n`);
  }

  // Aggregate demographics
  console.log(`${colors.blue}Aggregating demographics data...${colors.reset}`);
  let aggregations = aggregateDemographics(benefitEligible, periodDate);
  console.log(`${colors.green}✓${colors.reset} Created ${aggregations.length} aggregations\n`);

  // Calculate percentages
  console.log(`${colors.blue}Calculating percentages...${colors.reset}`);
  aggregations = calculatePercentages(aggregations);
  console.log(`${colors.green}✓${colors.reset} Percentages calculated\n`);

  // Display summary
  const genderCount = aggregations.filter(a => a.demographicType === 'gender' && a.location === 'combined').length;
  const ethnicityCount = aggregations.filter(a => a.demographicType === 'ethnicity' && a.location === 'combined').length;
  const ageBandCount = aggregations.filter(a => a.demographicType === 'age_band' && a.location === 'combined').length;

  console.log(`${colors.cyan}Summary (combined location):${colors.reset}`);
  console.log(`  Gender values: ${genderCount}`);
  console.log(`  Ethnicity values: ${ethnicityCount}`);
  console.log(`  Age band values: ${ageBandCount}`);
  console.log(`  Total: ${genderCount + ethnicityCount + ageBandCount}\n`);

  // Validate expected totals
  const combinedFacultyMale = aggregations.find(a =>
    a.location === 'combined' && a.categoryType === 'faculty' && a.demographicType === 'gender' && a.demographicValue === 'M'
  );
  const combinedFacultyFemale = aggregations.find(a =>
    a.location === 'combined' && a.categoryType === 'faculty' && a.demographicType === 'gender' && a.demographicValue === 'F'
  );
  const combinedStaffMale = aggregations.find(a =>
    a.location === 'combined' && a.categoryType === 'staff' && a.demographicType === 'gender' && a.demographicValue === 'M'
  );
  const combinedStaffFemale = aggregations.find(a =>
    a.location === 'combined' && a.categoryType === 'staff' && a.demographicType === 'gender' && a.demographicValue === 'F'
  );

  console.log(`${colors.cyan}Validation (gender totals):${colors.reset}`);
  console.log(`  Faculty Male: ${combinedFacultyMale?.count || 0} (expected: 321)`);
  console.log(`  Faculty Female: ${combinedFacultyFemale?.count || 0} (expected: 368)`);
  console.log(`  Staff Male: ${combinedStaffMale?.count || 0} (expected: 534)`);
  console.log(`  Staff Female: ${combinedStaffFemale?.count || 0} (expected: 914)\n`);

  // Upsert to database
  console.log(`${colors.blue}${options.dryRun ? '[DRY RUN] ' : ''}Upserting to database...${colors.reset}`);
  const { inserted, updated, errored } = await upsertDemographicsData(
    aggregations,
    path.basename(sourceFile),
    options.dryRun
  );

  console.log(`${colors.green}✓${colors.reset} Inserted: ${inserted}, Updated: ${updated}, Errors: ${errored}\n`);

  // Complete audit log
  if (loadId) {
    await completeAuditLog(loadId, {
      recordsRead: benefitEligible.length,
      recordsInserted: inserted,
      recordsUpdated: updated,
      recordsErrored: errored,
      status: errored > 0 ? 'completed' : 'completed',
      errorMessage: errored > 0 ? `${errored} records failed` : null
    });
  }

  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.green}✓ Demographics ETL Complete${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  await endPool();
}

main().catch(async error => {
  console.error(`\n${colors.red}Fatal error: ${error.message}${colors.reset}`);
  console.error(error.stack);
  await endPool();
  process.exit(1);
});

module.exports = {
  normalizeEthnicity,
  parseDemographicRow,
  isBenefitEligible,
  aggregateDemographics,
  calculatePercentages
};
