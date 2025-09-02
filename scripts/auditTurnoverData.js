/**
 * Audit Turnover Data - Extract detailed employee records
 * Shows all 222 terminated employees with name, assignment, date, and staff/faculty type
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_FILE = path.join(__dirname, '../source-metrics/turnover/fy25/Terms Since 2017 Detail PT.xlsx');
const OUTPUT_FILE = path.join(__dirname, '../turnover_audit_report.json');

// FY25 Date Range
const FY25_START = new Date('2024-07-01');
const FY25_END = new Date('2025-06-30');

// Categories to exclude (same as main analysis)
const EXCLUDED_CATEGORIES = ['HSR', 'CWS', 'SUE', 'TEMP', 'PRN', 'NBE'];

// Excel date conversion helper
function excelDateToJSDate(excelDate) {
  if (typeof excelDate === 'number') {
    return new Date((excelDate - 25569) * 86400 * 1000);
  }
  return new Date(excelDate);
}

// Format date for display
function formatDate(date) {
  if (!date) return 'N/A';
  const d = excelDateToJSDate(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
}

// Determine quarter
function getQuarter(date) {
  const termDate = excelDateToJSDate(date);
  if (termDate >= new Date('2024-07-01') && termDate <= new Date('2024-09-30')) return 'Q1';
  if (termDate >= new Date('2024-10-01') && termDate <= new Date('2024-12-31')) return 'Q2';
  if (termDate >= new Date('2025-01-01') && termDate <= new Date('2025-03-31')) return 'Q3';
  if (termDate >= new Date('2025-04-01') && termDate <= new Date('2025-06-30')) return 'Q4';
  return 'Unknown';
}

async function auditTurnoverData() {
  console.log('🔍 Starting turnover audit...');
  console.log('📁 Reading Excel file:', INPUT_FILE);
  
  try {
    // Read Excel file
    const workbook = XLSX.readFile(INPUT_FILE);
    const worksheet = workbook.Sheets['Sheet1'];
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'mm/dd/yyyy' });
    
    console.log(`📊 Total records in file: ${data.length}`);
    
    // Filter for FY25 and exclude specific categories (same logic as main analysis)
    const fy25Data = data.filter(row => {
      const termDate = excelDateToJSDate(row['Term Date']);
      const isInFY25 = termDate >= FY25_START && termDate <= FY25_END;
      const assignmentCategory = row['Assignment Category'] || '';
      const isNotExcluded = !EXCLUDED_CATEGORIES.includes(assignmentCategory);
      return isInFY25 && isNotExcluded;
    });
    
    console.log(`✅ FY25 filtered records: ${fy25Data.length}`);
    
    // Process each employee record
    const auditRecords = [];
    const uniqueEmployees = new Set();
    
    fy25Data.forEach(row => {
      const emplNum = row['Empl Num'];
      
      // Skip if we already processed this employee (avoid duplicates)
      if (uniqueEmployees.has(emplNum)) {
        return;
      }
      uniqueEmployees.add(emplNum);
      
      // Determine faculty/staff type
      const facStaff = row['Faxc Staff'] || 'Unknown';
      const employeeType = facStaff.toLowerCase().includes('fac') ? 'Faculty' : 'Staff';
      
      // Extract employee details
      const record = {
        employeeNumber: emplNum,
        employeeName: row['Employee Name'] || row['Name'] || row['Full Name'] || `Employee ${emplNum}`,
        assignmentCategory: row['Assignment Category'] || 'N/A',
        termDate: formatDate(row['Term Date']),
        termDateRaw: row['Term Date'],
        quarter: getQuarter(row['Term Date']),
        employeeType: employeeType,
        facStaffCode: facStaff,
        termReason: row['Term Reason 2'] || 'Not Specified',
        hireDate: formatDate(row['Hire Date']),
        department: row['Department'] || row['Dept'] || 'Unknown'
      };
      
      auditRecords.push(record);
    });
    
    // Sort by term date for easier review
    auditRecords.sort((a, b) => {
      const dateA = excelDateToJSDate(a.termDateRaw);
      const dateB = excelDateToJSDate(b.termDateRaw);
      return dateA - dateB;
    });
    
    // Generate summary statistics
    const facultyCount = auditRecords.filter(r => r.employeeType === 'Faculty').length;
    const staffCount = auditRecords.filter(r => r.employeeType === 'Staff').length;
    
    const quarterlyBreakdown = {
      Q1: auditRecords.filter(r => r.quarter === 'Q1').length,
      Q2: auditRecords.filter(r => r.quarter === 'Q2').length,
      Q3: auditRecords.filter(r => r.quarter === 'Q3').length,
      Q4: auditRecords.filter(r => r.quarter === 'Q4').length
    };
    
    const auditReport = {
      metadata: {
        generatedDate: new Date().toISOString(),
        sourceFile: 'Terms Since 2017 Detail PT.xlsx',
        fiscalYear: 'FY25',
        dateRange: {
          start: '2024-07-01',
          end: '2025-06-30'
        },
        excludedCategories: EXCLUDED_CATEGORIES
      },
      summary: {
        totalUniqueTerminations: auditRecords.length,
        facultyTerminations: facultyCount,
        staffTerminations: staffCount,
        quarterlyBreakdown: quarterlyBreakdown
      },
      detailedRecords: auditRecords
    };
    
    // Save audit report
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(auditReport, null, 2));
    
    console.log('\n📋 AUDIT SUMMARY');
    console.log('================');
    console.log(`Total Unique Terminations: ${auditRecords.length}`);
    console.log(`Faculty: ${facultyCount} (${(facultyCount/auditRecords.length*100).toFixed(1)}%)`);
    console.log(`Staff: ${staffCount} (${(staffCount/auditRecords.length*100).toFixed(1)}%)`);
    console.log('\nQuarterly Breakdown:');
    Object.entries(quarterlyBreakdown).forEach(([quarter, count]) => {
      console.log(`  ${quarter}: ${count} terminations`);
    });
    
    console.log(`\n💾 Detailed audit report saved to: ${OUTPUT_FILE}`);
    console.log('\n🔍 First 5 records preview:');
    auditRecords.slice(0, 5).forEach((record, index) => {
      console.log(`\n${index + 1}. ${record.employeeName}`);
      console.log(`   Employee #: ${record.employeeNumber}`);
      console.log(`   Type: ${record.employeeType}`);
      console.log(`   Assignment: ${record.assignmentCategory}`);
      console.log(`   Term Date: ${record.termDate} (${record.quarter})`);
      console.log(`   Reason: ${record.termReason}`);
    });
    
    return auditReport;
    
  } catch (error) {
    console.error('❌ Error processing audit:', error);
    throw error;
  }
}

// Run audit
if (require.main === module) {
  auditTurnoverData()
    .then(() => console.log('\n✅ Audit complete!'))
    .catch(err => {
      console.error('❌ Audit failed:', err);
      process.exit(1);
    });
}

module.exports = { auditTurnoverData };