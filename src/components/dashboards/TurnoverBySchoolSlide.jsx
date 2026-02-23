import React from 'react';
import { BarChart3 } from 'lucide-react';
import { getQuarterlyTurnoverData } from '../../services/dataService';
import { useQuarter } from '../../contexts/QuarterContext';
import NoDataForQuarter from '../ui/NoDataForQuarter';

/**
 * Turnover by School/Area Slide
 * Standalone table showing terminations by school with faculty/staff split and distribution bars.
 * Data: QUARTERLY_TURNOVER_DATA[quarter].turnoverBySchool
 */
const TurnoverBySchoolSlide = () => {
  const { selectedQuarter } = useQuarter();
  const data = getQuarterlyTurnoverData(selectedQuarter);

  if (!data || !data.turnoverBySchool) {
    return <NoDataForQuarter dataLabel="Turnover by school data" />;
  }

  const terminationData = data.summary;
  const maxCount = Math.max(...data.turnoverBySchool.map(r => r.total));

  return (
    <div className="min-h-screen">
      <div className="w-[85%] max-w-[1280px] mx-auto pt-5 pb-8">

        {/* Page Header */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {data.quarter} Terminations &amp; Turnover Report
                </h1>
                <p className="text-gray-600 mt-1">
                  Benefit Eligible • {data.fiscalPeriod}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold" style={{ color: '#0054A6' }}>
                  {terminationData.total.count}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Faculty: {terminationData.faculty.count} | Staff: {terminationData.staff.count}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 style={{ color: '#0054A6' }} size={20} />
            Turnover by School/Area
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">School/Area</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#0054A6' }}>Faculty</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-green-600 uppercase tracking-wider">Staff</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {data.turnoverBySchool.map((row, index) => {
                  const percentage = ((row.total / terminationData.total.count) * 100).toFixed(1);
                  const barWidthPercent = (row.total / maxCount) * 100;

                  return (
                    <tr key={index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">{row.school}</div>
                        {row.note && <div className="text-xs text-gray-500 mt-1">{row.note}</div>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-lg font-bold text-gray-900">{row.total}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-semibold ${row.faculty > 0 ? 'text-white' : 'bg-gray-100 text-gray-400'}`}
                          style={row.faculty > 0 ? { backgroundColor: '#0054A6' } : {}}
                        >
                          {row.faculty}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-semibold ${row.staff > 0 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {row.staff}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-4 bg-gray-100 rounded overflow-hidden" style={{ width: '120px' }}>
                            {row.faculty > 0 && (
                              <div
                                className="h-full"
                                style={{
                                  width: `${(row.faculty / row.total) * barWidthPercent}%`,
                                  backgroundColor: '#0054A6'
                                }}
                              />
                            )}
                            {row.staff > 0 && (
                              <div
                                className="h-full bg-green-500"
                                style={{ width: `${(row.staff / row.total) * barWidthPercent}%` }}
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
                    <div className="text-xl font-bold text-gray-900">{terminationData.total.count}</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-white text-sm font-bold" style={{ backgroundColor: '#0054A6' }}>
                      {terminationData.faculty.count}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-bold">
                      {terminationData.staff.count}
                    </span>
                  </td>
                  <td className="py-4 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#0054A6' }}></div>
              <span className="text-gray-700">Faculty Terminations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-gray-700">Staff Terminations</span>
            </div>
          </div>

          <div className="text-xs text-gray-600 mt-4 bg-blue-50 p-3 rounded border border-blue-200 text-center">
            <span className="font-semibold">Note:</span> All counts represent benefit-eligible employees only (Faculty + Staff). Sorted by total departures descending.
          </div>
        </div>

      </div>
    </div>
  );
};

export default TurnoverBySchoolSlide;
