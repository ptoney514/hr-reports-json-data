import React from 'react';
import { BarChart3 } from 'lucide-react';
import { getInternalMobilityData } from '../../services/dataService';
import { useQuarter } from '../../contexts/QuarterContext';
import NoDataForQuarter from '../ui/NoDataForQuarter';

/**
 * Promotions by School/Area Slide (quarter-aware)
 * Standalone table showing promotions by school with applied/increase breakdown.
 * Data: internalMobilityData via dataService (date-keyed).
 */

const promotionColors = {
  APPLIED: '#0054A6',
  INCREASE: '#7C3AED',
};

// Human-readable period from metadata dateRange (parse strings directly to avoid timezone shift)
const getPeriodText = (dateRange) => {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const [, startMonth] = dateRange.start.split('-').map(Number);
  const [endYear, endMonth] = dateRange.end.split('-').map(Number);
  return `${months[startMonth - 1]} - ${months[endMonth - 1]} ${endYear}`;
};

const PromotionsBySchoolSlide = () => {
  const { selectedQuarter } = useQuarter();

  const mobilityData = getInternalMobilityData(selectedQuarter);

  if (!mobilityData) {
    return <NoDataForQuarter dataLabel="Promotions by school data" />;
  }

  const { metadata, summary, promotionsBySchool } = mobilityData;
  const grandTotal = summary.totalPromotions;
  const maxTotal = Math.max(...promotionsBySchool.map(row => row.total));
  const periodText = getPeriodText(metadata.dateRange);

  const columns = [
    { key: 'applied', label: 'Applied', color: promotionColors.APPLIED },
    { key: 'increase', label: 'Increase', color: promotionColors.INCREASE },
  ];

  const totals = columns.reduce((acc, col) => {
    acc[col.key] = promotionsBySchool.reduce((sum, row) => sum + (row[col.key] || 0), 0);
    return acc;
  }, {});

  return (
    <div className="min-h-screen">
      <div className="w-[85%] max-w-[1280px] mx-auto pt-5 pb-8">

        {/* Page Header */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {metadata.quarter} {metadata.fiscalYear} Promotions Report
                </h1>
                <p className="text-gray-600 mt-1">
                  Employee Promotions & Career Advancement
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {periodText} • Benefit Eligible
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold" style={{ color: '#0054A6' }}>
                  {grandTotal}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total Promotions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 style={{ color: '#0054A6' }} size={20} />
            Promotions by School/Area
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">School/Area</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  {columns.map((col, i) => (
                    <th
                      key={i}
                      className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: col.color }}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {promotionsBySchool.map((row, i) => {
                  const percentage = ((row.total / grandTotal) * 100).toFixed(1);
                  const barWidthPercent = (row.total / maxTotal) * 100;

                  return (
                    <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">{row.area}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-lg font-bold text-gray-900">{row.total}</div>
                      </td>
                      {columns.map((col, j) => (
                        <td key={j} className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-semibold ${row[col.key] > 0 ? 'text-white' : 'bg-gray-100 text-gray-400'}`}
                            style={row[col.key] > 0 ? { backgroundColor: col.color } : {}}
                          >
                            {row[col.key]}
                          </span>
                        </td>
                      ))}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-4 bg-gray-100 rounded overflow-hidden" style={{ width: '120px' }}>
                            {row.applied > 0 && (
                              <div
                                className="h-full"
                                style={{
                                  width: `${(row.applied / row.total) * barWidthPercent}%`,
                                  backgroundColor: columns[0].color,
                                }}
                              />
                            )}
                            {row.increase > 0 && (
                              <div
                                className="h-full"
                                style={{
                                  width: `${(row.increase / row.total) * barWidthPercent}%`,
                                  backgroundColor: columns[1].color,
                                }}
                              />
                            )}
                          </div>
                          <span className="text-xs text-gray-500 w-10">{percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="py-4 px-4 font-semibold text-gray-900">Total</td>
                  <td className="py-4 px-4 text-center">
                    <div className="text-xl font-bold text-gray-900">{grandTotal}</div>
                  </td>
                  {columns.map((col, i) => (
                    <td key={i} className="py-4 px-4 text-center">
                      <span
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-white text-sm font-bold"
                        style={{ backgroundColor: col.color }}
                      >
                        {totals[col.key]}
                      </span>
                    </td>
                  ))}
                  <td className="py-4 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 flex justify-center gap-6 text-sm">
            {columns.map((col, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: col.color }}></div>
                <span className="text-gray-700">{col.label}</span>
              </div>
            ))}
          </div>

          <div className="text-xs text-gray-600 mt-4 bg-blue-50 p-3 rounded border border-blue-200 text-center">
            <span className="font-semibold">Note:</span> All counts represent benefit-eligible employees only. <strong style={{ color: promotionColors.INCREASE }}>Increase</strong> = salary/grade advancement within same department. <strong style={{ color: promotionColors.APPLIED }}>Applied</strong> = employee moved to a different department. Sorted by total promotions descending.
          </div>
        </div>

      </div>
    </div>
  );
};

export default PromotionsBySchoolSlide;
