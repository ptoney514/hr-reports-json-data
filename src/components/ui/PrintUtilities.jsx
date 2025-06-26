import React from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import { formatDate, formatDateShort } from '../../utils/dateHelpers';

/**
 * Print Header Component
 * Displays company branding and report information in print view
 */
export const PrintHeader = ({ title = 'Dashboard Report', subtitle = '' }) => {
  return (
    <div className="print-header print-only">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="dashboard-title">{title}</h1>
          {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600">University System HR Analytics</p>
          <p className="text-xs text-gray-500">Generated: {formatDate(new Date())}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Print Footer Component
 * Displays confidentiality notice and page information
 */
export const PrintFooter = () => {
  return (
    <div className="print-footer print-only">
      <div className="flex justify-between items-center">
        <span>Confidential - University HR Data</span>
        <span>123 University Drive, Academic City | (555) 123-4567 | www.university.edu</span>
      </div>
    </div>
  );
};

/**
 * Print Filters Component
 * Displays applied filters in a print-friendly format
 */
export const PrintFilters = ({ customFilters = null }) => {
  const { state } = useDashboard();
  const filters = customFilters || state?.filters || {};
  
  // Filter out empty or default values
  const activeFilters = Object.entries(filters)
    .filter(([key, value]) => value && value !== 'all' && value !== '' && value !== null)
    .map(([key, value]) => ({
      name: formatFilterName(key),
      value: formatFilterValue(key, value)
    }));

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="print-filters print-only">
      <h3>Applied Filters</h3>
      <ul>
        {activeFilters.map((filter, index) => (
          <li key={index}>
            <strong>{filter.name}:</strong> {filter.value}
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Print Section Component
 * Wraps content sections with print-friendly styling and page breaks
 */
export const PrintSection = ({ 
  title, 
  children, 
  breakAfter = false, 
  className = '' 
}) => {
  return (
    <div className={`dashboard-section ${breakAfter ? 'break-after' : ''} ${className}`}>
      {title && <h2 className="section-header">{title}</h2>}
      {children}
    </div>
  );
};

/**
 * Print Page Break Component
 * Forces a page break in print view
 */
export const PrintPageBreak = () => {
  return <div className="page-break-before print-only" />;
};

/**
 * Print Summary Cards Container
 * Optimizes summary cards layout for print
 */
export const PrintSummaryCards = ({ children, className = '' }) => {
  return (
    <div className={`print-summary-container ${className}`}>
      {React.Children.map(children, (child, index) => (
        <div key={index} className="summary-card print-two-column">
          {child}
        </div>
      ))}
      <div className="print-clear" />
    </div>
  );
};

/**
 * Print Chart Container
 * Optimizes chart display for print with proper spacing and titles
 */
export const PrintChartContainer = ({ 
  title, 
  children, 
  description = '', 
  className = '' 
}) => {
  return (
    <div className={`chart-container page-break-inside-avoid ${className}`}>
      {title && <h3 className="chart-title">{title}</h3>}
      {description && (
        <p className="text-sm text-gray-600 mb-2 print-only">{description}</p>
      )}
      <div className="chart-content">
        {children}
      </div>
    </div>
  );
};

/**
 * Print Data Table Component
 * Formats data tables for optimal print display
 */
export const PrintDataTable = ({ 
  data, 
  columns, 
  title = '', 
  maxRows = 20,
  className = '' 
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  const displayData = data.slice(0, maxRows);
  const hasMoreData = data.length > maxRows;

  return (
    <div className={`print-table-container page-break-inside-avoid ${className}`}>
      {title && <h3 className="section-header">{title}</h3>}
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header || column.key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  {formatTableValue(row[column.key], column.format)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {hasMoreData && (
        <p className="text-sm text-gray-500 mt-2 print-only">
          ... and {data.length - maxRows} more rows (showing top {maxRows})
        </p>
      )}
    </div>
  );
};

/**
 * Print Metadata Component
 * Displays report metadata in print view
 */
export const PrintMetadata = ({ 
  reportType = 'Dashboard Report',
  generatedBy = 'HR Analytics System',
  dataSource = 'University HR Database',
  className = '' 
}) => {
  return (
    <div className={`print-metadata print-only ${className}`}>
      <div className="bg-gray-50 p-3 rounded border">
        <h4 className="font-semibold text-sm mb-2">Report Information</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <strong>Report Type:</strong> {reportType}
          </div>
          <div>
            <strong>Generated:</strong> {formatDate(new Date())}
          </div>
          <div>
            <strong>Generated By:</strong> {generatedBy}
          </div>
          <div>
            <strong>Data Source:</strong> {dataSource}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Print Layout Wrapper
 * Main wrapper for print-optimized dashboard layout
 */
export const PrintLayout = ({ 
  title,
  subtitle = '',
  showFilters = true,
  showMetadata = true,
  children,
  className = ''
}) => {
  return (
    <div className={`print-layout ${className}`}>
      <PrintHeader title={title} subtitle={subtitle} />
      
      {showFilters && <PrintFilters />}
      
      <div className="print-content">
        {children}
      </div>
      
      {showMetadata && (
        <PrintMetadata 
          reportType={title}
          className="mt-4"
        />
      )}
      
      <PrintFooter />
    </div>
  );
};

// Helper functions
const formatFilterName = (key) => {
  const nameMap = {
    reportingPeriod: 'Reporting Period',
    fiscalYear: 'Fiscal Year',
    location: 'Location',
    division: 'Division',
    department: 'Department',
    employeeType: 'Employee Type',
    grade: 'Grade Level',
    dateRange: 'Date Range',
    status: 'Status',
    category: 'Category'
  };
  
  return nameMap[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
};

const formatFilterValue = (key, value) => {
  if (key === 'dateRange' && typeof value === 'object' && value.start && value.end) {
    return `${formatDateShort(value.start)} - ${formatDateShort(value.end)}`;
  }
  
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  
  return value.toString();
};

const formatTableValue = (value, format) => {
  if (value === null || value === undefined) return '';
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    case 'percentage':
      return `${(value * 100).toFixed(1)}%`;
    case 'number':
      return new Intl.NumberFormat('en-US').format(value);
    case 'date':
      return formatDateShort(value);
    default:
      return value.toString();
  }
};

/**
 * Print Button Component
 * Provides a simple print button with print-specific styling
 */
export const PrintButton = ({ 
  className = '',
  children = 'Print Dashboard',
  onBeforePrint = null,
  onAfterPrint = null
}) => {
  const handlePrint = () => {
    if (onBeforePrint) {
      onBeforePrint();
    }
    
    // Add print-specific body class
    document.body.classList.add('printing');
    
    // Small delay to ensure styles are applied
    setTimeout(() => {
      window.print();
      
      // Clean up after print
      setTimeout(() => {
        document.body.classList.remove('printing');
        if (onAfterPrint) {
          onAfterPrint();
        }
      }, 100);
    }, 100);
  };

  return (
    <button
      onClick={handlePrint}
      className={`no-print inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
    >
      {children}
    </button>
  );
};

export default {
  PrintHeader,
  PrintFooter,
  PrintFilters,
  PrintSection,
  PrintPageBreak,
  PrintSummaryCards,
  PrintChartContainer,
  PrintDataTable,
  PrintMetadata,
  PrintLayout,
  PrintButton
}; 