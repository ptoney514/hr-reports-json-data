/**
 * Quarterly Turnover Rates Data Validation Test Suite
 *
 * Validates QUARTERLY_TURNOVER_RATES_BY_CATEGORY data structure and calculations.
 * Ensures data integrity and consistency with source data.
 *
 * Data Source: QUARTERLY_TURNOVER_TRENDS + QUARTERLY_HEADCOUNT_TRENDS
 * Rate Calculation: (Quarterly Terminations / Headcount) * 4 * 100 (annualized)
 */

import {
  QUARTERLY_TURNOVER_RATES_BY_CATEGORY,
  QUARTERLY_TURNOVER_BENCHMARKS,
  getQuarterlyTurnoverRatesByCategory
} from '../staticData';

describe('Quarterly Turnover Rates Data Validation', () => {
  const { rates, benchmarks } = getQuarterlyTurnoverRatesByCategory();

  describe('Data Structure Validation', () => {
    it('should have exactly 4 quarters of data', () => {
      expect(rates).toHaveLength(4);
    });

    it('should have all required quarters', () => {
      const expectedQuarters = ['Q2 FY25', 'Q3 FY25', 'Q4 FY25', 'Q1 FY26'];
      const actualQuarters = rates.map(q => q.quarter);
      expect(actualQuarters).toEqual(expectedQuarters);
    });

    it('should have all required fields for each quarter', () => {
      rates.forEach(quarter => {
        expect(quarter).toHaveProperty('quarter');
        expect(quarter).toHaveProperty('period');
        expect(quarter).toHaveProperty('faculty');
        expect(quarter).toHaveProperty('staffExempt');
        expect(quarter).toHaveProperty('staffNonExempt');
        expect(quarter).toHaveProperty('staff');
        expect(quarter).toHaveProperty('total');
      });
    });

    it('should have all required fields for each category', () => {
      rates.forEach(quarter => {
        ['faculty', 'staffExempt', 'staffNonExempt', 'staff', 'total'].forEach(category => {
          expect(quarter[category]).toHaveProperty('terminations');
          expect(quarter[category]).toHaveProperty('headcount');
          expect(quarter[category]).toHaveProperty('rate');
        });
      });
    });
  });

  describe('Benchmark Data Validation', () => {
    it('should have all required benchmark categories', () => {
      expect(benchmarks).toHaveProperty('faculty');
      expect(benchmarks).toHaveProperty('staffExempt');
      expect(benchmarks).toHaveProperty('staffNonExempt');
      expect(benchmarks).toHaveProperty('total');
    });

    it('should have correct benchmark values from CUPA data', () => {
      expect(benchmarks.faculty).toBe(8.7);
      expect(benchmarks.staffExempt).toBe(15.0);
      expect(benchmarks.staffNonExempt).toBe(20.7);
      expect(benchmarks.total).toBe(13.8);
    });

    it('should have positive benchmark values', () => {
      Object.values(benchmarks).forEach(value => {
        expect(value).toBeGreaterThan(0);
      });
    });
  });

  describe('Rate Calculation Validation', () => {
    it('should calculate rates correctly: (terminations / headcount) * 4 * 100', () => {
      rates.forEach(quarter => {
        ['faculty', 'staffExempt', 'staffNonExempt', 'staff', 'total'].forEach(category => {
          const { terminations, headcount, rate } = quarter[category];
          const calculatedRate = (terminations / headcount) * 4 * 100;
          // Allow for rounding to 1 decimal place
          expect(Math.abs(rate - calculatedRate)).toBeLessThan(0.2);
        });
      });
    });

    it('should verify Q1 FY26 Faculty rate calculation', () => {
      const q1fy26 = rates.find(q => q.quarter === 'Q1 FY26');
      // (4/698)*4*100 = 2.29% ≈ 2.3%
      expect(q1fy26.faculty.terminations).toBe(4);
      expect(q1fy26.faculty.headcount).toBe(698);
      expect(q1fy26.faculty.rate).toBe(2.3);
    });

    it('should verify Q1 FY26 Total rate calculation', () => {
      const q1fy26 = rates.find(q => q.quarter === 'Q1 FY26');
      // (58/2149)*4*100 = 10.79% ≈ 10.8%
      expect(q1fy26.total.terminations).toBe(58);
      expect(q1fy26.total.headcount).toBe(2149);
      expect(q1fy26.total.rate).toBe(10.8);
    });

    it('should have all rates within expected range (0-100%)', () => {
      rates.forEach(quarter => {
        ['faculty', 'staffExempt', 'staffNonExempt', 'staff', 'total'].forEach(category => {
          expect(quarter[category].rate).toBeGreaterThanOrEqual(0);
          expect(quarter[category].rate).toBeLessThanOrEqual(100);
        });
      });
    });
  });

  describe('Staff Category Consistency', () => {
    it('should have staff terminations = staffExempt + staffNonExempt terminations', () => {
      rates.forEach(quarter => {
        const staffSum = quarter.staffExempt.terminations + quarter.staffNonExempt.terminations;
        expect(staffSum).toBe(quarter.staff.terminations);
      });
    });

    it('should have Q1 FY26 staff exempt/non-exempt as ACTUAL values', () => {
      const q1fy26 = rates.find(q => q.quarter === 'Q1 FY26');
      // Q1 FY26 actual values: 24 exempt, 30 non-exempt
      expect(q1fy26.staffExempt.terminations).toBe(24);
      expect(q1fy26.staffNonExempt.terminations).toBe(30);
      expect(q1fy26.staff.terminations).toBe(54);
    });
  });

  describe('Total Category Consistency', () => {
    it('should have total terminations = faculty + staff terminations for non-HSP quarters', () => {
      // Q1 FY26 excludes HSP (15) from total, so faculty + staff = total - HSP context
      rates.forEach(quarter => {
        const categorySum = quarter.faculty.terminations + quarter.staff.terminations;
        // Total represents faculty + staff (excluding HSP for reporting purposes)
        expect(categorySum).toBe(quarter.total.terminations);
      });
    });
  });

  describe('Benchmark Comparison Analysis', () => {
    it('should identify Faculty rates are all below benchmark', () => {
      rates.forEach(quarter => {
        expect(quarter.faculty.rate).toBeLessThan(benchmarks.faculty);
      });
    });

    it('should identify at least one Staff Exempt rate above benchmark', () => {
      const aboveBenchmark = rates.filter(q => q.staffExempt.rate > benchmarks.staffExempt);
      expect(aboveBenchmark.length).toBeGreaterThan(0);
    });

    it('should identify Staff Non-Exempt rates are all below benchmark', () => {
      rates.forEach(quarter => {
        expect(quarter.staffNonExempt.rate).toBeLessThan(benchmarks.staffNonExempt);
      });
    });
  });

  describe('Quarterly Progression', () => {
    it('should have quarters in chronological order', () => {
      const expectedOrder = ['Q2 FY25', 'Q3 FY25', 'Q4 FY25', 'Q1 FY26'];
      rates.forEach((quarter, index) => {
        expect(quarter.quarter).toBe(expectedOrder[index]);
      });
    });

    it('should have increasing headcount trend (growing organization)', () => {
      const totalHeadcounts = rates.map(q => q.total.headcount);
      // Allow for small decreases but general trend should be upward
      expect(totalHeadcounts[totalHeadcounts.length - 1]).toBeGreaterThanOrEqual(totalHeadcounts[0]);
    });
  });

  describe('Data Export Function', () => {
    it('should return both rates and benchmarks', () => {
      const result = getQuarterlyTurnoverRatesByCategory();
      expect(result).toHaveProperty('rates');
      expect(result).toHaveProperty('benchmarks');
    });

    it('should return correct data references', () => {
      const result = getQuarterlyTurnoverRatesByCategory();
      expect(result.rates).toBe(QUARTERLY_TURNOVER_RATES_BY_CATEGORY);
      expect(result.benchmarks).toBe(QUARTERLY_TURNOVER_BENCHMARKS);
    });
  });

  describe('Specific Quarter Data Validation', () => {
    describe('Q2 FY25 (Oct-Dec 2024)', () => {
      const q2fy25 = QUARTERLY_TURNOVER_RATES_BY_CATEGORY.find(q => q.quarter === 'Q2 FY25');

      it('should have correct period', () => {
        expect(q2fy25.period).toBe('Oct-Dec 2024');
      });

      it('should have correct total terminations and rate', () => {
        expect(q2fy25.total.terminations).toBe(38);
        expect(q2fy25.total.rate).toBe(7.1);
      });
    });

    describe('Q3 FY25 (Jan-Mar 2025)', () => {
      const q3fy25 = QUARTERLY_TURNOVER_RATES_BY_CATEGORY.find(q => q.quarter === 'Q3 FY25');

      it('should have correct period', () => {
        expect(q3fy25.period).toBe('Jan-Mar 2025');
      });

      it('should have correct total terminations and rate', () => {
        expect(q3fy25.total.terminations).toBe(51);
        expect(q3fy25.total.rate).toBe(9.6);
      });
    });

    describe('Q4 FY25 (Apr-Jun 2025)', () => {
      const q4fy25 = QUARTERLY_TURNOVER_RATES_BY_CATEGORY.find(q => q.quarter === 'Q4 FY25');

      it('should have correct period', () => {
        expect(q4fy25.period).toBe('Apr-Jun 2025');
      });

      it('should have correct total terminations and rate', () => {
        expect(q4fy25.total.terminations).toBe(51);
        expect(q4fy25.total.rate).toBe(9.5);
      });
    });

    describe('Q1 FY26 (Jul-Sep 2025)', () => {
      const q1fy26 = QUARTERLY_TURNOVER_RATES_BY_CATEGORY.find(q => q.quarter === 'Q1 FY26');

      it('should have correct period', () => {
        expect(q1fy26.period).toBe('Jul-Sep 2025');
      });

      it('should have correct total terminations and rate', () => {
        expect(q1fy26.total.terminations).toBe(58);
        expect(q1fy26.total.rate).toBe(10.8);
      });

      it('should have correct staff breakdown (ACTUAL values)', () => {
        expect(q1fy26.staffExempt.terminations).toBe(24);
        expect(q1fy26.staffExempt.rate).toBe(16.5);
        expect(q1fy26.staffNonExempt.terminations).toBe(30);
        expect(q1fy26.staffNonExempt.rate).toBe(13.8);
      });
    });
  });
});
