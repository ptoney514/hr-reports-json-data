/**
 * Asset Optimization Utilities for Production
 * Handles image compression, lazy loading, and asset management
 */

// Image optimization configuration
const IMAGE_CONFIG = {
  quality: 85,
  maxWidth: 1920,
  maxHeight: 1080,
  formats: ['webp', 'jpeg', 'png'],
  progressive: true,
  optimizeForSpeed: true
};

// Font optimization configuration
const FONT_CONFIG = {
  preload: ['Inter-Regular.woff2', 'Inter-Bold.woff2'],
  display: 'swap',
  subset: 'latin'
};

class AssetOptimizer {
  constructor() {
    this.imageCache = new Map();
    this.fontCache = new Map();
    this.observers = new Map();
    
    this.init();
  }

  init() {
    this.setupLazyLoading();
    this.optimizeFonts();
    this.setupImageCompression();
    this.preloadCriticalAssets();
  }

  // Lazy loading implementation
  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            imageObserver.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      this.observers.set('images', imageObserver);
      
      // Observe all images with lazy loading
      document.querySelectorAll('img[data-lazy]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  loadImage(img) {
    const src = img.dataset.lazy;
    if (!src) return;

    // Create a new image to preload
    const image = new Image();
    
    image.onload = () => {
      // Fade in effect for better UX
      img.style.opacity = '0';
      img.src = src;
      img.style.transition = 'opacity 0.3s ease-in-out';
      img.style.opacity = '1';
      
      // Remove lazy loading attributes
      img.removeAttribute('data-lazy');
      img.classList.remove('lazy');
    };

    image.onerror = () => {
      // Fallback image or error handling
      img.src = '/assets/images/placeholder.svg';
      console.warn('Failed to load image:', src);
    };

    image.src = src;
  }

  // Font optimization
  optimizeFonts() {
    // Preload critical fonts
    FONT_CONFIG.preload.forEach(font => {
      this.preloadFont(`/assets/fonts/${font}`);
    });

    // Add font-display: swap to all fonts
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('/assets/fonts/Inter-Regular.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 700;
        font-display: swap;
        src: url('/assets/fonts/Inter-Bold.woff2') format('woff2');
      }
    `;
    document.head.appendChild(style);
  }

  preloadFont(url) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  // Image compression and optimization
  setupImageCompression() {
    // Create WebP support detection
    this.supportsWebP = this.checkWebPSupport();
    
    // Create AVIF support detection
    this.supportsAVIF = this.checkAVIFSupport();
  }

  checkWebPSupport() {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  checkAVIFSupport() {
    return new Promise((resolve) => {
      const avif = new Image();
      avif.onload = avif.onerror = () => {
        resolve(avif.height === 2);
      };
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
  }

  // Get optimized image URL
  getOptimizedImageUrl(originalUrl, options = {}) {
    const { width, height, quality = IMAGE_CONFIG.quality } = options;
    
    // If browser supports modern formats, use them
    if (this.supportsAVIF) {
      return this.convertToAVIF(originalUrl, { width, height, quality });
    } else if (this.supportsWebP) {
      return this.convertToWebP(originalUrl, { width, height, quality });
    }
    
    return originalUrl;
  }

  convertToWebP(url, options) {
    // In a real implementation, this would call an image service
    // For now, return a hypothetical WebP URL
    const { width, height, quality } = options;
    const params = new URLSearchParams();
    
    if (width) params.append('w', width);
    if (height) params.append('h', height);
    params.append('q', quality);
    params.append('fmt', 'webp');
    
    return `${url}?${params.toString()}`;
  }

  convertToAVIF(url, options) {
    // Similar to WebP but with AVIF format
    const { width, height, quality } = options;
    const params = new URLSearchParams();
    
    if (width) params.append('w', width);
    if (height) params.append('h', height);
    params.append('q', quality);
    params.append('fmt', 'avif');
    
    return `${url}?${params.toString()}`;
  }

  // Preload critical assets
  preloadCriticalAssets() {
    const criticalAssets = [
      '/assets/images/logo.svg',
      '/assets/images/hero-bg.webp',
      '/static/css/main.css'
    ];

    criticalAssets.forEach(asset => {
      this.preloadAsset(asset);
    });
  }

  preloadAsset(url) {
    const link = document.createElement('link');
    link.rel = 'preload';
    
    if (url.endsWith('.css')) {
      link.as = 'style';
    } else if (url.match(/\.(jpg|jpeg|png|webp|avif|svg)$/)) {
      link.as = 'image';
    } else if (url.endsWith('.js')) {
      link.as = 'script';
    }
    
    link.href = url;
    document.head.appendChild(link);
  }

  // CSS optimization
  optimizeCSS() {
    // Remove unused CSS in production
    if (process.env.NODE_ENV === 'production') {
      this.removeUnusedCSS();
    }
    
    // Inline critical CSS
    this.inlineCriticalCSS();
  }

  removeUnusedCSS() {
    // This would typically be done at build time with tools like PurgeCSS
    // Here we simulate the concept
    const unusedSelectors = this.findUnusedCSSSelectors();
    unusedSelectors.forEach(selector => {
      this.removeCSSRule(selector);
    });
  }

  findUnusedCSSSelectors() {
    const usedSelectors = new Set();
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(element => {
      // Collect all classes and IDs
      element.classList.forEach(cls => usedSelectors.add(`.${cls}`));
      if (element.id) usedSelectors.add(`#${element.id}`);
    });
    
    // Return selectors that aren't used (simplified)
    return [];
  }

  removeCSSRule(selector) {
    // Remove CSS rules (in a real implementation)
    console.log(`Would remove unused CSS rule: ${selector}`);
  }

  inlineCriticalCSS() {
    // Inline above-the-fold CSS
    const criticalCSS = `
      /* Critical CSS for initial render */
      body { margin: 0; font-family: 'Inter', sans-serif; }
      .loading { opacity: 0.5; }
      .hero { min-height: 50vh; }
    `;
    
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
  }

  // Resource hints
  addResourceHints() {
    // DNS prefetch for external domains
    const externalDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'api.hr-reports.com',
      'cdn.jsdelivr.net'
    ];

    externalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });

    // Preconnect to critical domains
    const criticalDomains = [
      'fonts.googleapis.com',
      'api.hr-reports.com'
    ];

    criticalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = `https://${domain}`;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  // Service Worker for asset caching
  registerServiceWorker() {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }

  // Bundle optimization helpers
  static analyzeBundle() {
    // This would be used in build tools
    return {
      totalSize: 0,
      gzippedSize: 0,
      chunks: [],
      recommendations: []
    };
  }

  // Cleanup
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.imageCache.clear();
    this.fontCache.clear();
  }
}

// Create and export instance
const assetOptimizer = new AssetOptimizer();

export default assetOptimizer;
export { AssetOptimizer, IMAGE_CONFIG, FONT_CONFIG };