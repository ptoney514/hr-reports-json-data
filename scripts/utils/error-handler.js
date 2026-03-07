/**
 * Structured Error Handling for ETL Pipeline
 *
 * Classifies errors as SKIP, RETRY, or FATAL and provides
 * human-readable error reports at the end of ETL runs.
 */

const { colors } = require('./formatting');

// Error classification types
const ErrorType = {
  SKIP: 'SKIP',     // Bad row data — skip and continue
  RETRY: 'RETRY',   // Transient DB error — retry with backoff
  FATAL: 'FATAL'    // Schema mismatch or unrecoverable — stop
};

/**
 * Custom ETL error with classification context
 */
class ETLError extends Error {
  constructor(message, { type, rowNumber = null, rowData = null, originalError = null } = {}) {
    super(message);
    this.name = 'ETLError';
    this.type = type || ErrorType.SKIP;
    this.rowNumber = rowNumber;
    this.rowData = rowData;
    this.originalError = originalError;
  }
}

/**
 * Detect whether a database error is transient (worth retrying)
 *
 * Covers: connection reset, timeout, deadlock, too many connections.
 * Does NOT retry: constraint violations, syntax errors, missing columns.
 */
function isTransientDBError(error) {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  const code = error.code || '';

  const transientPatterns = [
    'connection reset',
    'connection refused',
    'connection terminated',
    'connection timed out',
    'timeout expired',
    'statement timeout',
    'too many connections',
    'could not connect',
    'broken pipe',
    'econnreset',
    'econnrefused',
    'etimedout',
    'epipe'
  ];

  const transientCodes = [
    '08000', // connection_exception
    '08003', // connection_does_not_exist
    '08006', // connection_failure
    '40001', // serialization_failure (deadlock)
    '40P01', // deadlock_detected
    '57014', // query_canceled (timeout)
    '53300'  // too_many_connections
  ];

  if (transientCodes.includes(code)) return true;
  return transientPatterns.some(p => msg.includes(p));
}

/**
 * Retry a function with exponential backoff
 *
 * Only retries on transient DB errors. All other errors are thrown immediately.
 *
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum retry attempts (default 3)
 * @param {number} baseDelay - Base delay in ms (default 1000)
 * @returns {Promise<any>} Result of fn
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!isTransientDBError(error) || attempt === maxRetries) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`  ${colors.yellow}Retry ${attempt + 1}/${maxRetries} in ${delay}ms: ${error.message}${colors.reset}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Create an error handler scoped to a specific ETL script
 *
 * @param {string} scriptName - Name of the ETL script (for logging)
 * @returns {{ handleError, getErrorSummary, printErrorReport }}
 */
function createErrorHandler(scriptName) {
  const errors = [];

  /**
   * Classify and record an error from row processing
   *
   * @param {Error} error - The caught error
   * @param {Object} row - The row data being processed
   * @param {number} rowIndex - Zero-based row index
   * @returns {string} The error type (SKIP, RETRY, or FATAL)
   */
  function handleError(error, row, rowIndex) {
    let type;
    const msg = (error.message || '').toLowerCase();

    if (error instanceof ETLError) {
      type = error.type;
    } else if (isTransientDBError(error)) {
      type = ErrorType.RETRY;
    } else if (
      msg.includes('column') && msg.includes('does not exist') ||
      msg.includes('relation') && msg.includes('does not exist') ||
      msg.includes('schema') ||
      msg.includes('undefined column')
    ) {
      type = ErrorType.FATAL;
    } else {
      type = ErrorType.SKIP;
    }

    // Extract key fields for context (avoid logging full PII row)
    const keyFields = {};
    const identifiers = ['employee_hash', 'employee_id', 'fiscal_year', 'category', 'department', 'school', 'period_date'];
    for (const key of identifiers) {
      if (row && row[key] !== undefined) {
        keyFields[key] = row[key];
      }
    }

    errors.push({
      type,
      rowNumber: rowIndex + 1,
      keyFields,
      message: error.message,
      timestamp: new Date().toISOString()
    });

    return type;
  }

  /**
   * Get a summary of all recorded errors
   */
  function getErrorSummary() {
    return {
      total: errors.length,
      skipped: errors.filter(e => e.type === ErrorType.SKIP).length,
      retried: errors.filter(e => e.type === ErrorType.RETRY).length,
      fatal: errors.filter(e => e.type === ErrorType.FATAL).length,
      details: errors
    };
  }

  /**
   * Print a human-readable error report to console
   */
  function printErrorReport() {
    const summary = getErrorSummary();

    if (summary.total === 0) {
      console.log(`\n${colors.green}[${scriptName}] No errors during processing${colors.reset}`);
      return;
    }

    console.log(`\n${colors.cyan}========================================${colors.reset}`);
    console.log(`${colors.cyan}   Error Report: ${scriptName}${colors.reset}`);
    console.log(`${colors.cyan}========================================${colors.reset}`);
    console.log(`  Total errors: ${summary.total}`);
    if (summary.skipped > 0) console.log(`  ${colors.yellow}SKIP  (bad row data):    ${summary.skipped}${colors.reset}`);
    if (summary.retried > 0) console.log(`  ${colors.yellow}RETRY (transient DB):    ${summary.retried}${colors.reset}`);
    if (summary.fatal > 0)   console.log(`  ${colors.red}FATAL (schema/config):   ${summary.fatal}${colors.reset}`);

    // Show first 10 errors with detail
    const show = errors.slice(0, 10);
    console.log(`\n  Details (showing ${show.length} of ${errors.length}):`);

    for (const err of show) {
      const typeColor = err.type === ErrorType.FATAL ? colors.red : colors.yellow;
      const fields = Object.keys(err.keyFields).length > 0
        ? ` | ${Object.entries(err.keyFields).map(([k, v]) => `${k}=${v}`).join(', ')}`
        : '';
      console.log(`  ${typeColor}[${err.type}]${colors.reset} Row ${err.rowNumber}${fields}`);
      console.log(`         ${err.message}`);
    }

    if (errors.length > 10) {
      console.log(`\n  ... and ${errors.length - 10} more errors`);
    }

    console.log(`${colors.cyan}========================================${colors.reset}\n`);
  }

  return { handleError, getErrorSummary, printErrorReport };
}

module.exports = {
  ErrorType,
  ETLError,
  isTransientDBError,
  retryWithBackoff,
  createErrorHandler
};
