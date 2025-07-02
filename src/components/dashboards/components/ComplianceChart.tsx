import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ComplianceChartProps } from '../../../types/components';
import { ComplianceByType } from '../../../types';

const ComplianceChart: React.FC<ComplianceChartProps> = ({
  data,
  title = "Compliance Chart",
  showLegend = true,
  showTooltip = true,
  height = 240,
  interactive = true,
  exportable = true,
  onBarClick,
  loading = false,
  error = null,
  className = '',
  ...ariaProps
}) => {
  // Transform data for bar chart
  const chartData = data.map((type: ComplianceByType) => ({
    name: type.name,
    'On-Time': type.onTime,
    'Late': type.late,
    'Total': type.total,
    'Rate': type.rate
  }));

  // Custom tooltip formatter
  const formatTooltip = (value: number, name: string, props: any) => {
    if (name === 'Rate') {
      return [`${value}%`, 'Compliance Rate'];
    }
    return [value, name];
  };

  // Handle bar click events
  const handleBarClick = (data: any) => {
    if (interactive && onBarClick && data?.activePayload) {
      const clickedData = data.activePayload[0]?.payload;
      if (clickedData) {
        const originalData = data.find((item: ComplianceByType) => item.name === clickedData.name);
        if (originalData) {
          onBarClick(originalData);
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
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={className} 
      role="img"
      aria-label={`${title} - Bar chart showing compliance data for ${data.length} employee types`}
      {...ariaProps}
    >
      <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
        {title}
      </h3>
      
      <ResponsiveContainer width="100%" height={height} className="print:h-48">
        <BarChart 
          data={chartData} 
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          {...(interactive && { onClick: handleBarClick })}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          
          {showTooltip && (
            <Tooltip 
              formatter={formatTooltip}
              labelStyle={{ color: '#374151', fontWeight: 'bold' }}
              contentStyle={{ 
                backgroundColor: '#f9fafb', 
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            />
          )}
          
          {showLegend && (
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
            />
          )}
          
          <Bar 
            dataKey="On-Time" 
            fill="#10b981" 
            name="On-Time"
            radius={[2, 2, 0, 0]}
            cursor={interactive ? 'pointer' : 'default'}
          />
          <Bar 
            dataKey="Late" 
            fill="#ef4444" 
            name="Late"
            radius={[2, 2, 0, 0]}
            cursor={interactive ? 'pointer' : 'default'}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Screen reader accessible data table */}
      <table className="sr-only" aria-label={`${title} data table`}>
        <caption>{title} - Detailed breakdown by employee type</caption>
        <thead>
          <tr>
            <th>Employee Type</th>
            <th>On-Time</th>
            <th>Late</th>
            <th>Total</th>
            <th>Compliance Rate</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.onTime}</td>
              <td>{item.late}</td>
              <td>{item.total}</td>
              <td>{item.rate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComplianceChart;