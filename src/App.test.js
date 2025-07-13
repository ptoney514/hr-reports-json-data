import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mocking child components that are not relevant to this integration test
// This speeds up the test and isolates it to the App component's behavior.
jest.mock('./components/dashboards/DashboardIndex', () => () => <div>Dashboard Index</div>);
jest.mock('./components/dashboards/TurnoverDashboard', () => () => <div>Turnover Dashboard</div>);

describe('App Integration Test', () => {
  test('renders the main application, navigates to the default dashboard, and handles routing', async () => {
    render(<App />);

    // 1. Verify the main navigation is rendered
    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeInTheDocument();

    // 2. Check that the app defaults to the Dashboard Index
    // The App component redirects from "/" to "/dashboards"
    await waitFor(() => {
      expect(screen.getByText('Dashboard Index')).toBeInTheDocument();
    });

    // 3. Simulate user navigating to the Turnover Dashboard
    const turnoverLink = screen.getByRole('link', { name: /turnover/i });
    userEvent.click(turnoverLink);

    // 4. Verify the Turnover Dashboard is rendered after navigation
    await waitFor(() => {
      expect(screen.getByText('Turnover Dashboard')).toBeInTheDocument();
    });

    // 5. Verify the Dashboard Index is no longer visible
    expect(screen.queryByText('Dashboard Index')).not.toBeInTheDocument();
  });
});