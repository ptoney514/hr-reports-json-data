import React from 'react';
import ErrorBoundary from '../ui/ErrorBoundary';
import ExportButton from '../ui/ExportButton';
import QuarterFilter from '../ui/QuarterFilter';

/**
 * Reusable Dashboard Template Component
 * 
 * Provides consistent layout, styling, and functionality for all dashboards.
 * Optimized for printing with proper CSS classes and layout structure.
 * 
 * @param {Object} props
 * @param {string} props.title - Dashboard title
 * @param {string} props.subtitle - Dashboard subtitle/description
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Filter change handler
 * @param {Function} props.onExport - Export functionality handler
 * @param {Object} props.filterOptions - Available filter options
 * @param {React.ReactNode} props.children - Dashboard content
 * @param {boolean} props.showFilters - Whether to show filter controls (default: true)
 * @param {boolean} props.showExport - Whether to show export button (default: true)
 * @param {string} props.className - Additional CSS classes
 */
const DashboardTemplate = ({
  title,
  subtitle,
  filters = {},
  onFilterChange,
  onExport,
  filterOptions = {},
  children,
  showFilters = true,
  showExport = true,
  className = ''
}) => {
  // Handle filter changes
  const handleFilterUpdate = (filterType, value) => {
    if (onFilterChange) {
      onFilterChange({ [filterType]: value });
    }
  };

  // Generate filter summary for print header
  const getFilterSummary = () => {
    const filterParts = [];
    if (filters.reportingPeriod) filterParts.push(`Period: ${filters.reportingPeriod}`);
    if (filters.location && filters.location !== 'all') filterParts.push(`Location: ${filters.location}`);
    if (filters.division && filters.division !== 'all') filterParts.push(`Division: ${filters.division}`);
    if (filters.employeeType && filters.employeeType !== 'all') filterParts.push(`Type: ${filters.employeeType}`);
    return filterParts.join(' | ') || 'All Filters Applied';
  };

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-gray-50 py-8 dashboard-container print:bg-white print:py-0 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 print:max-w-none print:px-0 print:mx-0">
          {/* Print-only header with filter information */}
          <div className="print-only print-header">
            <div className="dashboard-title">{title}</div>
            <div className="dashboard-subtitle">
              {subtitle && `${subtitle} | `}{getFilterSummary()}
            </div>
          </div>

          {/* Main Header Section */}
          <div className="mb-6 dashboard-section">
            {/* Title Section */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-blue-700 dashboard-title print:text-center">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1 dashboard-subtitle print:text-center">
                  {subtitle}
                </p>
              )}
            </div>
            
            {/* Filters and Export Row */}
            {(showFilters || showExport) && (
              <div className="flex items-end gap-4 no-print filter-controls">
                {/* Quarter Filter */}
                {showFilters && filterOptions.quarters && (
                  <div className="w-64">
                    <QuarterFilter 
                      selectedQuarter={filters.reportingPeriod}
                      onQuarterChange={(quarter) => handleFilterUpdate('reportingPeriod', quarter)}
                      availableQuarters={filterOptions.quarters}
                    />
                  </div>
                )}

                {/* Location Filter */}
                {showFilters && filterOptions.location && (
                  <div className="w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <select
                      value={filters.location || 'all'}
                      onChange={(e) => handleFilterUpdate('location', e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      {filterOptions.location.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Division Filter */}
                {showFilters && filterOptions.division && (
                  <div className="w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Division
                    </label>
                    <select
                      value={filters.division || 'all'}
                      onChange={(e) => handleFilterUpdate('division', e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      {filterOptions.division.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Employee Type Filter */}
                {showFilters && filterOptions.employeeType && (
                  <div className="w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee Type
                    </label>
                    <select
                      value={filters.employeeType || 'all'}
                      onChange={(e) => handleFilterUpdate('employeeType', e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      {filterOptions.employeeType.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Export Button */}
                {showExport && onExport && (
                  <ExportButton onExport={onExport} />
                )}
              </div>
            )}
          </div>

          {/* Dashboard Content */}
          <div className="dashboard-content">
            {children}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default DashboardTemplate;