import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Filter, X, ChevronDown, Check } from 'lucide-react';
import { announceToScreenReader } from '../../utils/accessibilityUtils';

const FilterButton = ({ 
  filters = {}, 
  onFilterChange,
  activeCount = 0,
  availableFilters = {},
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedFilterIndex, setFocusedFilterIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const filterRefs = useRef([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Default filter options
  const defaultFilterOptions = {
    reportingPeriod: [
      { value: 'Q2-2025', label: 'Q2 2025' },
      { value: 'Q1-2025', label: 'Q1 2025' },
      { value: 'Q4-2024', label: 'Q4 2024' },
      { value: 'Q3-2024', label: 'Q3 2024' },
      { value: 'Q2-2024', label: 'Q2 2024' }
    ],
    location: [
      { value: 'all', label: 'All Locations' },
      { value: 'omaha', label: 'Omaha Campus' },
      { value: 'phoenix', label: 'Phoenix Campus' }
    ],
    employeeType: [
      { value: 'all', label: 'All Types' },
      { value: 'faculty', label: 'Faculty' },
      { value: 'staff', label: 'Staff' },
      { value: 'student', label: 'Students' }
    ],
    division: [
      { value: 'all', label: 'All Divisions' },
      { value: 'academic-affairs', label: 'Academic Affairs' },
      { value: 'student-affairs', label: 'Student Affairs' },
      { value: 'research-innovation', label: 'Research & Innovation' },
      { value: 'business-finance', label: 'Business & Finance' },
      { value: 'advancement', label: 'Advancement' }
    ],
    grade: [
      { value: 'all', label: 'All Grades' },
      { value: 'A', label: 'A - Executive' },
      { value: 'C', label: 'C - Faculty' },
      { value: 'D', label: 'D - Professional' },
      { value: 'X', label: 'X - Support' },
      { value: 'Y', label: 'Y - Student' }
    ]
  };

  // Merge with available filters
  const filterOptions = { ...defaultFilterOptions, ...availableFilters };

  const handleFilterChange = useCallback((filterType, value) => {
    if (onFilterChange) {
      onFilterChange(filterType, value);
      announceToScreenReader(`${filterType} filter changed to ${value}`);
    }
  }, [onFilterChange]);

  const clearAllFilters = useCallback(() => {
    Object.keys(filters).forEach(filterType => {
      if (filterType !== 'reportingPeriod' && filterType !== 'fiscalYear') {
        handleFilterChange(filterType, 'all');
      }
    });
    announceToScreenReader('All filters cleared');
  }, [filters, handleFilterChange]);

  const handleKeyDown = useCallback((event) => {
    if (!isOpen) return;

    const filterTypes = Object.keys(filterOptions);
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = focusedFilterIndex < filterTypes.length - 1 
          ? focusedFilterIndex + 1 
          : 0;
        setFocusedFilterIndex(nextIndex);
        filterRefs.current[nextIndex]?.focus();
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = focusedFilterIndex > 0 
          ? focusedFilterIndex - 1 
          : filterTypes.length - 1;
        setFocusedFilterIndex(prevIndex);
        filterRefs.current[prevIndex]?.focus();
        break;
        
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setFocusedFilterIndex(-1);
        announceToScreenReader('Filter panel closed');
        break;
        
      case 'Tab':
        // Allow normal tab behavior within the dropdown
        break;
    }
  }, [isOpen, focusedFilterIndex, filterOptions]);

  const FilterDropdown = ({ type, label, options, index }) => {
    const currentValue = filters[type] || 'all';
    
    return (
      <div className="mb-4">
        <label 
          htmlFor={`filter-${type}`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
        <select
          id={`filter-${type}`}
          ref={(el) => (filterRefs.current[index] = el)}
          value={currentValue}
          onChange={(e) => handleFilterChange(type, e.target.value)}
          onFocus={() => setFocusedFilterIndex(index)}
          aria-describedby={`filter-${type}-desc`}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div id={`filter-${type}-desc`} className="sr-only">
          Current selection: {options.find(opt => opt.value === currentValue)?.label}
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => {
          const newState = !isOpen;
          setIsOpen(newState);
          setFocusedFilterIndex(-1);
          announceToScreenReader(newState ? 'Filter panel opened' : 'Filter panel closed');
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !isOpen) {
            e.preventDefault();
            setIsOpen(true);
            announceToScreenReader('Filter panel opened');
          }
        }}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="filter-panel"
        aria-label={`Filters${activeCount > 0 ? ` (${activeCount} active)` : ''}`}
        className={`flex items-center gap-1 px-3 py-1 border rounded shadow-sm transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
          activeCount > 0
            ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
            : 'bg-white border-gray-300 hover:bg-gray-50'
        }`}
      >
        <Filter size={16} />
        <span className="text-sm">
          Filters
          {activeCount > 0 && (
            <span className="ml-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          id="filter-panel"
          role="dialog"
          aria-labelledby="filter-panel-title"
          onKeyDown={handleKeyDown}
          className="absolute top-full left-0 z-50 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 id="filter-panel-title" className="text-lg font-semibold text-gray-900">Filters</h3>
              <div className="flex items-center gap-2">
                {activeCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-2 py-1"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setFocusedFilterIndex(-1);
                    announceToScreenReader('Filter panel closed');
                  }}
                  aria-label="Close filter panel"
                  className="text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded p-1"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Filter Options */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Reporting Period */}
              {filterOptions.reportingPeriod && (
                <FilterDropdown
                  type="reportingPeriod"
                  label="Reporting Period"
                  options={filterOptions.reportingPeriod}
                  index={0}
                />
              )}

              {/* Location */}
              {filterOptions.location && (
                <FilterDropdown
                  type="location"
                  label="Location"
                  options={filterOptions.location}
                  index={1}
                />
              )}

              {/* Employee Type */}
              {filterOptions.employeeType && (
                <FilterDropdown
                  type="employeeType"
                  label="Employee Type"
                  options={filterOptions.employeeType}
                  index={2}
                />
              )}

              {/* Division */}
              {filterOptions.division && (
                <FilterDropdown
                  type="division"
                  label="Division"
                  options={filterOptions.division}
                  index={3}
                />
              )}

              {/* Grade (for turnover dashboard) */}
              {filterOptions.grade && (
                <FilterDropdown
                  type="grade"
                  label="Grade Classification"
                  options={filterOptions.grade}
                  index={4}
                />
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setFocusedFilterIndex(-1);
                  announceToScreenReader('Filters applied');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterButton; 