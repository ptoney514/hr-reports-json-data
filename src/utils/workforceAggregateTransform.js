/**
 * Workforce Aggregate Data Transformation Utility
 * 
 * Transforms 12 workforce categories from Employee Import Dashboard
 * into the Firebase structure expected by Workforce Analytics
 */

/**
 * Transform Employee Import Dashboard categories to JSON workforce structure
 * @param {Object} summaryStats - Summary statistics from Employee Import Dashboard
 * @param {string} period - Quarter period (e.g., "Q1-2025" or "2025-Q1")
 * @param {string} endDate - The end date for the reporting period
 * @returns {Object} JSON-compatible workforce metrics
 */
export const transformToJsonWorkforceData = (summaryStats, period, endDate) => {
  // Extract the 12 workforce categories
  const {
    beFacultyOmaha = 0,
    beFacultyPhoenix = 0,
    beStaffOmaha = 0,
    beStaffPhoenix = 0,
    hsrOmaha = 0,
    hsrPhoenix = 0,
    studentOmaha = 0,
    studentPhoenix = 0,
    nbeFacultyOmaha = 0,
    nbeStaffOmaha = 0,
    nbeFacultyPhoenix = 0,
    nbeStaffPhoenix = 0,
    schools = [],
    byAssignmentCode = {}
  } = summaryStats;

  // Debug: Log the 12 workforce categories
  console.log('=== 12 Workforce Categories Debug ===');
  console.log('beFacultyOmaha:', beFacultyOmaha);
  console.log('beFacultyPhoenix:', beFacultyPhoenix);
  console.log('beStaffOmaha:', beStaffOmaha);
  console.log('beStaffPhoenix:', beStaffPhoenix);
  console.log('hsrOmaha:', hsrOmaha);
  console.log('hsrPhoenix:', hsrPhoenix);
  console.log('studentOmaha:', studentOmaha);
  console.log('studentPhoenix:', studentPhoenix);
  console.log('nbeFacultyOmaha:', nbeFacultyOmaha);
  console.log('nbeStaffOmaha:', nbeStaffOmaha);
  console.log('nbeFacultyPhoenix:', nbeFacultyPhoenix);
  console.log('nbeStaffPhoenix:', nbeStaffPhoenix);

  // Calculate aggregate totals with null safety
  const beFaculty = (beFacultyOmaha || 0) + (beFacultyPhoenix || 0);
  const nbeFaculty = (nbeFacultyOmaha || 0) + (nbeFacultyPhoenix || 0);
  const beStaff = (beStaffOmaha || 0) + (beStaffPhoenix || 0);
  const nbeStaff = (nbeStaffOmaha || 0) + (nbeStaffPhoenix || 0);
  
  // Students include both regular students and HSR (hourly student researchers)
  const students = (studentOmaha || 0) + (studentPhoenix || 0) + (hsrOmaha || 0) + (hsrPhoenix || 0);

  // Debug: Log the calculated aggregates
  console.log('=== Calculated Aggregates ===');
  console.log('Total BE Faculty:', beFaculty, '(', beFacultyOmaha, '+', beFacultyPhoenix, ')');
  console.log('Total NBE Faculty:', nbeFaculty, '(', nbeFacultyOmaha, '+', nbeFacultyPhoenix, ')');
  console.log('Total BE Staff:', beStaff, '(', beStaffOmaha, '+', beStaffPhoenix, ')');
  console.log('Total NBE Staff:', nbeStaff, '(', nbeStaffOmaha, '+', nbeStaffPhoenix, ')');
  console.log('Total Students:', students, '(', studentOmaha, '+', studentPhoenix, '+', hsrOmaha, '+', hsrPhoenix, ')');
  
  // Calculate location breakdowns with null safety
  const omahaFaculty = (beFacultyOmaha || 0) + (nbeFacultyOmaha || 0);
  const omahaStaff = (beStaffOmaha || 0) + (nbeStaffOmaha || 0) + (hsrOmaha || 0);
  const omahaStudents = studentOmaha || 0;
  
  const phoenixFaculty = (beFacultyPhoenix || 0) + (nbeFacultyPhoenix || 0);
  const phoenixStaff = (beStaffPhoenix || 0) + (nbeStaffPhoenix || 0) + (hsrPhoenix || 0);
  const phoenixStudents = studentPhoenix || 0;
  
  // Calculate totals with null safety
  const totalFaculty = beFaculty + nbeFaculty;
  const totalStaff = beStaff + nbeStaff + (hsrOmaha || 0) + (hsrPhoenix || 0);
  const totalEmployees = totalFaculty + totalStaff + students;
  
  // Calculate Omaha and Phoenix totals
  const omahaTotal = omahaFaculty + omahaStaff + omahaStudents;
  const phoenixTotal = phoenixFaculty + phoenixStaff + phoenixStudents;
  
  // Calculate percentages
  const omahaPercentage = totalEmployees > 0 ? (omahaTotal / totalEmployees) * 100 : 0;
  const phoenixPercentage = totalEmployees > 0 ? (phoenixTotal / totalEmployees) * 100 : 0;

  // Normalize period format to JSON standard (2025-Q1)
  const normalizedPeriod = normalizePeriodFormat(period);

  // Create the JSON-compatible data structure
  const jsonData = {
    // Core metrics
    totalEmployees,
    period: normalizedPeriod,
    endDate,
    reportingPeriod: normalizedPeriod,
    
    // Demographics breakdown
    demographics: {
      // BE/NBE Faculty breakdown
      beFaculty,
      nbeFaculty,
      faculty: totalFaculty,
      
      // BE/NBE Staff breakdown  
      beStaff,
      nbeStaff,
      staff: totalStaff,
      
      // Students (always NBE)
      students,
      nbeStudents: students,
      
      // Traditional totals for backwards compatibility
      totalFaculty,
      totalStaff
    },
    
    // Location breakdown
    byLocation: {
      omaha: {
        name: 'Omaha',
        total: omahaTotal,
        percentage: omahaPercentage,
        breakdown: {
          faculty: omahaFaculty,
          staff: omahaStaff,
          students: omahaStudents
        }
      },
      phoenix: {
        name: 'Phoenix', 
        total: phoenixTotal,
        percentage: phoenixPercentage,
        breakdown: {
          faculty: phoenixFaculty,
          staff: phoenixStaff,
          students: phoenixStudents
        }
      }
    },
    
    // Department/Division breakdown
    byDepartment: schools.reduce((acc, school) => {
      if (school.school && school.school !== 'Unknown') {
        acc[school.school] = {
          name: school.school,
          total: school.total || 0,
          faculty: school.faculty || 0,
          staff: school.staff || 0,
          percentage: totalEmployees > 0 ? ((school.total || 0) / totalEmployees) * 100 : 0
        };
      }
      return acc;
    }, {}),
    
    // Direct fields for QuarterlyDataTable compatibility
    omahaFaculty,
    omahaStaff,
    omahaStudents,
    phoenixFaculty,
    phoenixStaff,
    phoenixStudents,
    
    // Trends data (placeholder - would need historical data for actual calculations)
    trends: {
      newHires: {
        faculty: 0,
        staff: 0,
        students: 0
      },
      departures: {
        faculty: 0,
        staff: 0,
        students: 0
      },
      // Placeholder turnover data by location and benefit eligibility
      turnoverBeFacultyOmaha: 0,
      turnoverBeStaffOmaha: 0,
      turnoverBeFacultyPhoenix: 0,
      turnoverBeStaffPhoenix: 0
    },
    
    // Additional metrics for analytics
    metrics: {
      bePercentage: totalEmployees > 0 ? ((beFaculty + beStaff) / totalEmployees) * 100 : 0,
      nbePercentage: totalEmployees > 0 ? ((nbeFaculty + nbeStaff + students) / totalEmployees) * 100 : 0,
      facultyPercentage: totalEmployees > 0 ? (totalFaculty / totalEmployees) * 100 : 0,
      staffPercentage: totalEmployees > 0 ? (totalStaff / totalEmployees) * 100 : 0,
      studentPercentage: totalEmployees > 0 ? (students / totalEmployees) * 100 : 0
    },
    
    // Metadata
    metadata: {
      dataSource: 'Employee Import Dashboard',
      importMethod: 'aggregate',
      version: '2.0',
      lastUpdated: new Date().toISOString(),
      importedAt: new Date().toISOString(),
      categories: {
        beFacultyOmaha,
        beFacultyPhoenix,
        beStaffOmaha,
        beStaffPhoenix,
        hsrOmaha,
        hsrPhoenix,
        studentOmaha,
        studentPhoenix,
        nbeFacultyOmaha,
        nbeStaffOmaha,
        nbeFacultyPhoenix,
        nbeStaffPhoenix
      }
    }
  };

  // Debug: Log the final JSON data structure
  console.log('=== Final JSON Data Structure ===');
  console.log('Period:', jsonData.period);
  console.log('Total Employees:', jsonData.totalEmployees);
  console.log('Demographics:', {
    beFaculty: jsonData.demographics.beFaculty,
    beStaff: jsonData.demographics.beStaff,
    students: jsonData.demographics.students,
    nbeFaculty: jsonData.demographics.nbeFaculty,
    nbeStaff: jsonData.demographics.nbeStaff
  });
  console.log('Direct fields for QuarterlyDataTable:', {
    omahaFaculty: jsonData.omahaFaculty,
    omahaStaff: jsonData.omahaStaff,
    omahaStudents: jsonData.omahaStudents,
    phoenixFaculty: jsonData.phoenixFaculty,
    phoenixStaff: jsonData.phoenixStaff,
    phoenixStudents: jsonData.phoenixStudents
  });

  return jsonData;
};

/**
 * Normalize period format to JSON standard
 * @param {string} period - Period in various formats
 * @returns {string} Normalized period (2025-Q1 format)
 */
export const normalizePeriodFormat = (period) => {
  if (!period) return '';
  
  // Handle Q1-2025 format → 2025-Q1
  if (period.match(/^Q\d-\d{4}$/)) {
    return period.replace(/^Q(\d)-(\d{4})$/, '$2-Q$1');
  }
  
  // Handle 2025-Q1 format (already correct)
  if (period.match(/^\d{4}-Q\d$/)) {
    return period;
  }
  
  // Default return as-is
  return period;
};

/**
 * Convert end date to quarter period based on fiscal quarters
 * @param {string} endDate - End date (e.g., "6/30/2025")
 * @returns {string} Quarter period (e.g., "2025-Q2")
 */
export const endDateToQuarterPeriod = (endDate) => {
  if (!endDate) return '';
  
  try {
    // Handle various date formats
    let date;
    if (endDate.includes('/')) {
      // Parse MM/DD/YYYY or M/DD/YY format
      const parts = endDate.split('/');
      if (parts.length === 3) {
        const month = parseInt(parts[0], 10);
        const day = parseInt(parts[1], 10);
        let year = parseInt(parts[2], 10);
        
        // Handle 2-digit years: assume 00-30 = 2000-2030, 31-99 = 1931-1999
        if (year < 100) {
          if (year <= 30) {
            year += 2000; // 00-30 -> 2000-2030
          } else {
            year += 1900; // 31-99 -> 1931-1999
          }
        }
        
        date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
        console.log(`Date parsing: ${endDate} -> Month: ${month}, Day: ${day}, Year: ${year} (corrected from ${parts[2]})`);
      } else {
        date = new Date(endDate);
      }
    } else {
      date = new Date(endDate);
    }
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() is 0-indexed
    const day = date.getDate();
    
    console.log(`Converting date: ${endDate} -> Year: ${year}, Month: ${month}, Day: ${day}`);
    
    let quarter;
    // Based on fiscal quarter end dates: Q1=3/31, Q2=6/30, Q3=9/30, Q4=12/31
    if (month <= 3) {
      quarter = 'Q1';
    } else if (month <= 6) {
      quarter = 'Q2';
    } else if (month <= 9) {
      quarter = 'Q3';
    } else {
      quarter = 'Q4';
    }
    
    const result = `${year}-${quarter}`;
    console.log(`Date conversion result: ${endDate} -> ${result}`);
    
    return result;
  } catch (error) {
    console.error('Error converting end date to quarter period:', error);
    return '';
  }
};

/**
 * Validate workforce data structure
 * @param {Object} data - Workforce data to validate
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export const validateWorkforceData = (data) => {
  const errors = [];
  
  console.log('=== Validating workforce data ===');
  console.log('Data keys:', Object.keys(data || {}));
  
  // Check if data exists
  if (!data || typeof data !== 'object') {
    errors.push('Invalid data: data must be an object');
    return { isValid: false, errors };
  }
  
  // Required fields with type checking
  const requiredFields = [
    { field: 'totalEmployees', type: 'number' },
    { field: 'period', type: 'string' },
    { field: 'demographics', type: 'object' }
  ];
  
  requiredFields.forEach(({ field, type }) => {
    if (data[field] === undefined || data[field] === null) {
      errors.push(`Missing required field: ${field}`);
    } else if (typeof data[field] !== type) {
      errors.push(`Invalid type for ${field}: expected ${type}, got ${typeof data[field]}`);
    }
  });
  
  // Validate demographics structure with null checking
  if (data.demographics && typeof data.demographics === 'object') {
    const requiredDemographics = ['beFaculty', 'nbeFaculty', 'beStaff', 'nbeStaff', 'students'];
    requiredDemographics.forEach(field => {
      const value = data.demographics[field];
      if (value === undefined || value === null) {
        errors.push(`Missing demographics field: ${field}`);
      } else if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`Invalid demographics field ${field}: expected number, got ${typeof value} (${value})`);
      }
    });
  }
  
  // Validate location structure
  if (data.byLocation) {
    ['omaha', 'phoenix'].forEach(location => {
      if (data.byLocation[location] && !data.byLocation[location].breakdown) {
        errors.push(`Missing breakdown for location: ${location}`);
      }
    });
  }
  
  // Validate totals match - use the actual totals from demographics
  if (data.demographics) {
    // Use the computed totals that include HSR properly
    const calculatedTotal = (data.demographics.totalFaculty || 0) + 
                          (data.demographics.totalStaff || 0) + 
                          (data.demographics.students || 0);
    
    console.log('Validation check:');
    console.log('  Total Faculty:', data.demographics.totalFaculty);
    console.log('  Total Staff (includes HSR):', data.demographics.totalStaff);
    console.log('  Students:', data.demographics.students);
    console.log('  Calculated Total:', calculatedTotal);
    console.log('  Reported Total:', data.totalEmployees);
    
    if (Math.abs(calculatedTotal - data.totalEmployees) > 0.01) {
      errors.push(`Total employees mismatch: calculated ${calculatedTotal}, reported ${data.totalEmployees}`);
    } else {
      console.log('✅ Validation passed: totals match');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  transformToJsonWorkforceData,
  normalizePeriodFormat,
  endDateToQuarterPeriod,
  validateWorkforceData
};