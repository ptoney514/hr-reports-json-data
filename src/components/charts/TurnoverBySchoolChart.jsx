import React, { memo, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';

const TurnoverBySchoolChart = memo(({ 
  data = [], 
  title = "Turnover by School/Org",
  height = 350,
  className = ""
}) => {
  // Transform data for horizontal bar chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Sort data by turnover count in descending order
    return data
      .map((item) => ({
        name: item.name || item.school || item.organization || 'Unknown',
        value: item.value || item.turnover || item.count || 0
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  // Calculate total for validation
  const total = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  // Calculate max value for scaling bars
  const maxValue = useMemo(() => {
    return Math.max(...chartData.map(item => item.value), 1);
  }, [chartData]);

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

  return (
    <ChartErrorBoundary
      chartType="Horizontal Bar Chart"
      title={title}
      height={height}
      className={className}
      onRetry={() => window.location.reload()}
    >
      <div 
        id={`turnover-school-chart-${Date.now()}`}
        data-chart-id="turnover-school-chart"
        data-chart-title={title}
        className={`bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray ${className}`}
      >
        {/* Title */}
        <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
          {title}
        </h3>
        
        {/* Chart container with scrollable area for many items */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              {/* School/Org name - fixed width for alignment */}
              <div className="w-48 flex-shrink-0 text-right">
                <span className="text-sm text-gray-700 pr-2">
                  {item.name}
                </span>
              </div>
              
              {/* Bar container */}
              <div className="flex-1 relative max-w-md">
                <div className="w-full bg-gray-100 rounded h-6 relative">
                  <div 
                    className="h-6 bg-blue-500 rounded transition-all duration-300 flex items-center justify-center relative"
                    style={{ 
                      width: `${(item.value / maxValue) * 100}%`,
                      minWidth: item.value > 0 ? '32px' : '0px' // Ensure minimum width for small values
                    }}
                  >
                    {/* Label inside the bar */}
                    {item.value > 0 && (
                      <span className="text-white text-xs font-semibold">
                        {item.value}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total display at bottom */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Total Employee Turnover</span>
            <span className="text-lg font-bold text-blue-600">{total}</span>
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

export default TurnoverBySchoolChart;