import React, { memo, useMemo } from 'react';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';

const DepartmentHeadcountDisplay = memo(({ 
  data = [], 
  title = "Benefit Eligible Headcount by Department",
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
        faculty: dept.faculty || 0,
        staff: dept.staff || 0,
        hsp: dept.hsp || 0,
        total: dept.total || 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, maxItems);
  }, [data, maxItems]);

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
        
        {/* Table Display */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Department
                </th>
                <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Faculty
                </th>
                <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Staff
                </th>
                <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  HSP
                </th>
                <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {departmentData.map((dept, index) => (
                <tr key={`${dept.name}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-2 text-sm text-gray-900">
                    {dept.name}
                  </td>
                  <td className="py-2 px-2 text-sm text-gray-700 text-right">
                    {dept.faculty.toLocaleString()}
                  </td>
                  <td className="py-2 px-2 text-sm text-gray-700 text-right">
                    {dept.staff.toLocaleString()}
                  </td>
                  <td className="py-2 px-2 text-sm text-gray-700 text-right">
                    {dept.hsp > 0 ? dept.hsp.toLocaleString() : '-'}
                  </td>
                  <td className="py-2 px-2 text-sm font-semibold text-gray-900 text-right">
                    {dept.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300">
                <td className="py-2 px-2 text-sm font-semibold text-gray-900">
                  Total
                </td>
                <td className="py-2 px-2 text-sm font-semibold text-gray-900 text-right">
                  {departmentData.reduce((sum, dept) => sum + dept.faculty, 0).toLocaleString()}
                </td>
                <td className="py-2 px-2 text-sm font-semibold text-gray-900 text-right">
                  {departmentData.reduce((sum, dept) => sum + dept.staff, 0).toLocaleString()}
                </td>
                <td className="py-2 px-2 text-sm font-semibold text-gray-900 text-right">
                  {departmentData.reduce((sum, dept) => sum + dept.hsp, 0).toLocaleString()}
                </td>
                <td className="py-2 px-2 text-sm font-semibold text-gray-900 text-right">
                  {departmentData.reduce((sum, dept) => sum + dept.total, 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </ChartErrorBoundary>
  );
});

DepartmentHeadcountDisplay.displayName = 'DepartmentHeadcountDisplay';

export default DepartmentHeadcountDisplay;