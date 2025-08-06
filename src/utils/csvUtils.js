// CSV Utilities for Admin Dashboard
// Handles CSV parsing, conversion to JSON, and template generation

/**
 * Parse CSV string to array of objects
 * @param {string} csvString - Raw CSV string data
 * @param {object} options - Parsing options
 * @returns {object} Parsed result with data and metadata
 */
export const parseCSV = (csvString, options = {}) => {
  const {
    delimiter = 'auto',
    hasHeaders = true,
    parseNumbers = true,
    parseJSON = true,
    transpose = false
  } = options;
  
  if (!csvString || typeof csvString !== 'string') {
    return { data: [], headers: [], errors: ['No CSV data provided'] };
  }
  
  // Auto-detect delimiter
  const detectDelimiter = (str) => {
    const delimiters = [',', ';', '\t', '|'];
    const counts = delimiters.map(d => ({
      delimiter: d,
      count: (str.split('\n')[0] || '').split(d).length - 1
    }));
    return counts.sort((a, b) => b.count - a.count)[0].delimiter;
  };
  
  const actualDelimiter = delimiter === 'auto' ? detectDelimiter(csvString) : delimiter;
  
  // Split into lines and handle different line endings
  const lines = csvString.trim().split(/\r?\n/);
  if (lines.length === 0) {
    return { data: [], headers: [], errors: ['Empty CSV data'] };
  }
  
  // Parse CSV lines
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === actualDelimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };
  
  // Parse all lines
  const parsedLines = lines.map(parseCSVLine);
  
  // Handle transposition if requested
  if (transpose) {
    const transposed = parsedLines[0].map((_, colIndex) => 
      parsedLines.map(row => row[colIndex])
    );
    parsedLines.length = 0;
    parsedLines.push(...transposed);
  }
  
  // Extract headers and data
  const headers = hasHeaders ? parsedLines[0] : 
    parsedLines[0].map((_, i) => `Column${i + 1}`);
  const dataRows = hasHeaders ? parsedLines.slice(1) : parsedLines;
  
  // Convert to array of objects
  const data = dataRows.map((row, rowIndex) => {
    const obj = {};
    headers.forEach((header, colIndex) => {
      let value = row[colIndex] || '';
      
      // Parse numbers if enabled
      if (parseNumbers && value !== '') {
        const num = Number(value);
        if (!isNaN(num) && value.trim() !== '') {
          value = num;
        }
      }
      
      // Parse JSON if enabled
      if (parseJSON && typeof value === 'string' && 
          (value.startsWith('{') || value.startsWith('['))) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if JSON parsing fails
        }
      }
      
      obj[header] = value;
    });
    return obj;
  });
  
  return {
    data,
    headers,
    delimiter: actualDelimiter,
    rowCount: data.length,
    errors: []
  };
};

/**
 * Convert CSV data to HR Reports JSON format
 * @param {array} csvData - Parsed CSV data array
 * @param {string} dashboardType - Type of dashboard (workforce, turnover, etc.)
 * @param {string} period - Reporting period
 * @returns {object} Formatted JSON data for the dashboard
 */
export const csvToHRJson = (csvData, dashboardType, period) => {
  if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
    throw new Error('Invalid CSV data provided');
  }
  
  switch (dashboardType) {
    case 'workforce':
      return csvToWorkforceJson(csvData, period);
    case 'turnover':
      return csvToTurnoverJson(csvData, period);
    case 'compliance':
      return csvToComplianceJson(csvData, period);
    case 'recruiting':
      return csvToRecruitingJson(csvData, period);
    case 'exitSurvey':
      return csvToExitSurveyJson(csvData, period);
    default:
      throw new Error(`Unknown dashboard type: ${dashboardType}`);
  }
};

/**
 * Convert CSV to Workforce JSON format
 */
const csvToWorkforceJson = (csvData, period) => {
  // Check if this is employee data or aggregate data
  const hasEmployeeColumns = csvData.length > 0 && csvData[0]['Employee ID'];
  
  if (hasEmployeeColumns) {
    // Handle individual employee records
    return csvToWorkforceEmployeeJson(csvData, period);
  } else {
    // Handle legacy aggregate data
    return csvToWorkforceAggregateJson(csvData, period);
  }
};

/**
 * Convert CSV to individual employee records JSON format
 */
const csvToWorkforceEmployeeJson = (csvData, period) => {
  const result = {
    period,
    lastUpdated: new Date().toISOString(),
    employees: []
  };
  
  // Convert each row to an employee record
  csvData.forEach((row, index) => {
    if (!row['Employee ID']) return; // Skip rows without employee ID
    
    const employee = {
      id: `emp_${row['Employee ID']}`,
      employeeId: row['Employee ID'] || '',
      firstName: row['First Name'] || '',
      lastName: row['Last Name'] || '',
      fullName: row['Full Name'] || `${row['First Name']} ${row['Last Name']}`,
      email: row['Email'] || '',
      phone: row['Phone'] || '',
      hireDate: row['Hire Date'] || '',
      employmentStatus: row['Employment Status'] || 'Active',
      employeeType: row['Employee Type'] || 'Staff',
      employeeClass: row['Employee Class'] || 'Full-Time',
      department: row['Department'] || '',
      division: row['Division'] || '',
      college: row['College'] || '',
      location: row['Location'] || '',
      campus: row['Campus'] || 'Omaha',
      building: row['Building'] || '',
      room: row['Room'] || '',
      jobTitle: row['Job Title'] || '',
      jobCode: row['Job Code'] || '',
      reportingManager: row['Reporting Manager'] || '',
      managerEmployeeId: row['Manager Employee ID'] || '',
      benefitEligible: parseBooleanString(row['Benefit Eligible']),
      benefitEligibleFaculty: parseBooleanString(row['Benefit Eligible Faculty']),
      benefitEligibleStaff: parseBooleanString(row['Benefit Eligible Staff']),
      nonBenefitEligibleFaculty: parseBooleanString(row['Non-Benefit Eligible Faculty']),
      nonBenefitEligibleStaff: parseBooleanString(row['Non-Benefit Eligible Staff']),
      unionMember: parseBooleanString(row['Union Member']),
      unionName: row['Union Name'] || '',
      annualSalary: parseNumberOrNull(row['Annual Salary']),
      hourlyRate: parseNumberOrNull(row['Hourly Rate']),
      payGrade: row['Pay Grade'] || '',
      payStep: row['Pay Step'] || '',
      payFrequency: row['Pay Frequency'] || 'Bi-Weekly',
      gender: row['Gender'] || '',
      ethnicity: row['Ethnicity'] || '',
      age: parseNumberOrNull(row['Age']),
      ageGroup: row['Age Group'] || '',
      serviceYears: parseNumberOrNull(row['Service Years']),
      tenureGroup: row['Tenure Group'] || '',
      previousServiceYears: parseNumberOrNull(row['Previous Service Years']),
      totalServiceYears: parseNumberOrNull(row['Total Service Years']),
      i9ComplianceStatus: row['I9 Compliance Status'] || 'Pending',
      i9FormDate: row['I9 Form Date'] || '',
      section1CompletionDate: row['Section 1 Completion Date'] || '',
      section2CompletionDate: row['Section 2 Completion Date'] || '',
      section3CompletionDate: row['Section 3 Completion Date'] || '',
      reverificationDate: row['Reverification Date'] || '',
      reverificationRequired: parseBooleanString(row['Reverification Required']),
      documentExpirationDate: row['Document Expiration Date'] || '',
      tenure: parseBooleanString(row['Tenure']),
      tenureTrack: parseBooleanString(row['Tenure Track']),
      academicRank: row['Academic Rank'] || '',
      degreeLevel: row['Degree Level'] || '',
      primaryDiscipline: row['Primary Discipline'] || '',
      studentId: row['Student ID'] || '',
      studentLevel: row['Student Level'] || '',
      majorField: row['Major Field'] || '',
      enrollmentStatus: row['Enrollment Status'] || '',
      notes: row['Notes'] || '',
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      version: 1,
      source: 'Import'
    };
    
    result.employees.push(employee);
  });
  
  return result;
};

/**
 * Convert CSV to legacy aggregate workforce JSON format
 */
const csvToWorkforceAggregateJson = (csvData, period) => {
  const result = {
    period,
    lastUpdated: new Date().toISOString(),
    demographics: {},
    byLocation: {},
    byDepartment: {},
    trends: {}
  };
  
  // Map CSV columns to JSON structure
  csvData.forEach(row => {
    // Handle demographic data
    if (row['BE Faculty']) result.demographics.beFaculty = Number(row['BE Faculty']) || 0;
    if (row['BE Staff']) result.demographics.beStaff = Number(row['BE Staff']) || 0;
    if (row['NBE Faculty']) result.demographics.nbeFaculty = Number(row['NBE Faculty']) || 0;
    if (row['NBE Staff']) result.demographics.nbeStaff = Number(row['NBE Staff']) || 0;
    if (row['Students']) result.demographics.students = Number(row['Students']) || 0;
    if (row['HSR']) result.demographics.hsr = Number(row['HSR']) || 0;
    
    // Handle location data
    if (row['Location'] && row['Headcount']) {
      result.byLocation[row['Location']] = Number(row['Headcount']) || 0;
    }
    
    // Handle department data
    if (row['Department'] && row['Headcount']) {
      result.byDepartment[row['Department']] = Number(row['Headcount']) || 0;
    }
  });
  
  // Calculate totals
  result.totalEmployees = Object.values(result.demographics).reduce((sum, val) => sum + val, 0);
  
  // Calculate BE totals
  result.demographics.faculty = (result.demographics.beFaculty || 0) + (result.demographics.nbeFaculty || 0);
  result.demographics.staff = (result.demographics.beStaff || 0) + (result.demographics.nbeStaff || 0);
  
  return result;
};

/**
 * Helper function to parse boolean strings from CSV
 */
const parseBooleanString = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'true' || lower === 'yes' || lower === '1';
  }
  return false;
};

/**
 * Helper function to parse numbers or return null
 */
const parseNumberOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};

/**
 * Convert CSV to Turnover JSON format
 */
const csvToTurnoverJson = (csvData, period) => {
  const result = {
    period,
    lastUpdated: new Date().toISOString(),
    overallTurnoverRate: 0,
    totalDepartures: 0,
    facultyTurnoverRate: 0,
    staffTurnoverRate: 0,
    voluntaryReasons: {},
    tenureAnalysis: {}
  };
  
  // Process CSV data based on row type
  csvData.forEach(row => {
    if (row['Metric'] === 'Overall Turnover Rate') {
      result.overallTurnoverRate = Number(row['Value']) || 0;
    } else if (row['Metric'] === 'Total Departures') {
      result.totalDepartures = Number(row['Value']) || 0;
    } else if (row['Metric'] === 'Faculty Turnover Rate') {
      result.facultyTurnoverRate = Number(row['Value']) || 0;
    } else if (row['Metric'] === 'Staff Turnover Rate') {
      result.staffTurnoverRate = Number(row['Value']) || 0;
    } else if (row['Reason'] && row['Count']) {
      result.voluntaryReasons[row['Reason']] = Number(row['Count']) || 0;
    } else if (row['Tenure'] && row['Count']) {
      result.tenureAnalysis[row['Tenure']] = Number(row['Count']) || 0;
    }
  });
  
  return result;
};

/**
 * Convert CSV to Compliance JSON format
 */
const csvToComplianceJson = (csvData, period) => {
  const result = {
    period,
    lastUpdated: new Date().toISOString(),
    overallComplianceRate: 0,
    totalActive: 0,
    compliant: 0,
    nonCompliant: 0,
    expiringSoon: 0,
    overdue: 0,
    highRiskDepartments: [],
    riskCategories: {}
  };
  
  csvData.forEach(row => {
    if (row['Metric'] === 'Overall Compliance Rate') {
      result.overallComplianceRate = Number(row['Value']) || 0;
    } else if (row['Metric'] === 'Total Active') {
      result.totalActive = Number(row['Value']) || 0;
    } else if (row['Department'] && row['Compliance Rate']) {
      result.highRiskDepartments.push({
        name: row['Department'],
        complianceRate: Number(row['Compliance Rate']) || 0,
        issues: Number(row['Issues']) || 0
      });
    }
  });
  
  return result;
};

/**
 * Convert CSV to Recruiting JSON format
 */
const csvToRecruitingJson = (csvData, period) => {
  const result = {
    period,
    lastUpdated: new Date().toISOString(),
    openPositions: 0,
    newHires: 0,
    timeToFill: 0,
    acceptanceRate: 0,
    byDepartment: {},
    sourceEffectiveness: {}
  };
  
  csvData.forEach(row => {
    if (row['Metric'] === 'Open Positions') {
      result.openPositions = Number(row['Value']) || 0;
    } else if (row['Department'] && row['Open Positions']) {
      result.byDepartment[row['Department']] = Number(row['Open Positions']) || 0;
    } else if (row['Source'] && row['Hires']) {
      result.sourceEffectiveness[row['Source']] = Number(row['Hires']) || 0;
    }
  });
  
  return result;
};

/**
 * Convert CSV to Exit Survey JSON format
 */
const csvToExitSurveyJson = (csvData, period) => {
  const result = {
    period,
    lastUpdated: new Date().toISOString(),
    responseRate: 0,
    totalResponses: 0,
    overallSatisfaction: 0,
    wouldRecommend: 0,
    primaryReasons: {},
    satisfactionScores: {}
  };
  
  csvData.forEach(row => {
    if (row['Metric'] === 'Response Rate') {
      result.responseRate = Number(row['Value']) || 0;
    } else if (row['Reason'] && row['Count']) {
      result.primaryReasons[row['Reason']] = Number(row['Count']) || 0;
    } else if (row['Category'] && row['Score']) {
      result.satisfactionScores[row['Category'].toLowerCase()] = Number(row['Score']) || 0;
    }
  });
  
  return result;
};

/**
 * Generate CSV template for a specific dashboard type
 * @param {string} dashboardType - Type of dashboard
 * @returns {string} CSV template string
 */
export const generateCSVTemplate = (dashboardType) => {
  const templates = {
    workforce: `Employee ID,First Name,Last Name,Full Name,Email,Phone,Hire Date,Employment Status,Employee Type,Employee Class,Department,Division,College,Location,Campus,Building,Room,Job Title,Job Code,Reporting Manager,Manager Employee ID,Benefit Eligible,Benefit Eligible Faculty,Benefit Eligible Staff,Non-Benefit Eligible Faculty,Non-Benefit Eligible Staff,Union Member,Union Name,Annual Salary,Hourly Rate,Pay Grade,Pay Step,Pay Frequency,Gender,Ethnicity,Age,Age Group,Service Years,Tenure Group,Previous Service Years,Total Service Years,I9 Compliance Status,I9 Form Date,Section 1 Completion Date,Section 2 Completion Date,Section 3 Completion Date,Reverification Date,Reverification Required,Document Expiration Date,Tenure,Tenure Track,Academic Rank,Degree Level,Primary Discipline,Student ID,Student Level,Major Field,Enrollment Status,Notes
12345,John,Smith,John Smith,john.smith@university.edu,555-0123,2020-08-15,Active,Faculty,Full-Time,School of Medicine,Academic Affairs,College of Medicine,Omaha Campus,Omaha,Durham Research Center,4023,Associate Professor,FAC-ASSOC,Dr. Sarah Johnson,09876,TRUE,TRUE,FALSE,FALSE,FALSE,FALSE,,95000,,F3,,Monthly,Male,White,38,35-44,3.5,3-5 years,0,3.5,Compliant,2020-08-10,2020-08-10,2020-08-12,,,,FALSE,FALSE,TRUE,Associate Professor,Doctorate,Internal Medicine,,,,,
12346,Maria,Garcia,Maria Garcia,maria.garcia@university.edu,555-0124,2019-01-20,Active,Staff,Full-Time,Student Affairs,Student Affairs,,Omaha Campus,Omaha,Eppley Administration Building,215,Academic Advisor,STF-ADV,Michael Chen,09877,TRUE,FALSE,TRUE,FALSE,FALSE,TRUE,UNMC Staff Union,55000,,S2,,Bi-Weekly,Female,Hispanic,29,25-34,5.2,5-10 years,0,5.2,Compliant,2019-01-15,2019-01-15,2019-01-18,,,,FALSE,,,,,,,,,,
12347,Alex,Johnson,Alex Johnson,alex.johnson@student.university.edu,555-0125,2024-09-01,Active,Student,Part-Time,Library Services,Academic Affairs,,Omaha Campus,Omaha,McGoogan Library,Ground Floor,Student Assistant,STU-ASST,Linda Williams,09878,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,,,15.50,,,Bi-Weekly,Non-Binary,,22,Under 25,0.3,0-1 years,0,0.3,Compliant,2024-08-28,2024-08-28,2024-08-30,,,,FALSE,,,,,,STU789012,Graduate,Library Science,Full-Time,`,
    
    // Legacy aggregate template for backward compatibility
    workforceAggregate: `Reporting Period,BE Faculty,BE Staff,NBE Faculty,NBE Staff,Students,HSR,Location,Headcount,Department,Headcount
6/30/25,650,1100,100,100,310,145,Omaha Campus,1800,School of Medicine,400
,,,,,,,Phoenix Campus,605,College of Arts & Sciences,350`,
    
    turnover: `Metric,Value,Reason,Count,Tenure,Count
Overall Turnover Rate,12.5,Career Advancement,96,< 1 Year,84
Total Departures,240,Compensation,48,1-3 Years,72
Faculty Turnover Rate,8.0,Work-Life Balance,36,3-5 Years,43
Staff Turnover Rate,15.0,Retirement,30,5-10 Years,26`,
    
    compliance: `Metric,Value,Department,Compliance Rate,Issues
Overall Compliance Rate,93.0,School of Medicine,90.0,40
Total Active,2000,Athletics,88.0,10
Compliant,1860,School of Business,91.0,25
Non-Compliant,140,,,`,
    
    recruiting: `Metric,Value,Department,Open Positions,Source,Hires
Open Positions,200,School of Medicine,40,Employee Referral,24
New Hires,80,College of Arts & Sciences,30,Job Boards,20
Time to Fill,45,School of Business,25,LinkedIn,16
Acceptance Rate,75.0,School of Law,15,University Website,12`,
    
    exitSurvey: `Metric,Value,Reason,Count,Category,Score
Response Rate,85.0,Career Growth,82,Compensation,3.1
Total Responses,204,Compensation,45,Benefits,4.0
Overall Satisfaction,3.7,Work-Life Balance,35,Work Life Balance,3.4
Would Recommend,70.0,Management,25,Career Development,3.3`
  };
  
  return templates[dashboardType] || templates.workforce;
};

/**
 * Download CSV template file
 * @param {string} dashboardType - Type of dashboard
 */
export const downloadCSVTemplate = (dashboardType) => {
  const template = generateCSVTemplate(dashboardType);
  const filename = `hr-${dashboardType}-template.csv`;
  
  const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

/**
 * Convert JSON data to CSV format
 * @param {object} jsonData - JSON data to convert
 * @param {string} dashboardType - Type of dashboard
 * @returns {string} CSV string
 */
export const jsonToCSV = (jsonData, dashboardType) => {
  if (!jsonData) return '';
  
  const rows = [];
  
  switch (dashboardType) {
    case 'workforce':
      // Header row
      rows.push(['Metric', 'Value'].join(','));
      
      // Demographics
      if (jsonData.demographics) {
        rows.push(['BE Faculty', jsonData.demographics.beFaculty || 0].join(','));
        rows.push(['BE Staff', jsonData.demographics.beStaff || 0].join(','));
        rows.push(['NBE Faculty', jsonData.demographics.nbeFaculty || 0].join(','));
        rows.push(['NBE Staff', jsonData.demographics.nbeStaff || 0].join(','));
        rows.push(['Students', jsonData.demographics.students || 0].join(','));
        rows.push(['HSR', jsonData.demographics.hsr || 0].join(','));
      }
      
      // Locations
      if (jsonData.byLocation) {
        rows.push(['', ''].join(',')); // Empty row
        rows.push(['Location', 'Headcount'].join(','));
        Object.entries(jsonData.byLocation).forEach(([location, count]) => {
          rows.push([location, count].join(','));
        });
      }
      
      // Departments
      if (jsonData.byDepartment) {
        rows.push(['', ''].join(',')); // Empty row
        rows.push(['Department', 'Headcount'].join(','));
        Object.entries(jsonData.byDepartment).forEach(([dept, count]) => {
          rows.push([dept, count].join(','));
        });
      }
      break;
      
    // Add other dashboard types as needed
    default:
      rows.push(['No CSV format defined for this dashboard type']);
  }
  
  return rows.join('\n');
};

/**
 * Validate CSV data for specific dashboard type
 * @param {array} csvData - Parsed CSV data
 * @param {string} dashboardType - Dashboard type
 * @returns {object} Validation result
 */
export const validateCSVData = (csvData, dashboardType) => {
  const errors = [];
  const warnings = [];
  
  if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
    errors.push('No data found in CSV file');
    return { isValid: false, errors, warnings };
  }
  
  // Dashboard-specific validation
  switch (dashboardType) {
    case 'workforce':
      return validateWorkforceCSVData(csvData, errors, warnings);
      
    // Add validation for other dashboard types
    default:
      warnings.push(`No specific validation rules defined for ${dashboardType} dashboard type`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate workforce CSV data (handles both employee records and aggregate data)
 */
const validateWorkforceCSVData = (csvData, errors, warnings) => {
  const headers = Object.keys(csvData[0] || {});
  const hasEmployeeColumns = headers.includes('Employee ID');
  
  if (hasEmployeeColumns) {
    // Validate individual employee records
    return validateWorkforceEmployeeData(csvData, errors, warnings, headers);
  } else {
    // Validate legacy aggregate data
    return validateWorkforceAggregateData(csvData, errors, warnings, headers);
  }
};

/**
 * Validate individual employee records CSV data
 */
const validateWorkforceEmployeeData = (csvData, errors, warnings, headers) => {
  // Required columns for employee records
  const requiredCols = [
    'Employee ID',
    'First Name', 
    'Last Name',
    'Employee Type',
    'Employment Status',
    'Department'
  ];
  
  // Check for required columns
  requiredCols.forEach(col => {
    if (!headers.includes(col)) {
      errors.push(`Missing required column: ${col}`);
    }
  });
  
  // Validate each employee record
  csvData.forEach((row, index) => {
    const rowNum = index + 1;
    
    // Validate required fields
    if (!row['Employee ID'] || row['Employee ID'].toString().trim() === '') {
      errors.push(`Row ${rowNum}: Employee ID is required`);
    }
    
    if (!row['First Name'] || row['First Name'].toString().trim() === '') {
      warnings.push(`Row ${rowNum}: First Name is missing`);
    }
    
    if (!row['Last Name'] || row['Last Name'].toString().trim() === '') {
      warnings.push(`Row ${rowNum}: Last Name is missing`);
    }
    
    // Validate employee type
    const validEmployeeTypes = ['Faculty', 'Staff', 'Student', 'Contractor', 'Temporary', 'Intern'];
    if (row['Employee Type'] && !validEmployeeTypes.includes(row['Employee Type'])) {
      warnings.push(`Row ${rowNum}: Invalid Employee Type '${row['Employee Type']}'. Valid types: ${validEmployeeTypes.join(', ')}`);
    }
    
    // Validate employment status
    const validStatuses = ['Active', 'Inactive', 'Terminated', 'Leave', 'Suspended'];
    if (row['Employment Status'] && !validStatuses.includes(row['Employment Status'])) {
      warnings.push(`Row ${rowNum}: Invalid Employment Status '${row['Employment Status']}'. Valid statuses: ${validStatuses.join(', ')}`);
    }
    
    // Validate employee class
    const validClasses = ['Full-Time', 'Part-Time', 'Casual', 'Seasonal'];
    if (row['Employee Class'] && !validClasses.includes(row['Employee Class'])) {
      warnings.push(`Row ${rowNum}: Invalid Employee Class '${row['Employee Class']}'. Valid classes: ${validClasses.join(', ')}`);
    }
    
    // Validate campus
    const validCampuses = ['Omaha', 'Phoenix', 'Remote', 'Multiple'];
    if (row['Campus'] && !validCampuses.includes(row['Campus'])) {
      warnings.push(`Row ${rowNum}: Invalid Campus '${row['Campus']}'. Valid campuses: ${validCampuses.join(', ')}`);
    }
    
    // Validate numeric fields
    const numericFields = [
      'Annual Salary', 'Hourly Rate', 'Age', 'Service Years', 
      'Previous Service Years', 'Total Service Years'
    ];
    numericFields.forEach(field => {
      if (row[field] && row[field] !== '' && isNaN(Number(row[field]))) {
        warnings.push(`Row ${rowNum}: ${field} should be a number (got: '${row[field]}')`);
      }
    });
    
    // Validate boolean fields
    const booleanFields = [
      'Benefit Eligible', 'Benefit Eligible Faculty', 'Benefit Eligible Staff',
      'Non-Benefit Eligible Faculty', 'Non-Benefit Eligible Staff', 'Union Member',
      'Reverification Required', 'Tenure', 'Tenure Track'
    ];
    booleanFields.forEach(field => {
      if (row[field] && row[field] !== '') {
        const value = row[field].toString().toLowerCase().trim();
        if (!['true', 'false', 'yes', 'no', '1', '0'].includes(value)) {
          warnings.push(`Row ${rowNum}: ${field} should be true/false, yes/no, or 1/0 (got: '${row[field]}')`);
        }
      }
    });
    
    // Validate email format
    if (row['Email'] && row['Email'] !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row['Email'])) {
        warnings.push(`Row ${rowNum}: Invalid email format '${row['Email']}'`);
      }
    }
    
    // Validate date formats
    const dateFields = [
      'Hire Date', 'I9 Form Date', 'Section 1 Completion Date', 
      'Section 2 Completion Date', 'Section 3 Completion Date',
      'Reverification Date', 'Document Expiration Date'
    ];
    dateFields.forEach(field => {
      if (row[field] && row[field] !== '') {
        const dateValue = new Date(row[field]);
        if (isNaN(dateValue.getTime())) {
          warnings.push(`Row ${rowNum}: Invalid date format in ${field} '${row[field]}'`);
        }
      }
    });
    
    // Validate I-9 compliance status
    const validI9Statuses = ['Compliant', 'Non-Compliant', 'Pending', 'Expired', 'Not Required'];
    if (row['I9 Compliance Status'] && !validI9Statuses.includes(row['I9 Compliance Status'])) {
      warnings.push(`Row ${rowNum}: Invalid I9 Compliance Status '${row['I9 Compliance Status']}'. Valid statuses: ${validI9Statuses.join(', ')}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate legacy aggregate workforce CSV data
 */
const validateWorkforceAggregateData = (csvData, errors, warnings, headers) => {
  // Check for required columns
  const requiredCols = ['BE Faculty', 'BE Staff'];
  requiredCols.forEach(col => {
    if (!headers.includes(col)) {
      errors.push(`Missing required column: ${col}`);
    }
  });
  
  // Validate numeric values
  csvData.forEach((row, index) => {
    const rowNum = index + 1;
    ['BE Faculty', 'BE Staff', 'NBE Faculty', 'NBE Staff', 'Students', 'HSR'].forEach(col => {
      if (row[col] !== undefined && row[col] !== '' && isNaN(Number(row[col]))) {
        warnings.push(`Row ${rowNum}: ${col} should be a number (got: '${row[col]}')`);
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};