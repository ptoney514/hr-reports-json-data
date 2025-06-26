import React, { memo, useMemo, useCallback } from 'react';
// Optimized imports for better tree-shaking
import { PieChart } from 'recharts/lib/chart/PieChart';
import { Pie } from 'recharts/lib/polar/Pie';
import { Cell } from 'recharts/lib/component/Cell';
import { Tooltip } from 'recharts/lib/component/Tooltip';
import { Legend } from 'recharts/lib/component/Legend';
import { ResponsiveContainer } from 'recharts/lib/component/ResponsiveContainer';
import { AlertCircle } from 'lucide-react';

const TurnoverPieChart = memo(({ 
  data = [], 
  title = "Distribution Chart",
  height = 300,
  showLegend = true,
  showLabels = true,
  showPercentages = true,
  innerRadius = 0, // Set to > 0 for donut chart
  outerRadius = 80,
  legendPosition = 'right', // 'right', 'bottom', 'top'
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

  // Process data to ensure we have name and value fields
  const processedData = useMemo(() => {
    return data.map((item, index) => {
      // Handle different data structures
      const name = item.name || item.label || item.category || item.type || `Item ${index + 1}`;
      const value = item.value || item.count || item.total || item.amount || 0;
      
      return {
        ...item,
        name,
        value,
        color: item.color || colors[index % colors.length]
      };
    });
  }, [data]);

  // Calculate total for percentage calculations
  const total = processedData.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-1">{data.name}</p>
          <p className="text-sm text-gray-600">
            Value: <span className="font-medium">{data.value.toLocaleString()}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label renderer
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
    if (!showLabels) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if percentage is significant enough
    if (percent < 0.05) return null; // Don't show labels for slices < 5%

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {showPercentages ? `${(percent * 100).toFixed(0)}%` : value.toLocaleString()}
      </text>
    );
  };

  // Custom legend formatter
  const CustomLegend = ({ payload }) => {
    if (!showLegend) return null;
    
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {payload.map((entry, index) => {
          const percentage = total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : 0;
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-700">
                {entry.value}: {entry.payload.value.toLocaleString()} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Determine layout based on legend position
  const isBottomLegend = legendPosition === 'bottom';
  const chartHeight = isBottomLegend ? height - 60 : height;

  return (
    <div className={`bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray ${className}`}>
      <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
        {title}
      </h3>
      
      {/* Summary stats */}
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-600">
          Total: <span className="font-semibold text-gray-900">{total.toLocaleString()}</span>
          {processedData.length > 0 && (
            <span className="ml-2 text-gray-500">
              ({processedData.length} categories)
            </span>
          )}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={chartHeight} className="print:h-48">
        <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <Pie
            data={processedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && legendPosition === 'right' && (
            <Legend 
              verticalAlign="middle" 
              align="right" 
              layout="vertical"
              wrapperStyle={{ fontSize: '12px' }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>

      {/* Bottom legend */}
      {showLegend && legendPosition === 'bottom' && (
        <CustomLegend payload={processedData.map((item, index) => ({
          value: item.name,
          color: item.color,
          payload: item
        }))} />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data) &&
    prevProps.title === nextProps.title &&
    prevProps.height === nextProps.height &&
    prevProps.showLegend === nextProps.showLegend &&
    prevProps.showLabels === nextProps.showLabels &&
    prevProps.showPercentages === nextProps.showPercentages &&
    prevProps.innerRadius === nextProps.innerRadius &&
    prevProps.outerRadius === nextProps.outerRadius &&
    prevProps.legendPosition === nextProps.legendPosition &&
    prevProps.className === nextProps.className
  );
});

export default TurnoverPieChart; 