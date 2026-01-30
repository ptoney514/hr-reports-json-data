/**
 * DataSourceIndicator Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  DataSourceIndicator,
  DataSourceBadge,
  DataSourceStatus
} from '../DataSourceIndicator';

// Mock the hooks
jest.mock('../../../hooks/useHRData', () => ({
  useDataSourceHealth: jest.fn(),
  useDataSourceInfo: jest.fn()
}));

const { useDataSourceHealth, useDataSourceInfo } = require('../../../hooks/useHRData');

describe('DataSourceIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DataSourceIndicator component', () => {
    it('shows loading state while checking', () => {
      useDataSourceHealth.mockReturnValue({ health: null, loading: true });
      useDataSourceInfo.mockReturnValue({ source: 'json' });

      render(<DataSourceIndicator />);

      expect(screen.getByText('Checking...')).toBeInTheDocument();
    });

    it('shows Local JSON when using JSON source', () => {
      useDataSourceHealth.mockReturnValue({
        health: { status: 'ok', source: 'json' },
        loading: false
      });
      useDataSourceInfo.mockReturnValue({ source: 'json' });

      render(<DataSourceIndicator />);

      expect(screen.getByText('Local JSON')).toBeInTheDocument();
    });

    it('shows Live API when using API source', () => {
      useDataSourceHealth.mockReturnValue({
        health: { status: 'ok', source: 'api' },
        loading: false
      });
      useDataSourceInfo.mockReturnValue({ source: 'api' });

      render(<DataSourceIndicator />);

      expect(screen.getByText('Live API')).toBeInTheDocument();
    });

    it('shows Error when health check fails', () => {
      useDataSourceHealth.mockReturnValue({
        health: { status: 'error', message: 'Connection failed' },
        loading: false
      });
      useDataSourceInfo.mockReturnValue({ source: 'api' });

      render(<DataSourceIndicator />);

      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('shows details when showDetails prop is true', () => {
      useDataSourceHealth.mockReturnValue({
        health: { status: 'ok', source: 'json' },
        loading: false
      });
      useDataSourceInfo.mockReturnValue({ source: 'json' });

      render(<DataSourceIndicator showDetails={true} />);

      expect(screen.getByText(/Using local JSON data files/)).toBeInTheDocument();
    });

    it('has correct ARIA attributes', () => {
      useDataSourceHealth.mockReturnValue({
        health: { status: 'ok', source: 'json' },
        loading: false
      });
      useDataSourceInfo.mockReturnValue({ source: 'json' });

      render(<DataSourceIndicator />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute('aria-live', 'polite');
      expect(indicator).toHaveAttribute('aria-label', 'Data source: Local JSON');
    });

    it('applies size classes correctly', () => {
      useDataSourceHealth.mockReturnValue({
        health: { status: 'ok', source: 'json' },
        loading: false
      });
      useDataSourceInfo.mockReturnValue({ source: 'json' });

      const { container } = render(<DataSourceIndicator size="lg" />);

      expect(container.firstChild).toHaveClass('text-base');
    });
  });

  describe('DataSourceBadge component', () => {
    it('shows JSON badge', () => {
      useDataSourceHealth.mockReturnValue({
        health: { status: 'ok', source: 'json' },
        loading: false
      });
      useDataSourceInfo.mockReturnValue({ source: 'json' });

      render(<DataSourceBadge />);

      expect(screen.getByText('JSON')).toBeInTheDocument();
    });

    it('shows API badge', () => {
      useDataSourceHealth.mockReturnValue({
        health: { status: 'ok', source: 'api' },
        loading: false
      });
      useDataSourceInfo.mockReturnValue({ source: 'api' });

      render(<DataSourceBadge />);

      expect(screen.getByText('API')).toBeInTheDocument();
    });

    it('shows loading indicator', () => {
      useDataSourceHealth.mockReturnValue({ health: null, loading: true });
      useDataSourceInfo.mockReturnValue({ source: 'json' });

      render(<DataSourceBadge />);

      expect(screen.getByText('...')).toBeInTheDocument();
    });

    it('shows Error badge on failure', () => {
      useDataSourceHealth.mockReturnValue({
        health: { status: 'error' },
        loading: false
      });
      useDataSourceInfo.mockReturnValue({ source: 'api' });

      render(<DataSourceBadge />);

      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  describe('DataSourceStatus component', () => {
    it('renders status panel', () => {
      useDataSourceHealth.mockReturnValue({
        health: { status: 'ok', source: 'json' },
        loading: false
      });
      useDataSourceInfo.mockReturnValue({ source: 'json', apiUrl: '/api' });

      render(<DataSourceStatus />);

      expect(screen.getByText('Data Source Status')).toBeInTheDocument();
      expect(screen.getByText('Source')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('shows Connected when healthy', () => {
      useDataSourceHealth.mockReturnValue({
        health: { status: 'ok', source: 'json' },
        loading: false
      });
      useDataSourceInfo.mockReturnValue({ source: 'json' });

      render(<DataSourceStatus />);

      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    it('shows error message when unhealthy', () => {
      useDataSourceHealth.mockReturnValue({
        health: { status: 'error', message: 'Database connection failed' },
        loading: false
      });
      useDataSourceInfo.mockReturnValue({ source: 'api' });

      render(<DataSourceStatus />);

      expect(screen.getByText('Database connection failed')).toBeInTheDocument();
    });

    it('shows API URL when using API source', () => {
      useDataSourceHealth.mockReturnValue({
        health: { status: 'ok', source: 'api' },
        loading: false
      });
      useDataSourceInfo.mockReturnValue({ source: 'api', apiUrl: 'https://api.example.com' });

      render(<DataSourceStatus />);

      expect(screen.getByText('API URL')).toBeInTheDocument();
      expect(screen.getByText('https://api.example.com')).toBeInTheDocument();
    });

    it('shows fallback available message', () => {
      useDataSourceHealth.mockReturnValue({
        health: { status: 'error', fallbackAvailable: true },
        loading: false
      });
      useDataSourceInfo.mockReturnValue({ source: 'api' });

      render(<DataSourceStatus />);

      expect(screen.getByText(/Fallback to JSON data is available/)).toBeInTheDocument();
    });
  });
});
