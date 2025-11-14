#!/usr/bin/env node

/**
 * Interactive Data Import Wizard
 *
 * User-friendly guided import process with prompts
 * Simplifies data import for non-technical users
 *
 * Usage:
 *   npm run import:wizard
 *   node scripts/data-wizard-interactive.js
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Ask a question and get user input
 */
function ask(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer.trim());
    });
  });
}

/**
 * Ask with default value
 */
async function askWithDefault(question, defaultValue) {
  const answer = await ask(`${question} ${colors.cyan}[${defaultValue}]${colors.reset}: `);
  return answer || defaultValue;
}

/**
 * Ask for selection from list
 */
async function select(question, choices) {
  console.log(`\n${colors.cyan}${question}${colors.reset}`);
  choices.forEach((choice, index) => {
    console.log(`  ${colors.yellow}${index + 1}.${colors.reset} ${choice.label || choice}`);
  });

  let selection = null;
  while (!selection) {
    const answer = await ask(`\n${colors.blue}Enter number (1-${choices.length}):${colors.reset} `);
    const num = parseInt(answer);

    if (num >= 1 && num <= choices.length) {
      selection = choices[num - 1];
    } else {
      console.log(`${colors.red}Invalid selection. Please enter a number between 1 and ${choices.length}${colors.reset}`);
    }
  }

  return selection.value || selection;
}

/**
 * Confirm yes/no
 */
async function confirm(question, defaultYes = false) {
  const suffix = defaultYes ? ' [Y/n] ' : ' [y/N] ';
  const answer = await ask(`${question}${suffix}`);
  const normalized = answer.toLowerCase();

  if (!normalized) {
    return defaultYes;
  }

  return normalized === 'y' || normalized === 'yes';
}

/**
 * Find Excel/CSV files in a directory
 */
function findDataFiles(dir, extensions = ['.xlsx', '.xls', '.csv']) {
  try {
    const files = fs.readdirSync(dir, { recursive: true });
    return files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return extensions.includes(ext);
      })
      .map(file => path.join(dir, file));
  } catch (error) {
    return [];
  }
}

/**
 * Get fiscal periods from staticData
 */
function getFiscalPeriods() {
  try {
    const staticData = require('../src/data/staticData.js');
    const periods = staticData.FISCAL_PERIODS || {};

    return Object.keys(periods).map(key => ({
      label: `${periods[key].label} (${periods[key].displayName})`,
      value: key,
      data: periods[key]
    }));
  } catch (error) {
    console.warn(`${colors.yellow}Warning: Could not load fiscal periods${colors.reset}`);
    return [
      { label: 'Q1 FY25 (July-September 2024)', value: 'FY25_Q1' },
      { label: 'Q2 FY25 (October-December 2024)', value: 'FY25_Q2' },
      { label: 'Q3 FY25 (January-March 2025)', value: 'FY25_Q3' },
      { label: 'Q4 FY25 (April-June 2025)', value: 'FY25_Q4' }
    ];
  }
}

/**
 * Print welcome banner
 */
function printBanner() {
  console.log(`\n${colors.cyan}${colors.bold}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}║   HR Data Import Wizard                ║${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}║   Interactive Data Import              ║${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}╚════════════════════════════════════════╝${colors.reset}\n`);

  console.log(`${colors.blue}This wizard will guide you through importing HR data.${colors.reset}`);
  console.log(`${colors.blue}Press Ctrl+C at any time to cancel.${colors.reset}\n`);
}

/**
 * Main wizard flow
 */
async function main() {
  try {
    printBanner();

    // Step 1: Select data type
    const dataType = await select('What type of data are you importing?', [
      { label: 'Workforce (headcount, demographics)', value: 'workforce' },
      { label: 'Terminations (turnover data)', value: 'turnover' },
      { label: 'Exit Surveys (employee feedback)', value: 'exit-survey' }
    ]);

    console.log(`${colors.green}✓ Selected: ${dataType}${colors.reset}\n`);

    // Step 2: Select file
    console.log(`${colors.cyan}Select input file:${colors.reset}`);

    const typeMap = {
      workforce: 'workforce',
      turnover: 'terminations',
      'exit-survey': 'exit-surveys'
    };

    const searchDir = path.join(__dirname, '..', 'source-metrics', typeMap[dataType]);
    const files = findDataFiles(searchDir);

    let filePath;

    if (files.length > 0) {
      console.log(`\n${colors.blue}Found ${files.length} files in source-metrics/${typeMap[dataType]}:${colors.reset}`);

      const fileChoices = [
        ...files.slice(0, 10).map(f => ({
          label: path.basename(f),
          value: f
        })),
        { label: 'Enter custom path', value: 'custom' }
      ];

      const selected = await select('Choose a file:', fileChoices);

      if (selected === 'custom') {
        filePath = await ask(`${colors.blue}Enter file path:${colors.reset} `);
      } else {
        filePath = selected;
      }
    } else {
      console.log(`${colors.yellow}No files found in source-metrics/${typeMap[dataType]}${colors.reset}`);
      filePath = await ask(`${colors.blue}Enter file path:${colors.reset} `);
    }

    // Verify file exists
    if (!fs.existsSync(filePath)) {
      console.error(`${colors.red}✗ File not found: ${filePath}${colors.reset}`);
      process.exit(1);
    }

    console.log(`${colors.green}✓ File: ${path.basename(filePath)}${colors.reset}\n`);

    // Step 3: Select fiscal period or date
    const useFiscalPeriod = await confirm('Use fiscal period (quarter)?', true);

    let quarter, date;

    if (useFiscalPeriod) {
      const periods = getFiscalPeriods();
      const selectedPeriod = await select('Select fiscal period:', periods);

      quarter = selectedPeriod.value || selectedPeriod;
      console.log(`${colors.green}✓ Period: ${quarter}${colors.reset}\n`);
    } else {
      date = await ask(`${colors.blue}Enter report date (YYYY-MM-DD):${colors.reset} `);

      // Validate date format
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(date)) {
        console.error(`${colors.red}✗ Invalid date format. Use YYYY-MM-DD${colors.reset}`);
        process.exit(1);
      }

      console.log(`${colors.green}✓ Date: ${date}${colors.reset}\n`);
    }

    // Step 4: Preview
    console.log(`\n${colors.cyan}${colors.bold}Summary${colors.reset}`);
    console.log(`${colors.cyan}────────────────────────────────────────${colors.reset}`);
    console.log(`${colors.blue}Data Type:${colors.reset} ${dataType}`);
    console.log(`${colors.blue}File:${colors.reset} ${filePath}`);
    console.log(`${colors.blue}Period:${colors.reset} ${quarter || date}`);
    console.log(`${colors.cyan}────────────────────────────────────────${colors.reset}\n`);

    // Step 5: Dry run option
    const doDryRun = await confirm('Preview first (dry run)?', true);

    // Step 6: Confirm
    const shouldProceed = await confirm('Proceed with import?', true);

    if (!shouldProceed) {
      console.log(`\n${colors.yellow}Import cancelled${colors.reset}\n`);
      rl.close();
      process.exit(0);
    }

    // Step 7: Execute import
    console.log(`\n${colors.cyan}${colors.bold}Executing Import${colors.reset}`);
    console.log(`${colors.cyan}────────────────────────────────────────${colors.reset}\n`);

    const quarterArg = quarter ? `--quarter ${quarter}` : `--date ${date}`;
    const dryRunArg = doDryRun ? '--dry-run' : '';
    const yesArg = doDryRun ? '' : '--yes'; // Auto-confirm if not dry run

    const importCmd = `node scripts/data-import.js ${dataType} "${filePath}" ${quarterArg} ${dryRunArg} ${yesArg}`;

    console.log(`${colors.blue}Running:${colors.reset} ${importCmd}\n`);

    execSync(importCmd, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    console.log(`\n${colors.green}${colors.bold}✓ Import complete!${colors.reset}\n`);

    // Post-import actions
    if (!doDryRun) {
      const viewDiff = await confirm('View changes (git diff)?', false);
      if (viewDiff) {
        execSync('git diff src/data/staticData.js', {
          stdio: 'inherit',
          cwd: path.join(__dirname, '..')
        });
      }

      const startDashboard = await confirm('Start dashboard to test?', false);
      if (startDashboard) {
        console.log(`\n${colors.blue}Starting dashboard...${colors.reset}`);
        console.log(`${colors.yellow}Press Ctrl+C to stop${colors.reset}\n`);
        execSync('npm start', {
          stdio: 'inherit',
          cwd: path.join(__dirname, '..')
        });
      }
    }

    rl.close();
  } catch (error) {
    console.error(`\n${colors.red}Error: ${error.message}${colors.reset}`);
    rl.close();
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log(`\n\n${colors.yellow}Import cancelled${colors.reset}\n`);
  rl.close();
  process.exit(0);
});

// Run wizard
main();
