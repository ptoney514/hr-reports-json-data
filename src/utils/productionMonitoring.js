/**
 * Production Performance Monitoring System
 * Tracks Core Web Vitals, user interactions, and application performance
 */

import logger from './productionLogger';

class ProductionMonitoring {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isInitialized = false;
    
    this.init();
  }

  init() {
    if (this.isInitialized) return;
    
    try {
      this.setupWebVitalsMonitoring();
      this.setupNavigationMonitoring();
      this.setupResourceMonitoring();
      this.setupErrorMonitoring();
      this.setupUserInteractionMonitoring();
      this.startReporting();
      
      this.isInitialized = true;
      logger.info('Production monitoring initialized');
    } catch (error) {
      logger.error('Failed to initialize production monitoring', { error: error.message });
    }
  }

  setupWebVitalsMonitoring() {
    // First Contentful Paint (FCP)
    this.measureFCP();
    
    // Largest Contentful Paint (LCP)
    this.measureLCP();
    
    // First Input Delay (FID)
    this.measureFID();
    
    // Cumulative Layout Shift (CLS)
    this.measureCLS();
    
    // Time to First Byte (TTFB)
    this.measureTTFB();
  }

  measureFCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        
        if (fcpEntry) {
          this.recordMetric('FCP', fcpEntry.startTime);
          observer.disconnect();
        }
      });
      
      observer.observe({ entryTypes: ['paint'] });
      this.observers.set('FCP', observer);
    }
  }

  measureLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('LCP', observer);
      
      // Stop observing after page load
      window.addEventListener('load', () => {
        setTimeout(() => observer.disconnect(), 0);
      });
    }
  }

  measureFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('FID', observer);
    }
  }

  measureCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      let clsEntries = [];
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsEntries.push(entry);
            clsValue += entry.value;
          }
        });
        
        this.recordMetric('CLS', clsValue);
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('CLS', observer);
    }
  }

  measureTTFB() {
    if ('navigation' in performance) {
      const navigationEntry = performance.getEntriesByType('navigation')[0];
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.fetchStart;
        this.recordMetric('TTFB', ttfb);
      }
    }
  }

  setupNavigationMonitoring() {
    // Page load timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          this.recordMetric('DOM_CONTENT_LOADED', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
          this.recordMetric('LOAD_EVENT', navigation.loadEventEnd - navigation.loadEventStart);
          this.recordMetric('TOTAL_LOAD_TIME', navigation.loadEventEnd - navigation.fetchStart);
        }
      }, 0);
    });

    // Single Page Application navigation
    this.monitorSPANavigation();
  }

  monitorSPANavigation() {
    let navigationStartTime = performance.now();
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'navigation') {
          navigationStartTime = entry.fetchStart;
        }
      });
    });
    
    // Monitor route changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      const startTime = performance.now();
      originalPushState.apply(this, args);
      
      setTimeout(() => {
        const duration = performance.now() - startTime;
        logger.trackUserAction('spa_navigation', {
          url: args[2],
          duration: Math.round(duration)
        });
      }, 100);
    };
    
    history.replaceState = function(...args) {
      const startTime = performance.now();
      originalReplaceState.apply(this, args);
      
      setTimeout(() => {
        const duration = performance.now() - startTime;
        logger.trackUserAction('spa_navigation_replace', {
          url: args[2],
          duration: Math.round(duration)
        });
      }, 100);
    };
  }

  setupResourceMonitoring() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          // Track large resources
          if (entry.transferSize > 100000) { // > 100KB
            logger.warn('Large resource loaded', {
              name: entry.name,
              size: entry.transferSize,
              duration: entry.duration
            });
          }
          
          // Track slow resources
          if (entry.duration > 1000) { // > 1 second
            logger.warn('Slow resource loaded', {
              name: entry.name,
              duration: entry.duration,
              size: entry.transferSize
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', observer);
    }
  }

  setupErrorMonitoring() {
    // Monitor JavaScript errors
    window.addEventListener('error', (event) => {
      this.recordMetric('JS_ERRORS', 1, 'counter');
      logger.error('JavaScript error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Monitor Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordMetric('PROMISE_REJECTIONS', 1, 'counter');
      logger.error('Unhandled promise rejection', {
        reason: event.reason
      });
    });

    // Monitor network errors
    this.monitorNetworkErrors();
  }

  monitorNetworkErrors() {
    const originalFetch = window.fetch;
    
    window.fetch = async function(...args) {
      const startTime = performance.now();
      
      try {
        const response = await originalFetch.apply(this, args);
        const duration = performance.now() - startTime;
        
        logger.trackApiCall(
          'GET', // Simplified, could parse from args
          args[0],
          response.status,
          Math.round(duration)
        );
        
        if (!response.ok) {
          logger.error('HTTP error', {
            url: args[0],
            status: response.status,
            statusText: response.statusText
          });
        }
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        
        logger.error('Network error', {
          url: args[0],
          error: error.message,
          duration: Math.round(duration)
        });
        
        throw error;
      }
    };
  }

  setupUserInteractionMonitoring() {
    // Track long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          if (entry.duration > 50) { // Tasks longer than 50ms
            this.recordMetric('LONG_TASKS', entry.duration);
            logger.warn('Long task detected', {
              duration: entry.duration,
              startTime: entry.startTime
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['longtask'] });
      this.observers.set('longtask', observer);
    }

    // Track user interactions
    ['click', 'scroll', 'keydown'].forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        this.recordMetric(`USER_${eventType.toUpperCase()}`, 1, 'counter');
      }, { passive: true });
    });
  }

  recordMetric(name, value, type = 'gauge') {
    const timestamp = Date.now();
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const metricData = {
      value,
      timestamp,
      type,
      url: window.location.pathname
    };
    
    this.metrics.get(name).push(metricData);
    
    // Keep only last 100 entries per metric
    const entries = this.metrics.get(name);
    if (entries.length > 100) {
      entries.splice(0, entries.length - 100);
    }
    
    // Log critical metrics immediately
    if (this.isCriticalMetric(name, value)) {
      logger.warn(`Critical metric: ${name}`, metricData);
    }
  }

  isCriticalMetric(name, value) {
    const thresholds = {
      'LCP': 2500,      // 2.5 seconds
      'FID': 100,       // 100 milliseconds
      'CLS': 0.1,       // 0.1
      'TTFB': 600,      // 600 milliseconds
      'LONG_TASKS': 100 // 100 milliseconds
    };
    
    return thresholds[name] && value > thresholds[name];
  }

  getMetrics() {
    const result = {};
    
    this.metrics.forEach((values, name) => {
      if (values.length > 0) {
        const latestValue = values[values.length - 1];
        const avgValue = values.reduce((sum, v) => sum + v.value, 0) / values.length;
        
        result[name] = {
          latest: latestValue.value,
          average: Math.round(avgValue * 100) / 100,
          count: values.length,
          timestamp: latestValue.timestamp
        };
      }
    });
    
    return result;
  }

  startReporting() {
    // Report metrics every 30 seconds
    setInterval(() => {
      const metrics = this.getMetrics();
      
      if (Object.keys(metrics).length > 0) {
        logger.info('Performance metrics', metrics);
      }
    }, 30000);

    // Report on page unload
    window.addEventListener('beforeunload', () => {
      const metrics = this.getMetrics();
      logger.info('Final performance metrics', metrics);
    });
  }

  // Manual metric recording
  startTiming(name) {
    const startTime = performance.now();
    
    return {
      end: () => {
        const duration = performance.now() - startTime;
        this.recordMetric(name, duration);
        return duration;
      }
    };
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
    this.isInitialized = false;
  }
}

// Create singleton instance
const monitoring = new ProductionMonitoring();

export default monitoring;
export { ProductionMonitoring };