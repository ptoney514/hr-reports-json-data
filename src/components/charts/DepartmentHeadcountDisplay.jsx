import React, { memo, useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { AlertCircle, Building2, Users, UserCheck } from 'lucide-react';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';
import { generateChartAriaLabel, generateChartAriaDescription, handleChartKeyNavigation, announceToScreenReader } from '../../utils/accessibilityUtils';

const DepartmentHeadcountDisplay = memo(({ 
  data = [], 
  title = "Top 10 Benefit Eligible Headcount by Department",
  maxItems = 10,
  className = ""
}) => {
  // Accessibility state
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);
  const chartRef = useRef(null);

  // Process department data for display
  const departmentData = useMemo(() => {
    console.log('🔍 DepartmentHeadcountDisplay - Props received:', { data, title, maxItems, className });
    console.log('🔍 DepartmentHeadcountDisplay - Data type:', typeof data);
    console.log('🔍 DepartmentHeadcountDisplay - Data Array.isArray:', Array.isArray(data));
    console.log('🔍 DepartmentHeadcountDisplay - Data length:', data?.length);
    console.log('🔍 DepartmentHeadcountDisplay - First 3 items with structure:', data?.slice(0, 3));
    
    // Check for data availability
    if (!data) {
      console.log('🚫 DepartmentHeadcountDisplay - Data is null or undefined');
      return [];
    }
    
    if (!Array.isArray(data)) {
      console.log('🚫 DepartmentHeadcountDisplay - Data is not an array:', data);
      return [];
    }
    
    if (data.length === 0) {
      console.log('🚫 DepartmentHeadcountDisplay - Data array is empty');
      return [];
    }
    
    // Calculate total for percentage calculation
    const total = data.reduce((sum, dept) => sum + (dept.total || 0), 0);
    console.log('🔍 DepartmentHeadcountDisplay - Total calculated:', total);
    
    return data
      .map(dept => ({
        name: dept.department || dept.name || 'Unknown Department', // Check both 'department' and 'name' fields
        faculty: dept.faculty || 0,
        staff: dept.staff || 0,
        total: dept.total || 0,
        type: dept.type || 'mixed',
        percentage: total > 0 ? ((dept.total || 0) / total * 100) : 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, maxItems); // Limit to maxItems
  }, [data, maxItems]);

  // Generate accessibility attributes
  const ariaLabel = useMemo(() => generateChartAriaLabel('department list', departmentData, title), [departmentData, title]);
  const ariaDescription = useMemo(() => generateChartAriaDescription(departmentData, 'department list'), [departmentData]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event) => {
    if (!isKeyboardFocused) return;
    
    handleChartKeyNavigation(event, departmentData, selectedIndex, (newIndex) => {
      setSelectedIndex(newIndex);
      // Announce the selected data point
      const item = departmentData[newIndex];
      if (item) {
        const name = item.name;
        const faculty = item.faculty;
        const staff = item.staff;
        const total = item.total;
        announceToScreenReader(`${name}: ${total.toLocaleString()} total employees, ${faculty.toLocaleString()} faculty, ${staff.toLocaleString()} staff, ${item.percentage.toFixed(1)}% of total workforce`);
      }
    });
  }, [isKeyboardFocused, departmentData, selectedIndex]);

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
            <p>No department data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChartErrorBoundary
      chartType="Department Headcount Display"
      title={title}
      className={className}
      onRetry={() => window.location.reload()}
    >
      <div 
        ref={chartRef}
        id={`department-headcount-display-${Date.now()}`}
        data-chart-id="department-headcount-display"
        data-chart-title={title}
        className={`bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray chart-focusable ${className}`}
        role="img"
        aria-label={ariaLabel}
        aria-describedby={`department-display-desc-${Date.now()}`}
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-4 print:mb-2">{title}</h3>
        
        {/* Hidden description for screen readers */}
        <div 
          id={`department-display-desc-${Date.now()}`}
          className="sr-only"
        >
          {ariaDescription}
          {isKeyboardFocused && departmentData.length > 0 && (
            <span>
              Currently focused on department {selectedIndex + 1} of {departmentData.length}. 
              {departmentData[selectedIndex] && (
                <span>
                  {departmentData[selectedIndex].name}: {departmentData[selectedIndex].total?.toLocaleString() || 0} total employees, 
                  {departmentData[selectedIndex].faculty?.toLocaleString() || 0} faculty, 
                  {departmentData[selectedIndex].staff?.toLocaleString() || 0} staff, 
                  {departmentData[selectedIndex].percentage?.toFixed(1) || 0}% of total workforce
                </span>
              )}
            </span>
          )}
        </div>
        
        <div className="space-y-4 print:space-y-3">
          {departmentData.map((department, index) => (
            <div key={department.name} className="relative">
              {/* Department Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center min-w-0 flex-1 mr-4">
                  <Building2 className="text-blue-600 print:text-gray-600 mr-3 flex-shrink-0" size={20} />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-lg print:text-base font-bold text-gray-900 print:text-black truncate">
                      {department.name}
                    </h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center text-sm text-gray-600 print:text-black">
                        <UserCheck className="mr-1" size={14} />
                        <span>{department.faculty.toLocaleString()} faculty</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 print:text-black">
                        <Users className="mr-1" size={14} />
                        <span>{department.staff.toLocaleString()} staff</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl print:text-xl font-bold text-gray-900 print:text-black">
                    {department.total.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 print:text-black">
                    {department.percentage.toFixed(1)}% of total
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-gray-200 print:bg-gray-300 rounded-full h-6 mb-2 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-blue-500 print:bg-gray-600 h-6 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-3 shadow-sm"
                    style={{ width: `${Math.max(department.percentage, 8)}%` }} // Minimum 8% for visibility
                  >
                    {department.percentage >= 15 && (
                      <span className="text-white print:text-black text-xs font-medium">
                        {department.percentage.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Small percentage indicator for narrow bars */}
                {department.percentage < 15 && (
                  <div className="absolute -right-1 top-0 text-xs text-gray-600 print:text-black font-medium">
                    {department.percentage.toFixed(1)}%
                  </div>
                )}
              </div>

              {/* Divider line (except for last item) */}
              {index < departmentData.length - 1 && (
                <div className="border-b border-gray-100 print:border-gray-300 mt-4"></div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 print:border-gray-400">
          <div className="flex justify-between items-center text-sm text-gray-600 print:text-black">
            <span>Showing top {departmentData.length} departments by headcount</span>
            <span className="font-medium">
              Total: {departmentData.reduce((sum, dept) => sum + dept.total, 0).toLocaleString()} employees
            </span>
          </div>
        </div>
      </div>
    </ChartErrorBoundary>
  );
});

DepartmentHeadcountDisplay.displayName = 'DepartmentHeadcountDisplay';

export default DepartmentHeadcountDisplay;