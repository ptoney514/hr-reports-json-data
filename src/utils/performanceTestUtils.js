/**
 * Performance Testing Utilities for HR Reports Project
 * Provides Core Web Vitals monitoring, bundle analysis,
 * and performance benchmarking utilities
 */

/**
 * Core Web Vitals measurement utilities
 */
export const coreWebVitals = {
  /**
   * Measure Largest Contentful Paint (LCP)
   */
  measureLCP() {
    return new Promise((resolve) => {
      let lcp = 0;
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        lcp = lastEntry.startTime;
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Fallback timeout
        setTimeout(() => {
          observer.disconnect();
          resolve(lcp || performance.now());
        }, 5000);
        
        // Resolve when page is fully loaded
        if (document.readyState === 'complete') {
          setTimeout(() => {
            observer.disconnect();
            resolve(lcp || performance.now());
          }, 100);
        } else {
          window.addEventListener('load', () => {
            setTimeout(() => {
              observer.disconnect();
              resolve(lcp || performance.now());
            }, 100);
          });
        }
      } catch (error) {
        resolve(performance.now());
      }
    });
  },

  /**
   * Measure First Input Delay (FID) - approximation for testing
   */
  measureFID() {
    return new Promise((resolve) => {
      let fid = 0;
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.processingStart > entry.startTime) {
            fid = entry.processingStart - entry.startTime;
            break;
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['first-input'] });
        
        // Simulate user interaction for testing
        setTimeout(() => {
          const event = new MouseEvent('click', { bubbles: true });
          document.body.dispatchEvent(event);
        }, 100);
        
        setTimeout(() => {
          observer.disconnect();
          resolve(fid);
        }, 2000);
      } catch (error) {
        resolve(0);
      }
    });
  },

  /**
   * Measure Cumulative Layout Shift (CLS)
   */
  measureCLS() {
    return new Promise((resolve) => {
      let cls = 0;
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['layout-shift'] });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(cls);
        }, 3000);
      } catch (error) {
        resolve(0);
      }
    });
  },

  /**
   * Get comprehensive Core Web Vitals report
   */
  async getReport() {
    const startTime = performance.now();
    
    const [lcp, fid, cls] = await Promise.all([
      this.measureLCP(),
      this.measureFID(),
      this.measureCLS()
    ]);
    
    const totalTime = performance.now() - startTime;
    
    return {
      lcp: {
        value: lcp,
        rating: lcp < 2500 ? 'good' : lcp < 4000 ? 'needs-improvement' : 'poor',
        threshold: { good: 2500, poor: 4000 }
      },
      fid: {
        value: fid,
        rating: fid < 100 ? 'good' : fid < 300 ? 'needs-improvement' : 'poor',
        threshold: { good: 100, poor: 300 }
      },
      cls: {
        value: cls,
        rating: cls < 0.1 ? 'good' : cls < 0.25 ? 'needs-improvement' : 'poor',
        threshold: { good: 0.1, poor: 0.25 }
      },
      meta: {
        measurementTime: totalTime,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    };
  }
};

/**
 * Component performance testing utilities
 */
export const componentPerformance = {
  /**
   * Measure component render time
   */
  async measureRenderTime(renderFunction, iterations = 10) {
    const measurements = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await renderFunction();
      const end = performance.now();
      measurements.push(end - start);
      
      // Small delay between iterations
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    return {
      measurements,
      average: measurements.reduce((sum, time) => sum + time, 0) / iterations,
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      standardDeviation: this.calculateStandardDeviation(measurements)
    };
  },

  /**
   * Measure component memory usage
   */
  measureMemoryUsage() {
    if (performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        memoryUtilization: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  },

  /**
   * Monitor component lifecycle performance
   */
  createLifecycleMonitor(componentName) {
    const timings = {};
    const memorySnapshots = [];
    
    return {
      start(phase) {
        timings[phase] = { start: performance.now() };
        const memory = this.measureMemoryUsage();
        if (memory) {
          memorySnapshots.push({ phase: `${phase}-start`, ...memory });
        }
      },
      
      end(phase) {
        if (timings[phase]) {
          timings[phase].end = performance.now();
          timings[phase].duration = timings[phase].end - timings[phase].start;
        }
        const memory = this.measureMemoryUsage();
        if (memory) {
          memorySnapshots.push({ phase: `${phase}-end`, ...memory });
        }
      },
      
      getReport() {
        return {
          componentName,
          timings,
          memorySnapshots,
          totalMemoryDelta: memorySnapshots.length > 1 
            ? memorySnapshots[memorySnapshots.length - 1].usedJSHeapSize - memorySnapshots[0].usedJSHeapSize
            : 0
        };
      }
    };
  },

  /**
   * Calculate standard deviation
   */
  calculateStandardDeviation(values) {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
};

/**
 * Bundle analysis utilities
 */
export const bundleAnalysis = {
  /**
   * Estimate bundle size impact of components
   */
  estimateComponentSize(componentName) {
    // This would typically integrate with webpack-bundle-analyzer
    // For testing, we'll estimate based on component complexity
    
    const complexityFactors = {
      'simple': 5, // KB
      'medium': 15,
      'complex': 30,
      'chart': 50,
      'dashboard': 100
    };
    
    // Rough estimation based on component type
    if (componentName.includes('Chart')) return complexityFactors.chart;
    if (componentName.includes('Dashboard')) return complexityFactors.dashboard;
    if (componentName.includes('Navigation') || componentName.includes('Layout')) return complexityFactors.complex;
    
    return complexityFactors.medium;
  },

  /**
   * Analyze critical resource loading
   */
  analyzeCriticalResources() {
    const resources = performance.getEntriesByType('resource');
    
    const critical = resources.filter(resource => {
      return resource.name.includes('.css') || 
             resource.name.includes('.js') ||
             (resource.name.includes('.woff') && resource.transferSize < 50000);
    });
    
    return critical.map(resource => ({
      name: resource.name,
      type: this.getResourceType(resource.name),
      transferSize: resource.transferSize,
      loadTime: resource.responseEnd - resource.startTime,
      isCritical: this.isCriticalResource(resource)
    }));
  },

  /**
   * Get resource type from URL
   */
  getResourceType(url) {
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.js')) return 'script';
    if (url.includes('.woff')) return 'font';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.svg')) return 'image';
    return 'other';
  },

  /**
   * Determine if resource is critical for rendering
   */
  isCriticalResource(resource) {
    const criticalPatterns = [
      /\/main\./,
      /\/index\./,
      /\/app\./,
      /\/runtime\./,
      /\.css$/
    ];
    
    return criticalPatterns.some(pattern => pattern.test(resource.name));
  }
};

/**
 * Accessibility performance testing
 */
export const accessibilityPerformance = {
  /**
   * Measure accessibility features impact on performance
   */
  async measureA11yImpact(baselineFunction, a11yEnhancedFunction) {
    const baseline = await componentPerformance.measureRenderTime(baselineFunction, 5);
    const enhanced = await componentPerformance.measureRenderTime(a11yEnhancedFunction, 5);
    
    return {
      baseline: baseline.average,
      enhanced: enhanced.average,
      impact: enhanced.average - baseline.average,
      impactPercentage: ((enhanced.average - baseline.average) / baseline.average) * 100,
      recommendation: enhanced.average < baseline.average * 1.1 
        ? 'Minimal performance impact' 
        : enhanced.average < baseline.average * 1.25 
        ? 'Acceptable performance impact'
        : 'Consider optimization'
    };
  },

  /**
   * Test keyboard navigation performance
   */
  async measureKeyboardNavigationPerformance(container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const timings = [];
    
    for (let i = 0; i < focusableElements.length; i++) {
      const start = performance.now();
      focusableElements[i].focus();
      const end = performance.now();
      timings.push(end - start);
    }
    
    return {
      elementCount: focusableElements.length,
      timings,
      averageFocusTime: timings.reduce((sum, time) => sum + time, 0) / timings.length,
      maxFocusTime: Math.max(...timings),
      recommendation: Math.max(...timings) < 16 ? 'Excellent' : 'Consider optimization'
    };
  },

  /**
   * Measure ARIA attribute processing time
   */
  measureARIAProcessingTime(elements) {
    const start = performance.now();
    
    elements.forEach(element => {
      // Simulate ARIA attribute reading
      element.getAttribute('aria-label');
      element.getAttribute('aria-describedby');
      element.getAttribute('role');
      element.getAttribute('aria-expanded');
    });
    
    const end = performance.now();
    
    return {
      processingTime: end - start,
      elementCount: elements.length,
      averagePerElement: (end - start) / elements.length
    };
  }
};

/**
 * Performance regression testing
 */
export const regressionTesting = {
  /**
   * Create performance baseline
   */
  async createBaseline(testSuite) {
    const baseline = {};
    
    for (const [testName, testFunction] of Object.entries(testSuite)) {
      console.log(`Creating baseline for ${testName}...`);
      const result = await componentPerformance.measureRenderTime(testFunction, 10);
      baseline[testName] = {
        average: result.average,
        min: result.min,
        max: result.max,
        standardDeviation: result.standardDeviation,
        timestamp: new Date().toISOString()
      };
    }
    
    return baseline;
  },

  /**
   * Compare current performance against baseline
   */
  async compareAgainstBaseline(testSuite, baseline) {
    const results = {};
    const regressions = [];
    
    for (const [testName, testFunction] of Object.entries(testSuite)) {
      console.log(`Testing ${testName} against baseline...`);
      const current = await componentPerformance.measureRenderTime(testFunction, 10);
      const baselineData = baseline[testName];
      
      if (!baselineData) {
        results[testName] = { status: 'new-test', current };
        continue;
      }
      
      const change = ((current.average - baselineData.average) / baselineData.average) * 100;
      const isRegression = change > 20; // 20% threshold
      
      results[testName] = {
        status: isRegression ? 'regression' : 'pass',
        current,
        baseline: baselineData,
        change: {
          absolute: current.average - baselineData.average,
          percentage: change
        }
      };
      
      if (isRegression) {
        regressions.push({
          testName,
          changePercentage: change,
          changeAbsolute: current.average - baselineData.average
        });
      }
    }
    
    return {
      results,
      regressions,
      summary: {
        totalTests: Object.keys(testSuite).length,
        regressionCount: regressions.length,
        passRate: ((Object.keys(testSuite).length - regressions.length) / Object.keys(testSuite).length) * 100
      }
    };
  }
};

/**
 * Real User Monitoring (RUM) utilities
 */
export const realUserMonitoring = {
  /**
   * Initialize performance monitoring
   */
  init() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.reportLongTask(entry);
        }
      });
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long task monitoring not supported');
      }
    }
    
    // Monitor user interactions
    ['click', 'keydown', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, this.trackInteraction.bind(this), { passive: true });
    });
    
    // Monitor page visibility changes
    document.addEventListener('visibilitychange', this.trackVisibilityChange.bind(this));
  },

  /**
   * Report long task to monitoring system
   */
  reportLongTask(entry) {
    console.warn('Long task detected:', {
      duration: entry.duration,
      startTime: entry.startTime,
      name: entry.name
    });
    
    // In production, this would send to analytics
    this.sendToAnalytics('long-task', {
      duration: entry.duration,
      startTime: entry.startTime
    });
  },

  /**
   * Track user interactions
   */
  trackInteraction(event) {
    const interactionStart = performance.now();
    
    // Use requestIdleCallback to measure after interaction processing
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const interactionEnd = performance.now();
        const duration = interactionEnd - interactionStart;
        
        if (duration > 50) { // Report slow interactions
          this.sendToAnalytics('slow-interaction', {
            type: event.type,
            duration,
            target: event.target.tagName
          });
        }
      });
    }
  },

  /**
   * Track page visibility changes
   */
  trackVisibilityChange() {
    const isVisible = !document.hidden;
    this.sendToAnalytics('visibility-change', {
      visible: isVisible,
      timestamp: performance.now()
    });
  },

  /**
   * Send data to analytics (mock implementation)
   */
  sendToAnalytics(eventType, data) {
    // In production, this would send to your analytics service
    console.log(`Analytics: ${eventType}`, data);
  }
};

/**
 * Performance testing for specific accessibility features
 */
export const accessibilityFeaturePerformance = {
  /**
   * Test high contrast mode performance
   */
  async testHighContrastMode() {
    const baseline = await this.measureStyleApplication(() => {
      // Baseline: normal styles
    });
    
    const highContrast = await this.measureStyleApplication(() => {
      document.documentElement.classList.add('high-contrast-mode');
    });
    
    document.documentElement.classList.remove('high-contrast-mode');
    
    return {
      baseline: baseline.average,
      highContrast: highContrast.average,
      impact: highContrast.average - baseline.average
    };
  },

  /**
   * Test reduced motion performance
   */
  async testReducedMotion() {
    const baseline = await this.measureStyleApplication(() => {
      // Normal animations
    });
    
    const reducedMotion = await this.measureStyleApplication(() => {
      document.documentElement.classList.add('reduce-motion');
    });
    
    document.documentElement.classList.remove('reduce-motion');
    
    return {
      baseline: baseline.average,
      reducedMotion: reducedMotion.average,
      impact: reducedMotion.average - baseline.average
    };
  },

  /**
   * Measure style application performance
   */
  async measureStyleApplication(styleFunction, iterations = 5) {
    const measurements = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      styleFunction();
      // Force style recalculation
      document.body.offsetHeight;
      const end = performance.now();
      measurements.push(end - start);
    }
    
    return {
      measurements,
      average: measurements.reduce((sum, time) => sum + time, 0) / iterations,
      min: Math.min(...measurements),
      max: Math.max(...measurements)
    };
  }
};

export default {
  coreWebVitals,
  componentPerformance,
  bundleAnalysis,
  accessibilityPerformance,
  regressionTesting,
  realUserMonitoring,
  accessibilityFeaturePerformance
};