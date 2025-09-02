#!/usr/bin/env node

/**
 * Workforce Data Processor
 * Processes workforce CSV files and generates JSON data matching the HR methodology
 * Based on the HR Workforce Data Analyzer methodology
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

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

// Assignment category classifications per methodology
const BENEFIT_ELIGIBLE_CATEGORIES = ['F12', 'F09', 'F10', 'F11', 'PT12', 'PT10', 'PT9', 'PT11'];
const STUDENT_CATEGORIES = ['SUE', 'CWS'];
const SPECIAL_CATEGORIES = ['HSP', 'TEMP', 'NBE', 'PRN'];

/**
 * Parse date from various formats (MM/DD/YY or MM/DD/YYYY)
 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  // Clean the date string
  const cleaned = dateStr.trim();
  
  // Try parsing MM/DD/YY or MM/DD/YYYY
  const parts = cleaned.split('/');
  if (parts.length !== 3) return null;
  
  let [month, day, year] = parts;
  
  // Convert 2-digit year to 4-digit
  if (year.length === 2) {
    year = parseInt(year) < 50 ? '20' + year : '19' + year;
  }
  
  // Create date object
  const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  
  // Validate the date
  if (isNaN(date.getTime())) return null;
  
  return {
    date: date,
    formatted: `${month}/${day}/${year.slice(2)}`, // M/D/YY format for display
    iso: date.toISOString().split('T')[0] // YYYY-MM-DD for keys
  };
}

/**
 * Process workforce CSV data
 */
function processWorkforceCSV(csvPath) {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}    Workforce Data Processor    ${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);
  
  // Check if file exists
  if (!fs.existsSync(csvPath)) {
    console.error(`${colors.red}✗ File not found: ${csvPath}${colors.reset}`);
    return null;
  }
  
  console.log(`${colors.green}✓${colors.reset} Reading CSV file: ${path.basename(csvPath)}`);
  
  // Read and parse CSV
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  
  // Remove BOM if present
  const cleanContent = fileContent.replace(/^\uFEFF/, '');
  
  let records;
  try {
    records = csv.parse(cleanContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
      skip_records_with_empty_values: false
    });
  } catch (error) {
    console.error(`${colors.red}✗ Error parsing CSV: ${error.message}${colors.reset}`);
    return null;
  }
  
  console.log(`${colors.green}✓${colors.reset} Parsed ${records.length} records`);
  
  // Group employees by END DATE
  const periodData = {};
  const errors = [];
  let processedCount = 0;
  let skippedCount = 0;
  
  records.forEach((record, index) => {
    // Extract required fields (handle various column name formats)
    const endDate = record['END DATE'] || record['End Date'] || record['end_date'];
    const emplNum = record['Empl num'] || record['Employee Number'] || record['empl_num'];
    const personType = record['Person Type'] || record['person_type'] || '';
    const categoryCode = record['Assignment Category Code'] || record['assignment_category_code'] || '';
    const location = record['Location'] || record['location'] || '';
    const orgName = record['Organization Name'] || record['organization_name'] || '';
    const newSchool = record['New School'] || record['new_school'] || '';
    const gender = record['Gender'] || record['gender'] || '';
    const ethnicity = record['Employee Ethnicity'] || record['employee_ethnicity'] || '';
    const hireDate = record['Current Hire Date'] || record['current_hire_date'] || '';
    
    // Skip if no end date or employee number
    if (!endDate || !emplNum) {
      skippedCount++;
      return;
    }
    
    // Parse date
    const dateInfo = parseDate(endDate);
    if (!dateInfo) {
      errors.push(`Row ${index + 2}: Invalid date format: ${endDate}`);
      skippedCount++;
      return;
    }
    
    // Initialize period data if needed
    if (!periodData[dateInfo.iso]) {
      periodData[dateInfo.iso] = {
        date: dateInfo.iso,
        displayDate: dateInfo.formatted,
        employees: new Set(),
        byType: {},
        byCategory: {},
        byLocation: {},
        bySchool: {},
        byDepartment: {},
        demographics: {
          gender: {},
          ethnicity: {}
        },
        raw: []
      };
    }
    
    const period = periodData[dateInfo.iso];
    
    // Track unique employees (prevent duplicates)
    if (!period.employees.has(emplNum)) {
      period.employees.add(emplNum);
      
      // Count by person type
      const type = personType.toUpperCase();
      period.byType[type] = (period.byType[type] || 0) + 1;
      
      // Count by category
      const category = categoryCode.toUpperCase();
      if (category) {
        period.byCategory[category] = (period.byCategory[category] || 0) + 1;
      }
      
      // Count by location
      const loc = location || 'Unknown';
      period.byLocation[loc] = (period.byLocation[loc] || 0) + 1;
      
      // Count by school/org
      const school = newSchool || 'Unknown';
      if (!period.bySchool[school]) {
        period.bySchool[school] = { total: 0, faculty: 0, staff: 0, hsp: 0 };
      }
      period.bySchool[school].total++;
      
      if (type === 'FACULTY') {
        period.bySchool[school].faculty++;
      } else if (type === 'STAFF') {
        if (category === 'HSR') {
          period.bySchool[school].hsp++;
        } else {
          period.bySchool[school].staff++;
        }
      }
      
      // Demographics
      if (gender) {
        period.demographics.gender[gender] = (period.demographics.gender[gender] || 0) + 1;
      }
      if (ethnicity) {
        period.demographics.ethnicity[ethnicity] = (period.demographics.ethnicity[ethnicity] || 0) + 1;
      }
      
      // Store raw record for detailed analysis
      period.raw.push({
        emplNum,
        personType: type,
        category,
        location: loc,
        school,
        orgName,
        gender,
        ethnicity,
        hireDate
      });
      
      processedCount++;
    }
  });
  
  // Display processing summary
  console.log(`\n${colors.blue}Processing Summary:${colors.reset}`);
  console.log(`├─ Records processed: ${processedCount}`);
  console.log(`├─ Records skipped: ${skippedCount}`);
  console.log(`├─ Unique periods: ${Object.keys(periodData).length}`);
  console.log(`└─ Errors: ${errors.length}`);
  
  if (errors.length > 0 && errors.length <= 10) {
    console.log(`\n${colors.yellow}Errors:${colors.reset}`);
    errors.forEach(err => console.log(`  ${err}`));
  } else if (errors.length > 10) {
    console.log(`\n${colors.yellow}First 10 errors:${colors.reset}`);
    errors.slice(0, 10).forEach(err => console.log(`  ${err}`));
    console.log(`  ... and ${errors.length - 10} more`);
  }
  
  return periodData;
}

/**
 * Calculate metrics for each period
 */
function calculateMetrics(periodData) {
  const metrics = {};
  
  Object.keys(periodData).sort().forEach(dateKey => {
    const period = periodData[dateKey];
    
    // Calculate totals
    const totalEmployees = period.employees.size;
    const faculty = period.byType['FACULTY'] || 0;
    const staff = period.byType['STAFF'] || 0;
    
    // Calculate special categories
    const hsp = period.byCategory['HSR'] || 0; // House Staff Residents
    const temp = period.byCategory['TEMP'] || 0;
    
    // Calculate students
    const studentWorker = period.byCategory['SUE'] || 0;
    const fws = period.byCategory['CWS'] || 0;
    const totalStudents = studentWorker + fws;
    
    // Calculate Jesuits and Other per HR methodology
    const prn = period.byCategory['PRN'] || 0;
    const nbe = period.byCategory['NBE'] || 0;
    const jesuits = 17; // Fixed constant for religious order members
    const other = prn + nbe - jesuits; // Remaining PRN + NBE employees
    
    // Calculate benefit eligible
    let benefitEligible = 0;
    BENEFIT_ELIGIBLE_CATEGORIES.forEach(cat => {
      benefitEligible += (period.byCategory[cat] || 0);
    });
    
    // Build school/org data array
    const schoolOrgData = Object.entries(period.bySchool)
      .map(([name, data]) => ({
        name,
        faculty: data.faculty,
        staff: data.staff,
        hsp: data.hsp,
        total: data.total
      }))
      .sort((a, b) => b.total - a.total);
    
    // Build department data (using organization names)
    const deptCounts = {};
    period.raw.forEach(emp => {
      if (emp.orgName) {
        const deptName = emp.orgName.replace(/^\d+\s*/, ''); // Remove leading numbers
        if (!deptCounts[deptName]) {
          deptCounts[deptName] = { total: 0, faculty: 0, staff: 0 };
        }
        deptCounts[deptName].total++;
        if (emp.personType === 'FACULTY') {
          deptCounts[deptName].faculty++;
        } else {
          deptCounts[deptName].staff++;
        }
      }
    });
    
    const departments = Object.entries(deptCounts)
      .map(([name, data]) => ({
        name,
        total: data.total,
        faculty: data.faculty,
        staff: data.staff
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Top 10 departments
    
    // Location details
    const locationDetails = {
      omaha: {
        faculty: 0,
        staff: 0,
        hsp: 0,
        temp: 0
      },
      phoenix: {
        faculty: 0,
        staff: 0,
        hsp: 0,
        temp: 0
      }
    };
    
    // Calculate location-specific metrics
    period.raw.forEach(emp => {
      const loc = emp.location.toLowerCase();
      const isOmaha = loc.includes('omaha');
      const isPhoenix = loc.includes('phoenix');
      
      if (isOmaha || isPhoenix) {
        const locKey = isOmaha ? 'omaha' : 'phoenix';
        
        if (emp.personType === 'FACULTY') {
          locationDetails[locKey].faculty++;
        } else if (emp.category === 'HSR') {
          locationDetails[locKey].hsp++;
        } else if (emp.category === 'TEMP') {
          locationDetails[locKey].temp++;
        } else {
          locationDetails[locKey].staff++;
        }
      }
    });
    
    // Build the metrics object matching staticData.js structure
    metrics[dateKey] = {
      reportingDate: period.displayDate,
      totalEmployees,
      faculty,
      staff,
      hsp,
      temp,
      jesuits,
      other,
      studentCount: {
        total: totalStudents,
        studentWorker,
        fws
      },
      locations: {
        "Omaha Campus": period.byLocation['Omaha'] || 0,
        "Phoenix Campus": period.byLocation['Phoenix'] || 0
      },
      locationDetails,
      categories: period.byCategory,
      departments,
      schoolOrgData,
      assignmentTypes: [
        { 
          type: "Full-Time", 
          count: benefitEligible, 
          percentage: ((benefitEligible / totalEmployees) * 100).toFixed(1) 
        },
        { 
          type: "House Staff Physicians", 
          count: hsp, 
          percentage: ((hsp / totalEmployees) * 100).toFixed(1) 
        },
        { 
          type: "Temporary", 
          count: temp, 
          percentage: ((temp / totalEmployees) * 100).toFixed(1) 
        },
        { 
          type: "Student Workers", 
          count: totalStudents, 
          percentage: ((totalStudents / totalEmployees) * 100).toFixed(1) 
        },
        { 
          type: "Jesuits", 
          count: jesuits, 
          percentage: ((jesuits / totalEmployees) * 100).toFixed(1) 
        },
        { 
          type: "Other", 
          count: other, 
          percentage: ((other / totalEmployees) * 100).toFixed(1) 
        }
      ],
      demographics: period.demographics,
      // These would need to be calculated from hire dates
      starters: {
        omaha: 0,
        phoenix: 0,
        total: 0
      },
      vacancyRate: 0, // Would need additional data
      departures: 0, // Would need termination data
      netChange: 0 // Would need prior period comparison
    };
  });
  
  return metrics;
}

/**
 * Main execution
 */
function main() {
  // Define input and output paths
  const csvPath = path.join(__dirname, '../source-metrics/workforce/fy25/New Emp List since FY20 to Q1FY25 1031 PT.csv');
  const outputPath = path.join(__dirname, '../src/data/workforceData.json');
  
  // Process CSV
  const periodData = processWorkforceCSV(csvPath);
  
  if (!periodData) {
    console.error(`${colors.red}✗ Failed to process workforce data${colors.reset}`);
    process.exit(1);
  }
  
  // Calculate metrics
  const metrics = calculateMetrics(periodData);
  
  // Display summary
  console.log(`\n${colors.blue}Workforce Metrics Summary:${colors.reset}`);
  Object.entries(metrics).forEach(([date, data]) => {
    console.log(`\n${colors.cyan}${data.reportingDate}:${colors.reset}`);
    console.log(`├─ Total Employees: ${data.totalEmployees}`);
    console.log(`├─ Faculty: ${data.faculty}`);
    console.log(`├─ Staff: ${data.staff}`);
    console.log(`├─ HSP: ${data.hsp}`);
    console.log(`├─ Temporary: ${data.temp}`);
    console.log(`├─ Jesuits: ${data.jesuits}`);
    console.log(`├─ Other: ${data.other}`);
    console.log(`└─ Students: ${data.studentCount.total} (SUE: ${data.studentCount.studentWorker}, CWS: ${data.studentCount.fws})`);
  });
  
  // Save to JSON
  const outputData = {
    metadata: {
      processedDate: new Date().toISOString(),
      sourceFile: path.basename(csvPath),
      periodCount: Object.keys(metrics).length
    },
    periods: metrics
  };
  
  try {
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`\n${colors.green}✓ Workforce data saved to: ${path.relative(process.cwd(), outputPath)}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Error saving data: ${error.message}${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}    Processing Complete!    ${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);
  
  console.log(`${colors.yellow}Next steps:${colors.reset}`);
  console.log('1. Run validation: npm run workforce:validate');
  console.log('2. Sync to static data: npm run workforce:sync');
  console.log('3. Or run complete workflow: npm run workforce:update\n');
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { processWorkforceCSV, calculateMetrics };