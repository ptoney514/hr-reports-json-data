#!/usr/bin/env node

/**
 * Data Import CLI
 *
 * Unified entry point for importing HR data
 * Orchestrates: clean → validate → merge → test
 *
 * Usage:
 *   npm run import:workforce -- file.xlsx --quarter FY25_Q2
 *   node scripts/data-import.js workforce file.xlsx --date 2024-12-31
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    type: null,        // workforce, turnover, exit-survey
    file: null,        // Input file path
    quarter: null,     // FY25_Q2
    date: null,        // YYYY-MM-DD
    skipClean: false,  // Skip cleaning step
    skipMerge: false,  // Skip merge step
    dryRun: false,
    yes: false         // Auto-confirm prompts
  };

  // First argument is type
  if (args[0] && !args[0].startsWith('--')) {
    options.type = args.shift();
  }

  // Second argument is file (if not a flag)
  if (args[0] && !args[0].startsWith('--')) {
    options.file = args.shift();
  }

  // Parse remaining flags
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
      case '--skip-clean':
        options.skipClean = true;
        break;
      case '--skip-merge':
        options.skipMerge = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--yes':
      case '-y':
        options.yes = true;
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
${colors.cyan}${colors.bold}Data Import CLI${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node scripts/data-import.js TYPE FILE [OPTIONS]
  npm run import:workforce -- file.xlsx --quarter FY25_Q2

${colors.yellow}Arguments:${colors.reset}
  TYPE                  Data type: workforce, turnover, exit-survey
  FILE                  Input Excel/CSV file path

${colors.yellow}Options:${colors.reset}
  -q, --quarter PERIOD  Fiscal period (e.g., FY25_Q2)
  -d, --date DATE       Report date (YYYY-MM-DD)
  -y, --yes             Auto-confirm all prompts
  --skip-clean          Skip cleaning step (use existing cleaned data)
  --skip-merge          Skip merge step (clean only)
  --dry-run             Preview without making changes

${colors.yellow}Examples:${colors.reset}
  # Import workforce data for Q2 FY25
  node scripts/data-import.js workforce data.xlsx --quarter FY25_Q2

  # Import with specific date
  node scripts/data-import.js workforce data.xlsx --date 2024-12-31

  # Dry run to preview
  node scripts/data-import.js workforce data.xlsx --quarter FY25_Q2 --dry-run

  # Use npm scripts
  npm run import:workforce -- data.xlsx --quarter FY25_Q2

${colors.yellow}Workflow:${colors.reset}
  1. ${colors.cyan}Clean${colors.reset} - Remove PII, categorize, validate
  2. ${colors.cyan}Review${colors.reset} - Check audit trail and quality score
  3. ${colors.cyan}Merge${colors.reset} - Update staticData.js (with backup)
  4. ${colors.cyan}Test${colors.reset} - Verify dashboard still works
  5. ${colors.cyan}Commit${colors.reset} - Save changes to git
`);
}

/**
 * Prompt user for confirmation
 */
async function confirm(message, defaultYes = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    const suffix = defaultYes ? ' [Y/n] ' : ' [y/N] ';
    rl.question(`${message}${suffix}`, answer => {
      rl.close();
      const normalized = answer.toLowerCase().trim();

      if (!normalized) {
        resolve(defaultYes);
      } else {
        resolve(normalized === 'y' || normalized === 'yes');
      }
    });
  });
}

/**
 * Run shell command and return output
 */
function runCommand(command, options = {}) {
  const { silent = false, throwOnError = true } = options;

  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit',
      cwd: path.join(__dirname, '..')
    });
    return { success: true, output };
  } catch (error) {
    if (throwOnError) {
      throw error;
    }
    return { success: false, error };
  }
}

/**
 * Get clean script command for data type
 */
function getCleanCommand(type) {
  const scripts = {
    workforce: 'scripts/clean-workforce-data.js',
    turnover: 'scripts/clean-terminations-data.js',
    'exit-survey': 'scripts/clean-exit-surveys-data.js',
    'exit-surveys': 'scripts/clean-exit-surveys-data.js'
  };

  return scripts[type] || null;
}

/**
 * Get cleaned output path
 */
function getCleanedOutputPath(type, quarter) {
  const typeMap = {
    workforce: 'workforce',
    turnover: 'terminations',
    'exit-survey': 'exit-surveys',
    'exit-surveys': 'exit-surveys'
  };

  const folder = typeMap[type];
  return path.join(__dirname, '..', 'source-metrics', folder, 'cleaned', quarter);
}

/**
 * Main import function
 */
async function main() {
  const options = parseArgs();

  console.log(`\n${colors.cyan}${colors.bold}========================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}        Data Import Wizard${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}========================================${colors.reset}\n`);

  // Validate options
  if (!options.type) {
    console.error(`${colors.red}Error: Data type is required${colors.reset}`);
    printHelp();
    process.exit(1);
  }

  if (!options.file) {
    console.error(`${colors.red}Error: Input file is required${colors.reset}`);
    printHelp();
    process.exit(1);
  }

  if (!options.quarter && !options.date) {
    console.error(`${colors.red}Error: Either --quarter or --date is required${colors.reset}`);
    printHelp();
    process.exit(1);
  }

  // Verify file exists
  if (!fs.existsSync(options.file)) {
    console.error(`${colors.red}Error: File not found: ${options.file}${colors.reset}`);
    process.exit(1);
  }

  const cleanScript = getCleanCommand(options.type);
  if (!cleanScript) {
    console.error(`${colors.red}Error: Unknown data type: ${options.type}${colors.reset}`);
    console.error(`Valid types: workforce, turnover, exit-survey`);
    process.exit(1);
  }

  // Check if clean script exists
  if (!fs.existsSync(path.join(__dirname, '..', cleanScript))) {
    console.error(`${colors.red}Error: Clean script not found: ${cleanScript}${colors.reset}`);
    console.error(`${colors.yellow}This data type is not yet implemented.${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.blue}Data Type:${colors.reset} ${options.type}`);
  console.log(`${colors.blue}Input File:${colors.reset} ${options.file}`);
  console.log(`${colors.blue}Period:${colors.reset} ${options.quarter || options.date}`);
  console.log(`${colors.blue}Mode:${colors.reset} ${options.dryRun ? 'DRY RUN' : 'LIVE'}\n`);

  // Step 1: Clean data
  if (!options.skipClean) {
    console.log(`${colors.cyan}${colors.bold}Step 1: Cleaning Data${colors.reset}`);
    console.log(`${colors.cyan}────────────────────────────────────────${colors.reset}\n`);

    const quarterArg = options.quarter ? `--quarter ${options.quarter}` : `--date ${options.date}`;
    const dryRunArg = options.dryRun ? '--dry-run' : '';

    const cleanCmd = `node ${cleanScript} --input "${options.file}" ${quarterArg} ${dryRunArg}`;

    console.log(`${colors.blue}Running:${colors.reset} ${cleanCmd}\n`);

    const result = runCommand(cleanCmd, { throwOnError: false });

    if (!result.success) {
      console.error(`\n${colors.red}✗ Cleaning failed${colors.reset}`);
      process.exit(1);
    }

    console.log(`\n${colors.green}✓ Data cleaned successfully${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}Skipping cleaning step (--skip-clean)${colors.reset}\n`);
  }

  // Get cleaned file paths
  const cleanedDir = getCleanedOutputPath(options.type, options.quarter || options.date);
  const summaryFile = path.join(cleanedDir, `${options.type === 'workforce' ? 'workforce' : options.type}_summary.json`);
  const auditFile = path.join(cleanedDir, 'AUDIT_TRAIL.md');

  if (!options.dryRun && !options.skipClean) {
    // Step 2: Review audit trail
    console.log(`${colors.cyan}${colors.bold}Step 2: Review Audit Trail${colors.reset}`);
    console.log(`${colors.cyan}────────────────────────────────────────${colors.reset}\n`);

    if (fs.existsSync(auditFile)) {
      console.log(`${colors.blue}Audit trail saved to:${colors.reset}`);
      console.log(`  ${auditFile}\n`);

      if (!options.yes) {
        const shouldContinue = await confirm('Review audit trail and continue?', true);
        if (!shouldContinue) {
          console.log(`\n${colors.yellow}Import cancelled by user${colors.reset}\n`);
          process.exit(0);
        }
      }
    } else {
      console.log(`${colors.yellow}Warning: Audit trail not found${colors.reset}\n`);
    }
  }

  // Step 3: Merge to staticData.js
  if (!options.skipMerge && !options.dryRun) {
    console.log(`\n${colors.cyan}${colors.bold}Step 3: Merge to staticData.js${colors.reset}`);
    console.log(`${colors.cyan}────────────────────────────────────────${colors.reset}\n`);

    if (!fs.existsSync(summaryFile)) {
      console.error(`${colors.red}Error: Summary file not found: ${summaryFile}${colors.reset}`);
      console.error(`${colors.yellow}Run without --skip-clean to generate summary${colors.reset}`);
      process.exit(1);
    }

    const reportDate = options.date || require('../src/data/staticData.js').FISCAL_PERIODS[options.quarter]?.endDate;

    if (!reportDate) {
      console.error(`${colors.red}Error: Could not determine report date${colors.reset}`);
      process.exit(1);
    }

    if (!options.yes) {
      const shouldMerge = await confirm('Merge data to staticData.js (creates backup)?', true);
      if (!shouldMerge) {
        console.log(`\n${colors.yellow}Merge cancelled. Data cleaned but not merged.${colors.reset}\n`);
        process.exit(0);
      }
    }

    const mergeCmd = `node scripts/merge-to-static-data.js ${options.type} --date ${reportDate} --input "${summaryFile}"`;

    console.log(`${colors.blue}Running:${colors.reset} ${mergeCmd}\n`);

    const mergeResult = runCommand(mergeCmd, { throwOnError: false });

    if (!mergeResult.success) {
      console.error(`\n${colors.red}✗ Merge failed${colors.reset}`);
      process.exit(1);
    }

    console.log(`\n${colors.green}✓ Data merged successfully${colors.reset}\n`);
  } else if (options.skipMerge) {
    console.log(`${colors.yellow}Skipping merge step (--skip-merge)${colors.reset}\n`);
  }

  // Summary
  console.log(`${colors.cyan}${colors.bold}========================================${colors.reset}`);
  console.log(`${colors.green}${colors.bold}✓ Import Complete${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}========================================${colors.reset}\n`);

  if (options.dryRun) {
    console.log(`${colors.yellow}This was a dry run. No files were modified.${colors.reset}\n`);
  } else {
    console.log(`${colors.green}Next steps:${colors.reset}`);
    console.log(`  1. Review changes: ${colors.cyan}git diff src/data/staticData.js${colors.reset}`);
    console.log(`  2. Test dashboard: ${colors.cyan}npm start${colors.reset}`);
    console.log(`  3. Validate data: ${colors.cyan}npm run data:validate${colors.reset}`);
    console.log(`  4. Commit changes: ${colors.cyan}git add . && git commit${colors.reset}\n`);

    console.log(`${colors.blue}Files created:${colors.reset}`);
    console.log(`  • ${summaryFile}`);
    if (fs.existsSync(auditFile)) {
      console.log(`  • ${auditFile}`);
    }
    console.log(`  • src/data/staticData.js.backup\n`);
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

module.exports = { parseArgs, getCleanCommand, getCleanedOutputPath };
