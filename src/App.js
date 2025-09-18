import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navigation from './components/ui/Navigation';
import ErrorBoundary from './components/ui/ErrorBoundary';
// Removed DataSourceProvider - using static data now
import { DashboardProvider } from './contexts/DashboardContext';
import { setupGlobalErrorHandling } from './utils/errorHandler';
import { DashboardSkeleton } from './components/ui/LoadingSkeleton';
// Lazy load dashboard components for better performance
const DashboardIndex = lazy(() => import('./components/dashboards/DashboardIndex'));
const TurnoverDashboard = lazy(() => import('./components/dashboards/TurnoverDashboard'));
// Testing components removed - using static data approach
const RecruitingDashboard = lazy(() => import('./components/dashboards/RecruitingDashboard'));
const ExitSurveyFY25Dashboard = lazy(() => import('./components/dashboards/ExitSurveyFY25Dashboard'));
const WorkforceDashboard = lazy(() => import('./components/dashboards/WorkforceDashboard'));
const DataSourceAdmin = lazy(() => import('./components/dashboards/DataSourceAdmin'));
const AccomplishmentsOverview = lazy(() => import('./components/dashboards/AccomplishmentsOverview'));
const DataValidation = lazy(() => import('./components/dashboards/DataValidation'));
// WorkforceAudit temporarily disabled - papaparse dependency issue
// const WorkforceAudit = lazy(() => import('./components/dashboards/WorkforceAudit'));
// AdminDashboard removed - using static data now

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
              <Route path="/dashboards/exit-survey-fy25" element={<ExitSurveyFY25Dashboard />} />
              <Route path="/dashboards/accomplishments" element={<AccomplishmentsOverview />} />
              {/* Workforce Audit temporarily disabled - papaparse dependency issue */}
              {/* <Route path="/dashboards/workforce-audit" element={<WorkforceAudit />} /> */}
              
              {/* Testing routes removed - using static data approach */}
              
              
              {/* Admin Dashboard Routes */}
              <Route path="/admin/data-validation" element={<DataValidation />} />
              <Route path="/admin/data-sources" element={<DataSourceAdmin />} />
              {/* AdminDashboard route removed - using static data */}
              
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
    </QueryClientProvider>
  );
}

export default App;
