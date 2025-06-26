import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp } from 'lucide-react';

const DivisionsChart = ({ 
  data = [], 
  title = "Top Divisions",
  height = 400,
  showLegend = true,
  maxItems = 10,
  sortBy = 'total', // field to sort by
  layout = 'vertical', // 'horizontal' or 'vertical'
  showRanking = true,
  className = ""
}) => {
  // Consistent color palette
  const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed'];

  // Process and sort data (moved before early return)
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    let sortedData = [...data];
    
    // Sort by specified field or first numeric field
    if (sortBy && sortedData[0] && sortedData[0][sortBy] !== undefined) {
      sortedData.sort((a, b) => b[sortBy] - a[sortBy]);
    } else {
      // Find first numeric field to sort by
      const numericFields = Object.keys(sortedData[0] || {}).filter(key => 
        typeof sortedData[0][key] === 'number' && 
        key !== 'rank' && key !== 'id'
      );
      if (numericFields.length > 0) {
        const sortField = numericFields[0];
        sortedData.sort((a, b) => b[sortField] - a[sortField]);
      }
    }
    
    // Limit to max items and add ranking
    return sortedData.slice(0, maxItems).map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }, [data, sortBy, maxItems]);

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

  // Get all data keys except name/division keys
  const dataKeys = processedData.length > 0 ? Object.keys(processedData[0]).filter(key => 
    key !== 'name' && key !== 'division' && key !== 'department' && 
    key !== 'rank' && key !== 'id' && key !== 'category'
  ) : [];

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            {showRanking && dataPoint?.rank && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                #{dataPoint.rank}
              </span>
            )}
            <p className="font-semibold text-gray-900">{label}</p>
          </div>
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

  // Get name/division key
  const nameKey = processedData.length > 0 ? (
    processedData[0].name ? 'name' : 
    processedData[0].division ? 'division' : 
    processedData[0].department ? 'department' : 
    processedData[0].category ? 'category' :
    Object.keys(processedData[0])[0]
  ) : 'name';

  // Custom label formatter for bars
  const CustomLabel = ({ value, index }) => {
    if (showRanking && processedData[index]) {
      return `#${processedData[index].rank}`;
    }
    return null;
  };

  // Render horizontal bar chart (default for divisions)
  if (layout === 'horizontal') {
    return (
      <div className={`bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black">
            {title}
          </h3>
          {showRanking && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <TrendingUp size={16} />
              <span>Ranked by {sortBy || 'value'}</span>
            </div>
          )}
        </div>
        <ResponsiveContainer width="100%" height={height} className="print:h-64">
          <BarChart 
            data={processedData} 
            layout="horizontal"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
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
              tick={{ fontSize: 11 }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && dataKeys.length > 1 && (
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
                radius={[0, 4, 4, 0]}
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
      id={`divisions-chart-${Date.now()}`}
      data-chart-id="divisions-chart"
      data-chart-title={title}
      className={`bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black">
          {title}
        </h3>
        {showRanking && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <TrendingUp size={16} />
            <span>Top {maxItems}</span>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={height} className="print:h-64">
        <BarChart 
          data={processedData} 
          margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={nameKey}
            tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && dataKeys.length > 1 && (
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
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DivisionsChart; 