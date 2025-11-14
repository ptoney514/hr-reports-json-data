/**
 * Audit Trail Generator
 *
 * Functions for:
 * - Creating comprehensive audit trails for data imports
 * - Documenting data transformations
 * - Tracking data quality metrics
 * - Generating markdown reports
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate timestamp in ISO format
 *
 * @returns {string} ISO timestamp
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Format file size in human-readable format
 *
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "1.5 MB")
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Calculate data quality score
 *
 * @param {Object} stats - Statistics about data quality
 * @returns {number} Quality score (0-100)
 */
function calculateQualityScore(stats) {
  const {
    totalRows = 0,
    validRows = 0,
    missingFields = 0,
    duplicates = 0
  } = stats;

  if (totalRows === 0) return 0;

  const validityScore = (validRows / totalRows) * 40;
  const completenessScore = (1 - (missingFields / (totalRows * 10))) * 30; // Assuming ~10 fields per row
  const uniquenessScore = (1 - (duplicates / totalRows)) * 30;

  const totalScore = validityScore + Math.max(0, completenessScore) + Math.max(0, uniquenessScore);

  return Math.round(Math.min(100, totalScore));
}

/**
 * Create audit trail object
 *
 * @param {Object} metadata - Metadata about the data import
 * @returns {Object} Audit trail object
 */
function createAuditTrail(metadata) {
  const {
    source,
    sourceFile,
    dataType,
    fiscalPeriod,
    processedBy = 'data-import-script',
    stats = {}
  } = metadata;

  return {
    timestamp: getTimestamp(),
    source,
    sourceFile: sourceFile ? path.basename(sourceFile) : 'unknown',
    dataType,
    fiscalPeriod,
    processedBy,
    stats,
    qualityScore: calculateQualityScore(stats),
    version: '1.0.0'
  };
}

/**
 * Generate markdown audit report
 *
 * @param {Object} auditTrail - Audit trail object
 * @param {Object} details - Additional details for report
 * @returns {string} Markdown formatted report
 */
function generateAuditReport(auditTrail, details = {}) {
  const {
    timestamp,
    source,
    sourceFile,
    dataType,
    fiscalPeriod,
    processedBy,
    stats,
    qualityScore
  } = auditTrail;

  const {
    transformations = [],
    validationResults = {},
    warnings = [],
    piiRemoved = []
  } = details;

  let report = '';

  // Header
  report += '# Data Import Audit Trail\n\n';
  report += `**Generated:** ${timestamp}\n\n`;
  report += '---\n\n';

  // Source Information
  report += '## Source Information\n\n';
  report += `- **Data Type:** ${dataType}\n`;
  report += `- **Fiscal Period:** ${fiscalPeriod}\n`;
  report += `- **Source:** ${source}\n`;
  report += `- **Source File:** ${sourceFile}\n`;
  report += `- **Processed By:** ${processedBy}\n\n`;

  // Data Statistics
  report += '## Data Statistics\n\n';
  report += `- **Total Rows:** ${stats.totalRows || 0}\n`;
  report += `- **Valid Rows:** ${stats.validRows || 0}\n`;
  report += `- **Invalid Rows:** ${stats.invalidRows || 0}\n`;
  report += `- **Duplicates Removed:** ${stats.duplicatesRemoved || 0}\n`;
  report += `- **Empty Rows Skipped:** ${stats.emptyRowsSkipped || 0}\n\n`;

  // Quality Score
  report += '## Data Quality Score\n\n';
  report += `**${qualityScore}/100**\n\n`;

  const qualityLevel =
    qualityScore >= 90 ? '🟢 Excellent' :
    qualityScore >= 70 ? '🟡 Good' :
    qualityScore >= 50 ? '🟠 Fair' :
    '🔴 Poor';

  report += `Quality Level: ${qualityLevel}\n\n`;

  // Transformations Applied
  if (transformations.length > 0) {
    report += '## Transformations Applied\n\n';
    transformations.forEach((transform, index) => {
      report += `${index + 1}. ${transform}\n`;
    });
    report += '\n';
  }

  // PII Removal
  if (piiRemoved.length > 0) {
    report += '## PII Fields Removed\n\n';
    piiRemoved.forEach(field => {
      report += `- ${field}\n`;
    });
    report += '\n';
    report += '⚠️ **Manual review required** to ensure no PII in free-text fields.\n\n';
  }

  // Validation Results
  if (validationResults.errors && validationResults.errors.length > 0) {
    report += '## Validation Errors\n\n';
    validationResults.errors.forEach(error => {
      report += `❌ ${error}\n\n`;
    });
  }

  // Warnings
  if (warnings.length > 0) {
    report += '## Warnings\n\n';
    warnings.forEach(warning => {
      report += `⚠️ ${warning}\n\n`;
    });
  }

  // Next Steps
  report += '## Next Steps\n\n';
  report += '1. Review this audit trail for accuracy\n';
  report += '2. Verify data quality score is acceptable (>70)\n';
  report += '3. Check for PII in comments/free-text fields\n';
  report += '4. Test dashboard with new data\n';
  report += '5. Commit cleaned data to git (never commit raw files)\n\n';

  // Footer
  report += '---\n\n';
  report += `*Audit trail generated by ${processedBy} at ${timestamp}*\n`;

  return report;
}

/**
 * Save audit trail to file
 *
 * @param {string} auditReport - Markdown audit report
 * @param {string} outputPath - Path to save audit file
 * @returns {string} Path to saved file
 */
function saveAuditTrail(auditReport, outputPath) {
  fs.writeFileSync(outputPath, auditReport, 'utf8');
  return outputPath;
}

/**
 * Create transformation log entry
 *
 * @param {string} action - Action performed
 * @param {Object} details - Details about transformation
 * @returns {string} Formatted log entry
 */
function logTransformation(action, details = {}) {
  const timestamp = new Date().toLocaleTimeString();
  const detailsStr = Object.entries(details)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  return `[${timestamp}] ${action}${detailsStr ? ` (${detailsStr})` : ''}`;
}

/**
 * Generate comparison report between old and new data
 *
 * @param {Object} oldData - Previous data
 * @param {Object} newData - New data
 * @returns {string} Markdown comparison report
 */
function generateComparisonReport(oldData, newData) {
  let report = '# Data Comparison Report\n\n';

  const oldCount = oldData.length || 0;
  const newCount = newData.length || 0;
  const diff = newCount - oldCount;
  const percentChange = oldCount > 0 ? ((diff / oldCount) * 100).toFixed(1) : 'N/A';

  report += '## Record Count Comparison\n\n';
  report += `- **Previous:** ${oldCount} records\n`;
  report += `- **New:** ${newCount} records\n`;
  report += `- **Change:** ${diff >= 0 ? '+' : ''}${diff} (${percentChange}%)\n\n`;

  // Field comparison
  if (oldData.length > 0 && newData.length > 0) {
    const oldFields = Object.keys(oldData[0] || {});
    const newFields = Object.keys(newData[0] || {});

    const addedFields = newFields.filter(f => !oldFields.includes(f));
    const removedFields = oldFields.filter(f => !newFields.includes(f));

    if (addedFields.length > 0 || removedFields.length > 0) {
      report += '## Schema Changes\n\n';

      if (addedFields.length > 0) {
        report += '**Added Fields:**\n';
        addedFields.forEach(field => report += `- ✅ ${field}\n`);
        report += '\n';
      }

      if (removedFields.length > 0) {
        report += '**Removed Fields:**\n';
        removedFields.forEach(field => report += `- ❌ ${field}\n`);
        report += '\n';
      }
    }
  }

  return report;
}

/**
 * Create summary statistics for data
 *
 * @param {Array<Object>} data - Data array
 * @param {string[]} numericFields - Fields to calculate stats for
 * @returns {Object} Summary statistics
 */
function calculateSummaryStats(data, numericFields = []) {
  const stats = {
    count: data.length,
    fields: {}
  };

  numericFields.forEach(field => {
    const values = data
      .map(row => row[field])
      .filter(val => typeof val === 'number' && !isNaN(val));

    if (values.length > 0) {
      stats.fields[field] = {
        count: values.length,
        sum: values.reduce((a, b) => a + b, 0),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values)
      };
    }
  });

  return stats;
}

/**
 * Generate data profiling report
 *
 * @param {Array<Object>} data - Data to profile
 * @returns {string} Markdown profiling report
 */
function generateProfilingReport(data) {
  let report = '# Data Profiling Report\n\n';

  if (data.length === 0) {
    report += 'No data to profile.\n';
    return report;
  }

  report += `**Total Records:** ${data.length}\n\n`;

  // Get all unique fields
  const allFields = new Set();
  data.forEach(row => {
    Object.keys(row).forEach(key => allFields.add(key));
  });

  report += '## Field Analysis\n\n';
  report += '| Field | Type | Non-Empty | Empty | % Complete |\n';
  report += '|-------|------|-----------|-------|------------|\n';

  Array.from(allFields).forEach(field => {
    const nonEmpty = data.filter(row => row[field] !== null && row[field] !== undefined && row[field] !== '').length;
    const empty = data.length - nonEmpty;
    const percentComplete = ((nonEmpty / data.length) * 100).toFixed(1);

    // Infer type from first non-empty value
    const sampleValue = data.find(row => row[field] !== null && row[field] !== undefined && row[field] !== '');
    const type = sampleValue ? typeof sampleValue[field] : 'unknown';

    report += `| ${field} | ${type} | ${nonEmpty} | ${empty} | ${percentComplete}% |\n`;
  });

  report += '\n';

  return report;
}

module.exports = {
  getTimestamp,
  formatFileSize,
  calculateQualityScore,
  createAuditTrail,
  generateAuditReport,
  saveAuditTrail,
  logTransformation,
  generateComparisonReport,
  calculateSummaryStats,
  generateProfilingReport
};
