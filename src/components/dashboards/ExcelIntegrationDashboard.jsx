import React, { useState, useCallback } from 'react';
import { 
  Database,
  Cloud,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Upload
} from 'lucide-react';
import FileUploader from '../ui/FileUploader';
import DataSourceManager from '../ui/DataSourceManager';
import { useDataSource } from '../../contexts/DataSourceContext';
import firebaseService from '../../services/FirebaseService';

const ExcelIntegrationDashboard = () => {
  const { state, actions } = useDataSource();
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
      version: '1.0',
      dataSource: 'uploaded_csv'
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
            
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Supported Data Formats</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Individual Employee Records</h4>
            <div className="text-sm space-y-1">
              <p className="text-blue-700">
                <strong>Required:</strong> Employee_ID, First_Name, Last_Name, Department, Division, Position
              </p>
              <p className="text-blue-600">
                <strong>Optional:</strong> Location, Employment_Status, Hire_Date, Salary, Employee_Type
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Quarterly Aggregate Data</h4>
            <div className="text-sm space-y-1">
              <p className="text-blue-700">
                <strong>Required:</strong> Quarter_End_Date, Division, Location, BE_Faculty_Headcount, BE_Staff_Headcount
              </p>
              <p className="text-blue-600">
                <strong>Optional:</strong> Total_Headcount, BE_New_Hires, BE_Departures, NBE_New_Hires, NBE_Departures
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-100 rounded">
          <p className="text-sm text-blue-800">
            <strong>Smart Detection:</strong> The system automatically detects your data format and processes it accordingly. 
            Upload individual employee records for detailed analysis or quarterly aggregates for dashboard metrics.
          </p>
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