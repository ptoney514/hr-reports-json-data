import React from 'react';
import { Filter, X, Calendar, Users, Building, Code } from 'lucide-react';

const ASSIGNMENT_CODES = ['F09', 'F10', 'F11', 'F12', 'HSR', 'PT10', 'PT11', 'PT12', 'PT9', 'TEMP', 'NBE', 'PRN'];

const EmployeeFilterPanel = ({ 
  filters, 
  setFilters, 
  onApply, 
  availableEndDates = [],
  availableSchools = []
}) => {
  const handleEndDateChange = (e) => {
    const newFilters = { ...filters, endDate: e.target.value };
    setFilters(newFilters);
  };

  const handleAssignmentCodeToggle = (code) => {
    const codes = filters.assignmentCodes.includes(code)
      ? filters.assignmentCodes.filter(c => c !== code)
      : [...filters.assignmentCodes, code];
    const newFilters = { ...filters, assignmentCodes: codes };
    setFilters(newFilters);
  };

  const handlePersonTypeChange = (e) => {
    const newFilters = { ...filters, personType: e.target.value };
    setFilters(newFilters);
  };

  const handleSchoolChange = (e) => {
    const newFilters = { ...filters, newSchool: e.target.value };
    setFilters(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      endDate: '',
      assignmentCodes: [],
      personType: 'ALL',
      newSchool: ''
    };
    setFilters(clearedFilters);
    onApply();
  };

  const hasActiveFilters = () => {
    return filters.endDate || 
           filters.assignmentCodes.length > 0 || 
           filters.personType !== 'ALL' || 
           filters.newSchool;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-500" />
          Filter Employee Data
        </h2>
        <div className="flex items-center gap-2">
          {hasActiveFilters() && (
            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {[
                filters.endDate && 'Date',
                filters.assignmentCodes.length > 0 && `${filters.assignmentCodes.length} Codes`,
                filters.personType !== 'ALL' && filters.personType,
                filters.newSchool && 'School'
              ].filter(Boolean).join(', ')} applied
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-50"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* End Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            End Date
          </label>
          <select
            value={filters.endDate}
            onChange={handleEndDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {availableEndDates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>

        {/* Person Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Users className="w-4 h-4" />
            Person Type
          </label>
          <select
            value={filters.personType}
            onChange={handlePersonTypeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="ALL">All Types</option>
            <option value="FACULTY">Faculty</option>
            <option value="STAFF">Staff</option>
          </select>
        </div>

        {/* School Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Building className="w-4 h-4" />
            School/Division
          </label>
          <select
            value={filters.newSchool}
            onChange={handleSchoolChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Schools</option>
            {availableSchools.map(school => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>
        </div>

        {/* Apply Button */}
        <div className="flex items-end">
          <button
            onClick={onApply}
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md
                     hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     transition-colors duration-200 text-sm"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Assignment Codes Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
          <Code className="w-4 h-4" />
          Assignment Category Codes
          {filters.assignmentCodes.length > 0 && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full ml-2">
              {filters.assignmentCodes.length} selected
            </span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {ASSIGNMENT_CODES.map(code => (
            <button
              key={code}
              onClick={() => handleAssignmentCodeToggle(code)}
              className={`
                px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200
                ${filters.assignmentCodes.includes(code)
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {code}
            </button>
          ))}
        </div>
        {filters.assignmentCodes.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            Selected: {filters.assignmentCodes.join(', ')}
          </div>
        )}
      </div>

      {/* Filter Summary */}
      {hasActiveFilters() && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2 text-sm">
            {filters.endDate && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                End Date: {filters.endDate}
              </span>
            )}
            {filters.personType !== 'ALL' && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                Type: {filters.personType}
              </span>
            )}
            {filters.newSchool && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                School: {filters.newSchool}
              </span>
            )}
            {filters.assignmentCodes.length > 0 && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                Codes: {filters.assignmentCodes.join(', ')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeFilterPanel;