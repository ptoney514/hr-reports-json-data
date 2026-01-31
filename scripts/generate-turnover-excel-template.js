#!/usr/bin/env node

/**
 * Generate Turnover Metrics Excel Template
 *
 * Creates the master Excel file with all 13 sheets containing
 * historical turnover data extracted from hardcoded React components.
 *
 * Usage:
 *   node scripts/generate-turnover-excel-template.js
 */

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

// ============================================================================
// DATA EXTRACTED FROM REACT COMPONENTS
// ============================================================================

// Sheet 1: Summary_Rates (from TurnoverDashboard.jsx lines 140-178)
const summaryRates = [
  { fiscal_year: 'FY2025', category: 'Total', turnover_rate: 11.2, prior_year_rate: 12.8, change: -1.6, trend: 'positive' },
  { fiscal_year: 'FY2025', category: 'Faculty', turnover_rate: 6.1, prior_year_rate: 7.7, change: -1.6, trend: 'positive' },
  { fiscal_year: 'FY2025', category: 'Staff Exempt', turnover_rate: 12.6, prior_year_rate: 13.6, change: -1.0, trend: 'positive' },
  { fiscal_year: 'FY2025', category: 'Staff Non-Exempt', turnover_rate: 15.3, prior_year_rate: 12.8, change: -2.5, trend: 'positive' }
];

// Sheet 2: Turnover_Rates_Table (from TurnoverRatesTable.jsx lines 28-73)
const turnoverRatesTable = [
  { fiscal_year: 'FY2023', category: 'Faculty', turnover_rate: 7.9, higher_ed_avg: 9.10, source: 'CUPA 2022-23' },
  { fiscal_year: 'FY2023', category: 'Staff Exempt', turnover_rate: 15.5, higher_ed_avg: 16.70, source: 'CUPA 2022-23' },
  { fiscal_year: 'FY2023', category: 'Staff Non-Exempt', turnover_rate: 22.4, higher_ed_avg: 19.90, source: 'CUPA 2022-23' },
  { fiscal_year: 'FY2023', category: 'Total', turnover_rate: 14.9, higher_ed_avg: 14.10, source: 'CUPA 2022-23' },
  { fiscal_year: 'FY2024', category: 'Faculty', turnover_rate: 7.7, higher_ed_avg: 8.70, source: 'CUPA 2023-24' },
  { fiscal_year: 'FY2024', category: 'Staff Exempt', turnover_rate: 13.6, higher_ed_avg: 15.00, source: 'CUPA 2023-24' },
  { fiscal_year: 'FY2024', category: 'Staff Non-Exempt', turnover_rate: 17.8, higher_ed_avg: 20.70, source: 'CUPA 2023-24' },
  { fiscal_year: 'FY2024', category: 'Total', turnover_rate: 12.8, higher_ed_avg: 13.80, source: 'CUPA 2023-24' },
  { fiscal_year: 'FY2025', category: 'Faculty', turnover_rate: 6.1, higher_ed_avg: 8.70, source: 'CUPA 2024-25' },
  { fiscal_year: 'FY2025', category: 'Staff Exempt', turnover_rate: 12.6, higher_ed_avg: 15.00, source: 'CUPA 2024-25' },
  { fiscal_year: 'FY2025', category: 'Staff Non-Exempt', turnover_rate: 15.3, higher_ed_avg: 20.70, source: 'CUPA 2024-25' },
  { fiscal_year: 'FY2025', category: 'Total', turnover_rate: 11.2, higher_ed_avg: 13.80, source: 'CUPA 2024-25' }
];

// Higher Ed Averages by Year (from TurnoverRatesTable.jsx)
const higherEdAverages = [
  { fiscal_year: 'FY2022', category: 'Faculty', higher_ed_avg: 8.90, source: 'CUPA 2021-22' },
  { fiscal_year: 'FY2022', category: 'Staff Exempt', higher_ed_avg: 18.00, source: 'CUPA 2021-22' },
  { fiscal_year: 'FY2022', category: 'Staff Non-Exempt', higher_ed_avg: 20.80, source: 'CUPA 2021-22' },
  { fiscal_year: 'FY2022', category: 'Total', higher_ed_avg: 16.10, source: 'CUPA 2021-22' },
  { fiscal_year: 'FY2023', category: 'Faculty', higher_ed_avg: 9.10, source: 'CUPA 2022-23' },
  { fiscal_year: 'FY2023', category: 'Staff Exempt', higher_ed_avg: 16.70, source: 'CUPA 2022-23' },
  { fiscal_year: 'FY2023', category: 'Staff Non-Exempt', higher_ed_avg: 19.90, source: 'CUPA 2022-23' },
  { fiscal_year: 'FY2023', category: 'Total', higher_ed_avg: 14.10, source: 'CUPA 2022-23' },
  { fiscal_year: 'FY2024', category: 'Faculty', higher_ed_avg: 8.70, source: 'CUPA 2023-24' },
  { fiscal_year: 'FY2024', category: 'Staff Exempt', higher_ed_avg: 15.00, source: 'CUPA 2023-24' },
  { fiscal_year: 'FY2024', category: 'Staff Non-Exempt', higher_ed_avg: 20.70, source: 'CUPA 2023-24' },
  { fiscal_year: 'FY2024', category: 'Total', higher_ed_avg: 13.80, source: 'CUPA 2023-24' }
];

// Sheet 3: Turnover_Breakdown (from VoluntaryInvoluntaryTurnoverChart.jsx lines 12-34)
const turnoverBreakdown = [
  { fiscal_year: 'FY2025', category: 'Staff Exempt', involuntary: 0.8, voluntary: 10.8, retirement: 1.0, total: 12.6 },
  { fiscal_year: 'FY2025', category: 'Staff Non-Exempt', involuntary: 1.5, voluntary: 12.9, retirement: 0.9, total: 15.3 },
  { fiscal_year: 'FY2025', category: 'Faculty', involuntary: 0.3, voluntary: 3.3, retirement: 2.5, total: 6.1 }
];

// Sheet 4: Staff_Deviation (from TurnoverDeviationChart.jsx lines 6-43)
const staffDeviation = [
  { fiscal_year: 'FY2025', department: 'Student Services', turnover_rate: 30.9, is_average: false },
  { fiscal_year: 'FY2025', department: 'Pro. & Cont Education', turnover_rate: 26.1, is_average: false },
  { fiscal_year: 'FY2025', department: 'Pharmacy & Health Professions', turnover_rate: 25.9, is_average: false },
  { fiscal_year: 'FY2025', department: 'Clinical Affairs', turnover_rate: 22.2, is_average: false },
  { fiscal_year: 'FY2025', department: 'College of Nursing', turnover_rate: 21.6, is_average: false },
  { fiscal_year: 'FY2025', department: 'Law School', turnover_rate: 19.6, is_average: false },
  { fiscal_year: 'FY2025', department: 'Dentistry', turnover_rate: 19.4, is_average: false },
  { fiscal_year: 'FY2025', department: 'General Counsel', turnover_rate: 19.0, is_average: false },
  { fiscal_year: 'FY2025', department: 'Communications', turnover_rate: 18.7, is_average: false },
  { fiscal_year: 'FY2025', department: 'Academic Affairs', turnover_rate: 18.2, is_average: false },
  { fiscal_year: 'FY2025', department: 'Athletics', turnover_rate: 17.9, is_average: false },
  { fiscal_year: 'FY2025', department: 'Center for Excellence', turnover_rate: 16.2, is_average: false },
  { fiscal_year: 'FY2025', department: 'Public Safety', turnover_rate: 16.0, is_average: false },
  { fiscal_year: 'FY2025', department: 'Student Life', turnover_rate: 15.2, is_average: false },
  { fiscal_year: 'FY2025', department: 'EDI', turnover_rate: 14.3, is_average: false },
  { fiscal_year: 'FY2025', department: 'Global Engagement', turnover_rate: 13.6, is_average: false },
  { fiscal_year: 'FY2025', department: 'Total Staff Turnover', turnover_rate: 13.6, is_average: true },
  { fiscal_year: 'FY2025', department: 'Facilities', turnover_rate: 13.4, is_average: false },
  { fiscal_year: 'FY2025', department: 'IT', turnover_rate: 13.3, is_average: false },
  { fiscal_year: 'FY2025', department: 'School of Medicine', turnover_rate: 12.5, is_average: false },
  { fiscal_year: 'FY2025', department: 'Arts & Sciences', turnover_rate: 10.9, is_average: false },
  { fiscal_year: 'FY2025', department: 'Heider College of Business', turnover_rate: 10.7, is_average: false },
  { fiscal_year: 'FY2025', department: 'University Relations', turnover_rate: 10.5, is_average: false },
  { fiscal_year: 'FY2025', department: 'Enrollment Management', turnover_rate: 9.2, is_average: false },
  { fiscal_year: 'FY2025', department: 'Research', turnover_rate: 7.9, is_average: false },
  { fiscal_year: 'FY2025', department: 'Provost Office', turnover_rate: 4.9, is_average: false },
  { fiscal_year: 'FY2025', department: 'Human Resources', turnover_rate: 4.3, is_average: false },
  { fiscal_year: 'FY2025', department: 'Finance', turnover_rate: 3.8, is_average: false },
  { fiscal_year: 'FY2025', department: 'Phoenix Support', turnover_rate: 3.6, is_average: false },
  { fiscal_year: 'FY2025', department: 'Library Services', turnover_rate: 3.0, is_average: false },
  { fiscal_year: 'FY2025', department: 'Mission & Ministry', turnover_rate: 0, is_average: false },
  { fiscal_year: 'FY2025', department: 'Executive Vice President', turnover_rate: 0, is_average: false },
  { fiscal_year: 'FY2025', department: 'Presidents Office', turnover_rate: 0, is_average: false }
];

// Sheet 5: Faculty_Deviation (from FacultyTurnoverDeviationChart.jsx lines 6-19)
const facultyDeviation = [
  { fiscal_year: 'FY2025', school: 'College of Nursing', turnover_rate: 13.7, is_average: false },
  { fiscal_year: 'FY2025', school: 'Pharmacy & Health Professions', turnover_rate: 7.5, is_average: false },
  { fiscal_year: 'FY2025', school: 'School of Dentistry', turnover_rate: 6.9, is_average: false },
  { fiscal_year: 'FY2025', school: 'Total Faculty Turnover', turnover_rate: 6.3, is_average: true },
  { fiscal_year: 'FY2025', school: 'College of Arts & Sciences', turnover_rate: 6.0, is_average: false },
  { fiscal_year: 'FY2025', school: 'School of Medicine', turnover_rate: 5.6, is_average: false },
  { fiscal_year: 'FY2025', school: 'Law School', turnover_rate: 3.7, is_average: false },
  { fiscal_year: 'FY2025', school: 'Heider College of Business', turnover_rate: 1.6, is_average: false },
  { fiscal_year: 'FY2025', school: 'Coll of Pro Studies and Cont Ed', turnover_rate: 0.0, is_average: false }
];

// Sheet 6: Historical_Rates (from TurnoverDashboard.jsx lines 59-64)
const historicalRates = [
  { fiscal_year: 'FY2022', total_turnover_rate: 14.5 },
  { fiscal_year: 'FY2023', total_turnover_rate: 14.9 },
  { fiscal_year: 'FY2024', total_turnover_rate: 12.8 },
  { fiscal_year: 'FY2025', total_turnover_rate: 11.2 }
];

// Sheet 7: Length_of_Service (from staticData.js lines 1360-1375)
const lengthOfService = [
  { fiscal_year: 'FY2025', employee_type: 'Faculty', tenure_band: 'Less Than One', percentage: 13.8, count: 9 },
  { fiscal_year: 'FY2025', employee_type: 'Faculty', tenure_band: '1 to 5', percentage: 7.2, count: 5 },
  { fiscal_year: 'FY2025', employee_type: 'Faculty', tenure_band: '5 to 10', percentage: 5.5, count: 4 },
  { fiscal_year: 'FY2025', employee_type: 'Faculty', tenure_band: '10 to 20', percentage: 4.0, count: 3 },
  { fiscal_year: 'FY2025', employee_type: 'Faculty', tenure_band: '20 Plus', percentage: 6.2, count: 4 },
  { fiscal_year: 'FY2025', employee_type: 'Staff', tenure_band: 'Less Than One', percentage: 29.8, count: 18 },
  { fiscal_year: 'FY2025', employee_type: 'Staff', tenure_band: '1 to 5', percentage: 14.2, count: 9 },
  { fiscal_year: 'FY2025', employee_type: 'Staff', tenure_band: '5 to 10', percentage: 11.6, count: 7 },
  { fiscal_year: 'FY2025', employee_type: 'Staff', tenure_band: '10 to 20', percentage: 9.0, count: 6 },
  { fiscal_year: 'FY2025', employee_type: 'Staff', tenure_band: '20 Plus', percentage: 5.3, count: 3 }
];

// Sheet 8: Retirements_by_FY (from RetirementsByFiscalYear.jsx lines 12-21)
const retirementsByFY = [
  { fiscal_year: 'FY2018', faculty: 13, staff_non_exempt: 9, staff_exempt: 8, total: 30 },
  { fiscal_year: 'FY2019', faculty: 20, staff_non_exempt: 16, staff_exempt: 12, total: 48 },
  { fiscal_year: 'FY2020', faculty: 23, staff_non_exempt: 10, staff_exempt: 8, total: 41 },
  { fiscal_year: 'FY2021', faculty: 19, staff_non_exempt: 16, staff_exempt: 7, total: 42 },
  { fiscal_year: 'FY2022', faculty: 19, staff_non_exempt: 13, staff_exempt: 10, total: 42 },
  { fiscal_year: 'FY2023', faculty: 21, staff_non_exempt: 17, staff_exempt: 11, total: 49 },
  { fiscal_year: 'FY2024', faculty: 17, staff_non_exempt: 5, staff_exempt: 14, total: 36 },
  { fiscal_year: 'FY2025', faculty: 20, staff_non_exempt: 9, staff_exempt: 11, total: 40 }
];

// Sheet 9: Faculty_Retirement_Trends (from FacultyRetirementAnalysis.jsx lines 13-21)
const facultyRetirementTrends = [
  { year: 2019, avg_age: 71.4, avg_los: 31.9 },
  { year: 2020, avg_age: 69.3, avg_los: 28.2 },
  { year: 2021, avg_age: 66.5, avg_los: 26.7 },
  { year: 2022, avg_age: 67.6, avg_los: 30.5 },
  { year: 2023, avg_age: 70.9, avg_los: 28.5 },
  { year: 2024, avg_age: 69.3, avg_los: 28.1 },
  { year: 2025, avg_age: 69.4, avg_los: 26.7 }
];

// Sheet 10: Faculty_Age_Distribution (from FacultyRetirementAnalysis.jsx lines 22-28)
const facultyAgeDistribution = [
  { category: 'Under 69', percentage: 85.9, color: '#0054A6' },
  { category: 'Over 69', percentage: 7.8, color: '#FFC627' },
  { category: 'Three-Year', percentage: 2.6, color: '#95D2F3' },
  { category: 'Two-Year', percentage: 2.0, color: '#00245D' },
  { category: 'One-Year', percentage: 1.7, color: '#1F74DB' }
];

// Sheet 11: Faculty_Retirement_by_School (from FacultyRetirementAnalysis.jsx lines 29-37)
const facultyRetirementBySchool = [
  { school: 'College of Arts & Sciences', count: 14 },
  { school: 'School of Dentistry', count: 11 },
  { school: 'School of Medicine', count: 10 },
  { school: 'School of Pharmacy & Health Professions', count: 6 },
  { school: 'Heider College of Business', count: 5 },
  { school: 'School of Law', count: 5 },
  { school: 'College of Nursing', count: 3 }
];

// Sheet 12: Staff_Retirement_Trends (from StaffRetirementAnalysis.jsx lines 13-21)
const staffRetirementTrends = [
  { year: 2019, avg_age: 63.7, avg_los: 21.7 },
  { year: 2020, avg_age: 64.8, avg_los: 23.3 },
  { year: 2021, avg_age: 66.5, avg_los: 23.3 },
  { year: 2022, avg_age: 64.8, avg_los: 22.6 },
  { year: 2023, avg_age: 65.4, avg_los: 21.7 },
  { year: 2024, avg_age: 67.1, avg_los: 24.5 },
  { year: 2025, avg_age: 68.1, avg_los: 21.5 }
];

// Sheet 13: Staff_Age_Distribution (from StaffRetirementAnalysis.jsx lines 22-28)
const staffAgeDistribution = [
  { category: 'Under', percentage: 85.9, color: '#0054A6' },
  { category: 'Over', percentage: 7.8, color: '#FFC627' },
  { category: 'Three-Year', percentage: 2.6, color: '#95D2F3' },
  { category: 'Two-Year', percentage: 2.0, color: '#FF6B35' },
  { category: 'One-Year', percentage: 1.7, color: '#00245D' }
];

// Sheet 14: Metadata
const metadata = [
  { field: 'version', value: '1.0.0' },
  { field: 'created_date', value: new Date().toISOString().split('T')[0] },
  { field: 'created_by', value: 'ETL Script' },
  { field: 'fiscal_year', value: 'FY2025' },
  { field: 'data_source', value: 'HR PowerPoint Slides / React Components' },
  { field: 'notes', value: 'Master template with all turnover metrics data' }
];

// ============================================================================
// EXCEL GENERATION
// ============================================================================

function createWorkbook() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary_Rates
  const ws1 = XLSX.utils.json_to_sheet(summaryRates);
  XLSX.utils.book_append_sheet(wb, ws1, 'Summary_Rates');

  // Sheet 2: Turnover_Rates_Table (combined with Higher Ed Averages)
  const ws2 = XLSX.utils.json_to_sheet(turnoverRatesTable);
  XLSX.utils.book_append_sheet(wb, ws2, 'Turnover_Rates_Table');

  // Sheet 3: Higher_Ed_Averages
  const ws3 = XLSX.utils.json_to_sheet(higherEdAverages);
  XLSX.utils.book_append_sheet(wb, ws3, 'Higher_Ed_Averages');

  // Sheet 4: Turnover_Breakdown
  const ws4 = XLSX.utils.json_to_sheet(turnoverBreakdown);
  XLSX.utils.book_append_sheet(wb, ws4, 'Turnover_Breakdown');

  // Sheet 5: Staff_Deviation
  const ws5 = XLSX.utils.json_to_sheet(staffDeviation);
  XLSX.utils.book_append_sheet(wb, ws5, 'Staff_Deviation');

  // Sheet 6: Faculty_Deviation
  const ws6 = XLSX.utils.json_to_sheet(facultyDeviation);
  XLSX.utils.book_append_sheet(wb, ws6, 'Faculty_Deviation');

  // Sheet 7: Historical_Rates
  const ws7 = XLSX.utils.json_to_sheet(historicalRates);
  XLSX.utils.book_append_sheet(wb, ws7, 'Historical_Rates');

  // Sheet 8: Length_of_Service
  const ws8 = XLSX.utils.json_to_sheet(lengthOfService);
  XLSX.utils.book_append_sheet(wb, ws8, 'Length_of_Service');

  // Sheet 9: Retirements_by_FY
  const ws9 = XLSX.utils.json_to_sheet(retirementsByFY);
  XLSX.utils.book_append_sheet(wb, ws9, 'Retirements_by_FY');

  // Sheet 10: Faculty_Retirement_Trends
  const ws10 = XLSX.utils.json_to_sheet(facultyRetirementTrends);
  XLSX.utils.book_append_sheet(wb, ws10, 'Faculty_Retirement_Trends');

  // Sheet 11: Faculty_Age_Distribution
  const ws11 = XLSX.utils.json_to_sheet(facultyAgeDistribution);
  XLSX.utils.book_append_sheet(wb, ws11, 'Faculty_Age_Distribution');

  // Sheet 12: Faculty_Retirement_by_School
  const ws12 = XLSX.utils.json_to_sheet(facultyRetirementBySchool);
  XLSX.utils.book_append_sheet(wb, ws12, 'Faculty_Retirement_School');

  // Sheet 13: Staff_Retirement_Trends
  const ws13 = XLSX.utils.json_to_sheet(staffRetirementTrends);
  XLSX.utils.book_append_sheet(wb, ws13, 'Staff_Retirement_Trends');

  // Sheet 14: Staff_Age_Distribution
  const ws14 = XLSX.utils.json_to_sheet(staffAgeDistribution);
  XLSX.utils.book_append_sheet(wb, ws14, 'Staff_Age_Distribution');

  // Sheet 15: Metadata
  const ws15 = XLSX.utils.json_to_sheet(metadata);
  XLSX.utils.book_append_sheet(wb, ws15, 'Metadata');

  return wb;
}

function main() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}   Generate Turnover Metrics Excel${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  const outputDir = path.join(__dirname, '..', 'source-metrics', 'turnover');
  const outputFile = path.join(outputDir, 'Turnover_Metrics_Master.xlsx');

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`${colors.green}✓${colors.reset} Created directory: ${outputDir}\n`);
  }

  // Create workbook
  console.log('Creating workbook with sheets:');
  const wb = createWorkbook();

  // List sheets
  wb.SheetNames.forEach((name, index) => {
    console.log(`  ${index + 1}. ${name}`);
  });

  // Write file
  XLSX.writeFile(wb, outputFile);
  console.log(`\n${colors.green}✓${colors.reset} Excel file created: ${outputFile}`);

  // Print summary
  console.log(`\n${colors.cyan}Summary:${colors.reset}`);
  console.log(`  Total sheets: ${wb.SheetNames.length}`);
  console.log(`  Summary rates: ${summaryRates.length} rows`);
  console.log(`  Staff deviation departments: ${staffDeviation.length} rows`);
  console.log(`  Faculty deviation schools: ${facultyDeviation.length} rows`);
  console.log(`  Retirements by FY: ${retirementsByFY.length} rows`);

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.green}✓ Template Generation Complete${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);
}

main();
