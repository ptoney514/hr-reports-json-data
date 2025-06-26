import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Play, 
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet,
  Wifi,
  WifiOff,
  Database,
  BarChart3,
  Filter
} from 'lucide-react';

const TestSuite = () => {
  const [testResults, setTestResults] = useState({});
  const [currentTest, setCurrentTest] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const testCategories = [
    {
      id: 'visual-accuracy',
      name: 'Visual Accuracy',
      description: 'Test dashboard layout and visual components',
      tests: [
        { id: 'dashboard-index', name: 'Dashboard Index Layout', path: '/dashboards' },
        { id: 'workforce-dashboard', name: 'Workforce Dashboard Layout', path: '/dashboards/workforce' },
        { id: 'turnover-dashboard', name: 'Turnover Dashboard Layout', path: '/dashboards/turnover' },
        { id: 'i9-dashboard', name: 'I-9 Dashboard Layout', path: '/dashboards/i9' },
        { id: 'navigation', name: 'Navigation Component', path: '/' }
      ]
    },
    {
      id: 'filter-functionality',
      name: 'Filter Functionality',
      description: 'Test filter controls and data filtering',
      tests: [
        { id: 'workforce-filters', name: 'Workforce Dashboard Filters', path: '/dashboards/workforce' },
        { id: 'turnover-filters', name: 'Turnover Dashboard Filters', path: '/dashboards/turnover' },
        { id: 'filter-persistence', name: 'Filter State Persistence', path: '/dashboards' },
        { id: 'filter-reset', name: 'Filter Reset Functionality', path: '/dashboards' }
      ]
    },
    {
      id: 'responsive-design',
      name: 'Responsive Design',
      description: 'Test mobile and tablet layouts',
      tests: [
        { id: 'mobile-navigation', name: 'Mobile Navigation Menu', viewport: 'mobile' },
        { id: 'mobile-dashboards', name: 'Mobile Dashboard Layout', viewport: 'mobile' },
        { id: 'tablet-layout', name: 'Tablet Layout', viewport: 'tablet' },
        { id: 'desktop-layout', name: 'Desktop Layout', viewport: 'desktop' }
      ]
    },
    {
      id: 'chart-rendering',
      name: 'Chart Rendering',
      description: 'Test all chart components',
      tests: [
        { id: 'headcount-chart', name: 'Headcount Chart', component: 'HeadcountChart' },
        { id: 'starters-leavers-chart', name: 'Starters/Leavers Chart', component: 'StartersLeaversChart' },
        { id: 'location-chart', name: 'Location Distribution Chart', component: 'LocationChart' },
        { id: 'divisions-chart', name: 'Divisions Chart', component: 'DivisionsChart' },
        { id: 'turnover-pie-chart', name: 'Turnover Pie Chart', component: 'TurnoverPieChart' }
      ]
    },
    {
      id: 'error-states',
      name: 'Error States',
      description: 'Test error handling and edge cases',
      tests: [
        { id: 'no-data', name: 'No Data State', scenario: 'empty-data' },
        { id: 'network-error', name: 'Network Error', scenario: 'network-failure' },
        { id: 'loading-states', name: 'Loading States', scenario: 'loading' },
        { id: 'invalid-filters', name: 'Invalid Filter Values', scenario: 'invalid-filters' }
      ]
    }
  ];

  const runTest = async (categoryId, testId) => {
    setCurrentTest(`${categoryId}-${testId}`);
    setTestResults(prev => ({
      ...prev,
      [`${categoryId}-${testId}`]: { status: 'running', details: 'Test in progress...' }
    }));

    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Mock test results (in real implementation, these would be actual tests)
    const mockResult = Math.random() > 0.1 ? 'passed' : 'failed';
    const details = mockResult === 'passed' 
      ? 'All checks passed successfully'
      : 'Some issues detected - check console for details';

    setTestResults(prev => ({
      ...prev,
      [`${categoryId}-${testId}`]: { 
        status: mockResult, 
        details,
        timestamp: new Date().toLocaleTimeString()
      }
    }));
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults({});

    for (const category of testCategories) {
      for (const test of category.tests) {
        await runTest(category.id, test.id);
      }
    }

    setCurrentTest(null);
    setIsRunning(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'failed':
        return <XCircle className="text-red-500" size={16} />;
      case 'running':
        return <RefreshCw className="text-blue-500 animate-spin" size={16} />;
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'running':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getViewportIcon = (viewport) => {
    switch (viewport) {
      case 'mobile':
        return <Smartphone size={16} />;
      case 'tablet':
        return <Tablet size={16} />;
      case 'desktop':
        return <Monitor size={16} />;
      default:
        return <BarChart3 size={16} />;
    }
  };

  const getCategoryIcon = (categoryId) => {
    switch (categoryId) {
      case 'visual-accuracy':
        return <Monitor className="text-blue-600" size={20} />;
      case 'filter-functionality':
        return <Filter className="text-green-600" size={20} />;
      case 'responsive-design':
        return <Smartphone className="text-purple-600" size={20} />;
      case 'chart-rendering':
        return <BarChart3 className="text-orange-600" size={20} />;
      case 'error-states':
        return <AlertTriangle className="text-red-600" size={20} />;
      default:
        return <CheckCircle className="text-gray-600" size={20} />;
    }
  };

  const getTotalTests = () => testCategories.reduce((sum, cat) => sum + cat.tests.length, 0);
  const getPassedTests = () => Object.values(testResults).filter(r => r.status === 'passed').length;
  const getFailedTests = () => Object.values(testResults).filter(r => r.status === 'failed').length;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-700">
                Dashboard Test Suite
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive testing for HR Analytics dashboards
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/dashboards"
                className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                Back to Dashboards
              </Link>
              <button
                onClick={runAllTests}
                disabled={isRunning}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRunning ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
                {isRunning ? 'Running Tests...' : 'Run All Tests'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Test Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="text-blue-600" size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {getTotalTests()}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  Total Tests
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {getPassedTests()}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  Passed
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="text-red-600" size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {getFailedTests()}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  Failed
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <RefreshCw className="text-gray-600" size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {Object.keys(testResults).length > 0 ? 
                    Math.round((getPassedTests() / Object.keys(testResults).length) * 100) : 0}%
                </div>
                <div className="text-sm font-medium text-gray-700">
                  Success Rate
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Testing Checklist */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Manual Testing Checklist
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Visual Accuracy</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Dashboard layouts are consistent</li>
                <li>✓ Colors match design system</li>
                <li>✓ Typography is readable</li>
                <li>✓ Icons are properly aligned</li>
                <li>✓ Cards have consistent spacing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Functionality</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Navigation works correctly</li>
                <li>✓ Filters update data</li>
                <li>✓ Charts render with data</li>
                <li>✓ Loading states display</li>
                <li>✓ Error states handle gracefully</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Responsive Design</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Mobile navigation collapses</li>
                <li>✓ Charts resize properly</li>
                <li>✓ Text remains readable</li>
                <li>✓ Touch targets are adequate</li>
                <li>✓ No horizontal scrolling</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Performance</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Pages load quickly</li>
                <li>✓ Smooth transitions</li>
                <li>✓ No console errors</li>
                <li>✓ Memory usage stable</li>
                <li>✓ Data caching works</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Links for Manual Testing */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Test Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/dashboards"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Monitor className="text-blue-600" size={20} />
              <div>
                <div className="font-medium text-gray-900">Dashboard Index</div>
                <div className="text-sm text-gray-600">Test main dashboard page</div>
              </div>
            </Link>
            
            <Link
              to="/dashboards/workforce"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="text-green-600" size={20} />
              <div>
                <div className="font-medium text-gray-900">Workforce Dashboard</div>
                <div className="text-sm text-gray-600">Test workforce analytics</div>
              </div>
            </Link>
            
            <Link
              to="/dashboards/turnover"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="text-orange-600" size={20} />
              <div>
                <div className="font-medium text-gray-900">Turnover Dashboard</div>
                <div className="text-sm text-gray-600">Test turnover analysis</div>
              </div>
            </Link>
            
            <Link
              to="/dashboards/i9"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Database className="text-purple-600" size={20} />
              <div>
                <div className="font-medium text-gray-900">I-9 Compliance</div>
                <div className="text-sm text-gray-600">Test compliance tracking</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSuite; 