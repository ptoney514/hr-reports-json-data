/**
 * Unified Data Service
 *
 * Provides a single interface for accessing HR data from either:
 * - JSON (staticData.js) - the original local data source
 * - API (Neon Postgres) - the new cloud database
 *
 * Controlled by REACT_APP_DATA_SOURCE environment variable:
 * - 'json' (default): Use staticData.js
 * - 'api': Use Neon Postgres REST API
 *
 * This service maintains backward compatibility with existing components
 * by exporting the same function signatures as staticData.js.
 */

import * as staticData from '../data/staticData';
import * as apiService from './apiService';

// Feature flag for data source
const DATA_SOURCE = process.env.REACT_APP_DATA_SOURCE || 'json';
const USE_API = DATA_SOURCE === 'api';

// Log data source on load (development only)
if (process.env.NODE_ENV === 'development') {
  console.log(`[DataService] Using data source: ${DATA_SOURCE}`);
}

/**
 * Helper to handle async API calls with fallback to JSON
 */
async function withFallback(apiCall, jsonFallback) {
  if (!USE_API) {
    return jsonFallback();
  }

  try {
    return await apiCall();
  } catch (error) {
    console.warn('[DataService] API call failed, falling back to JSON:', error.message);
    return jsonFallback();
  }
}

/**
 * Get workforce data for a specific date
 * @param {string} date - Date in YYYY-MM-DD format (default: "2025-06-30")
 * @returns {Object} Workforce summary data
 */
export const getWorkforceData = (date = "2025-06-30") => {
  // For synchronous compatibility, return JSON data
  // Components that need API data should use getWorkforceDataAsync
  return staticData.getWorkforceData(date);
};

/**
 * Async version of getWorkforceData for components that can handle promises
 */
export const getWorkforceDataAsync = async (date = "2025-06-30") => {
  return withFallback(
    () => apiService.getWorkforceData(date),
    () => staticData.getWorkforceData(date)
  );
};

/**
 * Get turnover data for a specific date
 */
export const getTurnoverData = (date = "2025-06-30") => {
  return staticData.getTurnoverData(date);
};

export const getTurnoverDataAsync = async (date = "2025-06-30") => {
  return withFallback(
    () => apiService.getTurnoverData(date),
    () => staticData.getTurnoverData(date)
  );
};

/**
 * Get turnover metrics data for dashboard visualizations
 * @param {string} fiscalYear - Fiscal year (e.g., 'FY2025')
 * @returns {Object} Turnover metrics data
 */
export const getTurnoverMetrics = (fiscalYear = 'FY2025') => {
  return staticData.getTurnoverMetrics(fiscalYear);
};

/**
 * Async version of getTurnoverMetrics for components that can handle promises
 * Falls back to staticData if API is unavailable
 */
export const getTurnoverMetricsAsync = async (fiscalYear = 'FY2025') => {
  return withFallback(
    async () => {
      // Future: fetch from API when turnover metrics endpoint is available
      // For now, return static data
      return staticData.getTurnoverMetrics(fiscalYear);
    },
    () => staticData.getTurnoverMetrics(fiscalYear)
  );
};

/**
 * Get quarterly recruiting details (position activity metrics)
 */
export const getQuarterlyRecruitingDetails = (date = "2025-12-31") => {
  return staticData.getQuarterlyRecruitingDetails(date);
};

/**
 * Get recruiting data for a specific date
 */
export const getRecruitingData = (date = "2025-06-30") => {
  return staticData.getRecruitingData(date);
};

/**
 * Async version of getRecruitingData for components that can handle promises
 * Note: Uses workforce endpoint since recruiting data is derived from workforce metrics
 */
export const getRecruitingDataAsync = async (date = "2025-06-30") => {
  return withFallback(
    () => apiService.getWorkforceData(date),
    () => staticData.getRecruitingData(date)
  );
};

/**
 * Get exit survey data for a specific date
 */
export const getExitSurveyData = (date = "2025-06-30") => {
  return staticData.getExitSurveyData(date);
};

/**
 * Get internal mobility data for a specific date
 */
export const getInternalMobilityData = (date = "2025-12-31") => {
  return staticData.getInternalMobilityData(date);
};

export const getExitSurveyDataAsync = async (date = "2025-06-30") => {
  return withFallback(
    () => apiService.getExitSurveyData(date),
    () => staticData.getExitSurveyData(date)
  );
};

/**
 * Get quarterly turnover data
 */
export const getQuarterlyTurnoverData = (date = "2025-09-30") => {
  return staticData.getQuarterlyTurnoverData(date);
};

/**
 * Async version of getQuarterlyTurnoverData for components that can handle promises
 */
export const getQuarterlyTurnoverDataAsync = async (date = "2025-09-30") => {
  return withFallback(
    () => apiService.getTurnoverData(date),
    () => staticData.getQuarterlyTurnoverData(date)
  );
};

/**
 * Get quarterly workforce data
 */
export const getQuarterlyWorkforceData = (date = "2025-09-30") => {
  return staticData.getQuarterlyWorkforceData(date);
};

/**
 * Async version of getQuarterlyWorkforceData for components that can handle promises
 */
export const getQuarterlyWorkforceDataAsync = async (date = "2025-09-30") => {
  return withFallback(
    () => apiService.getWorkforceData(date),
    () => staticData.getQuarterlyWorkforceData(date)
  );
};

/**
 * Get quarterly turnover rates by category
 */
export const getQuarterlyTurnoverRatesByCategory = () => {
  return staticData.getQuarterlyTurnoverRatesByCategory();
};

/**
 * Async version of getQuarterlyTurnoverRatesByCategory for components that can handle promises
 */
export const getQuarterlyTurnoverRatesByCategoryAsync = async () => {
  return withFallback(
    () => apiService.getAnnualTurnoverRates(),
    () => staticData.getQuarterlyTurnoverRatesByCategory()
  );
};

/**
 * Get annual turnover rates by category
 */
export const getAnnualTurnoverRatesByCategory = () => {
  return staticData.getAnnualTurnoverRatesByCategory();
};

export const getAnnualTurnoverRatesByCategoryAsync = async () => {
  return withFallback(
    () => apiService.getAnnualTurnoverRates(),
    () => staticData.getAnnualTurnoverRatesByCategory()
  );
};

/**
 * Get top 15 school/org data
 */
export const getTop15SchoolOrgData = (date = "2025-06-30") => {
  return staticData.getTop15SchoolOrgData(date);
};

export const getTop15SchoolOrgDataAsync = async (date = "2025-06-30") => {
  return withFallback(
    () => apiService.getTop15SchoolOrgData(date),
    () => staticData.getTop15SchoolOrgData(date)
  );
};

/**
 * Get all school/org data
 */
export const getAllSchoolOrgData = (date = "2025-06-30") => {
  return staticData.getAllSchoolOrgData(date);
};

/**
 * Async version of getAllSchoolOrgData for components that can handle promises
 */
export const getAllSchoolOrgDataAsync = async (date = "2025-06-30") => {
  return withFallback(
    async () => {
      const response = await apiService.getSchoolOrgData(date, 100);
      return response.schools;
    },
    () => staticData.getAllSchoolOrgData(date)
  );
};

/**
 * Get starters/leavers data
 */
export const getStartersLeaversData = () => {
  return staticData.getStartersLeaversData();
};

/**
 * Async version of getStartersLeaversData for components that can handle promises
 * Note: Uses mobility endpoint since starters/leavers is related to mobility data
 */
export const getStartersLeaversDataAsync = async (date = "2025-06-30") => {
  return withFallback(
    () => apiService.getMobilityData(date),
    () => staticData.getStartersLeaversData()
  );
};

/**
 * Get headcount trends data
 */
export const getHeadcountTrendsData = () => {
  return staticData.getHeadcountTrendsData();
};

/**
 * Async version of getHeadcountTrendsData for components that can handle promises
 * Note: Uses workforce endpoint since headcount trends derive from workforce data
 */
export const getHeadcountTrendsDataAsync = async (date = "2025-06-30") => {
  return withFallback(
    () => apiService.getWorkforceData(date),
    () => staticData.getHeadcountTrendsData()
  );
};

/**
 * Get Phoenix headcount data
 */
export const getPhoenixHeadcountData = () => {
  return staticData.getPhoenixHeadcountData();
};

/**
 * Async version of getPhoenixHeadcountData for components that can handle promises
 * Note: Uses workforce endpoint with Phoenix location filter
 */
export const getPhoenixHeadcountDataAsync = async (date = "2025-06-30") => {
  return withFallback(
    () => apiService.getWorkforceData(date),
    () => staticData.getPhoenixHeadcountData()
  );
};

/**
 * Get Omaha headcount data
 */
export const getOmahaHeadcountData = () => {
  return staticData.getOmahaHeadcountData();
};

/**
 * Async version of getOmahaHeadcountData for components that can handle promises
 * Note: Uses workforce endpoint with Omaha location filter
 */
export const getOmahaHeadcountDataAsync = async (date = "2025-06-30") => {
  return withFallback(
    () => apiService.getWorkforceData(date),
    () => staticData.getOmahaHeadcountData()
  );
};

/**
 * Get temp total
 */
export const getTempTotal = (date = "2025-06-30") => {
  return staticData.getTempTotal(date);
};

/**
 * Get benefit eligible breakdown
 */
export const getBenefitEligibleBreakdown = (date = "2025-06-30") => {
  return staticData.getBenefitEligibleBreakdown(date);
};

/**
 * Get available quarters
 */
export const getAvailableQuarters = () => {
  return staticData.getAvailableQuarters();
};

/**
 * Async version of getAvailableQuarters - fetches from API with JSON fallback
 */
export const getAvailableQuartersAsync = async () => {
  return withFallback(
    () => apiService.getAvailableQuarters(),
    () => {
      // Fallback: return static AVAILABLE_QUARTERS with hasData flag
      const { AVAILABLE_QUARTERS } = require('../contexts/QuarterContext');
      return AVAILABLE_QUARTERS.map(q => ({ ...q, hasData: true }));
    }
  );
};

/**
 * Get most recent quarter
 */
export const getMostRecentQuarter = () => {
  return staticData.getMostRecentQuarter();
};

/**
 * Get previous quarter
 */
export const getPreviousQuarter = (fiscalQuarter) => {
  return staticData.getPreviousQuarter(fiscalQuarter);
};

/**
 * Get fiscal period
 */
export const getFiscalPeriod = (fiscalQuarter) => {
  return staticData.getFiscalPeriod(fiscalQuarter);
};

// Re-export constants for backward compatibility
export const WORKFORCE_DATA = staticData.WORKFORCE_DATA;
export const TURNOVER_DATA = staticData.TURNOVER_DATA;
export const TURNOVER_METRICS = staticData.TURNOVER_METRICS;
export const RECRUITING_DATA = staticData.RECRUITING_DATA;
export const EXIT_SURVEY_DATA = staticData.EXIT_SURVEY_DATA;
export const QUARTERLY_TURNOVER_TRENDS = staticData.QUARTERLY_TURNOVER_TRENDS;
export const QUARTERLY_HEADCOUNT_TRENDS = staticData.QUARTERLY_HEADCOUNT_TRENDS;
export const ANNUAL_TURNOVER_RATES_BY_CATEGORY = staticData.ANNUAL_TURNOVER_RATES_BY_CATEGORY;
export const TURNOVER_BENCHMARKS = staticData.TURNOVER_BENCHMARKS;
export const QUARTERLY_TURNOVER_RATES_BY_CATEGORY = staticData.QUARTERLY_TURNOVER_RATES_BY_CATEGORY;
export const QUARTERLY_TURNOVER_BENCHMARKS = staticData.QUARTERLY_TURNOVER_BENCHMARKS;
export const QUARTERLY_TURNOVER_DATA = staticData.QUARTERLY_TURNOVER_DATA;
export const QUARTERLY_WORKFORCE_DATA = staticData.QUARTERLY_WORKFORCE_DATA;
export const AVAILABLE_DATES = staticData.AVAILABLE_DATES;
export const FISCAL_PERIODS = staticData.FISCAL_PERIODS;

/**
 * Data source info for debugging/display
 */
export const getDataSourceInfo = () => ({
  source: USE_API ? 'api' : 'json',
  apiUrl: process.env.REACT_APP_API_URL || '/api',
  isApiEnabled: USE_API
});

/**
 * Check if API is available (for health checks)
 */
export const checkDataSource = async () => {
  if (!USE_API) {
    return { status: 'ok', source: 'json', message: 'Using local JSON data' };
  }

  try {
    const health = await apiService.checkAPIHealth();
    return {
      status: health.status === 'healthy' ? 'ok' : 'error',
      source: 'api',
      message: health.status === 'healthy' ? 'API connected' : 'API unhealthy',
      details: health
    };
  } catch (error) {
    return {
      status: 'error',
      source: 'api',
      message: `API unreachable: ${error.message}`,
      fallbackAvailable: true
    };
  }
};

// Default export for convenience
const dataService = {
  // Sync functions (JSON only)
  getWorkforceData,
  getTurnoverData,
  getTurnoverMetrics,
  getQuarterlyRecruitingDetails,
  getRecruitingData,
  getExitSurveyData,
  getInternalMobilityData,
  getQuarterlyTurnoverData,
  getQuarterlyWorkforceData,
  getQuarterlyTurnoverRatesByCategory,
  getAnnualTurnoverRatesByCategory,
  getTop15SchoolOrgData,
  getAllSchoolOrgData,
  getStartersLeaversData,
  getHeadcountTrendsData,
  getPhoenixHeadcountData,
  getOmahaHeadcountData,
  getTempTotal,
  getBenefitEligibleBreakdown,
  getAvailableQuarters,
  getMostRecentQuarter,
  getPreviousQuarter,
  getFiscalPeriod,

  // Async functions (API with JSON fallback)
  getWorkforceDataAsync,
  getTurnoverDataAsync,
  getTurnoverMetricsAsync,
  getExitSurveyDataAsync,
  getAnnualTurnoverRatesByCategoryAsync,
  getTop15SchoolOrgDataAsync,
  getQuarterlyTurnoverDataAsync,
  getQuarterlyWorkforceDataAsync,
  getRecruitingDataAsync,
  getQuarterlyTurnoverRatesByCategoryAsync,
  getAllSchoolOrgDataAsync,
  getStartersLeaversDataAsync,
  getHeadcountTrendsDataAsync,
  getPhoenixHeadcountDataAsync,
  getOmahaHeadcountDataAsync,
  getAvailableQuartersAsync,

  // Utilities
  getDataSourceInfo,
  checkDataSource
};

export default dataService;
