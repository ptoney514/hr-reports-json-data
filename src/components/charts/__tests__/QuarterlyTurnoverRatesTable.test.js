/**
 * QuarterlyTurnoverRatesTable Component Tests
 *
 * Tests for the turnover rates table component that displays
 * turnover rates by category (Faculty, Staff Exempt, Staff Non-Exempt, Total)
 * for FY 2024, FY 2025, and Q1 FY26 with corresponding CUPA benchmark comparisons.
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import QuarterlyTurnoverRatesTable from '../QuarterlyTurnoverRatesTable';
import { getAnnualTurnoverRatesByCategory } from '../../../data/staticData';

// Get actual data for validation
const { annualRates, benchmarks } = getAnnualTurnoverRatesByCategory();

describe('QuarterlyTurnoverRatesTable Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<QuarterlyTurnoverRatesTable />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should render with default title', () => {
      render(<QuarterlyTurnoverRatesTable />);
      expect(screen.getByText('Turnover Rates by Category')).toBeInTheDocument();
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

    it('should render correct number of columns (6: category + 2 benchmarks + 3 rate periods)', () => {
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(6);
    });

    it('should have correct header labels', () => {
      expect(screen.getByRole('columnheader', { name: /employee category/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /CUPA benchmark rate 2023-24/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /FY 2024 turnover rate/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /CUPA benchmark rate 2024-25/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /FY 2025 turnover rate/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /Q1 FY26 turnover rate/i })).toBeInTheDocument();
    });

    it('should render period headers from data', () => {
      expect(screen.getByText('FY 2024')).toBeInTheDocument();
      expect(screen.getByText('FY 2025')).toBeInTheDocument();
      expect(screen.getByText('Q1 FY26')).toBeInTheDocument();
    });

    it('should render all category names', () => {
      expect(screen.getByText('Faculty')).toBeInTheDocument();
      expect(screen.getByText('Staff Exempt')).toBeInTheDocument();
      expect(screen.getByText('Staff Non-Exempt')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    beforeEach(() => {
      render(<QuarterlyTurnoverRatesTable />);
    });

    it('should display 2023-24 benchmark values', () => {
      const table = screen.getByRole('table');
      expect(table.textContent).toContain(`${benchmarks.fy2324.faculty}%`);
      expect(table.textContent).toContain(`${benchmarks.fy2324.staffExempt}%`);
      expect(table.textContent).toContain(`${benchmarks.fy2324.staffNonExempt}%`);
      expect(table.textContent).toContain(`${benchmarks.fy2324.total}%`);
    });

    it('should display 2024-25 benchmark values', () => {
      const table = screen.getByRole('table');
      expect(table.textContent).toContain(`${benchmarks.fy2425.faculty}%`);
      expect(table.textContent).toContain(`${benchmarks.fy2425.staffExempt}%`);
      expect(table.textContent).toContain(`${benchmarks.fy2425.staffNonExempt}%`);
      expect(table.textContent).toContain(`${benchmarks.fy2425.total}%`);
    });

    it('should display FY 2024 rates', () => {
      const table = screen.getByRole('table');
      expect(table.textContent).toContain(`${annualRates.fy2024.faculty}%`);
      expect(table.textContent).toContain(`${annualRates.fy2024.total}%`);
    });

    it('should display FY 2025 rates', () => {
      const table = screen.getByRole('table');
      expect(table.textContent).toContain(`${annualRates.fy2025.faculty}%`);
      expect(table.textContent).toContain(`${annualRates.fy2025.total}%`);
    });

    it('should display Q1 FY26 rates', () => {
      const table = screen.getByRole('table');
      expect(table.textContent).toContain(`${annualRates.q1fy26.faculty}%`);
      expect(table.textContent).toContain(`${annualRates.q1fy26.total}%`);
    });
  });

  describe('Color Coding Logic', () => {
    it('should apply green styling to values below benchmark', () => {
      const { container } = render(<QuarterlyTurnoverRatesTable />);
      // FY 2024 and FY 2025 rates are below benchmarks, so should have green styling
      const greenCells = container.querySelectorAll('.bg-green-100');
      expect(greenCells.length).toBeGreaterThan(0);
    });

    it('should apply red styling to values above benchmark', () => {
      const { container } = render(<QuarterlyTurnoverRatesTable />);
      // Staff Exempt Q1 FY26 (16.5%) is above benchmark (15.0%), so should have red styling
      const redCells = container.querySelectorAll('.bg-red-100');
      expect(redCells.length).toBeGreaterThan(0);
    });

    it('should have exactly 1 red table cell for Staff Exempt Q1 FY26', () => {
      const { container } = render(<QuarterlyTurnoverRatesTable />);
      // Only Staff Exempt Q1 FY26 (16.5%) should be red (above 15.0% benchmark)
      const redCells = container.querySelectorAll('td.bg-red-100');
      expect(redCells).toHaveLength(1);
      expect(redCells[0].textContent).toContain('16.5%');
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
      expect(table).toHaveAttribute('aria-label', 'Annual turnover rates by category comparison table');
    });

    it('should have scope="col" on header cells', () => {
      const headers = screen.getAllByRole('columnheader');
      headers.forEach(header => {
        expect(header).toHaveAttribute('scope', 'col');
      });
    });
  });

  describe('Footer Information', () => {
    it('should display benchmark source note', () => {
      render(<QuarterlyTurnoverRatesTable />);
      expect(screen.getByText(/benchmark based on cupa/i)).toBeInTheDocument();
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
});
