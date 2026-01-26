/**
 * QuarterlyTurnoverRatesTable Component Tests
 *
 * Tests for the annual turnover rates table component that displays
 * turnover rates by category (Faculty, Staff Exempt, Staff Non-Exempt, Total)
 * across fiscal years with CUPA benchmark comparison.
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import QuarterlyTurnoverRatesTable from '../QuarterlyTurnoverRatesTable';
import { getAnnualTurnoverRatesByCategory } from '../../../data/staticData';

// Get actual data for validation
const data = getAnnualTurnoverRatesByCategory();

describe('QuarterlyTurnoverRatesTable Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<QuarterlyTurnoverRatesTable />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should render with default title', () => {
      render(<QuarterlyTurnoverRatesTable />);
      expect(screen.getByText('Quarterly Turnover Rates by Category')).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      render(<QuarterlyTurnoverRatesTable title="Custom Title" />);
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<QuarterlyTurnoverRatesTable className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Table Structure', () => {
    beforeEach(() => {
      render(<QuarterlyTurnoverRatesTable />);
    });

    it('should render correct number of rows (4 categories)', () => {
      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');
      const rows = within(tbody).getAllByRole('row');
      expect(rows).toHaveLength(4);
    });

    it('should render all category names', () => {
      expect(screen.getByText('Faculty')).toBeInTheDocument();
      expect(screen.getByText('Staff Exempt')).toBeInTheDocument();
      expect(screen.getByText('Staff Non-Exempt')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('should render Higher Ed. Avg. headers', () => {
      const avgHeaders = screen.getAllByText('Higher Ed. Avg.*');
      expect(avgHeaders).toHaveLength(3); // 3 benchmark columns (FY23, FY24, FY25)
    });

    it('should render Fiscal Year headers', () => {
      // Check for short FY headers (FY23, FY24, FY25)
      expect(screen.getByText('FY23')).toBeInTheDocument();
      expect(screen.getByText('FY24')).toBeInTheDocument();
      expect(screen.getByText('FY25')).toBeInTheDocument();
      // Check for FY26 Annualized header (2 lines max)
      expect(screen.getByText('FY26 Annualized')).toBeInTheDocument();
      expect(screen.getByText('12/31/2025')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    beforeEach(() => {
      render(<QuarterlyTurnoverRatesTable />);
    });

    it('should display benchmark values for each fiscal year', () => {
      const table = screen.getByRole('table');
      // Check FY 2022-23 benchmarks
      expect(table.textContent).toContain('6.7%'); // Faculty benchmark
      expect(table.textContent).toContain('15.1%'); // Staff Exempt benchmark
      expect(table.textContent).toContain('17.3%'); // Staff Non-Exempt benchmark
      expect(table.textContent).toContain('13%'); // Total benchmark (13.0)
    });

    it('should display FY rates for each fiscal year', () => {
      const table = screen.getByRole('table');
      // FY 2023 rates
      expect(table.textContent).toContain('7.9%'); // Faculty FY23
      expect(table.textContent).toContain('15.5%'); // Staff Exempt FY23
      expect(table.textContent).toContain('22.4%'); // Staff Non-Exempt FY23
      expect(table.textContent).toContain('14.9%'); // Total FY23
    });

    it('should display FY26 Annualized rates', () => {
      const table = screen.getByRole('table');
      expect(table.textContent).toContain('2.6%'); // Faculty FY26 Ann.
      expect(table.textContent).toContain('8%'); // Staff Exempt FY26 Ann.
      expect(table.textContent).toContain('17.9%'); // Staff Non-Exempt FY26 Ann.
      expect(table.textContent).toContain('8.7%'); // Total FY26 Ann.
    });
  });

  describe('Color Coding Logic', () => {
    it('should apply green styling to FY values below benchmark', () => {
      const { container } = render(<QuarterlyTurnoverRatesTable />);
      // FY values below their adjacent benchmarks should have green styling
      const greenCells = container.querySelectorAll('.bg-green-100');
      expect(greenCells.length).toBeGreaterThan(0);
    });

    it('should apply red styling to FY values above benchmark', () => {
      const { container } = render(<QuarterlyTurnoverRatesTable />);
      // FY23 Staff Non-Exempt (22.4%) is above benchmark (17.3%), so should have red styling
      // FY23 Total (14.9%) is above benchmark (13.0%), so should have red styling
      const redCells = container.querySelectorAll('.bg-red-100');
      expect(redCells.length).toBeGreaterThan(0);
    });

    it('should apply neutral styling to FY26 Annualized (no benchmark comparison)', () => {
      const { container } = render(<QuarterlyTurnoverRatesTable />);
      // FY26 Annualized column has no adjacent benchmark, should use neutral gray styling
      const neutralCells = container.querySelectorAll('.bg-gray-50.text-gray-700');
      expect(neutralCells.length).toBe(4); // 4 categories
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      render(<QuarterlyTurnoverRatesTable />);
    });

    it('should have proper table role', () => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should have aria-label on table', () => {
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', 'Annual turnover rates by category with CUPA benchmarks comparison table');
    });

    it('should have scope="col" on header cells', () => {
      const headers = screen.getAllByRole('columnheader');
      headers.forEach(header => {
        expect(header).toHaveAttribute('scope', 'col');
      });
    });
  });

  describe('Footer Information', () => {
    it('should display CUPA data source note', () => {
      render(<QuarterlyTurnoverRatesTable />);
      expect(screen.getByText(/higher ed average turnover numbers based on cupa data/i)).toBeInTheDocument();
    });

    it('should display color coding legend', () => {
      render(<QuarterlyTurnoverRatesTable />);
      expect(screen.getByText(/below benchmark/i)).toBeInTheDocument();
      expect(screen.getByText(/above benchmark/i)).toBeInTheDocument();
    });
  });

  describe('PDF Export Attributes', () => {
    it('should have data-pdf-ready attribute', () => {
      const { container } = render(<QuarterlyTurnoverRatesTable />);
      expect(container.querySelector('[data-pdf-ready="true"]')).toBeInTheDocument();
    });

    it('should have data-table-ready attribute on table', () => {
      render(<QuarterlyTurnoverRatesTable />);
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('data-table-ready', 'true');
    });
  });

  describe('Data Validation', () => {
    it('should verify Staff Non-Exempt FY23 is above benchmark (red)', () => {
      // FY23 Staff Non-Exempt: 22.4% vs benchmark 17.3%
      expect(data.rates['FY 2023'].staffNonExempt).toBe(22.4);
      expect(data.benchmarks['2022-23'].staffNonExempt).toBe(17.3);
      expect(data.rates['FY 2023'].staffNonExempt).toBeGreaterThan(data.benchmarks['2022-23'].staffNonExempt);
    });

    it('should verify most FY values are below benchmarks (green)', () => {
      // FY 2024 should be below FY 2023-24 benchmarks for most categories
      expect(data.rates['FY 2024'].faculty).toBeLessThan(data.benchmarks['2023-24'].faculty);
      expect(data.rates['FY 2024'].staffExempt).toBeLessThan(data.benchmarks['2023-24'].staffExempt);
      expect(data.rates['FY 2024'].staffNonExempt).toBeLessThan(data.benchmarks['2023-24'].staffNonExempt);
      expect(data.rates['FY 2024'].total).toBeLessThan(data.benchmarks['2023-24'].total);
    });

    it('should have correct data structure for years', () => {
      expect(data.years).toHaveLength(4);
      expect(data.years[0].fiscalYear).toBe('FY 2023');
      expect(data.years[3].fiscalYear).toBe('FY26 Annualized');
      expect(data.years[3].subLabel).toBe('12/31/2025');
    });
  });
});
