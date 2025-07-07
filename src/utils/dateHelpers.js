import { format, parseISO, addMonths, subMonths, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, isValid, differenceInDays, differenceInMonths } from 'date-fns';

/**
 * Format a quarter string (e.g., "Q2-2025")
 * @param {string} quarter - Quarter string like "Q2-2025"
 * @returns {string} Formatted quarter like "Q2 2025"
 */
export const formatQuarter = (quarter) => {
  if (!quarter || typeof quarter !== 'string') return '';
  
  const parts = quarter.split('-');
  if (parts.length !== 2) return quarter;
  
  const [q, year] = parts;
  return `${q} ${year}`;
};

/**
 * Get the start and end dates for a given quarter
 * @param {string} quarter - Quarter string like "Q2-2025"
 * @returns {Object} Object with startDate and endDate
 */
export const getQuarterDateRange = (quarter) => {
  const quarterMappings = {
    'Q1-2024': { start: '2023-10-01', end: '2023-12-31' },
    'Q2-2024': { start: '2024-01-01', end: '2024-03-31' },
    'Q3-2024': { start: '2024-04-01', end: '2024-06-30' },
    'Q4-2024': { start: '2024-07-01', end: '2024-09-30' },
    'Q1-2025': { start: '2024-10-01', end: '2024-12-31' },
    'Q2-2025': { start: '2025-01-01', end: '2025-03-31' },
    'Q3-2025': { start: '2025-04-01', end: '2025-06-30' },
    'Q4-2025': { start: '2025-07-01', end: '2025-09-30' }
  };

  const mapping = quarterMappings[quarter];
  if (!mapping) {
    // Fallback: try to parse the quarter manually
    const match = quarter.match(/Q(\d)-(\d{4})/);
    if (match) {
      const [, qNum, year] = match;
      const quarterNum = parseInt(qNum);
      const yearNum = parseInt(year);
      
      // Calculate academic quarter (Oct-Dec = Q1, Jan-Mar = Q2, etc.)
      const startMonth = (quarterNum - 1) * 3 + (quarterNum === 1 ? 9 : -3); // Adjust for academic year
      const startYear = quarterNum === 1 ? yearNum - 1 : yearNum;
      
      const startDate = new Date(startYear, startMonth, 1);
      const endDate = endOfMonth(addMonths(startDate, 2));
      
      return {
        startDate,
        endDate,
        label: formatQuarter(quarter)
      };
    }
    
    return null;
  }

  return {
    startDate: new Date(mapping.start),
    endDate: new Date(mapping.end),
    label: formatQuarter(quarter)
  };
};

/**
 * Get the end date of a quarter
 * @param {string} quarter - Quarter string like "Q2-2025"
 * @returns {Date|null} End date of the quarter
 */
export const getQuarterEndDate = (quarter) => {
  const range = getQuarterDateRange(quarter);
  return range ? range.endDate : null;
};

/**
 * Get the start date of a quarter
 * @param {string} quarter - Quarter string like "Q2-2025"
 * @returns {Date|null} Start date of the quarter
 */
export const getQuarterStartDate = (quarter) => {
  const range = getQuarterDateRange(quarter);
  return range ? range.startDate : null;
};

/**
 * Convert a date to a quarter string
 * @param {Date} date - Date object
 * @returns {string} Quarter string like "Q2-2025"
 */
export const dateToQuarter = (date) => {
  if (!isValid(date)) return '';
  
  const month = date.getMonth(); // 0-based
  const year = date.getFullYear();
  
  // Academic year quarters (Oct-Dec = Q1, Jan-Mar = Q2, Apr-Jun = Q3, Jul-Sep = Q4)
  let quarter, academicYear;
  
  if (month >= 9) { // Oct, Nov, Dec
    quarter = 1;
    academicYear = year + 1;
  } else if (month >= 6) { // Jul, Aug, Sep
    quarter = 4;
    academicYear = year;
  } else if (month >= 3) { // Apr, May, Jun
    quarter = 3;
    academicYear = year;
  } else { // Jan, Feb, Mar
    quarter = 2;
    academicYear = year;
  }
  
  return `Q${quarter}-${academicYear}`;
};

/**
 * Convert a calendar quarter end date to system quarter string
 * This handles the HR template format which uses calendar quarters
 * @param {string} dateString - Date string like "2024-06-30" 
 * @returns {string} Quarter string like "Q2-2024"
 */
export const calendarDateToQuarter = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return '';
  
  // Direct mapping for known HR template quarter end dates
  const calendarQuarterMappings = {
    '2024-06-30': 'Q2-2024',  // June 30 = Q2 (calendar quarter)
    '2024-09-30': 'Q3-2024',  // Sept 30 = Q3 (calendar quarter)
    '2024-12-31': 'Q4-2024',  // Dec 31 = Q4 (calendar quarter)
    '2025-03-31': 'Q1-2025',  // Mar 31 = Q1 (calendar quarter, next year)
    '2025-06-30': 'Q2-2025',  // June 30 = Q2 (calendar quarter)
    '2025-09-30': 'Q3-2025',  // Sept 30 = Q3 (calendar quarter)
    '2025-12-31': 'Q4-2025'   // Dec 31 = Q4 (calendar quarter)
  };
  
  // Check direct mapping first
  if (calendarQuarterMappings[dateString]) {
    return calendarQuarterMappings[dateString];
  }
  
  // Fallback: parse date and determine calendar quarter
  try {
    const date = new Date(dateString);
    if (!isValid(date)) return '';
    
    const month = date.getMonth(); // 0-based
    const year = date.getFullYear();
    
    // Calendar quarters (Jan-Mar = Q1, Apr-Jun = Q2, Jul-Sep = Q3, Oct-Dec = Q4)
    let quarter;
    if (month >= 9) { // Oct, Nov, Dec
      quarter = 4;
    } else if (month >= 6) { // Jul, Aug, Sep
      quarter = 3;
    } else if (month >= 3) { // Apr, May, Jun
      quarter = 2;
    } else { // Jan, Feb, Mar
      quarter = 1;
    }
    
    return `Q${quarter}-${year}`;
  } catch (error) {
    console.warn('Failed to parse calendar date:', dateString, error);
    return '';
  }
};

/**
 * Get the current quarter
 * @returns {string} Current quarter string like "Q2-2025"
 */
export const getCurrentQuarter = () => {
  return dateToQuarter(new Date());
};

/**
 * Get the previous quarter
 * @param {string} quarter - Quarter string like "Q2-2025"
 * @returns {string} Previous quarter string
 */
export const getPreviousQuarter = (quarter) => {
  const range = getQuarterDateRange(quarter);
  if (!range) return '';
  
  // Go back 3 months from start date
  const prevQuarterDate = subMonths(range.startDate, 3);
  return dateToQuarter(prevQuarterDate);
};

/**
 * Get the next quarter
 * @param {string} quarter - Quarter string like "Q2-2025"
 * @returns {string} Next quarter string
 */
export const getNextQuarter = (quarter) => {
  const range = getQuarterDateRange(quarter);
  if (!range) return '';
  
  // Go forward 3 months from start date
  const nextQuarterDate = addMonths(range.startDate, 3);
  return dateToQuarter(nextQuarterDate);
};

/**
 * Format a date for display
 * @param {Date|string} date - Date object or ISO string
 * @param {string} formatStr - Format string (default: 'MMM d, yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, formatStr);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return '';
  }
};

/**
 * Format a date for short display
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Short formatted date like "Jan 15"
 */
export const formatDateShort = (date) => {
  return formatDate(date, 'MMM d');
};

/**
 * Format a month/year
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted month/year like "January 2025"
 */
export const formatMonthYear = (date) => {
  return formatDate(date, 'MMMM yyyy');
};

/**
 * Get a date range for the last N months
 * @param {number} months - Number of months back
 * @returns {Object} Object with startDate and endDate
 */
export const getLastNMonths = (months = 12) => {
  const endDate = endOfMonth(new Date());
  const startDate = startOfMonth(subMonths(endDate, months - 1));
  
  return {
    startDate,
    endDate,
    label: `Last ${months} months`
  };
};

/**
 * Get fiscal year from a date (July 1 - June 30)
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Fiscal year like "FY2024"
 */
export const getFiscalYear = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    const month = dateObj.getMonth(); // 0-based
    const year = dateObj.getFullYear();
    
    // Fiscal year starts July 1
    const fiscalYear = month >= 6 ? year + 1 : year; // July (6) or later = next year
    
    return `FY${fiscalYear}`;
  } catch (error) {
    console.warn('Fiscal year calculation error:', error);
    return '';
  }
};

/**
 * Get fiscal year date range
 * @param {string} fiscalYear - Fiscal year like "FY2024"
 * @returns {Object} Object with startDate and endDate
 */
export const getFiscalYearDateRange = (fiscalYear) => {
  const match = fiscalYear.match(/FY(\d{4})/);
  if (!match) return null;
  
  const year = parseInt(match[1]);
  const startDate = new Date(year - 1, 6, 1); // July 1 of previous year
  const endDate = new Date(year, 5, 30); // June 30 of fiscal year
  
  return {
    startDate,
    endDate,
    label: fiscalYear
  };
};

/**
 * Check if a date is within a date range
 * @param {Date} date - Date to check
 * @param {Date} startDate - Range start date
 * @param {Date} endDate - Range end date
 * @returns {boolean} True if date is within range
 */
export const isDateInRange = (date, startDate, endDate) => {
  if (!isValid(date) || !isValid(startDate) || !isValid(endDate)) {
    return false;
  }
  
  return date >= startDate && date <= endDate;
};

/**
 * Calculate the number of days between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Number of days
 */
export const daysBetween = (startDate, endDate) => {
  if (!isValid(startDate) || !isValid(endDate)) return 0;
  return differenceInDays(endDate, startDate);
};

/**
 * Calculate the number of months between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Number of months
 */
export const monthsBetween = (startDate, endDate) => {
  if (!isValid(startDate) || !isValid(endDate)) return 0;
  return differenceInMonths(endDate, startDate);
};

/**
 * Get relative time description
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time like "2 days ago", "Next week"
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    const now = new Date();
    const diffDays = differenceInDays(dateObj, now);
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
    if (diffDays > 7) return `In ${Math.ceil(diffDays / 7)} weeks`;
    if (diffDays < -7) return `${Math.ceil(Math.abs(diffDays) / 7)} weeks ago`;
    
    return formatDate(dateObj);
  } catch (error) {
    console.warn('Relative time calculation error:', error);
    return '';
  }
};

/**
 * Parse various date formats commonly used in HR data
 * @param {string} dateStr - Date string to parse
 * @returns {Date|null} Parsed date object or null if invalid
 */
export const parseHRDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  // Try ISO format first
  try {
    const isoDate = parseISO(dateStr);
    if (isValid(isoDate)) return isoDate;
  } catch (error) {
    // Continue to other formats
  }
  
  // Try other common formats
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/DD/YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // M/D/YYYY
  ];
  
  for (const formatRegex of formats) {
    const match = dateStr.match(formatRegex);
    if (match) {
      try {
        if (formatRegex.source.includes('(\\d{4})-(\\d{2})-(\\d{2})')) {
          // YYYY-MM-DD
          const [, year, month, day] = match;
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (isValid(date)) return date;
        } else {
          // MM/DD/YYYY or M/D/YYYY
          const [, month, day, year] = match;
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (isValid(date)) return date;
        }
      } catch (error) {
        continue;
      }
    }
  }
  
  return null;
}; 