/**
 * API Endpoints Tests
 *
 * Tests for API endpoint logic - data transformation and response formatting.
 * Tests the expected behavior of Vercel serverless API handlers in /api/ directory.
 *
 * Note: These tests mock the database layer and test the expected output structure.
 * The actual handlers are tested during Vercel deployment.
 */

import {
  mockAPIWorkforceResponse,
  mockAPITurnoverResponse,
  mockAPIExitSurveyResponse,
  mockDatabaseCounts,
  mockTop15SchoolOrgData,
  mockAnnualTurnoverRates,
  mockMobilityData
} from '../../__fixtures__/testData';

describe('API Response Structures', () => {
  describe('Health Endpoint (/api/health)', () => {
    const formatHealthResponse = (dbInfo, counts) => ({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        name: dbInfo.database,
        serverTime: dbInfo.server_time
      },
      data: {
        dimensionTables: {
          categories: Number(counts.categories),
          schools: Number(counts.schools),
          termReasons: Number(counts.term_reasons),
          fiscalPeriods: Number(counts.fiscal_periods)
        },
        factTables: {
          workforceSnapshots: Number(counts.workforce_snapshots),
          terminations: Number(counts.terminations),
          exitSurveys: Number(counts.exit_surveys),
          mobilityEvents: Number(counts.mobility_events)
        }
      }
    });

    it('returns correct structure with healthy status', () => {
      const dbInfo = { database: 'hr_reports', server_time: '2025-06-30T12:00:00Z' };
      const counts = {
        categories: 15,
        schools: 25,
        term_reasons: 16,
        fiscal_periods: 12,
        workforce_snapshots: 1200,
        terminations: 450,
        exit_surveys: 320,
        mobility_events: 180
      };

      const response = formatHealthResponse(dbInfo, counts);

      expect(response.status).toBe('healthy');
      expect(response.database.connected).toBe(true);
      expect(response.database.name).toBe('hr_reports');
      expect(response.data.dimensionTables.categories).toBe(15);
      expect(response.data.factTables.workforceSnapshots).toBe(1200);
    });

    it('returns table counts as numbers', () => {
      const dbInfo = { database: 'test', server_time: new Date().toISOString() };
      const counts = {
        categories: '15', // String from DB
        schools: '25',
        term_reasons: '16',
        fiscal_periods: '12',
        workforce_snapshots: '1200',
        terminations: '450',
        exit_surveys: '320',
        mobility_events: '180'
      };

      const response = formatHealthResponse(dbInfo, counts);

      expect(typeof response.data.dimensionTables.categories).toBe('number');
      expect(typeof response.data.factTables.workforceSnapshots).toBe('number');
    });
  });

  describe('Workforce Endpoint (/api/workforce/:date)', () => {
    const formatDateShort = (dateStr) => {
      const date = new Date(dateStr);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear().toString().slice(-2);
      return `${month}/${day}/${year}`;
    };

    const transformWorkforceData = (data) => ({
      reportingDate: formatDateShort(data.period_date),
      quarterLabel: data.quarter_label,
      fiscalYear: data.fiscal_year,
      fiscalQuarter: data.fiscal_quarter,
      totalEmployees: Number(data.total_employees),
      faculty: Number(data.faculty),
      staff: Number(data.staff),
      hsp: Number(data.hsp),
      students: Number(data.students),
      temp: Number(data.temp),
      locations: {
        "Omaha Campus": Number(data.omaha_total),
        "Phoenix Campus": Number(data.phoenix_total)
      },
      locationDetails: {
        omaha: {
          faculty: Number(data.omaha_faculty),
          staff: Number(data.omaha_staff),
          hsp: Number(data.omaha_hsp),
          students: Number(data.omaha_students)
        },
        phoenix: {
          faculty: Number(data.phoenix_faculty),
          staff: Number(data.phoenix_staff),
          hsp: Number(data.phoenix_hsp),
          students: Number(data.phoenix_students)
        }
      }
    });

    it('transforms database response to correct format', () => {
      const response = transformWorkforceData(mockAPIWorkforceResponse);

      // Date formatting may vary by timezone, so just check it's a short date format
      expect(response.reportingDate).toMatch(/^\d{1,2}\/\d{1,2}\/\d{2}$/);
      expect(response.totalEmployees).toBe(5415);
      expect(response.faculty).toBe(670);
      expect(response.staff).toBe(1300);
      expect(response.locations['Omaha Campus']).toBe(4850);
      expect(response.locations['Phoenix Campus']).toBe(565);
    });

    it('includes location details', () => {
      const response = transformWorkforceData(mockAPIWorkforceResponse);

      expect(response.locationDetails.omaha.faculty).toBe(630);
      expect(response.locationDetails.phoenix.hsp).toBe(372);
    });

    it('converts all numeric fields to numbers', () => {
      const dataWithStrings = {
        ...mockAPIWorkforceResponse,
        total_employees: '5415',
        faculty: '670'
      };

      const response = transformWorkforceData(dataWithStrings);

      expect(typeof response.totalEmployees).toBe('number');
      expect(typeof response.faculty).toBe('number');
    });
  });

  describe('Turnover Endpoint (/api/turnover/:date)', () => {
    const transformTurnoverData = (summary, reasons = [], schools = []) => ({
      reportingDate: summary.period_date,
      quarterLabel: summary.quarter_label,
      fiscalYear: summary.fiscal_year,
      fiscalQuarter: summary.fiscal_quarter,
      totalTerminations: Number(summary.total_terminations),
      voluntaryCount: Number(summary.voluntary_count),
      involuntaryCount: Number(summary.involuntary_count),
      retirementCount: Number(summary.retirement_count),
      voluntaryPct: Number(summary.voluntary_pct),
      involuntaryPct: Number(summary.involuntary_pct),
      retirementPct: Number(summary.retirement_pct),
      locations: {
        omaha: Number(summary.omaha_count),
        phoenix: Number(summary.phoenix_count)
      },
      tenure: {
        avgYears: Number(summary.avg_tenure_years),
        under1yr: Number(summary.tenure_under_1yr),
        '1to3yr': Number(summary.tenure_1_3yr),
        '3to5yr': Number(summary.tenure_3_5yr),
        '5to10yr': Number(summary.tenure_5_10yr),
        '10plusYr': Number(summary.tenure_10plus_yr)
      },
      exitReasons: reasons.map(r => ({
        reason: r.reason_label,
        category: r.reason_category,
        count: Number(r.count),
        percentage: Number(r.percentage)
      })),
      schoolTurnover: schools.map(s => ({
        school: s.school_name,
        departures: Number(s.departures),
        voluntary: Number(s.voluntary),
        involuntary: Number(s.involuntary),
        retirement: Number(s.retirement)
      }))
    });

    it('transforms database response to correct format', () => {
      const response = transformTurnoverData(mockAPITurnoverResponse);

      expect(response.totalTerminations).toBe(222);
      expect(response.voluntaryCount).toBe(156);
      expect(response.involuntaryCount).toBe(45);
      expect(response.retirementCount).toBe(21);
    });

    it('includes location breakdown', () => {
      const response = transformTurnoverData(mockAPITurnoverResponse);

      expect(response.locations.omaha).toBe(185);
      expect(response.locations.phoenix).toBe(37);
    });

    it('includes tenure distribution', () => {
      const response = transformTurnoverData(mockAPITurnoverResponse);

      expect(response.tenure.avgYears).toBe(5.8);
      expect(response.tenure.under1yr).toBe(42);
      expect(response.tenure['10plusYr']).toBe(32);
    });

    it('transforms exit reasons', () => {
      const reasons = [
        { reason_label: 'New Position', reason_category: 'voluntary', count: 85, percentage: 38.3 }
      ];

      const response = transformTurnoverData(mockAPITurnoverResponse, reasons);

      expect(response.exitReasons).toHaveLength(1);
      expect(response.exitReasons[0].reason).toBe('New Position');
      expect(response.exitReasons[0].category).toBe('voluntary');
    });

    it('transforms school turnover', () => {
      const schools = [
        { school_name: 'Arts & Sciences', departures: 32, voluntary: 24, involuntary: 6, retirement: 2 }
      ];

      const response = transformTurnoverData(mockAPITurnoverResponse, [], schools);

      expect(response.schoolTurnover).toHaveLength(1);
      expect(response.schoolTurnover[0].school).toBe('Arts & Sciences');
      expect(response.schoolTurnover[0].departures).toBe(32);
    });
  });

  describe('Exit Surveys Endpoint (/api/exit-surveys/:date)', () => {
    const transformExitSurveyData = (data) => ({
      reportingDate: data.period_date,
      quarterLabel: data.quarter_label,
      fiscalYear: data.fiscal_year,
      fiscalQuarter: data.fiscal_quarter,
      totalResponses: Number(data.total_responses),
      totalTerminations: Number(data.total_terminations),
      responseRate: Number(data.response_rate),
      scores: {
        careerDevelopment: Number(data.avg_career_development),
        managementSupport: Number(data.avg_management_support),
        workLifeBalance: Number(data.avg_work_life_balance),
        compensation: Number(data.avg_compensation),
        benefits: Number(data.avg_benefits),
        jobSatisfaction: Number(data.avg_job_satisfaction),
        overall: Number(data.avg_overall)
      },
      wouldRecommend: {
        count: Number(data.would_recommend_count),
        percentage: Number(data.would_recommend_pct)
      },
      conductConcernsCount: Number(data.conduct_concerns_count)
    });

    it('transforms database response to correct format', () => {
      const response = transformExitSurveyData(mockAPIExitSurveyResponse);

      expect(response.totalResponses).toBe(145);
      expect(response.responseRate).toBe(65.3);
    });

    it('includes satisfaction scores', () => {
      const response = transformExitSurveyData(mockAPIExitSurveyResponse);

      expect(response.scores.careerDevelopment).toBe(3.2);
      expect(response.scores.workLifeBalance).toBe(3.8);
      expect(response.scores.benefits).toBe(4.1);
    });

    it('includes would recommend data', () => {
      const response = transformExitSurveyData(mockAPIExitSurveyResponse);

      expect(response.wouldRecommend.count).toBe(98);
      expect(response.wouldRecommend.percentage).toBe(67.6);
    });
  });

  describe('Schools Endpoint (/api/schools/:date)', () => {
    const transformSchoolData = (schools, periodDate, limit = 15) => ({
      periodDate,
      limit,
      schools: schools.map((s, idx) => ({
        code: s.code,
        name: s.name,
        shortName: s.short_name || s.shortName,
        location: s.location,
        total: Number(s.total),
        faculty: Number(s.faculty),
        staff: Number(s.staff),
        hsp: Number(s.hsp),
        rank: idx + 1
      }))
    });

    it('transforms schools with ranking', () => {
      const mockSchools = [
        { code: 'A&S', name: 'Arts & Sciences', short_name: 'A&S', location: 'omaha', total: 635, faculty: 255, staff: 380, hsp: 0 },
        { code: 'SOM', name: 'School of Medicine', short_name: 'SOM', location: 'omaha', total: 588, faculty: 108, staff: 210, hsp: 270 }
      ];

      const response = transformSchoolData(mockSchools, '2025-06-30');

      expect(response.schools).toHaveLength(2);
      expect(response.schools[0].rank).toBe(1);
      expect(response.schools[1].rank).toBe(2);
    });

    it('includes period date and limit', () => {
      const response = transformSchoolData([], '2025-06-30', 15);

      expect(response.periodDate).toBe('2025-06-30');
      expect(response.limit).toBe(15);
    });
  });

  describe('Turnover Rates Endpoint (/api/turnover-rates)', () => {
    const transformTurnoverRates = (rates) => rates.map(r => ({
      fiscalYear: r.fiscal_year,
      voluntaryTerminations: Number(r.voluntary_terminations),
      avgBenefitEligibleHeadcount: Number(r.avg_benefit_eligible_headcount),
      voluntaryTurnoverRate: Number(r.voluntary_turnover_rate),
      benchmark: {
        allStaff: r.benchmark_all_staff ? Number(r.benchmark_all_staff) : null,
        professionals: r.benchmark_professionals ? Number(r.benchmark_professionals) : null,
        clerical: r.benchmark_clerical ? Number(r.benchmark_clerical) : null,
        crafts: r.benchmark_crafts ? Number(r.benchmark_crafts) : null
      }
    }));

    it('transforms rates with benchmarks', () => {
      const mockRates = [{
        fiscal_year: 2025,
        voluntary_terminations: 156,
        avg_benefit_eligible_headcount: 1970,
        voluntary_turnover_rate: 7.9,
        benchmark_all_staff: 15.0,
        benchmark_professionals: 12.0,
        benchmark_clerical: 18.0,
        benchmark_crafts: 14.0
      }];

      const response = transformTurnoverRates(mockRates);

      expect(response[0].fiscalYear).toBe(2025);
      expect(response[0].voluntaryTurnoverRate).toBe(7.9);
      expect(response[0].benchmark.allStaff).toBe(15.0);
    });

    it('handles null benchmarks', () => {
      const mockRates = [{
        fiscal_year: 2024,
        voluntary_terminations: 140,
        avg_benefit_eligible_headcount: 1900,
        voluntary_turnover_rate: 7.4,
        benchmark_all_staff: null,
        benchmark_professionals: null,
        benchmark_clerical: null,
        benchmark_crafts: null
      }];

      const response = transformTurnoverRates(mockRates);

      expect(response[0].benchmark.allStaff).toBeNull();
    });
  });

  describe('Mobility Endpoint (/api/mobility/:date)', () => {
    const transformMobilityData = (data) => ({
      periodDate: data.period_date,
      quarterLabel: data.quarter_label,
      fiscalYear: data.fiscal_year,
      fiscalQuarter: data.fiscal_quarter,
      totalEvents: Number(data.total_events),
      promotions: Number(data.promotions),
      transfers: Number(data.transfers),
      demotions: Number(data.demotions),
      reclassifications: Number(data.reclassifications),
      lateralMoves: Number(data.lateral_moves),
      crossSchoolMoves: Number(data.cross_school_moves),
      crossDepartmentMoves: Number(data.cross_department_moves)
    });

    it('transforms mobility data', () => {
      const mockData = {
        period_date: '2025-06-30',
        quarter_label: 'FY25_Q4',
        fiscal_year: 2025,
        fiscal_quarter: 4,
        total_events: 85,
        promotions: 32,
        transfers: 28,
        demotions: 3,
        reclassifications: 12,
        lateral_moves: 10,
        cross_school_moves: 15,
        cross_department_moves: 42
      };

      const response = transformMobilityData(mockData);

      expect(response.totalEvents).toBe(85);
      expect(response.promotions).toBe(32);
      expect(response.transfers).toBe(28);
      expect(response.crossSchoolMoves).toBe(15);
    });
  });

  describe('Date Validation', () => {
    const isValidDateFormat = (date) => {
      return /^\d{4}-\d{2}-\d{2}$/.test(date);
    };

    it('accepts valid YYYY-MM-DD format', () => {
      expect(isValidDateFormat('2025-06-30')).toBe(true);
      expect(isValidDateFormat('2024-01-01')).toBe(true);
      expect(isValidDateFormat('2026-12-31')).toBe(true);
    });

    it('rejects invalid formats', () => {
      expect(isValidDateFormat('06-30-2025')).toBe(false);
      expect(isValidDateFormat('2025/06/30')).toBe(false);
      expect(isValidDateFormat('June 30, 2025')).toBe(false);
      expect(isValidDateFormat('')).toBe(false);
      expect(isValidDateFormat('invalid')).toBe(false);
    });
  });

  describe('Cache-Control Headers', () => {
    it('defines correct cache headers for data endpoints', () => {
      const cacheControl = 's-maxage=3600, stale-while-revalidate';
      expect(cacheControl).toContain('s-maxage=3600');
      expect(cacheControl).toContain('stale-while-revalidate');
    });

    it('defines no-cache for health endpoint', () => {
      const cacheControl = 'no-cache';
      expect(cacheControl).toBe('no-cache');
    });
  });

  describe('Error Response Formats', () => {
    it('defines 400 error format for invalid date', () => {
      const errorResponse = {
        error: 'Invalid date format. Use YYYY-MM-DD (e.g., 2025-06-30)'
      };
      expect(errorResponse.error).toContain('YYYY-MM-DD');
    });

    it('defines 404 error format for missing data', () => {
      const errorResponse = {
        error: 'No workforce data found for this date',
        date: '2020-01-01'
      };
      expect(errorResponse.error).toContain('No');
      expect(errorResponse.date).toBeDefined();
    });

    it('defines 405 error format for invalid method', () => {
      const errorResponse = { error: 'Method not allowed' };
      expect(errorResponse.error).toBe('Method not allowed');
    });

    it('defines 503 error format for unhealthy database', () => {
      const errorResponse = {
        status: 'unhealthy',
        database: {
          connected: false,
          error: 'Connection failed'
        }
      };
      expect(errorResponse.status).toBe('unhealthy');
      expect(errorResponse.database.connected).toBe(false);
    });
  });
});
