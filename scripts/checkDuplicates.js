/**
 * Check for Duplicate Employees in Raw Excel Data
 * Verify that we're properly handling duplicate records for same employee
 */

const XLSX = require('xlsx');
const path = require('path');

// Configuration
const INPUT_FILE = path.join(__dirname, '../source-metrics/turnover/fy25/Terms Since 2017 Detail PT.xlsx');

// FY25 Date Range
const FY25_START = new Date('2024-07-01');
const FY25_END = new Date('2025-06-30');
const EXCLUDED_CATEGORIES = ['HSR', 'CWS', 'SUE', 'TEMP', 'PRN', 'NBE'];

// Excel date conversion helper
function excelDateToJSDate(excelDate) {
  if (typeof excelDate === 'number') {
    return new Date((excelDate - 25569) * 86400 * 1000);
  }
  return new Date(excelDate);
}

async function checkDuplicates() {
  console.log('🔍 Analyzing raw Excel data for duplicates...');
  
  try {
    // Read Excel file
    const workbook = XLSX.readFile(INPUT_FILE);
    const worksheet = workbook.Sheets['Sheet1'];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'mm/dd/yyyy' });
    
    console.log(`📊 Total raw records: ${rawData.length}`);
    
    // Filter for FY25 and excluded categories
    const fy25Data = rawData.filter(row => {
      const termDate = excelDateToJSDate(row['Term Date']);
      const isInFY25 = termDate >= FY25_START && termDate <= FY25_END;
      const assignmentCategory = row['Assignment Category'] || '';
      const isNotExcluded = !EXCLUDED_CATEGORIES.includes(assignmentCategory);
      return isInFY25 && isNotExcluded;
    });
    
    console.log(`📋 FY25 filtered records: ${fy25Data.length}`);
    
    // Check for duplicates by Employee Number
    const employeeGroups = {};
    fy25Data.forEach(row => {
      const empNum = row['Empl Num'];
      if (!employeeGroups[empNum]) {
        employeeGroups[empNum] = [];
      }
      employeeGroups[empNum].push(row);
    });
    
    // Find duplicates
    const duplicates = Object.entries(employeeGroups).filter(([empNum, records]) => records.length > 1);
    const uniqueEmployees = Object.keys(employeeGroups).length;
    
    console.log(`👥 Unique employees: ${uniqueEmployees}`);
    console.log(`🔄 Employees with multiple records: ${duplicates.length}`);
    console.log(`📝 Total records for duplicate employees: ${duplicates.reduce((sum, [_, records]) => sum + records.length, 0)}`);
    
    if (duplicates.length > 0) {
      console.log('\\n🚨 DUPLICATE EMPLOYEE RECORDS FOUND:');
      console.log('=====================================');
      
      duplicates.forEach(([empNum, records], index) => {
        console.log(`\\n${index + 1}. Employee ${empNum} (${records.length} records):`);
        
        records.forEach((record, i) => {
          const termDate = record['Term Date'];
          const facStaff = record['Faxc Staff'] || 'Unknown';
          const employeeType = facStaff.toLowerCase().includes('fac') ? 'Faculty' : 'Staff';
          const assignment = record['Assignment Category'] || 'N/A';
          const reason = record['Term Reason 2'] || 'N/A';
          
          console.log(`   ${i + 1}. ${termDate} | ${employeeType} | ${assignment} | ${reason}`);
        });
        
        // Show what our current logic would do
        console.log(`   → Current logic would use: FIRST record only`);
        const firstRecord = records[0];
        const firstTermDate = firstRecord['Term Date'];
        const firstFacStaff = firstRecord['Faxc Staff'] || 'Unknown';
        const firstEmployeeType = firstFacStaff.toLowerCase().includes('fac') ? 'Faculty' : 'Staff';
        console.log(`   → Result: ${firstTermDate} | ${firstEmployeeType}`);
      });
      
      console.log('\\n📋 RECOMMENDATIONS:');
      console.log('1. Current processing uses FIRST record encountered per employee');
      console.log('2. This may not be the most recent or accurate termination date');
      console.log('3. Consider using LATEST termination date per employee');
      console.log('4. Or investigate why employees have multiple termination records');
      
    } else {
      console.log('\\n✅ NO DUPLICATE EMPLOYEES FOUND');
      console.log('Each employee appears exactly once in the filtered data.');
    }
    
    // Show column headers for reference
    console.log('\\n📋 Available Excel columns:');
    const sampleRow = fy25Data[0];
    if (sampleRow) {
      Object.keys(sampleRow).forEach((col, i) => {
        console.log(`${i + 1}. "${col}"`);
      });
    }
    
    return {
      totalRecords: fy25Data.length,
      uniqueEmployees: uniqueEmployees,
      duplicatesCount: duplicates.length,
      duplicates: duplicates.map(([empNum, records]) => ({
        employeeNumber: empNum,
        recordCount: records.length,
        records: records.map(r => ({
          termDate: r['Term Date'],
          employeeType: (r['Faxc Staff'] || '').toLowerCase().includes('fac') ? 'Faculty' : 'Staff',
          assignment: r['Assignment Category'],
          reason: r['Term Reason 2']
        }))
      }))
    };
    
  } catch (error) {
    console.error('❌ Error checking duplicates:', error);
    throw error;
  }
}

// Run duplicate check
if (require.main === module) {
  checkDuplicates()
    .then((result) => {
      console.log('\\n✅ Duplicate check complete!');
      if (result.duplicatesCount > 0) {
        console.log('⚠️  Action needed: Review duplicate handling logic');
      }
    })
    .catch(err => {
      console.error('❌ Duplicate check failed:', err);
      process.exit(1);
    });
}

module.exports = { checkDuplicates };