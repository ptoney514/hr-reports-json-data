// Calculate SHA256 hash of a file (client-side using Web Crypto API)
export const calculateFileHash = async (file) => {
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('Error calculating file hash:', error);
    return null;
  }
};

// Compare two hashes to detect changes
export const hasFileChanged = (oldHash, newHash) => {
  if (!oldHash || !newHash) return true;
  return oldHash !== newHash;
};

// Format file size for display
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Get file status based on dates and hash
export const getFileStatus = (source) => {
  if (!source.lastRefreshed) {
    return { status: 'never-refreshed', label: 'Never Refreshed', color: 'gray' };
  }
  
  if (!source.lastModified) {
    return { status: 'pending-scan', label: 'Pending Scan', color: 'yellow' };
  }
  
  const modifiedDate = new Date(source.lastModified);
  const refreshedDate = new Date(source.lastRefreshed);
  
  if (modifiedDate > refreshedDate) {
    return { status: 'changed', label: 'Changed', color: 'orange' };
  }
  
  // Check if refresh is due based on frequency
  const daysSinceRefresh = Math.floor((Date.now() - refreshedDate) / (1000 * 60 * 60 * 24));
  const refreshDue = {
    'daily': 1,
    'weekly': 7,
    'monthly': 30,
    'quarterly': 90,
    'annual': 365
  };
  
  if (refreshDue[source.refreshFrequency] && daysSinceRefresh > refreshDue[source.refreshFrequency]) {
    return { status: 'refresh-due', label: 'Refresh Due', color: 'yellow' };
  }
  
  return { status: 'up-to-date', label: 'Up to Date', color: 'green' };
};

// Parse change summary from refresh history
export const parseChangeSummary = (beforeData, afterData) => {
  const changes = [];
  
  try {
    // Compare key metrics if both are objects
    if (typeof beforeData === 'object' && typeof afterData === 'object') {
      // Check for added keys
      Object.keys(afterData).forEach(key => {
        if (!(key in beforeData)) {
          changes.push({ type: 'added', field: key, newValue: afterData[key] });
        }
      });
      
      // Check for removed keys
      Object.keys(beforeData).forEach(key => {
        if (!(key in afterData)) {
          changes.push({ type: 'removed', field: key, oldValue: beforeData[key] });
        }
      });
      
      // Check for modified values
      Object.keys(beforeData).forEach(key => {
        if (key in afterData && JSON.stringify(beforeData[key]) !== JSON.stringify(afterData[key])) {
          changes.push({
            type: 'modified',
            field: key,
            oldValue: beforeData[key],
            newValue: afterData[key]
          });
        }
      });
    }
  } catch (error) {
    console.error('Error parsing change summary:', error);
  }
  
  return changes;
};

// Generate change report
export const generateChangeReport = (changes) => {
  if (!changes || changes.length === 0) {
    return 'No changes detected';
  }
  
  const summary = {
    added: changes.filter(c => c.type === 'added').length,
    modified: changes.filter(c => c.type === 'modified').length,
    removed: changes.filter(c => c.type === 'removed').length
  };
  
  const parts = [];
  if (summary.added > 0) parts.push(`${summary.added} added`);
  if (summary.modified > 0) parts.push(`${summary.modified} modified`);
  if (summary.removed > 0) parts.push(`${summary.removed} removed`);
  
  return parts.join(', ');
};

// Check if a refresh is recommended
export const isRefreshRecommended = (source) => {
  const status = getFileStatus(source);
  return ['changed', 'refresh-due', 'never-refreshed'].includes(status.status);
};

// Get refresh frequency label
export const getRefreshFrequencyLabel = (frequency) => {
  const labels = {
    'daily': 'Daily',
    'weekly': 'Weekly',
    'monthly': 'Monthly',
    'quarterly': 'Quarterly',
    'annual': 'Annual'
  };
  return labels[frequency] || frequency;
};

// Calculate days since last refresh
export const getDaysSinceRefresh = (lastRefreshed) => {
  if (!lastRefreshed) return null;
  const days = Math.floor((Date.now() - new Date(lastRefreshed)) / (1000 * 60 * 60 * 24));
  return days;
};

// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get file type icon
export const getFileTypeIcon = (type) => {
  const icons = {
    'excel': '📊',
    'pdf': '📄',
    'powerpoint': '📈',
    'csv': '📋',
    'json': '📦'
  };
  return icons[type] || '📁';
};

// Validate source data structure
export const validateSourceData = (source) => {
  const requiredFields = ['id', 'name', 'type', 'category', 'path'];
  const missing = requiredFields.filter(field => !source[field]);
  
  if (missing.length > 0) {
    return {
      valid: false,
      errors: [`Missing required fields: ${missing.join(', ')}`]
    };
  }
  
  return { valid: true, errors: [] };
};

// Group sources by category
export const groupSourcesByCategory = (sources) => {
  return sources.reduce((groups, source) => {
    const category = source.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(source);
    return groups;
  }, {});
};

// Get category statistics
export const getCategoryStats = (sources) => {
  const stats = {};
  const grouped = groupSourcesByCategory(sources);
  
  Object.keys(grouped).forEach(category => {
    const categorySources = grouped[category];
    stats[category] = {
      total: categorySources.length,
      upToDate: categorySources.filter(s => getFileStatus(s).status === 'up-to-date').length,
      needsRefresh: categorySources.filter(s => isRefreshRecommended(s)).length,
      lastRefreshed: Math.max(...categorySources.map(s => new Date(s.lastRefreshed || 0)))
    };
  });
  
  return stats;
};

// Export all monitoring utilities
const dataSourceMonitor = {
  calculateFileHash,
  hasFileChanged,
  formatFileSize,
  getFileStatus,
  parseChangeSummary,
  generateChangeReport,
  isRefreshRecommended,
  getRefreshFrequencyLabel,
  getDaysSinceRefresh,
  formatDate,
  getFileTypeIcon,
  validateSourceData,
  groupSourcesByCategory,
  getCategoryStats
};

export default dataSourceMonitor;