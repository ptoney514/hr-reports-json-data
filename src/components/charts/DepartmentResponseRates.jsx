import React, { memo, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, BarChart3, Award } from 'lucide-react';
import { getExitSurveyData } from '../../data/staticData';

/**
 * DepartmentResponseRates Component
 * Displays exit survey response rates by department/school
 * Supports both bar chart and table visualizations
 */
const DepartmentResponseRates = memo(({
  reportingDate = "2025-06-30",
  height = 400,
  className = "",
  showTitle = true,
  layout = "both", // "chart" | "table" | "both"
  sortBy = "responseRate" // "responseRate" | "exits" | "responses"
}) => {
  // Get department exit data
  const departmentData = useMemo(() => {
    const exitData = getExitSurveyData(reportingDate);

    if (!exitData || !exitData.departmentExits) {
      return [];
    }

    // Convert response rate strings to numbers for sorting
    const processedData = exitData.departmentExits.map(dept => ({
      ...dept,
      responseRateNum: parseFloat(dept.responseRate) || 0
    }));

    // Sort based on sortBy parameter
    const sorted = [...processedData].sort((a, b) => {
      switch (sortBy) {
        case 'exits':
          return b.exits - a.exits;
        case 'responses':
          return b.responses - a.responses;
        case 'responseRate':
        default:
          return b.responseRateNum - a.responseRateNum;
      }
    });

    return sorted;
  }, [reportingDate, sortBy]);

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-semibold text-gray-900 mb-3">{data.department}</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center gap-4">
              <span className="text-gray-600">Response Rate:</span>
              <span className="font-bold text-lg" style={{
                color: data.responseRateNum >= 50 ? '#16a34a' :
                       data.responseRateNum >= 30 ? '#d97706' :
                       data.responseRateNum > 0 ? '#ea580c' : '#dc2626'
              }}>
                {data.responseRate}
              </span>
            </div>
            <div className="flex justify-between gap-4 pt-2 border-t border-gray-100">
              <span className="text-gray-600">Responses:</span>
              <span className="font-medium text-blue-600">{data.responses}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Total Exits:</span>
              <span className="font-medium text-gray-900">{data.exits}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get color based on response rate
  const getResponseRateColor = (rate) => {
    if (rate >= 50) return '#16a34a'; // green-600
    if (rate >= 30) return '#d97706'; // amber-600
    if (rate > 0) return '#ea580c'; // orange-600
    return '#dc2626'; // red-600
  };

  // Calculate summary statistics
  const stats = useMemo(() => {
    const total = departmentData.reduce((acc, dept) => ({
      exits: acc.exits + dept.exits,
      responses: acc.responses + dept.responses
    }), { exits: 0, responses: 0 });

    const avgResponseRate = total.exits > 0
      ? Math.round((total.responses / total.exits) * 100)
      : 0;

    const highPerformers = departmentData.filter(d => d.responseRateNum >= 50).length;
    const needsImprovement = departmentData.filter(d => d.responseRateNum < 30).length;

    return {
      totalExits: total.exits,
      totalResponses: total.responses,
      avgResponseRate,
      highPerformers,
      needsImprovement,
      departmentCount: departmentData.length
    };
  }, [departmentData]);

  if (departmentData.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <BarChart3 className="mx-auto mb-3 text-gray-400" size={48} />
          <p className="text-gray-600">No department response rate data available for this period</p>
        </div>
      </div>
    );
  }

  const renderChart = () => (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={departmentData}
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 200, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis
            type="category"
            dataKey="department"
            width={180}
            tick={{ fontSize: 11, fill: '#374151' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="responseRateNum"
            radius={[0, 4, 4, 0]}
          >
            {departmentData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getResponseRateColor(entry.responseRateNum)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            <th className="text-left p-3 font-semibold text-gray-700">Department/School</th>
            <th className="text-center p-3 font-semibold text-gray-700">Total Exits</th>
            <th className="text-center p-3 font-semibold text-gray-700">Responses</th>
            <th className="text-center p-3 font-semibold text-gray-700">Response Rate</th>
            <th className="text-center p-3 font-semibold text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {departmentData.map((dept, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="p-3">
                <span className="font-medium text-gray-900">{dept.department}</span>
              </td>
              <td className="p-3 text-center">
                <span className="font-medium text-gray-900">{dept.exits}</span>
              </td>
              <td className="p-3 text-center">
                <span className="font-medium text-blue-600">{dept.responses}</span>
              </td>
              <td className="p-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${dept.responseRateNum}%`,
                        backgroundColor: getResponseRateColor(dept.responseRateNum)
                      }}
                    />
                  </div>
                  <span
                    className="font-bold min-w-[3.5rem] text-right"
                    style={{ color: getResponseRateColor(dept.responseRateNum) }}
                  >
                    {dept.responseRate}
                  </span>
                </div>
              </td>
              <td className="p-3 text-center">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  dept.responseRateNum >= 50 ? 'bg-green-100 text-green-700' :
                  dept.responseRateNum >= 30 ? 'bg-amber-100 text-amber-700' :
                  dept.responseRateNum > 0 ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {dept.responseRateNum >= 50 ? '✓ Excellent' :
                   dept.responseRateNum >= 30 ? '◐ Good' :
                   dept.responseRateNum > 0 ? '⚠ Needs Work' : '✗ No Response'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {showTitle && (
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 size={20} style={{ color: '#0054A6' }} />
                School/Department Response Rates
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Exit survey participation by department
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-gray-400" />
                <span className="text-gray-600">{stats.departmentCount} departments</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{stats.avgResponseRate}%</div>
          <div className="text-xs text-blue-600 mt-1">Avg Response Rate</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center border border-green-200">
          <div className="text-2xl font-bold text-green-700">{stats.highPerformers}</div>
          <div className="text-xs text-green-600 mt-1">High Performers (≥50%)</div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 text-center border border-gray-200">
          <div className="text-2xl font-bold text-gray-700">{stats.totalResponses}</div>
          <div className="text-xs text-gray-600 mt-1">Total Responses</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center border border-orange-200">
          <div className="text-2xl font-bold text-orange-700">{stats.needsImprovement}</div>
          <div className="text-xs text-orange-600 mt-1">Needs Improvement (&lt;30%)</div>
        </div>
      </div>

      {/* Content based on layout */}
      {layout === 'chart' && renderChart()}
      {layout === 'table' && renderTable()}
      {layout === 'both' && (
        <div className="space-y-6">
          {renderChart()}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award size={18} style={{ color: '#0054A6' }} />
              Detailed Breakdown
            </h4>
            {renderTable()}
          </div>
        </div>
      )}

      {/* Key Insights */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Award size={16} className="text-green-600" />
              Top Performers
            </h5>
            <ul className="space-y-2">
              {departmentData
                .filter(d => d.responseRateNum > 0)
                .slice(0, 3)
                .map((dept, index) => (
                  <li key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-gray-700 font-medium">{dept.department}</span>
                    <span className="text-green-700 font-bold">{dept.responseRate}</span>
                  </li>
                ))}
              {departmentData.filter(d => d.responseRateNum > 0).length === 0 && (
                <li className="text-gray-500 italic">No responses recorded yet</li>
              )}
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-orange-600" />
              Improvement Opportunities
            </h5>
            <ul className="space-y-2">
              {departmentData
                .filter(d => d.responseRateNum < 30 && d.exits > 0)
                .slice(0, 3)
                .map((dept, index) => (
                  <li key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                    <span className="text-gray-700 font-medium">{dept.department}</span>
                    <span className="text-orange-700 font-bold">
                      {dept.responseRate} ({dept.responses}/{dept.exits})
                    </span>
                  </li>
                ))}
              {departmentData.filter(d => d.responseRateNum < 30 && d.exits > 0).length === 0 && (
                <li className="text-green-600 flex items-center gap-2">
                  <Award size={14} />
                  All departments meeting minimum 30% threshold
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

DepartmentResponseRates.displayName = 'DepartmentResponseRates';

export default DepartmentResponseRates;
