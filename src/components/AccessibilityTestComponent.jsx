import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import AccessibilityToggle from './ui/AccessibilityToggle';
import AccessibleDataTable from './ui/AccessibleDataTable';
import HeadcountChart from './charts/HeadcountChart';
import { announceToScreenReader, generateChartAriaLabel } from '../utils/accessibilityUtils';

const AccessibilityTestComponent = () => {
  const [testResults, setTestResults] = useState({});
  const [currentTest, setCurrentTest] = useState(null);
  const [focusedElement, setFocusedElement] = useState(null);

  // Sample data for testing
  const sampleChartData = [
    { name: 'Q1 2024', employees: 120, contractors: 30 },
    { name: 'Q2 2024', employees: 135, contractors: 25 },
    { name: 'Q3 2024', employees: 142, contractors: 28 },
    { name: 'Q4 2024', employees: 158, contractors: 32 }
  ];

  const samplePieData = [
    { name: 'Engineering', value: 45, color: '#4f46e5' },
    { name: 'Marketing', value: 25, color: '#0891b2' },
    { name: 'Sales', value: 20, color: '#059669' },
    { name: 'HR', value: 10, color: '#d97706' }
  ];

  const sampleTableData = [
    { id: 1, name: 'John Doe', department: 'Engineering', salary: 85000, status: 'Active' },
    { id: 2, name: 'Jane Smith', department: 'Marketing', salary: 72000, status: 'Active' },
    { id: 3, name: 'Bob Johnson', department: 'Sales', salary: 68000, status: 'Active' },
    { id: 4, name: 'Alice Brown', department: 'HR', salary: 65000, status: 'Active' }
  ];

  const tableColumns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { key: 'department', header: 'Department' },
    { key: 'salary', header: 'Salary', format: 'currency' },
    { key: 'status', header: 'Status' }
  ];

  // Test functions
  const runAccessibilityTests = async () => {
    setCurrentTest('Running accessibility tests...');
    const results = {};

    // Test 1: ARIA labels
    results.ariaLabels = await testAriaLabels();
    
    // Test 2: Keyboard navigation
    results.keyboardNavigation = await testKeyboardNavigation();
    
    // Test 3: Screen reader support
    results.screenReader = await testScreenReaderSupport();
    
    // Test 4: High contrast mode
    results.highContrast = await testHighContrastMode();
    
    // Test 5: Focus indicators
    results.focusIndicators = await testFocusIndicators();

    setTestResults(results);
    setCurrentTest(null);
    announceToScreenReader('Accessibility tests completed');
  };

  const testAriaLabels = async () => {
    const charts = document.querySelectorAll('[data-chart-id]');
    const tables = document.querySelectorAll('[role="table"]');
    const buttons = document.querySelectorAll('button');
    
    let passed = 0;
    let total = 0;

    // Test chart ARIA labels
    charts.forEach(chart => {
      total++;
      if (chart.getAttribute('aria-label') || chart.getAttribute('aria-labelledby')) {
        passed++;
      }
    });

    // Test table ARIA labels
    tables.forEach(table => {
      total++;
      if (table.getAttribute('aria-label') || table.getAttribute('aria-labelledby')) {
        passed++;
      }
    });

    // Test button ARIA labels
    buttons.forEach(button => {
      total++;
      if (button.getAttribute('aria-label') || button.textContent.trim() || button.querySelector('span.sr-only')) {
        passed++;
      }
    });

    return {
      passed,
      total,
      percentage: total > 0 ? Math.round((passed / total) * 100) : 0,
      status: passed === total ? 'pass' : 'partial'
    };
  };

  const testKeyboardNavigation = async () => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    let passed = 0;
    const total = focusableElements.length;

    focusableElements.forEach(element => {
      // Test if element can receive focus
      try {
        element.focus();
        if (document.activeElement === element) {
          passed++;
        }
      } catch (e) {
        // Element cannot be focused
      }
    });

    return {
      passed,
      total,
      percentage: total > 0 ? Math.round((passed / total) * 100) : 0,
      status: passed >= total * 0.9 ? 'pass' : 'partial'
    };
  };

  const testScreenReaderSupport = async () => {
    const liveRegions = document.querySelectorAll('[aria-live]');
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]');
    
    let score = 0;
    let maxScore = 3;

    // Test live regions
    if (liveRegions.length >= 2) score++;
    
    // Test heading structure
    if (headings.length > 0) score++;
    
    // Test landmarks
    if (landmarks.length > 0) score++;

    return {
      passed: score,
      total: maxScore,
      percentage: Math.round((score / maxScore) * 100),
      status: score === maxScore ? 'pass' : 'partial'
    };
  };

  const testHighContrastMode = async () => {
    const highContrastButton = document.querySelector('#high-contrast-toggle');
    let score = 0;
    let maxScore = 2;

    // Test if high contrast toggle exists
    if (highContrastButton) {
      score++;
      
      // Test if high contrast mode can be toggled
      try {
        highContrastButton.click();
        if (document.documentElement.classList.contains('high-contrast-mode')) {
          score++;
        }
        // Toggle back
        highContrastButton.click();
      } catch (e) {
        // Toggle failed
      }
    }

    return {
      passed: score,
      total: maxScore,
      percentage: Math.round((score / maxScore) * 100),
      status: score === maxScore ? 'pass' : 'partial'
    };
  };

  const testFocusIndicators = async () => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    let passed = 0;
    const total = Math.min(focusableElements.length, 10); // Test first 10 elements

    for (let i = 0; i < total; i++) {
      const element = focusableElements[i];
      try {
        element.focus();
        const styles = window.getComputedStyle(element);
        
        // Check if element has visible focus indicator
        if (styles.outline !== 'none' || styles.boxShadow !== 'none') {
          passed++;
        }
      } catch (e) {
        // Focus failed
      }
    }

    return {
      passed,
      total,
      percentage: total > 0 ? Math.round((passed / total) * 100) : 0,
      status: passed >= total * 0.8 ? 'pass' : 'partial'
    };
  };

  const handleFocusTest = (elementType) => {
    setFocusedElement(elementType);
    announceToScreenReader(`Testing focus on ${elementType}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass': return 'text-green-600';
      case 'partial': return 'text-yellow-600';
      case 'fail': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return '✓';
      case 'partial': return '⚠';
      case 'fail': return '✗';
      default: return '○';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Skip link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Accessibility toggle */}
      <AccessibilityToggle />

      {/* ARIA live regions */}
      <div id="status-live-region" className="sr-only" aria-live="polite" aria-atomic="true"></div>
      <div id="alert-live-region" className="sr-only" aria-live="assertive" aria-atomic="true"></div>

      <main id="main-content" role="main">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Accessibility Testing Dashboard
          </h1>
          <p className="text-gray-600 mb-6">
            This component demonstrates and tests all accessibility features including ARIA labels, 
            keyboard navigation, screen reader support, high contrast mode, and focus indicators.
          </p>

          {/* Test Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={runAccessibilityTests}
              disabled={currentTest !== null}
              className="btn-accessible bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              aria-describedby="test-help"
            >
              {currentTest || 'Run Accessibility Tests'}
            </button>
            
            <button
              onClick={() => handleFocusTest('button')}
              className="btn-accessible bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Test Button Focus
            </button>
            
            <button
              onClick={() => announceToScreenReader('Screen reader test announcement', 'assertive')}
              className="btn-accessible bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Test Screen Reader
            </button>
          </div>

          <div id="test-help" className="text-sm text-gray-600 mb-6">
            Click "Run Accessibility Tests" to automatically test all accessibility features. 
            Use Tab to navigate between elements and test keyboard accessibility.
          </div>

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Test Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(testResults).map(([testName, result]) => (
                  <div key={testName} className="bg-white p-4 rounded-lg border">
                    <h3 className="font-medium text-gray-900 mb-2 capitalize">
                      {testName.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <div className={`text-2xl font-bold ${getStatusColor(result.status)} mb-2`}>
                      {getStatusIcon(result.status)} {result.percentage}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {result.passed} of {result.total} tests passed
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sample Charts for Testing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <HeadcountChart 
            data={sampleChartData}
            title="Sample Headcount Chart"
            height={300}
          />
          
          <div className="bg-white p-4 rounded-lg shadow-sm border chart-focusable" 
               tabIndex={0}
               role="img"
               aria-label={generateChartAriaLabel('pie', samplePieData, 'Department Distribution')}
               onFocus={() => handleFocusTest('pie-chart')}
          >
            <h3 className="text-lg font-semibold text-blue-700 mb-3">Department Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={samplePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {samplePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sample Data Table for Testing */}
        <AccessibleDataTable
          data={sampleTableData}
          columns={tableColumns}
          title="Sample Employee Data"
          caption="Employee information including salary and department details"
          sortable={true}
          showPagination={false}
          className="mb-6"
        />

        {/* Accessibility Features Demo */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Accessibility Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Keyboard Navigation</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><kbd className="px-2 py-1 bg-gray-100 rounded">Tab</kbd> Navigate between elements</li>
                <li><kbd className="px-2 py-1 bg-gray-100 rounded">Arrow keys</kbd> Navigate charts and tables</li>
                <li><kbd className="px-2 py-1 bg-gray-100 rounded">Enter/Space</kbd> Activate buttons</li>
                <li><kbd className="px-2 py-1 bg-gray-100 rounded">Escape</kbd> Close dialogs</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Screen Reader Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• ARIA labels for all interactive elements</li>
                <li>• Live regions for dynamic content</li>
                <li>• Semantic HTML structure</li>
                <li>• Alternative text for visual content</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Focus Test Area</h4>
            <p className="text-blue-800 mb-3">
              Use Tab to navigate through these elements and observe focus indicators:
            </p>
            <div className="flex flex-wrap gap-3">
              <button 
                className="btn-accessible bg-blue-600 text-white px-4 py-2 rounded"
                onFocus={() => setFocusedElement('button-1')}
              >
                Button 1
              </button>
              <button 
                className="btn-accessible bg-green-600 text-white px-4 py-2 rounded"
                onFocus={() => setFocusedElement('button-2')}
              >
                Button 2
              </button>
              <input 
                type="text" 
                placeholder="Test input"
                className="form-control px-3 py-2 border rounded"
                onFocus={() => setFocusedElement('input')}
              />
              <select 
                className="form-control px-3 py-2 border rounded"
                onFocus={() => setFocusedElement('select')}
              >
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
            {focusedElement && (
              <div className="mt-3 text-sm text-blue-700" role="status" aria-live="polite">
                Currently focused: {focusedElement}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccessibilityTestComponent; 