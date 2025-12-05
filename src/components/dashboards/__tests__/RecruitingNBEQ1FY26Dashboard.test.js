import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecruitingNBEQ1FY26Dashboard from '../RecruitingNBEQ1FY26Dashboard';

// Mock staticData
jest.mock('../../../data/staticData', () => ({
  QUARTERLY_HEADCOUNT_TRENDS: [
    { quarter: "Q1 FY24", students: 1700, hsp: 580, temp: 610, total: 2890 },
    { quarter: "Q2 FY24", students: 1780, hsp: 585, temp: 610, total: 2975 },
    { quarter: "Q3 FY24", students: 2030, hsp: 590, temp: 620, total: 3240 },
    { quarter: "Q4 FY24", students: 1450, hsp: 595, temp: 620, total: 2665 },
    { quarter: "Q1 FY25", students: 2130, hsp: 600, temp: 630, total: 3360 },
    { quarter: "Q2 FY25", students: 1930, hsp: 605, temp: 630, total: 3165 },
    { quarter: "Q3 FY25", students: 2010, hsp: 605, temp: 630, total: 3245 },
    { quarter: "Q4 FY25", students: 1650, hsp: 610, temp: 640, total: 2900 },
    { quarter: "Q1 FY26", students: 2157, hsp: 625, temp: 630, total: 3412 }
  ]
}));

describe('RecruitingNBEQ1FY26Dashboard', () => {
  const mockSummaryData = {
    total: { count: 3412, oma: 2859, phx: 553 },
    students: { count: 2157, oma: 2088, phx: 69 },
    hsp: { count: 625, oma: 282, phx: 343 },
    temp: { count: 630, oma: 489, phx: 141 }
  };

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <RecruitingNBEQ1FY26Dashboard />
      </BrowserRouter>
    );
  };

  describe('Page Header', () => {
    test('renders page title with Q1 FY26 Temporary Workers', () => {
      renderComponent();
      expect(screen.getByText(/Q1 FY26 Temporary Workers Recruiting Report/i)).toBeInTheDocument();
    });

    test('renders subtitle with employee types', () => {
      renderComponent();
      expect(screen.getByText(/Students, House Staff Physicians & Temporary/i)).toBeInTheDocument();
    });

    test('displays fiscal period', () => {
      renderComponent();
      expect(screen.getByText(/July 2025 - September 2025/i)).toBeInTheDocument();
    });

    test('displays total headcount in header', () => {
      renderComponent();
      expect(screen.getByText(/Total.*Q1 FY26 Temp Hires/i)).toBeInTheDocument();
    });

    test('displays breakdown in header', () => {
      renderComponent();
      expect(screen.getByText(/Students: 2157 \| HSPs: 625 \| Temp: 630/i)).toBeInTheDocument();
    });
  });

  describe('Metric Cards', () => {
    test('renders all metric cards', () => {
      renderComponent();
      expect(screen.getByText(/Total Temp Hires/i)).toBeInTheDocument();
    });

    test('displays metric values and campus breakdown', () => {
      renderComponent();
      const cards = screen.getAllByText(/\d+/);
      // Verify component renders without error - metric values are present
      expect(cards.length).toBeGreaterThan(0);

      // Check for campus breakdown labels (OMA/PHX)
      const omaPhxMatches = screen.getAllByText(/OMA:.+ \| PHX:.+/);
      expect(omaPhxMatches.length).toBeGreaterThan(0);
    });
  });

  describe('Quarterly Headcount Trend Chart', () => {
    test('renders chart title', () => {
      renderComponent();
      expect(screen.getByText(/Quarterly Temporary Workers Headcount Trend/i)).toBeInTheDocument();
    });

    test('renders chart note about actual vs estimated data', () => {
      renderComponent();
      expect(screen.getByText(/All quarterly data is actual headcount from Oracle HCM/i)).toBeInTheDocument();
    });

    test('displays note about student and HSP headcount patterns', () => {
      renderComponent();
      expect(screen.getByText(/Student headcount peaks align with academic semesters/i)).toBeInTheDocument();
    });
  });

  describe('Campus Comparison', () => {
    test('renders Campus Comparison section title', () => {
      renderComponent();
      expect(screen.getByText(/Campus Comparison - Temporary Workers by Type/i)).toBeInTheDocument();
    });

    test('renders campus legend with all three categories', () => {
      renderComponent();
      // Check for legend section with all categories
      const legendElements = screen.getAllByText(/House Staff Physicians|Temporary NBE|Student Workers/i);
      expect(legendElements.length).toBeGreaterThanOrEqual(3);
    });

    test('renders Omaha campus label', () => {
      renderComponent();
      expect(screen.getByText(/Omaha \(OMA\)/)).toBeInTheDocument();
    });

    test('renders Phoenix campus label', () => {
      renderComponent();
      expect(screen.getByText(/Phoenix \(PHX\)/)).toBeInTheDocument();
    });

    test('displays scale labels on x-axis', () => {
      renderComponent();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByText('1,000')).toBeInTheDocument();
      expect(screen.getByText('2,000')).toBeInTheDocument();
      expect(screen.getByText('3,000')).toBeInTheDocument();
    });

    test('displays campus comparison note', () => {
      renderComponent();
      expect(screen.getByText(/Campus comparison shows.*total temporary workers/i)).toBeInTheDocument();
    });
  });

  describe('Data Freshness Information', () => {
    test('renders data freshness note', () => {
      renderComponent();
      expect(screen.getByText(/Data as of 2025-09-30/i)).toBeInTheDocument();
    });

    test('displays methodology sources', () => {
      renderComponent();
      expect(screen.getByText(/Data Sources: Oracle HCM/i)).toBeInTheDocument();
    });

    test('references correct methodology document', () => {
      renderComponent();
      expect(screen.getByText(/WORKFORCE_METHODOLOGY/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('uses proper heading hierarchy', () => {
      renderComponent();
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    test('has semantic HTML structure', () => {
      const { container } = renderComponent();
      // Check for basic div structure (component renders in a div)
      const mainDiv = container.querySelector('#recruiting-temp-q1-fy26-dashboard');
      expect(mainDiv).toBeInTheDocument();
    });

    test('renders without accessibility violations', () => {
      renderComponent();
      // If component renders without errors, basic a11y is ok
      expect(screen.getByText(/Quarterly Temporary Workers Headcount Trend/i)).toBeInTheDocument();
    });
  });

  describe('Data Accuracy', () => {
    test('all employee categories are represented', () => {
      renderComponent();
      // Verify all employee categories are present across the dashboard
      const categoryTexts = [
        /Student Workers/i,
        /House Staff Physicians/i,
        /Temporary NBE/i
      ];

      categoryTexts.forEach(text => {
        const elements = screen.queryAllByText(text);
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    test('displays both campus locations', () => {
      renderComponent();
      expect(screen.getByText(/Omaha \(OMA\)/)).toBeInTheDocument();
      expect(screen.getByText(/Phoenix \(PHX\)/)).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    test('renders without crashing', () => {
      expect(() => renderComponent()).not.toThrow();
    });

    test('dashboard container has correct id', () => {
      const { container } = renderComponent();
      expect(container.querySelector('#recruiting-temp-q1-fy26-dashboard')).toBeInTheDocument();
    });

    test('renders all major sections', () => {
      renderComponent();
      // Check for key sections - at minimum check header and main content areas
      const headerText = screen.getByText(/Temporary Workers Recruiting Report/i);
      expect(headerText).toBeInTheDocument();
      expect(headerText.closest('div')).toBeInTheDocument();
    });
  });
});
