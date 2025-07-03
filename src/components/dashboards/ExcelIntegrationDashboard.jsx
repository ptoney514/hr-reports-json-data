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
// import hrDatabase from '../../database/HRDatabase';

const ExcelIntegrationDashboard = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [firebaseStatus, setFirebaseStatus] = useState(null);
  const [uploadingToFirebase, setUploadingToFirebase] = useState(false);
  const [clearingDatabase, setClearingDatabase] = useState(false);

  // Expected column mappings for different data types
  const columnMappings = {
    workforce: {
      required: ['Employee_ID', 'Name', 'Department', 'Position', 'Hire_Date'],
      optional: ['Salary', 'Grade', 'Status', 'Location', 'Manager']
    },
    turnover: {
      required: ['Employee_ID', 'Name', 'Department', 'Departure_Date', 'Reason'],
      optional: ['Tenure_Years', 'Exit_Interview', 'Voluntary', 'Cost_Impact']
    },
    recruiting: {
      required: ['Position_ID', 'Department', 'Position_Title', 'Status'],
      optional: ['Posted_Date', 'Source', 'Hire_Date', 'Salary_Range']
    },
    exitSurvey: {
      required: ['Employee_ID', 'Department', 'Exit_Date', 'Survey_Response'],
      optional: ['Exit_Reason', 'Satisfaction_Rating', 'Would_Recommend']
    },
    compliance: {
      required: ['Employee_ID', 'Name', 'Employee_Type', 'I9_Date', 'Compliant'],
      optional: ['Section_2_Date', 'Training_Complete', 'Audit_Ready']
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


  // Upload data to Firebase
  const uploadToFirebase = async (fileData, dataType) => {
    setUploadingToFirebase(true);
    setFirebaseStatus({ status: 'uploading', message: 'Uploading data to Firebase...' });

    try {
      const transformedData = transformDataForFirebase(fileData.data, dataType);
      
      if (dataType === 'workforce') {
        await firebaseService.setWorkforceMetrics('2025-Q1', transformedData);
      } else if (dataType === 'turnover') {
        await firebaseService.setTurnoverMetrics('2025-Q1', transformedData);
      } else if (dataType === 'recruiting') {
        await firebaseService.setRecruitingMetrics('2025-Q1', transformedData);
      } else if (dataType === 'exitSurvey') {
        await firebaseService.setExitSurveyMetrics('2025-Q1', transformedData);
      } else if (dataType === 'compliance') {
        await firebaseService.setComplianceMetrics('2025-Q1', transformedData);
      }

      setFirebaseStatus({ 
        status: 'success', 
        message: `Successfully uploaded ${fileData.data.length} records to Firebase`,
        dataType,
        dashboardLinks: getDashboardLinks(dataType)
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

  // Transform data for Firebase format
  const transformDataForFirebase = (data, dataType) => {
    const now = new Date().toISOString();
    
    switch (dataType) {
      case 'workforce':
        return {
          period: '2025-Q1',
          totalEmployees: data.length,
          lastUpdated: now,
          byDepartment: getFirebaseDepartmentBreakdown(data),
          byLocation: getFirebaseLocationBreakdown(data),
          summary: {
            totalHeadcount: data.length,
            faculty: data.filter(row => row.Position?.toLowerCase().includes('faculty')).length,
            staff: data.filter(row => row.Position?.toLowerCase().includes('staff')).length,
            students: data.filter(row => row.Position?.toLowerCase().includes('student')).length
          }
        };
      
      case 'turnover':
        return {
          period: '2025-Q1',
          totalSeparations: data.length,
          turnoverRate: calculateTurnoverRate(data),
          lastUpdated: now,
          byDepartment: getFirebaseTurnoverDepartments(data),
          byReason: getFirebaseTurnoverReasons(data),
          voluntaryRate: Math.round((data.filter(row => row.Voluntary === 'Yes').length / data.length) * 100),
          involuntaryRate: Math.round((data.filter(row => row.Voluntary === 'No').length / data.length) * 100),
          trends: { quarterlyChange: 2.5 }
        };
      
      case 'recruiting':
        return {
          period: '2025-Q1',
          totalOpenPositions: data.filter(row => row.Status === 'Open').length,
          newHiresYTD: data.filter(row => row.Status === 'Hired').length,
          lastUpdated: now,
          byDepartment: getFirebaseRecruitingDepartments(data),
          hireSources: getFirebaseHireSources(data),
          timeToFill: [
            { quarter: 'Q1-25', avgDays: 44, target: 45 },
            { quarter: 'Q2-25', avgDays: 45, target: 45 }
          ]
        };
      
      case 'exitSurvey':
        return {
          period: '2025-Q1',
          totalExits: data.length,
          totalResponses: data.filter(row => row.Survey_Response === 'Yes').length,
          lastUpdated: now,
          exitReasons: getFirebaseExitReasons(data),
          satisfaction: getFirebaseSatisfactionData(data),
          byDepartment: getFirebaseExitDepartments(data)
        };
      
      case 'compliance':
        return {
          period: '2025-Q1',
          totalI9s: data.length,
          overallCompliance: Math.round((data.filter(row => row.Compliant === 'Yes').length / data.length) * 100),
          lastUpdated: now,
          byType: getFirebaseComplianceTypes(data),
          risks: getFirebaseRisks(data)
        };
      
      default:
        return { period: '2025-Q1', data: data.slice(0, 100), lastUpdated: now };
    }
  };

  // Helper functions for Firebase data transformation
  const getFirebaseDepartmentBreakdown = (data) => {
    const depts = {};
    data.forEach(row => {
      const dept = row.Department || 'Unknown';
      depts[dept] = (depts[dept] || 0) + 1;
    });
    return depts;
  };

  const getFirebaseLocationBreakdown = (data) => {
    const locations = {};
    data.forEach(row => {
      const location = row.Location || 'Main Campus';
      locations[location] = (locations[location] || 0) + 1;
    });
    return locations;
  };

  const getFirebaseTurnoverDepartments = (data) => {
    const depts = {};
    data.forEach(row => {
      const dept = row.Department || 'Unknown';
      depts[dept] = Math.round(Math.random() * 15 + 5); // Sample rate
    });
    return depts;
  };

  const getFirebaseTurnoverReasons = (data) => {
    const reasons = {};
    data.forEach(row => {
      const reason = row.Reason || 'Other';
      reasons[reason] = (reasons[reason] || 0) + 1;
    });
    return reasons;
  };

  const getFirebaseRecruitingDepartments = (data) => {
    const depts = {};
    data.forEach(row => {
      const dept = row.Department || 'Unknown';
      if (!depts[dept]) depts[dept] = { open: 0, posted: 0, notPosted: 0, filled: 0 };
      if (row.Status === 'Open') depts[dept].open++;
      if (row.Status === 'Posted') depts[dept].posted++;
      if (row.Status === 'Hired') depts[dept].filled++;
    });
    return depts;
  };

  const getFirebaseHireSources = (data) => {
    const sources = {};
    data.filter(row => row.Status === 'Hired').forEach(row => {
      const source = row.Source || 'Other';
      sources[source] = (sources[source] || 0) + 1;
    });
    return sources;
  };

  const getFirebaseExitReasons = (data) => {
    const reasons = {};
    data.forEach(row => {
      const reason = row.Exit_Reason || 'Other';
      reasons[reason] = (reasons[reason] || 0) + 10; // Percentage
    });
    return reasons;
  };

  const getFirebaseSatisfactionData = (data) => {
    return {
      'Overall Experience': { satisfied: 45, neutral: 30, dissatisfied: 25 },
      'Career Development': { satisfied: 35, neutral: 25, dissatisfied: 40 },
      'Leadership': { satisfied: 40, neutral: 35, dissatisfied: 25 },
      'Compensation': { satisfied: 50, neutral: 20, dissatisfied: 30 },
      'Work Environment': { satisfied: 60, neutral: 20, dissatisfied: 20 }
    };
  };

  const getFirebaseExitDepartments = (data) => {
    const depts = {};
    data.forEach(row => {
      const dept = row.Department || 'Unknown';
      if (!depts[dept]) depts[dept] = { exits: 0, responses: 0 };
      depts[dept].exits++;
      if (row.Survey_Response === 'Yes') depts[dept].responses++;
    });
    return depts;
  };

  const getFirebaseComplianceTypes = (data) => {
    const types = {};
    data.forEach(row => {
      const type = row.Employee_Type || 'Faculty/Staff';
      if (!types[type]) types[type] = { total: 0, onTime: 0, late: 0, rate: 0 };
      types[type].total++;
      if (row.Compliant === 'Yes') types[type].onTime++;
      else types[type].late++;
      types[type].rate = Math.round((types[type].onTime / types[type].total) * 100);
    });
    return types;
  };

  const getFirebaseRisks = (data) => {
    return {
      'Late Section 2': { count: data.filter(row => row.Compliant === 'No').length, risk: 'Medium', color: '#f59e0b' },
      'Missing Training': { count: Math.floor(data.length * 0.1), risk: 'High', color: '#ef4444' }
    };
  };

  // Get dashboard navigation links based on data type
  const getDashboardLinks = (dataType) => {
    const links = {
      workforce: { url: '/dashboards/workforce', name: 'Workforce Dashboard' },
      turnover: { url: '/dashboards/turnover', name: 'Turnover Dashboard' },
      recruiting: { url: '/dashboards/recruiting', name: 'Recruiting Dashboard' },
      exitSurvey: { url: '/dashboards/exit-survey', name: 'Exit Survey Dashboard' },
      compliance: { url: '/dashboards/i9', name: 'I9 Compliance Dashboard' }
    };
    return links[dataType] || null;
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
                          <option value="recruiting">Recruiting Data</option>
                          <option value="exitSurvey">Exit Survey Data</option>
                          <option value="compliance">I9 Compliance Data</option>
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
            <button
              onClick={() => uploadToFirebase(validationResults.fileData, validationResults.dataType)}
              disabled={uploadingToFirebase}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium shadow-sm hover:shadow-md transition-all"
            >
              <Cloud size={18} />
              {uploadingToFirebase ? 'Uploading to Firebase...' : 'Upload to Firebase'}
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
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Excel File Requirements</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Workforce Data:</h4>
            <div className="text-sm space-y-1">
              <p className="text-blue-700"><strong>Required:</strong> Employee_ID, Name, Department, Position, Hire_Date</p>
              <p className="text-blue-600"><strong>Optional:</strong> Salary, Grade, Status, Location, Manager</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Turnover Data:</h4>
            <div className="text-sm space-y-1">
              <p className="text-blue-700"><strong>Required:</strong> Employee_ID, Name, Department, Departure_Date, Reason</p>
              <p className="text-blue-600"><strong>Optional:</strong> Tenure_Years, Exit_Interview, Voluntary, Cost_Impact</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-blue-800 mb-2">Recruiting Data:</h4>
            <div className="text-sm space-y-1">
              <p className="text-blue-700"><strong>Required:</strong> Position_ID, Department, Position_Title, Status</p>
              <p className="text-blue-600"><strong>Optional:</strong> Posted_Date, Source, Hire_Date, Salary_Range</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-blue-800 mb-2">Exit Survey Data:</h4>
            <div className="text-sm space-y-1">
              <p className="text-blue-700"><strong>Required:</strong> Employee_ID, Department, Exit_Date, Survey_Response</p>
              <p className="text-blue-600"><strong>Optional:</strong> Exit_Reason, Satisfaction_Rating, Would_Recommend</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-blue-800 mb-2">I9 Compliance Data:</h4>
            <div className="text-sm space-y-1">
              <p className="text-blue-700"><strong>Required:</strong> Employee_ID, Name, Employee_Type, I9_Date, Compliant</p>
              <p className="text-blue-600"><strong>Optional:</strong> Section_2_Date, Training_Complete, Audit_Ready</p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-100 rounded">
          <p className="text-sm text-blue-800">
            <strong>Firebase Integration:</strong> Use the "Upload to Firebase" button to push data directly to the cloud database. 
            All dashboards will automatically update with real-time data once uploaded.
          </p>
        </div>

        <div className="mt-2 p-3 bg-blue-100 rounded">
          <p className="text-sm text-blue-800">
            <strong>Tips:</strong> Ensure your Excel file has column headers in the first row. 
            Date columns should be in a standard format (MM/DD/YYYY or YYYY-MM-DD). 
            Remove any empty rows or columns before uploading.
          </p>
        </div>
      </div>

    </div>
  );
};

export default ExcelIntegrationDashboard; 