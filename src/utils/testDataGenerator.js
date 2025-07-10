/**
 * Test Data Generator
 * Creates realistic sample datasets for testing Excel upload functionality
 */

import * as XLSX from 'xlsx';

/**
 * Generate realistic individual employee records
 */
export const generateIndividualEmployeeData = (count = 100) => {
  const divisions = [
    'Arts & Sciences', 'School of Medicine', 'Medicine', 
    'Pharmacy & Health Professions', 'Dentistry', 'Business', 
    'Engineering', 'Education', 'Law', 'Nursing'
  ];
  
  const departments = {
    'Arts & Sciences': ['English', 'Mathematics', 'History', 'Psychology', 'Biology'],
    'School of Medicine': ['Internal Medicine', 'Surgery', 'Pediatrics', 'Radiology', 'Pathology'],
    'Medicine': ['Cardiology', 'Neurology', 'Oncology', 'Emergency Medicine', 'Family Medicine'],
    'Pharmacy & Health Professions': ['Pharmacy', 'Physical Therapy', 'Occupational Therapy', 'Nursing', 'Public Health'],
    'Dentistry': ['General Dentistry', 'Oral Surgery', 'Orthodontics', 'Periodontics', 'Endodontics'],
    'Business': ['Accounting', 'Marketing', 'Management', 'Finance', 'Information Systems'],
    'Engineering': ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Biomedical Engineering'],
    'Education': ['Elementary Education', 'Secondary Education', 'Special Education', 'Educational Leadership', 'Counseling'],
    'Law': ['Constitutional Law', 'Criminal Law', 'Corporate Law', 'Environmental Law', 'Health Law'],
    'Nursing': ['Adult Health', 'Pediatric Nursing', 'Mental Health', 'Community Health', 'Nurse Administration']
  };

  const positions = {
    Faculty: ['Professor', 'Associate Professor', 'Assistant Professor', 'Instructor', 'Lecturer'],
    Staff: ['Manager', 'Coordinator', 'Specialist', 'Analyst', 'Administrator', 'Assistant', 'Director']
  };

  const locations = ['Omaha Campus', 'Phoenix Campus'];
  
  const firstNames = [
    'John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Jennifer', 'William', 'Jessica',
    'James', 'Emily', 'Christopher', 'Ashley', 'Daniel', 'Melissa', 'Matthew', 'Amanda', 'Anthony', 'Nicole'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
  ];

  const employees = [];
  
  for (let i = 0; i < count; i++) {
    const employeeType = Math.random() < 0.6 ? 'Faculty' : 'Staff'; // 60% faculty, 40% staff
    const division = divisions[Math.floor(Math.random() * divisions.length)];
    const department = departments[division][Math.floor(Math.random() * departments[division].length)];
    const position = positions[employeeType][Math.floor(Math.random() * positions[employeeType].length)];
    const location = Math.random() < 0.75 ? 'Omaha Campus' : 'Phoenix Campus'; // 75% Omaha, 25% Phoenix
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    // Generate realistic hire dates (last 10 years)
    const hireDate = new Date();
    hireDate.setFullYear(hireDate.getFullYear() - Math.floor(Math.random() * 10));
    hireDate.setMonth(Math.floor(Math.random() * 12));
    hireDate.setDate(Math.floor(Math.random() * 28) + 1);
    
    // Generate realistic salaries based on type and position
    let baseSalary;
    if (employeeType === 'Faculty') {
      baseSalary = position.includes('Professor') ? 
        (position === 'Professor' ? 85000 : position === 'Associate Professor' ? 70000 : 55000) : 45000;
    } else {
      baseSalary = position.includes('Director') ? 75000 : 
                   position.includes('Manager') ? 60000 : 45000;
    }
    
    const salary = baseSalary + Math.floor(Math.random() * 20000) - 10000; // ±$10k variation

    employees.push({
      Employee_ID: `EMP${String(i + 1).padStart(4, '0')}`,
      First_Name: firstName,
      Last_Name: lastName,
      Department: department,
      Division: division,
      Position: position,
      Location: location,
      Employee_Type: employeeType,
      Employment_Status: Math.random() < 0.9 ? 'Full-time' : 'Part-time',
      Hire_Date: hireDate.toISOString().split('T')[0],
      Salary: salary,
      Email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@university.edu`,
      Phone: `(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`
    });
  }
  
  return employees;
};

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
 * Create and download Excel file with test data
 */
export const createTestExcelFile = (dataType = 'both', filename = null) => {
  const workbook = XLSX.utils.book_new();
  
  if (dataType === 'individual' || dataType === 'both') {
    const employeeData = generateIndividualEmployeeData(150);
    const employeeSheet = XLSX.utils.json_to_sheet(employeeData);
    XLSX.utils.book_append_sheet(workbook, employeeSheet, 'Employee_Records');
  }
  
  if (dataType === 'aggregate' || dataType === 'both') {
    const aggregateData = generateQuarterlyAggregateData();
    const aggregateSheet = XLSX.utils.json_to_sheet(aggregateData);
    XLSX.utils.book_append_sheet(workbook, aggregateSheet, 'Quarterly_Aggregates');
  }
  
  // Add a data dictionary sheet
  const dataDictionary = [
    { Field: 'Employee_ID', Description: 'Unique employee identifier', Example: 'EMP0001' },
    { Field: 'First_Name', Description: 'Employee first name', Example: 'John' },
    { Field: 'Last_Name', Description: 'Employee last name', Example: 'Doe' },
    { Field: 'Department', Description: 'Department name', Example: 'Mathematics' },
    { Field: 'Division', Description: 'Division or college', Example: 'Arts & Sciences' },
    { Field: 'Position', Description: 'Job title', Example: 'Professor' },
    { Field: 'Location', Description: 'Campus location', Example: 'Omaha Campus' },
    { Field: 'Employee_Type', Description: 'Type of employee', Example: 'Faculty' },
    { Field: 'Employment_Status', Description: 'Employment status', Example: 'Full-time' },
    { Field: 'Hire_Date', Description: 'Date of hire (YYYY-MM-DD)', Example: '2020-08-15' },
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
  const defaultFilename = dataType === 'individual' ? 'test_employee_records.xlsx' :
                         dataType === 'aggregate' ? 'test_quarterly_aggregates.xlsx' :
                         'test_hr_data_complete.xlsx';
  
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
 * Export test datasets as files
 */
export const exportTestDatasets = () => {
  // Create individual employee records file
  createTestExcelFile('individual', 'test_individual_employees.xlsx');
  
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
  
  // Add Employee Master (sample)
  const employeeMaster = generateIndividualEmployeeData(50);
  const employeeSheet = XLSX.utils.json_to_sheet(employeeMaster);
  XLSX.utils.book_append_sheet(comprehensiveWorkbook, employeeSheet, 'Employee_Master');
  
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
    'test_individual_employees.xlsx',
    'test_quarterly_aggregates.xlsx', 
    'test_validation_data.xlsx',
    'HR_Analytics_Data_Template.xlsx'
  ];
};

export default {
  generateIndividualEmployeeData,
  generateQuarterlyAggregateData,
  createTestExcelFile,
  createValidationTestData,
  exportTestDatasets
};