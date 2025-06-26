import React from 'react';
import { DashboardProvider, useDashboard } from '../../contexts/DashboardContext';
import DashboardHeader from '../ui/DashboardHeader';
import { AlertCircle, Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import ErrorBoundary from '../ui/ErrorBoundary';
import NetworkErrorBoundary from '../ui/NetworkErrorBoundary';
import DataErrorBoundary from '../ui/DataErrorBoundary';
import { DashboardSkeleton } from '../ui/LoadingSkeleton';

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
  const { 
    state, 
    actions,
    computed 
  } = useDashboard();

  const {
    filters,
    loading,
    error,
    lastUpdated
  } = state;

  const {
    isLoading,
    hasError,
    hasActiveFilters
  } = computed;

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    actions.updateFilter(filterType, value);
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

  // Loading component
  const LoadingState = ({ message = "Loading dashboard..." }) => (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 text-blue-500 animate-spin" size={48} />
        <p className="text-gray-600">{message}</p>
        {lastUpdated && (
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}
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
      {/* Print-only header */}
      <div className="hidden print:block mb-4">
        <h1 className="text-xl font-bold text-black">{title}</h1>
        <p className="text-sm text-black">
          Generated: {new Date().toLocaleDateString()} | 
          Period: {filters.reportingPeriod || filters.fiscalYear || 'All Time'}
        </p>
      </div>

      {/* Main container */}
      <div className={`mx-auto px-4 py-4 print:p-0 ${maxWidth}`}>
        {/* Network status */}
        <NetworkStatus />

        {/* Dashboard header */}
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
          <div className={`grid gap-4 print:gap-2 ${gridCols}`}>
            {children}
          </div>
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
      </div>

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
        <DataErrorBoundary
          title="Dashboard Data Error"
          onRetry={handleRetry}
          onReloadData={handleRetry}
          expectedSchema={{
            required: ['data'],
            properties: {
              data: { type: 'object' }
            }
          }}
        >
          <DashboardProvider>
            <DashboardLayoutInner {...props} />
          </DashboardProvider>
        </DataErrorBoundary>
      </NetworkErrorBoundary>
    </ErrorBoundary>
  );
};

export default DashboardLayout; 