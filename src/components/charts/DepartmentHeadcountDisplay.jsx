import React, { memo, useMemo } from 'react';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';

const DepartmentHeadcountDisplay = memo(({ 
  data = [], 
  title = "Top 10 Benefit Eligible Headcount by Department",
  maxItems = 10,
  className = ""
}) => {
  // Process and sort department data
  const departmentData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }
    
    // Sort by total and take top N items
    return data
      .map(dept => ({
        name: dept.department || dept.name || 'Unknown',
        total: dept.total || 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, maxItems);
  }, [data, maxItems]);

  // Calculate max value for scaling bars
  const maxValue = useMemo(() => {
    if (departmentData.length === 0) return 0;
    return Math.max(...departmentData.map(d => d.total));
  }, [departmentData]);

  // Error state
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray ${className}`}>
        <h3 className="text-base font-semibold text-blue-700 print:text-black mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No department data available</p>
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
      <div className={`bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray ${className}`}>
        <h3 className="text-base font-semibold text-blue-700 print:text-black mb-4">{title}</h3>
        
        {/* Simple Horizontal Bar Chart */}
        <div className="space-y-2">
          {departmentData.map((dept, index) => {
            const percentage = maxValue > 0 ? (dept.total / maxValue * 100) : 0;
            
            return (
              <div key={`${dept.name}-${index}`} className="flex items-center">
                {/* Department Name - Fixed width */}
                <div className="w-40 pr-4 text-sm text-gray-700 print:text-black truncate" title={dept.name}>
                  {dept.name}
                </div>
                
                {/* Bar Container */}
                <div className="flex-1 flex items-center">
                  {/* Bar */}
                  <div className="relative flex-1 bg-gray-100 print:bg-gray-200 h-6 rounded">
                    <div 
                      className="absolute left-0 top-0 h-full bg-blue-500 print:bg-gray-700 rounded"
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                  
                  {/* Value */}
                  <div className="ml-3 text-sm font-semibold text-gray-900 print:text-black w-12 text-right">
                    {dept.total.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200 print:border-gray-400">
          <div className="flex justify-between text-xs text-gray-600 print:text-black">
            <span>Top {departmentData.length} departments</span>
            <span className="font-medium">
              Total: {departmentData.reduce((sum, dept) => sum + dept.total, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </ChartErrorBoundary>
  );
});

DepartmentHeadcountDisplay.displayName = 'DepartmentHeadcountDisplay';

export default DepartmentHeadcountDisplay;