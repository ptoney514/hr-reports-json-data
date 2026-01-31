/**
 * Workforce Validation Service Tests
 *
 * Tests for validation service that compares JSON data against Neon API data.
 */

import {
  VALIDATION_RULES,
  getValueByPath,
  compareValues,
  formatValue,
  validateCategory,
  getValidationRulesCounts
} from '../workforceValidationService';

describe('workforceValidationService', () => {
  describe('VALIDATION_RULES', () => {
    describe('Location Omaha rules', () => {
      it('should have 6 Omaha location rules', () => {
        expect(VALIDATION_RULES.locationOmaha).toHaveLength(6);
      });

      it('should have correct apiPath for omaha_total', () => {
        const rule = VALIDATION_RULES.locationOmaha.find(r => r.id === 'omaha_total');
        expect(rule.apiPath).toBe('locationDetails.omaha.total');
      });

      it('should have correct apiPath for omaha_faculty', () => {
        const rule = VALIDATION_RULES.locationOmaha.find(r => r.id === 'omaha_faculty');
        expect(rule.apiPath).toBe('locationDetails.omaha.faculty');
      });

      it('should have correct apiPath for omaha_staff', () => {
        const rule = VALIDATION_RULES.locationOmaha.find(r => r.id === 'omaha_staff');
        expect(rule.apiPath).toBe('locationDetails.omaha.staff');
      });

      it('should have correct apiPath for omaha_hsp', () => {
        const rule = VALIDATION_RULES.locationOmaha.find(r => r.id === 'omaha_hsp');
        expect(rule.apiPath).toBe('locationDetails.omaha.hsp');
      });

      it('should have correct apiPath for omaha_students', () => {
        const rule = VALIDATION_RULES.locationOmaha.find(r => r.id === 'omaha_students');
        expect(rule.apiPath).toBe('locationDetails.omaha.students');
      });

      it('should have correct apiPath for omaha_temp', () => {
        const rule = VALIDATION_RULES.locationOmaha.find(r => r.id === 'omaha_temp');
        expect(rule.apiPath).toBe('locationDetails.omaha.temp');
      });

      it('should have all Omaha apiPaths pointing to locationDetails', () => {
        VALIDATION_RULES.locationOmaha.forEach(rule => {
          expect(rule.apiPath).toMatch(/^locationDetails\.omaha\./);
        });
      });
    });

    describe('Location Phoenix rules', () => {
      it('should have 6 Phoenix location rules', () => {
        expect(VALIDATION_RULES.locationPhoenix).toHaveLength(6);
      });

      it('should have correct apiPath for phoenix_total', () => {
        const rule = VALIDATION_RULES.locationPhoenix.find(r => r.id === 'phoenix_total');
        expect(rule.apiPath).toBe('locationDetails.phoenix.total');
      });

      it('should have correct apiPath for phoenix_faculty', () => {
        const rule = VALIDATION_RULES.locationPhoenix.find(r => r.id === 'phoenix_faculty');
        expect(rule.apiPath).toBe('locationDetails.phoenix.faculty');
      });

      it('should have correct apiPath for phoenix_staff', () => {
        const rule = VALIDATION_RULES.locationPhoenix.find(r => r.id === 'phoenix_staff');
        expect(rule.apiPath).toBe('locationDetails.phoenix.staff');
      });

      it('should have correct apiPath for phoenix_hsp', () => {
        const rule = VALIDATION_RULES.locationPhoenix.find(r => r.id === 'phoenix_hsp');
        expect(rule.apiPath).toBe('locationDetails.phoenix.hsp');
      });

      it('should have correct apiPath for phoenix_students', () => {
        const rule = VALIDATION_RULES.locationPhoenix.find(r => r.id === 'phoenix_students');
        expect(rule.apiPath).toBe('locationDetails.phoenix.students');
      });

      it('should have correct apiPath for phoenix_temp', () => {
        const rule = VALIDATION_RULES.locationPhoenix.find(r => r.id === 'phoenix_temp');
        expect(rule.apiPath).toBe('locationDetails.phoenix.temp');
      });

      it('should have all Phoenix apiPaths pointing to locationDetails', () => {
        VALIDATION_RULES.locationPhoenix.forEach(rule => {
          expect(rule.apiPath).toMatch(/^locationDetails\.phoenix\./);
        });
      });
    });

    describe('Summary Cards rules', () => {
      it('should have 6 summary card rules', () => {
        expect(VALIDATION_RULES.summaryCards).toHaveLength(6);
      });

      it('should have direct apiPaths for summary cards', () => {
        const expectedPaths = ['staff', 'faculty', 'hsp', 'students', 'temp', 'totalEmployees'];
        const actualPaths = VALIDATION_RULES.summaryCards.map(r => r.apiPath);
        expectedPaths.forEach(path => {
          expect(actualPaths).toContain(path);
        });
      });
    });
  });

  describe('getValueByPath', () => {
    const testObj = {
      simple: 'value1',
      nested: {
        level1: {
          level2: 'deep value'
        }
      },
      locations: {
        'Omaha Campus': 4287,
        'Phoenix Campus': 750
      },
      locationDetails: {
        omaha: {
          faculty: 649,
          staff: 1344,
          hsp: 268,
          students: 1604,
          temp: 422,
          total: 4287
        },
        phoenix: {
          faculty: 40,
          staff: 104,
          hsp: 344,
          students: 110,
          temp: 152,
          total: 750
        }
      }
    };

    it('should return value for simple path', () => {
      expect(getValueByPath(testObj, 'simple')).toBe('value1');
    });

    it('should return value for nested path', () => {
      expect(getValueByPath(testObj, 'nested.level1.level2')).toBe('deep value');
    });

    it('should handle bracket notation with special characters', () => {
      expect(getValueByPath(testObj, 'locations["Omaha Campus"]')).toBe(4287);
      expect(getValueByPath(testObj, 'locations["Phoenix Campus"]')).toBe(750);
    });

    it('should return undefined for missing path', () => {
      expect(getValueByPath(testObj, 'nonexistent')).toBeUndefined();
      expect(getValueByPath(testObj, 'nested.nonexistent')).toBeUndefined();
    });

    it('should return undefined for null/undefined object', () => {
      expect(getValueByPath(null, 'path')).toBeUndefined();
      expect(getValueByPath(undefined, 'path')).toBeUndefined();
    });

    it('should return undefined for empty path', () => {
      expect(getValueByPath(testObj, '')).toBeUndefined();
      expect(getValueByPath(testObj, null)).toBeUndefined();
    });

    it('should extract locationDetails values correctly', () => {
      expect(getValueByPath(testObj, 'locationDetails.omaha.faculty')).toBe(649);
      expect(getValueByPath(testObj, 'locationDetails.omaha.total')).toBe(4287);
      expect(getValueByPath(testObj, 'locationDetails.phoenix.hsp')).toBe(344);
      expect(getValueByPath(testObj, 'locationDetails.phoenix.temp')).toBe(152);
    });
  });

  describe('compareValues', () => {
    it('should return true for equal numbers', () => {
      expect(compareValues(100, 100)).toBe(true);
    });

    it('should return true for equal strings', () => {
      expect(compareValues('test', 'test')).toBe(true);
    });

    it('should return false for different values', () => {
      expect(compareValues(100, 200)).toBe(false);
      expect(compareValues('a', 'b')).toBe(false);
    });

    it('should handle floating point comparison with tolerance', () => {
      expect(compareValues(100.001, 100.002)).toBe(true);
      expect(compareValues(100, 100.005)).toBe(true);
      expect(compareValues(100, 100.02)).toBe(false);
    });
  });

  describe('formatValue', () => {
    it('should format numbers with locale string', () => {
      expect(formatValue(1000)).toBe('1,000');
      expect(formatValue(4287)).toBe('4,287');
    });

    it('should return "--" for null/undefined', () => {
      expect(formatValue(null)).toBe('--');
      expect(formatValue(undefined)).toBe('--');
    });

    it('should convert non-numbers to string', () => {
      expect(formatValue('test')).toBe('test');
    });
  });

  describe('validateCategory', () => {
    const mockRules = [
      { id: 'test1', label: 'Test 1', jsonPath: 'value1', apiPath: 'value1', expected: 100 },
      { id: 'test2', label: 'Test 2', jsonPath: 'nested.value', apiPath: 'nested.value', expected: 200 },
      { id: 'test3', label: 'Test 3 (JSON-only)', jsonPath: 'jsonOnly', apiPath: null, expected: 300 }
    ];

    const mockJsonData = {
      value1: 100,
      nested: { value: 200 },
      jsonOnly: 300
    };

    const mockApiData = {
      value1: 100,
      nested: { value: 200 }
    };

    it('should return passed status when values match', () => {
      const results = validateCategory(mockRules.slice(0, 2), mockJsonData, mockApiData);

      expect(results[0].status).toBe('passed');
      expect(results[0].match).toBe(true);
      expect(results[1].status).toBe('passed');
    });

    it('should return json_only status for rules without apiPath', () => {
      const results = validateCategory([mockRules[2]], mockJsonData, mockApiData);

      expect(results[0].status).toBe('json_only');
      expect(results[0].isJsonOnly).toBe(true);
    });

    it('should return api_unavailable when apiData is null', () => {
      const results = validateCategory(mockRules.slice(0, 2), mockJsonData, null);

      expect(results[0].status).toBe('api_unavailable');
      expect(results[1].status).toBe('api_unavailable');
    });

    it('should return failed status when values do not match', () => {
      const mismatchedApiData = { value1: 999, nested: { value: 200 } };
      const results = validateCategory(mockRules.slice(0, 2), mockJsonData, mismatchedApiData);

      expect(results[0].status).toBe('failed');
      expect(results[0].match).toBe(false);
    });
  });

  describe('getValidationRulesCounts', () => {
    it('should return correct counts for all categories', () => {
      const counts = getValidationRulesCounts();

      expect(counts.summaryCards).toBe(6);
      expect(counts.locationOmaha).toBe(6);
      expect(counts.locationPhoenix).toBe(6);
      expect(counts.total).toBeGreaterThan(18);
    });
  });

  describe('API Response Structure Validation', () => {
    const mockApiResponse = {
      reportingDate: '6/30/25',
      quarterLabel: 'FY25_Q4',
      fiscalYear: 2025,
      fiscalQuarter: 4,
      totalEmployees: 5037,
      faculty: 689,
      staff: 1448,
      hsp: 612,
      students: 1714,
      temp: 574,
      locations: {
        'Omaha Campus': 4287,
        'Phoenix Campus': 750
      },
      locationDetails: {
        omaha: {
          faculty: 649,
          staff: 1344,
          hsp: 268,
          students: 1604,
          temp: 422,
          total: 4287
        },
        phoenix: {
          faculty: 40,
          staff: 104,
          hsp: 344,
          students: 110,
          temp: 152,
          total: 750
        }
      }
    };

    it('should extract all location Omaha values from API response', () => {
      VALIDATION_RULES.locationOmaha.forEach(rule => {
        const value = getValueByPath(mockApiResponse, rule.apiPath);
        expect(value).toBeDefined();
        expect(typeof value).toBe('number');
      });
    });

    it('should extract all location Phoenix values from API response', () => {
      VALIDATION_RULES.locationPhoenix.forEach(rule => {
        const value = getValueByPath(mockApiResponse, rule.apiPath);
        expect(value).toBeDefined();
        expect(typeof value).toBe('number');
      });
    });

    it('should match expected FY25 Q4 values for Omaha', () => {
      expect(getValueByPath(mockApiResponse, 'locationDetails.omaha.total')).toBe(4287);
      expect(getValueByPath(mockApiResponse, 'locationDetails.omaha.faculty')).toBe(649);
      expect(getValueByPath(mockApiResponse, 'locationDetails.omaha.staff')).toBe(1344);
      expect(getValueByPath(mockApiResponse, 'locationDetails.omaha.hsp')).toBe(268);
      expect(getValueByPath(mockApiResponse, 'locationDetails.omaha.students')).toBe(1604);
      expect(getValueByPath(mockApiResponse, 'locationDetails.omaha.temp')).toBe(422);
    });

    it('should match expected FY25 Q4 values for Phoenix', () => {
      expect(getValueByPath(mockApiResponse, 'locationDetails.phoenix.total')).toBe(750);
      expect(getValueByPath(mockApiResponse, 'locationDetails.phoenix.faculty')).toBe(40);
      expect(getValueByPath(mockApiResponse, 'locationDetails.phoenix.staff')).toBe(104);
      expect(getValueByPath(mockApiResponse, 'locationDetails.phoenix.hsp')).toBe(344);
      expect(getValueByPath(mockApiResponse, 'locationDetails.phoenix.students')).toBe(110);
      expect(getValueByPath(mockApiResponse, 'locationDetails.phoenix.temp')).toBe(152);
    });

    it('should verify Omaha category sum equals total', () => {
      const omaha = mockApiResponse.locationDetails.omaha;
      const categorySum = omaha.faculty + omaha.staff + omaha.hsp + omaha.students + omaha.temp;
      expect(categorySum).toBe(omaha.total);
    });

    it('should verify Phoenix category sum equals total', () => {
      const phoenix = mockApiResponse.locationDetails.phoenix;
      const categorySum = phoenix.faculty + phoenix.staff + phoenix.hsp + phoenix.students + phoenix.temp;
      expect(categorySum).toBe(phoenix.total);
    });
  });
});
