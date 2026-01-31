#!/usr/bin/env node

/**
 * Export Demographics from Neon to JSON
 *
 * Exports demographic data from fact_workforce_demographics to JSON files
 * for backup, portability, and consistency with the JSON-first architecture.
 *
 * Usage:
 *   node scripts/etl/export-demographics-json.js --date 2025-06-30
 *   node scripts/etl/export-demographics-json.js --all
 */

const fs = require('fs');
const path = require('path');
const { sql, endPool, checkConnection } = require('./neon-client');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    date: null,
    all: false,
    output: null
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--date':
      case '-d':
        options.date = args[++i];
        break;
      case '--all':
        options.all = true;
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
    }
  }

  return options;
}

async function exportDemographics(periodDate) {
  // Get all demographics for the period (combined location)
  const result = await sql`
    SELECT
      category_type,
      demographic_type,
      demographic_value,
      count,
      percentage
    FROM fact_workforce_demographics
    WHERE period_date = ${periodDate}
      AND location = 'combined'
    ORDER BY demographic_type, category_type, count DESC
  `;

  if (result.length === 0) {
    return null;
  }

  // Transform to staticData.js format
  const demographics = {
    reportDate: periodDate,
    source: 'Neon PostgreSQL (fact_workforce_demographics)',
    exportedAt: new Date().toISOString(),
    totals: { faculty: 0, staff: 0, combined: 0 },
    gender: {
      faculty: { male: 0, female: 0 },
      staff: { male: 0, female: 0 }
    },
    ethnicity: { faculty: {}, staff: {} },
    ageBands: { faculty: {}, staff: {} }
  };

  result.forEach(row => {
    const category = row.category_type;
    const type = row.demographic_type;
    const value = row.demographic_value;
    const count = Number(row.count);

    if (type === 'gender') {
      if (value === 'M') {
        demographics.gender[category].male = count;
      } else if (value === 'F') {
        demographics.gender[category].female = count;
      }
    } else if (type === 'ethnicity') {
      demographics.ethnicity[category][value] = count;
    } else if (type === 'age_band') {
      demographics.ageBands[category][value] = count;
    }
  });

  // Calculate totals
  demographics.totals.faculty = demographics.gender.faculty.male + demographics.gender.faculty.female;
  demographics.totals.staff = demographics.gender.staff.male + demographics.gender.staff.female;
  demographics.totals.combined = demographics.totals.faculty + demographics.totals.staff;

  return demographics;
}

async function main() {
  const options = parseArgs();

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}   Export Demographics to JSON${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  // Check connection
  console.log(`${colors.blue}Checking database connection...${colors.reset}`);
  const connected = await checkConnection();

  if (!connected) {
    console.error(`${colors.red}Failed to connect to database.${colors.reset}`);
    process.exit(1);
  }
  console.log(`${colors.green}✓${colors.reset} Connected\n`);

  // Get available periods
  const periods = await sql`
    SELECT DISTINCT period_date
    FROM fact_workforce_demographics
    ORDER BY period_date DESC
  `;

  if (periods.length === 0) {
    console.log(`${colors.yellow}No demographics data found in database.${colors.reset}`);
    await endPool();
    return;
  }

  console.log(`${colors.cyan}Available periods:${colors.reset}`);
  periods.forEach(p => console.log(`  - ${p.period_date.toISOString().split('T')[0]}`));
  console.log();

  // Determine which periods to export
  let datesToExport = [];

  if (options.all) {
    datesToExport = periods.map(p => p.period_date.toISOString().split('T')[0]);
  } else if (options.date) {
    datesToExport = [options.date];
  } else {
    // Default to most recent
    datesToExport = [periods[0].period_date.toISOString().split('T')[0]];
  }

  // Export each period
  for (const date of datesToExport) {
    console.log(`${colors.blue}Exporting ${date}...${colors.reset}`);

    const demographics = await exportDemographics(date);

    if (!demographics) {
      console.log(`  ${colors.yellow}No data found for ${date}${colors.reset}`);
      continue;
    }

    // Determine output path
    const outputPath = options.output ||
      path.join(__dirname, '..', '..', 'src', 'data', 'demographics', `demographics-${date}.json`);

    // Ensure directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write JSON file
    fs.writeFileSync(outputPath, JSON.stringify(demographics, null, 2));

    console.log(`  ${colors.green}✓${colors.reset} Exported to ${outputPath}`);
    console.log(`    Faculty: ${demographics.totals.faculty}`);
    console.log(`    Staff: ${demographics.totals.staff}`);
    console.log(`    Combined: ${demographics.totals.combined}`);
  }

  // Also update the main workforce-demographics.json
  if (datesToExport.includes('2025-06-30')) {
    const mainJsonPath = path.join(__dirname, '..', '..', 'src', 'data', 'workforce-demographics.json');
    const demographics = await exportDemographics('2025-06-30');

    if (demographics) {
      // Remove export metadata for main file
      delete demographics.exportedAt;
      demographics.source = 'Neon PostgreSQL (fact_workforce_demographics)';

      fs.writeFileSync(mainJsonPath, JSON.stringify(demographics, null, 2));
      console.log(`\n${colors.green}✓${colors.reset} Updated ${mainJsonPath}`);
    }
  }

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.green}✓ Export Complete${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  await endPool();
}

main().catch(async error => {
  console.error(`\n${colors.red}Fatal error: ${error.message}${colors.reset}`);
  await endPool();
  process.exit(1);
});
