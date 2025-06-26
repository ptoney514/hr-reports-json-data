// dataFormatters.js - To be implemented 

/**
 * Format a percentage with consistent styling
 * @param {number} value - Decimal value (e.g., 0.125 for 12.5%)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @param {boolean} includeSign - Include + sign for positive values (default: false)
 * @returns {string} Formatted percentage like "12.5%"
 */
export const formatPercentage = (value, decimals = 1, includeSign = false) => {
  if (value === null || value === undefined || isNaN(value)) return '0.0%';
  
  const percentage = value * 100;
  const sign = includeSign && percentage > 0 ? '+' : '';
  
  return `${sign}${percentage.toFixed(decimals)}%`;
};

/**
 * Format a percentage from a whole number (e.g., 12.5 -> "12.5%")
 * @param {number} value - Whole number percentage (e.g., 12.5)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @param {boolean} includeSign - Include + sign for positive values (default: false)
 * @returns {string} Formatted percentage like "12.5%"
 */
export const formatPercentageFromNumber = (value, decimals = 1, includeSign = false) => {
  if (value === null || value === undefined || isNaN(value)) return '0.0%';
  
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

/**
 * Format a number with thousands separators
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @param {boolean} includeSign - Include + sign for positive values (default: false)
 * @returns {string} Formatted number like "1,234" or "1,234.5"
 */
export const formatNumber = (value, decimals = 0, includeSign = false) => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  
  const options = {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true
  };
  
  const formatted = new Intl.NumberFormat('en-US', options).format(Math.abs(value));
  const sign = value < 0 ? '-' : (includeSign && value > 0 ? '+' : '');
  
  return `${sign}${formatted}`;
};

/**
 * Format a number with abbreviated suffixes (K, M, B)
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted number like "1.2K" or "1.5M"
 */
export const formatNumberAbbreviated = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1000000000) {
    return `${sign}${(absValue / 1000000000).toFixed(decimals)}B`;
  } else if (absValue >= 1000000) {
    return `${sign}${(absValue / 1000000).toFixed(decimals)}M`;
  } else if (absValue >= 1000) {
    return `${sign}${(absValue / 1000).toFixed(decimals)}K`;
  } else {
    return `${sign}${absValue.toFixed(decimals)}`;
  }
};

/**
 * Format currency values
 * @param {number} value - Dollar amount
 * @param {boolean} abbreviated - Use abbreviated format (default: false)
 * @param {number} decimals - Number of decimal places for abbreviated (default: 1)
 * @returns {string} Formatted currency like "$1,234" or "$1.2M"
 */
export const formatCurrency = (value, abbreviated = false, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '$0';
  
  if (abbreviated) {
    const abbrev = formatNumberAbbreviated(value, decimals);
    return `$${abbrev.replace(/^-/, '')}${value < 0 ? '' : ''}`;
  }
  
  const options = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  };
  
  return new Intl.NumberFormat('en-US', options).format(value);
};

/**
 * Calculate percentage change between two values
 * @param {number} oldValue - Previous value
 * @param {number} newValue - Current value
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {number} Percentage change as decimal (e.g., 0.125 for 12.5% increase)
 */
export const calculateChange = (oldValue, newValue, decimals = 1) => {
  if (oldValue === null || oldValue === undefined || isNaN(oldValue) || oldValue === 0) {
    return 0;
  }
  
  if (newValue === null || newValue === undefined || isNaN(newValue)) {
    return 0;
  }
  
  const change = ((newValue - oldValue) / Math.abs(oldValue));
  return Number(change.toFixed(decimals + 2)); // Extra precision for calculations
};

/**
 * Calculate and format percentage change
 * @param {number} oldValue - Previous value
 * @param {number} newValue - Current value
 * @param {number} decimals - Number of decimal places (default: 1)
 * @param {boolean} includeSign - Include + sign for positive values (default: true)
 * @returns {string} Formatted percentage change like "+12.5%" or "-5.2%"
 */
export const formatChange = (oldValue, newValue, decimals = 1, includeSign = true) => {
  const change = calculateChange(oldValue, newValue, decimals);
  return formatPercentage(change, decimals, includeSign);
};

/**
 * Get change indicator (positive, negative, neutral)
 * @param {number} oldValue - Previous value
 * @param {number} newValue - Current value
 * @returns {Object} Object with change type and formatted string
 */
export const getChangeIndicator = (oldValue, newValue) => {
  const change = calculateChange(oldValue, newValue);
  
  if (change > 0) {
    return {
      type: 'positive',
      indicator: '↑',
      className: 'text-green-600',
      formatted: formatChange(oldValue, newValue, 1, true)
    };
  } else if (change < 0) {
    return {
      type: 'negative',
      indicator: '↓',
      className: 'text-red-600',
      formatted: formatChange(oldValue, newValue, 1, true)
    };
  } else {
    return {
      type: 'neutral',
      indicator: '→',
      className: 'text-gray-600',
      formatted: '0.0%'
    };
  }
};

/**
 * Format a ratio as "X:Y" format
 * @param {number} numerator - First number
 * @param {number} denominator - Second number
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted ratio like "2.5:1"
 */
export const formatRatio = (numerator, denominator, decimals = 1) => {
  if (denominator === 0 || isNaN(numerator) || isNaN(denominator)) {
    return 'N/A';
  }
  
  const ratio = numerator / denominator;
  return `${ratio.toFixed(decimals)}:1`;
};

/**
 * Format a value as ordinal (1st, 2nd, 3rd, etc.)
 * @param {number} value - Number to format
 * @returns {string} Ordinal string like "1st", "2nd", "3rd"
 */
export const formatOrdinal = (value) => {
  if (isNaN(value) || value === null || value === undefined) return '';
  
  const num = Math.floor(Math.abs(value));
  const suffix = ['th', 'st', 'nd', 'rd'];
  const mod = num % 100;
  
  return num + (suffix[(mod - 20) % 10] || suffix[mod] || suffix[0]);
};

/**
 * Calculate and format a rate (per 100, 1000, etc.)
 * @param {number} numerator - Count value
 * @param {number} denominator - Total value
 * @param {number} per - Rate per X (default: 100 for percentage)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted rate
 */
export const formatRate = (numerator, denominator, per = 100, decimals = 1) => {
  if (denominator === 0 || isNaN(numerator) || isNaN(denominator)) {
    return '0.0';
  }
  
  const rate = (numerator / denominator) * per;
  return rate.toFixed(decimals);
};

/**
 * Format tenure or duration
 * @param {number} years - Number of years
 * @param {number} months - Number of additional months (default: 0)
 * @returns {string} Formatted tenure like "2.5 years" or "8 months"
 */
export const formatTenure = (years, months = 0) => {
  if (isNaN(years)) return '0 years';
  
  const totalMonths = (years * 12) + (months || 0);
  
  if (totalMonths < 12) {
    return `${totalMonths} ${totalMonths === 1 ? 'month' : 'months'}`;
  } else if (totalMonths % 12 === 0) {
    const y = totalMonths / 12;
    return `${y} ${y === 1 ? 'year' : 'years'}`;
  } else {
    const y = Math.floor(totalMonths / 12);
    const m = totalMonths % 12;
    return `${y}.${Math.round(m / 12 * 10)} years`;
  }
};

/**
 * Format a variance between actual and target
 * @param {number} actual - Actual value
 * @param {number} target - Target value
 * @param {boolean} isPercentage - Whether values are percentages (default: false)
 * @returns {Object} Variance analysis object
 */
export const formatVariance = (actual, target, isPercentage = false) => {
  if (isNaN(actual) || isNaN(target)) {
    return {
      variance: 0,
      formatted: '0.0',
      type: 'neutral',
      message: 'No data'
    };
  }
  
  const variance = actual - target;
  const percentageVariance = target !== 0 ? (variance / Math.abs(target)) * 100 : 0;
  
  let type = 'neutral';
  let message = 'On target';
  
  if (variance > 0) {
    type = 'positive';
    message = isPercentage ? 'Above target' : 'Above target';
  } else if (variance < 0) {
    type = 'negative';
    message = isPercentage ? 'Below target' : 'Below target';
  }
  
  return {
    variance: variance,
    percentageVariance: percentageVariance,
    formatted: isPercentage ? 
      formatPercentageFromNumber(variance, 1, true) : 
      formatNumber(variance, 1, true),
    type: type,
    message: message
  };
};

/**
 * Format benchmark comparison
 * @param {number} ourValue - Our organization's value
 * @param {number} benchmarkValue - Benchmark value
 * @param {boolean} higherIsBetter - Whether higher values are better (default: false)
 * @returns {Object} Benchmark comparison object
 */
export const formatBenchmarkComparison = (ourValue, benchmarkValue, higherIsBetter = false) => {
  if (isNaN(ourValue) || isNaN(benchmarkValue)) {
    return {
      difference: 0,
      performance: 'Unknown',
      message: 'No benchmark data',
      type: 'neutral'
    };
  }
  
  const difference = ourValue - benchmarkValue;
  const percentDiff = benchmarkValue !== 0 ? Math.abs(difference / benchmarkValue) * 100 : 0;
  
  let performance, type, message;
  
  if (Math.abs(difference) < 0.1) {
    performance = 'At benchmark';
    type = 'neutral';
    message = 'Performance matches benchmark';
  } else if ((higherIsBetter && difference > 0) || (!higherIsBetter && difference < 0)) {
    if (percentDiff > 10) {
      performance = 'Significantly better';
      type = 'positive';
    } else {
      performance = 'Better than benchmark';
      type = 'positive';
    }
    message = `${percentDiff.toFixed(1)}% ${higherIsBetter ? 'above' : 'below'} benchmark`;
  } else {
    if (percentDiff > 10) {
      performance = 'Significantly below';
      type = 'negative';
    } else {
      performance = 'Below benchmark';
      type = 'warning';
    }
    message = `${percentDiff.toFixed(1)}% ${higherIsBetter ? 'below' : 'above'} benchmark`;
  }
  
  return {
    difference: difference,
    percentDifference: percentDiff,
    performance: performance,
    message: message,
    type: type
  };
};

/**
 * Round to specified decimal places with proper rounding
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded value
 */
export const roundTo = (value, decimals = 0) => {
  if (isNaN(value)) return 0;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Safe division that handles division by zero
 * @param {number} numerator - Numerator
 * @param {number} denominator - Denominator
 * @param {number} defaultValue - Default value if division by zero (default: 0)
 * @returns {number} Result of division or default value
 */
export const safeDivide = (numerator, denominator, defaultValue = 0) => {
  if (denominator === 0 || isNaN(numerator) || isNaN(denominator)) {
    return defaultValue;
  }
  return numerator / denominator;
};

/**
 * Format confidence interval
 * @param {number} lowerBound - Lower bound of interval
 * @param {number} upperBound - Upper bound of interval
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted interval like "12.5% - 15.8%"
 */
export const formatConfidenceInterval = (lowerBound, upperBound, decimals = 1) => {
  if (isNaN(lowerBound) || isNaN(upperBound)) return 'N/A';
  
  return `${lowerBound.toFixed(decimals)}% - ${upperBound.toFixed(decimals)}%`;
}; 