import React from 'react';
import SummaryCard from '../ui/SummaryCard';
import QuarterlyTurnoverRatesTable from '../charts/QuarterlyTurnoverRatesTable';
import ErrorBoundary from '../ui/ErrorBoundary';
import PDFExportButton from '../ui/PDFExportButton';
import { getAnnualTurnoverRatesByCategory } from '../../data/staticData';
import {
  TrendingDown,
  BookOpen,
  Building2,
  Info
} from 'lucide-react';

const QuarterlyTurnoverRatesDashboard = () => {
  // Get data for summary cards (compare FY 2025 vs FY 2024)
  const { annualRates, benchmarks } = getAnnualTurnoverRatesByCategory();
  const currentYear = annualRates.fy2025;
  const previousYear = annualRates.fy2024;
  const currentBenchmarks = benchmarks.fy2425;

  // Calculate year-over-year change
  const calculateChange = (current, previous) => {
    return (current - previous).toFixed(1);
  };

  return (
    <ErrorBoundary>
      <div id="quarterly-turnover-rates-dashboard" data-dashboard-content className="min-h-screen bg-gray-50 py-8 dashboard-container print:bg-white print:py-0">
        <div className="max-w-7xl mx-auto px-4 print:max-w-none print:px-0 print:mx-0">
          {/* PDF Export Wrapper */}
          <div id="quarterly-turnover-rates-pdf" className="dashboard-content">
            {/* Header */}
            <div className="mb-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingDown style={{color: '#0054A6'}} size={24} />
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Turnover Analysis by Category</h1>
                      <p className="text-gray-600 text-sm mt-1">
                        Annual Turnover Rates - FY 2024, FY 2025 & Q1 FY26 with CUPA Benchmarks
                      </p>
                    </div>
                  </div>
                  {/* Export Controls */}
                  <div className="flex items-center gap-3 no-pdf">
                    <PDFExportButton
                      dashboardType="quarterly-turnover-rates"
                      elementId="quarterly-turnover-rates-pdf"
                      defaultOrientation="landscape"
                      title="Export PDF"
                      customHeader={{
                        title: "Turnover Rates by Category",
                        subtitle: "FY 2024, FY 2025 & Q1 FY26 with CUPA Benchmarks"
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
                    FY 2024 and FY 2025 rates are annual turnover percentages. Q1 FY26 rates are annualized (quarterly × 4) for comparison with CUPA benchmarks.
                    Data includes benefit-eligible Full-Time and Part-Time employees only.
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Cards - FY 2025 Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:gap-2 mb-6 print:mb-4">
              <SummaryCard
                title="Total Turnover (FY25)"
                value={`${currentYear.total}%`}
                change={parseFloat(calculateChange(currentYear.total, previousYear.total))}
                changeType="percentage"
                subtitle={`Benchmark: ${currentBenchmarks.total}%`}
                icon={TrendingDown}
                trend={currentYear.total < currentBenchmarks.total ? "positive" : "negative"}
              />

              <SummaryCard
                title="Faculty Turnover (FY25)"
                value={`${currentYear.faculty}%`}
                change={parseFloat(calculateChange(currentYear.faculty, previousYear.faculty))}
                changeType="percentage"
                subtitle={`Benchmark: ${currentBenchmarks.faculty}%`}
                icon={BookOpen}
                trend={currentYear.faculty < currentBenchmarks.faculty ? "positive" : "negative"}
              />

              <SummaryCard
                title="Staff Exempt (FY25)"
                value={`${currentYear.staffExempt}%`}
                change={parseFloat(calculateChange(currentYear.staffExempt, previousYear.staffExempt))}
                changeType="percentage"
                subtitle={`Benchmark: ${currentBenchmarks.staffExempt}%`}
                icon={Building2}
                trend={currentYear.staffExempt < currentBenchmarks.staffExempt ? "positive" : "negative"}
              />

              <SummaryCard
                title="Staff Non-Exempt (FY25)"
                value={`${currentYear.staffNonExempt}%`}
                change={parseFloat(calculateChange(currentYear.staffNonExempt, previousYear.staffNonExempt))}
                changeType="percentage"
                subtitle={`Benchmark: ${currentBenchmarks.staffNonExempt}%`}
                icon={Building2}
                trend={currentYear.staffNonExempt < currentBenchmarks.staffNonExempt ? "positive" : "negative"}
              />
            </div>

            {/* Turnover Rates Table */}
            <div className="mb-6 print:mb-4 chart-container" data-chart-type="table">
              <div id="quarterly-turnover-rates-table" data-chart-title="Turnover Rates by Category" data-chart-ready="false">
                <QuarterlyTurnoverRatesTable
                  title="Turnover Rates by Category"
                />
              </div>
            </div>

            {/* Footer Notes */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• <strong>FY 2024/2025 Rates:</strong> Annual turnover percentage for the full fiscal year</li>
                <li>• <strong>Q1 FY26 Rate:</strong> Annualized (Quarterly Terminations / Headcount) × 4 × 100</li>
                <li>• <strong>Benchmark Source:</strong> CUPA Higher Education data (2023-24 and 2024-25)</li>
                <li>• <strong>Comparison Logic:</strong> FY 2024 compares to 2023-24 benchmark; FY 2025 and Q1 FY26 compare to 2024-25 benchmark</li>
                <li>• <strong>Color Coding:</strong> Green indicates performance better than benchmark; Red indicates performance needs attention</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default QuarterlyTurnoverRatesDashboard;
