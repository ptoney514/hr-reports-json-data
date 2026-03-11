/**
 * Annual and Quarterly Turnover Rates Data Validation Test Suite
 *
 * Validates ANNUAL_TURNOVER_RATES_BY_CATEGORY and TURNOVER_BENCHMARKS data structures.
 * Ensures data integrity and consistency with source data.
 *
 * Data Structure:
 * - FY 2023 rates compared against CUPA 2022-23 benchmarks
 * - FY 2024 rates compared against CUPA 2023-24 benchmarks
 * - FY 2025 rates compared against CUPA 2024-25 benchmarks
 * - Q1 FY26 rates (annualized) compared against CUPA 2024-25 benchmarks
 * - Q2 FY26 rates (annualized) compared against CUPA 2024-25 benchmarks
 */

import {
  ANNUAL_TURNOVER_RATES_BY_CATEGORY,
  TURNOVER_BENCHMARKS,
  QUARTERLY_TURNOVER_RATES_BY_CATEGORY,
  QUARTERLY_TURNOVER_BENCHMARKS,
  getAnnualTurnoverRatesByCategory,
  getQuarterlyTurnoverRatesByCategory
} from '../staticData';

describe('Annual Turnover Rates Data Validation', () => {
  const { annualRates, benchmarks } = getAnnualTurnoverRatesByCategory();

  describe('Data Structure Validation', () => {
    it('should have all required fiscal year periods', () => {
      expect(annualRates).toHaveProperty('fy2023');
      expect(annualRates).toHaveProperty('fy2024');
      expect(annualRates).toHaveProperty('fy2025');
      expect(annualRates).toHaveProperty('q1fy26');
      expect(annualRates).toHaveProperty('q2fy26');
    });

    it('should have all required fields for each period', () => {
      const periods = ['fy2023', 'fy2024', 'fy2025', 'q1fy26', 'q2fy26'];
      const requiredFields = ['label', 'period', 'faculty', 'staffExempt', 'staffNonExempt', 'total'];

      periods.forEach(period => {
        requiredFields.forEach(field => {
          expect(annualRates[period]).toHaveProperty(field);
        });
      });
    });

    it('should have correct labels for each period', () => {
      expect(annualRates.fy2023.label).toBe('FY 2023');
      expect(annualRates.fy2024.label).toBe('FY 2024');
      expect(annualRates.fy2025.label).toBe('FY 2025');
      expect(annualRates.q1fy26.label).toBe('Q1 FY26');
      expect(annualRates.q2fy26.label).toBe('FY26 Annualized');
    });
  });

  describe('Annual Rate Values Validation', () => {
    it('should have correct FY 2023 rates', () => {
      expect(annualRates.fy2023.faculty).toBe(7.9);
      expect(annualRates.fy2023.staffExempt).toBe(15.5);
      expect(annualRates.fy2023.staffNonExempt).toBe(22.4);
      expect(annualRates.fy2023.total).toBe(14.9);
    });

    it('should have correct FY 2024 rates', () => {
      expect(annualRates.fy2024.faculty).toBe(7.7);
      expect(annualRates.fy2024.staffExempt).toBe(13.6);
      expect(annualRates.fy2024.staffNonExempt).toBe(17.8);
      expect(annualRates.fy2024.total).toBe(12.8);
    });

    it('should have correct FY 2025 rates', () => {
      expect(annualRates.fy2025.faculty).toBe(6.1);
      expect(annualRates.fy2025.staffExempt).toBe(12.6);
      expect(annualRates.fy2025.staffNonExempt).toBe(15.3);
      expect(annualRates.fy2025.total).toBe(11.2);
    });

    it('should have correct Q1 FY26 rates (annualized)', () => {
      expect(annualRates.q1fy26.faculty).toBe(2.3);
      expect(annualRates.q1fy26.staffExempt).toBe(16.5);
      expect(annualRates.q1fy26.staffNonExempt).toBe(13.8);
      expect(annualRates.q1fy26.total).toBe(10.8);
    });

    it('should have correct Q2 FY26 rates (annualized)', () => {
      expect(annualRates.q2fy26.faculty).toBe(2.6);
      expect(annualRates.q2fy26.staffExempt).toBe(8.0);
      expect(annualRates.q2fy26.staffNonExempt).toBe(17.9);
      expect(annualRates.q2fy26.total).toBe(8.7);
    });

    it('should have all rates within expected range (0-100%)', () => {
      const periods = ['fy2023', 'fy2024', 'fy2025', 'q1fy26', 'q2fy26'];
      const categories = ['faculty', 'staffExempt', 'staffNonExempt', 'total'];

      periods.forEach(period => {
        categories.forEach(category => {
          expect(annualRates[period][category]).toBeGreaterThanOrEqual(0);
          expect(annualRates[period][category]).toBeLessThanOrEqual(100);
        });
      });
    });
  });

  describe('Benchmark Data Validation', () => {
    it('should have all fiscal year benchmarks', () => {
      expect(benchmarks).toHaveProperty('fy2223');
      expect(benchmarks).toHaveProperty('fy2324');
      expect(benchmarks).toHaveProperty('fy2425');
    });

    it('should have all required categories for each benchmark year', () => {
      const years = ['fy2223', 'fy2324', 'fy2425'];
      const requiredFields = ['label', 'faculty', 'staffExempt', 'staffNonExempt', 'total'];

      years.forEach(year => {
        requiredFields.forEach(field => {
          expect(benchmarks[year]).toHaveProperty(field);
        });
      });
    });

    it('should have correct 2022-23 CUPA benchmark values', () => {
      expect(benchmarks.fy2223.label).toBe('Higher Ed. Avg.* 2022-23');
      expect(benchmarks.fy2223.faculty).toBe(6.7);
      expect(benchmarks.fy2223.staffExempt).toBe(15.1);
      expect(benchmarks.fy2223.staffNonExempt).toBe(17.3);
      expect(benchmarks.fy2223.total).toBe(13.0);
    });

    it('should have correct 2023-24 CUPA benchmark values', () => {
      expect(benchmarks.fy2324.label).toBe('Higher Ed. Avg.* 2023-24');
      expect(benchmarks.fy2324.faculty).toBe(9.1);
      expect(benchmarks.fy2324.staffExempt).toBe(16.7);
      expect(benchmarks.fy2324.staffNonExempt).toBe(19.9);
      expect(benchmarks.fy2324.total).toBe(14.1);
    });

    it('should have correct 2024-25 CUPA benchmark values', () => {
      expect(benchmarks.fy2425.label).toBe('Higher Ed. Avg.* 2024-25');
      expect(benchmarks.fy2425.faculty).toBe(8.7);
      expect(benchmarks.fy2425.staffExempt).toBe(15.0);
      expect(benchmarks.fy2425.staffNonExempt).toBe(20.7);
      expect(benchmarks.fy2425.total).toBe(13.8);
    });

    it('should have positive benchmark values', () => {
      const years = ['fy2223', 'fy2324', 'fy2425'];
      const categories = ['faculty', 'staffExempt', 'staffNonExempt', 'total'];

      years.forEach(year => {
        categories.forEach(category => {
          expect(benchmarks[year][category]).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Benchmark Comparison Analysis', () => {
    it('should identify FY 2024 rates are below 2023-24 benchmarks', () => {
      expect(annualRates.fy2024.faculty).toBeLessThan(benchmarks.fy2324.faculty);
      expect(annualRates.fy2024.staffExempt).toBeLessThan(benchmarks.fy2324.staffExempt);
      expect(annualRates.fy2024.staffNonExempt).toBeLessThan(benchmarks.fy2324.staffNonExempt);
      expect(annualRates.fy2024.total).toBeLessThan(benchmarks.fy2324.total);
    });

    it('should identify FY 2025 rates are below 2024-25 benchmarks', () => {
      expect(annualRates.fy2025.faculty).toBeLessThan(benchmarks.fy2425.faculty);
      expect(annualRates.fy2025.staffExempt).toBeLessThan(benchmarks.fy2425.staffExempt);
      expect(annualRates.fy2025.staffNonExempt).toBeLessThan(benchmarks.fy2425.staffNonExempt);
      expect(annualRates.fy2025.total).toBeLessThan(benchmarks.fy2425.total);
    });

    it('should identify Q1 FY26 Staff Exempt is above benchmark (needs attention)', () => {
      // 16.5% is above 15.0% benchmark - this should be RED in the UI
      expect(annualRates.q1fy26.staffExempt).toBeGreaterThan(benchmarks.fy2425.staffExempt);
    });

    it('should identify Q1 FY26 Faculty, Staff Non-Exempt, and Total are below benchmark', () => {
      expect(annualRates.q1fy26.faculty).toBeLessThan(benchmarks.fy2425.faculty);
      expect(annualRates.q1fy26.staffNonExempt).toBeLessThan(benchmarks.fy2425.staffNonExempt);
      expect(annualRates.q1fy26.total).toBeLessThan(benchmarks.fy2425.total);
    });

    it('should identify all Q2 FY26 rates are below 2024-25 benchmarks', () => {
      expect(annualRates.q2fy26.faculty).toBeLessThan(benchmarks.fy2425.faculty);
      expect(annualRates.q2fy26.staffExempt).toBeLessThan(benchmarks.fy2425.staffExempt);
      expect(annualRates.q2fy26.staffNonExempt).toBeLessThan(benchmarks.fy2425.staffNonExempt);
      expect(annualRates.q2fy26.total).toBeLessThan(benchmarks.fy2425.total);
    });

    it('should identify FY 2023 Staff Non-Exempt above 2022-23 benchmark (needs attention)', () => {
      // 22.4% is above 17.3% benchmark
      expect(annualRates.fy2023.staffNonExempt).toBeGreaterThan(benchmarks.fy2223.staffNonExempt);
    });

    it('should identify FY 2023 Total above 2022-23 benchmark (needs attention)', () => {
      // 14.9% is above 13.0% benchmark
      expect(annualRates.fy2023.total).toBeGreaterThan(benchmarks.fy2223.total);
    });
  });

  describe('Year-over-Year Trends', () => {
    it('should show improvement from FY 2024 to FY 2025 in all categories', () => {
      expect(annualRates.fy2025.faculty).toBeLessThan(annualRates.fy2024.faculty);
      expect(annualRates.fy2025.staffExempt).toBeLessThan(annualRates.fy2024.staffExempt);
      expect(annualRates.fy2025.staffNonExempt).toBeLessThan(annualRates.fy2024.staffNonExempt);
      expect(annualRates.fy2025.total).toBeLessThan(annualRates.fy2024.total);
    });
  });

  describe('Data Export Functions', () => {
    it('should return annualRates and benchmarks from getAnnualTurnoverRatesByCategory', () => {
      const result = getAnnualTurnoverRatesByCategory();
      expect(result).toHaveProperty('annualRates');
      expect(result).toHaveProperty('benchmarks');
    });

    it('should return correct data references from getAnnualTurnoverRatesByCategory', () => {
      const result = getAnnualTurnoverRatesByCategory();
      expect(result.annualRates).toBe(ANNUAL_TURNOVER_RATES_BY_CATEGORY);
      expect(result.benchmarks).toBe(TURNOVER_BENCHMARKS);
    });
  });
});

// Legacy tests for backward compatibility
describe('Legacy Quarterly Turnover Data (Backward Compatibility)', () => {
  describe('Legacy Data Structure', () => {
    it('should still export QUARTERLY_TURNOVER_RATES_BY_CATEGORY', () => {
      expect(QUARTERLY_TURNOVER_RATES_BY_CATEGORY).toBeDefined();
      expect(Array.isArray(QUARTERLY_TURNOVER_RATES_BY_CATEGORY)).toBe(true);
    });

    it('should still export QUARTERLY_TURNOVER_BENCHMARKS', () => {
      expect(QUARTERLY_TURNOVER_BENCHMARKS).toBeDefined();
      expect(QUARTERLY_TURNOVER_BENCHMARKS.faculty).toBe(8.7);
      expect(QUARTERLY_TURNOVER_BENCHMARKS.staffExempt).toBe(15.0);
      expect(QUARTERLY_TURNOVER_BENCHMARKS.staffNonExempt).toBe(20.7);
      expect(QUARTERLY_TURNOVER_BENCHMARKS.total).toBe(13.8);
    });

    it('should still export getQuarterlyTurnoverRatesByCategory function', () => {
      const result = getQuarterlyTurnoverRatesByCategory();
      expect(result).toHaveProperty('rates');
      expect(result).toHaveProperty('benchmarks');
    });

    it('should have Q1 FY26 data in legacy quarterly format', () => {
      const q1fy26 = QUARTERLY_TURNOVER_RATES_BY_CATEGORY.find(q => q.quarter === 'Q1 FY26');
      expect(q1fy26).toBeDefined();
      expect(q1fy26.faculty.rate).toBe(2.3);
      expect(q1fy26.staffExempt.rate).toBe(16.5);
      expect(q1fy26.staffNonExempt.rate).toBe(13.8);
      expect(q1fy26.total.rate).toBe(10.8);
    });

    it('should have Q2 FY26 data in legacy quarterly format', () => {
      const q2fy26 = QUARTERLY_TURNOVER_RATES_BY_CATEGORY.find(q => q.quarter === 'Q2 FY26');
      expect(q2fy26).toBeDefined();
      expect(q2fy26.faculty.rate).toBe(2.6);
      expect(q2fy26.staffExempt.rate).toBe(8.0);
      expect(q2fy26.staffNonExempt.rate).toBe(17.9);
      expect(q2fy26.total.rate).toBe(8.7);
    });
  });
});
