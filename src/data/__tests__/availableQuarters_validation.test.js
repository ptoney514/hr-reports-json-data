/**
 * Available Quarters Business Logic Validation
 *
 * Validates FALLBACK_QUARTERS against Creighton University fiscal calendar rules.
 * Creighton fiscal year starts July 1:
 *   Q1 = Jul-Sep (ends 9/30)
 *   Q2 = Oct-Dec (ends 12/31)
 *   Q3 = Jan-Mar (ends 3/31)
 *   Q4 = Apr-Jun (ends 6/30)
 */

import { FALLBACK_QUARTERS } from '../../hooks/useAvailableQuarters';

describe('Available Quarters Business Logic Validation', () => {
  it('FALLBACK_QUARTERS is a non-empty array', () => {
    expect(Array.isArray(FALLBACK_QUARTERS)).toBe(true);
    expect(FALLBACK_QUARTERS.length).toBeGreaterThan(0);
  });

  it('quarter values are valid quarter-end dates (9/30, 12/31, 3/31, 6/30)', () => {
    const validEndings = ['09-30', '12-31', '03-31', '06-30'];

    FALLBACK_QUARTERS.forEach((quarter) => {
      const monthDay = quarter.value.slice(5);
      expect(validEndings).toContain(monthDay);
    });
  });

  it('labels follow Q# FY## pattern', () => {
    FALLBACK_QUARTERS.forEach((quarter) => {
      expect(quarter.label).toMatch(/^Q[1-4] FY\d{2}$/);
    });
  });

  it('period strings contain month range and year', () => {
    FALLBACK_QUARTERS.forEach((quarter) => {
      // Period should match "Month - Month YYYY"
      expect(quarter.period).toMatch(/\w+ - \w+ \d{4}/);
    });
  });

  it('Q1 FY26 (2025-09-30) is always present in fallback', () => {
    const q1fy26 = FALLBACK_QUARTERS.find((q) => q.value === '2025-09-30');

    expect(q1fy26).toBeDefined();
    expect(q1fy26.label).toBe('Q1 FY26');
    expect(q1fy26.fiscalYear).toBe('FY26');
  });

  describe('Creighton Fiscal Calendar Alignment', () => {
    // Map quarter-end month-day to expected quarter number
    const quarterEndToQ = {
      '09-30': 1, // Q1 = Jul-Sep
      '12-31': 2, // Q2 = Oct-Dec
      '03-31': 3, // Q3 = Jan-Mar
      '06-30': 4, // Q4 = Apr-Jun
    };

    // Map quarter number to expected period months
    const quarterToPeriod = {
      1: { start: 'July', end: 'September' },
      2: { start: 'October', end: 'December' },
      3: { start: 'January', end: 'March' },
      4: { start: 'April', end: 'June' },
    };

    it('quarter labels match the calendar quarter for each date', () => {
      FALLBACK_QUARTERS.forEach((quarter) => {
        const monthDay = quarter.value.slice(5);
        const expectedQ = quarterEndToQ[monthDay];
        const labelQ = parseInt(quarter.label.charAt(1), 10);

        expect(labelQ).toBe(expectedQ);
      });
    });

    it('period strings match the correct months for each quarter', () => {
      FALLBACK_QUARTERS.forEach((quarter) => {
        const monthDay = quarter.value.slice(5);
        const qNum = quarterEndToQ[monthDay];
        const expected = quarterToPeriod[qNum];

        expect(quarter.period).toContain(expected.start);
        expect(quarter.period).toContain(expected.end);
      });
    });

    it('fiscal year in label matches fiscal year field', () => {
      FALLBACK_QUARTERS.forEach((quarter) => {
        const labelFY = quarter.label.split(' ')[1]; // "FY26"
        expect(quarter.fiscalYear).toBe(labelFY);
      });
    });

    it('Q1 ends on 9/30 and fiscal year is calendar year + 1', () => {
      const q1Quarters = FALLBACK_QUARTERS.filter((q) => q.label.startsWith('Q1'));

      q1Quarters.forEach((quarter) => {
        expect(quarter.value).toMatch(/-09-30$/);

        // For Q1 FY26, the calendar year is 2025 and fiscal year is FY26
        const calendarYear = parseInt(quarter.value.slice(0, 4), 10);
        const fyYear = parseInt(quarter.fiscalYear.replace('FY', ''), 10);
        expect(fyYear).toBe((calendarYear % 100) + 1);
      });
    });
  });
});
