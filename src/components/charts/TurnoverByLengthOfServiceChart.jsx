import React, { memo, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AlertCircle } from 'lucide-react';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';

const TurnoverByLengthOfServiceChart = memo(({ 
  data = [], 
  title = "Turnover Rates by Length of Service – FY2025",
  employeeType = "Faculty", // "Faculty" or "Staff"
  height = 400,
  className = ""
}) => {
  // Process data for pie chart
  const pieData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Color palette using official Creighton brand colors from BRAND_GUIDELINES.md
    const colors = [
      '#0054A6', // Series 1 - Creighton Blue (Less Than One)
      '#00245D', // Series 2 - Creighton Navy (1 to 5)
      '#1F74DB', // Series 3 - Light Blue (5 to 10)
      '#95D2F3', // Series 4 - Sky Blue (10 to 20)
      '#71CC98'  // Series 5 - Creighton Green (20 Plus)
    ];
    
    return data.map((item, index) => ({
      name: item.name || item.tenure || `Range ${index + 1}`,
      value: item.value || 0,
      percentage: item.percentage || 0,
      fill: colors[index] || colors[colors.length - 1]
    }));
  }, [data]);

  // Custom label with line annotations
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percentage }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius; // Start line from outer edge of pie slice
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
        <h3 className="text-lg font-semibold mb-3" style={{color: '#0054A6'}}>{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto mb-2 text-gray-400" />
            <p>No turnover data available</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <ChartErrorBoundary
      chartType="Turnover by Length of Service Chart"
      title={title}
      height={height}
      className={className}
      onRetry={() => window.location.reload()}
    >
      <div 
        id={`turnover-length-service-chart-${employeeType.toLowerCase()}-${Date.now()}`}
        data-chart-id={`turnover-length-service-chart-${employeeType.toLowerCase()}`}
        data-chart-title={`${title} - ${employeeType}`}
        className={`bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray ${className}`}
      >
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold print:text-black" style={{color: '#0054A6'}}>
            {title} - {employeeType}
          </h3>
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
                dataKey="percentage"
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

        {/* Summary footer - just highest/lowest */}
        <div className="mt-4 pt-4 border-t border-gray-200 print:border-gray-400">
          <div className="text-sm text-gray-600 print:text-black mb-3">
            <span>Highest turnover rate: </span>
            <span className="font-semibold print:text-black" style={{color: '#0054A6'}}>
              {pieData.length > 0 ? `${pieData[0].name} (${pieData[0].percentage.toFixed(1)}%)` : 'N/A'}
            </span>
            <span className="ml-2">
              • Lowest: {pieData.length > 1 ? `${pieData[pieData.length - 1].name} (${pieData[pieData.length - 1].percentage.toFixed(1)}%)` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Descriptive Box with key insights */}
        <div className="mt-4 p-4 border-2 rounded-lg print:bg-white print:border-gray-400" 
             style={{
               borderColor: '#0054A6', 
               backgroundColor: '#F3F3F0' // Light Gray from brand guidelines
             }}>
          <div>
            <h4 className="font-semibold print:text-black mb-3" 
                style={{color: '#00245D'}}> {/* Creighton Navy */}
              {employeeType} - Key Insights:
            </h4>
            <div className="text-sm print:text-black leading-relaxed" 
                 style={{color: '#0054A6'}}> {/* Creighton Blue */}
              <p>
                Turnover rates show{' '}
                <strong>{pieData.length > 0 ? `${pieData[0].percentage.toFixed(1)}%` : 'N/A'}</strong>{' '}
                of {employeeType.toLowerCase()} with{' '}
                <strong>{pieData.length > 0 ? pieData[0].name.toLowerCase() : 'shorter tenure'}</strong> departed,{' '}
                while only <strong>{pieData.length > 1 ? `${pieData[pieData.length - 1].percentage.toFixed(1)}%` : 'N/A'}</strong>{' '}
                of those with <strong>20+ years</strong> left.
              </p>
            </div>
          </div>
        </div>

        {/* Note outside the shaded area */}
        <div className="mt-2">
          <p className="text-xs text-gray-600 print:text-black italic">
            <strong>Note:</strong> Percentages represent specific group turnover rates and are not cumulative.
          </p>
        </div>
      </div>
    </ChartErrorBoundary>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.data === nextProps.data &&
    prevProps.title === nextProps.title &&
    prevProps.employeeType === nextProps.employeeType &&
    prevProps.height === nextProps.height &&
    prevProps.className === nextProps.className
  );
});

export default TurnoverByLengthOfServiceChart;