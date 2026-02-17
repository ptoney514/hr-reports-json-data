import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Available quarters — single source of truth.
 * Add new entries here as data becomes available.
 */
export const AVAILABLE_QUARTERS = [
  {
    value: '2025-09-30',
    label: 'Q1 FY26',
    period: 'July - September 2025',
    fiscalYear: 'FY26',
  },
];

const DEFAULT_QUARTER = '2025-09-30';

const QuarterContext = createContext(null);

export const QuarterProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialise from URL param or fall back to default
  const paramValue = searchParams.get('quarter');
  const initialQuarter =
    AVAILABLE_QUARTERS.find((q) => q.value === paramValue)?.value || DEFAULT_QUARTER;

  const [selectedQuarter, setSelectedQuarterState] = useState(initialQuarter);

  const setQuarter = useCallback(
    (value) => {
      setSelectedQuarterState(value);
      // Sync to URL — omit param when it's the default to keep URLs clean
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === DEFAULT_QUARTER) {
            next.delete('quarter');
          } else {
            next.set('quarter', value);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const quarterConfig = useMemo(
    () => AVAILABLE_QUARTERS.find((q) => q.value === selectedQuarter),
    [selectedQuarter],
  );

  const ctx = useMemo(
    () => ({
      selectedQuarter,
      quarterConfig,
      setQuarter,
      availableQuarters: AVAILABLE_QUARTERS,
    }),
    [selectedQuarter, quarterConfig, setQuarter],
  );

  return <QuarterContext.Provider value={ctx}>{children}</QuarterContext.Provider>;
};

/**
 * Hook to consume the global quarter state.
 * Must be used inside <QuarterProvider>.
 */
export const useQuarter = () => {
  const ctx = useContext(QuarterContext);
  if (!ctx) {
    throw new Error('useQuarter must be used within a QuarterProvider');
  }
  return ctx;
};
