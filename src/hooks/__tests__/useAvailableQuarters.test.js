/**
 * useAvailableQuarters Hook Tests
 *
 * Tests the hook in JSON mode (default). API-mode behavior is tested in
 * src/__tests__/integration/dataSourceParity.test.js and apiService.test.js.
 */

import { renderHook } from '@testing-library/react';
import { useAvailableQuarters, FALLBACK_QUARTERS } from '../useAvailableQuarters';

describe('useAvailableQuarters', () => {
  describe('JSON mode (default)', () => {
    it('returns filtered quarters immediately without loading', () => {
      const { result } = renderHook(() => useAvailableQuarters());

      const expected = FALLBACK_QUARTERS.filter(q => q.hasData);
      expect(result.current.quarters).toEqual(expected);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('returns only 3 quarters with data (Q2 FY26 + Q1 FY26 + Q4 FY25)', () => {
      const { result } = renderHook(() => useAvailableQuarters());

      expect(result.current.quarters).toHaveLength(3);
    });

    it('quarters are sorted newest-first', () => {
      const { result } = renderHook(() => useAvailableQuarters());

      const values = result.current.quarters.map(q => q.value);
      const sorted = [...values].sort((a, b) => b.localeCompare(a));
      expect(values).toEqual(sorted);
    });

    it('all returned quarters have hasData: true', () => {
      const { result } = renderHook(() => useAvailableQuarters());

      expect(result.current.quarters.every(q => q.hasData)).toBe(true);
    });

    it('hook filters to only quarters with data', () => {
      const { result } = renderHook(() => useAvailableQuarters());

      const quartersWithData = FALLBACK_QUARTERS.filter(q => q.hasData);
      expect(result.current.quarters).toEqual(quartersWithData);
      expect(result.current.quarters.length).toBeLessThan(FALLBACK_QUARTERS.length);
    });
  });

  describe('FALLBACK_QUARTERS export', () => {
    it('contains all 7 quarters', () => {
      expect(FALLBACK_QUARTERS).toBeDefined();
      expect(Array.isArray(FALLBACK_QUARTERS)).toBe(true);
      expect(FALLBACK_QUARTERS).toHaveLength(7);
    });

    it('contains Q2 FY26', () => {
      const q2fy26 = FALLBACK_QUARTERS.find(q => q.value === '2025-12-31');
      expect(q2fy26).toBeDefined();
      expect(q2fy26.label).toBe('Q2 FY26');
      expect(q2fy26.period).toBe('October - December 2025');
      expect(q2fy26.fiscalYear).toBe('FY26');
      expect(q2fy26.hasData).toBe(true);
    });

    it('contains Q1 FY26', () => {
      const q1fy26 = FALLBACK_QUARTERS.find(q => q.value === '2025-09-30');
      expect(q1fy26).toBeDefined();
      expect(q1fy26.label).toBe('Q1 FY26');
      expect(q1fy26.period).toBe('July - September 2025');
      expect(q1fy26.fiscalYear).toBe('FY26');
      expect(q1fy26.hasData).toBe(true);
    });

    it('all entries have required fields', () => {
      FALLBACK_QUARTERS.forEach(q => {
        expect(q).toHaveProperty('value');
        expect(q).toHaveProperty('label');
        expect(q).toHaveProperty('period');
        expect(q).toHaveProperty('fiscalYear');
        expect(q).toHaveProperty('hasData');
      });
    });

    it('quarter values are valid quarter-end dates', () => {
      const validEndings = ['03-31', '06-30', '09-30', '12-31'];

      FALLBACK_QUARTERS.forEach(q => {
        const monthDay = q.value.slice(5);
        expect(validEndings).toContain(monthDay);
      });
    });
  });
});
