import React, { memo, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LabelList } from 'recharts';
import { AlertCircle } from 'lucide-react';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';

const TerminationReasonsPieChart = memo(({ 
  data = [], 
  title = "Top Termination Reasons",
  height = 400,
  className = ""
}) => {
  // Process data for pie chart - top 5 + Other category
  const pieData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Sort by percentage descending
    const sortedData = [...data].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
    
    // Take top 5 reasons
    const top5 = sortedData.slice(0, 5);
    const remaining = sortedData.slice(5);
    
    // Color palette matching reference image (purple shades)
    const colors = [
      '#6366f1', // Series 1 - Indigo
      '#8b5cf6', // Series 2 - Purple
      '#a78bfa', // Series 3 - Light purple
      '#c4b5fd', // Series 4 - Lighter purple
      '#e0e7ff', // Series 5 - Very light purple
      '#e5e7eb'  // Other - Gray
    ];
    
    let processedData = top5.map((item, index) => ({
      name: item.reason || item.name || `Reason ${index + 1}`,
      value: item.total || item.value || 0,
      percentage: item.percentage || 0,
      fill: colors[index]
    }));
    
    // Add "Other" category if there are remaining items
    if (remaining.length > 0) {
      const otherTotal = remaining.reduce((sum, item) => sum + (item.total || item.value || 0), 0);
      const otherPercentage = remaining.reduce((sum, item) => sum + (item.percentage || 0), 0);
      
      processedData.push({
        name: 'Other',
        value: otherTotal,
        percentage: otherPercentage,
        fill: colors[5] // Gray color for Other
      });
    }
    
    return processedData;
  }, [data]);

  // Custom label with line annotations
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percentage, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const labelRadius = outerRadius + 30;
    
    // Calculate positions
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const labelX = cx + labelRadius * Math.cos(-midAngle * RADIAN);
    const labelY = cy + labelRadius * Math.sin(-midAngle * RADIAN);
    
    // Determine text anchor based on position
    const textAnchor = labelX > cx ? 'start' : 'end';
    
    return (
      <g>
        {/* Label line from pie edge to label */}
        <line
          x1={x}
          y1={y}
          x2={labelX}
          y2={labelY}
          stroke="#666"
          strokeWidth={1}
          className="print:stroke-black"
        />
        {/* Label text */}
        <text
          x={labelX}
          y={labelY}
          fill="#333"
          textAnchor={textAnchor}
          dominantBaseline="central"
          fontSize="12"
          fontWeight="500"
          className="print:fill-black"
        >
          {`${name} (${percentage.toFixed(1)}%)`}
        </text>
      </g>
    );
  };

  // Error handling for missing or invalid data
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow-sm border ${className}`}>
        <h3 className="text-lg font-semibold text-blue-700 mb-3">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto mb-2 text-gray-400" />
            <p>No termination data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total for display
  const totalTerminations = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartErrorBoundary
      chartType="Termination Reasons Pie Chart"
      title={title}
      height={height}
      className={className}
      onRetry={() => window.location.reload()}
    >
      <div 
        id={`termination-reasons-pie-chart-${Date.now()}`}
        data-chart-id="termination-reasons-pie-chart"
        data-chart-title={title}
        className={`bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray ${className}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-blue-700 print:text-black">{title}</h3>
          <div className="text-lg font-medium text-gray-700 print:text-black">
            Total: {totalTerminations}
          </div>
        </div>
        
        {/* Pie Chart Container */}
        <div className="relative">
          <ResponsiveContainer width="100%" height={height} className="print:h-80">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={false}
                stroke="#fff"
                strokeWidth={2}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 print:border-gray-400">
          <div className="text-sm text-gray-600 print:text-black">
            <span>Top reason accounts for </span>
            <span className="font-semibold text-blue-600 print:text-black">
              {pieData.length > 0 ? `${pieData[0].percentage.toFixed(1)}% of all terminations` : 'N/A'}
            </span>
            {pieData.length > 5 && (
              <span className="ml-2">
                • Other reasons combined: {pieData[pieData.length - 1].percentage.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </ChartErrorBoundary>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.data === nextProps.data &&
    prevProps.title === nextProps.title &&
    prevProps.height === nextProps.height &&
    prevProps.className === nextProps.className
  );
});

export default TerminationReasonsPieChart;