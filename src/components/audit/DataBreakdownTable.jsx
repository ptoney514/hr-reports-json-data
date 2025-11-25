import React, { useState, useMemo } from 'react';
import { Filter, Download, CheckCircle, XCircle, Users, Briefcase } from 'lucide-react';
import dataBreakdownService from '../../services/dataBreakdownService';

const DataBreakdownTable = ({ type = 'workforce', quarterDate = '2025-09-30' }) => {
  const [filters, setFilters] = useState({
    grade: 'all',
    assignment: 'all',
    eligible: 'all',
    category: 'all'
  });

  // Get data based on type
  const rawData = type === 'workforce'
    ? dataBreakdownService.getWorkforceBreakdown(quarterDate)
    : dataBreakdownService.getTerminationBreakdown(quarterDate);

  // Apply filters
  const filteredData = useMemo(() => {
    return dataBreakdownService.filterBreakdown(rawData, filters);
  }, [rawData, filters]);

  // Get unique values for filter dropdowns
  const uniqueGrades = useMemo(() => {
    return ['all', ...new Set(rawData.map(item => item.grade))];
  }, [rawData]);

  const uniqueAssignments = useMemo(() => {
    return ['all', ...new Set(rawData.map(item => item.assignment))];
  }, [rawData]);

  const uniqueCategories = useMemo(() => {
    return ['all', ...new Set(rawData.map(item => item.category))];
  }, [rawData]);

  // Calculate totals
  const totals = useMemo(() => {
    const total = filteredData.reduce((sum, item) => sum + item.count, 0);
    const eligible = filteredData.filter(item => item.eligible).reduce((sum, item) => sum + item.count, 0);
    const notEligible = total - eligible;

    return { total, eligible, notEligible };
  }, [filteredData]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const resetFilters = () => {
    setFilters({
      grade: 'all',
      assignment: 'all',
      eligible: 'all',
      category: 'all'
    });
  };

  const exportToCSV = () => {
    const headers = ['Grade', 'Assignment', 'Category', 'Count', 'Eligible', 'Notes'];
    const rows = filteredData.map(item => [
      item.grade,
      item.assignment,
      item.category,
      item.count,
      item.eligible ? 'Yes' : 'No',
      item.notes || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_breakdown_${quarterDate}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {type === 'workforce' ? <Users className="h-5 w-5" /> : <Briefcase className="h-5 w-5" />}
            {type === 'workforce' ? 'Workforce' : 'Termination'} Breakdown
          </h3>
          <p className="text-sm text-gray-600">
            Q1 FY26 ({new Date(quarterDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Grade</label>
            <select
              value={filters.grade}
              onChange={(e) => handleFilterChange('grade', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              {uniqueGrades.map(grade => (
                <option key={grade} value={grade}>
                  {grade === 'all' ? 'All Grades' : grade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Assignment</label>
            <select
              value={filters.assignment}
              onChange={(e) => handleFilterChange('assignment', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              {uniqueAssignments.map(assignment => (
                <option key={assignment} value={assignment}>
                  {assignment === 'all' ? 'All Assignments' : assignment}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              {uniqueCategories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Eligibility</label>
            <select
              value={filters.eligible}
              onChange={(e) => handleFilterChange('eligible', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="true">Benefit-Eligible</option>
              <option value="false">Not Eligible</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-gray-600">
            Showing {filteredData.length} of {rawData.length} rows
          </div>
          <button
            onClick={resetFilters}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-700 font-medium">Total Count</div>
          <div className="text-2xl font-bold text-blue-900">{totals.total.toLocaleString()}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-700 font-medium">Benefit-Eligible</div>
          <div className="text-2xl font-bold text-green-900">{totals.eligible.toLocaleString()}</div>
          <div className="text-xs text-green-700 mt-1">
            {((totals.eligible / totals.total) * 100).toFixed(1)}% of total
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-700 font-medium">Not Eligible</div>
          <div className="text-2xl font-bold text-gray-900">{totals.notEligible.toLocaleString()}</div>
          <div className="text-xs text-gray-700 mt-1">
            {((totals.notEligible / totals.total) * 100).toFixed(1)}% of total
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Eligible
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No data matches the selected filters
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={idx} className={`hover:bg-gray-50 ${!item.eligible ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.grade}</div>
                      <div className="text-xs text-gray-500">{item.gradeDescription}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.assignment}</div>
                      <div className="text-xs text-gray-500">{item.assignmentDescription}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-gray-900">{item.count.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      {item.eligible ? (
                        <CheckCircle className="h-5 w-5 text-green-600 inline-block" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 inline-block" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-600 max-w-md">{item.notes}</div>
                      {item.breakdown && (
                        <div className="mt-1 text-xs text-gray-500">
                          {Object.entries(item.breakdown).map(([key, value], i) => (
                            <div key={i}>• {key}: {value}</div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-800">
          <strong>Note:</strong> This breakdown reflects the current methodology with Grade R exclusion applied (Nov 2025 change).
          Rows highlighted in red represent non-benefit-eligible employees.
        </p>
      </div>
    </div>
  );
};

export default DataBreakdownTable;
