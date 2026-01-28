/**
 * Cross Browser Test Utils Tests
 *
 * Tests to ensure crossBrowserTestUtils.js exports correctly and has no syntax errors.
 * Prevents regression of invalid `typeof import` usage.
 */

import CrossBrowserTestUtils, {
  browserCompatibility,
  accessibilityCompatibility,
  responsiveCompatibility,
  performanceCompatibility,
  crossBrowserTestSuite
} from '../crossBrowserTestUtils';

describe('crossBrowserTestUtils', () => {
  describe('Module Import', () => {
    it('should import without syntax errors', () => {
      // This test verifies the module can be imported without throwing
      // Catches issues like invalid `typeof import` usage
      expect(CrossBrowserTestUtils).toBeDefined();
    });

    it('should export default object with all utilities', () => {
      expect(CrossBrowserTestUtils.browserCompatibility).toBeDefined();
      expect(CrossBrowserTestUtils.accessibilityCompatibility).toBeDefined();
      expect(CrossBrowserTestUtils.responsiveCompatibility).toBeDefined();
      expect(CrossBrowserTestUtils.performanceCompatibility).toBeDefined();
      expect(CrossBrowserTestUtils.crossBrowserTestSuite).toBeDefined();
    });
  });

  describe('browserCompatibility', () => {
    it('should export browserCompatibility object', () => {
      expect(browserCompatibility).toBeDefined();
      expect(typeof browserCompatibility).toBe('object');
    });

    it('should have testJavaScriptFeatures method', () => {
      expect(browserCompatibility.testJavaScriptFeatures).toBeDefined();
      expect(typeof browserCompatibility.testJavaScriptFeatures).toBe('function');
    });

    it('should have testCSSFeatures method', () => {
      expect(browserCompatibility.testCSSFeatures).toBeDefined();
      expect(typeof browserCompatibility.testCSSFeatures).toBe('function');
    });

    it('testJavaScriptFeatures should return features object with modules property', () => {
      // This specifically tests the fix for typeof import issue
      const result = browserCompatibility.testJavaScriptFeatures();
      expect(result).toBeDefined();
      expect(result.features).toBeDefined();
      expect('modules' in result.features).toBe(true);
      expect(typeof result.features.modules).toBe('boolean');
    });
  });

  describe('accessibilityCompatibility', () => {
    it('should export accessibilityCompatibility object', () => {
      expect(accessibilityCompatibility).toBeDefined();
      expect(typeof accessibilityCompatibility).toBe('object');
    });
  });

  describe('responsiveCompatibility', () => {
    it('should export responsiveCompatibility object', () => {
      expect(responsiveCompatibility).toBeDefined();
      expect(typeof responsiveCompatibility).toBe('object');
    });
  });

  describe('performanceCompatibility', () => {
    it('should export performanceCompatibility object', () => {
      expect(performanceCompatibility).toBeDefined();
      expect(typeof performanceCompatibility).toBe('object');
    });
  });

  describe('crossBrowserTestSuite', () => {
    it('should export crossBrowserTestSuite object', () => {
      expect(crossBrowserTestSuite).toBeDefined();
      expect(typeof crossBrowserTestSuite).toBe('object');
    });
  });
});
