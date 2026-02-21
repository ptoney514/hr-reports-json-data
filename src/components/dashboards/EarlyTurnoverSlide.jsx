import React from 'react';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getQuarterlyTurnoverData } from '../../services/dataService';
import { useQuarter } from '../../contexts/QuarterContext';
import NoDataForQuarter from '../ui/NoDataForQuarter';

/**
 * Early Turnover Deep Dive Slide
 * Three donut charts + detail table for <1 year tenure terminations.
 * Data: QUARTERLY_TURNOVER_DATA[quarter].earlyTurnover
 */
const EarlyTurnoverSlide = () => {
  const { selectedQuarter } = useQuarter();
  const data = getQuarterlyTurnoverData(selectedQuarter);

  if (!data || !data.earlyTurnover) {
    return <NoDataForQuarter dataLabel="Early turnover data" />;
  }

  const earlyTurnover = data.earlyTurnover;
  const total = earlyTurnover.total;
  const categoryData = earlyTurnover.byEmployeeCategory;
  const terminationTypeData = earlyTurnover.byTerminationType;
  const schoolData = earlyTurnover.bySchool;
  const schoolDetailed = earlyTurnover.bySchoolDetailed;
  const maxSchoolCount = schoolDetailed ? Math.max(...schoolDetailed.map(r => r.count)) : 1;

  return (
    <div className="min-h-screen">
      <div className="w-[85%] max-w-[1280px] mx-auto pt-5 pb-8">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg shadow-sm border p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <PieChartIcon style={{ color: '#0054A6' }} size={24} />
            Early Turnover Deep Dive (&lt;1 Year Tenure)
          </h1>
          <p className="text-gray-600">{data.quarter} • {data.fiscalPeriod} • Benefit Eligible</p>
        </div>

        {/* Three Donut Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* By Employee Category */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              By Employee Category
            </h3>
            <div className="flex flex-col items-center">
              <div className="relative w-full" style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height={260}>
                  <RechartsPie>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                      label={(entry) => `${entry.value} (${entry.percentage}%)`}
                      labelLine={true}
                      style={{ fontSize: '13px', fontWeight: '500' }}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{total}</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">TOTAL</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-4 text-sm mt-2">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-700 text-xs">{item.name}: <strong>{item.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* By Termination Type */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              By Termination Type
            </h3>
            <div className="flex flex-col items-center">
              <div className="relative w-full" style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height={260}>
                  <RechartsPie>
                    <Pie
                      data={terminationTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                      label={(entry) => `${entry.value} (${entry.percentage}%)`}
                      labelLine={true}
                      style={{ fontSize: '13px', fontWeight: '500' }}
                    >
                      {terminationTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{total}</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">TOTAL</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-4 text-sm mt-2">
                {terminationTypeData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-700 text-xs">{item.name}: <strong>{item.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* By School/Area */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              By School/Area
            </h3>
            <div className="flex flex-col items-center">
              <div className="relative w-full" style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height={260}>
                  <RechartsPie>
                    <Pie
                      data={schoolData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="count"
                      label={(entry) => `${entry.count} (${entry.percentage}%)`}
                      labelLine={true}
                      style={{ fontSize: '13px', fontWeight: '500' }}
                    >
                      {schoolData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{total}</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">TOTAL</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-sm mt-2">
                {schoolData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-700 text-xs">{item.school}: <strong>{item.count}</strong> ({item.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* School Detail Table */}
        {schoolDetailed && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 style={{ color: '#0054A6' }} size={18} />
              Early Turnover by School/Area (Detailed)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">School/Area</th>
                    <th className="text-center py-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Count</th>
                    <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {schoolDetailed.map((row, index) => {
                    const barWidthPercent = (row.count / maxSchoolCount) * 100;
                    return (
                      <tr key={index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="py-2 px-4">
                          <div className="text-sm font-medium text-gray-900">{row.school}</div>
                        </td>
                        <td className="py-2 px-4 text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-semibold bg-blue-500 text-white">
                            {row.count}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-4 bg-gray-100 rounded overflow-hidden" style={{ width: '120px' }}>
                              <div className="h-full bg-blue-500" style={{ width: `${barWidthPercent}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 w-12">{row.percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-900">Total</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold">
                        {total}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-500">100%</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="text-xs text-gray-600 mt-4 bg-blue-50 p-3 rounded border border-blue-200 text-center">
              <span className="font-semibold">Note:</span> Shows all {schoolDetailed.length} schools/areas with early turnover (&lt;1 year tenure) in {data.quarter}. Sorted by count descending.
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default EarlyTurnoverSlide;
