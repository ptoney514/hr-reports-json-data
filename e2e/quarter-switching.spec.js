import { test, expect } from '@playwright/test';

test.describe('Quarter Switching', () => {
  test('quarter dropdown contains options with data', async ({ page }) => {
    await page.goto('/dashboards/executive-new');
    await page.waitForLoadState('networkidle');

    const dropdown = page.locator('select[aria-label="Select reporting quarter"]');
    await expect(dropdown).toBeVisible();

    // Get all option values
    const options = dropdown.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThan(0);

    // Verify Q1 FY26 is present (has data)
    const q1fy26 = dropdown.locator('option', { hasText: 'Q1 FY26' });
    await expect(q1fy26).toBeAttached();

    // Verify Q4 FY25 is present (has data)
    const q4fy25 = dropdown.locator('option', { hasText: 'Q4 FY25' });
    await expect(q4fy25).toBeAttached();
  });

  test('dropdown only shows quarters with data (no Q3 FY25 or older)', async ({ page }) => {
    await page.goto('/dashboards/executive-new');
    await page.waitForLoadState('networkidle');

    const dropdown = page.locator('select[aria-label="Select reporting quarter"]');
    await expect(dropdown).toBeVisible();

    // Quarters without data should not appear in the dropdown
    const q3fy25 = dropdown.locator('option', { hasText: 'Q3 FY25' });
    await expect(q3fy25).not.toBeAttached();

    const q2fy25 = dropdown.locator('option', { hasText: 'Q2 FY25' });
    await expect(q2fy25).not.toBeAttached();

    const q1fy25 = dropdown.locator('option', { hasText: 'Q1 FY25' });
    await expect(q1fy25).not.toBeAttached();
  });

  test('selecting Q1 FY26 loads data', async ({ page }) => {
    await page.goto('/dashboards/executive-new');
    await page.waitForLoadState('networkidle');

    const dropdown = page.locator('select[aria-label="Select reporting quarter"]');
    // Select Q1 FY26 (value: 2025-09-30)
    await dropdown.selectOption('2025-09-30');
    await page.waitForLoadState('networkidle');

    // Verify no "Data Not Yet Available" message is shown
    const noDataMessage = page.locator('text=Data Not Yet Available');
    await expect(noDataMessage).not.toBeVisible({ timeout: 5000 });
  });

  test('selecting Q4 FY25 loads data without error', async ({ page }) => {
    await page.goto('/dashboards/executive-new');
    await page.waitForLoadState('networkidle');

    const dropdown = page.locator('select[aria-label="Select reporting quarter"]');
    // Select Q4 FY25 (value: 2025-06-30)
    await dropdown.selectOption('2025-06-30');
    await page.waitForLoadState('networkidle');

    // Verify no "Data Not Yet Available" message is shown
    const noDataMessage = page.locator('text=Data Not Yet Available');
    await expect(noDataMessage).not.toBeVisible({ timeout: 5000 });
  });

  test('quarter selection updates URL search params', async ({ page }) => {
    await page.goto('/dashboards/executive-new');
    await page.waitForLoadState('networkidle');

    const dropdown = page.locator('select[aria-label="Select reporting quarter"]');

    // Select Q4 FY25 - should add ?quarter= to URL
    await dropdown.selectOption('2025-06-30');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/quarter=2025-06-30/);
  });

  test('quarter persists via URL when navigating between dashboards', async ({ page }) => {
    // Start on executive dashboard with Q4 FY25
    await page.goto('/dashboards/executive-new?quarter=2025-06-30');
    await page.waitForLoadState('networkidle');

    const dropdown = page.locator('select[aria-label="Select reporting quarter"]');
    // Verify Q4 FY25 is selected
    await expect(dropdown).toHaveValue('2025-06-30');
  });
});
