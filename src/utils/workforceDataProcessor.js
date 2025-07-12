import { format, parseISO, startOfMonth, endOfMonth, subMonths, differenceInMonths, differenceInYears } from 'date-fns';

/**
 * Workforce Data Processor
 * Transforms individual employee records into dashboard-ready metrics
 */

// Expected column mappings for aggregate data parsing
const COLUMN_MAPPINGS = {
  quarterEndDate: ['quarter_end_date', 'quarter_date', 'end_date', 'date'],
  division: ['division', 'div', 'division_name', 'college', 'school'],
  location: ['location', 'campus', 'site', 'office'],
  beFacultyHeadcount: ['be_faculty_headcount', 'faculty_be', 'faculty_benefit_eligible'],
  beStaffHeadcount: ['be_staff_headcount', 'staff_be', 'staff_benefit_eligible'],
  nbeFacultyHeadcount: ['nbe_faculty_headcount', 'faculty_nbe', 'faculty_non_benefit'],
  nbeStaffHeadcount: ['nbe_staff_headcount', 'staff_nbe', 'staff_non_benefit'],
  nbeStudentHeadcount: ['nbe_student_worker_headcount', 'student_workers', 'students'],
  totalHeadcount: ['total_headcount', 'total', 'headcount_total'],
  beNewHires: ['be_new_hires', 'new_hires_be', 'be_hires'],
  beDepartures: ['be_departures', 'departures_be', 'be_separations'],
  nbeNewHires: ['nbe_new_hires', 'new_hires_nbe', 'nbe_hires'],
  nbeDepartures: ['nbe_departures', 'departures_nbe', 'nbe_separations']
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
 * Detect percentage change columns that should not be uploaded
 */
export const detectPercentageChangeColumns = (headers) => {
  const percentageChangePatterns = [
    'percentage_change', 'percent_change', 'pct_change', 'change_pct',
    'employee_change', 'faculty_change', 'staff_change', 'headcount_change',
    'growth_rate', 'change_rate', 'quarterly_growth', 'quarter_change',
    'total_change', 'workforce_change', 'yoy_change', 'qoq_change'
  ];
  
  const normalizedHeaders = headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, '_'));
  const detectedColumns = [];
  
  normalizedHeaders.forEach((header, index) => {
    for (const pattern of percentageChangePatterns) {
      if (header.includes(pattern) || pattern.includes(header)) {
        detectedColumns.push(headers[index]);
        break;
      }
    }
  });
  
  return detectedColumns;
};

/**
 * Normalize and clean aggregate data
 */
export const normalizeAggregateData = (rawData, columnMapping) => {
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
          case 'quarterEndDate':
            normalized.quarterEndDate = parseDate(value);
            break;
          case 'division':
            normalized.division = value || 'Unknown Division';
            break;
          case 'location':
            normalized.location = value || 'Unknown Location';
            break;
          case 'beFacultyHeadcount':
          case 'beStaffHeadcount':
          case 'nbeFacultyHeadcount':
          case 'nbeStaffHeadcount':
          case 'nbeStudentHeadcount':
          case 'totalHeadcount':
          case 'beNewHires':
          case 'beDepartures':
          case 'nbeNewHires':
          case 'nbeDepartures':
            normalized[standardField] = parseInt(value, 10) || 0;
            break;
        }
      }
    });
    
    return normalized;
  }).filter(record => record.division && record.location); // Filter out rows without required fields
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


/**
 * Generate workforce dashboard metrics from aggregate data
 */
export const generateWorkforceMetrics = (aggregateData, selectedQuarter = null) => {
  // Filter to selected quarter if specified
  const quarterData = selectedQuarter 
    ? aggregateData.filter(record => {
        const quarterDate = format(record.quarterEndDate, 'yyyy-MM-dd');
        return quarterDate === selectedQuarter;
      })
    : aggregateData;
  
  // Calculate totals from aggregate data
  const totalEmployees = quarterData.reduce((sum, record) => sum + (record.totalHeadcount || 0), 0);
  const faculty = quarterData.reduce((sum, record) => sum + (record.beFacultyHeadcount || 0) + (record.nbeFacultyHeadcount || 0), 0);
  const staff = quarterData.reduce((sum, record) => sum + (record.beStaffHeadcount || 0) + (record.nbeStaffHeadcount || 0), 0);
  const students = quarterData.reduce((sum, record) => sum + (record.nbeStudentHeadcount || 0), 0);
  const newHires = quarterData.reduce((sum, record) => sum + (record.beNewHires || 0) + (record.nbeNewHires || 0), 0);
  const departures = quarterData.reduce((sum, record) => sum + (record.beDepartures || 0) + (record.nbeDepartures || 0), 0);
  
  // Generate charts from aggregate data
  const topDivisions = generateDivisionAnalysisFromAggregate(quarterData);
  const locationDistribution = generateLocationAnalysisFromAggregate(quarterData);
  const historicalTrends = generateHistoricalTrendsFromAggregate(aggregateData);
  
  return {
    summary: {
      totalEmployees,
      faculty,
      staff,
      students,
      newHires,
      departures,
      netChange: newHires - departures
    },
    charts: {
      historicalTrends,
      topDivisions,
      locationDistribution
    }
  };
};


/**
 * Generate historical trends from aggregate data
 */
const generateHistoricalTrendsFromAggregate = (aggregateData) => {
  const quarterTotals = {};
  
  aggregateData.forEach(record => {
    const quarterKey = format(record.quarterEndDate, 'yyyy-MM-dd');
    if (!quarterTotals[quarterKey]) {
      quarterTotals[quarterKey] = {
        quarter: quarterKey,
        total: 0,
        faculty: 0,
        staff: 0,
        students: 0
      };
    }
    
    quarterTotals[quarterKey].total += (record.totalHeadcount || 0);
    quarterTotals[quarterKey].faculty += (record.beFacultyHeadcount || 0) + (record.nbeFacultyHeadcount || 0);
    quarterTotals[quarterKey].staff += (record.beStaffHeadcount || 0) + (record.nbeStaffHeadcount || 0);
    quarterTotals[quarterKey].students += (record.nbeStudentHeadcount || 0);
  });
  
  return Object.values(quarterTotals).sort((a, b) => new Date(a.quarter) - new Date(b.quarter));
};


/**
 * Generate division analysis from aggregate data
 */
const generateDivisionAnalysisFromAggregate = (aggregateData) => {
  const divisionCounts = {};
  
  aggregateData.forEach(record => {
    const division = record.division || 'Unknown Division';
    if (!divisionCounts[division]) {
      divisionCounts[division] = { faculty: 0, staff: 0, students: 0, total: 0 };
    }
    
    divisionCounts[division].faculty += (record.beFacultyHeadcount || 0) + (record.nbeFacultyHeadcount || 0);
    divisionCounts[division].staff += (record.beStaffHeadcount || 0) + (record.nbeStaffHeadcount || 0);
    divisionCounts[division].students += (record.nbeStudentHeadcount || 0);
    divisionCounts[division].total += (record.totalHeadcount || 0);
  });
  
  return Object.entries(divisionCounts)
    .map(([name, counts]) => ({ name, ...counts }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
};

/**
 * Generate location analysis from aggregate data
 */
const generateLocationAnalysisFromAggregate = (aggregateData) => {
  const locationCounts = {};
  
  aggregateData.forEach(record => {
    const location = record.location || 'Unknown Location';
    if (!locationCounts[location]) {
      locationCounts[location] = { faculty: 0, staff: 0, students: 0, total: 0 };
    }
    
    locationCounts[location].faculty += (record.beFacultyHeadcount || 0) + (record.nbeFacultyHeadcount || 0);
    locationCounts[location].staff += (record.beStaffHeadcount || 0) + (record.nbeStaffHeadcount || 0);
    locationCounts[location].students += (record.nbeStudentHeadcount || 0);
    locationCounts[location].total += (record.totalHeadcount || 0);
  });
  
  const totalEmployees = Object.values(locationCounts).reduce((sum, counts) => sum + counts.total, 0);
  
  return Object.entries(locationCounts).map(([name, counts]) => ({
    name,
    ...counts,
    percentage: totalEmployees > 0 ? ((counts.total / totalEmployees) * 100).toFixed(1) : '0'
  }));
};



/**
 * Validate and prepare aggregate data for import
 */
export const validateWorkforceData = (data, originalHeaders = []) => {
  const errors = [];
  const warnings = [];
  
  if (!Array.isArray(data) || data.length === 0) {
    errors.push('No valid data rows found');
    return { isValid: false, errors, warnings };
  }
  
  // Check for percentage change columns that should not be uploaded
  if (originalHeaders && originalHeaders.length > 0) {
    const percentageChangeColumns = detectPercentageChangeColumns(originalHeaders);
    if (percentageChangeColumns.length > 0) {
      warnings.push(
        `⚠️ Percentage change columns detected and ignored: ${percentageChangeColumns.join(', ')}. ` +
        `Percentage changes are calculated automatically based on quarter-to-quarter comparisons.`
      );
    }
  }
  
  // Check for required fields
  const requiredFields = ['division', 'location', 'quarterEndDate'];
  const missingRequiredFields = [];
  
  data.forEach((record, index) => {
    requiredFields.forEach(field => {
      if (!record[field]) {
        missingRequiredFields.push(`Row ${index + 1}: Missing ${field}`);
      }
    });
  });
  
  if (missingRequiredFields.length > 0) {
    errors.push(...missingRequiredFields.slice(0, 10));
    if (missingRequiredFields.length > 10) {
      errors.push(`... and ${missingRequiredFields.length - 10} more missing required fields`);
    }
  }
  
  // Data quality warnings
  const invalidHeadcounts = data.filter(record => 
    (record.totalHeadcount || 0) < 0 ||
    (record.beFacultyHeadcount || 0) < 0 ||
    (record.beStaffHeadcount || 0) < 0
  ).length;
  
  if (invalidHeadcounts > 0) {
    warnings.push(`${invalidHeadcounts} records have negative headcount values`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalRows: data.length,
      validRows: data.filter(record => record.division && record.location).length,
      invalidHeadcounts,
      percentageChangeColumnsDetected: originalHeaders ? detectPercentageChangeColumns(originalHeaders).length : 0
    }
  };
};


export default {
  mapColumns,
  normalizeAggregateData,
  generateWorkforceMetrics,
  validateWorkforceData
};