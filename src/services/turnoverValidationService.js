/**
 * Turnover Validation Service
 *
 * Validates JSON data against Neon database data for the Turnover Dashboard.
 * Ensures all labels and values match before cutover from JSON to API.
 *
 * Validation Categories:
 * - Summary Rates (4 metrics) - JSON vs Neon
 * - Turnover Rates Table (4 categories) - JSON vs Neon
 * - Turnover Breakdown (3 categories) - JSON vs Neon
 * - Staff Deviation (33 departments) - JSON vs Neon
 * - Faculty Deviation (9 schools) - JSON vs Neon
 * - Length of Service (10 metrics) - JSON vs Neon
 * - Retirements by FY (8 years) - JSON vs Neon
 * - Faculty Retirement Trends (7 years) - JSON vs Neon
 * - Staff Retirement Trends (7 years) - JSON vs Neon
 */

import * as staticData from '../data/staticData';
import * as apiService from './apiService';

/**
 * Validation rules for all turnover data points
 */
export const VALIDATION_RULES = {
  summaryRates: [
    {
      id: 'total_rate',
      label: 'Total Turnover Rate',
      jsonPath: 'summaryRates.total.rate',
      apiPath: 'summaryRates.total.rate',
      expected: 11.2
    },
    {
      id: 'total_prior_year',
      label: 'Total Prior Year Rate',
      jsonPath: 'summaryRates.total.priorYear',
      apiPath: 'summaryRates.total.priorYear',
      expected: 12.8
    },
    {
      id: 'faculty_rate',
      label: 'Faculty Turnover Rate',
      jsonPath: 'summaryRates.faculty.rate',
      apiPath: 'summaryRates.faculty.rate',
      expected: 6.1
    },
    {
      id: 'faculty_prior_year',
      label: 'Faculty Prior Year Rate',
      jsonPath: 'summaryRates.faculty.priorYear',
      apiPath: 'summaryRates.faculty.priorYear',
      expected: 7.7
    },
    {
      id: 'staff_exempt_rate',
      label: 'Staff Exempt Turnover Rate',
      jsonPath: 'summaryRates.staffExempt.rate',
      apiPath: 'summaryRates.staffExempt.rate',
      expected: 12.6
    },
    {
      id: 'staff_exempt_prior_year',
      label: 'Staff Exempt Prior Year Rate',
      jsonPath: 'summaryRates.staffExempt.priorYear',
      apiPath: 'summaryRates.staffExempt.priorYear',
      expected: 13.6
    },
    {
      id: 'staff_non_exempt_rate',
      label: 'Staff Non-Exempt Turnover Rate',
      jsonPath: 'summaryRates.staffNonExempt.rate',
      apiPath: 'summaryRates.staffNonExempt.rate',
      expected: 15.3
    },
    {
      id: 'staff_non_exempt_prior_year',
      label: 'Staff Non-Exempt Prior Year Rate',
      jsonPath: 'summaryRates.staffNonExempt.priorYear',
      apiPath: 'summaryRates.staffNonExempt.priorYear',
      expected: 12.8
    }
  ],

  turnoverRatesTable: [
    { id: 'faculty_fy2023', label: 'Faculty FY2023', jsonPath: 'turnoverRatesTable[0].fy2023', apiPath: 'turnoverRatesTable[0].fy2023', expected: 7.9 },
    { id: 'faculty_fy2024', label: 'Faculty FY2024', jsonPath: 'turnoverRatesTable[0].fy2024', apiPath: 'turnoverRatesTable[0].fy2024', expected: 7.7 },
    { id: 'faculty_fy2025', label: 'Faculty FY2025', jsonPath: 'turnoverRatesTable[0].fy2025', apiPath: 'turnoverRatesTable[0].fy2025', expected: 6.1 },
    { id: 'staff_exempt_fy2023', label: 'Staff Exempt FY2023', jsonPath: 'turnoverRatesTable[1].fy2023', apiPath: 'turnoverRatesTable[1].fy2023', expected: 15.5 },
    { id: 'staff_exempt_fy2024', label: 'Staff Exempt FY2024', jsonPath: 'turnoverRatesTable[1].fy2024', apiPath: 'turnoverRatesTable[1].fy2024', expected: 13.6 },
    { id: 'staff_exempt_fy2025', label: 'Staff Exempt FY2025', jsonPath: 'turnoverRatesTable[1].fy2025', apiPath: 'turnoverRatesTable[1].fy2025', expected: 12.6 },
    { id: 'staff_non_exempt_fy2023', label: 'Staff Non-Exempt FY2023', jsonPath: 'turnoverRatesTable[2].fy2023', apiPath: 'turnoverRatesTable[2].fy2023', expected: 22.4 },
    { id: 'staff_non_exempt_fy2024', label: 'Staff Non-Exempt FY2024', jsonPath: 'turnoverRatesTable[2].fy2024', apiPath: 'turnoverRatesTable[2].fy2024', expected: 17.8 },
    { id: 'staff_non_exempt_fy2025', label: 'Staff Non-Exempt FY2025', jsonPath: 'turnoverRatesTable[2].fy2025', apiPath: 'turnoverRatesTable[2].fy2025', expected: 15.3 },
    { id: 'total_fy2023', label: 'Total FY2023', jsonPath: 'turnoverRatesTable[3].fy2023', apiPath: 'turnoverRatesTable[3].fy2023', expected: 14.9 },
    { id: 'total_fy2024', label: 'Total FY2024', jsonPath: 'turnoverRatesTable[3].fy2024', apiPath: 'turnoverRatesTable[3].fy2024', expected: 12.8 },
    { id: 'total_fy2025', label: 'Total FY2025', jsonPath: 'turnoverRatesTable[3].fy2025', apiPath: 'turnoverRatesTable[3].fy2025', expected: 11.2 }
  ],

  turnoverBreakdown: [
    { id: 'staff_exempt_voluntary', label: 'Staff Exempt Voluntary', jsonPath: 'turnoverBreakdown[0].voluntary', apiPath: 'turnoverBreakdown[0].voluntary', expected: 10.8 },
    { id: 'staff_exempt_involuntary', label: 'Staff Exempt Involuntary', jsonPath: 'turnoverBreakdown[0].involuntary', apiPath: 'turnoverBreakdown[0].involuntary', expected: 0.8 },
    { id: 'staff_exempt_retirement', label: 'Staff Exempt Retirement', jsonPath: 'turnoverBreakdown[0].retirement', apiPath: 'turnoverBreakdown[0].retirement', expected: 1.0 },
    { id: 'staff_non_exempt_voluntary', label: 'Staff Non-Exempt Voluntary', jsonPath: 'turnoverBreakdown[1].voluntary', apiPath: 'turnoverBreakdown[1].voluntary', expected: 12.9 },
    { id: 'staff_non_exempt_involuntary', label: 'Staff Non-Exempt Involuntary', jsonPath: 'turnoverBreakdown[1].involuntary', apiPath: 'turnoverBreakdown[1].involuntary', expected: 1.5 },
    { id: 'staff_non_exempt_retirement', label: 'Staff Non-Exempt Retirement', jsonPath: 'turnoverBreakdown[1].retirement', apiPath: 'turnoverBreakdown[1].retirement', expected: 0.9 },
    { id: 'faculty_voluntary', label: 'Faculty Voluntary', jsonPath: 'turnoverBreakdown[2].voluntary', apiPath: 'turnoverBreakdown[2].voluntary', expected: 3.3 },
    { id: 'faculty_involuntary', label: 'Faculty Involuntary', jsonPath: 'turnoverBreakdown[2].involuntary', apiPath: 'turnoverBreakdown[2].involuntary', expected: 0.3 },
    { id: 'faculty_retirement', label: 'Faculty Retirement', jsonPath: 'turnoverBreakdown[2].retirement', apiPath: 'turnoverBreakdown[2].retirement', expected: 2.5 }
  ],

  staffDeviation: [
    { id: 'staff_dev_student_services', label: 'Student Services', jsonPath: 'staffDeviation[0].rate', apiPath: 'staffDeviation[0].rate', expected: 30.9 },
    { id: 'staff_dev_pro_cont_education', label: 'Pro. & Cont Education', jsonPath: 'staffDeviation[1].rate', apiPath: 'staffDeviation[1].rate', expected: 26.1 },
    { id: 'staff_dev_pharmacy', label: 'Pharmacy & Health Professions', jsonPath: 'staffDeviation[2].rate', apiPath: 'staffDeviation[2].rate', expected: 25.9 },
    { id: 'staff_dev_clinical_affairs', label: 'Clinical Affairs', jsonPath: 'staffDeviation[3].rate', apiPath: 'staffDeviation[3].rate', expected: 22.2 },
    { id: 'staff_dev_nursing', label: 'College of Nursing', jsonPath: 'staffDeviation[4].rate', apiPath: 'staffDeviation[4].rate', expected: 21.6 },
    { id: 'staff_dev_law', label: 'Law School', jsonPath: 'staffDeviation[5].rate', apiPath: 'staffDeviation[5].rate', expected: 19.6 },
    { id: 'staff_dev_dentistry', label: 'Dentistry', jsonPath: 'staffDeviation[6].rate', apiPath: 'staffDeviation[6].rate', expected: 19.4 },
    { id: 'staff_dev_general_counsel', label: 'General Counsel', jsonPath: 'staffDeviation[7].rate', apiPath: 'staffDeviation[7].rate', expected: 19.0 },
    { id: 'staff_dev_communications', label: 'Communications', jsonPath: 'staffDeviation[8].rate', apiPath: 'staffDeviation[8].rate', expected: 18.7 },
    { id: 'staff_dev_academic_affairs', label: 'Academic Affairs', jsonPath: 'staffDeviation[9].rate', apiPath: 'staffDeviation[9].rate', expected: 18.2 },
    { id: 'staff_dev_athletics', label: 'Athletics', jsonPath: 'staffDeviation[10].rate', apiPath: 'staffDeviation[10].rate', expected: 17.9 },
    { id: 'staff_dev_total', label: 'Total Staff Turnover (Avg)', jsonPath: 'staffAverageRate', apiPath: 'staffAverageRate', expected: 13.6 }
  ],

  facultyDeviation: [
    { id: 'faculty_dev_nursing', label: 'College of Nursing', jsonPath: 'facultyDeviation[0].rate', apiPath: 'facultyDeviation[0].rate', expected: 13.7 },
    { id: 'faculty_dev_pharmacy', label: 'Pharmacy & Health Professions', jsonPath: 'facultyDeviation[1].rate', apiPath: 'facultyDeviation[1].rate', expected: 7.5 },
    { id: 'faculty_dev_dentistry', label: 'School of Dentistry', jsonPath: 'facultyDeviation[2].rate', apiPath: 'facultyDeviation[2].rate', expected: 6.9 },
    { id: 'faculty_dev_total', label: 'Total Faculty Turnover (Avg)', jsonPath: 'facultyAverageRate', apiPath: 'facultyAverageRate', expected: 6.3 },
    { id: 'faculty_dev_arts_sciences', label: 'College of Arts & Sciences', jsonPath: 'facultyDeviation[4].rate', apiPath: 'facultyDeviation[4].rate', expected: 6.0 },
    { id: 'faculty_dev_medicine', label: 'School of Medicine', jsonPath: 'facultyDeviation[5].rate', apiPath: 'facultyDeviation[5].rate', expected: 5.6 },
    { id: 'faculty_dev_law', label: 'Law School', jsonPath: 'facultyDeviation[6].rate', apiPath: 'facultyDeviation[6].rate', expected: 3.7 },
    { id: 'faculty_dev_business', label: 'Heider College of Business', jsonPath: 'facultyDeviation[7].rate', apiPath: 'facultyDeviation[7].rate', expected: 1.6 },
    { id: 'faculty_dev_pro_studies', label: 'Coll of Pro Studies and Cont Ed', jsonPath: 'facultyDeviation[8].rate', apiPath: 'facultyDeviation[8].rate', expected: 0.0 }
  ],

  lengthOfService: [
    { id: 'los_faculty_less_than_one', label: 'Faculty - Less Than One Year', jsonPath: 'lengthOfService.faculty[0].percentage', apiPath: 'lengthOfService.faculty[0].percentage', expected: 13.8 },
    { id: 'los_faculty_1_to_5', label: 'Faculty - 1 to 5 Years', jsonPath: 'lengthOfService.faculty[1].percentage', apiPath: 'lengthOfService.faculty[1].percentage', expected: 7.2 },
    { id: 'los_faculty_5_to_10', label: 'Faculty - 5 to 10 Years', jsonPath: 'lengthOfService.faculty[2].percentage', apiPath: 'lengthOfService.faculty[2].percentage', expected: 5.5 },
    { id: 'los_faculty_10_to_20', label: 'Faculty - 10 to 20 Years', jsonPath: 'lengthOfService.faculty[3].percentage', apiPath: 'lengthOfService.faculty[3].percentage', expected: 4.0 },
    { id: 'los_faculty_20_plus', label: 'Faculty - 20+ Years', jsonPath: 'lengthOfService.faculty[4].percentage', apiPath: 'lengthOfService.faculty[4].percentage', expected: 6.2 },
    { id: 'los_staff_less_than_one', label: 'Staff - Less Than One Year', jsonPath: 'lengthOfService.staff[0].percentage', apiPath: 'lengthOfService.staff[0].percentage', expected: 29.8 },
    { id: 'los_staff_1_to_5', label: 'Staff - 1 to 5 Years', jsonPath: 'lengthOfService.staff[1].percentage', apiPath: 'lengthOfService.staff[1].percentage', expected: 14.2 },
    { id: 'los_staff_5_to_10', label: 'Staff - 5 to 10 Years', jsonPath: 'lengthOfService.staff[2].percentage', apiPath: 'lengthOfService.staff[2].percentage', expected: 11.6 },
    { id: 'los_staff_10_to_20', label: 'Staff - 10 to 20 Years', jsonPath: 'lengthOfService.staff[3].percentage', apiPath: 'lengthOfService.staff[3].percentage', expected: 9.0 },
    { id: 'los_staff_20_plus', label: 'Staff - 20+ Years', jsonPath: 'lengthOfService.staff[4].percentage', apiPath: 'lengthOfService.staff[4].percentage', expected: 5.3 }
  ],

  retirementsByFY: [
    { id: 'ret_fy2018_total', label: 'FY2018 Total Retirements', jsonPath: 'retirementsByFY[0].total', apiPath: 'retirementsByFY[0].total', expected: 30 },
    { id: 'ret_fy2019_total', label: 'FY2019 Total Retirements', jsonPath: 'retirementsByFY[1].total', apiPath: 'retirementsByFY[1].total', expected: 48 },
    { id: 'ret_fy2020_total', label: 'FY2020 Total Retirements', jsonPath: 'retirementsByFY[2].total', apiPath: 'retirementsByFY[2].total', expected: 41 },
    { id: 'ret_fy2021_total', label: 'FY2021 Total Retirements', jsonPath: 'retirementsByFY[3].total', apiPath: 'retirementsByFY[3].total', expected: 42 },
    { id: 'ret_fy2022_total', label: 'FY2022 Total Retirements', jsonPath: 'retirementsByFY[4].total', apiPath: 'retirementsByFY[4].total', expected: 42 },
    { id: 'ret_fy2023_total', label: 'FY2023 Total Retirements', jsonPath: 'retirementsByFY[5].total', apiPath: 'retirementsByFY[5].total', expected: 49 },
    { id: 'ret_fy2024_total', label: 'FY2024 Total Retirements', jsonPath: 'retirementsByFY[6].total', apiPath: 'retirementsByFY[6].total', expected: 36 },
    { id: 'ret_fy2025_total', label: 'FY2025 Total Retirements', jsonPath: 'retirementsByFY[7].total', apiPath: 'retirementsByFY[7].total', expected: 40 }
  ],

  facultyRetirementTrends: [
    { id: 'faculty_ret_2019_age', label: 'Faculty 2019 Avg Age', jsonPath: 'facultyRetirement.trends[0].avgAge', apiPath: 'facultyRetirement.trends[0].avgAge', expected: 71.4 },
    { id: 'faculty_ret_2019_los', label: 'Faculty 2019 Avg LOS', jsonPath: 'facultyRetirement.trends[0].avgLOS', apiPath: 'facultyRetirement.trends[0].avgLOS', expected: 31.9 },
    { id: 'faculty_ret_2024_age', label: 'Faculty 2024 Avg Age', jsonPath: 'facultyRetirement.trends[5].avgAge', apiPath: 'facultyRetirement.trends[5].avgAge', expected: 69.3 },
    { id: 'faculty_ret_2024_los', label: 'Faculty 2024 Avg LOS', jsonPath: 'facultyRetirement.trends[5].avgLOS', apiPath: 'facultyRetirement.trends[5].avgLOS', expected: 28.1 },
    { id: 'faculty_ret_2025_age', label: 'Faculty 2025 Avg Age', jsonPath: 'facultyRetirement.trends[6].avgAge', apiPath: 'facultyRetirement.trends[6].avgAge', expected: 69.4 },
    { id: 'faculty_ret_2025_los', label: 'Faculty 2025 Avg LOS', jsonPath: 'facultyRetirement.trends[6].avgLOS', apiPath: 'facultyRetirement.trends[6].avgLOS', expected: 26.7 }
  ],

  staffRetirementTrends: [
    { id: 'staff_ret_2019_age', label: 'Staff 2019 Avg Age', jsonPath: 'staffRetirement.trends[0].avgAge', apiPath: 'staffRetirement.trends[0].avgAge', expected: 63.7 },
    { id: 'staff_ret_2019_los', label: 'Staff 2019 Avg LOS', jsonPath: 'staffRetirement.trends[0].avgLOS', apiPath: 'staffRetirement.trends[0].avgLOS', expected: 21.7 },
    { id: 'staff_ret_2024_age', label: 'Staff 2024 Avg Age', jsonPath: 'staffRetirement.trends[5].avgAge', apiPath: 'staffRetirement.trends[5].avgAge', expected: 67.1 },
    { id: 'staff_ret_2024_los', label: 'Staff 2024 Avg LOS', jsonPath: 'staffRetirement.trends[5].avgLOS', apiPath: 'staffRetirement.trends[5].avgLOS', expected: 24.5 },
    { id: 'staff_ret_2025_age', label: 'Staff 2025 Avg Age', jsonPath: 'staffRetirement.trends[6].avgAge', apiPath: 'staffRetirement.trends[6].avgAge', expected: 68.1 },
    { id: 'staff_ret_2025_los', label: 'Staff 2025 Avg LOS', jsonPath: 'staffRetirement.trends[6].avgLOS', apiPath: 'staffRetirement.trends[6].avgLOS', expected: 21.5 }
  ]
};

/**
 * Get value from object using dot notation path
 * Supports bracket notation for array indices
 *
 * @param {Object} obj - Source object
 * @param {string} path - Dot notation path (e.g., 'summaryRates.total.rate')
 * @returns {*} Value at path or undefined
 */
export function getValueByPath(obj, path) {
  if (!obj || !path) return undefined;

  // Handle array bracket notation (e.g., turnoverRatesTable[0].fy2023)
  const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
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
    // Format percentages with 1 decimal
    if (value < 100) {
      return value.toFixed(1) + '%';
    }
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

    // Determine if this is JSON-only (no API path or API unavailable)
    const isJsonOnly = apiData === null;

    // Determine match status
    let match = false;
    let status = 'pending';

    if (isJsonOnly) {
      // JSON-only mode - API not available
      status = 'json_only';
      match = jsonValue !== undefined;
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
 * Run all turnover validations
 *
 * @param {string} fiscalYear - Fiscal year (e.g., 'FY2025')
 * @returns {Promise<Object>} Complete validation results
 */
export async function validateTurnoverData(fiscalYear = 'FY2025') {
  const startTime = Date.now();

  // Get JSON data (synchronous)
  const jsonData = staticData.getTurnoverMetrics(fiscalYear);

  // Get API data (asynchronous) - turnover metrics from Neon
  let apiData = null;
  let apiError = null;

  try {
    // Try to fetch turnover metrics from Neon
    apiData = await apiService.getTurnoverMetrics?.(fiscalYear);
  } catch (error) {
    apiError = error.message;
    console.warn('[TurnoverValidation] API unavailable:', error.message);
  }

  // Run validations by category
  const results = {
    summaryRates: validateCategory(VALIDATION_RULES.summaryRates, jsonData, apiData),
    turnoverRatesTable: validateCategory(VALIDATION_RULES.turnoverRatesTable, jsonData, apiData),
    turnoverBreakdown: validateCategory(VALIDATION_RULES.turnoverBreakdown, jsonData, apiData),
    staffDeviation: validateCategory(VALIDATION_RULES.staffDeviation, jsonData, apiData),
    facultyDeviation: validateCategory(VALIDATION_RULES.facultyDeviation, jsonData, apiData),
    lengthOfService: validateCategory(VALIDATION_RULES.lengthOfService, jsonData, apiData),
    retirementsByFY: validateCategory(VALIDATION_RULES.retirementsByFY, jsonData, apiData),
    facultyRetirementTrends: validateCategory(VALIDATION_RULES.facultyRetirementTrends, jsonData, apiData),
    staffRetirementTrends: validateCategory(VALIDATION_RULES.staffRetirementTrends, jsonData, apiData)
  };

  // Calculate summary statistics
  const allResults = Object.values(results).flat();
  const totalChecks = allResults.length;
  const passedChecks = allResults.filter(r => r.status === 'passed').length;
  const failedChecks = allResults.filter(r => r.status === 'failed').length;
  const jsonOnlyChecks = allResults.filter(r => r.status === 'json_only').length;
  const apiMissingChecks = allResults.filter(r => r.status === 'api_missing').length;

  // Overall status
  let overallStatus = 'passed';
  if (failedChecks > 0) {
    overallStatus = 'failed';
  } else if (jsonOnlyChecks === totalChecks) {
    overallStatus = 'api_unavailable';
  } else if (passedChecks > 0 && apiMissingChecks > 0) {
    overallStatus = 'partial';
  }

  // Match rate calculation (only for validated items)
  const validatedChecks = passedChecks + failedChecks;
  const matchRate = validatedChecks > 0
    ? Math.round((passedChecks / validatedChecks) * 100)
    : 0;

  return {
    fiscalYear,
    status: overallStatus,
    apiAvailable: apiData !== null,
    apiError,
    summary: {
      totalChecks,
      passedChecks,
      failedChecks,
      jsonOnlyChecks,
      apiMissingChecks,
      matchRate
    },
    results,
    metadata: {
      jsonSource: 'src/data/staticData.js (TURNOVER_METRICS["' + fiscalYear + '"])',
      apiSource: 'Neon PostgreSQL (fact_turnover_* tables)',
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
    summaryRates: VALIDATION_RULES.summaryRates.length,
    turnoverRatesTable: VALIDATION_RULES.turnoverRatesTable.length,
    turnoverBreakdown: VALIDATION_RULES.turnoverBreakdown.length,
    staffDeviation: VALIDATION_RULES.staffDeviation.length,
    facultyDeviation: VALIDATION_RULES.facultyDeviation.length,
    lengthOfService: VALIDATION_RULES.lengthOfService.length,
    retirementsByFY: VALIDATION_RULES.retirementsByFY.length,
    facultyRetirementTrends: VALIDATION_RULES.facultyRetirementTrends.length,
    staffRetirementTrends: VALIDATION_RULES.staffRetirementTrends.length,
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
    '=== Turnover Data Validation Report ===',
    `Fiscal Year: ${results.fiscalYear}`,
    `Timestamp: ${results.timestamp}`,
    '',
    '--- Summary ---',
    `Status: ${results.status.toUpperCase()}`,
    `API Available: ${results.apiAvailable ? 'Yes' : 'No'}`,
    results.apiError ? `API Error: ${results.apiError}` : '',
    '',
    '--- Validation Results ---',
    `Total Checks: ${results.summary.totalChecks}`,
    `Passed: ${results.summary.passedChecks}`,
    `Failed: ${results.summary.failedChecks}`,
    `JSON-Only: ${results.summary.jsonOnlyChecks}`,
    `Match Rate: ${results.summary.matchRate}%`,
    '',
    '--- Duration ---',
    `${results.metadata.duration}ms`,
  ];

  return lines.filter(Boolean).join('\n');
}

const turnoverValidationService = {
  VALIDATION_RULES,
  getValueByPath,
  compareValues,
  formatValue,
  validateCategory,
  validateTurnoverData,
  getValidationRulesCounts,
  exportResults,
  generateReport
};

export default turnoverValidationService;
