import React from 'react';
import SummaryCard from '../ui/SummaryCard';
import QuarterlyTurnoverRatesTable from '../charts/QuarterlyTurnoverRatesTable';
import ErrorBoundary from '../ui/ErrorBoundary';
import NoDataForQuarter from '../ui/NoDataForQuarter';
import { getAnnualTurnoverRatesByCategory, getQuarterlyTurnoverData } from '../../services/dataService';
import { useQuarter } from '../../contexts/QuarterContext';
import {
  TrendingDown,
  BookOpen,
  Building2
} from 'lucide-react';

// Quarters that have turnover rate analysis data
const SUPPORTED_QUARTERS = ['2025-12-31', '2025-09-30', '2025-06-30', '2025-03-31', '2024-12-31', '2024-09-30', '2024-06-30'];

const QuarterlyTurnoverRatesDashboard = () => {
  const { selectedQuarter } = useQuarter();

  // Show no-data message for quarters without turnover rate data
  if (!SUPPORTED_QUARTERS.includes(selectedQuarter)) {
    return (
      <ErrorBoundary>
        <NoDataForQuarter dataLabel="Turnover rate analysis" />
      </ErrorBoundary>
    );
  }

  const isQ2 = selectedQuarter === '2025-12-31';

  // Get rate data for summary cards
  const { annualRates, benchmarks } = getAnnualTurnoverRatesByCategory();
  const currentBenchmarks = benchmarks.fy2425;

  // Get termination counts for header metric
  const turnoverData = getQuarterlyTurnoverData(selectedQuarter);
  const facultyCount = turnoverData?.summary?.faculty?.count || 0;
  const staffCount = turnoverData?.summary?.staff?.count || 0;
  const totalBenefitEligible = facultyCount + staffCount;
  const quarterLabel = turnoverData?.quarter || (isQ2 ? 'Q2 FY26' : 'Q1 FY26');

  // Determine current and previous quarter rates for card deltas
  let currentRates, previousRates;
  if (isQ2) {
    currentRates = annualRates.q2fy26;
    previousRates = annualRates.q1fy26;
  } else if (selectedQuarter === '2025-09-30') {
    currentRates = annualRates.q1fy26;
    previousRates = annualRates.q4fy25;
  } else {
    // Older quarters - fall back to FY25 vs FY24
    currentRates = annualRates.fy2025;
    previousRates = annualRates.fy2024;
  }

  const calculateChange = (current, previous) => {
    return (current - previous).toFixed(1);
  };

  return (
    <ErrorBoundary>
      <div id="quarterly-turnover-rates-dashboard" data-dashboard-content className="min-h-screen bg-gray-50 py-8 dashboard-container print:bg-white print:py-0">
        <div className="max-w-7xl mx-auto px-4 print:max-w-none print:px-0 print:mx-0">
          <div id="quarterly-turnover-rates-pdf" className="dashboard-content">
            {/* Header */}
            <div className="mb-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingDown style={{color: '#0054A6'}} size={24} />
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Quarterly Turnover Analysis</h1>
                      <p className="text-gray-600 text-sm mt-1">
                        {isQ2
                          ? 'Turnover Rates by Category - FY 2023 through FY26 Annualized with CUPA Benchmarks'
                          : 'Turnover Rates by Category - Q2 FY25 through Q1 FY26'}
                      </p>
                    </div>
                  </div>
                  {/* Big Metric */}
                  {turnoverData && (
                    <div className="text-right">
                      <div className="text-5xl font-bold" style={{color: '#0054A6'}}>
                        {totalBenefitEligible}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        Total {quarterLabel} Terminations
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Benefit Eligible
                      </div>
                      <div className="text-xs text-gray-500">
                        Faculty: {facultyCount} | Staff: {staffCount}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:gap-2 mb-6 print:mb-4">
              <SummaryCard
                title="Total Turnover"
                value={`${currentRates.total}%`}
                change={parseFloat(calculateChange(currentRates.total, previousRates.total))}
                changeType="percentage"
                subtitle={`Benchmark: ${currentBenchmarks.total}%`}
                icon={TrendingDown}
                trend={currentRates.total < currentBenchmarks.total ? "positive" : "negative"}
              />

              <SummaryCard
                title="Faculty Turnover"
                value={`${currentRates.faculty}%`}
                change={parseFloat(calculateChange(currentRates.faculty, previousRates.faculty))}
                changeType="percentage"
                subtitle={`Benchmark: ${currentBenchmarks.faculty}%`}
                icon={BookOpen}
                trend={currentRates.faculty < currentBenchmarks.faculty ? "positive" : "negative"}
              />

              <SummaryCard
                title="Staff Exempt"
                value={`${currentRates.staffExempt}%`}
                change={parseFloat(calculateChange(currentRates.staffExempt, previousRates.staffExempt))}
                changeType="percentage"
                subtitle={`Benchmark: ${currentBenchmarks.staffExempt}%`}
                icon={Building2}
                trend={currentRates.staffExempt < currentBenchmarks.staffExempt ? "positive" : "negative"}
              />

              <SummaryCard
                title="Staff Non-Exempt"
                value={`${currentRates.staffNonExempt}%`}
                change={parseFloat(calculateChange(currentRates.staffNonExempt, previousRates.staffNonExempt))}
                changeType="percentage"
                subtitle={`Benchmark: ${currentBenchmarks.staffNonExempt}%`}
                icon={Building2}
                trend={currentRates.staffNonExempt < currentBenchmarks.staffNonExempt ? "positive" : "negative"}
              />
            </div>

            {/* Turnover Rates Table */}
            <div className="mb-6 print:mb-4 chart-container" data-chart-type="table">
              <div id="quarterly-turnover-rates-table" data-chart-title="Quarterly Turnover Rates by Category" data-chart-ready="false">
                <QuarterlyTurnoverRatesTable
                  title="Quarterly Turnover Rates by Category"
                  selectedQuarter={selectedQuarter}
                />
              </div>
            </div>

            {/* Footer Notes */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                {isQ2 ? (
                  <>
                    <li>• <strong>Annualized Rate:</strong> (Quarterly Terminations / Headcount) × 4 × 100</li>
                    <li>• <strong>Benchmark Source:</strong> CUPA Higher Education data (2022-23, 2023-24, and 2024-25)</li>
                    <li>• <strong>FY26 Annualized:</strong> Based on Jul-Dec 2025 data annualized for full-year comparison</li>
                    <li>• <strong>Color Coding:</strong> Green = better than benchmark; Red = needs attention</li>
                  </>
                ) : (
                  <>
                    <li>• <strong>Annualized Rate:</strong> (Quarterly Terminations / Headcount) × 4 × 100</li>
                    <li>• <strong>Benchmark Source:</strong> CUPA Higher Education data (2024-25)</li>
                    <li>• <strong>Q1 FY26 Staff Data:</strong> Actual termination counts from HR system</li>
                    <li>• <strong>Q2-Q4 FY25 Staff Split:</strong> Estimated on Q1 FY26 proportions (44%/56%)</li>
                    <li>• <strong>Color Coding:</strong> Green = better than benchmark; Red = needs attention</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default QuarterlyTurnoverRatesDashboard;
