/**
 * Automated Accessibility Regression Testing Suite
 * Provides comprehensive accessibility regression testing to ensure
 * that new changes don't break existing accessibility features
 */

import { axe } from 'jest-axe';
import { accessibilityTestUtils, performanceTestUtils } from './testUtils';

/**
 * Accessibility baseline management
 */
export class AccessibilityBaseline {
  constructor() {
    this.baselines = new Map();
    this.testResults = new Map();
  }

  /**
   * Create accessibility baseline for a component
   */
  async createBaseline(componentName, renderFunction) {
    console.log(`Creating accessibility baseline for ${componentName}...`);
    
    const { container } = renderFunction();
    
    // Run comprehensive accessibility audit
    const axeResults = await axe(container, {
      rules: {
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
    });

    // Performance baseline
    const performanceBaseline = await performanceTestUtils.componentPerformance.measureRenderTime(
      renderFunction, 
      5
    );

    // Keyboard navigation baseline
    const keyboardBaseline = await this.createKeyboardNavigationBaseline(container);

    // ARIA attributes baseline
    const ariaBaseline = this.createARIABaseline(container);

    const baseline = {
      componentName,
      timestamp: new Date().toISOString(),
      accessibility: {
        violations: axeResults.violations.length,
        violationTypes: axeResults.violations.map(v => v.id),
        passes: axeResults.passes.length,
        incomplete: axeResults.incomplete.length
      },
      performance: {
        averageRenderTime: performanceBaseline.average,
        maxRenderTime: performanceBaseline.max,
        minRenderTime: performanceBaseline.min
      },
      keyboard: keyboardBaseline,
      aria: ariaBaseline,
      metrics: {
        focusableElements: container.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ).length,
        ariaLabels: container.querySelectorAll('[aria-label]').length,
        headings: container.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
        landmarks: container.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]').length
      }
    };

    this.baselines.set(componentName, baseline);
    return baseline;
  }

  /**
   * Create keyboard navigation baseline
   */
  async createKeyboardNavigationBaseline(container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const keyboardTests = [];

    // Test tab order
    for (let i = 0; i < focusableElements.length; i++) {
      const element = focusableElements[i];
      const start = performance.now();
      element.focus();
      const end = performance.now();
      
      keyboardTests.push({
        elementType: element.tagName.toLowerCase(),
        elementRole: element.getAttribute('role'),
        focusTime: end - start,
        tabIndex: element.tabIndex,
        hasAriaLabel: element.hasAttribute('aria-label'),
        hasAriaDescribedBy: element.hasAttribute('aria-describedby')
      });
    }

    return {
      focusableElementCount: focusableElements.length,
      averageFocusTime: keyboardTests.reduce((sum, test) => sum + test.focusTime, 0) / keyboardTests.length,
      maxFocusTime: Math.max(...keyboardTests.map(test => test.focusTime)),
      tabOrderTests: keyboardTests
    };
  }

  /**
   * Create ARIA attributes baseline
   */
  createARIABaseline(container) {
    const ariaElements = container.querySelectorAll('[aria-label], [aria-describedby], [aria-labelledby], [role]');
    const ariaData = {};

    ariaElements.forEach((element, index) => {
      const elementId = element.id || `element-${index}`;
      ariaData[elementId] = {
        tagName: element.tagName,
        role: element.getAttribute('role'),
        ariaLabel: element.getAttribute('aria-label'),
        ariaDescribedBy: element.getAttribute('aria-describedby'),
        ariaLabelledBy: element.getAttribute('aria-labelledby'),
        ariaExpanded: element.getAttribute('aria-expanded'),
        ariaHasPopup: element.getAttribute('aria-haspopup'),
        tabIndex: element.tabIndex
      };
    });

    return {
      elementCount: ariaElements.length,
      elements: ariaData
    };
  }

  /**
   * Compare current state against baseline
   */
  async compareAgainstBaseline(componentName, renderFunction) {
    const baseline = this.baselines.get(componentName);
    if (!baseline) {
      throw new Error(`No baseline found for component: ${componentName}`);
    }

    console.log(`Comparing ${componentName} against baseline...`);

    const { container } = renderFunction();

    // Current accessibility state
    const axeResults = await axe(container, {
      rules: baseline.accessibility.violationTypes.reduce((rules, violationType) => {
        rules[violationType] = { enabled: true };
        return rules;
      }, {})
    });

    // Current performance
    const currentPerformance = await performanceTestUtils.componentPerformance.measureRenderTime(
      renderFunction, 
      5
    );

    // Current keyboard navigation
    const currentKeyboard = await this.createKeyboardNavigationBaseline(container);

    // Current ARIA state
    const currentAria = this.createARIABaseline(container);

    const comparison = {
      componentName,
      timestamp: new Date().toISOString(),
      baseline: baseline.timestamp,
      results: {
        accessibility: {
          status: axeResults.violations.length <= baseline.accessibility.violations ? 'pass' : 'regression',
          current: axeResults.violations.length,
          baseline: baseline.accessibility.violations,
          newViolations: axeResults.violations.filter(v => 
            !baseline.accessibility.violationTypes.includes(v.id)
          ),
          fixedViolations: baseline.accessibility.violationTypes.filter(id => 
            !axeResults.violations.some(v => v.id === id)
          )
        },
        performance: {
          status: currentPerformance.average <= baseline.performance.averageRenderTime * 1.1 ? 'pass' : 'regression',
          current: currentPerformance.average,
          baseline: baseline.performance.averageRenderTime,
          change: currentPerformance.average - baseline.performance.averageRenderTime,
          changePercentage: ((currentPerformance.average - baseline.performance.averageRenderTime) / baseline.performance.averageRenderTime) * 100
        },
        keyboard: {
          status: currentKeyboard.focusableElementCount >= baseline.keyboard.focusableElementCount ? 'pass' : 'regression',
          current: currentKeyboard.focusableElementCount,
          baseline: baseline.keyboard.focusableElementCount,
          focusTimeStatus: currentKeyboard.averageFocusTime <= baseline.keyboard.averageFocusTime * 1.2 ? 'pass' : 'regression'
        },
        aria: {
          status: currentAria.elementCount >= baseline.aria.elementCount ? 'pass' : 'regression',
          current: currentAria.elementCount,
          baseline: baseline.aria.elementCount,
          removedElements: this.findRemovedARIAElements(baseline.aria.elements, currentAria.elements),
          addedElements: this.findAddedARIAElements(baseline.aria.elements, currentAria.elements)
        }
      }
    };

    this.testResults.set(`${componentName}-${Date.now()}`, comparison);
    return comparison;
  }

  /**
   * Find removed ARIA elements
   */
  findRemovedARIAElements(baselineElements, currentElements) {
    const removed = [];
    for (const [id, element] of Object.entries(baselineElements)) {
      if (!currentElements[id]) {
        removed.push({ id, ...element });
      }
    }
    return removed;
  }

  /**
   * Find added ARIA elements
   */
  findAddedARIAElements(baselineElements, currentElements) {
    const added = [];
    for (const [id, element] of Object.entries(currentElements)) {
      if (!baselineElements[id]) {
        added.push({ id, ...element });
      }
    }
    return added;
  }

  /**
   * Generate regression report
   */
  generateReport() {
    const allResults = Array.from(this.testResults.values());
    const regressions = allResults.filter(result => 
      result.results.accessibility.status === 'regression' ||
      result.results.performance.status === 'regression' ||
      result.results.keyboard.status === 'regression' ||
      result.results.aria.status === 'regression'
    );

    return {
      summary: {
        totalTests: allResults.length,
        regressions: regressions.length,
        passRate: ((allResults.length - regressions.length) / allResults.length) * 100,
        timestamp: new Date().toISOString()
      },
      regressions: regressions.map(regression => ({
        component: regression.componentName,
        issues: this.extractIssues(regression),
        severity: this.calculateSeverity(regression)
      })),
      details: allResults
    };
  }

  /**
   * Extract issues from regression result
   */
  extractIssues(regression) {
    const issues = [];

    if (regression.results.accessibility.status === 'regression') {
      issues.push({
        type: 'accessibility',
        message: `New accessibility violations: ${regression.results.accessibility.newViolations.length}`,
        violations: regression.results.accessibility.newViolations.map(v => v.id)
      });
    }

    if (regression.results.performance.status === 'regression') {
      issues.push({
        type: 'performance',
        message: `Performance regression: ${regression.results.performance.changePercentage.toFixed(2)}% slower`,
        change: regression.results.performance.change
      });
    }

    if (regression.results.keyboard.status === 'regression') {
      issues.push({
        type: 'keyboard',
        message: `Keyboard navigation regression: ${regression.results.keyboard.baseline - regression.results.keyboard.current} fewer focusable elements`
      });
    }

    if (regression.results.aria.status === 'regression') {
      issues.push({
        type: 'aria',
        message: `ARIA regression: ${regression.results.aria.removedElements.length} elements lost ARIA attributes`,
        removedElements: regression.results.aria.removedElements
      });
    }

    return issues;
  }

  /**
   * Calculate severity of regression
   */
  calculateSeverity(regression) {
    let severity = 'low';

    // High severity conditions
    if (regression.results.accessibility.newViolations.length > 5) severity = 'high';
    if (regression.results.performance.changePercentage > 50) severity = 'high';
    if (regression.results.keyboard.current === 0 && regression.results.keyboard.baseline > 0) severity = 'high';

    // Medium severity conditions
    if (regression.results.accessibility.newViolations.length > 2) severity = 'medium';
    if (regression.results.performance.changePercentage > 25) severity = 'medium';
    if (regression.results.aria.removedElements.length > 3) severity = 'medium';

    return severity;
  }

  /**
   * Save baselines to file (for CI/CD)
   */
  exportBaselines() {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      baselines: Object.fromEntries(this.baselines)
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Load baselines from file
   */
  importBaselines(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      this.baselines = new Map(Object.entries(data.baselines));
      return true;
    } catch (error) {
      console.error('Failed to import baselines:', error);
      return false;
    }
  }
}

/**
 * Automated regression test runner
 */
export class RegressionTestRunner {
  constructor() {
    this.baseline = new AccessibilityBaseline();
    this.testSuites = new Map();
  }

  /**
   * Register component test suite
   */
  registerTestSuite(componentName, testSuite) {
    this.testSuites.set(componentName, testSuite);
  }

  /**
   * Run all regression tests
   */
  async runRegressionTests(mode = 'compare') {
    const results = [];

    for (const [componentName, testSuite] of this.testSuites) {
      console.log(`Running regression tests for ${componentName}...`);

      for (const [testName, renderFunction] of Object.entries(testSuite)) {
        const fullTestName = `${componentName}.${testName}`;

        if (mode === 'baseline') {
          // Create new baseline
          const baseline = await this.baseline.createBaseline(fullTestName, renderFunction);
          results.push({
            test: fullTestName,
            mode: 'baseline',
            baseline
          });
        } else {
          // Compare against existing baseline
          try {
            const comparison = await this.baseline.compareAgainstBaseline(fullTestName, renderFunction);
            results.push({
              test: fullTestName,
              mode: 'compare',
              comparison
            });
          } catch (error) {
            console.warn(`No baseline found for ${fullTestName}, creating new baseline...`);
            const baseline = await this.baseline.createBaseline(fullTestName, renderFunction);
            results.push({
              test: fullTestName,
              mode: 'baseline',
              baseline
            });
          }
        }
      }
    }

    return results;
  }

  /**
   * Generate CI/CD friendly report
   */
  generateCIReport(results) {
    const regressions = results.filter(result => 
      result.mode === 'compare' && 
      result.comparison &&
      this.hasRegressions(result.comparison)
    );

    const report = {
      status: regressions.length === 0 ? 'pass' : 'fail',
      summary: {
        totalTests: results.length,
        passed: results.length - regressions.length,
        failed: regressions.length,
        regressionRate: (regressions.length / results.length) * 100
      },
      regressions: regressions.map(result => ({
        test: result.test,
        issues: this.baseline.extractIssues(result.comparison),
        severity: this.baseline.calculateSeverity(result.comparison)
      })),
      recommendations: this.generateRecommendations(regressions)
    };

    return report;
  }

  /**
   * Check if comparison has regressions
   */
  hasRegressions(comparison) {
    return Object.values(comparison.results).some(result => result.status === 'regression');
  }

  /**
   * Generate recommendations based on regressions
   */
  generateRecommendations(regressions) {
    const recommendations = [];

    const accessibilityRegressions = regressions.filter(r => 
      r.comparison && r.comparison.results.accessibility.status === 'regression'
    );
    
    if (accessibilityRegressions.length > 0) {
      recommendations.push({
        type: 'accessibility',
        priority: 'high',
        message: 'Review and fix accessibility violations before deployment',
        actions: [
          'Run axe-core audit on affected components',
          'Test with screen readers',
          'Verify keyboard navigation',
          'Check color contrast ratios'
        ]
      });
    }

    const performanceRegressions = regressions.filter(r => 
      r.comparison && r.comparison.results.performance.status === 'regression'
    );
    
    if (performanceRegressions.length > 0) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Optimize component performance',
        actions: [
          'Profile component render times',
          'Optimize accessibility feature implementations',
          'Consider lazy loading for complex components',
          'Review ARIA attribute generation performance'
        ]
      });
    }

    return recommendations;
  }
}

/**
 * Jest integration helpers
 */
export const jestHelpers = {
  /**
   * Create Jest test suite for regression testing
   */
  createRegressionTestSuite(componentName, testCases) {
    describe(`${componentName} Accessibility Regression Tests`, () => {
      const runner = new RegressionTestRunner();
      runner.registerTestSuite(componentName, testCases);

      test('should not have accessibility regressions', async () => {
        const results = await runner.runRegressionTests('compare');
        const report = runner.generateCIReport(results);

        if (report.status === 'fail') {
          const failureMessage = report.regressions
            .map(r => `${r.test}: ${r.issues.map(i => i.message).join(', ')}`)
            .join('\n');
          
          throw new Error(`Accessibility regressions detected:\n${failureMessage}`);
        }

        expect(report.status).toBe('pass');
      });

      test('should maintain performance within acceptable limits', async () => {
        const results = await runner.runRegressionTests('compare');
        const performanceRegressions = results.filter(result => 
          result.mode === 'compare' && 
          result.comparison &&
          result.comparison.results.performance.status === 'regression'
        );

        if (performanceRegressions.length > 0) {
          const slowComponents = performanceRegressions
            .map(r => `${r.test}: ${r.comparison.results.performance.changePercentage.toFixed(2)}% slower`)
            .join('\n');
          
          throw new Error(`Performance regressions detected:\n${slowComponents}`);
        }

        expect(performanceRegressions).toHaveLength(0);
      });
    });
  }
};

export default {
  AccessibilityBaseline,
  RegressionTestRunner,
  jestHelpers
};