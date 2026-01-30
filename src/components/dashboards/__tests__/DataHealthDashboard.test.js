/**
 * DataHealthDashboard Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataHealthDashboard from '../DataHealthDashboard';

// Mock dependencies
jest.mock('../../../hooks/useHRData', () => ({
  useDataSourceHealth: jest.fn(),
  useDataSourceInfo: jest.fn()
}));

jest.mock('../../../services/dataComparisonService', () => ({
  validateAllEndpoints: jest.fn(),
  checkCriticalParity: jest.fn(),
  generateComparisonReport: jest.fn()
}));

const { useDataSourceHealth, useDataSourceInfo } = require('../../../hooks/useHRData');
const { validateAllEndpoints, checkCriticalParity } = require('../../../services/dataComparisonService');

describe('DataHealthDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    useDataSourceHealth.mockReturnValue({
      health: { status: 'ok', source: 'json' },
      loading: false
    });
    useDataSourceInfo.mockReturnValue({
      source: 'json',
      apiUrl: '/api',
      isApiEnabled: false
    });
  });

  it('renders the dashboard header', () => {
    render(<DataHealthDashboard />);

    expect(screen.getByText('Data Health Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Monitor data source status/)).toBeInTheDocument();
  });

  it('displays data source status section', () => {
    render(<DataHealthDashboard />);

    expect(screen.getByText('Data Source Status')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
  });

  it('shows validation summary section', () => {
    render(<DataHealthDashboard />);

    expect(screen.getByText('Validation Summary')).toBeInTheDocument();
    expect(screen.getByText('Run validation to see results')).toBeInTheDocument();
  });

  it('displays run validation button', () => {
    render(<DataHealthDashboard />);

    expect(screen.getByRole('button', { name: /Run Validation/i })).toBeInTheDocument();
  });

  it('runs validation when button is clicked', async () => {
    validateAllEndpoints.mockResolvedValue({
      allMatch: true,
      summary: { total: 5, matched: 5, mismatched: 0, errors: 0 },
      results: {
        workforce: { match: true, differences: [] }
      },
      timestamp: '2025-01-30T12:00:00.000Z'
    });

    checkCriticalParity.mockResolvedValue({
      allPassed: true,
      checks: [
        { name: 'FY25 Termination Count', expected: 222, jsonValue: 222, passed: true }
      ],
      timestamp: '2025-01-30T12:00:00.000Z'
    });

    render(<DataHealthDashboard />);

    const button = screen.getByRole('button', { name: /Run Validation/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(validateAllEndpoints).toHaveBeenCalledWith('2025-06-30');
      expect(checkCriticalParity).toHaveBeenCalledWith('2025-06-30');
    });
  });

  it('displays validation results after running', async () => {
    validateAllEndpoints.mockResolvedValue({
      allMatch: true,
      summary: { total: 5, matched: 5, mismatched: 0, errors: 0 },
      results: {
        workforce: { match: true, differences: [] }
      },
      timestamp: '2025-01-30T12:00:00.000Z'
    });

    checkCriticalParity.mockResolvedValue({
      allPassed: true,
      checks: [
        { name: 'FY25 Termination Count', expected: 222, jsonValue: 222, passed: true }
      ],
      timestamp: '2025-01-30T12:00:00.000Z'
    });

    render(<DataHealthDashboard />);

    fireEvent.click(screen.getByRole('button', { name: /Run Validation/i }));

    await waitFor(() => {
      expect(screen.getByText('Endpoint Parity')).toBeInTheDocument();
    });
  });

  it('shows critical checks results', async () => {
    validateAllEndpoints.mockResolvedValue({
      allMatch: true,
      summary: { total: 5, matched: 5, mismatched: 0, errors: 0 },
      results: {},
      timestamp: '2025-01-30T12:00:00.000Z'
    });

    checkCriticalParity.mockResolvedValue({
      allPassed: true,
      checks: [
        { name: 'FY25 Termination Count', expected: 222, jsonValue: 222, apiValue: 222, passed: true },
        { name: 'Workforce Headcount', jsonValue: 5415, apiValue: 5415, passed: true }
      ],
      timestamp: '2025-01-30T12:00:00.000Z'
    });

    render(<DataHealthDashboard />);

    fireEvent.click(screen.getByRole('button', { name: /Run Validation/i }));

    await waitFor(() => {
      expect(screen.getByText('Critical Business Rules')).toBeInTheDocument();
      expect(screen.getByText('FY25 Termination Count')).toBeInTheDocument();
    });
  });

  it('shows failed checks correctly', async () => {
    validateAllEndpoints.mockResolvedValue({
      allMatch: false,
      summary: { total: 5, matched: 4, mismatched: 1, errors: 0 },
      results: {
        turnover: {
          match: false,
          differences: [
            { path: 'terminations', type: 'value_mismatch', jsonValue: 222, apiValue: 200 }
          ]
        }
      },
      timestamp: '2025-01-30T12:00:00.000Z'
    });

    checkCriticalParity.mockResolvedValue({
      allPassed: false,
      checks: [
        { name: 'FY25 Termination Count', expected: 222, jsonValue: 200, passed: false }
      ],
      timestamp: '2025-01-30T12:00:00.000Z'
    });

    render(<DataHealthDashboard />);

    fireEvent.click(screen.getByRole('button', { name: /Run Validation/i }));

    await waitFor(() => {
      expect(screen.getByText('Issues Found')).toBeInTheDocument();
    });
  });

  it('displays fallback events section', () => {
    render(<DataHealthDashboard />);

    expect(screen.getByText('Fallback Events')).toBeInTheDocument();
    expect(screen.getByText(/No fallback events recorded/)).toBeInTheDocument();
  });

  it('shows environment info at bottom', () => {
    render(<DataHealthDashboard />);

    expect(screen.getByText(/Data Source:/)).toBeInTheDocument();
    expect(screen.getByText(/Environment:/)).toBeInTheDocument();
  });

  it('disables button while validating', async () => {
    let resolveValidation;
    validateAllEndpoints.mockImplementation(() => new Promise(resolve => {
      resolveValidation = resolve;
    }));

    checkCriticalParity.mockResolvedValue({
      allPassed: true,
      checks: [],
      timestamp: '2025-01-30T12:00:00.000Z'
    });

    render(<DataHealthDashboard />);

    const button = screen.getByRole('button', { name: /Run Validation/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
      expect(screen.getByText('Validating...')).toBeInTheDocument();
    });

    // Resolve the validation
    resolveValidation({
      allMatch: true,
      summary: { total: 5, matched: 5, mismatched: 0, errors: 0 },
      results: {},
      timestamp: '2025-01-30T12:00:00.000Z'
    });

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('shows last validation timestamp', async () => {
    validateAllEndpoints.mockResolvedValue({
      allMatch: true,
      summary: { total: 5, matched: 5, mismatched: 0, errors: 0 },
      results: {},
      timestamp: '2025-01-30T12:00:00.000Z'
    });

    checkCriticalParity.mockResolvedValue({
      allPassed: true,
      checks: [],
      timestamp: '2025-01-30T12:00:00.000Z'
    });

    render(<DataHealthDashboard />);

    fireEvent.click(screen.getByRole('button', { name: /Run Validation/i }));

    await waitFor(() => {
      expect(screen.getByText(/Last run:/)).toBeInTheDocument();
    });
  });

  it('handles errors gracefully', async () => {
    validateAllEndpoints.mockResolvedValue({
      allMatch: false,
      summary: { total: 5, matched: 3, mismatched: 0, errors: 2 },
      results: {
        workforce: { apiError: 'Connection failed' }
      },
      timestamp: '2025-01-30T12:00:00.000Z'
    });

    checkCriticalParity.mockResolvedValue({
      allPassed: false,
      checks: [{ name: 'API Connectivity', error: 'Network error', passed: false }],
      timestamp: '2025-01-30T12:00:00.000Z'
    });

    render(<DataHealthDashboard />);

    fireEvent.click(screen.getByRole('button', { name: /Run Validation/i }));

    await waitFor(() => {
      expect(screen.getByText(/Connection failed/)).toBeInTheDocument();
    });
  });
});
