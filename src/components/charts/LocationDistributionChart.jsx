import React, { memo, useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { AlertCircle, MapPin } from 'lucide-react';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';
import { generateChartAriaLabel, generateChartAriaDescription, handleChartKeyNavigation, announceToScreenReader } from '../../utils/accessibilityUtils';

const LocationDistributionChart = memo(({ 
  data = [], 
  title = "Employees by Location",
  className = ""
}) => {
  // Accessibility state
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);
  const chartRef = useRef(null);
  // Process location data for display
  const locationData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Calculate total for percentage calculation
    const total = data.reduce((sum, location) => sum + (location.total || 0), 0);
    
    return data
      .map(location => ({
        name: location.name || 'Unknown',
        total: location.total || 0,
        percentage: total > 0 ? ((location.total || 0) / total * 100) : 0
      }))
      .sort((a, b) => b.total - a.total); // Sort by total count descending
  }, [data]);

  // Generate accessibility attributes
  const ariaLabel = useMemo(() => generateChartAriaLabel('progress bar', locationData, title), [locationData, title]);
  const ariaDescription = useMemo(() => generateChartAriaDescription(locationData, 'progress bar'), [locationData]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event) => {
    if (!isKeyboardFocused) return;
    
    handleChartKeyNavigation(event, locationData, selectedIndex, (newIndex) => {
      setSelectedIndex(newIndex);
      // Announce the selected data point
      const item = locationData[newIndex];
      if (item) {
        const name = item.name;
        const total = item.total;
        const percentage = item.percentage;
        announceToScreenReader(`${name}: ${total.toLocaleString()} employees, ${percentage.toFixed(1)}% of total workforce`);
      }
    });
  }, [isKeyboardFocused, locationData, selectedIndex]);

  // Focus handlers
  const handleFocus = useCallback(() => {
    setIsKeyboardFocused(true);
    announceToScreenReader(`Focused on ${title}. ${ariaDescription}`);
  }, [title, ariaDescription]);

  const handleBlur = useCallback(() => {
    setIsKeyboardFocused(false);
  }, []);

  // Effect to set up keyboard listeners
  useEffect(() => {
    const chartElement = chartRef.current;
    if (chartElement) {
      chartElement.addEventListener('keydown', handleKeyDown);
      return () => {
        chartElement.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown]);

  // Error handling for missing or invalid data
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray ${className}`}>
        <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto mb-2 text-gray-400" />
            <p>No location data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChartErrorBoundary
      chartType="Location Distribution Chart"
      title={title}
      className={className}
      onRetry={() => window.location.reload()}
    >
      <div 
        ref={chartRef}
        id={`location-distribution-chart-${Date.now()}`}
        data-chart-id="location-distribution-chart"
        data-chart-title={title}
        className={`bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray chart-focusable ${className}`}
        role="img"
        aria-label={ariaLabel}
        aria-describedby={`location-chart-desc-${Date.now()}`}
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-4 print:mb-2">{title}</h3>
        
        {/* Hidden description for screen readers */}
        <div 
          id={`location-chart-desc-${Date.now()}`}
          className="sr-only"
        >
          {ariaDescription}
          {isKeyboardFocused && locationData.length > 0 && (
            <span>
              Currently focused on location {selectedIndex + 1} of {locationData.length}. 
              {locationData[selectedIndex] && (
                <span>
                  {locationData[selectedIndex].name}: {locationData[selectedIndex].total?.toLocaleString() || 0} employees, 
                  {locationData[selectedIndex].percentage?.toFixed(1) || 0}% of total workforce
                </span>
              )}
            </span>
          )}
        </div>
        
        <div className="space-y-4 print:space-y-3">
          {locationData.map((location, index) => (
            <div key={location.name} className="relative">
              {/* Location Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center min-w-0 flex-1 mr-4">
                  <MapPin className="text-blue-600 print:text-gray-600 mr-2 flex-shrink-0" size={20} />
                  <h4 className="text-xl print:text-lg font-bold text-gray-900 print:text-black truncate">{location.name}</h4>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl print:text-xl font-bold text-gray-900 print:text-black">
                    {location.total.toLocaleString()}
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-gray-200 print:bg-gray-300 rounded-full h-8 mb-2 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-blue-500 print:bg-gray-600 h-8 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-3 shadow-sm"
                    style={{ width: `${Math.max(location.percentage, 8)}%` }} // Minimum 8% for visibility
                  >
                    {location.percentage >= 20 && (
                      <span className="text-white print:text-black text-sm font-medium">
                        {location.percentage.toFixed(1)}% of total workforce
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Percentage label for small bars */}
                {location.percentage < 20 && (
                  <div className="text-sm text-gray-600 mt-1">
                    {location.percentage.toFixed(1)}% of total workforce
                  </div>
                )}
              </div>
              
              {/* Divider (except for last item) */}
              {index < locationData.length - 1 && (
                <div className="border-b border-gray-200 mt-4 print:mt-2" />
              )}
            </div>
          ))}
        </div>
        
        {/* Summary */}
        {locationData.length > 0 && (
          <div className="mt-4 print:mt-2 pt-4 print:pt-2 border-t border-gray-200">
            <div className="text-sm print:text-xs text-gray-600 print:text-black text-center">
              Total Workforce: {locationData.reduce((sum, loc) => sum + loc.total, 0).toLocaleString()} employees
              across {locationData.length} location{locationData.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </ChartErrorBoundary>
  );
});

LocationDistributionChart.displayName = 'LocationDistributionChart';

export default LocationDistributionChart;