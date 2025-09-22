# HR Reports Project - Comprehensive Testing Guide

## Table of Contents

1. [Overview](#overview)
2. [Testing Philosophy](#testing-philosophy)
3. [Test Types and Coverage](#test-types-and-coverage)
4. [Accessibility Testing](#accessibility-testing)
5. [Performance Testing](#performance-testing)
6. [Cross-Browser Testing](#cross-browser-testing)
7. [Regression Testing](#regression-testing)
8. [Running Tests](#running-tests)
9. [Writing New Tests](#writing-new-tests)
10. [CI/CD Integration](#cicd-integration)
11. [Manual Testing Guide](#manual-testing-guide)
12. [Troubleshooting](#troubleshooting)

## Overview

The HR Reports Project implements a comprehensive testing strategy focused on accessibility, performance, and cross-browser compatibility. Our testing framework ensures WCAG 2.1 AA compliance, optimal performance across devices, and reliable functionality for all users including those using assistive technologies.

### Key Testing Objectives

- **Accessibility First**: Ensure all features work with screen readers, keyboard navigation, and other assistive technologies
- **Performance Excellence**: Maintain Core Web Vitals compliance (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- **Cross-Browser Compatibility**: Support modern browsers with consistent accessibility behavior
- **Regression Prevention**: Automated testing prevents accessibility and performance regressions

## Testing Philosophy

### Test-Driven Accessibility Development

We follow a test-driven approach specifically for accessibility features:

1. **Write accessibility tests first** - Define expected behavior for screen readers and keyboard users
2. **Implement features** - Build components that pass accessibility tests
3. **Verify manually** - Test with actual assistive technologies
4. **Automate regression tests** - Prevent future accessibility breakages

### Quality Metrics

- **Test Coverage**: Target 90%+ coverage for accessibility features
- **Performance Budget**: All components must render within 100ms
- **Accessibility Compliance**: Zero axe-core violations on production builds
- **Cross-Browser Support**: Consistent behavior across Chrome, Firefox, Safari, and Edge

## Test Types and Coverage

### Unit Tests

**Location**: `src/components/**/__tests__/`

**Purpose**: Test individual component functionality and accessibility features

**Examples**:
```javascript
// AccessibilityToggle.test.js
test('toggles high contrast mode', async () => {
  const { user } = renderWithRouter(<AccessibilityToggle />);
  
  const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
  await user.click(toggleButton);
  
  const highContrastSwitch = screen.getByRole('switch', { name: /toggle high contrast/i });
  await user.click(highContrastSwitch);
  
  expect(document.documentElement).toHaveClass('high-contrast-mode');
  expect(localStorage.getItem('high-contrast-mode')).toBe('true');
});
```

### Integration Tests

**Location**: `src/components/**/__tests__/`

**Purpose**: Test component interactions and complex user workflows

**Examples**:
```javascript
// Navigation.test.js
test('navigates through menu items with arrow keys', async () => {
  const { user } = renderWithRoute();
  
  const hrAnalyticsButton = screen.getByRole('button', { name: /hr analytics/i });
  await user.click(hrAnalyticsButton);
  
  const menuItems = screen.getAllByRole('menuitem');
  
  // Test ArrowDown navigation
  await user.keyboard('{ArrowDown}');
  expect(menuItems[1]).toHaveFocus();
});
```

### Accessibility Tests

**Location**: `src/utils/__tests__/accessibilityUtils.test.js`

**Purpose**: Test accessibility utilities and ARIA implementations

**Coverage**:
- ARIA label generation
- Keyboard navigation handlers
- Focus management utilities
- Screen reader announcements
- High contrast mode functionality

### Performance Tests

**Location**: Uses `src/utils/performanceTestUtils.js`

**Purpose**: Monitor component performance and Core Web Vitals

**Coverage**:
- Render time measurement
- Memory usage tracking
- Accessibility feature performance impact
- Bundle size analysis

## Accessibility Testing

### Automated Accessibility Testing

We use **axe-core** for automated accessibility auditing:

```javascript
import { accessibilityTestUtils } from '../../../utils/testUtils';

test('passes axe accessibility audit', async () => {
  const { container } = renderWithRouter(<MyComponent />);
  await accessibilityTestUtils.expectNoAccessibilityViolations(container);
});
```

### WCAG 2.1 AA Compliance Testing

Our accessibility test configuration covers:

- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **ARIA Labels**: Proper labeling for screen readers
- **Heading Order**: Logical heading hierarchy
- **Landmark Roles**: Proper page structure
- **Form Labels**: All form controls properly labeled
- **Image Alt Text**: Descriptive alternative text
- **Focus Management**: Logical focus order and visible indicators

### Manual Accessibility Testing

#### Screen Reader Testing

**Recommended Tools**:
- **NVDA** (Windows) - Free, widely used
- **JAWS** (Windows) - Industry standard
- **VoiceOver** (macOS/iOS) - Built-in Apple screen reader
- **TalkBack** (Android) - Built-in Android screen reader

**Testing Checklist**:
1. Navigate using only the screen reader
2. Verify all content is announced correctly
3. Test form completion and submission
4. Verify error messages are announced
5. Test dynamic content updates (live regions)

#### Keyboard Navigation Testing

**Testing Process**:
1. Disconnect mouse/trackpad
2. Navigate using only keyboard:
   - **Tab**: Move forward through focusable elements
   - **Shift+Tab**: Move backward through focusable elements
   - **Arrow Keys**: Navigate within components (charts, tables)
   - **Enter/Space**: Activate buttons and controls
   - **Escape**: Close dialogs and menus
   - **Home/End**: Navigate to first/last items

### Accessibility Test Utilities

#### Key Functions

```javascript
// Test ARIA attributes
accessibilityTestUtils.testARIAAttributes(container, {
  'button': { 'aria-label': 'Close dialog', 'aria-expanded': 'false' },
  'dialog': { 'role': 'dialog', 'aria-modal': 'true' }
});

// Test keyboard navigation
await accessibilityTestUtils.testKeyboardNavigation(container, user, [
  { keys: '{ArrowRight}', expectedElement: nextElement },
  { keys: '{Home}', expectedElement: firstElement }
]);

// Test screen reader announcements
await accessibilityTestUtils.testScreenReaderAnnouncements([
  { text: 'Menu opened', level: 'polite' }
]);
```

## Performance Testing

### Core Web Vitals Monitoring

We monitor and test against Google's Core Web Vitals:

```javascript
import { coreWebVitals } from '../utils/performanceTestUtils';

test('meets Core Web Vitals thresholds', async () => {
  const report = await coreWebVitals.getReport();
  
  expect(report.lcp.rating).toBe('good'); // < 2.5s
  expect(report.fid.rating).toBe('good'); // < 100ms
  expect(report.cls.rating).toBe('good'); // < 0.1
});
```

### Component Performance Testing

```javascript
import { componentPerformance } from '../utils/performanceTestUtils';

test('component renders within performance budget', async () => {
  const performance = await componentPerformance.measureRenderTime(
    () => renderWithRouter(<MyComponent />),
    10 // iterations
  );
  
  expect(performance.average).toBeLessThan(100); // 100ms budget
});
```

### Accessibility Performance Impact

We measure the performance impact of accessibility features:

```javascript
const impact = await accessibilityPerformance.measureA11yImpact(
  () => renderBaseline(),
  () => renderWithAccessibility()
);

expect(impact.impactPercentage).toBeLessThan(10); // < 10% performance impact
```

## Cross-Browser Testing

### Browser Compatibility Matrix

| Feature | Chrome 90+ | Firefox 88+ | Safari 14+ | Edge 90+ |
|---------|------------|-------------|------------|----------|
| CSS Grid | ✅ | ✅ | ✅ | ✅ |
| Flexbox | ✅ | ✅ | ✅ | ✅ |
| ARIA Live | ✅ | ✅ | ✅ | ✅ |
| Focus Management | ✅ | ✅ | ✅ | ✅ |
| Screen Reader APIs | ✅ | ✅ | ✅ | ✅ |

### Automated Cross-Browser Testing

```javascript
import { crossBrowserTestSuite } from '../utils/crossBrowserTestUtils';

test('passes cross-browser compatibility tests', async () => {
  const results = await crossBrowserTestSuite.runCompatibilityTests();
  
  expect(results.overallCompatibility.readyForProduction).toBe(true);
  expect(results.accessibility.supportLevel).toBe('excellent');
});
```

### Responsive Design Testing

Test across multiple viewport sizes:

```javascript
const viewportTests = responsiveCompatibility.testViewportSizes();

viewportTests.forEach(({ name, test }) => {
  expect(test.mediaQueries.mobile.supported).toBe(true);
  expect(test.touchSupport.touchEvents).toBeDefined();
});
```

## Regression Testing

### Accessibility Regression Prevention

We use automated baseline comparison to prevent regressions:

```javascript
import { AccessibilityBaseline } from '../utils/accessibilityRegressionTests';

const baseline = new AccessibilityBaseline();

// Create baseline (run once)
await baseline.createBaseline('MyComponent', () => renderWithRouter(<MyComponent />));

// Compare against baseline (run in CI)
const comparison = await baseline.compareAgainstBaseline('MyComponent', () => renderWithRouter(<MyComponent />));

expect(comparison.results.accessibility.status).toBe('pass');
expect(comparison.results.performance.status).toBe('pass');
```

### Performance Regression Testing

```javascript
import { regressionTesting } from '../utils/performanceTestUtils';

const testSuite = {
  'MyComponent.default': () => renderWithRouter(<MyComponent />),
  'MyComponent.withData': () => renderWithRouter(<MyComponent data={mockData} />)
};

const results = await regressionTesting.compareAgainstBaseline(testSuite, baseline);
expect(results.summary.passRate).toBeGreaterThan(90);
```

## Running Tests

### Local Development

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- AccessibilityToggle.test.js

# Run tests with coverage
npm test -- --coverage

# Run accessibility tests only
npm test -- --testNamePattern="accessibility"

# Run performance tests
npm test -- --testNamePattern="performance"
```

### Test Scripts

```bash
# Run accessibility audit
npm run test:a11y

# Run performance tests
npm run test:performance

# Run cross-browser tests
npm run test:cross-browser

# Generate accessibility baseline
npm run test:baseline

# Run regression tests
npm run test:regression
```

### Environment Variables

```bash
# Enable accessibility testing
REACT_APP_A11Y_TESTING=true

# Set performance budget (ms)
REACT_APP_PERFORMANCE_BUDGET=100

# Enable verbose logging
REACT_APP_TEST_VERBOSE=true
```

## Writing New Tests

### Test Structure

Follow this structure for new test files:

```javascript
/**
 * Test file description
 * What this file tests and why
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter, accessibilityTestUtils, setupTestEnvironment } from '../../../utils/testUtils';
import MyComponent from '../MyComponent';

beforeEach(() => {
  setupTestEnvironment.accessibility();
  setupTestEnvironment.performance();
});

afterEach(() => {
  setupTestEnvironment.cleanup();
});

describe('MyComponent', () => {
  describe('Accessibility Compliance', () => {
    test('passes axe accessibility audit', async () => {
      const { container } = renderWithRouter(<MyComponent />);
      await accessibilityTestUtils.expectNoAccessibilityViolations(container);
    });
  });

  describe('Keyboard Navigation', () => {
    test('supports tab navigation', async () => {
      // Test implementation
    });
  });

  describe('Performance', () => {
    test('renders within performance budget', () => {
      // Performance test implementation
    });
  });
});
```

### Accessibility Test Patterns

#### Testing ARIA Attributes

```javascript
test('has proper ARIA attributes', () => {
  renderWithRouter(<MyComponent />);
  
  const button = screen.getByRole('button');
  expect(button).toHaveAttribute('aria-label', 'Expected label');
  expect(button).toHaveAttribute('aria-expanded', 'false');
});
```

#### Testing Keyboard Navigation

```javascript
test('supports keyboard navigation', async () => {
  const { user } = renderWithRouter(<MyComponent />);
  
  const button = screen.getByRole('button');
  button.focus();
  
  await user.keyboard('{Enter}');
  expect(/* expected behavior */).toBeTruthy();
});
```

#### Testing Screen Reader Support

```javascript
test('announces changes to screen readers', async () => {
  const { user } = renderWithRouter(<MyComponent />);
  
  await user.click(screen.getByRole('button'));
  
  await accessibilityTestUtils.testScreenReaderAnnouncements([
    { text: 'Action completed', level: 'polite' }
  ]);
});
```

### Performance Test Patterns

```javascript
test('component performance', async () => {
  const performance = await componentPerformance.measureRenderTime(
    () => renderWithRouter(<MyComponent />),
    5 // iterations
  );
  
  expect(performance.average).toBeLessThan(50);
  expect(performance.max).toBeLessThan(100);
});
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Accessibility and Performance Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - run: npm ci
    - run: npm run test:a11y
    - run: npm run test:performance
    - run: npm run test:regression
    
    - name: Upload test results
      uses: actions/upload-artifact@v2
      if: failure()
      with:
        name: test-results
        path: test-results/
```

### Quality Gates

Tests must pass these quality gates before deployment:

1. **Zero accessibility violations** in axe-core audit
2. **Performance budget compliance** (< 100ms render time)
3. **No accessibility regressions** compared to baseline
4. **90%+ test coverage** for accessibility features
5. **Cross-browser compatibility** verification

## Manual Testing Guide

## Quick Start

### 1. Start the Development Server
```bash
# If npm is available
npm start

# If using npx (recommended for PATH issues)
npx react-scripts start
```

### 2. Access Test Tools
- **Main Dashboard**: http://localhost:3000/dashboards
- **Test Suite**: http://localhost:3000/test
- **Error Testing**: http://localhost:3000/test/errors

## Testing Categories

### 🎨 Visual Accuracy Testing

#### Dashboard Index Page (`/dashboards`)
**Test Items:**
- [ ] Header gradient displays correctly (blue gradient)
- [ ] System metrics cards show proper icons and colors
- [ ] Dashboard cards have consistent spacing and hover effects
- [ ] Navigation breadcrumbs work properly
- [ ] Time stamps update correctly
- [ ] Status indicators show appropriate colors (green, yellow, red)

**Expected Results:**
- Clean, professional layout with consistent spacing
- Blue color scheme (#4f46e5) throughout
- Smooth hover animations on cards
- Real-time clock updates every minute

#### Workforce Dashboard (`/dashboards/workforce`)
**Test Items:**
- [ ] Summary cards display correctly with trend indicators
- [ ] Charts render with proper data
- [ ] Filter controls are accessible and functional
- [ ] Export button dropdown works
- [ ] Print styles apply correctly

#### Turnover Dashboard (`/dashboards/turnover`)
**Test Items:**
- [ ] Turnover metrics display with correct formatting
- [ ] Pie charts and bar charts render properly
- [ ] Benchmark comparisons show correctly
- [ ] Color coding matches design system

#### I-9 Dashboard (`/dashboards/i9`)
**Test Items:**
- [ ] Compliance metrics display accurately
- [ ] Risk indicators show appropriate colors
- [ ] Charts integrate with existing layout

### 🔧 Filter Functionality Testing

#### Workforce Dashboard Filters
**Test Steps:**
1. Click "Filters" button
2. Change "Reporting Period" to different quarters
3. Select different locations (Omaha/Phoenix)
4. Filter by employee type (Faculty/Staff/Students)
5. Apply filters and verify data updates

**Expected Results:**
- Filter dropdown opens smoothly
- Data updates when filters change
- Active filter count shows in badge
- "Clear All" functionality works
- Filter state persists during navigation

#### Turnover Dashboard Filters
**Test Steps:**
1. Access filter controls
2. Change fiscal year
3. Filter by grade classification
4. Test tenure range filters
5. Verify filter combinations work

### 📱 Responsive Design Testing

#### Mobile Testing (< 768px)
**Test Items:**
- [ ] Navigation collapses to hamburger menu
- [ ] Dashboard cards stack vertically
- [ ] Charts resize appropriately
- [ ] Text remains readable
- [ ] Touch targets are adequate (44px minimum)
- [ ] No horizontal scrolling occurs

**Test Methods:**
1. Use browser dev tools to simulate mobile
2. Test on actual mobile devices
3. Rotate device to test landscape mode

#### Tablet Testing (768px - 1024px)
**Test Items:**
- [ ] Two-column layout for dashboard cards
- [ ] Navigation remains horizontal
- [ ] Charts scale appropriately
- [ ] Filter controls remain accessible

#### Desktop Testing (> 1024px)
**Test Items:**
- [ ] Three-column layout for dashboard cards
- [ ] Full navigation menu visible
- [ ] Charts utilize available space
- [ ] Hover states work properly

### 📊 Chart Rendering Testing

#### Using Error Test Component (`/test/errors`)
**Test Scenarios:**
1. **Normal Data**: Verify charts render correctly
2. **Empty Array**: Should show "No data available" message
3. **Null Data**: Should handle gracefully with error message
4. **Undefined Data**: Should not crash, show error state
5. **Malformed Data**: Should handle invalid data structures
6. **Single Item**: Should render with minimal data

**Chart Components to Test:**
- [ ] HeadcountChart - Bar chart with multiple series
- [ ] StartersLeaversChart - Line chart with trends
- [ ] LocationChart - Horizontal/vertical bar chart
- [ ] DivisionsChart - Ranked bar chart
- [ ] TurnoverPieChart - Pie chart with percentages

**Expected Results:**
- Charts render without console errors
- Error states show helpful messages
- Loading states display appropriately
- Data updates smoothly when filters change

### 🚨 Error States Testing

#### Network Error Simulation
**Test Steps:**
1. Open browser dev tools
2. Go to Network tab
3. Set throttling to "Offline"
4. Try to load dashboards
5. Verify error handling

**Expected Results:**
- Graceful error messages
- Retry functionality available
- No application crashes
- User-friendly error descriptions

#### Data Loading States
**Test Items:**
- [ ] Loading spinners appear during data fetch
- [ ] Skeleton screens show while loading
- [ ] Progress indicators work correctly
- [ ] Timeout handling works properly

#### Invalid Filter Combinations
**Test Steps:**
1. Apply multiple conflicting filters
2. Enter invalid date ranges
3. Test with non-existent filter values

**Expected Results:**
- Validation messages appear
- Filters reset to valid states
- No data corruption occurs

## Performance Testing

### Page Load Times
**Acceptable Thresholds:**
- Initial load: < 3 seconds
- Navigation between pages: < 1 second
- Filter application: < 500ms
- Chart rendering: < 1 second

### Memory Usage
**Test Steps:**
1. Open browser dev tools
2. Go to Performance tab
3. Record while navigating between dashboards
4. Check for memory leaks

### Network Requests
**Test Items:**
- [ ] Data caching works (5-minute cache)
- [ ] No unnecessary API calls
- [ ] Proper error handling for failed requests

## Browser Compatibility

### Supported Browsers
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)

### Test Each Browser For:
- [ ] Chart rendering
- [ ] CSS animations
- [ ] Navigation functionality
- [ ] Filter operations
- [ ] Print functionality

## Accessibility Testing

### Keyboard Navigation
**Test Items:**
- [ ] Tab order is logical
- [ ] All interactive elements are reachable
- [ ] Escape key closes modals/dropdowns
- [ ] Enter/Space activate buttons

### Screen Reader Testing
**Test Items:**
- [ ] Proper heading hierarchy
- [ ] Alt text for charts and images
- [ ] ARIA labels for interactive elements
- [ ] Focus indicators are visible

### Color Contrast
**Test Items:**
- [ ] Text meets WCAG AA standards (4.5:1 ratio)
- [ ] Interactive elements have sufficient contrast
- [ ] Error states are not color-dependent only

## Print Testing

### Print Functionality
**Test Steps:**
1. Navigate to any dashboard
2. Use browser print (Ctrl+P)
3. Preview print layout
4. Test actual printing

**Expected Results:**
- [ ] Print-specific styles apply
- [ ] Charts render in grayscale
- [ ] Headers and footers appear
- [ ] Page breaks are appropriate
- [ ] No content is cut off

## Manual Testing Checklist

### Before Each Release
- [ ] All dashboards load without errors
- [ ] Navigation works between all pages
- [ ] Filters apply correctly on all dashboards
- [ ] Charts render with real data
- [ ] Mobile layout works on actual devices
- [ ] Print functionality works
- [ ] No console errors in any browser
- [ ] Performance meets acceptable thresholds

### Test Data Verification
- [ ] Workforce data displays correctly
- [ ] Turnover calculations are accurate
- [ ] I-9 compliance metrics are correct
- [ ] Historical trends show properly
- [ ] Filter combinations produce expected results

## Debugging Common Issues

### Chart Not Rendering
**Possible Causes:**
- Missing or malformed data
- Recharts version compatibility
- CSS conflicts

**Solutions:**
1. Check browser console for errors
2. Verify data structure matches component expectations
3. Test with minimal data set

### Filter Not Working
**Possible Causes:**
- Context state not updating
- Filter logic errors
- Component not re-rendering

**Solutions:**
1. Check React dev tools for state changes
2. Verify filter functions in hooks
3. Add console logs to track data flow

### Responsive Issues
**Possible Causes:**
- CSS breakpoint conflicts
- Fixed widths preventing scaling
- Chart container sizing issues

**Solutions:**
1. Use browser dev tools to inspect CSS
2. Test with multiple screen sizes
3. Verify Tailwind responsive classes

## Test Automation Opportunities

### Future Enhancements
- Unit tests for chart components
- Integration tests for filter functionality
- E2E tests for critical user paths
- Visual regression testing
- Performance monitoring

## Reporting Issues

### Information to Include
- Browser and version
- Screen size/device
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- Screenshots or video

### Priority Levels
- **Critical**: Application crashes, data corruption
- **High**: Major functionality broken, poor UX
- **Medium**: Minor visual issues, edge cases
- **Low**: Enhancement suggestions, nice-to-haves

---

## Quick Test Commands

```bash
# Start development server
npx react-scripts start

# Run with specific port
npx react-scripts start --port 3001

# Build for production testing
npx react-scripts build

# Serve production build
npx serve -s build
```

## Test URLs

- Dashboard Index: http://localhost:3000/dashboards
- Workforce Dashboard: http://localhost:3000/dashboards/workforce
- Turnover Dashboard: http://localhost:3000/dashboards/turnover
- I-9 Dashboard: http://localhost:3000/dashboards/i9
- Test Suite: http://localhost:3000/test
- Error Testing: http://localhost:3000/test/errors 

## Filter Rendering Bug Regression Test (2024-06)

### Background
A bug was discovered where objects (such as dateRange filters) were being rendered directly in the DashboardLayout filter summary, causing a React error: `Objects are not valid as a React child`. This was fixed by ensuring only string/number values or the `.label` property of objects are rendered.

### How to Test
1. **Navigate to all dashboards:**
   - Workforce Dashboard
   - Turnover Dashboard
   - I-9 Dashboard
2. **Apply various filters, including date ranges and dropdowns.**
3. **Print preview** each dashboard to ensure the "Applied Filters" section renders all filter values as readable text (not `[object Object]`).
4. **Check for errors:**
   - No React errors should appear in the UI or browser console.
   - All filter values should be human-readable.
5. **Regression:**
   - Repeat for all dashboards and test routes (including `/test/export`, `/test/print`, `/test/accessibility`).

### Developer Note
If you add new filters or change filter structures, always ensure that any object filter values have a `.label` property for display, or update the DashboardLayout print filter rendering logic to handle them safely. 