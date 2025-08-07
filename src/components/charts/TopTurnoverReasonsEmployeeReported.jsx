import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Color palette for different reasons
const COLORS = [
  '#3B82F6', // Blue - Career Advancement
  '#10B981', // Green - Compensation
  '#F59E0B', // Yellow - Supervisor Issues
  '#EF4444', // Red - Work-Life Balance
  '#8B5CF6', // Purple - Retirement
  '#6B7280', // Gray - Other
];

const TopTurnoverReasonsEmployeeReported = ({ 
  data = [], 
  title = "Top Turnover Reasons - Employee Reported",
  height = 400 
}) => {
  // Transform data for the chart
  const chartData = data.map(item => ({
    reason: item.reason,
    total: item.total,
    percentage: item.percentage,
    faculty: item.faculty,
    staff: item.staff
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          <p className="text-blue-600 font-semibold">
            Total: {data.total} ({data.percentage}%)
          </p>
          <div className="text-sm text-gray-600 mt-1">
            <p>Faculty: {data.faculty}</p>
            <p>Staff: {data.staff}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate total separations
  const totalSeparations = data.reduce((sum, item) => sum + item.total, 0);
  const topReason = data.length > 0 ? data[0] : null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-700">{title}</h3>
        <div className="text-sm text-gray-500">
          Total separations: {totalSeparations}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 80
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="reason"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              fontSize={12}
              stroke="#666"
            />
            <YAxis 
              fontSize={12}
              stroke="#666"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="total" 
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-sm">
            <span className="text-gray-600">Top reason accounts for </span>
            <span className="font-semibold text-blue-600">
              {topReason ? `${topReason.percentage}% of all exits` : 'N/A'}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Most common: </span>
            <span className="font-semibold">
              {topReason ? topReason.reason : 'N/A'}
            </span>
          </div>
        </div>
        
        {/* Detailed breakdown */}
        <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {data.slice(0, 3).map((reason, index) => (
            <div key={reason.reason} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index] }}
              ></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {reason.reason}
                </div>
                <div className="text-xs text-gray-500">
                  Faculty: {reason.faculty} | Staff: {reason.staff}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-700">
                {reason.total}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopTurnoverReasonsEmployeeReported;