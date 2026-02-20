import { test, expect } from '@playwright/test';

test.describe('Dashboard Pages', () => {
  // Core dashboard routes from App.js (excluding archive, admin, test, and print routes)
  const dashboardPaths = [
    { path: '/dashboards/executive-new', name: 'Executive Dashboard' },
    { path: '/dashboards/marketing-slides', name: 'Marketing Slides' },
    { path: '/dashboards/workforce', name: 'Workforce Dashboard' },
    { path: '/dashboards/turnover', name: 'Turnover Dashboard' },
    { path: '/dashboards/recruiting', name: 'Recruiting Dashboard' },
    { path: '/dashboards/exit-survey-fy25', name: 'Exit Survey FY25' },
    { path: '/dashboards/accomplishments', name: 'Accomplishments Overview' },
    { path: '/dashboards/fy26-priorities', name: 'FY26 Priorities' },
    { path: '/dashboards/learning-development', name: 'Learning & Development' },
    { path: '/dashboards/total-rewards', name: 'Total Rewards' },
    { path: '/dashboards/benefits-wellbeing', name: 'Benefits & Wellbeing' },
    { path: '/dashboards/exit-survey-overview', name: 'Exit Survey Overview' },
    { path: '/dashboards/exit-survey-q1', name: 'Exit Survey Q1' },
    { path: '/dashboards/turnover-q1', name: 'Turnover Q1' },
    { path: '/dashboards/turnover-trends', name: 'Turnover Trends' },
    { path: '/dashboards/quarterly-turnover-rates', name: 'Quarterly Turnover Rates' },
    { path: '/dashboards/workforce-q1', name: 'Workforce Q1' },
    { path: '/dashboards/temp-workers-q1', name: 'Temp Workers Q1' },
    { path: '/dashboards/demographics-q1', name: 'Demographics Q1' },
    { path: '/dashboards/ethnicity-q1', name: 'Ethnicity Distribution Q1' },
    { path: '/dashboards/age-gender-q1', name: 'Age & Gender Q1' },
    { path: '/dashboards/recruiting-q1', name: 'Recruiting Q1' },
    { path: '/dashboards/recruiting-nbe-q1', name: 'Recruiting NBE Q1' },
    { path: '/dashboards/promotions-q1', name: 'Promotions Q1' },
  ];

  for (const { path, name } of dashboardPaths) {
    test(`${name} (${path}) loads successfully`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      // Verify the page loaded (no blank screen) by checking for visible content
      const body = page.locator('body');
      await expect(body).not.toBeEmpty();

      // Verify the slide header is present (common to all dashboard pages)
      const header = page.locator('header');
      await expect(header).toBeVisible();
    });
  }

  test('sitemap page loads and lists dashboard links', async ({ page }) => {
    await page.goto('/sitemap');
    await page.waitForLoadState('networkidle');
    // Sitemap should contain links to dashboards
    const links = page.locator('a[href*="/dashboards/"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('unknown route redirects to sitemap', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await expect(page).toHaveURL(/\/sitemap/);
  });
});
