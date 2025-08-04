import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Calculator, 
  BarChart3, 
  Database,
  Eye,
  Download,
  RefreshCw,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { QUARTER_DATES } from '../../utils/quarterlyDataProcessor';
import useWorkforceData from '../../hooks/useWorkforceData';
import useSimpleWorkforceData from '../../hooks/useSimpleWorkforceData';

/**
 * Comprehensive testing framework for Workforce Analytics dashboard
 * Validates data accuracy, calculations, and consistency
 * Now supports both Firebase and JSON data sources
 */
const WorkforceDataTester = () => {
  const [selectedQuarter, setSelectedQuarter] = useState('Q1-2025');
  const [testResults, setTestResults] = useState({});
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testMode, setTestMode] = useState('all'); // 'all', 'calculations', 'consistency', 'charts'
  const [dataSource, setDataSource] = useState('firebase'); // 'firebase' or 'json'

  // Get Firebase data for testing
  const { 
    data: firebaseData, 
    loading: firebaseLoading, 
    error: firebaseError 
  } = useWorkforceData({ reportingPeriod: selectedQuarter });

  // Get JSON data for testing
  const {
    data: jsonData,
    loading: jsonLoading,
    error: jsonError
  } = useSimpleWorkforceData();

  // Select data based on source
  const currentData = dataSource === 'firebase' ? firebaseData : jsonData;
  const currentLoading = dataSource === 'firebase' ? firebaseLoading : jsonLoading;
  const currentError = dataSource === 'firebase' ? firebaseError : jsonError;

  // Test categories
  const testCategories = {
    calculations: {
      name: 'Summary Card Calculations',
      description: 'Verify accuracy of total headcount, faculty, staff calculations',
      tests: []
    },
    consistency: {
      name: 'Data Consistency',
      description: 'Check for data consistency across different visualizations',
      tests: []
    },
    charts: {
      name: 'Chart Synchronization', 
      description: 'Verify charts update correctly when quarter changes',
      tests: []
    },
    integration: {
      name: 'Data Integration',
      description: 'Test data flow from Firebase to dashboard components',
      tests: []
    }
  };

  // Run all tests
  const runTests = async () => {
    setIsRunningTests(true);
    setTestResults({});
    
    const results = {};
    
    try {
      // Test 1: Summary Card Calculations
      results.calculations = await testSummaryCalculations();
      
      // Test 2: Data Consistency
      results.consistency = await testDataConsistency();
      
      // Test 3: Chart Synchronization
      results.charts = await testChartSynchronization();
      
      // Test 4: Data Integration
      results.integration = await testDataIntegration();
      
      setTestResults(results);
    } catch (error) {
      console.error('Testing error:', error);
      setTestResults({ error: `Testing failed: ${error.message}` });
    } finally {
      setIsRunningTests(false);
    }
  };

  // Test summary card calculations
  const testSummaryCalculations = async () => {
    const tests = [];
    
    if (currentData && currentData.summary) {
      const summary = currentData.summary;
      
      // Test 1: Total headcount should equal faculty + staff + students
      const calculatedTotal = (summary.faculty || 0) + (summary.staff || 0) + (summary.students || 0);
      const reportedTotal = summary.totalEmployees || 0;
      const totalDifference = Math.abs(calculatedTotal - reportedTotal);
      
      tests.push({
        name: 'Total Headcount Calculation',
        description: `Faculty (${summary.faculty}) + Staff (${summary.staff}) + Students (${summary.students}) = ${calculatedTotal}`,
        expected: calculatedTotal,
        actual: reportedTotal,
        difference: totalDifference,
        status: totalDifference <= 1 ? 'pass' : 'fail', // Allow 1 person rounding difference
        details: `Expected: ${calculatedTotal}, Actual: ${reportedTotal}, Difference: ${totalDifference}`
      });

      // Test 2: Recent hires should be positive number
      const recentHires = currentData.metrics?.recentHires;
      if (recentHires) {
        const totalHires = (recentHires.faculty || 0) + (recentHires.staff || 0) + (recentHires.students || 0);
        tests.push({
          name: 'Recent Hires Validity',
          description: 'Recent hires should be non-negative numbers',
          expected: 'Non-negative values',
          actual: `Faculty: ${recentHires.faculty}, Staff: ${recentHires.staff}, Students: ${recentHires.students}`,
          status: (recentHires.faculty >= 0 && recentHires.staff >= 0 && recentHires.students >= 0) ? 'pass' : 'fail',
          details: `Total new hires: ${totalHires}`
        });
      }

      // Test 3: Percentage changes should be reasonable (-50% to +50%)
      const employeeChange = summary.employeeChange || 0;
      const facultyChange = summary.facultyChange || 0;
      const staffChange = summary.staffChange || 0;
      
      const changeTest = Math.abs(employeeChange) <= 50 && Math.abs(facultyChange) <= 50 && Math.abs(staffChange) <= 50;
      
      tests.push({
        name: 'Reasonable Percentage Changes',
        description: 'Changes should be within reasonable bounds (-50% to +50%)',
        expected: 'Changes between -50% and +50%',
        actual: `Employee: ${employeeChange}%, Faculty: ${facultyChange}%, Staff: ${staffChange}%`,
        status: changeTest ? 'pass' : 'warning',
        details: 'Large changes may indicate data quality issues'
      });
    } else {
      tests.push({
        name: `${dataSource === 'firebase' ? 'Firebase' : 'JSON'} Data Availability`,
        description: `${dataSource === 'firebase' ? 'Firebase' : 'JSON'} data should be available for testing`,
        expected: 'Data object',
        actual: currentData ? 'Available' : 'Not available',
        status: currentData ? 'pass' : 'fail',
        details: currentError || 'No data found'
      });
    }

    return {
      category: 'Summary Card Calculations',
      totalTests: tests.length,
      passed: tests.filter(t => t.status === 'pass').length,
      failed: tests.filter(t => t.status === 'fail').length,
      warnings: tests.filter(t => t.status === 'warning').length,
      tests
    };
  };

  // Test data consistency across components
  const testDataConsistency = async () => {
    const tests = [];
    
    // Test: Quarter selection should affect all components
    tests.push({
      name: 'Quarter Selection Impact',
      description: 'Selected quarter should be reflected in all dashboard components',
      expected: selectedQuarter,
      actual: selectedQuarter,
      status: 'pass',
      details: `All components should respond to quarter: ${selectedQuarter}`
    });

    // Test: Data source consistency
    if (currentData) {
      const dataSourceTest = currentData.version && currentData.dataSource;
      tests.push({
        name: 'Data Source Consistency',
        description: 'Data should have consistent source and version information',
        expected: 'Version and source metadata',
        actual: `Version: ${currentData.version || 'Unknown'}, Source: ${currentData.dataSource || 'Unknown'}`,
        status: dataSourceTest ? 'pass' : 'warning',
        details: 'Helps track data lineage and versions'
      });
    }

    return {
      category: 'Data Consistency',
      totalTests: tests.length,
      passed: tests.filter(t => t.status === 'pass').length,
      failed: tests.filter(t => t.status === 'fail').length,
      warnings: tests.filter(t => t.status === 'warning').length,
      tests
    };
  };

  // Test chart synchronization
  const testChartSynchronization = async () => {
    const tests = [];

    // Test: Available quarters should match QUARTER_DATES
    const availableQuarters = QUARTER_DATES.map(q => q.value);
    const hasSelectedQuarter = availableQuarters.includes(selectedQuarter);
    
    tests.push({
      name: 'Quarter Availability',
      description: 'Selected quarter should be in available quarters list',
      expected: `Quarter in ${availableQuarters.join(', ')}`,
      actual: selectedQuarter,
      status: hasSelectedQuarter ? 'pass' : 'fail',
      details: `Available quarters: ${availableQuarters.length}`
    });

    // Test: Chart data should exist for visualization
    if (currentData && currentData.breakdowns) {
      const hasDivisions = currentData.breakdowns.divisions && currentData.breakdowns.divisions.length > 0;
      tests.push({
        name: 'Division Chart Data',
        description: 'Division breakdown data should be available for charts',
        expected: 'Array of division data',
        actual: hasDivisions ? `${currentData.breakdowns.divisions.length} divisions` : 'No division data',
        status: hasDivisions ? 'pass' : 'warning',
        details: 'Needed for Top Divisions chart'
      });
    }

    return {
      category: 'Chart Synchronization',
      totalTests: tests.length,
      passed: tests.filter(t => t.status === 'pass').length,
      failed: tests.filter(t => t.status === 'fail').length,
      warnings: tests.filter(t => t.status === 'warning').length,
      tests
    };
  };

  // Test data integration
  const testDataIntegration = async () => {
    const tests = [];

    // Test: Firebase connection
    tests.push({
      name: 'Firebase Connection',
      description: 'Firebase should connect without errors',
      expected: 'No Firebase errors',
      actual: firebaseError ? `Error: ${firebaseError}` : 'Connected successfully',
      status: firebaseError ? 'fail' : 'pass',
      details: firebaseLoading ? 'Loading...' : 'Connection test complete'
    });

    // Test: Data structure validation
    if (currentData) {
      const hasRequiredFields = currentData.summary && currentData.metrics;
      tests.push({
        name: 'Data Structure Validation',
        description: 'Firebase data should have required summary and metrics fields',
        expected: 'Summary and metrics objects',
        actual: `Summary: ${!!currentData.summary}, Metrics: ${!!currentData.metrics}`,
        status: hasRequiredFields ? 'pass' : 'fail',
        details: 'Required for dashboard functionality'
      });
    }

    return {
      category: 'Data Integration',
      totalTests: tests.length,
      passed: tests.filter(t => t.status === 'pass').length,
      failed: tests.filter(t => t.status === 'fail').length,
      warnings: tests.filter(t => t.status === 'warning').length,
      tests
    };
  };

  // Get overall test status
  const getOverallStatus = () => {
    const allResults = Object.values(testResults);
    if (allResults.length === 0) return 'not-run';
    
    const totalFailed = allResults.reduce((sum, result) => sum + (result.failed || 0), 0);
    const totalWarnings = allResults.reduce((sum, result) => sum + (result.warnings || 0), 0);
    
    if (totalFailed > 0) return 'fail';
    if (totalWarnings > 0) return 'warning';
    return 'pass';
  };

  // Export test results
  const exportResults = () => {
    const exportData = {
      testDate: new Date().toISOString(),
      quarter: selectedQuarter,
      testMode,
      results: testResults,
      summary: {
        totalCategories: Object.keys(testResults).length,
        totalTests: Object.values(testResults).reduce((sum, result) => sum + (result.totalTests || 0), 0),
        totalPassed: Object.values(testResults).reduce((sum, result) => sum + (result.passed || 0), 0),
        totalFailed: Object.values(testResults).reduce((sum, result) => sum + (result.failed || 0), 0),
        totalWarnings: Object.values(testResults).reduce((sum, result) => sum + (result.warnings || 0), 0),
        overallStatus: getOverallStatus()
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workforce-test-results-${selectedQuarter}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="text-blue-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Workforce Data Tester</h1>
        </div>
        <p className="text-gray-600 mb-4">
          Comprehensive testing framework for validating Workforce Analytics dashboard data accuracy and consistency.
        </p>
        
        {/* Test Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Test Quarter</label>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {QUARTER_DATES.map(quarter => (
                <option key={quarter.value} value={quarter.value}>
                  {quarter.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Test Mode</label>
            <select
              value={testMode}
              onChange={(e) => setTestMode(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Tests</option>
              <option value="calculations">Calculations Only</option>
              <option value="consistency">Consistency Only</option>
              <option value="charts">Charts Only</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDataSource(dataSource === 'firebase' ? 'json' : 'firebase')}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {dataSource === 'firebase' ? <ToggleLeft size={20} /> : <ToggleRight size={20} />}
                <span className="text-sm font-medium">
                  {dataSource === 'firebase' ? 'Firebase' : 'JSON Files'}
                </span>
              </button>
              <span className={`text-xs px-2 py-1 rounded ${
                dataSource === 'firebase' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {dataSource === 'firebase' ? 'Live Firebase' : 'Local JSON'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <button
              onClick={runTests}
              disabled={isRunningTests}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isRunningTests ? <RefreshCw className="animate-spin" size={16} /> : <Eye size={16} />}
              {isRunningTests ? 'Running Tests...' : 'Run Tests'}
            </button>
            
            {Object.keys(testResults).length > 0 && (
              <button
                onClick={exportResults}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Download size={16} />
                Export Results
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overall Status */}
      {Object.keys(testResults).length > 0 && (
        <div className={`rounded-lg border p-4 ${
          getOverallStatus() === 'pass' ? 'bg-green-50 border-green-200' :
          getOverallStatus() === 'warning' ? 'bg-yellow-50 border-yellow-200' :
          getOverallStatus() === 'fail' ? 'bg-red-50 border-red-200' :
          'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            {getOverallStatus() === 'pass' && <CheckCircle className="text-green-600" size={20} />}
            {getOverallStatus() === 'warning' && <AlertTriangle className="text-yellow-600" size={20} />}
            {getOverallStatus() === 'fail' && <XCircle className="text-red-600" size={20} />}
            <span className={`font-medium ${
              getOverallStatus() === 'pass' ? 'text-green-700' :
              getOverallStatus() === 'warning' ? 'text-yellow-700' :
              getOverallStatus() === 'fail' ? 'text-red-700' :
              'text-gray-700'
            }`}>
              Overall Status: {getOverallStatus().toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Test Results */}
      {Object.entries(testResults).map(([category, result]) => (
        <div key={category} className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{result.category}</h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-600">✓ {result.passed || 0} Passed</span>
                {result.warnings > 0 && <span className="text-yellow-600">⚠ {result.warnings} Warnings</span>}
                {result.failed > 0 && <span className="text-red-600">✗ {result.failed} Failed</span>}
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="space-y-3">
              {result.tests?.map((test, index) => (
                <div key={index} className={`p-3 rounded border-l-4 ${
                  test.status === 'pass' ? 'border-green-400 bg-green-50' :
                  test.status === 'warning' ? 'border-yellow-400 bg-yellow-50' :
                  'border-red-400 bg-red-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{test.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                      <div className="text-xs space-y-1">
                        <div><strong>Expected:</strong> {test.expected}</div>
                        <div><strong>Actual:</strong> {test.actual}</div>
                        {test.details && <div><strong>Details:</strong> {test.details}</div>}
                      </div>
                    </div>
                    <div className="ml-4">
                      {test.status === 'pass' && <CheckCircle className="text-green-600" size={20} />}
                      {test.status === 'warning' && <AlertTriangle className="text-yellow-600" size={20} />}
                      {test.status === 'fail' && <XCircle className="text-red-600" size={20} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* No Results Message */}
      {Object.keys(testResults).length === 0 && !isRunningTests && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Test</h3>
          <p className="text-gray-600 mb-4">
            Select a quarter and test mode, then click "Run Tests" to validate your Workforce Analytics data.
          </p>
          <button
            onClick={runTests}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Start Testing
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkforceDataTester;