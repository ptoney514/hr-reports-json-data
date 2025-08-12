import React, { memo, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';

const SchoolOrgHeadcountChart = memo(({ 
  data = [], 
  title = "Benefit Eligible Headcount by School/College/Org",
  height = 450,
  className = ""
}) => {
  // Transform and validate data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Sort data by total headcount in descending order
    return data
      .map((item) => ({
        name: item.name || 'Unknown',
        faculty: item.faculty || 0,
        staff: item.staff || 0,
        hsp: item.hsp || 0,
        total: (item.faculty || 0) + (item.staff || 0) + (item.hsp || 0)
      }))
      .filter(item => item.total > 0) // Remove empty entries
      .sort((a, b) => b.total - a.total);
  }, [data]);

  // Calculate max value for scaling bars
  const maxValue = useMemo(() => {
    return Math.max(...chartData.map(item => item.total), 1);
  }, [chartData]);

  // Calculate total for summary
  const grandTotal = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.total, 0);
  }, [chartData]);

  // Color function based on ranking
  const getBarColor = (index) => {
    if (index === 0) return 'bg-blue-600'; // Largest
    if (index <= 2) return 'bg-blue-500';  // Top 3
    if (index <= 4) return 'bg-blue-400';  // Top 5
    if (index <= 9) return 'bg-blue-300';  // Top 10
    return 'bg-blue-200'; // Others
  };

  // Error handling for missing or invalid data
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow-sm border ${className}`}>
        <h3 className="text-lg font-semibold text-blue-700 mb-3">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto mb-2 text-gray-400" />
            <p>No headcount data available</p>
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
        id={`school-org-headcount-chart-${Date.now()}`}
        data-chart-id="school-org-headcount-chart"
        data-chart-title={title}
        className={`bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray ${className}`}
      >
        {/* Title and Summary */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black">
            {title}
          </h3>
          <div className="text-sm text-gray-600">
            Total: {grandTotal.toLocaleString()} employees
          </div>
        </div>

        {/* Chart container */}
        <div className="space-y-2">
          {chartData.map((item, index) => (
            <div key={index} className="border-b border-gray-100 pb-2 last:border-b-0">
              {/* Main bar row */}
              <div className="flex items-center gap-3 p-2">
                {/* School/Org name - fixed width for alignment */}
                <div className="w-48 flex-shrink-0 text-left">
                  <span className="text-sm text-gray-700 pr-2 font-medium">
                    {item.name}
                  </span>
                </div>
                
                {/* Bar container */}
                <div className="flex-1 relative">
                  <div className="w-full bg-gray-100 rounded h-7 relative">
                    <div 
                      className={`h-7 ${getBarColor(index)} rounded transition-all duration-300 flex items-center justify-between px-2 relative`}
                      style={{ 
                        width: `${(item.total / maxValue) * 100}%`,
                        minWidth: item.total > 0 ? '40px' : '0px'
                      }}
                    >
                      {/* Total count inside bar */}
                      <span className="text-white text-xs font-semibold">
                        {item.total.toLocaleString()}
                      </span>
                      
                      {/* Ranking badge for top 5 */}
                      {index < 5 && (
                        <span className="bg-white bg-opacity-20 text-white text-xs px-1 rounded">
                          #{index + 1}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Percentage */}
                <div className="w-12 text-right text-xs text-gray-500">
                  {((item.total / grandTotal) * 100).toFixed(1)}%
                </div>
              </div>

              {/* Always visible breakdown - print friendly */}
              <div className="ml-52 mt-1 print:block">
                <div className="flex gap-6 text-xs text-gray-600">
                  <span>Faculty: <span className="font-semibold text-gray-800">{item.faculty.toLocaleString()}</span></span>
                  <span>Staff: <span className="font-semibold text-gray-800">{item.staff.toLocaleString()}</span></span>
                  <span>HSP: <span className="font-semibold text-gray-800">{item.hsp.toLocaleString()}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer summary */}
        <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600">
          <div className="flex justify-between items-center">
            <span>
              Showing {chartData.length} schools/organizations
            </span>
            <span>
              Faculty/Staff/HSP breakdown shown below each bar
            </span>
          </div>
        </div>
      </div>
    </ChartErrorBoundary>
  );
});

SchoolOrgHeadcountChart.displayName = 'SchoolOrgHeadcountChart';

export default SchoolOrgHeadcountChart;