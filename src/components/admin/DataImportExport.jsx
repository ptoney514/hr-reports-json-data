import React, { useState, useCallback } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, FileText } from 'lucide-react';

const DataImportExport = ({ data, onImport, dashboardType, period }) => {
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  // Export current data as JSON
  const exportData = useCallback(() => {
    if (!data) return;

    const exportData = {
      metadata: {
        dashboardType,
        period,
        exportDate: new Date().toISOString(),
        version: data.version || '2.0'
      },
      data
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dashboardType}-${period}-backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setImportStatus({
      type: 'success',
      message: `Exported ${dashboardType} data for ${period}`
    });
  }, [data, dashboardType, period]);

  // Import data from JSON file
  const handleFileImport = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Validate the imported data structure
        if (importedData.metadata && importedData.data) {
          // Check if it's for the correct dashboard and period
          if (importedData.metadata.dashboardType !== dashboardType) {
            setImportStatus({
              type: 'error',
              message: `Data is for ${importedData.metadata.dashboardType} dashboard, but current dashboard is ${dashboardType}`
            });
            setImporting(false);
            return;
          }

          // Import the data
          onImport(importedData.data);
          setImportStatus({
            type: 'success',
            message: `Successfully imported ${dashboardType} data from ${importedData.metadata.period || 'backup'}`
          });
        } else {
          // Try to import raw data (without metadata wrapper)
          onImport(importedData);
          setImportStatus({
            type: 'success',
            message: 'Successfully imported data (raw format)'
          });
        }
      } catch (error) {
        setImportStatus({
          type: 'error',
          message: `Failed to import data: ${error.message}`
        });
      } finally {
        setImporting(false);
        // Clear the file input
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      setImportStatus({
        type: 'error',
        message: 'Failed to read file'
      });
      setImporting(false);
    };

    reader.readAsText(file);
  }, [dashboardType, onImport]);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Import/Export</h3>
      
      <div className="space-y-4">
        {/* Export Section */}
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Download className="text-blue-600" size={20} />
            <div>
              <h4 className="font-medium text-blue-900">Export Data</h4>
              <p className="text-sm text-blue-700">
                Download current data as JSON backup file
              </p>
            </div>
          </div>
          <button
            onClick={exportData}
            disabled={!data}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Export JSON
          </button>
        </div>

        {/* Import Section */}
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Upload className="text-green-600" size={20} />
            <div>
              <h4 className="font-medium text-green-900">Import Data</h4>
              <p className="text-sm text-green-700">
                Upload JSON backup file to restore data
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {importing && (
              <div className="text-sm text-green-600">
                Importing...
              </div>
            )}
            <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
              <Upload size={16} />
              Import JSON
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                disabled={importing}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Status Messages */}
        {importStatus && (
          <div className={`p-4 rounded-lg border ${
            importStatus.type === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {importStatus.type === 'success' ? (
                <CheckCircle className="text-green-600" size={20} />
              ) : (
                <AlertCircle className="text-red-500" size={20} />
              )}
              <span className={`font-medium ${
                importStatus.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {importStatus.message}
              </span>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-start gap-2">
            <FileText className="text-gray-500 mt-0.5" size={16} />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Import/Export Guidelines:</p>
              <ul className="space-y-1 text-xs">
                <li>• Export creates a backup of current data with metadata</li>
                <li>• Import accepts JSON files in the same format</li>
                <li>• Imported data will replace current data (use with caution)</li>
                <li>• Always export current data before importing new data</li>
                <li>• Data validation is performed during import</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataImportExport;