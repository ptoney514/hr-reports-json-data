/**
 * Process Turnover Data from Excel
 * Extracts and analyzes FY25 termination data from HR system export
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_FILE = path.join(__dirname, '../source-metrics/turnover/fy25/Terms Since 2017 Detail PT.xlsx');
const OUTPUT_FILE = path.join(__dirname, '../src/data/fy25TurnoverData.json');

// FY25 Date Range
const FY25_START = new Date('2024-07-01');
const FY25_END = new Date('2025-06-30');

// Quarter definitions
const QUARTERS = {
  Q1: { start: new Date('2024-07-01'), end: new Date('2024-09-30'), label: 'Q1 FY25' },
  Q2: { start: new Date('2024-10-01'), end: new Date('2024-12-31'), label: 'Q2 FY25' },
  Q3: { start: new Date('2025-01-01'), end: new Date('2025-03-31'), label: 'Q3 FY25' },
  Q4: { start: new Date('2025-04-01'), end: new Date('2025-06-30'), label: 'Q4 FY25' }
};

// Excel date conversion helper
function excelDateToJSDate(excelDate) {
  if (typeof excelDate === 'number') {
    // Excel dates are days since 1900-01-01 (with leap year bug)
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date;
  }
  return new Date(excelDate);
}

// Calculate years of service
function calculateYearsOfService(hireDate, termDate) {
  const hire = excelDateToJSDate(hireDate);
  const term = excelDateToJSDate(termDate);
  const years = (term - hire) / (365.25 * 24 * 60 * 60 * 1000);
  return Math.round(years * 10) / 10; // Round to 1 decimal
}

// Determine which quarter a date falls in
function getQuarter(date) {
  for (const [key, quarter] of Object.entries(QUARTERS)) {
    if (date >= quarter.start && date <= quarter.end) {
      return key;
    }
  }
  return null;
}

// Main processing function
async function processTurnoverData() {
  console.log('Reading Excel file:', INPUT_FILE);
  
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(INPUT_FILE);
    // Use Sheet1 which contains the actual data
    const sheetName = 'Sheet1';
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'mm/dd/yyyy' });
    console.log(`Total records in file: ${data.length}`);
    
    // Categories to exclude from turnover counts
    const excludedCategories = ['HSR', 'CWS', 'SUE', 'TEMP', 'PRN', 'NBE'];
    
    // Filter for FY25 and exclude specific assignment categories
    const fy25Data = data.filter(row => {
      const termDate = excelDateToJSDate(row['Term Date']);
      const isInFY25 = termDate >= FY25_START && termDate <= FY25_END;
      const assignmentCategory = row['Assignment Category'] || '';
      const isNotExcluded = !excludedCategories.includes(assignmentCategory);
      return isInFY25 && isNotExcluded;
    });
    
    console.log(`FY25 records (excluding HSR, CWS, SUE, TEMP, PRN, NBE): ${fy25Data.length}`);
    
    // Log excluded records for verification
    const excludedData = data.filter(row => {
      const termDate = excelDateToJSDate(row['Term Date']);
      const isInFY25 = termDate >= FY25_START && termDate <= FY25_END;
      const assignmentCategory = row['Assignment Category'] || '';
      const isExcluded = excludedCategories.includes(assignmentCategory);
      return isInFY25 && isExcluded;
    });
    console.log('Excluded categories breakdown:');
    excludedCategories.forEach(cat => {
      const count = excludedData.filter(row => row['Assignment Category'] === cat).length;
      if (count > 0) {
        console.log(`  ${cat}: ${count} records excluded`);
      }
    });
    
    // Initialize analysis structure
    const analysis = {
      metadata: {
        processedDate: new Date().toISOString(),
        sourceFile: 'Terms Since 2017 Detail PT.xlsx',
        fiscalYear: 'FY25',
        dateRange: {
          start: '2024-07-01',
          end: '2025-06-30'
        }
      },
      summary: {
        totalTerminations: 0,
        uniqueEmployees: 0,
        facultyCount: 0,
        staffCount: 0,
        averageYearsOfService: 0
      },
      quarterly: {
        Q1: { count: 0, faculty: 0, staff: 0, employees: [] },
        Q2: { count: 0, faculty: 0, staff: 0, employees: [] },
        Q3: { count: 0, faculty: 0, staff: 0, employees: [] },
        Q4: { count: 0, faculty: 0, staff: 0, employees: [] }
      },
      termReasons: {},
      departments: {},
      yearsOfService: {
        '0-1': 0,
        '1-3': 0,
        '3-5': 0,
        '5-10': 0,
        '10-15': 0,
        '15-20': 0,
        '20+': 0
      },
      assignmentCategories: {},
      demographics: {
        gender: {},
        ethnicity: {},
        ageGroups: {}
      }
    };
    
    // Track unique employees
    const uniqueEmployees = new Set();
    let totalYearsOfService = 0;
    
    // Process each record
    fy25Data.forEach(row => {
      const emplNum = row['Empl Num'];
      const termDate = excelDateToJSDate(row['Term Date']);
      const quarter = getQuarter(termDate);
      
      // Track unique employees
      uniqueEmployees.add(emplNum);
      
      // Faculty/Staff classification (column is 'Faxc Staff' not 'Fac Staff')
      const facStaff = row['Faxc Staff'] || 'Unknown';
      const isFaculty = facStaff.toLowerCase().includes('fac');
      
      // Years of service
      if (row['Hire Date']) {
        const years = calculateYearsOfService(row['Hire Date'], row['Term Date']);
        totalYearsOfService += years;
        
        // Categorize years of service
        if (years < 1) analysis.yearsOfService['0-1']++;
        else if (years < 3) analysis.yearsOfService['1-3']++;
        else if (years < 5) analysis.yearsOfService['3-5']++;
        else if (years < 10) analysis.yearsOfService['5-10']++;
        else if (years < 15) analysis.yearsOfService['10-15']++;
        else if (years < 20) analysis.yearsOfService['15-20']++;
        else analysis.yearsOfService['20+']++;
      }
      
      // Quarterly breakdown
      if (quarter) {
        analysis.quarterly[quarter].count++;
        if (isFaculty) {
          analysis.quarterly[quarter].faculty++;
          analysis.summary.facultyCount++;
        } else {
          analysis.quarterly[quarter].staff++;
          analysis.summary.staffCount++;
        }
        analysis.quarterly[quarter].employees.push(emplNum);
      }
      
      // Term reasons
      const termReason = row['Term Reason 2'] || 'Not Specified';
      analysis.termReasons[termReason] = (analysis.termReasons[termReason] || 0) + 1;
      
      // Department (if available)
      const dept = row['Department'] || row['Dept'] || 'Unknown';
      if (dept) {
        analysis.departments[dept] = (analysis.departments[dept] || 0) + 1;
      }
      
      // Assignment Category
      const assignmentCat = row['Assignment Category'] || 'Unknown';
      analysis.assignmentCategories[assignmentCat] = (analysis.assignmentCategories[assignmentCat] || 0) + 1;
      
      // Demographics (if available)
      if (row['Gender']) {
        analysis.demographics.gender[row['Gender']] = (analysis.demographics.gender[row['Gender']] || 0) + 1;
      }
      if (row['Ethnicity']) {
        analysis.demographics.ethnicity[row['Ethnicity']] = (analysis.demographics.ethnicity[row['Ethnicity']] || 0) + 1;
      }
      if (row['Age'] || row['Birth Date']) {
        // Calculate age group if needed
        // Implementation depends on available data
      }
    });
    
    // Update summary
    analysis.summary.totalTerminations = fy25Data.length;
    analysis.summary.uniqueEmployees = uniqueEmployees.size;
    analysis.summary.averageYearsOfService = uniqueEmployees.size > 0 
      ? Math.round((totalYearsOfService / uniqueEmployees.size) * 10) / 10 
      : 0;
    
    // Sort term reasons by count
    const sortedReasons = Object.entries(analysis.termReasons)
      .sort((a, b) => b[1] - a[1])
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
    analysis.termReasons = sortedReasons;
    
    // Calculate percentages
    analysis.termReasonPercentages = {};
    Object.entries(analysis.termReasons).forEach(([reason, count]) => {
      analysis.termReasonPercentages[reason] = 
        Math.round((count / analysis.summary.uniqueEmployees) * 1000) / 10; // Percentage with 1 decimal
    });
    
    // Save results
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(analysis, null, 2));
    console.log('Analysis complete. Results saved to:', OUTPUT_FILE);
    
    // Print summary
    console.log('\n=== FY25 Turnover Summary ===');
    console.log(`Total Unique Terminations: ${analysis.summary.uniqueEmployees}`);
    console.log(`Faculty: ${analysis.summary.facultyCount}`);
    console.log(`Staff: ${analysis.summary.staffCount}`);
    console.log(`Average Years of Service: ${analysis.summary.averageYearsOfService}`);
    console.log('\nQuarterly Breakdown:');
    Object.entries(analysis.quarterly).forEach(([q, data]) => {
      console.log(`  ${QUARTERS[q].label}: ${data.count} (Faculty: ${data.faculty}, Staff: ${data.staff})`);
    });
    console.log('\nTop 5 Termination Reasons:');
    Object.entries(analysis.termReasons).slice(0, 5).forEach(([reason, count]) => {
      const pct = analysis.termReasonPercentages[reason];
      console.log(`  ${reason}: ${count} (${pct}%)`);
    });
    
    return analysis;
    
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  processTurnoverData()
    .then(() => console.log('\nProcessing complete!'))
    .catch(err => {
      console.error('Processing failed:', err);
      process.exit(1);
    });
}

module.exports = { processTurnoverData };