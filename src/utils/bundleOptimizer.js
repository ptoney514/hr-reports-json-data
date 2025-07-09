/**
 * Advanced Bundle Optimization System
 * Provides sophisticated code splitting, tree shaking, and bundle analysis
 */

import { lazy } from 'react';

class BundleOptimizer {
  constructor() {
    this.chunkLoadTimes = new Map();
    this.preloadQueue = new Set();
    this.criticalChunks = new Set();
    this.bundleMetrics = {
      totalSize: 0,
      chunkCount: 0,
      loadTimes: [],
      compressionRatio: 0
    };
    
    this.init();
  }

  init() {
    this.setupChunkPreloading();
    this.setupProgressiveLoading();
    this.analyzeBundlePerformance();
    this.setupIntelligentCaching();
    this.monitorChunkLoading();
  }

  // Dynamic import with intelligent preloading
  createOptimizedLazyComponent(importFn, options = {}) {
    const {
      preload = false,
      critical = false,
      fallback = null,
      timeout = 10000,
      retry = 3
    } = options;

    // Enhanced lazy component with error handling and retry logic
    const LazyComponent = lazy(() => {
      const startTime = performance.now();
      
      return this.retryImport(importFn, retry)
        .then(module => {
          const loadTime = performance.now() - startTime;
          this.recordChunkLoad(importFn.name, loadTime);
          return module;
        })
        .catch(error => {
          console.error('Failed to load chunk:', importFn.name, error);
          throw error;
        });
    });

    if (preload) {
      this.preloadQueue.add(importFn);
    }

    if (critical) {
      this.criticalChunks.add(importFn);
    }

    return LazyComponent;
  }

  // Retry mechanism for failed imports
  async retryImport(importFn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await importFn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }
  }

  // Intelligent chunk preloading based on user behavior
  setupChunkPreloading() {
    // Preload critical chunks immediately
    this.criticalChunks.forEach(importFn => {
      this.preloadChunk(importFn);
    });

    // Preload on interaction hints
    this.setupInteractionBasedPreloading();
    
    // Preload on idle
    this.setupIdlePreloading();
  }

  setupInteractionBasedPreloading() {
    // Preload chunks when user hovers over navigation items
    document.addEventListener('mouseover', (event) => {
      const link = event.target.closest('[data-preload-chunk]');
      if (link) {
        const chunkName = link.dataset.preloadChunk;
        this.preloadChunkByName(chunkName);
      }
    });

    // Preload chunks when user scrolls near relevant sections
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const chunkName = entry.target.dataset.preloadChunk;
          if (chunkName) {
            this.preloadChunkByName(chunkName);
          }
        }
      });
    }, { threshold: 0.5 });

    // Observe elements with preload hints
    document.querySelectorAll('[data-preload-chunk]').forEach(el => {
      observer.observe(el);
    });
  }

  setupIdlePreloading() {
    // Use requestIdleCallback for low-priority preloading
    const preloadOnIdle = () => {
      if (this.preloadQueue.size > 0) {
        const importFn = this.preloadQueue.values().next().value;
        this.preloadQueue.delete(importFn);
        this.preloadChunk(importFn);
      }
    };

    if ('requestIdleCallback' in window) {
      const schedulePreload = () => {
        requestIdleCallback(preloadOnIdle, { timeout: 2000 });
        if (this.preloadQueue.size > 0) {
          setTimeout(schedulePreload, 1000);
        }
      };
      schedulePreload();
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(preloadOnIdle, 2000);
    }
  }

  async preloadChunk(importFn) {
    try {
      await importFn();
      console.log('Chunk preloaded successfully:', importFn.name);
    } catch (error) {
      console.warn('Failed to preload chunk:', importFn.name, error);
    }
  }

  preloadChunkByName(chunkName) {
    // Map chunk names to import functions
    const chunkMap = {
      'dashboard': () => import('../components/dashboards/DashboardIndex'),
      'turnover': () => import('../components/dashboards/TurnoverDashboard'),
      'i9': () => import('../components/dashboards/I9HealthDashboard'),
      'recruiting': () => import('../components/dashboards/RecruitingDashboard'),
      'exit-survey': () => import('../components/dashboards/ExitSurveyDashboard'),
      'excel': () => import('../components/dashboards/ExcelIntegrationDashboard'),
      'charts': () => import('../components/charts/ChartLoader')
    };

    const importFn = chunkMap[chunkName];
    if (importFn) {
      this.preloadChunk(importFn);
    }
  }

  // Progressive loading with priority system
  setupProgressiveLoading() {
    this.loadingPriorities = {
      critical: 0,    // Load immediately
      high: 1000,     // Load after 1 second
      medium: 3000,   // Load after 3 seconds
      low: 5000       // Load after 5 seconds
    };

    this.progressiveLoadQueue = new Map();
  }

  scheduleProgressiveLoad(importFn, priority = 'medium') {
    const delay = this.loadingPriorities[priority] || 3000;
    
    setTimeout(() => {
      this.preloadChunk(importFn);
    }, delay);
  }

  // Advanced bundle analysis
  analyzeBundlePerformance() {
    if ('performance' in window) {
      // Analyze resource loading
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter(r => r.name.endsWith('.js'));
      
      this.bundleMetrics.totalSize = jsResources.reduce((sum, r) => sum + r.transferSize, 0);
      this.bundleMetrics.chunkCount = jsResources.length;
      this.bundleMetrics.loadTimes = jsResources.map(r => r.responseEnd - r.requestStart);
      
      // Calculate compression ratio
      const totalDecodedSize = jsResources.reduce((sum, r) => sum + r.decodedBodySize, 0);
      this.bundleMetrics.compressionRatio = this.bundleMetrics.totalSize / totalDecodedSize;

      console.log('Bundle Analysis:', this.bundleMetrics);
    }
  }

  // Intelligent caching strategy
  setupIntelligentCaching() {
    this.cacheConfig = {
      maxAge: 86400000, // 24 hours
      maxSize: 50 * 1024 * 1024, // 50MB
      compressionEnabled: true
    };

    this.chunkCache = new Map();
    this.setupCacheEviction();
  }

  setupCacheEviction() {
    // LRU cache implementation
    setInterval(() => {
      const now = Date.now();
      const expired = [];
      
      this.chunkCache.forEach((value, key) => {
        if (now - value.timestamp > this.cacheConfig.maxAge) {
          expired.push(key);
        }
      });

      expired.forEach(key => this.chunkCache.delete(key));
      
      // Size-based eviction
      if (this.getCacheSize() > this.cacheConfig.maxSize) {
        this.evictLeastUsed();
      }
    }, 60000); // Check every minute
  }

  getCacheSize() {
    let size = 0;
    this.chunkCache.forEach(value => {
      size += JSON.stringify(value).length;
    });
    return size;
  }

  evictLeastUsed() {
    const entries = Array.from(this.chunkCache.entries());
    entries.sort((a, b) => a[1].accessCount - b[1].accessCount);
    
    const toEvict = entries.slice(0, Math.floor(entries.length * 0.2));
    toEvict.forEach(([key]) => this.chunkCache.delete(key));
  }

  // Monitor chunk loading performance
  monitorChunkLoading() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach(entry => {
        if (entry.entryType === 'resource' && entry.name.includes('chunk')) {
          this.analyzeChunkPerformance(entry);
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  analyzeChunkPerformance(entry) {
    const metrics = {
      name: entry.name,
      loadTime: entry.responseEnd - entry.requestStart,
      size: entry.transferSize,
      cached: entry.transferSize === 0,
      compressionRatio: entry.decodedBodySize / entry.transferSize
    };

    // Alert on slow chunks
    if (metrics.loadTime > 2000) {
      console.warn('Slow chunk detected:', metrics);
    }

    // Alert on large chunks
    if (metrics.size > 500000) { // 500KB
      console.warn('Large chunk detected:', metrics);
    }
  }

  recordChunkLoad(chunkName, loadTime) {
    if (!this.chunkLoadTimes.has(chunkName)) {
      this.chunkLoadTimes.set(chunkName, []);
    }
    
    this.chunkLoadTimes.get(chunkName).push({
      time: loadTime,
      timestamp: Date.now()
    });

    // Keep only last 10 measurements
    const times = this.chunkLoadTimes.get(chunkName);
    if (times.length > 10) {
      times.splice(0, times.length - 10);
    }
  }

  // Advanced tree shaking hints
  markAsUsed(moduleId) {
    if (!window.__WEBPACK_USED_MODULES__) {
      window.__WEBPACK_USED_MODULES__ = new Set();
    }
    window.__WEBPACK_USED_MODULES__.add(moduleId);
  }

  markAsUnused(moduleId) {
    if (window.__WEBPACK_USED_MODULES__) {
      window.__WEBPACK_USED_MODULES__.delete(moduleId);
    }
  }

  // Dead code elimination hints
  setupDeadCodeDetection() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.trackComponentUsage(node);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  trackComponentUsage(element) {
    const componentName = element.dataset.component;
    if (componentName) {
      this.markAsUsed(componentName);
    }
  }

  // Performance metrics
  getOptimizationMetrics() {
    return {
      bundleMetrics: this.bundleMetrics,
      chunkLoadTimes: Object.fromEntries(this.chunkLoadTimes),
      cacheStats: {
        size: this.getCacheSize(),
        entries: this.chunkCache.size,
        hitRate: this.calculateCacheHitRate()
      },
      preloadStats: {
        queueSize: this.preloadQueue.size,
        criticalChunks: this.criticalChunks.size
      }
    };
  }

  calculateCacheHitRate() {
    let hits = 0;
    let total = 0;
    
    this.chunkCache.forEach(value => {
      total += value.accessCount;
      hits += value.hits || 0;
    });

    return total > 0 ? hits / total : 0;
  }

  // Service Worker integration for advanced caching
  setupServiceWorkerIntegration() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
          this.serviceWorkerRegistration = registration;
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }
}

// Create singleton instance
const bundleOptimizer = new BundleOptimizer();

export default bundleOptimizer;
export { BundleOptimizer };