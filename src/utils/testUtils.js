/**
 * Testing Utilities for HR Reports Project
 * Provides comprehensive testing support including accessibility testing,
 * performance monitoring, and cross-browser compatibility utilities
 */

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { axe } from 'jest-axe';

/**
 * Custom render function that includes React Router context
 */
export const renderWithRouter = (ui, options = {}) => {
  const Wrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;
  
  return {
    user: userEvent.setup ? userEvent.setup() : userEvent,
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
};

/**
 * Accessibility testing utilities using axe-core
 */
export const accessibilityTestUtils = {
  /**
   * Run accessibility audit on rendered component
   */
  async runAxeAudit(container, config = {}) {
    const defaultConfig = global.axeConfig || {
      rules: {
        // Enable all accessibility rules
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'aria-labels': { enabled: true },
        'heading-order': { enabled: true },
        'landmark-roles': { enabled: true },
        'form-labels': { enabled: true },
        'image-alt': { enabled: true },
        'focus-management': { enabled: true }
      },
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
    };

    const results = await axe(container, { ...defaultConfig, ...config });
    return results;
  },

  /**
   * Check if component passes basic accessibility requirements
   */
  async expectNoAccessibilityViolations(container, config = {}) {
    const results = await this.runAxeAudit(container, config);
    expect(results).toHaveNoViolations();
    return results;
  },

  /**
   * Test keyboard navigation functionality
   */
  async testKeyboardNavigation(container, user, navigationMap = []) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    // Test Tab navigation
    for (let i = 0; i < focusableElements.length; i++) {
      await user.tab();
      expect(document.activeElement).toBe(focusableElements[i]);
    }

    // Test Shift+Tab navigation (reverse)
    for (let i = focusableElements.length - 1; i >= 0; i--) {
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(focusableElements[i]);
    }

    // Test custom navigation patterns
    for (const nav of navigationMap) {
      await user.keyboard(nav.keys);
      if (nav.expectedElement) {
        expect(document.activeElement).toBe(nav.expectedElement);
      }
      if (nav.customAssertion) {
        nav.customAssertion();
      }
    }
  },

  /**
   * Test ARIA attributes and screen reader content
   */
  testARIAAttributes(container, expectedAttributes = {}) {
    Object.entries(expectedAttributes).forEach(([selector, attributes]) => {
      const element = container.querySelector(selector);
      expect(element).toBeInTheDocument();

      Object.entries(attributes).forEach(([attr, value]) => {
        if (value === null) {
          expect(element).not.toHaveAttribute(attr);
        } else {
          expect(element).toHaveAttribute(attr, value);
        }
      });
    });
  },

  /**
   * Test screen reader announcements
   */
  async testScreenReaderAnnouncements(expectedAnnouncements = []) {
    const liveRegions = document.querySelectorAll('[aria-live]');
    
    for (const announcement of expectedAnnouncements) {
      const matchingRegion = Array.from(liveRegions).find(region => 
        region.textContent.includes(announcement.text)
      );
      
      expect(matchingRegion).toBeInTheDocument();
      expect(matchingRegion).toHaveAttribute('aria-live', announcement.level || 'polite');
    }
  },

  /**
   * Test high contrast mode compatibility
   */
  testHighContrastMode(container) {
    // Add high contrast class
    document.documentElement.classList.add('high-contrast-mode');
    
    // Check that important elements are still visible
    const importantElements = container.querySelectorAll(
      'button, a, [role="button"], input, select, textarea'
    );
    
    importantElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const backgroundColor = styles.backgroundColor;
      const color = styles.color;
      const border = styles.border;
      
      // Ensure elements have sufficient contrast or visible borders
      expect(
        backgroundColor !== 'rgba(0, 0, 0, 0)' || 
        color !== 'rgba(0, 0, 0, 0)' || 
        border !== 'none'
      ).toBe(true);
    });
    
    // Clean up
    document.documentElement.classList.remove('high-contrast-mode');
  },

  /**
   * Test reduced motion preferences
   */
  testReducedMotion(container) {
    // Add reduced motion class
    document.documentElement.classList.add('reduce-motion');
    
    // Check that animations are disabled or reduced
    const animatedElements = container.querySelectorAll('*');
    animatedElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const transition = styles.transition;
      const animation = styles.animation;
      
      // In reduced motion mode, transitions and animations should be minimal
      if (transition !== 'none') {
        expect(transition.includes('0s') || transition.includes('reduced')).toBe(true);
      }
      if (animation !== 'none') {
        expect(animation.includes('0s') || animation.includes('reduced')).toBe(true);
      }
    });
    
    // Clean up
    document.documentElement.classList.remove('reduce-motion');
  },

  /**
   * Test focus management and focus trapping
   */
  async testFocusManagement(container, user, focusTrapSelector = null) {
    if (focusTrapSelector) {
      const focusTrap = container.querySelector(focusTrapSelector);
      expect(focusTrap).toBeInTheDocument();
      
      const focusableInTrap = focusTrap.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableInTrap.length > 0) {
        // Focus should be trapped within the container
        focusableInTrap[0].focus();
        
        for (let i = 0; i < focusableInTrap.length; i++) {
          await user.tab();
          expect(focusTrap.contains(document.activeElement)).toBe(true);
        }
        
        // Test reverse tab
        for (let i = focusableInTrap.length - 1; i >= 0; i--) {
          await user.tab({ shift: true });
          expect(focusTrap.contains(document.activeElement)).toBe(true);
        }
      }
    }
  }
};

/**
 * Performance testing utilities
 */
export const performanceTestUtils = {
  /**
   * Measure component render performance
   */
  async measureRenderPerformance(renderFn, iterations = 10) {
    const measurements = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await renderFn();
      const end = performance.now();
      measurements.push(end - start);
    }
    
    const average = measurements.reduce((sum, time) => sum + time, 0) / iterations;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);
    
    return {
      average,
      min,
      max,
      measurements,
      iterations
    };
  },

  /**
   * Monitor memory usage during component lifecycle
   */
  measureMemoryUsage() {
    if (performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  },

  /**
   * Test Core Web Vitals compliance
   */
  async testCoreWebVitals(renderFn) {
    const startTime = performance.now();
    
    // Measure LCP (Largest Contentful Paint)
    let lcp = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      lcp = lastEntry.startTime;
    });
    
    if (typeof PerformanceObserver !== 'undefined') {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
    
    await renderFn();
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    observer.disconnect();
    
    return {
      lcp: lcp || totalTime, // Fallback to total time if LCP not available
      fid: 0, // FID requires real user interaction
      cls: 0, // CLS requires layout shift measurement
      totalRenderTime: totalTime,
      recommendations: {
        lcp: lcp < 2500 ? 'Good' : lcp < 4000 ? 'Needs Improvement' : 'Poor',
        performance: totalTime < 100 ? 'Excellent' : totalTime < 300 ? 'Good' : 'Needs Improvement'
      }
    };
  }
};

/**
 * Cross-browser compatibility testing utilities
 */
export const crossBrowserTestUtils = {
  /**
   * Test CSS Grid and Flexbox support
   */
  testLayoutSupport() {
    const testElement = document.createElement('div');
    document.body.appendChild(testElement);
    
    const support = {
      grid: CSS.supports('display', 'grid'),
      flexbox: CSS.supports('display', 'flex'),
      customProperties: CSS.supports('--custom-property', 'value'),
      transforms: CSS.supports('transform', 'translateX(1px)'),
      transitions: CSS.supports('transition', 'opacity 0.3s')
    };
    
    document.body.removeChild(testElement);
    return support;
  },

  /**
   * Test modern JavaScript features
   */
  testJavaScriptSupport() {
    return {
      asyncAwait: typeof (async () => {}) === 'function',
      arrow: (() => true)() === true,
      destructuring: (() => {
        try {
          const [a] = [1];
          return a === 1;
        } catch {
          return false;
        }
      })(),
      promises: typeof Promise !== 'undefined',
      fetch: typeof fetch !== 'undefined',
      localStorage: (() => {
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
          return true;
        } catch {
          return false;
        }
      })()
    };
  },

  /**
   * Test accessibility API support
   */
  testAccessibilitySupport() {
    return {
      ariaLive: 'ariaLive' in document.createElement('div'),
      ariaDescribedBy: 'ariaDescribedBy' in document.createElement('div'),
      ariaLabel: 'ariaLabel' in document.createElement('div'),
      role: 'role' in document.createElement('div'),
      tabIndex: 'tabIndex' in document.createElement('div'),
      focus: 'focus' in document.createElement('div')
    };
  }
};

/**
 * Utility to create mock data for testing
 */
export const createMockData = {
  /**
   * Create mock workforce data
   */
  workforce: (count = 5) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Employee ${i + 1}`,
      department: `Department ${(i % 3) + 1}`,
      location: `Location ${(i % 2) + 1}`,
      startDate: new Date(2020 + (i % 4), i % 12, 1).toISOString(),
      employees: Math.floor(Math.random() * 100) + 10
    }));
  },

  /**
   * Create mock chart data
   */
  chart: (count = 5, type = 'bar') => {
    return Array.from({ length: count }, (_, i) => ({
      name: `Category ${i + 1}`,
      value: Math.floor(Math.random() * 1000) + 100,
      label: `Label ${i + 1}`,
      percentage: Math.floor(Math.random() * 100)
    }));
  },

  /**
   * Create mock filter options
   */
  filters: () => ({
    departments: ['Department 1', 'Department 2', 'Department 3'],
    locations: ['Location 1', 'Location 2'],
    dateRanges: ['Last 30 days', 'Last 90 days', 'Last year']
  })
};

/**
 * Test environment setup utilities
 */
export const setupTestEnvironment = {
  /**
   * Setup accessibility testing environment
   */
  accessibility: () => {
    // Add axe-core configuration
    if (typeof window !== 'undefined') {
      window.axe = require('axe-core');
    }
    
    // Create ARIA live regions for testing
    const liveRegions = [
      { id: 'status-live-region', level: 'polite' },
      { id: 'alert-live-region', level: 'assertive' }
    ];
    
    liveRegions.forEach(region => {
      if (!document.getElementById(region.id)) {
        const element = document.createElement('div');
        element.id = region.id;
        element.setAttribute('aria-live', region.level);
        element.setAttribute('aria-atomic', 'true');
        element.className = 'sr-only';
        document.body.appendChild(element);
      }
    });
  },

  /**
   * Setup performance monitoring
   */
  performance: () => {
    // Mock performance APIs if not available
    if (!window.performance) {
      window.performance = {
        now: () => Date.now(),
        memory: {
          usedJSHeapSize: 1000000,
          totalJSHeapSize: 2000000,
          jsHeapSizeLimit: 4000000
        }
      };
    }
    
    // Mock PerformanceObserver if not available
    if (!window.PerformanceObserver) {
      window.PerformanceObserver = class {
        constructor(callback) {
          this.callback = callback;
        }
        observe() {}
        disconnect() {}
      };
    }
  },

  /**
   * Cleanup test environment
   */
  cleanup: () => {
    // Remove test ARIA live regions
    const testRegions = ['status-live-region', 'alert-live-region'];
    testRegions.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.remove();
      }
    });
    
    // Clean up accessibility classes
    const accessibilityClasses = [
      'high-contrast-mode',
      'reduce-motion',
      'large-text',
      'keyboard-navigation-enhanced',
      'screen-reader-optimized'
    ];
    
    accessibilityClasses.forEach(className => {
      document.documentElement.classList.remove(className);
    });
  }
};

export default {
  renderWithRouter,
  accessibilityTestUtils,
  performanceTestUtils,
  crossBrowserTestUtils,
  createMockData,
  setupTestEnvironment
};