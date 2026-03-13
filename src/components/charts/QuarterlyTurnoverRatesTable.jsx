import React from 'react';
import { getAnnualTurnoverRatesByCategory } from '../../services/dataService';

const QuarterlyTurnoverRatesTable = ({ title = "Turnover Rates by Category", className = "", selectedQuarter = "2025-09-30" }) => {
  // Get data from static data
  const { annualRates, benchmarks } = getAnnualTurnoverRatesByCategory();

  const isQ2 = selectedQuarter === '2025-12-31';

  // Categories to display
  const categories = [
    { key: 'faculty', label: 'Faculty' },
    { key: 'staffExempt', label: 'Staff Exempt' },
    { key: 'staffNonExempt', label: 'Staff Non-Exempt' },
    { key: 'total', label: 'Total' }
  ];

  // Build dynamic column definitions based on selected quarter
  const columns = isQ2
    ? [
        { type: 'benchmark', dataKey: 'fy2324', source: benchmarks, label: benchmarks.fy2324.label, ariaLabel: 'CUPA benchmark rate 2023-24' },
        { type: 'rate', dataKey: 'fy2024', source: annualRates, benchmarkKey: 'fy2324', label: annualRates.fy2024.label, ariaLabel: 'FY 2024 turnover rate' },
        { type: 'benchmark', dataKey: 'fy2425', source: benchmarks, label: benchmarks.fy2425.label, ariaLabel: 'CUPA benchmark rate 2024-25' },
        { type: 'rate', dataKey: 'fy2025', source: annualRates, benchmarkKey: 'fy2425', label: annualRates.fy2025.label, ariaLabel: 'FY 2025 turnover rate' },
        { type: 'rate', dataKey: 'q2fy26', source: annualRates, benchmarkKey: 'fy2425', label: annualRates.q2fy26.label, ariaLabel: 'Q2 FY26 turnover rate' },
      ]
    : [
        { type: 'benchmark', dataKey: 'fy2324', source: benchmarks, label: benchmarks.fy2324.label, ariaLabel: 'CUPA benchmark rate 2023-24' },
        { type: 'rate', dataKey: 'fy2024', source: annualRates, benchmarkKey: 'fy2324', label: annualRates.fy2024.label, ariaLabel: 'FY 2024 turnover rate' },
        { type: 'benchmark', dataKey: 'fy2425', source: benchmarks, label: benchmarks.fy2425.label, ariaLabel: 'CUPA benchmark rate 2024-25' },
        { type: 'rate', dataKey: 'fy2025', source: annualRates, benchmarkKey: 'fy2425', label: annualRates.fy2025.label, ariaLabel: 'FY 2025 turnover rate' },
        { type: 'rate', dataKey: 'q1fy26', source: annualRates, benchmarkKey: 'fy2425', label: annualRates.q1fy26.label, ariaLabel: 'Q1 FY26 turnover rate' },
      ];

  // Determine cell styling based on performance vs benchmark
  const getCellStyling = (value, benchmark) => {
    if (value > benchmark) {
      return "bg-red-100 text-red-800"; // Above benchmark (worse performance)
    } else {
      return "bg-green-100 text-green-800"; // Below benchmark (better performance)
    }
  };

  const footerNote = isQ2
    ? '* Benchmark based on CUPA Higher Education data. FY rates are annual; Q2 FY26 is annualized (quarterly × 4) for comparison.'
    : '* Benchmark based on CUPA Higher Education data. FY rates are annual; Q1 FY26 is annualized (quarterly × 4) for comparison.';

  return (
    <div className={`bg-white rounded-lg shadow-sm border print:border-gray ${className}`} data-pdf-ready="true">
      <div className="p-6 print:p-4">
        <h3 className="text-xl print:text-lg font-semibold print:text-black mb-6 print:mb-4" style={{color: '#0054A6'}}>
          {title}
        </h3>

        {/* Responsive table container */}
        <div className="overflow-x-auto pdf-table-container" data-content-type="table">
          <table
            className="w-full min-w-[800px] pdf-export-table"
            role="table"
            aria-label="Annual turnover rates by category comparison table"
            data-table-ready="true"
          >
            {/* Table Header */}
            <thead>
              <tr className="text-white" style={{backgroundColor: '#00245D'}}>
                <th
                  className="text-left py-3 px-4 font-semibold text-sm"
                  scope="col"
                  aria-label="Employee category"
                >
                  Turnover Category
                </th>
                {columns.map((col) => (
                  <th
                    key={col.dataKey}
                    className="text-center py-3 px-3 font-semibold text-sm"
                    scope="col"
                    aria-label={col.ariaLabel}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {categories.map((category, index) => (
                <tr
                  key={category.key}
                  className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} print:bg-white`}
                >
                  {/* Category Name */}
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {category.label}
                  </td>

                  {columns.map((col) => {
                    const value = col.source[col.dataKey][category.key];
                    if (col.type === 'benchmark') {
                      return (
                        <td key={col.dataKey} className="text-center py-3 px-3 text-gray-600">
                          {value}%
                        </td>
                      );
                    }
                    const benchmarkValue = benchmarks[col.benchmarkKey][category.key];
                    return (
                      <td key={col.dataKey} className={`text-center py-3 px-3 ${getCellStyling(value, benchmarkValue)}`}>
                        {value}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <div className="mt-4 text-xs text-gray-500 print:text-black">
          {footerNote}
        </div>
        <div className="mt-2 text-xs text-gray-500 print:text-black">
          <span className="inline-block w-3 h-3 bg-green-100 border border-green-200 rounded mr-1"></span>
          Below benchmark (better) &nbsp;
          <span className="inline-block w-3 h-3 bg-red-100 border border-red-200 rounded mr-1"></span>
          Above benchmark (needs attention)
        </div>
      </div>
    </div>
  );
};

export default QuarterlyTurnoverRatesTable;
