/**
 * Data Comparison Service Tests
 *
 * Tests for src/services/dataComparisonService.js - the utility for
 * comparing data between JSON and API sources.
 */

import {
  deepEqual,
  findDifferences,
  compareDataSources,
  validateAllEndpoints,
  generateComparisonReport,
  checkCriticalParity
} from '../dataComparisonService';

// Create mock data
const mockData = {
  workforce: { totalEmployees: 5415, faculty: 670, staff: 4745 },
  turnover: { terminations: 222, voluntaryRate: 8.5 },
  exitSurvey: { responseRate: 65.2, satisfaction: 3.8 },
  schools: [{ name: 'School A', headcount: 500 }],
  annualRates: [{ category: 'Faculty', rate: 5.2 }],
  quarterlyWorkforce: { totalEmployees: 5400 },
  quarterlyTurnover: { terminations: 55 }
};

// Mock the dependencies
jest.mock('../../data/staticData', () => ({
  getWorkforceData: jest.fn(),
  getTurnoverData: jest.fn(),
  getExitSurveyData: jest.fn(),
  getTop15SchoolOrgData: jest.fn(),
  getAnnualTurnoverRatesByCategory: jest.fn(),
  getQuarterlyWorkforceData: jest.fn(),
  getQuarterlyTurnoverData: jest.fn()
}));

jest.mock('../apiService', () => ({
  getWorkforceData: jest.fn(),
  getTurnoverData: jest.fn(),
  getExitSurveyData: jest.fn(),
  getTop15SchoolOrgData: jest.fn(),
  getAnnualTurnoverRates: jest.fn()
}));

const staticData = require('../../data/staticData');
const apiService = require('../apiService');

describe('dataComparisonService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock implementations
    staticData.getWorkforceData.mockReturnValue(mockData.workforce);
    staticData.getTurnoverData.mockReturnValue(mockData.turnover);
    staticData.getExitSurveyData.mockReturnValue(mockData.exitSurvey);
    staticData.getTop15SchoolOrgData.mockReturnValue(mockData.schools);
    staticData.getAnnualTurnoverRatesByCategory.mockReturnValue(mockData.annualRates);
    staticData.getQuarterlyWorkforceData.mockReturnValue(mockData.quarterlyWorkforce);
    staticData.getQuarterlyTurnoverData.mockReturnValue(mockData.quarterlyTurnover);
  });

  describe('deepEqual', () => {
    it('returns true for identical primitives', () => {
      expect(deepEqual(5, 5)).toBe(true);
      expect(deepEqual('hello', 'hello')).toBe(true);
      expect(deepEqual(true, true)).toBe(true);
      expect(deepEqual(null, null)).toBe(true);
    });

    it('returns false for different primitives', () => {
      expect(deepEqual(5, 6)).toBe(false);
      expect(deepEqual('hello', 'world')).toBe(false);
      expect(deepEqual(true, false)).toBe(false);
    });

    it('returns true for identical objects', () => {
      expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(deepEqual({ nested: { value: 1 } }, { nested: { value: 1 } })).toBe(true);
    });

    it('returns false for different objects', () => {
      expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false);
      expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });

    it('returns true for identical arrays', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(deepEqual([{ a: 1 }], [{ a: 1 }])).toBe(true);
    });

    it('returns false for different arrays', () => {
      expect(deepEqual([1, 2], [1, 3])).toBe(false);
      expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it('handles floating point comparison with tolerance', () => {
      expect(deepEqual(0.1 + 0.2, 0.3)).toBe(true);
      expect(deepEqual(1.0001, 1.0002)).toBe(true);
      expect(deepEqual(1.0, 1.1)).toBe(false);
    });

    it('handles null and undefined correctly', () => {
      expect(deepEqual(null, undefined)).toBe(false);
      expect(deepEqual(undefined, undefined)).toBe(true);
    });

    it('handles type mismatches', () => {
      expect(deepEqual('5', 5)).toBe(false);
      expect(deepEqual([], {})).toBe(false);
    });
  });

  describe('findDifferences', () => {
    it('returns empty array for identical objects', () => {
      const obj = { a: 1, b: 2 };
      expect(findDifferences(obj, obj)).toEqual([]);
    });

    it('detects value mismatches', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 2 };
      const diffs = findDifferences(obj1, obj2);

      expect(diffs).toHaveLength(1);
      expect(diffs[0].path).toBe('a');
      expect(diffs[0].type).toBe('value_mismatch');
      expect(diffs[0].jsonValue).toBe(1);
      expect(diffs[0].apiValue).toBe(2);
    });

    it('detects missing keys in API', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1 };
      const diffs = findDifferences(obj1, obj2);

      expect(diffs).toHaveLength(1);
      expect(diffs[0].type).toBe('missing_in_api');
      expect(diffs[0].path).toBe('b');
    });

    it('detects missing keys in JSON', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1, b: 2 };
      const diffs = findDifferences(obj1, obj2);

      expect(diffs).toHaveLength(1);
      expect(diffs[0].type).toBe('missing_in_json');
      expect(diffs[0].path).toBe('b');
    });

    it('detects nested differences', () => {
      const obj1 = { nested: { value: 1 } };
      const obj2 = { nested: { value: 2 } };
      const diffs = findDifferences(obj1, obj2);

      expect(diffs).toHaveLength(1);
      expect(diffs[0].path).toBe('nested.value');
    });

    it('detects array length mismatches', () => {
      const obj1 = { arr: [1, 2] };
      const obj2 = { arr: [1, 2, 3] };
      const diffs = findDifferences(obj1, obj2);

      const lengthDiff = diffs.find(d => d.type === 'array_length_mismatch');
      expect(lengthDiff).toBeDefined();
    });

    it('handles null values', () => {
      const obj1 = { a: null };
      const obj2 = { a: 1 };
      const diffs = findDifferences(obj1, obj2);

      expect(diffs.length).toBeGreaterThan(0);
    });
  });

  describe('compareDataSources', () => {
    it('returns match=true when data is identical', async () => {
      apiService.getWorkforceData.mockResolvedValue(mockData.workforce);

      const result = await compareDataSources('workforce', '2025-06-30');

      expect(result.match).toBe(true);
      expect(result.differences).toHaveLength(0);
      expect(result.timestamp).toBeDefined();
    });

    it('returns match=false when data differs', async () => {
      apiService.getWorkforceData.mockResolvedValue({ totalEmployees: 5000, faculty: 670, staff: 4745 });

      const result = await compareDataSources('workforce', '2025-06-30');

      expect(result.match).toBe(false);
      expect(result.differences.length).toBeGreaterThan(0);
    });

    it('handles API errors gracefully', async () => {
      apiService.getWorkforceData.mockRejectedValue(new Error('API unavailable'));

      const result = await compareDataSources('workforce', '2025-06-30');

      expect(result.match).toBe(false);
      expect(result.apiError).toBe('API unavailable');
      expect(result.jsonData).toEqual(mockData.workforce);
    });

    it('throws for unknown data types', async () => {
      await expect(compareDataSources('unknown', '2025-06-30'))
        .rejects.toThrow('Unknown data type: unknown');
    });

    it('works with turnover data type', async () => {
      apiService.getTurnoverData.mockResolvedValue(mockData.turnover);

      const result = await compareDataSources('turnover', '2025-06-30');

      expect(result.match).toBe(true);
    });

    it('works with exitSurvey data type', async () => {
      apiService.getExitSurveyData.mockResolvedValue(mockData.exitSurvey);

      const result = await compareDataSources('exitSurvey', '2025-06-30');

      expect(result.match).toBe(true);
    });
  });

  describe('validateAllEndpoints', () => {
    beforeEach(() => {
      // Set up default mocks for all endpoints
      apiService.getWorkforceData.mockResolvedValue({ totalEmployees: 5415, faculty: 670, staff: 4745 });
      apiService.getTurnoverData.mockResolvedValue({ terminations: 222, voluntaryRate: 8.5 });
      apiService.getExitSurveyData.mockResolvedValue({ responseRate: 65.2, satisfaction: 3.8 });
      apiService.getTop15SchoolOrgData.mockResolvedValue([{ name: 'School A', headcount: 500 }]);
      apiService.getAnnualTurnoverRates.mockResolvedValue([{ category: 'Faculty', rate: 5.2 }]);
    });

    it('validates all endpoints and returns summary', async () => {
      const result = await validateAllEndpoints('2025-06-30');

      expect(result.allMatch).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.total).toBeGreaterThan(0);
      expect(result.results).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('counts matched and mismatched correctly', async () => {
      // Make one endpoint return different data
      apiService.getTurnoverData.mockResolvedValue({ terminations: 200, voluntaryRate: 8.5 });

      const result = await validateAllEndpoints('2025-06-30');

      expect(result.allMatch).toBe(false);
      expect(result.summary.matched).toBeLessThan(result.summary.total);
    });

    it('handles mixed success and failure', async () => {
      apiService.getWorkforceData.mockRejectedValue(new Error('API error'));

      const result = await validateAllEndpoints('2025-06-30');

      expect(result.summary.errors).toBeGreaterThan(0);
    });
  });

  describe('generateComparisonReport', () => {
    it('generates a readable report', () => {
      const validationResult = {
        allMatch: false,
        summary: {
          total: 5,
          matched: 4,
          mismatched: 1,
          errors: 0
        },
        results: {
          workforce: { match: true },
          turnover: {
            match: false,
            differences: [
              { path: 'terminations', type: 'value_mismatch', jsonValue: 222, apiValue: 200 }
            ]
          }
        },
        timestamp: '2025-01-30T12:00:00.000Z'
      };

      const report = generateComparisonReport(validationResult);

      expect(report).toContain('Data Source Comparison Report');
      expect(report).toContain('All Match: NO');
      expect(report).toContain('workforce');
      expect(report).toContain('MATCH');
      expect(report).toContain('turnover');
      expect(report).toContain('MISMATCH');
      expect(report).toContain('terminations');
    });

    it('handles errors in the report', () => {
      const validationResult = {
        allMatch: false,
        summary: { total: 1, matched: 0, mismatched: 0, errors: 1 },
        results: {
          workforce: { error: 'API unavailable' }
        },
        timestamp: '2025-01-30T12:00:00.000Z'
      };

      const report = generateComparisonReport(validationResult);

      expect(report).toContain('ERROR');
      expect(report).toContain('API unavailable');
    });

    it('truncates long difference lists', () => {
      const validationResult = {
        allMatch: false,
        summary: { total: 1, matched: 0, mismatched: 1, errors: 0 },
        results: {
          workforce: {
            match: false,
            differences: Array(10).fill({ path: 'field', type: 'value_mismatch', jsonValue: 1, apiValue: 2 })
          }
        },
        timestamp: '2025-01-30T12:00:00.000Z'
      };

      const report = generateComparisonReport(validationResult);

      expect(report).toContain('... and 5 more differences');
    });
  });

  describe('checkCriticalParity', () => {
    beforeEach(() => {
      // Override defaults for critical parity checks
      staticData.getTurnoverData.mockReturnValue({ terminations: 222, total: 222 });
      staticData.getWorkforceData.mockReturnValue({ totalEmployees: 5415 });
      staticData.getExitSurveyData.mockReturnValue({ responseRate: 65.2 });

      apiService.getTurnoverData.mockResolvedValue({ terminations: 222, total: 222 });
      apiService.getWorkforceData.mockResolvedValue({ totalEmployees: 5415 });
      apiService.getExitSurveyData.mockResolvedValue({ responseRate: 65.2 });
    });

    it('returns allPassed=true when all checks pass', async () => {
      const result = await checkCriticalParity('2025-06-30');

      expect(result.allPassed).toBe(true);
      expect(result.checks.length).toBeGreaterThan(0);
      expect(result.timestamp).toBeDefined();
    });

    it('checks FY25 termination count = 222', async () => {
      const result = await checkCriticalParity('2025-06-30');

      const terminationCheck = result.checks.find(c => c.name === 'FY25 Termination Count');
      expect(terminationCheck).toBeDefined();
      expect(terminationCheck.expected).toBe(222);
      expect(terminationCheck.passed).toBe(true);
    });

    it('fails when termination count is wrong', async () => {
      staticData.getTurnoverData.mockReturnValue({ terminations: 200 });

      const result = await checkCriticalParity('2025-06-30');

      const terminationCheck = result.checks.find(c => c.name === 'FY25 Termination Count');
      expect(terminationCheck.passed).toBe(false);
      expect(result.allPassed).toBe(false);
    });

    it('handles API errors', async () => {
      apiService.getTurnoverData.mockRejectedValue(new Error('API down'));

      const result = await checkCriticalParity('2025-06-30');

      const errorCheck = result.checks.find(c => c.name === 'API Connectivity');
      expect(errorCheck).toBeDefined();
      expect(errorCheck.passed).toBe(false);
    });
  });
});
