/**
 * Data Service Tests
 *
 * Tests for src/services/dataService.js - the unified data service
 * that provides access to HR data from either JSON or API sources.
 */

// Import test fixtures first
const testData = require('../../__fixtures__/testData');
const {
  mockWorkforceData,
  mockTurnoverData,
  mockExitSurveyData,
  mockQuarterlyTurnoverData,
  mockQuarterlyWorkforceData,
  mockAnnualTurnoverRates,
  mockTop15SchoolOrgData,
  mockAvailableDates,
  mockFiscalPeriods
} = testData;

describe('dataService', () => {
  let dataService;
  let staticData;
  let apiService;

  beforeEach(() => {
    // Reset module cache to get fresh imports each test
    jest.resetModules();

    // Mock staticData before importing dataService
    jest.doMock('../../data/staticData', () => ({
      getWorkforceData: jest.fn(() => mockWorkforceData),
      getTurnoverData: jest.fn(() => mockTurnoverData),
      getExitSurveyData: jest.fn(() => mockExitSurveyData),
      getRecruitingData: jest.fn(() => ({ reportingDate: "6/30/25" })),
      getQuarterlyTurnoverData: jest.fn((date) => mockQuarterlyTurnoverData[date] || null),
      getQuarterlyWorkforceData: jest.fn((date) => mockQuarterlyWorkforceData[date] || null),
      getQuarterlyTurnoverRatesByCategory: jest.fn(() => []),
      getAnnualTurnoverRatesByCategory: jest.fn(() => mockAnnualTurnoverRates),
      getTop15SchoolOrgData: jest.fn(() => mockTop15SchoolOrgData),
      getAllSchoolOrgData: jest.fn(() => mockTop15SchoolOrgData),
      getStartersLeaversData: jest.fn(() => ({ starters: 50, leavers: 45 })),
      getHeadcountTrendsData: jest.fn(() => []),
      getPhoenixHeadcountData: jest.fn(() => ({ total: 565 })),
      getOmahaHeadcountData: jest.fn(() => ({ total: 4850 })),
      getTempTotal: jest.fn(() => 575),
      getBenefitEligibleBreakdown: jest.fn(() => ({ faculty: 670, staff: 1300 })),
      getAvailableQuarters: jest.fn(() => ["Q1 FY26", "Q4 FY25"]),
      getMostRecentQuarter: jest.fn(() => "Q1 FY26"),
      getPreviousQuarter: jest.fn((q) => q === "Q1 FY26" ? "Q4 FY25" : "Q3 FY25"),
      getFiscalPeriod: jest.fn((q) => mockFiscalPeriods[q] || null),
      WORKFORCE_DATA: { "2025-06-30": mockWorkforceData },
      TURNOVER_DATA: { "2025-06-30": mockTurnoverData },
      RECRUITING_DATA: {},
      EXIT_SURVEY_DATA: { "2025-06-30": mockExitSurveyData },
      QUARTERLY_TURNOVER_TRENDS: [],
      QUARTERLY_HEADCOUNT_TRENDS: [],
      ANNUAL_TURNOVER_RATES_BY_CATEGORY: mockAnnualTurnoverRates,
      TURNOVER_BENCHMARKS: {},
      QUARTERLY_TURNOVER_RATES_BY_CATEGORY: [],
      QUARTERLY_TURNOVER_BENCHMARKS: {},
      QUARTERLY_TURNOVER_DATA: mockQuarterlyTurnoverData,
      QUARTERLY_WORKFORCE_DATA: mockQuarterlyWorkforceData,
      AVAILABLE_DATES: mockAvailableDates,
      FISCAL_PERIODS: mockFiscalPeriods
    }));

    // Mock apiService
    jest.doMock('../apiService', () => ({
      getWorkforceData: jest.fn(),
      getTurnoverData: jest.fn(),
      getExitSurveyData: jest.fn(),
      getAnnualTurnoverRates: jest.fn(),
      getTop15SchoolOrgData: jest.fn(),
      checkAPIHealth: jest.fn()
    }));

    // Now import the modules
    dataService = require('../dataService');
    staticData = require('../../data/staticData');
    apiService = require('../apiService');
  });

  describe('Sync Function Delegation (JSON mode)', () => {
    it('getWorkforceData returns staticData result', () => {
      const result = dataService.getWorkforceData("2025-06-30");
      expect(staticData.getWorkforceData).toHaveBeenCalledWith("2025-06-30");
      expect(result).toEqual(mockWorkforceData);
    });

    it('getWorkforceData uses default date when not provided', () => {
      dataService.getWorkforceData();
      expect(staticData.getWorkforceData).toHaveBeenCalledWith("2025-06-30");
    });

    it('getTurnoverData returns staticData result', () => {
      const result = dataService.getTurnoverData("2025-06-30");
      expect(staticData.getTurnoverData).toHaveBeenCalledWith("2025-06-30");
      expect(result).toEqual(mockTurnoverData);
    });

    it('getExitSurveyData returns staticData result', () => {
      const result = dataService.getExitSurveyData("2025-06-30");
      expect(staticData.getExitSurveyData).toHaveBeenCalledWith("2025-06-30");
      expect(result).toEqual(mockExitSurveyData);
    });

    it('getQuarterlyTurnoverData returns staticData result', () => {
      const result = dataService.getQuarterlyTurnoverData("2025-09-30");
      expect(staticData.getQuarterlyTurnoverData).toHaveBeenCalledWith("2025-09-30");
      expect(result).toEqual(mockQuarterlyTurnoverData["2025-09-30"]);
    });

    it('getQuarterlyWorkforceData returns staticData result', () => {
      const result = dataService.getQuarterlyWorkforceData("2025-09-30");
      expect(staticData.getQuarterlyWorkforceData).toHaveBeenCalledWith("2025-09-30");
      expect(result).toEqual(mockQuarterlyWorkforceData["2025-09-30"]);
    });

    it('getRecruitingData returns staticData result', () => {
      const result = dataService.getRecruitingData("2025-06-30");
      expect(staticData.getRecruitingData).toHaveBeenCalledWith("2025-06-30");
      expect(result).toHaveProperty('reportingDate');
    });

    it('getAnnualTurnoverRatesByCategory returns staticData result', () => {
      const result = dataService.getAnnualTurnoverRatesByCategory();
      expect(staticData.getAnnualTurnoverRatesByCategory).toHaveBeenCalled();
      expect(result).toEqual(mockAnnualTurnoverRates);
    });

    it('getTop15SchoolOrgData returns staticData result', () => {
      const result = dataService.getTop15SchoolOrgData("2025-06-30");
      expect(staticData.getTop15SchoolOrgData).toHaveBeenCalledWith("2025-06-30");
      expect(result).toEqual(mockTop15SchoolOrgData);
    });

    it('getAllSchoolOrgData returns staticData result', () => {
      const result = dataService.getAllSchoolOrgData("2025-06-30");
      expect(staticData.getAllSchoolOrgData).toHaveBeenCalledWith("2025-06-30");
    });
  });

  describe('Additional Sync Functions', () => {
    it('getStartersLeaversData returns staticData result', () => {
      const result = dataService.getStartersLeaversData();
      expect(staticData.getStartersLeaversData).toHaveBeenCalled();
      expect(result).toHaveProperty('starters');
      expect(result).toHaveProperty('leavers');
    });

    it('getHeadcountTrendsData returns staticData result', () => {
      const result = dataService.getHeadcountTrendsData();
      expect(staticData.getHeadcountTrendsData).toHaveBeenCalled();
    });

    it('getPhoenixHeadcountData returns staticData result', () => {
      const result = dataService.getPhoenixHeadcountData();
      expect(staticData.getPhoenixHeadcountData).toHaveBeenCalled();
      expect(result).toHaveProperty('total');
    });

    it('getOmahaHeadcountData returns staticData result', () => {
      const result = dataService.getOmahaHeadcountData();
      expect(staticData.getOmahaHeadcountData).toHaveBeenCalled();
      expect(result).toHaveProperty('total');
    });

    it('getTempTotal returns staticData result', () => {
      const result = dataService.getTempTotal("2025-06-30");
      expect(staticData.getTempTotal).toHaveBeenCalledWith("2025-06-30");
      expect(typeof result).toBe('number');
    });

    it('getBenefitEligibleBreakdown returns staticData result', () => {
      const result = dataService.getBenefitEligibleBreakdown("2025-06-30");
      expect(staticData.getBenefitEligibleBreakdown).toHaveBeenCalledWith("2025-06-30");
      expect(result).toHaveProperty('faculty');
      expect(result).toHaveProperty('staff');
    });

    it('getQuarterlyTurnoverRatesByCategory returns staticData result', () => {
      const result = dataService.getQuarterlyTurnoverRatesByCategory();
      expect(staticData.getQuarterlyTurnoverRatesByCategory).toHaveBeenCalled();
    });
  });

  describe('Quarter Navigation Functions', () => {
    it('getAvailableQuarters returns staticData result', () => {
      const result = dataService.getAvailableQuarters();
      expect(staticData.getAvailableQuarters).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });

    it('getMostRecentQuarter returns staticData result', () => {
      const result = dataService.getMostRecentQuarter();
      expect(staticData.getMostRecentQuarter).toHaveBeenCalled();
      expect(result).toBe("Q1 FY26");
    });

    it('getPreviousQuarter returns staticData result', () => {
      const result = dataService.getPreviousQuarter("Q1 FY26");
      expect(staticData.getPreviousQuarter).toHaveBeenCalledWith("Q1 FY26");
      expect(result).toBe("Q4 FY25");
    });

    it('getFiscalPeriod returns staticData result', () => {
      const result = dataService.getFiscalPeriod("Q1 FY26");
      expect(staticData.getFiscalPeriod).toHaveBeenCalledWith("Q1 FY26");
      expect(result).toHaveProperty('fiscalYear');
      expect(result).toHaveProperty('fiscalQuarter');
    });
  });

  describe('Async Function Behavior (JSON mode - USE_API=false)', () => {
    it('getWorkforceDataAsync returns staticData when USE_API=false', async () => {
      const result = await dataService.getWorkforceDataAsync("2025-06-30");
      expect(staticData.getWorkforceData).toHaveBeenCalledWith("2025-06-30");
      expect(result).toEqual(mockWorkforceData);
      expect(apiService.getWorkforceData).not.toHaveBeenCalled();
    });

    it('getTurnoverDataAsync returns staticData when USE_API=false', async () => {
      const result = await dataService.getTurnoverDataAsync("2025-06-30");
      expect(staticData.getTurnoverData).toHaveBeenCalledWith("2025-06-30");
      expect(result).toEqual(mockTurnoverData);
    });

    it('getExitSurveyDataAsync returns staticData when USE_API=false', async () => {
      const result = await dataService.getExitSurveyDataAsync("2025-06-30");
      expect(staticData.getExitSurveyData).toHaveBeenCalledWith("2025-06-30");
      expect(result).toEqual(mockExitSurveyData);
    });

    it('getTop15SchoolOrgDataAsync returns staticData when USE_API=false', async () => {
      const result = await dataService.getTop15SchoolOrgDataAsync("2025-06-30");
      expect(staticData.getTop15SchoolOrgData).toHaveBeenCalledWith("2025-06-30");
      expect(result).toEqual(mockTop15SchoolOrgData);
    });

    it('getAnnualTurnoverRatesByCategoryAsync returns staticData when USE_API=false', async () => {
      const result = await dataService.getAnnualTurnoverRatesByCategoryAsync();
      expect(staticData.getAnnualTurnoverRatesByCategory).toHaveBeenCalled();
      expect(result).toEqual(mockAnnualTurnoverRates);
    });
  });

  describe('Feature Flag Behavior', () => {
    it('getDataSourceInfo returns json source by default', () => {
      const info = dataService.getDataSourceInfo();
      expect(info).toEqual({
        source: 'json',
        apiUrl: '/api',
        isApiEnabled: false
      });
    });

    it('checkDataSource returns JSON health status when USE_API=false', async () => {
      const result = await dataService.checkDataSource();
      expect(result).toEqual({
        status: 'ok',
        source: 'json',
        message: 'Using local JSON data'
      });
    });
  });

  describe('Constant Re-exports', () => {
    it('WORKFORCE_DATA is re-exported correctly', () => {
      expect(dataService.WORKFORCE_DATA).toBeDefined();
      expect(dataService.WORKFORCE_DATA["2025-06-30"]).toEqual(mockWorkforceData);
    });

    it('TURNOVER_DATA is re-exported correctly', () => {
      expect(dataService.TURNOVER_DATA).toBeDefined();
      expect(dataService.TURNOVER_DATA["2025-06-30"]).toEqual(mockTurnoverData);
    });

    it('AVAILABLE_DATES is re-exported correctly', () => {
      expect(dataService.AVAILABLE_DATES).toBeDefined();
      expect(Array.isArray(dataService.AVAILABLE_DATES)).toBe(true);
      expect(dataService.AVAILABLE_DATES).toEqual(mockAvailableDates);
    });

    it('EXIT_SURVEY_DATA is re-exported correctly', () => {
      expect(dataService.EXIT_SURVEY_DATA).toBeDefined();
    });

    it('FISCAL_PERIODS is re-exported correctly', () => {
      expect(dataService.FISCAL_PERIODS).toBeDefined();
      expect(dataService.FISCAL_PERIODS).toEqual(mockFiscalPeriods);
    });

    it('QUARTERLY_TURNOVER_DATA is re-exported correctly', () => {
      expect(dataService.QUARTERLY_TURNOVER_DATA).toBeDefined();
    });

    it('QUARTERLY_WORKFORCE_DATA is re-exported correctly', () => {
      expect(dataService.QUARTERLY_WORKFORCE_DATA).toBeDefined();
    });

    it('QUARTERLY_TURNOVER_TRENDS is re-exported correctly', () => {
      expect(dataService.QUARTERLY_TURNOVER_TRENDS).toBeDefined();
    });

    it('QUARTERLY_HEADCOUNT_TRENDS is re-exported correctly', () => {
      expect(dataService.QUARTERLY_HEADCOUNT_TRENDS).toBeDefined();
    });

    it('ANNUAL_TURNOVER_RATES_BY_CATEGORY is re-exported correctly', () => {
      expect(dataService.ANNUAL_TURNOVER_RATES_BY_CATEGORY).toBeDefined();
    });

    it('TURNOVER_BENCHMARKS is re-exported correctly', () => {
      expect(dataService.TURNOVER_BENCHMARKS).toBeDefined();
    });

    it('QUARTERLY_TURNOVER_RATES_BY_CATEGORY is re-exported correctly', () => {
      expect(dataService.QUARTERLY_TURNOVER_RATES_BY_CATEGORY).toBeDefined();
    });

    it('QUARTERLY_TURNOVER_BENCHMARKS is re-exported correctly', () => {
      expect(dataService.QUARTERLY_TURNOVER_BENCHMARKS).toBeDefined();
    });

    it('RECRUITING_DATA is re-exported correctly', () => {
      expect(dataService.RECRUITING_DATA).toBeDefined();
    });
  });

  describe('Default Export', () => {
    it('default export contains all sync functions', () => {
      const defaultExport = dataService.default;

      expect(defaultExport.getWorkforceData).toBeDefined();
      expect(defaultExport.getTurnoverData).toBeDefined();
      expect(defaultExport.getRecruitingData).toBeDefined();
      expect(defaultExport.getExitSurveyData).toBeDefined();
      expect(defaultExport.getQuarterlyTurnoverData).toBeDefined();
      expect(defaultExport.getQuarterlyWorkforceData).toBeDefined();
      expect(defaultExport.getQuarterlyTurnoverRatesByCategory).toBeDefined();
      expect(defaultExport.getAnnualTurnoverRatesByCategory).toBeDefined();
      expect(defaultExport.getTop15SchoolOrgData).toBeDefined();
      expect(defaultExport.getAllSchoolOrgData).toBeDefined();
      expect(defaultExport.getStartersLeaversData).toBeDefined();
      expect(defaultExport.getHeadcountTrendsData).toBeDefined();
      expect(defaultExport.getPhoenixHeadcountData).toBeDefined();
      expect(defaultExport.getOmahaHeadcountData).toBeDefined();
      expect(defaultExport.getTempTotal).toBeDefined();
      expect(defaultExport.getBenefitEligibleBreakdown).toBeDefined();
      expect(defaultExport.getAvailableQuarters).toBeDefined();
      expect(defaultExport.getMostRecentQuarter).toBeDefined();
      expect(defaultExport.getPreviousQuarter).toBeDefined();
      expect(defaultExport.getFiscalPeriod).toBeDefined();
    });

    it('default export contains all async functions', () => {
      const defaultExport = dataService.default;

      expect(defaultExport.getWorkforceDataAsync).toBeDefined();
      expect(defaultExport.getTurnoverDataAsync).toBeDefined();
      expect(defaultExport.getExitSurveyDataAsync).toBeDefined();
      expect(defaultExport.getAnnualTurnoverRatesByCategoryAsync).toBeDefined();
      expect(defaultExport.getTop15SchoolOrgDataAsync).toBeDefined();
    });

    it('default export contains utility functions', () => {
      const defaultExport = dataService.default;

      expect(defaultExport.getDataSourceInfo).toBeDefined();
      expect(defaultExport.checkDataSource).toBeDefined();
    });
  });
});
