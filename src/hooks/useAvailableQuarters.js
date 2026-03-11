import { useState, useEffect } from 'react';
import { getAvailableQuarters } from '../services/apiService';

/**
 * Fallback quarters when API is unavailable or data source is JSON.
 * Matches the original hardcoded AVAILABLE_QUARTERS from QuarterContext.
 */
export const FALLBACK_QUARTERS = [
  {
    value: '2025-12-31',
    label: 'Q2 FY26',
    period: 'October - December 2025',
    fiscalYear: 'FY26',
    hasData: true,
  },
  {
    value: '2025-09-30',
    label: 'Q1 FY26',
    period: 'July - September 2025',
    fiscalYear: 'FY26',
    hasData: true,
  },
];

// Check data source — only fetch from API when explicitly set to 'api'
const DATA_SOURCE = process.env.REACT_APP_DATA_SOURCE || 'json';
const USE_API = DATA_SOURCE === 'api';

/**
 * Hook to fetch available quarters from the API.
 * When data source is 'json', uses FALLBACK_QUARTERS directly (no API call).
 * When data source is 'api', fetches from the API; falls back on error.
 * Filters to only quarters with data.
 */
export function useAvailableQuarters() {
  const [quarters, setQuarters] = useState(FALLBACK_QUARTERS.filter(q => q.hasData));
  const [loading, setLoading] = useState(USE_API);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!USE_API) return;

    let cancelled = false;

    async function fetchQuarters() {
      try {
        const data = await getAvailableQuarters();
        if (!cancelled) {
          const withData = data.filter(q => q.hasData);
          setQuarters(withData.length > 0 ? withData : FALLBACK_QUARTERS);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('[useAvailableQuarters] API failed, using fallback:', err.message);
          setQuarters(FALLBACK_QUARTERS);
          setError(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchQuarters();
    return () => { cancelled = true; };
  }, []);

  return { quarters, loading, error };
}
