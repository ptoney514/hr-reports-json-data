/**
 * Neon Data Source Integration Tests
 *
 * Tests the actual Neon Postgres API endpoints return correct data structures.
 * These tests are SKIPPED unless RUN_NEON_TESTS=true is set explicitly.
 * CRA loads .env files automatically (which may contain DATABASE_URL),
 * so we use a separate flag to avoid false positives in jsdom.
 *
 * To run: RUN_NEON_TESTS=true npm test -- --testPathPattern=neonDataSource
 */

const NEON_AVAILABLE = process.env.RUN_NEON_TESTS === 'true';
const describeIfNeon = NEON_AVAILABLE ? describe : describe.skip;

// Store original fetch so we can restore it
const originalFetch = global.fetch;

// Only import apiService; it uses fetch internally
let apiService;
beforeAll(() => {
  apiService = require('../../services/apiService');
});

afterAll(() => {
  global.fetch = originalFetch;
});

describeIfNeon('Neon Data Source Integration', () => {
  const TEST_DATE = '2025-06-30';

  describe('Workforce endpoint', () => {
    it('returns valid structure with expected fields', async () => {
      const data = await apiService.getWorkforceData(TEST_DATE);

      expect(data).toBeDefined();
      expect(data).toHaveProperty('totalEmployees');
      expect(data).toHaveProperty('faculty');
      expect(data).toHaveProperty('staff');
      expect(data).toHaveProperty('hsp');
      expect(data).toHaveProperty('locations');
      expect(data).toHaveProperty('locationDetails');
      expect(data.locationDetails).toHaveProperty('omaha');
      expect(data.locationDetails).toHaveProperty('phoenix');
    });

    it('numeric fields are numbers', async () => {
      const data = await apiService.getWorkforceData(TEST_DATE);

      expect(typeof data.totalEmployees).toBe('number');
      expect(typeof data.faculty).toBe('number');
      expect(typeof data.staff).toBe('number');
      expect(typeof data.hsp).toBe('number');
    });

    it('location totals (omaha + phoenix) sum correctly', async () => {
      const data = await apiService.getWorkforceData(TEST_DATE);

      const omaha = data.locations['Omaha Campus'];
      const phoenix = data.locations['Phoenix Campus'];

      expect(typeof omaha).toBe('number');
      expect(typeof phoenix).toBe('number');
      expect(omaha + phoenix).toBeGreaterThan(0);
      // Location totals should approximate totalEmployees (may differ due to categorization)
      expect(omaha + phoenix).toBeLessThanOrEqual(data.totalEmployees * 1.1);
    });
  });

  describe('Turnover endpoint', () => {
    it('returns valid structure', async () => {
      const data = await apiService.getTurnoverData(TEST_DATE);

      expect(data).toBeDefined();
      expect(data).toHaveProperty('totalTerminations');
      expect(data).toHaveProperty('voluntaryCount');
      expect(data).toHaveProperty('involuntaryCount');
      expect(data).toHaveProperty('retirementCount');
      expect(data).toHaveProperty('locations');
      expect(data).toHaveProperty('tenure');
    });

    it('voluntary + involuntary + retirement sums approximate total', async () => {
      const data = await apiService.getTurnoverData(TEST_DATE);

      const sum = data.voluntaryCount + data.involuntaryCount + data.retirementCount;

      expect(typeof data.totalTerminations).toBe('number');
      expect(typeof sum).toBe('number');
      // Sum should be close to total (may differ slightly due to rounding/categorization)
      expect(Math.abs(sum - data.totalTerminations)).toBeLessThanOrEqual(
        data.totalTerminations * 0.05
      );
    });
  });

  describe('Exit Surveys endpoint', () => {
    it('returns valid structure', async () => {
      const data = await apiService.getExitSurveyData(TEST_DATE);

      expect(data).toBeDefined();
      expect(data).toHaveProperty('totalResponses');
      expect(data).toHaveProperty('responseRate');
      expect(data).toHaveProperty('scores');
      expect(data).toHaveProperty('wouldRecommend');
    });

    it('response rate is between 0 and 100', async () => {
      const data = await apiService.getExitSurveyData(TEST_DATE);

      expect(typeof data.responseRate).toBe('number');
      expect(data.responseRate).toBeGreaterThanOrEqual(0);
      expect(data.responseRate).toBeLessThanOrEqual(100);
    });
  });

  describe('Health endpoint', () => {
    it('returns healthy status', async () => {
      const data = await apiService.checkAPIHealth();

      expect(data).toBeDefined();
      expect(data.status).toBe('healthy');
      expect(data.database).toBeDefined();
      expect(data.database.connected).toBe(true);
    });

    it('table counts are greater than 0', async () => {
      const data = await apiService.checkAPIHealth();

      expect(data.data).toBeDefined();
      expect(data.data.factTables).toBeDefined();

      const { workforceSnapshots, terminations, exitSurveys } = data.data.factTables;
      expect(workforceSnapshots).toBeGreaterThan(0);
      expect(terminations).toBeGreaterThan(0);
      expect(exitSurveys).toBeGreaterThan(0);
    });
  });

  describe('Available Quarters endpoint', () => {
    it('returns quarters sorted newest-first', async () => {
      const data = await apiService.getAvailableQuarters();

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      for (let i = 1; i < data.length; i++) {
        expect(data[i - 1].value >= data[i].value).toBe(true);
      }
    });

    it('quarter values are valid quarter-end dates', async () => {
      const data = await apiService.getAvailableQuarters();
      const validEndings = ['09-30', '12-31', '03-31', '06-30'];

      data.forEach((quarter) => {
        expect(quarter.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        const monthDay = quarter.value.slice(5);
        expect(validEndings).toContain(monthDay);
      });
    });

    it('hasData flags are boolean', async () => {
      const data = await apiService.getAvailableQuarters();

      data.forEach((quarter) => {
        expect(typeof quarter.hasData).toBe('boolean');
      });
    });
  });
});
