import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DemographicsQ1FY26Dashboard from '../DemographicsQ1FY26Dashboard';

// Mock staticData
jest.mock('../../../data/staticData', () => ({
  getQuarterlyWorkforceData: (date) => ({
    quarter: 'Q1 FY26',
    fiscalPeriod: 'July 2025 - September 2025',
    summary: {
      total: { count: 2149, oma: 2048, phx: 101 },
      faculty: { count: 698, oma: 688, phx: 10 },
      staff: { count: 1451, oma: 1360, phx: 91 }
    },
    demographics: {
      ethnicity: {
        faculty: {
          total: 697,
          distribution: [
            { ethnicity: 'White', count: 543, percentage: 77.9, color: '#60A5FA' },
            { ethnicity: 'Asian', count: 51, percentage: 7.3, color: '#3B82F6' },
            { ethnicity: 'Not Disclosed', count: 53, percentage: 7.6, color: '#9CA3AF' }
          ]
        },
        staff: {
          total: 1431,
          distribution: [
            { ethnicity: 'White', count: 989, percentage: 69.1, color: '#60A5FA' },
            { ethnicity: 'Asian', count: 106, percentage: 7.4, color: '#3B82F6' },
            { ethnicity: 'Not Disclosed', count: 126, percentage: 8.8, color: '#9CA3AF' }
          ]
        }
      },
      ageGender: {
        faculty: {
          total: 697,
          femalePercentage: 52.9,
          malePercentage: 47.1,
          ageGenderBreakdown: [
            { ageBand: '20-30', female: 5, male: 3 },
            { ageBand: '31-40', female: 91, male: 52 },
            { ageBand: '41-50', female: 128, male: 74 },
            { ageBand: '51-60', female: 81, male: 82 },
            { ageBand: '61 Plus', female: 67, male: 112 }
          ]
        },
        staff: {
          total: 1431,
          femalePercentage: 63.1,
          malePercentage: 36.9,
          ageGenderBreakdown: [
            { ageBand: '20-30', female: 146, male: 81 },
            { ageBand: '31-40', female: 174, male: 121 },
            { ageBand: '41-50', female: 214, male: 115 },
            { ageBand: '51-60', female: 230, male: 116 },
            { ageBand: '61 Plus', female: 139, male: 95 }
          ]
        }
      }
    }
  })
}));

describe('DemographicsQ1FY26Dashboard', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <DemographicsQ1FY26Dashboard />
      </BrowserRouter>
    );
  };

  describe('Page Header', () => {
    test('renders page title with Demographics', () => {
      renderComponent();
      expect(screen.getByText(/Q1 FY26 Workforce Demographics Report/i)).toBeInTheDocument();
    });

    test('renders subtitle with timeframe', () => {
      renderComponent();
      expect(screen.getByText(/Ethnicity and age\/gender distribution/i)).toBeInTheDocument();
    });

    test('displays fiscal period', () => {
      renderComponent();
      expect(screen.getByText(/July 2025 - September 2025/i)).toBeInTheDocument();
    });

    test('displays benefit eligible employee count in header', () => {
      renderComponent();
      expect(screen.getByText(/Benefit Eligible Employees/i)).toBeInTheDocument();
    });
  });

  describe('Ethnicity Distribution Charts', () => {
    test('renders ethnicity distribution title', () => {
      renderComponent();
      expect(screen.getByText(/Ethnicity Distribution for Benefit Eligible Faculty/i)).toBeInTheDocument();
    });

    test('displays faculty ethnicity chart', () => {
      renderComponent();
      expect(screen.getByText(/Ethnicity Distribution for Benefit Eligible Faculty/i)).toBeInTheDocument();
    });

    test('displays staff ethnicity chart', () => {
      renderComponent();
      expect(screen.getByText(/Ethnicity Distribution for Benefit Eligible Staff/i)).toBeInTheDocument();
    });

    test('shows faculty total in ethnicity chart', () => {
      renderComponent();
      const facultyTotals = screen.getAllByText('697');
      expect(facultyTotals.length).toBeGreaterThan(0);
    });
  });

  describe('Age/Gender Distribution', () => {
    test('renders age/gender distribution title', () => {
      renderComponent();
      expect(screen.getByText(/Age\/Gender Distribution/i)).toBeInTheDocument();
    });

    test('displays faculty age/gender section', () => {
      renderComponent();
      const facultySections = screen.getAllByText(/Faculty.*total/i);
      expect(facultySections.length).toBeGreaterThan(0);
    });

    test('displays staff age/gender section', () => {
      renderComponent();
      const staffSections = screen.getAllByText(/Staff.*total/i);
      expect(staffSections.length).toBeGreaterThan(0);
    });

    test('shows gender percentages for faculty', () => {
      renderComponent();
      expect(screen.getByText(/52.9% Female/i)).toBeInTheDocument();
    });

    test('shows gender percentages for staff', () => {
      renderComponent();
      expect(screen.getByText(/63.1% Female/i)).toBeInTheDocument();
    });
  });

  describe('Data Information Section', () => {
    test('renders data information section', () => {
      renderComponent();
      expect(screen.getByText(/Data Information/i)).toBeInTheDocument();
    });

    test('displays data freshness date', () => {
      renderComponent();
      expect(screen.getByText(/2025-09-30/i)).toBeInTheDocument();
    });

    test('displays data source', () => {
      renderComponent();
      expect(screen.getByText(/Oracle HCM/i)).toBeInTheDocument();
    });

    test('references methodology document', () => {
      renderComponent();
      expect(screen.getByText(/WORKFORCE_METHODOLOGY/i)).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    test('renders without crashing', () => {
      expect(() => renderComponent()).not.toThrow();
    });

    test('dashboard container has correct id', () => {
      const { container } = renderComponent();
      expect(container.querySelector('#demographics-q1-fy26-dashboard')).toBeInTheDocument();
    });

    test('renders with proper heading hierarchy', () => {
      renderComponent();
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});
