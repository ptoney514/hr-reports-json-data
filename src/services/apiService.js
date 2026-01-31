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
  getExitSurveyData,
  getSchoolOrgData,
  getTop15SchoolOrgData,
  getMobilityData,
  getDemographicsData,
  checkAPIHealth,
  getAvailablePeriods,
  isAPIAvailable,
  useAPIDataSource,
  normalizeDate
};

export default apiService;
