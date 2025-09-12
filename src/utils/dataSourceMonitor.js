export const collectDataSources = () => {
  return {
    sources: [],
    timestamp: new Date().toISOString()
  };
};

export const monitorDataSource = (sourceId) => {
  return {
    id: sourceId,
    status: 'active',
    lastChecked: new Date().toISOString()
  };
};

export const validateDataSource = (source) => {
  return true;
};

export const groupSourcesByCategory = (sources) => {
  const grouped = {};
  sources.forEach(source => {
    const category = source.category || 'uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(source);
  });
  return grouped;
};

export const isRefreshRecommended = (source) => {
  if (!source.lastRefresh) return true;
  const daysSince = getDaysSinceRefresh(source.lastRefresh);
  return daysSince > (source.refreshFrequency || 30);
};

export const getFileStatus = (source) => {
  if (!source.exists) return 'missing';
  if (!source.lastRefresh) return 'never-refreshed';
  if (isRefreshRecommended(source)) return 'stale';
  return 'current';
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getDaysSinceRefresh = (dateStr) => {
  if (!dateStr) return Infinity;
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getFileTypeIcon = (fileType) => {
  const icons = {
    'json': '📄',
    'excel': '📊',
    'csv': '📋',
    'pdf': '📑',
    'api': '🔌',
    'database': '💾'
  };
  return icons[fileType] || '📁';
};

export const getRefreshFrequencyLabel = (days) => {
  if (days === 1) return 'Daily';
  if (days === 7) return 'Weekly';
  if (days === 30) return 'Monthly';
  if (days === 90) return 'Quarterly';
  if (days === 365) return 'Annually';
  return `Every ${days} days`;
};