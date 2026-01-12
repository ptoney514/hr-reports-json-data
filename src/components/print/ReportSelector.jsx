import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus, Calendar, FileText } from 'lucide-react';

/**
 * ReportSelector - Dropdown to switch between different reports
 *
 * Features:
 * - Shows current report with quarter badge
 * - Dropdown list of all available reports
 * - Visual indicator for current selection
 * - Option to create new report
 */
const ReportSelector = ({ reports, currentReportId, onReportChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  // Get current report
  const currentReport = reports?.find(r => r.id === currentReportId);

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Get report type icon
  const getReportIcon = (type) => {
    switch (type) {
      case 'quarterly':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'annual':
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded">
          {currentReport?.name || 'Select Report'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Reports List */}
          <div className="max-h-80 overflow-y-auto">
            {reports?.map(report => (
              <button
                key={report.id}
                onClick={() => {
                  onReportChange(report.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  report.id === currentReportId ? 'bg-blue-50' : ''
                }`}
              >
                {/* Report Type Icon */}
                {getReportIcon(report.type)}

                {/* Report Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{report.name}</span>
                    <span className={`px-1.5 py-0.5 text-xs rounded ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {report.dateRange?.label}
                  </p>
                </div>

                {/* Selected Indicator */}
                {report.id === currentReportId && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Create New Report */}
          <button
            onClick={() => {
              // TODO: Open create report modal
              console.log('Create new report');
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Create New Report</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportSelector;
