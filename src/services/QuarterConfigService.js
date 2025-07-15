/**
 * Quarter Configuration Service
 * Manages dynamic quarter configuration and provides API compatible with hardcoded QUARTER_DATES
 */

import quarterConfig from '../config/quarterConfig.json';
import { format, parse, addMonths, startOfQuarter, endOfQuarter } from 'date-fns';

class QuarterConfigService {
  constructor() {
    // Initialize with empty arrays to prevent undefined errors
    this.quarters = [];
    this.config = null;
    
    // Cache for expensive operations to prevent infinite re-renders
    this._cache = {
      currentReportingPeriod: null,
      last5Periods: null,
      quarters: null,
      cacheTimestamp: null
    };
    
    try {
      // Validate imported config
      if (!quarterConfig) {
        console.error('Quarter config not found, using fallback configuration');
        this.config = this.getDefaultConfig();
        this.quarters = this.config.quarters || [];
        return;
      }

      // Support both old 'quarters' and new 'periods' structure
      const periods = quarterConfig.periods || quarterConfig.quarters;
      if (!periods || !Array.isArray(periods)) {
        console.error('Invalid config structure, using fallback configuration');
        this.config = this.getDefaultConfig();
        this.quarters = this.config.quarters || [];
        return;
      }

      // Config is valid, use it
      this.config = quarterConfig;
      this.quarters = periods;
      
      console.log('QuarterConfigService initialized successfully with', this.quarters.length, 'quarters');
    } catch (error) {
      console.error('Error initializing QuarterConfigService:', error);
      try {
        this.config = this.getDefaultConfig();
        this.quarters = this.config.quarters || [];
      } catch (fallbackError) {
        console.error('Even fallback config failed:', fallbackError);
        // Ultimate fallback - minimal working configuration
        this.quarters = [
          {
            id: 'Q1-2025',
            label: 'Q1 2025 (3/31/2025)',
            quarter: 'Q1-2025',
            end_date: '2025-03-31',
            start_date: '2025-01-01',
            active: true,
            fiscal_year: 2025,
            display_order: 1
          }
        ];
        this.config = { quarters: this.quarters };
      }
    }
  }

  /**
   * Get default configuration as fallback
   * @returns {Object} Default quarter configuration
   */
  getDefaultConfig() {
    return {
      fiscal_year_start: "July",
      fiscal_year_type: "calendar",
      auto_generate_future_quarters: true,
      quarters: [
        {
          id: "Q1-2024",
          label: "Q1 2024 (3/31/2024)",
          quarter: "Q1-2024",
          end_date: "2024-03-31",
          start_date: "2024-01-01",
          active: true,
          fiscal_year: 2024,
          display_order: 1
        },
        {
          id: "Q2-2024",
          label: "Q2 2024 (6/30/2024)",
          quarter: "Q2-2024",
          end_date: "2024-06-30",
          start_date: "2024-04-01",
          active: true,
          fiscal_year: 2024,
          display_order: 2
        },
        {
          id: "Q3-2024",
          label: "Q3 2024 (9/30/2024)",
          quarter: "Q3-2024",
          end_date: "2024-09-30",
          start_date: "2024-07-01",
          active: true,
          fiscal_year: 2024,
          display_order: 3
        },
        {
          id: "Q4-2024",
          label: "Q4 2024 (12/31/2024)",
          quarter: "Q4-2024",
          end_date: "2024-12-31",
          start_date: "2024-10-01",
          active: true,
          fiscal_year: 2024,
          display_order: 4
        },
        {
          id: "Q1-2025",
          label: "Q1 2025 (3/31/2025)",
          quarter: "Q1-2025",
          end_date: "2025-03-31",
          start_date: "2025-01-01",
          active: true,
          fiscal_year: 2025,
          display_order: 5
        }
      ]
    };
  }

  /**
   * Get all active quarters in format compatible with original QUARTER_DATES - MEMOIZED
   * @returns {Array} Array of quarter objects with value, label, quarter, dateValue
   */
  getQuarters() {
    // Return cached result if valid
    if (this._isCacheValid() && this._cache.quarters) {
      return this._cache.quarters;
    }

    if (!this.quarters || !Array.isArray(this.quarters)) {
      console.error('Quarters not available in getQuarters()');
      return [];
    }
    
    try {
      const result = this.quarters
        .filter(q => q && q.active)
        .sort((a, b) => a.display_order - b.display_order)
        .map(quarter => ({
          value: quarter.id,
          label: quarter.label,
          quarter: quarter.quarter,
          dateValue: quarter.end_date,
          startDate: quarter.start_date,
          fiscalYear: quarter.fiscal_year
        }));

      // Cache the result
      this._cache.quarters = result;
      this._cache.cacheTimestamp = Date.now();
      
      return result;
    } catch (error) {
      console.warn('Error getting quarters:', error);
      return [];
    }
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
   * Clear cache to force recalculation
   * @private
   */
  _clearCache() {
    this._cache = {
      currentReportingPeriod: null,
      last5Periods: null,
      quarters: null,
      cacheTimestamp: null
    };
  }

  /**
   * Check if cache is valid (expires after 5 minutes)
   * @private
   */
  _isCacheValid() {
    if (!this._cache.cacheTimestamp) return false;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    return (now - this._cache.cacheTimestamp) < fiveMinutes;
  }

  /**
   * Get the current reporting date (fixed at 6/30/2025)
   * @returns {string} Current reporting date
   */
  getCurrentReportingDate() {
    return this.config?.current_reporting_date || '2025-06-30';
  }

  /**
   * Get the current reporting period (Q2-2025 for 6/30/2025) - MEMOIZED
   * @returns {Object|null} Current reporting period object
   */
  getCurrentReportingPeriod() {
    // Return cached result if valid
    if (this._isCacheValid() && this._cache.currentReportingPeriod) {
      return this._cache.currentReportingPeriod;
    }

    try {
      const reportingDate = this.getCurrentReportingDate();
      const currentPeriod = this.quarters.find(q => 
        q.is_current || q.end_date === reportingDate
      );
      
      const result = currentPeriod ? this.getQuarterById(currentPeriod.id) : {
        value: 'Q2-2025',
        label: '6/30/2025',
        quarter: 'Q2-2025',
        dateValue: '2025-06-30',
        startDate: '2025-04-01',
        fiscalYear: 2025,
        active: true
      };

      // Cache the result
      this._cache.currentReportingPeriod = result;
      this._cache.cacheTimestamp = Date.now();
      
      return result;
    } catch (error) {
      console.warn('Error getting current reporting period:', error);
      // Return fallback
      return {
        value: 'Q2-2025',
        label: '6/30/2025',
        quarter: 'Q2-2025',
        dateValue: '2025-06-30',
        startDate: '2025-04-01',
        fiscalYear: 2025,
        active: true
      };
    }
  }

  /**
   * Get the last 5 periods from current reporting date for time-series - MEMOIZED
   * @returns {Array} Array of 5 periods ending with current reporting period
   */
  getLast5Periods() {
    // Return cached result if valid
    if (this._isCacheValid() && this._cache.last5Periods) {
      return this._cache.last5Periods;
    }

    try {
      const currentPeriod = this.getCurrentReportingPeriod();
      if (!currentPeriod) {
        this._cache.last5Periods = [];
        return [];
      }

      const allPeriods = this.getQuarters();
      const currentIndex = allPeriods.findIndex(q => q.value === currentPeriod.value);
      
      if (currentIndex === -1) {
        this._cache.last5Periods = [];
        return [];
      }

      // Get 5 periods including current (so 4 back + current)
      const startIndex = Math.max(0, currentIndex - 4);
      const result = allPeriods.slice(startIndex, currentIndex + 1);
      
      // Cache the result
      this._cache.last5Periods = result;
      this._cache.cacheTimestamp = Date.now();
      
      return result;
    } catch (error) {
      console.warn('Error getting last 5 periods:', error);
      this._cache.last5Periods = [];
      return [];
    }
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
    if (!this.quarters || !Array.isArray(this.quarters)) {
      console.error('Quarters not available in getPreviousQuarter()');
      return null;
    }
    
    const quarter = this.quarters.find(q => q && q.id === quarterId);
    if (!quarter) return null;

    const quarters = this.getQuarters();
    if (!quarters || quarters.length === 0) {
      console.error('No quarters available from getQuarters()');
      return null;
    }
    
    const currentIndex = quarters.findIndex(q => q && q.value === quarterId);
    
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
      this._clearCache(); // Clear cache when data changes
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

      this._clearCache(); // Clear cache when data changes
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

// Export service functions - but bind them to the service instance
export const getQuarters = () => quarterConfigService.getQuarters();
export const getQuarterById = (id) => quarterConfigService.getQuarterById(id);
export const getMostRecentQuarter = () => quarterConfigService.getMostRecentQuarter();
export const getCurrentQuarter = () => quarterConfigService.getCurrentQuarter();
export const getCurrentReportingDate = () => quarterConfigService.getCurrentReportingDate();
export const getCurrentReportingPeriod = () => quarterConfigService.getCurrentReportingPeriod();
export const getLast5Periods = () => quarterConfigService.getLast5Periods();
export const getPreviousQuarter = (id) => quarterConfigService.getPreviousQuarter(id);
export const getNextQuarter = (id) => quarterConfigService.getNextQuarter(id);
export const isValidQuarterFormat = (id) => quarterConfigService.isValidQuarterFormat(id);
export const dateToQuarterId = (date) => quarterConfigService.dateToQuarterId(date);
export const generateFutureQuarters = (years) => quarterConfigService.generateFutureQuarters(years);
export const addQuarter = (data) => quarterConfigService.addQuarter(data);
export const updateQuarter = (id, updates) => quarterConfigService.updateQuarter(id, updates);
export const deactivateQuarter = (id) => quarterConfigService.deactivateQuarter(id);
export const getMetadata = () => quarterConfigService.getMetadata();
export const exportConfig = () => quarterConfigService.exportConfig();
export const importConfig = (config) => quarterConfigService.importConfig(config);
export const getQuartersByFiscalYear = (year) => quarterConfigService.getQuartersByFiscalYear(year);
export const getFiscalYears = () => quarterConfigService.getFiscalYears();

export default quarterConfigService;