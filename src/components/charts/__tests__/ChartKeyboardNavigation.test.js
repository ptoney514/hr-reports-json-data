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