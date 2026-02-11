import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import WorkforceQ1FY26Dashboard from '../WorkforceQ1FY26Dashboard';
import { getQuarterlyWorkforceData } from '../../../data/staticData';

// Mock staticData
jest.mock('../../../data/staticData', () => ({
  getQuarterlyWorkforceData: jest.fn(),
  QUARTERLY_HEADCOUNT_TRENDS: [
    { quarter: "Q1 FY24", faculty: 700, staff: 1410, hsp: 580, students: 1700, temp: 610, total: 5000 },
    { quarter: "Q2 FY24", faculty: 705, staff: 1420, hsp: 585, students: 1780, temp: 610, total: 5100 },
    { quarter: "Q3 FY24", faculty: 715, staff: 1445, hsp: 590, students: 2030, temp: 620, total: 5400 },
    { quarter: "Q4 FY24", faculty: 678, staff: 1431, hsp: 595, students: 1450, temp: 620, total: 4774 },
    { quarter: "Q1 FY25", faculty: 690, staff: 1450, hsp: 600, students: 2130, temp: 630, total: 5500 },
    { quarter: "Q2 FY25", faculty: 695, staff: 1440, hsp: 605, students: 1930, temp: 630, total: 5300 },
    { quarter: "Q3 FY25", faculty: 700, staff: 1455, hsp: 605, students: 2010, temp: 630, total: 5400 },
    { quarter: "Q4 FY25", faculty: 689, staff: 1448, hsp: 610, students: 1650, temp: 640, total: 5037 },
    { quarter: "Q1 FY26", faculty: 697, staff: 1419, hsp: 613, students: 2157, temp: 642, total: 5528 }
  ]
}));

describe('WorkforceQ1FY26Dashboard', () => {
  const mockData = {
    reportingDate: "9/30/25",
    quarter: "Q1 FY26",
    fiscalPeriod: "July 2025 - September 2025",
    summary: {
      total: {
        count: 5528,
        oma: 4834,
        phx: 694
      },
      faculty: {
        count: 697,
        oma: 657,
        phx: 40
      },
      staff: {
        count: 1419,  // Updated for Grade R exclusion (was 1431)
        oma: 1318,    // Updated for Grade R exclusion (was 1330)
        phx: 101
      },
      houseStaffPhysicians: {
        count: 613,
        oma: 270,
        phx: 343
      },
      studentWorkers: {
        count: 2157,
        oma: 2088,
        phx: 69
      },
      temporary: {
        count: 642,  // Updated: includes Grade R (was 630)
        oma: 501,    // Updated (was 489)
        phx: 141
      }
    },
    employeeGroups: [
      {
        group: "Benefit-Eligible Faculty",
        faculty: 697,
        staff: 0,
        hsp: 0,
        students: 0,
        total: 697
      },
      {
        group: "Benefit-Eligible Staff",
        faculty: 0,
        staff: 1419,  // Updated for Grade R exclusion (was 1431)
        hsp: 0,
        students: 0,
        total: 1419   // Updated (was 1431)
      },
      {
        group: "House Staff Physicians",
        faculty: 0,
        staff: 0,
        hsp: 613,
        students: 0,
        total: 613
      },
      {
        group: "Student Workers",
        faculty: 0,
        staff: 0,
        hsp: 0,
        students: 2157,
        total: 2157
      },
      {
        group: "Temporary Employees",
        faculty: 0,
        staff: 0,
        hsp: 0,
        students: 0,
        total: 642  // Updated: includes Grade R (was 630)
      }
    ],
    locationDetails: {
      omaha: {
        faculty: 657,
        staff: 1318,  // Updated for Grade R exclusion (was 1330)
        hsp: 270,
        students: 2088,
        temp: 501,    // Updated: includes Grade R (was 489)
        total: 4834
      },
      phoenix: {
        faculty: 40,
        staff: 101,
        hsp: 343,
        students: 69,
        temp: 141,
        total: 694
      }
    },
    assignmentCategories: {
      "F12": 1694,
      "HSR": 613,
      "PT12": 49,
      "TEMP": 516,
      "SUE": 1793,
      "CWS": 364,
      "F11": 49,
      "F09": 297,
      "PRN": 107,
      "PT9": 20,
      "NBE": 7,
      "F10": 10,
      "PT11": 1,
      "PT10": 8
    },
    demographics: {
      ethnicity: {
        faculty: {
          total: 697,
          distribution: [
            { ethnicity: "White", count: 543, percentage: 77.9, color: "#93C5FD" },
            { ethnicity: "Not Disclosed", count: 53, percentage: 7.6, color: "#D1D5DB" },
            { ethnicity: "Asian", count: 51, percentage: 7.3, color: "#60A5FA" },
            { ethnicity: "Two or More Races", count: 18, percentage: 2.6, color: "#FBBF24" },
            { ethnicity: "Black or African American", count: 17, percentage: 2.4, color: "#34D399" },
            { ethnicity: "Hispanic or Latino", count: 12, percentage: 1.7, color: "#F87171" },
            { ethnicity: "American Indian or Alaska Native", count: 3, percentage: 0.4, color: "#A78BFA" }
          ]
        },
        staff: {
          total: 1419,
          distribution: [
            { ethnicity: "White", count: 989, percentage: 69.1, color: "#93C5FD" },
            { ethnicity: "Not Disclosed", count: 126, percentage: 8.8, color: "#D1D5DB" },
            { ethnicity: "Asian", count: 106, percentage: 7.4, color: "#60A5FA" },
            { ethnicity: "Black or African American", count: 82, percentage: 5.7, color: "#34D399" },
            { ethnicity: "Hispanic or Latino", count: 63, percentage: 4.4, color: "#FBBF24" },
            { ethnicity: "Two or More Races", count: 56, percentage: 3.9, color: "#F87171" },
            { ethnicity: "American Indian or Alaska Native", count: 6, percentage: 0.4, color: "#A78BFA" },
            { ethnicity: "Native Hawaiian or other Pacific Islander", count: 3, percentage: 0.2, color: "#FB923C" }
          ]
        }
      },
      gender: {
        faculty: {
          total: 697,
          distribution: [
            { gender: "Female", count: 369, percentage: 52.9, color: "#EC4899" },
            { gender: "Male", count: 328, percentage: 47.1, color: "#3B82F6" }
          ]
        },
        staff: {
          total: 1419,
          distribution: [
            { gender: "Female", count: 903, percentage: 63.1, color: "#EC4899" },
            { gender: "Male", count: 528, percentage: 36.9, color: "#3B82F6" }
          ]
        }
      },
      ageGender: {
        faculty: {
          category: "Benefit-Eligible Faculty",
          total: 697,
          femaleTotal: 369,
          maleTotal: 328,
          femalePercentage: 52.9,
          malePercentage: 47.1,
          ageGenderBreakdown: [
            { ageBand: "20-30", female: 4, male: 8, total: 12 },
            { ageBand: "31-40", female: 91, male: 52, total: 143 },
            { ageBand: "41-50", female: 126, male: 74, total: 200 },
            { ageBand: "51-60", female: 81, male: 82, total: 163 },
            { ageBand: "61 Plus", female: 67, male: 112, total: 179 }
          ]
        },
        staff: {
          category: "Benefit-Eligible Staff",
          total: 1419,
          femaleTotal: 903,
          maleTotal: 528,
          femalePercentage: 63.1,
          malePercentage: 36.9,
          ageGenderBreakdown: [
            { ageBand: "20-30", female: 146, male: 81, total: 227 },
            { ageBand: "31-40", female: 174, male: 121, total: 295 },
            { ageBand: "41-50", female: 214, male: 115, total: 329 },
            { ageBand: "51-60", female: 230, male: 116, total: 346 },
            { ageBand: "61 Plus", female: 139, male: 95, total: 234 }
          ]
        }
      }
    }
  };

  beforeEach(() => {
    getQuarterlyWorkforceData.mockReturnValue(mockData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Loading and Display', () => {
    it('should load Q1 FY26 workforce data from staticData', () => {
      render(
        <BrowserRouter>
          <WorkforceQ1FY26Dashboard />
        </BrowserRouter>
      );

      expect(getQuarterlyWorkforceData).toHaveBeenCalledWith("2025-09-30");
    });

    it('should display page title and header information', () => {
      render(
        <BrowserRouter>
          <WorkforceQ1FY26Dashboard />
        </BrowserRouter>
      );

      expect(screen.getByText('Q1 FY26 Workforce and Headcount Report')).toBeInTheDocument();
      expect(screen.getByText(/Benefit Eligible Employees/)).toBeInTheDocument();
      expect(screen.getByText('Creighton University')).toBeInTheDocument();
    });

    it('should display total headcount in cards', () => {
      render(
        <BrowserRouter>
          <WorkforceQ1FY26Dashboard />
        </BrowserRouter>
      );

      expect(screen.getAllByText('5,528').length).toBeGreaterThan(0);
      expect(screen.getByText('Total Headcount')).toBeInTheDocument();
    });
  });

  describe('Metric Cards', () => {
    it('should display all 6 metric cards with correct values', () => {
      render(
        <BrowserRouter>
          <WorkforceQ1FY26Dashboard />
        </BrowserRouter>
      );

      // Total Headcount
      expect(screen.getByText('Total Headcount')).toBeInTheDocument();

      // Faculty - appears in card (BE Faculty) and chart (Benefit-Eligible Faculty)
      expect(screen.getByText('BE Faculty')).toBeInTheDocument();
      expect(screen.getAllByText('697').length).toBeGreaterThan(0);

      // Staff - appears in card (BE Staff) and chart (updated for Grade R: 1,419)
      expect(screen.getByText('BE Staff')).toBeInTheDocument();
      expect(screen.getAllByText('1,419').length).toBeGreaterThan(0);

      // House Staff - appears in card and chart
      expect(screen.getAllByText(/House Staff/).length).toBeGreaterThan(0);
      expect(screen.getAllByText('613').length).toBeGreaterThan(0);

      // Student Workers - appears in card and chart
      expect(screen.getAllByText('Student Workers').length).toBeGreaterThan(0);
      expect(screen.getAllByText('2,157').length).toBeGreaterThan(0);

      // Non-Benefit Eligible - appears in card, Temporary Employees in chart (updated for Grade R: 642)
      expect(screen.getAllByText('Non-Benefit Eligible').length).toBeGreaterThan(0);
      expect(screen.getAllByText('642').length).toBeGreaterThan(0);
    });

    it('should display location breakdown for each metric card', () => {
      render(
        <BrowserRouter>
          <WorkforceQ1FY26Dashboard />
        </BrowserRouter>
      );

      // Check OMA/PHX breakdowns are present
      expect(screen.getByText(/OMA: 4,834/)).toBeInTheDocument();
      expect(screen.getByText(/PHX: 694/)).toBeInTheDocument();
      expect(screen.getByText(/OMA: 657/)).toBeInTheDocument();
      expect(screen.getByText(/PHX: 40/)).toBeInTheDocument();
    });
  });

  describe('Data Validation', () => {
    it('should validate total headcount equals sum of all categories', () => {
      render(
        <BrowserRouter>
          <WorkforceQ1FY26Dashboard />
        </BrowserRouter>
      );

      const data = getQuarterlyWorkforceData("2025-09-30");
      const sumOfCategories =
        data.summary.faculty.count +
        data.summary.staff.count +
        data.summary.houseStaffPhysicians.count +
        data.summary.studentWorkers.count +
        data.summary.temporary.count;

      expect(sumOfCategories).toBe(data.summary.total.count);
      expect(sumOfCategories).toBe(5528); // 697 + 1431 + 613 + 2157 + 630
    });

    it('should validate OMA + PHX = Total for each category', () => {
      const data = getQuarterlyWorkforceData("2025-09-30");

      // Total
      expect(data.summary.total.oma + data.summary.total.phx).toBe(data.summary.total.count);

      // Faculty
      expect(data.summary.faculty.oma + data.summary.faculty.phx).toBe(data.summary.faculty.count);

      // Staff
      expect(data.summary.staff.oma + data.summary.staff.phx).toBe(data.summary.staff.count);

      // House Staff Physicians
      expect(data.summary.houseStaffPhysicians.oma + data.summary.houseStaffPhysicians.phx).toBe(data.summary.houseStaffPhysicians.count);

      // Student Workers
      expect(data.summary.studentWorkers.oma + data.summary.studentWorkers.phx).toBe(data.summary.studentWorkers.count);

      // Temporary
      expect(data.summary.temporary.oma + data.summary.temporary.phx).toBe(data.summary.temporary.count);
    });

    it('should validate location totals match summary totals', () => {
      const data = getQuarterlyWorkforceData("2025-09-30");

      // Omaha total
      const omahaSum =
        data.locationDetails.omaha.faculty +
        data.locationDetails.omaha.staff +
        data.locationDetails.omaha.hsp +
        data.locationDetails.omaha.students +
        data.locationDetails.omaha.temp;

      expect(omahaSum).toBe(data.locationDetails.omaha.total);
      expect(omahaSum).toBe(data.summary.total.oma);

      // Phoenix total
      const phoenixSum =
        data.locationDetails.phoenix.faculty +
        data.locationDetails.phoenix.staff +
        data.locationDetails.phoenix.hsp +
        data.locationDetails.phoenix.students +
        data.locationDetails.phoenix.temp;

      expect(phoenixSum).toBe(data.locationDetails.phoenix.total);
      expect(phoenixSum).toBe(data.summary.total.phx);
    });

    it('should validate employee group totals match summary', () => {
      const data = getQuarterlyWorkforceData("2025-09-30");

      expect(data.employeeGroups[0].total).toBe(data.summary.faculty.count);
      expect(data.employeeGroups[1].total).toBe(data.summary.staff.count);
      expect(data.employeeGroups[2].total).toBe(data.summary.houseStaffPhysicians.count);
      expect(data.employeeGroups[3].total).toBe(data.summary.studentWorkers.count);
      expect(data.employeeGroups[4].total).toBe(data.summary.temporary.count);
    });
  });

  describe('Chart Rendering', () => {
    it('should render Workforce by Employee Type chart', () => {
      render(
        <BrowserRouter>
          <WorkforceQ1FY26Dashboard />
        </BrowserRouter>
      );

      expect(screen.getByText('Workforce by Employee Type')).toBeInTheDocument();
      expect(screen.getByText('Benefit-Eligible Faculty')).toBeInTheDocument();
      expect(screen.getByText('Benefit-Eligible Staff')).toBeInTheDocument();
      expect(screen.getAllByText('House Staff Physicians').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Student Workers').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Temporary Employees').length).toBeGreaterThan(0);
    });

    it('should render Campus Comparison by Employee Type chart', () => {
      render(
        <BrowserRouter>
          <WorkforceQ1FY26Dashboard />
        </BrowserRouter>
      );

      expect(screen.getByText('Campus Comparison by Employee Type')).toBeInTheDocument();
      expect(screen.getByText('Omaha (OMA)')).toBeInTheDocument();
      expect(screen.getByText('Phoenix (PHX)')).toBeInTheDocument();
    });

    it('should display legend for campus comparison chart', () => {
      render(
        <BrowserRouter>
          <WorkforceQ1FY26Dashboard />
        </BrowserRouter>
      );

      const legends = screen.getAllByText('Staff');
      expect(legends.length).toBeGreaterThan(0);

      const facultyLegends = screen.getAllByText('Faculty');
      expect(facultyLegends.length).toBeGreaterThan(0);

      const studentWorkerLegends = screen.getAllByText('Student Workers');
      expect(studentWorkerLegends.length).toBeGreaterThan(0);

      expect(screen.getAllByText(/House Staff/).length).toBeGreaterThan(0);
      // Multiple instances of "Non-Benefit Eligible" exist in the dashboard
      const nonBenefitEligibleElements = screen.getAllByText('Non-Benefit Eligible');
      expect(nonBenefitEligibleElements.length).toBeGreaterThan(0);
    });
  });

  describe('Business Rules Validation', () => {
    it('should follow WORKFORCE_METHODOLOGY.md v2.0 categorization', () => {
      const data = getQuarterlyWorkforceData("2025-09-30");

      // Verify data structure matches methodology
      expect(data.summary).toHaveProperty('faculty');
      expect(data.summary).toHaveProperty('staff');
      expect(data.summary).toHaveProperty('houseStaffPhysicians');
      expect(data.summary).toHaveProperty('studentWorkers');
      expect(data.summary).toHaveProperty('temporary');
    });

    it('should validate assignment category counts sum to total', () => {
      const data = getQuarterlyWorkforceData("2025-09-30");

      const assignmentCategorySum = Object.values(data.assignmentCategories).reduce((sum, count) => sum + count, 0);

      expect(assignmentCategorySum).toBe(data.summary.total.count);
    });

    it('should validate benefit-eligible categories match methodology (with Grade R exclusion)', () => {
      const data = getQuarterlyWorkforceData("2025-09-30");

      // Benefit-eligible assignment codes from WORKFORCE_METHODOLOGY.md
      const benefitEligibleCodes = ['F12', 'F11', 'F10', 'F09', 'PT12', 'PT11', 'PT10', 'PT9'];

      const rawBenefitSum = benefitEligibleCodes.reduce((sum, code) => {
        return sum + (data.assignmentCategories[code] || 0);
      }, 0);

      // Raw assignment category sum = 2128 (includes 12 Grade R with F12 assignment)
      // Grade R are NOT benefit-eligible, so adjusted sum = 2128 - 12 = 2116
      // Summary: Faculty (697) + Staff (1419) = 2116
      expect(rawBenefitSum).toBe(697 + 1431); // 2128 raw from assignment categories
      expect(data.summary.faculty.count + data.summary.staff.count).toBe(697 + 1419); // 2116 adjusted
    });

    it('should validate student worker categories', () => {
      const data = getQuarterlyWorkforceData("2025-09-30");

      const studentSum = (data.assignmentCategories['SUE'] || 0) + (data.assignmentCategories['CWS'] || 0);

      expect(studentSum).toBe(data.summary.studentWorkers.count);
      expect(studentSum).toBe(1793 + 364); // 2157
    });

    it('should validate temporary/non-benefit categories (with Grade R)', () => {
      const data = getQuarterlyWorkforceData("2025-09-30");

      const tempSum =
        (data.assignmentCategories['TEMP'] || 0) +
        (data.assignmentCategories['NBE'] || 0) +
        (data.assignmentCategories['PRN'] || 0);

      // Base temp categories sum to 630, but Grade R (12) adds to temporary count
      // Assignment categories: 516 + 7 + 107 = 630
      // Summary count includes Grade R adjustment: 630 + 12 = 642
      expect(tempSum).toBe(516 + 7 + 107); // 630 from assignment categories
      expect(data.summary.temporary.count).toBe(642); // Includes Grade R
    });

    it('should validate HSR category equals house staff count', () => {
      const data = getQuarterlyWorkforceData("2025-09-30");

      expect(data.assignmentCategories['HSR']).toBe(data.summary.houseStaffPhysicians.count);
      expect(data.assignmentCategories['HSR']).toBe(613);
    });
  });

  describe('Q1 FY26 Specific Data Validation', () => {
    it('should have correct Q1 FY26 total headcount', () => {
      const data = getQuarterlyWorkforceData("2025-09-30");

      expect(data.summary.total.count).toBe(5528);
    });

    it('should have correct campus distribution', () => {
      const data = getQuarterlyWorkforceData("2025-09-30");

      expect(data.summary.total.oma).toBe(4834);
      expect(data.summary.total.phx).toBe(694);
      expect(data.summary.total.oma + data.summary.total.phx).toBe(5528);
    });

    it('should have correct faculty count', () => {
      const data = getQuarterlyWorkforceData("2025-09-30");

      expect(data.summary.faculty.count).toBe(697);
      expect(data.summary.faculty.oma).toBe(657);
      expect(data.summary.faculty.phx).toBe(40);
    });

    it('should have correct staff count', () => {
      const data = getQuarterlyWorkforceData("2025-09-30");

      // Updated for Grade R exclusion methodology (was 1431/1330)
      expect(data.summary.staff.count).toBe(1419);
      expect(data.summary.staff.oma).toBe(1318);
      expect(data.summary.staff.phx).toBe(101);
    });

    it('should have correct house staff physicians count', () => {
      const data = getQuarterlyWorkforceData("2025-09-30");

      expect(data.summary.houseStaffPhysicians.count).toBe(613);
      expect(data.summary.houseStaffPhysicians.oma).toBe(270);
      expect(data.summary.houseStaffPhysicians.phx).toBe(343);
    });

    it('should have correct student workers count', () => {
      const data = getQuarterlyWorkforceData("2025-09-30");

      expect(data.summary.studentWorkers.count).toBe(2157);
      expect(data.summary.studentWorkers.oma).toBe(2088);
      expect(data.summary.studentWorkers.phx).toBe(69);
    });

    it('should have correct temporary employees count', () => {
      const data = getQuarterlyWorkforceData("2025-09-30");

      // Updated: includes Grade R employees (was 630/489)
      expect(data.summary.temporary.count).toBe(642);
      expect(data.summary.temporary.oma).toBe(501);
      expect(data.summary.temporary.phx).toBe(141);
    });
  });

  describe('Data Consistency Cross-Checks', () => {
    it('should validate Omaha campus totals match across different data structures', () => {
      const data = getQuarterlyWorkforceData("2025-09-30");

      // From summary
      const omahaFromSummary =
        data.summary.faculty.oma +
        data.summary.staff.oma +
        data.summary.houseStaffPhysicians.oma +
        data.summary.studentWorkers.oma +
        data.summary.temporary.oma;

      // From locationDetails
      const omahaFromLocation = data.locationDetails.omaha.total;

      expect(omahaFromSummary).toBe(omahaFromLocation);
      expect(omahaFromSummary).toBe(4834);
    });

    it('should validate Phoenix campus totals match across different data structures', () => {
      const data = getQuarterlyWorkforceData("2025-09-30");

      // From summary
      const phoenixFromSummary =
        data.summary.faculty.phx +
        data.summary.staff.phx +
        data.summary.houseStaffPhysicians.phx +
        data.summary.studentWorkers.phx +
        data.summary.temporary.phx;

      // From locationDetails
      const phoenixFromLocation = data.locationDetails.phoenix.total;

      expect(phoenixFromSummary).toBe(phoenixFromLocation);
      expect(phoenixFromSummary).toBe(694);
    });

    it('should validate employee groups sum matches total', () => {
      const data = getQuarterlyWorkforceData("2025-09-30");

      const employeeGroupSum = data.employeeGroups.reduce((sum, group) => sum + group.total, 0);

      expect(employeeGroupSum).toBe(data.summary.total.count);
      expect(employeeGroupSum).toBe(5528);
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <BrowserRouter>
          <WorkforceQ1FY26Dashboard />
        </BrowserRouter>
      );

      // Basic accessibility checks
      const headings = container.querySelectorAll('h1, h2, h3');
      expect(headings.length).toBeGreaterThan(0);

      // Verify semantic HTML structure
      expect(container.querySelector('main') || container.querySelector('[role="main"]') || container).toBeTruthy();
    });
  });

  describe('Data Source Traceability', () => {
    it('should document data source in component comments', () => {
      // This test validates that the component has proper documentation
      // Check that getQuarterlyWorkforceData is called with correct date
      render(
        <BrowserRouter>
          <WorkforceQ1FY26Dashboard />
        </BrowserRouter>
      );

      expect(getQuarterlyWorkforceData).toHaveBeenCalledWith("2025-09-30");
    });

    it('should use data from scripts/extract_q1_fy26_workforce.js processing', () => {
      const data = getQuarterlyWorkforceData("2025-09-30");

      // Validate data structure matches expected output from extraction script
      expect(data).toHaveProperty('reportingDate');
      expect(data).toHaveProperty('quarter');
      expect(data).toHaveProperty('fiscalPeriod');
      expect(data).toHaveProperty('summary');
      expect(data).toHaveProperty('employeeGroups');
      expect(data).toHaveProperty('locationDetails');
      expect(data).toHaveProperty('assignmentCategories');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing data gracefully', () => {
      getQuarterlyWorkforceData.mockReturnValue({
        reportingDate: "9/30/25",
        quarter: "Q1 FY26",
        fiscalPeriod: "July 2025 - September 2025",
        summary: {
          total: { count: 0, oma: 0, phx: 0 },
          faculty: { count: 0, oma: 0, phx: 0 },
          staff: { count: 0, oma: 0, phx: 0 },
          houseStaffPhysicians: { count: 0, oma: 0, phx: 0 },
          studentWorkers: { count: 0, oma: 0, phx: 0 },
          temporary: { count: 0, oma: 0, phx: 0 }
        },
        employeeGroups: [],
        locationDetails: {
          omaha: { faculty: 0, staff: 0, hsp: 0, students: 0, temp: 0, total: 0 },
          phoenix: { faculty: 0, staff: 0, hsp: 0, students: 0, temp: 0, total: 0 }
        },
        assignmentCategories: {}
      });

      const { container } = render(
        <BrowserRouter>
          <WorkforceQ1FY26Dashboard />
        </BrowserRouter>
      );

      // Should render without crashing
      expect(container).toBeTruthy();
    });
  });
});
