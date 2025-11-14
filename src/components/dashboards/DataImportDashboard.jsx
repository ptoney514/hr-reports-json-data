import React, { useState, useEffect } from 'react';
import {
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  FileSpreadsheet,
  AlertCircle,
  RefreshCw,
  FileText
} from 'lucide-react';

/**
 * Data Import Dashboard
 *
 * Allows user to import quarterly data from Excel files
 * Workflow:
 * 1. User copies Excel files to source-metrics/[type]/raw/FY25_QX/
 * 2. Dashboard detects files
 * 3. User clicks "Import Now" button
 * 4. Backend script cleans data, removes PII, merges to staticData.js
 * 5. Success! Dashboard data updated
 */
const DataImportDashboard = () => {
  const [importStatus, setImportStatus] = useState({
    workforce: { status: 'idle', message: '', lastImport: null },
    terminations: { status: 'idle', message: '', lastImport: null },
    exitSurveys: { status: 'idle', message: '', lastImport: null }
  });

  const [selectedQuarter, setSelectedQuarter] = useState('FY25_Q4');

  // Available quarters (only those with potential data)
  const availableQuarters = [
    { value: 'FY25_Q1', label: 'Q1 FY25', period: 'July - September 2024' },
    { value: 'FY25_Q2', label: 'Q2 FY25', period: 'October - December 2024' },
    { value: 'FY25_Q3', label: 'Q3 FY25', period: 'January - March 2025' },
    { value: 'FY25_Q4', label: 'Q4 FY25', period: 'April - June 2025' }
  ];

  // Check for files in raw folders
  const checkForFiles = async (dataType, quarter) => {
    try {
      // This will be implemented to check if files exist in source-metrics/[type]/raw/[quarter]/
      // For now, return mock status
      const response = await fetch(`/api/data-import/check?type=${dataType}&quarter=${quarter}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking for files:', error);
      return { fileFound: false, fileName: null };
    }
  };

  // Import data source
  const handleImport = async (dataType) => {
    setImportStatus(prev => ({
      ...prev,
      [dataType]: { status: 'processing', message: 'Starting import...', lastImport: null }
    }));

    try {
      // Call backend import script
      // This will be implemented as API endpoint that triggers Node.js cleaning script
      const response = await fetch('/api/data-import/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataType,
          quarter: selectedQuarter
        })
      });

      const result = await response.json();

      if (result.success) {
        setImportStatus(prev => ({
          ...prev,
          [dataType]: {
            status: 'success',
            message: `Successfully imported ${result.recordCount} records`,
            lastImport: new Date().toISOString()
          }
        }));

        // Trigger page reload to update staticData.js
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(result.error || 'Import failed');
      }
    } catch (error) {
      setImportStatus(prev => ({
        ...prev,
        [dataType]: {
          status: 'error',
          message: error.message,
          lastImport: null
        }
      }));
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'processing':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  // Data source card component
  const DataSourceCard = ({
    title,
    dataType,
    expectedFile,
    description,
    icon: Icon
  }) => {
    const status = importStatus[dataType];

    return (
      <div className={`border-2 rounded-lg p-6 transition-all ${getStatusColor(status.status)}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          {getStatusIcon(status.status)}
        </div>

        {/* File Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Expected File:</div>
          <div className="text-sm font-mono text-gray-700">{expectedFile}</div>
          <div className="text-xs text-gray-500 mt-2">
            Location: <span className="font-mono">source-metrics/{dataType}/raw/{selectedQuarter}/</span>
          </div>
        </div>

        {/* Status Message */}
        {status.message && (
          <div className={`mb-4 p-3 rounded text-sm ${
            status.status === 'error' ? 'bg-red-100 text-red-800' :
            status.status === 'success' ? 'bg-green-100 text-green-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {status.message}
          </div>
        )}

        {/* Last Import Info */}
        {status.lastImport && (
          <div className="mb-4 text-xs text-gray-500">
            Last imported: {new Date(status.lastImport).toLocaleString()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleImport(dataType)}
            disabled={status.status === 'processing'}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors flex items-center justify-center gap-2"
          >
            {status.status === 'processing' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import Now
              </>
            )}
          </button>

          <button
            onClick={() => checkForFiles(dataType, selectedQuarter)}
            disabled={status.status === 'processing'}
            className="px-4 py-2 border-2 border-gray-300 hover:border-blue-500 rounded font-medium transition-colors"
          >
            Check Files
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Data Import Dashboard
        </h1>
        <p className="text-gray-600">
          Import quarterly data from Oracle HCM exports. Add Excel files to source-metrics folders, then click Import.
        </p>
      </div>

      {/* Quarter Selector */}
      <div className="mb-8 p-6 bg-white border-2 border-gray-200 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Fiscal Quarter
        </label>
        <select
          value={selectedQuarter}
          onChange={(e) => setSelectedQuarter(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {availableQuarters.map(q => (
            <option key={q.value} value={q.value}>
              {q.label} - {q.period}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-gray-500">
          Importing data for: <span className="font-semibold">{selectedQuarter}</span>
        </p>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Import Instructions</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Copy Excel files to the <code className="bg-blue-100 px-1 rounded">source-metrics/[type]/raw/{selectedQuarter}/</code> folder</li>
              <li>Click "Check Files" to verify files are detected</li>
              <li>Click "Import Now" to clean data and update dashboard</li>
              <li>Wait for processing to complete (typically 30-60 seconds)</li>
              <li>Page will auto-refresh with updated data</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Data Source Cards */}
      <div className="space-y-6">
        <DataSourceCard
          title="Workforce Headcount"
          dataType="workforce"
          expectedFile="New Emp List since FY20 to Q[X]FY25.xlsx"
          description="Quarterly employee headcount snapshot from Oracle HCM"
          icon={FileSpreadsheet}
        />

        <DataSourceCard
          title="Terminations"
          dataType="terminations"
          expectedFile="Terms Since 2017 Detail PT.xlsx"
          description="Historical termination records (cumulative)"
          icon={FileSpreadsheet}
        />

        <DataSourceCard
          title="Exit Surveys"
          dataType="exitSurveys"
          expectedFile="Exit_Survey_Q[X]_FY25.xlsx (Qualtrics export)"
          description="Employee exit survey responses and comments"
          icon={FileText}
        />
      </div>

      {/* Help Section */}
      <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            <strong>Where do I get the Excel files?</strong><br />
            Export from Oracle HCM quarterly (Workforce &amp; Terminations) and Qualtrics (Exit Surveys)
          </li>
          <li>
            <strong>What if import fails?</strong><br />
            Check the error message, verify the Excel file is in the correct folder, and ensure file format matches expected template
          </li>
          <li>
            <strong>Is my data secure?</strong><br />
            Yes! Raw Excel files are never committed to git (PII protected). Only cleaned, anonymized JSON is saved.
          </li>
          <li>
            <strong>How do I verify the import worked?</strong><br />
            Navigate to Quarterly Report Dashboard and select the quarter you just imported
          </li>
        </ul>
      </div>

      {/* Recent Imports (Future Enhancement) */}
      {/* <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Recent Imports</h3>
        <div className="space-y-2">
          {/* Import history list }
        </div>
      </div> */}
    </div>
  );
};

export default DataImportDashboard;
