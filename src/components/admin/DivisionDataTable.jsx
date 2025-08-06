import React, { useState, useCallback, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Edit,
  Trash2,
  FileText
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import EditModal from './EditModal';
import { toDisplayFormat } from '../../utils/quarterFormatUtils';

const DivisionDataTable = ({ 
  allQuartersData, 
  isEditMode, 
  onDataChange, 
  onDeleteQuarter,
  selectedQuarters = []
}) => {
  const [sortConfig, setSortConfig] = useState({ key: 'period', direction: 'desc' });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedQuarterForEdit, setSelectedQuarterForEdit] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  // Define table columns for division admin
  const getColumns = useCallback(() => {
    return [
      { key: 'period', label: 'Reporting Period', sortable: true, width: '150px' },
      { key: 'status', label: 'Status', sortable: true, width: '100px' },
      { key: 'department', label: 'Department', sortable: true, width: '180px' },
      { key: 'beStaff', label: 'BE Staff', sortable: true, editable: true, format: 'number' },
      { key: 'students', label: 'Student', sortable: true, editable: true, format: 'number' },
      { key: 'turnoverFaculty', label: 'Turnover Faculty', sortable: true, editable: true, format: 'number' },
      { key: 'turnoverStaff', label: 'Turnover Staff', sortable: true, editable: true, format: 'number' },
      { key: 'actions', label: 'Actions', width: '120px' }
    ];
  }, []);

  // Determine data status for status badge
  const getDataStatus = useCallback((data) => {
    if (!data || Object.keys(data).length === 0) return 'empty';
    
    const hasRequiredFields = (data.beStaff && data.beStaff > 0) || Object.keys(data).length > 3;
    
    // Handle date checking for both Firebase timestamps and regular dates
    let isRecent = false;
    if (data.lastUpdated) {
      try {
        // Handle Firebase timestamp objects
        if (data.lastUpdated.toDate && typeof data.lastUpdated.toDate === 'function') {
          isRecent = new Date() - data.lastUpdated.toDate() < 30 * 24 * 60 * 60 * 1000; // 30 days
        }
        // Handle regular Date objects or date strings
        else {
          const lastUpdatedDate = data.lastUpdated instanceof Date ? data.lastUpdated : new Date(data.lastUpdated);
          isRecent = new Date() - lastUpdatedDate < 30 * 24 * 60 * 60 * 1000; // 30 days
        }
      } catch (error) {
        console.warn('Error parsing lastUpdated date:', error);
        isRecent = false;
      }
    }
    
    if (hasRequiredFields && isRecent) return 'complete';
    if (hasRequiredFields && !isRecent) return 'outdated';
    if (!hasRequiredFields) return 'incomplete';
    return 'draft';
  }, []);

  // Transform data to division rows
  const transformDataToRows = useCallback((quarterData) => {
    if (!quarterData || Object.keys(quarterData).length === 0) return [];

    const rows = [];

    Object.entries(quarterData).forEach(([period, data]) => {
      const divisions = data.byDivision || {};
      
      if (Object.keys(divisions).length === 0) {
        // Create a default row if no division data exists
        rows.push({
          period,
          status: getDataStatus(data),
          department: 'All Divisions',
          beStaff: data.demographics?.beStaff || 0,
          students: data.demographics?.students || 0,
          turnoverFaculty: data.trends?.turnoverBeFacultyOmaha || 0 + data.trends?.turnoverBeFacultyPhoenix || 0,
          turnoverStaff: data.trends?.turnoverBeStaffOmaha || 0 + data.trends?.turnoverBeStaffPhoenix || 0,
          rawData: data
        });
      } else {
        // Create rows for each division
        Object.entries(divisions).forEach(([divisionKey, divisionData]) => {
          rows.push({
            period: `${period}-${divisionKey}`,
            displayPeriod: period,
            status: getDataStatus(divisionData),
            department: divisionData.name || divisionKey,
            beStaff: divisionData.beStaff || 0,
            students: divisionData.students || 0,
            turnoverFaculty: divisionData.turnoverFaculty || 0,
            turnoverStaff: divisionData.turnoverStaff || 0,
            rawData: data,
            divisionKey: divisionKey
          });
        });
      }
    });

    return rows;
  }, [getDataStatus]);

  // Sort table data
  const sortedData = useMemo(() => {
    const rows = transformDataToRows(allQuartersData);
    
    if (!sortConfig.key) return rows;

    return [...rows].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      let comparison = 0;
      if (typeof aVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number') {
        comparison = aVal - bVal;
      } else if (aVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      }
      
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [allQuartersData, sortConfig, transformDataToRows]);

  // Handle column sort
  const handleSort = useCallback((columnKey) => {
    setSortConfig(prevConfig => ({
      key: columnKey,
      direction: prevConfig.key === columnKey && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Format cell value for display
  const formatCellValue = useCallback((value, format, columnKey) => {
    if (value === null || value === undefined) return '-';
    
    switch (format) {
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'percentage':
        return typeof value === 'number' ? `${value.toFixed(1)}%` : value;
      case 'date':
        try {
          // Handle Firebase timestamp objects
          if (value?.toDate && typeof value.toDate === 'function') {
            return value.toDate().toLocaleDateString();
          }
          // Handle regular Date objects
          if (value instanceof Date) {
            return value.toLocaleDateString();
          }
          // Handle date strings
          if (typeof value === 'string' && value.length > 0) {
            const dateObj = new Date(value);
            if (!isNaN(dateObj.getTime())) {
              return dateObj.toLocaleDateString();
            }
          }
          return value;
        } catch (error) {
          console.warn('Error formatting date value:', value, error);
          return value;
        }
      default:
        // Format quarter values using display format
        if (columnKey === 'period') {
          return toDisplayFormat(value);
        }
        return value;
    }
  }, []);

  const columns = getColumns();

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Table Header */}
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Division Headcount Admin Table
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {sortedData.length} division records • {isEditMode ? 'Edit mode active' : 'View mode'}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Head */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1" title={column.tooltip || ''}>
                    {column.label}
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          size={12} 
                          className={`${
                            sortConfig.key === column.key && sortConfig.direction === 'asc'
                              ? 'text-blue-600' 
                              : 'text-gray-400'
                          }`}
                        />
                        <ChevronDown 
                          size={12} 
                          className={`${
                            sortConfig.key === column.key && sortConfig.direction === 'desc'
                              ? 'text-blue-600' 
                              : 'text-gray-400'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((row, rowIndex) => (
              <tr 
                key={row.period}
                className={`hover:bg-gray-50 ${
                  selectedQuarters.includes(row.displayPeriod || row.period) ? 'bg-blue-50' : ''
                }`}
              >
                {columns.map(column => (
                  <td
                    key={`${row.period}-${column.key}`}
                    className="px-4 py-3 whitespace-nowrap text-sm"
                  >
                    {column.key === 'status' ? (
                      <StatusBadge status={row.status} />
                    ) : column.key === 'period' ? (
                      <span className="font-medium">{formatCellValue(row.period, column.format, column.key)}</span>
                    ) : column.key === 'actions' ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedQuarterForEdit(row);
                            setEditModalOpen(true);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800 rounded"
                          title="Edit division data"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmation(row.period)}
                          className="p-1 text-red-600 hover:text-red-800 rounded"
                          title="Delete division data"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className={`${
                        typeof row[column.key] === 'number' ? 'font-mono' : ''
                      }`}>
                        {formatCellValue(row[column.key], column.format, column.key)}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {sortedData.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Division Data Available</h3>
            <p className="text-gray-600">No division data found for this dashboard.</p>
          </div>
        )}
      </div>

      {/* Table Footer */}
      {sortedData.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing {sortedData.length} division records
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <StatusBadge status="complete" size="sm" />
                <span>Complete</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status="incomplete" size="sm" />
                <span>Issues</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status="outdated" size="sm" />
                <span>Outdated</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Modal */}
      <EditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedQuarterForEdit(null);
        }}
        quarterData={selectedQuarterForEdit}
        onSave={onDataChange}
      />
      
      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Division Data?
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this division data? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteQuarter?.(deleteConfirmation);
                  setDeleteConfirmation(null);
                }}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DivisionDataTable;