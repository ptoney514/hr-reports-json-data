import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAvailableQuarters, FALLBACK_QUARTERS } from '../hooks/useAvailableQuarters';

/**
 * Static fallback — kept for backward compatibility.
 * Components that import AVAILABLE_QUARTERS directly still get a valid array.
 */
export const AVAILABLE_QUARTERS = FALLBACK_QUARTERS;

const QuarterContext = createContext(null);

export const QuarterProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { quarters: availableQuarters, loading: quartersLoading } = useAvailableQuarters();

  // Default = first available quarter (newest with data)
  const defaultQuarter = availableQuarters[0]?.value || '2025-09-30';

  // Initialise from URL param or fall back to default
  const paramValue = searchParams.get('quarter');
  const initialQuarter =
    availableQuarters.find(q => q.value === paramValue)?.value || defaultQuarter;

  const [selectedQuarter, setSelectedQuarterState] = useState(initialQuarter);

  // Re-validate selection when quarters list changes (after API response)
  useEffect(() => {
    if (!quartersLoading && !availableQuarters.find(q => q.value === selectedQuarter)) {
      setSelectedQuarterState(availableQuarters[0]?.value || '2025-09-30');
    }
  }, [availableQuarters, quartersLoading, selectedQuarter]);

  const setQuarter = useCallback(
    (value) => {
      setSelectedQuarterState(value);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === defaultQuarter) {
            next.delete('quarter');
          } else {
            next.set('quarter', value);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams, defaultQuarter],
  );

  const quarterConfig = useMemo(
    () => availableQuarters.find(q => q.value === selectedQuarter),
    [selectedQuarter, availableQuarters],
  );

  const ctx = useMemo(
    () => ({
      selectedQuarter,
      quarterConfig,
      setQuarter,
      availableQuarters,
      quartersLoading,
    }),
    [selectedQuarter, quarterConfig, setQuarter, availableQuarters, quartersLoading],
  );

  return <QuarterContext.Provider value={ctx}>{children}</QuarterContext.Provider>;
};

export const useQuarter = () => {
  const ctx = useContext(QuarterContext);
  if (!ctx) {
    throw new Error('useQuarter must be used within a QuarterProvider');
  }
  return ctx;
};
