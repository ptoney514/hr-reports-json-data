/**
 * Workforce Validation Service
 *
 * Validates JSON data against Neon database data for the Workforce Dashboard.
 * Ensures all labels and values match before cutover from JSON to API.
 *
 * Validation Categories:
 * - Summary Cards (6 metrics) - JSON vs Neon
 * - Location Breakdown - Omaha (6 metrics) - JSON vs Neon
 * - Location Breakdown - Phoenix (6 metrics) - JSON vs Neon
 * - Demographics (34 metrics) - JSON-only (future ETL target)
 */

import * as staticData from '../data/staticData';
import * as apiService from './apiService';

/**
 * Validation rules for all 52 data points
 *
 * Each rule defines:
 * - id: Unique identifier
 * - label: Human-readable metric name
 * - jsonPath: Path to extract value from JSON data
 * - apiPath: Path to extract value from API data (null for JSON-only)
 * - category: Grouping for UI display
 * - expected: Expected value (for reference)
 */
export const VALIDATION_RULES = {
  summaryCards: [
    {
      id: 'staff',
      label: 'Benefit Eligible Staff',
      jsonPath: 'staff',
      apiPath: 'staff',
      expected: 1448
    },
    {
      id: 'faculty',
      label: 'Benefit Eligible Faculty',
      jsonPath: 'faculty',
      apiPath: 'faculty',
      expected: 689
    },
    {
      id: 'hsp',
      label: 'Benefit Eligible HSP',
      jsonPath: 'hsp',
      apiPath: 'hsp',
      expected: 612
    },
    {
      id: 'students',
      label: 'Student Workers',
      jsonPath: 'studentCount.total',
      apiPath: 'students',
      expected: 1714
    },
    {
      id: 'temp',
      label: 'Non-Benefit Eligible',
      jsonPath: 'temp',
      apiPath: 'temp',
      expected: 574
    },
    {
      id: 'total',
      label: 'TOTAL',
      jsonPath: 'totalEmployees',
      apiPath: 'totalEmployees',
      expected: 5037
    }
  ],

  locationOmaha: [
    {
      id: 'omaha_total',
      label: 'Total',
      jsonPath: 'locations["Omaha Campus"]',
      apiPath: 'locationDetails.omaha.total',
      expected: 4287
    },
    {
      id: 'omaha_faculty',
      label: 'Faculty',
      jsonPath: 'locationDetails.omaha.faculty',
      apiPath: 'locationDetails.omaha.faculty',
      expected: 649
    },
    {
      id: 'omaha_staff',
      label: 'Staff',
      jsonPath: 'locationDetails.omaha.staff',
      apiPath: 'locationDetails.omaha.staff',
      expected: 1344
    },
    {
      id: 'omaha_hsp',
      label: 'HSP',
      jsonPath: 'locationDetails.omaha.hsp',
      apiPath: 'locationDetails.omaha.hsp',
      expected: 268
    },
    {
      id: 'omaha_students',
      label: 'Students',
      jsonPath: 'locationDetails.omaha.students',
      apiPath: 'locationDetails.omaha.students',
      expected: 1604
    },
    {
      id: 'omaha_temp',
      label: 'Temp/NBE',
      jsonPath: 'locationDetails.omaha.temp',
      apiPath: 'locationDetails.omaha.temp',
      expected: 422
    }
  ],

  locationPhoenix: [
    {
      id: 'phoenix_total',
      label: 'Total',
      jsonPath: 'locations["Phoenix Campus"]',
      apiPath: 'locationDetails.phoenix.total',
      expected: 750
    },
    {
      id: 'phoenix_faculty',
      label: 'Faculty',
      jsonPath: 'locationDetails.phoenix.faculty',
      apiPath: 'locationDetails.phoenix.faculty',
      expected: 40
    },
    {
      id: 'phoenix_staff',
      label: 'Staff',
      jsonPath: 'locationDetails.phoenix.staff',
      apiPath: 'locationDetails.phoenix.staff',
      expected: 104
    },
    {
      id: 'phoenix_hsp',
      label: 'HSP',
      jsonPath: 'locationDetails.phoenix.hsp',
      apiPath: 'locationDetails.phoenix.hsp',
      expected: 344
    },
    {
      id: 'phoenix_students',
      label: 'Students',
      jsonPath: 'locationDetails.phoenix.students',
      apiPath: 'locationDetails.phoenix.students',
      expected: 110
    },
    {
      id: 'phoenix_temp',
      label: 'Temp/NBE',
      jsonPath: 'locationDetails.phoenix.temp',
      apiPath: 'locationDetails.phoenix.temp',
      expected: 152
    }
  ],

  // Demographics - Now backed by Neon via demographics ETL
  gender: [
    {
      id: 'faculty_male',
      label: 'Faculty Male',
      jsonPath: 'demographics.gender.faculty.male',
      apiPath: 'demographics.gender.faculty.male',
      expected: 321
    },
    {
      id: 'faculty_female',
      label: 'Faculty Female',
      jsonPath: 'demographics.gender.faculty.female',
      apiPath: 'demographics.gender.faculty.female',
      expected: 368
    },
    {
      id: 'staff_male',
      label: 'Staff Male',
      jsonPath: 'demographics.gender.staff.male',
      apiPath: 'demographics.gender.staff.male',
      expected: 534
    },
    {
      id: 'staff_female',
      label: 'Staff Female',
      jsonPath: 'demographics.gender.staff.female',
      apiPath: 'demographics.gender.staff.female',
      expected: 914
    }
  ],

  ethnicityFaculty: [
    { id: 'faculty_white', label: 'White', jsonPath: 'demographics.ethnicity.faculty["White"]', apiPath: 'demographics.ethnicity.faculty["White"]', expected: 536 },
    { id: 'faculty_asian', label: 'Asian', jsonPath: 'demographics.ethnicity.faculty["Asian"]', apiPath: 'demographics.ethnicity.faculty["Asian"]', expected: 51 },
    { id: 'faculty_not_disclosed', label: 'Not Disclosed', jsonPath: 'demographics.ethnicity.faculty["Not Disclosed"]', apiPath: 'demographics.ethnicity.faculty["Not Disclosed"]', expected: 45 },
    { id: 'faculty_black', label: 'Black/African American', jsonPath: 'demographics.ethnicity.faculty["Black or African American"]', apiPath: 'demographics.ethnicity.faculty["Black or African American"]', expected: 18 },
    { id: 'faculty_multi', label: 'More than one Ethnicity', jsonPath: 'demographics.ethnicity.faculty["More than one Ethnicity"]', apiPath: 'demographics.ethnicity.faculty["More than one Ethnicity"]', expected: 13 },
    { id: 'faculty_hispanic', label: 'Hispanic/Latino', jsonPath: 'demographics.ethnicity.faculty["Hispanic or Latino"]', apiPath: 'demographics.ethnicity.faculty["Hispanic or Latino"]', expected: 12 },
    { id: 'faculty_not_disclosed2', label: 'Not disclosed (alternate)', jsonPath: 'demographics.ethnicity.faculty["Not disclosed"]', apiPath: 'demographics.ethnicity.faculty["Not disclosed"]', expected: 7 },
    { id: 'faculty_two_races', label: 'Two or more races', jsonPath: 'demographics.ethnicity.faculty["Two or more races"]', apiPath: 'demographics.ethnicity.faculty["Two or more races"]', expected: 4 },
    { id: 'faculty_native', label: 'American Indian/Alaska Native', jsonPath: 'demographics.ethnicity.faculty["American Indian or Alaska Native"]', apiPath: 'demographics.ethnicity.faculty["American Indian or Alaska Native"]', expected: 3 }
  ],

  ethnicityStaff: [
    { id: 'staff_white', label: 'White', jsonPath: 'demographics.ethnicity.staff["White"]', apiPath: 'demographics.ethnicity.staff["White"]', expected: 998 },
    { id: 'staff_not_disclosed', label: 'Not Disclosed', jsonPath: 'demographics.ethnicity.staff["Not Disclosed"]', apiPath: 'demographics.ethnicity.staff["Not Disclosed"]', expected: 123 },
    { id: 'staff_asian', label: 'Asian', jsonPath: 'demographics.ethnicity.staff["Asian"]', apiPath: 'demographics.ethnicity.staff["Asian"]', expected: 105 },
    { id: 'staff_black', label: 'Black/African American', jsonPath: 'demographics.ethnicity.staff["Black or African American"]', apiPath: 'demographics.ethnicity.staff["Black or African American"]', expected: 86 },
    { id: 'staff_hispanic', label: 'Hispanic/Latino', jsonPath: 'demographics.ethnicity.staff["Hispanic or Latino"]', apiPath: 'demographics.ethnicity.staff["Hispanic or Latino"]', expected: 63 },
    { id: 'staff_multi', label: 'More than one Ethnicity', jsonPath: 'demographics.ethnicity.staff["More than one Ethnicity"]', apiPath: 'demographics.ethnicity.staff["More than one Ethnicity"]', expected: 41 },
    { id: 'staff_two_races', label: 'Two or more races', jsonPath: 'demographics.ethnicity.staff["Two or more races"]', apiPath: 'demographics.ethnicity.staff["Two or more races"]', expected: 18 },
    { id: 'staff_native', label: 'American Indian/Alaska Native', jsonPath: 'demographics.ethnicity.staff["American Indian or Alaska Native"]', apiPath: 'demographics.ethnicity.staff["American Indian or Alaska Native"]', expected: 6 },
    { id: 'staff_not_disclosed2', label: 'Not disclosed (alternate)', jsonPath: 'demographics.ethnicity.staff["Not disclosed"]', apiPath: 'demographics.ethnicity.staff["Not disclosed"]', expected: 5 },
    { id: 'staff_pacific', label: 'Pacific Islander', jsonPath: 'demographics.ethnicity.staff["Native Hawaiian or other Pacific Islander"]', apiPath: 'demographics.ethnicity.staff["Native Hawaiian or other Pacific Islander"]', expected: 3 }
  ],

  ageBandsFaculty: [
    { id: 'faculty_20_30', label: '20-30', jsonPath: 'demographics.ageBands.faculty["20-30"]', apiPath: 'demographics.ageBands.faculty["20-30"]', expected: 10 },
    { id: 'faculty_31_40', label: '31-40', jsonPath: 'demographics.ageBands.faculty["31-40"]', apiPath: 'demographics.ageBands.faculty["31-40"]', expected: 143 },
    { id: 'faculty_41_50', label: '41-50', jsonPath: 'demographics.ageBands.faculty["41-50"]', apiPath: 'demographics.ageBands.faculty["41-50"]', expected: 193 },
    { id: 'faculty_51_60', label: '51-60', jsonPath: 'demographics.ageBands.faculty["51-60"]', apiPath: 'demographics.ageBands.faculty["51-60"]', expected: 165 },
    { id: 'faculty_61_plus', label: '61 Plus', jsonPath: 'demographics.ageBands.faculty["61 Plus"]', apiPath: 'demographics.ageBands.faculty["61 Plus"]', expected: 178 }
  ],

  ageBandsStaff: [
    { id: 'staff_20_30', label: '20-30', jsonPath: 'demographics.ageBands.staff["20-30"]', apiPath: 'demographics.ageBands.staff["20-30"]', expected: 236 },
    { id: 'staff_31_40', label: '31-40', jsonPath: 'demographics.ageBands.staff["31-40"]', apiPath: 'demographics.ageBands.staff["31-40"]', expected: 302 },
    { id: 'staff_41_50', label: '41-50', jsonPath: 'demographics.ageBands.staff["41-50"]', apiPath: 'demographics.ageBands.staff["41-50"]', expected: 333 },
    { id: 'staff_51_60', label: '51-60', jsonPath: 'demographics.ageBands.staff["51-60"]', apiPath: 'demographics.ageBands.staff["51-60"]', expected: 343 },
    { id: 'staff_61_plus', label: '61 Plus', jsonPath: 'demographics.ageBands.staff["61 Plus"]', apiPath: 'demographics.ageBands.staff["61 Plus"]', expected: 234 }
  ]
};

/**
 * Get value from object using dot notation path
 * Supports bracket notation for keys with special characters
 *
 * @param {Object} obj - Source object
 * @param {string} path - Dot notation path (e.g., 'locations["Omaha Campus"]')
 * @returns {*} Value at path or undefined
 */
export function getValueByPath(obj, path) {
  if (!obj || !path) return undefined;

  // Handle bracket notation by converting to dot notation
  // e.g., 'locations["Omaha Campus"]' -> 'locations.Omaha Campus'
  const normalizedPath = path.replace(/\["([^"]+)"\]/g, '.$1');

  const parts = normalizedPath.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }

  return current;
}

/**
 * Compare two values for equality
 * Handles numbers with tolerance for floating point
 *
 * @param {*} jsonValue - Value from JSON source
 * @param {*} apiValue - Value from API source
 * @returns {boolean} True if values match
 */
export function compareValues(jsonValue, apiValue) {
  if (jsonValue === apiValue) return true;

  // Handle number comparison with tolerance
  if (typeof jsonValue === 'number' && typeof apiValue === 'number') {
    return Math.abs(jsonValue - apiValue) < 0.01;
  }

  return false;
}

/**
 * Format value for display
 * @param {*} value - Value to format
 * @returns {string} Formatted value
 */
export function formatValue(value) {
  if (value === undefined || value === null) return '--';
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  return String(value);
}

/**
 * Run validation for a specific category of rules
 *
 * @param {Array} rules - Array of validation rules
 * @param {Object} jsonData - JSON source data
 * @param {Object} apiData - API source data (optional)
 * @returns {Array} Array of validation results
 */
export function validateCategory(rules, jsonData, apiData = null) {
  return rules.map(rule => {
    const jsonValue = getValueByPath(jsonData, rule.jsonPath);
    const apiValue = rule.apiPath && apiData ? getValueByPath(apiData, rule.apiPath) : null;

    // Determine if this is JSON-only (no API path)
    const isJsonOnly = rule.apiPath === null;

    // Determine match status
    let match = false;
    let status = 'pending';

    if (isJsonOnly) {
      // JSON-only metrics are informational
      status = 'json_only';
      match = jsonValue !== undefined;
    } else if (apiData === null) {
      // API not available
      status = 'api_unavailable';
    } else if (apiValue === undefined || apiValue === null) {
      // API value missing
      status = 'api_missing';
    } else {
      // Compare values
      match = compareValues(jsonValue, apiValue);
      status = match ? 'passed' : 'failed';
    }

    return {
      id: rule.id,
      label: rule.label,
      jsonValue,
      apiValue,
      expected: rule.expected,
      match,
      status,
      isJsonOnly
    };
  });
}

/**
 * Run all workforce validations
 *
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Complete validation results
 */
export async function validateWorkforceData(date = '2025-06-30') {
  const startTime = Date.now();

  // Get JSON data (synchronous)
  const jsonData = staticData.getWorkforceData(date);

  // Get API data (asynchronous) - both workforce and demographics
  let apiData = null;
  let demographicsData = null;
  let apiError = null;

  try {
    apiData = await apiService.getWorkforceData(date);
  } catch (error) {
    apiError = error.message;
    console.warn('[WorkforceValidation] Workforce API unavailable:', error.message);
  }

  try {
    demographicsData = await apiService.getDemographicsData(date);
    // Merge demographics into apiData for validation
    if (apiData) {
      apiData.demographics = demographicsData;
    } else if (demographicsData) {
      apiData = { demographics: demographicsData };
    }
  } catch (error) {
    console.warn('[WorkforceValidation] Demographics API unavailable:', error.message);
    if (!apiError) apiError = error.message;
  }

  // Run validations by category
  const results = {
    summaryCards: validateCategory(VALIDATION_RULES.summaryCards, jsonData, apiData),
    locationOmaha: validateCategory(VALIDATION_RULES.locationOmaha, jsonData, apiData),
    locationPhoenix: validateCategory(VALIDATION_RULES.locationPhoenix, jsonData, apiData),
    gender: validateCategory(VALIDATION_RULES.gender, jsonData, apiData),
    ethnicityFaculty: validateCategory(VALIDATION_RULES.ethnicityFaculty, jsonData, apiData),
    ethnicityStaff: validateCategory(VALIDATION_RULES.ethnicityStaff, jsonData, apiData),
    ageBandsFaculty: validateCategory(VALIDATION_RULES.ageBandsFaculty, jsonData, apiData),
    ageBandsStaff: validateCategory(VALIDATION_RULES.ageBandsStaff, jsonData, apiData)
  };

  // Calculate summary statistics
  const allResults = Object.values(results).flat();
  const headcountResults = [
    ...results.summaryCards,
    ...results.locationOmaha,
    ...results.locationPhoenix
  ];
  const demographicsResults = [
    ...results.gender,
    ...results.ethnicityFaculty,
    ...results.ethnicityStaff,
    ...results.ageBandsFaculty,
    ...results.ageBandsStaff
  ];

  const totalChecks = allResults.length;
  const passedChecks = allResults.filter(r => r.status === 'passed').length;
  const failedChecks = allResults.filter(r => r.status === 'failed').length;
  const jsonOnlyChecks = allResults.filter(r => r.status === 'json_only').length;
  const apiUnavailableChecks = allResults.filter(r => r.status === 'api_unavailable').length;

  // Headcount-specific stats (what we can actually validate)
  const headcountTotal = headcountResults.length;
  const headcountPassed = headcountResults.filter(r => r.status === 'passed').length;
  const headcountFailed = headcountResults.filter(r => r.status === 'failed').length;

  // Overall status
  let overallStatus = 'passed';
  if (failedChecks > 0) {
    overallStatus = 'failed';
  } else if (apiUnavailableChecks > 0 && passedChecks === 0) {
    overallStatus = 'api_unavailable';
  } else if (passedChecks > 0 && apiUnavailableChecks > 0) {
    overallStatus = 'partial';
  }

  const matchRate = headcountTotal > 0
    ? Math.round((headcountPassed / (headcountPassed + headcountFailed || 1)) * 100)
    : 0;

  return {
    date,
    status: overallStatus,
    apiAvailable: apiData !== null,
    apiError,
    summary: {
      totalChecks,
      passedChecks,
      failedChecks,
      jsonOnlyChecks,
      apiUnavailableChecks,
      matchRate
    },
    headcount: {
      total: headcountTotal,
      passed: headcountPassed,
      failed: headcountFailed,
      matchRate: headcountTotal > 0 ? Math.round((headcountPassed / (headcountPassed + headcountFailed || 1)) * 100) : 0
    },
    demographics: {
      total: demographicsResults.length,
      jsonOnly: jsonOnlyChecks
    },
    results,
    metadata: {
      jsonSource: 'src/data/staticData.js (WORKFORCE_DATA["' + date + '"])',
      apiSource: 'fact_workforce_snapshots + v_workforce_summary',
      duration: Date.now() - startTime
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Get validation rules count by category
 * @returns {Object} Count of rules per category
 */
export function getValidationRulesCounts() {
  return {
    summaryCards: VALIDATION_RULES.summaryCards.length,
    locationOmaha: VALIDATION_RULES.locationOmaha.length,
    locationPhoenix: VALIDATION_RULES.locationPhoenix.length,
    gender: VALIDATION_RULES.gender.length,
    ethnicityFaculty: VALIDATION_RULES.ethnicityFaculty.length,
    ethnicityStaff: VALIDATION_RULES.ethnicityStaff.length,
    ageBandsFaculty: VALIDATION_RULES.ageBandsFaculty.length,
    ageBandsStaff: VALIDATION_RULES.ageBandsStaff.length,
    total: Object.values(VALIDATION_RULES).flat().length
  };
}

/**
 * Export validation results as JSON
 * @param {Object} results - Validation results
 * @returns {string} JSON string
 */
export function exportResults(results) {
  return JSON.stringify(results, null, 2);
}

/**
 * Generate a summary report string
 * @param {Object} results - Validation results
 * @returns {string} Human-readable report
 */
export function generateReport(results) {
  const lines = [
    '=== Workforce Data Validation Report ===',
    `Date: ${results.date}`,
    `Timestamp: ${results.timestamp}`,
    '',
    '--- Summary ---',
    `Status: ${results.status.toUpperCase()}`,
    `API Available: ${results.apiAvailable ? 'Yes' : 'No'}`,
    results.apiError ? `API Error: ${results.apiError}` : '',
    '',
    '--- Headcount Validation (JSON vs Neon) ---',
    `Total Checks: ${results.headcount.total}`,
    `Passed: ${results.headcount.passed}`,
    `Failed: ${results.headcount.failed}`,
    `Match Rate: ${results.headcount.matchRate}%`,
    '',
    '--- Demographics (JSON-only) ---',
    `Total Metrics: ${results.demographics.total}`,
    `Status: Informational (needs future ETL to Neon)`,
    '',
    '--- Duration ---',
    `${results.metadata.duration}ms`,
  ];

  return lines.filter(Boolean).join('\n');
}

const workforceValidationService = {
  VALIDATION_RULES,
  getValueByPath,
  compareValues,
  formatValue,
  validateCategory,
  validateWorkforceData,
  getValidationRulesCounts,
  exportResults,
  generateReport
};

export default workforceValidationService;
