// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Configure jest-axe for accessibility testing
import { toHaveNoViolations } from 'jest-axe';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

// Configure axe with comprehensive accessibility rules
global.axeConfig = {
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
  },
  rules: {
    'color-contrast': { enabled: true }
  },
  reporter: 'v2'
};

// Global test setup for accessibility
beforeEach(() => {
  // Create required ARIA live regions for testing
  if (!document.getElementById('status-live-region')) {
    const statusRegion = document.createElement('div');
    statusRegion.id = 'status-live-region';
    statusRegion.setAttribute('aria-live', 'polite');
    statusRegion.setAttribute('aria-atomic', 'true');
    statusRegion.className = 'sr-only';
    document.body.appendChild(statusRegion);
  }
  
  if (!document.getElementById('alert-live-region')) {
    const alertRegion = document.createElement('div');
    alertRegion.id = 'alert-live-region';
    alertRegion.setAttribute('aria-live', 'assertive');
    alertRegion.setAttribute('aria-atomic', 'true');
    alertRegion.className = 'sr-only';
    document.body.appendChild(alertRegion);
  }
  
  // Mock requestIdleCallback for testing
  if (!window.requestIdleCallback) {
    window.requestIdleCallback = (callback) => {
      return setTimeout(callback, 1);
    };
    window.cancelIdleCallback = (id) => {
      clearTimeout(id);
    };
  }
  
  // Mock PerformanceObserver for testing
  if (!window.PerformanceObserver) {
    window.PerformanceObserver = class {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {}
      disconnect() {}
    };
  }
  
  // Mock performance.memory for testing
  if (!window.performance.memory) {
    window.performance.memory = {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000
    };
  }
  
  // Mock CSS.supports for testing
  if (!window.CSS) {
    window.CSS = {
      supports: () => true
    };
  }
  
  // Mock matchMedia for testing
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

// Global test cleanup
afterEach(() => {
  // Clean up ARIA live regions
  const liveRegions = ['status-live-region', 'alert-live-region'];
  liveRegions.forEach(id => {
    const element = document.getElementById(id);
    if (element && element.parentNode === document.body) {
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
  
  // Clear localStorage
  localStorage.clear();
  
  // Reset document classes
  document.documentElement.className = '';
  
  // Clear any remaining DOM
  document.body.innerHTML = '';
});

// Global error handler for tests
window.addEventListener('error', (event) => {
  console.error('Test error:', event.error);
});

// Suppress specific warnings in tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  // Suppress React warnings about act() that are expected in tests
  if (typeof args[0] === 'string' && args[0].includes('act(')) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};
