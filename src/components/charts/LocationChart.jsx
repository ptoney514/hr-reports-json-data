import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle } from 'lucide-react';

const LocationChart = ({ 
  data = [], 
  title = "Distribution by Location",
  height = 300,
  showLegend = true,
  layout = 'horizontal', // 'horizontal' or 'vertical'
  stacked = true,
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

  // Get all data keys except the name/location key
  const dataKeys = data.length > 0 ? Object.keys(data[0]).filter(key => 
    key !== 'name' && key !== 'location' && key !== 'campus' && key !== 'site'
  ) : [];

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm" style={{ color: entry.color }}>
                {entry.dataKey}:
              </span>
              <span className="font-medium ml-2">
                {entry.value.toLocaleString()}
                {stacked && total > 0 && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({((entry.value / total) * 100).toFixed(1)}%)
                  </span>
                )}
              </span>
            </div>
          ))}
          {stacked && (
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center font-semibold">
                <span>Total:</span>
                <span>{total.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Get name/location key
  const nameKey = data.length > 0 ? (
    data[0].name ? 'name' : 
    data[0].location ? 'location' : 
    data[0].campus ? 'campus' : 
    data[0].site ? 'site' : 
    Object.keys(data[0])[0]
  ) : 'name';

  // Render horizontal bar chart
  if (layout === 'horizontal') {
    return (
      <div className={`bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray ${className}`}>
        <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
          {title}
        </h3>
        <ResponsiveContainer width="100%" height={height} className="print:h-48">
          <BarChart 
            data={data} 
            layout="horizontal"
            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <YAxis 
              type="category"
              dataKey={nameKey}
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
              width={50}
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
                stackId={stacked ? "stack" : undefined}
                radius={stacked ? undefined : [0, 2, 2, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Render vertical bar chart
  return (
    <div 
      id={`location-chart-${Date.now()}`}
      data-chart-id="location-chart"
      data-chart-title={title}
      className={`bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray ${className}`}
    >
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
            dataKey={nameKey}
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
              stackId={stacked ? "stack" : undefined}
              radius={stacked ? undefined : [2, 2, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LocationChart; 