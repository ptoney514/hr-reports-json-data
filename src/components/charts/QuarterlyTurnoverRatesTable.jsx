import React from 'react';
import { getAnnualTurnoverRatesByCategory } from '../../data/staticData';

const QuarterlyTurnoverRatesTable = ({ title = "Quarterly Turnover Rates by Category", className = "" }) => {
  // Get annual turnover data with benchmarks
  const data = getAnnualTurnoverRatesByCategory();

  // Categories to display
  const categories = [
    { key: 'faculty', label: 'Faculty' },
    { key: 'staffExempt', label: 'Staff Exempt' },
    { key: 'staffNonExempt', label: 'Staff Non-Exempt' },
    { key: 'total', label: 'Total' }
  ];

  // Get short FY label (e.g., "FY 2023" -> "FY23")
  const getShortFYLabel = (fiscalYear) => {
    if (fiscalYear === 'FY26 Annualized') return 'FY26 Annualized';
    return fiscalYear.replace(' 20', ''); // "FY 2023" -> "FY23"
  };

  // Get cell styling based on FY rate vs benchmark
  const getCellStyling = (rate, benchmark) => {
    if (benchmark === null) {
      // FY26 Annualized has no adjacent benchmark, show neutral
      return "bg-gray-50 text-gray-700";
    }
    if (rate > benchmark) {
      return "bg-red-100 text-red-800"; // Above benchmark (worse performance)
    }
    return "bg-green-100 text-green-800"; // Below benchmark (better performance)
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
            className="w-full min-w-[900px] pdf-export-table"
            role="table"
            aria-label="Annual turnover rates by category with CUPA benchmarks comparison table"
            data-table-ready="true"
          >
            {/* Table Header - 2 rows with tight spacing */}
            <thead>
              {/* First header row */}
              <tr className="text-white leading-tight" style={{backgroundColor: '#00245D'}}>
                <th
                  rowSpan="2"
                  className="text-left pt-2 pb-1 px-3 font-semibold text-sm align-bottom border-r border-blue-800"
                  scope="col"
                  aria-label="Employee category"
                >
                  Turnover Category
                </th>
                {data.years.map((year, idx) => (
                  <React.Fragment key={year.fiscalYear}>
                    {year.benchmarkYear && (
                      <th
                        className="text-center pt-2 pb-0 px-2 font-semibold text-xs align-bottom border-r border-blue-800"
                        scope="col"
                        aria-label={`Higher Ed Average ${year.benchmarkYear}`}
                      >
                        Higher Ed. Avg.*
                      </th>
                    )}
                    <th
                      className={`text-center pt-2 pb-0 px-2 font-semibold text-xs align-bottom ${idx < data.years.length - 1 ? 'border-r border-blue-800' : ''} ${year.subLabel ? 'min-w-[140px]' : ''}`}
                      scope="col"
                      aria-label={`${year.fiscalYear} turnover rate`}
                    >
                      {getShortFYLabel(year.fiscalYear)}
                    </th>
                  </React.Fragment>
                ))}
              </tr>
              {/* Second header row */}
              <tr className="text-white leading-tight" style={{backgroundColor: '#00245D'}}>
                {data.years.map((year, idx) => (
                  <React.Fragment key={`row2-${year.fiscalYear}`}>
                    {year.benchmarkYear && (
                      <th
                        className="text-center pt-0 pb-2 px-2 font-normal text-xs align-bottom border-r border-blue-800"
                        scope="col"
                      >
                        {year.benchmarkYear}
                      </th>
                    )}
                    <th
                      className={`text-center pt-0 pb-2 px-2 font-normal text-xs align-bottom ${idx < data.years.length - 1 ? 'border-r border-blue-800' : ''}`}
                      scope="col"
                    >
                      {year.subLabel || '\u00A0'}
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {categories.map((cat, index) => (
                <tr
                  key={cat.key}
                  className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} print:bg-white`}
                >
                  <td className="py-3 px-3 font-medium text-gray-900 border-r border-gray-200">
                    {cat.label}
                  </td>
                  {data.years.map((year, idx) => {
                    const benchmark = year.benchmarkYear ? data.benchmarks[year.benchmarkYear][cat.key] : null;
                    const rate = data.rates[year.fiscalYear][cat.key];

                    return (
                      <React.Fragment key={`${cat.key}-${year.fiscalYear}`}>
                        {year.benchmarkYear && (
                          <td className="text-center py-3 px-2 text-gray-600 border-r border-gray-200">
                            {benchmark}%
                          </td>
                        )}
                        <td
                          className={`text-center py-3 px-2 ${getCellStyling(rate, benchmark)} ${idx < data.years.length - 1 ? 'border-r border-gray-200' : ''}`}
                        >
                          {rate}%
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer notes */}
        <div className="mt-4 text-xs text-gray-500 print:text-black">
          *Higher Ed Average turnover numbers based on CUPA data. <span className="font-semibold">FY26 Annualized as of 12/31/2025.</span>
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
