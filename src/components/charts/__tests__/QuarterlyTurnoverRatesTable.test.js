/**
 * QuarterlyTurnoverRatesTable Component Tests
 *
 * Tests for the quarterly turnover rates table component that displays
 * turnover rates by category (Faculty, Staff Exempt, Staff Non-Exempt, Total)
 * across 4 quarters with benchmark comparison.
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import QuarterlyTurnoverRatesTable from '../QuarterlyTurnoverRatesTable';
import { getQuarterlyTurnoverRatesByCategory } from '../../../data/staticData';

// Get actual data for validation
const { rates, benchmarks } = getQuarterlyTurnoverRatesByCategory();

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

    it('should render correct number of columns (6: category + benchmark + 4 quarters)', () => {
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(6);
    });

    it('should have correct header labels', () => {
      expect(screen.getByRole('columnheader', { name: /employee category/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /benchmark/i })).toBeInTheDocument();
    });

    it('should render all 4 quarter headers', () => {
      rates.forEach(q => {
        expect(screen.getByRole('columnheader', { name: new RegExp(q.quarter, 'i') })).toBeInTheDocument();
      });
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

    it('should display benchmark values in benchmark column', () => {
      // Find all benchmark values - they should be present in the table
      // Note: Some values may appear multiple times due to matching rates
      const table = screen.getByRole('table');
      expect(table.textContent).toContain(`${benchmarks.faculty}%`);
      expect(table.textContent).toContain(`${benchmarks.staffExempt}%`);
      expect(table.textContent).toContain(`${benchmarks.staffNonExempt}%`);
      expect(table.textContent).toContain(`${benchmarks.total}%`);
    });

    it('should display rates from each quarter', () => {
      const table = screen.getByRole('table');
      // Check that all quarters have their rates displayed
      rates.forEach(quarter => {
        expect(table.textContent).toContain(`${quarter.faculty.rate}%`);
        expect(table.textContent).toContain(`${quarter.total.rate}%`);
      });
    });
  });

  describe('Color Coding Logic', () => {
    it('should apply green styling to values below benchmark', () => {
      const { container } = render(<QuarterlyTurnoverRatesTable />);
      // Faculty rates are typically below benchmark (8.7%), so they should have green styling
      const greenCells = container.querySelectorAll('.bg-green-100');
      expect(greenCells.length).toBeGreaterThan(0);
    });

    it('should apply red styling to values above benchmark', () => {
      const { container } = render(<QuarterlyTurnoverRatesTable />);
      // Staff Exempt Q1 FY26 (16.5%) is above benchmark (15.0%), so should have red styling
      const redCells = container.querySelectorAll('.bg-red-100');
      expect(redCells.length).toBeGreaterThan(0);
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
      expect(table).toHaveAttribute('aria-label', 'Quarterly turnover rates by category comparison table');
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
