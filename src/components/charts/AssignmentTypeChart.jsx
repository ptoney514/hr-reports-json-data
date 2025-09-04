import React, { memo, useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { 
  AlertCircle, 
  Briefcase, 
  GraduationCap, 
  Stethoscope, 
  Clock, 
  Cross, 
  Users,
  Heart
} from 'lucide-react';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';
import { generateChartAriaLabel, generateChartAriaDescription, handleChartKeyNavigation, announceToScreenReader } from '../../utils/accessibilityUtils';

const AssignmentTypeChart = memo(({ 
  data = [], 
  title = "Employees by Assignment Type",
  className = ""
}) => {
  // Accessibility state
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);
  const chartRef = useRef(null);

  // Process assignment type data for display
  const assignmentTypeData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Calculate total for percentage calculation
    const total = data.reduce((sum, assignment) => sum + (assignment.total || 0), 0);
    
    return data
      .map(assignment => ({
        name: assignment.name || 'Unknown',
        total: assignment.total || 0,
        percentage: assignment.percentage !== undefined ? parseFloat(assignment.percentage) : (total > 0 ? ((assignment.total || 0) / total * 100) : 0),
        icon: assignment.icon || 'briefcase'
      }))
      .sort((a, b) => b.total - a.total); // Sort by total count descending
  }, [data]);

  // Generate accessibility attributes
  const ariaLabel = useMemo(() => generateChartAriaLabel('progress bar', assignmentTypeData, title), [assignmentTypeData, title]);
  const ariaDescription = useMemo(() => generateChartAriaDescription(assignmentTypeData, 'progress bar'), [assignmentTypeData]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event) => {
    if (!isKeyboardFocused) return;
    
    handleChartKeyNavigation(event, assignmentTypeData, selectedIndex, (newIndex) => {
      setSelectedIndex(newIndex);
      // Announce the selected data point
      const item = assignmentTypeData[newIndex];
      if (item) {
        const name = item.name;
        const total = item.total;
        const percentage = item.percentage;
        announceToScreenReader(`${name}: ${total.toLocaleString()} employees, ${percentage.toFixed(1)}% of total workforce`);
      }
    });
  }, [isKeyboardFocused, assignmentTypeData, selectedIndex]);

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
        <h3 className="text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto mb-2 text-gray-400" />
            <p>No assignment type data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChartErrorBoundary
      chartType="Assignment Type Distribution Chart"
      title={title}
      className={className}
      onRetry={() => window.location.reload()}
    >
      <div 
        ref={chartRef}
        id={`assignment-type-chart-${Date.now()}`}
        data-chart-id="assignment-type-chart"
        data-chart-title={title}
        className={`bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray chart-focusable ${className}`}
        role="img"
        aria-label={ariaLabel}
        aria-describedby={`assignment-type-desc-${Date.now()}`}
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {title && title.trim() !== "" && (
          <h3 className="text-base font-semibold text-blue-700 print:text-black mb-4 print:mb-2">{title}</h3>
        )}
        
        {/* Hidden description for screen readers */}
        <div 
          id={`assignment-type-desc-${Date.now()}`}
          className="sr-only"
        >
          {ariaDescription}
          {isKeyboardFocused && assignmentTypeData.length > 0 && (
            <span>
              Currently focused on assignment type {selectedIndex + 1} of {assignmentTypeData.length}. 
              {assignmentTypeData[selectedIndex] && (
                <span>
                  {assignmentTypeData[selectedIndex].name}: {assignmentTypeData[selectedIndex].total?.toLocaleString() || 0} employees, 
                  {assignmentTypeData[selectedIndex].percentage?.toFixed(1) || 0}% of total workforce
                </span>
              )}
            </span>
          )}
        </div>
        
        <div className="space-y-4 print:space-y-3">
          {assignmentTypeData.map((assignment, index) => (
            <div key={assignment.name} className="relative">
              {/* Assignment Type Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center min-w-0 flex-1 mr-4">
                  {(() => {
                    const IconComponent = 
                      assignment.icon === 'student' ? GraduationCap :
                      assignment.icon === 'medical' ? Stethoscope :
                      assignment.icon === 'clock' ? Clock :
                      assignment.icon === 'cross' ? Cross :
                      assignment.icon === 'users' ? Users :
                      assignment.icon === 'heart' ? Heart :
                      Briefcase;
                    return <IconComponent className="text-blue-600 print:text-gray-600 mr-2 flex-shrink-0" size={20} />;
                  })()}
                  <h4 className="text-lg print:text-base font-bold text-gray-900 print:text-black truncate">{assignment.name}</h4>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl print:text-lg font-bold text-gray-900 print:text-black">
                    {assignment.total.toLocaleString()}
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-gray-200 print:bg-gray-300 rounded-full h-8 mb-2 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-blue-500 print:bg-gray-600 h-8 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-3 shadow-sm"
                    style={{ width: `${Math.max(assignment.percentage, 8)}%` }} // Minimum 8% for visibility
                  >
                    {assignment.percentage >= 20 && (
                      <span className="text-white print:text-black text-sm font-medium">
                        {assignment.percentage.toFixed(1)}% of total workforce
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Percentage label for small bars */}
                {assignment.percentage < 20 && (
                  <div className="text-sm text-gray-600 mt-1">
                    {assignment.percentage.toFixed(1)}% of total workforce
                  </div>
                )}
              </div>
              
              {/* Divider (except for last item) */}
              {index < assignmentTypeData.length - 1 && (
                <div className="border-b border-gray-200 mt-4 print:mt-2" />
              )}
            </div>
          ))}
        </div>
        
      </div>
    </ChartErrorBoundary>
  );
});

AssignmentTypeChart.displayName = 'AssignmentTypeChart';

export default AssignmentTypeChart;