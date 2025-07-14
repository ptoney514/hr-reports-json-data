import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Firebase Service for HR Reports Aggregate Data
 * 
 * This service manages aggregate HR metrics (not individual employee records)
 * Optimized for minimal reads/writes with fast dashboard loading
 */
class FirebaseService {
  constructor() {
    this.isOnline = true;
    this.cache = new Map();
  }

  // ==================== WORKFORCE METRICS ====================

  /**
   * Get workforce metrics for a specific period
   * @param {string} period - Period identifier (e.g., "2025-Q1", "2025-01")
   * @param {string} type - Period type ("quarters", "monthly", "annual")
   * @returns {Promise<Object>} Workforce metrics
   */
  async getWorkforceMetrics(period, type = 'quarters') {
    try {
      const docRef = doc(db, 'dashboards', 'workforce', type, period);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.cache.set(`workforce-${type}-${period}`, data);
        return data;
      } else {
        console.warn(`No workforce data found for ${period}`);
        return null;
      }
    } catch (error) {
      console.error('Error fetching workforce metrics:', error);
      // Return cached data if available
      return this.cache.get(`workforce-${type}-${period}`) || null;
    }
  }

  /**
   * Set workforce metrics for a specific period
   * @param {string} period - Period identifier
   * @param {Object} metrics - Workforce metrics data
   * @param {string} type - Period type
   */
  async setWorkforceMetrics(period, metrics, type = 'quarters') {
    try {
      console.log('=== setWorkforceMetrics called ===');
      console.log('Period:', period);
      console.log('Type:', type);
      console.log('Metrics keys:', Object.keys(metrics));
      
      const docRef = doc(db, 'dashboards', 'workforce', type, period);
      const dataWithTimestamp = {
        ...metrics,
        lastUpdated: serverTimestamp(),
        period: period,
        type: type
      };
      
      console.log('Attempting to save to Firebase...');
      await setDoc(docRef, dataWithTimestamp);
      this.cache.set(`workforce-${type}-${period}`, dataWithTimestamp);
      
      console.log(`Workforce metrics saved successfully for ${period}`);
      return true;
    } catch (error) {
      console.error('Error saving workforce metrics:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // ==================== TURNOVER METRICS ====================

  /**
   * Get turnover metrics for a specific period
   */
  async getTurnoverMetrics(period, type = 'quarters') {
    try {
      const docRef = doc(db, 'dashboards', 'turnover', type, period);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.cache.set(`turnover-${type}-${period}`, data);
        return data;
      } else {
        console.warn(`No turnover data found for ${period}`);
        return null;
      }
    } catch (error) {
      console.error('Error fetching turnover metrics:', error);
      return this.cache.get(`turnover-${type}-${period}`) || null;
    }
  }

  /**
   * Set turnover metrics for a specific period
   */
  async setTurnoverMetrics(period, metrics, type = 'quarters') {
    try {
      const docRef = doc(db, 'dashboards', 'turnover', type, period);
      const dataWithTimestamp = {
        ...metrics,
        lastUpdated: serverTimestamp(),
        period: period,
        type: type
      };
      
      await setDoc(docRef, dataWithTimestamp);
      this.cache.set(`turnover-${type}-${period}`, dataWithTimestamp);
      
      console.log(`Turnover metrics saved for ${period}`);
      return true;
    } catch (error) {
      console.error('Error saving turnover metrics:', error);
      throw error;
    }
  }

  // ==================== COMPLIANCE METRICS ====================

  /**
   * Get compliance metrics for a specific period
   */
  async getComplianceMetrics(period, type = 'quarters') {
    try {
      const docRef = doc(db, 'dashboards', 'compliance', type, period);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.cache.set(`compliance-${type}-${period}`, data);
        return data;
      } else {
        console.warn(`No compliance data found for ${period}`);
        return null;
      }
    } catch (error) {
      console.error('Error fetching compliance metrics:', error);
      return this.cache.get(`compliance-${type}-${period}`) || null;
    }
  }

  /**
   * Set compliance metrics for a specific period
   */
  async setComplianceMetrics(period, metrics, type = 'quarters') {
    try {
      const docRef = doc(db, 'dashboards', 'compliance', type, period);
      const dataWithTimestamp = {
        ...metrics,
        lastUpdated: serverTimestamp(),
        period: period,
        type: type
      };
      
      await setDoc(docRef, dataWithTimestamp);
      this.cache.set(`compliance-${type}-${period}`, dataWithTimestamp);
      
      console.log(`Compliance metrics saved for ${period}`);
      return true;
    } catch (error) {
      console.error('Error saving compliance metrics:', error);
      throw error;
    }
  }

  // ==================== RECRUITING METRICS ====================

  /**
   * Get recruiting metrics for a specific period
   */
  async getRecruitingMetrics(period, type = 'quarters') {
    try {
      const docRef = doc(db, 'dashboards', 'recruiting', type, period);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.cache.set(`recruiting-${type}-${period}`, data);
        return data;
      } else {
        console.warn(`No recruiting data found for ${period}`);
        return null;
      }
    } catch (error) {
      console.error('Error fetching recruiting metrics:', error);
      return this.cache.get(`recruiting-${type}-${period}`) || null;
    }
  }

  /**
   * Set recruiting metrics for a specific period
   */
  async setRecruitingMetrics(period, metrics, type = 'quarters') {
    try {
      const docRef = doc(db, 'dashboards', 'recruiting', type, period);
      const dataWithTimestamp = {
        ...metrics,
        lastUpdated: serverTimestamp(),
        period: period,
        type: type
      };
      
      await setDoc(docRef, dataWithTimestamp);
      this.cache.set(`recruiting-${type}-${period}`, dataWithTimestamp);
      
      console.log(`Recruiting metrics saved for ${period}`);
      return true;
    } catch (error) {
      console.error('Error saving recruiting metrics:', error);
      throw error;
    }
  }

  // ==================== EXIT SURVEY METRICS ====================

  /**
   * Get exit survey metrics for a specific period
   */
  async getExitSurveyMetrics(period, type = 'quarters') {
    try {
      const docRef = doc(db, 'dashboards', 'exitSurvey', type, period);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.cache.set(`exitSurvey-${type}-${period}`, data);
        return data;
      } else {
        console.warn(`No exit survey data found for ${period}`);
        return null;
      }
    } catch (error) {
      console.error('Error fetching exit survey metrics:', error);
      return this.cache.get(`exitSurvey-${type}-${period}`) || null;
    }
  }

  /**
   * Set exit survey metrics for a specific period
   */
  async setExitSurveyMetrics(period, metrics, type = 'quarters') {
    try {
      const docRef = doc(db, 'dashboards', 'exitSurvey', type, period);
      const dataWithTimestamp = {
        ...metrics,
        lastUpdated: serverTimestamp(),
        period: period,
        type: type
      };
      
      await setDoc(docRef, dataWithTimestamp);
      this.cache.set(`exitSurvey-${type}-${period}`, dataWithTimestamp);
      
      console.log(`Exit survey metrics saved for ${period}`);
      return true;
    } catch (error) {
      console.error('Error saving exit survey metrics:', error);
      throw error;
    }
  }

  // ==================== REAL-TIME SUBSCRIPTIONS ====================

  /**
   * Subscribe to real-time updates for specific metrics
   * @param {string} dashboard - Dashboard type (workforce, turnover, etc.)
   * @param {string} period - Period identifier
   * @param {Function} callback - Callback function for updates
   * @param {string} type - Period type
   * @returns {Function} Unsubscribe function
   */
  subscribeToMetrics(dashboard, period, callback, type = 'quarters') {
    try {
      const docRef = doc(db, 'dashboards', dashboard, type, period);
      
      const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          this.cache.set(`${dashboard}-${type}-${period}`, data);
          callback(data);
        } else {
          callback(null);
        }
      }, (error) => {
        console.error(`Error in real-time subscription for ${dashboard}:`, error);
        // Return cached data on error
        const cachedData = this.cache.get(`${dashboard}-${type}-${period}`);
        if (cachedData) {
          callback(cachedData);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
      return () => {}; // Return empty unsubscribe function
    }
  }

  // ==================== BATCH OPERATIONS ====================

  /**
   * Get all metrics for a specific period across all dashboards
   * @param {string} period - Period identifier
   * @param {string} type - Period type
   * @returns {Promise<Object>} All dashboard metrics
   */
  async getAllMetricsForPeriod(period, type = 'quarters') {
    try {
      const dashboards = ['workforce', 'turnover', 'compliance', 'recruiting', 'exitSurvey'];
      const promises = dashboards.map(dashboard => 
        this.getMetricsByDashboard(dashboard, period, type)
      );
      
      const results = await Promise.all(promises);
      
      return dashboards.reduce((acc, dashboard, index) => {
        acc[dashboard] = results[index];
        return acc;
      }, {});
    } catch (error) {
      console.error('Error fetching all metrics:', error);
      throw error;
    }
  }

  /**
   * Generic method to get metrics by dashboard type
   */
  async getMetricsByDashboard(dashboard, period, type = 'quarters') {
    switch (dashboard) {
      case 'workforce':
        return this.getWorkforceMetrics(period, type);
      case 'turnover':
        return this.getTurnoverMetrics(period, type);
      case 'compliance':
        return this.getComplianceMetrics(period, type);
      case 'recruiting':
        return this.getRecruitingMetrics(period, type);
      case 'exitSurvey':
        return this.getExitSurveyMetrics(period, type);
      default:
        throw new Error(`Unknown dashboard type: ${dashboard}`);
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get available periods for a dashboard
   * @param {string} dashboard - Dashboard type
   * @param {string} type - Period type
   * @returns {Promise<Array>} Available periods
   */
  async getAvailablePeriods(dashboard, type = 'quarters') {
    try {
      const collectionRef = collection(db, 'dashboards', dashboard, type);
      const q = query(collectionRef, orderBy('period', 'desc'), limit(20));
      
      // Note: This is a simplified version. In production, you might want
      // to maintain a separate collection for metadata about available periods
      
      return []; // Placeholder - implement based on your needs
    } catch (error) {
      console.error('Error fetching available periods:', error);
      return [];
    }
  }

  /**
   * Clear local cache
   */
  clearCache() {
    this.cache.clear();
    console.log('Firebase service cache cleared');
  }

  /**
   * Get cache size for monitoring
   */
  getCacheInfo() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Enable/disable network (useful for testing offline functionality)
   */
  async toggleNetwork(enable = true) {
    try {
      if (enable) {
        await enableNetwork(db);
        this.isOnline = true;
        console.log('Firebase network enabled');
      } else {
        await disableNetwork(db);
        this.isOnline = false;
        console.log('Firebase network disabled');
      }
    } catch (error) {
      console.error('Error toggling network:', error);
    }
  }

  // ==================== DATABASE MANAGEMENT ====================

  /**
   * Clear all data for a specific dashboard and period (for testing)
   * @param {string} dashboard - Dashboard type (workforce, turnover, etc.)
   * @param {string} period - Period identifier
   * @param {string} type - Period type
   */
  async clearDashboardData(dashboard, period, type = 'quarters') {
    try {
      const docRef = doc(db, 'dashboards', dashboard, type, period);
      
      // Check if document exists before attempting to delete
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await deleteDoc(docRef);
        console.log(`Deleted ${dashboard} data for ${period}`);
      } else {
        console.log(`No ${dashboard} data found for ${period} - nothing to clear`);
      }
      
      // Clear from cache regardless
      this.cache.delete(`${dashboard}-${type}-${period}`);
      return true;
    } catch (error) {
      console.error(`Error clearing ${dashboard} data:`, error);
      throw error;
    }
  }

  /**
   * Normalize period format for consistency
   * @param {string} period - Period identifier (Q1-2025 or 2025-Q1)
   * @returns {Array} Array of normalized period formats to try
   */
  normalizePeriodFormats(period) {
    const formats = [];
    
    // Handle Q1-2025 format
    if (period.match(/^Q\d-\d{4}$/)) {
      formats.push(period); // Q1-2025
      formats.push(period.replace(/^Q(\d)-(\d{4})$/, '$2-Q$1')); // 2025-Q1
    }
    // Handle 2025-Q1 format
    else if (period.match(/^\d{4}-Q\d$/)) {
      formats.push(period); // 2025-Q1
      formats.push(period.replace(/^(\d{4})-Q(\d)$/, 'Q$2-$1')); // Q1-2025
    }
    // Handle other formats or invalid formats
    else {
      formats.push(period);
    }
    
    return formats;
  }

  /**
   * Clear all data for a specific period across all dashboards (for testing)
   * @param {string} period - Period identifier (supports both Q1-2025 and 2025-Q1 formats)
   * @param {string} type - Period type
   */
  async clearAllDataForPeriod(period, type = 'quarters') {
    try {
      const dashboards = ['workforce', 'turnover', 'compliance', 'recruiting', 'exitSurvey'];
      const periodFormats = this.normalizePeriodFormats(period);
      
      console.log(`Clearing data for period formats: ${periodFormats.join(', ')}`);
      
      // Clear data for all possible period formats
      const clearPromises = [];
      for (const dashboard of dashboards) {
        for (const periodFormat of periodFormats) {
          clearPromises.push(this.clearDashboardData(dashboard, periodFormat, type));
        }
      }
      
      await Promise.all(clearPromises);
      
      // Clear cache for all period formats
      for (const dashboard of dashboards) {
        for (const periodFormat of periodFormats) {
          this.cache.delete(`${dashboard}-${type}-${periodFormat}`);
        }
      }
      
      console.log(`Cleared all dashboard data for ${period} (formats: ${periodFormats.join(', ')})`);
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;