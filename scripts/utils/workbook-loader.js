/**
 * Workbook Loader - Shared Excel loading and sheet discovery patterns
 *
 * Extracts duplicated Excel loading patterns from 6+ ETL scripts:
 * - loadWorkbook() with sheet validation
 * - findSheet() for named sheet lookup
 * - autoDetectLargestSheet() for largest-data sheet detection
 * - findDefaultInputFile() for glob-based file discovery
 * - validateRequiredSheets() for expected sheet verification
 */

const fs = require('fs');
const path = require('path');
const {
  loadExcelFile,
  getSheetNames,
  sheetToJSON
} = require('./excel-helpers');
const { colors } = require('./formatting');

/**
 * Load an Excel workbook and return workbook + sheet names
 *
 * @param {string} filePath - Path to Excel file
 * @returns {{ workbook: Object, sheetNames: string[] }}
 */
function loadWorkbook(filePath) {
  const workbook = loadExcelFile(filePath);
  const sheetNames = getSheetNames(workbook);

  console.log(`${colors.blue}Validating sheets...${colors.reset}`);
  console.log(`  Found ${sheetNames.length} sheets`);

  return { workbook, sheetNames };
}

/**
 * Find the first matching sheet name from a list of candidates
 *
 * @param {Object} workbook - XLSX workbook object
 * @param {string[]} candidateNames - Sheet names to try, in priority order
 * @returns {string|null} First matching sheet name, or null
 */
function findSheet(workbook, candidateNames) {
  const sheetNames = getSheetNames(workbook);
  for (const name of candidateNames) {
    if (sheetNames.includes(name)) return name;
    // Case-insensitive fallback
    const match = sheetNames.find(s => s.toLowerCase() === name.toLowerCase());
    if (match) return match;
  }
  return null;
}

/**
 * Auto-detect the sheet with the most rows (likely the main data sheet)
 *
 * Duplicated in demographics, terminations, workforce, and other ETL scripts.
 *
 * @param {Object} workbook - XLSX workbook object
 * @returns {{ sheetName: string, rowCount: number }}
 */
function autoDetectLargestSheet(workbook) {
  const sheetNames = getSheetNames(workbook);
  let bestSheet = sheetNames[0];
  let maxRows = 0;

  sheetNames.forEach(name => {
    const rows = sheetToJSON(workbook, name);
    if (rows.length > maxRows) {
      maxRows = rows.length;
      bestSheet = name;
    }
  });

  return { sheetName: bestSheet, rowCount: maxRows };
}

/**
 * Find a default input file by looking in a directory for xlsx files
 *
 * Pattern duplicated in demographics, turnover-metrics, recruiting-metrics,
 * and turnover-rates scripts.
 *
 * @param {string} directory - Directory to search in
 * @param {string|string[]} [preferredFiles] - Preferred filename(s) to look for first
 * @returns {string|null} Full path to found file, or null
 */
function findDefaultInputFile(directory, preferredFiles) {
  const candidates = Array.isArray(preferredFiles) ? preferredFiles
    : preferredFiles ? [preferredFiles]
    : [];

  // Try preferred files first
  for (const candidate of candidates) {
    const fullPath = path.join(directory, candidate);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  // Fall back to any xlsx file in the directory
  if (fs.existsSync(directory)) {
    const files = fs.readdirSync(directory)
      .filter(f => f.endsWith('.xlsx') && !f.startsWith('~'))
      .sort();

    if (files.length > 0) {
      return path.join(directory, files[0]);
    }
  }

  return null;
}

/**
 * Validate that expected sheets exist in a workbook
 *
 * Logs warnings for missing sheets but does not throw.
 *
 * @param {Object} workbook - XLSX workbook object
 * @param {string[]} expectedSheets - List of required sheet names
 * @returns {{ present: string[], missing: string[] }}
 */
function validateRequiredSheets(workbook, expectedSheets) {
  const sheetNames = getSheetNames(workbook);
  const present = expectedSheets.filter(s => sheetNames.includes(s));
  const missing = expectedSheets.filter(s => !sheetNames.includes(s));

  if (missing.length > 0) {
    console.warn(`${colors.yellow}Warning: Missing expected sheets:${colors.reset} ${missing.join(', ')}`);
  }

  return { present, missing };
}

module.exports = {
  loadWorkbook,
  findSheet,
  autoDetectLargestSheet,
  findDefaultInputFile,
  validateRequiredSheets
};
