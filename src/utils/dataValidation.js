import { validateTurnoverData } from '../database/schemas/turnoverSchema.js';
import { validateWorkforceData } from '../database/schemas/workforceSchema.js';
import _ from 'lodash';
import { isValid, parseISO, isAfter, isBefore } from 'date-fns';

/**
 * Comprehensive Data Validation and Sanitization Layer
 * 
 * This module provides enterprise-grade data validation, sanitization,
 * and transformation capabilities for the HR Reports application.
 */

export class DataValidator {
  constructor() {
    this.validationRules = new Map();
    this.sanitizationRules = new Map();
    this.customValidators = new Map();
    this.errors = [];
    this.warnings = [];
    
    this.initializeDefaultRules();
  }

  /**
   * Initialize default validation and sanitization rules
   */
  initializeDefaultRules() {
    // Basic data type validators
    this.addCustomValidator('email', (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    });

    this.addCustomValidator('phone', (value) => {
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
    });

    this.addCustomValidator('ssn', (value) => {
      const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
      return ssnRegex.test(value);
    });

    this.addCustomValidator('currency', (value) => {
      return !isNaN(parseFloat(value)) && parseFloat(value) >= 0;
    });

    this.addCustomValidator('percentage', (value) => {
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0 && num <= 100;
    });

    this.addCustomValidator('positiveInteger', (value) => {
      return Number.isInteger(value) && value >= 0;
    });

    // Date validators
    this.addCustomValidator('isoDate', (value) => {
      try {
        const date = parseISO(value);
        return isValid(date);
      } catch {
        return false;
      }
    });

    this.addCustomValidator('futureDateOnly', (value) => {
      try {
        const date = parseISO(value);
        return isValid(date) && isAfter(date, new Date());
      } catch {
        return false;
      }
    });

    this.addCustomValidator('pastDateOnly', (value) => {
      try {
        const date = parseISO(value);
        return isValid(date) && isBefore(date, new Date());
      } catch {
        return false;
      }
    });

    // HR-specific validators
    this.addCustomValidator('employeeId', (value) => {
      // Alphanumeric, 6-12 characters
      return /^[A-Za-z0-9]{6,12}$/.test(value);
    });

    this.addCustomValidator('department', (value) => {
      const validDepartments = [
        'HR', 'IT', 'Finance', 'Marketing', 'Sales', 'Operations',
        'Engineering', 'Research', 'Administration', 'Academic Affairs',
        'Student Services', 'Facilities', 'Security', 'Legal'
      ];
      return validDepartments.includes(value) || value.length > 0;
    });

    this.addCustomValidator('employeeType', (value) => {
      const validTypes = ['Faculty', 'Staff', 'Student', 'Contractor', 'Intern', 'Temporary'];
      return validTypes.includes(value);
    });

    this.addCustomValidator('location', (value) => {
      // Basic location validation - at least 2 characters
      return typeof value === 'string' && value.length >= 2;
    });
  }

  /**
   * Add custom validation rule
   */
  addCustomValidator(name, validator) {
    this.customValidators.set(name, validator);
  }

  /**
   * Validate complete data structure using schema
   */
  async validateDataStructure(data, dataType) {
    this.clearErrors();
    
    try {
      let isValid = false;
      let validationErrors = [];

      switch (dataType) {
        case 'workforce':
          isValid = validateWorkforceData(data);
          validationErrors = validateWorkforceData.errors || [];
          break;
        case 'turnover':
          isValid = validateTurnoverData(data);
          validationErrors = validateTurnoverData.errors || [];
          break;
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }

      if (!isValid) {
        this.errors.push(...validationErrors.map(error => ({
          type: 'schema',
          field: error.instancePath || error.dataPath,
          message: error.message,
          value: error.data,
          severity: 'error'
        })));
      }

      return {
        isValid,
        errors: this.errors,
        warnings: this.warnings
      };
    } catch (error) {
      this.errors.push({
        type: 'validation',
        message: `Validation failed: ${error.message}`,
        severity: 'error'
      });
      
      return {
        isValid: false,
        errors: this.errors,
        warnings: this.warnings
      };
    }
  }

  /**
   * Validate individual fields with custom rules
   */
  validateField(value, rules, fieldName = 'field') {
    const fieldErrors = [];
    const fieldWarnings = [];

    if (!Array.isArray(rules)) {
      rules = [rules];
    }

    for (const rule of rules) {
      try {
        if (typeof rule === 'string') {
          // Use predefined validator
          if (this.customValidators.has(rule)) {
            const validator = this.customValidators.get(rule);
            if (!validator(value)) {
              fieldErrors.push({
                type: 'custom',
                field: fieldName,
                rule,
                message: `${fieldName} failed ${rule} validation`,
                value,
                severity: 'error'
              });
            }
          } else {
            fieldWarnings.push({
              type: 'validation',
              field: fieldName,
              message: `Unknown validation rule: ${rule}`,
              severity: 'warning'
            });
          }
        } else if (typeof rule === 'function') {
          // Use custom function
          if (!rule(value)) {
            fieldErrors.push({
              type: 'custom',
              field: fieldName,
              message: `${fieldName} failed custom validation`,
              value,
              severity: 'error'
            });
          }
        } else if (typeof rule === 'object') {
          // Use rule object
          const result = this.validateWithRuleObject(value, rule, fieldName);
          fieldErrors.push(...result.errors);
          fieldWarnings.push(...result.warnings);
        }
      } catch (error) {
        fieldErrors.push({
          type: 'validation',
          field: fieldName,
          message: `Validation error: ${error.message}`,
          severity: 'error'
        });
      }
    }

    return {
      isValid: fieldErrors.length === 0,
      errors: fieldErrors,
      warnings: fieldWarnings
    };
  }

  /**
   * Validate using rule object
   */
  validateWithRuleObject(value, rule, fieldName) {
    const errors = [];
    const warnings = [];

    // Required check
    if (rule.required && (value === null || value === undefined || value === '')) {
      errors.push({
        type: 'required',
        field: fieldName,
        message: `${fieldName} is required`,
        severity: 'error'
      });
      return { errors, warnings };
    }

    // Type check
    if (rule.type && typeof value !== rule.type) {
      errors.push({
        type: 'type',
        field: fieldName,
        message: `${fieldName} must be of type ${rule.type}`,
        value,
        expectedType: rule.type,
        actualType: typeof value,
        severity: 'error'
      });
    }

    // Min/Max for numbers
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push({
          type: 'range',
          field: fieldName,
          message: `${fieldName} must be at least ${rule.min}`,
          value,
          min: rule.min,
          severity: 'error'
        });
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push({
          type: 'range',
          field: fieldName,
          message: `${fieldName} must be at most ${rule.max}`,
          value,
          max: rule.max,
          severity: 'error'
        });
      }
    }

    // Length for strings and arrays
    if (typeof value === 'string' || Array.isArray(value)) {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        errors.push({
          type: 'length',
          field: fieldName,
          message: `${fieldName} must be at least ${rule.minLength} characters`,
          value,
          minLength: rule.minLength,
          severity: 'error'
        });
      }
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        errors.push({
          type: 'length',
          field: fieldName,
          message: `${fieldName} must be at most ${rule.maxLength} characters`,
          value,
          maxLength: rule.maxLength,
          severity: 'error'
        });
      }
    }

    // Pattern matching
    if (rule.pattern && typeof value === 'string') {
      const regex = new RegExp(rule.pattern);
      if (!regex.test(value)) {
        errors.push({
          type: 'pattern',
          field: fieldName,
          message: `${fieldName} does not match required pattern`,
          value,
          pattern: rule.pattern,
          severity: 'error'
        });
      }
    }

    // Enum values
    if (rule.enum && !rule.enum.includes(value)) {
      errors.push({
        type: 'enum',
        field: fieldName,
        message: `${fieldName} must be one of: ${rule.enum.join(', ')}`,
        value,
        allowedValues: rule.enum,
        severity: 'error'
      });
    }

    return { errors, warnings };
  }

  /**
   * Sanitize data by removing/fixing common issues
   */
  sanitizeData(data, options = {}) {
    const sanitized = _.cloneDeep(data);
    const issues = [];

    const sanitizeValue = (value, path = '') => {
      if (typeof value === 'string') {
        let cleaned = value;
        
        // Trim whitespace
        if (options.trimStrings !== false) {
          cleaned = cleaned.trim();
        }
        
        // Remove multiple spaces
        if (options.normalizeSpaces !== false) {
          cleaned = cleaned.replace(/\s+/g, ' ');
        }
        
        // Handle special characters
        if (options.removeSpecialChars) {
          const original = cleaned;
          cleaned = cleaned.replace(/[^\w\s@.-]/g, '');
          if (original !== cleaned) {
            issues.push({
              type: 'sanitization',
              path,
              message: 'Removed special characters',
              original,
              sanitized: cleaned
            });
          }
        }
        
        // Capitalize names/titles
        if (options.capitalizeNames && (path.includes('name') || path.includes('title'))) {
          cleaned = this.capitalizeWords(cleaned);
        }
        
        return cleaned;
      }
      
      if (typeof value === 'number') {
        // Round to specified decimal places
        if (options.roundNumbers && typeof options.roundNumbers === 'number') {
          return Math.round(value * Math.pow(10, options.roundNumbers)) / Math.pow(10, options.roundNumbers);
        }
      }
      
      if (Array.isArray(value)) {
        // Remove duplicates
        if (options.removeDuplicates) {
          return [...new Set(value.map(item => 
            typeof item === 'object' ? JSON.stringify(item) : item
          ))].map(item => 
            typeof JSON.parse === 'function' && typeof item === 'string' && item.startsWith('{') 
              ? JSON.parse(item) : item
          );
        }
      }
      
      return value;
    };

    const traverse = (obj, path = '') => {
      if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        Object.keys(obj).forEach(key => {
          const currentPath = path ? `${path}.${key}` : key;
          obj[key] = traverse(obj[key], currentPath);
        });
        return obj;
      } else if (Array.isArray(obj)) {
        return obj.map((item, index) => 
          traverse(item, `${path}[${index}]`)
        );
      } else {
        return sanitizeValue(obj, path);
      }
    };

    const result = traverse(sanitized);

    return {
      data: result,
      issues,
      originalSize: JSON.stringify(data).length,
      sanitizedSize: JSON.stringify(result).length
    };
  }

  /**
   * Capitalize words properly
   */
  capitalizeWords(str) {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  /**
   * Validate and sanitize complete dataset
   */
  async validateAndSanitize(data, dataType, options = {}) {
    const startTime = Date.now();
    
    try {
      // First sanitize the data
      const sanitizationResult = this.sanitizeData(data, options.sanitization || {});
      
      // Then validate the sanitized data
      const validationResult = await this.validateDataStructure(sanitizationResult.data, dataType);
      
      // Additional field-level validation if specified
      if (options.fieldValidation) {
        const fieldResults = this.validateFieldsRecursively(
          sanitizationResult.data, 
          options.fieldValidation
        );
        validationResult.errors.push(...fieldResults.errors);
        validationResult.warnings.push(...fieldResults.warnings);
      }
      
      const processingTime = Date.now() - startTime;
      
      return {
        isValid: validationResult.isValid && validationResult.errors.length === 0,
        data: sanitizationResult.data,
        validation: {
          errors: validationResult.errors,
          warnings: validationResult.warnings,
          passed: validationResult.isValid
        },
        sanitization: {
          issues: sanitizationResult.issues,
          originalSize: sanitizationResult.originalSize,
          sanitizedSize: sanitizationResult.sanitizedSize,
          compressionRatio: (1 - sanitizationResult.sanitizedSize / sanitizationResult.originalSize) * 100
        },
        performance: {
          processingTime,
          dataSize: sanitizationResult.sanitizedSize
        }
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message,
        data: null,
        validation: { errors: [{ message: error.message, severity: 'error' }], warnings: [] },
        sanitization: { issues: [] },
        performance: { processingTime: Date.now() - startTime }
      };
    }
  }

  /**
   * Validate fields recursively through nested objects
   */
  validateFieldsRecursively(data, fieldRules) {
    const allErrors = [];
    const allWarnings = [];

    const validateRecursive = (obj, rules, path = '') => {
      if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        Object.keys(obj).forEach(key => {
          const currentPath = path ? `${path}.${key}` : key;
          const fieldRule = rules[key];
          
          if (fieldRule) {
            const result = this.validateField(obj[key], fieldRule, currentPath);
            allErrors.push(...result.errors);
            allWarnings.push(...result.warnings);
          }
          
          // Recurse into nested objects
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            validateRecursive(obj[key], rules, currentPath);
          }
        });
      } else if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          validateRecursive(item, rules, `${path}[${index}]`);
        });
      }
    };

    validateRecursive(data, fieldRules);

    return {
      errors: allErrors,
      warnings: allWarnings
    };
  }

  /**
   * Clear validation errors and warnings
   */
  clearErrors() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Get validation summary
   */
  getValidationSummary() {
    return {
      totalErrors: this.errors.length,
      totalWarnings: this.warnings.length,
      errorsByType: _.countBy(this.errors, 'type'),
      warningsByType: _.countBy(this.warnings, 'type'),
      criticalIssues: this.errors.filter(error => error.severity === 'error').length,
      hasErrors: this.errors.length > 0,
      hasWarnings: this.warnings.length > 0
    };
  }
}

// Create singleton instance
export const dataValidator = new DataValidator();

// Export utility functions
export const validateWorkforceDataStructure = (data) => dataValidator.validateDataStructure(data, 'workforce');
export const validateTurnoverDataStructure = (data) => dataValidator.validateDataStructure(data, 'turnover');
export const sanitizeHRData = (data, options) => dataValidator.sanitizeData(data, options);
export const validateAndSanitizeData = (data, type, options) => dataValidator.validateAndSanitize(data, type, options);

export default dataValidator;