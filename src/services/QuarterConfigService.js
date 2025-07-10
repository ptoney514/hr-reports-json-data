/**
 * Quarter Configuration Service
 * Manages dynamic quarter configuration and provides API compatible with hardcoded QUARTER_DATES
 */

import quarterConfig from '../config/quarterConfig.json';
import { format, parse, addMonths, startOfQuarter, endOfQuarter } from 'date-fns';

class QuarterConfigService {
  constructor() {
    this.config = quarterConfig;
    this.quarters = this.config.quarters;
  }

  /**
   * Get all active quarters in format compatible with original QUARTER_DATES
   * @returns {Array} Array of quarter objects with value, label, quarter, dateValue
   */
  getQuarters() {
    return this.quarters
      .filter(q => q.active)
      .sort((a, b) => a.display_order - b.display_order)
      .map(quarter => ({
        value: quarter.id,
        label: quarter.label,
        quarter: quarter.quarter,
        dateValue: quarter.end_date,
        startDate: quarter.start_date,
        fiscalYear: quarter.fiscal_year
      }));
  }

  /**
   * Get quarters for a specific fiscal year
   * @param {number} fiscalYear - The fiscal year (e.g., 2025)
   * @returns {Array} Quarters for the specified fiscal year
   */
  getQuartersByFiscalYear(fiscalYear) {
    return this.quarters
      .filter(q => q.active && q.fiscal_year === fiscalYear)
      .sort((a, b) => a.display_order - b.display_order)
      .map(quarter => ({
        value: quarter.id,
        label: quarter.label,
        quarter: quarter.quarter,
        dateValue: quarter.end_date,
        startDate: quarter.start_date,
        fiscalYear: quarter.fiscal_year
      }));
  }

  /**
   * Get all fiscal years available
   * @returns {Array} Array of fiscal years
   */
  getFiscalYears() {
    const years = [...new Set(this.quarters.map(q => q.fiscal_year))];
    return years.sort((a, b) => a - b);
  }

  /**
   * Get quarter by ID
   * @param {string} quarterId - Quarter ID (e.g., 'Q1-2025')
   * @returns {Object|null} Quarter object or null if not found
   */
  getQuarterById(quarterId) {
    const quarter = this.quarters.find(q => q.id === quarterId);
    if (!quarter) return null;

    return {
      value: quarter.id,
      label: quarter.label,
      quarter: quarter.quarter,
      dateValue: quarter.end_date,
      startDate: quarter.start_date,
      fiscalYear: quarter.fiscal_year,
      active: quarter.active
    };
  }

  /**
   * Get the most recent quarter (latest end date)
   * @returns {Object|null} Most recent quarter object
   */
  getMostRecentQuarter() {
    const activeQuarters = this.quarters.filter(q => q.active);
    if (activeQuarters.length === 0) return null;

    const mostRecent = activeQuarters.reduce((latest, current) => {
      const latestDate = new Date(latest.end_date);
      const currentDate = new Date(current.end_date);
      return currentDate > latestDate ? current : latest;
    });

    return this.getQuarterById(mostRecent.id);
  }

  /**
   * Get the current quarter based on today's date
   * @returns {Object|null} Current quarter object
   */
  getCurrentQuarter() {
    const today = new Date();
    const currentQuarter = this.quarters.find(q => {
      const startDate = new Date(q.start_date);
      const endDate = new Date(q.end_date);
      return today >= startDate && today <= endDate && q.active;
    });

    return currentQuarter ? this.getQuarterById(currentQuarter.id) : null;
  }

  /**
   * Get previous quarter relative to given quarter
   * @param {string} quarterId - Quarter ID to find previous quarter for
   * @returns {Object|null} Previous quarter object
   */
  getPreviousQuarter(quarterId) {
    const quarter = this.quarters.find(q => q.id === quarterId);
    if (!quarter) return null;

    const quarters = this.getQuarters();
    const currentIndex = quarters.findIndex(q => q.value === quarterId);
    
    if (currentIndex > 0) {
      return quarters[currentIndex - 1];
    }

    return null;
  }

  /**
   * Get next quarter relative to given quarter
   * @param {string} quarterId - Quarter ID to find next quarter for  
   * @returns {Object|null} Next quarter object
   */
  getNextQuarter(quarterId) {
    const quarter = this.quarters.find(q => q.id === quarterId);
    if (!quarter) return null;

    const quarters = this.getQuarters();
    const currentIndex = quarters.findIndex(q => q.value === quarterId);
    
    if (currentIndex >= 0 && currentIndex < quarters.length - 1) {
      return quarters[currentIndex + 1];
    }

    return null;
  }

  /**
   * Validate quarter ID format
   * @param {string} quarterId - Quarter ID to validate
   * @returns {boolean} True if valid format
   */
  isValidQuarterFormat(quarterId) {
    const quarterPattern = /^Q[1-4]-\d{4}$/;
    return quarterPattern.test(quarterId);
  }

  /**
   * Generate quarter ID from date
   * @param {Date|string} date - Date to convert to quarter
   * @returns {string} Quarter ID (e.g., 'Q1-2025')
   */
  dateToQuarterId(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1; // JavaScript months are 0-indexed
    
    let quarter;
    if (month <= 3) quarter = 1;
    else if (month <= 6) quarter = 2;
    else if (month <= 9) quarter = 3;
    else quarter = 4;

    return `Q${quarter}-${year}`;
  }

  /**
   * Auto-generate future quarters
   * @param {number} yearsAhead - Number of years to generate ahead
   * @returns {Array} Array of new quarter objects
   */
  generateFutureQuarters(yearsAhead = 2) {
    const currentYear = new Date().getFullYear();
    const targetYear = currentYear + yearsAhead;
    const newQuarters = [];

    for (let year = currentYear; year <= targetYear; year++) {
      for (let q = 1; q <= 4; q++) {
        const quarterId = `Q${q}-${year}`;
        
        // Skip if quarter already exists
        if (this.quarters.find(quarter => quarter.id === quarterId)) {
          continue;
        }

        // Calculate quarter dates
        const quarterStartMonth = (q - 1) * 3 + 1; // Q1=1, Q2=4, Q3=7, Q4=10
        const startDate = new Date(year, quarterStartMonth - 1, 1); // Month is 0-indexed
        const endDate = new Date(year, quarterStartMonth + 2, 0); // Last day of quarter
        
        const newQuarter = {
          id: quarterId,
          label: `Q${q} ${year} (${format(endDate, 'M/d/yyyy')})`,
          quarter: quarterId,
          end_date: format(endDate, 'yyyy-MM-dd'),
          start_date: format(startDate, 'yyyy-MM-dd'),
          active: true,
          fiscal_year: year,
          display_order: this.quarters.length + newQuarters.length + 1
        };

        newQuarters.push(newQuarter);
      }
    }

    return newQuarters;
  }

  /**
   * Add new quarter to configuration
   * @param {Object} quarterData - Quarter data object
   * @returns {boolean} Success status
   */
  addQuarter(quarterData) {
    try {
      // Validate required fields
      const required = ['id', 'label', 'quarter', 'end_date', 'start_date', 'fiscal_year'];
      for (const field of required) {
        if (!quarterData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate format
      if (!this.isValidQuarterFormat(quarterData.id)) {
        throw new Error(`Invalid quarter ID format: ${quarterData.id}`);
      }

      // Check for duplicates
      if (this.quarters.find(q => q.id === quarterData.id)) {
        throw new Error(`Quarter ${quarterData.id} already exists`);
      }

      // Add quarter with defaults
      const newQuarter = {
        ...quarterData,
        active: quarterData.active !== undefined ? quarterData.active : true,
        display_order: quarterData.display_order || (this.quarters.length + 1)
      };

      this.quarters.push(newQuarter);
      return true;
    } catch (error) {
      console.error('Failed to add quarter:', error);
      return false;
    }
  }

  /**
   * Update quarter configuration
   * @param {string} quarterId - Quarter ID to update
   * @param {Object} updates - Fields to update
   * @returns {boolean} Success status
   */
  updateQuarter(quarterId, updates) {
    try {
      const quarterIndex = this.quarters.findIndex(q => q.id === quarterId);
      if (quarterIndex === -1) {
        throw new Error(`Quarter ${quarterId} not found`);
      }

      // Update quarter
      this.quarters[quarterIndex] = {
        ...this.quarters[quarterIndex],
        ...updates
      };

      return true;
    } catch (error) {
      console.error('Failed to update quarter:', error);
      return false;
    }
  }

  /**
   * Deactivate quarter (soft delete)
   * @param {string} quarterId - Quarter ID to deactivate
   * @returns {boolean} Success status
   */
  deactivateQuarter(quarterId) {
    return this.updateQuarter(quarterId, { active: false });
  }

  /**
   * Get configuration metadata
   * @returns {Object} Configuration metadata
   */
  getMetadata() {
    return {
      ...this.config.metadata,
      totalQuarters: this.quarters.length,
      activeQuarters: this.quarters.filter(q => q.active).length,
      fiscalYearStart: this.config.fiscal_year_start,
      fiscalYearType: this.config.fiscal_year_type
    };
  }

  /**
   * Export configuration for backup
   * @returns {Object} Complete configuration object
   */
  exportConfig() {
    return {
      ...this.config,
      quarters: this.quarters,
      metadata: {
        ...this.config.metadata,
        exported_at: new Date().toISOString()
      }
    };
  }

  /**
   * Import configuration from backup
   * @param {Object} configData - Configuration data to import
   * @returns {boolean} Success status
   */
  importConfig(configData) {
    try {
      // Validate configuration structure
      if (!configData.quarters || !Array.isArray(configData.quarters)) {
        throw new Error('Invalid configuration: missing quarters array');
      }

      // Validate quarters
      for (const quarter of configData.quarters) {
        if (!quarter.id || !this.isValidQuarterFormat(quarter.id)) {
          throw new Error(`Invalid quarter format: ${quarter.id}`);
        }
      }

      // Import configuration
      this.config = { ...configData };
      this.quarters = this.config.quarters;

      return true;
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return false;
    }
  }
}

// Create and export singleton instance
const quarterConfigService = new QuarterConfigService();

// Export compatible QUARTER_DATES for backward compatibility
export const QUARTER_DATES = quarterConfigService.getQuarters();

// Export service functions
export const {
  getQuarters,
  getQuarterById,
  getMostRecentQuarter,
  getCurrentQuarter,
  getPreviousQuarter,
  getNextQuarter,
  isValidQuarterFormat,
  dateToQuarterId,
  generateFutureQuarters,
  addQuarter,
  updateQuarter,
  deactivateQuarter,
  getMetadata,
  exportConfig,
  importConfig,
  getQuartersByFiscalYear,
  getFiscalYears
} = quarterConfigService;

export default quarterConfigService;