/**
 * Performance Monitoring Utility
 * Tracks loading times, cache performance, and component render metrics
 */

// Performance metrics storage
const performanceMetrics = {
  pageLoads: [],
  componentRenders: new Map(),
  cacheMetrics: {
    hits: 0,
    misses: 0,
    totalRequests: 0
  },
  networkRequests: [],
  bundleMetrics: {
    loadTime: null,
    size: null
  }
};

/**
 * Performance observer for tracking various metrics
 */
class PerformanceMonitor {
  constructor() {
    this.observers = new Map();
    this.startTime = performance.now();
    this.initializeObservers();
  }

  initializeObservers() {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        // Navigation timing
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordNavigationMetrics(entry);
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navObserver);

        // Resource timing (for tracking bundle loads)
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordResourceMetrics(entry);
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);

        // Measure timing (for custom measurements)
        const measureObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordCustomMetrics(entry);
          }
        });
        measureObserver.observe({ entryTypes: ['measure'] });
        this.observers.set('measure', measureObserver);

      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }
  }

  recordNavigationMetrics(entry) {
    const metrics = {
      timestamp: Date.now(),
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      domInteractive: entry.domInteractive - entry.fetchStart,
      firstPaint: this.getFirstPaint(),
      firstContentfulPaint: this.getFirstContentfulPaint(),
      timeToInteractive: this.calculateTTI(entry)
    };

    performanceMetrics.pageLoads.push(metrics);
    console.log('Navigation metrics recorded:', metrics);
  }

  recordResourceMetrics(entry) {
    // Track JavaScript bundle loading
    if (entry.name.includes('.js') && entry.name.includes('/static/js/')) {
      const bundleMetric = {
        name: entry.name,
        size: entry.transferSize || entry.encodedBodySize,
        loadTime: entry.responseEnd - entry.requestStart,
        cached: entry.transferSize === 0,
        timestamp: Date.now()
      };

      performanceMetrics.bundleMetrics = bundleMetric;
      console.log('Bundle metrics recorded:', bundleMetric);
    }

    // Track other critical resources
    if (entry.name.includes('.json') || entry.name.includes('api/')) {
      performanceMetrics.networkRequests.push({
        url: entry.name,
        duration: entry.responseEnd - entry.requestStart,
        size: entry.transferSize || entry.encodedBodySize,
        cached: entry.transferSize === 0,
        timestamp: Date.now()
      });
    }
  }

  recordCustomMetrics(entry) {
    console.log('Custom metric recorded:', {
      name: entry.name,
      duration: entry.duration,
      startTime: entry.startTime
    });
  }

  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  }

  calculateTTI(entry) {
    // Simplified TTI calculation
    return entry.domInteractive - entry.fetchStart;
  }

  // Component render tracking
  trackComponentRender(componentName, renderTime) {
    if (!performanceMetrics.componentRenders.has(componentName)) {
      performanceMetrics.componentRenders.set(componentName, []);
    }
    
    performanceMetrics.componentRenders.get(componentName).push({
      renderTime,
      timestamp: Date.now()
    });

    // Keep only last 10 renders per component
    const renders = performanceMetrics.componentRenders.get(componentName);
    if (renders.length > 10) {
      renders.shift();
    }
  }

  // Cache performance tracking
  recordCacheHit(key, source = 'unknown') {
    performanceMetrics.cacheMetrics.hits++;
    performanceMetrics.cacheMetrics.totalRequests++;
    
    console.log(`Cache HIT for ${key} from ${source}`);
    this.updateCacheStats();
  }

  recordCacheMiss(key) {
    performanceMetrics.cacheMetrics.misses++;
    performanceMetrics.cacheMetrics.totalRequests++;
    
    console.log(`Cache MISS for ${key}`);
    this.updateCacheStats();
  }

  updateCacheStats() {
    const { hits, totalRequests } = performanceMetrics.cacheMetrics;
    const hitRate = totalRequests > 0 ? (hits / totalRequests * 100).toFixed(1) : 0;
    
    if (totalRequests % 10 === 0) { // Log every 10 requests
      console.log(`Cache hit rate: ${hitRate}% (${hits}/${totalRequests})`);
    }
  }

  // Memory usage tracking
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        usedMB: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
        totalMB: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)
      };
    }
    return null;
  }

  // Get comprehensive performance report
  getPerformanceReport() {
    const memoryUsage = this.getMemoryUsage();
    const cacheHitRate = performanceMetrics.cacheMetrics.totalRequests > 0 
      ? (performanceMetrics.cacheMetrics.hits / performanceMetrics.cacheMetrics.totalRequests * 100).toFixed(1)
      : 0;

    const componentStats = {};
    performanceMetrics.componentRenders.forEach((renders, componentName) => {
      const avgRenderTime = renders.reduce((sum, r) => sum + r.renderTime, 0) / renders.length;
      componentStats[componentName] = {
        renderCount: renders.length,
        avgRenderTime: avgRenderTime.toFixed(2),
        lastRender: renders[renders.length - 1]?.timestamp
      };
    });

    return {
      pageLoads: performanceMetrics.pageLoads,
      cacheMetrics: {
        ...performanceMetrics.cacheMetrics,
        hitRate: `${cacheHitRate}%`
      },
      componentStats,
      memoryUsage,
      bundleMetrics: performanceMetrics.bundleMetrics,
      networkRequests: performanceMetrics.networkRequests.slice(-10), // Last 10 requests
      uptime: ((performance.now() - this.startTime) / 1000).toFixed(2) + 's'
    };
  }

  // Performance warnings
  checkPerformanceThresholds() {
    const warnings = [];
    
    // Check cache hit rate
    const { hits, totalRequests } = performanceMetrics.cacheMetrics;
    if (totalRequests > 20) {
      const hitRate = (hits / totalRequests) * 100;
      if (hitRate < 70) {
        warnings.push(`Low cache hit rate: ${hitRate.toFixed(1)}%`);
      }
    }

    // Check memory usage
    const memory = this.getMemoryUsage();
    if (memory && memory.used > memory.limit * 0.8) {
      warnings.push(`High memory usage: ${memory.usedMB}MB`);
    }

    // Check slow components
    performanceMetrics.componentRenders.forEach((renders, componentName) => {
      const avgRenderTime = renders.reduce((sum, r) => sum + r.renderTime, 0) / renders.length;
      if (avgRenderTime > 16) { // 16ms is 60fps threshold
        warnings.push(`Slow component render: ${componentName} (${avgRenderTime.toFixed(2)}ms avg)`);
      }
    });

    return warnings;
  }

  // Cleanup observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

/**
 * React Hook for tracking component render performance
 */
export const usePerformanceTracking = (componentName) => {
  const startTime = performance.now();
  
  React.useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (window.performanceMonitor) {
      window.performanceMonitor.trackComponentRender(componentName, renderTime);
    }
  });

  return {
    startTime,
    trackCustomMetric: (name, value) => {
      performance.mark(`${componentName}-${name}-start`);
      performance.mark(`${componentName}-${name}-end`);
      performance.measure(`${componentName}-${name}`, `${componentName}-${name}-start`, `${componentName}-${name}-end`);
    }
  };
};

/**
 * Higher-order component for automatic performance tracking
 */
export const withPerformanceTracking = (WrappedComponent, componentName) => {
  return React.memo((props) => {
    usePerformanceTracking(componentName || WrappedComponent.name);
    return React.createElement(WrappedComponent, props);
  });
};

/**
 * Performance timing utilities
 */
export const performanceUtils = {
  // Mark start of operation
  markStart: (name) => {
    performance.mark(`${name}-start`);
  },

  // Mark end and measure duration
  markEnd: (name) => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    return measure ? measure.duration : 0;
  },

  // Measure function execution time
  measureFunction: async (name, fn) => {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`${name} took ${duration.toFixed(2)}ms`);
    return { result, duration };
  },

  // Debounced performance logging
  debouncedLog: (() => {
    let timeout;
    return (message, delay = 1000) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        console.log(message);
      }, delay);
    };
  })()
};

/**
 * Bundle size analysis utilities
 */
export const bundleAnalyzer = {
  // Estimate component bundle size impact
  estimateComponentSize: (componentName) => {
    const entries = performance.getEntriesByType('resource');
    const jsFiles = entries.filter(entry => 
      entry.name.includes('.js') && 
      entry.name.includes('/static/js/')
    );
    
    return jsFiles.map(file => ({
      name: file.name,
      size: file.transferSize || file.encodedBodySize,
      loadTime: file.responseEnd - file.requestStart
    }));
  },

  // Get total bundle size
  getTotalBundleSize: () => {
    const entries = performance.getEntriesByType('resource');
    const jsFiles = entries.filter(entry => 
      entry.name.includes('.js') && 
      entry.name.includes('/static/')
    );
    
    const totalSize = jsFiles.reduce((sum, file) => 
      sum + (file.transferSize || file.encodedBodySize), 0
    );
    
    return {
      totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      fileCount: jsFiles.length,
      files: jsFiles
    };
  }
};

// Initialize global performance monitor
let globalPerformanceMonitor = null;

if (typeof window !== 'undefined') {
  globalPerformanceMonitor = new PerformanceMonitor();
  window.performanceMonitor = globalPerformanceMonitor;
  
  // Expose performance utilities globally for debugging
  window.performanceUtils = performanceUtils;
  window.bundleAnalyzer = bundleAnalyzer;
  
  // Auto-report performance every 30 seconds in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      const warnings = globalPerformanceMonitor.checkPerformanceThresholds();
      if (warnings.length > 0) {
        console.warn('Performance warnings:', warnings);
      }
    }, 30000);
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (globalPerformanceMonitor) {
      globalPerformanceMonitor.disconnect();
    }
  });
}

export default {
  PerformanceMonitor,
  usePerformanceTracking,
  withPerformanceTracking,
  performanceUtils,
  bundleAnalyzer,
  globalPerformanceMonitor
}; 