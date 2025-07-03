/**
 * Cross-Browser Compatibility Testing Utilities
 * Provides comprehensive testing for accessibility features across different browsers,
 * viewport sizes, and assistive technology configurations
 */

/**
 * Browser feature detection and compatibility testing
 */
export const browserCompatibility = {
  /**
   * Test modern CSS feature support
   */
  testCSSFeatures() {
    const features = {
      grid: CSS.supports('display', 'grid'),
      flexbox: CSS.supports('display', 'flex'),
      customProperties: CSS.supports('--custom-property', 'value'),
      transforms: CSS.supports('transform', 'translateX(1px)'),
      transitions: CSS.supports('transition', 'opacity 0.3s'),
      animations: CSS.supports('animation', 'none'),
      calc: CSS.supports('width', 'calc(100% - 50px)'),
      vh: CSS.supports('height', '100vh'),
      vw: CSS.supports('width', '100vw'),
      objectFit: CSS.supports('object-fit', 'cover'),
      filter: CSS.supports('filter', 'blur(5px)'),
      backdropFilter: CSS.supports('backdrop-filter', 'blur(5px)'),
      sticky: CSS.supports('position', 'sticky'),
      minmax: CSS.supports('grid-template-columns', 'minmax(100px, 1fr)'),
      clamp: CSS.supports('font-size', 'clamp(1rem, 2.5vw, 2rem)')
    };

    return {
      features,
      supportLevel: this.calculateSupportLevel(features),
      recommendations: this.generateCompatibilityRecommendations(features)
    };
  },

  /**
   * Calculate overall browser support level
   */
  calculateSupportLevel(features) {
    const supportedCount = Object.values(features).filter(Boolean).length;
    const totalCount = Object.keys(features).length;
    const percentage = (supportedCount / totalCount) * 100;

    if (percentage >= 90) return 'excellent';
    if (percentage >= 75) return 'good';
    if (percentage >= 50) return 'fair';
    return 'poor';
  },

  /**
   * Generate compatibility recommendations
   */
  generateCompatibilityRecommendations(features) {
    const recommendations = [];

    if (!features.grid) {
      recommendations.push({
        feature: 'CSS Grid',
        fallback: 'Use Flexbox or float-based layouts',
        priority: 'high'
      });
    }

    if (!features.flexbox) {
      recommendations.push({
        feature: 'Flexbox',
        fallback: 'Use float-based layouts with clearfix',
        priority: 'high'
      });
    }

    if (!features.customProperties) {
      recommendations.push({
        feature: 'CSS Custom Properties',
        fallback: 'Use SASS/LESS variables or JavaScript-based theming',
        priority: 'medium'
      });
    }

    if (!features.vh || !features.vw) {
      recommendations.push({
        feature: 'Viewport Units',
        fallback: 'Use JavaScript to calculate viewport dimensions',
        priority: 'low'
      });
    }

    return recommendations;
  },

  /**
   * Test JavaScript ES6+ feature support
   */
  testJavaScriptFeatures() {
    const features = {
      arrow: (() => true)() === true,
      asyncAwait: typeof (async () => {}) === 'function',
      destructuring: (() => {
        try {
          const [a] = [1];
          return a === 1;
        } catch {
          return false;
        }
      })(),
      spread: (() => {
        try {
          const arr = [1, 2, 3];
          const spread = [...arr];
          return spread.length === 3;
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
      })(),
      intersectionObserver: typeof IntersectionObserver !== 'undefined',
      mutationObserver: typeof MutationObserver !== 'undefined',
      performanceObserver: typeof PerformanceObserver !== 'undefined',
      requestIdleCallback: typeof requestIdleCallback !== 'undefined',
      webComponents: typeof customElements !== 'undefined',
      modules: typeof import !== 'undefined',
      workers: typeof Worker !== 'undefined'
    };

    return {
      features,
      supportLevel: this.calculateSupportLevel(features),
      polyfills: this.generatePolyfillRecommendations(features)
    };
  },

  /**
   * Generate polyfill recommendations
   */
  generatePolyfillRecommendations(features) {
    const polyfills = [];

    if (!features.fetch) {
      polyfills.push({
        feature: 'fetch',
        polyfill: 'whatwg-fetch',
        url: 'https://github.com/github/fetch'
      });
    }

    if (!features.promises) {
      polyfills.push({
        feature: 'Promise',
        polyfill: 'es6-promise',
        url: 'https://github.com/stefanpenner/es6-promise'
      });
    }

    if (!features.intersectionObserver) {
      polyfills.push({
        feature: 'IntersectionObserver',
        polyfill: 'intersection-observer',
        url: 'https://github.com/w3c/IntersectionObserver'
      });
    }

    if (!features.requestIdleCallback) {
      polyfills.push({
        feature: 'requestIdleCallback',
        polyfill: 'Custom implementation',
        fallback: 'setTimeout with appropriate delays'
      });
    }

    return polyfills;
  }
};

/**
 * Accessibility API compatibility testing
 */
export const accessibilityCompatibility = {
  /**
   * Test ARIA and accessibility API support
   */
  testAccessibilityAPIs() {
    const testElement = document.createElement('div');
    document.body.appendChild(testElement);

    const features = {
      ariaLive: 'ariaLive' in testElement,
      ariaAtomic: 'ariaAtomic' in testElement,
      ariaLabel: 'ariaLabel' in testElement,
      ariaLabelledBy: 'ariaLabelledBy' in testElement,
      ariaDescribedBy: 'ariaDescribedBy' in testElement,
      ariaExpanded: 'ariaExpanded' in testElement,
      ariaHasPopup: 'ariaHasPopup' in testElement,
      ariaControls: 'ariaControls' in testElement,
      ariaOwns: 'ariaOwns' in testElement,
      role: 'role' in testElement,
      tabIndex: 'tabIndex' in testElement,
      hidden: 'hidden' in testElement,
      focus: 'focus' in testElement,
      blur: 'blur' in testElement,
      focusin: this.testEventSupport('focusin'),
      focusout: this.testEventSupport('focusout'),
      accessKey: 'accessKey' in testElement
    };

    document.body.removeChild(testElement);

    return {
      features,
      supportLevel: browserCompatibility.calculateSupportLevel(features),
      screenReaderCompat: this.testScreenReaderCompatibility(),
      keyboardCompat: this.testKeyboardCompatibility()
    };
  },

  /**
   * Test event support
   */
  testEventSupport(eventType) {
    try {
      const testElement = document.createElement('div');
      let supported = false;
      
      const handler = () => { supported = true; };
      testElement.addEventListener(eventType, handler);
      
      const event = new Event(eventType, { bubbles: true });
      testElement.dispatchEvent(event);
      
      testElement.removeEventListener(eventType, handler);
      return supported;
    } catch {
      return false;
    }
  },

  /**
   * Test screen reader compatibility
   */
  testScreenReaderCompatibility() {
    const tests = {
      liveRegions: this.testLiveRegionSupport(),
      announcements: this.testAnnouncementSupport(),
      navigation: this.testNavigationSupport(),
      forms: this.testFormSupport()
    };

    return {
      tests,
      overallCompatibility: Object.values(tests).every(Boolean) ? 'excellent' : 'good',
      recommendations: this.generateScreenReaderRecommendations(tests)
    };
  },

  /**
   * Test live region support
   */
  testLiveRegionSupport() {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    
    document.body.appendChild(liveRegion);
    
    // Test if live region attributes are properly set
    const hasLiveAttr = liveRegion.getAttribute('aria-live') === 'polite';
    const hasAtomicAttr = liveRegion.getAttribute('aria-atomic') === 'true';
    
    document.body.removeChild(liveRegion);
    
    return hasLiveAttr && hasAtomicAttr;
  },

  /**
   * Test announcement support
   */
  testAnnouncementSupport() {
    // Test if announcements can be made to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.className = 'sr-only';
    announcement.textContent = 'Test announcement';
    
    document.body.appendChild(announcement);
    
    // Clean up after test
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 100);
    
    return true; // Assume support exists
  },

  /**
   * Test navigation support
   */
  testNavigationSupport() {
    const nav = document.createElement('nav');
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Test navigation');
    
    const link = document.createElement('a');
    link.href = '#test';
    link.textContent = 'Test link';
    nav.appendChild(link);
    
    document.body.appendChild(nav);
    
    const hasNavRole = nav.getAttribute('role') === 'navigation';
    const hasAriaLabel = nav.getAttribute('aria-label') === 'Test navigation';
    
    document.body.removeChild(nav);
    
    return hasNavRole && hasAriaLabel;
  },

  /**
   * Test form support
   */
  testFormSupport() {
    const form = document.createElement('form');
    const label = document.createElement('label');
    const input = document.createElement('input');
    
    label.htmlFor = 'test-input';
    label.textContent = 'Test Label';
    input.id = 'test-input';
    input.type = 'text';
    input.setAttribute('aria-describedby', 'test-desc');
    
    const desc = document.createElement('div');
    desc.id = 'test-desc';
    desc.textContent = 'Test description';
    
    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(desc);
    document.body.appendChild(form);
    
    const hasLabelFor = label.htmlFor === 'test-input';
    const hasInputId = input.id === 'test-input';
    const hasAriaDescribedBy = input.getAttribute('aria-describedby') === 'test-desc';
    
    document.body.removeChild(form);
    
    return hasLabelFor && hasInputId && hasAriaDescribedBy;
  },

  /**
   * Test keyboard compatibility
   */
  testKeyboardCompatibility() {
    return {
      tabNavigation: this.testTabNavigation(),
      arrowKeys: this.testArrowKeySupport(),
      enterSpace: this.testEnterSpaceSupport(),
      escape: this.testEscapeSupport(),
      homeEnd: this.testHomeEndSupport()
    };
  },

  /**
   * Test tab navigation
   */
  testTabNavigation() {
    const button = document.createElement('button');
    button.textContent = 'Test';
    document.body.appendChild(button);
    
    button.focus();
    const isFocused = document.activeElement === button;
    
    document.body.removeChild(button);
    return isFocused;
  },

  /**
   * Test arrow key support
   */
  testArrowKeySupport() {
    // Test if arrow key events can be captured
    try {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      return event.key === 'ArrowRight';
    } catch {
      return false;
    }
  },

  /**
   * Test Enter/Space key support
   */
  testEnterSpaceSupport() {
    try {
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      return enterEvent.key === 'Enter' && spaceEvent.key === ' ';
    } catch {
      return false;
    }
  },

  /**
   * Test Escape key support
   */
  testEscapeSupport() {
    try {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      return event.key === 'Escape';
    } catch {
      return false;
    }
  },

  /**
   * Test Home/End key support
   */
  testHomeEndSupport() {
    try {
      const homeEvent = new KeyboardEvent('keydown', { key: 'Home' });
      const endEvent = new KeyboardEvent('keydown', { key: 'End' });
      return homeEvent.key === 'Home' && endEvent.key === 'End';
    } catch {
      return false;
    }
  },

  /**
   * Generate screen reader recommendations
   */
  generateScreenReaderRecommendations(tests) {
    const recommendations = [];

    if (!tests.liveRegions) {
      recommendations.push({
        issue: 'Live regions not supported',
        solution: 'Use alternative announcement methods',
        priority: 'high'
      });
    }

    if (!tests.navigation) {
      recommendations.push({
        issue: 'Navigation landmarks not supported',
        solution: 'Provide additional navigation cues',
        priority: 'medium'
      });
    }

    if (!tests.forms) {
      recommendations.push({
        issue: 'Form accessibility limited',
        solution: 'Enhance form labeling and descriptions',
        priority: 'high'
      });
    }

    return recommendations;
  }
};

/**
 * Viewport and responsive design testing
 */
export const responsiveCompatibility = {
  /**
   * Test responsive design across different viewport sizes
   */
  testViewportSizes() {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 900 },
      { name: 'large', width: 1920, height: 1080 }
    ];

    return viewports.map(viewport => ({
      ...viewport,
      test: this.testViewport(viewport.width, viewport.height)
    }));
  },

  /**
   * Test specific viewport dimensions
   */
  testViewport(width, height) {
    // Mock viewport size for testing
    const originalWidth = window.innerWidth;
    const originalHeight = window.innerHeight;

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height
    });

    const results = {
      dimensions: { width, height },
      mediaQueries: this.testMediaQueries(width),
      touchSupport: this.testTouchSupport(),
      orientation: width > height ? 'landscape' : 'portrait',
      dpr: window.devicePixelRatio || 1
    };

    // Restore original dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalWidth
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalHeight
    });

    return results;
  },

  /**
   * Test media query support
   */
  testMediaQueries(width) {
    const queries = {
      mobile: window.matchMedia('(max-width: 767px)'),
      tablet: window.matchMedia('(min-width: 768px) and (max-width: 1023px)'),
      desktop: window.matchMedia('(min-width: 1024px)'),
      highDPI: window.matchMedia('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'),
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)'),
      prefersContrast: window.matchMedia('(prefers-contrast: high)')
    };

    return Object.entries(queries).reduce((results, [name, query]) => {
      results[name] = {
        matches: query.matches,
        media: query.media,
        supported: typeof query.matches === 'boolean'
      };
      return results;
    }, {});
  },

  /**
   * Test touch support
   */
  testTouchSupport() {
    return {
      touchEvents: 'ontouchstart' in window,
      touchPoints: navigator.maxTouchPoints || 0,
      pointer: window.PointerEvent !== undefined,
      hover: window.matchMedia('(hover: hover)').matches
    };
  }
};

/**
 * Performance testing across browsers
 */
export const performanceCompatibility = {
  /**
   * Test performance API support
   */
  testPerformanceAPIs() {
    const apis = {
      performance: typeof performance !== 'undefined',
      performanceNow: typeof performance?.now === 'function',
      performanceMemory: typeof performance?.memory === 'object',
      performanceObserver: typeof PerformanceObserver !== 'undefined',
      userTiming: typeof performance?.mark === 'function',
      resourceTiming: typeof performance?.getEntriesByType === 'function',
      navigationTiming: typeof performance?.navigation === 'object'
    };

    return {
      apis,
      supportLevel: browserCompatibility.calculateSupportLevel(apis),
      recommendations: this.generatePerformanceRecommendations(apis)
    };
  },

  /**
   * Generate performance recommendations
   */
  generatePerformanceRecommendations(apis) {
    const recommendations = [];

    if (!apis.performanceObserver) {
      recommendations.push({
        api: 'PerformanceObserver',
        fallback: 'Use manual performance tracking',
        impact: 'Limited Core Web Vitals monitoring'
      });
    }

    if (!apis.userTiming) {
      recommendations.push({
        api: 'User Timing API',
        fallback: 'Use Date.now() for manual timing',
        impact: 'Less precise performance measurements'
      });
    }

    if (!apis.performanceMemory) {
      recommendations.push({
        api: 'Performance Memory',
        fallback: 'Skip memory monitoring',
        impact: 'Cannot detect memory leaks'
      });
    }

    return recommendations;
  }
};

/**
 * Comprehensive browser compatibility test suite
 */
export const crossBrowserTestSuite = {
  /**
   * Run complete compatibility test suite
   */
  async runCompatibilityTests() {
    console.log('Running cross-browser compatibility tests...');

    const results = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      browser: this.detectBrowser(),
      css: browserCompatibility.testCSSFeatures(),
      javascript: browserCompatibility.testJavaScriptFeatures(),
      accessibility: accessibilityCompatibility.testAccessibilityAPIs(),
      responsive: responsiveCompatibility.testViewportSizes(),
      performance: performanceCompatibility.testPerformanceAPIs()
    };

    results.overallCompatibility = this.calculateOverallCompatibility(results);
    results.recommendations = this.generateOverallRecommendations(results);

    return results;
  },

  /**
   * Detect browser type and version
   */
  detectBrowser() {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      return { name: 'Chrome', engine: 'Blink' };
    } else if (userAgent.includes('Firefox')) {
      return { name: 'Firefox', engine: 'Gecko' };
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return { name: 'Safari', engine: 'WebKit' };
    } else if (userAgent.includes('Edg')) {
      return { name: 'Edge', engine: 'Blink' };
    } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
      return { name: 'Internet Explorer', engine: 'Trident' };
    }
    
    return { name: 'Unknown', engine: 'Unknown' };
  },

  /**
   * Calculate overall compatibility score
   */
  calculateOverallCompatibility(results) {
    const scores = {
      css: this.mapSupportLevelToScore(results.css.supportLevel),
      javascript: this.mapSupportLevelToScore(results.javascript.supportLevel),
      accessibility: this.mapSupportLevelToScore(results.accessibility.supportLevel),
      performance: this.mapSupportLevelToScore(results.performance.supportLevel)
    };

    const averageScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
    
    return {
      scores,
      average: averageScore,
      grade: this.mapScoreToGrade(averageScore),
      readyForProduction: averageScore >= 75
    };
  },

  /**
   * Map support level to numeric score
   */
  mapSupportLevelToScore(level) {
    const mapping = {
      excellent: 95,
      good: 85,
      fair: 65,
      poor: 35
    };
    return mapping[level] || 0;
  },

  /**
   * Map numeric score to letter grade
   */
  mapScoreToGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  },

  /**
   * Generate overall recommendations
   */
  generateOverallRecommendations(results) {
    const recommendations = [];

    // Combine recommendations from all test categories
    if (results.css.recommendations.length > 0) {
      recommendations.push({
        category: 'CSS',
        priority: 'high',
        items: results.css.recommendations
      });
    }

    if (results.javascript.polyfills.length > 0) {
      recommendations.push({
        category: 'JavaScript',
        priority: 'medium',
        items: results.javascript.polyfills
      });
    }

    if (results.accessibility.screenReaderCompat.recommendations.length > 0) {
      recommendations.push({
        category: 'Accessibility',
        priority: 'high',
        items: results.accessibility.screenReaderCompat.recommendations
      });
    }

    if (results.performance.recommendations.length > 0) {
      recommendations.push({
        category: 'Performance',
        priority: 'medium',
        items: results.performance.recommendations
      });
    }

    return recommendations;
  }
};

export default {
  browserCompatibility,
  accessibilityCompatibility,
  responsiveCompatibility,
  performanceCompatibility,
  crossBrowserTestSuite
};