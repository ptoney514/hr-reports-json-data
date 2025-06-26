import React, { memo } from 'react';
// Standard recharts imports
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle } from 'lucide-react';

const StartersLeaversChart = memo(({ 
  data = [], 
  title = "Starters vs Leavers Trend",
  height = 300,
  showLegend = true,
  showGrid = true,
  className = ""
}) => {
  // Consistent color palette
  const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed'];

  // Error handling for missing or invalid data
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow-sm border ${className}`}>
        <h3 className="text-lg font-semibold text-blue-700 mb-3">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto mb-2 text-gray-400" />
            <p>No data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Get all data keys except the x-axis key
  const dataKeys = data.length > 0 ? Object.keys(data[0]).filter(key => 
    key !== 'period' && key !== 'quarter' && key !== 'month' && key !== 'name' && key !== 'date'
  ) : [];

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get x-axis key
  const xAxisKey = data.length > 0 ? (
    data[0].period ? 'period' : 
    data[0].quarter ? 'quarter' : 
    data[0].month ? 'month' : 
    data[0].date ? 'date' :
    data[0].name ? 'name' : 
    Object.keys(data[0])[0]
  ) : 'period';

  // Define line styles for common data types
  const getLineStyle = (key) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('target') || lowerKey.includes('goal')) {
      return { strokeDasharray: "5 5", strokeWidth: 2 };
    }
    if (lowerKey.includes('trend') || lowerKey.includes('average')) {
      return { strokeDasharray: "3 3", strokeWidth: 2 };
    }
    return { strokeWidth: 3 };
  };

  return (
    <div 
      id={`starters-leavers-chart-${Date.now()}`}
      data-chart-id="starters-leavers-chart"
      data-chart-title={title}
      className={`bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray ${className}`}
    >
      <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={height} className="print:h-48">
        <LineChart 
          data={data} 
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          )}
          <XAxis 
            dataKey={xAxisKey}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
          )}
          {dataKeys.map((key, index) => (
            <Line 
              key={key}
              type="monotone"
              dataKey={key} 
              stroke={colors[index % colors.length]}
              dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2 }}
              {...getLineStyle(key)}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.data === nextProps.data &&
    prevProps.title === nextProps.title &&
    prevProps.height === nextProps.height &&
    prevProps.showLegend === nextProps.showLegend &&
    prevProps.showGrid === nextProps.showGrid &&
    prevProps.className === nextProps.className
  );
});

export default StartersLeaversChart; 