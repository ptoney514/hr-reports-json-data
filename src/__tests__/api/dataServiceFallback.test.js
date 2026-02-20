/**
 * Data Service Fallback Tests
 *
 * Tests the withFallback() pattern in dataService.js:
 * - JSON mode (default): Always returns static data, no API calls
 * - API mode with successful API: Returns API data
 * - API mode with API failure: Falls back to static JSON data
 *
 * Since dataService reads REACT_APP_DATA_SOURCE at module load time,
 * each test group uses jest.resetModules() and re-requires the module.
 */

describe('dataService fallback behavior', () => {
  const originalEnv = process.env.REACT_APP_DATA_SOURCE;

  // Mock data returned by staticData and apiService
  const mockStaticWorkforce = {
    totalEmployees: 5415,
    faculty: 670,
    staff: 1300,
    source: 'static'
  };

  const mockStaticTurnover = {
    totalTerminations: 222,
    voluntaryCount: 156,
    source: 'static'
  };

  const mockStaticExitSurvey = {
    totalResponses: 145,
    responseRate: 65.3,
    source: 'static'
  };

  const mockStaticQuarterlyTurnover = {
    totalTerminations: 58,
    voluntaryCount: 42,
    source: 'static'
  };

  const mockApiWorkforce = {
    totalEmployees: 5500,
    faculty: 680,
    staff: 1310,
    source: 'api'
  };

  const mockApiTurnover = {
    totalTerminations: 230,
    voluntaryCount: 160,
    source: 'api'
  };

  const mockApiExitSurvey = {
    totalResponses: 150,
    responseRate: 68.0,
    source: 'api'
  };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original env
    if (originalEnv === undefined) {
      delete process.env.REACT_APP_DATA_SOURCE;
    } else {
      process.env.REACT_APP_DATA_SOURCE = originalEnv;
    }
  });

  describe('JSON mode (default)', () => {
    let dataService;

    beforeEach(() => {
      delete process.env.REACT_APP_DATA_SOURCE;

      jest.doMock('../../data/staticData', () => ({
        getWorkforceData: jest.fn(() => mockStaticWorkforce),
        getTurnoverData: jest.fn(() => mockStaticTurnover),
        getExitSurveyData: jest.fn(() => mockStaticExitSurvey),
        getQuarterlyTurnoverData: jest.fn(() => mockStaticQuarterlyTurnover),
        getQuarterlyWorkforceData: jest.fn(() => mockStaticWorkforce),
        getQuarterlyTurnoverRatesByCategory: jest.fn(() => ({ rates: [], benchmarks: [] })),
        getAnnualTurnoverRatesByCategory: jest.fn(() => ({ annualRates: [], benchmarks: [] })),
        getTop15SchoolOrgData: jest.fn(() => []),
        getAllSchoolOrgData: jest.fn(() => []),
        getStartersLeaversData: jest.fn(() => ({})),
        getHeadcountTrendsData: jest.fn(() => ({})),
        getPhoenixHeadcountData: jest.fn(() => ({})),
        getOmahaHeadcountData: jest.fn(() => ({})),
        getTempTotal: jest.fn(() => 0),
        getBenefitEligibleBreakdown: jest.fn(() => ({})),
        getAvailableQuarters: jest.fn(() => []),
        getMostRecentQuarter: jest.fn(() => null),
        getPreviousQuarter: jest.fn(() => null),
        getFiscalPeriod: jest.fn(() => null),
        getRecruitingData: jest.fn(() => ({})),
        getTurnoverMetrics: jest.fn(() => ({})),
        // Constants
        WORKFORCE_DATA: {},
        TURNOVER_DATA: {},
        TURNOVER_METRICS: {},
        RECRUITING_DATA: {},
        EXIT_SURVEY_DATA: {},
        QUARTERLY_TURNOVER_TRENDS: [],
        QUARTERLY_HEADCOUNT_TRENDS: [],
        ANNUAL_TURNOVER_RATES_BY_CATEGORY: [],
        TURNOVER_BENCHMARKS: {},
        QUARTERLY_TURNOVER_RATES_BY_CATEGORY: [],
        QUARTERLY_TURNOVER_BENCHMARKS: {},
        QUARTERLY_TURNOVER_DATA: {},
        QUARTERLY_WORKFORCE_DATA: {},
        AVAILABLE_DATES: [],
        FISCAL_PERIODS: {},
      }));

      jest.doMock('../../services/apiService', () => ({
        getWorkforceData: jest.fn(),
        getTurnoverData: jest.fn(),
        getExitSurveyData: jest.fn(),
        getAnnualTurnoverRates: jest.fn(),
        getTop15SchoolOrgData: jest.fn(),
        getSchoolOrgData: jest.fn(),
        getMobilityData: jest.fn(),
        checkAPIHealth: jest.fn(),
        getAvailableQuarters: jest.fn(),
      }));

      dataService = require('../../services/dataService');
    });

    it('getWorkforceData returns static data', () => {
      const result = dataService.getWorkforceData('2025-06-30');
      expect(result).toEqual(mockStaticWorkforce);
    });

    it('getQuarterlyTurnoverData returns static data', () => {
      const result = dataService.getQuarterlyTurnoverData('2025-09-30');
      expect(result).toEqual(mockStaticQuarterlyTurnover);
    });

    it('getTurnoverData returns static data', () => {
      const result = dataService.getTurnoverData('2025-06-30');
      expect(result).toEqual(mockStaticTurnover);
    });

    it('getExitSurveyData returns static data', () => {
      const result = dataService.getExitSurveyData('2025-06-30');
      expect(result).toEqual(mockStaticExitSurvey);
    });

    it('no API calls are made in JSON mode', async () => {
      const apiService = require('../../services/apiService');

      // Call sync functions
      dataService.getWorkforceData('2025-06-30');
      dataService.getTurnoverData('2025-06-30');
      dataService.getExitSurveyData('2025-06-30');

      // Call async functions
      await dataService.getWorkforceDataAsync('2025-06-30');
      await dataService.getTurnoverDataAsync('2025-06-30');
      await dataService.getExitSurveyDataAsync('2025-06-30');

      // Verify no API calls were made
      expect(apiService.getWorkforceData).not.toHaveBeenCalled();
      expect(apiService.getTurnoverData).not.toHaveBeenCalled();
      expect(apiService.getExitSurveyData).not.toHaveBeenCalled();
    });

    it('async functions return static data in JSON mode', async () => {
      const result = await dataService.getWorkforceDataAsync('2025-06-30');
      expect(result).toEqual(mockStaticWorkforce);
    });
  });

  describe('API mode with successful API', () => {
    let dataService;
    let apiService;

    beforeEach(() => {
      process.env.REACT_APP_DATA_SOURCE = 'api';

      jest.doMock('../../data/staticData', () => ({
        getWorkforceData: jest.fn(() => mockStaticWorkforce),
        getTurnoverData: jest.fn(() => mockStaticTurnover),
        getExitSurveyData: jest.fn(() => mockStaticExitSurvey),
        getQuarterlyTurnoverData: jest.fn(() => mockStaticQuarterlyTurnover),
        getQuarterlyWorkforceData: jest.fn(() => mockStaticWorkforce),
        getQuarterlyTurnoverRatesByCategory: jest.fn(() => ({ rates: [], benchmarks: [] })),
        getAnnualTurnoverRatesByCategory: jest.fn(() => ({ annualRates: [], benchmarks: [] })),
        getTop15SchoolOrgData: jest.fn(() => []),
        getAllSchoolOrgData: jest.fn(() => []),
        getStartersLeaversData: jest.fn(() => ({})),
        getHeadcountTrendsData: jest.fn(() => ({})),
        getPhoenixHeadcountData: jest.fn(() => ({})),
        getOmahaHeadcountData: jest.fn(() => ({})),
        getTempTotal: jest.fn(() => 0),
        getBenefitEligibleBreakdown: jest.fn(() => ({})),
        getAvailableQuarters: jest.fn(() => []),
        getMostRecentQuarter: jest.fn(() => null),
        getPreviousQuarter: jest.fn(() => null),
        getFiscalPeriod: jest.fn(() => null),
        getRecruitingData: jest.fn(() => ({})),
        getTurnoverMetrics: jest.fn(() => ({})),
        WORKFORCE_DATA: {},
        TURNOVER_DATA: {},
        TURNOVER_METRICS: {},
        RECRUITING_DATA: {},
        EXIT_SURVEY_DATA: {},
        QUARTERLY_TURNOVER_TRENDS: [],
        QUARTERLY_HEADCOUNT_TRENDS: [],
        ANNUAL_TURNOVER_RATES_BY_CATEGORY: [],
        TURNOVER_BENCHMARKS: {},
        QUARTERLY_TURNOVER_RATES_BY_CATEGORY: [],
        QUARTERLY_TURNOVER_BENCHMARKS: {},
        QUARTERLY_TURNOVER_DATA: {},
        QUARTERLY_WORKFORCE_DATA: {},
        AVAILABLE_DATES: [],
        FISCAL_PERIODS: {},
      }));

      jest.doMock('../../services/apiService', () => ({
        getWorkforceData: jest.fn(() => Promise.resolve(mockApiWorkforce)),
        getTurnoverData: jest.fn(() => Promise.resolve(mockApiTurnover)),
        getExitSurveyData: jest.fn(() => Promise.resolve(mockApiExitSurvey)),
        getAnnualTurnoverRates: jest.fn(() => Promise.resolve([])),
        getTop15SchoolOrgData: jest.fn(() => Promise.resolve([])),
        getSchoolOrgData: jest.fn(() => Promise.resolve({ schools: [] })),
        getMobilityData: jest.fn(() => Promise.resolve({})),
        checkAPIHealth: jest.fn(() => Promise.resolve({ status: 'healthy' })),
        getAvailableQuarters: jest.fn(() => Promise.resolve([])),
      }));

      dataService = require('../../services/dataService');
      apiService = require('../../services/apiService');
    });

    it('getWorkforceDataAsync returns API data', async () => {
      const result = await dataService.getWorkforceDataAsync('2025-06-30');
      expect(result).toEqual(mockApiWorkforce);
      expect(apiService.getWorkforceData).toHaveBeenCalledWith('2025-06-30');
    });

    it('getTurnoverDataAsync returns API data', async () => {
      const result = await dataService.getTurnoverDataAsync('2025-06-30');
      expect(result).toEqual(mockApiTurnover);
      expect(apiService.getTurnoverData).toHaveBeenCalledWith('2025-06-30');
    });

    it('getExitSurveyDataAsync returns API data', async () => {
      const result = await dataService.getExitSurveyDataAsync('2025-06-30');
      expect(result).toEqual(mockApiExitSurvey);
      expect(apiService.getExitSurveyData).toHaveBeenCalledWith('2025-06-30');
    });

    it('sync getWorkforceData still returns static data even in API mode', () => {
      // Sync functions always return static data for backward compatibility
      const result = dataService.getWorkforceData('2025-06-30');
      expect(result).toEqual(mockStaticWorkforce);
    });
  });

  describe('API mode with API failure (fallback)', () => {
    let dataService;
    let apiService;

    beforeEach(() => {
      process.env.REACT_APP_DATA_SOURCE = 'api';

      jest.doMock('../../data/staticData', () => ({
        getWorkforceData: jest.fn(() => mockStaticWorkforce),
        getTurnoverData: jest.fn(() => mockStaticTurnover),
        getExitSurveyData: jest.fn(() => mockStaticExitSurvey),
        getQuarterlyTurnoverData: jest.fn(() => mockStaticQuarterlyTurnover),
        getQuarterlyWorkforceData: jest.fn(() => mockStaticWorkforce),
        getQuarterlyTurnoverRatesByCategory: jest.fn(() => ({ rates: [], benchmarks: [] })),
        getAnnualTurnoverRatesByCategory: jest.fn(() => ({ annualRates: [], benchmarks: [] })),
        getTop15SchoolOrgData: jest.fn(() => []),
        getAllSchoolOrgData: jest.fn(() => []),
        getStartersLeaversData: jest.fn(() => ({})),
        getHeadcountTrendsData: jest.fn(() => ({})),
        getPhoenixHeadcountData: jest.fn(() => ({})),
        getOmahaHeadcountData: jest.fn(() => ({})),
        getTempTotal: jest.fn(() => 0),
        getBenefitEligibleBreakdown: jest.fn(() => ({})),
        getAvailableQuarters: jest.fn(() => []),
        getMostRecentQuarter: jest.fn(() => null),
        getPreviousQuarter: jest.fn(() => null),
        getFiscalPeriod: jest.fn(() => null),
        getRecruitingData: jest.fn(() => ({})),
        getTurnoverMetrics: jest.fn(() => ({})),
        WORKFORCE_DATA: {},
        TURNOVER_DATA: {},
        TURNOVER_METRICS: {},
        RECRUITING_DATA: {},
        EXIT_SURVEY_DATA: {},
        QUARTERLY_TURNOVER_TRENDS: [],
        QUARTERLY_HEADCOUNT_TRENDS: [],
        ANNUAL_TURNOVER_RATES_BY_CATEGORY: [],
        TURNOVER_BENCHMARKS: {},
        QUARTERLY_TURNOVER_RATES_BY_CATEGORY: [],
        QUARTERLY_TURNOVER_BENCHMARKS: {},
        QUARTERLY_TURNOVER_DATA: {},
        QUARTERLY_WORKFORCE_DATA: {},
        AVAILABLE_DATES: [],
        FISCAL_PERIODS: {},
      }));

      jest.doMock('../../services/apiService', () => ({
        getWorkforceData: jest.fn(() => Promise.reject(new Error('API unavailable'))),
        getTurnoverData: jest.fn(() => Promise.reject(new Error('API unavailable'))),
        getExitSurveyData: jest.fn(() => Promise.reject(new Error('API unavailable'))),
        getAnnualTurnoverRates: jest.fn(() => Promise.reject(new Error('API unavailable'))),
        getTop15SchoolOrgData: jest.fn(() => Promise.reject(new Error('API unavailable'))),
        getSchoolOrgData: jest.fn(() => Promise.reject(new Error('API unavailable'))),
        getMobilityData: jest.fn(() => Promise.reject(new Error('API unavailable'))),
        checkAPIHealth: jest.fn(() => Promise.reject(new Error('API unavailable'))),
        getAvailableQuarters: jest.fn(() => Promise.reject(new Error('API unavailable'))),
      }));

      dataService = require('../../services/dataService');
      apiService = require('../../services/apiService');
    });

    it('getWorkforceDataAsync falls back to static data', async () => {
      const result = await dataService.getWorkforceDataAsync('2025-06-30');
      expect(result).toEqual(mockStaticWorkforce);
      // API was attempted
      expect(apiService.getWorkforceData).toHaveBeenCalled();
    });

    it('getTurnoverDataAsync falls back to static data', async () => {
      const result = await dataService.getTurnoverDataAsync('2025-06-30');
      expect(result).toEqual(mockStaticTurnover);
      expect(apiService.getTurnoverData).toHaveBeenCalled();
    });

    it('getExitSurveyDataAsync falls back to static data', async () => {
      const result = await dataService.getExitSurveyDataAsync('2025-06-30');
      expect(result).toEqual(mockStaticExitSurvey);
      expect(apiService.getExitSurveyData).toHaveBeenCalled();
    });

    it('fallback does not throw errors to the caller', async () => {
      // All these should resolve without throwing
      await expect(dataService.getWorkforceDataAsync('2025-06-30')).resolves.toBeDefined();
      await expect(dataService.getTurnoverDataAsync('2025-06-30')).resolves.toBeDefined();
      await expect(dataService.getExitSurveyDataAsync('2025-06-30')).resolves.toBeDefined();
    });
  });

  describe('getDataSourceInfo', () => {
    it('reports json source when in JSON mode', () => {
      delete process.env.REACT_APP_DATA_SOURCE;

      jest.doMock('../../data/staticData', () => ({
        getWorkforceData: jest.fn(),
        getTurnoverData: jest.fn(),
        getExitSurveyData: jest.fn(),
        getQuarterlyTurnoverData: jest.fn(),
        getQuarterlyWorkforceData: jest.fn(),
        getQuarterlyTurnoverRatesByCategory: jest.fn(),
        getAnnualTurnoverRatesByCategory: jest.fn(),
        getTop15SchoolOrgData: jest.fn(),
        getAllSchoolOrgData: jest.fn(),
        getStartersLeaversData: jest.fn(),
        getHeadcountTrendsData: jest.fn(),
        getPhoenixHeadcountData: jest.fn(),
        getOmahaHeadcountData: jest.fn(),
        getTempTotal: jest.fn(),
        getBenefitEligibleBreakdown: jest.fn(),
        getAvailableQuarters: jest.fn(),
        getMostRecentQuarter: jest.fn(),
        getPreviousQuarter: jest.fn(),
        getFiscalPeriod: jest.fn(),
        getRecruitingData: jest.fn(),
        getTurnoverMetrics: jest.fn(),
        WORKFORCE_DATA: {},
        TURNOVER_DATA: {},
        TURNOVER_METRICS: {},
        RECRUITING_DATA: {},
        EXIT_SURVEY_DATA: {},
        QUARTERLY_TURNOVER_TRENDS: [],
        QUARTERLY_HEADCOUNT_TRENDS: [],
        ANNUAL_TURNOVER_RATES_BY_CATEGORY: [],
        TURNOVER_BENCHMARKS: {},
        QUARTERLY_TURNOVER_RATES_BY_CATEGORY: [],
        QUARTERLY_TURNOVER_BENCHMARKS: {},
        QUARTERLY_TURNOVER_DATA: {},
        QUARTERLY_WORKFORCE_DATA: {},
        AVAILABLE_DATES: [],
        FISCAL_PERIODS: {},
      }));

      jest.doMock('../../services/apiService', () => ({}));

      const ds = require('../../services/dataService');
      const info = ds.getDataSourceInfo();

      expect(info.source).toBe('json');
      expect(info.isApiEnabled).toBe(false);
    });

    it('reports api source when in API mode', () => {
      process.env.REACT_APP_DATA_SOURCE = 'api';

      jest.doMock('../../data/staticData', () => ({
        getWorkforceData: jest.fn(),
        getTurnoverData: jest.fn(),
        getExitSurveyData: jest.fn(),
        getQuarterlyTurnoverData: jest.fn(),
        getQuarterlyWorkforceData: jest.fn(),
        getQuarterlyTurnoverRatesByCategory: jest.fn(),
        getAnnualTurnoverRatesByCategory: jest.fn(),
        getTop15SchoolOrgData: jest.fn(),
        getAllSchoolOrgData: jest.fn(),
        getStartersLeaversData: jest.fn(),
        getHeadcountTrendsData: jest.fn(),
        getPhoenixHeadcountData: jest.fn(),
        getOmahaHeadcountData: jest.fn(),
        getTempTotal: jest.fn(),
        getBenefitEligibleBreakdown: jest.fn(),
        getAvailableQuarters: jest.fn(),
        getMostRecentQuarter: jest.fn(),
        getPreviousQuarter: jest.fn(),
        getFiscalPeriod: jest.fn(),
        getRecruitingData: jest.fn(),
        getTurnoverMetrics: jest.fn(),
        WORKFORCE_DATA: {},
        TURNOVER_DATA: {},
        TURNOVER_METRICS: {},
        RECRUITING_DATA: {},
        EXIT_SURVEY_DATA: {},
        QUARTERLY_TURNOVER_TRENDS: [],
        QUARTERLY_HEADCOUNT_TRENDS: [],
        ANNUAL_TURNOVER_RATES_BY_CATEGORY: [],
        TURNOVER_BENCHMARKS: {},
        QUARTERLY_TURNOVER_RATES_BY_CATEGORY: [],
        QUARTERLY_TURNOVER_BENCHMARKS: {},
        QUARTERLY_TURNOVER_DATA: {},
        QUARTERLY_WORKFORCE_DATA: {},
        AVAILABLE_DATES: [],
        FISCAL_PERIODS: {},
      }));

      jest.doMock('../../services/apiService', () => ({}));

      const ds = require('../../services/dataService');
      const info = ds.getDataSourceInfo();

      expect(info.source).toBe('api');
      expect(info.isApiEnabled).toBe(true);
    });
  });
});
