import React from 'react';
import { getAnnualTurnoverRatesByCategory } from '../../services/dataService';

const QuarterlyTurnoverRatesTable = ({ title = "Quarterly Turnover Rates by Category", className = "", selectedQuarter = "2025-09-30" }) => {
  const { annualRates, benchmarks } = getAnnualTurnoverRatesByCategory();

  const isQ2 = selectedQuarter === '2025-12-31';

  const categories = [
    { key: 'faculty', label: 'Faculty' },
    { key: 'staffExempt', label: 'Staff Exempt' },
    { key: 'staffNonExempt', label: 'Staff Non-Exempt' },
    { key: 'total', label: 'Total' }
  ];

  // Q1: Single benchmark column + 4 quarterly columns
  // Q2: 3 benchmark/FY pairs + FY26 Annualized (7 data columns)
  const columns = isQ2
    ? [
        { type: 'benchmark', dataKey: 'fy2223', source: benchmarks, label: 'HE Avg*', sublabel: '2022-23' },
        { type: 'rate', dataKey: 'fy2023', source: annualRates, benchmarkKey: 'fy2223', label: 'FY23', sublabel: '' },
        { type: 'benchmark', dataKey: 'fy2324', source: benchmarks, label: 'HE Avg*', sublabel: '2023-24' },
        { type: 'rate', dataKey: 'fy2024', source: annualRates, benchmarkKey: 'fy2324', label: 'FY24', sublabel: '' },
        { type: 'benchmark', dataKey: 'fy2425', source: benchmarks, label: 'HE Avg*', sublabel: '2024-25' },
        { type: 'rate', dataKey: 'fy2025', source: annualRates, benchmarkKey: 'fy2425', label: 'FY25', sublabel: '' },
        { type: 'rate', dataKey: 'q2fy26', source: annualRates, benchmarkKey: 'fy2425', label: 'FY26 Annualized', sublabel: '12/31/2025', separator: true },
      ]
    : [
        { type: 'benchmark', dataKey: 'fy2425', source: benchmarks, label: 'Benchmark*' },
        { type: 'rate', dataKey: 'q2fy25', source: annualRates, benchmarkKey: 'fy2425', label: 'Q2 FY25' },
        { type: 'rate', dataKey: 'q3fy25', source: annualRates, benchmarkKey: 'fy2425', label: 'Q3 FY25' },
        { type: 'rate', dataKey: 'q4fy25', source: annualRates, benchmarkKey: 'fy2425', label: 'Q4 FY25' },
        { type: 'rate', dataKey: 'q1fy26', source: annualRates, benchmarkKey: 'fy2425', label: 'Q1 FY26' },
      ];

  const getCellStyling = (value, benchmark) => {
    if (value > benchmark) {
      return "bg-red-100 text-red-800";
    }
    return "bg-green-100 text-green-800";
  };

  const footerNote = isQ2
    ? '*Higher Ed Average turnover numbers based on CUPA data. FY26 Annualized as of 12/31/2025.'
    : '* Benchmark based on CUPA Higher Ed data (2024-25). Rates are annualized (quarterly \u00d7 4) for comparison.';

  const minWidth = isQ2 ? 'min-w-[1100px]' : 'min-w-[800px]';

  return (
    <div className={`bg-white rounded-lg shadow-sm border print:border-gray ${className}`} data-pdf-ready="true">
      <div className="p-6 print:p-4">
        <h3 className="text-xl print:text-lg font-semibold print:text-black mb-6 print:mb-4" style={{color: '#0054A6'}}>
          {title}
        </h3>

        <div className="overflow-x-auto pdf-table-container" data-content-type="table">
          <table
            className={`w-full ${minWidth} pdf-export-table`}
            role="table"
            aria-label="Turnover rates by category comparison table"
            data-table-ready="true"
          >
            <thead>
              {isQ2 ? (
                <>
                  <tr className="text-white" style={{backgroundColor: '#00245D'}}>
                    <th className="text-left py-2 px-4 font-semibold text-sm" scope="col" rowSpan={2}>
                      Turnover Category
                    </th>
                    {columns.map((col) => (
                      <th key={col.dataKey} className={`text-center py-1 px-3 font-semibold text-sm${col.separator ? ' border-l-2' : ''}`} scope="col" style={col.separator ? {borderLeftColor: 'rgba(255,255,255,0.25)'} : undefined}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                  <tr className="text-white text-xs" style={{backgroundColor: '#00245D'}}>
                    {columns.map((col) => (
                      <th key={`${col.dataKey}-sub`} className={`text-center py-1 px-3 font-normal${col.separator ? ' border-l-2' : ''}`} style={col.separator ? {borderLeftColor: 'rgba(255,255,255,0.25)'} : undefined}>
                        {col.sublabel || '\u00A0'}
                      </th>
                    ))}
                  </tr>
                </>
              ) : (
                <tr className="text-white" style={{backgroundColor: '#00245D'}}>
                  <th className="text-left py-3 px-4 font-semibold text-sm" scope="col">
                    Turnover Category
                  </th>
                  {columns.map((col) => (
                    <th key={col.dataKey} className="text-center py-3 px-3 font-semibold text-sm" scope="col">
                      {col.label}
                    </th>
                  ))}
                </tr>
              )}
            </thead>

            <tbody>
              {categories.map((category, index) => (
                <tr
                  key={category.key}
                  className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} print:bg-white`}
                >
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {category.label}
                  </td>
                  {columns.map((col) => {
                    const value = col.source[col.dataKey][category.key];
                    const separatorClass = col.separator ? ' border-l-2 border-blue-200' : '';
                    if (col.type === 'benchmark') {
                      return (
                        <td key={col.dataKey} className={`text-center py-3 px-3 text-gray-600${separatorClass}`}>
                          {value}%
                        </td>
                      );
                    }
                    const benchmarkValue = benchmarks[col.benchmarkKey][category.key];
                    return (
                      <td key={col.dataKey} className={`text-center py-3 px-3 ${getCellStyling(value, benchmarkValue)}${separatorClass}`}>
                        {value}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-xs text-gray-500 print:text-black">
          {footerNote}
        </div>
        <div className="mt-2 text-xs text-gray-500 print:text-black">
          <span className="inline-block w-3 h-3 bg-green-100 border border-green-200 rounded mr-1"></span>
          Below benchmark &nbsp;
          <span className="inline-block w-3 h-3 bg-red-100 border border-red-200 rounded mr-1"></span>
          Above benchmark (needs attention)
        </div>
      </div>
    </div>
  );
};

export default QuarterlyTurnoverRatesTable;
