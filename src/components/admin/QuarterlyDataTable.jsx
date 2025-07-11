import React, { useState, useCallback, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Edit,
  Eye,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText
} from 'lucide-react';
import EditableTableCell from './EditableTableCell';
import StatusBadge from './StatusBadge';

const QuarterlyDataTable = ({ 
  allQuartersData, 
  isEditMode, 
  onDataChange, 
  dashboardType, 
  onQuarterSelect,
  selectedQuarters = []
}) => {
  const [sortConfig, setSortConfig] = useState({ key: 'period', direction: 'desc' });
  const [editingCell, setEditingCell] = useState(null);

  // Define table columns based on dashboard type
  const getColumns = useCallback(() => {
    const baseColumns = [
      { key: 'period', label: 'Quarter', sortable: true, width: '120px' },
      { key: 'status', label: 'Status', sortable: true, width: '100px' },
    ];

    if (dashboardType === 'workforce') {
      return [
        ...baseColumns,
        { key: 'totalEmployees', label: 'Total Employees', sortable: true, editable: true, format: 'number' },
        { key: 'faculty', label: 'Faculty', sortable: true, editable: true, format: 'number' },
        { key: 'staff', label: 'Staff', sortable: true, editable: true, format: 'number' },
        { key: 'students', label: 'Students', sortable: true, editable: true, format: 'number' },
        { key: 'omahaCount', label: 'Omaha Campus', sortable: true, editable: true, format: 'number' },
        { key: 'phoenixCount', label: 'Phoenix Campus', sortable: true, editable: true, format: 'number' },
        { key: 'newHires', label: 'New Hires', sortable: true, editable: true, format: 'number' },
        { key: 'departures', label: 'Departures', sortable: true, editable: true, format: 'number' },
        { key: 'growth', label: 'Growth %', sortable: true, format: 'percentage' },
        { key: 'lastUpdated', label: 'Last Updated', sortable: true, format: 'date' },
        { key: 'actions', label: 'Actions', width: '80px' }
      ];
    }

    // Add more dashboard-specific columns for other types
    return [
      ...baseColumns,
      { key: 'totalRecords', label: 'Total Records', sortable: true, editable: true, format: 'number' },
      { key: 'lastUpdated', label: 'Last Updated', sortable: true, format: 'date' },
      { key: 'actions', label: 'Actions', width: '80px' }
    ];
  }, [dashboardType]);

  // Transform Firebase data to table rows
  const transformDataToRows = useCallback((quarterData) => {
    if (!quarterData || Object.keys(quarterData).length === 0) return [];

    return Object.entries(quarterData).map(([period, data]) => {
      const row = {
        period,
        status: getDataStatus(data),
        lastUpdated: data.lastUpdated,
        rawData: data
      };

      if (dashboardType === 'workforce') {
        row.totalEmployees = data.totalEmployees || 0;
        row.faculty = data.demographics?.faculty || 0;
        row.staff = data.demographics?.staff || 0;
        row.students = data.demographics?.students || 0;
        row.omahaCount = data.byLocation?.[Object.keys(data.byLocation || {})[0]] || 0;
        row.phoenixCount = data.byLocation?.[Object.keys(data.byLocation || {})[1]] || 0;
        row.newHires = data.trends?.newHires || 0;
        row.departures = data.trends?.departures || 0;
        row.growth = data.trends?.quarterlyGrowth || 0;
      } else {
        row.totalRecords = Object.keys(data).length;
      }

      return row;
    });
  }, [dashboardType]);

  // Determine data status for status badge
  const getDataStatus = useCallback((data) => {
    if (!data || Object.keys(data).length === 0) return 'empty';
    
    const hasRequiredFields = data.totalEmployees > 0 || Object.keys(data).length > 5;
    const isRecent = data.lastUpdated && 
      new Date() - new Date(data.lastUpdated.toDate?.() || data.lastUpdated) < 30 * 24 * 60 * 60 * 1000; // 30 days
    
    if (hasRequiredFields && isRecent) return 'complete';
    if (hasRequiredFields && !isRecent) return 'outdated';
    if (!hasRequiredFields) return 'incomplete';
    return 'draft';
  }, []);

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

  // Handle cell value change
  const handleCellChange = useCallback((period, columnKey, newValue) => {
    const quarterData = allQuartersData[period];
    if (!quarterData) return;

    const updatedData = { ...quarterData };
    
    // Update the appropriate field in the data structure
    if (columnKey === 'totalEmployees') {
      updatedData.totalEmployees = newValue;
    } else if (columnKey === 'faculty') {
      if (!updatedData.demographics) updatedData.demographics = {};
      updatedData.demographics.faculty = newValue;
    } else if (columnKey === 'staff') {
      if (!updatedData.demographics) updatedData.demographics = {};
      updatedData.demographics.staff = newValue;
    } else if (columnKey === 'students') {
      if (!updatedData.demographics) updatedData.demographics = {};
      updatedData.demographics.students = newValue;
    } else if (columnKey === 'newHires') {
      if (!updatedData.trends) updatedData.trends = {};
      updatedData.trends.newHires = newValue;
    } else if (columnKey === 'departures') {
      if (!updatedData.trends) updatedData.trends = {};
      updatedData.trends.departures = newValue;
    }

    // Add edit metadata
    updatedData.lastUpdated = new Date();
    updatedData.lastEditedBy = 'Table Editor';

    onDataChange(period, updatedData);
  }, [allQuartersData, onDataChange]);

  // Format cell value for display
  const formatCellValue = useCallback((value, format) => {
    if (value === null || value === undefined) return '-';
    
    switch (format) {
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'percentage':
        return typeof value === 'number' ? `${value.toFixed(1)}%` : value;
      case 'date':
        if (value?.toDate) return value.toDate().toLocaleDateString();
        if (value instanceof Date) return value.toLocaleDateString();
        return value;
      default:
        return value;
    }
  }, []);

  const columns = getColumns();

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Table Header */}
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {dashboardType.charAt(0).toUpperCase() + dashboardType.slice(1)} Data by Quarter
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {sortedData.length} quarters • {isEditMode ? 'Edit mode active' : 'View mode'}
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
                  <div className="flex items-center gap-1">
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
                  selectedQuarters.includes(row.period) ? 'bg-blue-50' : ''
                }`}
              >
                {columns.map(column => (
                  <td
                    key={`${row.period}-${column.key}`}
                    className="px-4 py-3 whitespace-nowrap text-sm"
                  >
                    {column.key === 'status' ? (
                      <StatusBadge status={row.status} />
                    ) : column.key === 'actions' ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onQuarterSelect?.(row.period)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          title="View details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          title="More actions"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    ) : column.editable && isEditMode ? (
                      <EditableTableCell
                        value={row[column.key]}
                        format={column.format}
                        onChange={(newValue) => handleCellChange(row.period, column.key, newValue)}
                        isEditing={editingCell === `${row.period}-${column.key}`}
                        onEditStart={() => setEditingCell(`${row.period}-${column.key}`)}
                        onEditEnd={() => setEditingCell(null)}
                      />
                    ) : (
                      <span className={`${
                        typeof row[column.key] === 'number' ? 'font-mono' : ''
                      }`}>
                        {formatCellValue(row[column.key], column.format)}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">No quarterly data found for {dashboardType} dashboard.</p>
          </div>
        )}
      </div>

      {/* Table Footer */}
      {sortedData.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing {sortedData.length} quarters
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
    </div>
  );
};

export default QuarterlyDataTable;