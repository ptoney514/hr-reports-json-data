import React from 'react';
import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';

/**
 * Standardized Chart Container Component
 * 
 * Provides consistent styling, error handling, and print optimization for all chart components.
 * Includes loading states, empty states, and responsive design.
 * 
 * @param {Object} props
 * @param {string} props.title - Chart title
 * @param {string} props.subtitle - Optional chart subtitle/description
 * @param {React.ReactNode} props.children - Chart component (Recharts, etc.)
 * @param {boolean} props.loading - Loading state
 * @param {string|null} props.error - Error message if any
 * @param {boolean} props.isEmpty - Whether the chart has no data
 * @param {string} props.height - Chart height (default: '300px')
 * @param {string} props.id - Unique ID for PDF export capture
 * @param {string} props.dataSource - Data source indicator for debugging
 * @param {Object} props.debugInfo - Additional debug information
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showDataSource - Whether to show data source in debug mode
 */
const ChartContainer = ({
  title,
  subtitle,
  children,
  loading = false,
  error = null,
  isEmpty = false,
  height = '300px',
  id,
  dataSource,
  debugInfo = {},
  className = '',
  showDataSource = process.env.NODE_ENV === 'development'
}) => {
  // Generate unique ID if not provided
  const chartId = id || `chart-${title?.toLowerCase().replace(/\s+/g, '-') || 'unnamed'}`;

  // Determine chart state
  const hasError = !!error;
  const isLoading = loading;
  const hasNoData = isEmpty || (!loading && !error && !children);

  // Render loading state
  if (isLoading) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow-sm border chart-container page-break-inside-avoid ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-blue-700 chart-title">{title}</h2>
          {showDataSource && dataSource && (
            <span className="text-xs text-gray-400 no-print">
              Source: {dataSource}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
        )}
        
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (hasError) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow-sm border chart-container page-break-inside-avoid ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-blue-700 chart-title">{title}</h2>
          {showDataSource && dataSource && (
            <span className="text-xs text-gray-400 no-print">
              Source: {dataSource}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
        )}
        
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 font-medium">Chart Error</p>
            <p className="text-xs text-gray-500 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Render empty state
  if (hasNoData) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow-sm border chart-container page-break-inside-avoid ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-blue-700 chart-title">{title}</h2>
          {showDataSource && dataSource && (
            <span className="text-xs text-gray-400 no-print">
              Source: {dataSource}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
        )}
        
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">No Data Available</p>
            <p className="text-xs text-gray-400 mt-1">
              Data may be loading or no records match the current filters
            </p>
            {showDataSource && Object.keys(debugInfo).length > 0 && (
              <div className="mt-2 text-xs text-gray-400 no-print">
                {Object.entries(debugInfo).map(([key, value]) => (
                  <div key={key}>{key}: {String(value)}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render chart with data
  return (
    <ChartErrorBoundary>
      <div 
        id={chartId}
        className={`bg-white p-4 rounded-lg shadow-sm border chart-container page-break-inside-avoid ${className}`}
        data-chart-title={title}
      >
        {/* Chart Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-blue-700 chart-title print:text-black">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-600 print:text-gray-800 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {showDataSource && dataSource && (
            <span className="text-xs text-gray-400 no-print">
              Source: {dataSource}
            </span>
          )}
        </div>

        {/* Chart Content */}
        <div 
          className="chart-component"
          style={{ height }}
        >
          {children}
        </div>

        {/* Debug Information (Development Only) */}
        {showDataSource && Object.keys(debugInfo).length > 0 && (
          <div className="mt-2 text-xs text-gray-400 no-print border-t pt-2">
            <details className="cursor-pointer">
              <summary className="font-medium">Debug Info</summary>
              <div className="mt-1 space-y-1">
                {Object.entries(debugInfo).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium">{key}:</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>
    </ChartErrorBoundary>
  );
};

/**
 * Chart Grid Container Component
 * 
 * Wrapper for organizing multiple charts in a responsive grid layout
 */
export const ChartGrid = ({ 
  children, 
  columns = 'auto', 
  className = '' 
}) => {
  const getGridColumns = () => {
    if (columns === 'auto') {
      // Auto-detect based on number of children
      const childCount = React.Children.count(children);
      if (childCount === 1) return 'grid-cols-1';
      if (childCount === 2) return 'grid-cols-1 lg:grid-cols-2';
      if (childCount === 3) return 'grid-cols-1 lg:grid-cols-3';
      if (childCount === 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4';
      return 'grid-cols-1 lg:grid-cols-2';
    }
    
    return typeof columns === 'string' ? columns : `grid-cols-1 lg:grid-cols-${columns}`;
  };

  return (
    <div className={`grid ${getGridColumns()} gap-6 mb-6 dashboard-section ${className}`}>
      {children}
    </div>
  );
};

export default ChartContainer;