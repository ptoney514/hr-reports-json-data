import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/ui/Navigation';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { DataSourceProvider } from './contexts/DataSourceContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { setupGlobalErrorHandling } from './utils/errorHandler';
import { DashboardSkeleton } from './components/ui/LoadingSkeleton';
import './components/dashboards/I9Dashboard.css';

// Lazy load dashboard components for better performance
const DashboardIndex = lazy(() => import('./components/dashboards/DashboardIndex'));
const TurnoverDashboard = lazy(() => import('./components/dashboards/TurnoverDashboard'));
const I9HealthDashboard = lazy(() => import('./components/dashboards/I9HealthDashboard.tsx'));
const TestSuite = lazy(() => import('./components/testing/TestSuite'));
const ErrorTestComponent = lazy(() => import('./components/testing/ErrorTestComponent'));
const ExportTestComponent = lazy(() => import('./components/testing/ExportTestComponent'));
const PrintTestComponent = lazy(() => import('./components/testing/PrintTestComponent'));
const AccessibilityTestComponent = lazy(() => import('./components/testing/AccessibilityTestComponent'));
const DatabaseTestComponent = lazy(() => import('./components/testing/DatabaseTestComponent'));
const FirebaseTestComponent = lazy(() => import('./components/testing/FirebaseTestComponent'));
const WorkforceDataTester = lazy(() => import('./components/testing/WorkforceDataTester'));
const ExcelUploadTester = lazy(() => import('./components/testing/ExcelUploadTester'));
const JsonDataTester = lazy(() => import('./components/testing/JsonDataTester'));
const ExcelIntegrationDashboard = lazy(() => import('./components/dashboards/ExcelIntegrationDashboard'));
const RecruitingDashboard = lazy(() => import('./components/dashboards/RecruitingDashboard'));
const ExitSurveyDashboard = lazy(() => import('./components/dashboards/ExitSurveyDashboard'));
const CombinedWorkforceDashboard = lazy(() => import('./components/dashboards/CombinedWorkforceDashboard'));
const AdminDashboard = lazy(() => import('./components/dashboards/AdminDashboard'));
const EmployeeImportDashboard = lazy(() => import('./components/dashboards/EmployeeImportDashboard'));

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
              <Route path="/dashboards/turnover" element={<TurnoverDashboard />} />
              <Route path="/dashboards/i9" element={<I9HealthDashboard />} />
              <Route path="/dashboards/recruiting" element={<RecruitingDashboard />} />
              <Route path="/dashboards/exit-survey" element={<ExitSurveyDashboard />} />
              <Route path="/dashboards/combined-workforce" element={<CombinedWorkforceDashboard />} />
              
              {/* Test Suite Routes */}
              <Route path="/test" element={<TestSuite />} />
              <Route path="/test/errors" element={<ErrorTestComponent />} />
              <Route path="/test/export" element={<ExportTestComponent />} />
              <Route path="/test/print" element={<PrintTestComponent />} />
              <Route path="/test/accessibility" element={<AccessibilityTestComponent />} />
              <Route path="/test/database" element={<DatabaseTestComponent />} />
              <Route path="/test/firebase" element={<FirebaseTestComponent />} />
              <Route path="/test/workforce-data" element={<WorkforceDataTester />} />
              <Route path="/test/excel-upload" element={<ExcelUploadTester />} />
              <Route path="/test/json-data" element={<JsonDataTester />} />
              
              {/* Excel Integration Route */}
              <Route path="/excel-integration" element={<ExcelIntegrationDashboard />} />
              
              {/* Employee Import Route */}
              <Route path="/importer" element={<EmployeeImportDashboard />} />
              
              {/* Admin Dashboard Route */}
              <Route path="/admin" element={<AdminDashboard />} />
              
              {/* Legacy route for existing I9 dashboard */}
              <Route path="/i9" element={<I9HealthDashboard />} />
              
              {/* Default route - redirect to dashboards index */}
              <Route path="/" element={<Navigate to="/dashboards" replace />} />
              
              {/* Catch-all route - redirect to dashboards */}
              <Route path="*" element={<Navigate to="/dashboards" replace />} />
              </Routes>
              </Suspense>
            </main>
          </div>
        </Router>
      </ErrorBoundary>
    </DashboardProvider>
    </DataSourceProvider>
  );
}

export default App;
