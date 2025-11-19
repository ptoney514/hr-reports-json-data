/**
 * Exit Survey FY26 Q1 Data Validation Tests
 *
 * Verifies that the Q1 FY26 exit survey data in staticData.js
 * has correct structure, valid ranges, and internally consistent calculations.
 *
 * Run with: npm test -- src/data/__tests__/exitSurveyFY26Q1.test.js
 */

const { getExitSurveyData } = require('../staticData');

describe('FY26 Q1 Exit Survey Data Validation', () => {
  let surveyData;

  beforeAll(() => {
    surveyData = getExitSurveyData("2025-09-30");
  });

  describe('Basic Data Structure', () => {
    test('should have Q1 FY26 data entry', () => {
      expect(surveyData).toBeDefined();
      expect(surveyData).not.toBeNull();
    });

    test('should have correct reporting date', () => {
      expect(surveyData.reportingDate).toBe("9/30/25");
    });

    test('should have correct quarter label', () => {
      expect(surveyData.quarter).toBe("Q1 FY26");
    });

    test('should have correct total responses', () => {
      expect(surveyData.totalResponses).toBe(15);
    });
  });

  describe('Response Metrics', () => {
    test('should have calculated response rate from termination data', () => {
      expect(surveyData.responseRate).toBe(20.5);
    });

    test('should have total exits from termination data', () => {
      expect(surveyData.totalExits).toBe(73);
    });

    test('should have would recommend percentage', () => {
      expect(surveyData.wouldRecommend).toBe(80);
    });

    test('should have would recommend count object', () => {
      expect(surveyData.wouldRecommendCount).toEqual({
        positive: 12,
        total: 15
      });
    });

    test('would recommend percentage should match count calculation', () => {
      const expectedPercentage = Math.round((12 / 15) * 1000) / 10;
      expect(surveyData.wouldRecommend).toBe(expectedPercentage);
    });
  });

  describe('Satisfaction Ratings', () => {
    test('should have overall satisfaction score', () => {
      expect(surveyData.overallSatisfaction).toBe(3.3);
    });

    test('overall satisfaction should be in valid range', () => {
      expect(surveyData.overallSatisfaction).toBeGreaterThanOrEqual(1);
      expect(surveyData.overallSatisfaction).toBeLessThanOrEqual(5);
    });

    test('should have satisfaction ratings object', () => {
      expect(surveyData.satisfactionRatings).toBeDefined();
      expect(surveyData.satisfactionRatings).toHaveProperty('jobSatisfaction');
      expect(surveyData.satisfactionRatings).toHaveProperty('managementSupport');
      expect(surveyData.satisfactionRatings).toHaveProperty('careerDevelopment');
      expect(surveyData.satisfactionRatings).toHaveProperty('workLifeBalance');
      expect(surveyData.satisfactionRatings).toHaveProperty('compensation');
      expect(surveyData.satisfactionRatings).toHaveProperty('benefits');
    });

    test('all satisfaction ratings should be in valid range', () => {
      Object.values(surveyData.satisfactionRatings).forEach(rating => {
        expect(rating).toBeGreaterThanOrEqual(1);
        expect(rating).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('Concerns Reported', () => {
    test('should have concerns reported object', () => {
      expect(surveyData.concernsReported).toBeDefined();
      expect(surveyData.concernsReported).toHaveProperty('percentage');
      expect(surveyData.concernsReported).toHaveProperty('count');
      expect(surveyData.concernsReported).toHaveProperty('total');
      expect(surveyData.concernsReported).toHaveProperty('description');
    });

    test('concerns percentage should be 20%', () => {
      expect(surveyData.concernsReported.percentage).toBe(20);
    });

    test('concerns count should be 3 of 15', () => {
      expect(surveyData.concernsReported.count).toBe(3);
      expect(surveyData.concernsReported.total).toBe(15);
    });

    test('concerns percentage should match count calculation', () => {
      const expectedPercentage = Math.round((3 / 15) * 1000) / 10;
      expect(surveyData.concernsReported.percentage).toBe(expectedPercentage);
    });
  });

  describe('Departure Reasons', () => {
    test('should have departure reasons array', () => {
      expect(Array.isArray(surveyData.departureReasons)).toBe(true);
      expect(surveyData.departureReasons.length).toBeGreaterThan(0);
    });

    test('all departure reasons should have required properties', () => {
      surveyData.departureReasons.forEach(reason => {
        expect(reason).toHaveProperty('reason');
        expect(reason).toHaveProperty('count');
        expect(reason).toHaveProperty('percentage');
      });
    });

    test('departure reason counts should sum to total responses', () => {
      const totalCount = surveyData.departureReasons.reduce((sum, r) => sum + r.count, 0);
      expect(totalCount).toBe(15);
    });

    test('departure reason percentages should sum to approximately 100%', () => {
      const totalPercentage = surveyData.departureReasons.reduce((sum, r) => sum + r.percentage, 0);
      expect(totalPercentage).toBeGreaterThan(99);
      expect(totalPercentage).toBeLessThanOrEqual(101); // Allow for rounding and floating point precision
    });

    test('top reason should be "Other" at 20%', () => {
      expect(surveyData.departureReasons[0].reason).toBe("Other");
      expect(surveyData.departureReasons[0].percentage).toBe(20);
      expect(surveyData.departureReasons[0].count).toBe(3);
    });
  });

  describe('Department Analysis', () => {
    test('should have department exits array', () => {
      expect(Array.isArray(surveyData.departmentExits)).toBe(true);
      expect(surveyData.departmentExits.length).toBe(8);
    });

    test('all departments should have required properties', () => {
      surveyData.departmentExits.forEach(dept => {
        expect(dept).toHaveProperty('department');
        expect(dept).toHaveProperty('exits');
        expect(dept).toHaveProperty('responses');
        expect(dept).toHaveProperty('responseRate');
      });
    });

    test('department response counts should sum to total responses', () => {
      const totalResponses = surveyData.departmentExits.reduce((sum, d) => sum + d.responses, 0);
      expect(totalResponses).toBe(15);
    });

    test('departments should have variable response rates based on actual termination data', () => {
      // Updated with actual Q1 FY26 termination counts
      expect(surveyData.departmentExits.length).toBeGreaterThan(0);
      // Response rates should vary (0%, 25%, 30%, 60%, 100%)
      const rates = surveyData.departmentExits.map(d => d.responseRate);
      expect(rates).toContain("30%"); // School of Medicine
      expect(rates).toContain("60%"); // Dentistry, Student Life
    });

    test('top departments by termination volume should include Pharmacy, Medicine, Student Life', () => {
      const topDepts = surveyData.departmentExits.slice(0, 3).map(d => d.department);
      // Pharmacy has most terminations (19), even with 0% response rate
      expect(topDepts).toContain("Pharmacy & Health Professions");
      expect(topDepts).toContain("School of Medicine");
      expect(topDepts).toContain("Student Life");
    });
  });

  describe('Key Insights', () => {
    test('should have key insights object', () => {
      expect(surveyData.keyInsights).toBeDefined();
      expect(surveyData.keyInsights).toHaveProperty('areasOfConcern');
      expect(surveyData.keyInsights).toHaveProperty('positiveFeedback');
      expect(surveyData.keyInsights).toHaveProperty('actionItems');
    });

    test('should have at least 3 areas of concern', () => {
      expect(surveyData.keyInsights.areasOfConcern.length).toBeGreaterThanOrEqual(3);
    });

    test('should have at least 3 positive feedback items', () => {
      expect(surveyData.keyInsights.positiveFeedback.length).toBeGreaterThanOrEqual(3);
    });

    test('should have at least 3 action items', () => {
      expect(surveyData.keyInsights.actionItems.length).toBeGreaterThanOrEqual(3);
    });
  });


  describe('Data Quality Checks', () => {
    test('no percentage should exceed 100%', () => {
      expect(surveyData.wouldRecommend).toBeLessThanOrEqual(100);
      expect(surveyData.concernsReported.percentage).toBeLessThanOrEqual(100);
      surveyData.departureReasons.forEach(reason => {
        expect(reason.percentage).toBeLessThanOrEqual(100);
      });
    });

    test('no percentage should be negative', () => {
      expect(surveyData.wouldRecommend).toBeGreaterThanOrEqual(0);
      expect(surveyData.concernsReported.percentage).toBeGreaterThanOrEqual(0);
      surveyData.departureReasons.forEach(reason => {
        expect(reason.percentage).toBeGreaterThanOrEqual(0);
      });
    });

    test('all counts should be positive integers', () => {
      expect(Number.isInteger(surveyData.totalResponses)).toBe(true);
      expect(surveyData.totalResponses).toBeGreaterThan(0);
      expect(Number.isInteger(surveyData.wouldRecommendCount.positive)).toBe(true);
      expect(Number.isInteger(surveyData.concernsReported.count)).toBe(true);
    });
  });
});
