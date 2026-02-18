/**
 * Shared navigation configuration for SlideHeader and routing.
 * Order defines the prev/next slide navigation sequence.
 */
export const navigationRoutes = [
  { path: '/dashboards/executive-new', label: 'Executive Dashboard', group: null },
  // Workforce
  { path: '/dashboards/section/headcount', label: 'Title - Headcount', group: 'Workforce', isDivider: true },
  { path: '/dashboards/workforce-q1', label: 'Workforce', group: 'Workforce' },
  { path: '/dashboards/temp-workers-q1', label: 'Temp Workers', group: 'Workforce' },
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
