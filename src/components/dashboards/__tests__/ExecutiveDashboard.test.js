import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ExecutiveDashboard from '../ExecutiveDashboard';

// Mock react-simple-maps (SVG-heavy, needs mocking like Recharts)
jest.mock('react-simple-maps', () => ({
  ComposableMap: ({ children, projection, projectionConfig, ...props }) => <div data-testid="composable-map" {...props}>{children}</div>,
  Geographies: ({ children }) => <div data-testid="geographies">{children({ geographies: [] })}</div>,
  Geography: () => null,
}));

// Mock Recharts (rendering issues in test environment)
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  LabelList: () => null,
  Pie: () => null,
  Cell: () => null,
}));

// Mock staticData
jest.mock('../../../data/staticData', () => ({
  getQuarterlyWorkforceData: jest.fn(),
  getQuarterlyTurnoverData: jest.fn(),
  getExitSurveyData: jest.fn(),
  QUARTERLY_HEADCOUNT_TRENDS: [
    { quarter: "Q4 FY25", faculty: 689, staff: 1448, total: 2137, students: 1916, hsp: 600, temp: 660 },
    { quarter: "Q1 FY26", faculty: 698, staff: 1451, total: 2149, students: 1860, hsp: 616, temp: 608 },
  ]
}));

const {
  getQuarterlyWorkforceData,
  getQuarterlyTurnoverData,
  getExitSurveyData
} = require('../../../data/staticData');

// ── Mock Data ──

const mockWorkforceData = {
  reportingDate: "9/30/25",
  quarter: "Q1 FY26",
  summary: {
    total: { count: 5528, oma: 4834, phx: 694 },
    faculty: { count: 697, oma: 657, phx: 40 },
    staff: { count: 1419, oma: 1318, phx: 101 },
    houseStaffPhysicians: { count: 625, oma: 282, phx: 343 },
    studentWorkers: { count: 2157, oma: 2088, phx: 69 },
    temporary: { count: 630, oma: 489, phx: 141 }
  },
  demographics: {
    ethnicity: {
      faculty: {
        total: 697,
        distribution: [
          { ethnicity: "White", count: 543, percentage: 77.9 },
          { ethnicity: "Not Disclosed", count: 53, percentage: 7.6 },
          { ethnicity: "Asian", count: 51, percentage: 7.3 },
          { ethnicity: "Two or More Races", count: 18, percentage: 2.6 },
          { ethnicity: "Black or African American", count: 17, percentage: 2.4 },
          { ethnicity: "Hispanic or Latino", count: 12, percentage: 1.7 },
          { ethnicity: "American Indian or Alaska Native", count: 3, percentage: 0.4 }
        ]
      },
      staff: {
        total: 1431,
        distribution: [
          { ethnicity: "White", count: 989, percentage: 69.1 },
          { ethnicity: "Not Disclosed", count: 126, percentage: 8.8 },
          { ethnicity: "Asian", count: 106, percentage: 7.4 },
          { ethnicity: "Black or African American", count: 82, percentage: 5.7 },
          { ethnicity: "Hispanic or Latino", count: 63, percentage: 4.4 },
          { ethnicity: "Two or More Races", count: 56, percentage: 3.9 },
          { ethnicity: "American Indian or Alaska Native", count: 6, percentage: 0.4 },
          { ethnicity: "Native Hawaiian or other Pacific Islander", count: 3, percentage: 0.2 }
        ]
      }
    },
    gender: {
      faculty: {
        total: 697,
        distribution: [
          { gender: "Female", count: 369, percentage: 52.9 },
          { gender: "Male", count: 328, percentage: 47.1 }
        ]
      },
      staff: {
        total: 1431,
        distribution: [
          { gender: "Female", count: 903, percentage: 63.1 },
          { gender: "Male", count: 528, percentage: 36.9 }
        ]
      }
    },
    ageGender: {
      faculty: {
        category: "Benefit-Eligible Faculty",
        total: 697,
        femaleTotal: 369,
        maleTotal: 328,
        ageGenderBreakdown: [
          { ageBand: "20-30", female: 4, male: 8, total: 12 },
          { ageBand: "31-40", female: 91, male: 52, total: 143 },
          { ageBand: "41-50", female: 126, male: 74, total: 200 },
          { ageBand: "51-60", female: 81, male: 82, total: 163 },
          { ageBand: "61 Plus", female: 67, male: 112, total: 179 }
        ]
      }
    }
  }
};

const mockTurnoverData = {
  reportingDate: "9/30/25",
  quarter: "Q1 FY26",
  summary: {
    total: { count: 73, oma: 68, phx: 5 },
    faculty: { count: 4, oma: 4, phx: 0 },
    staff: { count: 54, oma: 49, phx: 5 },
    houseStaffPhysicians: { count: 15, oma: 15, phx: 0 }
  },
  terminationTypesByGroup: [
    { group: "Benefit Eligible Faculty", total: 4, voluntary: 2, involuntary: 0, retirement: 2, endOfAssignment: 0 },
    { group: "Benefit Eligible Staff", total: 54, voluntary: 44, involuntary: 3, retirement: 7, endOfAssignment: 0 },
    { group: "House Staff Physicians", total: 15, voluntary: 3, involuntary: 0, retirement: 0, endOfAssignment: 12 }
  ],
  yearsOfService: [
    { range: "<1 Year", faculty: 0, staff: 13, hsp: 4 }
  ],
  earlyTurnover: {
    total: 17,
    byTerminationType: [
      { name: "Voluntary", value: 11 },
      { name: "End of Assignment", value: 4 },
      { name: "Involuntary", value: 2 }
    ]
  }
};

const mockExitSurveyData = {
  reportingDate: "9/30/25",
  quarter: "Q1 FY26",
  responseRate: 20.5,
  totalResponses: 15,
  totalExits: 73,
  overallSatisfaction: 3.3,
  wouldRecommend: 80,
  contributingReasons: [
    { reason: "Unsatisfactory salary/pay", count: 6, percentage: 40 },
    { reason: "Unrealistic job expectations/workload/hours", count: 5, percentage: 33.3 },
    { reason: "Dissatisfied with direct supervisor", count: 5, percentage: 33.3 },
  ],
  satisfactionRatings: {
    jobSatisfaction: 3.2,
    managementSupport: 3.4,
    careerDevelopment: 3,
    workLifeBalance: 3,
    compensation: 3.2,
    benefits: 3.8
  }
};

// ── Helpers ──

const renderDashboard = () => {
  getQuarterlyWorkforceData.mockReturnValue(mockWorkforceData);
  getQuarterlyTurnoverData.mockReturnValue(mockTurnoverData);
  getExitSurveyData.mockReturnValue(mockExitSurveyData);

  return render(
    <BrowserRouter>
      <ExecutiveDashboard />
    </BrowserRouter>
  );
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ══════════════════════════════════════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════════════════════════════════════

describe('ExecutiveDashboard', () => {
  // ── Data Loading ──
  describe('Data Loading', () => {
    it('renders without crashing', () => {
      renderDashboard();
      expect(screen.getByText('HR Executive Dashboard')).toBeInTheDocument();
    });

    it('loads Q1 FY26 workforce data', () => {
      renderDashboard();
      expect(getQuarterlyWorkforceData).toHaveBeenCalledWith("2025-09-30");
    });

    it('loads Q1 FY26 turnover data', () => {
      renderDashboard();
      expect(getQuarterlyTurnoverData).toHaveBeenCalledWith("2025-09-30");
    });

    it('loads Q1 FY26 exit survey data', () => {
      renderDashboard();
      expect(getExitSurveyData).toHaveBeenCalledWith("2025-09-30");
    });

    it('shows data-not-available message when data is missing', () => {
      getQuarterlyWorkforceData.mockReturnValue(null);
      getQuarterlyTurnoverData.mockReturnValue(mockTurnoverData);
      getExitSurveyData.mockReturnValue(mockExitSurveyData);

      render(
        <BrowserRouter>
          <ExecutiveDashboard />
        </BrowserRouter>
      );

      expect(screen.getByText('Data Not Yet Available')).toBeInTheDocument();
    });
  });

  // ── Header & Branding ──
  describe('Header & Branding', () => {
    it('displays "HR Executive Dashboard" title', () => {
      renderDashboard();
      expect(screen.getByRole('heading', { name: /HR Executive Dashboard/i })).toBeInTheDocument();
    });

    it('displays quarter and date range', () => {
      renderDashboard();
      const matches = screen.getAllByText(/Q1 FY26/);
      expect(matches.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/July - September 2025/i)).toBeInTheDocument();
    });

    it('displays "Creighton University"', () => {
      renderDashboard();
      expect(screen.getByText('Creighton University')).toBeInTheDocument();
    });

    it('renders quarter selector', () => {
      renderDashboard();
      expect(screen.getByRole('combobox', { name: /Select quarter/i })).toBeInTheDocument();
    });
  });

  // ── KPI Cards ──
  describe('KPI Cards', () => {
    it('displays total headcount: 5,528', () => {
      renderDashboard();
      const matches = screen.getAllByText('5,528');
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it('displays OMA/PHX breakdown', () => {
      renderDashboard();
      expect(screen.getByText(/OMA: 4,834/)).toBeInTheDocument();
      expect(screen.getByText(/PHX: 694/)).toBeInTheDocument();
    });

    it('displays new hires: 69', () => {
      renderDashboard();
      expect(screen.getByText('69')).toBeInTheDocument();
    });

    it('displays new hire faculty/staff breakdown', () => {
      renderDashboard();
      expect(screen.getByText(/Fac: 31/)).toBeInTheDocument();
      expect(screen.getByText(/Staff: 38/)).toBeInTheDocument();
    });

    it('displays separations: 73', () => {
      renderDashboard();
      expect(screen.getByText('73')).toBeInTheDocument();
    });

    it('displays separation category breakdown', () => {
      renderDashboard();
      // Separation card shows Fac: 4 | Staff: 54 | HSP: 15
      expect(screen.getByText(/Fac: 4/)).toBeInTheDocument();
      expect(screen.getByText(/Staff: 54/)).toBeInTheDocument();
      expect(screen.getByText(/HSP: 15/)).toBeInTheDocument();
    });

    it('displays open requisitions: 143', () => {
      renderDashboard();
      expect(screen.getByText('143')).toBeInTheDocument();
    });
  });

  // ── Workforce Donut Chart ──
  describe('Workforce Donut Chart', () => {
    it('renders all 5 employee type labels', () => {
      renderDashboard();
      expect(screen.getAllByText('Staff').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Faculty').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('HSP').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Student').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Non-Benefit Eligible')).toBeInTheDocument(); // sr-only table
    });

    it('displays center total matching headcount', () => {
      renderDashboard();
      // The donut center label should also show 5,528
      const totals = screen.getAllByText('5,528');
      expect(totals.length).toBeGreaterThanOrEqual(2); // KPI card + donut center
    });

    it('displays individual segment counts', () => {
      renderDashboard();
      // Values appear in donut legend + sr-only table + other sections
      expect(screen.getAllByText('1,419').length).toBeGreaterThanOrEqual(1); // Staff
      expect(screen.getAllByText('697').length).toBeGreaterThanOrEqual(1);   // Faculty
      expect(screen.getAllByText('625').length).toBeGreaterThanOrEqual(1);   // HSP
      expect(screen.getAllByText('2,157').length).toBeGreaterThanOrEqual(1); // Students
      expect(screen.getAllByText('630').length).toBeGreaterThanOrEqual(1);   // NBE
    });
  });

  // ── Talent Movement ──
  describe('Talent Movement', () => {
    it('displays +69 new hires', () => {
      renderDashboard();
      expect(screen.getByText('+69')).toBeInTheDocument();
    });

    it('displays -73 separations', () => {
      renderDashboard();
      expect(screen.getByText('-73')).toBeInTheDocument();
    });

    it('calculates net change correctly (-4)', () => {
      renderDashboard();
      expect(screen.getByText('-4')).toBeInTheDocument();
    });

    it('displays open requisitions in talent movement section', () => {
      renderDashboard();
      expect(screen.getByText('143 Staff Reqs')).toBeInTheDocument();
    });
  });

  // ── Exit Survey ──
  describe('Exit Survey', () => {
    it('displays 15 responses', () => {
      renderDashboard();
      // "15" appears in exit survey responses and HSP separation count
      expect(screen.getAllByText('15').length).toBeGreaterThanOrEqual(1);
    });

    it('displays 20.5% response rate', () => {
      renderDashboard();
      expect(screen.getByText('20.5%')).toBeInTheDocument();
    });

    it('displays 80% recommend', () => {
      renderDashboard();
      expect(screen.getByText('80%')).toBeInTheDocument();
    });

    it('displays top 3 contributing factors', () => {
      renderDashboard();
      expect(screen.getByText(/Unsatisfactory salary\/pay/i)).toBeInTheDocument();
      expect(screen.getByText(/Unrealistic job expectations/i)).toBeInTheDocument();
      expect(screen.getByText(/Dissatisfied with direct supervisor/i)).toBeInTheDocument();
    });

    it('displays factor percentages', () => {
      renderDashboard();
      expect(screen.getByText('40%')).toBeInTheDocument();
      // 33.3% appears twice (two factors share that value)
      const threeThree = screen.getAllByText('33.3%');
      expect(threeThree.length).toBe(2);
    });

    it('displays all 5 satisfaction ratings', () => {
      renderDashboard();
      expect(screen.getByText('Benefits')).toBeInTheDocument();
      expect(screen.getByText('Management')).toBeInTheDocument();
      expect(screen.getByText('Job Satisfaction')).toBeInTheDocument();
      expect(screen.getByText('Compensation')).toBeInTheDocument();
      expect(screen.getByText('Career Dev')).toBeInTheDocument();
    });

    it('displays correct satisfaction values', () => {
      renderDashboard();
      expect(screen.getByText('3.8')).toBeInTheDocument(); // Benefits
      expect(screen.getByText('3.4')).toBeInTheDocument(); // Management
      // 3.2 appears for jobSatisfaction and compensation
      const threeTwo = screen.getAllByText('3.2');
      expect(threeTwo.length).toBeGreaterThanOrEqual(2);
      // 3 appears for careerDevelopment (rendered as "3" not "3.0")
      const threes = screen.getAllByText('3');
      expect(threes.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Benefit-Eligible & Succession ──
  describe('Benefit-Eligible & Succession', () => {
    it('displays faculty: 697', () => {
      renderDashboard();
      const matches = screen.getAllByText('697');
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it('displays staff: 1,419', () => {
      renderDashboard();
      const matches = screen.getAllByText('1,419');
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it('displays faculty QoQ change', () => {
      renderDashboard();
      // (698-689)/689 = +1.3%
      expect(screen.getByText('+1.3%')).toBeInTheDocument();
    });

    it('displays staff QoQ change', () => {
      renderDashboard();
      // (1451-1448)/1448 = +0.2%
      expect(screen.getByText('+0.2%')).toBeInTheDocument();
    });

  });

  // ── Demographics ──
  describe('Demographics', () => {
    it('displays faculty gender percentage', () => {
      renderDashboard();
      expect(screen.getByText('52.9%')).toBeInTheDocument();
    });

    it('displays staff gender percentage', () => {
      renderDashboard();
      expect(screen.getByText('63.1%')).toBeInTheDocument();
    });
  });

  // ── Employee Locations ──
  describe('Employee Locations', () => {
    it('displays employee locations heading', () => {
      renderDashboard();
      expect(screen.getByText('Employee Locations')).toBeInTheDocument();
    });

    it('renders the map container', () => {
      renderDashboard();
      expect(screen.getByTestId('composable-map')).toBeInTheDocument();
    });

    it('displays Nebraska campus callout', () => {
      renderDashboard();
      expect(screen.getByText(/NE: 4,834/)).toBeInTheDocument();
      expect(screen.getByText('(Omaha Campus)')).toBeInTheDocument();
    });

    it('displays Arizona campus callout', () => {
      renderDashboard();
      expect(screen.getByText(/AZ: 694/)).toBeInTheDocument();
      expect(screen.getByText('(Phoenix Campus)')).toBeInTheDocument();
    });

    it('has sr-only data table for map', () => {
      renderDashboard();
      expect(screen.getByText('Employee distribution by campus location')).toBeInTheDocument();
    });
  });

  // ── Data Validation Cross-Checks ──
  describe('Data Validation Cross-Checks', () => {
    it('total separations = sum of termination types', () => {
      const total = mockTurnoverData.summary.total.count;
      const typeSum = mockTurnoverData.terminationTypesByGroup.reduce(
        (sum, g) => sum + g.voluntary + g.involuntary + g.retirement + g.endOfAssignment,
        0
      );
      expect(typeSum).toBe(total);
    });

    it('OMA + PHX = Total headcount', () => {
      const { oma, phx } = mockWorkforceData.summary.total;
      expect(oma + phx).toBe(mockWorkforceData.summary.total.count);
    });

    it('donut segments sum to total', () => {
      const segmentSum =
        mockWorkforceData.summary.staff.count +
        mockWorkforceData.summary.faculty.count +
        mockWorkforceData.summary.houseStaffPhysicians.count +
        mockWorkforceData.summary.studentWorkers.count +
        mockWorkforceData.summary.temporary.count;
      expect(segmentSum).toBe(mockWorkforceData.summary.total.count);
    });

    it('net change = hires - separations', () => {
      const hires = 69; // From NEWHIRE_DATA
      const seps = mockTurnoverData.summary.total.count;
      expect(hires - seps).toBe(-4);
    });

    it('voluntary + involuntary + retirement + endOfAssignment = total per group', () => {
      mockTurnoverData.terminationTypesByGroup.forEach(group => {
        const sum = group.voluntary + group.involuntary + group.retirement + group.endOfAssignment;
        expect(sum).toBe(group.total);
      });
    });
  });

  // ── Key Insights ──
  describe('Key Insights', () => {
    it('generates 3 insight cards', () => {
      renderDashboard();
      const insightsRegion = screen.getByRole('region', { name: /Key insights/i });
      const headings = within(insightsRegion).getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(3);
    });

    it('shows net headcount decline insight (netChange = -4)', () => {
      renderDashboard();
      expect(screen.getByText('Net Headcount Decline')).toBeInTheDocument();
      expect(screen.getByText(/4 more separations than hires/)).toBeInTheDocument();
    });

    it('shows compensation concerns insight (pay is top factor)', () => {
      renderDashboard();
      expect(screen.getByText('Compensation Concerns')).toBeInTheDocument();
      expect(screen.getByText(/40% cite pay as exit factor/)).toBeInTheDocument();
      expect(screen.getByText(/Comp rated 3.2\/5/)).toBeInTheDocument();
    });

    it('shows strong employer brand insight (80% recommend)', () => {
      renderDashboard();
      expect(screen.getByText('Strong Employer Brand')).toBeInTheDocument();
      expect(screen.getByText(/80% would recommend Creighton/)).toBeInTheDocument();
      expect(screen.getByText(/Benefits rated 3.8\/5/)).toBeInTheDocument();
    });

    it('shows moderate brand when recommend is 50-74%', () => {
      getQuarterlyWorkforceData.mockReturnValue(mockWorkforceData);
      getQuarterlyTurnoverData.mockReturnValue(mockTurnoverData);
      getExitSurveyData.mockReturnValue({
        ...mockExitSurveyData,
        wouldRecommend: 60,
      });

      render(
        <BrowserRouter>
          <ExecutiveDashboard />
        </BrowserRouter>
      );

      expect(screen.getByText('Moderate Employer Brand')).toBeInTheDocument();
    });

    it('shows brand at risk when recommend is below 50%', () => {
      getQuarterlyWorkforceData.mockReturnValue(mockWorkforceData);
      getQuarterlyTurnoverData.mockReturnValue(mockTurnoverData);
      getExitSurveyData.mockReturnValue({
        ...mockExitSurveyData,
        wouldRecommend: 40,
      });

      render(
        <BrowserRouter>
          <ExecutiveDashboard />
        </BrowserRouter>
      );

      expect(screen.getByText('Employer Brand at Risk')).toBeInTheDocument();
    });

    it('shows net headcount growth when hires exceed separations', () => {
      getQuarterlyWorkforceData.mockReturnValue(mockWorkforceData);
      getQuarterlyTurnoverData.mockReturnValue({
        ...mockTurnoverData,
        summary: {
          ...mockTurnoverData.summary,
          total: { count: 50, oma: 45, phx: 5 }
        }
      });
      getExitSurveyData.mockReturnValue(mockExitSurveyData);

      render(
        <BrowserRouter>
          <ExecutiveDashboard />
        </BrowserRouter>
      );

      expect(screen.getByText('Net Headcount Growth')).toBeInTheDocument();
    });
  });

  // ── Accessibility ──
  describe('Accessibility', () => {
    it('has proper heading hierarchy (h1 > h2 > h3)', () => {
      renderDashboard();
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('HR Executive Dashboard');

      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThanOrEqual(4); // KPI titles + section headers

      const h3s = screen.getAllByRole('heading', { level: 3 });
      expect(h3s.length).toBeGreaterThanOrEqual(3); // Insight titles + sub-sections
    });

    it('has sr-only data table for donut chart', () => {
      renderDashboard();
      expect(screen.getByText('Workforce breakdown by employee type')).toBeInTheDocument();
    });

    it('has aria-label on quarter selector', () => {
      renderDashboard();
      expect(screen.getByLabelText('Select quarter')).toBeInTheDocument();
    });

    it('has aria labels on KPI region', () => {
      renderDashboard();
      expect(screen.getByRole('region', { name: /Key performance indicators/i })).toBeInTheDocument();
    });

    it('has aria labels on insights region', () => {
      renderDashboard();
      expect(screen.getByRole('region', { name: /Key insights/i })).toBeInTheDocument();
    });
  });
});
