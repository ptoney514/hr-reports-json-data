/**
 * Data Comparison Service
 *
 * Utility for comparing data between JSON and API sources to validate parity
 * during the migration from static JSON files to Neon Postgres API.
 *
 * Used for:
 * - Validating that API returns same data as JSON
 * - Identifying discrepancies between sources
 * - Running parallel validation before cutover
 */

import * as staticData from '../data/staticData';
import * as apiService from './apiService';

/**
 * Deep equality check for comparing data objects
 * @param {*} obj1 - First object
 * @param {*} obj2 - Second object
 * @returns {boolean} True if objects are deeply equal
 */
export function deepEqual(obj1, obj2) {
  // Handle primitives and null/undefined
  if (obj1 === obj2) return true;
  if (obj1 === null || obj2 === null) return false;
  if (obj1 === undefined || obj2 === undefined) return false;
  if (typeof obj1 !== typeof obj2) return false;

  // Handle arrays
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    return obj1.every((item, index) => deepEqual(item, obj2[index]));
  }

  // Check if one is array and other is not
  if (Array.isArray(obj1) !== Array.isArray(obj2)) {
    return false;
  }

  // Handle objects
  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every(key => deepEqual(obj1[key], obj2[key]));
  }

  // Handle numbers with tolerance for floating point
  if (typeof obj1 === 'number' && typeof obj2 === 'number') {
    if (Number.isNaN(obj1) && Number.isNaN(obj2)) return true;
    // Allow small floating point differences
    return Math.abs(obj1 - obj2) < 0.0001;
  }

  return false;
}

/**
 * Find differences between two objects
 * @param {Object} obj1 - First object (typically JSON source)
 * @param {Object} obj2 - Second object (typically API source)
 * @param {string} path - Current path for nested differences
 * @returns {Array} Array of difference objects
 */
export function findDifferences(obj1, obj2, path = '') {
  const differences = [];

  // Handle null/undefined
  if (obj1 === null || obj1 === undefined) {
    if (obj2 !== null && obj2 !== undefined) {
      differences.push({
        path: path || 'root',
        type: 'missing_in_json',
        jsonValue: obj1,
        apiValue: obj2
      });
    }
    return differences;
  }

  if (obj2 === null || obj2 === undefined) {
    differences.push({
      path: path || 'root',
      type: 'missing_in_api',
      jsonValue: obj1,
      apiValue: obj2
    });
    return differences;
  }

  // Handle type mismatch
  if (typeof obj1 !== typeof obj2) {
    differences.push({
      path: path || 'root',
      type: 'type_mismatch',
      jsonValue: obj1,
      apiValue: obj2,
      jsonType: typeof obj1,
      apiType: typeof obj2
    });
    return differences;
  }

  // Handle arrays
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      differences.push({
        path: path || 'root',
        type: 'array_length_mismatch',
        jsonLength: obj1.length,
        apiLength: obj2.length
      });
    }
    const minLength = Math.min(obj1.length, obj2.length);
    for (let i = 0; i < minLength; i++) {
      differences.push(...findDifferences(obj1[i], obj2[i], `${path}[${i}]`));
    }
    return differences;
  }

  // Handle objects
  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

    for (const key of allKeys) {
      const newPath = path ? `${path}.${key}` : key;

      if (!(key in obj1)) {
        differences.push({
          path: newPath,
          type: 'missing_in_json',
          jsonValue: undefined,
          apiValue: obj2[key]
        });
      } else if (!(key in obj2)) {
        differences.push({
          path: newPath,
          type: 'missing_in_api',
          jsonValue: obj1[key],
          apiValue: undefined
        });
      } else {
        differences.push(...findDifferences(obj1[key], obj2[key], newPath));
      }
    }
    return differences;
  }

  // Handle primitives
  if (obj1 !== obj2) {
    // Special handling for numbers with tolerance
    if (typeof obj1 === 'number' && typeof obj2 === 'number') {
      if (Math.abs(obj1 - obj2) >= 0.0001) {
        differences.push({
          path: path || 'root',
          type: 'value_mismatch',
          jsonValue: obj1,
          apiValue: obj2
        });
      }
    } else {
      differences.push({
        path: path || 'root',
        type: 'value_mismatch',
        jsonValue: obj1,
        apiValue: obj2
      });
    }
  }

  return differences;
}

/**
 * Data type to getter function mapping
 */
const DATA_GETTERS = {
  workforce: {
    json: (date) => staticData.getWorkforceData(date),
    api: (date) => apiService.getWorkforceData(date)
  },
  turnover: {
    json: (date) => staticData.getTurnoverData(date),
    api: (date) => apiService.getTurnoverData(date)
  },
  exitSurvey: {
    json: (date) => staticData.getExitSurveyData(date),
    api: (date) => apiService.getExitSurveyData(date)
  },
  schoolOrg: {
    json: (date) => staticData.getTop15SchoolOrgData(date),
    api: (date) => apiService.getTop15SchoolOrgData(date)
  },
  annualRates: {
    json: () => staticData.getAnnualTurnoverRatesByCategory(),
    api: () => apiService.getAnnualTurnoverRates()
  },
  quarterlyWorkforce: {
    json: (date) => staticData.getQuarterlyWorkforceData(date),
    api: (date) => apiService.getWorkforceData(date)
  },
  quarterlyTurnover: {
    json: (date) => staticData.getQuarterlyTurnoverData(date),
    api: (date) => apiService.getTurnoverData(date)
  }
};

/**
 * Compare data from both JSON and API sources
 * @param {string} dataType - Type of data to compare (workforce, turnover, etc.)
 * @param {string} [date] - Date for date-based queries
 * @returns {Promise<Object>} Comparison result with match status and differences
 */
export async function compareDataSources(dataType, date) {
  const getter = DATA_GETTERS[dataType];

  if (!getter) {
    throw new Error(`Unknown data type: ${dataType}. Valid types: ${Object.keys(DATA_GETTERS).join(', ')}`);
  }

  try {
    // Get JSON data (sync)
    const jsonData = date ? getter.json(date) : getter.json();

    // Get API data (async)
    let apiData;
    try {
      apiData = date ? await getter.api(date) : await getter.api();
    } catch (apiError) {
      return {
        match: false,
        jsonData,
        apiData: null,
        apiError: apiError.message,
        differences: [{
          path: 'root',
          type: 'api_unavailable',
          message: apiError.message
        }],
        timestamp: new Date().toISOString()
      };
    }

    // Compare the data
    const isMatch = deepEqual(jsonData, apiData);
    const differences = isMatch ? [] : findDifferences(jsonData, apiData);

    return {
      match: isMatch,
      jsonData,
      apiData,
      differences,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      match: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Validate all endpoints and compare JSON vs API data
 * @param {string} [date='2025-06-30'] - Date for date-based queries
 * @returns {Promise<Object>} Validation results for all endpoints
 */
export async function validateAllEndpoints(date = '2025-06-30') {
  const dataTypes = Object.keys(DATA_GETTERS);
  const results = {};

  // Run all comparisons in parallel
  const comparisons = await Promise.allSettled(
    dataTypes.map(async (dataType) => ({
      dataType,
      result: await compareDataSources(dataType, date)
    }))
  );

  // Process results
  for (const comparison of comparisons) {
    if (comparison.status === 'fulfilled') {
      results[comparison.value.dataType] = comparison.value.result;
    } else {
      results[comparison.value?.dataType || 'unknown'] = {
        match: false,
        error: comparison.reason?.message || 'Comparison failed'
      };
    }
  }

  // Calculate summary
  const allMatch = Object.values(results).every(r => r.match === true);
  const matchCount = Object.values(results).filter(r => r.match === true).length;
  const errorCount = Object.values(results).filter(r => r.error || r.apiError).length;

  return {
    allMatch,
    summary: {
      total: dataTypes.length,
      matched: matchCount,
      mismatched: dataTypes.length - matchCount - errorCount,
      errors: errorCount
    },
    results,
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate a detailed comparison report
 * @param {Object} validationResult - Result from validateAllEndpoints
 * @returns {string} Human-readable report
 */
export function generateComparisonReport(validationResult) {
  const lines = [
    '=== Data Source Comparison Report ===',
    `Timestamp: ${validationResult.timestamp}`,
    '',
    '--- Summary ---',
    `All Match: ${validationResult.allMatch ? 'YES' : 'NO'}`,
    `Total Endpoints: ${validationResult.summary.total}`,
    `Matched: ${validationResult.summary.matched}`,
    `Mismatched: ${validationResult.summary.mismatched}`,
    `Errors: ${validationResult.summary.errors}`,
    ''
  ];

  for (const [dataType, result] of Object.entries(validationResult.results)) {
    lines.push(`--- ${dataType} ---`);

    if (result.error || result.apiError) {
      lines.push(`Status: ERROR`);
      lines.push(`Message: ${result.error || result.apiError}`);
    } else if (result.match) {
      lines.push(`Status: MATCH`);
    } else {
      lines.push(`Status: MISMATCH`);
      lines.push(`Differences (${result.differences.length}):`);
      for (const diff of result.differences.slice(0, 5)) {
        lines.push(`  - ${diff.path}: ${diff.type}`);
        if (diff.jsonValue !== undefined) {
          lines.push(`    JSON: ${JSON.stringify(diff.jsonValue)}`);
        }
        if (diff.apiValue !== undefined) {
          lines.push(`    API: ${JSON.stringify(diff.apiValue)}`);
        }
      }
      if (result.differences.length > 5) {
        lines.push(`  ... and ${result.differences.length - 5} more differences`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Quick parity check for critical metrics
 * @param {string} date - Date to check
 * @returns {Promise<Object>} Parity check results
 */
export async function checkCriticalParity(date = '2025-06-30') {
  const checks = [];

  try {
    // Check FY25 termination count = 222
    const jsonTurnover = staticData.getTurnoverData(date);
    const apiTurnover = await apiService.getTurnoverData(date);

    checks.push({
      name: 'FY25 Termination Count',
      expected: 222,
      jsonValue: jsonTurnover?.terminations || jsonTurnover?.total,
      apiValue: apiTurnover?.terminations || apiTurnover?.total,
      passed: (jsonTurnover?.terminations || jsonTurnover?.total) === 222
    });

    // Check workforce headcount exists
    const jsonWorkforce = staticData.getWorkforceData(date);
    const apiWorkforce = await apiService.getWorkforceData(date);

    checks.push({
      name: 'Workforce Headcount',
      jsonValue: jsonWorkforce?.totalEmployees,
      apiValue: apiWorkforce?.totalEmployees,
      passed: jsonWorkforce?.totalEmployees > 0 && apiWorkforce?.totalEmployees > 0
    });

    // Check exit survey response rate
    const jsonExitSurvey = staticData.getExitSurveyData(date);
    const apiExitSurvey = await apiService.getExitSurveyData(date);

    checks.push({
      name: 'Exit Survey Response Rate',
      jsonValue: jsonExitSurvey?.responseRate,
      apiValue: apiExitSurvey?.responseRate,
      passed: Math.abs((jsonExitSurvey?.responseRate || 0) - (apiExitSurvey?.responseRate || 0)) < 1
    });

  } catch (error) {
    checks.push({
      name: 'API Connectivity',
      error: error.message,
      passed: false
    });
  }

  return {
    allPassed: checks.every(c => c.passed),
    checks,
    timestamp: new Date().toISOString()
  };
}

export default {
  deepEqual,
  findDifferences,
  compareDataSources,
  validateAllEndpoints,
  generateComparisonReport,
  checkCriticalParity
};
