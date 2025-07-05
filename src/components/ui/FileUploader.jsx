import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, AlertCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const FileUploader = ({ 
  onDataImported, 
  onError, 
  acceptedTypes = ['xlsx', 'xls', 'csv'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  expectedColumns = [],
  title = "Upload Employee Data",
  description = "Drag and drop your Excel or CSV file here, or click to browse",
  className = ""
}) => {
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, validating, success, error
  const [uploadedFile, setUploadedFile] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState(null);

  // Parse Excel/CSV file and extract data
  const parseFile = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          let workbook;
          let jsonData;

          if (file.name.toLowerCase().endsWith('.csv')) {
            // Parse CSV
            const text = data;
            const lines = text.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            jsonData = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
              const row = {};
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              return row;
            });
          } else {
            // Parse Excel
            workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            jsonData = XLSX.utils.sheet_to_json(worksheet);
          }

          resolve({
            data: jsonData,
            headers: Object.keys(jsonData[0] || {}),
            rowCount: jsonData.length,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.name.split('.').pop().toLowerCase()
          });
        } catch (error) {
          reject(new Error(`Failed to parse file: ${error.message}`));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));

      if (file.name.toLowerCase().endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    });
  }, []);

  // Validate data structure and quality
  const validateData = useCallback((parsedData) => {
    const results = {
      isValid: true,
      warnings: [],
      errors: [],
      columnMapping: {},
      missingColumns: [],
      extraColumns: [],
      dataQuality: {
        totalRows: parsedData.rowCount,
        emptyRows: 0,
        duplicateIds: 0,
        missingRequiredFields: 0
      }
    };

    // Check for expected columns
    if (expectedColumns.length > 0) {
      const actualHeaders = parsedData.headers.map(h => h.toLowerCase().trim());
      const expectedLower = expectedColumns.map(c => c.toLowerCase());

      expectedLower.forEach(expected => {
        const found = actualHeaders.find(actual => 
          actual.includes(expected) || expected.includes(actual)
        );
        if (found) {
          results.columnMapping[expected] = parsedData.headers[actualHeaders.indexOf(found)];
        } else {
          results.missingColumns.push(expected);
          results.errors.push(`Missing required column: ${expected}`);
        }
      });

      actualHeaders.forEach(actual => {
        const originalHeader = parsedData.headers[actualHeaders.indexOf(actual)];
        if (!expectedLower.some(exp => actual.includes(exp) || exp.includes(actual))) {
          results.extraColumns.push(originalHeader);
        }
      });
    }

    // Data quality checks
    const data = parsedData.data;
    
    // Check for empty rows
    results.dataQuality.emptyRows = data.filter(row => 
      Object.values(row).every(value => !value || value.toString().trim() === '')
    ).length;

    // Check for duplicate employee IDs
    const idFields = ['employee_id', 'employeeid', 'id', 'emp_id'];
    const idField = parsedData.headers.find(h => 
      idFields.some(id => h.toLowerCase().includes(id))
    );
    
    if (idField) {
      const ids = data.map(row => row[idField]).filter(id => id);
      const uniqueIds = new Set(ids);
      results.dataQuality.duplicateIds = ids.length - uniqueIds.size;
      
      if (results.dataQuality.duplicateIds > 0) {
        results.warnings.push(`Found ${results.dataQuality.duplicateIds} duplicate employee IDs`);
      }
    }

    // Check for missing required fields
    const requiredFields = ['name', 'department', 'position'];
    requiredFields.forEach(field => {
      const found = parsedData.headers.find(h => 
        h.toLowerCase().includes(field.toLowerCase())
      );
      if (found) {
        const missing = data.filter(row => !row[found] || row[found].toString().trim() === '').length;
        results.dataQuality.missingRequiredFields += missing;
      }
    });

    if (results.dataQuality.missingRequiredFields > 0) {
      results.warnings.push(`${results.dataQuality.missingRequiredFields} rows have missing required fields`);
    }

    // Set overall validity
    results.isValid = results.errors.length === 0;

    return results;
  }, [expectedColumns]);

  // Handle file drop/selection
  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      const error = rejection.errors[0];
      let errorMessage = 'File upload failed';
      
      if (error.code === 'file-too-large') {
        errorMessage = `File is too large. Maximum size is ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`;
      } else if (error.code === 'file-invalid-type') {
        errorMessage = `Invalid file type. Please upload ${acceptedTypes.join(', ')} files only`;
      }
      
      setError(errorMessage);
      setUploadState('error');
      onError?.(errorMessage);
      return;
    }

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadedFile(file);
    setError(null);
    setUploadState('uploading');

    try {
      // Parse the file
      const parsedData = await parseFile(file);
      setUploadState('validating');

      // Validate the data
      const validation = validateData(parsedData);
      setValidationResults(validation);

      // Set preview data (first 5 rows)
      setPreviewData({
        headers: parsedData.headers,
        rows: parsedData.data.slice(0, 5),
        totalRows: parsedData.data.length
      });

      if (validation.isValid) {
        setUploadState('success');
        onDataImported?.({
          ...parsedData,
          validation
        });
      } else {
        setUploadState('error');
        setError(`Data validation failed: ${validation.errors.join(', ')}`);
        onError?.(validation.errors.join(', '));
      }
    } catch (error) {
      setUploadState('error');
      setError(error.message);
      onError?.(error.message);
    }
  }, [parseFile, validateData, maxFileSize, acceptedTypes, onDataImported, onError]);

  // Setup dropzone
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxSize: maxFileSize,
    multiple: false
  });

  // Clear upload state
  const clearUpload = () => {
    setUploadState('idle');
    setUploadedFile(null);
    setValidationResults(null);
    setPreviewData(null);
    setError(null);
  };

  // Download sample template
  const downloadTemplate = () => {
    const sampleData = [
      {
        'Employee_ID': 'EMP001',
        'First_Name': 'John',
        'Last_Name': 'Doe',
        'Department': 'Academic Affairs',
        'Division': 'Arts & Sciences',
        'Position': 'Professor',
        'Location': 'Omaha Campus',
        'Employment_Status': 'Full-time',
        'Hire_Date': '2020-08-15',
        'Salary': '75000',
        'Employee_Type': 'Faculty'
      },
      {
        'Employee_ID': 'EMP002',
        'First_Name': 'Jane',
        'Last_Name': 'Smith',
        'Department': 'Student Affairs',
        'Division': 'Student Services',
        'Position': 'Advisor',
        'Location': 'Omaha Campus',
        'Employment_Status': 'Full-time',
        'Hire_Date': '2019-06-01',
        'Salary': '45000',
        'Employee_Type': 'Staff'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee_Data');
    XLSX.writeFile(workbook, 'workforce_data_template.xlsx');
  };

  const getDropzoneClassName = () => {
    let baseClasses = "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ";
    
    if (isDragAccept) {
      baseClasses += "border-green-400 bg-green-50";
    } else if (isDragReject) {
      baseClasses += "border-red-400 bg-red-50";
    } else if (isDragActive) {
      baseClasses += "border-blue-400 bg-blue-50";
    } else {
      baseClasses += "border-gray-300 hover:border-gray-400 hover:bg-gray-50";
    }
    
    return baseClasses + className;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download size={16} />
          Download Template
        </button>
      </div>

      {/* Upload Area */}
      {uploadState === 'idle' && (
        <div {...getRootProps()} className={getDropzoneClassName()}>
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {isDragActive ? 'Drop the file here' : 'Upload your employee data'}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Supports .xlsx, .xls, and .csv files up to {(maxFileSize / 1024 / 1024).toFixed(1)}MB
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Choose File
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {(uploadState === 'uploading' || uploadState === 'validating') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="font-medium text-blue-900">
            {uploadState === 'uploading' ? 'Uploading file...' : 'Validating data...'}
          </p>
          <p className="text-sm text-blue-700">{uploadedFile?.name}</p>
        </div>
      )}

      {/* Success State */}
      {uploadState === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <h4 className="font-medium text-green-900">File uploaded successfully!</h4>
                <p className="text-sm text-green-700">{uploadedFile?.name}</p>
              </div>
            </div>
            <button onClick={clearUpload} className="text-green-600 hover:text-green-800">
              <X size={20} />
            </button>
          </div>

          {/* Validation Summary */}
          {validationResults && (
            <div className="mt-4 space-y-2">
              <div className="text-sm text-green-700">
                <strong>Data Summary:</strong> {validationResults.dataQuality.totalRows} rows processed
              </div>
              
              {validationResults.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <h5 className="text-sm font-medium text-yellow-800 mb-1">Warnings:</h5>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {validationResults.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {uploadState === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-600" size={24} />
              <div>
                <h4 className="font-medium text-red-900">Upload failed</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <button onClick={clearUpload} className="text-red-600 hover:text-red-800">
              <X size={20} />
            </button>
          </div>

          {/* Validation Details */}
          {validationResults && (
            <div className="mt-4 space-y-2">
              {validationResults.missingColumns.length > 0 && (
                <div className="text-sm text-red-700">
                  <strong>Missing columns:</strong> {validationResults.missingColumns.join(', ')}
                </div>
              )}
              
              {validationResults.errors.length > 0 && (
                <div className="bg-red-100 border border-red-200 rounded p-3">
                  <h5 className="text-sm font-medium text-red-800 mb-1">Errors:</h5>
                  <ul className="text-xs text-red-700 space-y-1">
                    {validationResults.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            onClick={clearUpload}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Data Preview */}
      {previewData && uploadState === 'success' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">
            Data Preview ({previewData.totalRows} total rows)
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {previewData.headers.map((header, index) => (
                    <th key={index} className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b">
                    {previewData.headers.map((header, colIndex) => (
                      <td key={colIndex} className="px-3 py-2 text-gray-600">
                        {row[header] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {previewData.totalRows > 5 && (
            <p className="text-xs text-gray-500 mt-2">
              Showing first 5 rows of {previewData.totalRows} total rows
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader;