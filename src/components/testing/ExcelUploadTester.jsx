import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileSpreadsheet,
  Database,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';
import FileUploader from '../ui/FileUploader';
import { exportTestDatasets, createValidationTestData } from '../../utils/testDataGenerator';

/**
 * Excel Upload Testing Component
 * Tests file upload functionality with generated test data
 */
const ExcelUploadTester = () => {
  const [testResults, setTestResults] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);
  const [isGeneratingFiles, setIsGeneratingFiles] = useState(false);

  // Test scenarios
  const testScenarios = [
    {
      id: 'individual-employees',
      name: 'Individual Employee Records',
      description: 'Test upload of individual employee records with personal data',
      expectedColumns: ['Employee_ID', 'First_Name', 'Last_Name', 'Department', 'Division'],
      expectedRows: 150,
      dataType: 'individual'
    },
    {
      id: 'quarterly-aggregates',
      name: 'Quarterly Aggregate Data',
      description: 'Test upload of quarterly summary data by division and location',
      expectedColumns: ['Quarter_End_Date', 'Division', 'Location', 'BE_Faculty_Headcount'],
      expectedRows: 64, // 4 quarters × 8 divisions × 2 locations
      dataType: 'aggregate'
    },
    {
      id: 'validation-data',
      name: 'Validation Test Data',
      description: 'Small dataset with known expected results for calculation validation',
      expectedColumns: ['Quarter_End_Date', 'Division', 'Location', 'Total_Headcount'],
      expectedRows: 2,
      dataType: 'validation'
    },
    {
      id: 'multi-sheet',
      name: 'Multi-Sheet Template',
      description: 'Comprehensive Excel file with multiple quarters and data dictionary',
      expectedColumns: ['Quarter_End_Date', 'Division', 'Location'],
      expectedRows: 'variable',
      dataType: 'comprehensive'
    }
  ];

  // Generate test files
  const generateTestFiles = async () => {
    setIsGeneratingFiles(true);
    
    try {
      const generatedFiles = exportTestDatasets();
      
      setTestResults(prev => [...prev, {
        timestamp: new Date().toISOString(),
        type: 'file-generation',
        status: 'success',
        message: `Generated ${generatedFiles.length} test files`,
        details: { files: generatedFiles }
      }]);
      
    } catch (error) {
      setTestResults(prev => [...prev, {
        timestamp: new Date().toISOString(),
        type: 'file-generation',
        status: 'error',
        message: `Failed to generate test files: ${error.message}`,
        details: { error: error.toString() }
      }]);
    } finally {
      setIsGeneratingFiles(false);
    }
  };

  // Handle data upload from FileUploader
  const handleDataImported = useCallback((importedData) => {
    console.log('Data imported for testing:', importedData);
    setUploadedData(importedData);
    
    if (currentTest) {
      validateUploadedData(importedData, currentTest);
    }
    
    setTestResults(prev => [...prev, {
      timestamp: new Date().toISOString(),
      type: 'upload-success',
      status: 'success',
      message: `Successfully uploaded ${importedData.rowCount} rows`,
      details: {
        fileName: importedData.fileName,
        fileSize: importedData.fileSize,
        headers: importedData.headers,
        rowCount: importedData.rowCount,
        fileType: importedData.fileType
      }
    }]);
  }, [currentTest]);

  // Handle upload errors
  const handleUploadError = useCallback((error) => {
    console.error('Upload error:', error);
    
    setTestResults(prev => [...prev, {
      timestamp: new Date().toISOString(),
      type: 'upload-error',
      status: 'error',
      message: `Upload failed: ${error}`,
      details: { error }
    }]);
  }, []);

  // Validate uploaded data against test scenario expectations
  const validateUploadedData = (data, scenario) => {
    const validationResults = [];
    
    // Test 1: Row count validation
    if (scenario.expectedRows !== 'variable') {
      const rowCountValid = data.rowCount === scenario.expectedRows;
      validationResults.push({
        test: 'Row Count',
        expected: scenario.expectedRows,
        actual: data.rowCount,
        status: rowCountValid ? 'pass' : 'fail',
        message: rowCountValid ? 'Row count matches expected' : `Expected ${scenario.expectedRows} rows, got ${data.rowCount}`
      });
    }
    
    // Test 2: Required columns validation
    const missingColumns = scenario.expectedColumns.filter(col => 
      !data.headers.some(header => 
        header.toLowerCase().includes(col.toLowerCase()) || 
        col.toLowerCase().includes(header.toLowerCase())
      )
    );
    
    validationResults.push({
      test: 'Required Columns',
      expected: scenario.expectedColumns.join(', '),
      actual: data.headers.join(', '),
      status: missingColumns.length === 0 ? 'pass' : 'fail',
      message: missingColumns.length === 0 ? 
        'All required columns present' : 
        `Missing columns: ${missingColumns.join(', ')}`
    });
    
    // Test 3: Data quality validation
    if (data.validation) {
      const qualityStatus = data.validation.isValid ? 'pass' : 'warning';
      validationResults.push({
        test: 'Data Quality',
        expected: 'Valid data structure',
        actual: `${data.validation.errors.length} errors, ${data.validation.warnings.length} warnings`,
        status: qualityStatus,
        message: data.validation.isValid ? 
          'Data validation passed' : 
          `Issues found: ${[...data.validation.errors, ...data.validation.warnings].join(', ')}`
      });
    }
    
    // Test 4: Data type specific validation
    if (scenario.dataType === 'validation') {
      validateCalculationData(data, validationResults);
    }
    
    setTestResults(prev => [...prev, {
      timestamp: new Date().toISOString(),
      type: 'data-validation',
      status: validationResults.every(r => r.status === 'pass') ? 'success' : 'warning',
      message: `Validation completed for ${scenario.name}`,
      details: {
        scenario: scenario.name,
        validationResults
      }
    }]);
  };

  // Validate calculation data against known expected results
  const validateCalculationData = (data, validationResults) => {
    const { expected } = createValidationTestData();
    
    // Calculate totals from uploaded data
    const calculatedTotals = data.data.reduce((acc, row) => {
      acc.totalEmployees += parseInt(row.Total_Headcount || 0, 10);
      acc.faculty += parseInt(row.BE_Faculty_Headcount || 0, 10);
      acc.staff += parseInt(row.BE_Staff_Headcount || 0, 10);
      acc.students += parseInt(row.NBE_Student_Worker_Headcount || 0, 10);
      acc.newHires += parseInt(row.BE_New_Hires || 0, 10) + parseInt(row.NBE_New_Hires || 0, 10);
      acc.departures += parseInt(row.BE_Departures || 0, 10) + parseInt(row.NBE_Departures || 0, 10);
      return acc;
    }, {
      totalEmployees: 0,
      faculty: 0,
      staff: 0,
      students: 0,
      newHires: 0,
      departures: 0
    });

    // Validate against expected results
    Object.entries(expected).forEach(([key, expectedValue]) => {
      if (typeof expectedValue === 'number' && calculatedTotals[key] !== undefined) {
        const isValid = calculatedTotals[key] === expectedValue;
        validationResults.push({
          test: `Calculation: ${key}`,
          expected: expectedValue,
          actual: calculatedTotals[key],
          status: isValid ? 'pass' : 'fail',
          message: isValid ? 
            `${key} calculation correct` : 
            `${key}: expected ${expectedValue}, calculated ${calculatedTotals[key]}`
        });
      }
    });
  };

  // Start a specific test scenario
  const startTest = (scenario) => {
    setCurrentTest(scenario);
    setUploadedData(null);
    
    setTestResults(prev => [...prev, {
      timestamp: new Date().toISOString(),
      type: 'test-start',
      status: 'info',
      message: `Started test: ${scenario.name}`,
      details: { scenario }
    }]);
  };

  // Clear test results
  const clearResults = () => {
    setTestResults([]);
    setCurrentTest(null);
    setUploadedData(null);
  };

  // Export test results
  const exportResults = () => {
    const exportData = {
      testDate: new Date().toISOString(),
      testResults,
      summary: {
        totalTests: testResults.length,
        successCount: testResults.filter(r => r.status === 'success').length,
        errorCount: testResults.filter(r => r.status === 'error').length,
        warningCount: testResults.filter(r => r.status === 'warning').length
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `excel-upload-test-results-${new Date().toISOString().split('T')[0]}.json`;
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
          <FileSpreadsheet className="text-green-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Excel Upload Tester</h1>
        </div>
        <p className="text-gray-600 mb-4">
          Test Excel file upload functionality with generated test datasets. Validates data structure, calculations, and processing.
        </p>
        
        {/* Control Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={generateTestFiles}
            disabled={isGeneratingFiles}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isGeneratingFiles ? <RefreshCw className="animate-spin" size={16} /> : <Download size={16} />}
            {isGeneratingFiles ? 'Generating...' : 'Generate Test Files'}
          </button>
          
          <button
            onClick={clearResults}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            <RefreshCw size={16} />
            Clear Results
          </button>
          
          {testResults.length > 0 && (
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

      {/* Test Scenarios */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Scenarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testScenarios.map(scenario => (
            <div key={scenario.id} className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              currentTest?.id === scenario.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">{scenario.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div><strong>Expected Columns:</strong> {scenario.expectedColumns.slice(0, 3).join(', ')}{scenario.expectedColumns.length > 3 ? '...' : ''}</div>
                    <div><strong>Expected Rows:</strong> {scenario.expectedRows}</div>
                  </div>
                </div>
                <button
                  onClick={() => startTest(scenario)}
                  className={`ml-3 px-3 py-1 rounded text-sm font-medium ${
                    currentTest?.id === scenario.id ? 
                    'bg-blue-600 text-white' : 
                    'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {currentTest?.id === scenario.id ? 'Active' : 'Start Test'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* File Upload Section */}
      {currentTest && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">
              Upload Test File: {currentTest.name}
            </h2>
          </div>
          
          <FileUploader
            onDataImported={handleDataImported}
            onError={handleUploadError}
            expectedColumns={currentTest.expectedColumns}
            title={`Upload ${currentTest.name} File`}
            description={`${currentTest.description}. Expected ${currentTest.expectedRows} rows.`}
          />
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Test Results</h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-600">
                ✓ {testResults.filter(r => r.status === 'success').length} Success
              </span>
              <span className="text-yellow-600">
                ⚠ {testResults.filter(r => r.status === 'warning').length} Warning
              </span>
              <span className="text-red-600">
                ✗ {testResults.filter(r => r.status === 'error').length} Error
              </span>
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className={`p-3 rounded border-l-4 ${
                result.status === 'success' ? 'border-green-400 bg-green-50' :
                result.status === 'warning' ? 'border-yellow-400 bg-yellow-50' :
                result.status === 'error' ? 'border-red-400 bg-red-50' :
                'border-blue-400 bg-blue-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {result.status === 'success' && <CheckCircle className="text-green-600" size={16} />}
                      {result.status === 'warning' && <AlertTriangle className="text-yellow-600" size={16} />}
                      {result.status === 'error' && <XCircle className="text-red-600" size={16} />}
                      {result.status === 'info' && <Eye className="text-blue-600" size={16} />}
                      <span className="font-medium text-gray-900">{result.message}</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {new Date(result.timestamp).toLocaleString()} | Type: {result.type}
                    </div>
                    
                    {/* Show validation details */}
                    {result.details?.validationResults && (
                      <div className="mt-2 space-y-1">
                        {result.details.validationResults.map((validation, vIndex) => (
                          <div key={vIndex} className="text-xs bg-white rounded p-2 border">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{validation.test}</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                validation.status === 'pass' ? 'bg-green-100 text-green-800' :
                                validation.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {validation.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="mt-1 text-gray-600">{validation.message}</div>
                            <div className="mt-1">
                              <div><strong>Expected:</strong> {validation.expected}</div>
                              <div><strong>Actual:</strong> {validation.actual}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {testResults.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Testing Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Click "Generate Test Files" to create sample Excel files for testing</li>
            <li>Select a test scenario from the available options</li>
            <li>Upload the corresponding test file using the file uploader</li>
            <li>Review validation results and data processing outcomes</li>
            <li>Export results for documentation and analysis</li>
          </ol>
          <div className="mt-4 p-3 bg-blue-100 rounded">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Generated test files will be downloaded to your default download folder. 
              Use these files to test different upload scenarios and validate data processing accuracy.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelUploadTester;