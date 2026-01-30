/**
 * API Service Tests
 *
 * Tests for src/services/apiService.js - REST API wrapper for Neon Postgres.
 */

import {
  mockWorkforceData,
  mockTurnoverData,
  mockExitSurveyData,
  mockHealthResponse,
  mockTop15SchoolOrgData,
  mockAnnualTurnoverRates,
  mockMobilityData
} from '../../__fixtures__/testData';

// Store original fetch
const originalFetch = global.fetch;

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Import after setting up fetch mock
import * as apiService from '../apiService';

describe('apiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('fetchFromAPI helper', () => {
    it('constructs correct URL with API_BASE_URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWorkforceData)
      });

      await apiService.getWorkforceData('2025-06-30');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/workforce/2025-06-30',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('sets Content-Type header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });

      await apiService.checkAPIHealth();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
    });

    it('throws on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' })
      });

      await expect(apiService.getWorkforceData('2024-01-01'))
        .rejects.toThrow('Not found');
    });

    it('throws with fallback error when JSON parsing fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await expect(apiService.getWorkforceData('2024-01-01'))
        .rejects.toThrow('Unknown error');
    });

    it('returns JSON on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWorkforceData)
      });

      const result = await apiService.getWorkforceData('2025-06-30');
      expect(result).toEqual(mockWorkforceData);
    });
  });

  describe('getWorkforceData', () => {
    it('calls /workforce/{date} endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWorkforceData)
      });

      await apiService.getWorkforceData('2025-06-30');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/workforce/2025-06-30',
        expect.any(Object)
      );
    });

    it('returns workforce data structure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWorkforceData)
      });

      const result = await apiService.getWorkforceData('2025-06-30');

      expect(result).toHaveProperty('totalEmployees');
      expect(result).toHaveProperty('faculty');
      expect(result).toHaveProperty('staff');
      expect(result).toHaveProperty('locations');
    });
  });

  describe('getTurnoverData', () => {
    it('calls /turnover/{date} endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTurnoverData)
      });

      await apiService.getTurnoverData('2025-06-30');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/turnover/2025-06-30',
        expect.any(Object)
      );
    });

    it('returns turnover data structure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTurnoverData)
      });

      const result = await apiService.getTurnoverData('2025-06-30');

      expect(result).toHaveProperty('totalTerminations');
      expect(result).toHaveProperty('voluntaryCount');
      expect(result).toHaveProperty('involuntaryCount');
    });
  });

  describe('getExitSurveyData', () => {
    it('calls /exit-surveys/{date} endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExitSurveyData)
      });

      await apiService.getExitSurveyData('2025-06-30');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/exit-surveys/2025-06-30',
        expect.any(Object)
      );
    });

    it('returns exit survey data structure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExitSurveyData)
      });

      const result = await apiService.getExitSurveyData('2025-06-30');

      expect(result).toHaveProperty('totalResponses');
      expect(result).toHaveProperty('responseRate');
      expect(result).toHaveProperty('scores');
    });
  });

  describe('getSchoolOrgData', () => {
    it('calls /schools/{date} with limit parameter', async () => {
      const mockResponse = { periodDate: '2025-06-30', limit: 15, schools: mockTop15SchoolOrgData };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await apiService.getSchoolOrgData('2025-06-30', 15);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/schools/2025-06-30?limit=15',
        expect.any(Object)
      );
    });

    it('defaults to limit 15', async () => {
      const mockResponse = { periodDate: '2025-06-30', limit: 15, schools: mockTop15SchoolOrgData };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await apiService.getSchoolOrgData('2025-06-30');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/schools/2025-06-30?limit=15',
        expect.any(Object)
      );
    });
  });

  describe('getTop15SchoolOrgData', () => {
    it('calls getSchoolOrgData and returns schools array', async () => {
      const mockResponse = { periodDate: '2025-06-30', limit: 15, schools: mockTop15SchoolOrgData };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await apiService.getTop15SchoolOrgData('2025-06-30');

      expect(result).toEqual(mockTop15SchoolOrgData);
    });
  });

  describe('getAnnualTurnoverRates', () => {
    it('calls /turnover-rates endpoint without year', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockAnnualTurnoverRates])
      });

      await apiService.getAnnualTurnoverRates();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/turnover-rates',
        expect.any(Object)
      );
    });

    it('calls /turnover-rates endpoint with year filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockAnnualTurnoverRates])
      });

      await apiService.getAnnualTurnoverRates(2025);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/turnover-rates?year=2025',
        expect.any(Object)
      );
    });
  });

  describe('getMobilityData', () => {
    it('calls /mobility/{date} endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMobilityData)
      });

      await apiService.getMobilityData('2025-06-30');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/mobility/2025-06-30',
        expect.any(Object)
      );
    });
  });

  describe('Health Check Functions', () => {
    describe('checkAPIHealth', () => {
      it('calls /health endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHealthResponse)
        });

        await apiService.checkAPIHealth();

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/health',
          expect.any(Object)
        );
      });

      it('returns health response structure', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHealthResponse)
        });

        const result = await apiService.checkAPIHealth();

        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('database');
        expect(result).toHaveProperty('data');
      });
    });

    describe('isAPIAvailable', () => {
      it('returns true on healthy response', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHealthResponse)
        });

        const result = await apiService.isAPIAvailable();

        expect(result).toBe(true);
      });

      it('returns false on unhealthy response', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            status: 'unhealthy',
            database: { connected: false }
          })
        });

        const result = await apiService.isAPIAvailable();

        expect(result).toBe(false);
      });

      it('returns false on error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        const result = await apiService.isAPIAvailable();

        expect(result).toBe(false);
      });

      it('returns false when database is not connected', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            status: 'healthy',
            database: { connected: false }
          })
        });

        const result = await apiService.isAPIAvailable();

        expect(result).toBe(false);
      });
    });

    describe('getAvailablePeriods', () => {
      it('returns data availability flags based on health check', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHealthResponse)
        });

        const result = await apiService.getAvailablePeriods();

        expect(result).toHaveProperty('hasWorkforceData');
        expect(result).toHaveProperty('hasTurnoverData');
        expect(result).toHaveProperty('hasExitSurveyData');
        expect(result).toHaveProperty('hasMobilityData');
        expect(result.hasWorkforceData).toBe(true);
        expect(result.hasTurnoverData).toBe(true);
      });
    });
  });

  describe('normalizeDate', () => {
    it('accepts YYYY-MM-DD format as-is', () => {
      const result = apiService.normalizeDate('2025-06-30');
      expect(result).toBe('2025-06-30');
    });

    it('converts other date formats to YYYY-MM-DD', () => {
      const result = apiService.normalizeDate('June 30, 2025');
      expect(result).toBe('2025-06-30');
    });

    it('converts MM/DD/YYYY format', () => {
      const result = apiService.normalizeDate('06/30/2025');
      expect(result).toBe('2025-06-30');
    });

    it('throws on invalid dates', () => {
      expect(() => apiService.normalizeDate('not-a-date')).toThrow('Invalid date');
    });

    it('throws on empty string', () => {
      expect(() => apiService.normalizeDate('')).toThrow('Invalid date');
    });
  });

  describe('useAPIDataSource flag', () => {
    it('is exported as a boolean', () => {
      expect(typeof apiService.useAPIDataSource).toBe('boolean');
    });

    it('defaults to false (json mode)', () => {
      // By default, DATA_SOURCE is 'json', not 'api'
      expect(apiService.useAPIDataSource).toBe(false);
    });
  });

  describe('default export', () => {
    it('contains all endpoint functions', () => {
      const defaultExport = require('../apiService').default;

      expect(defaultExport.getWorkforceData).toBeDefined();
      expect(defaultExport.getTurnoverData).toBeDefined();
      expect(defaultExport.getAnnualTurnoverRates).toBeDefined();
      expect(defaultExport.getExitSurveyData).toBeDefined();
      expect(defaultExport.getSchoolOrgData).toBeDefined();
      expect(defaultExport.getTop15SchoolOrgData).toBeDefined();
      expect(defaultExport.getMobilityData).toBeDefined();
    });

    it('contains health check functions', () => {
      const defaultExport = require('../apiService').default;

      expect(defaultExport.checkAPIHealth).toBeDefined();
      expect(defaultExport.getAvailablePeriods).toBeDefined();
      expect(defaultExport.isAPIAvailable).toBeDefined();
    });

    it('contains utility functions', () => {
      const defaultExport = require('../apiService').default;

      expect(defaultExport.normalizeDate).toBeDefined();
      expect(defaultExport.useAPIDataSource).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('logs error to console on API failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      await expect(apiService.getWorkforceData('2025-06-30'))
        .rejects.toThrow('Network failure');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('API Error'),
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });

    it('handles malformed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Unexpected token'))
      });

      await expect(apiService.getWorkforceData('2025-06-30'))
        .rejects.toThrow();
    });
  });
});
