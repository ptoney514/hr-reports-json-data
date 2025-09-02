#!/usr/bin/env node

/**
 * Workforce Data Sync Script
 * Syncs processed workforce data from workforceData.json to staticData.js
 * Includes ALL employees (benefit-eligible and non-benefit eligible)
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
console.log(`${colors.cyan}    Workforce Data Sync Utility    ${colors.reset}`);
console.log(`${colors.cyan}========================================${colors.reset}\n`);

// Load workforce data
const workforceDataPath = path.join(__dirname, '../src/data/workforceData.json');
const staticDataPath = path.join(__dirname, '../src/data/staticData.js');

if (!fs.existsSync(workforceDataPath)) {
  console.log(`${colors.red}✗${colors.reset} Workforce data not found. Run: npm run workforce:process`);
  process.exit(1);
}

let workforceData;
try {
  const rawData = fs.readFileSync(workforceDataPath, 'utf8');
  workforceData = JSON.parse(rawData);
  console.log(`${colors.green}✓${colors.reset} Loaded workforce data from workforceData.json`);
} catch (error) {
  console.log(`${colors.red}✗${colors.reset} Failed to load workforce data: ${error.message}`);
  process.exit(1);
}

// Key periods to sync
const periodsToSync = [
  { sourceKey: '2024-06-30', targetKey: '2024-06-30', label: 'Q4 FY24 (6/30/24)' },
  { sourceKey: '2025-03-31', targetKey: '2025-03-31', label: 'Q3 FY25 (3/31/25)' },
  { sourceKey: '2025-06-30', targetKey: '2025-06-30', label: 'Q4 FY25 (6/30/25)' }
];

console.log(`${colors.blue}Workforce Data to Sync:${colors.reset}`);
periodsToSync.forEach(period => {
  const data = workforceData.periods[period.sourceKey];
  if (data) {
    console.log(`├─ ${period.label}: ${data.totalEmployees} total employees`);
    console.log(`│  ├─ Faculty: ${data.faculty}`);
    console.log(`│  ├─ Staff: ${data.staff}`);
    console.log(`│  ├─ HSP: ${data.hsp}`);
    console.log(`│  ├─ Temporary: ${data.temp}`);
    console.log(`│  ├─ Jesuits: ${data.jesuits}`);
    console.log(`│  ├─ Other: ${data.other}`);
    console.log(`│  └─ Students: ${data.studentCount.total} (SUE: ${data.studentCount.studentWorker}, CWS: ${data.studentCount.fws})`);
  }
});
console.log('');

// Read current static data
let staticDataContent = fs.readFileSync(staticDataPath, 'utf8');
let updatesApplied = [];

// Function to update a period in WORKFORCE_DATA
function updateWorkforcePeriod(content, periodKey, newData) {
  // Find the WORKFORCE_DATA section
  const workforceStart = content.indexOf('export const WORKFORCE_DATA');
  const workforceEnd = content.indexOf('};', workforceStart) + 2;
  
  if (workforceStart === -1) {
    console.log(`${colors.red}✗ WORKFORCE_DATA not found in staticData.js${colors.reset}`);
    return content;
  }
  
  // Find the specific date entry - need to match the entire period object
  // Look for the date key and capture everything until the next date key or end of object
  const datePattern = new RegExp(
    `"${periodKey}":\\s*{[\\s\\S]*?\\n  }(?=,\\s*"\\d{4}-\\d{2}-\\d{2}"|\\s*}\\s*;)`,
    'm'
  );
  const dateMatch = content.match(datePattern);
  
  if (!dateMatch) {
    console.log(`${colors.yellow}⚠ Period ${periodKey} not found in WORKFORCE_DATA${colors.reset}`);
    return content;
  }
  
  // Build the replacement object
  const replacement = `"${periodKey}": {
    reportingDate: "${newData.reportingDate}",
    starters: {
      omaha: ${newData.starters?.omaha || 0},
      phoenix: ${newData.starters?.phoenix || 0},
      total: ${newData.starters?.total || 0}
    },
    studentCount: {
      total: ${newData.studentCount.total},
      studentWorker: ${newData.studentCount.studentWorker},
      fws: ${newData.studentCount.fws}
    },
    totalEmployees: ${newData.totalEmployees},
    faculty: ${newData.faculty},
    staff: ${newData.staff},
    hsp: ${newData.hsp},
    temp: ${newData.temp},
    jesuits: ${newData.jesuits},
    other: ${newData.other},
    locations: {
      "Omaha Campus": ${newData.locations["Omaha Campus"] || 0},
      "Phoenix Campus": ${newData.locations["Phoenix Campus"] || 0}
    },
    locationDetails: {
      omaha: {
        faculty: ${newData.locationDetails.omaha.faculty},
        staff: ${newData.locationDetails.omaha.staff},
        hsp: ${newData.locationDetails.omaha.hsp},
        temp: ${newData.locationDetails.omaha.temp}
      },
      phoenix: {
        faculty: ${newData.locationDetails.phoenix.faculty},
        staff: ${newData.locationDetails.phoenix.staff},
        hsp: ${newData.locationDetails.phoenix.hsp},
        temp: ${newData.locationDetails.phoenix.temp}
      }
    },
    categories: ${JSON.stringify(newData.categories, null, 6).replace(/\n/g, '\n    ')},
    departments: ${JSON.stringify(newData.departments, null, 6).replace(/\n/g, '\n    ')},
    schoolOrgData: ${JSON.stringify(newData.schoolOrgData, null, 6).replace(/\n/g, '\n    ')},
    assignmentTypes: ${JSON.stringify(newData.assignmentTypes, null, 6).replace(/\n/g, '\n    ')},
    vacancyRate: ${newData.vacancyRate},
    departures: ${newData.departures},
    netChange: ${newData.netChange}
  }`;
  
  // Replace the old period data with the new
  content = content.replace(dateMatch[0], replacement);
  
  return content;
}

// Apply updates for each period
periodsToSync.forEach(period => {
  const sourceData = workforceData.periods[period.sourceKey];
  
  if (!sourceData) {
    console.log(`${colors.yellow}⚠ No data for ${period.label} in workforce data${colors.reset}`);
    return;
  }
  
  const originalContent = staticDataContent;
  staticDataContent = updateWorkforcePeriod(staticDataContent, period.targetKey, sourceData);
  
  if (originalContent !== staticDataContent) {
    updatesApplied.push(period.label);
    console.log(`${colors.green}✓${colors.reset} Updated ${period.label}`);
  } else {
    console.log(`${colors.blue}ℹ${colors.reset} No changes needed for ${period.label}`);
  }
});

// Write updated static data if changes were made
if (updatesApplied.length > 0) {
  try {
    // Create backup
    const backupPath = staticDataPath + '.backup';
    fs.copyFileSync(staticDataPath, backupPath);
    console.log(`\n${colors.blue}ℹ Backup created at: ${path.basename(backupPath)}${colors.reset}`);
    
    // Write updated content
    fs.writeFileSync(staticDataPath, staticDataContent);
    console.log(`${colors.green}✓ Successfully updated staticData.js${colors.reset}`);
    
    console.log(`\n${colors.magenta}Updates Applied:${colors.reset}`);
    updatesApplied.forEach(update => {
      console.log(`  • ${update}`);
    });
    
    // Show summary of new totals
    console.log(`\n${colors.cyan}New Employee Totals in Static Data:${colors.reset}`);
    periodsToSync.forEach(period => {
      const data = workforceData.periods[period.sourceKey];
      if (data) {
        console.log(`  ${period.label}: ${data.totalEmployees} employees (includes all categories)`);
      }
    });
    
  } catch (error) {
    console.log(`${colors.red}✗ Failed to write staticData.js: ${error.message}${colors.reset}`);
    process.exit(1);
  }
} else {
  console.log(`\n${colors.green}✓ All workforce data is already in sync${colors.reset}`);
}

// Run validation to confirm
console.log(`\n${colors.cyan}Running validation check...${colors.reset}`);
const { execSync } = require('child_process');
try {
  execSync('node scripts/validateWorkforceConsistency.js', { stdio: 'inherit' });
} catch (error) {
  console.log(`${colors.yellow}⚠ Validation reported issues. Please review above.${colors.reset}`);
}

console.log(`\n${colors.cyan}========================================${colors.reset}`);
console.log(`${colors.cyan}         Sync Complete!         ${colors.reset}`);
console.log(`${colors.cyan}========================================${colors.reset}\n`);

console.log(`${colors.yellow}Important Notes:${colors.reset}`);
console.log('• Total employees now includes ALL categories:');
console.log('  - Benefit-eligible (F12, F09, F10, PT12, etc.)');
console.log('  - Students (SUE, CWS)');
console.log('  - House Staff (HSP)');
console.log('  - Temporary (TEMP)');
console.log('  - Non-benefit eligible (NBE, PRN)');
console.log('\n• Dashboards will show higher employee counts than before');
console.log('• This is the correct methodology per HR requirements\n');