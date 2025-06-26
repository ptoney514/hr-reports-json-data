import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/ui/Navigation';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { setupGlobalErrorHandling } from './utils/errorHandler';
import { DashboardSkeleton } from './components/ui/LoadingSkeleton';
import './components/I9Dashboard.css';

// Lazy load dashboard components for better performance
const DashboardIndex = lazy(() => import('./components/dashboards/DashboardIndex'));
const WorkforceDashboard = lazy(() => import('./components/dashboards/WorkforceDashboard'));
const TurnoverDashboard = lazy(() => import('./components/dashboards/TurnoverDashboard'));
const I9HealthDashboard = lazy(() => import('./components/I9HealthDashboard'));
const TestSuite = lazy(() => import('./components/TestSuite'));
const ErrorTestComponent = lazy(() => import('./components/ErrorTestComponent'));

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
    <ErrorBoundary
      onError={handleAppError}
      onRetry={handleAppRetry}
      showHomeButton={false}
    >
      <Router>
        <div className="App">
          {/* Navigation Component */}
          <Navigation />
          
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
              <Route path="/dashboards/i9" element={<I9HealthDashboard />} />
              
              {/* Test Suite Routes */}
              <Route path="/test" element={<TestSuite />} />
              <Route path="/test/errors" element={<ErrorTestComponent />} />
              
              {/* Legacy route for existing I9 dashboard */}
              <Route path="/i9" element={<I9HealthDashboard />} />
              
              {/* Default route - redirect to dashboards index */}
              <Route path="/" element={<Navigate to="/dashboards" replace />} />
              
              {/* Catch-all route - redirect to dashboards */}
              <Route path="*" element={<Navigate to="/dashboards" replace />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
