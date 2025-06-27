import { Low } from 'lowdb';
import { Memory } from 'lowdb';
import _ from 'lodash';
import { format } from 'date-fns';

// Browser-compatible JSON file adapter using localStorage
class LocalStorageAdapter {
  constructor(key) {
    this.key = key;
  }

  async read() {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  async write(data) {
    try {
      localStorage.setItem(this.key, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      throw error;
    }
  }
}

class HRDatabase {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.storageKey = 'hr-database';
  }

  /**
   * Initialize the database with default data structure
   */
  async initialize() {
    try {
      // Create adapter and database instance for browser environment
      const adapter = new LocalStorageAdapter(this.storageKey);
      this.db = new Low(adapter, {});

      // Read existing data or initialize with defaults
      await this.db.read();

      // Initialize with default structure if empty
      if (_.isEmpty(this.db.data)) {
        await this.initializeDefaultData();
      }

      this.isInitialized = true;
      console.log('HR Database initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize HR Database:', error);
      // Fallback to memory storage if localStorage fails
      try {
        const memoryAdapter = new Memory();
        this.db = new Low(memoryAdapter, {});
        await this.initializeDefaultData();
        this.isInitialized = true;
        console.log('HR Database initialized with memory storage fallback');
        return true;
      } catch (fallbackError) {
        console.error('Failed to initialize with memory fallback:', fallbackError);
        throw new Error(`Database initialization failed: ${error.message}`);
      }
    }
  }

  /**
   * Load JSON file dynamically (for browser environment)
   */
  async loadJSONFile(relativePath) {
    try {
      // In browser environment, use fetch to load from public folder
      const publicPath = relativePath.replace('../data/', '/');
      const response = await fetch(publicPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${publicPath}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.warn(`Could not load ${relativePath}:`, error.message);
      return null;
    }
  }

  /**
   * Initialize database with default data structure
   */
  async initializeDefaultData() {
    try {
      // Load existing JSON data dynamically
      const [workforceData, turnoverData] = await Promise.all([
        this.loadJSONFile('../data/workforce-data.json'),
        this.loadJSONFile('../data/turnover-data.json')
      ]);

      const defaultData = {
        metadata: {
          version: '1.0.0',
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          dataSource: 'HR Analytics System'
        },
        workforce: {
          current: workforceData || this.getDefaultWorkforceData(),
          historical: []
        },
        turnover: {
          current: turnoverData || this.getDefaultTurnoverData(),
          historical: []
        },
        settings: {
          autoBackup: true,
          retentionPeriod: 365, // days
          defaultCurrency: 'USD'
        }
      };

      this.db.data = defaultData;
      await this.db.write();
      console.log('Default data structure initialized');
    } catch (error) {
      console.error('Error initializing default data:', error);
      // Initialize with minimal structure if JSON loading fails
      this.db.data = {
        metadata: {
          version: '1.0.0',
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          dataSource: 'HR Analytics System'
        },
        workforce: { current: this.getDefaultWorkforceData(), historical: [] },
        turnover: { current: this.getDefaultTurnoverData(), historical: [] },
        settings: { autoBackup: true, retentionPeriod: 365, defaultCurrency: 'USD' }
      };
      await this.db.write();
      console.log('Minimal data structure initialized due to JSON loading error');
    }
  }

  /**
   * Get default workforce data structure
   */
  getDefaultWorkforceData() {
    return {
      metadata: {
        reportingPeriod: "Q2-2025",
        generatedDate: new Date().toISOString(),
        dataSource: "HRIS System",
        lastUpdated: new Date().toISOString(),
        currency: "USD",
        organization: "University System"
      },
      currentPeriod: {
        quarter: "Q2-2025",
        startDate: "2025-01-01",
        endDate: "2025-03-31",
        headcount: {
          total: 0,
          faculty: 0,
          staff: 0,
          students: 0,
          changeFromPrevious: {
            total: 0,
            faculty: 0,
            staff: 0,
            students: 0,
            percentChange: 0
          }
        },
        positions: {
          total: 0,
          filled: 0,
          vacant: 0,
          vacancyRate: 0
        },
        locations: [],
        topDivisions: []
      },
      historicalTrends: []
    };
  }

  /**
   * Get default turnover data structure
   */
  getDefaultTurnoverData() {
    return {
      metadata: {
        fiscalYear: "FY2024",
        reportingPeriod: "FY2024 YTD",
        generatedDate: new Date().toISOString(),
        dataSource: "HRIS Turnover Analytics",
        lastUpdated: new Date().toISOString(),
        organization: "University System",
        benchmarkSource: "CUPA-HR Higher Education Turnover Study"
      },
      currentFiscalYear: {
        period: "FY2024 YTD",
        startDate: "2023-07-01",
        endDate: "2024-03-31",
        overallTurnover: {
          totalDepartures: 0,
          averageHeadcount: 0,
          annualizedTurnoverRate: 0,
          changeFromPreviousYear: 0,
          quarterlyProgression: []
        },
        turnoverByCategory: [],
        voluntaryTurnoverReasons: [],
        departuresByTenure: [],
        departuresByGrade: []
      }
    };
  }

  /**
   * Ensure database is initialized before operations
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  // ==========================================
  // WORKFORCE DATA OPERATIONS
  // ==========================================

  /**
   * Get current workforce data
   */
  async getWorkforceData() {
    try {
      await this.ensureInitialized();
      return _.cloneDeep(this.db.data.workforce.current);
    } catch (error) {
      console.error('Error getting workforce data:', error);
      throw error;
    }
  }

  /**
   * Update workforce data
   */
  async updateWorkforceData(newData) {
    try {
      await this.ensureInitialized();
      
      // Archive current data to historical before updating
      if (this.db.data.workforce.current) {
        this.db.data.workforce.historical.push({
          ...this.db.data.workforce.current,
          archivedAt: new Date().toISOString()
        });
      }

      // Update current data
      this.db.data.workforce.current = {
        ...newData,
        lastUpdated: new Date().toISOString()
      };

      // Update metadata
      this.db.data.metadata.lastUpdated = new Date().toISOString();

      await this.db.write();
      console.log('Workforce data updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating workforce data:', error);
      throw error;
    }
  }

  /**
   * Get workforce historical data
   */
  async getWorkforceHistory(limit = 10) {
    try {
      await this.ensureInitialized();
      return _.takeRight(this.db.data.workforce.historical, limit);
    } catch (error) {
      console.error('Error getting workforce history:', error);
      throw error;
    }
  }

  // ==========================================
  // TURNOVER DATA OPERATIONS
  // ==========================================

  /**
   * Get current turnover data
   */
  async getTurnoverData() {
    try {
      await this.ensureInitialized();
      return _.cloneDeep(this.db.data.turnover.current);
    } catch (error) {
      console.error('Error getting turnover data:', error);
      throw error;
    }
  }

  /**
   * Update turnover data
   */
  async updateTurnoverData(newData) {
    try {
      await this.ensureInitialized();
      
      // Archive current data to historical before updating
      if (this.db.data.turnover.current) {
        this.db.data.turnover.historical.push({
          ...this.db.data.turnover.current,
          archivedAt: new Date().toISOString()
        });
      }

      // Update current data
      this.db.data.turnover.current = {
        ...newData,
        lastUpdated: new Date().toISOString()
      };

      // Update metadata
      this.db.data.metadata.lastUpdated = new Date().toISOString();

      await this.db.write();
      console.log('Turnover data updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating turnover data:', error);
      throw error;
    }
  }

  /**
   * Get turnover historical data
   */
  async getTurnoverHistory(limit = 10) {
    try {
      await this.ensureInitialized();
      return _.takeRight(this.db.data.turnover.historical, limit);
    } catch (error) {
      console.error('Error getting turnover history:', error);
      throw error;
    }
  }

  // ==========================================
  // METADATA AND SETTINGS OPERATIONS
  // ==========================================

  /**
   * Get database metadata
   */
  async getMetadata() {
    try {
      await this.ensureInitialized();
      return _.cloneDeep(this.db.data.metadata);
    } catch (error) {
      console.error('Error getting metadata:', error);
      throw error;
    }
  }

  /**
   * Update settings
   */
  async updateSettings(newSettings) {
    try {
      await this.ensureInitialized();
      this.db.data.settings = { ...this.db.data.settings, ...newSettings };
      this.db.data.metadata.lastUpdated = new Date().toISOString();
      await this.db.write();
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  /**
   * Get settings
   */
  async getSettings() {
    try {
      await this.ensureInitialized();
      return _.cloneDeep(this.db.data.settings);
    } catch (error) {
      console.error('Error getting settings:', error);
      throw error;
    }
  }

  // ==========================================
  // UTILITY OPERATIONS
  // ==========================================

  /**
   * Create backup of current database
   */
  async createBackup() {
    try {
      await this.ensureInitialized();
      const timestamp = format(new Date(), 'yyyy-MM-dd-HH-mm-ss');
      const backupKey = `hr-database-backup-${timestamp}`;
      
      // Create backup in localStorage
      const backupData = _.cloneDeep(this.db.data);
      localStorage.setItem(backupKey, JSON.stringify(backupData, null, 2));
      
      console.log(`Database backup created: ${backupKey}`);
      return backupKey;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getStats() {
    try {
      await this.ensureInitialized();
      
      const stats = {
        metadata: await this.getMetadata(),
        workforceRecords: {
          current: this.db.data.workforce.current ? 1 : 0,
          historical: this.db.data.workforce.historical.length
        },
        turnoverRecords: {
          current: this.db.data.turnover.current ? 1 : 0,
          historical: this.db.data.turnover.historical.length
        },
        totalSize: JSON.stringify(this.db.data).length
      };

      return stats;
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }

  /**
   * Health check for database
   */
  async healthCheck() {
    try {
      await this.ensureInitialized();
      
      const health = {
        status: 'healthy',
        initialized: this.isInitialized,
        lastUpdated: this.db.data.metadata.lastUpdated,
        dataIntegrity: true,
        timestamp: new Date().toISOString()
      };

      // Basic data integrity checks
      if (!this.db.data.workforce || !this.db.data.turnover) {
        health.status = 'degraded';
        health.dataIntegrity = false;
      }

      return health;
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
const hrDatabase = new HRDatabase();

export default hrDatabase; 