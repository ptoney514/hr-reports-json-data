import React, { useState } from 'react';
import { TestTube } from 'lucide-react';
import ExportButton from './ui/ExportButton';
import { PDFExporter, DataExporter } from '../utils/exportUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ExportTestComponent = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Sample data for testing
  const sampleChartData = [
    { name: 'Academic Affairs', value: 567, employees: 567 },
    { name: 'Student Affairs', value: 234, employees: 234 },
    { name: 'Research', value: 189, employees: 189 },
    { name: 'Administration', value: 145, employees: 145 },
    { name: 'IT Services', value: 98, employees: 98 }
  ];

  const samplePieData = [
    { name: 'Faculty', value: 45, color: '#1e40af' },
    { name: 'Staff', value: 35, color: '#059669' },
    { name: 'Students', value: 20, color: '#d97706' }
  ];

  const sampleTableData = [
    {
      'Department': 'Academic Affairs',
      'Total Employees': 567,
      'Faculty': 345,
      'Staff': 222,
      'Vacancy Rate': '3.2%',
      'Budget': '$12,450,000'
    },
    {
      'Department': 'Student Affairs',
      'Total Employees': 234,
      'Faculty': 89,
      'Staff': 145,
      'Vacancy Rate': '2.8%',
      'Budget': '$5,670,000'
    },
    {
      'Department': 'Research & Innovation',
      'Total Employees': 189,
      'Faculty': 134,
      'Staff': 55,
      'Vacancy Rate': '4.1%',
      'Budget': '$8,920,000'
    }
  ];

  const addTestResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, {
      test,
      result,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runExportTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    try {
      // Test 1: PDF Export
      addTestResult('PDF Export', 'Running', 'Testing PDF generation...');
      const pdfExporter = new PDFExporter({
        orientation: 'portrait',
        includeBranding: true
      });
      
      pdfExporter.addHeader('Export Test Report', 'Functionality Test');
      pdfExporter.addFilterSummary({
        testMode: true,
        department: 'All Departments',
        dateRange: 'Q2-2025'
      });
      
      // Try to capture test charts
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for charts to render
      
      try {
        await pdfExporter.addComponentCapture('test-bar-chart', 'Department Overview');
        await pdfExporter.addComponentCapture('test-pie-chart', 'Employee Distribution');
        addTestResult('PDF Export', 'Success', 'Charts captured successfully');
      } catch (error) {
        addTestResult('PDF Export', 'Partial', `Chart capture failed: ${error.message}`);
      }
      
      await pdfExporter.save('export-test-report.pdf');
      addTestResult('PDF Export', 'Success', 'PDF generated and downloaded');

      // Test 2: Excel Export
      addTestResult('Excel Export', 'Running', 'Testing Excel generation...');
      const dataExporter = new DataExporter({
        includeFilters: true,
        includeMetadata: true
      });
      
      const additionalSheets = {
        'Test Filters': [
          { 'Filter Name': 'Test Mode', 'Filter Value': 'Enabled' },
          { 'Filter Name': 'Department', 'Filter Value': 'All Departments' }
        ],
        'Test Metadata': [
          { 'Property': 'Test Run', 'Value': new Date().toLocaleString() },
          { 'Property': 'Test Type', 'Value': 'Export Functionality' }
        ]
      };
      
      dataExporter.exportToExcel(sampleTableData, 'export-test-data.xlsx', additionalSheets);
      addTestResult('Excel Export', 'Success', 'Excel file generated with multiple sheets');

      // Test 3: CSV Export
      addTestResult('CSV Export', 'Running', 'Testing CSV generation...');
      dataExporter.exportToCSV(sampleTableData, 'export-test-data.csv');
      addTestResult('CSV Export', 'Success', 'CSV file generated with branding');

      // Test 4: Chart Detection
      addTestResult('Chart Detection', 'Running', 'Testing chart element detection...');
      const chartElements = document.querySelectorAll('[data-chart-id]');
      if (chartElements.length > 0) {
        addTestResult('Chart Detection', 'Success', `Found ${chartElements.length} chart elements`);
      } else {
        addTestResult('Chart Detection', 'Warning', 'No chart elements found with data-chart-id');
      }

      addTestResult('All Tests', 'Complete', 'Export functionality testing completed');
      
    } catch (error) {
      addTestResult('Export Tests', 'Error', `Test failed: ${error.message}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Export Functionality Test</h1>
        <p className="text-gray-600">
          Test the comprehensive export functionality including PDF generation, Excel/CSV exports, 
          chart capture, and company branding.
        </p>
      </div>

      {/* Export Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Export Controls</h2>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <ExportButton
            dashboardTitle="Export Test Dashboard"
            includeCharts={true}
            includeData={true}
            className="flex-shrink-0"
          />
          
          <button
            onClick={runExportTests}
            disabled={isRunningTests}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            <TestTube size={16} />
            {isRunningTests ? 'Running Tests...' : 'Run Export Tests'}
          </button>
          
          <button
            onClick={clearResults}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Clear Results
          </button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-3">Test Results</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                  <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                    result.result === 'Success' ? 'bg-green-500' :
                    result.result === 'Error' ? 'bg-red-500' :
                    result.result === 'Warning' ? 'bg-yellow-500' :
                    result.result === 'Partial' ? 'bg-orange-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{result.test}</span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        result.result === 'Success' ? 'bg-green-100 text-green-800' :
                        result.result === 'Error' ? 'bg-red-100 text-red-800' :
                        result.result === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                        result.result === 'Partial' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {result.result}
                      </span>
                      <span className="text-xs text-gray-500">{result.timestamp}</span>
                    </div>
                    {result.details && (
                      <p className="text-sm text-gray-600 mt-1">{result.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sample Charts for Testing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar Chart */}
        <div 
          id="test-bar-chart"
          data-chart-id="test-bar-chart"
          data-chart-title="Department Overview"
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sampleChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="employees" fill="#1e40af" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div 
          id="test-pie-chart"
          data-chart-id="test-pie-chart"
          data-chart-title="Employee Distribution"
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={samplePieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
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

      {/* Sample Data Table */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Data Table</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(sampleTableData[0]).map((header) => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sampleTableData.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Information */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Export Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">PDF Export Includes:</h4>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Company branding and headers</li>
              <li>Applied filters summary</li>
              <li>High-resolution chart captures</li>
              <li>Professional formatting</li>
              <li>Multi-page support</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Excel/CSV Export Includes:</h4>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Multiple sheets with data</li>
              <li>Filter and metadata sheets</li>
              <li>Company branding headers</li>
              <li>Proper data formatting</li>
              <li>Export timestamp information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportTestComponent; 