/**
 * Security Configuration for HR Reports Application
 * Implements CSP, security headers, and security best practices
 */

// Content Security Policy configuration
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for React inline scripts
    "'unsafe-eval'",   // Required for development builds
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://cdn.jsdelivr.net"
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled-components and CSS-in-JS
    "https://fonts.googleapis.com"
  ],
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https:",
    "https://www.google-analytics.com"
  ],
  'font-src': [
    "'self'",
    "data:",
    "https://fonts.gstatic.com"
  ],
  'connect-src': [
    "'self'",
    "https://www.google-analytics.com",
    "https://api.hr-reports.com",
    process.env.REACT_APP_API_URL || "'self'"
  ],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': []
};

// Security headers configuration
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'vr=()',
    'accelerometer=()',
    'gyroscope=()',
    'magnetometer=()',
    'ambient-light-sensor=()',
    'autoplay=()',
    'encrypted-media=()',
    'fullscreen=()',
    'picture-in-picture=()'
  ].join(', ')
};

class SecurityManager {
  constructor() {
    this.isInitialized = false;
    this.violations = [];
  }

  init() {
    if (this.isInitialized) return;

    try {
      this.setupCSP();
      this.setupSecurityHeaders();
      this.setupViolationReporting();
      this.setupInputSanitization();
      this.setupAuthSecurity();
      
      this.isInitialized = true;
      console.log('Security manager initialized');
    } catch (error) {
      console.error('Failed to initialize security manager:', error);
    }
  }

  setupCSP() {
    if (!process.env.REACT_APP_ENABLE_CSP) return;

    // Create CSP string
    const cspString = Object.entries(CSP_CONFIG)
      .map(([directive, sources]) => {
        if (sources.length === 0) return directive;
        return `${directive} ${sources.join(' ')}`;
      })
      .join('; ');

    // Apply CSP via meta tag (backup method)
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = cspString;
    document.head.appendChild(meta);
  }

  setupSecurityHeaders() {
    // These are typically set by the server, but we can validate them
    this.validateSecurityHeaders();
  }

  validateSecurityHeaders() {
    // Check if security headers are present
    fetch(window.location.href, { method: 'HEAD' })
      .then(response => {
        const missingHeaders = [];
        
        Object.keys(SECURITY_HEADERS).forEach(header => {
          if (!response.headers.get(header)) {
            missingHeaders.push(header);
          }
        });

        if (missingHeaders.length > 0) {
          console.warn('Missing security headers:', missingHeaders);
        }
      })
      .catch(error => {
        console.warn('Could not validate security headers:', error);
      });
  }

  setupViolationReporting() {
    // Listen for CSP violations
    document.addEventListener('securitypolicyviolation', (event) => {
      const violation = {
        blockedURI: event.blockedURI,
        columnNumber: event.columnNumber,
        disposition: event.disposition,
        documentURI: event.documentURI,
        effectiveDirective: event.effectiveDirective,
        lineNumber: event.lineNumber,
        originalPolicy: event.originalPolicy,
        referrer: event.referrer,
        sample: event.sample,
        sourceFile: event.sourceFile,
        statusCode: event.statusCode,
        violatedDirective: event.violatedDirective,
        timestamp: new Date().toISOString()
      };

      this.violations.push(violation);
      this.reportViolation(violation);
    });
  }

  reportViolation(violation) {
    console.warn('CSP Violation:', violation);
    
    // Send to logging service
    if (process.env.REACT_APP_ENABLE_ERROR_TRACKING) {
      fetch('/api/security/violations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(violation)
      }).catch(error => {
        console.error('Failed to report CSP violation:', error);
      });
    }
  }

  setupInputSanitization() {
    // Sanitize dangerous HTML content
    this.sanitizeHTML = (html) => {
      const div = document.createElement('div');
      div.textContent = html;
      return div.innerHTML;
    };

    // Sanitize URLs
    this.sanitizeURL = (url) => {
      try {
        const parsed = new URL(url, window.location.origin);
        
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          throw new Error('Invalid protocol');
        }
        
        return parsed.toString();
      } catch (error) {
        console.warn('Invalid URL sanitized:', url);
        return '#';
      }
    };
  }

  setupAuthSecurity() {
    // Secure session storage
    this.secureStorage = {
      setItem: (key, value) => {
        try {
          const encrypted = btoa(JSON.stringify(value));
          sessionStorage.setItem(key, encrypted);
        } catch (error) {
          console.error('Failed to store secure item:', error);
        }
      },
      
      getItem: (key) => {
        try {
          const encrypted = sessionStorage.getItem(key);
          if (!encrypted) return null;
          return JSON.parse(atob(encrypted));
        } catch (error) {
          console.error('Failed to retrieve secure item:', error);
          return null;
        }
      },
      
      removeItem: (key) => {
        sessionStorage.removeItem(key);
      }
    };

    // Secure token handling
    this.tokenManager = {
      store: (token) => {
        this.secureStorage.setItem('auth_token', token);
      },
      
      retrieve: () => {
        return this.secureStorage.getItem('auth_token');
      },
      
      clear: () => {
        this.secureStorage.removeItem('auth_token');
      }
    };
  }

  // Validate and sanitize form inputs
  validateInput(input, type = 'text') {
    if (!input || typeof input !== 'string') return '';

    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input) ? input : '';
        
      case 'url':
        return this.sanitizeURL(input);
        
      case 'html':
        return this.sanitizeHTML(input);
        
      case 'alphanumeric':
        return input.replace(/[^a-zA-Z0-9]/g, '');
        
      case 'numeric':
        return input.replace(/[^0-9]/g, '');
        
      default:
        // Basic XSS prevention
        return input
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
    }
  }

  // Check for suspicious activity
  detectSuspiciousActivity() {
    const checks = [
      this.checkConsoleAccess,
      this.checkDevToolsOpen,
      this.checkAutomation,
      this.checkInjection
    ];

    checks.forEach(check => {
      try {
        check.call(this);
      } catch (error) {
        console.warn('Security check failed:', error);
      }
    });
  }

  checkConsoleAccess() {
    // Detect if console is being used extensively
    let consoleCount = 0;
    const originalLog = console.log;
    
    console.log = function(...args) {
      consoleCount++;
      if (consoleCount > 10) {
        console.warn('Excessive console usage detected');
      }
      return originalLog.apply(console, args);
    };
  }

  checkDevToolsOpen() {
    // Detect if developer tools are open
    let devtools = {
      open: false,
      orientation: null
    };

    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200 || 
          window.outerWidth - window.innerWidth > 200) {
        if (!devtools.open) {
          devtools.open = true;
          console.warn('Developer tools detected');
        }
      } else {
        devtools.open = false;
      }
    }, 500);
  }

  checkAutomation() {
    // Detect automated browsing
    if (navigator.webdriver) {
      console.warn('Automated browser detected');
    }

    // Check for common automation frameworks
    const automationIndicators = [
      'phantom',
      'selenium',
      'webdriver',
      'robot',
      'crawl',
      'spider'
    ];

    const userAgent = navigator.userAgent.toLowerCase();
    automationIndicators.forEach(indicator => {
      if (userAgent.includes(indicator)) {
        console.warn('Automation indicator detected:', indicator);
      }
    });
  }

  checkInjection() {
    // Monitor for DOM manipulation
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check for suspicious script injections
              if (node.tagName === 'SCRIPT' && !node.src.startsWith(window.location.origin)) {
                console.warn('Suspicious script injection detected:', node.src);
              }
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

  // Get security status
  getSecurityStatus() {
    return {
      initialized: this.isInitialized,
      violations: this.violations.length,
      lastViolation: this.violations[this.violations.length - 1],
      features: {
        csp: !!process.env.REACT_APP_ENABLE_CSP,
        headers: !!process.env.REACT_APP_ENABLE_SECURITY_HEADERS,
        https: window.location.protocol === 'https:'
      }
    };
  }
}

// Create singleton instance
const securityManager = new SecurityManager();

export default securityManager;
export { SecurityManager, CSP_CONFIG, SECURITY_HEADERS };