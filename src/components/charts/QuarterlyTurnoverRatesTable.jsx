import React from 'react';
import { getAnnualTurnoverRatesByCategory } from '../../services/dataService';

const QuarterlyTurnoverRatesTable = ({ title = "Turnover Rates by Category", className = "" }) => {
  // Get data from static data
  const { annualRates, benchmarks } = getAnnualTurnoverRatesByCategory();

  // Categories to display
  const categories = [
    { key: 'faculty', label: 'Faculty' },
    { key: 'staffExempt', label: 'Staff Exempt' },
    { key: 'staffNonExempt', label: 'Staff Non-Exempt' },
    { key: 'total', label: 'Total' }
  ];

  // Determine cell styling based on performance vs benchmark
  const getCellStyling = (value, benchmark) => {
    if (value > benchmark) {
      return "bg-red-100 text-red-800"; // Above benchmark (worse performance)
    } else {
      return "bg-green-100 text-green-800"; // Below benchmark (better performance)
    }
  };

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
                <th
                  className="text-center py-3 px-3 font-semibold text-sm"
                  scope="col"
                  aria-label="CUPA benchmark rate 2023-24"
                >
                  {benchmarks.fy2324.label}
                </th>
                <th
                  className="text-center py-3 px-3 font-semibold text-sm"
                  scope="col"
                  aria-label="FY 2024 turnover rate"
                >
                  {annualRates.fy2024.label}
                </th>
                <th
                  className="text-center py-3 px-3 font-semibold text-sm"
                  scope="col"
                  aria-label="CUPA benchmark rate 2024-25"
                >
                  {benchmarks.fy2425.label}
                </th>
                <th
                  className="text-center py-3 px-3 font-semibold text-sm"
                  scope="col"
                  aria-label="FY 2025 turnover rate"
                >
                  {annualRates.fy2025.label}
                </th>
                <th
                  className="text-center py-3 px-3 font-semibold text-sm"
                  scope="col"
                  aria-label="Q1 FY26 turnover rate"
                >
                  {annualRates.q1fy26.label}
                </th>
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

                  {/* Higher Ed. Avg. 2023-24 (Benchmark) */}
                  <td className="text-center py-3 px-3 text-gray-600">
                    {benchmarks.fy2324[category.key]}%
                  </td>

                  {/* FY 2024 Rate (compare to 2023-24 benchmark) */}
                  <td className={`text-center py-3 px-3 ${getCellStyling(annualRates.fy2024[category.key], benchmarks.fy2324[category.key])}`}>
                    {annualRates.fy2024[category.key]}%
                  </td>

                  {/* Higher Ed. Avg. 2024-25 (Benchmark) */}
                  <td className="text-center py-3 px-3 text-gray-600">
                    {benchmarks.fy2425[category.key]}%
                  </td>

                  {/* FY 2025 Rate (compare to 2024-25 benchmark) */}
                  <td className={`text-center py-3 px-3 ${getCellStyling(annualRates.fy2025[category.key], benchmarks.fy2425[category.key])}`}>
                    {annualRates.fy2025[category.key]}%
                  </td>

                  {/* Q1 FY26 Rate (compare to 2024-25 benchmark) */}
                  <td className={`text-center py-3 px-3 ${getCellStyling(annualRates.q1fy26[category.key], benchmarks.fy2425[category.key])}`}>
                    {annualRates.q1fy26[category.key]}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <div className="mt-4 text-xs text-gray-500 print:text-black">
          * Benchmark based on CUPA Higher Education data. FY rates are annual; Q1 FY26 is annualized (quarterly × 4) for comparison.
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
