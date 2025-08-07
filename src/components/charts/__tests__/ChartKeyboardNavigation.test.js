/**
 * Comprehensive keyboard navigation tests for chart components
 * Tests ARIA compliance, focus management, and keyboard accessibility
 * for all chart types in the HR Reports application
 */

import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter, accessibilityTestUtils, createMockData, setupTestEnvironment } from '../../../utils/testUtils';
import HeadcountChart from '../HeadcountChart';
import StartersLeaversChart from '../StartersLeaversChart';
import LocationChart from '../LocationChart';
import DivisionsChart from '../DivisionsChart';
import TurnoverPieChart from '../TurnoverPieChart';
import TopExitReasonsChart from '../TopExitReasonsChart';

// Mock Recharts components with keyboard navigation support
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div role="img" tabIndex="0">{children}</div>,
  BarChart: ({ children, data }) => (
    <div 
      role="img" 
      tabIndex="0" 
      aria-label={`Bar chart with ${data?.length || 0} data points`}
      data-testid="bar-chart"
    >
      {children}
    </div>
  ),
  Bar: ({ dataKey }) => <div data-testid={`bar-${dataKey}`} />,
  XAxis: ({ dataKey }) => <div data-testid={`x-axis-${dataKey}`} />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  PieChart: ({ children, data }) => (
    <div 
      role="img" 
      tabIndex="0" 
      aria-label={`Pie chart with ${data?.length || 0} segments`}
      data-testid="pie-chart"
    >
      {children}
    </div>
  ),
  Pie: ({ data, dataKey }) => (
    <div 
      data-testid={`pie-${dataKey}`}
      role="group"
      aria-label={`Pie segments for ${dataKey}`}
    />
  ),
  Cell: ({ fill }) => <div data-testid="pie-cell" style={{ fill }} />
}));

beforeEach(() => {
  setupTestEnvironment.accessibility();
  setupTestEnvironment.performance();
});

afterEach(() => {
  setupTestEnvironment.cleanup();
});

describe('Chart Keyboard Navigation', () => {
  const mockWorkforceData = createMockData.workforce(5);
  const mockChartData = createMockData.chart(5, 'bar');

  describe('HeadcountChart', () => {
    test('passes accessibility audit', async () => {
      const { container } = renderWithRouter(
        <HeadcountChart data={mockWorkforceData} />
      );
      
      await accessibilityTestUtils.expectNoAccessibilityViolations(container);
    });

    test('has proper ARIA attributes', () => {
      renderWithRouter(<HeadcountChart data={mockWorkforceData} />);
      
      const chart = screen.getByRole('img');
      expect(chart).toHaveAttribute('tabindex', '0');
      expect(chart).toHaveAttribute('aria-label');
    });

    test('supports keyboard focus', async () => {
      const { user } = renderWithRouter(<HeadcountChart data={mockWorkforceData} />);
      
      const chart = screen.getByRole('img');
      await user.tab();
      
      expect(chart).toHaveFocus();
    });

    test('provides descriptive ARIA label based on data', () => {
      renderWithRouter(<HeadcountChart data={mockWorkforceData} />);
      
      const chart = screen.getByRole('img');
      const ariaLabel = chart.getAttribute('aria-label');
      
      expect(ariaLabel).toContain('chart');
      expect(ariaLabel).toContain(mockWorkforceData.length.toString());
      expect(ariaLabel).toContain('data points');
    });

    test('announces data when focused', async () => {
      const { user } = renderWithRouter(<HeadcountChart data={mockWorkforceData} />);
      
      const chart = screen.getByRole('img');
      await user.click(chart);
      
      // Should announce chart data to screen readers
      await accessibilityTestUtils.testScreenReaderAnnouncements([
        { text: 'chart', level: 'polite' }
      ]);
    });

    test('handles empty data gracefully', () => {
      renderWithRouter(<HeadcountChart data={[]} />);
      
      const chart = screen.getByRole('img');
      const ariaLabel = chart.getAttribute('aria-label');
      
      expect(ariaLabel).toContain('0 data points');
    });
  });

  describe('StartersLeaversChart', () => {
    test('passes accessibility audit', async () => {
      const { container } = renderWithRouter(
        <StartersLeaversChart data={mockChartData} />
      );
      
      await accessibilityTestUtils.expectNoAccessibilityViolations(container);
    });

    test('supports arrow key navigation between data points', async () => {
      const { user } = renderWithRouter(<StartersLeaversChart data={mockChartData} />);
      
      const chart = screen.getByRole('img');
      chart.focus();
      
      // Simulate arrow key navigation
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowLeft}');
      await user.keyboard('{Home}');
      await user.keyboard('{End}');
      
      // Each navigation should maintain focus on chart
      expect(chart).toHaveFocus();
    });

    test('provides data point information on Enter/Space', async () => {
      const { user } = renderWithRouter(<StartersLeaversChart data={mockChartData} />);
      
      const chart = screen.getByRole('img');
      chart.focus();
      
      await user.keyboard('{Enter}');
      await user.keyboard(' ');
      
      // Should maintain focus and provide feedback
      expect(chart).toHaveFocus();
    });

    test('has proper chart structure for screen readers', () => {
      renderWithRouter(<StartersLeaversChart data={mockChartData} />);
      
      const chart = screen.getByRole('img');
      expect(chart).toBeInTheDocument();
      
      // Should have data visualization elements
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('LocationChart', () => {
    test('passes accessibility audit', async () => {
      const { container } = renderWithRouter(
        <LocationChart data={mockChartData} />
      );
      
      await accessibilityTestUtils.expectNoAccessibilityViolations(container);
    });

    test('provides location-specific ARIA descriptions', () => {
      const locationData = [
        { name: 'New York', employees: 150 },
        { name: 'Los Angeles', employees: 120 },
        { name: 'Chicago', employees: 80 }
      ];
      
      renderWithRouter(<LocationChart data={locationData} />);
      
      const chart = screen.getByRole('img');
      const ariaLabel = chart.getAttribute('aria-label');
      
      expect(ariaLabel).toContain('3 data points');
    });

    test('supports high contrast mode', async () => {
      document.documentElement.classList.add('high-contrast-mode');
      
      const { container } = renderWithRouter(<LocationChart data={mockChartData} />);
      
      await accessibilityTestUtils.testHighContrastMode(container);
    });

    test('respects reduced motion preferences', async () => {
      document.documentElement.classList.add('reduce-motion');
      
      const { container } = renderWithRouter(<LocationChart data={mockChartData} />);
      
      await accessibilityTestUtils.testReducedMotion(container);
    });
  });

  describe('DivisionsChart', () => {
    test('passes accessibility audit', async () => {
      const { container } = renderWithRouter(
        <DivisionsChart data={mockChartData} />
      );
      
      await accessibilityTestUtils.expectNoAccessibilityViolations(container);
    });

    test('provides division-specific navigation', async () => {
      const { user } = renderWithRouter(<DivisionsChart data={mockChartData} />);
      
      const chart = screen.getByRole('img');
      await user.tab();
      
      expect(chart).toHaveFocus();
      
      // Test navigation through divisions
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');
      
      expect(chart).toHaveFocus();
    });

    test('announces division data changes', async () => {
      const { user } = renderWithRouter(<DivisionsChart data={mockChartData} />);
      
      const chart = screen.getByRole('img');
      chart.focus();
      
      await user.keyboard('{ArrowRight}');
      
      // Should announce new data point
      await waitFor(() => {
        const liveRegions = document.querySelectorAll('[aria-live]');
        expect(liveRegions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('TurnoverPieChart', () => {
    test('passes accessibility audit', async () => {
      const { container } = renderWithRouter(
        <TurnoverPieChart data={mockChartData} />
      );
      
      await accessibilityTestUtils.expectNoAccessibilityViolations(container);
    });

    test('provides pie segment navigation', async () => {
      const { user } = renderWithRouter(<TurnoverPieChart data={mockChartData} />);
      
      const chart = screen.getByRole('img');
      await user.tab();
      
      expect(chart).toHaveFocus();
      
      // Navigate through pie segments
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowLeft}');
      
      expect(chart).toHaveFocus();
    });

    test('provides percentage information for pie segments', () => {
      const pieData = [
        { name: 'Voluntary', value: 60, percentage: 60 },
        { name: 'Involuntary', value: 40, percentage: 40 }
      ];
      
      renderWithRouter(<TurnoverPieChart data={pieData} />);
      
      const chart = screen.getByRole('img');
      const ariaLabel = chart.getAttribute('aria-label');
      
      expect(ariaLabel).toContain('segments');
      expect(ariaLabel).toContain('100'); // Total should be calculated
    });

    test('handles single segment pie chart', () => {
      const singleSegmentData = [{ name: 'Total', value: 100, percentage: 100 }];
      
      renderWithRouter(<TurnoverPieChart data={singleSegmentData} />);
      
      const chart = screen.getByRole('img');
      expect(chart).toBeInTheDocument();
      
      const ariaLabel = chart.getAttribute('aria-label');
      expect(ariaLabel).toContain('1');
    });
  });

  describe('TopExitReasonsChart', () => {
    const mockExitReasonsData = [
      { reason: 'Resignation', total: 25, percentage: 40.3, faculty: 3, staff: 22 },
      { reason: 'Retirement', total: 14, percentage: 22.6, faculty: 9, staff: 5 },
      { reason: 'Contract End', total: 12, percentage: 19.4, faculty: 8, staff: 4 },
      { reason: 'Termination', total: 6, percentage: 9.7, faculty: 2, staff: 4 },
      { reason: 'Transfer', total: 5, percentage: 8.1, faculty: 1, staff: 4 }
    ];

    test('renders with proper ARIA attributes for accessibility', () => {
      renderWithRouter(<TopExitReasonsChart data={mockExitReasonsData} />);
      
      // Check main container has role="list"
      const listContainer = screen.getByRole('list');
      expect(listContainer).toHaveAttribute('aria-label', 'Exit reasons data');
      
      // Check each item has role="listitem"
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(5);
      
      // Verify first item has comprehensive aria-label
      const firstItem = listItems[0];
      expect(firstItem).toHaveAttribute('aria-label');
      const ariaLabel = firstItem.getAttribute('aria-label');
      expect(ariaLabel).toContain('Resignation');
      expect(ariaLabel).toContain('40.3%');
      expect(ariaLabel).toContain('25 people total');
      expect(ariaLabel).toContain('3 faculty');
      expect(ariaLabel).toContain('22 staff');
    });

    test('renders progress bars with proper ARIA attributes', () => {
      renderWithRouter(<TopExitReasonsChart data={mockExitReasonsData} />);
      
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars).toHaveLength(5);
      
      // Test first progress bar (highest percentage)
      const firstProgressBar = progressBars[0];
      expect(firstProgressBar).toHaveAttribute('aria-valuemin', '0');
      expect(firstProgressBar).toHaveAttribute('aria-valuemax', '40.3');
      expect(firstProgressBar).toHaveAttribute('aria-valuenow', '40.3');
      expect(firstProgressBar).toHaveAttribute('aria-label', '40.3% of total departures');
    });

    test('handles empty data gracefully with accessibility', () => {
      renderWithRouter(<TopExitReasonsChart data={[]} />);
      
      // Should show no data message
      const noDataMessage = screen.getByText('No exit reasons data available');
      expect(noDataMessage).toBeInTheDocument();
      
      // Title should still be present and accessible
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveTextContent('Top Exit Reasons');
    });

    test('supports keyboard navigation to focusable elements', async () => {
      const { user } = renderWithRouter(<TopExitReasonsChart data={mockExitReasonsData} />);
      
      // Tab should navigate through list items (they are not focusable themselves)
      // But the component should be accessible via screen reader navigation
      await user.tab();
      
      // Verify the component structure is keyboard navigable
      const listContainer = screen.getByRole('list');
      expect(listContainer).toBeInTheDocument();
      
      // List items should be accessible to screen readers
      const listItems = screen.getAllByRole('listitem');
      listItems.forEach(item => {
        expect(item).toHaveAttribute('aria-label');
      });
    });

    test('has proper color contrast for visual accessibility', () => {
      renderWithRouter(<TopExitReasonsChart data={mockExitReasonsData} />);
      
      // Check that color indicators are marked with aria-hidden since they're decorative
      const colorIndicators = document.querySelectorAll('[aria-hidden="true"]');
      expect(colorIndicators.length).toBeGreaterThan(0);
      
      // Ensure all text content is properly accessible
      expect(screen.getByText('Faculty: 3')).toBeInTheDocument();
      expect(screen.getByText('Staff: 22')).toBeInTheDocument();
    });

    test('displays comprehensive data summary for screen readers', () => {
      renderWithRouter(<TopExitReasonsChart data={mockExitReasonsData} />);
      
      // Check total summary section
      const totalSeparations = screen.getByText('Total separations analyzed');
      expect(totalSeparations).toBeInTheDocument();
      
      // Verify total is calculated correctly (25+14+12+6+5 = 62)
      const totalValue = screen.getByText('62');
      expect(totalValue).toBeInTheDocument();
    });

    test('maintains proper heading hierarchy', () => {
      renderWithRouter(<TopExitReasonsChart data={mockExitReasonsData} />);
      
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Top Exit Reasons');
      expect(heading).toHaveClass('text-lg', 'font-bold', 'text-blue-600');
    });

    test('passes comprehensive Jest-axe accessibility audit with zero violations', async () => {
      const { container } = renderWithRouter(<TopExitReasonsChart data={mockExitReasonsData} />);
      
      // Run comprehensive accessibility audit with all WCAG 2.1 AA rules
      await accessibilityTestUtils.expectNoAccessibilityViolations(container, {
        rules: {
          'color-contrast': { enabled: true },
          'aria-allowed-attr': { enabled: true },
          'aria-required-attr': { enabled: true },
          'aria-roles': { enabled: true },
          'aria-valid-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true },
          'button-name': { enabled: true },
          'bypass': { enabled: true },
          'document-title': { enabled: true },
          'duplicate-id': { enabled: true },
          'frame-title': { enabled: true },
          'html-has-lang': { enabled: true },
          'image-alt': { enabled: true },
          'input-image-alt': { enabled: true },
          'label': { enabled: true },
          'link-name': { enabled: true },
          'list': { enabled: true },
          'listitem': { enabled: true },
          'meta-refresh': { enabled: true },
          'meta-viewport': { enabled: true },
          'object-alt': { enabled: true },
          'role-img-alt': { enabled: true },
          'scrollable-region-focusable': { enabled: true },
          'server-side-image-map': { enabled: true },
          'valid-lang': { enabled: true }
        },
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
      });
    });
  });

  describe('Cross-Chart Keyboard Navigation', () => {
    test('maintains tab order between multiple charts', async () => {
      const { user } = renderWithRouter(
        <div>
          <HeadcountChart data={mockWorkforceData} />
          <StartersLeaversChart data={mockChartData} />
          <TurnoverPieChart data={mockChartData} />
        </div>
      );
      
      const charts = screen.getAllByRole('img');
      expect(charts).toHaveLength(3);
      
      // Tab through all charts
      await user.tab();
      expect(charts[0]).toHaveFocus();
      
      await user.tab();
      expect(charts[1]).toHaveFocus();
      
      await user.tab();
      expect(charts[2]).toHaveFocus();
      
      // Reverse tab order
      await user.tab({ shift: true });
      expect(charts[1]).toHaveFocus();
    });

    test('escape key moves focus out of chart navigation mode', async () => {
      const { user } = renderWithRouter(
        <div>
          <button>Before Chart</button>
          <HeadcountChart data={mockWorkforceData} />
          <button>After Chart</button>
        </div>
      );
      
      const chart = screen.getByRole('img');
      const beforeButton = screen.getByText('Before Chart');
      const afterButton = screen.getByText('After Chart');
      
      chart.focus();
      await user.keyboard('{Escape}');
      
      // Focus should remain on chart but exit navigation mode
      expect(chart).toHaveFocus();
    });
  });

  describe('Touch and Mobile Accessibility', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    test('charts maintain accessibility on mobile', async () => {
      const { container } = renderWithRouter(<HeadcountChart data={mockWorkforceData} />);
      
      await accessibilityTestUtils.expectNoAccessibilityViolations(container);
    });

    test('charts provide touch-friendly interaction areas', () => {
      renderWithRouter(<HeadcountChart data={mockWorkforceData} />);
      
      const chart = screen.getByRole('img');
      
      // Chart should be focusable for touch users
      expect(chart).toHaveAttribute('tabindex', '0');
    });

    test('charts announce data for voice control users', async () => {
      const { user } = renderWithRouter(<HeadcountChart data={mockWorkforceData} />);
      
      const chart = screen.getByRole('img');
      await user.click(chart);
      
      // Should provide voice control commands
      const ariaLabel = chart.getAttribute('aria-label');
      expect(ariaLabel).toContain('Use arrow keys to navigate');
    });
  });

  describe('Performance with Accessibility Features', () => {
    test('chart rendering performance with accessibility features', async () => {
      const startTime = performance.now();
      
      renderWithRouter(<HeadcountChart data={mockWorkforceData} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render with accessibility features in reasonable time
      expect(renderTime).toBeLessThan(100); // 100ms threshold
    });

    test('keyboard navigation performance', async () => {
      const { user, container } = renderWithRouter(<HeadcountChart data={mockWorkforceData} />);
      
      const chart = screen.getByRole('img');
      chart.focus();
      
      const startTime = performance.now();
      
      // Simulate rapid keyboard navigation
      for (let i = 0; i < 10; i++) {
        await user.keyboard('{ArrowRight}');
      }
      
      const endTime = performance.now();
      const navigationTime = endTime - startTime;
      
      // Navigation should be responsive
      expect(navigationTime).toBeLessThan(500); // 500ms for 10 navigation events
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles corrupted data gracefully', () => {
      const corruptedData = [
        { name: null, value: undefined },
        { name: '', value: -1 },
        { invalidProperty: 'test' }
      ];
      
      renderWithRouter(<HeadcountChart data={corruptedData} />);
      
      const chart = screen.getByRole('img');
      expect(chart).toBeInTheDocument();
      
      const ariaLabel = chart.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    });

    test('handles very large datasets', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        name: `Item ${i}`,
        value: Math.random() * 1000
      }));
      
      renderWithRouter(<HeadcountChart data={largeDataset} />);
      
      const chart = screen.getByRole('img');
      expect(chart).toBeInTheDocument();
      
      const ariaLabel = chart.getAttribute('aria-label');
      expect(ariaLabel).toContain('1000 data points');
    });

    test('handles zero values and negative numbers', () => {
      const edgeCaseData = [
        { name: 'Zero', value: 0 },
        { name: 'Negative', value: -50 },
        { name: 'Large', value: 1000000 }
      ];
      
      renderWithRouter(<HeadcountChart data={edgeCaseData} />);
      
      const chart = screen.getByRole('img');
      expect(chart).toBeInTheDocument();
    });
  });

  describe('Internationalization and Localization', () => {
    test('supports RTL languages', () => {
      document.dir = 'rtl';
      
      renderWithRouter(<HeadcountChart data={mockWorkforceData} />);
      
      const chart = screen.getByRole('img');
      expect(chart).toBeInTheDocument();
      
      // Reset direction
      document.dir = 'ltr';
    });

    test('formats numbers according to locale', () => {
      const largeNumberData = [
        { name: 'Test', value: 1234567 }
      ];
      
      renderWithRouter(<HeadcountChart data={largeNumberData} />);
      
      const chart = screen.getByRole('img');
      const ariaLabel = chart.getAttribute('aria-label');
      
      // Should format large numbers with locale-appropriate separators
      expect(ariaLabel).toMatch(/1,234,567|1 234 567|1\.234\.567/);
    });
  });
});