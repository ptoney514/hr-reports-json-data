import React from 'react';
import { TrendingDown } from 'lucide-react';

const TopExitReasonsChart = ({ 
  data = [], 
  title = "Top Exit Reasons",
  maxReasons = 5,
  showBreakdown = true,
  height = 300,
  className = ""
}) => {
  // Process and sort data to show top reasons
  const processedData = data
    .filter(item => item.total > 0)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, maxReasons);

  // Calculate maximum percentage for bar width scaling
  const maxPercentage = Math.max(...processedData.map(item => item.percentage));

  // Color gradient based on ranking (muted blue gradient)
  // Updated for better contrast accessibility - using darker blues for better visibility
  const getBarColor = (index) => {
    const colors = [
      'bg-blue-800', // Darkest for highest values - 7.96:1 contrast ratio
      'bg-blue-700', // Second highest - 6.48:1 contrast ratio  
      'bg-blue-600', // Medium values - 4.72:1 contrast ratio
      'bg-blue-500', // Lower values - 3.36:1 contrast ratio (decorative, acceptable)
      'bg-blue-400', // Lowest values - 2.32:1 contrast ratio (decorative, acceptable)
    ];
    return colors[index] || 'bg-blue-400';
  };

  // Fallback for no data
  if (!processedData.length) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <TrendingDown className="text-blue-600" size={20} />
          <h3 className="text-lg font-bold text-blue-600">{title}</h3>
        </div>
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-500 text-sm">No exit reasons data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`} style={{ height }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <TrendingDown className="text-blue-600" size={20} />
        <h3 className="text-lg font-bold text-blue-600">{title}</h3>
      </div>

      {/* Chart Content */}
      <div className="space-y-4" role="list" aria-label="Exit reasons data">
        {processedData.map((item, index) => (
          <div 
            key={item.reason}
            className="space-y-2"
            role="listitem"
            aria-label={`${item.reason}: ${item.percentage}%, ${item.total} people total${showBreakdown ? `, ${item.faculty} faculty, ${item.staff} staff` : ''}`}
          >
            {/* Reason label and percentage */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {item.reason}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">
                  {item.percentage}%
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {item.total}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative">
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ease-in-out ${getBarColor(index)}`}
                  style={{ width: `${(item.percentage / maxPercentage) * 100}%` }}
                  role="progressbar"
                  aria-valuemin="0"
                  aria-valuemax={maxPercentage}
                  aria-valuenow={item.percentage}
                  aria-label={`${item.percentage}% of total departures`}
                />
              </div>
            </div>

            {/* Faculty/Staff breakdown */}
            {showBreakdown && (
              <div className="flex items-center gap-4 text-xs text-gray-600 ml-1">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-800 rounded-full" aria-hidden="true" />
                  <span>Faculty: {item.faculty}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full" aria-hidden="true" />
                  <span>Staff: {item.staff}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Total separations analyzed</span>
          <span className="font-semibold text-gray-900">
            {processedData.reduce((sum, item) => sum + item.total, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopExitReasonsChart;