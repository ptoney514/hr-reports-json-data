import React, { memo, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';

const FacultyTurnoverByDivisionChart = memo(({ 
  data = [], 
  title = "Faculty Turnover by Division",
  height = 400,
  className = ""
}) => {
  // Transform data for horizontal bar chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Sort data by turnover rate in descending order
    return data
      .map((item) => ({
        name: item.division || item.name || 'Unknown',
        rate: item.rate || 0
      }))
      .sort((a, b) => b.rate - a.rate);
  }, [data]);

  // Calculate max value for scaling bars
  const maxValue = useMemo(() => {
    return Math.max(...chartData.map(item => item.rate), 1);
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
        id={`faculty-turnover-division-chart-${Date.now()}`}
        data-chart-id="faculty-turnover-division-chart"
        data-chart-title={title}
        className={`bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray ${className}`}
      >
        {/* Title */}
        <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
          {title}
        </h3>
        
        {/* Chart container */}
        <div className="space-y-3">
          {chartData.map((item, index) => {
            const isTotalFacultyTurnover = item.name === "Total Faculty Turnover";
            
            return (
              <div 
                key={index} 
                className="flex items-center gap-3"
              >
                {/* Division name - fixed width for alignment */}
                <div className="w-56 flex-shrink-0 text-right">
                  <span className="text-sm text-gray-700 pr-2">
                    {item.name}
                  </span>
                </div>
                
                {/* Bar container */}
                <div className="flex-1 relative max-w-md">
                  <div className="w-full bg-gray-100 rounded h-7 relative">
                    <div 
                      className={`h-7 rounded transition-all duration-300 flex items-center justify-end pr-2 relative ${
                        isTotalFacultyTurnover 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-md' 
                          : 'bg-green-500'
                      }`}
                      style={{ 
                        width: `${(item.rate / maxValue) * 100}%`,
                        minWidth: item.rate > 0 ? '48px' : '0px' // Ensure minimum width for small values
                      }}
                    >
                      {/* Percentage label inside the bar */}
                      {item.rate > 0 && (
                        <span className="text-white text-sm font-semibold">
                          {item.rate.toFixed(1)}%
                        </span>
                      )}
                      
                      {/* Add diagonal pattern for total faculty turnover */}
                      {isTotalFacultyTurnover && (
                        <div 
                          className="absolute inset-0 rounded opacity-20"
                          style={{
                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, white 3px, white 6px)'
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Data represents faculty turnover rates by academic division. 
            <span className="inline-flex items-center gap-1 ml-1">
              <span>📊</span>
              <strong className="text-blue-600">Total Faculty Turnover</strong>
            </span>
            {" "}shows the overall average across all divisions.
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

export default FacultyTurnoverByDivisionChart;