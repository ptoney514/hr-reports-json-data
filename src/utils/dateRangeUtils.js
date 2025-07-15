/**
 * Date Range Utility Functions
 * Provides utilities for working with date ranges and quarter conversions
 */

import { format, parse, parseISO, startOfQuarter, endOfQuarter, isWithinInterval, differenceInDays } from 'date-fns';
import { QUARTER_DATES } from './quarterlyDataProcessor';

/**
 * Convert a quarter identifier to a date range
 * @param {string} quarter - Quarter identifier (e.g., 'Q1-2025')
 * @returns {object} Date range with start and end dates
 */
export const quarterToDateRange = (quarter) => {
  const quarterConfig = QUARTER_DATES.find(q => q.value === quarter);
  
  if (quarterConfig) {
    return {
      start: quarterConfig.start_date,
      end: quarterConfig.end_date,
      label: quarterConfig.label,
      type: 'quarter'
    };
  }

  // Fallback: parse quarter string manually
  const match = quarter.match(/Q(\d)-(\d{4})/);
  if (match) {
    const [, q, year] = match;
    const quarterNum = parseInt(q);
    const yearNum = parseInt(year);
    
    // Calculate quarter start month (0-based)
    const startMonth = (quarterNum - 1) * 3;
    const startDate = new Date(yearNum, startMonth, 1);
    const endDate = endOfQuarter(startDate);
    
    return {
      start: format(startDate, 'yyyy-MM-dd'),
      end: format(endDate, 'yyyy-MM-dd'),
      label: `Q${quarterNum} ${year}`,
      type: 'quarter'
    };
  }
  
  return null;
};

/**
 * Convert a date range to the appropriate quarter(s)
 * @param {object} dateRange - Date range with start and end
 * @returns {array} Array of quarters that overlap with the date range
 */
export const dateRangeToQuarters = (dateRange) => {
  if (!dateRange || !dateRange.start || !dateRange.end) return [];
  
  const startDate = parseISO(dateRange.start);
  const endDate = parseISO(dateRange.end);
  
  return QUARTER_DATES.filter(quarter => {
    const qStart = parseISO(quarter.start_date);
    const qEnd = parseISO(quarter.end_date);
    
    // Check if quarter overlaps with date range
    return (
      isWithinInterval(qStart, { start: startDate, end: endDate }) ||
      isWithinInterval(qEnd, { start: startDate, end: endDate }) ||
      isWithinInterval(startDate, { start: qStart, end: qEnd }) ||
      isWithinInterval(endDate, { start: qStart, end: qEnd })
    );
  }).map(q => q.value);
};

/**
 * Format a date range for display
 * @param {object} dateRange - Date range object
 * @returns {string} Formatted date range string
 */
export const formatDateRange = (dateRange) => {
  if (!dateRange) return '';
  
  // If it's a quarter string
  if (typeof dateRange === 'string') {
    const quarter = QUARTER_DATES.find(q => q.value === dateRange);
    return quarter ? quarter.label : dateRange;
  }
  
  // If it has a label
  if (dateRange.label) return dateRange.label;
  
  // Format custom date range
  if (dateRange.start && dateRange.end) {
    const start = parseISO(dateRange.start);
    const end = parseISO(dateRange.end);
    
    // Same month
    if (format(start, 'MMM yyyy') === format(end, 'MMM yyyy')) {
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
    }
    
    // Same year
    if (format(start, 'yyyy') === format(end, 'yyyy')) {
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }
    
    // Different years
    return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
  }
  
  return '';
};

/**
 * Validate if a date range is valid
 * @param {object} dateRange - Date range to validate
 * @returns {object} Validation result with isValid and error message
 */
export const validateDateRange = (dateRange) => {
  if (!dateRange) {
    return { isValid: false, error: 'No date range provided' };
  }
  
  if (typeof dateRange === 'string') {
    // Validate quarter format
    const isValidQuarter = QUARTER_DATES.some(q => q.value === dateRange);
    return {
      isValid: isValidQuarter,
      error: isValidQuarter ? null : 'Invalid quarter format'
    };
  }
  
  if (!dateRange.start || !dateRange.end) {
    return { isValid: false, error: 'Start and end dates are required' };
  }
  
  try {
    const start = parseISO(dateRange.start);
    const end = parseISO(dateRange.end);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { isValid: false, error: 'Invalid date format' };
    }
    
    if (start > end) {
      return { isValid: false, error: 'Start date must be before end date' };
    }
    
    // Check if range is too large (e.g., more than 2 years)
    const daysDiff = differenceInDays(end, start);
    if (daysDiff > 730) {
      return { isValid: false, error: 'Date range cannot exceed 2 years' };
    }
    
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: 'Invalid date format' };
  }
};

/**
 * Get the type of date range (quarter, month, custom, etc.)
 * @param {object} dateRange - Date range to analyze
 * @returns {string} Type of date range
 */
export const getDateRangeType = (dateRange) => {
  if (!dateRange) return 'none';
  
  if (typeof dateRange === 'string') {
    // Check if it's a quarter
    if (QUARTER_DATES.some(q => q.value === dateRange)) {
      return 'quarter';
    }
    return 'custom';
  }
  
  if (dateRange.type) return dateRange.type;
  
  if (dateRange.start && dateRange.end) {
    const start = parseISO(dateRange.start);
    const end = parseISO(dateRange.end);
    
    // Check if it matches a quarter exactly
    const matchingQuarter = QUARTER_DATES.find(q => 
      q.start_date === dateRange.start && q.end_date === dateRange.end
    );
    
    if (matchingQuarter) return 'quarter';
    
    // Check if it's a full month
    if (format(start, 'yyyy-MM-01') === format(start, 'yyyy-MM-dd') &&
        format(end, 'yyyy-MM-dd') === format(new Date(end.getFullYear(), end.getMonth() + 1, 0), 'yyyy-MM-dd')) {
      return 'month';
    }
    
    return 'custom';
  }
  
  return 'unknown';
};

/**
 * Merge overlapping date ranges
 * @param {array} ranges - Array of date ranges
 * @returns {array} Merged date ranges
 */
export const mergeDateRanges = (ranges) => {
  if (!ranges || ranges.length === 0) return [];
  
  // Convert all ranges to a standard format and sort by start date
  const standardized = ranges.map(range => {
    if (typeof range === 'string') {
      return quarterToDateRange(range);
    }
    return range;
  }).filter(Boolean).sort((a, b) => 
    parseISO(a.start).getTime() - parseISO(b.start).getTime()
  );
  
  const merged = [standardized[0]];
  
  for (let i = 1; i < standardized.length; i++) {
    const current = standardized[i];
    const previous = merged[merged.length - 1];
    
    const prevEnd = parseISO(previous.end);
    const currStart = parseISO(current.start);
    
    // If ranges overlap or are adjacent
    if (currStart <= prevEnd || differenceInDays(currStart, prevEnd) <= 1) {
      // Merge ranges
      const currEnd = parseISO(current.end);
      if (currEnd > prevEnd) {
        previous.end = current.end;
      }
    } else {
      // Add as new range
      merged.push(current);
    }
  }
  
  return merged;
};

/**
 * Check if data is available for a given date range
 * @param {object} dateRange - Date range to check
 * @param {array} availableData - Array of available data points with dates
 * @returns {boolean} Whether data is available
 */
export const isDataAvailableForRange = (dateRange, availableData) => {
  if (!dateRange || !availableData || availableData.length === 0) return false;
  
  const quarters = dateRangeToQuarters(dateRange);
  if (quarters.length === 0) return false;
  
  // Check if any of the quarters have data
  return quarters.some(quarter => 
    availableData.some(data => data.quarter === quarter && data.hasData)
  );
};

/**
 * Get a human-readable description of the date range
 * @param {object} dateRange - Date range to describe
 * @returns {string} Human-readable description
 */
export const getDateRangeDescription = (dateRange) => {
  const type = getDateRangeType(dateRange);
  
  switch (type) {
    case 'quarter':
      return `Quarterly data for ${formatDateRange(dateRange)}`;
    case 'month':
      return `Monthly data for ${format(parseISO(dateRange.start), 'MMMM yyyy')}`;
    case 'preset':
      return dateRange.label || 'Preset date range';
    case 'custom':
      return `Custom range: ${formatDateRange(dateRange)}`;
    default:
      return 'Date range';
  }
};