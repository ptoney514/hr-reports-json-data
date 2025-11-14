/**
 * Excel Helpers - Utilities for reading and processing Excel files
 *
 * Functions for:
 * - Converting Excel serial dates to JavaScript Date objects
 * - Reading Excel files and sheets
 * - Parsing workbooks into JSON format
 */

const XLSX = require('xlsx');

/**
 * Convert Excel serial date to JavaScript Date
 * Excel stores dates as days since 1900-01-01 (with leap year bug)
 *
 * @param {number} serial - Excel serial date number
 * @returns {Date|null} JavaScript Date object or null if invalid
 *
 * @example
 * excelDateToJSDate(44927) // Returns: Date('2023-01-01')
 * excelDateToJSDate(45000) // Returns: Date('2023-03-14')
 */
function excelDateToJSDate(serial) {
  if (!serial || typeof serial !== 'number') {
    return null;
  }

  // Excel epoch starts at 1900-01-01
  // JavaScript uses Unix epoch (1970-01-01)
  // Excel incorrectly treats 1900 as a leap year, so subtract 1 for dates after Feb 28, 1900
  const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899 (one day before Excel epoch)
  const jsDate = new Date(excelEpoch.getTime() + serial * 86400000); // 86400000 ms in a day

  return jsDate;
}

/**
 * Format date as YYYY-MM-DD string
 *
 * @param {Date} date - JavaScript Date object
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  if (!date || !(date instanceof Date) || isNaN(date)) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Load Excel file and return workbook object
 *
 * @param {string} filePath - Path to Excel file (.xlsx, .xls, .csv)
 * @returns {Object} XLSX workbook object
 * @throws {Error} If file cannot be read
 */
function loadExcelFile(filePath) {
  try {
    const workbook = XLSX.readFile(filePath, {
      cellDates: false, // We'll handle date conversion manually
      cellText: false,  // Get raw cell values
      cellNF: false     // Don't get number formats
    });

    return workbook;
  } catch (error) {
    throw new Error(`Failed to read Excel file: ${filePath}\n${error.message}`);
  }
}

/**
 * Get sheet names from workbook
 *
 * @param {Object} workbook - XLSX workbook object
 * @returns {string[]} Array of sheet names
 */
function getSheetNames(workbook) {
  return workbook.SheetNames || [];
}

/**
 * Convert Excel sheet to JSON array
 *
 * @param {Object} workbook - XLSX workbook object
 * @param {string} sheetName - Name of sheet to convert
 * @param {Object} options - Conversion options
 * @param {boolean} options.header - Use first row as headers (default: true)
 * @param {string} options.defval - Default value for empty cells (default: '')
 * @returns {Array<Object>} Array of row objects
 */
function sheetToJSON(workbook, sheetName, options = {}) {
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found in workbook`);
  }

  const defaultOptions = {
    defval: '', // Default value for empty cells
    raw: true,  // Keep raw values (we'll convert dates manually)
    ...options
  };

  const data = XLSX.utils.sheet_to_json(sheet, defaultOptions);

  return data;
}

/**
 * Detect if a value is an Excel date serial number
 * Excel dates are typically between 1 (1900-01-01) and 73050 (2100-01-01)
 *
 * @param {*} value - Value to check
 * @returns {boolean} True if value appears to be Excel date
 */
function isExcelDate(value) {
  return typeof value === 'number' && value >= 1 && value <= 73050;
}

/**
 * Auto-convert Excel dates in a row object
 * Detects numeric values that look like dates and converts them
 *
 * @param {Object} row - Row object with potential date values
 * @param {string[]} dateColumns - Column names known to contain dates
 * @returns {Object} Row with dates converted
 */
function convertDatesInRow(row, dateColumns = []) {
  const converted = { ...row };

  // Convert known date columns
  dateColumns.forEach(col => {
    if (converted[col] && isExcelDate(converted[col])) {
      converted[col] = formatDate(excelDateToJSDate(converted[col]));
    }
  });

  return converted;
}

/**
 * Read Excel file and convert specific sheet to JSON
 * Convenience function that combines loadExcelFile and sheetToJSON
 *
 * @param {string} filePath - Path to Excel file
 * @param {string} sheetName - Sheet name (defaults to first sheet)
 * @param {Object} options - Options for conversion
 * @returns {Array<Object>} JSON array of rows
 */
function readExcelToJSON(filePath, sheetName = null, options = {}) {
  const workbook = loadExcelFile(filePath);
  const actualSheetName = sheetName || workbook.SheetNames[0];

  return sheetToJSON(workbook, actualSheetName, options);
}

/**
 * Get column headers from Excel sheet
 *
 * @param {Object} workbook - XLSX workbook object
 * @param {string} sheetName - Name of sheet
 * @returns {string[]} Array of column header names
 */
function getColumnHeaders(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }

  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  return data[0] || [];
}

module.exports = {
  excelDateToJSDate,
  formatDate,
  loadExcelFile,
  getSheetNames,
  sheetToJSON,
  isExcelDate,
  convertDatesInRow,
  readExcelToJSON,
  getColumnHeaders
};
