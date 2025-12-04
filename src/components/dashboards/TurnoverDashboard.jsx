import React from 'react';
import SummaryCard from '../ui/SummaryCard';
import TurnoverRatesTable from '../charts/TurnoverRatesTable';
import FacultyTurnoverByDivisionChart from '../charts/FacultyTurnoverByDivisionChart';
import FacultyStaffTurnoverByFYChart from '../charts/FacultyStaffTurnoverByFYChart';
import TurnoverByLengthOfServiceChart from '../charts/TurnoverByLengthOfServiceChart';
import VoluntaryInvoluntaryTurnoverChart from '../charts/VoluntaryInvoluntaryTurnoverChart';
import TurnoverDeviationChart from '../charts/TurnoverDeviationChart';
import FacultyTurnoverDeviationChart from '../charts/FacultyTurnoverDeviationChart';
import FacultyRetirementAnalysis from '../charts/FacultyRetirementAnalysis';
import StaffRetirementAnalysis from '../charts/StaffRetirementAnalysis';
import RetirementsByFiscalYear from '../charts/RetirementsByFiscalYear';
// Quarter filter removed - using fixed reporting period
import ErrorBoundary from '../ui/ErrorBoundary';
import PDFExportButton from '../ui/PDFExportButton';
import { getTurnoverData } from '../../data/staticData';
import { 
  TrendingDown, 
  DollarSign, 
  BookOpen,
  Building2,
  AlertTriangle,
  Info,
  Clock
} from 'lucide-react';

// Simplified fallback data for consistent dashboard display - 6/30/2025
const FALLBACK_DATA = {
  summary: {
    overallTurnoverRate: 2.2,
    totalDepartures: 62,
    turnoverRateChange: -10.3,
    facultyTurnoverRate: 1.7,
    facultyDepartures: 21,
    facultyTurnoverChange: -7.1,
    staffTurnoverRate: 2.9,
    staffDepartures: 41,
    staffTurnoverChange: -12.4,
    totalCostImpact: 1500000,
    avgCostPerDeparture: 24200,
    costImpactChange: -75.0,
    avgTenure: "TBD"
  },
  charts: {
    voluntaryReasons: [
      { name: 'Career Advancement', value: 109, percentage: 38 },
      { name: 'Compensation', value: 60, percentage: 21 },
      { name: 'Work-Life Balance', value: 49, percentage: 17 },
      { name: 'Retirement', value: 34, percentage: 12 },
      { name: 'Relocation', value: 23, percentage: 8 },
      { name: 'Other', value: 11, percentage: 4 }
    ],
    tenureAnalysis: [
      { name: '< 1 Year', value: 100, percentage: 35 },
      { name: '1-3 Years', value: 83, percentage: 29 },
      { name: '3-5 Years', value: 52, percentage: 18 },
      { name: '5-10 Years', value: 29, percentage: 10 },
      { name: '10+ Years', value: 23, percentage: 8 }
    ],
    gradeClassification: [
      { name: 'Faculty', value: 89, turnoverRate: 7.4 },
      { name: 'Professional Staff', value: 156, turnoverRate: 11.2 },
      { name: 'Support Staff', value: 22, turnoverRate: 8.9 },
      { name: 'Executive', value: 8, turnoverRate: 17.8 },
      { name: 'Student Workers', value: 12, turnoverRate: 15.7 }
    ],
    historicalTrends: [
      { period: 'FY2020', overall: 14.2, faculty: 9.1, staff: 17.8 },
      { period: 'FY2021', overall: 13.8, faculty: 8.9, staff: 16.9 },
      { period: 'FY2022', overall: 13.1, faculty: 8.5, staff: 16.2 },
      { period: 'FY2023', overall: 12.9, faculty: 8.7, staff: 15.8 },
      { period: 'FY2024', overall: 12.5, faculty: 8.8, staff: 15.3 }
    ],
    turnoverBySchool: [
      { name: 'Arts & Sciences', value: 11 },
      { name: 'Athletics', value: 4 },
      { name: 'CFE', value: 2 },
      { name: 'Dentistry', value: 5 },
      { name: 'Facilities', value: 7 },
      { name: 'GENC', value: 2 },
      { name: 'Heider College of Business', value: 3 },
      { name: 'Law School', value: 2 },
      { name: 'Medicine', value: 5 },
      { name: 'Nursing', value: 3 },
      { name: 'Pharmacy & Health Professions', value: 5 },
      { name: 'Provost', value: 1 },
      { name: 'Public Safety', value: 2 },
      { name: 'Research', value: 1 },
      { name: 'UCOM', value: 1 },
      { name: 'Enrollment Management', value: 1 },
      { name: 'VPGE', value: 1 },
      { name: 'Information Technology', value: 3 },
      { name: 'Student Life', value: 3 }
    ],
    topExitReasons: [
      { reason: 'Resigned', total: 25, percentage: 40.3, faculty: 3, staff: 22 },
      { reason: 'Retirement', total: 14, percentage: 22.6, faculty: 9, staff: 5 },
      { reason: 'End Assignment', total: 9, percentage: 14.5, faculty: 7, staff: 2 },
      { reason: 'Better Opportunity', total: 5, percentage: 8.1, faculty: 0, staff: 5 },
      { reason: 'Invol Performance', total: 3, percentage: 4.8, faculty: 1, staff: 2 },
      { reason: 'Personal Reasons', total: 2, percentage: 3.2, faculty: 0, staff: 2 },
      { reason: 'Relocation', total: 2, percentage: 3.2, faculty: 0, staff: 2 },
      { reason: 'Death', total: 1, percentage: 1.6, faculty: 1, staff: 0 },
      { reason: 'Reduction In Force', total: 1, percentage: 1.6, faculty: 0, staff: 1 }
    ],
    
    // Employee reported turnover reasons
    employeeReportedTurnoverReasons: [
      { reason: 'Career Advancement', total: 40, percentage: 28, faculty: 5, staff: 35 },
      { reason: 'Compensation', total: 31, percentage: 22, faculty: 3, staff: 28 },
      { reason: 'Supervisor Issues', total: 26, percentage: 18, faculty: 3, staff: 23 },
      { reason: 'Work-Life Balance', total: 21, percentage: 15, faculty: 4, staff: 17 },
      { reason: 'Retirement', total: 17, percentage: 12, faculty: 3, staff: 14 },
      { reason: 'Other', total: 7, percentage: 5, faculty: 0, staff: 7 }
    ]
  },
  benchmarks: {
    overall: { creighton: 12.5, industry: 14.2 },
    faculty: { creighton: 8.8, industry: 11.1 },
    staff: { creighton: 15.3, industry: 16.8 }
  },
  metrics: {
    highRiskDepartments: [
      { name: 'Information Technology', turnoverRate: 18.5, riskLevel: 'High' },
      { name: 'Marketing', turnoverRate: 16.2, riskLevel: 'High' },
      { name: 'Human Resources', turnoverRate: 14.8, riskLevel: 'Medium' },
      { name: 'Facilities', turnoverRate: 13.9, riskLevel: 'Medium' }
    ],
    retention: {
      avgTimeToFill: 45,
      exitInterviewRate: 87,
      preventableTurnover: 34,
      retentionRate: 87.5
    },
    historical: {
      fiveYearAverage: 13.2,
      trend: 'downward',
      bestYear: { rate: 10.1, year: '2019' }
    }
  }
};

// Helper function to safely format numbers
const safeToFixed = (value, decimals = 1) => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value.toFixed(decimals);
  }
  return '0.0';
};

const TurnoverDashboard = () => {
  // Static data for 6/30/25 reporting period only
  const currentData = getTurnoverData("2025-06-30"); // Current period  
  const previousData = getTurnoverData("2025-03-31"); // For percentage calculations

  // Calculate percentage changes using previous period
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100);
  };
  
  // Transform static data to match dashboard structure
  const data = {
    summary: {
      totalDepartures: currentData.terminations,
      overallTurnoverRate: currentData.totalTurnoverRate,
      turnoverRateChange: calculateChange(currentData.terminations, previousData.terminations),
      facultyTurnoverRate: currentData.facultyTurnoverRate,
      facultyDepartures: Math.round(currentData.terminations * 0.3), // Estimate based on faculty percentage
      facultyTurnoverChange: calculateChange(currentData.facultyTurnoverRate, previousData.facultyTurnoverRate),
      staffTurnoverRate: currentData.staffTurnoverRate,
      staffDepartures: Math.round(currentData.terminations * 0.7), // Estimate based on staff percentage
      staffTurnoverChange: calculateChange(currentData.staffTurnoverRate, previousData.staffTurnoverRate),
      totalCostImpact: 1620000, // Static estimate
      avgCostPerDeparture: Math.round(1620000 / currentData.terminations),
      costImpactChange: -5.2, // Static estimate
      avgTenure: "TBD"
    },
    charts: {
      topExitReasons: currentData.exitReasons,
      turnoverBySchool: currentData.schoolTurnover.map(school => ({
        name: school.school,
        value: school.departures
      })),
      facultyTurnoverByDivision: currentData.facultyTurnoverByDivision || [],
      facultyStaffTurnoverByFY: [
        { fiscalYear: 'FY2022', rate: 14.5 },
        { fiscalYear: 'FY2023', rate: 14.9 },
        { fiscalYear: 'FY2024', rate: 12.8 },
        { fiscalYear: 'FY2025', rate: 11.2 }
      ],
      monthlyTrends: currentData.monthlyTrends,
      turnoverByLengthOfService: currentData.turnoverByLengthOfService || { faculty: [], staff: [] }
    }
  };
  
  const filters = { fiscalYear: '2025' };

  // Enhanced subtitle with data source
  const dataSource = 'Static Data';
  const subtitle = `FY ${filters.fiscalYear || '2025'} | 📊 Cached (${dataSource})`;

  // Validate data structure to prevent object rendering errors
  if (!data || typeof data !== 'object') {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Data Error</h2>
          <p className="text-red-600">Invalid data structure detected. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div id="turnover-dashboard" data-dashboard-content className="min-h-screen bg-gray-50 py-8 dashboard-container print:bg-white print:py-0">
        <div className="max-w-7xl mx-auto px-4 print:max-w-none print:px-0 print:mx-0">
          {/* PDF Export Wrapper - Contains all content for export */}
          <div id="turnover-dashboard-pdf" className="dashboard-content">
            {/* Header with Title Above Filters */}
            <div className="mb-6">
              {/* Title Section */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingDown style={{color: '#0054A6'}} size={24} />
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Turnover Dashboard - Benefit Eligible</h1>
                      <p className="text-gray-600 text-sm mt-1">
                        Reporting Period: 6/30/2024 - 6/30/2025
                      </p>
                    </div>
                  </div>
                  {/* Export Controls */}
                  <div className="flex items-center gap-3 no-pdf">
                    <PDFExportButton
                      dashboardType="turnover"
                      elementId="turnover-dashboard-pdf"
                      defaultOrientation="landscape"
                      title="Export PDF"
                      customHeader={{
                        title: "Employee Turnover Analytics - FY 2025",
                        subtitle: "Reporting Period: 6/30/2024 - 6/30/2025"
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

          {/* Data Coverage Information Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 print:bg-white print:border-gray-300">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-600 print:text-black mt-0.5" aria-hidden="true" />
              </div>
              <div className="flex-grow">
                <h3 className="text-sm font-semibold text-blue-800 print:text-black mb-1">
                  Data Coverage Information
                </h3>
                <p className="text-sm text-blue-700 print:text-black leading-relaxed">
                  The turnover data presented in this report comprises benefit-eligible Full-Time and Part-Time employees only, not including HSP's or Temporary employees.
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:gap-2 mb-6 print:mb-4">
        <SummaryCard
          title="Total Turnover"
          value="11.2%"
          change={-1.6}
          changeType="percentage"
          subtitle="12.8% in FY 2024"
          icon={TrendingDown}
          trend="positive"
        />
        
        <SummaryCard
          title="Faculty Turnover"
          value="6.1%"
          change={-1.6}
          changeType="percentage"
          subtitle="7.7% in FY 2024"
          icon={BookOpen}
          trend="positive"
        />
        
        <SummaryCard
          title="Staff Exempt Turnover"
          value="12.6%"
          change={-1.0}
          changeType="percentage"
          subtitle="13.6% in FY 2024"
          icon={Building2}
          trend="positive"
        />
        
        <SummaryCard
          title="Staff Non-Exempt Turnover"
          value="15.3%"
          change={-2.5}
          changeType="percentage"
          subtitle="12.8% in FY 2024"
          icon={Building2}
          trend="positive"
        />
      </div>

      {/* Turnover Rates by Category Table */}
      <div className="mb-6 print:mb-4 chart-container" data-chart-type="table">
        <div id="turnover-rates-table" data-chart-title="Turnover Rates by Category" data-chart-ready="false">
          <TurnoverRatesTable 
            data={data}
            title="Turnover Rates by Category"
          />
        </div>
      </div>

      {/* Voluntary/Involuntary Turnover Chart - Moved here from bottom */}
      <div className="mb-6 print:mb-4 chart-container" data-chart-type="stacked-bar">
        <div id="voluntary-involuntary-turnover-chart" data-chart-title="Voluntary/Involuntary Turnover Chart" data-chart-ready="false">
          <VoluntaryInvoluntaryTurnoverChart
            title="Creighton University Turnover - Voluntary/Involuntary/Retirement"
            subtitle="Fiscal Year Ending June 30, 2025*"
            height={400}
          />
        </div>
      </div>

      {/* Staff Turnover Deviation Chart - NEW */}
      <div className="mb-6 print:mb-4 chart-container" data-chart-type="deviation-bar">
        <div id="turnover-deviation-chart" data-chart-title="Staff Turnover Rate Deviation from Average" data-chart-ready="false">
          <TurnoverDeviationChart
            title="FY2025 YTD Benefit Eligible Staff Turnover Rate Deviation from Average"
          />
        </div>
      </div>

      {/* Faculty Turnover Deviation Chart - NEW */}
      <div className="mb-6 print:mb-4 chart-container" data-chart-type="deviation-bar">
        <div id="faculty-turnover-deviation-chart" data-chart-title="Faculty Turnover Rate Deviation from Average" data-chart-ready="false">
          <FacultyTurnoverDeviationChart
            title="FY2025 YTD Faculty Turnover Rate Deviation from Average"
          />
        </div>
      </div>

      {/* Faculty Turnover by Division Chart */}
      <div className="mb-6 print:mb-4 chart-container" data-chart-type="horizontal-bars">
        <div id="faculty-turnover-division-chart" data-chart-title="Faculty Turnover by Division" data-chart-ready="false">
          <FacultyTurnoverByDivisionChart
            data={data.charts?.facultyTurnoverByDivision || []}
            title="Faculty Turnover by Division"
          />
        </div>
      </div>

      {/* Faculty/Staff Turnover Rate by FY Chart */}
      <div className="mb-6 print:mb-4 chart-container" data-chart-type="area-chart">
        <div id="faculty-staff-turnover-fy-chart" data-chart-title="Faculty/Staff Turnover Rate by FY" data-chart-ready="false">
          <FacultyStaffTurnoverByFYChart
            data={data.charts?.facultyStaffTurnoverByFY || []}
            title="Faculty/Staff Turnover Rate by FY"
          />
        </div>
      </div>

      {/* Turnover by Length of Service Charts - Side by Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-4 mb-6 print:mb-4">
        {/* Faculty Turnover by Length of Service */}
        <div className="chart-container" data-chart-type="pie-chart">
          <div id="faculty-turnover-length-service-chart" data-chart-title="Faculty Turnover by Length of Service" data-chart-ready="false">
            <TurnoverByLengthOfServiceChart
              data={data.charts?.turnoverByLengthOfService?.faculty || []}
              title="Turnover Rates by Length of Service – FY2025"
              employeeType="Faculty"
              height={400}
            />
          </div>
        </div>

        {/* Staff Turnover by Length of Service */}
        <div className="chart-container" data-chart-type="pie-chart">
          <div id="staff-turnover-length-service-chart" data-chart-title="Staff Turnover by Length of Service" data-chart-ready="false">
            <TurnoverByLengthOfServiceChart
              data={data.charts?.turnoverByLengthOfService?.staff || []}
              title="Turnover Rates by Length of Service – FY2025"
              employeeType="Staff"
              height={400}
            />
          </div>
        </div>
      </div>

      {/* Faculty Retirement Analysis - Added at the bottom */}
      <div className="mb-6 print:mb-4 chart-container" data-chart-type="retirement-analysis">
        <div id="faculty-retirement-analysis-chart" data-chart-title="Faculty Retirement Analysis" data-chart-ready="false">
          <FacultyRetirementAnalysis
            title="Faculty Retirement Analysis"
            height={400}
          />
        </div>
      </div>

      {/* Staff Retirement Analysis - Added after Faculty */}
      <div className="mb-6 print:mb-4 chart-container" data-chart-type="retirement-analysis">
        <div id="staff-retirement-analysis-chart" data-chart-title="Staff Retirement Analysis" data-chart-ready="false">
          <StaffRetirementAnalysis
            title="Staff Retirement Analysis"
            height={400}
          />
        </div>
      </div>

      {/* Retirements by Fiscal Year - Added after Staff Retirement Analysis */}
      <div className="mb-6 print:mb-4 chart-container" data-chart-type="line-chart">
        <div id="retirements-by-fiscal-year-chart" data-chart-title="Retirements by Fiscal Year" data-chart-ready="false">
          <RetirementsByFiscalYear
            title="Retirements by Fiscal Year"
            height={350}
          />
        </div>
      </div>

          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default TurnoverDashboard; 