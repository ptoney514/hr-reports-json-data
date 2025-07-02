import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye,
  Database,
  RefreshCw
} from 'lucide-react';
// import hrDatabase from '../database/HRDatabase';

const ExcelIntegrationDashboard = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [currentDatabaseData, setCurrentDatabaseData] = useState(null);
  const [loadingDatabaseData, setLoadingDatabaseData] = useState(false);

  // Expected column mappings for different data types
  const columnMappings = {
    workforce: {
      required: ['Employee_ID', 'Name', 'Department', 'Position', 'Hire_Date'],
      optional: ['Salary', 'Grade', 'Status', 'Location', 'Manager']
    },
    turnover: {
      required: ['Employee_ID', 'Name', 'Department', 'Departure_Date', 'Reason'],
      optional: ['Tenure_Years', 'Exit_Interview', 'Voluntary', 'Cost_Impact']
    }
  };

  // File upload handler
  const onDrop = useCallback(async (acceptedFiles) => {
    setProcessing(true);
    const newFiles = [];

    for (const file of acceptedFiles) {
      try {
        const fileData = {
          file,
          name: file.name,
          size: file.size,
          uploadTime: new Date(),
          status: 'uploaded',
          data: null,
          validation: null
        };

        // Read Excel file
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        fileData.data = jsonData;
        fileData.sheetNames = workbook.SheetNames;
        fileData.rowCount = jsonData.length;
        fileData.columnCount = Object.keys(jsonData[0] || {}).length;

        newFiles.push(fileData);
      } catch (error) {
        newFiles.push({
          file,
          name: file.name,
          size: file.size,
          uploadTime: new Date(),
          status: 'error',
          error: error.message
        });
      }
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setProcessing(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: true
  });

  // Validate data structure
  const validateData = (fileData, dataType) => {
    const mapping = columnMappings[dataType];
    if (!mapping) return { valid: false, error: 'Unknown data type' };

    const data = fileData.data;
    if (!data || data.length === 0) {
      return { valid: false, error: 'No data found in file' };
    }

    const columns = Object.keys(data[0]);
    const missingRequired = mapping.required.filter(col => !columns.includes(col));
    const extraColumns = columns.filter(col => 
      !mapping.required.includes(col) && !mapping.optional.includes(col)
    );

    const validation = {
      valid: missingRequired.length === 0,
      totalRows: data.length,
      totalColumns: columns.length,
      requiredColumns: mapping.required.length,
      optionalColumns: mapping.optional.length,
      missingRequired,
      extraColumns,
      foundColumns: columns,
      dataQuality: analyzeDataQuality(data, mapping)
    };

    return validation;
  };

  // Analyze data quality
  const analyzeDataQuality = (data, mapping) => {
    const issues = [];
    const stats = {
      emptyRows: 0,
      duplicateIds: 0,
      invalidDates: 0,
      missingRequiredData: 0
    };

    const seenIds = new Set();

    data.forEach((row, index) => {
      // Check for empty rows
      const hasData = Object.values(row).some(value => value !== null && value !== '');
      if (!hasData) stats.emptyRows++;

      // Check for duplicate IDs
      if (row.Employee_ID) {
        if (seenIds.has(row.Employee_ID)) {
          stats.duplicateIds++;
        } else {
          seenIds.add(row.Employee_ID);
        }
      }

      // Check required fields
      mapping.required.forEach(field => {
        if (!row[field] || row[field] === '') {
          stats.missingRequiredData++;
        }
      });

      // Validate dates
      ['Hire_Date', 'Departure_Date'].forEach(dateField => {
        if (row[dateField] && !isValidDate(row[dateField])) {
          stats.invalidDates++;
        }
      });
    });

    return { stats, issues };
  };

  const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  };

  // Preview file data
  const previewFile = (fileData) => {
    setPreviewData(fileData);
  };

  // Import data to database
  const importToDatabase = async (fileData, dataType) => {
    setProcessing(true);
    setImportStatus({ status: 'importing', message: 'Importing data to database...' });

    try {
      // Dynamic import to avoid build issues
      const { default: hrDatabase } = await import('../database/HRDatabase.js');
      await hrDatabase.initialize();

      if (dataType === 'workforce') {
        // Transform and import workforce data
        const transformedData = transformWorkforceData(fileData.data);
        await hrDatabase.updateWorkforceData(transformedData);
      } else if (dataType === 'turnover') {
        // Transform and import turnover data
        const transformedData = transformTurnoverData(fileData.data);
        await hrDatabase.updateTurnoverData(transformedData);
      }

      setImportStatus({ 
        status: 'success', 
        message: `Successfully imported ${fileData.data.length} records` 
      });

      // Update file status
      setUploadedFiles(prev => 
        prev.map(f => 
          f.name === fileData.name 
            ? { ...f, status: 'imported', importTime: new Date() }
            : f
        )
      );

      // Refresh database data to show updated information
      loadCurrentDatabaseData();

    } catch (error) {
      setImportStatus({ 
        status: 'error', 
        message: `Import failed: ${error.message}` 
      });
    } finally {
      setProcessing(false);
    }
  };

  // Transform workforce data to match our schema
  const transformWorkforceData = (data) => {
    return {
      metadata: {
        reportingPeriod: "Q2-2025",
        generatedDate: new Date().toISOString(),
        dataSource: "Excel Import",
        lastUpdated: new Date().toISOString(),
        currency: "USD",
        organization: "University System"
      },
      currentPeriod: {
        quarter: "Q2-2025",
        startDate: "2025-01-01",
        endDate: "2025-03-31",
        headcount: {
          total: data.length,
          faculty: data.filter(row => row.Position?.toLowerCase().includes('faculty')).length,
          staff: data.filter(row => row.Position?.toLowerCase().includes('staff')).length,
          students: data.filter(row => row.Position?.toLowerCase().includes('student')).length
        },
        locations: getLocationBreakdown(data),
        topDivisions: getDivisionBreakdown(data)
      },
      rawData: data
    };
  };

  // Transform turnover data to match our schema
  const transformTurnoverData = (data) => {
    return {
      metadata: {
        fiscalYear: "FY2024",
        reportingPeriod: "FY2024 YTD",
        generatedDate: new Date().toISOString(),
        dataSource: "Excel Import",
        lastUpdated: new Date().toISOString(),
        organization: "University System"
      },
      currentFiscalYear: {
        period: "FY2024 YTD",
        startDate: "2023-07-01",
        endDate: "2024-03-31",
        overallTurnover: {
          totalDepartures: data.length,
          averageHeadcount: data.length * 1.2, // Estimate
          annualizedTurnoverRate: calculateTurnoverRate(data)
        },
        turnoverByCategory: getTurnoverByCategory(data),
        voluntaryTurnoverReasons: getReasonBreakdown(data)
      },
      rawData: data
    };
  };

  const getLocationBreakdown = (data) => {
    const locations = {};
    data.forEach(row => {
      const location = row.Location || 'Unknown';
      locations[location] = (locations[location] || 0) + 1;
    });
    return Object.entries(locations).map(([name, count]) => ({ name, count }));
  };

  const getDivisionBreakdown = (data) => {
    const divisions = {};
    data.forEach(row => {
      const department = row.Department || 'Unknown';
      divisions[department] = (divisions[department] || 0) + 1;
    });
    return Object.entries(divisions)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const getTurnoverByCategory = (data) => {
    const categories = {};
    data.forEach(row => {
      const category = row.Category || 'Unknown';
      categories[category] = (categories[category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, count]) => ({ name, count }));
  };

  const getReasonBreakdown = (data) => {
    const reasons = {};
    data.forEach(row => {
      const reason = row.Reason || 'Unknown';
      reasons[reason] = (reasons[reason] || 0) + 1;
    });
    return Object.entries(reasons).map(([name, value]) => ({ name, value }));
  };

  const calculateTurnoverRate = (data) => {
    // Simple calculation - in real implementation, this would be more sophisticated
    return Math.round((data.length / (data.length * 1.2)) * 100 * 100) / 100;
  };

  const removeFile = (fileName) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  // Load current database data
  const loadCurrentDatabaseData = async () => {
    setLoadingDatabaseData(true);
    try {
      // Dynamic import to avoid build issues
      const { default: hrDatabase } = await import('../database/HRDatabase.js');
      await hrDatabase.initialize();
      
      const workforceData = await hrDatabase.getWorkforceData();
      const turnoverData = await hrDatabase.getTurnoverData();
      
      setCurrentDatabaseData({
        workforce: workforceData,
        turnover: turnoverData,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error loading database data:', error);
      setCurrentDatabaseData({
        error: error.message,
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setLoadingDatabaseData(false);
    }
  };

  // Load database data on component mount
  React.useEffect(() => {
    loadCurrentDatabaseData();
  }, []);

  const getFileStatusIcon = (status) => {
    switch (status) {
      case 'uploaded': return <FileSpreadsheet className="text-blue-500" size={20} />;
      case 'error': return <XCircle className="text-red-500" size={20} />;
      case 'imported': return <CheckCircle className="text-green-500" size={20} />;
      default: return <FileSpreadsheet className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="text-blue-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Excel Integration Dashboard</h1>
        </div>
        <p className="text-gray-600">
          Upload and import workforce and turnover data from Excel files. 
          Validate data structure, preview contents, and integrate with the HR database.
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Excel Files</h2>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto text-gray-400 mb-4" size={48} />
          {isDragActive ? (
            <p className="text-blue-600 font-medium">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-gray-600 font-medium mb-2">
                Drag & drop Excel files here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supports .xlsx, .xls, and .csv files
              </p>
            </div>
          )}
        </div>

        {processing && (
          <div className="mt-4 flex items-center gap-2 text-blue-600">
            <RefreshCw className="animate-spin" size={16} />
            <span>Processing files...</span>
          </div>
        )}
      </div>

      {/* Import Status */}
      {importStatus && (
        <div className={`rounded-lg border p-4 ${
          importStatus.status === 'success' ? 'bg-green-50 border-green-200' :
          importStatus.status === 'error' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            {importStatus.status === 'success' && <CheckCircle className="text-green-500" size={20} />}
            {importStatus.status === 'error' && <XCircle className="text-red-500" size={20} />}
            {importStatus.status === 'importing' && <RefreshCw className="text-blue-500 animate-spin" size={20} />}
            <span className={`font-medium ${
              importStatus.status === 'success' ? 'text-green-700' :
              importStatus.status === 'error' ? 'text-red-700' :
              'text-blue-700'
            }`}>
              {importStatus.message}
            </span>
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
          
          <div className="space-y-4">
            {uploadedFiles.map((fileData, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getFileStatusIcon(fileData.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">{fileData.name}</h3>
                      <p className="text-sm text-gray-500">
                        {(fileData.size / 1024).toFixed(1)} KB • 
                        {fileData.rowCount ? ` ${fileData.rowCount} rows` : ''} • 
                        Uploaded {fileData.uploadTime.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {fileData.data && (
                      <>
                        <button
                          onClick={() => previewFile(fileData)}
                          className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Eye size={16} />
                          Preview
                        </button>
                        
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              const validation = validateData(fileData, e.target.value);
                              setValidationResults({ ...validation, dataType: e.target.value, fileData });
                            }
                          }}
                          className="px-3 py-1 border rounded text-sm"
                        >
                          <option value="">Select Data Type</option>
                          <option value="workforce">Workforce Data</option>
                          <option value="turnover">Turnover Data</option>
                        </select>
                      </>
                    )}
                    
                    <button
                      onClick={() => removeFile(fileData.name)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </div>

                {fileData.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-700 text-sm">{fileData.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Results */}
      {validationResults && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Validation Results</h2>
          
          <div className={`rounded-lg border p-4 mb-4 ${
            validationResults.valid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {validationResults.valid ? (
                <CheckCircle className="text-green-500" size={20} />
              ) : (
                <AlertTriangle className="text-yellow-500" size={20} />
              )}
              <span className={`font-medium ${
                validationResults.valid ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {validationResults.valid ? 'Data structure is valid' : 'Data structure has issues'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Rows:</span>
                <div className="font-medium">{validationResults.totalRows}</div>
              </div>
              <div>
                <span className="text-gray-600">Total Columns:</span>
                <div className="font-medium">{validationResults.totalColumns}</div>
              </div>
              <div>
                <span className="text-gray-600">Required Columns:</span>
                <div className="font-medium">{validationResults.requiredColumns}</div>
              </div>
              <div>
                <span className="text-gray-600">Optional Columns:</span>
                <div className="font-medium">{validationResults.optionalColumns}</div>
              </div>
            </div>

            {validationResults.missingRequired.length > 0 && (
              <div className="mt-3">
                <p className="text-yellow-700 font-medium">Missing Required Columns:</p>
                <p className="text-yellow-600 text-sm">{validationResults.missingRequired.join(', ')}</p>
              </div>
            )}

            {validationResults.extraColumns.length > 0 && (
              <div className="mt-3">
                <p className="text-blue-700 font-medium">Extra Columns Found:</p>
                <p className="text-blue-600 text-sm">{validationResults.extraColumns.join(', ')}</p>
              </div>
            )}
          </div>

          {validationResults.valid && (
            <div className="flex gap-2">
              <button
                onClick={() => importToDatabase(validationResults.fileData, validationResults.dataType)}
                disabled={processing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                <Database size={16} />
                {processing ? 'Importing...' : 'Import to Database'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Data Preview */}
      {previewData && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Data Preview: {previewData.name}</h2>
            <button
              onClick={() => setPreviewData(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle size={20} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(previewData.data[0] || {}).map((column, index) => (
                    <th key={index} className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.data.slice(0, 10).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {Object.values(row).map((value, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900 border-b">
                        {String(value || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {previewData.data.length > 10 && (
            <p className="text-sm text-gray-500 mt-2">
              Showing first 10 rows of {previewData.data.length} total rows
            </p>
          )}
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Excel File Requirements</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Workforce Data Columns:</h4>
            <div className="text-sm space-y-1">
              <p className="text-blue-700"><strong>Required:</strong> Employee_ID, Name, Department, Position, Hire_Date</p>
              <p className="text-blue-600"><strong>Optional:</strong> Salary, Grade, Status, Location, Manager</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Turnover Data Columns:</h4>
            <div className="text-sm space-y-1">
              <p className="text-blue-700"><strong>Required:</strong> Employee_ID, Name, Department, Departure_Date, Reason</p>
              <p className="text-blue-600"><strong>Optional:</strong> Tenure_Years, Exit_Interview, Voluntary, Cost_Impact</p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-100 rounded">
          <p className="text-sm text-blue-800">
            <strong>Tips:</strong> Ensure your Excel file has column headers in the first row. 
            Date columns should be in a standard format (MM/DD/YYYY or YYYY-MM-DD). 
            Remove any empty rows or columns before uploading.
          </p>
        </div>
      </div>

      {/* Current Database Data */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Current Database Data</h3>
          <button
            onClick={loadCurrentDatabaseData}
            disabled={loadingDatabaseData}
            className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
          >
            <RefreshCw className={loadingDatabaseData ? 'animate-spin' : ''} size={16} />
            {loadingDatabaseData ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {loadingDatabaseData ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="animate-spin text-blue-500" size={24} />
            <span className="ml-2 text-gray-600">Loading database data...</span>
          </div>
        ) : currentDatabaseData?.error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <XCircle className="text-red-500" size={20} />
              <span className="text-red-700 font-medium">Error Loading Database Data</span>
            </div>
            <p className="text-red-600 mt-2">{currentDatabaseData.error}</p>
          </div>
        ) : currentDatabaseData ? (
          <div className="space-y-6">
            {/* Workforce Data Summary */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Database size={16} className="text-blue-600" />
                Workforce Data
              </h4>
              
              {currentDatabaseData.workforce ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-blue-50 rounded p-3">
                    <span className="text-blue-600 font-medium">Total Headcount</span>
                    <div className="text-2xl font-bold text-blue-800">
                      {currentDatabaseData.workforce.currentPeriod?.headcount?.total || 0}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded p-3">
                    <span className="text-green-600 font-medium">Faculty</span>
                    <div className="text-2xl font-bold text-green-800">
                      {currentDatabaseData.workforce.currentPeriod?.headcount?.faculty || 0}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded p-3">
                    <span className="text-purple-600 font-medium">Staff</span>
                    <div className="text-2xl font-bold text-purple-800">
                      {currentDatabaseData.workforce.currentPeriod?.headcount?.staff || 0}
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded p-3">
                    <span className="text-orange-600 font-medium">Students</span>
                    <div className="text-2xl font-bold text-orange-800">
                      {currentDatabaseData.workforce.currentPeriod?.headcount?.students || 0}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  No workforce data available
                </div>
              )}

              {currentDatabaseData.workforce?.currentPeriod?.topDivisions && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Top Divisions</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {currentDatabaseData.workforce.currentPeriod.topDivisions.slice(0, 6).map((division, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 rounded px-3 py-2">
                        <span className="text-gray-700">{division.name}</span>
                        <span className="font-medium text-gray-900">{division.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Turnover Data Summary */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Database size={16} className="text-red-600" />
                Turnover Data
              </h4>
              
              {currentDatabaseData.turnover ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-red-50 rounded p-3">
                    <span className="text-red-600 font-medium">Total Departures</span>
                    <div className="text-2xl font-bold text-red-800">
                      {currentDatabaseData.turnover.currentFiscalYear?.overallTurnover?.totalDepartures || 0}
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded p-3">
                    <span className="text-yellow-600 font-medium">Turnover Rate</span>
                    <div className="text-2xl font-bold text-yellow-800">
                      {currentDatabaseData.turnover.currentFiscalYear?.overallTurnover?.annualizedTurnoverRate || 0}%
                    </div>
                  </div>
                  <div className="bg-indigo-50 rounded p-3">
                    <span className="text-indigo-600 font-medium">Avg Headcount</span>
                    <div className="text-2xl font-bold text-indigo-800">
                      {currentDatabaseData.turnover.currentFiscalYear?.overallTurnover?.averageHeadcount || 0}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  No turnover data available
                </div>
              )}

              {currentDatabaseData.turnover?.currentFiscalYear?.voluntaryTurnoverReasons && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Top Turnover Reasons</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {currentDatabaseData.turnover.currentFiscalYear.voluntaryTurnoverReasons.slice(0, 6).map((reason, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 rounded px-3 py-2">
                        <span className="text-gray-700">{reason.name}</span>
                        <span className="font-medium text-gray-900">{reason.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Data Metadata */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Data Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Workforce Period:</span>
                  <div className="font-medium">{currentDatabaseData.workforce?.currentPeriod?.quarter || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-600">Turnover Period:</span>
                  <div className="font-medium">{currentDatabaseData.turnover?.currentFiscalYear?.period || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-600">Last Refreshed:</span>
                  <div className="font-medium">{new Date(currentDatabaseData.lastUpdated).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            Click refresh to load current database data
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelIntegrationDashboard; 