/**
 * Comprehensive Error Handler for Dashboard Components
 * Provides error classification, logging, reporting, and recovery strategies
 */

// Error types and classifications
export const ERROR_TYPES = {
  NETWORK: 'network',
  CHART: 'chart', 
  DATA: 'data',
  TIMEOUT: 'timeout',
  VALIDATION: 'validation',
  RENDER: 'render',
  GENERAL: 'general'
};

export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium', 
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Error classification patterns
const ERROR_PATTERNS = {
  [ERROR_TYPES.NETWORK]: [
    /network/i,
    /fetch/i,
    /connection/i,
    /cors/i,
    /http/i,
    /xhr/i
  ],
  [ERROR_TYPES.CHART]: [
    /chart/i,
    /recharts/i,
    /render/i,
    /svg/i,
    /canvas/i,
    /visualization/i
  ],
  [ERROR_TYPES.DATA]: [
    /data/i,
    /json/i,
    /parse/i,
    /invalid/i,
    /format/i,
    /schema/i
  ],
  [ERROR_TYPES.TIMEOUT]: [
    /timeout/i,
    /timed out/i,
    /aborted/i
  ],
  [ERROR_TYPES.VALIDATION]: [
    /validation/i,
    /required/i,
    /missing/i,
    /undefined/i,
    /null/i
  ],
  [ERROR_TYPES.RENDER]: [
    /render/i,
    /component/i,
    /react/i,
    /dom/i
  ]
};

/**
 * Classifies an error based on its message and properties
 */
export const classifyError = (error) => {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorStack = error?.stack?.toLowerCase() || '';
  const errorString = `${errorMessage} ${errorStack}`;

  // Check each error type pattern
  for (const [type, patterns] of Object.entries(ERROR_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(errorString))) {
      return type;
    }
  }

  return ERROR_TYPES.GENERAL;
};

/**
 * Determines error severity based on type and context
 */
export const getErrorSeverity = (error, context = {}) => {
  const errorType = classifyError(error);
  const { isUserFacing = true, affectsMultipleComponents = false } = context;

  // Critical errors that break the entire application
  if (error?.name === 'ChunkLoadError' || error?.message?.includes('Loading chunk')) {
    return ERROR_SEVERITY.CRITICAL;
  }

  // High severity errors
  if (affectsMultipleComponents || errorType === ERROR_TYPES.DATA) {
    return ERROR_SEVERITY.HIGH;
  }

  // Medium severity errors
  if (errorType === ERROR_TYPES.NETWORK || errorType === ERROR_TYPES.CHART) {
    return ERROR_SEVERITY.MEDIUM;
  }

  // Low severity errors
  if (!isUserFacing || errorType === ERROR_TYPES.VALIDATION) {
    return ERROR_SEVERITY.LOW;
  }

  return ERROR_SEVERITY.MEDIUM;
};

/**
 * Enhanced error logging with context and metadata
 */
export const logError = (error, context = {}) => {
  const errorType = classifyError(error);
  const severity = getErrorSeverity(error, context);
  
  const errorLog = {
    timestamp: new Date().toISOString(),
    type: errorType,
    severity,
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    context: {
      userAgent: navigator.userAgent,
      url: window.location.href,
      component: context.component || 'Unknown',
      userId: context.userId || 'Anonymous',
      sessionId: context.sessionId || 'Unknown',
      ...context
    },
    errorInfo: error?.errorInfo || null
  };

  // Console logging based on severity
  switch (severity) {
    case ERROR_SEVERITY.CRITICAL:
      console.error('🚨 CRITICAL ERROR:', errorLog);
      break;
    case ERROR_SEVERITY.HIGH:
      console.error('❌ HIGH SEVERITY ERROR:', errorLog);
      break;
    case ERROR_SEVERITY.MEDIUM:
      console.warn('⚠️ MEDIUM SEVERITY ERROR:', errorLog);
      break;
    case ERROR_SEVERITY.LOW:
      console.info('ℹ️ LOW SEVERITY ERROR:', errorLog);
      break;
    default:
      console.log('📝 ERROR LOG:', errorLog);
  }

  // Send to error reporting service in production
  if (process.env.NODE_ENV === 'production') {
    reportError(errorLog);
  }

  return errorLog;
};

/**
 * Error reporting to external services
 */
export const reportError = async (errorLog) => {
  try {
    // Example: Send to error reporting service
    // Replace with your actual error reporting service (Sentry, LogRocket, etc.)
    
    if (window.Sentry) {
      window.Sentry.captureException(new Error(errorLog.message), {
        tags: {
          errorType: errorLog.type,
          severity: errorLog.severity,
          component: errorLog.context.component
        },
        extra: errorLog.context
      });
    }

    // Example: Send to custom analytics endpoint
    if (errorLog.severity === ERROR_SEVERITY.CRITICAL || errorLog.severity === ERROR_SEVERITY.HIGH) {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorLog)
      }).catch(err => {
        console.warn('Failed to report error to analytics:', err);
      });
    }

  } catch (reportingError) {
    console.warn('Error reporting failed:', reportingError);
  }
};

/**
 * Error recovery strategies
 */
export const getRecoveryStrategy = (error, context = {}) => {
  const errorType = classifyError(error);
  const { retryCount = 0, maxRetries = 3 } = context;

  const strategies = {
    [ERROR_TYPES.NETWORK]: {
      canRetry: retryCount < maxRetries,
      retryDelay: Math.min(1000 * Math.pow(2, retryCount), 30000), // Exponential backoff
      autoRetry: retryCount < 2,
      fallbackAction: 'showCachedData',
      userMessage: 'Network connection issue. Retrying automatically...'
    },
    [ERROR_TYPES.CHART]: {
      canRetry: retryCount < 2,
      retryDelay: 500,
      autoRetry: false,
      fallbackAction: 'showDataTable',
      userMessage: 'Chart failed to render. Try refreshing or view data in table format.'
    },
    [ERROR_TYPES.DATA]: {
      canRetry: retryCount < 2,
      retryDelay: 1000,
      autoRetry: false,
      fallbackAction: 'showErrorMessage',
      userMessage: 'Data format issue detected. Please reload the page.'
    },
    [ERROR_TYPES.TIMEOUT]: {
      canRetry: retryCount < maxRetries,
      retryDelay: 2000,
      autoRetry: retryCount < 1,
      fallbackAction: 'showCachedData',
      userMessage: 'Request timed out. Retrying with cached data...'
    },
    [ERROR_TYPES.VALIDATION]: {
      canRetry: false,
      retryDelay: 0,
      autoRetry: false,
      fallbackAction: 'showValidationErrors',
      userMessage: 'Data validation failed. Please check the data format.'
    }
  };

  return strategies[errorType] || {
    canRetry: retryCount < 1,
    retryDelay: 1000,
    autoRetry: false,
    fallbackAction: 'showGenericError',
    userMessage: 'An unexpected error occurred. Please try again.'
  };
};

/**
 * Create error boundary configuration
 */
export const createErrorBoundaryConfig = (componentName, options = {}) => {
  const {
    maxRetries = 3,
    enableAutoRetry = true,
    enableErrorReporting = true,
    fallbackUI = null,
    onError = null,
    onRetry = null
  } = options;

  return {
    componentName,
    maxRetries,
    enableAutoRetry,
    enableErrorReporting,
    fallbackUI,
    
    onError: (error, errorInfo) => {
      const context = {
        component: componentName,
        errorInfo,
        isUserFacing: true
      };
      
      const errorLog = logError(error, context);
      
      if (onError) {
        onError(error, errorInfo, errorLog);
      }
      
      return errorLog;
    },
    
    onRetry: async (error, retryCount) => {
      const context = { component: componentName, retryCount };
      const strategy = getRecoveryStrategy(error, context);
      
      console.log(`Retrying ${componentName} (attempt ${retryCount + 1}/${maxRetries})`);
      
      if (strategy.retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, strategy.retryDelay));
      }
      
      if (onRetry) {
        return onRetry(error, retryCount, strategy);
      }
      
      return strategy;
    }
  };
};

/**
 * Global error handler for unhandled errors
 */
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    logError(error, {
      component: 'Global',
      type: 'unhandledRejection',
      isUserFacing: false
    });
    
    // Prevent default browser behavior for non-critical errors
    if (getErrorSeverity(error) !== ERROR_SEVERITY.CRITICAL) {
      event.preventDefault();
    }
  });

  // Handle general JavaScript errors
  window.addEventListener('error', (event) => {
    const error = event.error || new Error(event.message);
    logError(error, {
      component: 'Global',
      type: 'javascript',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      isUserFacing: false
    });
  });

  console.log('Global error handling initialized');
};

/**
 * Error boundary hook for functional components
 */
export const useErrorHandler = (componentName) => {
  const handleError = (error, context = {}) => {
    const errorLog = logError(error, {
      component: componentName,
      ...context
    });
    
    const strategy = getRecoveryStrategy(error, context);
    
    return {
      errorLog,
      strategy,
      canRetry: strategy.canRetry,
      shouldAutoRetry: strategy.autoRetry
    };
  };

  return { handleError };
};

/**
 * Network error helper
 */
export const handleNetworkError = async (error, retryFn, maxRetries = 3) => {
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const strategy = getRecoveryStrategy(error, { retryCount, maxRetries });
      
      if (!strategy.canRetry) {
        throw error;
      }
      
      if (strategy.retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, strategy.retryDelay));
      }
      
      return await retryFn();
      
    } catch (retryError) {
      retryCount++;
      
      if (retryCount >= maxRetries) {
        logError(retryError, {
          component: 'NetworkRetry',
          retryCount,
          maxRetries,
          originalError: error
        });
        throw retryError;
      }
    }
  }
};

/**
 * Data validation helper
 */
export const validateData = (data, schema, componentName = 'DataValidator') => {
  const errors = [];
  
  try {
    // Required fields validation
    if (schema.required) {
      schema.required.forEach(field => {
        if (!data || data[field] === undefined || data[field] === null) {
          errors.push({
            type: 'required_field',
            field,
            message: `Required field '${field}' is missing`
          });
        }
      });
    }
    
    // Type validation
    if (schema.properties && data) {
      Object.keys(schema.properties).forEach(field => {
        const expectedType = schema.properties[field].type;
        const actualValue = data[field];
        
        if (actualValue !== undefined && actualValue !== null) {
          const actualType = Array.isArray(actualValue) ? 'array' : typeof actualValue;
          
          if (expectedType !== actualType) {
            errors.push({
              type: 'type_mismatch',
              field,
              expected: expectedType,
              actual: actualType,
              message: `Field '${field}' expected ${expectedType} but got ${actualType}`
            });
          }
        }
      });
    }
    
    if (errors.length > 0) {
      const validationError = new Error(`Data validation failed: ${errors.length} errors found`);
      validationError.validationErrors = errors;
      
      logError(validationError, {
        component: componentName,
        validationErrors: errors,
        data: data
      });
      
      throw validationError;
    }
    
    return { valid: true, errors: [] };
    
  } catch (error) {
    return { valid: false, errors, validationError: error };
  }
};

export default {
  ERROR_TYPES,
  ERROR_SEVERITY,
  classifyError,
  getErrorSeverity,
  logError,
  reportError,
  getRecoveryStrategy,
  createErrorBoundaryConfig,
  setupGlobalErrorHandling,
  useErrorHandler,
  handleNetworkError,
  validateData
}; 