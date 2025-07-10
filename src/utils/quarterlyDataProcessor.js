/**
 * Quarterly Data Processor
 * Processes HR data by quarter for dashboard display
 */

import { parse, format } from 'date-fns';
import { calendarDateToQuarter } from './dateHelpers';

/**
 * Available quarter end dates for filtering
 * Now dynamically loaded from QuarterConfigService
 */
import { QUARTER_DATES as DYNAMIC_QUARTER_DATES, getPreviousQuarter as getConfigPreviousQuarter } from '../services/QuarterConfigService';

export const QUARTER_DATES = DYNAMIC_QUARTER_DATES;

/**
 * Expected column mappings for aggregate data
 */
const COLUMN_MAPPINGS = {
  quarterEndDate: ['Quarter_End_Date', 'Quarter End Date', 'quarter_end_date', 'QuarterEndDate'],
  division: ['Division', 'division'],
  location: ['Location', 'location', 'Campus', 'campus'],
  // Headcount columns
  beFacultyHeadcount: ['BE_Faculty_Headcount', 'BE Faculty Headcount', 'be_faculty_headcount', 'BEFacultyHeadcount'],
  beStaffHeadcount: ['BE_Staff_Headcount', 'BE Staff Headcount', 'be_staff_headcount', 'BEStaffHeadcount'],
  nbeFacultyHeadcount: ['NBE_Faculty_Headcount', 'NBE Faculty Headcount', 'nbe_faculty_headcount', 'NBEFacultyHeadcount'],
  nbeStaffHeadcount: ['NBE_Staff_Headcount', 'NBE Staff Headcount', 'nbe_staff_headcount', 'NBEStaffHeadcount'],
  nbeStudentWorkerHeadcount: ['NBE_Student_Worker_Headcount', 'NBE Student Worker Headcount', 'nbe_student_worker_headcount', 'NBEStudentWorkerHeadcount'],
  totalHeadcount: ['Total_Headcount', 'Total Headcount', 'total_headcount', 'TotalHeadcount'],
  // Activity columns
  beNewHires: ['BE_New_Hires', 'BE New Hires', 'be_new_hires', 'BENewHires'],
  beDepartures: ['BE_Departures', 'BE Departures', 'be_departures', 'BEDepartures'],
  nbeNewHires: ['NBE_New_Hires', 'NBE New Hires', 'nbe_new_hires', 'NBENewHires'],
  nbeDepartures: ['NBE_Departures', 'NBE Departures', 'nbe_departures', 'NBEDepartures']
};

/**
 * Normalize column name to find matching field
 */
function findColumnMapping(columnName, mappings) {
  const normalizedColumn = columnName.trim();
  console.log(`Looking for mapping for column: "${normalizedColumn}"`);
  console.log('Available mappings:', Object.keys(mappings));
  
  for (const [field, possibleNames] of Object.entries(mappings)) {
    console.log(`Checking field "${field}" with possible names:`, possibleNames);
    const isMatch = possibleNames.some(name => {
      const match = name.toLowerCase() === normalizedColumn.toLowerCase();
      console.log(`  Comparing "${name.toLowerCase()}" === "${normalizedColumn.toLowerCase()}" -> ${match}`);
      return match;
    });
    if (isMatch) {
      console.log(`Found match: "${normalizedColumn}" -> "${field}"`);
      return field;
    }
  }
  
  console.log(`No mapping found for: "${normalizedColumn}"`);
  return null;
}

/**
 * Parse and normalize date values
 */
function parseDate(dateValue) {
  if (!dateValue) return null;
  
  try {
    // Handle various date formats
    if (typeof dateValue === 'string') {
      // Try common formats
      const formats = ['yyyy-MM-dd', 'MM/dd/yyyy', 'M/d/yyyy', 'yyyy/MM/dd'];
      
      for (const formatStr of formats) {
        try {
          const parsed = parse(dateValue, formatStr, new Date());
          if (!isNaN(parsed.getTime())) {
            return format(parsed, 'yyyy-MM-dd');
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    // Handle Date objects
    if (dateValue instanceof Date) {
      return format(dateValue, 'yyyy-MM-dd');
    }
    
    return null;
  } catch (error) {
    console.warn('Date parsing error:', error);
    return null;
  }
}

/**
 * Normalize aggregate data row
 */
function normalizeAggregateRecord(row) {
  const normalized = {};
  
  // Direct mapping for required fields first
  if (row.Quarter_End_Date) normalized.quarterEndDate = row.Quarter_End_Date;
  if (row.Division) normalized.division = String(row.Division).trim();
  if (row.Location) normalized.location = String(row.Location).trim();
  
  // Headcount fields
  if (row.BE_Faculty_Headcount !== undefined) normalized.beFacultyHeadcount = parseInt(row.BE_Faculty_Headcount, 10) || 0;
  if (row.BE_Staff_Headcount !== undefined) normalized.beStaffHeadcount = parseInt(row.BE_Staff_Headcount, 10) || 0;
  if (row.NBE_Faculty_Headcount !== undefined) normalized.nbeFacultyHeadcount = parseInt(row.NBE_Faculty_Headcount, 10) || 0;
  if (row.NBE_Staff_Headcount !== undefined) normalized.nbeStaffHeadcount = parseInt(row.NBE_Staff_Headcount, 10) || 0;
  if (row.NBE_Student_Worker_Headcount !== undefined) normalized.nbeStudentWorkerHeadcount = parseInt(row.NBE_Student_Worker_Headcount, 10) || 0;
  if (row.Total_Headcount !== undefined) normalized.totalHeadcount = parseInt(row.Total_Headcount, 10) || 0;
  
  // Activity fields
  if (row.BE_New_Hires !== undefined) normalized.beNewHires = parseInt(row.BE_New_Hires, 10) || 0;
  if (row.BE_Departures !== undefined) normalized.beDepartures = parseInt(row.BE_Departures, 10) || 0;
  if (row.NBE_New_Hires !== undefined) normalized.nbeNewHires = parseInt(row.NBE_New_Hires, 10) || 0;
  if (row.NBE_Departures !== undefined) normalized.nbeDepartures = parseInt(row.NBE_Departures, 10) || 0;
  
  console.log('Normalized record:', normalized);
  return normalized;
}

/**
 * Process uploaded aggregate quarterly data
 */
export function processQuarterlyData(rawData) {
  if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
    throw new Error('No data provided or invalid format');
  }
  
  // Normalize all records
  const normalizedData = rawData.map(row => normalizeAggregateRecord(row));
  
  console.log('Sample normalized record:', normalizedData[0]);
  console.log('Normalized data count:', normalizedData.length);
  
  // Filter out records without required fields
  const validData = normalizedData.filter(record => {
    const hasQuarterEndDate = record.quarterEndDate && record.quarterEndDate.trim() !== '';
    const hasDivision = record.division && record.division.trim() !== '';
    const hasLocation = record.location && record.location.trim() !== '';
    const isValid = hasQuarterEndDate && hasDivision && hasLocation;
    
    if (!isValid) {
      console.log('Invalid record:', record, {
        hasQuarterEndDate,
        hasDivision,
        hasLocation
      });
    }
    
    return isValid;
  });
  
  console.log('Valid data count:', validData.length);
  console.log('Valid data sample:', validData[0]);
  
  if (validData.length === 0) {
    throw new Error('No valid records found. Please check that your data includes Quarter_End_Date, Division, and Location columns.');
  }
  
  // Group by quarter - convert calendar dates to quarter strings
  const quarterlyData = {};
  validData.forEach(record => {
    // Convert quarter end date (like "2024-06-30") to quarter string (like "Q2-2024")
    const quarter = calendarDateToQuarter(record.quarterEndDate);
    
    if (!quarter) {
      console.warn('Could not convert quarter end date to quarter:', record.quarterEndDate);
      return;
    }
    
    if (!quarterlyData[quarter]) {
      quarterlyData[quarter] = [];
    }
    
    // Add the quarter string to the record for easy access
    record.quarter = quarter;
    quarterlyData[quarter].push(record);
  });
  
  return quarterlyData;
}

/**
 * Calculate metrics for a specific quarter from aggregate data
 */
export function calculateQuarterMetrics(quarterData, previousQuarterData = null) {
  if (!quarterData || quarterData.length === 0) {
    return {
      total: { value: 0, change: null, subtitle: "from previous quarter" },
      faculty: { value: 0, change: null, subtitle: "change", indicator: "green" },
      staff: { value: 0, change: null, subtitle: "change", indicator: "yellow" },
      newHires: { value: 0, change: null, subtitle: "new hires", indicator: "teal" },
      leavers: { value: 0, change: null, subtitle: "departures", indicator: "blue" }
    };
  }
  
  // Sum up all aggregate values for the quarter
  const totalBEFaculty = quarterData.reduce((sum, row) => sum + (row.beFacultyHeadcount || 0), 0);
  const totalBEStaff = quarterData.reduce((sum, row) => sum + (row.beStaffHeadcount || 0), 0);
  const totalNBEFaculty = quarterData.reduce((sum, row) => sum + (row.nbeFacultyHeadcount || 0), 0);
  const totalNBEStaff = quarterData.reduce((sum, row) => sum + (row.nbeStaffHeadcount || 0), 0);
  const totalNBEStudentWorker = quarterData.reduce((sum, row) => sum + (row.nbeStudentWorkerHeadcount || 0), 0);
  
  // Only count Benefit Eligible (BE) employees per dashboard note
  const totalStarters = quarterData.reduce((sum, row) => 
    sum + (row.beNewHires || 0), 0
  );
  
  const totalLeavers = quarterData.reduce((sum, row) => 
    sum + (row.beDepartures || 0), 0
  );
  
  // Calculate totals (BE only per dashboard note)
  const totalFaculty = totalBEFaculty;
  const totalStaff = totalBEStaff;
  const grandTotal = totalFaculty + totalStaff;
  
  // Calculate changes if previous quarter data is available
  let totalChange = null;
  let facultyChange = null;
  let staffChange = null;
  
  if (previousQuarterData && previousQuarterData.length > 0) {
    const prevBEFaculty = previousQuarterData.reduce((sum, row) => sum + (row.beFacultyHeadcount || 0), 0);
    const prevBEStaff = previousQuarterData.reduce((sum, row) => sum + (row.beStaffHeadcount || 0), 0);
    
    // BE only per dashboard note
    const prevTotalFaculty = prevBEFaculty;
    const prevTotalStaff = prevBEStaff;
    const prevGrandTotal = prevTotalFaculty + prevTotalStaff;
    
    // Calculate percentage changes (return raw numbers, not formatted strings)
    if (prevGrandTotal > 0) {
      totalChange = ((grandTotal - prevGrandTotal) / prevGrandTotal * 100);
    }
    if (prevTotalFaculty > 0) {
      facultyChange = ((totalFaculty - prevTotalFaculty) / prevTotalFaculty * 100);
    }
    if (prevTotalStaff > 0) {
      staffChange = ((totalStaff - prevTotalStaff) / prevTotalStaff * 100);
    }
  }
  
  return {
    total: { 
      value: grandTotal, 
      change: totalChange, 
      subtitle: "from previous quarter",
      changeType: "percentage" 
    },
    faculty: { 
      value: totalFaculty, 
      change: facultyChange, 
      subtitle: "change",
      changeType: "percentage",
      indicator: "green" 
    },
    staff: { 
      value: totalStaff, 
      change: staffChange, 
      subtitle: "change", 
      changeType: "percentage",
      indicator: "yellow" 
    },
    newHires: { 
      value: totalStarters, 
      change: null, 
      subtitle: "new hires",
      changeType: null,
      indicator: "teal" 
    },
    leavers: { 
      value: totalLeavers, 
      change: null, 
      subtitle: "departures",
      changeType: null,
      indicator: "blue" 
    }
  };
}

/**
 * Calculate division breakdown for a quarter from aggregate data
 */
export function calculateDivisionBreakdown(quarterData) {
  if (!quarterData || quarterData.length === 0) {
    return [];
  }
  
  const divisionGroups = {};
  
  quarterData.forEach(row => {
    const division = row.division || 'Unknown';
    
    if (!divisionGroups[division]) {
      divisionGroups[division] = { division, faculty: 0, staff: 0 };
    }
    
    // Sum benefit eligible faculty and staff for chart display
    divisionGroups[division].faculty += (row.beFacultyHeadcount || 0);
    divisionGroups[division].staff += (row.beStaffHeadcount || 0);
  });
  
  return Object.values(divisionGroups).sort((a, b) => 
    (b.faculty + b.staff) - (a.faculty + a.staff)
  );
}

/**
 * Calculate location breakdown for a quarter from aggregate data
 */
export function calculateLocationBreakdown(quarterData) {
  if (!quarterData || quarterData.length === 0) {
    return [];
  }
  
  const locationGroups = {};
  let totalEmployees = 0;
  
  quarterData.forEach(row => {
    const location = row.location || 'Unknown';
    
    if (!locationGroups[location]) {
      locationGroups[location] = 0;
    }
    
    // Sum all employee types for location
    const locationTotal = (row.beFacultyHeadcount || 0) + 
                         (row.beStaffHeadcount || 0) + 
                         (row.nbeFacultyHeadcount || 0) + 
                         (row.nbeStaffHeadcount || 0) + 
                         (row.nbeStudentWorkerHeadcount || 0);
    
    locationGroups[location] += locationTotal;
    totalEmployees += locationTotal;
  });
  
  return Object.entries(locationGroups).map(([location, count]) => ({
    location,
    count,
    percentage: totalEmployees > 0 ? ((count / totalEmployees) * 100).toFixed(1) : 0
  })).sort((a, b) => b.count - a.count);
}

/**
 * Get previous quarter date
 * Now uses QuarterConfigService for dynamic quarter management
 */
export function getPreviousQuarter(currentQuarter) {
  const previousQuarter = getConfigPreviousQuarter(currentQuarter);
  return previousQuarter ? previousQuarter.value : null;
}

/**
 * Generate sample aggregate data for testing
 */
export function generateSampleData() {
  const sampleData = [];
  const divisions = ['Arts & Sciences', 'Medicine', 'Pharmacy & Health Professions', 'Nursing', 'Business', 'Education'];
  const locations = ['Omaha', 'Phoenix'];
  
  QUARTER_DATES.forEach((quarter, qIndex) => {
    // Generate aggregate data for each division/location combination
    divisions.forEach(division => {
      locations.forEach(location => {
        // Generate realistic headcount numbers
        const beFacultyBase = Math.floor(Math.random() * 100) + 50;
        const beStaffBase = Math.floor(Math.random() * 150) + 75;
        const nbeFacultyBase = Math.floor(Math.random() * 30) + 10;
        const nbeStaffBase = Math.floor(Math.random() * 50) + 20;
        const nbeStudentWorkerBase = Math.floor(Math.random() * 80) + 40;
        
        // Add some growth/decline over quarters
        const growthFactor = 1 + (qIndex * 0.02) + (Math.random() * 0.04 - 0.02);
        
        const beFacultyHeadcount = Math.floor(beFacultyBase * growthFactor);
        const beStaffHeadcount = Math.floor(beStaffBase * growthFactor);
        const nbeFacultyHeadcount = Math.floor(nbeFacultyBase * growthFactor);
        const nbeStaffHeadcount = Math.floor(nbeStaffBase * growthFactor);
        const nbeStudentWorkerHeadcount = Math.floor(nbeStudentWorkerBase * growthFactor);
        
        // Generate realistic hire/departure numbers
        const beNewHires = qIndex > 0 ? Math.floor(Math.random() * 8) + 2 : 0;
        const beDepartures = qIndex > 0 ? Math.floor(Math.random() * 6) + 1 : 0;
        const nbeNewHires = qIndex > 0 ? Math.floor(Math.random() * 15) + 5 : 0;
        const nbeDepartures = qIndex > 0 ? Math.floor(Math.random() * 12) + 3 : 0;
        
        sampleData.push({
          Quarter_End_Date: quarter.dateValue, // Use actual calendar date instead of quarter string
          Division: division,
          Location: location,
          BE_Faculty_Headcount: beFacultyHeadcount,
          BE_Staff_Headcount: beStaffHeadcount,
          NBE_Faculty_Headcount: nbeFacultyHeadcount,
          NBE_Staff_Headcount: nbeStaffHeadcount,
          NBE_Student_Worker_Headcount: nbeStudentWorkerHeadcount,
          Total_Headcount: beFacultyHeadcount + beStaffHeadcount + nbeFacultyHeadcount + nbeStaffHeadcount + nbeStudentWorkerHeadcount,
          BE_New_Hires: beNewHires,
          BE_Departures: beDepartures,
          NBE_New_Hires: nbeNewHires,
          NBE_Departures: nbeDepartures
        });
      });
    });
  });
  
  return sampleData;
}

export default {
  QUARTER_DATES,
  processQuarterlyData,
  calculateQuarterMetrics,
  calculateDivisionBreakdown,
  calculateLocationBreakdown,
  getPreviousQuarter,
  generateSampleData
};