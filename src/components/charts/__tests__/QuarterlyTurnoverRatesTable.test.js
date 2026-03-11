/**
 * QuarterlyTurnoverRatesTable Component Tests
 *
 * Tests for the turnover rates table component that displays
 * turnover rates by category (Faculty, Staff Exempt, Staff Non-Exempt, Total)
 * with corresponding CUPA benchmark comparisons.
 * Q1 view: 6 columns (category + 5 data columns)
 * Q2 view: 8 columns (category + 7 data columns including FY23 and 2022-23 benchmark)
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

  describe('Table Structure (Q1 Default)', () => {
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

    it('should apply red styling to Staff Exempt Q1 FY26 cell (above benchmark)', () => {
      const { container } = render(<QuarterlyTurnoverRatesTable />);
      // Staff Exempt Q1 FY26 (16.5%) is above benchmark (15.0%), verify this specific cell is red
      const redCells = container.querySelectorAll('td.bg-red-100');
      expect(redCells.length).toBeGreaterThan(0);
      // Find the cell containing 16.5% (Staff Exempt Q1 FY26 rate)
      const staffExemptQ1Cell = Array.from(redCells).find(cell =>
        cell.textContent.includes(`${annualRates.q1fy26.staffExempt}%`)
      );
      expect(staffExemptQ1Cell).toBeTruthy();
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

  describe('Q2 FY26 View', () => {
    it('should render 8 column headers (category + 7 data columns)', () => {
      render(<QuarterlyTurnoverRatesTable selectedQuarter="2025-12-31" />);
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(8);
    });

    it('should display Q2-specific column headers', () => {
      render(<QuarterlyTurnoverRatesTable selectedQuarter="2025-12-31" />);
      expect(screen.getByRole('columnheader', { name: /CUPA benchmark rate 2022-23/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /FY 2023 turnover rate/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /CUPA benchmark rate 2023-24/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /FY 2024 turnover rate/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /CUPA benchmark rate 2024-25/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /FY 2025 turnover rate/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /FY26 Annualized turnover rate/i })).toBeInTheDocument();
    });

    it('should display Q2 FY26 rate values', () => {
      render(<QuarterlyTurnoverRatesTable selectedQuarter="2025-12-31" />);
      const table = screen.getByRole('table');
      expect(table.textContent).toContain('2.6%');
      expect(table.textContent).toContain('8%');
      expect(table.textContent).toContain('17.9%');
      expect(table.textContent).toContain('8.7%');
    });

    it('should display FY 2023 values', () => {
      render(<QuarterlyTurnoverRatesTable selectedQuarter="2025-12-31" />);
      const table = screen.getByRole('table');
      expect(table.textContent).toContain('7.9%');
      expect(table.textContent).toContain('15.5%');
      expect(table.textContent).toContain('22.4%');
      expect(table.textContent).toContain('14.9%');
    });

    it('should display 2022-23 benchmark values', () => {
      render(<QuarterlyTurnoverRatesTable selectedQuarter="2025-12-31" />);
      const table = screen.getByRole('table');
      expect(table.textContent).toContain('6.7%');
      expect(table.textContent).toContain('15.1%');
      expect(table.textContent).toContain('17.3%');
      expect(table.textContent).toContain('13%');
    });

    it('should apply red styling to FY23 Staff Non-Exempt (22.4% > 17.3% benchmark)', () => {
      const { container } = render(<QuarterlyTurnoverRatesTable selectedQuarter="2025-12-31" />);
      const redCells = container.querySelectorAll('td.bg-red-100');
      const fy23StaffNonExemptCell = Array.from(redCells).find(cell =>
        cell.textContent.includes('22.4%')
      );
      expect(fy23StaffNonExemptCell).toBeTruthy();
    });

    it('should apply red styling to FY23 Total (14.9% > 13.0% benchmark)', () => {
      const { container } = render(<QuarterlyTurnoverRatesTable selectedQuarter="2025-12-31" />);
      const redCells = container.querySelectorAll('td.bg-red-100');
      const fy23TotalCell = Array.from(redCells).find(cell =>
        cell.textContent.includes('14.9%')
      );
      expect(fy23TotalCell).toBeTruthy();
    });

    it('should apply green styling to all Q2 FY26 rate cells (all below benchmark)', () => {
      const { container } = render(<QuarterlyTurnoverRatesTable selectedQuarter="2025-12-31" />);
      const greenCells = container.querySelectorAll('td.bg-green-100');
      const q2Values = ['2.6%', '8%', '17.9%', '8.7%'];
      q2Values.forEach(val => {
        const cell = Array.from(greenCells).find(cell => cell.textContent.includes(val));
        expect(cell).toBeTruthy();
      });
    });

    it('should show Q2 footer note', () => {
      render(<QuarterlyTurnoverRatesTable selectedQuarter="2025-12-31" />);
      expect(screen.getByText(/FY26 Annualized as of 12\/31\/2025/)).toBeInTheDocument();
    });

    it('should use wider min-width for Q2 table', () => {
      render(<QuarterlyTurnoverRatesTable selectedQuarter="2025-12-31" />);
      const table = screen.getByRole('table');
      expect(table).toHaveClass('min-w-[1100px]');
    });
  });
});
