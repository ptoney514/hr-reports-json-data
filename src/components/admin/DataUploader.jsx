import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, Calendar, Database, Download, Copy, X } from 'lucide-react';
import { generateSimpleWorkforceTemplate, downloadSimpleWorkforceTemplate } from '../../utils/jsonDataUtils';

export const DataUploader = ({ collection }) => {
  const [uploadMode, setUploadMode] = useState('manual'); // 'manual' or 'file'
  const [selectedDate, setSelectedDate] = useState('');
  const [jsonData, setJsonData] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState(null);

  const getSampleData = () => ({
    workforce: generateSimpleWorkforceTemplate(),
    compliance: {
      total_certifications: 156,
      expiring_soon: 12,
      expired: 3,
      compliant_rate: 95.5
    },
    turnover: {
      total_turnover_rate: 11.2,
      faculty_turnover_rate: 3.4,
      staff_exempt_turnover_rate: 12.9,
      staff_non_exempt_turnover_rate: 18.6,
      voluntary_turnover_rate: 8.5,
      involuntary_turnover_rate: 2.7,
      total_separations: 156,
      faculty_separations: 12,
      staff_separations: 144
    }
  });

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setMessage(null);
  };

  const handleJsonChange = (e) => {
    setJsonData(e.target.value);
    setMessage(null);
    
    try {
      if (e.target.value.trim()) {
        const parsed = JSON.parse(e.target.value);
        setPreviewData(parsed);
      } else {
        setPreviewData(null);
      }
    } catch (err) {
      setPreviewData(null);
    }
  };

  const loadSampleData = () => {
    const sampleData = getSampleData();
    const sample = sampleData[collection] || {};
    setJsonData(JSON.stringify(sample, null, 2));
    setPreviewData(sample);
  };

  const validateData = (data) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Data must be a valid object');
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate) {
      setMessage({ type: 'error', text: 'Please select a reporting date' });
      return;
    }
    if (!jsonData.trim()) {
      setMessage({ type: 'error', text: 'Please provide data to upload' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const data = JSON.parse(jsonData);
      validateData(data);
      
      // Parse selectedDate (YYYY-MM-DD) to M-D-YYYY format
      const dateParts = selectedDate.split('-');
      const year = dateParts[0];
      const month = parseInt(dateParts[1], 10);
      const day = parseInt(dateParts[2], 10);
      
      const formattedDate = `${month}-${day}-${year}`;
      const displayDate = `${month}/${day}/${year}`;
      
      const dataWithMetadata = {
        ...data,
        metadata: {
          reportingDate: displayDate,
          reportingDateISO: selectedDate,
          lastUpdated: new Date().toISOString(),
          uploadedBy: 'admin',
          source: 'manual_upload'
        }
      };

      // Show export modal with instructions
      setExportData({
        period: formattedDate,
        displayDate: displayDate,
        data: dataWithMetadata,
        collection: collection
      });
      setShowExportModal(true);
      
      setMessage({ 
        type: 'info', 
        text: 'Data prepared successfully! Copy the JSON data and follow the instructions in the modal.' 
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (exportData) {
      const jsonString = JSON.stringify({ [exportData.period]: exportData.data }, null, 2);
      navigator.clipboard.writeText(jsonString)
        .then(() => {
          setMessage({ type: 'success', text: 'JSON data copied to clipboard!' });
        })
        .catch(() => {
          setMessage({ type: 'error', text: 'Failed to copy to clipboard' });
        });
    }
  };

  const JsonExportModal = () => {
    if (!showExportModal || !exportData) return null;

    const fileName = `dashboard-data.json`;
    const filePath = `/src/data/${fileName}`;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Export JSON Data</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                <li>Click the "Copy JSON" button below to copy the data</li>
                <li>Open the file: <code className="bg-blue-100 px-2 py-1 rounded">{filePath}</code></li>
                <li>Find the <code className="bg-blue-100 px-2 py-1 rounded">"{collection}"</code> section</li>
                <li>Add or update the period key: <code className="bg-blue-100 px-2 py-1 rounded">"{exportData.period}"</code></li>
                <li>Replace the value with the copied JSON data</li>
                <li>Save the file and restart the development server</li>
              </ol>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">JSON Data for {exportData.displayDate}:</h3>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy JSON
                </button>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs">
                  <code>{JSON.stringify({ [exportData.period]: exportData.data }, null, 2)}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <JsonExportModal />
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Database className="h-5 w-5" />
          Upload {collection.charAt(0).toUpperCase() + collection.slice(1)} Data
        </h2>
        <p className="text-gray-600">
          Upload data manually or from a file. Data will be prepared for manual JSON file update.
        </p>
      </div>

      {/* Upload Mode Selector */}
      <div className="mb-6">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setUploadMode('manual')}
            className={`px-4 py-2 rounded-lg ${
              uploadMode === 'manual'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Manual Entry
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('file')}
            className={`px-4 py-2 rounded-lg ${
              uploadMode === 'file'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            File Upload
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Reporting Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Manual Entry Mode */}
        {uploadMode === 'manual' && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                JSON Data
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={loadSampleData}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Load Sample Data
                </button>
                {collection === 'workforce' && (
                  <button
                    type="button"
                    onClick={() => downloadSimpleWorkforceTemplate(selectedDate || '6-30-2025')}
                    className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Download Template
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={jsonData}
              onChange={handleJsonChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              rows={15}
              placeholder={`{\n  "total_employees": 5217,\n  "total_faculty": 1565,\n  ...\n}`}
              required
            />
          </div>
        )}

        {/* Messages */}
        {message && (
          <div className={`p-4 rounded-lg flex items-start gap-2 ${
            message.type === 'error' ? 'bg-red-50 text-red-700' : 
            message.type === 'success' ? 'bg-green-50 text-green-700' :
            message.type === 'info' ? 'bg-blue-50 text-blue-700' :
            'bg-yellow-50 text-yellow-700'
          }`}>
            {message.type === 'error' && <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
            {message.type === 'success' && <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Prepare Data for Export
            </>
          )}
        </button>
      </form>

      {/* Data Preview */}
      {previewData && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Data Preview:</h3>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(previewData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};