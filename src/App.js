import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Navigation from './components/ui/Navigation';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { DataSourceProvider } from './contexts/DataSourceContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { setupGlobalErrorHandling } from './utils/errorHandler';
import { DashboardSkeleton } from './components/ui/LoadingSkeleton';
// Lazy load dashboard components for better performance
const DashboardIndex = lazy(() => import('./components/dashboards/DashboardIndex'));
const TurnoverDashboard = lazy(() => import('./components/dashboards/TurnoverDashboard'));
const TestSuite = lazy(() => import('./components/testing/TestSuite'));
const ErrorTestComponent = lazy(() => import('./components/testing/ErrorTestComponent'));
const ExportTestComponent = lazy(() => import('./components/testing/ExportTestComponent'));
const PrintTestComponent = lazy(() => import('./components/testing/PrintTestComponent'));
const AccessibilityTestComponent = lazy(() => import('./components/testing/AccessibilityTestComponent'));
const DatabaseTestComponent = lazy(() => import('./components/testing/DatabaseTestComponent'));
const WorkforceDataTester = lazy(() => import('./components/testing/WorkforceDataTester'));
const JsonDataTester = lazy(() => import('./components/testing/JsonDataTester'));
const HooksTestComponent = lazy(() => import('./components/testing/HooksTestComponentWrapper'));
const RecruitingDashboard = lazy(() => import('./components/dashboards/RecruitingDashboard'));
const ExitSurveyDashboard = lazy(() => import('./components/dashboards/ExitSurveyDashboard'));
const WorkforceDashboard = lazy(() => import('./components/dashboards/WorkforceDashboard'));
const AdminDashboard = lazy(() => import('./components/dashboards/AdminDashboard'));

// Create QueryClient with optimized configuration for PocketBase
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5-minute stale time to reduce unnecessary refetches
      staleTime: 5 * 60 * 1000,
      // 10-minute garbage collection time
      gcTime: 10 * 60 * 1000,
      // Retry failed requests twice with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Better UX - don't refetch on window focus
      refetchOnWindowFocus: false,
      // Only refetch on reconnect if data is stale
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      retryDelay: 1000,
    },
  },
});

function App() {
  // Initialize global error handling
  useEffect(() => {
    setupGlobalErrorHandling();
  }, []);

  const handleAppError = (error, errorInfo) => {
    console.error('Application-level error:', error, errorInfo);
    
    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // sendErrorToService(error, errorInfo);
    }
  };

  const handleAppRetry = () => {
    // Clear any cached data and reload the application
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    window.location.reload();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <DataSourceProvider>
        <DashboardProvider>
          <ErrorBoundary
            onError={handleAppError}
            onRetry={handleAppRetry}
            showHomeButton={false}
          >
          <Router>
            <div className="App flex h-screen bg-gray-50">
              {/* Sidebar Navigation Component */}
              <Navigation />
            
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
              {/* Main Content with Suspense for lazy loading */}
              <Suspense fallback={
                <div className="p-4">
                  <DashboardSkeleton 
                    showHeader={true}
                    showSummaryCards={true}
                    showCharts={true}
                    summaryCardCount={4}
                    chartCount={4}
                  />
                </div>
              }>
              <Routes>
              {/* Dashboard Routes */}
              <Route path="/dashboards" element={<DashboardIndex />} />
              <Route path="/dashboards/workforce" element={<WorkforceDashboard />} />
              <Route path="/dashboards/turnover" element={<TurnoverDashboard />} />
              <Route path="/dashboards/recruiting" element={<RecruitingDashboard />} />
              <Route path="/dashboards/exit-survey" element={<ExitSurveyDashboard />} />
              
              {/* Test Suite Routes */}
              <Route path="/test" element={<TestSuite />} />
              <Route path="/test/errors" element={<ErrorTestComponent />} />
              <Route path="/test/export" element={<ExportTestComponent />} />
              <Route path="/test/print" element={<PrintTestComponent />} />
              <Route path="/test/accessibility" element={<AccessibilityTestComponent />} />
              <Route path="/test/database" element={<DatabaseTestComponent />} />
              <Route path="/test/workforce-data" element={<WorkforceDataTester />} />
              <Route path="/test/json-data" element={<JsonDataTester />} />
              <Route path="/test/json-hooks" element={<HooksTestComponent />} />
              
              
              {/* Admin Dashboard Route */}
              <Route path="/admin" element={<AdminDashboard />} />
              
              {/* Default route - redirect to dashboards index */}
              <Route path="/" element={<Navigate to="/dashboards" replace />} />
              
              {/* Catch-all route - redirect to dashboards */}
              <Route path="*" element={<Navigate to="/dashboards" replace />} />
              </Routes>
              </Suspense>
            </main>
          </div>
          </Router>
          
          {/* React Query DevTools - Disabled to remove TanStack logo */}
          {/* {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )} */}
        </ErrorBoundary>
      </DashboardProvider>
    </DataSourceProvider>
    </QueryClientProvider>
  );
}

export default App;
