import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Edit,
  Eye,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Trash2
} from 'lucide-react';
import EditableTableCell from './EditableTableCell';
import StatusBadge from './StatusBadge';
import quarterComparisonService from '../../services/QuarterComparisonService';
import { toDisplayFormat } from '../../utils/quarterFormatUtils';

const QuarterlyDataTable = ({ 
  allQuartersData, 
  isEditMode, 
  onDataChange, 
  dashboardType, 
  onQuarterSelect,
  selectedQuarters = [],
  onDeleteQuarter,
  showSimplifiedColumns = false,
  onEnableEditMode
}) => {
  const [sortConfig, setSortConfig] = useState({ key: 'period', direction: 'desc' });
  const [editingCell, setEditingCell] = useState(null);
  const [processedRows, setProcessedRows] = useState([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  // Define table columns based on dashboard type
  const getColumns = useCallback(() => {
    // Debug logging
    console.log('QuarterlyDataTable getColumns called:', {
      dashboardType,
      showSimplifiedColumns,
      condition: dashboardType === 'workforce' && showSimplifiedColumns
    });

    const baseColumns = [
      { key: 'period', label: 'Reporting Period', sortable: true, width: '150px' },
      { key: 'status', label: 'Status', sortable: true, width: '100px' },
    ];

    if (dashboardType === 'workforce' && showSimplifiedColumns) {
      // Simplified columns for Workforce Headcount Admin Table
      console.log('QuarterlyDataTable: Returning SIMPLIFIED columns');
      return [
        ...baseColumns,
        { key: 'beFaculty', label: 'BE Faculty', sortable: true, editable: true, format: 'number' },
        { key: 'beStaff', label: 'BE Staff', sortable: true, editable: true, format: 'number' },
        { key: 'hsr', label: 'HSR', sortable: true, editable: true, format: 'number', tooltip: 'House Staff Residents (both campuses)' },
        { key: 'students', label: 'Student', sortable: true, editable: true, format: 'number' },
        { key: 'turnoverFaculty', label: 'BE Faculty Turnover', sortable: true, editable: true, format: 'number', tooltip: 'Benefit Eligible Faculty Turnover (both campuses)' },
        { key: 'turnoverStaff', label: 'BE Staff Turnover', sortable: true, editable: true, format: 'number', tooltip: 'Benefit Eligible Staff Turnover (both campuses)' },
        { key: 'actions', label: 'Actions', width: '120px' }
      ];
    } else if (dashboardType === 'workforce') {
      console.log('QuarterlyDataTable: Returning FULL columns for workforce');
      return [
        ...baseColumns,
        { key: 'totalEmployees', label: 'Total Employees', sortable: true, editable: true, format: 'number' },
        
        // Faculty breakdown
        { key: 'beFaculty', label: 'BE Faculty', sortable: true, editable: true, format: 'number', tooltip: 'Benefit Eligible Faculty' },
        { key: 'nbeFaculty', label: 'NBE Faculty', sortable: true, editable: true, format: 'number', tooltip: 'Non-Benefit Eligible Faculty' },
        
        // Staff breakdown
        { key: 'beStaff', label: 'BE Staff', sortable: true, editable: true, format: 'number', tooltip: 'Benefit Eligible Staff' },
        { key: 'nbeStaff', label: 'NBE Staff', sortable: true, editable: true, format: 'number', tooltip: 'Non-Benefit Eligible Staff' },
        
        // Students (always NBE)
        { key: 'students', label: 'NBE Students', sortable: true, editable: true, format: 'number', tooltip: 'Student Workers (Non-Benefit Eligible)' },
        
        // Omaha Campus breakdown
        { key: 'omahaFaculty', label: 'Omaha - Faculty', sortable: true, editable: true, format: 'number' },
        { key: 'omahaStaff', label: 'Omaha - Staff', sortable: true, editable: true, format: 'number' },
        { key: 'omahaStudents', label: 'Omaha - Students', sortable: true, editable: true, format: 'number' },
        
        // Phoenix Campus breakdown
        { key: 'phoenixFaculty', label: 'Phoenix - Faculty', sortable: true, editable: true, format: 'number' },
        { key: 'phoenixStaff', label: 'Phoenix - Staff', sortable: true, editable: true, format: 'number' },
        { key: 'phoenixStudents', label: 'Phoenix - Students', sortable: true, editable: true, format: 'number' },
        
        // New Hires breakdown
        { key: 'newHiresFaculty', label: 'New Hires - Faculty', sortable: true, editable: true, format: 'number' },
        { key: 'newHiresStaff', label: 'New Hires - Staff', sortable: true, editable: true, format: 'number' },
        { key: 'newHiresStudents', label: 'New Hires - Students', sortable: true, editable: true, format: 'number' },
        
        // Departures breakdown
        { key: 'departuresFaculty', label: 'Departures - Faculty', sortable: true, editable: true, format: 'number' },
        { key: 'departuresStaff', label: 'Departures - Staff', sortable: true, editable: true, format: 'number' },
        { key: 'departuresStudents', label: 'Departures - Students', sortable: true, editable: true, format: 'number' },
        
        { key: 'growth', label: 'Growth %', sortable: true, editable: false, format: 'percentage' },
        { key: 'lastUpdated', label: 'Last Updated', sortable: true, format: 'date' },
        { key: 'actions', label: 'Actions', width: '80px' }
      ];
    }

    // Add more dashboard-specific columns for other types
    console.log('QuarterlyDataTable: Returning DEFAULT columns for', dashboardType);
    return [
      ...baseColumns,
      { key: 'totalRecords', label: 'Total Records', sortable: true, editable: true, format: 'number' },
      { key: 'lastUpdated', label: 'Last Updated', sortable: true, format: 'date' },
      { key: 'actions', label: 'Actions', width: '80px' }
    ];
  }, [dashboardType, showSimplifiedColumns]);

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
        
        // Debug: Log what data structure we received for this period
        console.log(`=== QuarterlyDataTable Debug for ${period} ===`);
        console.log('Raw data received:', {
          totalEmployees: data.totalEmployees,
          hasdemographics: !!data.demographics,
          demographicsKeys: data.demographics ? Object.keys(data.demographics) : [],
          beFaculty: data.demographics?.beFaculty,
          beStaff: data.demographics?.beStaff,
          students: data.demographics?.students,
          nbeStudents: data.demographics?.nbeStudents
        });
        
        // Extract BE/NBE values if available, otherwise fall back to totals
        if (data.demographics?.beFaculty !== undefined || data.demographics?.nbeFaculty !== undefined) {
          // New structure with BE/NBE breakdown
          console.log('Using NEW demographics structure for', period);
          row.beFaculty = data.demographics?.beFaculty || 0;
          row.nbeFaculty = data.demographics?.nbeFaculty || 0;
          row.beStaff = data.demographics?.beStaff || 0;
          row.nbeStaff = data.demographics?.nbeStaff || 0;
          row.hsr = data.demographics?.hsr || 0;
          row.students = data.demographics?.nbeStudents || data.demographics?.students || 0;
        } else if (data.BE_Faculty_Headcount !== undefined || data.NBE_Faculty_Headcount !== undefined) {
          // Excel import structure
          row.beFaculty = data.BE_Faculty_Headcount || 0;
          row.nbeFaculty = data.NBE_Faculty_Headcount || 0;
          row.beStaff = data.BE_Staff_Headcount || 0;
          row.nbeStaff = data.NBE_Staff_Headcount || 0;
          row.students = data.NBE_Student_Worker_Headcount || 0;
        } else {
          // Legacy structure - split totals 70/30 for demonstration
          const faculty = data.demographics?.faculty || 0;
          const staff = data.demographics?.staff || 0;
          row.beFaculty = Math.round(faculty * 0.7);
          row.nbeFaculty = faculty - row.beFaculty;
          row.beStaff = Math.round(staff * 0.7);
          row.nbeStaff = staff - row.beStaff;
          row.students = data.demographics?.students || 0;
        }
        
        // Extract location breakdown data
        const locations = data.byLocation || {};
        const omaha = Object.values(locations).find(loc => loc.name?.toLowerCase().includes('omaha')) || 
                      Object.entries(locations).find(([key]) => key.toLowerCase().includes('omaha'))?.[1] || {};
        const phoenix = Object.values(locations).find(loc => loc.name?.toLowerCase().includes('phoenix')) || 
                        Object.entries(locations).find(([key]) => key.toLowerCase().includes('phoenix'))?.[1] || {};
        
        // Omaha Campus breakdown
        row.omahaFaculty = omaha.breakdown?.faculty || 0;
        row.omahaStaff = omaha.breakdown?.staff || 0;
        row.omahaStudents = omaha.breakdown?.students || 0;
        
        // Phoenix Campus breakdown
        row.phoenixFaculty = phoenix.breakdown?.faculty || 0;
        row.phoenixStaff = phoenix.breakdown?.staff || 0;
        row.phoenixStudents = phoenix.breakdown?.students || 0;
        
        // New Hires breakdown
        const newHires = data.trends?.newHires || {};
        row.newHiresFaculty = typeof newHires === 'object' ? newHires.faculty || 0 : 0;
        row.newHiresStaff = typeof newHires === 'object' ? newHires.staff || 0 : 0;
        row.newHiresStudents = typeof newHires === 'object' ? newHires.students || 0 : 0;
        
        // Departures breakdown
        const departures = data.trends?.departures || {};
        row.departuresFaculty = typeof departures === 'object' ? departures.faculty || 0 : 0;
        row.departuresStaff = typeof departures === 'object' ? departures.staff || 0 : 0;
        row.departuresStudents = typeof departures === 'object' ? departures.students || 0 : 0;
        
        // Growth % will be calculated dynamically in a separate effect
        row.growth = 0; // Placeholder - will be updated by calculateGrowthPercentages
        
        // Extract turnover totals for simplified view
        const trends = data.trends || {};
        const turnoverBeFacultyOmaha = trends.turnoverBeFacultyOmaha || 0;
        const turnoverBeStaffOmaha = trends.turnoverBeStaffOmaha || 0;
        const turnoverBeFacultyPhoenix = trends.turnoverBeFacultyPhoenix || 0;
        const turnoverBeStaffPhoenix = trends.turnoverBeStaffPhoenix || 0;
        
        row.turnoverFaculty = turnoverBeFacultyOmaha + turnoverBeFacultyPhoenix;
        row.turnoverStaff = turnoverBeStaffOmaha + turnoverBeStaffPhoenix;
        
        // Debug: Log final row values for this period
        console.log(`Final row values for ${period}:`, {
          beFaculty: row.beFaculty,
          beStaff: row.beStaff,
          students: row.students,
          totalEmployees: row.totalEmployees,
          omahaFaculty: row.omahaFaculty,
          phoenixFaculty: row.phoenixFaculty
        });
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

  // Calculate growth percentages asynchronously for workforce data
  const calculateGrowthPercentages = useCallback(async (rows) => {
    if (dashboardType !== 'workforce' || !rows.length) {
      return rows;
    }

    const updatedRows = await Promise.all(
      rows.map(async (row) => {
        try {
          const growthData = await quarterComparisonService.calculateWorkforceChanges(
            row.period,
            row.rawData
          );
          
          return {
            ...row,
            growth: growthData.totalChange || 0
          };
        } catch (error) {
          console.warn(`Failed to calculate growth for ${row.period}:`, error);
          return {
            ...row,
            growth: 0
          };
        }
      })
    );

    return updatedRows;
  }, [dashboardType, quarterComparisonService]);

  // Process rows with growth calculations
  useEffect(() => {
    const processRows = async () => {
      const basicRows = transformDataToRows(allQuartersData);
      const rowsWithGrowth = await calculateGrowthPercentages(basicRows);
      setProcessedRows(rowsWithGrowth);
    };

    processRows();
  }, [allQuartersData, transformDataToRows, calculateGrowthPercentages]);

  // Sort table data
  const sortedData = useMemo(() => {
    const rows = processedRows.length > 0 ? processedRows : transformDataToRows(allQuartersData);
    
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
  }, [allQuartersData, sortConfig, transformDataToRows, processedRows]);

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
    } else if (columnKey === 'beFaculty') {
      if (!updatedData.demographics) updatedData.demographics = {};
      updatedData.demographics.beFaculty = newValue;
      // Update total faculty
      updatedData.demographics.faculty = newValue + (updatedData.demographics.nbeFaculty || 0);
      // Update total employees
      updatedData.totalEmployees = (updatedData.demographics.beFaculty || 0) + 
                                   (updatedData.demographics.nbeFaculty || 0) + 
                                   (updatedData.demographics.beStaff || 0) + 
                                   (updatedData.demographics.nbeStaff || 0) + 
                                   (updatedData.demographics.hsr || 0) +
                                   (updatedData.demographics.students || 0);
    } else if (columnKey === 'nbeFaculty') {
      if (!updatedData.demographics) updatedData.demographics = {};
      updatedData.demographics.nbeFaculty = newValue;
      // Update total faculty
      updatedData.demographics.faculty = (updatedData.demographics.beFaculty || 0) + newValue;
      // Update total employees
      updatedData.totalEmployees = (updatedData.demographics.beFaculty || 0) + 
                                   (updatedData.demographics.nbeFaculty || 0) + 
                                   (updatedData.demographics.beStaff || 0) + 
                                   (updatedData.demographics.nbeStaff || 0) + 
                                   (updatedData.demographics.hsr || 0) +
                                   (updatedData.demographics.students || 0);
    } else if (columnKey === 'beStaff') {
      if (!updatedData.demographics) updatedData.demographics = {};
      updatedData.demographics.beStaff = newValue;
      // Update total staff
      updatedData.demographics.staff = newValue + (updatedData.demographics.nbeStaff || 0);
      // Update total employees
      updatedData.totalEmployees = (updatedData.demographics.beFaculty || 0) + 
                                   (updatedData.demographics.nbeFaculty || 0) + 
                                   (updatedData.demographics.beStaff || 0) + 
                                   (updatedData.demographics.nbeStaff || 0) + 
                                   (updatedData.demographics.hsr || 0) +
                                   (updatedData.demographics.students || 0);
    } else if (columnKey === 'nbeStaff') {
      if (!updatedData.demographics) updatedData.demographics = {};
      updatedData.demographics.nbeStaff = newValue;
      // Update total staff
      updatedData.demographics.staff = (updatedData.demographics.beStaff || 0) + newValue;
      // Update total employees
      updatedData.totalEmployees = (updatedData.demographics.beFaculty || 0) + 
                                   (updatedData.demographics.nbeFaculty || 0) + 
                                   (updatedData.demographics.beStaff || 0) + 
                                   (updatedData.demographics.nbeStaff || 0) + 
                                   (updatedData.demographics.hsr || 0) +
                                   (updatedData.demographics.students || 0);
    } else if (columnKey === 'hsr') {
      if (!updatedData.demographics) updatedData.demographics = {};
      updatedData.demographics.hsr = newValue;
      // Update total employees
      updatedData.totalEmployees = (updatedData.demographics.beFaculty || 0) + 
                                   (updatedData.demographics.nbeFaculty || 0) + 
                                   (updatedData.demographics.beStaff || 0) + 
                                   (updatedData.demographics.nbeStaff || 0) + 
                                   (updatedData.demographics.hsr || 0) +
                                   (updatedData.demographics.students || 0);
    } else if (columnKey === 'students') {
      if (!updatedData.demographics) updatedData.demographics = {};
      updatedData.demographics.students = newValue;
      updatedData.demographics.nbeStudents = newValue; // Students are always NBE
      // Update total employees
      updatedData.totalEmployees = (updatedData.demographics.beFaculty || 0) + 
                                   (updatedData.demographics.nbeFaculty || 0) + 
                                   (updatedData.demographics.beStaff || 0) + 
                                   (updatedData.demographics.nbeStaff || 0) + 
                                   (updatedData.demographics.hsr || 0) +
                                   (updatedData.demographics.students || 0);
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
  const formatCellValue = useCallback((value, format, columnKey) => {
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
          {showSimplifiedColumns && dashboardType === 'workforce' 
            ? 'Workforce Headcount Admin Table'
            : `${dashboardType.charAt(0).toUpperCase() + dashboardType.slice(1)} Data by Reporting Period`
          }
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {sortedData.length} reporting periods • {isEditMode ? 'Edit mode active' : 'View mode'}
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
                        {showSimplifiedColumns && (
                          <>
                            {!isEditMode && (
                              <button
                                onClick={() => {
                                  if (onEnableEditMode) {
                                    onEnableEditMode();
                                  }
                                }}
                                className="p-1 text-blue-600 hover:text-blue-800 rounded"
                                title="Enable edit mode"
                              >
                                <Edit size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteConfirmation(row.period)}
                              className="p-1 text-red-600 hover:text-red-800 rounded"
                              title="Delete reporting period"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        {!showSimplifiedColumns && (
                          <>
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
                          </>
                        )}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">No reporting period data found for {dashboardType} dashboard.</p>
          </div>
        )}
      </div>

      {/* Table Footer */}
      {sortedData.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing {sortedData.length} reporting periods
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
      
      
      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Reporting Period Data?
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete data for {deleteConfirmation}? This action cannot be undone.
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

export default QuarterlyDataTable;