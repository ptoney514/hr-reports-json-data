/**
 * Column Resolver Utility
 *
 * Resolves column values from Excel/JSON rows using the alias chains
 * defined in column-mappings.json. Tries each alias in priority order
 * and returns the first match.
 *
 * Usage:
 *   const { resolveColumn, createResolver } = require('./column-resolver');
 *
 *   // One-off resolution
 *   const value = resolveColumn(row, 'assignment_category');
 *
 *   // Create a reusable resolver for a specific script context
 *   const resolve = createResolver('workforce-to-postgres');
 *   const category = resolve(row, 'assignment_category');
 */

const { getColumnMappings } = require('./config-loader');

/**
 * Resolve a column value from a row using the alias chain for the given field.
 *
 * @param {Object} row - The data row (from Excel/JSON)
 * @param {string} fieldName - The canonical field name from column-mappings.json
 * @param {Object} options
 * @param {boolean} options.trim - Trim whitespace from string results (default: true)
 * @param {boolean} options.normalize - Uppercase string results (default: false)
 * @returns {*} The resolved value, or null if no alias matches
 */
function resolveColumn(row, fieldName, { trim = true, normalize = false } = {}) {
  if (!row) return null;

  const mappings = getColumnMappings();
  const fieldDef = mappings.fields[fieldName];

  if (!fieldDef) {
    return null;
  }

  const aliases = fieldDef.aliases;
  if (!aliases || aliases.length === 0) {
    return null;
  }

  for (const alias of aliases) {
    const value = row[alias];
    if (value !== undefined && value !== null) {
      if (trim && typeof value === 'string') {
        const trimmed = value.trim();
        return normalize ? trimmed.toUpperCase() : trimmed;
      }
      return value;
    }
  }

  return null;
}

/**
 * Create a resolver function scoped to a specific script context.
 * Only resolves fields that are used by the given script.
 *
 * @param {string} scriptName - The script name (e.g., 'workforce-to-postgres')
 * @returns {Function} A resolver function: (row, fieldName, options?) => value
 */
function createResolver(scriptName) {
  const mappings = getColumnMappings();
  const scopedFields = {};

  for (const [fieldName, fieldDef] of Object.entries(mappings.fields)) {
    if (fieldDef.scripts && fieldDef.scripts.includes(scriptName)) {
      scopedFields[fieldName] = fieldDef;
    }
  }

  return function resolve(row, fieldName, options = {}) {
    if (!row) return null;

    const fieldDef = scopedFields[fieldName];
    if (!fieldDef) {
      // Fall back to global resolution if not in scope
      return resolveColumn(row, fieldName, options);
    }

    const { trim = true, normalize = false } = options;

    for (const alias of fieldDef.aliases) {
      const value = row[alias];
      if (value !== undefined && value !== null) {
        if (trim && typeof value === 'string') {
          const trimmed = value.trim();
          return normalize ? trimmed.toUpperCase() : trimmed;
        }
        return value;
      }
    }

    return null;
  };
}

/**
 * Resolve multiple columns at once from a row.
 *
 * @param {Object} row - The data row
 * @param {string[]} fieldNames - Array of canonical field names
 * @param {Object} options - Options passed to resolveColumn
 * @returns {Object} Map of fieldName -> resolved value
 */
function resolveColumns(row, fieldNames, options = {}) {
  const result = {};
  for (const name of fieldNames) {
    result[name] = resolveColumn(row, name, options);
  }
  return result;
}

/**
 * Validate that required column headers are present in sheet data.
 *
 * Uses the first row of sheetData to determine available headers,
 * then checks that every field marked required_by this script
 * has at least one alias present in those headers.
 *
 * @param {Object[]} sheetData - Array of row objects (from sheetToJSON)
 * @param {string} scriptName - The script name (e.g., 'workforce-to-postgres')
 * @returns {{ valid: boolean, missing: string[], resolved: Object }}
 */
function validateHeaders(sheetData, scriptName) {
  const mappings = getColumnMappings();
  const headers = new Set();

  // Collect all keys from the first few rows to handle sparse headers
  const sampleSize = Math.min(sheetData.length, 5);
  for (let i = 0; i < sampleSize; i++) {
    if (sheetData[i]) {
      Object.keys(sheetData[i]).forEach(k => headers.add(k));
    }
  }

  const missing = [];
  const resolved = {};

  for (const [fieldName, fieldDef] of Object.entries(mappings.fields)) {
    if (!fieldDef.required_by || !fieldDef.required_by.includes(scriptName)) {
      continue;
    }

    let found = false;
    for (const alias of fieldDef.aliases) {
      if (headers.has(alias)) {
        resolved[fieldName] = alias;
        found = true;
        break;
      }
    }

    if (!found) {
      missing.push({
        field: fieldName,
        tried: fieldDef.aliases
      });
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    resolved
  };
}

module.exports = {
  resolveColumn,
  createResolver,
  resolveColumns,
  validateHeaders
};
