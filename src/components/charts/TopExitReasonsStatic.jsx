import React from 'react';

const TopExitReasonsStatic = ({ 
  data = [], 
  title = "Top Termination Reasons"
}) => {
  // Color palette matching target design
  const colors = [
    '#3B82F6', // Blue - Career Advancement
    '#10B981', // Green - Compensation  
    '#F59E0B', // Amber - Supervisor Issues
    '#EF4444', // Red - Work-Life Balance
    '#8B5CF6', // Purple - Retirement
    '#6B7280', // Gray - Other
  ];

  // Calculate total separations
  const totalSeparations = data && Array.isArray(data) ? data.reduce((sum, item) => sum + (item.total || 0), 0) : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border print:shadow-none" data-pdf-ready="true">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-blue-700 print:text-black">{title}</h3>
        <div className="text-lg font-medium text-gray-700 print:text-black">
          Total terminations: {totalSeparations}
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="space-y-3 pdf-progress-container" data-content-type="progress-bars">
        {data.map((reason, index) => (
          <div key={reason.reason} className="mb-3 pdf-progress-item" data-progress-ready="true">
            {/* Reason name and percentage */}
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-900 print:text-black">
                {reason.reason}
              </span>
              <span className="text-sm font-bold text-gray-800 print:text-black">
                {reason.percentage}%
              </span>
            </div>
            
            {/* Progress bar background */}
            <div className="w-full bg-gray-200 rounded-md h-8 relative print:border print:border-gray-300 pdf-progress-track">
              {/* Progress bar fill */}
              <div 
                className="h-8 rounded-md flex items-center justify-end pr-2 pdf-progress-fill"
                style={{ 
                  width: `${reason.percentage}%`, 
                  backgroundColor: colors[index % colors.length],
                  minWidth: reason.percentage > 0 ? '20px' : '0px' // Ensure small values are visible
                }}
                data-progress-width={reason.percentage}
                data-progress-color={colors[index % colors.length]}
              >
                {/* Total count badge - only show if greater than 1 */}
                {reason.total > 1 && (
                  <span className="text-xs text-white font-medium bg-black bg-opacity-20 px-2 py-1 rounded">
                    {reason.total}
                  </span>
                )}
              </div>
            </div>
            
            {/* Faculty/Staff breakdown */}
            <div className="text-xs text-gray-600 print:text-black mt-1">
              Faculty: {reason.faculty || 0} | Staff: {reason.staff || 0}
            </div>
          </div>
        ))}
      </div>

      {/* Summary footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 print:border-gray-400">
        <div className="text-sm text-gray-600 print:text-black">
          <span>Top reason accounts for </span>
          <span className="font-semibold text-blue-600 print:text-black">
            {data.length > 0 ? `${data[0].percentage}% of all terminations` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopExitReasonsStatic;