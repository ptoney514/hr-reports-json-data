import React, { memo, useMemo } from 'react';
// Optimized imports for better tree-shaking
import { BarChart } from 'recharts/lib/chart/BarChart';
import { Bar } from 'recharts/lib/cartesian/Bar';
import { XAxis } from 'recharts/lib/cartesian/XAxis';
import { YAxis } from 'recharts/lib/cartesian/YAxis';
import { CartesianGrid } from 'recharts/lib/cartesian/CartesianGrid';
import { Tooltip } from 'recharts/lib/component/Tooltip';
import { Legend } from 'recharts/lib/component/Legend';
import { ResponsiveContainer } from 'recharts/lib/component/ResponsiveContainer';
import { AlertCircle } from 'lucide-react';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';

const HeadcountChart = memo(({ 
  data = [], 
  title = "Historical Headcount",
  height = 300,
  showLegend = true,
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

  // Memoize data keys calculation for performance
  const dataKeys = useMemo(() => {
    return data.length > 0 ? Object.keys(data[0]).filter(key => 
      key !== 'period' && key !== 'quarter' && key !== 'month' && key !== 'name'
    ) : [];
  }, [data]);

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
    data[0].name ? 'name' : 
    Object.keys(data[0])[0]
  ) : 'period';

  return (
    <ChartErrorBoundary
      chartType="Bar Chart"
      title={title}
      height={height}
      className={className}
      onRetry={() => window.location.reload()}
    >
      <div className={`bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray ${className}`}>
        <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
          {title}
        </h3>
        <ResponsiveContainer width="100%" height={height} className="print:h-48">
          <BarChart 
            data={data} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
                iconType="rect"
              />
            )}
            {dataKeys.map((key, index) => (
              <Bar 
                key={key}
                dataKey={key} 
                fill={colors[index % colors.length]}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartErrorBoundary>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.data === nextProps.data &&
    prevProps.title === nextProps.title &&
    prevProps.height === nextProps.height &&
    prevProps.showLegend === nextProps.showLegend &&
    prevProps.className === nextProps.className
  );
});

export default HeadcountChart; 