/**
 * Production-ready logging system for HR Reports Application
 * Supports multiple log levels, structured logging, and error tracking
 */

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Production configuration
const PRODUCTION_CONFIG = {
  level: LOG_LEVELS.INFO,
  enableConsole: process.env.NODE_ENV !== 'production',
  enableRemote: process.env.REACT_APP_ENABLE_ERROR_TRACKING === 'true',
  maxLocalLogs: 100,
  batchSize: 10,
  flushInterval: 30000 // 30 seconds
};

class ProductionLogger {
  constructor(config = PRODUCTION_CONFIG) {
    this.config = { ...PRODUCTION_CONFIG, ...config };
    this.logBuffer = [];
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.context = {};
    
    this.startFlushTimer();
    this.setupUnhandledErrorCapture();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  setUserId(userId) {
    this.userId = userId;
  }

  setContext(context) {
    this.context = { ...this.context, ...context };
  }

  createLogEntry(level, message, data = {}) {
    return {
      timestamp: new Date().toISOString(),
      level: Object.keys(LOG_LEVELS)[level],
      message,
      data,
      sessionId: this.sessionId,
      userId: this.userId,
      context: this.context,
      url: window.location.href,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };
  }

  log(level, message, data = {}) {
    if (level > this.config.level) return;

    const logEntry = this.createLogEntry(level, message, data);

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Buffer for remote logging
    if (this.config.enableRemote) {
      this.addToBuffer(logEntry);
    }

    // Store in local storage for debugging
    this.storeLocally(logEntry);
  }

  logToConsole(logEntry) {
    const { level, message, data } = logEntry;
    const consoleMethod = level === 'ERROR' ? 'error' : 
                         level === 'WARN' ? 'warn' : 
                         level === 'DEBUG' ? 'debug' : 'log';
    
    console[consoleMethod](`[${logEntry.timestamp}] ${message}`, data);
  }

  addToBuffer(logEntry) {
    this.logBuffer.push(logEntry);
    
    if (this.logBuffer.length >= this.config.batchSize) {
      this.flush();
    }
  }

  storeLocally(logEntry) {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('hr_reports_logs') || '[]');
      existingLogs.push(logEntry);
      
      // Keep only the most recent logs
      if (existingLogs.length > this.config.maxLocalLogs) {
        existingLogs.splice(0, existingLogs.length - this.config.maxLocalLogs);
      }
      
      localStorage.setItem('hr_reports_logs', JSON.stringify(existingLogs));
    } catch (error) {
      console.warn('Failed to store log locally:', error);
    }
  }

  async flush() {
    if (this.logBuffer.length === 0) return;

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await this.sendLogsToRemote(logsToSend);
    } catch (error) {
      console.warn('Failed to send logs to remote:', error);
      // Put logs back in buffer for retry
      this.logBuffer.unshift(...logsToSend);
    }
  }

  async sendLogsToRemote(logs) {
    const endpoint = process.env.REACT_APP_LOGGING_ENDPOINT || '/api/logs';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        logs,
        meta: {
          version: process.env.REACT_APP_VERSION,
          environment: process.env.NODE_ENV
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send logs: ${response.status}`);
    }
  }

  startFlushTimer() {
    setInterval(() => {
      this.flush();
    }, this.config.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  setupUnhandledErrorCapture() {
    // Capture unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.error('Unhandled JavaScript error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });

    // Capture React error boundary errors
    window.addEventListener('react-error', (event) => {
      this.error('React error boundary caught error', {
        error: event.detail.error,
        errorInfo: event.detail.errorInfo
      });
    });
  }

  // Convenience methods
  error(message, data = {}) {
    this.log(LOG_LEVELS.ERROR, message, data);
  }

  warn(message, data = {}) {
    this.log(LOG_LEVELS.WARN, message, data);
  }

  info(message, data = {}) {
    this.log(LOG_LEVELS.INFO, message, data);
  }

  debug(message, data = {}) {
    this.log(LOG_LEVELS.DEBUG, message, data);
  }

  // Performance tracking
  startTimer(name) {
    const startTime = performance.now();
    return {
      end: () => {
        const duration = performance.now() - startTime;
        this.info(`Performance: ${name}`, { duration: Math.round(duration) });
        return duration;
      }
    };
  }

  // User action tracking
  trackUserAction(action, data = {}) {
    this.info(`User action: ${action}`, data);
  }

  // API call tracking
  trackApiCall(method, url, status, duration, data = {}) {
    const logLevel = status >= 400 ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;
    this.log(logLevel, `API ${method} ${url}`, {
      status,
      duration,
      ...data
    });
  }

  // Get stored logs for debugging
  getStoredLogs() {
    try {
      return JSON.parse(localStorage.getItem('hr_reports_logs') || '[]');
    } catch (error) {
      console.warn('Failed to retrieve stored logs:', error);
      return [];
    }
  }

  // Clear stored logs
  clearStoredLogs() {
    try {
      localStorage.removeItem('hr_reports_logs');
    } catch (error) {
      console.warn('Failed to clear stored logs:', error);
    }
  }
}

// Create singleton instance
const logger = new ProductionLogger();

// Export logger instance and class
export default logger;
export { ProductionLogger, LOG_LEVELS };