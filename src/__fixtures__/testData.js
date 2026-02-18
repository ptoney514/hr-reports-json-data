/**
 * Test Data Fixtures
 *
 * Shared mock data for unit tests across the HR Reports application.
 * These fixtures match the structure of actual data from staticData.js
 * and API responses.
 */

// Mock workforce data matching staticData.js structure
export const mockWorkforceData = {
  reportingDate: "6/30/25",
  quarterLabel: "FY25_Q4",
  fiscalYear: 2025,
  fiscalQuarter: 4,
  totalEmployees: 5415,
  faculty: 670,
  staff: 1300,
  hsp: 620,
  students: 1500,
  temp: 575,
  jesuits: 17,
  locations: {
    "Omaha Campus": 4850,
    "Phoenix Campus": 565
  },
  locationDetails: {
    omaha: {
      faculty: 630,
      staff: 1196,
      hsp: 248,
      students: 1125
    },
    phoenix: {
      faculty: 40,
      staff: 104,
      hsp: 372,
      students: 375
    }
  },
  categories: {
    "F12": 1750,
    "SUE": 1430,
    "HSR": 620,
    "TEMP": 460,
    "F11": 48,
    "CWS": 80,
    "PT12": 52,
    "NBE": 15,
    "PRN": 100
  },
  schoolOrgData: [
    {
      code: "A&S",
      name: "Arts & Sciences",
      shortName: "Arts & Sciences",
      faculty: 255,
      staff: 380,
      hsp: 0,
      total: 635
    },
    {
      code: "SOM",
      name: "School of Medicine",
      shortName: "Medicine",
      faculty: 108,
      staff: 210,
      hsp: 270,
      total: 588
    }
  ]
};

// Mock turnover data
export const mockTurnoverData = {
  reportingDate: "6/30/25",
  quarterLabel: "FY25_Q4",
  fiscalYear: 2025,
  fiscalQuarter: 4,
  totalTerminations: 222,
  voluntaryCount: 156,
  involuntaryCount: 45,
  retirementCount: 21,
  voluntaryPct: 70.3,
  involuntaryPct: 20.3,
  retirementPct: 9.5,
  locations: {
    omaha: 185,
    phoenix: 37
  },
  tenure: {
    avgYears: 5.8,
    under1yr: 42,
    "1to3yr": 68,
    "3to5yr": 35,
    "5to10yr": 45,
    "10plusYr": 32
  },
  exitReasons: [
    { reason: "New Position", category: "voluntary", count: 85, percentage: 38.3 },
    { reason: "Personal Reasons", category: "voluntary", count: 42, percentage: 18.9 },
    { reason: "Retirement", category: "retirement", count: 21, percentage: 9.5 }
  ],
  schoolTurnover: [
    { school: "Arts & Sciences", departures: 32, voluntary: 24, involuntary: 6, retirement: 2 },
    { school: "School of Medicine", departures: 28, voluntary: 20, involuntary: 5, retirement: 3 }
  ]
};

// Mock exit survey data
export const mockExitSurveyData = {
  reportingDate: "6/30/25",
  quarterLabel: "FY25_Q4",
  fiscalYear: 2025,
  fiscalQuarter: 4,
  totalResponses: 145,
  totalTerminations: 222,
  responseRate: 65.3,
  scores: {
    careerDevelopment: 3.2,
    managementSupport: 3.5,
    workLifeBalance: 3.8,
    compensation: 2.9,
    benefits: 4.1,
    jobSatisfaction: 3.4,
    overall: 3.5
  },
  wouldRecommend: {
    count: 98,
    percentage: 67.6
  },
  conductConcernsCount: 12
};

// Mock quarterly turnover data
export const mockQuarterlyTurnoverData = {
  "2025-09-30": {
    reportingDate: "9/30/25",
    quarterLabel: "Q1 FY26",
    fiscalYear: 2026,
    fiscalQuarter: 1,
    totalTerminations: 58,
    voluntaryCount: 42,
    involuntaryCount: 12,
    retirementCount: 4
  }
};

// Mock quarterly workforce data
export const mockQuarterlyWorkforceData = {
  "2025-09-30": {
    reportingDate: "9/30/25",
    quarterLabel: "Q1 FY26",
    fiscalYear: 2026,
    fiscalQuarter: 1,
    totalEmployees: 5480,
    faculty: 685,
    staff: 1320,
    hsp: 625
  }
};

// Mock annual turnover rates by category
export const mockAnnualTurnoverRates = {
  fiscalYear: 2025,
  rates: {
    overall: 11.2,
    voluntary: 7.8,
    involuntary: 2.3,
    retirement: 1.1
  },
  byCategory: [
    { category: "Faculty", rate: 5.2, benchmark: 6.0 },
    { category: "Staff", rate: 12.5, benchmark: 15.0 },
    { category: "HSP", rate: 18.3, benchmark: 20.0 }
  ]
};

// Mock school/org data (top 15)
export const mockTop15SchoolOrgData = [
  { code: "A&S", name: "Arts & Sciences", shortName: "Arts & Sciences", total: 635, faculty: 255, staff: 380, hsp: 0, rank: 1 },
  { code: "SOM", name: "School of Medicine", shortName: "Medicine", total: 588, faculty: 108, staff: 210, hsp: 270, rank: 2 },
  { code: "STUL", name: "Student Life", shortName: "Student Life", total: 525, faculty: 0, staff: 525, hsp: 0, rank: 3 },
  { code: "PHP", name: "Pharmacy & Health Professions", shortName: "Pharmacy", total: 465, faculty: 125, staff: 340, hsp: 0, rank: 4 },
  { code: "PA", name: "Phoenix Alliance", shortName: "Phoenix Alliance", total: 385, faculty: 0, staff: 30, hsp: 355, rank: 5 }
];

// Mock API health response
export const mockHealthResponse = {
  status: "healthy",
  timestamp: "2025-06-30T12:00:00.000Z",
  database: {
    connected: true,
    name: "hr_reports",
    serverTime: "2025-06-30T12:00:00.000Z"
  },
  data: {
    dimensionTables: {
      categories: 15,
      schools: 25,
      termReasons: 16,
      fiscalPeriods: 12
    },
    factTables: {
      workforceSnapshots: 1200,
      terminations: 450,
      exitSurveys: 320,
      mobilityEvents: 180
    }
  }
};

// Mock mobility data
export const mockMobilityData = {
  periodDate: "2025-06-30",
  quarterLabel: "FY25_Q4",
  fiscalYear: 2025,
  fiscalQuarter: 4,
  totalEvents: 85,
  promotions: 32,
  transfers: 28,
  demotions: 3,
  reclassifications: 12,
  lateralMoves: 10,
  crossSchoolMoves: 15,
  crossDepartmentMoves: 42
};

// Mock available quarters (for available-quarters API endpoint)
export const mockAvailableQuarters = [
  { value: '2025-09-30', label: 'Q1 FY26', period: 'July - September 2025', fiscalYear: 'FY26', hasData: true },
  { value: '2025-06-30', label: 'Q4 FY25', period: 'April - June 2025', fiscalYear: 'FY25', hasData: true },
  { value: '2025-03-31', label: 'Q3 FY25', period: 'January - March 2025', fiscalYear: 'FY25', hasData: true },
  { value: '2024-12-31', label: 'Q2 FY25', period: 'October - December 2024', fiscalYear: 'FY25', hasData: true },
  { value: '2024-09-30', label: 'Q1 FY25', period: 'July - September 2024', fiscalYear: 'FY25', hasData: true },
];

// Mock available dates
export const mockAvailableDates = [
  "2024-06-30",
  "2025-06-30",
  "2025-09-30"
];

// Mock fiscal periods
export const mockFiscalPeriods = {
  "Q1 FY26": {
    startDate: "2025-07-01",
    endDate: "2025-09-30",
    fiscalYear: 2026,
    fiscalQuarter: 1
  },
  "Q4 FY25": {
    startDate: "2025-04-01",
    endDate: "2025-06-30",
    fiscalYear: 2025,
    fiscalQuarter: 4
  }
};

// Mock constants re-exported from staticData
export const mockConstants = {
  WORKFORCE_DATA: { "2025-06-30": mockWorkforceData },
  TURNOVER_DATA: { "2025-06-30": mockTurnoverData },
  EXIT_SURVEY_DATA: { "2025-06-30": mockExitSurveyData },
  QUARTERLY_TURNOVER_DATA: mockQuarterlyTurnoverData,
  QUARTERLY_WORKFORCE_DATA: mockQuarterlyWorkforceData,
  AVAILABLE_DATES: mockAvailableDates,
  FISCAL_PERIODS: mockFiscalPeriods
};

// API response transformers (for testing API -> staticData format conversion)
export const mockAPIWorkforceResponse = {
  period_date: "2025-06-30",
  quarter_label: "FY25_Q4",
  fiscal_year: 2025,
  fiscal_quarter: 4,
  total_employees: 5415,
  faculty: 670,
  staff: 1300,
  hsp: 620,
  students: 1500,
  temp: 575,
  omaha_total: 4850,
  phoenix_total: 565,
  omaha_faculty: 630,
  omaha_staff: 1196,
  omaha_hsp: 248,
  omaha_students: 1125,
  phoenix_faculty: 40,
  phoenix_staff: 104,
  phoenix_hsp: 372,
  phoenix_students: 375
};

export const mockAPITurnoverResponse = {
  period_date: "2025-06-30",
  quarter_label: "FY25_Q4",
  fiscal_year: 2025,
  fiscal_quarter: 4,
  total_terminations: 222,
  voluntary_count: 156,
  involuntary_count: 45,
  retirement_count: 21,
  voluntary_pct: 70.3,
  involuntary_pct: 20.3,
  retirement_pct: 9.5,
  omaha_count: 185,
  phoenix_count: 37,
  avg_tenure_years: 5.8,
  tenure_under_1yr: 42,
  tenure_1_3yr: 68,
  tenure_3_5yr: 35,
  tenure_5_10yr: 45,
  tenure_10plus_yr: 32
};

export const mockAPIExitSurveyResponse = {
  period_date: "2025-06-30",
  quarter_label: "FY25_Q4",
  fiscal_year: 2025,
  fiscal_quarter: 4,
  total_responses: 145,
  total_terminations: 222,
  response_rate: 65.3,
  avg_career_development: 3.2,
  avg_management_support: 3.5,
  avg_work_life_balance: 3.8,
  avg_compensation: 2.9,
  avg_benefits: 4.1,
  avg_job_satisfaction: 3.4,
  avg_overall: 3.5,
  would_recommend_count: 98,
  would_recommend_pct: 67.6,
  conduct_concerns_count: 12
};

// Database query result mocks (for ETL tests)
export const mockDatabaseCounts = {
  categories: 15,
  schools: 25,
  term_reasons: 16,
  fiscal_periods: 12,
  workforce_snapshots: 1200,
  terminations: 450,
  exit_surveys: 320,
  mobility_events: 180
};

export const mockDatabaseInfo = {
  database: "hr_reports",
  user: "test_user",
  version: "PostgreSQL 15.4"
};

// Default export for convenience
export default {
  mockWorkforceData,
  mockTurnoverData,
  mockExitSurveyData,
  mockQuarterlyTurnoverData,
  mockQuarterlyWorkforceData,
  mockAnnualTurnoverRates,
  mockTop15SchoolOrgData,
  mockHealthResponse,
  mockMobilityData,
  mockAvailableQuarters,
  mockAvailableDates,
  mockFiscalPeriods,
  mockConstants,
  mockAPIWorkforceResponse,
  mockAPITurnoverResponse,
  mockAPIExitSurveyResponse,
  mockDatabaseCounts,
  mockDatabaseInfo
};
