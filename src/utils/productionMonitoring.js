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
      this.setupMemoryLeakDetection();
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
      let lcpValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        lcpValue = lastEntry.startTime;
        this.recordMetric('LCP', lcpValue);
        
        // Trigger optimization if LCP is poor
        if (lcpValue > 2500) {
          this.optimizeLCP();
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('LCP', observer);
      
      // Stop observing after page load
      const stopObserving = () => {
        setTimeout(() => {
          observer.disconnect();
          this.finalLCP = lcpValue;
        }, 0);
      };
      
      if (document.readyState === 'complete') {
        stopObserving();
      } else {
        window.addEventListener('load', stopObserving);
      }
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
      'LCP': 1500,      // 1.5 seconds (optimized target)
      'FID': 50,        // 50 milliseconds (optimized target)
      'CLS': 0.05,      // 0.05 (optimized target)
      'TTFB': 400,      // 400 milliseconds (optimized target)
      'LONG_TASKS': 50  // 50 milliseconds (optimized target)
    };
    
    return thresholds[name] && value > thresholds[name];
  }

  // Core Web Vitals optimization methods
  optimizeLCP() {
    console.log('Optimizing LCP...');
    
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Optimize images
    this.optimizeImages();
    
    // Reduce blocking resources
    this.reduceBlockingResources();
    
    // Implement resource hints
    this.implementResourceHints();
  }

  preloadCriticalResources() {
    const criticalResources = [
      '/static/css/main.css',
      '/static/js/bundle.js'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.css') ? 'style' : 'script';
      document.head.appendChild(link);
    });
  }

  optimizeImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Add loading="lazy" to non-critical images
      if (!img.hasAttribute('loading') && !this.isCriticalImage(img)) {
        img.setAttribute('loading', 'lazy');
      }
      
      // Add proper sizing attributes
      if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
        this.addImageDimensions(img);
      }
    });
  }

  isCriticalImage(img) {
    const rect = img.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.left < window.innerWidth;
  }

  addImageDimensions(img) {
    // Use ResizeObserver to get actual dimensions
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          img.setAttribute('width', Math.round(width));
          img.setAttribute('height', Math.round(height));
        }
        observer.disconnect();
      });
      observer.observe(img);
    }
  }

  reduceBlockingResources() {
    // Defer non-critical JavaScript
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      if (!this.isCriticalScript(script)) {
        script.defer = true;
      }
    });

    // Optimize CSS delivery
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    stylesheets.forEach(link => {
      if (!this.isCriticalCSS(link)) {
        link.setAttribute('media', 'print');
        link.setAttribute('onload', "this.media='all'");
      }
    });
  }

  isCriticalScript(script) {
    const criticalScripts = [
      'bundle.js',
      'main.js',
      'polyfills.js'
    ];
    
    return criticalScripts.some(name => script.src.includes(name));
  }

  isCriticalCSS(link) {
    const criticalCSS = [
      'main.css',
      'bundle.css'
    ];
    
    return criticalCSS.some(name => link.href.includes(name));
  }

  implementResourceHints() {
    const hints = [
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
      { rel: 'preconnect', href: '//fonts.googleapis.com' },
      { rel: 'preconnect', href: '//fonts.gstatic.com' }
    ];

    hints.forEach(hint => {
      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      document.head.appendChild(link);
    });
  }

  // Enhanced CLS measurement with optimization
  measureCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      let clsEntries = [];
      let sessionValue = 0;
      let sessionEntries = [];
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
            
            // If the entry occurred less than 1 second after the previous entry
            // and less than 5 seconds after the first entry in the session,
            // include the entry in the current session
            if (sessionValue && 
                entry.startTime - lastSessionEntry.startTime < 1000 &&
                entry.startTime - firstSessionEntry.startTime < 5000) {
              sessionValue += entry.value;
              sessionEntries.push(entry);
            } else {
              // Start a new session
              sessionValue = entry.value;
              sessionEntries = [entry];
            }
            
            // Update the CLS value if this session's value is larger
            if (sessionValue > clsValue) {
              clsValue = sessionValue;
              clsEntries = [...sessionEntries];
            }
          }
        });
        
        this.recordMetric('CLS', clsValue);
        
        // Trigger optimization if CLS is poor
        if (clsValue > 0.05) {
          this.optimizeCLS(clsEntries);
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('CLS', observer);
    }
  }

  optimizeCLS(entries) {
    console.log('Optimizing CLS...', entries);
    
    // Add dimensions to images and video elements
    this.addMediaDimensions();
    
    // Reserve space for dynamic content
    this.reserveDynamicSpace();
    
    // Optimize font loading
    this.optimizeFontLoading();
    
    // Fix advertisement and embed sizes
    this.fixAdvertisementSizes();
  }

  addMediaDimensions() {
    const media = document.querySelectorAll('img, video');
    
    media.forEach(element => {
      if (!element.hasAttribute('width') || !element.hasAttribute('height')) {
        // Use aspect ratio container
        const container = document.createElement('div');
        container.style.aspectRatio = this.getAspectRatio(element);
        element.parentNode.insertBefore(container, element);
        container.appendChild(element);
      }
    });
  }

  getAspectRatio(element) {
    // Default aspect ratios for common content
    const defaultRatios = {
      'img': '16/9',
      'video': '16/9'
    };
    
    return defaultRatios[element.tagName.toLowerCase()] || '1/1';
  }

  reserveDynamicSpace() {
    // Add placeholder space for dynamic content
    const dynamicContainers = document.querySelectorAll('[data-dynamic]');
    
    dynamicContainers.forEach(container => {
      if (!container.style.minHeight) {
        container.style.minHeight = '200px';
      }
    });
  }

  optimizeFontLoading() {
    // Use font-display: swap for better performance
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'System';
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }

  fixAdvertisementSizes() {
    const ads = document.querySelectorAll('.ad, [data-ad]');
    
    ads.forEach(ad => {
      if (!ad.style.width || !ad.style.height) {
        ad.style.width = '100%';
        ad.style.height = '250px';
      }
    });
  }

  // Memory leak detection and prevention
  setupMemoryLeakDetection() {
    this.memoryMonitor = {
      initialMemory: 0,
      samples: [],
      leakThreshold: 50 * 1024 * 1024, // 50MB
      checkInterval: 30000 // 30 seconds
    };

    // Get initial memory usage
    if (performance.memory) {
      this.memoryMonitor.initialMemory = performance.memory.usedJSHeapSize;
    }

    // Monitor memory usage
    setInterval(() => {
      this.checkMemoryUsage();
    }, this.memoryMonitor.checkInterval);
  }

  checkMemoryUsage() {
    if (!performance.memory) return;

    const currentMemory = performance.memory.usedJSHeapSize;
    const memoryGrowth = currentMemory - this.memoryMonitor.initialMemory;

    this.memoryMonitor.samples.push({
      timestamp: Date.now(),
      memory: currentMemory,
      growth: memoryGrowth
    });

    // Keep only last 10 samples
    if (this.memoryMonitor.samples.length > 10) {
      this.memoryMonitor.samples.shift();
    }

    // Check for memory leaks
    if (memoryGrowth > this.memoryMonitor.leakThreshold) {
      this.detectMemoryLeaks();
    }

    this.recordMetric('MEMORY_USAGE', currentMemory);
  }

  detectMemoryLeaks() {
    console.warn('Potential memory leak detected');
    
    // Analyze memory growth pattern
    const samples = this.memoryMonitor.samples;
    const growthRate = this.calculateMemoryGrowthRate(samples);
    
    if (growthRate > 0.1) { // 10% growth rate threshold
      this.preventMemoryLeaks();
    }
  }

  calculateMemoryGrowthRate(samples) {
    if (samples.length < 2) return 0;
    
    const first = samples[0];
    const last = samples[samples.length - 1];
    const timeDiff = last.timestamp - first.timestamp;
    const memoryDiff = last.memory - first.memory;
    
    return memoryDiff / timeDiff;
  }

  preventMemoryLeaks() {
    // Clear intervals and timeouts
    this.clearUnusedTimers();
    
    // Remove unused event listeners
    this.removeUnusedEventListeners();
    
    // Clear caches
    this.clearCaches();
    
    // Force garbage collection (if available)
    if (window.gc) {
      window.gc();
    }
  }

  clearUnusedTimers() {
    // Keep track of active timers
    if (!window._activeTimers) {
      window._activeTimers = new Set();
    }
    
    // This is a simplified approach - in practice, you'd need a more sophisticated system
    console.log('Clearing unused timers');
  }

  removeUnusedEventListeners() {
    // Remove event listeners on destroyed elements
    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
      if (!element.parentNode) {
        // Element is detached, remove its listeners
        element.removeEventListener && element.removeEventListener();
      }
    });
  }

  clearCaches() {
    // Clear application caches
    if (this.metrics.size > 1000) {
      // Keep only recent metrics
      const recentMetrics = new Map();
      const cutoff = Date.now() - (60 * 60 * 1000); // 1 hour ago
      
      this.metrics.forEach((values, key) => {
        const recentValues = values.filter(v => v.timestamp > cutoff);
        if (recentValues.length > 0) {
          recentMetrics.set(key, recentValues);
        }
      });
      
      this.metrics = recentMetrics;
    }
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