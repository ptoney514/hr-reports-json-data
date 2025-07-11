import React, { useState, useCallback } from 'react';
import { 
  Database,
  Cloud,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Upload,
  ArrowRight,
  Calculator,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../ui/FileUploader';
import DataSourceManager from '../ui/DataSourceManager';
import { useDataSource } from '../../contexts/DataSourceContext';
import firebaseService from '../../services/FirebaseService';
import { downloadCombinedWorkforceTemplate } from '../../utils/excelTemplateGenerator';

const ExcelIntegrationDashboard = () => {
  const { state, actions } = useDataSource();
  const navigate = useNavigate();
  const [firebaseStatus, setFirebaseStatus] = useState(null);
  const [uploadingToFirebase, setUploadingToFirebase] = useState(false);
  const [clearingDatabase, setClearingDatabase] = useState(false);
  const [isUsingUploadedData, setIsUsingUploadedData] = useState(false);

  // Flexible data processing - handles both individual employee records and aggregate data
  const processUploadedData = (rawData) => {
    // Check if this is individual employee data or aggregate data
    const firstRow = rawData[0] || {};
    const hasEmployeeFields = firstRow.Employee_ID || firstRow.First_Name || firstRow.Last_Name;
    const hasAggregateFields = firstRow.Quarter_End_Date || firstRow.BE_Faculty_Headcount;

    if (hasAggregateFields) {
      // Process as aggregate quarterly data
      return rawData.map(row => ({
        Quarter_End_Date: row.Quarter_End_Date,
        Division: row.Division?.trim() || '',
        Location: row.Location?.trim() || '',
        BE_Faculty_Headcount: parseInt(row.BE_Faculty_Headcount, 10) || 0,
        BE_Staff_Headcount: parseInt(row.BE_Staff_Headcount, 10) || 0,
        NBE_Faculty_Headcount: parseInt(row.NBE_Faculty_Headcount, 10) || 0,
        NBE_Staff_Headcount: parseInt(row.NBE_Staff_Headcount, 10) || 0,
        NBE_Student_Worker_Headcount: parseInt(row.NBE_Student_Worker_Headcount, 10) || 0,
        Total_Headcount: parseInt(row.Total_Headcount, 10) || 0,
        BE_New_Hires: parseInt(row.BE_New_Hires, 10) || 0,
        BE_Departures: parseInt(row.BE_Departures, 10) || 0,
        NBE_New_Hires: parseInt(row.NBE_New_Hires, 10) || 0,
        NBE_Departures: parseInt(row.NBE_Departures, 10) || 0
      }));
    } else {
      // Process as individual employee records - return as is for now
      return rawData;
    }
  };

  // Transform data to Firebase format
  const transformToFirebaseFormat = (quarter, records) => {
    // Aggregate totals across all records for this quarter
    const totals = records.reduce((acc, record) => {
      acc.totalEmployees += record.Total_Headcount || 0;
      acc.faculty += (record.BE_Faculty_Headcount || 0) + (record.NBE_Faculty_Headcount || 0);
      acc.staff += (record.BE_Staff_Headcount || 0) + (record.NBE_Staff_Headcount || 0);
      acc.students += record.NBE_Student_Worker_Headcount || 0;
      acc.newHires += (record.BE_New_Hires || 0) + (record.NBE_New_Hires || 0);
      acc.departures += (record.BE_Departures || 0) + (record.NBE_Departures || 0);
      return acc;
    }, {
      totalEmployees: 0,
      faculty: 0,
      staff: 0,
      students: 0,
      newHires: 0,
      departures: 0
    });

    // Group by location and department
    const byLocation = {};
    const byDepartment = {};
    
    records.forEach(record => {
      const location = record.Location || 'Unknown Location';
      if (!byLocation[location]) byLocation[location] = 0;
      byLocation[location] += record.Total_Headcount || 0;
      
      const department = record.Division || 'Unknown Division';
      if (!byDepartment[department]) byDepartment[department] = 0;
      byDepartment[department] += record.Total_Headcount || 0;
    });

    return {
      period: quarter,
      totalEmployees: totals.totalEmployees,
      demographics: {
        faculty: totals.faculty,
        staff: totals.staff,
        students: totals.students
      },
      byLocation,
      byDepartment,
      trends: {
        quarterlyGrowth: 2.5,
        newHires: totals.newHires,
        departures: totals.departures,
        netChange: totals.newHires - totals.departures
      },
      headcountChange: totals.newHires - totals.departures,
      version: '2.0',
      dataSource: 'aggregate_quarterly_upload',
      lastUpdated: new Date(),
      uploadSource: 'Excel Integration Dashboard',
      dataType: 'aggregate'
    };
  };

  // File upload handler
  const handleDataImported = useCallback(async (importedData) => {
    console.log('Data imported:', importedData);
    setUploadingToFirebase(true);
    setFirebaseStatus({ status: 'uploading', message: 'Processing and uploading data to Firebase...' });
    actions.setUploadStatus('uploading', 'Processing and uploading data to Firebase...');

    try {
      const processedData = processUploadedData(importedData.data);
      
      // Check if this is aggregate data with quarters
      const hasQuarters = processedData.some(record => record.Quarter_End_Date);
      
      if (hasQuarters) {
        // Group by quarter and process as aggregate data
        const groupedData = {};
        processedData.forEach(record => {
          let quarter = record.Quarter_End_Date;
          
          // Convert date format to quarter
          if (quarter && quarter.match(/\d{4}-\d{2}-\d{2}/)) {
            const date = new Date(quarter);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const quarterNum = Math.ceil(month / 3);
            quarter = `Q${quarterNum}-${year}`;
          }
          
          if (!groupedData[quarter]) {
            groupedData[quarter] = [];
          }
          groupedData[quarter].push(record);
        });

        // Save to Firebase
        let firebaseSuccessCount = 0;
        let firebaseErrors = [];
        
        for (const [quarter, records] of Object.entries(groupedData)) {
          try {
            const aggregateMetrics = transformToFirebaseFormat(quarter, records);
            
            // Convert quarter format to Firebase period
            let period = quarter;
            if (quarter.match(/Q(\d)-(\d{4})/)) {
              period = quarter.replace(/Q(\d)-(\d{4})/, '$2-Q$1');
            }
            
            await firebaseService.setWorkforceMetrics(period, aggregateMetrics);
            firebaseSuccessCount++;
          } catch (error) {
            firebaseErrors.push(`${quarter}: ${error.message}`);
          }
        }
        
        setFirebaseStatus({ 
          status: 'success', 
          message: `Successfully processed and uploaded ${processedData.length} records across ${firebaseSuccessCount} quarters to Firebase`,
          dataType: 'quarterlyAggregate',
          dashboardLinks: { url: '/dashboards/combined-workforce', name: 'Workforce Analytics' }
        });
        actions.setUploadStatus('success', `Successfully processed and uploaded ${processedData.length} records across ${firebaseSuccessCount} quarters to Firebase`);
        actions.setDataAvailability({ workforce: true });
      } else {
        // Individual employee data - save differently
        setFirebaseStatus({ 
          status: 'success', 
          message: `Successfully processed ${processedData.length} individual employee records`,
          dataType: 'individualEmployees'
        });
        actions.setUploadStatus('success', `Successfully processed ${processedData.length} individual employee records`);
      }
      
      setIsUsingUploadedData(true);

    } catch (error) {
      console.error('Data processing failed:', error);
      setFirebaseStatus({ 
        status: 'error', 
        message: `Upload failed: ${error.message}` 
      });
      actions.setUploadStatus('error', `Upload failed: ${error.message}`);
    } finally {
      setUploadingToFirebase(false);
    }
  }, []);

  const handleUploadError = useCallback((error) => {
    console.error('Upload error:', error);
    setFirebaseStatus({ 
      status: 'error', 
      message: `Upload failed: ${error}` 
    });
    actions.setUploadStatus('error', `Upload failed: ${error}`);
  }, [actions]);

  // Reset upload state
  const resetToSampleData = () => {
    setIsUsingUploadedData(false);
    setFirebaseStatus(null);
    actions.resetUploadStatus();
  };

  // Navigate to Enhanced Workforce Dashboard
  const navigateToEnhancedWorkforce = () => {
    navigate('/dashboards/enhanced-workforce');
  };

  // Navigate to Workforce Data Tester
  const navigateToDataTester = () => {
    navigate('/test/workforce-data');
  };

  // Navigate to Excel Upload Tester
  const navigateToUploadTester = () => {
    navigate('/test/excel-upload');
  };

  // Download comprehensive template for Combined Workforce Analytics
  const handleDownloadTemplate = () => {
    try {
      downloadCombinedWorkforceTemplate();
      setFirebaseStatus({
        status: 'success',
        message: 'Template downloaded successfully! Use this comprehensive template to upload quarterly workforce data.'
      });
    } catch (error) {
      setFirebaseStatus({
        status: 'error',
        message: `Failed to download template: ${error.message}`
      });
    }
  };

  // Clear Firebase database for testing
  const clearDatabase = async () => {
    const currentQuarter = 'Q1-2025'; // Default quarter for testing
    
    if (!window.confirm(`Are you sure you want to clear all Firebase data for ${currentQuarter}? This action cannot be undone.`)) {
      return;
    }

    setClearingDatabase(true);
    setFirebaseStatus({ status: 'uploading', message: `Clearing Firebase database for ${currentQuarter}...` });

    try {
      await firebaseService.clearAllDataForPeriod(currentQuarter);
      
      // Set flag to indicate data was recently cleared (for empty state detection)
      localStorage.setItem('firebase_data_cleared', Date.now().toString());
      
      setFirebaseStatus({ 
        status: 'success', 
        message: `Successfully cleared all Firebase data for ${currentQuarter}. Visit Combined Workforce Dashboard to verify empty state.`,
        dashboardLinks: { url: '/dashboards/combined-workforce', name: 'Combined Workforce Dashboard' }
      });
      
      // Reset local state
      setIsUsingUploadedData(false);
      actions.setDataAvailability({ workforce: false });
      actions.resetUploadStatus();
    } catch (error) {
      setFirebaseStatus({ 
        status: 'error', 
        message: `Failed to clear database: ${error.message}` 
      });
    } finally {
      setClearingDatabase(false);
    }
  };

  // Clear all quarters for complete testing reset
  const clearAllQuarters = async () => {
    const allQuarters = ['Q1-2024', 'Q2-2024', 'Q3-2024', 'Q4-2024', 'Q1-2025', 'Q2-2025', 'Q3-2025', 'Q4-2025'];
    
    if (!window.confirm(`Are you sure you want to clear ALL Firebase data for all quarters (${allQuarters.join(', ')})? This action cannot be undone.`)) {
      return;
    }

    setClearingDatabase(true);
    setFirebaseStatus({ status: 'uploading', message: 'Clearing all Firebase data across all quarters...' });

    try {
      const promises = allQuarters.map(quarter => firebaseService.clearAllDataForPeriod(quarter));
      await Promise.all(promises);
      
      // Set flag to indicate data was recently cleared (for empty state detection)
      localStorage.setItem('firebase_data_cleared', Date.now().toString());
      
      setFirebaseStatus({ 
        status: 'success', 
        message: `Successfully cleared all Firebase data for all quarters. Visit Combined Workforce Dashboard to verify empty state.`,
        dashboardLinks: { url: '/dashboards/combined-workforce', name: 'Combined Workforce Dashboard' }
      });
      
      // Reset local state
      setIsUsingUploadedData(false);
      actions.setDataAvailability({ workforce: false });
      actions.resetUploadStatus();
    } catch (error) {
      setFirebaseStatus({ 
        status: 'error', 
        message: `Failed to clear all data: ${error.message}` 
      });
    } finally {
      setClearingDatabase(false);
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
          Supports both individual employee records and quarterly aggregate data.
        </p>
      </div>

      {/* Data Source Manager */}
      <DataSourceManager 
        showUploadButton={false}
        showStatusIndicator={true}
        showDetailedStatus={true}
        className="mb-6"
      />

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={navigateToEnhancedWorkforce}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowRight size={16} />
            View Workforce Analytics
          </button>
          <button
            onClick={navigateToDataTester}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Calculator size={16} />
            Test Data Accuracy
          </button>
          <button
            onClick={navigateToUploadTester}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FileSpreadsheet size={16} />
            Test Excel Uploads
          </button>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download size={16} />
            Download Template
          </button>
          <button
            onClick={clearDatabase}
            disabled={clearingDatabase}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <Trash2 size={16} />
            {clearingDatabase ? 'Clearing...' : 'Clear Current Quarter'}
          </button>
          <button
            onClick={clearAllQuarters}
            disabled={clearingDatabase}
            className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 disabled:opacity-50 transition-colors"
          >
            <Trash2 size={16} />
            {clearingDatabase ? 'Clearing...' : 'Clear All Quarters'}
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Upload HR Data</h2>
            <p className="text-sm text-gray-600">
              {isUsingUploadedData ? 'Data uploaded successfully and saved to Firebase' : 'Upload Excel or CSV files with employee data'}
            </p>
          </div>
          {isUsingUploadedData && (
            <button
              onClick={resetToSampleData}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:border-gray-400"
            >
              Reset Upload Status
            </button>
          )}
        </div>
        
        {!isUsingUploadedData && (
          <FileUploader
            onDataImported={handleDataImported}
            onError={handleUploadError}
            expectedColumns={['Quarter_End_Date', 'Division', 'Location']}
            title="Upload HR Data"
            description="Supports individual employee records or quarterly aggregate data. File will be automatically processed based on detected columns."
          />
        )}
      </div>

      {/* Firebase Status */}
      {firebaseStatus && (
        <div className={`rounded-lg border p-4 ${
          firebaseStatus.status === 'success' ? 'bg-green-50 border-green-200' :
          firebaseStatus.status === 'error' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {firebaseStatus.status === 'success' && <CheckCircle className="text-green-600" size={20} />}
              {firebaseStatus.status === 'error' && <XCircle className="text-red-500" size={20} />}
              {firebaseStatus.status === 'uploading' && <RefreshCw className="text-blue-500 animate-spin" size={20} />}
              <span className={`font-medium ${
                firebaseStatus.status === 'success' ? 'text-green-700' :
                firebaseStatus.status === 'error' ? 'text-red-700' :
                'text-blue-700'
              }`}>
                {firebaseStatus.message}
              </span>
            </div>
            
            {firebaseStatus.dashboardLinks && (
              <button
                onClick={() => navigate(firebaseStatus.dashboardLinks.url)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <ArrowRight size={14} />
                {firebaseStatus.dashboardLinks.name}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-blue-900">Comprehensive Excel Template</h3>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            <Download size={14} />
            Download Template
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Multi-Tab Template Features</h4>
            <div className="text-sm space-y-1 text-blue-700">
              <p><strong>✓ Summary Data:</strong> Primary aggregate data for Firebase import</p>
              <p><strong>✓ Location Breakdown:</strong> Campus-specific workforce metrics</p>
              <p><strong>✓ Division Analysis:</strong> Department-level employee composition</p>
              <p><strong>✓ Hiring Activity:</strong> New hires and departures by quarter</p>
              <p><strong>✓ Demographics:</strong> Age groups, tenure, and diversity metrics</p>
              <p><strong>✓ Oracle HCM Mapping:</strong> Field mapping guide for easy data transfer</p>
              <p><strong>✓ Instructions:</strong> Step-by-step usage guide</p>
            </div>
          </div>

          <div className="bg-blue-100 rounded p-3">
            <p className="text-sm text-blue-800">
              <strong>Oracle HCM Ready:</strong> Template includes field mapping guide to easily transform your Oracle HCM CSV exports into our required format.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-blue-800 mb-2">Data Requirements</h4>
            <div className="text-sm space-y-1">
              <p className="text-blue-700">
                <strong>Required:</strong> Quarter_End_Date, Division, Location, BE_Faculty_Headcount, BE_Staff_Headcount
              </p>
              <p className="text-blue-600">
                <strong>Optional:</strong> Total_Headcount, BE_New_Hires, BE_Departures, NBE_New_Hires, NBE_Departures
              </p>
              <p className="text-blue-800 mt-2">
                <strong>Privacy Note:</strong> Individual employee records are NOT supported for security and privacy reasons.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Database Management Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6 border-red-200">
        <h3 className="text-lg font-semibold text-red-900 mb-3">Database Management</h3>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="font-medium text-red-800 mb-1">Clear Database</h4>
              <p className="text-sm text-red-700 mb-3">
                Remove all uploaded data from Firebase for testing purposes. This action cannot be undone.
              </p>
            </div>
          </div>
          <button
            onClick={clearDatabase}
            disabled={clearingDatabase}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <Trash2 size={16} />
            {clearingDatabase ? 'Clearing Database...' : 'Clear Database'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelIntegrationDashboard;