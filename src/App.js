import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
const FY26Priorities = lazy(() => import('./components/dashboards/FY26Priorities'));
const LearningDevelopmentDashboard = lazy(() => import('./components/dashboards/LearningDevelopmentDashboard'));
const TotalRewardsDashboard = lazy(() => import('./components/dashboards/TotalRewardsDashboard'));
const BenefitsWellbeingDashboard = lazy(() => import('./components/dashboards/BenefitsWellbeingDashboard'));
// Quarterly Exit Survey Reports
const ExitSurveyQ1Dashboard = lazy(() => import('./components/dashboards/ExitSurveyQ1FY26Dashboard'));
const ExitSurveyQ2Dashboard = lazy(() => import('./components/dashboards/ExitSurveyQ2Dashboard'));
const ExitSurveyQ3Dashboard = lazy(() => import('./components/dashboards/ExitSurveyQ3Dashboard'));
const ExitSurveyQ4Dashboard = lazy(() => import('./components/dashboards/ExitSurveyQ4Dashboard'));
const ExitSurveyOverview = lazy(() => import('./components/dashboards/ExitSurveyOverview'));
// Quarterly Turnover Reports
const TurnoverQ1Dashboard = lazy(() => import('./components/dashboards/TurnoverQ1FY26Dashboard'));
const TurnoverTrendsDashboard = lazy(() => import('./components/dashboards/TurnoverTrendsDashboard'));
const QuarterlyTurnoverRatesDashboard = lazy(() => import('./components/dashboards/QuarterlyTurnoverRatesDashboard'));
// Quarterly Workforce Reports
const WorkforceQ1Dashboard = lazy(() => import('./components/dashboards/WorkforceQ1FY26Dashboard'));
const DemographicsQ1Dashboard = lazy(() => import('./components/dashboards/DemographicsQ1FY26Dashboard'));
// Quarterly Recruiting Reports
const RecruitingQ1Dashboard = lazy(() => import('./components/dashboards/RecruitingQ1FY26Dashboard'));
const RecruitingNBEQ1Dashboard = lazy(() => import('./components/dashboards/RecruitingNBEQ1FY26Dashboard'));
// Quarterly Promotions Reports
const PromotionsQ1Dashboard = lazy(() => import('./components/dashboards/PromotionsQ1FY26Dashboard'));
const PromotionReasonsReference = lazy(() => import('./components/dashboards/PromotionReasonsReference'));
const JobChangesTestingDashboard = lazy(() => import('./components/dashboards/JobChangesTestingDashboard'));
// Validation Test Pages
const WorkforceTestDashboard = lazy(() => import('./components/dashboards/WorkforceTestDashboard'));
const TurnoverTestDashboard = lazy(() => import('./components/dashboards/TurnoverTestDashboard'));
// Report Generator
const ReportGenerator = lazy(() => import('./components/reports/ReportGenerator'));
// Print Layout (Report Builder)
const PrintLayout = lazy(() => import('./components/print/PrintLayout'));
// WorkforceAudit temporarily disabled - papaparse dependency issue
// const WorkforceAudit = lazy(() => import('./components/dashboards/WorkforceAudit'));
// AdminDashboard removed - using static data now

// Layout component that conditionally shows Navigation
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isPrintRoute = location.pathname.startsWith('/print');

  if (isPrintRoute) {
    // Print layout has its own navigation, render full width
    return (
      <div className="App h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  // Standard layout with sidebar navigation
  return (
    <div className="App flex h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

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
            <AppLayout>
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
              {/* Print Layout Route - Full page, own navigation */}
              <Route path="/print/*" element={<PrintLayout />} />
              {/* Dashboard Routes */}
              <Route path="/dashboards" element={<DashboardIndex />} />
              <Route path="/dashboards/workforce" element={<WorkforceDashboard />} />
              <Route path="/dashboards/turnover" element={<TurnoverDashboard />} />
              <Route path="/dashboards/recruiting" element={<RecruitingDashboard />} />
              <Route path="/dashboards/exit-survey-fy25" element={<ExitSurveyFY25Dashboard />} />
              <Route path="/dashboards/accomplishments" element={<AccomplishmentsOverview />} />
              <Route path="/dashboards/fy26-priorities" element={<FY26Priorities />} />
              <Route path="/dashboards/learning-development" element={<LearningDevelopmentDashboard />} />
              <Route path="/dashboards/total-rewards" element={<TotalRewardsDashboard />} />
              <Route path="/dashboards/benefits-wellbeing" element={<BenefitsWellbeingDashboard />} />
              {/* Workforce Audit temporarily disabled - papaparse dependency issue */}
              {/* <Route path="/dashboards/workforce-audit" element={<WorkforceAudit />} /> */}

              {/* Quarterly Exit Survey Reports */}
              <Route path="/dashboards/exit-survey-overview" element={<ExitSurveyOverview />} />
              <Route path="/dashboards/exit-survey-q1" element={<ExitSurveyQ1Dashboard />} />
              <Route path="/dashboards/exit-survey-q2" element={<ExitSurveyQ2Dashboard />} />
              <Route path="/dashboards/exit-survey-q3" element={<ExitSurveyQ3Dashboard />} />
              <Route path="/dashboards/exit-survey-q4" element={<ExitSurveyQ4Dashboard />} />

              {/* Quarterly Turnover Reports */}
              <Route path="/dashboards/turnover-q1" element={<TurnoverQ1Dashboard />} />
              <Route path="/dashboards/turnover-trends" element={<TurnoverTrendsDashboard />} />
              <Route path="/dashboards/quarterly-turnover-rates" element={<QuarterlyTurnoverRatesDashboard />} />

              {/* Quarterly Workforce Reports */}
              <Route path="/dashboards/workforce-q1" element={<WorkforceQ1Dashboard />} />
              <Route path="/dashboards/demographics-q1" element={<DemographicsQ1Dashboard />} />

              {/* Quarterly Recruiting Reports */}
              <Route path="/dashboards/recruiting-q1" element={<RecruitingQ1Dashboard />} />
              <Route path="/dashboards/recruiting-nbe-q1" element={<RecruitingNBEQ1Dashboard />} />

              {/* Quarterly Promotions Reports */}
              <Route path="/dashboards/promotions-q1" element={<PromotionsQ1Dashboard />} />
              <Route path="/dashboards/promotion-reasons" element={<PromotionReasonsReference />} />
              <Route path="/dashboards/job-changes-testing" element={<JobChangesTestingDashboard />} />

              {/* Validation Test Pages */}
              <Route path="/dashboards/workforce-test" element={<WorkforceTestDashboard />} />
              <Route path="/dashboards/turnover-test" element={<TurnoverTestDashboard />} />

              {/* Testing routes removed - using static data approach */}
              
              
              {/* Admin Dashboard Routes */}
              <Route path="/admin/data-validation" element={<DataValidation />} />
              <Route path="/admin/data-sources" element={<DataSourceAdmin />} />
              <Route path="/admin/report-generator" element={<ReportGenerator />} />
              {/* AdminDashboard route removed - using static data */}
              
              {/* Default route - redirect to dashboards index */}
              <Route path="/" element={<Navigate to="/dashboards" replace />} />
              
              {/* Catch-all route - redirect to dashboards */}
              <Route path="*" element={<Navigate to="/dashboards" replace />} />
              </Routes>
              </Suspense>
            </AppLayout>
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
