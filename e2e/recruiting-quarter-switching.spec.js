import { test, expect } from '@playwright/test';

test.describe('Recruiting Dashboard Quarter Switching', () => {
  const RECRUITING_URL = '/dashboards/recruiting-q1';

  test('default quarter (Q2 FY26) shows dashboard with Q2 data', async ({ page }) => {
    await page.goto(RECRUITING_URL);
    await page.waitForLoadState('networkidle');

    const dropdown = page.locator('select[aria-label="Select reporting quarter"]');
    await expect(dropdown).toHaveValue('2025-12-31');

    // Q2 now has data - should NOT show "Data Not Yet Available"
    const noDataMessage = page.locator('text=Data Not Yet Available');
    await expect(noDataMessage).not.toBeVisible({ timeout: 5000 });

    // Should show Q2 total new hires (58) in hero metric
    const totalHires = page.locator('div.text-5xl.font-bold').filter({ hasText: '58' });
    await expect(totalHires).toBeVisible({ timeout: 5000 });

    // Should show Q2 pipeline metrics
    const openReqs = page.locator('text=89');
    await expect(openReqs).toBeVisible({ timeout: 5000 });
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

  test('switching between Q1 and Q2 shows correct quarter data', async ({ page }) => {
    await page.goto(RECRUITING_URL + '?quarter=2025-09-30');
    await page.waitForLoadState('networkidle');

    // Q1 shows 69 hires
    const q1Hires = page.locator('div.text-5xl.font-bold').filter({ hasText: '69' });
    await expect(q1Hires).toBeVisible({ timeout: 5000 });

    // Switch to Q2
    const dropdown = page.locator('select[aria-label="Select reporting quarter"]');
    await dropdown.selectOption('2025-12-31');
    await page.waitForLoadState('networkidle');

    // Q2 shows 58 hires (not 69)
    const q2Hires = page.locator('div.text-5xl.font-bold').filter({ hasText: '58' });
    await expect(q2Hires).toBeVisible({ timeout: 5000 });
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

  test('only FY26 quarters appear in dropdown', async ({ page }) => {
    await page.goto(RECRUITING_URL);
    await page.waitForLoadState('networkidle');

    const dropdown = page.locator('select[aria-label="Select reporting quarter"]');
    const options = dropdown.locator('option');
    await expect(options).toHaveCount(2);
    await expect(options.nth(0)).toHaveValue('2025-12-31');
    await expect(options.nth(1)).toHaveValue('2025-09-30');
  });

  test('Q2 FY26 shows pipeline KPI metrics', async ({ page }) => {
    await page.goto(RECRUITING_URL + '?quarter=2025-12-31');
    await page.waitForLoadState('networkidle');

    // Verify top KPI cards render with Q2 values
    await expect(page.locator('text=89')).toBeVisible();     // Open Reqs
    await expect(page.locator('text=924')).toBeVisible();    // Active Apps
    await expect(page.locator('text=26.1')).toBeVisible();   // Apps per Req
    await expect(page.locator('text=33.5')).toBeVisible();   // Avg Days to Fill
    await expect(page.locator('text=100.0%')).toBeVisible(); // Offer Accept Rate
    await expect(page.locator('text=20.3%')).toBeVisible();  // Internal Hire Rate
  });

  test('Q2 FY26 shows application sources chart', async ({ page }) => {
    await page.goto(RECRUITING_URL + '?quarter=2025-12-31');
    await page.waitForLoadState('networkidle');

    // Verify top application source is displayed
    await expect(page.locator('text=External Career Site')).toBeVisible();
    await expect(page.locator('text=LinkedIn')).toBeVisible();
  });

  test('Q2 FY26 shows requisition aging breakdown', async ({ page }) => {
    await page.goto(RECRUITING_URL + '?quarter=2025-12-31');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=0-30 Days')).toBeVisible();
    await expect(page.locator('text=>120 Days')).toBeVisible();
  });
});
