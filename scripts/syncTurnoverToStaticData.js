#!/usr/bin/env node

/**
 * Automated Turnover Data Sync
 * Syncs turnover data from fy25TurnoverData.json to staticData.js
 * Ensures exit survey data always uses correct turnover counts
 */

const fs = require('fs');
const path = require('path');

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

console.log(`${colors.cyan}========================================${colors.reset}`);
console.log(`${colors.cyan}    Turnover Data Sync Utility    ${colors.reset}`);
console.log(`${colors.cyan}========================================${colors.reset}\n`);

// Load turnover data
const turnoverDataPath = path.join(__dirname, '../src/data/fy25TurnoverData.json');
const staticDataPath = path.join(__dirname, '../src/data/staticData.js');

let turnoverData;
try {
  const rawData = fs.readFileSync(turnoverDataPath, 'utf8');
  turnoverData = JSON.parse(rawData);
  console.log(`${colors.green}✓${colors.reset} Loaded turnover data from fy25TurnoverData.json`);
} catch (error) {
  console.log(`${colors.red}✗${colors.reset} Failed to load turnover data: ${error.message}`);
  process.exit(1);
}

// Extract quarterly data
const quarters = {
  'Q1': {
    date: '2024-09-30',
    exits: turnoverData.quarterly.Q1.count,
    faculty: turnoverData.quarterly.Q1.faculty,
    staff: turnoverData.quarterly.Q1.staff
  },
  'Q2': {
    date: '2024-12-31',
    exits: turnoverData.quarterly.Q2.count,
    faculty: turnoverData.quarterly.Q2.faculty,
    staff: turnoverData.quarterly.Q2.staff
  },
  'Q3': {
    date: '2025-03-31',
    exits: turnoverData.quarterly.Q3.count,
    faculty: turnoverData.quarterly.Q3.faculty,
    staff: turnoverData.quarterly.Q3.staff
  },
  'Q4': {
    date: '2025-06-30',
    exits: turnoverData.quarterly.Q4.count,
    faculty: turnoverData.quarterly.Q4.faculty,
    staff: turnoverData.quarterly.Q4.staff
  }
};

console.log(`\n${colors.blue}Turnover Data to Sync:${colors.reset}`);
Object.entries(quarters).forEach(([quarter, data]) => {
  console.log(`├─ ${quarter} FY25 (${data.date}): ${data.exits} exits (Faculty: ${data.faculty}, Staff: ${data.staff})`);
});
console.log(`└─ Total FY25: ${turnoverData.summary.uniqueEmployees} unique employees\n`);

// Read current static data
let staticDataContent = fs.readFileSync(staticDataPath, 'utf8');
let updatesApplied = [];

// Update Q4 FY25 data (the one with exit survey data)
const q4Pattern = /"2025-06-30":\s*{([^}]*)totalExits:\s*(\d+)/;
const q4Match = staticDataContent.match(q4Pattern);

if (q4Match) {
  const currentQ4Exits = parseInt(q4Match[2]);
  if (currentQ4Exits !== quarters.Q4.exits) {
    // Update total exits
    staticDataContent = staticDataContent.replace(
      /"2025-06-30":\s*{([^}]*)totalExits:\s*\d+/,
      `"2025-06-30": {$1totalExits: ${quarters.Q4.exits}`
    );
    
    // Update response rate comment and calculation
    const responseRatePattern = /responseRate:\s*[\d.]+,\s*\/\/[^\n]*/;
    if (staticDataContent.match(responseRatePattern)) {
      const newResponseRate = (18 / quarters.Q4.exits * 100).toFixed(1);
      staticDataContent = staticDataContent.replace(
        responseRatePattern,
        `responseRate: ${newResponseRate}, // 18 of ${quarters.Q4.exits} exits (auto-synced from turnover data)`
      );
    }
    
    updatesApplied.push(`Q4 FY25: ${currentQ4Exits} → ${quarters.Q4.exits} exits`);
    console.log(`${colors.green}✓${colors.reset} Updated Q4 FY25 exit count: ${currentQ4Exits} → ${quarters.Q4.exits}`);
  } else {
    console.log(`${colors.blue}ℹ${colors.reset} Q4 FY25 already synced: ${quarters.Q4.exits} exits`);
  }
}

// Write updated static data if changes were made
if (updatesApplied.length > 0) {
  try {
    fs.writeFileSync(staticDataPath, staticDataContent);
    console.log(`\n${colors.green}✓ Successfully updated staticData.js${colors.reset}`);
    
    console.log(`\n${colors.magenta}Updates Applied:${colors.reset}`);
    updatesApplied.forEach(update => {
      console.log(`  • ${update}`);
    });
  } catch (error) {
    console.log(`${colors.red}✗ Failed to write staticData.js: ${error.message}${colors.reset}`);
    process.exit(1);
  }
} else {
  console.log(`\n${colors.green}✓ All data sources are already in sync${colors.reset}`);
}

// Run validation to confirm
console.log(`\n${colors.cyan}Running validation check...${colors.reset}`);
const { execSync } = require('child_process');
try {
  execSync('node scripts/validateDataConsistency.js', { stdio: 'inherit' });
} catch (error) {
  console.log(`${colors.yellow}⚠ Validation reported issues. Please review above.${colors.reset}`);
}

console.log(`\n${colors.cyan}========================================${colors.reset}`);
console.log(`${colors.cyan}         Sync Complete!         ${colors.reset}`);
console.log(`${colors.cyan}========================================${colors.reset}\n`);

console.log(`${colors.yellow}💡 Tip: Add this to your data update workflow:${colors.reset}`);
console.log('   1. Process new turnover data: node scripts/processTurnoverData.js');
console.log('   2. Sync to static data: node scripts/syncTurnoverToStaticData.js');
console.log('   3. Validate consistency: node scripts/validateDataConsistency.js\n');