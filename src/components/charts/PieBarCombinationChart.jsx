import React, { memo, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';

const PieBarCombinationChart = memo(({ 
  data = [], 
  title = "Primary Reasons for Voluntary Turnover",
  height = 350,
  className = ""
}) => {
  // Transform data for both charts with exact color mapping
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Exact color mapping from screenshot
    const colorMap = {
      'Career Advancement': '#4f46e5',     // Blue
      'Compensation': '#10b981',           // Green
      'Work-Life Balance': '#f59e0b',      // Yellow
      'Retirement': '#f97316',             // Orange
      'Relocation': '#8b5cf6',             // Purple
      'Other': '#6ee7b7'                   // Light Green
    };
    
    return data.map((item) => ({
      name: item.name || 'Unknown',
      value: item.value || 0,
      percentage: item.percentage || 0,
      fill: colorMap[item.name] || '#94a3b8' // fallback gray
    }));
  }, [data]);

  // Error handling for missing or invalid data
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
        <h3 className="text-xl font-bold text-blue-600 mb-4">{title}</h3>
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
        id={`horizontal-bar-chart-${Date.now()}`}
        data-chart-id="horizontal-bar-chart"
        data-chart-title={title}
        className={`bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray ${className}`}
      >
        {/* Title */}
        <h3 className="text-xl print:text-lg font-bold text-blue-600 print:text-black mb-6 print:mb-4">
          {title}
        </h3>
        
        {/* Full Width: Horizontal Bar Chart with Legend */}
        <div className="max-w-2xl mx-auto space-y-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              {/* Colored dot indicator */}
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.fill }}
              ></div>
              
              {/* Label */}
              <span className="text-sm font-medium text-gray-700 w-36 flex-shrink-0">
                {item.name}
              </span>
              
              {/* Bar container */}
              <div className="flex-1 relative">
                <div className="w-full bg-gray-100 rounded-full h-5">
                  <div 
                    className="h-5 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: item.fill 
                    }}
                  ></div>
                </div>
              </div>
              
              {/* Percentage at end */}
              <span className="text-sm font-bold text-gray-900 w-12 text-right">
                {item.percentage}%
              </span>
            </div>
          ))}
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

export default PieBarCombinationChart;