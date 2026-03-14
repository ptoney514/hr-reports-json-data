/**
 * QuarterlyTurnoverRatesTable Component Tests
 *
 * Tests for the turnover rates table component that displays
 * turnover rates by category (Faculty, Staff Exempt, Staff Non-Exempt, Total)
 * with corresponding CUPA benchmark comparisons.
 * Q1 view: 6 columns (category + Benchmark* + Q2 FY25 + Q3 FY25 + Q4 FY25 + Q1 FY26)
 * Q2 view: two-row header with 8 first-row columns (category + 7 data columns)
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

    it('should render correct number of columns (6: category + Benchmark + 4 quarterly)', () => {
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(6);
    });

    it('should have correct header labels', () => {
      expect(screen.getByText('Turnover Category')).toBeInTheDocument();
      expect(screen.getByText('Benchmark*')).toBeInTheDocument();
      expect(screen.getByText('Q2 FY25')).toBeInTheDocument();
      expect(screen.getByText('Q3 FY25')).toBeInTheDocument();
      expect(screen.getByText('Q4 FY25')).toBeInTheDocument();
      expect(screen.getByText('Q1 FY26')).toBeInTheDocument();
    });

    it('should render all category names', () => {
      expect(screen.getByText('Faculty')).toBeInTheDocument();
      expect(screen.getByText('Staff Exempt')).toBeInTheDocument();
      expect(screen.getByText('Staff Non-Exempt')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });
  });

  describe('Data Display (Q1)', () => {
    beforeEach(() => {
      render(<QuarterlyTurnoverRatesTable />);
    });

    it('should display 2024-25 benchmark values', () => {
      const table = screen.getByRole('table');
      expect(table.textContent).toContain(`${benchmarks.fy2425.faculty}%`);
      expect(table.textContent).toContain(`${benchmarks.fy2425.staffExempt}%`);
      expect(table.textContent).toContain(`${benchmarks.fy2425.staffNonExempt}%`);
      expect(table.textContent).toContain(`${benchmarks.fy2425.total}%`);
    });

    it('should display Q2 FY25 rates', () => {
      const table = screen.getByRole('table');
      expect(table.textContent).toContain(`${annualRates.q2fy25.faculty}%`);
      expect(table.textContent).toContain(`${annualRates.q2fy25.total}%`);
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
      const greenCells = container.querySelectorAll('.bg-green-100');
      expect(greenCells.length).toBeGreaterThan(0);
    });

    it('should apply red styling to values above benchmark', () => {
      const { container } = render(<QuarterlyTurnoverRatesTable />);
      const redCells = container.querySelectorAll('.bg-red-100');
      expect(redCells.length).toBeGreaterThan(0);
    });

    it('should apply red styling to Staff Exempt Q1 FY26 cell (above benchmark)', () => {
      const { container } = render(<QuarterlyTurnoverRatesTable />);
      const redCells = container.querySelectorAll('td.bg-red-100');
      expect(redCells.length).toBeGreaterThan(0);
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
      expect(table).toHaveAttribute('aria-label', 'Turnover rates by category comparison table');
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
    it('should render two-row header with 15 total column headers', () => {
      render(<QuarterlyTurnoverRatesTable selectedQuarter="2025-12-31" />);
      const headers = screen.getAllByRole('columnheader');
      // Row 1: Turnover Category (rowSpan=2) + 7 data cols = 8
      // Row 2: 7 sublabel cols
      expect(headers).toHaveLength(15);
    });

    it('should display Q2-specific column headers', () => {
      render(<QuarterlyTurnoverRatesTable selectedQuarter="2025-12-31" />);
      expect(screen.getByText('Turnover Category')).toBeInTheDocument();
      expect(screen.getByText('FY23')).toBeInTheDocument();
      expect(screen.getByText('FY24')).toBeInTheDocument();
      expect(screen.getByText('FY25')).toBeInTheDocument();
      expect(screen.getByText('FY26 Annualized')).toBeInTheDocument();
    });

    it('should display HE Avg benchmark headers with sublabels', () => {
      render(<QuarterlyTurnoverRatesTable selectedQuarter="2025-12-31" />);
      // 3 HE Avg* headers in first row
      const heAvgHeaders = screen.getAllByText('HE Avg*');
      expect(heAvgHeaders).toHaveLength(3);
      // Sublabels in second row
      expect(screen.getByText('2022-23')).toBeInTheDocument();
      expect(screen.getByText('2023-24')).toBeInTheDocument();
      expect(screen.getByText('2024-25')).toBeInTheDocument();
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

    it('should have separator border on FY26 Annualized column', () => {
      const { container } = render(<QuarterlyTurnoverRatesTable selectedQuarter="2025-12-31" />);
      const separatorCells = container.querySelectorAll('.border-l-2.border-blue-200');
      // 4 body rows should each have the separator on the last column
      expect(separatorCells.length).toBe(4);
    });
  });
});
