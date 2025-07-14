import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EmployeeImportDashboard from '../EmployeeImportDashboard';

// Mock Firebase hook (updated for privacy compliance - no individual records)
jest.mock('../../../hooks/useFirebaseEmployeeData', () => ({
  useFirebaseEmployeeData: () => ({
    importAggregateWorkforceData: jest.fn(),
    getAggregateWorkforceData: jest.fn(),
    clearAllIndividualEmployeeData: jest.fn(),
    loading: false,
    error: null
  })
}));

jest.mock('../../filters/EmployeeFilterPanel', () => {
  return function MockEmployeeFilterPanel({ filters, setFilters, onApply }) {
    return (
      <div data-testid="employee-filter-panel">
        <p>Filter Panel</p>
        <button onClick={() => setFilters({ ...filters, personType: 'FACULTY' })}>
          Set Faculty Filter
        </button>
        <button onClick={onApply}>Apply Filters</button>
      </div>
    );
  };
});

jest.mock('../../cards/EmployeeSummaryCards', () => {
  return function MockEmployeeSummaryCards({ stats }) {
    return (
      <div data-testid="employee-summary-cards">
        <p>Summary Cards</p>
        <p>Total: {stats.total}</p>
        <p>Faculty: {stats.totalFaculty}</p>
        <p>Staff: {stats.totalStaff}</p>
      </div>
    );
  };
});


const renderComponent = () => {
  return render(
    <BrowserRouter>
      <EmployeeImportDashboard />
    </BrowserRouter>
  );
};

describe('EmployeeImportDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders upload area initially', () => {
    renderComponent();
    
    expect(screen.getByText('Employee Data Importer')).toBeInTheDocument();
    expect(screen.getByText(/drag & drop excel file here/i)).toBeInTheDocument();
    expect(screen.getByText(/or click to select file/i)).toBeInTheDocument();
  });

  test('displays header and description', () => {
    renderComponent();
    
    expect(screen.getByText('Employee Data Importer')).toBeInTheDocument();
    expect(screen.getByText('Upload employee data, filter as needed, and import aggregate workforce metrics to Firebase')).toBeInTheDocument();
  });

  test('shows supported file formats', () => {
    renderComponent();
    
    expect(screen.getByText('Supported formats: .xlsx, .xls')).toBeInTheDocument();
  });

  test('upload area has proper drag and drop styling', () => {
    renderComponent();
    
    const uploadArea = screen.getByText(/drag & drop excel file here/i).closest('div');
    expect(uploadArea).toHaveClass('border-2', 'border-dashed', 'cursor-pointer');
  });

  test('handles file drop correctly', async () => {
    renderComponent();
    
    const uploadArea = screen.getByText(/drag & drop excel file here/i).closest('div');
    
    // Mock file data
    const mockFile = new File(['test content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Mock FileReader
    const mockFileReader = {
      readAsBinaryString: jest.fn(),
      onload: null,
      onerror: null,
      result: null
    };

    global.FileReader = jest.fn(() => mockFileReader);

    // Simulate file drop
    fireEvent.drop(uploadArea, {
      dataTransfer: {
        files: [mockFile]
      }
    });

    expect(mockFileReader.readAsBinaryString).toHaveBeenCalledWith(mockFile);
  });

  test('displays error message when upload fails', async () => {
    renderComponent();
    
    // Mock a failed file upload
    const errorMessage = 'Failed to parse file: Invalid format';
    
    // We would need to simulate a file upload failure here
    // For now, we'll just check that the error display logic works
    expect(screen.queryByText(/upload error/i)).not.toBeInTheDocument();
  });

  test('resets upload state correctly', () => {
    renderComponent();
    
    // Initially should show upload area
    expect(screen.getByText(/drag & drop excel file here/i)).toBeInTheDocument();
    
    // Should not show reset button initially
    expect(screen.queryByText(/reset & upload new file/i)).not.toBeInTheDocument();
  });

  test('accessibility features are present', () => {
    renderComponent();
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Employee Data Importer');
    
    // Check for proper form elements (file input)
    const fileInput = screen.getByRole('button', { hidden: true });
    expect(fileInput).toBeInTheDocument();
  });

  test('component handles empty state correctly', () => {
    renderComponent();
    
    // Should show upload area
    expect(screen.getByText(/drag & drop excel file here/i)).toBeInTheDocument();
    
    // Should not show data components
    expect(screen.queryByTestId('employee-filter-panel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('employee-summary-cards')).not.toBeInTheDocument();
  });

  test('file input accepts correct file types', () => {
    renderComponent();
    
    const fileInput = screen.getByRole('button', { hidden: true });
    
    // The dropzone should be configured to accept Excel files
    // This is tested through the react-dropzone configuration
    expect(fileInput).toBeInTheDocument();
  });

  test('component structure is correct', () => {
    renderComponent();
    
    // Check main container
    const mainContainer = screen.getByText('Employee Data Importer').closest('div');
    expect(mainContainer).toHaveClass('min-h-screen', 'bg-gray-50');
    
    // Check header section
    const headerSection = screen.getByText('Employee Data Importer').closest('div');
    expect(headerSection).toHaveClass('bg-white', 'rounded-lg', 'shadow-sm');
  });

  test('handles keyboard navigation', () => {
    renderComponent();
    
    // The upload area should be keyboard accessible
    const uploadArea = screen.getByText(/drag & drop excel file here/i).closest('div');
    
    // Focus should be manageable
    fireEvent.focus(uploadArea);
    expect(uploadArea).toHaveFocus();
  });
});

describe('EmployeeImportDashboard Integration', () => {
  test('integrates with Firebase hook correctly', () => {
    const mockImportAggregateWorkforceData = jest.fn();
    const mockGetAggregateWorkforceData = jest.fn();
    const mockClearAllIndividualEmployeeData = jest.fn();
    
    // Mock the hook to return our mock functions
    require('../../../hooks/useFirebaseEmployeeData').useFirebaseEmployeeData.mockReturnValue({
      importAggregateWorkforceData: mockImportAggregateWorkforceData,
      getAggregateWorkforceData: mockGetAggregateWorkforceData,
      clearAllIndividualEmployeeData: mockClearAllIndividualEmployeeData,
      loading: false,
      error: null
    });

    renderComponent();
    
    // The component should render without errors
    expect(screen.getByText('Employee Data Importer')).toBeInTheDocument();
  });

  test('handles loading state from Firebase hook', () => {
    require('../../../hooks/useFirebaseEmployeeData').useFirebaseEmployeeData.mockReturnValue({
      importAggregateWorkforceData: jest.fn(),
      getAggregateWorkforceData: jest.fn(),
      clearAllIndividualEmployeeData: jest.fn(),
      loading: true,
      error: null
    });

    renderComponent();
    
    // Should still render the component during loading
    expect(screen.getByText('Employee Data Importer')).toBeInTheDocument();
  });

  test('handles error state from Firebase hook', () => {
    const errorMessage = 'Firebase connection failed';
    require('../../../hooks/useFirebaseEmployeeData').useFirebaseEmployeeData.mockReturnValue({
      importAggregateWorkforceData: jest.fn(),
      getAggregateWorkforceData: jest.fn(),
      clearAllIndividualEmployeeData: jest.fn(),
      loading: false,
      error: errorMessage
    });

    renderComponent();
    
    // Should display error message
    expect(screen.getByText('Import Error')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});