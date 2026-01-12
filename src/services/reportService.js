/**
 * Report Service
 * Handles loading, saving, and managing report configurations
 *
 * Note: In a browser environment, we can't directly write to the file system.
 * This service uses localStorage for persistence during development,
 * with the JSON files as the initial source of truth.
 */

// Storage key prefix
const STORAGE_PREFIX = 'hr-reports-';

/**
 * Get storage key for a report
 */
const getStorageKey = (reportId) => `${STORAGE_PREFIX}${reportId}`;

/**
 * Load report index from localStorage or initial JSON
 */
export const loadReportsIndex = async () => {
  try {
    // Check localStorage first for any updates
    const stored = localStorage.getItem(`${STORAGE_PREFIX}index`);
    if (stored) {
      return JSON.parse(stored);
    }

    // Fall back to initial JSON file
    const indexModule = await import('../data/reports/index.json');
    return indexModule.default || indexModule;
  } catch (error) {
    console.error('Error loading reports index:', error);
    return null;
  }
};

/**
 * Load a specific report by ID
 */
export const loadReport = async (reportId) => {
  try {
    // Check localStorage first for any updates
    const stored = localStorage.getItem(getStorageKey(reportId));
    if (stored) {
      return JSON.parse(stored);
    }

    // Fall back to JSON file
    const reportModule = await import(`../data/reports/${reportId}.json`);
    return reportModule.default || reportModule;
  } catch (error) {
    console.error(`Error loading report ${reportId}:`, error);
    return null;
  }
};

/**
 * Save report data to localStorage
 */
export const saveReport = (reportId, reportData) => {
  try {
    const dataToSave = {
      ...reportData,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    localStorage.setItem(getStorageKey(reportId), JSON.stringify(dataToSave));
    console.log(`Report ${reportId} saved to localStorage`);
    return true;
  } catch (error) {
    console.error(`Error saving report ${reportId}:`, error);
    return false;
  }
};

/**
 * Save reports index to localStorage
 */
export const saveReportsIndex = (indexData) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}index`, JSON.stringify(indexData));
    return true;
  } catch (error) {
    console.error('Error saving reports index:', error);
    return false;
  }
};

/**
 * Update page order in a report
 */
export const updatePageOrder = async (reportId, newPageOrder) => {
  try {
    const report = await loadReport(reportId);
    if (!report) return false;

    // Update pages with new order
    report.pages = newPageOrder.map((page, index) => ({
      ...page,
      order: index + 1
    }));

    return saveReport(reportId, report);
  } catch (error) {
    console.error('Error updating page order:', error);
    return false;
  }
};

/**
 * Update page status
 */
export const updatePageStatus = async (reportId, pageId, newStatus) => {
  try {
    const report = await loadReport(reportId);
    if (!report) return false;

    // Find and update the page
    const pageIndex = report.pages.findIndex(p => p.id === pageId);
    if (pageIndex === -1) return false;

    report.pages[pageIndex] = {
      ...report.pages[pageIndex],
      status: newStatus
    };

    return saveReport(reportId, report);
  } catch (error) {
    console.error('Error updating page status:', error);
    return false;
  }
};

/**
 * Export report data as JSON (for download)
 */
export const exportReportAsJSON = async (reportId) => {
  try {
    const report = await loadReport(reportId);
    if (!report) return null;

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);

    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error exporting report:', error);
    return false;
  }
};

/**
 * Reset report to original JSON file (clear localStorage version)
 */
export const resetReport = (reportId) => {
  try {
    localStorage.removeItem(getStorageKey(reportId));
    console.log(`Report ${reportId} reset to original`);
    return true;
  } catch (error) {
    console.error('Error resetting report:', error);
    return false;
  }
};

/**
 * Clear all stored report data
 */
export const clearAllStoredReports = () => {
  try {
    const keys = Object.keys(localStorage).filter(key =>
      key.startsWith(STORAGE_PREFIX)
    );
    keys.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keys.length} stored reports`);
    return true;
  } catch (error) {
    console.error('Error clearing stored reports:', error);
    return false;
  }
};

/**
 * Check if report has unsaved changes in localStorage
 */
export const hasStoredChanges = (reportId) => {
  return localStorage.getItem(getStorageKey(reportId)) !== null;
};

export default {
  loadReportsIndex,
  loadReport,
  saveReport,
  saveReportsIndex,
  updatePageOrder,
  updatePageStatus,
  exportReportAsJSON,
  resetReport,
  clearAllStoredReports,
  hasStoredChanges
};
