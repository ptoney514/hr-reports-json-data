import React, { useEffect, useRef } from 'react';
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  AlertCircle
} from 'lucide-react';
import ErrorBoundary from '../ui/ErrorBoundary';
import NetworkErrorBoundary from '../ui/NetworkErrorBoundary';
import DashboardHeader from '../ui/DashboardHeader';
import DashboardSkeleton from '../ui/LoadingSkeleton';
import AccessibilityToggle from '../ui/AccessibilityToggle';
import { FocusManager, SkipLinkManager, announceToScreenReader } from '../../utils/accessibilityUtils';

// Inner component that uses the dashboard context
const DashboardLayoutInner = ({ 
  title,
  subtitle,
  children,
  showFilters = true,
  showDateFilter = true,
  showExport = true,
  availableFilters = {},
  onExport,
  className = "",
  gridCols = "grid-cols-1 lg:grid-cols-2",
  maxWidth = "max-w-7xl"
}) => {
  const mainContentRef = useRef(null);
  const skipLinksRef = useRef(null);
  // Use default values instead of context
  const state = {
    loading: { workforce: false, turnover: false, general: false },
    error: { workforce: null, turnover: null, general: null },
    reportingPeriod: 'Q2-2025',
    locationFilter: 'All',
    divisionFilter: 'All',
    departmentFilter: 'All',
    employeeTypeFilter: 'All',
    dateRange: {
      type: 'quarter',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-03-31'),
      label: 'Q2 2025'
    }
  };

  const actions = {
    updateFilter: () => {},
    refreshData: () => {},
    resetFilters: () => {},
    setLoading: () => {},
    setError: () => {},
    clearError: () => {}
  };

  // Initialize skip links and accessibility features
  useEffect(() => {
    // Create and insert skip links
    const skipLinks = SkipLinkManager.createSkipLinks([
      { href: '#dashboard-header', label: 'Skip to dashboard header' },
      { href: '#dashboard-content', label: 'Skip to dashboard content' }
    ]);

    skipLinksRef.current = skipLinks;
    document.body.insertBefore(skipLinks, document.body.firstChild);

    // Announce page load to screen readers
    announceToScreenReader(`${title} dashboard loaded`);

    // Cleanup function
    return () => {
      if (skipLinksRef.current && document.body.contains(skipLinksRef.current)) {
        document.body.removeChild(skipLinksRef.current);
      }
    };
  }, [title]);

  // Extract values from state
  const { error, loading, ...filters } = state;
  const isLoading = false;
  const hasError = Object.values(error || {}).some(e => e !== null);
  const lastUpdated = null;
  const hasActiveFilters = false;

  // Handle filter changes with screen reader announcement
  const handleFilterChange = (filterType, value) => {
    actions.updateFilter(filterType, value);
    announceToScreenReader(`${filterType} filter changed to ${value}`);
  };

  // Handle export
  const handleExport = (type) => {
    if (onExport) {
      onExport(type, { filters, title });
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    actions.refreshData();
  };

  // Helper function for print filter names
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

  // Error boundary component
  const ErrorBoundary = ({ error, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        Something went wrong
      </h3>
      <p className="text-red-600 mb-4">
        {error?.message || 'An unexpected error occurred while loading the dashboard.'}
      </p>
      <div className="flex justify-center gap-3">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    </div>
  );

  // Network status indicator
  const NetworkStatus = () => {
    const [isOnline, setIsOnline] = React.useState(navigator.onLine);

    React.useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }, []);

    if (isOnline) return null;

    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex items-center">
          <WifiOff className="text-yellow-400 mr-2" size={20} />
          <p className="text-yellow-800">
            You're currently offline. Some features may be limited.
          </p>
        </div>
      </div>
    );
  };

  // Filter summary component
  const FilterSummary = () => {
    if (!hasActiveFilters) return null;

    const activeFilters = Object.entries(filters)
      .filter(([key, value]) => value && value !== 'all' && key !== 'reportingPeriod')
      .map(([key, value]) => ({ key, value }));

    if (activeFilters.length === 0) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-800">Active Filters:</span>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map(({ key, value }) => (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {key}: {value}
                  <button
                    onClick={() => handleFilterChange(key, 'all')}
                    className="ml-1 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => actions.resetFilters()}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear All
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-gray-50 min-h-screen print:bg-white print:p-2 ${className}`}>
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      {/* Accessibility toggle */}
      <AccessibilityToggle className="print:hidden" />
      
      {/* ARIA live regions for screen reader announcements */}
      <div id="status-live-region" className="sr-only" aria-live="polite" aria-atomic="true"></div>
      <div id="alert-live-region" className="sr-only" aria-live="assertive" aria-atomic="true"></div>
      
      {/* Print-only header */}
      <div className="hidden print:block mb-4 dashboard-header">
        <div className="text-center">
          <h1 className="dashboard-title">{title}</h1>
          {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
        </div>
      </div>

      {/* Print-only filters */}
      <div className="hidden print:block print-filters">
        <h3>Applied Filters</h3>
        <ul>
          {Object.entries(filters)
            .filter(([key, value]) => value && value !== 'all' && value !== '')
            .map(([key, value]) => (
              <li key={key}>
                <strong>{formatFilterName(key)}:</strong> {
                  typeof value === 'object'
                    ? (value.label || JSON.stringify(value))
                    : value
                }
              </li>
            ))}
          {(!filters || Object.keys(filters).length === 0) && (
            <li>No filters applied</li>
          )}
        </ul>
      </div>

      {/* Main container */}
      <main 
        id="main-content" 
        ref={mainContentRef}
        className={`mx-auto px-4 py-4 print:p-0 ${maxWidth}`} 
        role="main"
        tabIndex="-1"
        aria-labelledby="dashboard-title"
      >
        {/* Network status */}
        <NetworkStatus />

        {/* Dashboard header */}
        <section id="dashboard-header" aria-labelledby="dashboard-title">
          <DashboardHeader
            title={title}
            subtitle={subtitle}
            filters={filters}
            onFilterChange={handleFilterChange}
            onExport={handleExport}
            showFilters={showFilters}
            showDateFilter={showDateFilter}
            showExport={showExport}
            availableFilters={availableFilters}
          />
        </section>

        {/* Filter summary */}
        <FilterSummary />

        {/* Error state */}
        {hasError && (
          <ErrorBoundary 
            error={error} 
            onRetry={handleRefresh}
          />
        )}

        {/* Loading state with skeleton */}
        {isLoading && !hasError && (
          <DashboardSkeleton
            showHeader={false} // Header is already shown above
            showSummaryCards={true}
            showCharts={true}
            summaryCardCount={4}
            chartCount={4}
          />
        )}

        {/* Dashboard content */}
        {!isLoading && !hasError && (
          <section 
            id="dashboard-content" 
            aria-label="Dashboard content and visualizations"
            role="region"
          >
            <div className={`grid gap-4 print:gap-2 print:block ${gridCols}`}>
              {React.Children.map(children, (child, index) => (
                <div 
                  key={index} 
                  className="dashboard-section page-break-inside-avoid"
                  role="group"
                  aria-label={`Dashboard section ${index + 1}`}
                >
                  {child}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Data freshness indicator */}
        {lastUpdated && !isLoading && (
          <div className="mt-8 text-center text-sm text-gray-500 print:hidden">
            <div className="flex items-center justify-center gap-2">
              <Wifi size={16} />
              <span>
                Data last updated: {new Date(lastUpdated).toLocaleString()}
              </span>
              <button
                onClick={handleRefresh}
                className="text-blue-600 hover:text-blue-800 ml-2"
                disabled={isLoading}
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Print styles */}
      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          .print\\:no-break { break-inside: avoid; }
          .print\\:break-page { break-before: page; }
          .print\\:h-48 { height: 12rem !important; }
          .print\\:h-64 { height: 16rem !important; }
          .print\\:text-black { color: black !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:border-gray { border-color: #6b7280 !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:p-1 { padding: 0.25rem !important; }
          .print\\:p-2 { padding: 0.5rem !important; }
          .print\\:mb-2 { margin-bottom: 0.5rem !important; }
          .print\\:mb-3 { margin-bottom: 0.75rem !important; }
          .print\\:gap-2 { gap: 0.5rem !important; }
          .print\\:text-xs { font-size: 0.75rem !important; }
          .print\\:text-base { font-size: 1rem !important; }
          .print\\:text-xl { font-size: 1.25rem !important; }
        }
      `}</style>
    </div>
  );
};

// Main component with context provider and error boundaries
const DashboardLayout = (props) => {
  const handleRetry = () => {
    window.location.reload();
  };

  const handleNetworkRetry = async () => {
    // Force refresh data
    window.location.reload();
  };

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Dashboard Error:', error, errorInfo);
      }}
      onRetry={handleRetry}
    >
      <NetworkErrorBoundary
        onRetry={handleNetworkRetry}
        maxRetries={3}
        retryDelay={2000}
      >
        <DashboardLayoutInner {...props} />
      </NetworkErrorBoundary>
    </ErrorBoundary>
  );
};

export default DashboardLayout; 