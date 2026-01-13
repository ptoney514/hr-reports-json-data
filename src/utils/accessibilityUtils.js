/**
 * Accessibility Utilities for TrioReports Dashboard
 * Provides comprehensive accessibility support including ARIA labels,
 * keyboard navigation, screen reader support, and high contrast mode
 */

/**
 * Generate descriptive ARIA labels for charts based on data
 */
export const generateChartAriaLabel = (chartType, data, title) => {
  if (!data || data.length === 0) {
    return `${title}: No data available`;
  }

  const dataCount = data.length;
  
  switch (chartType) {
    case 'bar':
      return `${title}: Bar chart with ${dataCount} data points. Use arrow keys to navigate between data points.`;
    
    case 'pie':
      const totalValue = data.reduce((sum, item) => sum + (item.value || 0), 0);
      return `${title}: Pie chart with ${dataCount} segments representing a total of ${totalValue.toLocaleString()}. Use arrow keys to navigate between segments.`;
    
    case 'line':
      return `${title}: Line chart showing trends across ${dataCount} data points. Use arrow keys to navigate along the timeline.`;
    
    case 'area':
      return `${title}: Area chart displaying data trends with ${dataCount} data points. Use arrow keys to navigate through the data.`;
    
    default:
      return `${title}: Chart with ${dataCount} data points. Use arrow keys to navigate through the data.`;
  }
};

/**
 * Generate ARIA description for chart data
 */
export const generateChartAriaDescription = (data, chartType) => {
  if (!data || data.length === 0) return '';

  const descriptions = data.slice(0, 5).map((item, index) => {
    const name = item.name || item.label || `Item ${index + 1}`;
    const value = item.value || item.count || item.employees || 0;
    const percentage = item.percentage ? ` (${item.percentage}%)` : '';
    
    return `${name}: ${value.toLocaleString()}${percentage}`;
  });

  const moreItems = data.length > 5 ? ` and ${data.length - 5} more items` : '';
  
  return `Data includes: ${descriptions.join(', ')}${moreItems}.`;
};

/**
 * Generate accessible table summary
 */
export const generateTableSummary = (data, columns, title) => {
  if (!data || data.length === 0) {
    return `${title}: Empty table with no data`;
  }

  const rowCount = data.length;
  const columnCount = columns.length;
  const columnNames = columns.map(col => col.header || col.key).join(', ');

  return `${title}: Data table with ${rowCount} rows and ${columnCount} columns. Columns are: ${columnNames}. Use arrow keys to navigate between cells.`;
};

/**
 * Generate accessible summary for dashboard sections
 */
export const generateSectionSummary = (sectionType, data) => {
  switch (sectionType) {
    case 'summary-cards':
      return `Key metrics section with ${data.length} summary cards. Use tab to navigate between metrics.`;
    
    case 'charts':
      return `Charts section with ${data.length} visualizations. Each chart can be navigated using arrow keys.`;
    
    case 'data-table':
      return `Data table section. Use arrow keys to navigate between cells, Enter to select.`;
    
    default:
      return `Dashboard section with interactive content. Use tab and arrow keys to navigate.`;
  }
};

/**
 * Keyboard navigation handler for charts
 */
export const handleChartKeyNavigation = (event, data, currentIndex, onSelectionChange) => {
  if (!data || data.length === 0) return;

  let newIndex = currentIndex;

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault();
      newIndex = (currentIndex + 1) % data.length;
      break;
    
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault();
      newIndex = currentIndex === 0 ? data.length - 1 : currentIndex - 1;
      break;
    
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
    
    case 'End':
      event.preventDefault();
      newIndex = data.length - 1;
      break;
    
    case 'Enter':
    case ' ':
      event.preventDefault();
      // Announce current selection
      announceToScreenReader(`Selected: ${data[currentIndex]?.name || `Item ${currentIndex + 1}`}`);
      return;
    
    default:
      return;
  }

  if (newIndex !== currentIndex && onSelectionChange) {
    onSelectionChange(newIndex);
    // Announce new selection
    const item = data[newIndex];
    const name = item?.name || item?.label || `Item ${newIndex + 1}`;
    const value = item?.value || item?.count || '';
    announceToScreenReader(`${name}${value ? `: ${value.toLocaleString()}` : ''}`);
  }
};

/**
 * Keyboard navigation handler for data tables
 */
export const handleTableKeyNavigation = (event, rowCount, colCount, currentRow, currentCol, onCellChange) => {
  let newRow = currentRow;
  let newCol = currentCol;

  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault();
      newCol = Math.min(currentCol + 1, colCount - 1);
      break;
    
    case 'ArrowLeft':
      event.preventDefault();
      newCol = Math.max(currentCol - 1, 0);
      break;
    
    case 'ArrowDown':
      event.preventDefault();
      newRow = Math.min(currentRow + 1, rowCount - 1);
      break;
    
    case 'ArrowUp':
      event.preventDefault();
      newRow = Math.max(currentRow - 1, 0);
      break;
    
    case 'Home':
      event.preventDefault();
      if (event.ctrlKey) {
        newRow = 0;
        newCol = 0;
      } else {
        newCol = 0;
      }
      break;
    
    case 'End':
      event.preventDefault();
      if (event.ctrlKey) {
        newRow = rowCount - 1;
        newCol = colCount - 1;
      } else {
        newCol = colCount - 1;
      }
      break;
    
    default:
      return;
  }

  if ((newRow !== currentRow || newCol !== currentCol) && onCellChange) {
    onCellChange(newRow, newCol);
  }
};

/**
 * Focus management utilities for enhanced keyboard navigation
 */
export const FocusManager = {
  /**
   * Store the last focused element
   */
  lastFocusedElement: null,

  /**
   * Save current focus
   */
  saveFocus() {
    this.lastFocusedElement = document.activeElement;
  },

  /**
   * Restore saved focus
   */
  restoreFocus() {
    if (this.lastFocusedElement && this.lastFocusedElement.focus) {
      this.lastFocusedElement.focus();
      this.lastFocusedElement = null;
    }
  },

  /**
   * Focus on the first focusable element within a container
   */
  focusFirstElement(container) {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
      return true;
    }
    return false;
  },

  /**
   * Focus on the last focusable element within a container
   */
  focusLastElement(container) {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
      return true;
    }
    return false;
  },

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements(container) {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]'
    ];

    return Array.from(container.querySelectorAll(focusableSelectors.join(', ')))
      .filter(element => {
        return element.offsetWidth > 0 && element.offsetHeight > 0 && 
               getComputedStyle(element).visibility !== 'hidden';
      });
  },

  /**
   * Trap focus within a container (for modals, dropdowns)
   */
  trapFocus(container, event) {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }
};

/**
 * Enhanced ARIA utilities for better screen reader support
 */
export const ARIAManager = {
  /**
   * Generate comprehensive ARIA attributes for interactive elements
   */
  generateInteractiveARIA(element, options = {}) {
    const {
      role,
      label,
      description,
      expanded,
      hasPopup,
      controls,
      describedBy,
      labelledBy,
      required,
      invalid,
      live = 'polite'
    } = options;

    const attributes = {};

    if (role) attributes.role = role;
    if (label) attributes['aria-label'] = label;
    if (description) attributes['aria-description'] = description;
    if (expanded !== undefined) attributes['aria-expanded'] = expanded;
    if (hasPopup) attributes['aria-haspopup'] = hasPopup;
    if (controls) attributes['aria-controls'] = controls;
    if (describedBy) attributes['aria-describedby'] = describedBy;
    if (labelledBy) attributes['aria-labelledby'] = labelledBy;
    if (required) attributes['aria-required'] = required;
    if (invalid !== undefined) attributes['aria-invalid'] = invalid;
    if (live) attributes['aria-live'] = live;

    return attributes;
  },

  /**
   * Generate ARIA attributes for data tables
   */
  generateTableARIA(rowIndex, colIndex, rowCount, colCount, isHeader = false) {
    const attributes = {
      'role': isHeader ? 'columnheader' : 'gridcell',
      'aria-rowindex': rowIndex + 1,
      'aria-colindex': colIndex + 1,
      'aria-rowcount': rowCount,
      'aria-colcount': colCount
    };

    if (!isHeader) {
      attributes['tabindex'] = '-1';
    }

    return attributes;
  },

  /**
   * Generate ARIA attributes for charts
   */
  generateChartARIA(chartData, chartType, title) {
    const dataPoints = chartData.length;
    const hasData = dataPoints > 0;
    
    const attributes = {
      'role': 'img',
      'aria-label': generateChartAriaLabel(chartType, chartData, title),
      'aria-describedby': `chart-description-${Date.now()}`,
      'tabindex': '0'
    };

    if (hasData) {
      attributes['aria-details'] = `chart-details-${Date.now()}`;
    }

    return attributes;
  },

  /**
   * Create hidden text alternatives for complex content
   */
  createScreenReaderText(content, id = null) {
    const element = document.createElement('div');
    element.className = 'sr-only';
    element.textContent = content;
    if (id) element.id = id;
    return element;
  }
};

/**
 * Skip link utilities for better navigation
 */
export const SkipLinkManager = {
  /**
   * Create skip links for main content areas
   */
  createSkipLinks(targets = []) {
    const defaultTargets = [
      { href: '#main-content', label: 'Skip to main content' },
      { href: '#navigation', label: 'Skip to navigation' },
      { href: '#filters', label: 'Skip to filters' }
    ];

    const allTargets = [...defaultTargets, ...targets];
    
    const skipLinksContainer = document.createElement('div');
    skipLinksContainer.className = 'skip-links sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-blue-600 focus:text-white focus:p-2';
    
    allTargets.forEach(target => {
      const link = document.createElement('a');
      link.href = target.href;
      link.textContent = target.label;
      link.className = 'skip-link block hover:underline';
      skipLinksContainer.appendChild(link);
    });

    return skipLinksContainer;
  },

  /**
   * Add skip link behavior
   */
  addSkipLinkBehavior(skipLink, targetSelector) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(targetSelector);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
};

/**
 * Announce content to screen readers
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Create accessible data announcement for charts
 */
export const announceChartData = (data, chartType, title) => {
  const summary = generateChartAriaDescription(data, chartType);
  announceToScreenReader(`${title}: ${summary}`);
};

/**
 * Focus management utilities
 */
export const focusUtils = {
  /**
   * Set focus to element with proper error handling
   */
  setFocus: (element, options = {}) => {
    if (element && typeof element.focus === 'function') {
      try {
        element.focus(options);
        return true;
      } catch (error) {
        console.warn('Focus failed:', error);
        return false;
      }
    }
    return false;
  },

  /**
   * Get next focusable element
   */
  getNextFocusable: (container, current) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const focusableArray = Array.from(focusableElements);
    const currentIndex = focusableArray.indexOf(current);
    
    return focusableArray[currentIndex + 1] || focusableArray[0];
  },

  /**
   * Get previous focusable element
   */
  getPreviousFocusable: (container, current) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const focusableArray = Array.from(focusableElements);
    const currentIndex = focusableArray.indexOf(current);
    
    return focusableArray[currentIndex - 1] || focusableArray[focusableArray.length - 1];
  },

  /**
   * Trap focus within container
   */
  trapFocus: (container, event) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }
};

/**
 * High contrast mode utilities
 */
export const highContrastUtils = {
  /**
   * Detect if high contrast mode is enabled
   */
  isHighContrastMode: () => {
    // Check for Windows high contrast
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      return true;
    }
    
    // Check for forced colors (Windows high contrast)
    if (window.matchMedia('(forced-colors: active)').matches) {
      return true;
    }
    
    return false;
  },

  /**
   * Apply high contrast styles
   */
  applyHighContrastStyles: () => {
    document.documentElement.classList.add('high-contrast-mode');
  },

  /**
   * Remove high contrast styles
   */
  removeHighContrastStyles: () => {
    document.documentElement.classList.remove('high-contrast-mode');
  },

  /**
   * Toggle high contrast mode
   */
  toggleHighContrast: () => {
    const isActive = document.documentElement.classList.contains('high-contrast-mode');
    if (isActive) {
      highContrastUtils.removeHighContrastStyles();
      localStorage.setItem('high-contrast-mode', 'false');
      announceToScreenReader('High contrast mode disabled');
    } else {
      highContrastUtils.applyHighContrastStyles();
      localStorage.setItem('high-contrast-mode', 'true');
      announceToScreenReader('High contrast mode enabled');
    }
  },

  /**
   * Initialize high contrast mode based on user preference
   */
  initializeHighContrast: () => {
    const userPreference = localStorage.getItem('high-contrast-mode');
    const systemPreference = highContrastUtils.isHighContrastMode();
    
    if (userPreference === 'true' || (userPreference === null && systemPreference)) {
      highContrastUtils.applyHighContrastStyles();
    }
  }
};

/**
 * Reduced motion utilities
 */
export const motionUtils = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Apply reduced motion styles
   */
  applyReducedMotion: () => {
    document.documentElement.classList.add('reduce-motion');
  },

  /**
   * Initialize reduced motion based on user preference
   */
  initializeReducedMotion: () => {
    if (motionUtils.prefersReducedMotion()) {
      motionUtils.applyReducedMotion();
    }
  }
};

/**
 * Color contrast utilities
 */
export const contrastUtils = {
  /**
   * Calculate relative luminance
   */
  getLuminance: (hex) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio: (color1, color2) => {
    const lum1 = contrastUtils.getLuminance(color1);
    const lum2 = contrastUtils.getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Check if color combination meets WCAG AA standards
   */
  meetsWCAGAA: (foreground, background) => {
    const ratio = contrastUtils.getContrastRatio(foreground, background);
    return ratio >= 4.5; // WCAG AA standard for normal text
  },

  /**
   * Check if color combination meets WCAG AAA standards
   */
  meetsWCAGAAA: (foreground, background) => {
    const ratio = contrastUtils.getContrastRatio(foreground, background);
    return ratio >= 7; // WCAG AAA standard for normal text
  }
};

/**
 * Skip link utilities
 */
export const skipLinkUtils = {
  /**
   * Create skip link for main content
   */
  createSkipLink: (targetId, text = 'Skip to main content') => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.className = 'skip-link';
    skipLink.textContent = text;
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView();
      }
    });
    
    return skipLink;
  },

  /**
   * Initialize skip links
   */
  initializeSkipLinks: () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent && !document.querySelector('.skip-link')) {
      const skipLink = skipLinkUtils.createSkipLink('main-content');
      document.body.insertBefore(skipLink, document.body.firstChild);
    }
  }
};

/**
 * ARIA live region utilities
 */
export const liveRegionUtils = {
  /**
   * Create ARIA live region
   */
  createLiveRegion: (id, level = 'polite') => {
    if (document.getElementById(id)) return;

    const liveRegion = document.createElement('div');
    liveRegion.id = id;
    liveRegion.setAttribute('aria-live', level);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    
    document.body.appendChild(liveRegion);
    return liveRegion;
  },

  /**
   * Update live region content
   */
  updateLiveRegion: (id, message) => {
    const liveRegion = document.getElementById(id);
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  },

  /**
   * Initialize default live regions
   */
  initializeLiveRegions: () => {
    liveRegionUtils.createLiveRegion('status-live-region', 'polite');
    liveRegionUtils.createLiveRegion('alert-live-region', 'assertive');
  }
};

/**
 * Form accessibility utilities
 */
export const formUtils = {
  /**
   * Associate label with form control
   */
  associateLabel: (input, label) => {
    const inputId = input.id || `input-${Date.now()}`;
    input.id = inputId;
    label.setAttribute('for', inputId);
  },

  /**
   * Add error message to form control
   */
  addErrorMessage: (input, message) => {
    const errorId = `${input.id}-error`;
    let errorElement = document.getElementById(errorId);
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = errorId;
      errorElement.className = 'error-message';
      errorElement.setAttribute('role', 'alert');
      input.parentNode.insertBefore(errorElement, input.nextSibling);
    }
    
    errorElement.textContent = message;
    input.setAttribute('aria-describedby', errorId);
    input.setAttribute('aria-invalid', 'true');
  },

  /**
   * Remove error message from form control
   */
  removeErrorMessage: (input) => {
    const errorId = `${input.id}-error`;
    const errorElement = document.getElementById(errorId);
    
    if (errorElement) {
      errorElement.remove();
    }
    
    input.removeAttribute('aria-describedby');
    input.removeAttribute('aria-invalid');
  }
};

const accessibilityUtils = {
  generateChartAriaLabel,
  generateChartAriaDescription,
  generateTableSummary,
  generateSectionSummary,
  handleChartKeyNavigation,
  handleTableKeyNavigation,
  announceToScreenReader,
  announceChartData,
  focusUtils,
  highContrastUtils,
  motionUtils,
  contrastUtils,
  skipLinkUtils,
  liveRegionUtils,
  formUtils
};

export default accessibilityUtils; 