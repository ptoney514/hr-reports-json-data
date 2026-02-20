/**
 * QuarterContext Tests
 *
 * Tests for src/contexts/QuarterContext.jsx - global quarter state management.
 * Wraps in MemoryRouter for useSearchParams compatibility.
 */

// Mock useAvailableQuarters hook
jest.mock('../../hooks/useAvailableQuarters', () => ({
  useAvailableQuarters: jest.fn(),
  FALLBACK_QUARTERS: [
    {
      value: '2025-09-30',
      label: 'Q1 FY26',
      period: 'July - September 2025',
      fiscalYear: 'FY26',
      hasData: true,
    },
  ],
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QuarterProvider, useQuarter, AVAILABLE_QUARTERS } from '../QuarterContext';
import { useAvailableQuarters } from '../../hooks/useAvailableQuarters';

// Helper component to consume context
const TestConsumer = () => {
  const ctx = useQuarter();
  return (
    <div>
      <div data-testid="quarter">{ctx.selectedQuarter}</div>
      <div data-testid="loading">{String(ctx.quartersLoading)}</div>
      <div data-testid="available-count">{ctx.availableQuarters.length}</div>
    </div>
  );
};

// Wrapper with MemoryRouter + QuarterProvider
const createWrapper = (initialEntries = ['/']) => {
  return ({ children }) => (
    <MemoryRouter initialEntries={initialEntries}>
      <QuarterProvider>{children}</QuarterProvider>
    </MemoryRouter>
  );
};

describe('QuarterContext', () => {
  beforeEach(() => {
    useAvailableQuarters.mockReturnValue({
      quarters: [
        {
          value: '2025-09-30',
          label: 'Q1 FY26',
          period: 'July - September 2025',
          fiscalYear: 'FY26',
          hasData: true,
        },
      ],
      loading: false,
      error: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('defaults selected quarter to first available', () => {
    render(<TestConsumer />, { wrapper: createWrapper() });

    expect(screen.getByTestId('quarter').textContent).toBe('2025-09-30');
  });

  it('supports URL param ?quarter= for deep-linking', () => {
    useAvailableQuarters.mockReturnValue({
      quarters: [
        { value: '2025-09-30', label: 'Q1 FY26', period: 'July - September 2025', fiscalYear: 'FY26', hasData: true },
        { value: '2025-06-30', label: 'Q4 FY25', period: 'April - June 2025', fiscalYear: 'FY25', hasData: true },
      ],
      loading: false,
      error: null,
    });

    render(<TestConsumer />, {
      wrapper: createWrapper(['/?quarter=2025-06-30']),
    });

    expect(screen.getByTestId('quarter').textContent).toBe('2025-06-30');
  });

  it('falls back to default when URL param is invalid', () => {
    render(<TestConsumer />, {
      wrapper: createWrapper(['/?quarter=invalid-date']),
    });

    expect(screen.getByTestId('quarter').textContent).toBe('2025-09-30');
  });

  it('exports AVAILABLE_QUARTERS for backward compatibility', () => {
    expect(AVAILABLE_QUARTERS).toBeDefined();
    expect(Array.isArray(AVAILABLE_QUARTERS)).toBe(true);
    expect(AVAILABLE_QUARTERS.length).toBeGreaterThan(0);
    expect(AVAILABLE_QUARTERS[0]).toHaveProperty('value');
    expect(AVAILABLE_QUARTERS[0]).toHaveProperty('label');
  });

  it('throws when useQuarter is used outside QuarterProvider', () => {
    const ThrowingConsumer = () => {
      useQuarter();
      return null;
    };

    // Suppress console.error from React for the expected error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(
        <MemoryRouter>
          <ThrowingConsumer />
        </MemoryRouter>
      );
    }).toThrow('useQuarter must be used within a QuarterProvider');

    consoleSpy.mockRestore();
  });

  it('provides availableQuarters from hook', () => {
    render(<TestConsumer />, { wrapper: createWrapper() });

    expect(screen.getByTestId('available-count').textContent).toBe('1');
  });
});
