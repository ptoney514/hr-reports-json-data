/**
 * Excel Template Generator
 * Creates comprehensive multi-sheet Excel templates with data validation and instructions
 */

import * as XLSX from 'xlsx';
import { getQuarters } from '../services/QuarterConfigService';

/**
 * Generate comprehensive multi-sheet Excel template
 * Implements the recommended "Single File with Multiple Sheets" strategy
 */
export const generateComprehensiveTemplate = () => {
  const workbook = XLSX.utils.book_new();
  const quarters = getQuarters();
  
  // Get recent quarters for template (last 4 quarters)
  const recentQuarters = quarters.slice(-4);
  
  // 1. Create quarter summary sheets
  recentQuarters.forEach(quarter => {
    const quarterData = generateQuarterSampleData(quarter);
    const worksheet = XLSX.utils.json_to_sheet(quarterData);
    
    // Add data validation and formatting
    addDataValidationToSheet(worksheet, quarterData);
    
    // Create sheet name from quarter (e.g., "Q1_2025_Summary")
    const sheetName = `${quarter.quarter.replace('-', '_')}_Summary`;
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });
  
  // 2. Create Employee Master sheet (optional individual records)
  const employeeMasterData = generateEmployeeMasterSample();
  const employeeSheet = XLSX.utils.json_to_sheet(employeeMasterData);
  XLSX.utils.book_append_sheet(workbook, employeeSheet, 'Employee_Master');
  
  // 3. Create Data Dictionary sheet
  const dataDictionary = createDataDictionary();
  const dictionarySheet = XLSX.utils.json_to_sheet(dataDictionary);
  XLSX.utils.book_append_sheet(workbook, dictionarySheet, 'Data_Dictionary');
  
  // 4. Create Instructions sheet
  const instructions = createInstructionsSheet();
  const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
  
  // 5. Create Validation Rules sheet
  const validationRules = createValidationRulesSheet();
  const validationSheet = XLSX.utils.json_to_sheet(validationRules);
  XLSX.utils.book_append_sheet(workbook, validationSheet, 'Validation_Rules');
  
  return workbook;
};

/**
 * Generate sample quarter data with realistic values
 */
const generateQuarterSampleData = (quarter) => {
  const divisions = [
    'Arts & Sciences',
    'School of Medicine', 
    'Medicine',
    'Pharmacy & Health Professions',
    'Dentistry',
    'Business',
    'Engineering',
    'Education'
  ];
  
  const locations = ['Omaha Campus', 'Phoenix Campus'];
  
  const data = [];
  
  divisions.forEach(division => {
    locations.forEach(location => {
      // Generate realistic numbers based on division size
      const divisionMultiplier = {
        'Arts & Sciences': 1.2,
        'School of Medicine': 1.5,
        'Medicine': 1.3,
        'Pharmacy & Health Professions': 0.8,
        'Dentistry': 0.6,
        'Business': 0.9,
        'Engineering': 0.7,
        'Education': 0.5
      }[division] || 1.0;
      
      const locationMultiplier = location === 'Omaha Campus' ? 0.75 : 0.25;
      const baseCount = Math.floor(100 * divisionMultiplier * locationMultiplier);
      
      const facultyCount = Math.floor(baseCount * 0.6);
      const staffCount = Math.floor(baseCount * 0.35);
      const studentCount = Math.floor(baseCount * 0.05);
      const totalCount = facultyCount + staffCount + studentCount;
      
      data.push({
        Quarter_End_Date: quarter.dateValue,
        Division: division,
        Location: location,
        BE_Faculty_Headcount: facultyCount,
        BE_Staff_Headcount: staffCount,
        NBE_Faculty_Headcount: 0,
        NBE_Staff_Headcount: 0,
        NBE_Student_Worker_Headcount: studentCount,
        Total_Headcount: totalCount,
        BE_New_Hires: Math.floor(totalCount * 0.02 + Math.random() * 3),
        BE_Departures: Math.floor(totalCount * 0.015 + Math.random() * 2),
        NBE_New_Hires: Math.floor(studentCount * 0.1),
        NBE_Departures: Math.floor(studentCount * 0.08),
        // Additional metrics
        Open_Positions: Math.floor(Math.random() * 5),
        Recruiting_Pipeline: Math.floor(Math.random() * 10),
        Diversity_Metrics: Math.floor(Math.random() * 100),
        Retention_Rate: (90 + Math.random() * 10).toFixed(1)
      });
    });
  });
  
  return data;
};

/**
 * Generate sample employee master data
 */
const generateEmployeeMasterSample = () => {
  const sampleEmployees = [
    {
      Employee_ID: 'EMP0001',
      First_Name: 'John',
      Last_Name: 'Doe',
      Full_Name: 'John Doe',
      Department: 'Mathematics',
      Division: 'Arts & Sciences',
      Position: 'Professor',
      Location: 'Omaha Campus',
      Employee_Type: 'Faculty',
      Employment_Status: 'Full-time',
      Hire_Date: '2020-08-15',
      Termination_Date: '',
      Salary: 75000,
      Grade: 'P4',
      Manager: 'Jane Smith',
      Email: 'john.doe@university.edu',
      Phone: '(555) 123-4567',
      Status: 'Active'
    },
    {
      Employee_ID: 'EMP0002',
      First_Name: 'Jane',
      Last_Name: 'Smith',
      Full_Name: 'Jane Smith',
      Department: 'Academic Affairs',
      Division: 'Administration',
      Position: 'Director',
      Location: 'Omaha Campus',
      Employee_Type: 'Staff',
      Employment_Status: 'Full-time',
      Hire_Date: '2018-06-01',
      Termination_Date: '',
      Salary: 65000,
      Grade: 'S6',
      Manager: 'Robert Johnson',
      Email: 'jane.smith@university.edu',
      Phone: '(555) 234-5678',
      Status: 'Active'
    },
    {
      Employee_ID: 'EMP0003',
      First_Name: 'Mike',
      Last_Name: 'Johnson',
      Full_Name: 'Mike Johnson',
      Department: 'Internal Medicine',
      Division: 'School of Medicine',
      Position: 'Associate Professor',
      Location: 'Omaha Campus',
      Employee_Type: 'Faculty',
      Employment_Status: 'Full-time',
      Hire_Date: '2019-03-10',
      Termination_Date: '',
      Salary: 85000,
      Grade: 'P3',
      Manager: 'Sarah Wilson',
      Email: 'mike.johnson@university.edu',
      Phone: '(555) 345-6789',
      Status: 'Active'
    }
  ];
  
  return sampleEmployees;
};

/**
 * Create comprehensive data dictionary
 */
const createDataDictionary = () => {
  return [
    {
      Sheet: 'Quarter Summary',
      Field: 'Quarter_End_Date',
      Description: 'Last day of the quarter (YYYY-MM-DD format)',
      Data_Type: 'Date',
      Required: 'Yes',
      Example: '2025-03-31',
      Validation: 'Must be valid date, last day of quarter',
      Notes: 'Determines which quarter the data belongs to'
    },
    {
      Sheet: 'Quarter Summary',
      Field: 'Division',
      Description: 'Academic or administrative division name',
      Data_Type: 'Text',
      Required: 'Yes',
      Example: 'Arts & Sciences',
      Validation: 'Must match standard division names',
      Notes: 'Used for division-level reporting and analysis'
    },
    {
      Sheet: 'Quarter Summary',
      Field: 'Location',
      Description: 'Campus or facility location',
      Data_Type: 'Text',
      Required: 'Yes',
      Example: 'Omaha Campus',
      Validation: 'Must be valid campus location',
      Notes: 'Used for location-based analytics'
    },
    {
      Sheet: 'Quarter Summary',
      Field: 'BE_Faculty_Headcount',
      Description: 'Number of benefit eligible faculty members',
      Data_Type: 'Number',
      Required: 'Yes',
      Example: '125',
      Validation: 'Must be non-negative integer',
      Notes: 'Core metric for faculty staffing levels'
    },
    {
      Sheet: 'Quarter Summary',
      Field: 'BE_Staff_Headcount',
      Description: 'Number of benefit eligible staff members',
      Data_Type: 'Number',
      Required: 'Yes',
      Example: '85',
      Validation: 'Must be non-negative integer',
      Notes: 'Core metric for staff staffing levels'
    },
    {
      Sheet: 'Quarter Summary',
      Field: 'NBE_Student_Worker_Headcount',
      Description: 'Number of non-benefit eligible student workers',
      Data_Type: 'Number',
      Required: 'No',
      Example: '12',
      Validation: 'Must be non-negative integer',
      Notes: 'Typically temporary or part-time student positions'
    },
    {
      Sheet: 'Quarter Summary',
      Field: 'Total_Headcount',
      Description: 'Total number of employees (calculated field)',
      Data_Type: 'Number',
      Required: 'No',
      Example: '222',
      Validation: 'Should equal sum of all headcount fields',
      Notes: 'Can be calculated automatically or provided'
    },
    {
      Sheet: 'Quarter Summary',
      Field: 'BE_New_Hires',
      Description: 'Number of new benefit eligible hires this quarter',
      Data_Type: 'Number',
      Required: 'No',
      Example: '5',
      Validation: 'Must be non-negative integer',
      Notes: 'Used for hiring trend analysis'
    },
    {
      Sheet: 'Quarter Summary',
      Field: 'BE_Departures',
      Description: 'Number of benefit eligible departures this quarter',
      Data_Type: 'Number',
      Required: 'No',
      Example: '3',
      Validation: 'Must be non-negative integer',
      Notes: 'Used for turnover analysis'
    },
    {
      Sheet: 'Employee Master',
      Field: 'Employee_ID',
      Description: 'Unique identifier for each employee',
      Data_Type: 'Text',
      Required: 'Yes',
      Example: 'EMP0001',
      Validation: 'Must be unique across all records',
      Notes: 'Primary key for employee records'
    },
    {
      Sheet: 'Employee Master',
      Field: 'First_Name',
      Description: 'Employee first name',
      Data_Type: 'Text',
      Required: 'Yes',
      Example: 'John',
      Validation: 'Must not be empty',
      Notes: 'Used with Last_Name for full identification'
    },
    {
      Sheet: 'Employee Master',
      Field: 'Last_Name',
      Description: 'Employee last name',
      Data_Type: 'Text',
      Required: 'Yes',
      Example: 'Doe',
      Validation: 'Must not be empty',
      Notes: 'Used with First_Name for full identification'
    },
    {
      Sheet: 'Employee Master',
      Field: 'Department',
      Description: 'Specific department within division',
      Data_Type: 'Text',
      Required: 'Yes',
      Example: 'Mathematics',
      Validation: 'Must match standard department names',
      Notes: 'More specific than Division'
    },
    {
      Sheet: 'Employee Master',
      Field: 'Position',
      Description: 'Job title or role',
      Data_Type: 'Text',
      Required: 'Yes',
      Example: 'Professor',
      Validation: 'Must not be empty',
      Notes: 'Used for position-level analysis'
    },
    {
      Sheet: 'Employee Master',
      Field: 'Employee_Type',
      Description: 'Category of employee',
      Data_Type: 'Text',
      Required: 'Yes',
      Example: 'Faculty',
      Validation: 'Must be: Faculty, Staff, Student, or Administration',
      Notes: 'Primary classification for workforce analysis'
    },
    {
      Sheet: 'Employee Master',
      Field: 'Hire_Date',
      Description: 'Date employee was hired (YYYY-MM-DD)',
      Data_Type: 'Date',
      Required: 'Yes',
      Example: '2020-08-15',
      Validation: 'Must be valid date, not in future',
      Notes: 'Used for tenure calculations and trend analysis'
    },
    {
      Sheet: 'Employee Master',
      Field: 'Salary',
      Description: 'Annual salary amount',
      Data_Type: 'Number',
      Required: 'No',
      Example: '75000',
      Validation: 'Must be positive number',
      Notes: 'Used for compensation analysis (confidential)'
    }
  ];
};

/**
 * Create detailed instructions sheet
 */
const createInstructionsSheet = () => {
  return [
    {
      Section: 'Overview',
      Instruction: 'This Excel template follows the recommended "Single File with Multiple Sheets" strategy for HR data management.',
      Details: 'Each quarter gets its own summary sheet, with optional individual employee records and comprehensive documentation.',
      Priority: 'High',
      Example: ''
    },
    {
      Section: 'Sheet Structure',
      Instruction: 'Quarter Summary Sheets: Q1_2025_Summary, Q2_2025_Summary, etc.',
      Details: 'Each quarter summary sheet contains aggregate data by Division and Location for that specific quarter.',
      Priority: 'High',
      Example: 'Q1_2025_Summary contains data for January-March 2025'
    },
    {
      Section: 'Sheet Structure',
      Instruction: 'Employee_Master: Individual employee records (optional)',
      Details: 'Use this sheet if you have individual employee data that needs to be aggregated into quarterly summaries.',
      Priority: 'Medium',
      Example: 'Employee records with hire dates, departments, positions'
    },
    {
      Section: 'Sheet Structure',
      Instruction: 'Data_Dictionary: Field definitions and validation rules',
      Details: 'Reference this sheet to understand what each field means and how it should be formatted.',
      Priority: 'High',
      Example: 'Explains that Quarter_End_Date must be YYYY-MM-DD format'
    },
    {
      Section: 'Sheet Structure',
      Instruction: 'Instructions: This sheet with detailed usage guidelines',
      Details: 'Step-by-step instructions for using the template effectively.',
      Priority: 'High',
      Example: 'You are reading this now!'
    },
    {
      Section: 'Data Entry',
      Instruction: 'Start with Quarter Summary sheets for aggregate data',
      Details: 'If you have pre-calculated quarterly totals by division and location, enter them directly in quarter sheets.',
      Priority: 'High',
      Example: 'Q1_2025_Summary: Arts & Sciences, Omaha Campus, 125 faculty, 85 staff'
    },
    {
      Section: 'Data Entry',
      Instruction: 'Use Employee_Master for individual records if needed',
      Details: 'If you have individual employee data, the system can aggregate it automatically into quarterly summaries.',
      Priority: 'Medium',
      Example: 'Individual employees with hire dates will be counted in appropriate quarters'
    },
    {
      Section: 'Data Entry',
      Instruction: 'Follow date formats strictly: YYYY-MM-DD',
      Details: 'All dates must be in ISO format (YYYY-MM-DD) for proper processing and quarter detection.',
      Priority: 'High',
      Example: '2025-03-31 for March 31, 2025 (end of Q1 2025)'
    },
    {
      Section: 'Data Entry',
      Instruction: 'Use consistent division and location names',
      Details: 'Standardize names across all sheets to ensure proper aggregation and reporting.',
      Priority: 'High',
      Example: 'Always use "Arts & Sciences" not "Arts and Sciences" or "A&S"'
    },
    {
      Section: 'Validation',
      Instruction: 'Check that Total_Headcount equals sum of individual counts',
      Details: 'Total_Headcount should equal BE_Faculty_Headcount + BE_Staff_Headcount + NBE_Student_Worker_Headcount',
      Priority: 'High',
      Example: 'If Faculty=125, Staff=85, Students=12, then Total should be 222'
    },
    {
      Section: 'Validation',
      Instruction: 'Ensure all required fields are filled',
      Details: 'Quarter_End_Date, Division, Location, BE_Faculty_Headcount, and BE_Staff_Headcount are required.',
      Priority: 'High',
      Example: 'Every row must have a valid quarter end date and division'
    },
    {
      Section: 'Validation',
      Instruction: 'Verify headcount numbers are realistic',
      Details: 'Check that headcount numbers make sense for your organization size and historical trends.',
      Priority: 'Medium',
      Example: 'Large increases (>50%) or decreases should be verified'
    },
    {
      Section: 'Upload Process',
      Instruction: 'Save file as .xlsx format before uploading',
      Details: 'The system supports .xlsx, .xls, and .csv formats, but .xlsx preserves all sheet structure.',
      Priority: 'High',
      Example: 'File → Save As → Excel Workbook (.xlsx)'
    },
    {
      Section: 'Upload Process',
      Instruction: 'Use the multi-sheet upload feature',
      Details: 'The system will detect multiple sheets and allow you to select which ones to process.',
      Priority: 'High',
      Example: 'Select all quarter summary sheets you want to import'
    },
    {
      Section: 'Upload Process',
      Instruction: 'Review data preview before final import',
      Details: 'Always check the data preview to ensure all fields were mapped correctly.',
      Priority: 'High',
      Example: 'Verify column headers match expected field names'
    },
    {
      Section: 'Troubleshooting',
      Instruction: 'If upload fails, check Data_Dictionary for field requirements',
      Details: 'Most upload failures are due to missing required fields or incorrect data formats.',
      Priority: 'Medium',
      Example: 'Missing Quarter_End_Date or wrong date format'
    },
    {
      Section: 'Troubleshooting',
      Instruction: 'Use Validation_Rules sheet to check data quality',
      Details: 'Common validation errors and how to fix them are documented in the Validation_Rules sheet.',
      Priority: 'Medium',
      Example: 'Check for duplicate Employee_IDs or negative headcounts'
    },
    {
      Section: 'Best Practices',
      Instruction: 'Keep a backup copy of your original data',
      Details: 'Always maintain a backup of your source data before importing to the system.',
      Priority: 'High',
      Example: 'Save original file as "HR_Data_2025_ORIGINAL.xlsx"'
    },
    {
      Section: 'Best Practices',
      Instruction: 'Use descriptive file names with dates',
      Details: 'Include the date range or quarter in your file name for easy identification.',
      Priority: 'Medium',
      Example: 'HR_Analytics_Q1_2025_Data.xlsx'
    },
    {
      Section: 'Best Practices',
      Instruction: 'Test with small data sets first',
      Details: 'If you have a large dataset, test the upload process with a small subset first.',
      Priority: 'Medium',
      Example: 'Create a test file with 2-3 divisions first'
    }
  ];
};

/**
 * Create validation rules reference sheet
 */
const createValidationRulesSheet = () => {
  return [
    {
      Field: 'Quarter_End_Date',
      Rule: 'Must be valid date in YYYY-MM-DD format',
      Valid_Examples: '2025-03-31, 2024-12-31',
      Invalid_Examples: '3/31/2025, 2025-3-31, March 31 2025',
      Error_Message: 'Invalid date format',
      Fix: 'Use YYYY-MM-DD format, ensure it is last day of quarter'
    },
    {
      Field: 'Division',
      Rule: 'Must not be empty, should use standard names',
      Valid_Examples: 'Arts & Sciences, School of Medicine, Business',
      Invalid_Examples: '(empty), A&S, Med School',
      Error_Message: 'Missing or non-standard division name',
      Fix: 'Use full, standardized division names consistently'
    },
    {
      Field: 'Location',
      Rule: 'Must not be empty, should use standard names',
      Valid_Examples: 'Omaha Campus, Phoenix Campus, Remote',
      Invalid_Examples: '(empty), Omaha, Phoenix',
      Error_Message: 'Missing or non-standard location name',
      Fix: 'Use full, standardized location names consistently'
    },
    {
      Field: 'BE_Faculty_Headcount',
      Rule: 'Must be non-negative integer',
      Valid_Examples: '0, 125, 250',
      Invalid_Examples: '-5, 125.5, "N/A"',
      Error_Message: 'Invalid faculty headcount',
      Fix: 'Use whole numbers 0 or greater'
    },
    {
      Field: 'BE_Staff_Headcount',
      Rule: 'Must be non-negative integer',
      Valid_Examples: '0, 85, 150',
      Invalid_Examples: '-3, 85.2, "TBD"',
      Error_Message: 'Invalid staff headcount',
      Fix: 'Use whole numbers 0 or greater'
    },
    {
      Field: 'Total_Headcount',
      Rule: 'Should equal sum of individual headcounts',
      Valid_Examples: 'Faculty(125) + Staff(85) + Students(12) = 222',
      Invalid_Examples: 'Faculty(125) + Staff(85) = 150 (missing students)',
      Error_Message: 'Total does not match sum of components',
      Fix: 'Ensure Total = Faculty + Staff + Students + Others'
    },
    {
      Field: 'Employee_ID',
      Rule: 'Must be unique and not empty',
      Valid_Examples: 'EMP0001, 12345, JD001',
      Invalid_Examples: '(empty), duplicate IDs',
      Error_Message: 'Missing or duplicate employee ID',
      Fix: 'Ensure each employee has unique identifier'
    },
    {
      Field: 'Employee_Type',
      Rule: 'Must be one of: Faculty, Staff, Student, Administration',
      Valid_Examples: 'Faculty, Staff, Student, Administration',
      Invalid_Examples: 'Prof, Employee, Worker, Admin',
      Error_Message: 'Invalid employee type',
      Fix: 'Use only the four standard employee types'
    },
    {
      Field: 'Hire_Date',
      Rule: 'Must be valid date in YYYY-MM-DD format, not in future',
      Valid_Examples: '2020-08-15, 2023-01-10',
      Invalid_Examples: '8/15/2020, 2025-12-31 (future)',
      Error_Message: 'Invalid hire date',
      Fix: 'Use YYYY-MM-DD format, date must be in past'
    },
    {
      Field: 'Salary',
      Rule: 'If provided, must be positive number',
      Valid_Examples: '50000, 75000.50, 120000',
      Invalid_Examples: '-5000, "Confidential", 0',
      Error_Message: 'Invalid salary amount',
      Fix: 'Use positive numbers only, or leave blank if confidential'
    }
  ];
};

/**
 * Add data validation to quarter summary sheet
 */
const addDataValidationToSheet = (worksheet, data) => {
  // Add comments and formatting hints
  // Note: XLSX library has limited data validation support
  // This would be enhanced in a full implementation
  
  if (!worksheet['!comments']) {
    worksheet['!comments'] = [];
  }
  
  // Add header comments
  const headers = Object.keys(data[0] || {});
  headers.forEach((header, index) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
    const comment = getFieldComment(header);
    if (comment) {
      worksheet['!comments'].push({
        ref: cellRef,
        author: 'Template',
        t: comment
      });
    }
  });
};


/**
 * Get field-specific comment for data validation
 */
const getFieldComment = (fieldName) => {
  const comments = {
    'Quarter_End_Date': 'Last day of quarter in YYYY-MM-DD format (e.g., 2025-03-31)',
    'Division': 'Standard division name (e.g., Arts & Sciences)',
    'Location': 'Campus location (e.g., Omaha Campus)',
    'BE_Faculty_Headcount': 'Number of benefit eligible faculty (whole number)',
    'BE_Staff_Headcount': 'Number of benefit eligible staff (whole number)',
    'Total_Headcount': 'Total employees (should equal sum of all types)',
    'BE_New_Hires': 'New benefit eligible hires this quarter',
    'BE_Departures': 'Benefit eligible departures this quarter'
  };
  
  return comments[fieldName] || null;
};

/**
 * Download comprehensive Excel template
 */
export const downloadComprehensiveTemplate = (filename = 'HR_Analytics_Data_Template.xlsx') => {
  const workbook = generateComprehensiveTemplate();
  XLSX.writeFile(workbook, filename);
  return filename;
};

/**
 * Generate template for specific quarters
 */
export const generateQuarterSpecificTemplate = (quarterIds) => {
  const workbook = XLSX.utils.book_new();
  const quarters = getQuarters();
  
  // Filter to requested quarters
  const selectedQuarters = quarters.filter(q => quarterIds.includes(q.value));
  
  selectedQuarters.forEach(quarter => {
    const quarterData = generateQuarterSampleData(quarter);
    const worksheet = XLSX.utils.json_to_sheet(quarterData);
    addDataValidationToSheet(worksheet, quarterData);
    
    const sheetName = `${quarter.quarter.replace('-', '_')}_Summary`;
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });
  
  // Add supporting sheets
  const dataDictionary = createDataDictionary();
  const dictionarySheet = XLSX.utils.json_to_sheet(dataDictionary);
  XLSX.utils.book_append_sheet(workbook, dictionarySheet, 'Data_Dictionary');
  
  const instructions = createInstructionsSheet();
  const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
  
  return workbook;
};

/**
 * Generate comprehensive multi-tab template for Combined Workforce Analytics Dashboard
 * Optimized for Oracle HCM data integration with easy mapping
 */
export const generateCombinedWorkforceTemplate = () => {
  const workbook = XLSX.utils.book_new();
  const quarters = getQuarters();
  
  // Get last 5 quarters for trending analysis
  const recentQuarters = quarters.slice(-5);
  
  // 1. Summary Data Tab - Primary aggregate data for all quarters
  const summaryData = generateSummaryDataSheet(recentQuarters);
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  addSummaryDataValidation(summarySheet);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary_Data');
  
  // 2. Location Breakdown Tab
  const locationData = generateLocationBreakdownSheet(recentQuarters);
  const locationSheet = XLSX.utils.json_to_sheet(locationData);
  XLSX.utils.book_append_sheet(workbook, locationSheet, 'Location_Breakdown');
  
  // 3. Division Analysis Tab
  const divisionData = generateDivisionAnalysisSheet(recentQuarters);
  const divisionSheet = XLSX.utils.json_to_sheet(divisionData);
  XLSX.utils.book_append_sheet(workbook, divisionSheet, 'Division_Analysis');
  
  // 4. Hiring Activity Tab
  const hiringData = generateHiringActivitySheet(recentQuarters);
  const hiringSheet = XLSX.utils.json_to_sheet(hiringData);
  XLSX.utils.book_append_sheet(workbook, hiringSheet, 'Hiring_Activity');
  
  // 5. Demographics Metrics Tab
  const demographicsData = generateDemographicsSheet(recentQuarters);
  const demographicsSheet = XLSX.utils.json_to_sheet(demographicsData);
  XLSX.utils.book_append_sheet(workbook, demographicsSheet, 'Demographics_Metrics');
  
  // 6. Oracle HCM Mapping Guide
  const mappingGuide = createOracleHCMMappingGuide();
  const mappingSheet = XLSX.utils.json_to_sheet(mappingGuide);
  XLSX.utils.book_append_sheet(workbook, mappingSheet, 'Oracle_HCM_Mapping');
  
  // 7. Instructions Tab
  const instructions = createCombinedWorkforceInstructions();
  const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
  
  return workbook;
};

/**
 * Generate Summary Data sheet - Primary tab for Firebase import
 */
const generateSummaryDataSheet = (quarters) => {
  const divisions = [
    'Arts & Sciences',
    'School of Medicine', 
    'Medicine',
    'Pharmacy & Health Professions',
    'Dentistry',
    'Business',
    'Engineering',
    'Education',
    'Nursing',
    'Law'
  ];
  
  const locations = ['Omaha Campus', 'Phoenix Campus'];
  const data = [];
  
  quarters.forEach(quarter => {
    divisions.forEach(division => {
      locations.forEach(location => {
        // Generate realistic numbers based on division size and location
        const divisionMultiplier = getDivisionMultiplier(division);
        const locationMultiplier = location === 'Omaha Campus' ? 0.80 : 0.20;
        const quarterMultiplier = getQuarterMultiplier(quarter.quarter);
        
        const baseCount = Math.floor(150 * divisionMultiplier * locationMultiplier * quarterMultiplier);
        
        const beFacultyCount = Math.floor(baseCount * 0.60);
        const beStaffCount = Math.floor(baseCount * 0.35);
        const nbeStudentCount = Math.floor(baseCount * 0.05);
        const totalCount = beFacultyCount + beStaffCount + nbeStudentCount;
        
        // Generate hiring activity
        const beNewHires = Math.floor(totalCount * 0.025 + Math.random() * 5);
        const beDepartures = Math.floor(totalCount * 0.02 + Math.random() * 3);
        const nbeNewHires = Math.floor(nbeStudentCount * 0.15);
        const nbeDepartures = Math.floor(nbeStudentCount * 0.12);
        
        data.push({
          Quarter_End_Date: quarter.dateValue,
          Division: division,
          Location: location,
          BE_Faculty_Headcount: beFacultyCount,
          BE_Staff_Headcount: beStaffCount,
          NBE_Faculty_Headcount: 0, // Typically minimal
          NBE_Staff_Headcount: 0, // Typically minimal  
          NBE_Student_Worker_Headcount: nbeStudentCount,
          Total_Headcount: totalCount,
          BE_New_Hires: beNewHires,
          BE_Departures: beDepartures,
          NBE_New_Hires: nbeNewHires,
          NBE_Departures: nbeDepartures,
          // Additional metrics for enhanced analytics
          Open_Positions: Math.floor(Math.random() * 8),
          Average_Time_to_Fill: Math.floor(30 + Math.random() * 45),
          Retention_Rate_Percent: (88 + Math.random() * 10).toFixed(1)
        });
      });
    });
  });
  
  return data;
};

/**
 * Generate Location Breakdown sheet
 */
const generateLocationBreakdownSheet = (quarters) => {
  const locations = ['Omaha Campus', 'Phoenix Campus', 'Remote Work', 'Lincoln Campus'];
  const data = [];
  
  quarters.forEach(quarter => {
    let totalEmployees = 0;
    const locationTotals = [];
    
    locations.forEach(location => {
      const multiplier = location === 'Omaha Campus' ? 0.75 : 
                       location === 'Phoenix Campus' ? 0.20 : 
                       location === 'Remote Work' ? 0.03 : 0.02;
      
      const employees = Math.floor(3200 * multiplier * getQuarterMultiplier(quarter.quarter));
      totalEmployees += employees;
      
      locationTotals.push({
        Quarter_End_Date: quarter.dateValue,
        Location: location,
        Total_Employees: employees,
        Faculty_Count: Math.floor(employees * 0.58),
        Staff_Count: Math.floor(employees * 0.37),
        Student_Workers: Math.floor(employees * 0.05),
        Percentage_of_Total: 0, // Will be calculated
        Growth_Rate_Percent: (Math.random() * 6 - 3).toFixed(1) // -3% to +3%
      });
    });
    
    // Calculate percentages
    locationTotals.forEach(item => {
      item.Percentage_of_Total = ((item.Total_Employees / totalEmployees) * 100).toFixed(1);
      data.push(item);
    });
  });
  
  return data;
};

/**
 * Generate Division Analysis sheet
 */
const generateDivisionAnalysisSheet = (quarters) => {
  const divisions = [
    'Arts & Sciences', 'School of Medicine', 'Medicine', 'Pharmacy & Health Professions',
    'Dentistry', 'Business', 'Engineering', 'Education', 'Nursing', 'Law'
  ];
  const data = [];
  
  quarters.forEach(quarter => {
    divisions.forEach(division => {
      const multiplier = getDivisionMultiplier(division);
      const quarterMultiplier = getQuarterMultiplier(quarter.quarter);
      const totalEmployees = Math.floor(320 * multiplier * quarterMultiplier);
      
      const facultyCount = Math.floor(totalEmployees * (0.55 + Math.random() * 0.15));
      const staffCount = totalEmployees - facultyCount;
      
      data.push({
        Quarter_End_Date: quarter.dateValue,
        Division: division,
        Total_Headcount: totalEmployees,
        Faculty_Headcount: facultyCount,
        Staff_Headcount: staffCount,
        Faculty_to_Staff_Ratio: (facultyCount / staffCount).toFixed(2),
        Average_Faculty_Tenure: (5 + Math.random() * 8).toFixed(1),
        Average_Staff_Tenure: (4 + Math.random() * 6).toFixed(1),
        Division_Growth_Rate: (Math.random() * 8 - 4).toFixed(1), // -4% to +4%
        Budget_per_Employee: Math.floor(75000 + Math.random() * 50000)
      });
    });
  });
  
  return data;
};

/**
 * Generate Hiring Activity sheet
 */
const generateHiringActivitySheet = (quarters) => {
  const data = [];
  
  quarters.forEach(quarter => {
    // Generate monthly data for the quarter
    const months = getMonthsInQuarter(quarter.quarter);
    
    months.forEach(month => {
      const facultyHires = Math.floor(15 + Math.random() * 25);
      const staffHires = Math.floor(20 + Math.random() * 35);
      const studentHires = Math.floor(8 + Math.random() * 15);
      
      const facultyDepartures = Math.floor(12 + Math.random() * 18);
      const staffDepartures = Math.floor(15 + Math.random() * 25);
      const studentDepartures = Math.floor(6 + Math.random() * 12);
      
      data.push({
        Quarter_End_Date: quarter.dateValue,
        Month: month,
        Faculty_New_Hires: facultyHires,
        Staff_New_Hires: staffHires,
        Student_New_Hires: studentHires,
        Total_New_Hires: facultyHires + staffHires + studentHires,
        Faculty_Departures: facultyDepartures,
        Staff_Departures: staffDepartures,
        Student_Departures: studentDepartures,
        Total_Departures: facultyDepartures + staffDepartures + studentDepartures,
        Net_Change: (facultyHires + staffHires + studentHires) - (facultyDepartures + staffDepartures + studentDepartures),
        Time_to_Fill_Days: Math.floor(25 + Math.random() * 40),
        Cost_per_Hire: Math.floor(3000 + Math.random() * 2000)
      });
    });
  });
  
  return data;
};

/**
 * Generate Demographics sheet
 */
const generateDemographicsSheet = (quarters) => {
  const data = [];
  
  quarters.forEach(quarter => {
    const totalEmployees = Math.floor(3200 * getQuarterMultiplier(quarter.quarter));
    
    data.push({
      Quarter_End_Date: quarter.dateValue,
      Total_Employees: totalEmployees,
      Average_Age: (40 + Math.random() * 8).toFixed(1),
      Average_Tenure_Years: (6.5 + Math.random() * 4).toFixed(1),
      Age_22_30_Count: Math.floor(totalEmployees * 0.25),
      Age_31_40_Count: Math.floor(totalEmployees * 0.30),
      Age_41_50_Count: Math.floor(totalEmployees * 0.25),
      Age_51_65_Count: Math.floor(totalEmployees * 0.20),
      Tenure_0_2_Years: Math.floor(totalEmployees * 0.30),
      Tenure_3_5_Years: Math.floor(totalEmployees * 0.25),
      Tenure_6_10_Years: Math.floor(totalEmployees * 0.25),
      Tenure_10_Plus_Years: Math.floor(totalEmployees * 0.20),
      Gender_Male_Percent: (48 + Math.random() * 4).toFixed(1),
      Gender_Female_Percent: (52 - Math.random() * 4).toFixed(1),
      Diversity_Index: Math.floor(30 + Math.random() * 15),
      Remote_Workers_Count: Math.floor(totalEmployees * 0.15),
      Part_Time_Employees: Math.floor(totalEmployees * 0.08)
    });
  });
  
  return data;
};

/**
 * Create Oracle HCM Mapping Guide
 */
const createOracleHCMMappingGuide = () => {
  return [
    {
      Template_Column: 'Quarter_End_Date',
      Oracle_HCM_Field: 'EFFECTIVE_END_DATE or PERIOD_END_DATE',
      Description: 'Last day of the quarter in YYYY-MM-DD format',
      Sample_Oracle_Value: '31-DEC-2024',
      Sample_Template_Value: '2024-12-31',
      Transformation_Notes: 'Convert Oracle date format to YYYY-MM-DD',
      Required: 'Yes'
    },
    {
      Template_Column: 'Division',
      Oracle_HCM_Field: 'ORGANIZATION_NAME or BUSINESS_GROUP',
      Description: 'Academic or administrative division',
      Sample_Oracle_Value: 'College of Arts and Sciences',
      Sample_Template_Value: 'Arts & Sciences',
      Transformation_Notes: 'Standardize division names for consistency',
      Required: 'Yes'
    },
    {
      Template_Column: 'Location',
      Oracle_HCM_Field: 'LOCATION_NAME or WORK_LOCATION',
      Description: 'Campus or facility location',
      Sample_Oracle_Value: 'Omaha Main Campus',
      Sample_Template_Value: 'Omaha Campus',
      Transformation_Notes: 'Use standardized location names',
      Required: 'Yes'
    },
    {
      Template_Column: 'BE_Faculty_Headcount',
      Oracle_HCM_Field: 'COUNT(*) WHERE JOB_FAMILY=Faculty AND BENEFIT_ELIGIBLE=Y',
      Description: 'Count of benefit eligible faculty',
      Sample_Oracle_Value: 'Query result: 125',
      Sample_Template_Value: '125',
      Transformation_Notes: 'Aggregate count by quarter/division/location',
      Required: 'Yes'
    },
    {
      Template_Column: 'BE_Staff_Headcount',
      Oracle_HCM_Field: 'COUNT(*) WHERE JOB_FAMILY=Staff AND BENEFIT_ELIGIBLE=Y',
      Description: 'Count of benefit eligible staff',
      Sample_Oracle_Value: 'Query result: 85',
      Sample_Template_Value: '85',
      Transformation_Notes: 'Aggregate count by quarter/division/location',
      Required: 'Yes'
    },
    {
      Template_Column: 'NBE_Student_Worker_Headcount',
      Oracle_HCM_Field: 'COUNT(*) WHERE JOB_FAMILY=Student AND BENEFIT_ELIGIBLE=N',
      Description: 'Count of non-benefit eligible student workers',
      Sample_Oracle_Value: 'Query result: 25',
      Sample_Template_Value: '25',
      Transformation_Notes: 'Aggregate count by quarter/division/location',
      Required: 'No'
    },
    {
      Template_Column: 'BE_New_Hires',
      Oracle_HCM_Field: 'COUNT(*) WHERE HIRE_DATE BETWEEN quarter_start AND quarter_end',
      Description: 'New benefit eligible hires in quarter',
      Sample_Oracle_Value: 'Query result: 8',
      Sample_Template_Value: '8',
      Transformation_Notes: 'Filter by hire date within quarter',
      Required: 'No'
    },
    {
      Template_Column: 'BE_Departures',
      Oracle_HCM_Field: 'COUNT(*) WHERE TERMINATION_DATE BETWEEN quarter_start AND quarter_end',
      Description: 'Benefit eligible departures in quarter',
      Sample_Oracle_Value: 'Query result: 5',
      Sample_Template_Value: '5',
      Transformation_Notes: 'Filter by termination date within quarter',
      Required: 'No'
    }
  ];
};

/**
 * Create Combined Workforce Instructions
 */
const createCombinedWorkforceInstructions = () => {
  return [
    {
      Step: 1,
      Section: 'Overview',
      Instruction: 'This template supports the Combined Workforce Analytics Dashboard',
      Details: 'Multi-tab design optimized for Oracle HCM data integration with comprehensive workforce metrics.',
      Required_Action: 'Review all tabs and understand the data structure before beginning'
    },
    {
      Step: 2,
      Section: 'Data Preparation',
      Instruction: 'Export quarterly data from Oracle HCM',
      Details: 'Use Oracle standard reports or custom queries to extract headcount by division, location, and quarter.',
      Required_Action: 'Generate aggregated counts - do not export individual employee records'
    },
    {
      Step: 3,
      Section: 'Data Mapping',
      Instruction: 'Use the Oracle_HCM_Mapping tab for field mapping',
      Details: 'This tab provides exact Oracle field names and transformation instructions for each template column.',
      Required_Action: 'Map your Oracle fields to template columns using the provided guide'
    },
    {
      Step: 4,
      Section: 'Primary Data Entry',
      Instruction: 'Complete the Summary_Data tab first',
      Details: 'This is the main tab used for Firebase import. All other tabs provide supplementary analytics.',
      Required_Action: 'Ensure all required fields are completed with accurate aggregate counts'
    },
    {
      Step: 5,
      Section: 'Data Validation',
      Instruction: 'Verify totals and check for consistency',
      Details: 'Total_Headcount should equal sum of BE_Faculty + BE_Staff + NBE_Student_Worker counts.',
      Required_Action: 'Use built-in Excel formulas to validate data accuracy'
    },
    {
      Step: 6,
      Section: 'Upload Process',
      Instruction: 'Save as .xlsx and upload via Excel Integration Dashboard',
      Details: 'The system will automatically detect and process the multi-tab structure.',
      Required_Action: 'Upload the complete Excel file - system will process all relevant tabs'
    },
    {
      Step: 7,
      Section: 'Dashboard Verification',
      Instruction: 'Review the Combined Workforce Analytics Dashboard',
      Details: 'Verify all charts and metrics display correctly with your uploaded data.',
      Required_Action: 'Check summary cards, trend charts, and division breakdowns for accuracy'
    }
  ];
};

// Helper functions
const getDivisionMultiplier = (division) => ({
  'Arts & Sciences': 1.2,
  'School of Medicine': 1.4,
  'Medicine': 1.3,
  'Pharmacy & Health Professions': 0.8,
  'Dentistry': 0.6,
  'Business': 0.9,
  'Engineering': 0.7,
  'Education': 0.5,
  'Nursing': 0.8,
  'Law': 0.4
})[division] || 1.0;

const getQuarterMultiplier = (quarter) => ({
  'Q1-2024': 0.95,
  'Q2-2024': 0.97,
  'Q3-2024': 0.98,
  'Q4-2024': 1.0,
  'Q1-2025': 1.02,
  'Q2-2025': 1.04,
  'Q3-2025': 1.05,
  'Q4-2025': 1.06
})[quarter] || 1.0;

const getMonthsInQuarter = (quarter) => {
  const quarterMap = {
    'Q1': ['January', 'February', 'March'],
    'Q2': ['April', 'May', 'June'],
    'Q3': ['July', 'August', 'September'],
    'Q4': ['October', 'November', 'December']
  };
  const quarterNum = quarter.substring(0, 2);
  return quarterMap[quarterNum] || ['Month 1', 'Month 2', 'Month 3'];
};

/**
 * Add data validation to Summary Data sheet
 */
const addSummaryDataValidation = (worksheet) => {
  if (!worksheet['!comments']) {
    worksheet['!comments'] = [];
  }
  
  // Add header comments for key fields
  const headerComments = {
    'A1': 'Quarter end date in YYYY-MM-DD format (e.g., 2024-12-31)',
    'B1': 'Standard division name (see Oracle_HCM_Mapping tab)',
    'C1': 'Campus location (see Oracle_HCM_Mapping tab)',
    'D1': 'Count of benefit eligible faculty members',
    'E1': 'Count of benefit eligible staff members',
    'I1': 'Total headcount (should equal sum of individual counts)'
  };
  
  Object.entries(headerComments).forEach(([cell, comment]) => {
    worksheet['!comments'].push({
      ref: cell,
      author: 'Template',
      t: comment
    });
  });
};

/**
 * Download Combined Workforce Template
 */
export const downloadCombinedWorkforceTemplate = (filename = 'Combined_Workforce_Analytics_Template.xlsx') => {
  const workbook = generateCombinedWorkforceTemplate();
  XLSX.writeFile(workbook, filename);
  return filename;
};

export default {
  generateComprehensiveTemplate,
  downloadComprehensiveTemplate,
  generateQuarterSpecificTemplate,
  generateQuarterSampleData,
  createDataDictionary,
  createInstructionsSheet,
  createValidationRulesSheet,
  generateCombinedWorkforceTemplate,
  downloadCombinedWorkforceTemplate
};