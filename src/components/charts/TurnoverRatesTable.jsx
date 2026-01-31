import React, { useMemo } from 'react';
import { getTurnoverMetrics } from '../../services/dataService';

const TurnoverRatesTable = ({ data, title = "Turnover Rates by Category", className = "" }) => {
  // Get turnover metrics from data service (supports future API integration)
  const turnoverMetrics = getTurnoverMetrics('FY2025');

  // Transform data into table format with higher education averages and changes
  const transformTableData = useMemo(() => {
    // Use turnoverRatesTable from metrics
    const tableData = turnoverMetrics.turnoverRatesTable;

    // Higher Ed averages (from previous years) - using 2022-23 CUPA data
    const higherEdAvg2022 = {
      'Faculty': 8.90,
      'Staff Exempt': 18.00,
      'Staff Non-Exempt': 20.80,
      'Total': 16.10
    };

    return tableData.map(row => ({
      category: row.category,
      higherEdAvg2022: higherEdAvg2022[row.category] || 0,
      fy2023: row.fy2023,
      higherEdAvg2023: row.heAvg2023,
      fy2024: row.fy2024,
      higherEdAvg2024: row.heAvg2024,
      fy2025: row.fy2025,
      change: row.change,
      benchmark: row.heAvg2024  // Current benchmark is 2024-25 data
    }));
  }, [turnoverMetrics.turnoverRatesTable]);

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

  const tableData = transformTableData;

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