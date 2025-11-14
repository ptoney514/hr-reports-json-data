/**
 * Data Validation Utilities
 *
 * Functions for:
 * - Validating data quality and consistency
 * - Checking required fields
 * - Validating data types and formats
 * - Cross-referencing data sources
 */

/**
 * Check if value is empty (null, undefined, empty string, or whitespace)
 *
 * @param {*} value - Value to check
 * @returns {boolean} True if value is empty
 */
function isEmpty(value) {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (typeof value === 'string' && value.trim() === '')
  );
}

/**
 * Validate required fields in a row
 *
 * @param {Object} row - Row object to validate
 * @param {string[]} requiredFields - Array of required field names
 * @returns {Object} Validation result with isValid and errors
 */
function validateRequiredFields(row, requiredFields) {
  const errors = [];

  requiredFields.forEach(field => {
    if (isEmpty(row[field])) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate date format (YYYY-MM-DD)
 *
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} True if valid date format
 */
function isValidDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return false;
  }

  // Check format YYYY-MM-DD
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(dateStr)) {
    return false;
  }

  // Check if date is actually valid
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Validate numeric value within range
 *
 * @param {number} value - Value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {boolean} True if valid
 */
function isInRange(value, min, max) {
  if (typeof value !== 'number' || isNaN(value)) {
    return false;
  }

  return value >= min && value <= max;
}

/**
 * Validate email format
 *
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Validate data types in row
 *
 * @param {Object} row - Row to validate
 * @param {Object} schema - Schema with field: type mappings
 * @returns {Object} Validation result
 *
 * @example
 * validateDataTypes(
 *   { age: 25, name: 'John', active: true },
 *   { age: 'number', name: 'string', active: 'boolean' }
 * )
 */
function validateDataTypes(row, schema) {
  const errors = [];

  Object.entries(schema).forEach(([field, expectedType]) => {
    const value = row[field];

    if (isEmpty(value)) {
      return; // Skip empty values (handled by required field validation)
    }

    const actualType = typeof value;

    if (actualType !== expectedType) {
      errors.push(`Field "${field}" expected ${expectedType}, got ${actualType}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check for duplicate values in array of rows
 *
 * @param {Array<Object>} rows - Array of rows to check
 * @param {string} uniqueField - Field that should be unique
 * @returns {Object} Result with duplicates found
 */
function findDuplicates(rows, uniqueField) {
  const seen = new Map();
  const duplicates = [];

  rows.forEach((row, index) => {
    const value = row[uniqueField];

    if (isEmpty(value)) {
      return; // Skip empty values
    }

    if (seen.has(value)) {
      duplicates.push({
        value,
        firstIndex: seen.get(value),
        duplicateIndex: index
      });
    } else {
      seen.set(value, index);
    }
  });

  return {
    hasDuplicates: duplicates.length > 0,
    duplicates,
    count: duplicates.length
  };
}

/**
 * Validate workforce data row
 *
 * @param {Object} row - Workforce data row
 * @returns {Object} Validation result
 */
function validateWorkforceRow(row) {
  const errors = [];

  // Required fields for workforce data
  const required = ['category', 'count'];

  required.forEach(field => {
    if (isEmpty(row[field])) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate count is positive number
  if (row.count !== undefined && (typeof row.count !== 'number' || row.count < 0)) {
    errors.push('Count must be a positive number');
  }

  // Validate category is allowed value
  const allowedCategories = [
    'Faculty',
    'Staff',
    'Administration',
    'Graduate Assistants',
    'Student Workers',
    'Total'
  ];

  if (row.category && !allowedCategories.includes(row.category)) {
    errors.push(`Invalid category: ${row.category}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate termination data row
 *
 * @param {Object} row - Termination data row
 * @returns {Object} Validation result
 */
function validateTerminationRow(row) {
  const errors = [];

  // Required fields
  const required = ['termination_date', 'termination_type', 'category'];

  required.forEach(field => {
    if (isEmpty(row[field])) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate date format
  if (row.termination_date && !isValidDate(row.termination_date)) {
    errors.push('Invalid termination_date format (expected YYYY-MM-DD)');
  }

  // Validate termination type
  const allowedTypes = ['Voluntary', 'Involuntary', 'Retirement'];
  if (row.termination_type && !allowedTypes.includes(row.termination_type)) {
    errors.push(`Invalid termination_type: ${row.termination_type}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate exit survey data row
 *
 * @param {Object} row - Exit survey data row
 * @returns {Object} Validation result
 */
function validateExitSurveyRow(row) {
  const errors = [];

  // Required fields
  const required = ['quarter', 'response_type'];

  required.forEach(field => {
    if (isEmpty(row[field])) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate quarter format (e.g., FY25_Q1)
  const quarterPattern = /^FY\d{2}_Q[1-4]$/;
  if (row.quarter && !quarterPattern.test(row.quarter)) {
    errors.push('Invalid quarter format (expected FY##_Q#)');
  }

  // Validate satisfaction rating if present
  if (row.satisfaction_rating !== undefined) {
    if (!isInRange(row.satisfaction_rating, 1, 5)) {
      errors.push('Satisfaction rating must be between 1 and 5');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate data consistency across sources
 *
 * @param {Object} sources - Object with different data sources
 * @param {Array} sources.workforce - Workforce data
 * @param {Array} sources.terminations - Termination data
 * @param {Array} sources.exitSurveys - Exit survey data
 * @returns {Object} Consistency validation result
 */
function validateCrossSourceConsistency(sources) {
  const errors = [];
  const warnings = [];

  const { workforce, terminations, exitSurveys } = sources;

  // Check terminations vs exit surveys alignment
  if (terminations && exitSurveys) {
    const terminationCount = terminations.length;
    const surveyResponseCount = exitSurveys.length;
    const responseRate = (surveyResponseCount / terminationCount * 100).toFixed(1);

    if (surveyResponseCount > terminationCount) {
      errors.push(
        `More survey responses (${surveyResponseCount}) than terminations (${terminationCount})`
      );
    }

    if (responseRate < 20) {
      warnings.push(`Low response rate: ${responseRate}%`);
    }
  }

  // Check for date range consistency
  if (terminations && terminations.length > 0) {
    const dates = terminations
      .filter(t => t.termination_date)
      .map(t => new Date(t.termination_date));

    if (dates.length > 0) {
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));

      const daysDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24);

      // Warn if terminations span more than 1 year
      if (daysDiff > 365) {
        warnings.push(`Terminations span ${Math.round(daysDiff)} days (> 1 year)`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Create validation summary report
 *
 * @param {Object} results - Validation results
 * @returns {string} Markdown report
 */
function createValidationReport(results) {
  const {
    totalRows = 0,
    validRows = 0,
    invalidRows = 0,
    errors = [],
    warnings = []
  } = results;

  let report = '# Data Validation Report\n\n';
  report += `**Total Rows:** ${totalRows}\n`;
  report += `**Valid Rows:** ${validRows}\n`;
  report += `**Invalid Rows:** ${invalidRows}\n`;
  report += `**Success Rate:** ${((validRows / totalRows) * 100).toFixed(1)}%\n\n`;

  if (errors.length > 0) {
    report += '## Errors\n\n';
    errors.forEach(error => {
      report += `❌ ${error}\n\n`;
    });
  }

  if (warnings.length > 0) {
    report += '## Warnings\n\n';
    warnings.forEach(warning => {
      report += `⚠️ ${warning}\n\n`;
    });
  }

  if (errors.length === 0 && warnings.length === 0) {
    report += '✅ All validation checks passed!\n\n';
  }

  return report;
}

module.exports = {
  isEmpty,
  validateRequiredFields,
  isValidDate,
  isInRange,
  isValidEmail,
  validateDataTypes,
  findDuplicates,
  validateWorkforceRow,
  validateTerminationRow,
  validateExitSurveyRow,
  validateCrossSourceConsistency,
  createValidationReport
};
