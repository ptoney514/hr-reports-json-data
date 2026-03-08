import { test, expect } from '@playwright/test';

test.describe('Recruiting Dashboard Quarter Switching', () => {
  const RECRUITING_URL = '/dashboards/recruiting-q1';

  test('default quarter (Q2 FY26) shows NoDataForQuarter message', async ({ page }) => {
    await page.goto(RECRUITING_URL);
    await page.waitForLoadState('networkidle');

    // Default quarter is Q2 FY26 (2025-12-31) which has no recruiting data
    const dropdown = page.locator('select[aria-label="Select reporting quarter"]');
    await expect(dropdown).toBeVisible();

    // Verify the dropdown defaults to Q2 FY26
    await expect(dropdown).toHaveValue('2025-12-31');

    // Should show "Data Not Yet Available" message
    const noDataHeading = page.locator('text=Data Not Yet Available');
    await expect(noDataHeading).toBeVisible({ timeout: 5000 });

    // Should mention "Recruiting & new hires data" in the message
    const dataLabel = page.locator('text=Recruiting & new hires data');
    await expect(dataLabel).toBeVisible();
  });

  test('switching to Q1 FY26 shows full dashboard with 69 hires', async ({ page }) => {
    await page.goto(RECRUITING_URL);
    await page.waitForLoadState('networkidle');

    const dropdown = page.locator('select[aria-label="Select reporting quarter"]');
    await expect(dropdown).toBeVisible();

    // Switch to Q1 FY26
    await dropdown.selectOption('2025-09-30');
    await page.waitForLoadState('networkidle');

    // "Data Not Yet Available" should NOT be visible
    const noDataMessage = page.locator('text=Data Not Yet Available');
    await expect(noDataMessage).not.toBeVisible({ timeout: 5000 });

    // The dashboard should show "69" (total new hires) in the hero metric
    const totalHires = page.locator('div.text-5xl.font-bold').filter({ hasText: '69' });
    await expect(totalHires).toBeVisible({ timeout: 5000 });
  });

  test('switching back to Q2 FY26 shows NoDataForQuarter again', async ({ page }) => {
    // Start with Q1 FY26 to see the dashboard
    await page.goto(RECRUITING_URL + '?quarter=2025-09-30');
    await page.waitForLoadState('networkidle');

    // Confirm dashboard is visible (no "Data Not Yet Available")
    const noDataMessage = page.locator('text=Data Not Yet Available');
    await expect(noDataMessage).not.toBeVisible({ timeout: 5000 });

    // Now switch to Q2 FY26
    const dropdown = page.locator('select[aria-label="Select reporting quarter"]');
    await dropdown.selectOption('2025-12-31');
    await page.waitForLoadState('networkidle');

    // Should show "Data Not Yet Available" again
    await expect(noDataMessage).toBeVisible({ timeout: 5000 });

    // Verify the recruiting data label is in the message
    const dataLabel = page.locator('text=Recruiting & new hires data');
    await expect(dataLabel).toBeVisible();
  });

  test('Q1 FY26 URL param loads dashboard directly', async ({ page }) => {
    // Navigate directly with quarter param
    await page.goto(RECRUITING_URL + '?quarter=2025-09-30');
    await page.waitForLoadState('networkidle');

    // Dashboard should be visible without "Data Not Yet Available"
    const noDataMessage = page.locator('text=Data Not Yet Available');
    await expect(noDataMessage).not.toBeVisible({ timeout: 5000 });

    // Verify 69 total hires is displayed in the hero metric
    const totalHires = page.locator('div.text-5xl.font-bold').filter({ hasText: '69' });
    await expect(totalHires).toBeVisible({ timeout: 5000 });

    // Dropdown should reflect Q1 FY26
    const dropdown = page.locator('select[aria-label="Select reporting quarter"]');
    await expect(dropdown).toHaveValue('2025-09-30');
  });

  test('Q4 FY25 shows NoDataForQuarter (no recruiting data for that quarter)', async ({ page }) => {
    await page.goto(RECRUITING_URL + '?quarter=2025-06-30');
    await page.waitForLoadState('networkidle');

    // Q4 FY25 also has no recruiting data, should show NoDataForQuarter
    const noDataMessage = page.locator('text=Data Not Yet Available');
    await expect(noDataMessage).toBeVisible({ timeout: 5000 });
  });
});
