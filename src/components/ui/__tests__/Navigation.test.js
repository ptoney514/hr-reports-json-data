/**
 * Comprehensive tests for Navigation component
 * Tests rendering, ARIA compliance, expandable sections,
 * and mobile menu accessibility
 */

import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { renderWithRouter, accessibilityTestUtils, setupTestEnvironment } from '../../../utils/testUtils';
import Navigation from '../Navigation';

// Custom render with initial route
const renderWithRoute = (initialRoute = '/dashboards') => {
  return renderWithRouter(<Navigation />, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[initialRoute]}>
        {children}
      </MemoryRouter>
    )
  });
};

beforeEach(() => {
  setupTestEnvironment.accessibility();
  setupTestEnvironment.performance();
});

afterEach(() => {
  setupTestEnvironment.cleanup();
});

describe('Navigation Component', () => {

  describe('Basic Rendering (Smoke Tests)', () => {
    test('renders navigation without crashing', () => {
      renderWithRoute();
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    test('displays Dashboard link', () => {
      renderWithRoute();

      const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i });
      expect(dashboardLinks.length).toBeGreaterThan(0);
    });

    test('displays Workforce link in Employees section', () => {
      renderWithRoute();

      const workforceLinks = screen.getAllByRole('link', { name: /workforce/i });
      expect(workforceLinks.length).toBeGreaterThan(0);

      const hasCorrectRoute = workforceLinks.some(link =>
        link.getAttribute('href') === '/dashboards/workforce-q1'
      );
      expect(hasCorrectRoute).toBe(true);
    });

    test('displays Employees section header', () => {
      renderWithRoute();

      const employeesHeaders = screen.getAllByText(/employees/i);
      expect(employeesHeaders.length).toBeGreaterThan(0);
    });

    test('displays Ethnicity expandable button', () => {
      renderWithRoute();

      const ethnicityButtons = screen.getAllByRole('button', { name: /ethnicity/i });
      expect(ethnicityButtons.length).toBeGreaterThan(0);
    });

    test('Sitemap link navigates to correct route', () => {
      renderWithRoute();

      const sitemapLinks = screen.getAllByRole('link', { name: /sitemap/i });
      expect(sitemapLinks.length).toBeGreaterThan(0);

      const hasCorrectRoute = sitemapLinks.some(link =>
        link.getAttribute('href') === '/sitemap'
      );
      expect(hasCorrectRoute).toBe(true);
    });
  });

  describe('Expandable Ethnicity Section', () => {
    test('Ethnicity section is collapsed by default', () => {
      renderWithRoute();

      const ethnicityButtons = screen.getAllByRole('button', { name: /ethnicity/i });
      // At least one should have aria-expanded="false"
      const hasCollapsed = ethnicityButtons.some(btn =>
        btn.getAttribute('aria-expanded') === 'false'
      );
      expect(hasCollapsed).toBe(true);

      // Sub-items should not be visible
      expect(screen.queryByRole('link', { name: /ethnicity distribution/i })).not.toBeInTheDocument();
    });

    test('clicking Ethnicity expands sub-items', async () => {
      const { user } = renderWithRoute();

      const ethnicityButtons = screen.getAllByRole('button', { name: /ethnicity/i });
      await user.click(ethnicityButtons[0]);

      await waitFor(() => {
        expect(ethnicityButtons[0]).toHaveAttribute('aria-expanded', 'true');
      });

      // Sub-items should now be visible
      const ethDistLinks = screen.getAllByRole('link', { name: /ethnicity distribution/i });
      expect(ethDistLinks.length).toBeGreaterThan(0);

      const ageGenderLinks = screen.getAllByRole('link', { name: /age\/gender/i });
      expect(ageGenderLinks.length).toBeGreaterThan(0);
    });

    test('Ethnicity sub-items have correct routes', async () => {
      const { user } = renderWithRoute();

      const ethnicityButtons = screen.getAllByRole('button', { name: /ethnicity/i });
      await user.click(ethnicityButtons[0]);

      await waitFor(() => {
        const ethDistLinks = screen.getAllByRole('link', { name: /ethnicity distribution/i });
        const hasEthRoute = ethDistLinks.some(link =>
          link.getAttribute('href') === '/dashboards/ethnicity-q1'
        );
        expect(hasEthRoute).toBe(true);

        const ageGenderLinks = screen.getAllByRole('link', { name: /age\/gender/i });
        const hasAgeRoute = ageGenderLinks.some(link =>
          link.getAttribute('href') === '/dashboards/age-gender-q1'
        );
        expect(hasAgeRoute).toBe(true);
      });
    });

    test('auto-expands Ethnicity section when on ethnicity page', () => {
      renderWithRoute('/dashboards/ethnicity-q1');

      // Should auto-expand and show sub-items
      const ethDistLinks = screen.getAllByRole('link', { name: /ethnicity distribution/i });
      expect(ethDistLinks.length).toBeGreaterThan(0);
    });

    test('auto-expands Ethnicity section when on age-gender page', () => {
      renderWithRoute('/dashboards/age-gender-q1');

      const ageGenderLinks = screen.getAllByRole('link', { name: /age\/gender/i });
      expect(ageGenderLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Active State', () => {
    test('Dashboard link shows active state on /dashboards/executive', () => {
      renderWithRoute('/dashboards/executive');

      // Find the Executive Dashboard nav link (not the brand link)
      const dashboardLinks = screen.getAllByRole('link', { name: /executive dashboard/i });
      const activeLink = dashboardLinks.find(link =>
        link.getAttribute('href') === '/dashboards/executive' &&
        link.classList.contains('bg-blue-50')
      );
      expect(activeLink).toBeTruthy();
    });

    test('Workforce link shows active state on /dashboards/workforce-q1', () => {
      renderWithRoute('/dashboards/workforce-q1');

      const workforceLinks = screen.getAllByRole('link', { name: /workforce/i });
      const activeLink = workforceLinks.find(link =>
        link.getAttribute('href') === '/dashboards/workforce-q1' &&
        link.classList.contains('bg-blue-50')
      );
      expect(activeLink).toBeTruthy();
    });
  });

  describe('ARIA Compliance', () => {
    test('has proper landmark navigation role', () => {
      renderWithRoute();

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav.tagName).toBe('NAV');
    });

    test('brand link has accessible name', () => {
      renderWithRoute();

      const brandLink = screen.getByRole('link', { name: /hr reports home/i });
      expect(brandLink).toBeInTheDocument();
      expect(brandLink).toHaveAttribute('href', '/dashboards');
    });

    test('Ethnicity button has aria-expanded attribute', () => {
      renderWithRoute();

      const ethnicityButtons = screen.getAllByRole('button', { name: /ethnicity/i });
      ethnicityButtons.forEach(btn => {
        expect(btn).toHaveAttribute('aria-expanded');
      });
    });

    test('mobile menu button has aria-controls pointing to mobile-menu', () => {
      renderWithRoute();

      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      expect(mobileMenuButton).toHaveAttribute('aria-controls', 'mobile-menu');
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Mobile Navigation', () => {
    test('shows mobile menu button', () => {
      renderWithRoute();

      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      expect(mobileMenuButton).toBeInTheDocument();
    });

    test('opens mobile menu with id="mobile-menu"', async () => {
      const { user } = renderWithRoute();

      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      await user.click(mobileMenuButton);

      await waitFor(() => {
        expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
        const mobileMenu = document.getElementById('mobile-menu');
        expect(mobileMenu).toBeInTheDocument();
      });
    });

    test('mobile menu contains same navigation structure', async () => {
      const { user } = renderWithRoute();

      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      await user.click(mobileMenuButton);

      await waitFor(() => {
        const mobileMenu = document.getElementById('mobile-menu');
        expect(mobileMenu).toBeInTheDocument();

        // Check for Dashboard link in mobile menu
        const dashboardLinks = within(mobileMenu).getAllByRole('link', { name: /dashboard/i });
        expect(dashboardLinks.length).toBeGreaterThan(0);

        // Check for Workforce link
        const workforceLinks = within(mobileMenu).getAllByRole('link', { name: /workforce/i });
        expect(workforceLinks.length).toBeGreaterThan(0);

        // Check for Ethnicity expandable button
        const ethnicityButtons = within(mobileMenu).getAllByRole('button', { name: /ethnicity/i });
        expect(ethnicityButtons.length).toBeGreaterThan(0);

        // Check for Sitemap link
        const sitemapLinks = within(mobileMenu).getAllByRole('link', { name: /sitemap/i });
        expect(sitemapLinks.length).toBeGreaterThan(0);
      });
    });

    test('mobile menu button updates aria-label when toggled', async () => {
      const { user } = renderWithRoute();

      const mobileMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
      expect(mobileMenuButton).toHaveAttribute('aria-label', 'Open mobile menu');

      await user.click(mobileMenuButton);

      await waitFor(() => {
        expect(mobileMenuButton).toHaveAttribute('aria-label', 'Close mobile menu');
      });
    });
  });
});
