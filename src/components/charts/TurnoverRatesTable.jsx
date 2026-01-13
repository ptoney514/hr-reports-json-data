import React from 'react';

const TurnoverRatesTable = ({ data, title = "Turnover Rates by Category", className = "" }) => {
  // Transform data into table format with higher education averages and changes
  const transformTableData = (data) => {
    if (!data) return [];

    // Extract historical trends and benchmark data
    const currentYear = data.currentFiscalYear || {};
    const historical = data.historicalTrends || [];
    const benchmarks = data.benchmarkComparison || {};

    // Find FY2023 and FY2024 data from historical trends
    const fy2023 = historical.find(h => h.fiscalYear === 'FY2023') || {};
    const fy2024 = historical.find(h => h.fiscalYear === 'FY2024') || {};

    // Get benchmark data for different categories
    const facultyBenchmark = benchmarks.categoryComparisons?.find(c => c.category === 'Faculty')?.benchmarkMedian || 9.1;
    const professionalStaffBenchmark = benchmarks.categoryComparisons?.find(c => c.category === 'Professional Staff')?.benchmarkMedian || 16.7;
    const supportStaffBenchmark = benchmarks.categoryComparisons?.find(c => c.category === 'Support Staff')?.benchmarkMedian || 20.7;
    const overallBenchmark = benchmarks.overallComparison?.benchmarkMedian || 13.8;

    // Current FY2025 data (from current year data)
    const facultyCurrentRate = currentYear.turnoverByCategory?.find(c => c.category === 'Faculty')?.turnoverRate || 6.1;

    // Note: Using hardcoded values for Staff Exempt/Non-Exempt as JSON doesn't separate these categories

    return [
      {
        category: 'Faculty',
        higherEdAvg2022: 8.90,
        fy2023: fy2023.facultyRate || 7.9,
        higherEdAvg2023: 9.10,
        fy2024: fy2024.facultyRate || 7.7,
        higherEdAvg2024: 8.70,
        fy2025: facultyCurrentRate,
        change: -1.6,
        benchmark: facultyBenchmark
      },
      {
        category: 'Staff Exempt',
        higherEdAvg2022: 18.00,
        fy2023: 15.5,
        higherEdAvg2023: 16.70,
        fy2024: 13.6,
        higherEdAvg2024: 15.00,
        fy2025: 12.6,
        change: -1.0,
        benchmark: professionalStaffBenchmark
      },
      {
        category: 'Staff Non-Exempt',
        higherEdAvg2022: 20.80,
        fy2023: 22.4,
        higherEdAvg2023: 19.90,
        fy2024: 17.8,
        higherEdAvg2024: 20.70,
        fy2025: 15.3,
        change: -2.5,
        benchmark: supportStaffBenchmark
      },
      {
        category: 'Total',
        higherEdAvg2022: 16.10,
        fy2023: fy2023.overallTurnoverRate || 14.9,
        higherEdAvg2023: 14.10,
        fy2024: fy2024.overallTurnoverRate || 12.8,
        higherEdAvg2024: 13.80,
        fy2025: currentYear.overallTurnover?.annualizedTurnoverRate || 11.2,
        change: -1.6,
        benchmark: overallBenchmark
      }
    ];
  };

  // Determine cell styling based on performance vs benchmark
  const getCellStyling = (value, benchmark, isHigherEdAvg = false) => {
    if (isHigherEdAvg) {
      return "text-gray-600"; // Neutral styling for benchmark columns
    }
    
    if (value > benchmark) {
      return "bg-red-100 text-red-800"; // Above benchmark (worse performance)
    } else {
      return "bg-green-100 text-green-800"; // Below benchmark (better performance) with green background
    }
  };

  const tableData = transformTableData(data);

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
            aria-label="Turnover rates by category comparison table"
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
                  className="text-center py-3 px-2 font-semibold text-sm"
                  scope="col"
                  aria-label="Higher education average for 2022-23"
                >
                  Higher Ed. Avg.*<br />
                  <span className="text-xs opacity-80">*2022-23</span>
                </th>
                <th 
                  className="text-center py-3 px-2 font-semibold text-sm"
                  scope="col"
                  aria-label="Fiscal year 2023 actual rate"
                >
                  FY 2023
                </th>
                <th 
                  className="text-center py-3 px-2 font-semibold text-sm"
                  scope="col"
                  aria-label="Higher education average for 2023-24"
                >
                  Higher Ed. Avg.*<br />
                  <span className="text-xs opacity-80">*2023-24</span>
                </th>
                <th 
                  className="text-center py-3 px-2 font-semibold text-sm"
                  scope="col"
                  aria-label="Fiscal year 2024 actual rate"
                >
                  FY 2024
                </th>
                <th 
                  className="text-center py-3 px-2 font-semibold text-sm"
                  scope="col"
                  aria-label="Higher education average for 2024-25"
                >
                  Higher Ed. Avg.*<br />
                  <span className="text-xs opacity-80">*2024-25</span>
                </th>
                <th 
                  className="text-center py-3 px-2 font-semibold text-sm"
                  scope="col"
                  aria-label="Fiscal year 2025 actual rate with change"
                >
                  FY 2025
                </th>
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
                  <td className="text-center py-3 px-2 text-gray-600">
                    {row.higherEdAvg2022}%
                  </td>
                  <td className={`text-center py-3 px-2 ${getCellStyling(row.fy2023, row.higherEdAvg2022)}`}>
                    {row.fy2023}%
                  </td>
                  <td className="text-center py-3 px-2 text-gray-600">
                    {row.higherEdAvg2023}%
                  </td>
                  <td className={`text-center py-3 px-2 ${getCellStyling(row.fy2024, row.higherEdAvg2023)}`}>
                    {row.fy2024}%
                  </td>
                  <td className="text-center py-3 px-2 text-gray-600">
                    {row.higherEdAvg2024}%
                  </td>
                  <td className={`text-center py-3 px-2 ${getCellStyling(row.fy2025, row.higherEdAvg2024)}`}>
                    {row.fy2025}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <div className="mt-4 text-xs text-gray-500 print:text-black">
          * Higher Ed Average based on CUPA data
        </div>
      </div>
    </div>
  );
};

export default TurnoverRatesTable;