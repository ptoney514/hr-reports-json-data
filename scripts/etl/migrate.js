#!/usr/bin/env node

/**
 * Database Migration Runner
 *
 * Runs all migrations and seeds in order to set up the Neon database
 *
 * Usage:
 *   node scripts/etl/migrate.js           # Run all migrations and seeds
 *   node scripts/etl/migrate.js --fresh   # Drop and recreate all tables
 *   node scripts/etl/migrate.js --seed    # Only run seeds
 */

const fs = require('fs');
const path = require('path');
const { sql, endPool, checkConnection, getDatabaseInfo } = require('./neon-client');

/**
 * Split SQL file into individual statements
 * Handles comments and dollar-quoted strings (for functions)
 */
function splitStatements(sqlContent) {
  const statements = [];
  let current = '';
  let inDollarQuote = false;
  let dollarTag = '';

  const lines = sqlContent.split('\n');

  for (const line of lines) {
    // Skip pure comment lines
    if (line.trim().startsWith('--')) {
      continue;
    }

    // Check for dollar quote start/end (for functions)
    const dollarMatch = line.match(/\$([a-zA-Z_]*)\$/g);
    if (dollarMatch) {
      for (const match of dollarMatch) {
        if (!inDollarQuote) {
          inDollarQuote = true;
          dollarTag = match;
        } else if (match === dollarTag) {
          inDollarQuote = false;
          dollarTag = '';
        }
      }
    }

    current += line + '\n';

    // If we're not in a dollar quote and line ends with semicolon, it's end of statement
    if (!inDollarQuote && line.trim().endsWith(';')) {
      const stmt = current.trim();
      if (stmt && stmt !== ';') {
        statements.push(stmt);
      }
      current = '';
    }
  }

  // Add any remaining content
  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements.filter(s => s && !s.match(/^--/) && s.length > 1);
}

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function main() {
  const args = process.argv.slice(2);
  const isFresh = args.includes('--fresh');
  const seedOnly = args.includes('--seed');

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}   Neon Database Migration${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  // Check connection
  console.log(`${colors.blue}Checking database connection...${colors.reset}`);
  const connected = await checkConnection();

  if (!connected) {
    console.error(`${colors.red}Failed to connect to database.${colors.reset}`);
    console.log('Make sure DATABASE_URL is set in your .env file.');
    process.exit(1);
  }

  const dbInfo = await getDatabaseInfo();
  console.log(`${colors.green}✓${colors.reset} Connected to: ${dbInfo.database}`);
  console.log(`  User: ${dbInfo.user}`);
  console.log(`  Version: ${dbInfo.version.split(',')[0]}\n`);

  const migrationsDir = path.join(__dirname, '..', '..', 'database', 'migrations');
  const seedsDir = path.join(__dirname, '..', '..', 'database', 'seeds');

  // Fresh install - drop all tables
  if (isFresh) {
    console.log(`${colors.yellow}WARNING: --fresh flag detected. Dropping all tables...${colors.reset}`);

    const dropStatements = [
      'DROP VIEW IF EXISTS v_mobility_summary CASCADE',
      'DROP VIEW IF EXISTS v_school_turnover CASCADE',
      'DROP VIEW IF EXISTS v_top_exit_reasons CASCADE',
      'DROP VIEW IF EXISTS v_exit_survey_metrics CASCADE',
      'DROP VIEW IF EXISTS v_turnover_rates CASCADE',
      'DROP VIEW IF EXISTS v_turnover_summary CASCADE',
      'DROP VIEW IF EXISTS v_category_breakdown CASCADE',
      'DROP VIEW IF EXISTS v_school_org_headcount CASCADE',
      'DROP VIEW IF EXISTS v_workforce_summary CASCADE',
      'DROP TABLE IF EXISTS audit_data_loads CASCADE',
      'DROP TABLE IF EXISTS fact_mobility_events CASCADE',
      'DROP TABLE IF EXISTS fact_exit_surveys CASCADE',
      'DROP TABLE IF EXISTS fact_terminations CASCADE',
      'DROP TABLE IF EXISTS fact_workforce_snapshots CASCADE',
      'DROP TABLE IF EXISTS dim_departments CASCADE',
      'DROP TABLE IF EXISTS dim_schools CASCADE',
      'DROP TABLE IF EXISTS dim_term_reasons CASCADE',
      'DROP TABLE IF EXISTS dim_assignment_categories CASCADE',
      'DROP TABLE IF EXISTS dim_fiscal_periods CASCADE',
      'DROP FUNCTION IF EXISTS update_updated_at_column CASCADE'
    ];

    try {
      for (const stmt of dropStatements) {
        await sql(stmt);
      }
      console.log(`${colors.green}✓${colors.reset} All tables dropped.\n`);
    } catch (error) {
      console.error(`${colors.red}Error dropping tables:${colors.reset}`, error.message);
    }
  }

  // Run migrations
  if (!seedOnly) {
    console.log(`${colors.blue}Running migrations...${colors.reset}`);

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort()
      .map(f => path.join(migrationsDir, f));

    for (const file of migrationFiles) {
      const filename = path.basename(file);
      console.log(`  ${filename}...`);

      const sqlContent = fs.readFileSync(file, 'utf-8');
      const statements = splitStatements(sqlContent);

      let success = 0;
      let skipped = 0;
      let failed = 0;

      for (const stmt of statements) {
        try {
          await sql(stmt);
          success++;
        } catch (error) {
          // Continue on "already exists" errors
          if (error.message.includes('already exists')) {
            skipped++;
          } else {
            failed++;
            console.error(`    ${colors.red}Error:${colors.reset} ${error.message.split('\n')[0]}`);
          }
        }
      }

      if (failed === 0) {
        console.log(`    ${colors.green}✓${colors.reset} ${success} statements executed${skipped > 0 ? `, ${skipped} skipped` : ''}`);
      } else {
        console.log(`    ${colors.yellow}!${colors.reset} ${success} ok, ${skipped} skipped, ${failed} failed`);
      }
    }
    console.log();
  }

  // Run seeds
  console.log(`${colors.blue}Running seeds...${colors.reset}`);

  const seedFiles = fs.readdirSync(seedsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()
    .map(f => path.join(seedsDir, f));

  for (const file of seedFiles) {
    const filename = path.basename(file);
    console.log(`  ${filename}...`);

    const sqlContent = fs.readFileSync(file, 'utf-8');
    const statements = splitStatements(sqlContent);

    let success = 0;
    let failed = 0;

    for (const stmt of statements) {
      try {
        await sql(stmt);
        success++;
      } catch (error) {
        failed++;
        console.error(`    ${colors.red}Error:${colors.reset} ${error.message.split('\n')[0]}`);
      }
    }

    if (failed === 0) {
      console.log(`    ${colors.green}✓${colors.reset} ${success} statements executed`);
    } else {
      console.log(`    ${colors.yellow}!${colors.reset} ${success} ok, ${failed} failed`);
    }
  }

  // Verify tables
  console.log(`\n${colors.blue}Verifying tables...${colors.reset}`);

  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;

  console.log(`  Found ${tables.length} tables:`);
  tables.forEach(t => console.log(`    - ${t.table_name}`));

  const views = await sql`
    SELECT table_name
    FROM information_schema.views
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;

  console.log(`\n  Found ${views.length} views:`);
  views.forEach(v => console.log(`    - ${v.table_name}`));

  // Count seed data
  console.log(`\n${colors.blue}Verifying seed data...${colors.reset}`);

  const counts = await sql`
    SELECT
      (SELECT COUNT(*) FROM dim_assignment_categories) as categories,
      (SELECT COUNT(*) FROM dim_schools) as schools,
      (SELECT COUNT(*) FROM dim_term_reasons) as term_reasons,
      (SELECT COUNT(*) FROM dim_fiscal_periods) as fiscal_periods
  `;

  console.log(`  dim_assignment_categories: ${counts[0].categories} rows`);
  console.log(`  dim_schools: ${counts[0].schools} rows`);
  console.log(`  dim_term_reasons: ${counts[0].term_reasons} rows`);
  console.log(`  dim_fiscal_periods: ${counts[0].fiscal_periods} rows`);

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.green}✓ Migration complete!${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  await endPool();
}

main().catch(error => {
  console.error(`\n${colors.red}Migration failed:${colors.reset}`, error.message);
  process.exit(1);
});
