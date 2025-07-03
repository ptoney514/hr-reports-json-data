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
      this.setupRateLimiting();
      this.setupAdvancedEncryption();
      this.detectSuspiciousActivity();
      this.startPeriodicAudit();
      
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

  // Advanced security audit system
  runSecurityAudit() {
    const audit = {
      timestamp: new Date().toISOString(),
      score: 0,
      maxScore: 100,
      vulnerabilities: [],
      recommendations: [],
      compliance: {}
    };

    // Check CSP implementation
    this.auditCSP(audit);
    
    // Check security headers
    this.auditSecurityHeaders(audit);
    
    // Check HTTPS configuration
    this.auditHTTPS(audit);
    
    // Check input validation
    this.auditInputValidation(audit);
    
    // Check authentication/authorization
    this.auditAuthentication(audit);
    
    // Check data protection
    this.auditDataProtection(audit);
    
    // Check dependency vulnerabilities
    this.auditDependencies(audit);

    // Calculate final score
    audit.score = Math.max(0, audit.maxScore - audit.vulnerabilities.length * 5);
    audit.grade = this.getSecurityGrade(audit.score);

    return audit;
  }

  auditCSP(audit) {
    if (!process.env.REACT_APP_ENABLE_CSP) {
      audit.vulnerabilities.push({
        severity: 'HIGH',
        category: 'CSP',
        description: 'Content Security Policy not enabled',
        recommendation: 'Enable CSP via REACT_APP_ENABLE_CSP environment variable'
      });
    } else {
      // Check for unsafe CSP directives
      if (CSP_CONFIG['script-src'].includes("'unsafe-inline'")) {
        audit.vulnerabilities.push({
          severity: 'MEDIUM',
          category: 'CSP',
          description: 'CSP allows unsafe-inline scripts',
          recommendation: 'Remove unsafe-inline and use nonces or hashes'
        });
      }
      
      if (CSP_CONFIG['script-src'].includes("'unsafe-eval'")) {
        audit.vulnerabilities.push({
          severity: 'MEDIUM',
          category: 'CSP',
          description: 'CSP allows unsafe-eval',
          recommendation: 'Remove unsafe-eval in production builds'
        });
      }
    }
  }

  auditSecurityHeaders(audit) {
    const requiredHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'X-XSS-Protection',
      'Referrer-Policy'
    ];

    requiredHeaders.forEach(header => {
      if (!SECURITY_HEADERS[header]) {
        audit.vulnerabilities.push({
          severity: 'MEDIUM',
          category: 'Headers',
          description: `Missing security header: ${header}`,
          recommendation: `Add ${header} header to server configuration`
        });
      }
    });
  }

  auditHTTPS(audit) {
    if (window.location.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
      audit.vulnerabilities.push({
        severity: 'HIGH',
        category: 'Transport',
        description: 'Application not served over HTTPS',
        recommendation: 'Configure HTTPS with valid SSL certificate'
      });
    }

    // Check for mixed content
    const resources = performance.getEntriesByType('resource');
    const mixedContent = resources.filter(resource => 
      resource.name.startsWith('http:') && window.location.protocol === 'https:'
    );

    if (mixedContent.length > 0) {
      audit.vulnerabilities.push({
        severity: 'MEDIUM',
        category: 'Transport',
        description: 'Mixed content detected',
        recommendation: 'Ensure all resources are loaded over HTTPS',
        details: mixedContent.map(r => r.name)
      });
    }
  }

  auditInputValidation(audit) {
    // Check if form inputs have proper validation
    const forms = document.querySelectorAll('form');
    const inputsWithoutValidation = [];

    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        if (!input.hasAttribute('required') && 
            !input.hasAttribute('pattern') && 
            !input.hasAttribute('minlength') &&
            !input.hasAttribute('maxlength')) {
          inputsWithoutValidation.push(input.name || input.id || 'unnamed');
        }
      });
    });

    if (inputsWithoutValidation.length > 0) {
      audit.vulnerabilities.push({
        severity: 'LOW',
        category: 'Input Validation',
        description: 'Forms with insufficient client-side validation',
        recommendation: 'Add proper validation attributes to form inputs',
        details: inputsWithoutValidation
      });
    }
  }

  auditAuthentication(audit) {
    // Check for authentication tokens in localStorage (security risk)
    const localStorageKeys = Object.keys(localStorage);
    const tokenInLocalStorage = localStorageKeys.some(key => 
      key.toLowerCase().includes('token') || 
      key.toLowerCase().includes('auth') ||
      key.toLowerCase().includes('jwt')
    );

    if (tokenInLocalStorage) {
      audit.vulnerabilities.push({
        severity: 'HIGH',
        category: 'Authentication',
        description: 'Authentication tokens stored in localStorage',
        recommendation: 'Use httpOnly cookies or sessionStorage for tokens'
      });
    }

    // Check session timeout
    if (!this.secureStorage.getItem('session_timeout')) {
      audit.recommendations.push({
        category: 'Authentication',
        description: 'Implement session timeout mechanism',
        priority: 'MEDIUM'
      });
    }
  }

  auditDataProtection(audit) {
    // Check for potential PII in localStorage/sessionStorage
    const storageData = { ...localStorage, ...sessionStorage };
    const potentialPII = [];

    Object.entries(storageData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Check for email patterns
        if (value.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)) {
          potentialPII.push(`${key}: email address`);
        }
        // Check for SSN patterns
        if (value.match(/\d{3}-?\d{2}-?\d{4}/)) {
          potentialPII.push(`${key}: potential SSN`);
        }
        // Check for phone patterns
        if (value.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)) {
          potentialPII.push(`${key}: phone number`);
        }
      }
    });

    if (potentialPII.length > 0) {
      audit.vulnerabilities.push({
        severity: 'HIGH',
        category: 'Data Protection',
        description: 'Potential PII stored in browser storage',
        recommendation: 'Encrypt sensitive data or avoid storing PII client-side',
        details: potentialPII
      });
    }
  }

  auditDependencies(audit) {
    // This would typically be done by tools like npm audit or Snyk
    // For now, we'll add a recommendation
    audit.recommendations.push({
      category: 'Dependencies',
      description: 'Run dependency vulnerability scan',
      priority: 'HIGH',
      action: 'Execute `npm audit` and review dependency vulnerabilities'
    });
  }

  getSecurityGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  // Rate limiting implementation
  setupRateLimiting() {
    this.rateLimitStore = new Map();
    this.rateLimitConfig = {
      maxRequests: 100,
      windowMs: 60000, // 1 minute
      blockDuration: 300000 // 5 minutes
    };

    this.checkRateLimit = (identifier = 'global') => {
      const now = Date.now();
      const windowStart = now - this.rateLimitConfig.windowMs;
      
      if (!this.rateLimitStore.has(identifier)) {
        this.rateLimitStore.set(identifier, {
          requests: [],
          blocked: false,
          blockedUntil: 0
        });
      }

      const record = this.rateLimitStore.get(identifier);

      // Check if still blocked
      if (record.blocked && now < record.blockedUntil) {
        return { allowed: false, reason: 'Rate limited' };
      }

      // Reset block if expired
      if (record.blocked && now >= record.blockedUntil) {
        record.blocked = false;
        record.requests = [];
      }

      // Clean old requests
      record.requests = record.requests.filter(time => time > windowStart);

      // Check rate limit
      if (record.requests.length >= this.rateLimitConfig.maxRequests) {
        record.blocked = true;
        record.blockedUntil = now + this.rateLimitConfig.blockDuration;
        
        console.warn(`Rate limit exceeded for ${identifier}`);
        return { allowed: false, reason: 'Rate limit exceeded' };
      }

      // Allow request
      record.requests.push(now);
      return { 
        allowed: true, 
        remaining: this.rateLimitConfig.maxRequests - record.requests.length 
      };
    };
  }

  // Enhanced data encryption
  setupAdvancedEncryption() {
    this.crypto = {
      // Generate a key for encryption (in production, this should come from a secure source)
      generateKey: async () => {
        return await crypto.subtle.generateKey(
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        );
      },

      // Encrypt data
      encrypt: async (data, key) => {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encodedData = new TextEncoder().encode(data);
        
        const encrypted = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          key,
          encodedData
        );

        return {
          encrypted: Array.from(new Uint8Array(encrypted)),
          iv: Array.from(iv)
        };
      },

      // Decrypt data
      decrypt: async (encryptedData, key, iv) => {
        const decrypted = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: new Uint8Array(iv) },
          key,
          new Uint8Array(encryptedData)
        );

        return new TextDecoder().decode(decrypted);
      },

      // Hash data for integrity checking
      hash: async (data) => {
        const encoded = new TextEncoder().encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
        return Array.from(new Uint8Array(hashBuffer));
      }
    };
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
        https: window.location.protocol === 'https:',
        rateLimiting: !!this.rateLimitStore,
        encryption: !!this.crypto
      },
      audit: this.lastAudit || null
    };
  }

  // Run periodic security audit
  startPeriodicAudit() {
    // Run initial audit
    this.lastAudit = this.runSecurityAudit();
    console.log('Security audit completed:', this.lastAudit);

    // Run audit every hour
    setInterval(() => {
      this.lastAudit = this.runSecurityAudit();
      
      // Alert on critical vulnerabilities
      const criticalVulns = this.lastAudit.vulnerabilities.filter(v => v.severity === 'HIGH');
      if (criticalVulns.length > 0) {
        console.error('Critical security vulnerabilities detected:', criticalVulns);
      }
    }, 3600000); // 1 hour
  }
}

// Create singleton instance
const securityManager = new SecurityManager();

export default securityManager;
export { SecurityManager, CSP_CONFIG, SECURITY_HEADERS };