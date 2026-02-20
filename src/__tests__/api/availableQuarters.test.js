/**
 * Available Quarters API Tests
 *
 * Tests for the /api/available-quarters endpoint response shape,
 * date validation, and ordering.
 */

import { mockAvailableQuarters } from '../../__fixtures__/testData';

// Store original fetch
const originalFetch = global.fetch;

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Import after setting up fetch mock
import * as apiService from '../../services/apiService';

describe('Available Quarters API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('Response Shape', () => {
    it('each quarter has value, label, period, fiscalYear, hasData', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAvailableQuarters),
      });

      const result = await apiService.getAvailableQuarters();

      result.forEach((quarter) => {
        expect(quarter).toHaveProperty('value');
        expect(quarter).toHaveProperty('label');
        expect(quarter).toHaveProperty('period');
        expect(quarter).toHaveProperty('fiscalYear');
        expect(quarter).toHaveProperty('hasData');
      });
    });

    it('value is in YYYY-MM-DD format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAvailableQuarters),
      });

      const result = await apiService.getAvailableQuarters();

      result.forEach((quarter) => {
        expect(quarter.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('label follows Q# FY## pattern', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAvailableQuarters),
      });

      const result = await apiService.getAvailableQuarters();

      result.forEach((quarter) => {
        expect(quarter.label).toMatch(/^Q[1-4] FY\d{2}$/);
      });
    });

    it('period contains month range', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAvailableQuarters),
      });

      const result = await apiService.getAvailableQuarters();

      result.forEach((quarter) => {
        // Period should contain " - " separator with month names
        expect(quarter.period).toMatch(/\w+ - \w+ \d{4}/);
      });
    });

    it('hasData is a boolean', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAvailableQuarters),
      });

      const result = await apiService.getAvailableQuarters();

      result.forEach((quarter) => {
        expect(typeof quarter.hasData).toBe('boolean');
      });
    });
  });

  describe('Quarter-end Date Validation', () => {
    it('value dates end on valid quarter-end dates (9/30, 12/31, 3/31, or 6/30)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAvailableQuarters),
      });

      const result = await apiService.getAvailableQuarters();
      const validEndings = ['09-30', '12-31', '03-31', '06-30'];

      result.forEach((quarter) => {
        const monthDay = quarter.value.slice(5); // "MM-DD"
        expect(validEndings).toContain(monthDay);
      });
    });
  });

  describe('Ordering', () => {
    it('quarters sorted newest first (descending by value)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAvailableQuarters),
      });

      const result = await apiService.getAvailableQuarters();

      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].value >= result[i].value).toBe(true);
      }
    });
  });
});
