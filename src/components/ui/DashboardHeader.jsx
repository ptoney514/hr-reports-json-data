import React from 'react';
import { Filter, Calendar, Download } from 'lucide-react';
import FilterButton from './FilterButton';
import ExportButton from './ExportButton';

const DashboardHeader = ({ 
  title, 
  subtitle,
  filters = {}, 
  onFilterChange,
  onExport,
  showFilters = true,
  showDateFilter = true,
  showExport = true,
  className = ''
}) => {
  // Generate subtitle with current date if not provided
  const defaultSubtitle = `Generated: ${new Date().toLocaleDateString()}`;
  const displaySubtitle = subtitle || defaultSubtitle;

  // Get current filter display values
  const getFilterDisplayValue = () => {
    if (filters.reportingPeriod) {
      return filters.reportingPeriod;
    }
    if (filters.fiscalYear) {
      return `FY${filters.fiscalYear}`;
    }
    return 'All Time';
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.location && filters.location !== 'all') count++;
    if (filters.division && filters.division !== 'all') count++;
    if (filters.department && filters.department !== 'all') count++;
    if (filters.employeeType && filters.employeeType !== 'all') count++;
    if (filters.grade && filters.grade !== 'all') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={`mb-4 print:mb-2 flex justify-between items-center print:no-break ${className}`}>
      {/* Title and subtitle */}
      <div>
        <h1 className="text-2xl print:text-xl font-bold text-blue-700 print:text-black">
          {title}
        </h1>
        <p className="text-sm print:text-xs text-gray-600 print:text-black">
          {displaySubtitle}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 no-print">
        {/* Filters Button */}
        {showFilters && (
          <FilterButton
            filters={filters}
            onFilterChange={onFilterChange}
            activeCount={activeFilterCount}
          />
        )}

        {/* Date/Period Filter */}
        {showDateFilter && (
          <button className="flex items-center gap-1 px-3 py-1 bg-white border rounded shadow-sm hover:bg-gray-50 transition-colors">
            <Calendar size={16} />
            <span className="text-sm">
              {getFilterDisplayValue()}
            </span>
          </button>
        )}

        {/* Export Button */}
        {showExport && (
          <ExportButton onExport={onExport} />
        )}
      </div>
    </div>
  );
};

export default DashboardHeader; 