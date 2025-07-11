import React, { useState, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  X, 
  ChevronDown,
  RotateCcw,
  Download,
  Upload
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const TableFilters = ({ 
  searchTerm, 
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateRange,
  onDateRangeChange,
  onReset,
  onBulkExport,
  onBulkImport,
  quarterCount = 0,
  className = ''
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Status filter options
  const statusOptions = [
    { value: 'all', label: 'All Status', count: quarterCount },
    { value: 'complete', label: 'Complete', status: 'complete' },
    { value: 'incomplete', label: 'Issues', status: 'incomplete' },
    { value: 'outdated', label: 'Outdated', status: 'outdated' },
    { value: 'draft', label: 'Draft', status: 'draft' },
    { value: 'empty', label: 'No Data', status: 'empty' }
  ];

  // Handle search input
  const handleSearchChange = useCallback((e) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  // Handle status filter change
  const handleStatusChange = useCallback((status) => {
    onStatusFilterChange(status);
    setIsFilterOpen(false);
  }, [onStatusFilterChange]);

  // Handle date range change
  const handleDateRangeChange = useCallback((field, value) => {
    onDateRangeChange({
      ...dateRange,
      [field]: value
    });
  }, [dateRange, onDateRangeChange]);

  // Clear all filters
  const handleClearAll = useCallback(() => {
    onReset();
    setIsFilterOpen(false);
    setIsDatePickerOpen(false);
  }, [onReset]);

  // Get current filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchTerm && searchTerm.trim()) count++;
    if (statusFilter && statusFilter !== 'all') count++;
    if (dateRange && (dateRange.start || dateRange.end)) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();
  const selectedStatusOption = statusOptions.find(opt => opt.value === statusFilter) || statusOptions[0];

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-4 justify-between">
        {/* Left side - Search and Filters */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search quarters, data..."
              value={searchTerm || ''}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm">
                {selectedStatusOption.status ? (
                  <StatusBadge status={selectedStatusOption.status} size="sm" />
                ) : (
                  selectedStatusOption.label
                )}
              </span>
              <ChevronDown size={14} className="text-gray-400" />
              {statusFilter && statusFilter !== 'all' && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  1
                </span>
              )}
            </button>

            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-gray-50 ${
                        statusFilter === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {option.status ? (
                          <StatusBadge status={option.status} size="sm" />
                        ) : (
                          option.label
                        )}
                      </div>
                      {option.count !== undefined && (
                        <span className="text-xs text-gray-500">
                          {option.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <Calendar size={16} className="text-gray-500" />
              <span className="text-sm">
                {dateRange && (dateRange.start || dateRange.end) ? (
                  `${dateRange.start || 'Start'} - ${dateRange.end || 'End'}`
                ) : (
                  'Date Range'
                )}
              </span>
              <ChevronDown size={14} className="text-gray-400" />
              {dateRange && (dateRange.start || dateRange.end) && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  1
                </span>
              )}
            </button>

            {isDatePickerOpen && (
              <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Start Quarter
                      </label>
                      <input
                        type="text"
                        placeholder="Q1-2024"
                        value={dateRange?.start || ''}
                        onChange={(e) => handleDateRangeChange('start', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        End Quarter
                      </label>
                      <input
                        type="text"
                        placeholder="Q4-2025"
                        value={dateRange?.end || ''}
                        onChange={(e) => handleDateRangeChange('end', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between mt-3 pt-3 border-t">
                    <button
                      onClick={() => {
                        handleDateRangeChange('start', '');
                        handleDateRangeChange('end', '');
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setIsDatePickerOpen(false)}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RotateCcw size={14} />
              Clear ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Right side - Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBulkExport}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download size={14} />
            Export
          </button>
          
          <button
            onClick={onBulkImport}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Upload size={14} />
            Import
          </button>
        </div>
      </div>

      {/* Filter Summary */}
      {activeFilterCount > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Active filters:</span>
            {searchTerm && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                Search: "{searchTerm}"
              </span>
            )}
            {statusFilter && statusFilter !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                Status: {selectedStatusOption.label}
              </span>
            )}
            {dateRange && (dateRange.start || dateRange.end) && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                Date: {dateRange.start || 'Start'} - {dateRange.end || 'End'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableFilters;