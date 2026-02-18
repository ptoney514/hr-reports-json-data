/**
 * API Service for HR Reports
 *
 * Fetches data from the Neon Postgres REST API.
 * Provides the same interface as the existing staticData.js getter functions,
 * allowing gradual migration from JSON to API.
 *
 * Usage:
 *   import { getWorkforceData, getTurnoverData } from '../services/apiService';
 *   const data = await getWorkforceData('2025-03-31');
 */

// API base URL - set via environment variable or default to local
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

/**
 * Feature flag to control data source
 * Set to 'api' to use Postgres API, 'json' to use static JSON files
 */
const DATA_SOURCE = process.env.REACT_APP_DATA_SOURCE || 'json';

/**
 * Generic fetch wrapper with error handling and caching
 */
async function fetchFromAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error.message);
    throw error;
  }
}

/**
 * Get workforce data for a specific date
 *
 * @param {string} date - Date in YYYY-MM-DD format (e.g., '2025-03-31')
 * @returns {Promise<Object>} Workforce summary data
 *
 * @example
 * const data = await getWorkforceData('2025-03-31');
 * console.log(data.totalEmployees); // 5415
 */
export async function getWorkforceData(date) {
  return fetchFromAPI(`/workforce/${date}`);
}

/**
 * Get turnover data for a specific date
 *
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Turnover summary data
 */
export async function getTurnoverData(date) {
  return fetchFromAPI(`/turnover/${date}`);
}

/**
 * Get annual turnover rates with benchmarks
 *
 * @param {number} [year] - Optional fiscal year to filter
 * @returns {Promise<Array>} Annual turnover rates
 */
export async function getAnnualTurnoverRates(year = null) {
  const endpoint = year ? `/turnover-rates?year=${year}` : '/turnover-rates';
  return fetchFromAPI(endpoint);
}

/**
 * Get turnover metrics for validation (from Neon database)
 *
 * @param {string} fiscalYear - Fiscal year (e.g., 'FY2025')
 * @returns {Promise<Object>} Turnover metrics from Neon
 */
export async function getTurnoverMetrics(fiscalYear = 'FY2025') {
  return fetchFromAPI(`/turnover-metrics/${fiscalYear}`);
}

/**
 * Get exit survey metrics for a specific date
 *
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Exit survey metrics
 */
export async function getExitSurveyData(date) {
  return fetchFromAPI(`/exit-surveys/${date}`);
}

/**
 * Get school/organization headcount data
 *
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} [limit=15] - Number of schools to return
 * @returns {Promise<Object>} School headcount data
 */
export async function getSchoolOrgData(date, limit = 15) {
  return fetchFromAPI(`/schools/${date}?limit=${limit}`);
}

/**
 * Get top 15 schools by headcount (compatibility wrapper)
 *
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} Array of school objects
 */
export async function getTop15SchoolOrgData(date) {
  const response = await getSchoolOrgData(date, 15);
  return response.schools;
}

/**
 * Get internal mobility data for a specific date
 *
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Mobility summary data
 */
export async function getMobilityData(date) {
  return fetchFromAPI(`/mobility/${date}`);
}

/**
 * Get demographics data for a specific date
 *
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Demographics data (gender, ethnicity, age bands)
 *
 * @example
 * const data = await getDemographicsData('2025-06-30');
 * console.log(data.gender.faculty.male); // 321
 */
export async function getDemographicsData(date) {
  return fetchFromAPI(`/demographics/${date}`);
}

// ==============================================
// RECRUITING METRICS API ENDPOINTS
// ==============================================

/**
 * Get recruiting summary for a fiscal year and quarter
 *
 * @param {string} fiscalYear - Fiscal year (e.g., 'FY2026')
 * @param {number} quarter - Quarter (1-4)
 * @returns {Promise<Object>} Recruiting summary data
 *
 * @example
 * const data = await getRecruitingSummary('FY2026', 1);
 * console.log(data.total_hires); // 69
 */
export async function getRecruitingSummary(fiscalYear, quarter) {
  return fetchFromAPI(`/recruiting/summary/${fiscalYear}/${quarter}`);
}

/**
 * Get hire rates for a fiscal year and quarter
 *
 * @param {string} fiscalYear - Fiscal year (e.g., 'FY2026')
 * @param {number} quarter - Quarter (1-4)
 * @returns {Promise<Array>} Hire rates by source/channel
 */
export async function getHireRates(fiscalYear, quarter) {
  return fetchFromAPI(`/recruiting/hire-rates/${fiscalYear}/${quarter}`);
}

/**
 * Get staff pipeline metrics (myJobs/ORC)
 *
 * @param {string} fiscalYear - Fiscal year (e.g., 'FY2026')
 * @param {number} quarter - Quarter (1-4)
 * @returns {Promise<Object>} Staff pipeline metrics
 */
export async function getPipelineStaff(fiscalYear, quarter) {
  return fetchFromAPI(`/recruiting/pipeline-staff/${fiscalYear}/${quarter}`);
}

/**
 * Get faculty pipeline metrics (Interfolio)
 *
 * @param {string} fiscalYear - Fiscal year (e.g., 'FY2026')
 * @param {number} quarter - Quarter (1-4)
 * @returns {Promise<Object>} Faculty pipeline metrics
 */
export async function getPipelineFaculty(fiscalYear, quarter) {
  return fetchFromAPI(`/recruiting/pipeline-faculty/${fiscalYear}/${quarter}`);
}

/**
 * Get new hires for a fiscal year and quarter
 *
 * @param {string} fiscalYear - Fiscal year (e.g., 'FY2026')
 * @param {number} quarter - Quarter (1-4)
 * @returns {Promise<Array>} New hire records
 */
export async function getNewHires(fiscalYear, quarter) {
  return fetchFromAPI(`/recruiting/new-hires/${fiscalYear}/${quarter}`);
}

/**
 * Get hires by school for a fiscal year and quarter
 *
 * @param {string} fiscalYear - Fiscal year (e.g., 'FY2026')
 * @param {number} quarter - Quarter (1-4)
 * @returns {Promise<Array>} Hires aggregated by school
 */
export async function getHiresBySchool(fiscalYear, quarter) {
  return fetchFromAPI(`/recruiting/by-school/${fiscalYear}/${quarter}`);
}

/**
 * Get application sources for a fiscal year and quarter
 *
 * @param {string} fiscalYear - Fiscal year (e.g., 'FY2026')
 * @param {number} quarter - Quarter (1-4)
 * @returns {Promise<Array>} Application source data
 */
export async function getApplicationSources(fiscalYear, quarter) {
  return fetchFromAPI(`/recruiting/application-sources/${fiscalYear}/${quarter}`);
}

/**
 * Get top jobs by applications
 *
 * @param {string} fiscalYear - Fiscal year (e.g., 'FY2026')
 * @param {number} quarter - Quarter (1-4)
 * @returns {Promise<Array>} Top jobs by application count
 */
export async function getTopJobs(fiscalYear, quarter) {
  return fetchFromAPI(`/recruiting/top-jobs/${fiscalYear}/${quarter}`);
}

/**
 * Get requisition aging data
 *
 * @param {string} fiscalYear - Fiscal year (e.g., 'FY2026')
 * @param {number} quarter - Quarter (1-4)
 * @returns {Promise<Array>} Requisition aging distribution
 */
export async function getRequisitionAging(fiscalYear, quarter) {
  return fetchFromAPI(`/recruiting/requisition-aging/${fiscalYear}/${quarter}`);
}

/**
 * Get new hire demographics
 *
 * @param {string} fiscalYear - Fiscal year (e.g., 'FY2026')
 * @param {number} quarter - Quarter (1-4)
 * @returns {Promise<Array>} Demographics breakdown
 */
export async function getNewHireDemographics(fiscalYear, quarter) {
  return fetchFromAPI(`/recruiting/demographics/${fiscalYear}/${quarter}`);
}

/**
 * Get hiring trends (historical quarterly data)
 *
 * @returns {Promise<Array>} Historical hiring trends
 */
export async function getHiringTrends() {
  return fetchFromAPI('/recruiting/hiring-trends');
}

/**
 * Get all recruiting metrics for a quarter (combined endpoint)
 *
 * @param {string} fiscalYear - Fiscal year (e.g., 'FY2026')
 * @param {number} quarter - Quarter (1-4)
 * @returns {Promise<Object>} All recruiting metrics
 */
export async function getRecruitingMetrics(fiscalYear, quarter) {
  return fetchFromAPI(`/recruiting/metrics/${fiscalYear}/${quarter}`);
}

/**
 * Get available quarters with data status
 *
 * @returns {Promise<Array>} Available quarters sorted newest-first
 */
export async function getAvailableQuarters() {
  return fetchFromAPI('/available-quarters');
}

/**
 * Health check endpoint
 *
 * @returns {Promise<Object>} API health status
 */
export async function checkAPIHealth() {
  return fetchFromAPI('/health');
}

/**
 * Get available report periods
 *
 * @returns {Promise<Array>} List of available period dates
 */
export async function getAvailablePeriods() {
  const health = await checkAPIHealth();

  // Return periods that have data
  return {
    hasWorkforceData: health.data.factTables.workforceSnapshots > 0,
    hasTurnoverData: health.data.factTables.terminations > 0,
    hasExitSurveyData: health.data.factTables.exitSurveys > 0,
    hasMobilityData: health.data.factTables.mobilityEvents > 0
  };
}

/**
 * Check if API is available (for feature flag switching)
 *
 * @returns {Promise<boolean>} True if API is healthy
 */
export async function isAPIAvailable() {
  try {
    const health = await checkAPIHealth();
    return health.status === 'healthy' && health.database.connected;
  } catch {
    return false;
  }
}

/**
 * Export data source flag for components to check
 */
export const useAPIDataSource = DATA_SOURCE === 'api';

/**
 * Helper to convert date formats
 * Converts staticData format (e.g., "2025-03-31") to API format and vice versa
 */
export function normalizeDate(dateStr) {
  // If already in YYYY-MM-DD format, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Try to parse other formats
  const date = new Date(dateStr);
  if (isNaN(date)) {
    throw new Error(`Invalid date: ${dateStr}`);
  }

  return date.toISOString().split('T')[0];
}

const apiService = {
  getWorkforceData,
  getTurnoverData,
  getAnnualTurnoverRates,
  getTurnoverMetrics,
  getExitSurveyData,
  getSchoolOrgData,
  getTop15SchoolOrgData,
  getMobilityData,
  getDemographicsData,
  // Recruiting endpoints
  getRecruitingSummary,
  getHireRates,
  getPipelineStaff,
  getPipelineFaculty,
  getNewHires,
  getHiresBySchool,
  getApplicationSources,
  getTopJobs,
  getRequisitionAging,
  getNewHireDemographics,
  getHiringTrends,
  getRecruitingMetrics,
  getAvailableQuarters,
  // Utility functions
  checkAPIHealth,
  getAvailablePeriods,
  isAPIAvailable,
  useAPIDataSource,
  normalizeDate
};

export default apiService;
