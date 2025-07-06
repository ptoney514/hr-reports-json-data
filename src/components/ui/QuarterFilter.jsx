import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { QUARTER_DATES } from '../../utils/quarterlyDataProcessor';

/**
 * Quarter Filter Component
 * Allows users to select a quarter for filtering dashboard data
 */
const QuarterFilter = ({ 
  selectedQuarter, 
  onQuarterChange, 
  availableQuarters = null,
  className = "",
  showIcon = true 
}) => {
  // Use provided quarters or default to all quarters
  const quarters = availableQuarters || QUARTER_DATES;
  
  // If no quarters available, don't render
  if (!quarters || quarters.length === 0) {
    return null;
  }
  
  // Set default selection if none provided
  const currentSelection = selectedQuarter || quarters[quarters.length - 1]?.value;
  
  const handleChange = (event) => {
    const newQuarter = event.target.value;
    if (onQuarterChange) {
      onQuarterChange(newQuarter);
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Quarter End Date
      </label>
      <div className="relative">
        {showIcon && (
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
        <select
          value={currentSelection}
          onChange={handleChange}
          className={`
            block w-full 
            ${showIcon ? 'pl-10' : 'pl-3'} pr-10 py-2
            border border-gray-300 
            bg-white 
            rounded-md 
            shadow-sm 
            focus:outline-none 
            focus:ring-2 
            focus:ring-blue-500 
            focus:border-blue-500
            text-sm
            appearance-none
            cursor-pointer
            hover:border-gray-400
            transition-colors
          `}
          aria-label="Select quarter end date"
        >
          {quarters.map((quarter) => (
            <option key={quarter.value} value={quarter.value}>
              {quarter.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

/**
 * Compact Quarter Filter (for inline use)
 */
export const CompactQuarterFilter = ({ 
  selectedQuarter, 
  onQuarterChange, 
  availableQuarters = null 
}) => {
  const quarters = availableQuarters || QUARTER_DATES;
  const currentSelection = selectedQuarter || quarters[quarters.length - 1]?.value;
  
  if (!quarters || quarters.length === 0) {
    return null;
  }
  
  const handleChange = (event) => {
    const newQuarter = event.target.value;
    if (onQuarterChange) {
      onQuarterChange(newQuarter);
    }
  };
  
  return (
    <div className="relative">
      <select
        value={currentSelection}
        onChange={handleChange}
        className="
          block w-full 
          pl-3 pr-8 py-2
          border border-gray-300 
          bg-white 
          rounded-md 
          shadow-sm 
          focus:outline-none 
          focus:ring-1 
          focus:ring-blue-500 
          focus:border-blue-500
          text-sm
          appearance-none
          cursor-pointer
          hover:border-gray-400
          transition-colors
          min-w-[200px]
        "
        aria-label="Select quarter"
      >
        {quarters.map((quarter) => (
          <option key={quarter.value} value={quarter.value}>
            {quarter.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
};

/**
 * Quarter Filter with Badge Style
 */
export const BadgeQuarterFilter = ({ 
  selectedQuarter, 
  onQuarterChange, 
  availableQuarters = null 
}) => {
  const quarters = availableQuarters || QUARTER_DATES;
  const currentSelection = selectedQuarter || quarters[quarters.length - 1]?.value;
  
  if (!quarters || quarters.length === 0) {
    return null;
  }
  
  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-sm font-medium text-gray-700 py-2">Quarter:</span>
      {quarters.map((quarter) => (
        <button
          key={quarter.value}
          onClick={() => onQuarterChange && onQuarterChange(quarter.value)}
          className={`
            px-3 py-1 rounded-full text-sm font-medium transition-colors
            ${currentSelection === quarter.value
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
          aria-pressed={currentSelection === quarter.value}
        >
          {quarter.quarter}
        </button>
      ))}
    </div>
  );
};

/**
 * Helper function to get quarter display info
 */
export const getQuarterInfo = (quarterValue) => {
  const quarter = QUARTER_DATES.find(q => q.value === quarterValue);
  return quarter || null;
};

/**
 * Helper function to format quarter for display
 */
export const formatQuarterDisplay = (quarterValue) => {
  const quarter = getQuarterInfo(quarterValue);
  return quarter ? quarter.label : quarterValue;
};

export default QuarterFilter;