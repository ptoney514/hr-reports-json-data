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
const { sql, endPool, startAuditLog, completeAuditLog, checkConnection } = require('./neon-client');

// Import existing utilities
const {
  loadExcelFile,
  sheetToJSON,
  getSheetNames
} = require('../utils/excel-helpers');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Expected sheet names
const EXPECTED_SHEETS = [
  'Metadata',
  'Summary_Metrics',
  'Hire_Rates',
  'Pipeline_Staff',
  'Pipeline_Faculty',
  'New_Hires_Detail',
  'Hires_By_School',
  'Application_Sources',
  'Top_Jobs',
  'Requisition_Aging',
  'New_Hire_Demographics',
  'Hiring_Trends'
];

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: null,
    quarter: null,  // e.g., 'FY26_Q1'
    dryRun: false,
    verbose: false
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
${colors.cyan}Recruiting Metrics ETL to Postgres${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node scripts/etl/recruiting-metrics-to-postgres.js
  node scripts/etl/recruiting-metrics-to-postgres.js --dry-run
  node scripts/etl/recruiting-metrics-to-postgres.js --input file.xlsx

${colors.yellow}Options:${colors.reset}
  -i, --input FILE         Input Excel file path (default: auto-detect)
  -q, --quarter QUARTER    Fiscal quarter (e.g., FY26_Q1). Default: read from Metadata sheet
  --dry-run                Preview without database writes
  -v, --verbose            Show detailed output
  -h, --help               Show this help message

${colors.yellow}Examples:${colors.reset}
  # Load recruiting metrics
  npm run etl:recruiting

  # Dry run to preview changes
  npm run etl:recruiting -- --dry-run

  # Load specific file
  npm run etl:recruiting -- --input source-metrics/recruiting/Q1_FY26.xlsx
`);
}

/**
 * Find the default input file
 */
function findDefaultInputFile() {
  const recruitingDir = path.join(__dirname, '..', '..', 'source-metrics', 'recruiting');
  const defaultFile = path.join(recruitingDir, 'Recruiting_Metrics_Master.xlsx');

  if (fs.existsSync(defaultFile)) {
    return defaultFile;
  }

  // Fall back to any xlsx file in the directory
  if (fs.existsSync(recruitingDir)) {
    const files = fs.readdirSync(recruitingDir)
      .filter(f => f.endsWith('.xlsx') && !f.startsWith('~'))
      .sort();

    if (files.length > 0) {
      return path.join(recruitingDir, files[0]);
    }
  }

  return null;
}

/**
 * Load and validate Excel workbook
 */
function loadWorkbook(filePath) {
  const workbook = loadExcelFile(filePath);
  const sheetNames = getSheetNames(workbook);

  console.log(`${colors.blue}Validating sheets...${colors.reset}`);
  console.log(`  Found ${sheetNames.length} sheets`);

  const missingSheets = EXPECTED_SHEETS.filter(s => !sheetNames.includes(s));
  if (missingSheets.length > 0) {
    console.warn(`${colors.yellow}Warning: Missing expected sheets:${colors.reset} ${missingSheets.join(', ')}`);
  }

  return { workbook, sheetNames };
}

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
      const result = await sql`
        INSERT INTO fact_recruiting_summary (
          fiscal_year, fiscal_quarter, total_hires, faculty_hires, staff_hires,
          omaha_hires, phoenix_hires, open_requisitions, active_applications,
          new_applications, source_file
        )
        VALUES (
          ${fiscalYear}, ${fiscalQuarter}, ${row.total_hires || 0}, ${row.faculty_hires || 0},
          ${row.staff_hires || 0}, ${row.omaha_hires || 0}, ${row.phoenix_hires || 0},
          ${row.open_requisitions ?? null}, ${row.active_applications ?? null},
          ${row.new_applications ?? null}, ${sourceFile}
        )
        ON CONFLICT (fiscal_year, fiscal_quarter)
        DO UPDATE SET
          total_hires = EXCLUDED.total_hires,
          faculty_hires = EXCLUDED.faculty_hires,
          staff_hires = EXCLUDED.staff_hires,
          omaha_hires = EXCLUDED.omaha_hires,
          phoenix_hires = EXCLUDED.phoenix_hires,
          open_requisitions = EXCLUDED.open_requisitions,
          active_applications = EXCLUDED.active_applications,
          new_applications = EXCLUDED.new_applications,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
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
      const result = await sql`
        INSERT INTO fact_hire_rates (
          fiscal_year, fiscal_quarter, source_system, channel,
          applications, hires, hire_rate, source_file
        )
        VALUES (
          ${fiscalYear}, ${fiscalQuarter}, ${row.source_system}, ${row.channel},
          ${row.applications || 0}, ${row.hires || 0}, ${row.hire_rate ?? null}, ${sourceFile}
        )
        ON CONFLICT (fiscal_year, fiscal_quarter, source_system, channel)
        DO UPDATE SET
          applications = EXCLUDED.applications,
          hires = EXCLUDED.hires,
          hire_rate = EXCLUDED.hire_rate,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
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
      const result = await sql`
        INSERT INTO fact_pipeline_metrics_staff (
          fiscal_year, fiscal_quarter, open_requisitions, reqs_per_recruiter,
          avg_days_open, avg_time_to_fill, active_applications, new_applications,
          apps_per_requisition, internal_app_percentage, referrals, total_hires,
          internal_hires, internal_hire_rate, avg_days_to_hire, hr_processing_time,
          offer_acceptance_rate, source_file
        )
        VALUES (
          ${fiscalYear}, ${fiscalQuarter}, ${row.open_requisitions ?? null},
          ${row.reqs_per_recruiter ?? null}, ${row.avg_days_open ?? null},
          ${row.avg_time_to_fill ?? null}, ${row.active_applications ?? null},
          ${row.new_applications ?? null}, ${row.apps_per_req ?? null},
          ${row.internal_app_percentage ?? null}, ${row.referrals ?? null},
          ${row.total_hires ?? null}, ${row.internal_hires ?? null},
          ${row.internal_hire_rate ?? null}, ${row.avg_days_to_hire ?? null},
          ${row.hr_processing_time ?? null}, ${row.offer_acceptance_rate ?? null},
          ${sourceFile}
        )
        ON CONFLICT (fiscal_year, fiscal_quarter)
        DO UPDATE SET
          open_requisitions = EXCLUDED.open_requisitions,
          reqs_per_recruiter = EXCLUDED.reqs_per_recruiter,
          avg_days_open = EXCLUDED.avg_days_open,
          avg_time_to_fill = EXCLUDED.avg_time_to_fill,
          active_applications = EXCLUDED.active_applications,
          new_applications = EXCLUDED.new_applications,
          apps_per_requisition = EXCLUDED.apps_per_requisition,
          internal_app_percentage = EXCLUDED.internal_app_percentage,
          referrals = EXCLUDED.referrals,
          total_hires = EXCLUDED.total_hires,
          internal_hires = EXCLUDED.internal_hires,
          internal_hire_rate = EXCLUDED.internal_hire_rate,
          avg_days_to_hire = EXCLUDED.avg_days_to_hire,
          hr_processing_time = EXCLUDED.hr_processing_time,
          offer_acceptance_rate = EXCLUDED.offer_acceptance_rate,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
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
      const result = await sql`
        INSERT INTO fact_pipeline_metrics_faculty (
          fiscal_year, fiscal_quarter, active_searches, completed_searches,
          total_hires, tenure_track_hires, non_tenure_hires, instructor_hires,
          special_faculty_hires, source_file
        )
        VALUES (
          ${fiscalYear}, ${fiscalQuarter}, ${row.active_searches ?? null},
          ${row.completed_searches ?? null}, ${row.total_hires ?? null},
          ${row.tenure_track_hires ?? null}, ${row.non_tenure_hires ?? null},
          ${row.instructor_hires ?? null}, ${row.special_faculty_hires ?? null},
          ${sourceFile}
        )
        ON CONFLICT (fiscal_year, fiscal_quarter)
        DO UPDATE SET
          active_searches = EXCLUDED.active_searches,
          completed_searches = EXCLUDED.completed_searches,
          total_hires = EXCLUDED.total_hires,
          tenure_track_hires = EXCLUDED.tenure_track_hires,
          non_tenure_hires = EXCLUDED.non_tenure_hires,
          instructor_hires = EXCLUDED.instructor_hires,
          special_faculty_hires = EXCLUDED.special_faculty_hires,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
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
    // Use existing hash or generate one
    const employeeHash = row.employee_hash || hashEmployeeId(row.row_id, row.hire_date);

    // Parse hire date (handle MM/DD/YYYY format)
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
      const result = await sql`
        INSERT INTO fact_new_hires (
          fiscal_year, fiscal_quarter, employee_hash, hire_date, position_title,
          department, school, employee_type, assignment_code, location,
          gender, ethnicity, age_band, in_interfolio, in_orc_ats, source_file
        )
        VALUES (
          ${fiscalYear}, ${fiscalQuarter}, ${employeeHash}, ${hireDateParsed},
          ${row.position_title || null}, ${row.department || null}, ${row.school || null},
          ${row.employee_type || 'STAFF'}, ${row.assignment_code || null},
          ${row.location || 'OMA'}, ${row.gender || null}, ${row.ethnicity || null},
          ${row.age_band || null}, ${row.in_interfolio || false},
          ${row.in_orc_ats || false}, ${sourceFile}
        )
        ON CONFLICT (employee_hash, hire_date)
        DO UPDATE SET
          fiscal_year = EXCLUDED.fiscal_year,
          fiscal_quarter = EXCLUDED.fiscal_quarter,
          position_title = EXCLUDED.position_title,
          department = EXCLUDED.department,
          school = EXCLUDED.school,
          employee_type = EXCLUDED.employee_type,
          assignment_code = EXCLUDED.assignment_code,
          location = EXCLUDED.location,
          gender = EXCLUDED.gender,
          ethnicity = EXCLUDED.ethnicity,
          age_band = EXCLUDED.age_band,
          in_interfolio = EXCLUDED.in_interfolio,
          in_orc_ats = EXCLUDED.in_orc_ats,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
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
      const result = await sql`
        INSERT INTO fact_hires_by_school (
          fiscal_year, fiscal_quarter, school_name, faculty_hires,
          staff_hires, total_hires, source_file
        )
        VALUES (
          ${fiscalYear}, ${fiscalQuarter}, ${row.school_name},
          ${row.faculty_hires || 0}, ${row.staff_hires || 0},
          ${row.total_hires || 0}, ${sourceFile}
        )
        ON CONFLICT (fiscal_year, fiscal_quarter, school_name)
        DO UPDATE SET
          faculty_hires = EXCLUDED.faculty_hires,
          staff_hires = EXCLUDED.staff_hires,
          total_hires = EXCLUDED.total_hires,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
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
      const result = await sql`
        INSERT INTO fact_application_sources (
          fiscal_year, fiscal_quarter, source_name, application_count,
          percentage, source_file
        )
        VALUES (
          ${fiscalYear}, ${fiscalQuarter}, ${row.source_name},
          ${row.applications || 0}, ${row.percentage ?? null}, ${sourceFile}
        )
        ON CONFLICT (fiscal_year, fiscal_quarter, source_name)
        DO UPDATE SET
          application_count = EXCLUDED.application_count,
          percentage = EXCLUDED.percentage,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
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
      const result = await sql`
        INSERT INTO fact_top_jobs (
          fiscal_year, fiscal_quarter, rank, job_title,
          application_count, source_file
        )
        VALUES (
          ${fiscalYear}, ${fiscalQuarter}, ${row.rank}, ${row.job_title},
          ${row.application_count || 0}, ${sourceFile}
        )
        ON CONFLICT (fiscal_year, fiscal_quarter, rank)
        DO UPDATE SET
          job_title = EXCLUDED.job_title,
          application_count = EXCLUDED.application_count,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
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

  // Color mapping for aging buckets
  const ageColors = {
    '0-30 Days': '#10B981',
    '31-60 Days': '#3B82F6',
    '61-90 Days': '#F59E0B',
    '91-120 Days': '#EF4444',
    '>120 Days': '#7F1D1D'
  };

  for (const row of rows) {
    const fiscalYear = row.fiscal_year || metadata.fiscalYear;
    const fiscalQuarter = row.fiscal_quarter || metadata.fiscalQuarter;
    const displayColor = ageColors[row.age_range] || '#9CA3AF';

    if (dryRun) {
      console.log(`    [DRY RUN] ${fiscalYear}/Q${fiscalQuarter}/${row.age_range}: ${row.requisition_count} (${row.percentage}%)`);
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_requisition_aging (
          fiscal_year, fiscal_quarter, age_range, requisition_count,
          percentage, display_color, source_file
        )
        VALUES (
          ${fiscalYear}, ${fiscalQuarter}, ${row.age_range},
          ${row.requisition_count || 0}, ${row.percentage ?? null},
          ${displayColor}, ${sourceFile}
        )
        ON CONFLICT (fiscal_year, fiscal_quarter, age_range)
        DO UPDATE SET
          requisition_count = EXCLUDED.requisition_count,
          percentage = EXCLUDED.percentage,
          display_color = EXCLUDED.display_color,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
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

  // Color mappings
  const demoColors = {
    // Gender
    'Female': '#EC4899',
    'Male': '#3B82F6',
    // Ethnicity
    'White': '#3B82F6',
    'Not Disclosed': '#9CA3AF',
    'Asian': '#10B981',
    'More than one Ethnicity': '#8B5CF6',
    'Hispanic or Latino': '#F59E0B',
    'Black or African American': '#EF4444',
    // Age bands
    '21-30': '#3B82F6',
    '31-40': '#10B981',
    '41-50': '#F59E0B',
    '51-60': '#8B5CF6',
    '61+': '#EF4444'
  };

  for (const row of rows) {
    const fiscalYear = row.fiscal_year || metadata.fiscalYear;
    const fiscalQuarter = row.fiscal_quarter || metadata.fiscalQuarter;
    const displayColor = demoColors[row.demo_value] || '#9CA3AF';

    if (dryRun) {
      console.log(`    [DRY RUN] ${fiscalYear}/Q${fiscalQuarter}/${row.demo_type}/${row.demo_value}: ${row.count} (${row.percentage}%)`);
      inserted++;
      continue;
    }

    try {
      const result = await sql`
        INSERT INTO fact_new_hire_demographics (
          fiscal_year, fiscal_quarter, demo_type, demo_value,
          count, percentage, display_color, source_file
        )
        VALUES (
          ${fiscalYear}, ${fiscalQuarter}, ${row.demo_type}, ${row.demo_value},
          ${row.count || 0}, ${row.percentage ?? null}, ${displayColor}, ${sourceFile}
        )
        ON CONFLICT (fiscal_year, fiscal_quarter, demo_type, demo_value)
        DO UPDATE SET
          count = EXCLUDED.count,
          percentage = EXCLUDED.percentage,
          display_color = EXCLUDED.display_color,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
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
    // Parse quarter string like "Q1 FY24" to extract fiscal_year and fiscal_quarter
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
      const result = await sql`
        INSERT INTO fact_hiring_trends (
          quarter, fiscal_year, fiscal_quarter, faculty_hires,
          staff_hires, total_hires, source_file
        )
        VALUES (
          ${row.quarter}, ${fiscalYear}, ${fiscalQuarter},
          ${row.faculty_hires || 0}, ${row.staff_hires || 0},
          ${row.total_hires || 0}, ${sourceFile}
        )
        ON CONFLICT (quarter)
        DO UPDATE SET
          fiscal_year = EXCLUDED.fiscal_year,
          fiscal_quarter = EXCLUDED.fiscal_quarter,
          faculty_hires = EXCLUDED.faculty_hires,
          staff_hires = EXCLUDED.staff_hires,
          total_hires = EXCLUDED.total_hires,
          source_file = EXCLUDED.source_file,
          loaded_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) inserted++; else updated++;
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
  const options = parseArgs();

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}   Recruiting Metrics ETL to Postgres${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

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
  let sourceFile = options.input || findDefaultInputFile();

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
  const results = {
    totalInserted: 0,
    totalUpdated: 0,
    totalErrored: 0
  };

  const sourceFileName = path.basename(sourceFile);

  // Summary Metrics
  let r = await upsertSummaryMetrics(workbook, sourceFileName, options.dryRun, metadata);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

  // Hire Rates
  r = await upsertHireRates(workbook, sourceFileName, options.dryRun, metadata);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

  // Pipeline Staff
  r = await upsertPipelineStaff(workbook, sourceFileName, options.dryRun, metadata);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

  // Pipeline Faculty
  r = await upsertPipelineFaculty(workbook, sourceFileName, options.dryRun, metadata);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

  // New Hires Detail
  r = await upsertNewHires(workbook, sourceFileName, options.dryRun, metadata);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

  // Hires by School
  r = await upsertHiresBySchool(workbook, sourceFileName, options.dryRun, metadata);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

  // Application Sources
  r = await upsertApplicationSources(workbook, sourceFileName, options.dryRun, metadata);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

  // Top Jobs
  r = await upsertTopJobs(workbook, sourceFileName, options.dryRun, metadata);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

  // Requisition Aging
  r = await upsertRequisitionAging(workbook, sourceFileName, options.dryRun, metadata);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

  // New Hire Demographics
  r = await upsertNewHireDemographics(workbook, sourceFileName, options.dryRun, metadata);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

  // Hiring Trends
  r = await upsertHiringTrends(workbook, sourceFileName, options.dryRun);
  results.totalInserted += r.inserted;
  results.totalUpdated += r.updated;
  results.totalErrored += r.errored;

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

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.green}✓ Recruiting Metrics ETL Complete${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  await endPool();
}

main().catch(async error => {
  console.error(`\n${colors.red}Fatal error: ${error.message}${colors.reset}`);
  console.error(error.stack);
  await endPool();
  process.exit(1);
});
