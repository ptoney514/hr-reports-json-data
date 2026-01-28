/**
 * Security Config Tests
 *
 * Tests to ensure securityConfig.js exports correctly and has no syntax errors.
 * Prevents regression of duplicate export issues.
 */

import securityManager, { SecurityManager, CSP_CONFIG, SECURITY_HEADERS } from '../securityConfig';

describe('securityConfig', () => {
  describe('Module Import', () => {
    it('should import without syntax errors', () => {
      // This test verifies the module can be imported without throwing
      // Catches issues like duplicate exports
      expect(securityManager).toBeDefined();
      expect(SecurityManager).toBeDefined();
      expect(CSP_CONFIG).toBeDefined();
      expect(SECURITY_HEADERS).toBeDefined();
    });
  });

  describe('Exports', () => {
    it('should export default securityManager instance', () => {
      expect(securityManager).toBeDefined();
      expect(securityManager).toBeInstanceOf(SecurityManager);
    });

    it('should export SecurityManager class', () => {
      expect(SecurityManager).toBeDefined();
      expect(typeof SecurityManager).toBe('function');
    });

    it('should export CSP_CONFIG object', () => {
      expect(CSP_CONFIG).toBeDefined();
      expect(typeof CSP_CONFIG).toBe('object');
    });

    it('should export SECURITY_HEADERS object', () => {
      expect(SECURITY_HEADERS).toBeDefined();
      expect(typeof SECURITY_HEADERS).toBe('object');
    });
  });

  describe('CSP_CONFIG structure', () => {
    it('should have default-src directive', () => {
      expect(CSP_CONFIG['default-src']).toBeDefined();
      expect(Array.isArray(CSP_CONFIG['default-src'])).toBe(true);
    });

    it('should have script-src directive', () => {
      expect(CSP_CONFIG['script-src']).toBeDefined();
      expect(Array.isArray(CSP_CONFIG['script-src'])).toBe(true);
    });

    it('should have style-src directive', () => {
      expect(CSP_CONFIG['style-src']).toBeDefined();
      expect(Array.isArray(CSP_CONFIG['style-src'])).toBe(true);
    });

    it('should include self in default-src', () => {
      expect(CSP_CONFIG['default-src']).toContain("'self'");
    });
  });

  describe('SECURITY_HEADERS structure', () => {
    it('should have X-Frame-Options header', () => {
      expect(SECURITY_HEADERS['X-Frame-Options']).toBeDefined();
    });

    it('should have X-Content-Type-Options header', () => {
      expect(SECURITY_HEADERS['X-Content-Type-Options']).toBeDefined();
    });

    it('should have X-XSS-Protection header', () => {
      expect(SECURITY_HEADERS['X-XSS-Protection']).toBeDefined();
    });

    it('should have Referrer-Policy header', () => {
      expect(SECURITY_HEADERS['Referrer-Policy']).toBeDefined();
    });
  });

  describe('SecurityManager', () => {
    it('should be instantiable', () => {
      const instance = new SecurityManager();
      expect(instance).toBeInstanceOf(SecurityManager);
    });
  });
});
