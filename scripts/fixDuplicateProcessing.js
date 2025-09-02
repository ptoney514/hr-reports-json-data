/**
 * Fix Duplicate Processing - Use Latest Termination Date
 * Re-process turnover data using the most recent termination date per employee
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_FILE = path.join(__dirname, '../source-metrics/turnover/fy25/Terms Since 2017 Detail PT.xlsx');
const OUTPUT_FILE = path.join(__dirname, '../corrected_turnover_audit.json');

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

async function fixDuplicateProcessing() {
  console.log('🔧 Fixing duplicate processing - using LATEST termination date per employee...');
  
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
    
    // Group by Employee Number and use LATEST termination date
    const employeeGroups = {};
    fy25Data.forEach(row => {
      const empNum = row['Empl Num'];
      if (!employeeGroups[empNum]) {
        employeeGroups[empNum] = [];
      }
      employeeGroups[empNum].push(row);
    });
    
    console.log(`👥 Unique employees found: ${Object.keys(employeeGroups).length}`);
    
    // For each employee, select the record with the LATEST termination date
    const correctedRecords = [];
    let duplicatesFixed = 0;
    
    Object.entries(employeeGroups).forEach(([empNum, records]) => {
      if (records.length > 1) {
        duplicatesFixed++;
        console.log(`\\n🔄 Employee ${empNum} has ${records.length} records:`);
        records.forEach((r, i) => {
          const termDate = excelDateToJSDate(r['Term Date']);
          console.log(`   ${i + 1}. ${formatDate(r['Term Date'])} (${termDate.getTime()})`);
        });
        
        // Sort by termination date (latest first) and take the first one
        records.sort((a, b) => {
          const dateA = excelDateToJSDate(a['Term Date']);
          const dateB = excelDateToJSDate(b['Term Date']);
          return dateB - dateA; // Latest first
        });
        
        console.log(`   ✅ Using LATEST: ${formatDate(records[0]['Term Date'])}`);
      }
      
      // Use the latest record (first after sorting, or only record)
      const selectedRecord = records.length > 1 ? records[0] : records[0];
      correctedRecords.push(selectedRecord);
    });
    
    console.log(`\\n🔧 Fixed ${duplicatesFixed} duplicate employees`);
    console.log(`📋 Final unique employee count: ${correctedRecords.length}`);
    
    // Process corrected records
    const auditRecords = [];
    correctedRecords.forEach(row => {
      const emplNum = row['Empl Num'];
      
      // Determine faculty/staff type
      const facStaff = row['Faxc Staff'] || 'Unknown';
      const employeeType = facStaff.toLowerCase().includes('fac') ? 'Faculty' : 'Staff';
      
      // Extract employee details  
      const record = {
        employeeNumber: emplNum,
        employeeName: row['Display Name'] || row['Last Name'] + ', ' + row['First Name'] || `Employee ${emplNum}`,
        assignmentCategory: row['Assignment Category'] || 'N/A',
        termDate: formatDate(row['Term Date']),
        termDateRaw: row['Term Date'],
        termQtrEndDate: formatDate(row['Term Qtr End Date']),
        termQtrEndDateRaw: row['Term Qtr End Date'],
        quarter: getQuarter(row['Term Date']),
        employeeType: employeeType,
        facStaffCode: facStaff,
        termReason: row['Term Reason 2'] || 'Not Specified',
        hireDate: formatDate(row['Hire Date']),
        department: row['Dept Name'] || 'Unknown'
      };
      
      auditRecords.push(record);
    });
    
    // Sort by term date
    auditRecords.sort((a, b) => {
      const dateA = excelDateToJSDate(a.termDateRaw);
      const dateB = excelDateToJSDate(b.termDateRaw);
      return dateA - dateB;
    });
    
    // Generate corrected statistics
    const facultyCount = auditRecords.filter(r => r.employeeType === 'Faculty').length;
    const staffCount = auditRecords.filter(r => r.employeeType === 'Staff').length;
    
    const quarterlyBreakdown = {
      Q1: auditRecords.filter(r => r.quarter === 'Q1').length,
      Q2: auditRecords.filter(r => r.quarter === 'Q2').length,
      Q3: auditRecords.filter(r => r.quarter === 'Q3').length,
      Q4: auditRecords.filter(r => r.quarter === 'Q4').length
    };
    
    const correctedReport = {
      metadata: {
        generatedDate: new Date().toISOString(),
        sourceFile: 'Terms Since 2017 Detail PT.xlsx',
        fiscalYear: 'FY25',
        processingNote: 'CORRECTED - Uses LATEST termination date per employee',
        duplicatesFixed: duplicatesFixed,
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
        quarterlyBreakdown: quarterlyBreakdown,
        duplicatesFixed: duplicatesFixed
      },
      detailedRecords: auditRecords
    };
    
    // Save corrected report
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(correctedReport, null, 2));
    
    console.log('\\n📊 CORRECTED AUDIT SUMMARY');
    console.log('===========================');
    console.log(`Total Unique Terminations: ${auditRecords.length}`);
    console.log(`Faculty: ${facultyCount} (${(facultyCount/auditRecords.length*100).toFixed(1)}%)`);
    console.log(`Staff: ${staffCount} (${(staffCount/auditRecords.length*100).toFixed(1)}%)`);
    console.log('\\nCorrected Quarterly Breakdown:');
    Object.entries(quarterlyBreakdown).forEach(([quarter, count]) => {
      console.log(`  ${quarter}: ${count} terminations`);
    });
    
    console.log(`\\n💾 Corrected audit report saved to: ${OUTPUT_FILE}`);
    
    return correctedReport;
    
  } catch (error) {
    console.error('❌ Error fixing duplicates:', error);
    throw error;
  }
}

// Run correction
if (require.main === module) {
  fixDuplicateProcessing()
    .then(() => console.log('\\n✅ Duplicate processing fixed!'))
    .catch(err => {
      console.error('❌ Failed to fix duplicates:', err);
      process.exit(1);
    });
}

module.exports = { fixDuplicateProcessing };