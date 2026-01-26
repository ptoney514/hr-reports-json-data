/**
 * Annual Turnover Rates Data Validation Test Suite
 *
 * Validates ANNUAL_TURNOVER_RATES_BY_CATEGORY data structure.
 * Ensures data integrity and consistency with source data.
 *
 * Data Source: HR data and CUPA Higher Education benchmarks
 */

import {
  ANNUAL_TURNOVER_RATES_BY_CATEGORY,
  getAnnualTurnoverRatesByCategory
} from '../staticData';

describe('Annual Turnover Rates Data Validation', () => {
  const data = getAnnualTurnoverRatesByCategory();

  describe('Data Structure Validation', () => {
    it('should have years array with 4 entries', () => {
      expect(data.years).toHaveLength(4);
    });

    it('should have correct fiscal year entries', () => {
      const fiscalYears = data.years.map(y => y.fiscalYear);
      expect(fiscalYears).toEqual(['FY 2023', 'FY 2024', 'FY 2025', 'FY26 Annualized']);
    });

    it('should have benchmarkYear for first 3 entries', () => {
      expect(data.years[0].benchmarkYear).toBe('2022-23');
      expect(data.years[1].benchmarkYear).toBe('2023-24');
      expect(data.years[2].benchmarkYear).toBe('2024-25');
    });

    it('should have null benchmarkYear for FY26 Annualized', () => {
      expect(data.years[3].benchmarkYear).toBeNull();
    });

    it('should have subLabel for FY26 Annualized', () => {
      expect(data.years[3].subLabel).toBe('12/31/2025');
    });
  });

  describe('Benchmark Data Validation', () => {
    it('should have benchmarks for 3 years', () => {
      expect(Object.keys(data.benchmarks)).toHaveLength(3);
    });

    it('should have correct 2022-23 benchmarks', () => {
      expect(data.benchmarks['2022-23']).toEqual({
        faculty: 6.7,
        staffExempt: 15.1,
        staffNonExempt: 17.3,
        total: 13.0
      });
    });

    it('should have correct 2023-24 benchmarks', () => {
      expect(data.benchmarks['2023-24']).toEqual({
        faculty: 9.1,
        staffExempt: 16.7,
        staffNonExempt: 19.9,
        total: 14.1
      });
    });

    it('should have correct 2024-25 benchmarks', () => {
      expect(data.benchmarks['2024-25']).toEqual({
        faculty: 8.7,
        staffExempt: 15.0,
        staffNonExempt: 20.7,
        total: 13.8
      });
    });
  });

  describe('Rate Data Validation', () => {
    it('should have rates for 4 fiscal years', () => {
      expect(Object.keys(data.rates)).toHaveLength(4);
    });

    it('should have correct FY 2023 rates', () => {
      expect(data.rates['FY 2023']).toEqual({
        faculty: 7.9,
        staffExempt: 15.5,
        staffNonExempt: 22.4,
        total: 14.9
      });
    });

    it('should have correct FY 2024 rates', () => {
      expect(data.rates['FY 2024']).toEqual({
        faculty: 7.7,
        staffExempt: 13.6,
        staffNonExempt: 17.8,
        total: 12.8
      });
    });

    it('should have correct FY 2025 rates', () => {
      expect(data.rates['FY 2025']).toEqual({
        faculty: 6.1,
        staffExempt: 12.6,
        staffNonExempt: 15.3,
        total: 11.2
      });
    });

    it('should have correct FY26 Annualized rates', () => {
      expect(data.rates['FY26 Annualized']).toEqual({
        faculty: 2.6,
        staffExempt: 8.0,
        staffNonExempt: 17.9,
        total: 8.7
      });
    });
  });

  describe('Benchmark Comparison Analysis', () => {
    it('should identify FY23 Staff Non-Exempt above benchmark (RED)', () => {
      // 22.4% > 17.3%
      expect(data.rates['FY 2023'].staffNonExempt).toBeGreaterThan(data.benchmarks['2022-23'].staffNonExempt);
    });

    it('should identify FY23 Staff Exempt above benchmark (RED)', () => {
      // 15.5% > 15.1%
      expect(data.rates['FY 2023'].staffExempt).toBeGreaterThan(data.benchmarks['2022-23'].staffExempt);
    });

    it('should identify FY23 Total above benchmark (RED)', () => {
      // 14.9% > 13.0%
      expect(data.rates['FY 2023'].total).toBeGreaterThan(data.benchmarks['2022-23'].total);
    });

    it('should identify FY23 Faculty above benchmark (RED)', () => {
      // 7.9% > 6.7%
      expect(data.rates['FY 2023'].faculty).toBeGreaterThan(data.benchmarks['2022-23'].faculty);
    });

    it('should identify all FY24 categories below benchmarks (GREEN)', () => {
      expect(data.rates['FY 2024'].faculty).toBeLessThan(data.benchmarks['2023-24'].faculty);
      expect(data.rates['FY 2024'].staffExempt).toBeLessThan(data.benchmarks['2023-24'].staffExempt);
      expect(data.rates['FY 2024'].staffNonExempt).toBeLessThan(data.benchmarks['2023-24'].staffNonExempt);
      expect(data.rates['FY 2024'].total).toBeLessThan(data.benchmarks['2023-24'].total);
    });

    it('should identify all FY25 categories below benchmarks (GREEN)', () => {
      expect(data.rates['FY 2025'].faculty).toBeLessThan(data.benchmarks['2024-25'].faculty);
      expect(data.rates['FY 2025'].staffExempt).toBeLessThan(data.benchmarks['2024-25'].staffExempt);
      expect(data.rates['FY 2025'].staffNonExempt).toBeLessThan(data.benchmarks['2024-25'].staffNonExempt);
      expect(data.rates['FY 2025'].total).toBeLessThan(data.benchmarks['2024-25'].total);
    });
  });

  describe('Getter Function', () => {
    it('should return the ANNUAL_TURNOVER_RATES_BY_CATEGORY data', () => {
      expect(getAnnualTurnoverRatesByCategory()).toBe(ANNUAL_TURNOVER_RATES_BY_CATEGORY);
    });
  });
});
