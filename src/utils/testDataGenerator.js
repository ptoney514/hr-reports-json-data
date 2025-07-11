/**
 * Test Data Generator
 * Creates realistic sample datasets for testing Excel upload functionality
 */

import * as XLSX from 'xlsx';


/**
 * Generate quarterly aggregate data
 */
export const generateQuarterlyAggregateData = () => {
  const quarters = ['Q2-2024', 'Q3-2024', 'Q4-2024', 'Q1-2025'];
  const divisions = [
    'Arts & Sciences', 'School of Medicine', 'Medicine', 
    'Pharmacy & Health Professions', 'Dentistry', 'Business', 
    'Engineering', 'Education'
  ];
  const locations = ['Omaha Campus', 'Phoenix Campus'];
  
  const aggregateData = [];
  
  quarters.forEach(quarter => {
    const quarterEndDate = {
      'Q2-2024': '2024-06-30',
      'Q3-2024': '2024-09-30', 
      'Q4-2024': '2024-12-31',
      'Q1-2025': '2025-03-31'
    }[quarter];
    
    divisions.forEach(division => {
      locations.forEach(location => {
        // Generate realistic headcount based on division and location
        const isOmaha = location === 'Omaha Campus';
        const locationMultiplier = isOmaha ? 0.75 : 0.25; // 75% Omaha, 25% Phoenix
        
        const divisionMultiplier = {
          'Arts & Sciences': 1.2,
          'School of Medicine': 1.5,
          'Medicine': 1.3,
          'Pharmacy & Health Professions': 0.8,
          'Dentistry': 0.6,
          'Business': 0.9,
          'Engineering': 0.7,
          'Education': 0.5
        }[division];
        
        // Base headcount varies by quarter (simulate growth/decline)
        const quarterMultiplier = {
          'Q2-2024': 0.95,
          'Q3-2024': 0.98,
          'Q4-2024': 1.0,
          'Q1-2025': 1.02
        }[quarter];
        
        const baseHeadcount = Math.floor(100 * divisionMultiplier * locationMultiplier * quarterMultiplier);
        
        const beFacultyHeadcount = Math.floor(baseHeadcount * 0.6); // 60% faculty
        const beStaffHeadcount = Math.floor(baseHeadcount * 0.35); // 35% staff
        const nbeStudentWorkerHeadcount = Math.floor(baseHeadcount * 0.05); // 5% student workers
        
        const totalHeadcount = beFacultyHeadcount + beStaffHeadcount + nbeStudentWorkerHeadcount;
        
        // Generate hiring and departure numbers
        const beNewHires = Math.floor(totalHeadcount * 0.02 + Math.random() * 5); // ~2% new hires per quarter
        const beDepartures = Math.floor(totalHeadcount * 0.015 + Math.random() * 3); // ~1.5% departures per quarter
        const nbeNewHires = Math.floor(nbeStudentWorkerHeadcount * 0.1); // Higher turnover for students
        const nbeDepartures = Math.floor(nbeStudentWorkerHeadcount * 0.08);
        
        aggregateData.push({
          Quarter_End_Date: quarterEndDate,
          Division: division,
          Location: location,
          BE_Faculty_Headcount: beFacultyHeadcount,
          BE_Staff_Headcount: beStaffHeadcount,
          NBE_Faculty_Headcount: 0, // Typically minimal
          NBE_Staff_Headcount: 0, // Typically minimal
          NBE_Student_Worker_Headcount: nbeStudentWorkerHeadcount,
          Total_Headcount: totalHeadcount,
          BE_New_Hires: beNewHires,
          BE_Departures: beDepartures,
          NBE_New_Hires: nbeNewHires,
          NBE_Departures: nbeDepartures
        });
      });
    });
  });
  
  return aggregateData;
};

/**
 * Create and download Excel file with test data (aggregate data only)
 */
export const createTestExcelFile = (dataType = 'aggregate', filename = null) => {
  const workbook = XLSX.utils.book_new();
  
  // Only support aggregate data
  const aggregateData = generateQuarterlyAggregateData();
  const aggregateSheet = XLSX.utils.json_to_sheet(aggregateData);
  XLSX.utils.book_append_sheet(workbook, aggregateSheet, 'Quarterly_Aggregates');
  
  // Add a data dictionary sheet
  const dataDictionary = [
    { Field: 'Quarter_End_Date', Description: 'End date of quarter (YYYY-MM-DD)', Example: '2024-12-31' },
    { Field: 'BE_Faculty_Headcount', Description: 'Benefit eligible faculty count', Example: '25' },
    { Field: 'BE_Staff_Headcount', Description: 'Benefit eligible staff count', Example: '15' },
    { Field: 'Total_Headcount', Description: 'Total employee count', Example: '45' },
    { Field: 'BE_New_Hires', Description: 'New benefit eligible hires', Example: '3' },
    { Field: 'BE_Departures', Description: 'Benefit eligible departures', Example: '2' }
  ];
  
  const dictionarySheet = XLSX.utils.json_to_sheet(dataDictionary);
  XLSX.utils.book_append_sheet(workbook, dictionarySheet, 'Data_Dictionary');
  
  // Create filename if not provided
  const defaultFilename = 'test_quarterly_aggregates.xlsx';
  
  const finalFilename = filename || defaultFilename;
  
  // Download the file
  XLSX.writeFile(workbook, finalFilename);
  
  return finalFilename;
};

/**
 * Create test data with known expected results for validation
 */
export const createValidationTestData = () => {
  // Create small, predictable dataset for testing calculations
  const validationData = [
    {
      Quarter_End_Date: '2025-03-31',
      Division: 'Test Division A',
      Location: 'Omaha Campus',
      BE_Faculty_Headcount: 10,
      BE_Staff_Headcount: 15,
      NBE_Faculty_Headcount: 0,
      NBE_Staff_Headcount: 0,
      NBE_Student_Worker_Headcount: 5,
      Total_Headcount: 30,
      BE_New_Hires: 2,
      BE_Departures: 1,
      NBE_New_Hires: 1,
      NBE_Departures: 0
    },
    {
      Quarter_End_Date: '2025-03-31',
      Division: 'Test Division B',
      Location: 'Phoenix Campus',
      BE_Faculty_Headcount: 5,
      BE_Staff_Headcount: 8,
      NBE_Faculty_Headcount: 0,
      NBE_Staff_Headcount: 0,
      NBE_Student_Worker_Headcount: 2,
      Total_Headcount: 15,
      BE_New_Hires: 1,
      BE_Departures: 0,
      NBE_New_Hires: 0,
      NBE_Departures: 1
    }
  ];
  
  // Expected results for Q1-2025:
  const expectedResults = {
    totalEmployees: 45, // 30 + 15
    faculty: 15, // 10 + 5
    staff: 23, // 15 + 8
    students: 7, // 5 + 2
    totalNewHires: 4, // 2 + 1 + 1 + 0
    totalDepartures: 2, // 1 + 0 + 0 + 1
    netChange: 2, // 4 - 2
    divisions: [
      { name: 'Test Division A', faculty: 10, staff: 15, total: 30 },
      { name: 'Test Division B', faculty: 5, staff: 8, total: 15 }
    ],
    locations: [
      { location: 'Omaha Campus', count: 30, percentage: '66.7' },
      { location: 'Phoenix Campus', count: 15, percentage: '33.3' }
    ]
  };
  
  return { data: validationData, expected: expectedResults };
};

/**
 * Export test datasets as files (aggregate data only)
 */
export const exportTestDatasets = () => {
  // Create quarterly aggregate file
  createTestExcelFile('aggregate', 'test_quarterly_aggregates.xlsx');
  
  // Create validation test file
  const { data: validationData } = createValidationTestData();
  const workbook = XLSX.utils.book_new();
  const validationSheet = XLSX.utils.json_to_sheet(validationData);
  XLSX.utils.book_append_sheet(workbook, validationSheet, 'Validation_Data');
  XLSX.writeFile(workbook, 'test_validation_data.xlsx');
  
  // Create comprehensive multi-sheet file as recommended in plan
  const comprehensiveWorkbook = XLSX.utils.book_new();
  
  // Add Q1 2025 Summary
  const q1Data = generateQuarterlyAggregateData().filter(item => item.Quarter_End_Date === '2025-03-31');
  const q1Sheet = XLSX.utils.json_to_sheet(q1Data);
  XLSX.utils.book_append_sheet(comprehensiveWorkbook, q1Sheet, 'Q1_2025_Summary');
  
  // Add Q4 2024 Summary  
  const q4Data = generateQuarterlyAggregateData().filter(item => item.Quarter_End_Date === '2024-12-31');
  const q4Sheet = XLSX.utils.json_to_sheet(q4Data);
  XLSX.utils.book_append_sheet(comprehensiveWorkbook, q4Sheet, 'Q4_2024_Summary');
  
  // Add Q3 2024 Summary
  const q3Data = generateQuarterlyAggregateData().filter(item => item.Quarter_End_Date === '2024-09-30');
  const q3Sheet = XLSX.utils.json_to_sheet(q3Data);
  XLSX.utils.book_append_sheet(comprehensiveWorkbook, q3Sheet, 'Q3_2024_Summary');
  
  // Add Data Dictionary
  const dataDictionary = [
    { Field: 'Quarter_End_Date', Description: 'Quarter end date (YYYY-MM-DD)', Required: 'Yes', Example: '2025-03-31' },
    { Field: 'Division', Description: 'Academic or administrative division', Required: 'Yes', Example: 'Arts & Sciences' },
    { Field: 'Location', Description: 'Campus location', Required: 'Yes', Example: 'Omaha Campus' },
    { Field: 'BE_Faculty_Headcount', Description: 'Benefit eligible faculty count', Required: 'Yes', Example: '25' },
    { Field: 'BE_Staff_Headcount', Description: 'Benefit eligible staff count', Required: 'Yes', Example: '40' },
    { Field: 'Total_Headcount', Description: 'Total headcount (calculated)', Required: 'No', Example: '75' },
    { Field: 'BE_New_Hires', Description: 'New benefit eligible hires this quarter', Required: 'No', Example: '3' },
    { Field: 'BE_Departures', Description: 'Benefit eligible departures this quarter', Required: 'No', Example: '2' }
  ];
  const dictionarySheet = XLSX.utils.json_to_sheet(dataDictionary);
  XLSX.utils.book_append_sheet(comprehensiveWorkbook, dictionarySheet, 'Data_Dictionary');
  
  XLSX.writeFile(comprehensiveWorkbook, 'HR_Analytics_Data_Template.xlsx');
  
  return [
    'test_quarterly_aggregates.xlsx', 
    'test_validation_data.xlsx',
    'HR_Analytics_Data_Template.xlsx'
  ];
};

export default {
  generateQuarterlyAggregateData,
  createTestExcelFile,
  createValidationTestData,
  exportTestDatasets
};