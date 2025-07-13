/**
 * Quarter Comparison Service
 * Provides dynamic quarter-to-quarter percentage change calculations
 * Replaces stored percentage change fields with real-time calculations
 */

import quarterConfigService, { getPreviousQuarter } from './QuarterConfigService.js';
import firebaseService from './FirebaseService.js';
import { toAppFormat, toFirebaseFormat, debugQuarterFormat } from '../utils/quarterFormatUtils.js';

class QuarterComparisonService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Calculate percentage change between two values
   * @param {number} currentValue - Current period value
   * @param {number} previousValue - Previous period value  
   * @returns {number|null} Percentage change or null if cannot calculate
   */
  calculatePercentageChange(currentValue, previousValue) {
    // Handle invalid or missing values
    if (currentValue === null || currentValue === undefined || 
        previousValue === null || previousValue === undefined) {
      return null;
    }

    // Convert to numbers and validate
    const current = Number(currentValue);
    const previous = Number(previousValue);
    
    if (isNaN(current) || isNaN(previous)) {
      return null;
    }

    // Cannot calculate if previous value is zero (would result in infinity)
    if (previous === 0) {
      return current === 0 ? 0 : null; // 0 to 0 = 0% change, 0 to anything = can't calculate
    }

    // Calculate percentage change: ((current - previous) / previous) * 100
    const percentageChange = ((current - previous) / previous) * 100;
    
    // Round to 1 decimal place to match existing display format
    return Math.round(percentageChange * 10) / 10;
  }

  /**
   * Get quarter data for comparison calculations
   * @param {string} quarterId - Quarter ID (e.g., 'Q1-2025')
   * @returns {Promise<Object|null>} Quarter data from Firebase or null if not found
   */
  async getQuarterData(quarterId) {
    if (!quarterId) return null;

    // Check cache first
    const cacheKey = `quarter_data_${quarterId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // Convert quarter format for Firebase if needed (Q1-2025 -> 2025-Q1)
      const firebaseQuarterId = this.convertToFirebaseFormat(quarterId);
      const quarterData = await firebaseService.getWorkforceMetrics(firebaseQuarterId);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: quarterData,
        timestamp: Date.now()
      });

      return quarterData;
    } catch (error) {
      console.error(`Error fetching quarter data for ${quarterId}:`, error);
      return null;
    }
  }

  /**
   * Convert quarter ID to Firebase format if needed
   * @param {string} quarterId - Quarter ID in various formats
   * @returns {string} Firebase-compatible quarter ID
   */
  convertToFirebaseFormat(quarterId) {
    // If already in Firebase format (2025-Q1), return as-is
    if (/^\d{4}-Q\d$/.test(quarterId)) {
      return quarterId;
    }
    
    // Convert "Q1-2025" to "2025-Q1" format
    const quarterMatch = quarterId.match(/Q(\d)-(\d{4})/);
    if (quarterMatch) {
      const [, quarter, year] = quarterMatch;
      return `${year}-Q${quarter}`;
    }
    
    // Default return as-is if format is unrecognized
    return quarterId;
  }

  /**
   * Calculate dynamic percentage changes for workforce metrics
   * @param {string} currentQuarterId - Current quarter ID
   * @param {Object} currentData - Current quarter data
   * @returns {Promise<Object>} Object containing percentage changes or null values
   */
  async calculateWorkforceChanges(currentQuarterId, currentData) {
    console.log('🔍 calculateWorkforceChanges called:', { currentQuarterId, currentDataKeys: Object.keys(currentData || {}) });
    
    if (!currentQuarterId || !currentData) {
      console.log('❌ Missing currentQuarterId or currentData');
      return {
        totalChange: null,
        facultyChange: null, 
        staffChange: null,
        studentsChange: null
      };
    }

    // Debug quarter format for troubleshooting
    debugQuarterFormat(currentQuarterId, 'calculateWorkforceChanges input');

    // Convert quarter ID to App format for QuarterConfigService compatibility
    const appFormatQuarterId = toAppFormat(currentQuarterId);
    console.log('🔧 Quarter format conversion:', { 
      original: currentQuarterId, 
      appFormat: appFormatQuarterId 
    });

    // Get previous quarter information using App format
    const previousQuarter = getPreviousQuarter(appFormatQuarterId);
    console.log('📅 Previous quarter lookup:', { 
      currentQuarterId, 
      appFormatQuarterId,
      previousQuarter: previousQuarter?.value 
    });
    
    if (!previousQuarter) {
      // No previous quarter available (e.g., first quarter in system)
      console.log('❌ No previous quarter found for:', currentQuarterId);
      return {
        totalChange: null,
        facultyChange: null,
        staffChange: null,
        studentsChange: null
      };
    }

    // Convert previous quarter to Firebase format for data retrieval
    const firebaseFormatPrevious = toFirebaseFormat(previousQuarter.value);
    console.log('🔄 Fetching previous quarter data:', {
      appFormat: previousQuarter.value,
      firebaseFormat: firebaseFormatPrevious
    });
    
    const previousData = await this.getQuarterData(firebaseFormatPrevious);
    console.log('📊 Previous quarter data:', previousData ? { 
      found: true, 
      totalEmployees: previousData.totalEmployees,
      demographics: previousData.demographics 
    } : 'Not found');
    
    if (!previousData) {
      // Previous quarter data not available
      console.log('❌ Previous quarter data not available for:', previousQuarter.value);
      return {
        totalChange: null,
        facultyChange: null,
        staffChange: null,
        studentsChange: null
      };
    }

    // Extract current values - handle both direct and nested structure
    const currentTotal = currentData.totalEmployees || 0;
    const currentFaculty = currentData.demographics?.faculty || currentData.faculty || 0;
    const currentStaff = currentData.demographics?.staff || currentData.staff || 0;
    const currentStudents = currentData.demographics?.students || currentData.students || 0;
    const currentNewHires = (currentData.metrics?.recentHires?.faculty || 0) + (currentData.metrics?.recentHires?.staff || 0);
    const currentDepartures = currentData.departures || 0;

    // Extract previous values - handle both direct and nested structure  
    const previousTotal = previousData.totalEmployees || 0;
    const previousFaculty = previousData.demographics?.faculty || previousData.faculty || 0;
    const previousStaff = previousData.demographics?.staff || previousData.staff || 0;
    const previousStudents = previousData.demographics?.students || previousData.students || 0;
    const previousNewHires = (previousData.metrics?.recentHires?.faculty || 0) + (previousData.metrics?.recentHires?.staff || 0);
    const previousDepartures = previousData.departures || 0;

    console.log('🧮 Calculation values:', {
      current: { currentTotal, currentFaculty, currentStaff, currentStudents, currentNewHires, currentDepartures },
      previous: { previousTotal, previousFaculty, previousStaff, previousStudents, previousNewHires, previousDepartures }
    });

    // Calculate percentage changes
    const totalChange = this.calculatePercentageChange(currentTotal, previousTotal);
    const facultyChange = this.calculatePercentageChange(currentFaculty, previousFaculty);
    const staffChange = this.calculatePercentageChange(currentStaff, previousStaff);
    const studentsChange = this.calculatePercentageChange(currentStudents, previousStudents);
    const newHiresChange = this.calculatePercentageChange(currentNewHires, previousNewHires);
    const deparuresChange = this.calculatePercentageChange(currentDepartures, previousDepartures);

    console.log('📈 Calculated percentage changes:', {
      totalChange, facultyChange, staffChange, studentsChange, newHiresChange, deparuresChange
    });

    return {
      totalChange,
      facultyChange,
      staffChange,
      studentsChange,
      newHiresChange,
      deparuresChange,
      
      // Additional metadata for debugging/validation
      metadata: {
        currentQuarter: currentQuarterId,
        currentQuarterApp: appFormatQuarterId,
        previousQuarter: previousQuarter.value,
        previousQuarterFirebase: firebaseFormatPrevious,
        currentValues: { currentTotal, currentFaculty, currentStaff, currentStudents, currentNewHires, currentDepartures },
        previousValues: { previousTotal, previousFaculty, previousStaff, previousStudents, previousNewHires, previousDepartures }
      }
    };
  }

  /**
   * Calculate percentage changes for any metric between quarters
   * @param {string} currentQuarterId - Current quarter ID
   * @param {string} metricPath - Path to metric in data structure (e.g., 'demographics.faculty')
   * @param {Object} currentData - Current quarter data (optional, will fetch if not provided)
   * @returns {Promise<number|null>} Percentage change or null
   */
  async calculateMetricChange(currentQuarterId, metricPath, currentData = null) {
    // Get current data if not provided
    if (!currentData) {
      currentData = await this.getQuarterData(currentQuarterId);
      if (!currentData) return null;
    }

    // Get previous quarter
    const previousQuarter = getPreviousQuarter(currentQuarterId);
    if (!previousQuarter) return null;

    // Get previous data
    const previousData = await this.getQuarterData(previousQuarter.value);
    if (!previousData) return null;

    // Extract values using path
    const currentValue = this.getValueByPath(currentData, metricPath);
    const previousValue = this.getValueByPath(previousData, metricPath);

    return this.calculatePercentageChange(currentValue, previousValue);
  }

  /**
   * Get value from object using dot notation path
   * @param {Object} obj - Object to extract value from
   * @param {string} path - Dot notation path (e.g., 'demographics.faculty')
   * @returns {any} Value at path or null
   */
  getValueByPath(obj, path) {
    if (!obj || !path) return null;
    
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * Get the previous quarter for a given quarter ID
   * @param {string} quarterId - Quarter ID
   * @returns {Object|null} Previous quarter object or null
   */
  getPreviousQuarter(quarterId) {
    return getPreviousQuarter(quarterId);
  }

  /**
   * Check if a quarter has previous quarter data available
   * @param {string} quarterId - Quarter ID to check
   * @returns {boolean} True if previous quarter data is available
   */
  hasPreviousQuarter(quarterId) {
    const previousQuarter = getPreviousQuarter(quarterId);
    return previousQuarter !== null;
  }

  /**
   * Clear cache (useful for testing or force refresh)
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics for debugging
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [key, value] of this.cache.entries()) {
      if ((now - value.timestamp) < this.cacheTimeout) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      cacheTimeoutMs: this.cacheTimeout
    };
  }

  /**
   * Create enhanced summary data with dynamic percentage calculations
   * @param {string} quarterId - Current quarter ID
   * @param {Object} quarterData - Current quarter raw data
   * @returns {Promise<Object>} Enhanced summary with dynamic percentage changes
   */
  async createEnhancedSummary(quarterId, quarterData) {
    console.log('🚀 createEnhancedSummary called:', { quarterId, quarterData });
    
    if (!quarterId || !quarterData) {
      console.log('❌ Missing quarterId or quarterData in createEnhancedSummary');
      return null;
    }

    // Calculate dynamic percentage changes
    console.log('⚡ Calculating workforce changes...');
    const changes = await this.calculateWorkforceChanges(quarterId, quarterData);
    console.log('📈 Calculated changes:', changes);

    // Create enhanced summary structure compatible with existing dashboard expectations
    return {
      // Raw values (unchanged)
      totalEmployees: quarterData.totalEmployees || 0,
      faculty: quarterData.demographics?.faculty || 0,
      staff: quarterData.demographics?.staff || 0,
      students: quarterData.demographics?.students || 0,
      
      // Dynamic percentage changes (calculated, not stored)
      employeeChange: changes.totalChange,
      facultyChange: changes.facultyChange,
      staffChange: changes.staffChange,
      studentsChange: changes.studentsChange,
      newHiresChange: changes.newHiresChange,
      deparuresChange: changes.deparuresChange,
      
      // Additional metrics for dashboard compatibility  
      recentHires: (quarterData.metrics?.recentHires?.faculty || 0) + (quarterData.metrics?.recentHires?.staff || 0),
      departures: quarterData.departures || 0,
      
      // Metadata for validation and debugging
      _dynamicCalculation: true,
      _sourceQuarter: quarterId,
      _previousQuarter: changes.metadata?.previousQuarter || null,
      _calculatedAt: new Date().toISOString()
    };
  }
}

// Create and export singleton instance
const quarterComparisonService = new QuarterComparisonService();

// Export service methods
export const calculatePercentageChange = (current, previous) => 
  quarterComparisonService.calculatePercentageChange(current, previous);

export const calculateWorkforceChanges = (quarterId, currentData) => 
  quarterComparisonService.calculateWorkforceChanges(quarterId, currentData);

export const calculateMetricChange = (quarterId, metricPath, currentData) =>
  quarterComparisonService.calculateMetricChange(quarterId, metricPath, currentData);

export const getQuarterData = (quarterId) => 
  quarterComparisonService.getQuarterData(quarterId);

export const hasPreviousQuarter = (quarterId) =>
  quarterComparisonService.hasPreviousQuarter(quarterId);

export const createEnhancedSummary = (quarterId, quarterData) =>
  quarterComparisonService.createEnhancedSummary(quarterId, quarterData);

export const clearCache = () => quarterComparisonService.clearCache();
export const getCacheStats = () => quarterComparisonService.getCacheStats();

export default quarterComparisonService;