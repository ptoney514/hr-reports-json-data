import React, { memo, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';
import { getTurnoverMetrics } from '../../services/dataService';

const VoluntaryInvoluntaryTurnoverChart = memo(({
  title = "Creighton University Turnover - Voluntary/Involuntary/Retirement",
  subtitle = "Fiscal Year Ending June 30, 2025*",
  height = 400,
  className = ""
}) => {
  // Get turnover metrics from data service (supports future API integration)
  const turnoverMetrics = getTurnoverMetrics('FY2025');

  // Transform breakdown data from metrics
  const chartData = useMemo(() => {
    return turnoverMetrics.turnoverBreakdown.map(item => ({
      category: item.category,
      involuntary: item.involuntary,
      voluntary: item.voluntary,
      retire: item.retirement,
      total: item.total
    }));
  }, [turnoverMetrics.turnoverBreakdown]);

  // Color scheme using brand colors from image
  const colors = {
    involuntary: '#1e3a8a',  // Dark Blue (77% Female color from image)
    voluntary: '#3b82f6',    // Light Blue (22% Male color from image)
    retire: '#fbbf24'        // Yellow (1% N/A color from image)
  };

  // Calculate the maximum value for scaling
  const maxValue = Math.max(...chartData.map(d => d.total));
  const chartScale = 100; // Scale to 100% width

  // Error handling for missing data
  if (!chartData || chartData.length === 0) {
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
      chartType="Voluntary Involuntary Turnover Chart"
      title={title}
      height={height}
      className={className}
      onRetry={() => window.location.reload()}
    >
      <div 
        id={`voluntary-involuntary-chart-${Date.now()}`}
        data-chart-id="voluntary-involuntary-chart"
        data-chart-title={title}
        className={`bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border border-gray-200 print:border-gray ${className}`}
      >
        {/* Title */}
        <h3 className="text-lg print:text-base font-semibold print:text-black mb-3 print:mb-2" style={{color: '#0054A6'}}>
          {title}
        </h3>
        <p className="text-sm text-gray-600 print:text-black font-medium mb-4 text-center">
          {subtitle}
        </p>

        {/* Legend */}
        <div className="flex justify-center gap-6 mb-4 print:mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: colors.involuntary }}
            />
            <span className="text-sm font-medium text-gray-700 print:text-black">Involuntary</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: colors.voluntary }}
            />
            <span className="text-sm font-medium text-gray-700 print:text-black">Voluntary</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: colors.retire }}
            />
            <span className="text-sm font-medium text-gray-700 print:text-black">Retirement</span>
          </div>
        </div>

        {/* Chart container */}
        <div 
          className="space-y-3"
          role="img"
          aria-label="Voluntary and Involuntary turnover rates by employee category"
        >
          {chartData.map((item, index) => (
            <div 
              key={item.category} 
              className="flex items-center gap-3"
              role="group"
            >
              {/* Category name - fixed width for alignment */}
              <div className="w-32 flex-shrink-0 text-right">
                <span 
                  className="text-sm text-gray-700 pr-2"
                  id={`category-${index}`}
                >
                  {item.category}
                </span>
              </div>
              
              {/* Bar container */}
              <div className="flex-1 relative">
                <div className="w-full bg-gray-100 rounded h-7 relative">
                  {/* Stacked Segments */}
                  <div className="flex h-full rounded overflow-hidden">
                    {/* Involuntary Segment */}
                    <div
                      className="h-full transition-all duration-300 relative flex items-center justify-center"
                      style={{ 
                        width: `${(item.involuntary / maxValue) * chartScale}%`,
                        backgroundColor: colors.involuntary,
                        minWidth: item.involuntary > 0 ? '40px' : '0px'
                      }}
                      title={`Involuntary: ${item.involuntary}%`}
                      role="button"
                      tabIndex="0"
                      aria-label={`Involuntary turnover: ${item.involuntary} percent`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                        }
                      }}
                    >
                      {item.involuntary > 0 && (
                        <span className="text-white text-xs font-semibold px-1">
                          {item.involuntary}%
                        </span>
                      )}
                    </div>
                    {/* Voluntary Segment */}
                    <div
                      className="h-full transition-all duration-300 relative flex items-center justify-center"
                      style={{ 
                        width: `${(item.voluntary / maxValue) * chartScale}%`,
                        backgroundColor: colors.voluntary,
                        minWidth: item.voluntary > 0 ? '48px' : '0px'
                      }}
                      title={`Voluntary: ${item.voluntary}%`}
                      role="button"
                      tabIndex="0"
                      aria-label={`Voluntary turnover: ${item.voluntary} percent`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                        }
                      }}
                    >
                      {item.voluntary > 0 && (
                        <span className="text-white text-xs font-semibold px-1">
                          {item.voluntary}%
                        </span>
                      )}
                    </div>
                    {/* Retire Segment */}
                    <div
                      className="h-full transition-all duration-300 relative flex items-center justify-center"
                      style={{ 
                        width: `${(item.retire / maxValue) * chartScale}%`,
                        backgroundColor: colors.retire,
                        minWidth: item.retire > 0 ? '36px' : '0px'
                      }}
                      title={`Retirement: ${item.retire}%`}
                      role="button"
                      tabIndex="0"
                      aria-label={`Retirement turnover: ${item.retire} percent`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                        }
                      }}
                    >
                      {item.retire > 0 && (
                        <span className="text-gray-800 text-xs font-semibold px-1">
                          {item.retire}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Total percentage at the end */}
              <div className="w-16 text-right">
                <span 
                  className="text-sm font-semibold text-gray-700"
                  aria-label={`Total turnover rate: ${item.total} percent`}
                >
                  {item.total}%
                </span>
              </div>

              {/* Screen Reader Breakdown */}
              <div 
                id={`breakdown-${index}`}
                className="sr-only"
                aria-hidden="true"
              >
                {item.category} breakdown: Involuntary {item.involuntary}%, Voluntary {item.voluntary}%, Retirement {item.retire}%, Total {item.total}%
              </div>
            </div>
          ))}
        </div>

      </div>
    </ChartErrorBoundary>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.subtitle === nextProps.subtitle &&
    prevProps.height === nextProps.height &&
    prevProps.className === nextProps.className
  );
});

export default VoluntaryInvoluntaryTurnoverChart;