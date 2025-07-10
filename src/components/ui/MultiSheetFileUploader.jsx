import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Layers,
  Calendar,
  Check,
  Eye
} from 'lucide-react';
import * as XLSX from 'xlsx';

/**
 * Enhanced FileUploader with multi-sheet Excel support
 * Automatically detects quarters and allows selective sheet processing
 */
const MultiSheetFileUploader = ({ 
  onDataImported, 
  onError, 
  acceptedTypes = ['xlsx', 'xls', 'csv'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  expectedColumns = [],
  title = "Upload Employee Data",
  description = "Drag and drop your Excel or CSV file here, or click to browse",
  className = "",
  supportMultiSheet = true
}) => {
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, validating, sheet-selection, success, error
  const [uploadedFile, setUploadedFile] = useState(null);
  const [workbookData, setWorkbookData] = useState(null);
  const [sheetSelection, setSheetSelection] = useState({});
  const [validationResults, setValidationResults] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState(null);

  // Auto-detect quarter from sheet name
  const detectQuarterFromSheetName = (sheetName) => {
    const quarterPatterns = [
      /Q([1-4])[-_\s]*20(\d{2})/i,  // Q1-2025, Q1_2025, Q1 2025
      /Q([1-4])[-_\s]*(\d{4})/i,    // Q1-2025, Q1_2025, Q1 2025
      /([1-4])Q[-_\s]*20(\d{2})/i,  // 1Q-2025, 1Q_2025, 1Q 2025
      /Quarter[-_\s]*([1-4])[-_\s]*20(\d{2})/i, // Quarter_1_2025
      /(Q[1-4])[-_\s]*(20\d{2})/i   // Q1_2025
    ];

    for (const pattern of quarterPatterns) {
      const match = sheetName.match(pattern);
      if (match) {
        if (match[1] && match[2]) {
          const quarter = match[1];
          const year = match[2].length === 2 ? `20${match[2]}` : match[2];
          return `Q${quarter}-${year}`;
        } else if (match[1] && match[3]) {
          const quarter = match[1];
          const year = match[3].length === 2 ? `20${match[3]}` : match[3];
          return `Q${quarter}-${year}`;
        }
      }
    }

    return null;
  };

  // Parse multi-sheet Excel file
  const parseMultiSheetFile = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          let workbook;
          let result = {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.name.split('.').pop().toLowerCase(),
            isMultiSheet: false,
            sheets: []
          };

          if (file.name.toLowerCase().endsWith('.csv')) {
            // Handle CSV as single sheet
            const text = data;
            const lines = text.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            const jsonData = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
              const row = {};
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              return row;
            });

            result.sheets.push({
              name: 'CSV Data',
              data: jsonData,
              headers: headers,
              rowCount: jsonData.length,
              quarter: null,
              selected: true
            });
          } else {
            // Parse Excel with multiple sheets
            workbook = XLSX.read(data, { type: 'binary' });
            result.isMultiSheet = workbook.SheetNames.length > 1;

            workbook.SheetNames.forEach(sheetName => {
              const worksheet = workbook.Sheets[sheetName];
              const jsonData = XLSX.utils.sheet_to_json(worksheet);
              
              if (jsonData.length > 0) {
                const quarter = detectQuarterFromSheetName(sheetName);
                const headers = Object.keys(jsonData[0] || {});
                
                result.sheets.push({
                  name: sheetName,
                  data: jsonData,
                  headers: headers,
                  rowCount: jsonData.length,
                  quarter: quarter,
                  selected: true, // Default to selected
                  hasQuarterData: headers.some(h => 
                    h.toLowerCase().includes('quarter') || 
                    h.toLowerCase().includes('date')
                  ),
                  hasAggregateData: headers.some(h => 
                    h.toLowerCase().includes('headcount') || 
                    h.toLowerCase().includes('total')
                  ),
                  hasEmployeeData: headers.some(h => 
                    h.toLowerCase().includes('employee') || 
                    h.toLowerCase().includes('name')
                  )
                });
              }
            });
          }

          resolve(result);
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

  // Validate sheet data
  const validateSheetData = useCallback((sheet) => {
    const results = {
      isValid: true,
      warnings: [],
      errors: [],
      columnMapping: {},
      missingColumns: [],
      extraColumns: [],
      dataQuality: {
        totalRows: sheet.rowCount,
        emptyRows: 0,
        duplicateIds: 0,
        missingRequiredFields: 0
      }
    };

    // Check for expected columns
    if (expectedColumns.length > 0) {
      const actualHeaders = sheet.headers.map(h => h.toLowerCase().trim());
      const expectedLower = expectedColumns.map(c => c.toLowerCase());

      expectedLower.forEach(expected => {
        const found = actualHeaders.find(actual => 
          actual.includes(expected) || expected.includes(actual)
        );
        if (found) {
          results.columnMapping[expected] = sheet.headers[actualHeaders.indexOf(found)];
        } else {
          results.missingColumns.push(expected);
          results.errors.push(`Missing required column: ${expected}`);
        }
      });

      actualHeaders.forEach(actual => {
        const originalHeader = sheet.headers[actualHeaders.indexOf(actual)];
        if (!expectedLower.some(exp => actual.includes(exp) || exp.includes(actual))) {
          results.extraColumns.push(originalHeader);
        }
      });
    }

    // Data quality checks
    const data = sheet.data;
    
    // Check for empty rows
    results.dataQuality.emptyRows = data.filter(row => 
      Object.values(row).every(value => !value || value.toString().trim() === '')
    ).length;

    // Check for duplicate employee IDs
    const idFields = ['employee_id', 'employeeid', 'id', 'emp_id'];
    const idField = sheet.headers.find(h => 
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
      // Parse the file with multi-sheet support
      const workbookData = await parseMultiSheetFile(file);
      setWorkbookData(workbookData);
      setUploadState('validating');

      // If multiple sheets and multi-sheet support enabled, show sheet selection
      if (workbookData.isMultiSheet && supportMultiSheet) {
        // Initialize sheet selection
        const initialSelection = {};
        workbookData.sheets.forEach(sheet => {
          initialSelection[sheet.name] = sheet.selected;
        });
        setSheetSelection(initialSelection);
        setUploadState('sheet-selection');
      } else {
        // Process single sheet or all sheets automatically
        await processSelectedSheets(workbookData, null);
      }
    } catch (error) {
      setUploadState('error');
      setError(error.message);
      onError?.(error.message);
    }
  }, [parseMultiSheetFile, maxFileSize, acceptedTypes, supportMultiSheet]);

  // Process selected sheets
  const processSelectedSheets = async (workbook, selectedSheets) => {
    try {
      const sheetsToProcess = selectedSheets ? 
        workbook.sheets.filter(sheet => selectedSheets[sheet.name]) :
        workbook.sheets;

      if (sheetsToProcess.length === 0) {
        throw new Error('No sheets selected for processing');
      }

      // Combine data from selected sheets
      let combinedData = [];
      let allHeaders = new Set();
      let validationResults = [];

      sheetsToProcess.forEach(sheet => {
        // Validate each sheet
        const validation = validateSheetData(sheet);
        validationResults.push({
          sheetName: sheet.name,
          ...validation
        });

        // Add sheet data to combined data
        sheet.data.forEach(row => {
          combinedData.push({
            ...row,
            _sheet: sheet.name,
            _quarter: sheet.quarter
          });
        });

        // Collect all headers
        sheet.headers.forEach(header => allHeaders.add(header));
      });

      // Set preview data (first 5 rows from each sheet)
      const previewData = {
        headers: Array.from(allHeaders),
        rows: combinedData.slice(0, 5),
        totalRows: combinedData.length,
        sheets: sheetsToProcess.map(sheet => ({
          name: sheet.name,
          rowCount: sheet.rowCount,
          quarter: sheet.quarter
        }))
      };
      setPreviewData(previewData);

      // Check overall validation
      const hasErrors = validationResults.some(result => !result.isValid);
      const combinedValidation = {
        isValid: !hasErrors,
        errors: validationResults.flatMap(result => result.errors),
        warnings: validationResults.flatMap(result => result.warnings),
        sheets: validationResults
      };
      setValidationResults(combinedValidation);

      if (!hasErrors) {
        setUploadState('success');
        onDataImported?.({
          data: combinedData,
          headers: Array.from(allHeaders),
          rowCount: combinedData.length,
          fileName: workbook.fileName,
          fileSize: workbook.fileSize,
          fileType: workbook.fileType,
          validation: combinedValidation,
          sheets: sheetsToProcess,
          isMultiSheet: workbook.isMultiSheet
        });
      } else {
        setUploadState('error');
        setError(`Data validation failed: ${combinedValidation.errors.join(', ')}`);
        onError?.(combinedValidation.errors.join(', '));
      }
    } catch (error) {
      setUploadState('error');
      setError(error.message);
      onError?.(error.message);
    }
  };

  // Handle sheet selection change
  const handleSheetSelectionChange = (sheetName, selected) => {
    setSheetSelection(prev => ({
      ...prev,
      [sheetName]: selected
    }));
  };

  // Process with selected sheets
  const proceedWithSelectedSheets = async () => {
    await processSelectedSheets(workbookData, sheetSelection);
  };

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
    setWorkbookData(null);
    setSheetSelection({});
    setValidationResults(null);
    setPreviewData(null);
    setError(null);
  };

  // Download sample template (enhanced for multi-sheet)
  const downloadTemplate = () => {
    const workbook = XLSX.utils.book_new();
    
    // Q1 2025 Sample Data
    const q1Data = [
      {
        'Quarter_End_Date': '2025-03-31',
        'Division': 'Arts & Sciences',
        'Location': 'Omaha Campus',
        'BE_Faculty_Headcount': 125,
        'BE_Staff_Headcount': 85,
        'Total_Headcount': 210,
        'BE_New_Hires': 5,
        'BE_Departures': 3
      },
      {
        'Quarter_End_Date': '2025-03-31',
        'Division': 'Medicine',
        'Location': 'Omaha Campus',
        'BE_Faculty_Headcount': 95,
        'BE_Staff_Headcount': 140,
        'Total_Headcount': 235,
        'BE_New_Hires': 8,
        'BE_Departures': 4
      }
    ];
    
    // Q4 2024 Sample Data
    const q4Data = [
      {
        'Quarter_End_Date': '2024-12-31',
        'Division': 'Arts & Sciences',
        'Location': 'Omaha Campus',
        'BE_Faculty_Headcount': 120,
        'BE_Staff_Headcount': 82,
        'Total_Headcount': 202,
        'BE_New_Hires': 3,
        'BE_Departures': 2
      },
      {
        'Quarter_End_Date': '2024-12-31',
        'Division': 'Medicine',
        'Location': 'Omaha Campus',
        'BE_Faculty_Headcount': 90,
        'BE_Staff_Headcount': 135,
        'Total_Headcount': 225,
        'BE_New_Hires': 6,
        'BE_Departures': 5
      }
    ];

    // Add sheets
    const q1Sheet = XLSX.utils.json_to_sheet(q1Data);
    const q4Sheet = XLSX.utils.json_to_sheet(q4Data);
    XLSX.utils.book_append_sheet(workbook, q1Sheet, 'Q1_2025_Summary');
    XLSX.utils.book_append_sheet(workbook, q4Sheet, 'Q4_2024_Summary');

    // Add data dictionary
    const dataDictionary = [
      { Field: 'Quarter_End_Date', Description: 'Quarter end date (YYYY-MM-DD)', Example: '2025-03-31' },
      { Field: 'Division', Description: 'Academic or administrative division', Example: 'Arts & Sciences' },
      { Field: 'Location', Description: 'Campus location', Example: 'Omaha Campus' },
      { Field: 'BE_Faculty_Headcount', Description: 'Benefit eligible faculty count', Example: '125' },
      { Field: 'BE_Staff_Headcount', Description: 'Benefit eligible staff count', Example: '85' },
      { Field: 'Total_Headcount', Description: 'Total headcount', Example: '210' },
      { Field: 'BE_New_Hires', Description: 'New benefit eligible hires', Example: '5' },
      { Field: 'BE_Departures', Description: 'Benefit eligible departures', Example: '3' }
    ];
    const dictionarySheet = XLSX.utils.json_to_sheet(dataDictionary);
    XLSX.utils.book_append_sheet(workbook, dictionarySheet, 'Data_Dictionary');

    XLSX.writeFile(workbook, 'multi_sheet_workforce_template.xlsx');
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
          <p className="text-sm text-gray-600">
            {description} {supportMultiSheet && "Supports multi-sheet Excel files."}
          </p>
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
            {isDragActive ? 'Drop the file here' : 'Upload your data file'}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Supports .xlsx, .xls, and .csv files up to {(maxFileSize / 1024 / 1024).toFixed(1)}MB
            {supportMultiSheet && ". Multi-sheet Excel files supported."}
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
            {uploadState === 'uploading' ? 'Processing file...' : 'Validating data...'}
          </p>
          <p className="text-sm text-blue-700">{uploadedFile?.name}</p>
        </div>
      )}

      {/* Sheet Selection */}
      {uploadState === 'sheet-selection' && workbookData && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="text-blue-600" size={20} />
            <h4 className="font-medium text-gray-900">Select Sheets to Process</h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Found {workbookData.sheets.length} sheets. Select which sheets to include in the import.
          </p>
          
          <div className="space-y-3 mb-6">
            {workbookData.sheets.map((sheet, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`sheet-${index}`}
                    checked={sheetSelection[sheet.name] || false}
                    onChange={(e) => handleSheetSelectionChange(sheet.name, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`sheet-${index}`} className="flex-1">
                    <div className="font-medium text-gray-900">{sheet.name}</div>
                    <div className="text-sm text-gray-600">
                      {sheet.rowCount} rows
                      {sheet.quarter && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <Calendar size={12} />
                          {sheet.quarter}
                        </span>
                      )}
                    </div>
                  </label>
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  {sheet.hasEmployeeData && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Employee Data</span>
                  )}
                  {sheet.hasAggregateData && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Aggregate Data</span>
                  )}
                  {sheet.hasQuarterData && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Quarter Data</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={proceedWithSelectedSheets}
              disabled={Object.values(sheetSelection).every(selected => !selected)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Check size={16} />
              Process Selected Sheets
            </button>
            <button
              onClick={clearUpload}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
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
                {workbookData?.isMultiSheet && (
                  <p className="text-sm text-green-600">
                    Processed {Object.values(sheetSelection).filter(Boolean).length} sheets
                  </p>
                )}
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
                <strong>Data Summary:</strong> {previewData?.totalRows || 0} total rows processed
                {workbookData?.isMultiSheet && ` from ${previewData?.sheets?.length || 0} sheets`}
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
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">
              Data Preview ({previewData.totalRows} total rows)
            </h4>
            {workbookData?.isMultiSheet && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Layers size={16} />
                {previewData.sheets?.length || 0} sheets processed
              </div>
            )}
          </div>
          
          {workbookData?.isMultiSheet && previewData.sheets && (
            <div className="mb-3 flex flex-wrap gap-2">
              {previewData.sheets.map((sheet, index) => (
                <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {sheet.name} ({sheet.rowCount} rows)
                  {sheet.quarter && ` - ${sheet.quarter}`}
                </span>
              ))}
            </div>
          )}
          
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

export default MultiSheetFileUploader;