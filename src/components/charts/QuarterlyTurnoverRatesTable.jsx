import React from 'react';
import { getQuarterlyTurnoverRatesByCategory } from '../../data/staticData';

const QuarterlyTurnoverRatesTable = ({ title = "Quarterly Turnover Rates by Category", className = "" }) => {
  // Get data from static data
  const { rates, benchmarks } = getQuarterlyTurnoverRatesByCategory();

  // Transform data into table rows
  const tableData = [
    {
      category: 'Faculty',
      benchmark: benchmarks.faculty,
      quarters: rates.map(q => q.faculty.rate)
    },
    {
      category: 'Staff Exempt',
      benchmark: benchmarks.staffExempt,
      quarters: rates.map(q => q.staffExempt.rate)
    },
    {
      category: 'Staff Non-Exempt',
      benchmark: benchmarks.staffNonExempt,
      quarters: rates.map(q => q.staffNonExempt.rate)
    },
    {
      category: 'Total',
      benchmark: benchmarks.total,
      quarters: rates.map(q => q.total.rate)
    }
  ];

  // Get quarter labels
  const quarterLabels = rates.map(q => q.quarter);

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
            className="w-full min-w-[700px] pdf-export-table"
            role="table"
            aria-label="Quarterly turnover rates by category comparison table"
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
                  aria-label="CUPA benchmark rate"
                >
                  Benchmark*
                </th>
                {quarterLabels.map((quarter, idx) => (
                  <th
                    key={quarter}
                    className="text-center py-3 px-3 font-semibold text-sm"
                    scope="col"
                    aria-label={`${quarter} turnover rate`}
                  >
                    {quarter}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {tableData.map((row, index) => (
                <tr
                  key={row.category}
                  className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} print:bg-white`}
                >
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {row.category}
                  </td>
                  <td className="text-center py-3 px-3 text-gray-600">
                    {row.benchmark}%
                  </td>
                  {row.quarters.map((rate, qIdx) => (
                    <td
                      key={qIdx}
                      className={`text-center py-3 px-3 ${getCellStyling(rate, row.benchmark)}`}
                    >
                      {rate}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <div className="mt-4 text-xs text-gray-500 print:text-black">
          * Benchmark based on CUPA Higher Education data (2024-25). Rates are annualized (quarterly * 4) for comparison.
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
