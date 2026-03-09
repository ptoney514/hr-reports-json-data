/**
 * Shared navigation configuration for SlideHeader and routing.
 * Order defines the prev/next slide navigation sequence.
 * Maps 1:1 to the HR Workforce Reports PDF (25 navigable pages).
 */
export const navigationRoutes = [
  // Executive Overview
  { path: '/dashboards/executive-new', label: 'Executive Dashboard', group: null },

  // Headcount Section
  { path: '/dashboards/section/headcount', label: 'Title - Headcount', group: 'Headcount', isDivider: true },
  { path: '/dashboards/workforce-q1', label: 'Workforce & Headcount', group: 'Headcount' },
  { path: '/dashboards/temp-workers-q1', label: 'Temp Workers', group: 'Headcount' },
  { path: '/dashboards/headcount-trends', label: 'Headcount Trends', group: 'Headcount' },

  // Demographics Section
  { path: '/dashboards/section/demographics', label: 'Title - Demographics', group: 'Demographics', isDivider: true },
  { path: '/dashboards/ethnicity-q1', label: 'Ethnicity Distribution', group: 'Demographics' },
  { path: '/dashboards/age-gender-q1', label: 'Age/Gender Distribution', group: 'Demographics' },

  // Recruiting Section
  { path: '/dashboards/section/recruiting', label: 'Title - Recruiting', group: 'Recruiting', isDivider: true },
  { path: '/dashboards/recruiting-q1', label: 'Recruiting Pipeline', group: 'Recruiting' },
  { path: '/dashboards/recruiting-details', label: 'Recruiting Details', group: 'Recruiting' },

  // Turnover Section
  { path: '/dashboards/section/turnover', label: 'Title - Turnover', group: 'Turnover', isDivider: true },
  { path: '/dashboards/turnover-q1', label: 'Turnover Overview', group: 'Turnover' },
  { path: '/dashboards/quarterly-turnover-rates', label: 'Quarterly Turnover Analysis', group: 'Turnover' },
  { path: '/dashboards/turnover-by-school', label: 'Turnover by School/Area', group: 'Turnover' },
  { path: '/dashboards/turnover-by-service', label: 'Turnover by Length of Svc', group: 'Turnover' },
  { path: '/dashboards/turnover-by-age', label: 'Turnover by Age', group: 'Turnover' },
  { path: '/dashboards/early-turnover', label: 'Early Turnover Deep Dive', group: 'Turnover' },
  { path: '/dashboards/turnover-trends', label: 'Turnover Trends', group: 'Turnover' },

  // Promotions Section
  { path: '/dashboards/section/promotions', label: 'Title - Promotions', group: 'Promotions', isDivider: true },
  { path: '/dashboards/promotions-q1', label: 'Promotions Report', group: 'Promotions' },
  { path: '/dashboards/promotions-by-school', label: 'Promotions by School', group: 'Promotions' },

  // Exit Surveys Section
  { path: '/dashboards/section/exit-survey', label: 'Title - Exit Survey', group: 'Exit Survey', isDivider: true },
  { path: '/dashboards/exit-survey-q1', label: 'Exit Analysis Report', group: 'Exit Survey' },
  { path: '/dashboards/exit-survey-insights', label: 'Exit Survey Insights', group: 'Exit Survey' },

  // Utility
  { path: '/sitemap', label: 'Sitemap', group: null },
];

/**
 * Get unique groups in order for <optgroup> rendering.
 */
export const getNavigationGroups = () => {
  const groups = [];
  const seen = new Set();
  for (const route of navigationRoutes) {
    const g = route.group || '__ungrouped__';
    if (!seen.has(g)) {
      seen.add(g);
      groups.push(g);
    }
  }
  return groups;
};
