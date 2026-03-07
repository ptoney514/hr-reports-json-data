#!/usr/bin/env node

/**
 * Recruiting Metrics ETL to Postgres
 *
 * Processes Recruiting_Metrics_Master.xlsx and loads to Neon Postgres
 * - Reads all 12 sheets from the Excel file
 * - Validates data structure
 * - Hashes employee IDs for PII protection
 * - Upserts to appropriate fact tables
 *
 * Usage:
 *   node scripts/etl/recruiting-metrics-to-postgres.js
 *   node scripts/etl/recruiting-metrics-to-postgres.js --dry-run
 *   node scripts/etl/recruiting-metrics-to-postgres.js --input file.xlsx
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { sql, endPool, startAuditLog, completeAuditLog, checkConnection, getPool, upsert } = require('./neon-client');

const { sheetToJSON } = require('../utils/excel-helpers');
const { colors, printBanner, printComplete } = require('../utils/formatting');
const { parseArgs } = require('../utils/cli-parser');
const { loadWorkbook, findDefaultInputFile, validateRequiredSheets } = require('../utils/workbook-loader');
const { loadConfig } = require('../utils/config-loader');

const config = loadConfig();
const EXPECTED_SHEETS = config.expected_sheets.recruiting_metrics;

/**
 * Extract fiscal year and quarter from Metadata sheet
 */
function extractMetadata(workbook) {
  try {
    const rows = sheetToJSON(workbook, 'Metadata');
    const metadata = {};

    rows.forEach(row => {
      if (row.field && row.value !== undefined) {
        metadata[row.field] = row.value;
      }
    });

    return {
      fiscalYear: metadata.fiscal_year || null,
      fiscalQuarter: parseInt(metadata.fiscal_quarter) || null,
      fiscalPeriod: metadata.fiscal_period || null,
      dataAsOf: metadata.data_as_of || null
    };
  } catch (error) {
    console.warn(`${colors.yellow}Warning: Could not read Metadata sheet: ${error.message}${colors.reset}`);
    return {};
  }
}

/**
 * Hash employee identifier for PII protection
 */
function hashEmployeeId(name, hireDate) {
  const input = `${name}|${hireDate}`;
  return crypto.createHash('sha256').update(input).digest('hex').substring(0, 16);
}

/**
 * Upsert Summary Metrics
 */
async function upsertSummaryMetrics(workbook, sourceFile, dryRun, metadata) {
  const sheetName = 'Summary_Metrics';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (const row of rows) {
    const fiscalYear = row.fiscal_year || metadata.fiscalYear;
    const fiscalQuarter = row.fiscal_quarter || metadata.fiscalQuarter;

    if (dryRun) {
      console.log(`    [DRY RUN] ${fiscalYear}/Q${fiscalQuarter}: Total=${row.total_hires}, Faculty=${row.faculty_hires}, Staff=${row.staff_hires}`);
      inserted++;
      continue;
    }

    try {
      const result = await upsert(getPool(), 'fact_recruiting_summary', {
        fiscal_year: fiscalYear,
        fiscal_quarter: fiscalQuarter,
        total_hires: row.total_hires || 0,
        faculty_hires: row.faculty_hires || 0,
        staff_hires: row.staff_hires || 0,
        omaha_hires: row.omaha_hires || 0,
        phoenix_hires: row.phoenix_hires || 0,
        open_requisitions: row.open_requisitions ?? null,
        active_applications: row.active_applications ?? null,
        new_applications: row.new_applications ?? null,
        source_file: sourceFile
      }, ['fiscal_year', 'fiscal_quarter']);
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Hire Rates
 */
async function upsertHireRates(workbook, sourceFile, dryRun, metadata) {
  const sheetName = 'Hire_Rates';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (const row of rows) {
    const fiscalYear = row.fiscal_year || metadata.fiscalYear;
    const fiscalQuarter = row.fiscal_quarter || metadata.fiscalQuarter;

    if (dryRun) {
      console.log(`    [DRY RUN] ${fiscalYear}/Q${fiscalQuarter}/${row.source_system}/${row.channel}: ${row.hire_rate}%`);
      inserted++;
      continue;
    }

    try {
      const result = await upsert(getPool(), 'fact_hire_rates', {
        fiscal_year: fiscalYear,
        fiscal_quarter: fiscalQuarter,
        source_system: row.source_system,
        channel: row.channel,
        applications: row.applications || 0,
        hires: row.hires || 0,
        hire_rate: row.hire_rate ?? null,
        source_file: sourceFile
      }, ['fiscal_year', 'fiscal_quarter', 'source_system', 'channel']);
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Pipeline Staff (myJobs)
 */
async function upsertPipelineStaff(workbook, sourceFile, dryRun, metadata) {
  const sheetName = 'Pipeline_Staff';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (const row of rows) {
    const fiscalYear = row.fiscal_year || metadata.fiscalYear;
    const fiscalQuarter = row.fiscal_quarter || metadata.fiscalQuarter;

    if (dryRun) {
      console.log(`    [DRY RUN] ${fiscalYear}/Q${fiscalQuarter}: OpenReqs=${row.open_requisitions}, Hires=${row.total_hires}`);
      inserted++;
      continue;
    }

    try {
      const result = await upsert(getPool(), 'fact_pipeline_metrics_staff', {
        fiscal_year: fiscalYear,
        fiscal_quarter: fiscalQuarter,
        open_requisitions: row.open_requisitions ?? null,
        reqs_per_recruiter: row.reqs_per_recruiter ?? null,
        avg_days_open: row.avg_days_open ?? null,
        avg_time_to_fill: row.avg_time_to_fill ?? null,
        active_applications: row.active_applications ?? null,
        new_applications: row.new_applications ?? null,
        apps_per_req: row.apps_per_req ?? null,
        internal_app_percentage: row.internal_app_percentage ?? null,
        referrals: row.referrals ?? null,
        total_hires: row.total_hires ?? null,
        internal_hires: row.internal_hires ?? null,
        internal_hire_rate: row.internal_hire_rate ?? null,
        avg_days_to_hire: row.avg_days_to_hire ?? null,
        hr_processing_time: row.hr_processing_time ?? null,
        offer_acceptance_rate: row.offer_acceptance_rate ?? null,
        source_file: sourceFile
      }, ['fiscal_year', 'fiscal_quarter'], {
        columnMap: { apps_per_req: 'apps_per_requisition' }
      });
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Pipeline Faculty (Interfolio)
 */
async function upsertPipelineFaculty(workbook, sourceFile, dryRun, metadata) {
  const sheetName = 'Pipeline_Faculty';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (const row of rows) {
    const fiscalYear = row.fiscal_year || metadata.fiscalYear;
    const fiscalQuarter = row.fiscal_quarter || metadata.fiscalQuarter;

    if (dryRun) {
      console.log(`    [DRY RUN] ${fiscalYear}/Q${fiscalQuarter}: Hires=${row.total_hires}, TT=${row.tenure_track_hires}`);
      inserted++;
      continue;
    }

    try {
      const result = await upsert(getPool(), 'fact_pipeline_metrics_faculty', {
        fiscal_year: fiscalYear,
        fiscal_quarter: fiscalQuarter,
        active_searches: row.active_searches ?? null,
        completed_searches: row.completed_searches ?? null,
        total_hires: row.total_hires ?? null,
        tenure_track_hires: row.tenure_track_hires ?? null,
        non_tenure_hires: row.non_tenure_hires ?? null,
        instructor_hires: row.instructor_hires ?? null,
        special_faculty_hires: row.special_faculty_hires ?? null,
        source_file: sourceFile
      }, ['fiscal_year', 'fiscal_quarter']);
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert New Hires Detail
 */
async function upsertNewHires(workbook, sourceFile, dryRun, metadata) {
  const sheetName = 'New_Hires_Detail';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (const row of rows) {
    const employeeHash = row.employee_hash || hashEmployeeId(row.row_id, row.hire_date);

    let hireDateParsed = row.hire_date;
    if (typeof row.hire_date === 'string' && row.hire_date.includes('/')) {
      const [month, day, year] = row.hire_date.split('/');
      hireDateParsed = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    const fiscalYear = metadata.fiscalYear;
    const fiscalQuarter = metadata.fiscalQuarter;

    if (dryRun) {
      console.log(`    [DRY RUN] ${employeeHash}: ${row.position_title} @ ${row.school}`);
      inserted++;
      continue;
    }

    try {
      const result = await upsert(getPool(), 'fact_new_hires', {
        fiscal_year: fiscalYear,
        fiscal_quarter: fiscalQuarter,
        employee_hash: employeeHash,
        hire_date: hireDateParsed,
        position_title: row.position_title || null,
        department: row.department || null,
        school: row.school || null,
        employee_type: row.employee_type || 'STAFF',
        assignment_code: row.assignment_code || null,
        location: row.location || 'OMA',
        gender: row.gender || null,
        ethnicity: row.ethnicity || null,
        age_band: row.age_band || null,
        in_interfolio: row.in_interfolio || false,
        in_orc_ats: row.in_orc_ats || false,
        source_file: sourceFile
      }, ['employee_hash', 'hire_date']);
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error (${employeeHash}):${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Hires by School
 */
async function upsertHiresBySchool(workbook, sourceFile, dryRun, metadata) {
  const sheetName = 'Hires_By_School';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (const row of rows) {
    const fiscalYear = row.fiscal_year || metadata.fiscalYear;
    const fiscalQuarter = row.fiscal_quarter || metadata.fiscalQuarter;

    if (dryRun) {
      console.log(`    [DRY RUN] ${fiscalYear}/Q${fiscalQuarter}/${row.school_name}: Total=${row.total_hires}`);
      inserted++;
      continue;
    }

    try {
      const result = await upsert(getPool(), 'fact_hires_by_school', {
        fiscal_year: fiscalYear,
        fiscal_quarter: fiscalQuarter,
        school_name: row.school_name,
        faculty_hires: row.faculty_hires || 0,
        staff_hires: row.staff_hires || 0,
        total_hires: row.total_hires || 0,
        source_file: sourceFile
      }, ['fiscal_year', 'fiscal_quarter', 'school_name']);
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Application Sources
 */
async function upsertApplicationSources(workbook, sourceFile, dryRun, metadata) {
  const sheetName = 'Application_Sources';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (const row of rows) {
    const fiscalYear = row.fiscal_year || metadata.fiscalYear;
    const fiscalQuarter = row.fiscal_quarter || metadata.fiscalQuarter;

    if (dryRun) {
      console.log(`    [DRY RUN] ${fiscalYear}/Q${fiscalQuarter}/${row.source_name}: ${row.applications} apps (${row.percentage}%)`);
      inserted++;
      continue;
    }

    try {
      const result = await upsert(getPool(), 'fact_application_sources', {
        fiscal_year: fiscalYear,
        fiscal_quarter: fiscalQuarter,
        source_name: row.source_name,
        application_count: row.applications || 0,
        percentage: row.percentage ?? null,
        source_file: sourceFile
      }, ['fiscal_year', 'fiscal_quarter', 'source_name']);
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Top Jobs
 */
async function upsertTopJobs(workbook, sourceFile, dryRun, metadata) {
  const sheetName = 'Top_Jobs';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (const row of rows) {
    const fiscalYear = row.fiscal_year || metadata.fiscalYear;
    const fiscalQuarter = row.fiscal_quarter || metadata.fiscalQuarter;

    if (dryRun) {
      console.log(`    [DRY RUN] ${fiscalYear}/Q${fiscalQuarter} #${row.rank}: ${row.job_title} (${row.application_count} apps)`);
      inserted++;
      continue;
    }

    try {
      const result = await upsert(getPool(), 'fact_top_jobs', {
        fiscal_year: fiscalYear,
        fiscal_quarter: fiscalQuarter,
        rank: row.rank,
        job_title: row.job_title,
        application_count: row.application_count || 0,
        source_file: sourceFile
      }, ['fiscal_year', 'fiscal_quarter', 'rank']);
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Requisition Aging
 */
async function upsertRequisitionAging(workbook, sourceFile, dryRun, metadata) {
  const sheetName = 'Requisition_Aging';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (const row of rows) {
    const fiscalYear = row.fiscal_year || metadata.fiscalYear;
    const fiscalQuarter = row.fiscal_quarter || metadata.fiscalQuarter;

    if (dryRun) {
      console.log(`    [DRY RUN] ${fiscalYear}/Q${fiscalQuarter}/${row.age_range}: ${row.requisition_count} (${row.percentage}%)`);
      inserted++;
      continue;
    }

    try {
      const result = await upsert(getPool(), 'fact_requisition_aging', {
        fiscal_year: fiscalYear,
        fiscal_quarter: fiscalQuarter,
        age_range: row.age_range,
        requisition_count: row.requisition_count || 0,
        percentage: row.percentage ?? null,
        source_file: sourceFile
      }, ['fiscal_year', 'fiscal_quarter', 'age_range']);
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert New Hire Demographics
 */
async function upsertNewHireDemographics(workbook, sourceFile, dryRun, metadata) {
  const sheetName = 'New_Hire_Demographics';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (const row of rows) {
    const fiscalYear = row.fiscal_year || metadata.fiscalYear;
    const fiscalQuarter = row.fiscal_quarter || metadata.fiscalQuarter;

    if (dryRun) {
      console.log(`    [DRY RUN] ${fiscalYear}/Q${fiscalQuarter}/${row.demo_type}/${row.demo_value}: ${row.count} (${row.percentage}%)`);
      inserted++;
      continue;
    }

    try {
      const result = await upsert(getPool(), 'fact_new_hire_demographics', {
        fiscal_year: fiscalYear,
        fiscal_quarter: fiscalQuarter,
        demo_type: row.demo_type,
        demo_value: row.demo_value,
        count: row.count || 0,
        percentage: row.percentage ?? null,
        source_file: sourceFile
      }, ['fiscal_year', 'fiscal_quarter', 'demo_type', 'demo_value']);
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Upsert Hiring Trends
 */
async function upsertHiringTrends(workbook, sourceFile, dryRun) {
  const sheetName = 'Hiring_Trends';
  const rows = sheetToJSON(workbook, sheetName);
  let inserted = 0, updated = 0, errored = 0;

  console.log(`  ${sheetName}: ${rows.length} rows`);

  for (const row of rows) {
    const quarterMatch = row.quarter.match(/Q(\d)\s*FY(\d{2})/i);
    let fiscalYear = null;
    let fiscalQuarter = null;

    if (quarterMatch) {
      fiscalQuarter = parseInt(quarterMatch[1]);
      fiscalYear = `FY20${quarterMatch[2]}`;
    }

    if (dryRun) {
      console.log(`    [DRY RUN] ${row.quarter}: Total=${row.total_hires}, Faculty=${row.faculty_hires}, Staff=${row.staff_hires}`);
      inserted++;
      continue;
    }

    try {
      const result = await upsert(getPool(), 'fact_hiring_trends', {
        quarter: row.quarter,
        fiscal_year: fiscalYear,
        fiscal_quarter: fiscalQuarter,
        faculty_hires: row.faculty_hires || 0,
        staff_hires: row.staff_hires || 0,
        total_hires: row.total_hires || 0,
        source_file: sourceFile
      }, ['quarter']);
      if (result.inserted) inserted++; else updated++;
    } catch (error) {
      console.error(`    ${colors.red}Error:${colors.reset} ${error.message}`);
      errored++;
    }
  }

  return { inserted, updated, errored };
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs('recruiting-metrics-to-postgres', [
    { flags: '--input,-i', key: 'input', type: 'string', description: 'Input Excel file path (default: auto-detect)' },
    { flags: '--quarter,-q', key: 'quarter', type: 'string', description: 'Fiscal quarter (e.g., FY26_Q1). Default: read from Metadata sheet' }
  ], {
    title: 'Recruiting Metrics ETL to Postgres',
    usage: [
      'node scripts/etl/recruiting-metrics-to-postgres.js',
      'node scripts/etl/recruiting-metrics-to-postgres.js --dry-run',
      'node scripts/etl/recruiting-metrics-to-postgres.js --input file.xlsx'
    ],
    examples: [
      '# Load recruiting metrics',
      'npm run etl:recruiting',
      '# Dry run to preview changes',
      'npm run etl:recruiting -- --dry-run',
      '# Load specific file',
      'npm run etl:recruiting -- --input source-metrics/recruiting/Q1_FY26.xlsx'
    ]
  });

  printBanner('Recruiting Metrics ETL to Postgres');

  if (options.dryRun) {
    console.log(`${colors.yellow}[DRY RUN MODE] No database writes will be made${colors.reset}\n`);
  }

  // Check connection
  console.log(`${colors.blue}Checking database connection...${colors.reset}`);
  const connected = await checkConnection();

  if (!connected) {
    console.error(`${colors.red}Failed to connect to database.${colors.reset}`);
    process.exit(1);
  }
  console.log(`${colors.green}✓${colors.reset} Connected\n`);

  // Find input file
  const recruitingDir = path.join(__dirname, '..', '..', 'source-metrics', 'recruiting');
  let sourceFile = options.input || findDefaultInputFile(recruitingDir, 'Recruiting_Metrics_Master.xlsx');

  if (!sourceFile) {
    console.error(`${colors.red}Error: No input file found. Specify with --input or run generate-recruiting-excel-template.js first.${colors.reset}`);
    process.exit(1);
  }

  if (!fs.existsSync(sourceFile)) {
    console.error(`${colors.red}Error: File not found: ${sourceFile}${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.blue}Loading Excel: ${path.basename(sourceFile)}${colors.reset}`);

  // Load workbook
  const { workbook, sheetNames } = loadWorkbook(sourceFile);
  validateRequiredSheets(workbook, EXPECTED_SHEETS);
  console.log(`${colors.green}✓${colors.reset} Loaded ${sheetNames.length} sheets\n`);

  // Extract metadata
  const metadata = extractMetadata(workbook);
  console.log(`${colors.blue}Fiscal Period: ${metadata.fiscalPeriod || 'Unknown'}${colors.reset}`);
  console.log(`${colors.blue}Data As Of: ${metadata.dataAsOf || 'Unknown'}${colors.reset}\n`);

  // Start audit log
  let loadId = null;
  if (!options.dryRun) {
    loadId = await startAuditLog({
      loadType: 'recruiting_metrics',
      sourceFile: path.basename(sourceFile),
      periodDate: new Date().toISOString().split('T')[0],
      fiscalPeriod: metadata.fiscalPeriod
    });
    console.log(`${colors.blue}Audit log started (ID: ${loadId})${colors.reset}\n`);
  }

  // Process each sheet type
  console.log(`${colors.blue}Processing sheets...${colors.reset}`);
  const results = { totalInserted: 0, totalUpdated: 0, totalErrored: 0 };
  const sourceFileName = path.basename(sourceFile);

  const handlers = [
    () => upsertSummaryMetrics(workbook, sourceFileName, options.dryRun, metadata),
    () => upsertHireRates(workbook, sourceFileName, options.dryRun, metadata),
    () => upsertPipelineStaff(workbook, sourceFileName, options.dryRun, metadata),
    () => upsertPipelineFaculty(workbook, sourceFileName, options.dryRun, metadata),
    () => upsertNewHires(workbook, sourceFileName, options.dryRun, metadata),
    () => upsertHiresBySchool(workbook, sourceFileName, options.dryRun, metadata),
    () => upsertApplicationSources(workbook, sourceFileName, options.dryRun, metadata),
    () => upsertTopJobs(workbook, sourceFileName, options.dryRun, metadata),
    () => upsertRequisitionAging(workbook, sourceFileName, options.dryRun, metadata),
    () => upsertNewHireDemographics(workbook, sourceFileName, options.dryRun, metadata),
    () => upsertHiringTrends(workbook, sourceFileName, options.dryRun)
  ];

  for (const handler of handlers) {
    const r = await handler();
    results.totalInserted += r.inserted;
    results.totalUpdated += r.updated;
    results.totalErrored += r.errored;
  }

  // Summary
  console.log(`\n${colors.cyan}Summary:${colors.reset}`);
  console.log(`  Inserted: ${results.totalInserted}`);
  console.log(`  Updated: ${results.totalUpdated}`);
  console.log(`  Errors: ${results.totalErrored}`);

  // Complete audit log
  if (loadId) {
    await completeAuditLog(loadId, {
      recordsRead: results.totalInserted + results.totalUpdated + results.totalErrored,
      recordsInserted: results.totalInserted,
      recordsUpdated: results.totalUpdated,
      recordsErrored: results.totalErrored,
      status: results.totalErrored > 0 ? 'completed_with_errors' : 'completed',
      errorMessage: results.totalErrored > 0 ? `${results.totalErrored} records failed` : null
    });
  }

  printComplete('Recruiting Metrics ETL Complete');
  await endPool();
}

main().catch(async error => {
  console.error(`\n${colors.red}Fatal error: ${error.message}${colors.reset}`);
  console.error(error.stack);
  await endPool();
  process.exit(1);
});
