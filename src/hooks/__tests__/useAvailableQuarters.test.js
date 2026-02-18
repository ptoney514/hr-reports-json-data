/**
 * useAvailableQuarters Hook Tests
 *
 * Tests for src/hooks/useAvailableQuarters.js - fetches available quarters
 * from the API with fallback to hardcoded quarters.
 */

// Mock apiService.getAvailableQuarters
jest.mock('../../services/apiService', () => ({
  getAvailableQuarters: jest.fn(),
}));

import { renderHook, waitFor } from '@testing-library/react';
import { useAvailableQuarters, FALLBACK_QUARTERS } from '../useAvailableQuarters';
import { getAvailableQuarters } from '../../services/apiService';
import { mockAvailableQuarters } from '../../__fixtures__/testData';

describe('useAvailableQuarters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns fetched quarters filtered by hasData on API success', async () => {
    getAvailableQuarters.mockResolvedValueOnce(mockAvailableQuarters);

    const { result } = renderHook(() => useAvailableQuarters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // All mock quarters have hasData: true
    expect(result.current.quarters).toEqual(mockAvailableQuarters);
    expect(result.current.error).toBeNull();
  });

  it('falls back to FALLBACK_QUARTERS on API failure', async () => {
    getAvailableQuarters.mockRejectedValueOnce(new Error('Network error'));

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { result } = renderHook(() => useAvailableQuarters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.quarters).toEqual(FALLBACK_QUARTERS);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error.message).toBe('Network error');

    consoleSpy.mockRestore();
  });

  it('filters out quarters with hasData: false', async () => {
    const quartersWithMixed = [
      { value: '2025-09-30', label: 'Q1 FY26', period: 'July - September 2025', fiscalYear: 'FY26', hasData: true },
      { value: '2025-06-30', label: 'Q4 FY25', period: 'April - June 2025', fiscalYear: 'FY25', hasData: false },
      { value: '2025-03-31', label: 'Q3 FY25', period: 'January - March 2025', fiscalYear: 'FY25', hasData: true },
    ];

    getAvailableQuarters.mockResolvedValueOnce(quartersWithMixed);

    const { result } = renderHook(() => useAvailableQuarters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.quarters).toHaveLength(2);
    expect(result.current.quarters.every(q => q.hasData)).toBe(true);
    expect(result.current.quarters.find(q => q.value === '2025-06-30')).toBeUndefined();
  });

  it('falls back to FALLBACK_QUARTERS when all quarters have hasData: false', async () => {
    const allNoData = [
      { value: '2025-09-30', label: 'Q1 FY26', period: 'July - September 2025', fiscalYear: 'FY26', hasData: false },
    ];

    getAvailableQuarters.mockResolvedValueOnce(allNoData);

    const { result } = renderHook(() => useAvailableQuarters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.quarters).toEqual(FALLBACK_QUARTERS);
  });

  it('loading starts true and ends false', async () => {
    getAvailableQuarters.mockResolvedValueOnce(mockAvailableQuarters);

    const { result } = renderHook(() => useAvailableQuarters());

    // Initially loading
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('FALLBACK_QUARTERS export contains Q1 FY26', () => {
    expect(FALLBACK_QUARTERS).toBeDefined();
    expect(Array.isArray(FALLBACK_QUARTERS)).toBe(true);

    const q1fy26 = FALLBACK_QUARTERS.find(q => q.value === '2025-09-30');
    expect(q1fy26).toBeDefined();
    expect(q1fy26.label).toBe('Q1 FY26');
    expect(q1fy26.period).toBe('July - September 2025');
    expect(q1fy26.fiscalYear).toBe('FY26');
    expect(q1fy26.hasData).toBe(true);
  });
});
