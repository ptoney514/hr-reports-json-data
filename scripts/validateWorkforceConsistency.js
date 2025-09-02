#!/usr/bin/env node

/**
 * Workforce Data Consistency Validator
 * Ensures alignment between processed workforce data and static data
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
console.log(`${colors.cyan}  Workforce Data Consistency Validator  ${colors.reset}`);
console.log(`${colors.cyan}========================================${colors.reset}\n`);

// Load workforce data
const workforceDataPath = path.join(__dirname, '../src/data/workforceData.json');
const staticDataPath = path.join(__dirname, '../src/data/staticData.js');

// Check if workforce data exists
if (!fs.existsSync(workforceDataPath)) {
  console.log(`${colors.yellow}⚠${colors.reset} Workforce data not found. Run: npm run workforce:process`);
  process.exit(1);
}

// Load processed workforce data
let workforceData;
try {
  const rawData = fs.readFileSync(workforceDataPath, 'utf8');
  workforceData = JSON.parse(rawData);
  console.log(`${colors.green}✓${colors.reset} Loaded workforce data from: workforceData.json`);
  console.log(`  Periods: ${Object.keys(workforceData.periods).length}`);
  console.log(`  Processed: ${new Date(workforceData.metadata.processedDate).toLocaleDateString()}\n`);
} catch (error) {
  console.log(`${colors.red}✗${colors.reset} Failed to load workforce data: ${error.message}`);
  process.exit(1);
}

// Read static data file
const staticDataContent = fs.readFileSync(staticDataPath, 'utf8');

// Key periods to validate
const periodsToCheck = [
  { workforceKey: '2024-06-30', staticKey: '2024-06-30', label: 'Q4 FY24 (6/30/24)' },
  { workforceKey: '2025-03-31', staticKey: '2025-03-31', label: 'Q3 FY25 (3/31/25)' },
  { workforceKey: '2025-06-30', staticKey: '2025-06-30', label: 'Q4 FY25 (6/30/25)' }
];

// Validation results
let hasErrors = false;
const issues = [];

console.log(`${colors.blue}Comparing Workforce Data Sources:${colors.reset}\n`);

periodsToCheck.forEach(period => {
  const workforcePeriod = workforceData.periods[period.workforceKey];
  
  if (!workforcePeriod) {
    console.log(`${colors.yellow}⚠ ${period.label}: Not found in workforce data${colors.reset}`);
    return;
  }
  
  console.log(`${colors.cyan}${period.label}:${colors.reset}`);
  
  // Extract static data values - search in the entire file for WORKFORCE_DATA entries
  // The pattern looks for the date key followed by the workforce metrics including new Jesuits and Other
  const searchPattern = `"${period.staticKey}":[\\s\\S]*?reportingDate:[\\s\\S]*?totalEmployees:\\s*(\\d+)[\\s\\S]*?faculty:\\s*(\\d+)[\\s\\S]*?staff:\\s*(\\d+)[\\s\\S]*?hsp:\\s*(\\d+)[\\s\\S]*?temp:\\s*(\\d+)[\\s\\S]*?jesuits:\\s*(\\d+)[\\s\\S]*?other:\\s*(\\d+)`;
  const datePattern = new RegExp(searchPattern);
  
  // Find the WORKFORCE_DATA section first
  const workforceStart = staticDataContent.indexOf('export const WORKFORCE_DATA');
  const workforceEnd = staticDataContent.indexOf('export const RECRUITING_DATA') || staticDataContent.indexOf('export const', workforceStart + 100);
  
  let match = null;
  if (workforceStart >= 0 && workforceEnd > workforceStart) {
    const workforceSection = staticDataContent.substring(workforceStart, workforceEnd);
    match = workforceSection.match(datePattern);
  }
  
  if (match) {
    const staticValues = {
      totalEmployees: parseInt(match[1]),
      faculty: parseInt(match[2]),
      staff: parseInt(match[3]),
      hsp: parseInt(match[4]),
      temp: parseInt(match[5]),
      jesuits: parseInt(match[6]),
      other: parseInt(match[7])
    };
    
    // Compare values
    const comparisons = [
      { 
        metric: 'Total Employees', 
        workforce: workforcePeriod.totalEmployees, 
        static: staticValues.totalEmployees 
      },
      { 
        metric: 'Faculty', 
        workforce: workforcePeriod.faculty, 
        static: staticValues.faculty 
      },
      { 
        metric: 'Staff', 
        workforce: workforcePeriod.staff, 
        static: staticValues.staff 
      },
      { 
        metric: 'HSP', 
        workforce: workforcePeriod.hsp, 
        static: staticValues.hsp 
      },
      { 
        metric: 'Temporary', 
        workforce: workforcePeriod.temp, 
        static: staticValues.temp 
      },
      { 
        metric: 'Jesuits', 
        workforce: workforcePeriod.jesuits, 
        static: staticValues.jesuits 
      },
      { 
        metric: 'Other', 
        workforce: workforcePeriod.other, 
        static: staticValues.other 
      }
    ];
    
    comparisons.forEach(comp => {
      const diff = comp.workforce - comp.static;
      const percentDiff = comp.static ? ((diff / comp.static) * 100).toFixed(1) : 'N/A';
      
      if (diff === 0) {
        console.log(`  ${colors.green}✓${colors.reset} ${comp.metric}: ${comp.workforce} (matches)`);
      } else {
        hasErrors = true;
        const sign = diff > 0 ? '+' : '';
        console.log(`  ${colors.red}✗${colors.reset} ${comp.metric}: CSV=${comp.workforce}, Static=${comp.static} (${sign}${diff}, ${sign}${percentDiff}%)`);
        
        issues.push({
          period: period.label,
          metric: comp.metric,
          csvValue: comp.workforce,
          staticValue: comp.static,
          difference: diff
        });
      }
    });
    
    // Additional validations - now includes all categories
    const csvSum = workforcePeriod.faculty + workforcePeriod.staff + workforcePeriod.hsp + workforcePeriod.temp + 
                   workforcePeriod.jesuits + workforcePeriod.other + workforcePeriod.studentCount.total;
    if (csvSum !== workforcePeriod.totalEmployees) {
      console.log(`  ${colors.yellow}⚠${colors.reset} CSV sum validation: ${csvSum} ≠ ${workforcePeriod.totalEmployees}`);
      console.log(`    (Faculty: ${workforcePeriod.faculty} + Staff: ${workforcePeriod.staff} + HSP: ${workforcePeriod.hsp} + Temp: ${workforcePeriod.temp} + Jesuits: ${workforcePeriod.jesuits} + Other: ${workforcePeriod.other} + Students: ${workforcePeriod.studentCount.total})`);
    } else {
      console.log(`  ${colors.green}✓${colors.reset} CSV sum validation: All categories total to ${workforcePeriod.totalEmployees}`);
    }
    
    const staticSum = staticValues.faculty + staticValues.staff + staticValues.hsp + staticValues.temp + 
                     staticValues.jesuits + staticValues.other + workforcePeriod.studentCount.total;
    if (staticSum !== staticValues.totalEmployees) {
      console.log(`  ${colors.yellow}⚠${colors.reset} Static sum validation: ${staticSum} ≠ ${staticValues.totalEmployees}`);
    } else {
      console.log(`  ${colors.green}✓${colors.reset} Static sum validation: All categories total correctly`);
    }
    
  } else {
    console.log(`  ${colors.yellow}⚠ Not found in staticData.js${colors.reset}`);
  }
  
  console.log('');
});

// Check for student data
console.log(`${colors.blue}Student Worker Data:${colors.reset}`);
periodsToCheck.forEach(period => {
  const workforcePeriod = workforceData.periods[period.workforceKey];
  if (!workforcePeriod) return;
  
  console.log(`${period.label}:`);
  console.log(`  SUE (Student Employees): ${workforcePeriod.studentCount.studentWorker}`);
  console.log(`  CWS (Federal Work Study): ${workforcePeriod.studentCount.fws}`);
  console.log(`  Total Students: ${workforcePeriod.studentCount.total}`);
});

// Category breakdown
console.log(`\n${colors.blue}Assignment Categories (Q4 FY25):${colors.reset}`);
const q4fy25 = workforceData.periods['2025-06-30'];
if (q4fy25 && q4fy25.categories) {
  const sortedCategories = Object.entries(q4fy25.categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  sortedCategories.forEach(([category, count]) => {
    console.log(`  ${category}: ${count}`);
  });
}

// Report summary
console.log(`\n${colors.cyan}========================================${colors.reset}`);
if (hasErrors) {
  console.log(`${colors.red}   Data Inconsistencies Found!   ${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);
  
  console.log(`${colors.red}Summary of Issues:${colors.reset}`);
  issues.forEach(issue => {
    const sign = issue.difference > 0 ? '+' : '';
    console.log(`  ${issue.period} - ${issue.metric}:`);
    console.log(`    CSV: ${issue.csvValue}, Static: ${issue.staticValue} (${sign}${issue.difference})`);
  });
  
  console.log(`\n${colors.yellow}Recommendations:${colors.reset}`);
  console.log('1. Review CSV data source for accuracy');
  console.log('2. Verify employee counting methodology');
  console.log('3. Check if static data needs updating');
  console.log('4. Run sync after verification: npm run workforce:sync\n');
  
  // Calculate impact
  const q4fy25Issue = issues.find(i => i.period.includes('Q4 FY25') && i.metric === 'Total Employees');
  if (q4fy25Issue) {
    console.log(`${colors.magenta}Impact Analysis:${colors.reset}`);
    console.log(`Q4 FY25 shows ${Math.abs(q4fy25Issue.difference)} employee difference`);
    console.log(`This is a ${Math.abs((q4fy25Issue.difference / q4fy25Issue.staticValue * 100)).toFixed(1)}% variance\n`);
  }
} else {
  console.log(`${colors.green}   All Data Sources Are Consistent!   ${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);
}

// Display key metrics
console.log(`${colors.cyan}Key Metrics (from CSV):${colors.reset}`);
if (q4fy25) {
  console.log(`├─ Total Employees: ${q4fy25.totalEmployees}`);
  console.log(`├─ Faculty: ${q4fy25.faculty}`);
  console.log(`├─ Staff: ${q4fy25.staff}`);
  console.log(`├─ HSP: ${q4fy25.hsp}`);
  console.log(`├─ Temporary: ${q4fy25.temp}`);
  console.log(`└─ Students: ${q4fy25.studentCount.total} (SUE: ${q4fy25.studentCount.studentWorker}, CWS: ${q4fy25.studentCount.fws})\n`);
}

// Year-over-year comparison
const q4fy24 = workforceData.periods['2024-06-30'];
if (q4fy24 && q4fy25) {
  const yoyChange = q4fy25.totalEmployees - q4fy24.totalEmployees;
  const yoyPercent = ((yoyChange / q4fy24.totalEmployees) * 100).toFixed(1);
  
  console.log(`${colors.cyan}Year-over-Year (Q4 FY24 → Q4 FY25):${colors.reset}`);
  console.log(`├─ FY24: ${q4fy24.totalEmployees} employees`);
  console.log(`├─ FY25: ${q4fy25.totalEmployees} employees`);
  console.log(`└─ Change: ${yoyChange > 0 ? '+' : ''}${yoyChange} (${yoyChange > 0 ? '+' : ''}${yoyPercent}%)\n`);
}

process.exit(hasErrors ? 1 : 0);