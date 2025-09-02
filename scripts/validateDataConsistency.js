#!/usr/bin/env node

/**
 * Data Consistency Validator
 * Ensures alignment between turnover data and exit survey data
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
  cyan: '\x1b[36m'
};

// Load data sources
const turnoverDataPath = path.join(__dirname, '../src/data/fy25TurnoverData.json');
const staticDataPath = path.join(__dirname, '../src/data/staticData.js');

console.log(`${colors.cyan}========================================${colors.reset}`);
console.log(`${colors.cyan}   Data Consistency Validation Report   ${colors.reset}`);
console.log(`${colors.cyan}========================================${colors.reset}\n`);

// Load and parse turnover data
let turnoverData;
try {
  const rawData = fs.readFileSync(turnoverDataPath, 'utf8');
  turnoverData = JSON.parse(rawData);
  console.log(`${colors.green}✓${colors.reset} Loaded turnover data from: fy25TurnoverData.json`);
} catch (error) {
  console.log(`${colors.red}✗${colors.reset} Failed to load turnover data: ${error.message}`);
  process.exit(1);
}

// Extract quarterly totals from turnover data
const quarterlyTotals = {
  Q1: turnoverData.quarterly.Q1.count,
  Q2: turnoverData.quarterly.Q2.count,
  Q3: turnoverData.quarterly.Q3.count,
  Q4: turnoverData.quarterly.Q4.count
};

console.log(`\n${colors.blue}Turnover Data (Source of Truth):${colors.reset}`);
console.log('├─ Q1 FY25: ' + quarterlyTotals.Q1 + ' exits');
console.log('├─ Q2 FY25: ' + quarterlyTotals.Q2 + ' exits');
console.log('├─ Q3 FY25: ' + quarterlyTotals.Q3 + ' exits');
console.log('├─ Q4 FY25: ' + quarterlyTotals.Q4 + ' exits');
console.log('└─ Total: ' + turnoverData.summary.uniqueEmployees + ' unique employees\n');

// Read static data file to check exit survey data
const staticDataContent = fs.readFileSync(staticDataPath, 'utf8');

// Extract Q4 FY25 exit count from static data
const q4Match = staticDataContent.match(/"2025-06-30":\s*{[^}]*totalExits:\s*(\d+)/);
const q4StaticExits = q4Match ? parseInt(q4Match[1]) : null;

console.log(`${colors.blue}Static Data Exit Survey Values:${colors.reset}`);

// Validation results
let hasErrors = false;
const issues = [];

// Check Q4 FY25 consistency
if (q4StaticExits !== null) {
  console.log(`├─ Q4 FY25 (June 30, 2025): ${q4StaticExits} exits`);
  
  if (q4StaticExits !== quarterlyTotals.Q4) {
    hasErrors = true;
    issues.push({
      location: 'staticData.js - Q4 FY25 (2025-06-30)',
      expected: quarterlyTotals.Q4,
      found: q4StaticExits,
      severity: 'ERROR'
    });
  } else {
    console.log(`${colors.green}  ✓ Matches turnover data${colors.reset}`);
  }
}

// Check for hardcoded values in components
console.log(`\n${colors.blue}Checking Component Files:${colors.reset}`);

const componentsToCheck = [
  'src/components/dashboards/ExitSurveyQ4Dashboard.jsx',
  'src/components/dashboards/ExitSurveyFY25Dashboard.jsx',
  'src/components/dashboards/ExitSurveyOverview.jsx',
  'src/components/charts/FY2025ExitComparison.jsx',
  'src/components/charts/FY2025AnnualExitChart.jsx',
  'src/components/panels/FY2025LessonsLearnedPanel.jsx'
];

componentsToCheck.forEach(componentPath => {
  const fullPath = path.join(__dirname, '..', componentPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const fileName = path.basename(componentPath);
    
    // Check for correct Q4 value (51)
    if (content.includes('51')) {
      console.log(`${colors.green}✓${colors.reset} ${fileName}: Uses correct Q4 value (51)`);
    }
    
    // Check for incorrect old value (62)
    if (content.match(/\b62\b/) && !content.includes('2025-06-30')) {
      const lineMatch = content.split('\n').findIndex(line => line.match(/\b62\b/)) + 1;
      issues.push({
        location: `${fileName}:${lineMatch}`,
        expected: quarterlyTotals.Q4,
        found: 62,
        severity: 'WARNING'
      });
    }
  }
});

// Report issues
if (issues.length > 0) {
  console.log(`\n${colors.red}========================================${colors.reset}`);
  console.log(`${colors.red}   Data Consistency Issues Found   ${colors.reset}`);
  console.log(`${colors.red}========================================${colors.reset}\n`);
  
  issues.forEach(issue => {
    const icon = issue.severity === 'ERROR' ? '✗' : '⚠';
    const color = issue.severity === 'ERROR' ? colors.red : colors.yellow;
    console.log(`${color}${icon}${colors.reset} ${issue.location}`);
    console.log(`  Expected: ${issue.expected}`);
    console.log(`  Found: ${issue.found}\n`);
  });
  
  console.log(`${colors.yellow}Recommendation:${colors.reset}`);
  console.log('1. Update all hardcoded values to match turnover data');
  console.log('2. Consider using a centralized data service');
  console.log('3. Run this validation script after data updates\n');
} else {
  console.log(`\n${colors.green}========================================${colors.reset}`);
  console.log(`${colors.green}   All Data Sources Are Consistent!   ${colors.reset}`);
  console.log(`${colors.green}========================================${colors.reset}\n`);
}

// Calculate and display metrics
console.log(`${colors.cyan}Key Metrics:${colors.reset}`);
const q1ToQ4Reduction = ((quarterlyTotals.Q1 - quarterlyTotals.Q4) / quarterlyTotals.Q1 * 100).toFixed(1);
console.log(`├─ Q1 to Q4 Reduction: ${q1ToQ4Reduction}%`);
console.log(`├─ Total FY25 Exits: ${turnoverData.summary.uniqueEmployees}`);
console.log(`├─ Faculty Exits: ${turnoverData.summary.facultyCount}`);
console.log(`├─ Staff Exits: ${turnoverData.summary.staffCount}`);
console.log(`└─ Avg Years of Service: ${turnoverData.summary.averageYearsOfService}\n`);

process.exit(hasErrors ? 1 : 0);