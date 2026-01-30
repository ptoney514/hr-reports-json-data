/**
 * useHRData Hook
 *
 * React hook for fetching HR data with loading states and error handling.
 * Supports both JSON (sync) and API (async) data sources.
 *
 * Usage:
 *   const { data, loading, error } = useHRData('workforce', '2025-06-30');
 *   const { data: turnover } = useHRData('turnover', '2025-06-30');
 */

import { useState, useEffect, useCallback } from 'react';
import * as dataService from '../services/dataService';

/**
 * Map of data types to their fetch functions
 */
const DATA_FETCHERS = {
  workforce: {
    sync: dataService.getWorkforceData,
    async: dataService.getWorkforceDataAsync
  },
  turnover: {
    sync: dataService.getTurnoverData,
    async: dataService.getTurnoverDataAsync
  },
  exitSurvey: {
    sync: dataService.getExitSurveyData,
    async: dataService.getExitSurveyDataAsync
  },
  schools: {
    sync: dataService.getTop15SchoolOrgData,
    async: dataService.getTop15SchoolOrgDataAsync
  },
  allSchools: {
    sync: dataService.getAllSchoolOrgData,
    async: dataService.getAllSchoolOrgDataAsync
  },
  annualTurnoverRates: {
    sync: dataService.getAnnualTurnoverRatesByCategory,
    async: dataService.getAnnualTurnoverRatesByCategoryAsync
  },
  quarterlyTurnover: {
    sync: dataService.getQuarterlyTurnoverData,
    async: dataService.getQuarterlyTurnoverDataAsync
  },
  quarterlyWorkforce: {
    sync: dataService.getQuarterlyWorkforceData,
    async: dataService.getQuarterlyWorkforceDataAsync
  },
  quarterlyTurnoverRates: {
    sync: dataService.getQuarterlyTurnoverRatesByCategory,
    async: dataService.getQuarterlyTurnoverRatesByCategoryAsync
  },
  recruiting: {
    sync: dataService.getRecruitingData,
    async: dataService.getRecruitingDataAsync
  },
  startersLeavers: {
    sync: dataService.getStartersLeaversData,
    async: dataService.getStartersLeaversDataAsync
  },
  headcountTrends: {
    sync: dataService.getHeadcountTrendsData,
    async: dataService.getHeadcountTrendsDataAsync
  },
  phoenixHeadcount: {
    sync: dataService.getPhoenixHeadcountData,
    async: dataService.getPhoenixHeadcountDataAsync
  },
  omahaHeadcount: {
    sync: dataService.getOmahaHeadcountData,
    async: dataService.getOmahaHeadcountDataAsync
  }
};

/**
 * Custom hook for fetching HR data
 *
 * @param {string} dataType - Type of data to fetch (workforce, turnover, etc.)
 * @param {string} date - Date parameter for the query (optional)
 * @param {Object} options - Additional options
 * @param {boolean} options.useAsync - Whether to use async API fetch (default: false for backward compat)
 * @param {boolean} options.enabled - Whether to fetch data (default: true)
 *
 * @returns {Object} { data, loading, error, refetch }
 */
export function useHRData(dataType, date = null, options = {}) {
  const { useAsync = false, enabled = true } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetcher = DATA_FETCHERS[dataType];

  const fetchData = useCallback(async () => {
    if (!fetcher) {
      setError(new Error(`Unknown data type: ${dataType}`));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;

      if (useAsync && fetcher.async) {
        // Use async API fetch
        result = date ? await fetcher.async(date) : await fetcher.async();
      } else {
        // Use sync JSON fetch
        result = date ? fetcher.sync(date) : fetcher.sync();
      }

      setData(result);
    } catch (err) {
      console.error(`[useHRData] Error fetching ${dataType}:`, err);
      setError(err);

      // Try fallback to sync if async failed
      if (useAsync && fetcher.sync) {
        try {
          const fallbackResult = date ? fetcher.sync(date) : fetcher.sync();
          setData(fallbackResult);
          setError(null); // Clear error if fallback succeeded
        } catch (fallbackErr) {
          // Keep original error
        }
      }
    } finally {
      setLoading(false);
    }
  }, [dataType, date, useAsync, fetcher]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [fetchData, enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * Hook for workforce data
 */
export function useWorkforceData(date = "2025-06-30", options = {}) {
  return useHRData('workforce', date, options);
}

/**
 * Hook for turnover data
 */
export function useTurnoverData(date = "2025-06-30", options = {}) {
  return useHRData('turnover', date, options);
}

/**
 * Hook for exit survey data
 */
export function useExitSurveyData(date = "2025-06-30", options = {}) {
  return useHRData('exitSurvey', date, options);
}

/**
 * Hook for school/org data
 */
export function useSchoolOrgData(date = "2025-06-30", options = {}) {
  return useHRData('schools', date, options);
}

/**
 * Hook for annual turnover rates
 */
export function useAnnualTurnoverRates(options = {}) {
  return useHRData('annualTurnoverRates', null, options);
}

/**
 * Hook for quarterly workforce data
 */
export function useQuarterlyWorkforceData(date = "2025-09-30", options = {}) {
  return useHRData('quarterlyWorkforce', date, options);
}

/**
 * Hook for quarterly turnover data
 */
export function useQuarterlyTurnoverData(date = "2025-09-30", options = {}) {
  return useHRData('quarterlyTurnover', date, options);
}

/**
 * Hook for quarterly turnover rates by category
 */
export function useQuarterlyTurnoverRates(options = {}) {
  return useHRData('quarterlyTurnoverRates', null, options);
}

/**
 * Hook for recruiting data
 */
export function useRecruitingData(date = "2025-06-30", options = {}) {
  return useHRData('recruiting', date, options);
}

/**
 * Hook for all schools data
 */
export function useAllSchoolsData(date = "2025-06-30", options = {}) {
  return useHRData('allSchools', date, options);
}

/**
 * Hook for starters/leavers data
 */
export function useStartersLeaversData(options = {}) {
  return useHRData('startersLeavers', null, options);
}

/**
 * Hook for headcount trends data
 */
export function useHeadcountTrendsData(options = {}) {
  return useHRData('headcountTrends', null, options);
}

/**
 * Hook for Phoenix headcount data
 */
export function usePhoenixHeadcountData(options = {}) {
  return useHRData('phoenixHeadcount', null, options);
}

/**
 * Hook for Omaha headcount data
 */
export function useOmahaHeadcountData(options = {}) {
  return useHRData('omahaHeadcount', null, options);
}

/**
 * Hook for checking data source health
 */
export function useDataSourceHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const result = await dataService.checkDataSource();
        setHealth(result);
      } catch (err) {
        setHealth({ status: 'error', message: err.message });
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return { health, loading };
}

/**
 * Hook for getting data source info
 */
export function useDataSourceInfo() {
  return dataService.getDataSourceInfo();
}

export default useHRData;
