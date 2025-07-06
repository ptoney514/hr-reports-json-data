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
  RefreshCw,
  Cloud,
  ExternalLink,
  Trash2
} from 'lucide-react';
import firebaseService from '../../services/FirebaseService';
import { generateWorkforceMetrics } from '../../utils/workforceDataProcessor';
// import hrDatabase from '../../database/HRDatabase';

const ExcelIntegrationDashboard = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [firebaseStatus, setFirebaseStatus] = useState(null);
  const [uploadingToFirebase, setUploadingToFirebase] = useState(false);
  const [clearingDatabase, setClearingDatabase] = useState(false);

  // Enhanced validation with column header normalization and fuzzy matching
  const validateAggregateData = (data) => {
    console.log('validateAggregateData called with:', data);
    
    if (!data || data.length === 0) {
      console.log('No data found');
      return { valid: false, error: 'No data found in file' };
    }

    const requiredColumns = ['Quarter_End_Date', 'Division', 'Location'];
    const columns = Object.keys(data[0] || {});
    console.log('Available columns:', columns);
    console.log('Required columns:', requiredColumns);
    
    // Normalize column headers for comparison
    const normalizeHeader = (header) => {
      return header.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    };
    
    const normalizedAvailable = columns.map(col => ({
      original: col,
      normalized: normalizeHeader(col)
    }));
    
    const normalizedRequired = requiredColumns.map(col => ({
      original: col,
      normalized: normalizeHeader(col)
    }));
    
    console.log('Normalized available:', normalizedAvailable);
    console.log('Normalized required:', normalizedRequired);
    
    // Check for missing columns using fuzzy matching
    const missingColumns = [];
    const foundColumns = [];
    
    normalizedRequired.forEach(required => {
      const found = normalizedAvailable.find(available => 
        available.normalized === required.normalized ||
        available.normalized.includes(required.normalized) ||
        required.normalized.includes(available.normalized)
      );
      
      if (found) {
        foundColumns.push(`${required.original} (found as: ${found.original})`);
      } else {
        missingColumns.push(required.original);
      }
    });
    
    console.log('Found columns:', foundColumns);
    console.log('Missing columns:', missingColumns);

    if (missingColumns.length > 0) {
      console.log('Validation failed - missing columns');
      return { 
        valid: false, 
        error: `Missing required columns: ${missingColumns.join(', ')}. Available columns: ${columns.join(', ')}`,
        foundColumns,
        missingColumns,
        availableColumns: columns
      };
    }

    console.log('Validation passed');
    return { 
      valid: true, 
      totalRows: data.length, 
      totalColumns: columns.length,
      foundColumns,
      availableColumns: columns
    };
  };

  // Convert quarterly aggregate data to individual employee records format for generateWorkforceMetrics
  const convertQuarterlyToEmployeeRecords = (quarterlyRecords) => {
    const employeeRecords = [];
    let empId = 1;

    quarterlyRecords.forEach(record => {
      const { division, location, beFacultyHeadcount, beStaffHeadcount, 
              nbeFacultyHeadcount, nbeStaffHeadcount, nbeStudentWorkerHeadcount } = record;

      // Create individual employee records for each headcount category
      // BE Faculty
      for (let i = 0; i < beFacultyHeadcount; i++) {
        employeeRecords.push({
          id: empId++,
          employeeId: `EMP${empId}`,
          fullName: `Faculty Member ${i + 1}`,
          division: division,
          location: location,
          department: division, // Use division as department
          position: 'Faculty',
          employeeType: 'Faculty',
          employmentStatus: 'Full-time',
          isActive: true,
          hireDate: new Date('2020-01-01'), // Default hire date
          tenure: 4 // Default tenure
        });
      }

      // BE Staff
      for (let i = 0; i < beStaffHeadcount; i++) {
        employeeRecords.push({
          id: empId++,
          employeeId: `EMP${empId}`,
          fullName: `Staff Member ${i + 1}`,
          division: division,
          location: location,
          department: division,
          position: 'Staff',
          employeeType: 'Staff',
          employmentStatus: 'Full-time',
          isActive: true,
          hireDate: new Date('2020-01-01'),
          tenure: 4
        });
      }

      // NBE Faculty
      for (let i = 0; i < nbeFacultyHeadcount; i++) {
        employeeRecords.push({
          id: empId++,
          employeeId: `EMP${empId}`,
          fullName: `NBE Faculty ${i + 1}`,
          division: division,
          location: location,
          department: division,
          position: 'Faculty',
          employeeType: 'Faculty',
          employmentStatus: 'Part-time',
          isActive: true,
          hireDate: new Date('2021-01-01'),
          tenure: 3
        });
      }

      // NBE Staff
      for (let i = 0; i < nbeStaffHeadcount; i++) {
        employeeRecords.push({
          id: empId++,
          employeeId: `EMP${empId}`,
          fullName: `NBE Staff ${i + 1}`,
          division: division,
          location: location,
          department: division,
          position: 'Staff',
          employeeType: 'Staff',
          employmentStatus: 'Part-time',
          isActive: true,
          hireDate: new Date('2021-01-01'),
          tenure: 3
        });
      }

      // NBE Student Workers
      for (let i = 0; i < nbeStudentWorkerHeadcount; i++) {
        employeeRecords.push({
          id: empId++,
          employeeId: `EMP${empId}`,
          fullName: `Student Worker ${i + 1}`,
          division: division,
          location: location,
          department: division,
          position: 'Student Worker',
          employeeType: 'Student',
          employmentStatus: 'Part-time',
          isActive: true,
          hireDate: new Date('2023-01-01'),
          tenure: 1
        });
      }
    });

    console.log(`Generated ${employeeRecords.length} individual employee records from ${quarterlyRecords.length} quarterly records`);
    return employeeRecords;
  };

  // Simple data processing - direct field renaming
  const processAggregateData = (rawData) => {
    return rawData.map(row => ({
      quarterEndDate: row.Quarter_End_Date,
      division: row.Division?.trim() || '',
      location: row.Location?.trim() || '',
      beFacultyHeadcount: parseInt(row.BE_Faculty_Headcount, 10) || 0,
      beStaffHeadcount: parseInt(row.BE_Staff_Headcount, 10) || 0,
      nbeFacultyHeadcount: parseInt(row.NBE_Faculty_Headcount, 10) || 0,
      nbeStaffHeadcount: parseInt(row.NBE_Staff_Headcount, 10) || 0,
      nbeStudentWorkerHeadcount: parseInt(row.NBE_Student_Worker_Headcount, 10) || 0,
      totalHeadcount: parseInt(row.Total_Headcount, 10) || 0,
      beNewHires: parseInt(row.BE_New_Hires, 10) || 0,
      beDepartures: parseInt(row.BE_Departures, 10) || 0,
      nbeNewHires: parseInt(row.NBE_New_Hires, 10) || 0,
      nbeDepartures: parseInt(row.NBE_Departures, 10) || 0
    }));
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

  // Simple validation function
  const validateData = (fileData) => {
    const data = fileData.data;
    const validation = validateAggregateData(data);
    
    if (!validation.valid) {
      return {
        valid: false,
        error: validation.error,
        totalRows: 0,
        totalColumns: 0
      };
    }

    return {
      valid: true,
      totalRows: validation.totalRows,
      totalColumns: validation.totalColumns,
      requiredColumns: 3, // Quarter_End_Date, Division, Location
      optionalColumns: 10, // All the headcount fields
      foundColumns: Object.keys(data[0])
    };
  };


  // Preview file data
  const previewFile = (fileData) => {
    setPreviewData(fileData);
  };


  // Enhanced Firebase upload with proper data transformation
  const uploadToFirebase = async (fileData) => {
    setUploadingToFirebase(true);
    setFirebaseStatus({ status: 'uploading', message: 'Processing and uploading aggregate data to Firebase...' });

    try {
      // Process data with simple approach
      const processedData = processAggregateData(fileData.data);
      
      // Group by quarter
      const quarterlyData = {};
      processedData.forEach(record => {
        const quarter = record.quarterEndDate;
        if (!quarterlyData[quarter]) {
          quarterlyData[quarter] = [];
        }
        quarterlyData[quarter].push(record);
      });
      
      // Upload each quarter's data to Firebase
      let totalUploaded = 0;
      let quartersProcessed = 0;
      
      for (const [quarterDate, quarterRecords] of Object.entries(quarterlyData)) {
        // Convert date to academic quarter period format using the correct mapping
        // Academic calendar: Q4 (June), Q1 (September), Q2 (December), Q3 (March)
        const date = new Date(quarterDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        let period;
        
        // Use the exact mapping from quarterlyDataProcessor.js
        if (quarterDate === '2024-06-30') period = 'Q4-2024';
        else if (quarterDate === '2024-09-30') period = 'Q1-2025';
        else if (quarterDate === '2024-12-31') period = 'Q2-2025';
        else if (quarterDate === '2025-03-31') period = 'Q3-2025';
        else {
          // Fallback for other dates - derive academic quarter
          if (month === 6) period = `Q4-${year}`;
          else if (month === 9) period = `Q1-${year + 1}`;
          else if (month === 12) period = `Q2-${year + 1}`;
          else if (month === 3) period = `Q3-${year}`;
          else {
            console.warn(`Unknown quarter date format: ${quarterDate}`);
            continue;
          }
        }
        
        // Transform quarterly records into dashboard metrics using the workforce data processor
        console.log(`Processing ${quarterRecords.length} records for ${period}`);
        
        // Convert quarterly aggregate data to individual employee records format for processing
        const employeeRecords = convertQuarterlyToEmployeeRecords(quarterRecords);
        
        // Generate dashboard metrics from the employee records
        const dashboardMetrics = generateWorkforceMetrics(employeeRecords, period);
        
        // Upload the processed metrics to Firebase using the correct method
        await firebaseService.setWorkforceMetrics(period, dashboardMetrics);
        
        totalUploaded += quarterRecords.length;
        quartersProcessed++;
        
        console.log(`Successfully uploaded metrics for ${period}`);
      }

      setFirebaseStatus({ 
        status: 'success', 
        message: `Successfully processed and uploaded ${totalUploaded} records across ${quartersProcessed} quarters to Firebase`,
        dataType: 'quarterlyAggregate',
        dashboardLinks: { url: '/dashboards/enhanced-workforce', name: 'Enhanced Workforce Dashboard' }
      });

      // Update file status
      setUploadedFiles(prev => 
        prev.map(f => 
          f.name === fileData.name 
            ? { ...f, status: 'uploaded-firebase', firebaseUploadTime: new Date() }
            : f
        )
      );

    } catch (error) {
      setFirebaseStatus({ 
        status: 'error', 
        message: `Firebase upload failed: ${error.message}` 
      });
    } finally {
      setUploadingToFirebase(false);
    }
  };



  const removeFile = (fileName) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  // Clear Firebase database for testing
  const clearDatabase = async () => {
    if (!window.confirm('Are you sure you want to clear all Firebase data for 2025-Q1? This action cannot be undone.')) {
      return;
    }

    setClearingDatabase(true);
    setFirebaseStatus({ status: 'uploading', message: 'Clearing Firebase database...' });

    try {
      await firebaseService.clearAllDataForPeriod('2025-Q1');
      setFirebaseStatus({ 
        status: 'success', 
        message: 'Successfully cleared all Firebase data for 2025-Q1'
      });
    } catch (error) {
      setFirebaseStatus({ 
        status: 'error', 
        message: `Failed to clear database: ${error.message}` 
      });
    } finally {
      setClearingDatabase(false);
    }
  };


  const getFileStatusIcon = (status) => {
    switch (status) {
      case 'uploaded': return <FileSpreadsheet className="text-blue-500" size={20} />;
      case 'error': return <XCircle className="text-red-500" size={20} />;
      case 'imported': return <CheckCircle className="text-green-500" size={20} />;
      case 'uploaded-firebase': return <Cloud className="text-purple-500" size={20} />;
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
          Upload HR data from Excel files directly to Firebase. 
          Validate data structure, preview contents, and watch dashboards update in real-time.
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

      {/* Database Management */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Database Management</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={clearDatabase}
            disabled={clearingDatabase}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
          >
            <Trash2 size={16} />
            {clearingDatabase ? 'Clearing Database...' : 'Clear Firebase Database'}
          </button>
          <p className="text-sm text-gray-600">
            Clear all Firebase data for 2025-Q1 to test complete data flow from Excel upload.
          </p>
        </div>
      </div>


      {/* Firebase Status */}
      {firebaseStatus && (
        <div className={`rounded-lg border p-4 ${
          firebaseStatus.status === 'success' ? 'bg-purple-50 border-purple-200' :
          firebaseStatus.status === 'error' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {firebaseStatus.status === 'success' && <Cloud className="text-purple-500" size={20} />}
              {firebaseStatus.status === 'error' && <XCircle className="text-red-500" size={20} />}
              {firebaseStatus.status === 'uploading' && <RefreshCw className="text-blue-500 animate-spin" size={20} />}
              <span className={`font-medium ${
                firebaseStatus.status === 'success' ? 'text-purple-700' :
                firebaseStatus.status === 'error' ? 'text-red-700' :
                'text-blue-700'
              }`}>
                {firebaseStatus.message}
              </span>
            </div>
            
            {firebaseStatus.status === 'success' && firebaseStatus.dashboardLinks && (
              <a
                href={firebaseStatus.dashboardLinks.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
              >
                <ExternalLink size={14} />
                View {firebaseStatus.dashboardLinks.name}
              </a>
            )}
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
                        
                        <button
                          onClick={() => {
                            console.log('Starting validation with fileData:', fileData.data);
                            const validation = validateData(fileData);
                            console.log('Validation result:', validation);
                            setValidationResults({ ...validation, dataType: 'quarterlyAggregate', fileData });
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white hover:bg-green-700 rounded text-sm"
                        >
                          <CheckCircle size={16} />
                          Validate Aggregate Data
                        </button>
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

            {validationResults.error && (
              <div className="mt-3">
                <p className="text-red-700 font-medium">Validation Error:</p>
                <p className="text-red-600 text-sm">{validationResults.error}</p>
                
                {validationResults.foundColumns && validationResults.foundColumns.length > 0 && (
                  <div className="mt-2">
                    <p className="text-green-700 font-medium text-sm">Found Columns:</p>
                    <ul className="text-green-600 text-xs ml-4">
                      {validationResults.foundColumns.map((col, index) => (
                        <li key={index}>• {col}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {validationResults.missingColumns && validationResults.missingColumns.length > 0 && (
                  <div className="mt-2">
                    <p className="text-red-700 font-medium text-sm">Missing Columns:</p>
                    <ul className="text-red-600 text-xs ml-4">
                      {validationResults.missingColumns.map((col, index) => (
                        <li key={index}>• {col}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {validationResults.valid && validationResults.foundColumns && (
              <div className="mt-3">
                <p className="text-green-700 font-medium text-sm">Required Columns Found:</p>
                <ul className="text-green-600 text-xs ml-4">
                  {validationResults.foundColumns.map((col, index) => (
                    <li key={index}>• {col}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {validationResults.valid && (
            <button
              onClick={() => uploadToFirebase(validationResults.fileData)}
              disabled={uploadingToFirebase}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium shadow-sm hover:shadow-md transition-all"
            >
              <Cloud size={18} />
              {uploadingToFirebase ? 'Uploading to Firebase...' : 'Upload to Enhanced Workforce Dashboard'}
            </button>
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
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Quarterly Aggregate Data Requirements</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Required Columns:</h4>
            <div className="text-sm space-y-1">
              <p className="text-blue-700">
                <strong>Quarter_End_Date, Division, Location, BE_Faculty_Headcount, BE_Staff_Headcount, 
                NBE_Faculty_Headcount, NBE_Staff_Headcount, NBE_Student_Worker_Headcount</strong>
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Optional Columns:</h4>
            <div className="text-sm space-y-1">
              <p className="text-blue-600">
                <strong>Total_Headcount, BE_New_Hires, BE_Departures, NBE_New_Hires, NBE_Departures</strong>
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-blue-800 mb-2">Data Structure:</h4>
            <div className="text-sm space-y-1">
              <p className="text-blue-700">• Each row represents one Division + Location combination for a specific quarter</p>
              <p className="text-blue-700">• BE = Benefit Eligible employees (full compensation package)</p>
              <p className="text-blue-700">• NBE = Non-Benefit Eligible employees (limited/no benefits)</p>
              <p className="text-blue-700">• Use aggregate totals directly from Oracle HCM reports</p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-green-100 rounded">
          <p className="text-sm text-green-800">
            <strong>Template Available:</strong> Download the HR_Quarterly_Data_Template.csv from the 
            <code className="bg-green-200 px-1 rounded">/public/templates/</code> folder for the correct format.
          </p>
        </div>

        <div className="mt-2 p-3 bg-blue-100 rounded">
          <p className="text-sm text-blue-800">
            <strong>Firebase Integration:</strong> Processed data uploads directly to Enhanced Workforce Dashboard. 
            All quarterly metrics and visualizations update automatically.
          </p>
        </div>

        <div className="mt-2 p-3 bg-blue-100 rounded">
          <p className="text-sm text-blue-800">
            <strong>Tips:</strong> Quarter dates must be YYYY-MM-DD format (2024-06-30, 2024-09-30, etc.). 
            All headcount fields should be numeric. Use 0 for empty values.
          </p>
        </div>
      </div>

    </div>
  );
};

export default ExcelIntegrationDashboard; 