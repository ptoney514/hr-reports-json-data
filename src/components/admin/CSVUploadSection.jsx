import React, { useState, useCallback, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  FileUp,
  X
} from 'lucide-react';
import { parseCSV, csvToHRJson, validateCSVData, downloadCSVTemplate } from '../../utils/csvUtils';

const CSVUploadSection = ({ 
  dashboardType, 
  onDataImport,
  onClose 
}) => {
  const [csvText, setCsvText] = useState('');
  const [jsonPreview, setJsonPreview] = useState('');
  const [parseOptions, setParseOptions] = useState({
    delimiter: 'auto',
    parseNumbers: true,
    parseJSON: true,
    transpose: false
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Handle CSV text change and update preview
  const handleCSVChange = useCallback((text) => {
    setCsvText(text);
    setError(null);
    setSuccess(null);
    setWarnings([]);
    
    if (!text.trim()) {
      setJsonPreview('');
      return;
    }
    
    try {
      // Parse CSV
      const parsed = parseCSV(text, parseOptions);
      
      if (parsed.errors.length > 0) {
        setError(parsed.errors[0]);
        setJsonPreview('');
        return;
      }
      
      // Validate CSV data
      const validation = validateCSVData(parsed.data, dashboardType);
      if (!validation.isValid) {
        setError(validation.errors[0]);
        setWarnings(validation.warnings);
        return;
      }
      
      setWarnings(validation.warnings);
      
      // Convert to HR JSON format
      const currentPeriod = new Date().toISOString().split('T')[0].replace(/-/g, '-');
      const hrJson = csvToHRJson(parsed.data, dashboardType, currentPeriod);
      
      // Update preview
      setJsonPreview(JSON.stringify(hrJson, null, 2));
      
    } catch (err) {
      setError(err.message);
      setJsonPreview('');
    }
  }, [dashboardType, parseOptions]);
  
  // Handle file upload
  const handleFileUpload = useCallback((file) => {
    if (!file) return;
    
    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target.result;
      handleCSVChange(text);
      setLoading(false);
    };
    
    reader.onerror = () => {
      setError('Failed to read file');
      setLoading(false);
    };
    
    reader.readAsText(file);
  }, [handleCSVChange]);
  
  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);
  
  // Convert and import data
  const handleConvert = useCallback(() => {
    if (!jsonPreview) {
      setError('No valid data to convert');
      return;
    }
    
    try {
      const jsonData = JSON.parse(jsonPreview);
      
      // Call the import handler
      if (onDataImport) {
        onDataImport(jsonData);
        setSuccess('Data successfully imported!');
        
        // Clear form after successful import
        setTimeout(() => {
          setCsvText('');
          setJsonPreview('');
          setSuccess(null);
        }, 2000);
      }
    } catch (err) {
      setError('Failed to import data: ' + err.message);
    }
  }, [jsonPreview, onDataImport]);
  
  // Copy JSON to clipboard
  const handleCopyJSON = useCallback(() => {
    if (!jsonPreview) return;
    
    navigator.clipboard.writeText(jsonPreview)
      .then(() => {
        setSuccess('JSON copied to clipboard!');
        setTimeout(() => setSuccess(null), 2000);
      })
      .catch(() => {
        setError('Failed to copy to clipboard');
      });
  }, [jsonPreview]);
  
  // Download JSON
  const handleDownloadJSON = useCallback(() => {
    if (!jsonPreview) return;
    
    const blob = new Blob([jsonPreview], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hr-${dashboardType}-data.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setSuccess('JSON downloaded successfully!');
    setTimeout(() => setSuccess(null), 2000);
  }, [jsonPreview, dashboardType]);
  
  // Clear all fields
  const handleClear = useCallback(() => {
    setCsvText('');
    setJsonPreview('');
    setError(null);
    setSuccess(null);
    setWarnings([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">CSV to JSON Converter</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      <p className="text-sm text-gray-600 mb-6">
        Upload or paste your CSV data to convert it to JSON format for {dashboardType} dashboard
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - CSV Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">CSV Input</h3>
            <button
              onClick={() => downloadCSVTemplate(dashboardType)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50"
            >
              <Download size={14} />
              Template
            </button>
          </div>
          
          {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <FileUp className="mx-auto text-gray-400" size={32} />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop CSV file here, or{' '}
              <label className="text-blue-600 hover:text-blue-800 cursor-pointer">
                browse
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.tsv"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </p>
          </div>
          
          {/* CSV Text Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Or paste your CSV data here:
            </label>
            <textarea
              value={csvText}
              onChange={(e) => handleCSVChange(e.target.value)}
              placeholder="Paste your CSV data here..."
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
            />
          </div>
          
          {/* Parsing Options */}
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center">
              <span className="mr-2 text-gray-700">Separator:</span>
              <select
                value={parseOptions.delimiter}
                onChange={(e) => {
                  setParseOptions({ ...parseOptions, delimiter: e.target.value });
                  handleCSVChange(csvText);
                }}
                className="px-2 py-1 border border-gray-300 rounded"
              >
                <option value="auto">Auto-detect</option>
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\t">Tab</option>
              </select>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={parseOptions.parseNumbers}
                onChange={(e) => {
                  setParseOptions({ ...parseOptions, parseNumbers: e.target.checked });
                  handleCSVChange(csvText);
                }}
                className="mr-2"
              />
              <span className="text-gray-700">Parse numbers</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={parseOptions.transpose}
                onChange={(e) => {
                  setParseOptions({ ...parseOptions, transpose: e.target.checked });
                  handleCSVChange(csvText);
                }}
                className="mr-2"
              />
              <span className="text-gray-700">Transpose</span>
            </label>
          </div>
        </div>
        
        {/* Right side - JSON Preview */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">JSON Preview</h3>
          
          <div className="relative">
            <textarea
              value={jsonPreview}
              readOnly
              placeholder="JSON preview will appear here..."
              className="w-full h-80 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm resize-none"
            />
            
            {jsonPreview && (
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={handleCopyJSON}
                  className="p-1.5 text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded"
                  title="Copy to clipboard"
                >
                  <Copy size={16} />
                </button>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleConvert}
              disabled={!jsonPreview || loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} />
              Convert & Import
            </button>
            
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:border-gray-400"
            >
              <X size={16} />
              Clear
            </button>
            
            <button
              onClick={handleDownloadJSON}
              disabled={!jsonPreview}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
      </div>
      
      {/* Status Messages */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-500" size={20} />
            <span className="font-medium text-red-700">{error}</span>
          </div>
        </div>
      )}
      
      {warnings.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-yellow-800 mb-1">Warnings:</p>
              <ul className="text-sm text-yellow-700 list-disc list-inside">
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            <span className="font-medium text-green-700">{success}</span>
          </div>
        </div>
      )}
      
      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <FileText className="text-blue-600 mt-0.5" size={16} />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">CSV Import Guidelines:</p>
            <ul className="space-y-1 text-xs">
              <li>• Download the template to see the expected format</li>
              <li>• First row should contain column headers</li>
              <li>• Numeric values will be automatically parsed</li>
              <li>• Date format: MM/DD/YY or YYYY-MM-DD</li>
              <li>• Empty cells will be treated as 0 for numeric fields</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVUploadSection;