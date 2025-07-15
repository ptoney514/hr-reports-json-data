/**
 * Quarter Format Utilities
 * Centralized functions for converting between different quarter format standards
 * 
 * Formats:
 * - App Format: "Q1-2025" (used internally by QuarterConfigService)
 * - Firebase Format: "2025-Q1" (used for Firebase document storage)
 * - Display Format: "Q1 2025 (3/31/2025)" (user-friendly with end date)
 */

/**
 * Convert Firebase format to App format
 * @param {string} firebaseQuarterId - Quarter in Firebase format (e.g., "2025-Q1")
 * @returns {string} Quarter in App format (e.g., "Q1-2025")
 */
export const toAppFormat = (firebaseQuarterId) => {
  if (!firebaseQuarterId) return null;
  
  // If already in app format, return as-is
  if (/^Q\d-\d{4}$/.test(firebaseQuarterId)) {
    return firebaseQuarterId;
  }
  
  // Convert "2025-Q1" to "Q1-2025"
  const firebaseMatch = firebaseQuarterId.match(/^(\d{4})-Q(\d)$/);
  if (firebaseMatch) {
    const [, year, quarter] = firebaseMatch;
    return `Q${quarter}-${year}`;
  }
  
  console.warn(`Unable to convert quarter format: ${firebaseQuarterId}`);
  return firebaseQuarterId;
};

/**
 * Convert App format to Firebase format
 * @param {string} appQuarterId - Quarter in App format (e.g., "Q1-2025")
 * @returns {string} Quarter in Firebase format (e.g., "2025-Q1")
 */
export const toFirebaseFormat = (appQuarterId) => {
  if (!appQuarterId) return null;
  
  // If already in Firebase format, return as-is
  if (/^\d{4}-Q\d$/.test(appQuarterId)) {
    return appQuarterId;
  }
  
  // Convert "Q1-2025" to "2025-Q1"
  const appMatch = appQuarterId.match(/^Q(\d)-(\d{4})$/);
  if (appMatch) {
    const [, quarter, year] = appMatch;
    return `${year}-Q${quarter}`;
  }
  
  console.warn(`Unable to convert quarter format: ${appQuarterId}`);
  return appQuarterId;
};

/**
 * Convert quarter ID to display format with end date
 * @param {string} quarterId - Quarter in any supported format
 * @param {Object} quarterConfig - Optional quarter configuration object
 * @returns {string} Display format (e.g., "6/30/25")
 */
export const toDisplayFormat = (quarterId, quarterConfig = null) => {
  if (!quarterId) return '';
  
  // Normalize to app format first
  const appFormat = toAppFormat(quarterId);
  if (!appFormat) return quarterId;
  
  const match = appFormat.match(/^Q(\d)-(\d{4})$/);
  if (!match) return quarterId;
  
  const [, quarter, year] = match;
  
  // Get 2-digit year
  const shortYear = year.slice(-2);
  
  // If quarter config is provided, use the actual end date
  if (quarterConfig && quarterConfig.dateValue) {
    const endDate = new Date(quarterConfig.dateValue);
    const month = endDate.getMonth() + 1;
    const day = endDate.getDate();
    const configYear = endDate.getFullYear().toString().slice(-2);
    return `${month}/${day}/${configYear}`;
  }
  
  // Otherwise, calculate standard quarter end dates
  const endDates = {
    1: '3/31',
    2: '6/30', 
    3: '9/30',
    4: '12/31'
  };
  
  const endDate = endDates[quarter] || '12/31';
  return `${endDate}/${shortYear}`;
};

/**
 * Validate quarter format
 * @param {string} quarterId - Quarter ID to validate
 * @returns {boolean} True if valid format
 */
export const isValidQuarterFormat = (quarterId) => {
  if (!quarterId || typeof quarterId !== 'string') return false;
  
  // Check app format: Q1-2025
  if (/^Q[1-4]-\d{4}$/.test(quarterId)) return true;
  
  // Check Firebase format: 2025-Q1
  if (/^\d{4}-Q[1-4]$/.test(quarterId)) return true;
  
  return false;
};

/**
 * Normalize quarter ID to a consistent format (defaults to app format)
 * @param {string} quarterId - Quarter ID in any supported format
 * @param {string} targetFormat - Target format ('app' or 'firebase')
 * @returns {string} Normalized quarter ID
 */
export const normalizeQuarterId = (quarterId, targetFormat = 'app') => {
  if (!isValidQuarterFormat(quarterId)) {
    console.warn(`Invalid quarter format: ${quarterId}`);
    return quarterId;
  }
  
  switch (targetFormat) {
    case 'firebase':
      return toFirebaseFormat(quarterId);
    case 'app':
    default:
      return toAppFormat(quarterId);
  }
};

/**
 * Get quarter format type
 * @param {string} quarterId - Quarter ID to analyze
 * @returns {string} Format type ('app', 'firebase', 'unknown')
 */
export const getQuarterFormatType = (quarterId) => {
  if (!quarterId) return 'unknown';
  
  if (/^Q[1-4]-\d{4}$/.test(quarterId)) return 'app';
  if (/^\d{4}-Q[1-4]$/.test(quarterId)) return 'firebase';
  
  return 'unknown';
};

/**
 * Convert quarter object with proper format handling
 * @param {Object} quarter - Quarter object from QuarterConfigService
 * @param {string} targetFormat - Target format for the quarter ID
 * @returns {Object} Quarter object with converted ID
 */
export const convertQuarterObject = (quarter, targetFormat = 'app') => {
  if (!quarter || !quarter.value) return quarter;
  
  return {
    ...quarter,
    value: normalizeQuarterId(quarter.value, targetFormat),
    quarter: normalizeQuarterId(quarter.quarter || quarter.value, targetFormat)
  };
};

/**
 * Debug helper to log quarter format information
 * @param {string} quarterId - Quarter ID to debug
 * @param {string} context - Context where this is being called
 */
export const debugQuarterFormat = (quarterId, context = 'Unknown') => {
  console.log(`🔍 Quarter Format Debug [${context}]:`, {
    original: quarterId,
    type: getQuarterFormatType(quarterId),
    appFormat: toAppFormat(quarterId),
    firebaseFormat: toFirebaseFormat(quarterId),
    displayFormat: toDisplayFormat(quarterId),
    isValid: isValidQuarterFormat(quarterId)
  });
};

// Export all utilities as default object for convenience
export default {
  toAppFormat,
  toFirebaseFormat,
  toDisplayFormat,
  isValidQuarterFormat,
  normalizeQuarterId,
  getQuarterFormatType,
  convertQuarterObject,
  debugQuarterFormat
};