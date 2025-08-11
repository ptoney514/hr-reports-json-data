import PocketBase from 'pocketbase';

/**
 * PocketBase Service for HR Reports v2
 * Handles all PocketBase database operations for HR data
 */
class PocketBaseService {
  constructor() {
    // Handle both browser and Node.js environments
    const pbUrl = typeof import.meta !== 'undefined' && import.meta.env 
      ? import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8091'
      : process.env.VITE_POCKETBASE_URL || 'http://localhost:8091';
      
    this.pb = new PocketBase(pbUrl);
    this.isInitialized = false;
    
    // Set up auth store change listener for auto-refresh
    this.pb.authStore.onChange((token, model) => {
      console.log('Auth state changed:', !!token);
      if (token && model) {
        console.log('Authenticated as:', model.email);
      }
    });
  }

  /**
   * Initialize the service and authenticate if needed
   */
  async initialize() {
    try {
      // Check if PocketBase is accessible
      await this.pb.health.check();
      
      // Note: Collections are configured as public, so we don't need admin authentication
      // for reading and writing data. Admin auth is only needed for admin operations.
      console.log('✅ PocketBase connection established (collections are public)');
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize PocketBase service:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Check if service is ready
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Login to PocketBase admin (for admin operations only)
   * Note: This is not required for data operations as collections are public
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   */
  async login(email, password) {
    try {
      // Note: The SDK version might not match the server version exactly
      // This may cause authentication issues, but it's not critical since
      // collections are public and don't require authentication
      const authData = await this.pb.admins.authWithPassword(email, password);
      console.log('Successfully logged in as admin:', email);
      return {
        success: true,
        token: authData.token,
        admin: authData.admin
      };
    } catch (error) {
      console.warn('Admin login failed (non-critical for data operations):', error.message);
      return {
        success: false,
        error: error.message || 'Authentication failed - SDK/Server version mismatch possible',
        note: 'Collections are public, so admin auth is not required for data operations'
      };
    }
  }

  /**
   * Logout from PocketBase
   */
  logout() {
    this.pb.authStore.clear();
    console.log('Logged out successfully');
  }

  /**
   * Check if authenticated
   */
  isAuthenticated() {
    return this.pb.authStore.isValid;
  }

  /**
   * Get current authenticated admin
   */
  getCurrentAdmin() {
    return this.pb.authStore.model;
  }

  /**
   * Get workforce data for a specific reporting period
   */
  async getWorkforceData(reportingPeriod = null) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (reportingPeriod) {
        // Get specific period
        const records = await this.pb.collection('workforce_data').getList(1, 1, {
          filter: `reporting_period = "${reportingPeriod}"`
        });
        return records.items[0] || null;
      } else {
        // Get all periods
        const records = await this.pb.collection('workforce_data').getList(1, 50, {
          sort: '-reporting_period'
        });
        return records.items;
      }
    } catch (error) {
      console.error('Error fetching workforce data:', error);
      throw error;
    }
  }

  /**
   * Get turnover data for a specific reporting period
   */
  async getTurnoverData(reportingPeriod = null) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (reportingPeriod) {
        // Get specific period
        const records = await this.pb.collection('turnover_data').getList(1, 1, {
          filter: `reporting_period = "${reportingPeriod}"`
        });
        return records.items[0] || null;
      } else {
        // Get all periods
        const records = await this.pb.collection('turnover_data').getList(1, 50, {
          sort: '-reporting_period'
        });
        return records.items;
      }
    } catch (error) {
      console.error('Error fetching turnover data:', error);
      throw error;
    }
  }

  /**
   * Get exit survey data for a specific reporting period
   */
  async getExitSurveyData(reportingPeriod = null) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (reportingPeriod) {
        // Get specific period
        const records = await this.pb.collection('exit_survey_data').getList(1, 1, {
          filter: `reporting_period = "${reportingPeriod}"`
        });
        return records.items[0] || null;
      } else {
        // Get all periods
        const records = await this.pb.collection('exit_survey_data').getList(1, 50, {
          sort: '-reporting_period'
        });
        return records.items;
      }
    } catch (error) {
      console.error('Error fetching exit survey data:', error);
      throw error;
    }
  }

  /**
   * Create or update workforce data
   */
  async saveWorkforceData(data, reportingPeriod) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Check if record exists
      const existingRecords = await this.pb.collection('workforce_data').getList(1, 1, {
        filter: `reporting_period = "${reportingPeriod}"`
      });

      const recordData = {
        reporting_period: reportingPeriod,
        ...data
      };

      if (existingRecords.items.length > 0) {
        // Update existing record
        return await this.pb.collection('workforce_data').update(existingRecords.items[0].id, recordData);
      } else {
        // Create new record
        return await this.pb.collection('workforce_data').create(recordData);
      }
    } catch (error) {
      console.error('Error saving workforce data:', error);
      throw error;
    }
  }

  /**
   * Create or update turnover data
   */
  async saveTurnoverData(data, reportingPeriod) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Check if record exists
      const existingRecords = await this.pb.collection('turnover_data').getList(1, 1, {
        filter: `reporting_period = "${reportingPeriod}"`
      });

      const recordData = {
        reporting_period: reportingPeriod,
        ...data
      };

      if (existingRecords.items.length > 0) {
        // Update existing record
        return await this.pb.collection('turnover_data').update(existingRecords.items[0].id, recordData);
      } else {
        // Create new record
        return await this.pb.collection('turnover_data').create(recordData);
      }
    } catch (error) {
      console.error('Error saving turnover data:', error);
      throw error;
    }
  }

  /**
   * Create or update exit survey data
   */
  async saveExitSurveyData(data, reportingPeriod) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Check if record exists
      const existingRecords = await this.pb.collection('exit_survey_data').getList(1, 1, {
        filter: `reporting_period = "${reportingPeriod}"`
      });

      const recordData = {
        reporting_period: reportingPeriod,
        ...data
      };

      if (existingRecords.items.length > 0) {
        // Update existing record
        return await this.pb.collection('exit_survey_data').update(existingRecords.items[0].id, recordData);
      } else {
        // Create new record
        return await this.pb.collection('exit_survey_data').create(recordData);
      }
    } catch (error) {
      console.error('Error saving exit survey data:', error);
      throw error;
    }
  }

  /**
   * Get all available reporting periods across all collections
   */
  async getAvailablePeriods() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const periods = new Set();
      
      // Get periods from all collections
      const [workforceData, turnoverData, exitSurveyData] = await Promise.all([
        this.pb.collection('workforce_data').getList(1, 50, { fields: 'reporting_period' }),
        this.pb.collection('turnover_data').getList(1, 50, { fields: 'reporting_period' }),
        this.pb.collection('exit_survey_data').getList(1, 50, { fields: 'reporting_period' })
      ]);

      workforceData.items.forEach(item => periods.add(item.reporting_period));
      turnoverData.items.forEach(item => periods.add(item.reporting_period));
      exitSurveyData.items.forEach(item => periods.add(item.reporting_period));

      return Array.from(periods).sort().reverse();
    } catch (error) {
      console.error('Error fetching available periods:', error);
      return [];
    }
  }

  /**
   * Delete data for a specific reporting period
   */
  async deleteDataForPeriod(reportingPeriod) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const results = [];

      // Delete from all collections
      const collections = ['workforce_data', 'turnover_data', 'exit_survey_data'];
      
      for (const collection of collections) {
        try {
          const records = await this.pb.collection(collection).getList(1, 10, {
            filter: `reporting_period = "${reportingPeriod}"`
          });

          for (const record of records.items) {
            await this.pb.collection(collection).delete(record.id);
            results.push({ collection, id: record.id, status: 'deleted' });
          }
        } catch (error) {
          results.push({ collection, status: 'error', error: error.message });
        }
      }

      return results;
    } catch (error) {
      console.error('Error deleting data for period:', error);
      throw error;
    }
  }

  /**
   * Health check for the service
   */
  async healthCheck() {
    try {
      // Skip authentication for health check since collections are public
      const health = await this.pb.health.check();
      return {
        status: 'healthy',
        message: 'PocketBase is accessible',
        authenticated: this.pb.authStore.isValid,
        details: health
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'PocketBase is not accessible',
        error: error.message
      };
    }
  }

  /**
   * Get service statistics
   */
  async getStats() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const [workforceCount, turnoverCount, exitSurveyCount] = await Promise.all([
        this.pb.collection('workforce_data').getList(1, 1),
        this.pb.collection('turnover_data').getList(1, 1),
        this.pb.collection('exit_survey_data').getList(1, 1)
      ]);

      return {
        workforce_records: workforceCount.totalItems,
        turnover_records: turnoverCount.totalItems,
        exit_survey_records: exitSurveyCount.totalItems,
        total_records: workforceCount.totalItems + turnoverCount.totalItems + exitSurveyCount.totalItems
      };
    } catch (error) {
      console.error('Error fetching service stats:', error);
      return {
        workforce_records: 0,
        turnover_records: 0,
        exit_survey_records: 0,
        total_records: 0,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const pocketBaseService = new PocketBaseService();
export default pocketBaseService;