import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import { generateTableSummary, announceToScreenReader } from '../../utils/accessibilityUtils';

const AccessibleDataTable = memo(({
  data = [],
  columns = [],
  title = 'Data Table',
  caption = '',
  sortable = true,
  selectable = false,
  pageSize = 10,
  showPagination = true,
  className = '',
  onRowSelect = null,
  onSort = null,
  initialSort = null
}) => {
  // State management
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState(initialSort || { key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [focusedCell, setFocusedCell] = useState({ row: -1, col: -1 });
  const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);
  
  // Refs
  const tableRef = useRef(null);

  // Generate unique IDs
  const tableId = `table-${Date.now()}`;
  const captionId = `${tableId}-caption`;
  const summaryId = `${tableId}-summary`;

  // Memoized sorted and paginated data
  const processedData = React.useMemo(() => {
    let sortedData = [...data];
    
    // Apply sorting
    if (sortConfig.key) {
      sortedData.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal === bVal) return 0;
        
        const comparison = aVal < bVal ? -1 : 1;
        return sortConfig.direction === 'desc' ? -comparison : comparison;
      });
    }
    
    // Apply pagination
    if (showPagination) {
      const startIndex = currentPage * pageSize;
      return sortedData.slice(startIndex, startIndex + pageSize);
    }
    
    return sortedData;
  }, [data, sortConfig, currentPage, pageSize, showPagination]);

  // Calculate pagination info
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = currentPage * pageSize + 1;
  const endIndex = Math.min((currentPage + 1) * pageSize, data.length);

  // Generate table summary for screen readers
  const tableSummary = generateTableSummary(data, columns, title);

  // Handle sorting
  const handleSort = useCallback((columnKey) => {
    if (!sortable) return;
    
    const newDirection = 
      sortConfig.key === columnKey && sortConfig.direction === 'asc' 
        ? 'desc' 
        : 'asc';
    
    const newSortConfig = { key: columnKey, direction: newDirection };
    setSortConfig(newSortConfig);
    
    // Announce sort change
    const column = columns.find(col => col.key === columnKey);
    const columnName = column?.header || columnKey;
    announceToScreenReader(
      `Table sorted by ${columnName} in ${newDirection}ending order`
    );
    
    // Reset to first page when sorting
    setCurrentPage(0);
    
    // Call external sort handler
    if (onSort) {
      onSort(newSortConfig);
    }
  }, [sortable, sortConfig, columns, onSort]);

  // Handle row selection
  const handleRowSelect = (rowIndex, data) => {
    if (!selectable) return;
    
    const newSelectedRows = new Set(selectedRows);
    const dataIndex = currentPage * pageSize + rowIndex;
    
    if (newSelectedRows.has(dataIndex)) {
      newSelectedRows.delete(dataIndex);
    } else {
      newSelectedRows.add(dataIndex);
    }
    
    setSelectedRows(newSelectedRows);
    
    // Announce selection change
    const selectedCount = newSelectedRows.size;
    announceToScreenReader(
      `${selectedCount} row${selectedCount !== 1 ? 's' : ''} selected`
    );
    
    if (onRowSelect) {
      onRowSelect(Array.from(newSelectedRows), data);
    }
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((event) => {
    // Basic keyboard support for table navigation
    switch (event.key) {
      case 'Enter':
      case ' ':
        // Handle activation
        event.preventDefault();
        break;
      case 'Escape':
        // Handle escape
        event.preventDefault();
        break;
      default:
        // No action needed for other keys
        break;
    }
  }, []);

  // Focus handlers
  const handleTableFocus = () => {
    setIsKeyboardNavigating(true);
    if (focusedCell.row === -1 && focusedCell.col === -1) {
      setFocusedCell({ row: -1, col: selectable ? 0 : 0 });
    }
    announceToScreenReader(`Focused on ${title}. ${tableSummary}`);
  };

  const handleTableBlur = (event) => {
    // Only blur if focus is leaving the table entirely
    if (!tableRef.current?.contains(event.relatedTarget)) {
      setIsKeyboardNavigating(false);
      setFocusedCell({ row: -1, col: -1 });
    }
  };

  // Pagination handlers
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    setFocusedCell({ row: -1, col: -1 });
    announceToScreenReader(`Page ${newPage + 1} of ${totalPages}`);
  }, [totalPages]);

  // Effect to handle keyboard events
  useEffect(() => {
    const tableElement = tableRef.current;
    if (tableElement) {
      tableElement.addEventListener('keydown', handleKeyDown);
      return () => {
        tableElement.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown]);

  // Render sort indicator
  const renderSortIndicator = useCallback((columnKey) => {
    if (!sortable) return null;
    
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === 'asc' ? 
        <ChevronUp size={16} className="ml-1" /> : 
        <ChevronDown size={16} className="ml-1" />;
    }
    
    return <ArrowUpDown size={16} className="ml-1 opacity-50" />;
  }, [sortable, sortConfig]);

  // Render cell content
  const renderCellContent = useCallback((value, column) => {
    if (column.render) {
      return column.render(value);
    }
    
    if (value === null || value === undefined) {
      return <span className="text-gray-400">—</span>;
    }
    
    if (column.format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    }
    
    if (column.format === 'percentage') {
      return `${(value * 100).toFixed(1)}%`;
    }
    
    if (column.format === 'number') {
      return value.toLocaleString();
    }
    
    return value.toString();
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {caption && (
            <p className="text-sm text-gray-600 mt-1">{caption}</p>
          )}
        </div>
      )}
      
      {/* Screen reader summary */}
      <div id={summaryId} className="sr-only">
        {tableSummary}
        {showPagination && (
          <span>
            Showing {startIndex} to {endIndex} of {data.length} entries.
            Page {currentPage + 1} of {totalPages}.
          </span>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table
          ref={tableRef}
          id={tableId}
          className="table-navigable w-full"
          role="table"
          aria-labelledby={title ? captionId : undefined}
          aria-describedby={summaryId}
          tabIndex={0}
          onFocus={handleTableFocus}
          onBlur={handleTableBlur}
        >
          {(title || caption) && (
            <caption id={captionId} className="sr-only">
              {title} {caption && `- ${caption}`}
            </caption>
          )}
          
          <thead className="bg-gray-50">
            <tr role="row">
              {selectable && (
                <th
                  role="columnheader"
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    focusedCell.row === -1 && focusedCell.col === 0 && isKeyboardNavigating
                      ? 'current-cell'
                      : ''
                  }`}
                  tabIndex={-1}
                >
                  <span className="sr-only">Select all</span>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={selectedRows.size === processedData.length && processedData.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const allIndices = new Set();
                        for (let i = 0; i < processedData.length; i++) {
                          allIndices.add(currentPage * pageSize + i);
                        }
                        setSelectedRows(allIndices);
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              
              {columns.map((column, index) => {
                const colIndex = index + (selectable ? 1 : 0);
                const isFocused = focusedCell.row === -1 && focusedCell.col === colIndex && isKeyboardNavigating;
                
                return (
                  <th
                    key={column.key}
                    role="columnheader"
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    } ${isFocused ? 'current-cell' : ''}`}
                    onClick={() => sortable && handleSort(column.key)}
                    tabIndex={-1}
                    aria-sort={
                      sortConfig.key === column.key
                        ? sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                        : sortable ? 'none' : undefined
                    }
                  >
                    <div className="flex items-center">
                      {column.header || column.key}
                      {renderSortIndicator(column.key)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {processedData.map((row, rowIndex) => {
              const globalRowIndex = currentPage * pageSize + rowIndex;
              const isSelected = selectedRows.has(globalRowIndex);
              
              return (
                <tr
                  key={rowIndex}
                  role="row"
                  className={`${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  aria-selected={selectable ? isSelected : undefined}
                >
                  {selectable && (
                    <td
                      role="gridcell"
                      className={`px-6 py-4 whitespace-nowrap ${
                        focusedCell.row === rowIndex && focusedCell.col === 0 && isKeyboardNavigating
                          ? 'current-cell'
                          : ''
                      }`}
                      tabIndex={-1}
                    >
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={isSelected}
                        onChange={() => handleRowSelect(rowIndex, row)}
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                    </td>
                  )}
                  
                  {columns.map((column, colIndex) => {
                    const cellIndex = colIndex + (selectable ? 1 : 0);
                    const isFocused = focusedCell.row === rowIndex && focusedCell.col === cellIndex && isKeyboardNavigating;
                    
                    return (
                      <td
                        key={column.key}
                        role="gridcell"
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                          isFocused ? 'current-cell' : ''
                        }`}
                        tabIndex={-1}
                      >
                        {renderCellContent(row[column.key], column)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex} to {endIndex} of {data.length} entries
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="btn-accessible px-3 py-1 text-sm bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-700">
              Page {currentPage + 1} of {totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="btn-accessible px-3 py-1 text-sm bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* Keyboard navigation help */}
      {isKeyboardNavigating && (
        <div className="sr-only" aria-live="polite">
          Use arrow keys to navigate. Enter or Space to select. Escape to exit navigation.
        </div>
      )}
    </div>
  );
});

AccessibleDataTable.displayName = 'AccessibleDataTable';

export default AccessibleDataTable; 