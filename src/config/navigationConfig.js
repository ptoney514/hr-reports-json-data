/**
 * Shared navigation configuration for SlideHeader and routing.
 * Order defines the prev/next slide navigation sequence.
 */
export const navigationRoutes = [
  { path: '/dashboards/executive-new', label: 'Executive Dashboard', group: null },
  // Workforce
  { path: '/dashboards/workforce-q1', label: 'Workforce Q1', group: 'Workforce' },
  { path: '/dashboards/ethnicity-q1', label: 'Ethnicity Distribution', group: 'Workforce' },
  { path: '/dashboards/age-gender-q1', label: 'Age/Gender', group: 'Workforce' },
  // Turnover
  { path: '/dashboards/turnover-q1', label: 'Turnover Q1', group: 'Turnover' },
  { path: '/dashboards/turnover-trends', label: 'Turnover Trends', group: 'Turnover' },
  // Recruiting
  { path: '/dashboards/recruiting-q1', label: 'Recruiting Q1', group: 'Recruiting' },
  // Exit Survey
  { path: '/dashboards/exit-survey-overview', label: 'Exit Survey Overview', group: 'Exit Survey' },
  { path: '/dashboards/exit-survey-q1', label: 'Exit Survey Q1', group: 'Exit Survey' },
  { path: '/dashboards/exit-survey-q2', label: 'Exit Survey Q2', group: 'Exit Survey' },
  { path: '/dashboards/exit-survey-q3', label: 'Exit Survey Q3', group: 'Exit Survey' },
  { path: '/dashboards/exit-survey-q4', label: 'Exit Survey Q4', group: 'Exit Survey' },
  // Other
  { path: '/dashboards/promotions-q1', label: 'Promotions Q1', group: 'Other' },
  { path: '/dashboards/learning-development', label: 'Learning & Development', group: 'Other' },
  { path: '/dashboards/total-rewards', label: 'Total Rewards', group: 'Other' },
  { path: '/dashboards/benefits-wellbeing', label: 'Benefits & Wellbeing', group: 'Other' },
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
