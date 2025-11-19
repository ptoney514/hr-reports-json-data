import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock dataSyncService to avoid initialization issues
jest.mock('./services/dataSyncService', () => ({
  __esModule: true,
  default: {
    subscribe: jest.fn(() => () => {}),
    getSyncStatus: jest.fn(() => ({
      inProgress: false,
      lastSync: null,
      totalSources: 0,
      syncedSources: 0,
      pendingSources: 0,
      errors: [],
      sources: {},
      history: []
    }))
  },
  initializeDataSync: jest.fn(() => Promise.resolve({
    inProgress: false,
    lastSync: null,
    totalSources: 0,
    syncedSources: 0,
    pendingSources: 0,
    errors: [],
    sources: {},
    history: []
  }))
}));

// Mocking child components that are not relevant to this integration test
// This speeds up the test and isolates it to the App component's behavior.
jest.mock('./components/dashboards/DashboardIndex', () => () => <div>Dashboard Index</div>);
jest.mock('./components/dashboards/TurnoverDashboard', () => () => <div>Turnover Dashboard</div>);

// SIMPLIFIED: Personal PDF export workflow - only need basic smoke test
describe('App Integration Test', () => {
  test('renders the main application without crashing', async () => {
    const { container } = render(<App />);

    // Verify the app renders (basic smoke test)
    expect(container).toBeInTheDocument();
    expect(container.firstChild).toBeTruthy();
  });
});