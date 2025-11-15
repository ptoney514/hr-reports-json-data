/**
 * PII Removal Utilities
 *
 * Functions for:
 * - Detecting personally identifiable information (PII)
 * - Anonymizing sensitive data
 * - Creating consistent hashed IDs
 * - Redacting comments and free text
 *
 * IMPORTANT: This is a safety layer, not a guarantee.
 * Manual review is still required before committing data.
 */

const crypto = require('crypto');

/**
 * List of PII field names to remove or anonymize
 * These are common HR data fields that contain sensitive information
 */
const PII_FIELDS = [
  // Names
  'first_name', 'firstName', 'First Name',
  'last_name', 'lastName', 'Last Name',
  'full_name', 'fullName', 'Full Name', 'Name',
  'preferred_name', 'preferredName', 'Preferred Name',
  'middle_name', 'middleName', 'Middle Name',

  // Contact info
  'email', 'Email', 'email_address', 'Email Address',
  'phone', 'Phone', 'phone_number', 'Phone Number',
  'cell_phone', 'cellPhone', 'Cell Phone',
  'mobile', 'Mobile',
  'address', 'Address', 'street_address', 'Street Address',
  'city', 'City', 'state', 'State', 'zip', 'Zip', 'postal_code',

  // Identifiers
  'ssn', 'SSN', 'social_security', 'Social Security',
  'employee_id', 'employeeId', 'Employee ID', 'Empl ID',
  'employee_number', 'employeeNumber', 'Employee Number',
  'badge_number', 'badgeNumber', 'Badge Number',
  'peoplesoft_id', 'peoplesoftId', 'PeopleSoft ID',
  'workday_id', 'workdayId', 'Workday ID',

  // Personal details
  'date_of_birth', 'dateOfBirth', 'DOB', 'Birth Date',
  'birth_date', 'birthDate',
  'age', 'Age',
  'gender', 'Gender', 'sex', 'Sex',
  'marital_status', 'maritalStatus', 'Marital Status',

  // Financial
  'salary', 'Salary', 'base_salary', 'Base Salary',
  'compensation', 'Compensation',
  'pay_rate', 'payRate', 'Pay Rate',
  'bank_account', 'bankAccount', 'Bank Account',
  'routing_number', 'routingNumber',

  // Health
  'disability', 'Disability',
  'medical_condition', 'medicalCondition',
  'health_plan', 'healthPlan',

  // Comments (may contain PII)
  'comments', 'Comments',
  'notes', 'Notes',
  'description', 'Description',
  'reason', 'Reason',
  'manager_notes', 'managerNotes',
  'exit_comments', 'exitComments'
];

/**
 * Fields that should be kept but hashed for consistency
 * These allow tracking without revealing identity
 */
const HASH_FIELDS = [
  'employee_id', 'employeeId', 'Employee ID', 'Empl ID',
  'employee_number', 'employeeNumber', 'Employee Number',
  'peoplesoft_id', 'peoplesoftId', 'PeopleSoft ID'
];

/**
 * Create consistent hash of a value
 * Uses SHA-256 for one-way hashing
 *
 * @param {string} value - Value to hash
 * @param {string} salt - Optional salt for additional security
 * @returns {string} Hashed value (first 12 characters)
 *
 * @example
 * hashValue('12345') // Returns: 'a8d5f3b2c1e4'
 * hashValue('12345', 'my-salt') // Returns: 'different-hash'
 */
function hashValue(value, salt = 'creighton-hr-2024') {
  if (!value) return '';

  const hash = crypto
    .createHash('sha256')
    .update(value.toString() + salt)
    .digest('hex');

  // Return first 12 characters for readability
  return hash.substring(0, 12);
}

/**
 * Check if field name indicates PII
 *
 * @param {string} fieldName - Name of field to check
 * @returns {boolean} True if field appears to contain PII
 */
function isPIIField(fieldName) {
  const normalized = fieldName.toLowerCase().trim();

  return PII_FIELDS.some(piiField =>
    normalized === piiField.toLowerCase() ||
    normalized.includes(piiField.toLowerCase().replace(/\s+/g, '_'))
  );
}

/**
 * Check if field should be hashed instead of removed
 *
 * @param {string} fieldName - Name of field to check
 * @returns {boolean} True if field should be hashed
 */
function shouldHashField(fieldName) {
  const normalized = fieldName.toLowerCase().trim();

  return HASH_FIELDS.some(hashField =>
    normalized === hashField.toLowerCase() ||
    normalized.includes(hashField.toLowerCase().replace(/\s+/g, '_'))
  );
}

/**
 * Remove PII from a single row object
 *
 * @param {Object} row - Row object with potential PII
 * @param {Object} options - Options for PII removal
 * @param {boolean} options.hashIds - Hash employee IDs instead of removing (default: true)
 * @param {string[]} options.keepFields - Field names to keep even if PII (default: [])
 * @param {string[]} options.removeFields - Additional fields to remove (default: [])
 * @returns {Object} Row with PII removed
 */
function removePII(row, options = {}) {
  const {
    hashIds = true,
    keepFields = [],
    removeFields = []
  } = options;

  const cleaned = {};

  Object.keys(row).forEach(key => {
    const value = row[key];

    // Keep explicitly whitelisted fields
    if (keepFields.includes(key)) {
      cleaned[key] = value;
      return;
    }

    // Remove explicitly blacklisted fields
    if (removeFields.includes(key)) {
      return;
    }

    // Hash employee IDs if option enabled
    if (hashIds && shouldHashField(key) && value) {
      cleaned[`${key}_hash`] = hashValue(value);
      return;
    }

    // Remove PII fields
    if (isPIIField(key)) {
      return;
    }

    // Keep non-PII field
    cleaned[key] = value;
  });

  return cleaned;
}

/**
 * Remove PII from array of rows
 *
 * @param {Array<Object>} rows - Array of row objects
 * @param {Object} options - Options for PII removal
 * @returns {Array<Object>} Array with PII removed
 */
function removePIIFromRows(rows, options = {}) {
  return rows.map(row => removePII(row, options));
}

/**
 * Redact text that may contain names or identifying information
 * Replaces with [REDACTED] placeholder
 *
 * @param {string} text - Text to redact
 * @param {Object} options - Redaction options
 * @param {boolean} options.preserveLength - Keep text length visible (default: false)
 * @returns {string} Redacted text
 */
function redactText(text, options = {}) {
  if (!text) return '';

  const { preserveLength = false } = options;

  if (preserveLength) {
    // Replace each character with 'X', preserving spaces
    return text.replace(/[^\s]/g, 'X');
  }

  return '[REDACTED]';
}

/**
 * Scan row for potential PII patterns (emails, phone numbers, SSNs)
 *
 * @param {Object} row - Row to scan
 * @returns {Object} Object with warnings about potential PII
 */
function scanForPII(row) {
  const warnings = [];

  // Email pattern
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

  // Phone pattern (various formats)
  const phonePattern = /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\(\d{3}\)\s*\d{3}[-.\s]?\d{4})/g;

  // SSN pattern
  const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/g;

  Object.entries(row).forEach(([key, value]) => {
    if (!value) return;

    const valueStr = value.toString();

    if (emailPattern.test(valueStr)) {
      warnings.push(`Potential email found in field: ${key}`);
    }

    if (phonePattern.test(valueStr)) {
      warnings.push(`Potential phone number found in field: ${key}`);
    }

    if (ssnPattern.test(valueStr)) {
      warnings.push(`Potential SSN found in field: ${key}`);
    }
  });

  return {
    hasPII: warnings.length > 0,
    warnings
  };
}

/**
 * Generate anonymized employee ID
 * Format: EMP-XXXXX (5-digit number based on hash)
 *
 * @param {string|number} originalId - Original employee ID
 * @returns {string} Anonymized ID
 */
function generateAnonymousId(originalId) {
  const hash = hashValue(originalId.toString());
  const numericHash = parseInt(hash, 16);
  const anonymousNumber = (numericHash % 90000) + 10000; // 5-digit number (10000-99999)

  return `EMP-${anonymousNumber}`;
}

/**
 * Create PII removal report
 *
 * @param {Object} stats - Stats about PII removal
 * @returns {string} Markdown report
 */
function createPIIReport(stats) {
  const {
    totalRows = 0,
    fieldsRemoved = [],
    fieldsHashed = [],
    warnings = []
  } = stats;

  let report = '# PII Removal Report\n\n';
  report += `**Total Rows Processed:** ${totalRows}\n\n`;

  if (fieldsRemoved.length > 0) {
    report += '## Fields Removed\n\n';
    fieldsRemoved.forEach(field => {
      report += `- ${field}\n`;
    });
    report += '\n';
  }

  if (fieldsHashed.length > 0) {
    report += '## Fields Hashed\n\n';
    fieldsHashed.forEach(field => {
      report += `- ${field}\n`;
    });
    report += '\n';
  }

  if (warnings.length > 0) {
    report += '## Warnings\n\n';
    warnings.forEach(warning => {
      report += `⚠️ ${warning}\n\n`;
    });
  }

  report += '---\n\n';
  report += '**IMPORTANT:** Manual review still required before committing data.\n';

  return report;
}

module.exports = {
  PII_FIELDS,
  HASH_FIELDS,
  hashValue,
  isPIIField,
  shouldHashField,
  removePII,
  removePIIFromRows,
  redactText,
  scanForPII,
  generateAnonymousId,
  createPIIReport
};
