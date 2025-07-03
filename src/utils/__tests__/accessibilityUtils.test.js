/**
 * Comprehensive tests for accessibility utilities
 * Tests ARIA generation, keyboard navigation, focus management,
 * screen reader support, and accessibility feature utilities
 */

import {
  generateChartAriaLabel,
  generateChartAriaDescription,
  generateTableSummary,
  generateSectionSummary,
  handleChartKeyNavigation,
  handleTableKeyNavigation,
  FocusManager,
  ARIAManager,
  SkipLinkManager,
  announceToScreenReader,
  announceChartData,
  focusUtils,
  highContrastUtils,
  motionUtils,
  contrastUtils,
  skipLinkUtils,
  liveRegionUtils,
  formUtils
} from '../accessibilityUtils';

// Mock DOM environment
beforeEach(() => {
  document.body.innerHTML = '';
  document.documentElement.className = '';
  localStorage.clear();
  
  // Mock performance API
  global.performance = {
    now: jest.fn(() => Date.now())
  };
  
  // Mock CSS.supports
  global.CSS = {
    supports: jest.fn(() => true)
  };
  
  // Mock matchMedia
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

afterEach(() => {
  jest.clearAllMocks();
});

describe('ARIA Label Generation', () => {
  describe('generateChartAriaLabel', () => {
    test('generates correct label for bar chart with data', () => {
      const data = [
        { name: 'Jan', value: 100 },
        { name: 'Feb', value: 200 },
        { name: 'Mar', value: 150 }
      ];
      
      const label = generateChartAriaLabel('bar', data, 'Monthly Sales');
      
      expect(label).toBe('Monthly Sales: Bar chart with 3 data points. Use arrow keys to navigate between data points.');
    });

    test('generates correct label for pie chart with total', () => {
      const data = [
        { name: 'Desktop', value: 60 },
        { name: 'Mobile', value: 30 },
        { name: 'Tablet', value: 10 }
      ];
      
      const label = generateChartAriaLabel('pie', data, 'Device Usage');
      
      expect(label).toBe('Device Usage: Pie chart with 3 segments representing a total of 100. Use arrow keys to navigate between segments.');
    });

    test('handles empty data gracefully', () => {
      const label = generateChartAriaLabel('bar', [], 'Empty Chart');
      
      expect(label).toBe('Empty Chart: No data available');
    });

    test('handles null/undefined data', () => {
      const label = generateChartAriaLabel('line', null, 'No Data Chart');
      
      expect(label).toBe('No Data Chart: No data available');
    });

    test('generates default label for unknown chart type', () => {
      const data = [{ name: 'A', value: 1 }];
      const label = generateChartAriaLabel('unknown', data, 'Custom Chart');
      
      expect(label).toBe('Custom Chart: Chart with 1 data points. Use arrow keys to navigate through the data.');
    });
  });

  describe('generateChartAriaDescription', () => {
    test('generates description for chart data', () => {
      const data = [
        { name: 'Q1', value: 1000, percentage: 25 },
        { name: 'Q2', value: 1500, percentage: 37.5 },
        { name: 'Q3', value: 800, percentage: 20 }
      ];
      
      const description = generateChartAriaDescription(data, 'bar');
      
      expect(description).toBe('Data includes: Q1: 1,000 (25%), Q2: 1,500 (37.5%), Q3: 800 (20%).');
    });

    test('limits description to first 5 items', () => {
      const data = Array.from({ length: 8 }, (_, i) => ({
        name: `Item ${i + 1}`,
        value: (i + 1) * 100
      }));
      
      const description = generateChartAriaDescription(data, 'bar');
      
      expect(description).toContain('Item 1: 100');
      expect(description).toContain('Item 5: 500');
      expect(description).toContain('and 3 more items');
      expect(description).not.toContain('Item 6');
    });

    test('handles various data properties', () => {
      const data = [
        { label: 'Count A', count: 50 },
        { name: 'Employees B', employees: 75 }
      ];
      
      const description = generateChartAriaDescription(data, 'bar');
      
      expect(description).toContain('Count A: 50');
      expect(description).toContain('Employees B: 75');
    });
  });

  describe('generateTableSummary', () => {
    test('generates table summary with row and column info', () => {
      const data = [
        { name: 'John', age: 30, department: 'IT' },
        { name: 'Jane', age: 25, department: 'HR' }
      ];
      const columns = [
        { header: 'Name', key: 'name' },
        { header: 'Age', key: 'age' },
        { header: 'Department', key: 'department' }
      ];
      
      const summary = generateTableSummary(data, columns, 'Employee List');
      
      expect(summary).toBe('Employee List: Data table with 2 rows and 3 columns. Columns are: Name, Age, Department. Use arrow keys to navigate between cells.');
    });

    test('handles empty table', () => {
      const summary = generateTableSummary([], [], 'Empty Table');
      
      expect(summary).toBe('Empty Table: Empty table with no data');
    });
  });

  describe('generateSectionSummary', () => {
    test('generates summary for different section types', () => {
      expect(generateSectionSummary('summary-cards', [1, 2, 3]))
        .toBe('Key metrics section with 3 summary cards. Use tab to navigate between metrics.');
      
      expect(generateSectionSummary('charts', [1, 2]))
        .toBe('Charts section with 2 visualizations. Each chart can be navigated using arrow keys.');
      
      expect(generateSectionSummary('data-table', []))
        .toBe('Data table section. Use arrow keys to navigate between cells, Enter to select.');
    });
  });
});

describe('Keyboard Navigation Handlers', () => {
  describe('handleChartKeyNavigation', () => {
    test('navigates right with ArrowRight', () => {
      const data = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
      const mockCallback = jest.fn();
      const mockEvent = {
        key: 'ArrowRight',
        preventDefault: jest.fn()
      };
      
      handleChartKeyNavigation(mockEvent, data, 0, mockCallback);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(1);
    });

    test('wraps to beginning when navigating right from last item', () => {
      const data = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
      const mockCallback = jest.fn();
      const mockEvent = {
        key: 'ArrowRight',
        preventDefault: jest.fn()
      };
      
      handleChartKeyNavigation(mockEvent, data, 2, mockCallback);
      
      expect(mockCallback).toHaveBeenCalledWith(0);
    });

    test('navigates left with ArrowLeft', () => {
      const data = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
      const mockCallback = jest.fn();
      const mockEvent = {
        key: 'ArrowLeft',
        preventDefault: jest.fn()
      };
      
      handleChartKeyNavigation(mockEvent, data, 1, mockCallback);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(0);
    });

    test('wraps to end when navigating left from first item', () => {
      const data = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
      const mockCallback = jest.fn();
      const mockEvent = {
        key: 'ArrowLeft',
        preventDefault: jest.fn()
      };
      
      handleChartKeyNavigation(mockEvent, data, 0, mockCallback);
      
      expect(mockCallback).toHaveBeenCalledWith(2);
    });

    test('navigates to first item with Home', () => {
      const data = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
      const mockCallback = jest.fn();
      const mockEvent = {
        key: 'Home',
        preventDefault: jest.fn()
      };
      
      handleChartKeyNavigation(mockEvent, data, 2, mockCallback);
      
      expect(mockCallback).toHaveBeenCalledWith(0);
    });

    test('navigates to last item with End', () => {
      const data = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
      const mockCallback = jest.fn();
      const mockEvent = {
        key: 'End',
        preventDefault: jest.fn()
      };
      
      handleChartKeyNavigation(mockEvent, data, 0, mockCallback);
      
      expect(mockCallback).toHaveBeenCalledWith(2);
    });

    test('handles Enter and Space keys for selection', () => {
      const data = [{ name: 'A' }];
      const mockEvent = {
        key: 'Enter',
        preventDefault: jest.fn()
      };
      
      handleChartKeyNavigation(mockEvent, data, 0, null);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    test('ignores other keys', () => {
      const data = [{ name: 'A' }];
      const mockCallback = jest.fn();
      const mockEvent = {
        key: 'Tab',
        preventDefault: jest.fn()
      };
      
      handleChartKeyNavigation(mockEvent, data, 0, mockCallback);
      
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('handleTableKeyNavigation', () => {
    test('navigates right within bounds', () => {
      const mockCallback = jest.fn();
      const mockEvent = {
        key: 'ArrowRight',
        preventDefault: jest.fn()
      };
      
      handleTableKeyNavigation(mockEvent, 3, 3, 1, 1, mockCallback);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(1, 2);
    });

    test('does not navigate right beyond last column', () => {
      const mockCallback = jest.fn();
      const mockEvent = {
        key: 'ArrowRight',
        preventDefault: jest.fn()
      };
      
      handleTableKeyNavigation(mockEvent, 3, 3, 1, 2, mockCallback);
      
      expect(mockCallback).toHaveBeenCalledWith(1, 2); // Stays at last column
    });

    test('navigates to first/last cell with Ctrl+Home/End', () => {
      const mockCallback = jest.fn();
      
      // Test Ctrl+Home
      const homeEvent = {
        key: 'Home',
        ctrlKey: true,
        preventDefault: jest.fn()
      };
      
      handleTableKeyNavigation(homeEvent, 3, 3, 2, 2, mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(0, 0);
      
      // Test Ctrl+End
      const endEvent = {
        key: 'End',
        ctrlKey: true,
        preventDefault: jest.fn()
      };
      
      handleTableKeyNavigation(endEvent, 3, 3, 0, 0, mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(2, 2);
    });
  });
});

describe('Focus Management', () => {
  describe('FocusManager', () => {
    test('saves and restores focus', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);
      button.focus();
      
      FocusManager.saveFocus();
      
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();
      
      expect(document.activeElement).toBe(input);
      
      FocusManager.restoreFocus();
      
      expect(document.activeElement).toBe(button);
    });

    test('finds focusable elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>Button</button>
        <input type="text">
        <a href="#">Link</a>
        <button disabled>Disabled</button>
        <div tabindex="0">Focusable div</div>
        <div tabindex="-1">Non-focusable div</div>
      `;
      document.body.appendChild(container);
      
      const focusable = FocusManager.getFocusableElements(container);
      
      expect(focusable).toHaveLength(4); // button, input, link, focusable div
      expect(focusable[0].tagName).toBe('BUTTON');
      expect(focusable[1].tagName).toBe('INPUT');
      expect(focusable[2].tagName).toBe('A');
      expect(focusable[3].getAttribute('tabindex')).toBe('0');
    });

    test('focuses first element in container', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>First</button>
        <button>Second</button>
      `;
      document.body.appendChild(container);
      
      const success = FocusManager.focusFirstElement(container);
      
      expect(success).toBe(true);
      expect(document.activeElement.textContent).toBe('First');
    });

    test('focuses last element in container', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>First</button>
        <button>Last</button>
      `;
      document.body.appendChild(container);
      
      const success = FocusManager.focusLastElement(container);
      
      expect(success).toBe(true);
      expect(document.activeElement.textContent).toBe('Last');
    });

    test('traps focus within container', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button id="first">First</button>
        <button id="last">Last</button>
      `;
      document.body.appendChild(container);
      
      const firstButton = container.querySelector('#first');
      const lastButton = container.querySelector('#last');
      
      // Test Tab on last element
      lastButton.focus();
      const tabEvent = {
        key: 'Tab',
        preventDefault: jest.fn()
      };
      
      FocusManager.trapFocus(container, tabEvent);
      
      expect(tabEvent.preventDefault).toHaveBeenCalled();
      expect(document.activeElement).toBe(firstButton);
      
      // Test Shift+Tab on first element
      firstButton.focus();
      const shiftTabEvent = {
        key: 'Tab',
        shiftKey: true,
        preventDefault: jest.fn()
      };
      
      FocusManager.trapFocus(container, shiftTabEvent);
      
      expect(shiftTabEvent.preventDefault).toHaveBeenCalled();
      expect(document.activeElement).toBe(lastButton);
    });
  });
});

describe('ARIA Manager', () => {
  describe('ARIAManager', () => {
    test('generates interactive ARIA attributes', () => {
      const attributes = ARIAManager.generateInteractiveARIA(null, {
        role: 'button',
        label: 'Test button',
        expanded: true,
        hasPopup: 'menu'
      });
      
      expect(attributes).toEqual({
        'role': 'button',
        'aria-label': 'Test button',
        'aria-expanded': true,
        'aria-haspopup': 'menu',
        'aria-live': 'polite'
      });
    });

    test('generates table ARIA attributes', () => {
      const attributes = ARIAManager.generateTableARIA(1, 2, 5, 3, false);
      
      expect(attributes).toEqual({
        'role': 'gridcell',
        'aria-rowindex': 2,
        'aria-colindex': 3,
        'aria-rowcount': 5,
        'aria-colcount': 3,
        'tabindex': '-1'
      });
    });

    test('generates header table ARIA attributes', () => {
      const attributes = ARIAManager.generateTableARIA(0, 1, 5, 3, true);
      
      expect(attributes).toEqual({
        'role': 'columnheader',
        'aria-rowindex': 1,
        'aria-colindex': 2,
        'aria-rowcount': 5,
        'aria-colcount': 3
      });
    });

    test('generates chart ARIA attributes', () => {
      const data = [{ name: 'A', value: 1 }];
      const attributes = ARIAManager.generateChartARIA(data, 'bar', 'Test Chart');
      
      expect(attributes.role).toBe('img');
      expect(attributes['aria-label']).toContain('Test Chart');
      expect(attributes.tabindex).toBe('0');
      expect(attributes['aria-describedby']).toMatch(/chart-description-\d+/);
    });

    test('creates screen reader text element', () => {
      const element = ARIAManager.createScreenReaderText('Hidden text', 'test-id');
      
      expect(element.className).toBe('sr-only');
      expect(element.textContent).toBe('Hidden text');
      expect(element.id).toBe('test-id');
    });
  });
});

describe('Screen Reader Support', () => {
  test('announces to screen reader', () => {
    announceToScreenReader('Test announcement', 'assertive');
    
    const announcements = document.querySelectorAll('[aria-live="assertive"]');
    expect(announcements.length).toBeGreaterThan(0);
    
    const lastAnnouncement = announcements[announcements.length - 1];
    expect(lastAnnouncement.textContent).toBe('Test announcement');
    expect(lastAnnouncement.className).toBe('sr-only');
  });

  test('announces chart data', () => {
    const data = [{ name: 'A', value: 100 }];
    announceChartData(data, 'bar', 'Test Chart');
    
    const announcements = document.querySelectorAll('[aria-live]');
    expect(announcements.length).toBeGreaterThan(0);
  });
});

describe('High Contrast Utilities', () => {
  beforeEach(() => {
    // Reset matchMedia mock
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  test('detects high contrast mode', () => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-contrast: high)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    
    expect(highContrastUtils.isHighContrastMode()).toBe(true);
  });

  test('applies high contrast styles', () => {
    highContrastUtils.applyHighContrastStyles();
    
    expect(document.documentElement.classList.contains('high-contrast-mode')).toBe(true);
  });

  test('removes high contrast styles', () => {
    document.documentElement.classList.add('high-contrast-mode');
    
    highContrastUtils.removeHighContrastStyles();
    
    expect(document.documentElement.classList.contains('high-contrast-mode')).toBe(false);
  });

  test('toggles high contrast mode', () => {
    highContrastUtils.toggleHighContrast();
    
    expect(document.documentElement.classList.contains('high-contrast-mode')).toBe(true);
    expect(localStorage.getItem('high-contrast-mode')).toBe('true');
    
    highContrastUtils.toggleHighContrast();
    
    expect(document.documentElement.classList.contains('high-contrast-mode')).toBe(false);
    expect(localStorage.getItem('high-contrast-mode')).toBe('false');
  });

  test('initializes high contrast from preferences', () => {
    localStorage.setItem('high-contrast-mode', 'true');
    
    highContrastUtils.initializeHighContrast();
    
    expect(document.documentElement.classList.contains('high-contrast-mode')).toBe(true);
  });
});

describe('Color Contrast Utilities', () => {
  test('calculates luminance correctly', () => {
    const whiteLuminance = contrastUtils.getLuminance('#ffffff');
    const blackLuminance = contrastUtils.getLuminance('#000000');
    
    expect(whiteLuminance).toBeCloseTo(1, 2);
    expect(blackLuminance).toBeCloseTo(0, 2);
  });

  test('calculates contrast ratio', () => {
    const ratio = contrastUtils.getContrastRatio('#ffffff', '#000000');
    
    expect(ratio).toBeCloseTo(21, 0); // Perfect contrast ratio
  });

  test('checks WCAG AA compliance', () => {
    // High contrast colors
    expect(contrastUtils.meetsWCAGAA('#ffffff', '#000000')).toBe(true);
    
    // Low contrast colors
    expect(contrastUtils.meetsWCAGAA('#ffffff', '#f0f0f0')).toBe(false);
  });

  test('checks WCAG AAA compliance', () => {
    // Very high contrast
    expect(contrastUtils.meetsWCAGAAA('#ffffff', '#000000')).toBe(true);
    
    // Moderate contrast (AA but not AAA)
    expect(contrastUtils.meetsWCAGAAA('#ffffff', '#666666')).toBe(false);
  });
});

describe('Live Region Utilities', () => {
  test('creates live region', () => {
    const region = liveRegionUtils.createLiveRegion('test-region', 'assertive');
    
    expect(region.id).toBe('test-region');
    expect(region.getAttribute('aria-live')).toBe('assertive');
    expect(region.getAttribute('aria-atomic')).toBe('true');
    expect(region.className).toBe('sr-only');
    expect(document.body.contains(region)).toBe(true);
  });

  test('does not create duplicate live regions', () => {
    liveRegionUtils.createLiveRegion('duplicate-test');
    liveRegionUtils.createLiveRegion('duplicate-test');
    
    const regions = document.querySelectorAll('#duplicate-test');
    expect(regions.length).toBe(1);
  });

  test('updates live region content', () => {
    liveRegionUtils.createLiveRegion('update-test');
    liveRegionUtils.updateLiveRegion('update-test', 'Updated message');
    
    const region = document.getElementById('update-test');
    expect(region.textContent).toBe('Updated message');
  });

  test('initializes default live regions', () => {
    liveRegionUtils.initializeLiveRegions();
    
    expect(document.getElementById('status-live-region')).toBeInTheDocument();
    expect(document.getElementById('alert-live-region')).toBeInTheDocument();
    
    const statusRegion = document.getElementById('status-live-region');
    const alertRegion = document.getElementById('alert-live-region');
    
    expect(statusRegion.getAttribute('aria-live')).toBe('polite');
    expect(alertRegion.getAttribute('aria-live')).toBe('assertive');
  });
});

describe('Form Utilities', () => {
  test('associates label with form control', () => {
    const input = document.createElement('input');
    const label = document.createElement('label');
    label.textContent = 'Test Label';
    
    document.body.appendChild(input);
    document.body.appendChild(label);
    
    formUtils.associateLabel(input, label);
    
    expect(input.id).toBeTruthy();
    expect(label.getAttribute('for')).toBe(input.id);
  });

  test('adds error message to form control', () => {
    const input = document.createElement('input');
    input.id = 'test-input';
    const container = document.createElement('div');
    container.appendChild(input);
    document.body.appendChild(container);
    
    formUtils.addErrorMessage(input, 'This field is required');
    
    expect(input.getAttribute('aria-describedby')).toBe('test-input-error');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    
    const errorElement = document.getElementById('test-input-error');
    expect(errorElement).toBeInTheDocument();
    expect(errorElement.textContent).toBe('This field is required');
    expect(errorElement.getAttribute('role')).toBe('alert');
  });

  test('removes error message from form control', () => {
    const input = document.createElement('input');
    input.id = 'test-input';
    const container = document.createElement('div');
    container.appendChild(input);
    document.body.appendChild(container);
    
    formUtils.addErrorMessage(input, 'Error message');
    formUtils.removeErrorMessage(input);
    
    expect(input.hasAttribute('aria-describedby')).toBe(false);
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(document.getElementById('test-input-error')).not.toBeInTheDocument();
  });
});

describe('Motion Utilities', () => {
  test('detects reduced motion preference', () => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    
    expect(motionUtils.prefersReducedMotion()).toBe(true);
  });

  test('applies reduced motion styles', () => {
    motionUtils.applyReducedMotion();
    
    expect(document.documentElement.classList.contains('reduce-motion')).toBe(true);
  });

  test('initializes reduced motion from system preference', () => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    
    motionUtils.initializeReducedMotion();
    
    expect(document.documentElement.classList.contains('reduce-motion')).toBe(true);
  });
});

describe('Skip Link Utilities', () => {
  test('creates skip link', () => {
    const targetElement = document.createElement('main');
    targetElement.id = 'main-content';
    document.body.appendChild(targetElement);
    
    const skipLink = skipLinkUtils.createSkipLink('main-content', 'Skip to content');
    
    expect(skipLink.href).toContain('#main-content');
    expect(skipLink.textContent).toBe('Skip to content');
    expect(skipLink.className).toBe('skip-link');
  });

  test('initializes skip links', () => {
    const mainElement = document.createElement('main');
    mainElement.id = 'main-content';
    document.body.appendChild(mainElement);
    
    skipLinkUtils.initializeSkipLinks();
    
    const skipLink = document.querySelector('.skip-link');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink.href).toContain('#main-content');
  });
});