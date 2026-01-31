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
import { getTurnoverData, getTurnoverMetrics } from '../../services/dataService';
import {
  TrendingDown,
  BookOpen,
  Building2,
  Info
} from 'lucide-react';

const TurnoverDashboard = () => {
  // Static data for 6/30/25 reporting period only
  const currentData = getTurnoverData("2025-06-30"); // Current period
  const previousData = getTurnoverData("2025-03-31"); // For percentage calculations

  // Get turnover metrics from data service (supports future API integration)
  const turnoverMetrics = getTurnoverMetrics('FY2025');

  // Calculate percentage changes using previous period
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100);
  };

  // Transform static data to match dashboard structure
  const data = {
    summary: {
      totalDepartures: currentData.terminations,
      overallTurnoverRate: turnoverMetrics.summaryRates.total.rate,
      turnoverRateChange: calculateChange(currentData.terminations, previousData.terminations),
      facultyTurnoverRate: turnoverMetrics.summaryRates.faculty.rate,
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
      // Use historical rates from turnover metrics
      facultyStaffTurnoverByFY: turnoverMetrics.historicalRates.map(h => ({
        fiscalYear: h.fiscalYear,
        rate: h.rate
      })),
      monthlyTrends: currentData.monthlyTrends,
      // Use length of service from turnover metrics
      turnoverByLengthOfService: turnoverMetrics.lengthOfService
    }
  };

  // Data sourced from static data

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

          {/* Summary Cards - Using turnover metrics from data service */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:gap-2 mb-6 print:mb-4">
        <SummaryCard
          title="Total Turnover"
          value={`${turnoverMetrics.summaryRates.total.rate}%`}
          change={turnoverMetrics.summaryRates.total.change}
          changeType="percentage"
          subtitle={`${turnoverMetrics.summaryRates.total.priorYear}% in FY 2024`}
          icon={TrendingDown}
          trend={turnoverMetrics.summaryRates.total.trend}
        />

        <SummaryCard
          title="Faculty Turnover"
          value={`${turnoverMetrics.summaryRates.faculty.rate}%`}
          change={turnoverMetrics.summaryRates.faculty.change}
          changeType="percentage"
          subtitle={`${turnoverMetrics.summaryRates.faculty.priorYear}% in FY 2024`}
          icon={BookOpen}
          trend={turnoverMetrics.summaryRates.faculty.trend}
        />

        <SummaryCard
          title="Staff Exempt Turnover"
          value={`${turnoverMetrics.summaryRates.staffExempt.rate}%`}
          change={turnoverMetrics.summaryRates.staffExempt.change}
          changeType="percentage"
          subtitle={`${turnoverMetrics.summaryRates.staffExempt.priorYear}% in FY 2024`}
          icon={Building2}
          trend={turnoverMetrics.summaryRates.staffExempt.trend}
        />

        <SummaryCard
          title="Staff Non-Exempt Turnover"
          value={`${turnoverMetrics.summaryRates.staffNonExempt.rate}%`}
          change={turnoverMetrics.summaryRates.staffNonExempt.change}
          changeType="percentage"
          subtitle={`${turnoverMetrics.summaryRates.staffNonExempt.priorYear}% in FY 2024`}
          icon={Building2}
          trend={turnoverMetrics.summaryRates.staffNonExempt.trend}
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