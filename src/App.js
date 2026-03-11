import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SlideHeader from './components/ui/SlideHeader';
import ErrorBoundary from './components/ui/ErrorBoundary';
// Removed DataSourceProvider - using static data now
import { DashboardProvider } from './contexts/DashboardContext';
import { QuarterProvider } from './contexts/QuarterContext';
import { setupGlobalErrorHandling } from './utils/errorHandler';
import { DashboardSkeleton } from './components/ui/LoadingSkeleton';
// Lazy load dashboard components for better performance
const MarketingSlides = lazy(() => import('./components/dashboards/MarketingSlides'));
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
const ExitSurveyInsightsSlide = lazy(() => import('./components/dashboards/ExitSurveyInsightsSlide'));
const ExitSurveyAnnualSummary = lazy(() => import('./components/dashboards/ExitSurveyAnnualSummary'));
// Quarterly Turnover Reports
const TurnoverQ1Dashboard = lazy(() => import('./components/dashboards/TurnoverQ1FY26Dashboard'));
const TurnoverTrendsDashboard = lazy(() => import('./components/dashboards/TurnoverTrendsDashboard'));
const QuarterlyTurnoverRatesDashboard = lazy(() => import('./components/dashboards/QuarterlyTurnoverRatesDashboard'));
const TurnoverBySchoolSlide = lazy(() => import('./components/dashboards/TurnoverBySchoolSlide'));
const TurnoverByServiceSlide = lazy(() => import('./components/dashboards/TurnoverByServiceSlide'));
const TurnoverByAgeSlide = lazy(() => import('./components/dashboards/TurnoverByAgeSlide'));
const EarlyTurnoverSlide = lazy(() => import('./components/dashboards/EarlyTurnoverSlide'));
// Quarterly Workforce Reports
const WorkforceQ1Dashboard = lazy(() => import('./components/dashboards/WorkforceQ1FY26Dashboard'));
const TempWorkersQ1Dashboard = lazy(() => import('./components/dashboards/TempWorkersQ1FY26Dashboard'));
const HeadcountTrendsSlide = lazy(() => import('./components/dashboards/HeadcountTrendsSlide'));
const DemographicsQ1Dashboard = lazy(() => import('./components/dashboards/DemographicsQ1FY26Dashboard'));
const EthnicityDistributionQ1 = lazy(() => import('./components/dashboards/EthnicityDistributionQ1'));
const AgeGenderQ1 = lazy(() => import('./components/dashboards/AgeGenderQ1'));
// Quarterly Recruiting Reports
const RecruitingQ1Dashboard = lazy(() => import('./components/dashboards/RecruitingQ1FY26Dashboard'));
const RecruitingNBEQ1Dashboard = lazy(() => import('./components/dashboards/RecruitingNBEQ1FY26Dashboard'));
const RecruitingDetailsSlide = lazy(() => import('./components/dashboards/RecruitingDetailsSlide'));
// Quarterly Promotions Reports
const PromotionsQ1Dashboard = lazy(() => import('./components/dashboards/PromotionsQ1FY26Dashboard'));
const PromotionsBySchoolSlide = lazy(() => import('./components/dashboards/PromotionsBySchoolSlide'));
const PromotionReasonsReference = lazy(() => import('./components/dashboards/PromotionReasonsReference'));
const JobChangesTestingDashboard = lazy(() => import('./components/dashboards/JobChangesTestingDashboard'));
// Validation Test Pages
const WorkforceTestDashboard = lazy(() => import('./components/dashboards/WorkforceTestDashboard'));
const TurnoverTestDashboard = lazy(() => import('./components/dashboards/TurnoverTestDashboard'));
const RecruitingTestDashboard = lazy(() => import('./components/dashboards/RecruitingTestDashboard'));
// Report Generator
const ReportGenerator = lazy(() => import('./components/reports/ReportGenerator'));
// Print Layout (Report Builder)
const PrintLayout = lazy(() => import('./components/print/PrintLayout'));
// Executive Dashboard
const ExecutiveDashboard = lazy(() => import('./components/dashboards/ExecutiveDashboard'));
const ExecutiveDashboardNew = lazy(() => import('./components/dashboards/ExecutiveDashboardNew'));
// Section Dividers
const SectionDivider = lazy(() => import('./components/ui/SectionDivider'));
// Sitemap
const SitemapDashboard = lazy(() => import('./components/dashboards/SitemapDashboard'));
// Archive/Legacy Components
const ExitSurveyDashboardOld = lazy(() => import('./components/dashboards/ExitSurveyDashboard_Old'));
const ExitSurveyDashboardPrevious = lazy(() => import('./components/dashboards/ExitSurveyDashboard_Previous'));
const ExitSurveyQ1DashboardOld = lazy(() => import('./components/dashboards/ExitSurveyQ1Dashboard_old'));
const ExitSurveyQ4DashboardOld = lazy(() => import('./components/dashboards/ExitSurveyQ4Dashboard_old'));
const DataImportDashboard = lazy(() => import('./components/dashboards/DataImportDashboard'));
const DataHealthDashboard = lazy(() => import('./components/dashboards/DataHealthDashboard'));
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

  // Standard layout with top-bar slide navigation
  return (
    <div className="App min-h-screen bg-gray-100">
      <SlideHeader />
      <main className="overflow-y-auto">
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
            <QuarterProvider>
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
              <Route path="/dashboards/marketing-slides" element={<MarketingSlides />} />
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
              <Route path="/dashboards/exit-survey-insights" element={<ExitSurveyInsightsSlide />} />
              <Route path="/dashboards/exit-survey-annual" element={<ExitSurveyAnnualSummary />} />

              {/* Quarterly Turnover Reports */}
              <Route path="/dashboards/turnover-q1" element={<TurnoverQ1Dashboard />} />
              <Route path="/dashboards/turnover-trends" element={<TurnoverTrendsDashboard />} />
              <Route path="/dashboards/quarterly-turnover-rates" element={<QuarterlyTurnoverRatesDashboard />} />
              <Route path="/dashboards/turnover-by-school" element={<TurnoverBySchoolSlide />} />
              <Route path="/dashboards/turnover-by-service" element={<TurnoverByServiceSlide />} />
              <Route path="/dashboards/turnover-by-age" element={<TurnoverByAgeSlide />} />
              <Route path="/dashboards/early-turnover" element={<EarlyTurnoverSlide />} />

              {/* Quarterly Workforce Reports */}
              <Route path="/dashboards/workforce-q1" element={<WorkforceQ1Dashboard />} />
              <Route path="/dashboards/temp-workers-q1" element={<TempWorkersQ1Dashboard />} />
              <Route path="/dashboards/headcount-trends" element={<HeadcountTrendsSlide />} />
              <Route path="/dashboards/demographics-q1" element={<DemographicsQ1Dashboard />} />
              <Route path="/dashboards/ethnicity-q1" element={<EthnicityDistributionQ1 />} />
              <Route path="/dashboards/age-gender-q1" element={<AgeGenderQ1 />} />

              {/* Quarterly Recruiting Reports */}
              <Route path="/dashboards/recruiting-q1" element={<RecruitingQ1Dashboard />} />
              <Route path="/dashboards/recruiting-nbe-q1" element={<RecruitingNBEQ1Dashboard />} />
              <Route path="/dashboards/recruiting-details" element={<RecruitingDetailsSlide />} />

              {/* Quarterly Promotions Reports */}
              <Route path="/dashboards/promotions-q1" element={<PromotionsQ1Dashboard />} />
              <Route path="/dashboards/promotions-by-school" element={<PromotionsBySchoolSlide />} />
              <Route path="/dashboards/promotion-reasons" element={<PromotionReasonsReference />} />
              <Route path="/dashboards/job-changes-testing" element={<JobChangesTestingDashboard />} />

              {/* Validation Test Pages */}
              <Route path="/dashboards/workforce-test" element={<WorkforceTestDashboard />} />
              <Route path="/dashboards/turnover-test" element={<TurnoverTestDashboard />} />
              <Route path="/dashboards/recruiting-test" element={<RecruitingTestDashboard />} />

              {/* Testing routes removed - using static data approach */}
              
              
              {/* Admin Dashboard Routes */}
              <Route path="/admin/data-validation" element={<DataValidation />} />
              <Route path="/admin/data-sources" element={<DataSourceAdmin />} />
              <Route path="/admin/report-generator" element={<ReportGenerator />} />
              {/* AdminDashboard route removed - using static data */}

              {/* Section Divider Pages */}
              <Route path="/dashboards/section/:section" element={<SectionDivider />} />

              {/* Executive Dashboard */}
              <Route path="/dashboards/executive-new" element={<ExecutiveDashboardNew />} />

              {/* Sitemap Route */}
              <Route path="/sitemap" element={<SitemapDashboard />} />

              {/* Archive/Legacy Routes */}
              <Route path="/archive/exit-survey-old" element={<ExitSurveyDashboardOld />} />
              <Route path="/archive/exit-survey-previous" element={<ExitSurveyDashboardPrevious />} />
              <Route path="/archive/exit-survey-q1-old" element={<ExitSurveyQ1DashboardOld />} />
              <Route path="/archive/exit-survey-q4-old" element={<ExitSurveyQ4DashboardOld />} />
              <Route path="/archive/data-import" element={<DataImportDashboard />} />
              <Route path="/archive/data-health" element={<DataHealthDashboard />} />
              <Route path="/archive/executive-old" element={<ExecutiveDashboard />} />
              
              {/* Default route - redirect to executive dashboard */}
              <Route path="/" element={<Navigate to="/dashboards/executive-new" replace />} />
              <Route path="/dashboards" element={<Navigate to="/dashboards/executive-new" replace />} />

              {/* Catch-all route - redirect to sitemap */}
              <Route path="*" element={<Navigate to="/sitemap" replace />} />
              </Routes>
              </Suspense>
            </AppLayout>
            </QuarterProvider>
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
