/**
 * Create Comprehensive Audit Report
 * Generate a detailed HTML report showing all 222 terminations
 */

const fs = require('fs');
const path = require('path');

// Read the audit data
const AUDIT_FILE = path.join(__dirname, '../turnover_audit_report.json');
const OUTPUT_HTML = path.join(__dirname, '../TURNOVER_AUDIT_REPORT.html');

function generateAuditReport() {
  console.log('📊 Generating comprehensive turnover audit report...');
  
  // Read audit data
  const auditData = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));
  const records = auditData.detailedRecords;
  
  // Separate faculty and staff
  const facultyRecords = records.filter(r => r.employeeType === 'Faculty');
  const staffRecords = records.filter(r => r.employeeType === 'Staff');
  
  // Create HTML report
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FY25 Turnover Audit Report - All 222 Terminations</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
        .header { background: #0054A6; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #0054A6; border-bottom: 2px solid #0054A6; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; font-weight: bold; }
        .faculty { background: #e3f2fd; }
        .staff { background: #f3e5f5; }
        .quarter-q1 { border-left: 4px solid #FF6B6B; }
        .quarter-q2 { border-left: 4px solid #4ECDC4; }
        .quarter-q3 { border-left: 4px solid #45B7D1; }
        .quarter-q4 { border-left: 4px solid #96CEB4; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .stat-card { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #0054A6; }
        @media print { body { margin: 10px; font-size: 10px; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>FY25 Turnover Audit Report</h1>
        <p>Complete listing of all 222 regular employee terminations (excluding HSR, CWS, SUE, TEMP, PRN, NBE)</p>
        <p>Generated: ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
    </div>

    <div class="summary">
        <h2>Executive Summary</h2>
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${auditData.summary.totalUniqueTerminations}</div>
                <div>Total Terminations</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${auditData.summary.facultyTerminations}</div>
                <div>Faculty (${(auditData.summary.facultyTerminations/auditData.summary.totalUniqueTerminations*100).toFixed(1)}%)</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${auditData.summary.staffTerminations}</div>
                <div>Staff (${(auditData.summary.staffTerminations/auditData.summary.totalUniqueTerminations*100).toFixed(1)}%)</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">1:${(auditData.summary.staffTerminations/auditData.summary.facultyTerminations).toFixed(1)}</div>
                <div>Staff:Faculty Ratio</div>
            </div>
        </div>
        
        <h3>Quarterly Breakdown</h3>
        <div class="stats">
            ${Object.entries(auditData.summary.quarterlyBreakdown).map(([quarter, count]) => `
                <div class="stat-card quarter-${quarter.toLowerCase()}">
                    <div class="stat-number">${count}</div>
                    <div>${quarter} Terminations</div>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <h2>Faculty Terminations (${facultyRecords.length} employees)</h2>
        <table>
            <thead>
                <tr>
                    <th>Employee #</th>
                    <th>Assignment</th>
                    <th>Term Date</th>
                    <th>Term Qtr End Date</th>
                    <th>Dept Name</th>
                    <th>Termination Reason</th>
                    <th>Hire Date</th>
                    <th>Faculty/Staff Code</th>
                </tr>
            </thead>
            <tbody>
                ${facultyRecords.map((record, index) => `
                    <tr class="faculty quarter-${record.quarter.toLowerCase()}">
                        <td>${record.employeeNumber}</td>
                        <td>${record.assignmentCategory}</td>
                        <td>${record.termDate}</td>
                        <td>${record.termQtrEndDate || 'N/A'}</td>
                        <td>${record.department}</td>
                        <td>${record.termReason}</td>
                        <td>${record.hireDate}</td>
                        <td>${record.facStaffCode}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Staff Terminations (${staffRecords.length} employees)</h2>
        <table>
            <thead>
                <tr>
                    <th>Employee #</th>
                    <th>Assignment</th>
                    <th>Term Date</th>
                    <th>Term Qtr End Date</th>
                    <th>Dept Name</th>
                    <th>Termination Reason</th>
                    <th>Hire Date</th>
                    <th>Faculty/Staff Code</th>
                </tr>
            </thead>
            <tbody>
                ${staffRecords.map((record, index) => `
                    <tr class="staff quarter-${record.quarter.toLowerCase()}">
                        <td>${record.employeeNumber}</td>
                        <td>${record.assignmentCategory}</td>
                        <td>${record.termDate}</td>
                        <td>${record.termQtrEndDate || 'N/A'}</td>
                        <td>${record.department}</td>
                        <td>${record.termReason}</td>
                        <td>${record.hireDate}</td>
                        <td>${record.facStaffCode}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>All Terminations - Chronological Order</h2>
        <table>
            <thead>
                <tr>
                    <th>Employee #</th>
                    <th>Type</th>
                    <th>Assignment</th>
                    <th>Term Date</th>
                    <th>Term Qtr End Date</th>
                    <th>Dept Name</th>
                    <th>Reason</th>
                    <th>Faculty/Staff Code</th>
                </tr>
            </thead>
            <tbody>
                ${records.map((record, index) => `
                    <tr class="${record.employeeType.toLowerCase()} quarter-${record.quarter.toLowerCase()}">
                        <td>${record.employeeNumber}</td>
                        <td><strong>${record.employeeType}</strong></td>
                        <td>${record.assignmentCategory}</td>
                        <td>${record.termDate}</td>
                        <td>${record.termQtrEndDate || 'N/A'}</td>
                        <td>${record.department}</td>
                        <td>${record.termReason}</td>
                        <td>${record.facStaffCode}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Data Quality Notes</h2>
        <ul>
            <li><strong>Source:</strong> Terms Since 2017 Detail PT.xlsx from source-metrics/turnover/fy25/</li>
            <li><strong>Date Range:</strong> July 1, 2024 - June 30, 2025 (FY25)</li>
            <li><strong>Excluded Categories:</strong> ${auditData.metadata.excludedCategories.join(', ')}</li>
            <li><strong>Faculty/Staff Classification:</strong> Based on "Faxc Staff" column (contains "fac" = Faculty, else Staff)</li>
            <li><strong>Color Coding:</strong> Faculty (blue), Staff (purple), Quarters (border colors)</li>
            <li><strong>Total Records Processed:</strong> 11,307 (filtered to ${auditData.summary.totalUniqueTerminations} unique FY25 terminations)</li>
        </ul>
    </div>

    <div class="section">
        <h2>Verification Note</h2>
        <p><strong>Dashboard shows 32 Faculty vs Audit shows 36 Faculty - Discrepancy Investigation Needed</strong></p>
        <p>This audit report shows the actual data from the Excel file. The 4-employee difference should be investigated by comparing the JSON processed data with this raw audit.</p>
    </div>
</body>
</html>`;

  // Write HTML report
  fs.writeFileSync(OUTPUT_HTML, html);
  
  console.log(`✅ Comprehensive audit report generated: ${OUTPUT_HTML}`);
  console.log(`\n📊 AUDIT RESULTS:`);
  console.log(`Total Terminations: ${auditData.summary.totalUniqueTerminations}`);
  console.log(`Faculty: ${auditData.summary.facultyTerminations} (${(auditData.summary.facultyTerminations/auditData.summary.totalUniqueTerminations*100).toFixed(1)}%)`);
  console.log(`Staff: ${auditData.summary.staffTerminations} (${(auditData.summary.staffTerminations/auditData.summary.totalUniqueTerminations*100).toFixed(1)}%)`);
  
  console.log(`\n🔍 DISCREPANCY FOUND:`);
  console.log(`Dashboard shows: 32 Faculty, 186 Staff`);
  console.log(`Audit shows: 36 Faculty, 186 Staff`);
  console.log(`Difference: +4 Faculty`);
  
  return OUTPUT_HTML;
}

// Run report generation
if (require.main === module) {
  generateAuditReport();
}

module.exports = { generateAuditReport };