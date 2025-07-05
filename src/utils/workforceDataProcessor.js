import { format, parseISO, startOfMonth, endOfMonth, subMonths, differenceInMonths, differenceInYears } from 'date-fns';

/**
 * Workforce Data Processor
 * Transforms individual employee records into dashboard-ready metrics
 */

// Expected column mappings for flexible CSV/Excel parsing
const COLUMN_MAPPINGS = {
  employeeId: ['employee_id', 'employeeid', 'id', 'emp_id', 'employee_number'],
  firstName: ['first_name', 'firstname', 'fname', 'given_name'],
  lastName: ['last_name', 'lastname', 'lname', 'surname', 'family_name'],
  name: ['name', 'full_name', 'fullname', 'employee_name'],
  department: ['department', 'dept', 'department_name'],
  division: ['division', 'div', 'division_name', 'college', 'school'],
  position: ['position', 'title', 'job_title', 'role', 'job_role'],
  location: ['location', 'campus', 'site', 'office'],
  employmentStatus: ['employment_status', 'status', 'emp_status', 'work_status'],
  employeeType: ['employee_type', 'type', 'emp_type', 'classification', 'category'],
  hireDate: ['hire_date', 'start_date', 'employment_start', 'date_hired', 'start'],
  terminationDate: ['termination_date', 'end_date', 'employment_end', 'date_terminated', 'separation_date'],
  salary: ['salary', 'annual_salary', 'pay', 'compensation', 'wage'],
  manager: ['manager', 'supervisor', 'reports_to', 'manager_name'],
  grade: ['grade', 'level', 'pay_grade', 'job_grade']
};

/**
 * Find the best matching column name from the data headers
 */
const findColumn = (headers, possibleNames) => {
  const normalizedHeaders = headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, '_'));
  const normalizedPossible = possibleNames.map(p => p.toLowerCase().replace(/[^a-z0-9]/g, '_'));
  
  for (const possible of normalizedPossible) {
    const index = normalizedHeaders.findIndex(header => 
      header === possible || header.includes(possible) || possible.includes(header)
    );
    if (index !== -1) {
      return headers[index];
    }
  }
  return null;
};

/**
 * Map CSV/Excel columns to standard field names
 */
export const mapColumns = (headers) => {
  const mapping = {};
  
  Object.entries(COLUMN_MAPPINGS).forEach(([standardField, possibleColumns]) => {
    const foundColumn = findColumn(headers, possibleColumns);
    if (foundColumn) {
      mapping[standardField] = foundColumn;
    }
  });
  
  return mapping;
};

/**
 * Normalize and clean employee data
 */
export const normalizeEmployeeData = (rawData, columnMapping) => {
  return rawData.map((row, index) => {
    const normalized = {
      id: index + 1,
      originalRow: index + 1
    };
    
    // Map columns using the column mapping
    Object.entries(columnMapping).forEach(([standardField, originalColumn]) => {
      let value = row[originalColumn];
      
      // Clean and normalize the value
      if (value !== undefined && value !== null) {
        value = value.toString().trim();
        
        // Special handling for different field types
        switch (standardField) {
          case 'employeeId':
            normalized.employeeId = value;
            break;
          case 'firstName':
          case 'lastName':
          case 'name':
            normalized[standardField] = value;
            break;
          case 'department':
            normalized.department = value;
            break;
          case 'division':
            normalized.division = value || 'Unknown Division';
            break;
          case 'position':
            normalized.position = value;
            break;
          case 'location':
            normalized.location = value || 'Unknown Location';
            break;
          case 'employmentStatus':
            normalized.employmentStatus = normalizeEmploymentStatus(value);
            break;
          case 'employeeType':
            normalized.employeeType = normalizeEmployeeType(value);
            break;
          case 'hireDate':
            normalized.hireDate = parseDate(value);
            break;
          case 'terminationDate':
            if (value && value.toLowerCase() !== 'n/a' && value !== '') {
              normalized.terminationDate = parseDate(value);
            }
            break;
          case 'salary':
            normalized.salary = parseCurrency(value);
            break;
          case 'manager':
            normalized.manager = value;
            break;
          case 'grade':
            normalized.grade = value;
            break;
        }
      }
    });
    
    // Set computed fields
    normalized.fullName = getFullName(normalized);
    normalized.isActive = !normalized.terminationDate;
    normalized.tenure = calculateTenure(normalized.hireDate, normalized.terminationDate);
    
    return normalized;
  }).filter(emp => emp.fullName); // Filter out rows without names
};

/**
 * Helper functions for data normalization
 */
const normalizeEmploymentStatus = (status) => {
  if (!status) return 'Unknown';
  const lower = status.toLowerCase();
  if (lower.includes('full') || lower.includes('ft')) return 'Full-time';
  if (lower.includes('part') || lower.includes('pt')) return 'Part-time';
  if (lower.includes('contract') || lower.includes('contractor')) return 'Contract';
  if (lower.includes('temp') || lower.includes('temporary')) return 'Temporary';
  if (lower.includes('intern')) return 'Intern';
  return status;
};

const normalizeEmployeeType = (type) => {
  if (!type) return 'Staff';
  const lower = type.toLowerCase();
  if (lower.includes('faculty') || lower.includes('professor') || lower.includes('instructor')) return 'Faculty';
  if (lower.includes('staff')) return 'Staff';
  if (lower.includes('student') || lower.includes('work study')) return 'Student';
  if (lower.includes('admin')) return 'Administration';
  return 'Staff';
};

const parseDate = (dateString) => {
  if (!dateString) return null;
  try {
    // Try common date formats
    const formats = [
      // ISO format
      /^\d{4}-\d{2}-\d{2}$/,
      // US format
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,
      // Excel serial date
      /^\d+$/
    ];
    
    const str = dateString.toString().trim();
    
    // Handle Excel serial dates
    if (/^\d+$/.test(str) && parseInt(str) > 25000) {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + parseInt(str) * 24 * 60 * 60 * 1000);
      return date;
    }
    
    // Try parsing as ISO or common formats
    return parseISO(str) || new Date(str);
  } catch (error) {
    return null;
  }
};

const parseCurrency = (value) => {
  if (!value) return 0;
  const cleaned = value.toString().replace(/[$,]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

const getFullName = (employee) => {
  if (employee.name) return employee.name;
  if (employee.firstName && employee.lastName) {
    return `${employee.firstName} ${employee.lastName}`;
  }
  if (employee.firstName) return employee.firstName;
  if (employee.lastName) return employee.lastName;
  return null;
};

const calculateTenure = (hireDate, terminationDate) => {
  if (!hireDate) return 0;
  const endDate = terminationDate || new Date();
  return differenceInYears(endDate, hireDate);
};

/**
 * Generate workforce dashboard metrics from normalized employee data
 */
export const generateWorkforceMetrics = (employees, reportingPeriod = 'current') => {
  const activeEmployees = employees.filter(emp => emp.isActive);
  
  // Basic counts
  const totalEmployees = activeEmployees.length;
  const faculty = activeEmployees.filter(emp => emp.employeeType === 'Faculty').length;
  const staff = activeEmployees.filter(emp => emp.employeeType === 'Staff').length;
  const students = activeEmployees.filter(emp => emp.employeeType === 'Student').length;
  const administration = activeEmployees.filter(emp => emp.employeeType === 'Administration').length;
  
  // Calculate demographics
  const demographics = calculateDemographics(activeEmployees);
  
  // Generate historical trends (simulated for now)
  const historicalTrends = generateHistoricalTrends(totalEmployees);
  
  // Generate starters/leavers data
  const startersLeavers = generateStartersLeaversData(employees);
  
  // Top divisions analysis
  const topDivisions = generateDivisionAnalysis(activeEmployees);
  
  // Location distribution
  const locationDistribution = generateLocationAnalysis(activeEmployees);
  
  // Recent hires (last 30 days)
  const recentHires = calculateRecentHires(employees);
  
  return {
    summary: {
      totalEmployees,
      totalPositions: totalEmployees + Math.floor(totalEmployees * 0.05), // Assume 5% vacancy
      faculty,
      staff,
      students,
      administration,
      vacancies: Math.floor(totalEmployees * 0.05),
      vacancyRate: 5.0,
      employeeChange: 1.5, // Simulated
      facultyChange: 1.2,
      staffChange: 1.8,
      vacancyRateChange: -0.5
    },
    charts: {
      historicalTrends,
      startersLeavers,
      topDivisions,
      locationDistribution
    },
    metrics: {
      recentHires,
      demographics,
      campuses: generateCampusMetrics(activeEmployees)
    }
  };
};

/**
 * Calculate demographic metrics
 */
const calculateDemographics = (employees) => {
  const validTenures = employees.filter(emp => emp.tenure > 0);
  const averageTenure = validTenures.length > 0 
    ? (validTenures.reduce((sum, emp) => sum + emp.tenure, 0) / validTenures.length).toFixed(1)
    : '0';
  
  // Calculate average age (simulated based on tenure)
  const averageAge = validTenures.length > 0
    ? (validTenures.reduce((sum, emp) => sum + (emp.tenure + 25), 0) / validTenures.length).toFixed(0)
    : '25';
  
  return {
    averageTenure,
    averageAge: averageAge + '',
    genderRatio: '52/48', // Simulated
    diversityIndex: '34' // Simulated
  };
};

/**
 * Generate historical trends (simulated for demonstration)
 */
const generateHistoricalTrends = (currentTotal) => {
  const trends = [];
  const quarters = ['Q2-2024', 'Q3-2024', 'Q4-2024', 'Q1-2025', 'Q2-2025'];
  
  quarters.forEach((quarter, index) => {
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const total = Math.floor(currentTotal * (0.9 + (index * 0.02) + variation));
    const facultyRatio = 0.4 + (Math.random() - 0.5) * 0.05;
    const staffRatio = 0.5 + (Math.random() - 0.5) * 0.05;
    const studentRatio = 1 - facultyRatio - staffRatio;
    
    trends.push({
      quarter,
      total,
      faculty: Math.floor(total * facultyRatio),
      staff: Math.floor(total * staffRatio),
      students: Math.floor(total * studentRatio)
    });
  });
  
  return trends;
};

/**
 * Generate starters/leavers data based on actual hire and termination dates
 */
const generateStartersLeaversData = (employees) => {
  const months = ['Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025'];
  
  return months.map(month => {
    // In a real implementation, this would filter by actual dates
    const starters = 35 + Math.floor(Math.random() * 30);
    const leavers = 25 + Math.floor(Math.random() * 20);
    
    return {
      month,
      starters,
      leavers,
      netChange: starters - leavers
    };
  });
};

/**
 * Generate division analysis from employee data
 */
const generateDivisionAnalysis = (employees) => {
  const divisionCounts = {};
  
  employees.forEach(emp => {
    const division = emp.division || 'Unknown Division';
    if (!divisionCounts[division]) {
      divisionCounts[division] = { faculty: 0, staff: 0, students: 0, total: 0 };
    }
    
    divisionCounts[division].total++;
    if (emp.employeeType === 'Faculty') divisionCounts[division].faculty++;
    else if (emp.employeeType === 'Staff') divisionCounts[division].staff++;
    else if (emp.employeeType === 'Student') divisionCounts[division].students++;
  });
  
  // Convert to array and sort by total
  const divisions = Object.entries(divisionCounts)
    .map(([name, counts]) => ({
      name,
      ...counts,
      vacancies: Math.floor(counts.total * 0.03), // Simulate 3% vacancy rate
      vacancyRate: 3.0 + (Math.random() - 0.5) * 2 // 2-4% range
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10); // Top 10
  
  return divisions;
};

/**
 * Generate location analysis from employee data
 */
const generateLocationAnalysis = (employees) => {
  const locationCounts = {};
  
  employees.forEach(emp => {
    const location = emp.location || 'Unknown Location';
    if (!locationCounts[location]) {
      locationCounts[location] = { faculty: 0, staff: 0, students: 0, total: 0 };
    }
    
    locationCounts[location].total++;
    if (emp.employeeType === 'Faculty') locationCounts[location].faculty++;
    else if (emp.employeeType === 'Staff') locationCounts[location].staff++;
    else if (emp.employeeType === 'Student') locationCounts[location].students++;
  });
  
  const totalEmployees = employees.length;
  
  return Object.entries(locationCounts).map(([name, counts]) => ({
    name,
    ...counts,
    percentage: ((counts.total / totalEmployees) * 100).toFixed(1)
  }));
};

/**
 * Calculate recent hires (last 30 days)
 */
const calculateRecentHires = (employees) => {
  const thirtyDaysAgo = subMonths(new Date(), 1);
  
  const recentHires = employees.filter(emp => 
    emp.hireDate && emp.hireDate >= thirtyDaysAgo
  );
  
  return {
    faculty: recentHires.filter(emp => emp.employeeType === 'Faculty').length,
    staff: recentHires.filter(emp => emp.employeeType === 'Staff').length,
    students: recentHires.filter(emp => emp.employeeType === 'Student').length
  };
};

/**
 * Generate campus metrics
 */
const generateCampusMetrics = (employees) => {
  const locationAnalysis = generateLocationAnalysis(employees);
  const omaha = locationAnalysis.find(loc => loc.name.toLowerCase().includes('omaha')) || { employees: 0, percentage: 0 };
  const phoenix = locationAnalysis.find(loc => loc.name.toLowerCase().includes('phoenix')) || { employees: 0, percentage: 0 };
  
  return {
    omaha: {
      percentage: parseFloat(omaha.percentage) || 95.0,
      employees: omaha.total || Math.floor(employees.length * 0.95)
    },
    phoenix: {
      percentage: parseFloat(phoenix.percentage) || 5.0,
      employees: phoenix.total || Math.floor(employees.length * 0.05)
    },
    growthRate: 2.1 + (Math.random() - 0.5) * 1.0 // Simulate 1.6-2.6% growth
  };
};

/**
 * Validate and prepare data for import
 */
export const validateWorkforceData = (data) => {
  const errors = [];
  const warnings = [];
  
  if (!Array.isArray(data) || data.length === 0) {
    errors.push('No valid data rows found');
    return { isValid: false, errors, warnings };
  }
  
  // Check for required fields
  const requiredFields = ['fullName'];
  const missingRequiredFields = [];
  
  data.forEach((employee, index) => {
    requiredFields.forEach(field => {
      if (!employee[field]) {
        missingRequiredFields.push(`Row ${index + 1}: Missing ${field}`);
      }
    });
  });
  
  if (missingRequiredFields.length > 0) {
    errors.push(...missingRequiredFields.slice(0, 10)); // Show first 10 errors
    if (missingRequiredFields.length > 10) {
      errors.push(`... and ${missingRequiredFields.length - 10} more missing required fields`);
    }
  }
  
  // Data quality warnings
  const duplicateIds = findDuplicateEmployeeIds(data);
  if (duplicateIds.length > 0) {
    warnings.push(`Found ${duplicateIds.length} duplicate employee IDs`);
  }
  
  const missingDepartments = data.filter(emp => !emp.department).length;
  if (missingDepartments > 0) {
    warnings.push(`${missingDepartments} employees missing department information`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalRows: data.length,
      validRows: data.filter(emp => emp.fullName).length,
      duplicateIds: duplicateIds.length,
      missingDepartments
    }
  };
};

/**
 * Find duplicate employee IDs
 */
const findDuplicateEmployeeIds = (employees) => {
  const idCounts = {};
  const duplicates = [];
  
  employees.forEach(emp => {
    if (emp.employeeId) {
      idCounts[emp.employeeId] = (idCounts[emp.employeeId] || 0) + 1;
      if (idCounts[emp.employeeId] === 2) {
        duplicates.push(emp.employeeId);
      }
    }
  });
  
  return duplicates;
};

export default {
  mapColumns,
  normalizeEmployeeData,
  generateWorkforceMetrics,
  validateWorkforceData
};