import React from 'react';
import SummaryCard from '../ui/SummaryCard';
import QuarterlyTurnoverRatesTable from '../charts/QuarterlyTurnoverRatesTable';
import ErrorBoundary from '../ui/ErrorBoundary';
import PDFExportButton from '../ui/PDFExportButton';
import { getQuarterlyTurnoverRatesByCategory } from '../../data/staticData';
import {
  TrendingDown,
  BookOpen,
  Building2,
  Info
} from 'lucide-react';

const QuarterlyTurnoverRatesDashboard = () => {
  // Get data for summary cards (use latest quarter - Q1 FY26)
  const { rates, benchmarks } = getQuarterlyTurnoverRatesByCategory();
  const latestQuarter = rates[rates.length - 1]; // Q1 FY26

  // Calculate change from previous quarter
  const previousQuarter = rates[rates.length - 2]; // Q4 FY25
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
                      <h1 className="text-2xl font-bold text-gray-900">Quarterly Turnover Analysis</h1>
                      <p className="text-gray-600 text-sm mt-1">
                        Turnover Rates by Category - Q2 FY25 through Q1 FY26
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
                        title: "Quarterly Turnover Rates by Category",
                        subtitle: "Q2 FY25 - Q1 FY26"
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
                    Turnover rates are annualized (quarterly rate × 4) for comparison with CUPA benchmarks.
                    Data includes benefit-eligible Full-Time and Part-Time employees only.
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Cards - Latest Quarter (Q1 FY26) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:gap-2 mb-6 print:mb-4">
              <SummaryCard
                title="Total Turnover"
                value={`${latestQuarter.total.rate}%`}
                change={parseFloat(calculateChange(latestQuarter.total.rate, previousQuarter.total.rate))}
                changeType="percentage"
                subtitle={`Benchmark: ${benchmarks.total}%`}
                icon={TrendingDown}
                trend={latestQuarter.total.rate < benchmarks.total ? "positive" : "negative"}
              />

              <SummaryCard
                title="Faculty Turnover"
                value={`${latestQuarter.faculty.rate}%`}
                change={parseFloat(calculateChange(latestQuarter.faculty.rate, previousQuarter.faculty.rate))}
                changeType="percentage"
                subtitle={`Benchmark: ${benchmarks.faculty}%`}
                icon={BookOpen}
                trend={latestQuarter.faculty.rate < benchmarks.faculty ? "positive" : "negative"}
              />

              <SummaryCard
                title="Staff Exempt"
                value={`${latestQuarter.staffExempt.rate}%`}
                change={parseFloat(calculateChange(latestQuarter.staffExempt.rate, previousQuarter.staffExempt.rate))}
                changeType="percentage"
                subtitle={`Benchmark: ${benchmarks.staffExempt}%`}
                icon={Building2}
                trend={latestQuarter.staffExempt.rate < benchmarks.staffExempt ? "positive" : "negative"}
              />

              <SummaryCard
                title="Staff Non-Exempt"
                value={`${latestQuarter.staffNonExempt.rate}%`}
                change={parseFloat(calculateChange(latestQuarter.staffNonExempt.rate, previousQuarter.staffNonExempt.rate))}
                changeType="percentage"
                subtitle={`Benchmark: ${benchmarks.staffNonExempt}%`}
                icon={Building2}
                trend={latestQuarter.staffNonExempt.rate < benchmarks.staffNonExempt ? "positive" : "negative"}
              />
            </div>

            {/* Quarterly Turnover Rates Table */}
            <div className="mb-6 print:mb-4 chart-container" data-chart-type="table">
              <div id="quarterly-turnover-rates-table" data-chart-title="Quarterly Turnover Rates by Category" data-chart-ready="false">
                <QuarterlyTurnoverRatesTable
                  title="Quarterly Turnover Rates by Category"
                />
              </div>
            </div>

            {/* Footer Notes */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• <strong>Annualized Rate:</strong> (Quarterly Terminations / Headcount) × 4 × 100</li>
                <li>• <strong>Benchmark Source:</strong> CUPA Higher Education data (2024-25)</li>
                <li>• <strong>Q1 FY26 Staff Data:</strong> Actual termination counts from HR system</li>
                <li>• <strong>Q2-Q4 FY25 Staff Split:</strong> Estimated based on Q1 FY26 exempt/non-exempt proportions (44%/56%)</li>
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
