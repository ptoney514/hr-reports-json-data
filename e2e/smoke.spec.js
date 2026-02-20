import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage loads and redirects to executive dashboard', async ({ page }) => {
    await page.goto('/');
    // App.js redirects "/" to "/dashboards/executive-new"
    await expect(page).toHaveURL(/\/dashboards\/executive-new/);
  });

  test('executive dashboard renders heading', async ({ page }) => {
    await page.goto('/dashboards/executive-new');
    await page.waitForLoadState('networkidle');
    // Verify a visible heading exists on the dashboard
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('quarter dropdown is visible and enabled', async ({ page }) => {
    await page.goto('/dashboards/executive-new');
    await page.waitForLoadState('networkidle');
    // The quarter dropdown uses aria-label="Select reporting quarter"
    const dropdown = page.locator('select[aria-label="Select reporting quarter"]');
    await expect(dropdown).toBeVisible();
    await expect(dropdown).toBeEnabled();
  });

  test('navigation dropdown is visible', async ({ page }) => {
    await page.goto('/dashboards/executive-new');
    await page.waitForLoadState('networkidle');
    // The nav dropdown uses aria-label="Navigate to dashboard"
    const navDropdown = page.locator('select[aria-label="Navigate to dashboard"]');
    await expect(navDropdown).toBeVisible();
  });

  test('slide header displays Creighton University branding', async ({ page }) => {
    await page.goto('/dashboards/executive-new');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Creighton University')).toBeVisible();
  });
});
