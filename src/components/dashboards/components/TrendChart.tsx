import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendChartProps } from '../../../types/components';
import { TrendData } from '../../../types';

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title = "Trend Chart",
  showGrid = true,
  showDots = true,
  height = 240,
  timeRange,
  interactive = true,
  exportable = true,
  onDataPointClick,
  loading = false,
  error = null,
  className = '',
  ...ariaProps
}) => {
  // Transform data for line chart
  const chartData = data.map((item: TrendData) => ({
    quarter: item.quarter,
    compliance: item.compliance,
    target: 95, // Fixed target line at 95%
    processed: item.processed
  }));

  // Custom tooltip formatter
  const formatTooltip = (value: number, name: string, props: any) => {
    if (name === 'compliance') {
      return [`${value}%`, 'Compliance Rate'];
    }
    if (name === 'target') {
      return [`${value}%`, 'Target'];
    }
    if (name === 'processed') {
      return [value, 'Forms Processed'];
    }
    return [value, name];
  };

  // Custom label formatter for tooltip
  const formatLabel = (label: string) => {
    return `Quarter: ${label}`;
  };

  // Handle data point click events
  const handleClick = (data: any) => {
    if (interactive && onDataPointClick && data && data.activePayload) {
      const clickedData = data.activePayload[0]?.payload;
      if (clickedData) {
        const originalData = data.find((item: TrendData) => item.quarter === clickedData.quarter);
        if (originalData) {
          onDataPointClick(originalData);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className={className} {...ariaProps}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="h-60 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} {...ariaProps}>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">{title}</h3>
        <div className="flex items-center justify-center h-60 bg-red-50 border border-red-200 rounded">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading chart</p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={className} {...ariaProps}>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">{title}</h3>
        <div className="flex items-center justify-center h-60 bg-gray-50 border border-gray-200 rounded">
          <p className="text-gray-500">No trend data available</p>
        </div>
      </div>
    );
  }

  // Calculate trend direction
  const firstValue = data[0]?.compliance || 0;
  const lastValue = data[data.length - 1]?.compliance || 0;
  const trendDirection = lastValue > firstValue ? 'increasing' : lastValue < firstValue ? 'decreasing' : 'stable';
  const trendPercentage = firstValue > 0 ? ((lastValue - firstValue) / firstValue * 100).toFixed(1) : '0';

  return (
    <div 
      className={className}
      role="img"
      aria-label={`${title} - Line chart showing compliance trends over ${data.length} quarters, currently ${trendDirection} by ${Math.abs(Number(trendPercentage))}%`}
      {...ariaProps}
    >
      <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
        {title}
      </h3>
      
      <ResponsiveContainer width="100%" height={height} className="print:h-48">
        <LineChart 
          data={chartData} 
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          {...(interactive && { onClick: handleClick })}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          )}
          
          <XAxis 
            dataKey="quarter" 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis 
            domain={[80, 100]} 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            label={{ value: 'Compliance %', angle: -90, position: 'insideLeft' }}
          />
          
          <Tooltip 
            formatter={formatTooltip}
            labelFormatter={formatLabel}
            labelStyle={{ color: '#374151', fontWeight: 'bold' }}
            contentStyle={{ 
              backgroundColor: '#f9fafb', 
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '12px'
            }}
          />
          
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
          />
          
          <Line 
            type="monotone" 
            dataKey="compliance" 
            stroke="#1d4ed8" 
            strokeWidth={3}
            name="Compliance Rate"
            dot={showDots ? { fill: '#1d4ed8', strokeWidth: 2, r: 4 } : false}
            activeDot={interactive ? { r: 6, stroke: '#1d4ed8', strokeWidth: 2 } : false}
            cursor={interactive ? 'pointer' : 'default'}
          />
          
          <Line 
            type="monotone" 
            dataKey="target" 
            stroke="#ef4444" 
            strokeWidth={2}
            strokeDasharray="5 5" 
            name="Target (95%)"
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Additional trend information */}
      <div className="mt-2 text-xs text-gray-600 print:text-black">
        <p>
          Trend: <span className={`font-medium ${
            trendDirection === 'increasing' ? 'text-green-600' : 
            trendDirection === 'decreasing' ? 'text-red-600' : 
            'text-gray-600'
          } print:text-black`}>
            {trendDirection} {Math.abs(Number(trendPercentage))}%
          </span> over {data.length} quarters
        </p>
      </div>

      {/* Screen reader accessible data table */}
      <table className="sr-only" aria-label={`${title} data table`}>
        <caption>{title} - Quarterly compliance trends with target comparison</caption>
        <thead>
          <tr>
            <th>Quarter</th>
            <th>Compliance Rate</th>
            <th>Target</th>
            <th>Forms Processed</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.quarter}</td>
              <td>{item.compliance}%</td>
              <td>95%</td>
              <td>{item.processed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrendChart;