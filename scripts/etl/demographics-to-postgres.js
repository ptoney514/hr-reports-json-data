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
const { sql, endPool, checkConnection } = require('./neon-client');

const { excelDateToJSDate, formatDate, sheetToJSON } = require('../utils/excel-helpers');
const { getFiscalPeriodKey, getQuarterDatesFromKey } = require('../utils/fiscal-calendar');
const { colors, printBanner, printComplete, success, info, warning, error: logError } = require('../utils/formatting');
const { parseArgs } = require('../utils/cli-parser');
const { startAudit, completeAudit } = require('../utils/etl-runner');
const { loadConfig } = require('../utils/config-loader');
const { createResolver } = require('../utils/column-resolver');
const { autoDetectLargestSheet, findDefaultInputFile } = require('../utils/workbook-loader');
const { loadExcelFile } = require('../utils/excel-helpers');

const config = loadConfig();
const resolve = createResolver('demographics-to-postgres');

const SCRIPT_OPTIONS = [
  { flags: '--input,-i', key: 'input', type: 'string', description: 'Input Excel file path (default: auto-detect)' },
  { flags: '--date,-d', key: 'date', type: 'string', description: 'Report date (YYYY-MM-DD format)' },
  { flags: '--quarter,-q', key: 'quarter', type: 'string', description: 'Fiscal period (e.g., FY25_Q4)' }
];

const HELP_CONFIG = {
  title: 'Demographics Data ETL to Postgres',
  usage: [
    'node scripts/etl/demographics-to-postgres.js --date 2025-06-30',
    'node scripts/etl/demographics-to-postgres.js --input file.xlsx --date 2025-06-30',
    'node scripts/etl/demographics-to-postgres.js --quarter FY25_Q4'
  ],
  examples: [
    '# Load FY25 Q4 demographics',
    'npm run etl:demographics -- --date 2025-06-30',
    '',
    '# Dry run to preview changes',
    'npm run etl:demographics -- --date 2025-06-30 --dry-run'
  ]
};

/**
 * Normalize ethnicity values for consistency
 */
function normalizeEthnicity(ethnicity) {
  if (!ethnicity) return config.defaults.ethnicity_default;
  const trimmed = ethnicity.trim();
  return config.ethnicity_normalization[trimmed.toLowerCase()] || trimmed;
}

/**
 * Determine location from row data
 */
function getLocation(row) {
  const locationRaw = resolve(row, 'location') || '';
  return locationRaw.toString().toLowerCase().includes(config.locations.detection_keyword)
    ? 'phoenix' : 'omaha';
}

/**
 * Check if employee is benefit eligible
 */
function isBenefitEligible(assignmentCategory) {
  if (!assignmentCategory) return false;
  const code = assignmentCategory.toString().trim().toUpperCase();
  return config.categories.benefit_eligible.includes(code);
}

/**
 * Get person type (faculty/staff)
 */
function getPersonType(row) {
  const personType = resolve(row, 'person_type') || '';
  return config.person_types.faculty.includes(personType.toString().toUpperCase()) ? 'faculty' : 'staff';
}

/**
 * Parse demographic data from Excel row
 */
function parseDemographicRow(row) {
  return {
    gender: resolve(row, 'gender'),
    ethnicity: resolve(row, 'ethnicity'),
    ageBand: resolve(row, 'age_band'),
    assignmentCategory: resolve(row, 'assignment_category', { normalize: true }),
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

    if (!isBenefitEligible(demo.assignmentCategory)) return;

    const location = demo.location;
    const category = demo.personType;

    // Aggregate gender
    if (demo.gender) {
      const genderKey = `${location}|${category}|${demo.gender}`;
      if (!aggregations.gender[genderKey]) {
        aggregations.gender[genderKey] = {
          periodDate, location, categoryType: category,
          demographicType: 'gender', demographicValue: demo.gender, count: 0
        };
      }
      aggregations.gender[genderKey].count++;

      const combinedKey = `combined|${category}|${demo.gender}`;
      if (!aggregations.gender[combinedKey]) {
        aggregations.gender[combinedKey] = {
          periodDate, location: 'combined', categoryType: category,
          demographicType: 'gender', demographicValue: demo.gender, count: 0
        };
      }
      aggregations.gender[combinedKey].count++;
    }

    // Aggregate ethnicity
    {
      const ethnicity = normalizeEthnicity(demo.ethnicity || '');
      const ethnicityKey = `${location}|${category}|${ethnicity}`;
      if (!aggregations.ethnicity[ethnicityKey]) {
        aggregations.ethnicity[ethnicityKey] = {
          periodDate, location, categoryType: category,
          demographicType: 'ethnicity', demographicValue: ethnicity, count: 0
        };
      }
      aggregations.ethnicity[ethnicityKey].count++;

      const combinedKey = `combined|${category}|${ethnicity}`;
      if (!aggregations.ethnicity[combinedKey]) {
        aggregations.ethnicity[combinedKey] = {
          periodDate, location: 'combined', categoryType: category,
          demographicType: 'ethnicity', demographicValue: ethnicity, count: 0
        };
      }
      aggregations.ethnicity[combinedKey].count++;
    }

    // Aggregate age bands
    if (demo.ageBand) {
      const ageBandKey = `${location}|${category}|${demo.ageBand}`;
      if (!aggregations.age_band[ageBandKey]) {
        aggregations.age_band[ageBandKey] = {
          periodDate, location, categoryType: category,
          demographicType: 'age_band', demographicValue: demo.ageBand, count: 0
        };
      }
      aggregations.age_band[ageBandKey].count++;

      const combinedKey = `combined|${category}|${demo.ageBand}`;
      if (!aggregations.age_band[combinedKey]) {
        aggregations.age_band[combinedKey] = {
          periodDate, location: 'combined', categoryType: category,
          demographicType: 'age_band', demographicValue: demo.ageBand, count: 0
        };
      }
      aggregations.age_band[combinedKey].count++;
    }
  });

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
    } catch (err) {
      console.error(`  ${colors.red}Error upserting ${agg.location}/${agg.categoryType}/${agg.demographicType}:${colors.reset} ${err.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs('demographics-to-postgres', SCRIPT_OPTIONS, HELP_CONFIG);

  printBanner('Demographics ETL to Postgres');

  // Check connection
  info('Checking database connection...');
  const connected = await checkConnection();
  if (!connected) {
    logError('Failed to connect to database.');
    process.exit(1);
  }
  success('Connected\n');

  // Determine period date
  let periodDate;
  if (options.date) {
    periodDate = options.date;
  } else if (options.quarter) {
    const dates = getQuarterDatesFromKey(options.quarter);
    periodDate = formatDate(dates.end);
  } else {
    periodDate = config.defaults.default_period_date;
    warning(`No date specified, using default: ${periodDate}`);
  }

  const fiscalPeriod = getFiscalPeriodKey(new Date(periodDate));
  console.log(`${colors.cyan}Period Date: ${periodDate}${colors.reset}`);
  console.log(`${colors.cyan}Fiscal Period: ${fiscalPeriod}${colors.reset}\n`);

  // Find input file
  const workforceDir = path.join(__dirname, '..', '..', 'source-metrics', 'workforce-headcount');
  let sourceFile = options.input || findDefaultInputFile(workforceDir, [
    'New Emp List since FY20 to Q1FY25 1031 PT.xlsx',
    'New Emp List since FY20 to Q1FY25 1031 PT 12-9-2025.xlsx'
  ]);

  if (!sourceFile) {
    logError('Error: No input file found. Specify with --input');
    process.exit(1);
  }
  if (!fs.existsSync(sourceFile)) {
    logError(`Error: File not found: ${sourceFile}`);
    process.exit(1);
  }

  info(`Loading Excel: ${path.basename(sourceFile)}`);

  // Load Excel data
  const workbook = loadExcelFile(sourceFile);
  const { sheetName } = autoDetectLargestSheet(workbook);
  let rows = sheetToJSON(workbook, sheetName);
  success(`Loaded ${rows.length.toLocaleString()} rows from sheet "${sheetName}"\n`);

  // Filter for current employees (END DATE matches period)
  info(`Filtering for employees as of ${periodDate} (converting Excel serial dates)...`);
  rows = rows.filter(row => {
    const endDate = row['END DATE'];
    if (typeof endDate !== 'number') return false;
    const converted = formatDate(excelDateToJSDate(endDate));
    return converted === periodDate;
  });

  if (rows.length === 0) {
    logError(`FATAL: No rows matched period_date ${periodDate}. Check that the Excel file contains data for this period.`);
    await endPool();
    process.exit(1);
  }
  success(`${rows.length.toLocaleString()} employees as of ${periodDate}\n`);

  // Filter for benefit eligible
  info('Filtering for benefit-eligible employees...');
  const benefitEligible = rows.filter(row => isBenefitEligible(resolve(row, 'assignment_category')));
  const facultyCount = benefitEligible.filter(r => getPersonType(r) === 'faculty').length;
  const staffCount = benefitEligible.filter(r => getPersonType(r) === 'staff').length;

  success(`${benefitEligible.length.toLocaleString()} benefit-eligible employees`);
  console.log(`  Faculty: ${facultyCount.toLocaleString()}`);
  console.log(`  Staff: ${staffCount.toLocaleString()}\n`);

  // Start audit log
  const loadId = await startAudit({
    loadType: 'demographics',
    sourceFile,
    periodDate,
    fiscalPeriod,
    dryRun: options.dryRun
  });

  // Aggregate demographics
  info('Aggregating demographics data...');
  let aggregations = aggregateDemographics(benefitEligible, periodDate);
  success(`Created ${aggregations.length} aggregations\n`);

  // Calculate percentages
  info('Calculating percentages...');
  aggregations = calculatePercentages(aggregations);
  success('Percentages calculated\n');

  // Display summary
  const genderCount = aggregations.filter(a => a.demographicType === 'gender' && a.location === 'combined').length;
  const ethnicityCount = aggregations.filter(a => a.demographicType === 'ethnicity' && a.location === 'combined').length;
  const ageBandCount = aggregations.filter(a => a.demographicType === 'age_band' && a.location === 'combined').length;

  console.log(`${colors.cyan}Summary (combined location):${colors.reset}`);
  console.log(`  Gender values: ${genderCount}`);
  console.log(`  Ethnicity values: ${ethnicityCount}`);
  console.log(`  Age band values: ${ageBandCount}`);
  console.log(`  Total: ${genderCount + ethnicityCount + ageBandCount}\n`);

  // Upsert to database
  info(`${options.dryRun ? '[DRY RUN] ' : ''}Upserting to database...`);
  const { inserted, updated, errored } = await upsertDemographicsData(
    aggregations, path.basename(sourceFile), options.dryRun
  );
  success(`Inserted: ${inserted}, Updated: ${updated}, Errors: ${errored}\n`);

  // Complete audit log
  await completeAudit(loadId, {
    recordsRead: benefitEligible.length,
    inserted, updated, errored
  });

  printComplete('Demographics ETL Complete');
  await endPool();
}

main().catch(async err => {
  console.error(`\n${colors.red}Fatal error: ${err.message}${colors.reset}`);
  console.error(err.stack);
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
