import { Low } from 'lowdb';
import { Memory } from 'lowdb';
import _ from 'lodash';
import { format, isAfter, isBefore, isEqual, parseISO } from 'date-fns';
import { validateTurnoverData } from './schemas/turnoverSchema.js';
import { validateWorkforceData } from './schemas/workforceSchema.js';

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
    
    // Enhanced features for Phase 3
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes default
    this.queryHistory = [];
    this.maxQueryHistory = 100;
    this.indexedFields = new Set(['id', 'category', 'department', 'division', 'location', 'employeeType']);
    this.indices = new Map();
    
    // Connection pooling simulation for multiple operations
    this.operationQueue = [];
    this.maxConcurrentOperations = 5;
    this.currentOperations = 0;
    
    // Performance monitoring
    this.performance = {
      totalQueries: 0,
      averageQueryTime: 0,
      cacheHitRate: 0,
      totalCacheHits: 0,
      totalCacheMisses: 0
    };
  }

  // ==========================================
  // ENHANCED PHASE 3 CAPABILITIES
  // ==========================================

  /**
   * Advanced caching system with automatic expiry
   */
  _getCacheKey(operation, params) {
    return `${operation}:${JSON.stringify(params)}`;
  }

  _setCache(key, data, customTimeout = null) {
    const timeout = customTimeout || this.cacheTimeout;
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + timeout);
  }

  _getCache(key) {
    if (!this.cache.has(key)) {
      this.performance.totalCacheMisses++;
      return null;
    }

    const expiry = this.cacheExpiry.get(key);
    if (Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      this.performance.totalCacheMisses++;
      return null;
    }

    this.performance.totalCacheHits++;
    this._updateCacheHitRate();
    return this.cache.get(key);
  }

  _updateCacheHitRate() {
    const total = this.performance.totalCacheHits + this.performance.totalCacheMisses;
    this.performance.cacheHitRate = total > 0 ? (this.performance.totalCacheHits / total) * 100 : 0;
  }

  _clearExpiredCache() {
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now > expiry) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }

  /**
   * Connection pooling for managing concurrent operations
   */
  async _executeWithPooling(operation) {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        if (this.currentOperations >= this.maxConcurrentOperations) {
          // Queue the operation
          this.operationQueue.push({ operation, resolve, reject });
          return;
        }

        this.currentOperations++;
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.currentOperations--;
          // Process next operation in queue
          if (this.operationQueue.length > 0) {
            const next = this.operationQueue.shift();
            setImmediate(() => execute.call(this, next.operation, next.resolve, next.reject));
          }
        }
      };

      execute();
    });
  }

  /**
   * Performance tracking for queries
   */
  _trackQuery(queryType, startTime, params) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    this.performance.totalQueries++;
    this.performance.averageQueryTime = 
      (this.performance.averageQueryTime * (this.performance.totalQueries - 1) + duration) / 
      this.performance.totalQueries;

    // Add to query history
    this.queryHistory.push({
      type: queryType,
      duration,
      params,
      timestamp: new Date().toISOString()
    });

    // Keep history within limits
    if (this.queryHistory.length > this.maxQueryHistory) {
      this.queryHistory.shift();
    }
  }

  /**
   * Data validation with comprehensive error handling
   */
  async _validateData(data, schema, dataType) {
    try {
      const isValid = schema(data);
      if (!isValid) {
        const errors = schema.errors || [];
        throw new Error(`${dataType} validation failed: ${JSON.stringify(errors)}`);
      }
      return true;
    } catch (error) {
      console.error(`Validation error for ${dataType}:`, error);
      throw error;
    }
  }

  /**
   * Advanced filtering with multiple criteria
   */
  _applyFilters(data, filters) {
    if (!filters || Object.keys(filters).length === 0) {
      return data;
    }

    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          return true;
        }

        // Handle different filter types
        if (Array.isArray(value)) {
          return value.includes(item[key]);
        }

        if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
          const itemValue = parseFloat(item[key]);
          return itemValue >= value.min && itemValue <= value.max;
        }

        if (typeof value === 'object' && (value.startDate || value.endDate)) {
          const itemDate = parseISO(item[key]);
          let matches = true;
          if (value.startDate) {
            matches = matches && !isBefore(itemDate, parseISO(value.startDate));
          }
          if (value.endDate) {
            matches = matches && !isAfter(itemDate, parseISO(value.endDate));
          }
          return matches;
        }

        // String matching with partial match support
        if (typeof value === 'string' && typeof item[key] === 'string') {
          return item[key].toLowerCase().includes(value.toLowerCase());
        }

        return item[key] === value;
      });
    });
  }

  /**
   * Build indices for faster querying
   */
  _buildIndices() {
    this.indices.clear();
    
    // Build indices for workforce data
    if (this.db.data.workforce.current) {
      this._buildIndexForDataset('workforce', this.db.data.workforce.current);
    }
    
    // Build indices for turnover data
    if (this.db.data.turnover.current) {
      this._buildIndexForDataset('turnover', this.db.data.turnover.current);
    }
  }

  _buildIndexForDataset(datasetName, dataset) {
    for (const field of this.indexedFields) {
      const indexKey = `${datasetName}:${field}`;
      const index = new Map();
      
      // Extract data arrays from the dataset
      const arrays = this._extractArraysFromDataset(dataset);
      
      arrays.forEach(array => {
        array.forEach((item, arrayIndex) => {
          if (item && item[field] !== undefined) {
            const value = item[field];
            if (!index.has(value)) {
              index.set(value, []);
            }
            index.get(value).push({ item, arrayIndex });
          }
        });
      });
      
      this.indices.set(indexKey, index);
    }
  }

  _extractArraysFromDataset(dataset) {
    const arrays = [];
    
    // Recursively find arrays in the dataset
    const findArrays = (obj, path = '') => {
      if (Array.isArray(obj)) {
        arrays.push(obj);
      } else if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => {
          findArrays(value, path ? `${path}.${key}` : key);
        });
      }
    };
    
    findArrays(dataset);
    return arrays;
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
      
      // Build indices for performance optimization
      this._buildIndices();
      
      console.log('HR Database initialized successfully with indices');
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
   * Update workforce data with validation and indexing
   */
  async updateWorkforceData(newData) {
    try {
      await this.ensureInitialized();
      
      // Validate data structure if schema is available
      if (validateWorkforceData) {
        await this._validateData(newData, validateWorkforceData, 'workforce');
      }
      
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
      
      // Rebuild indices after data update
      this._buildIndices();
      
      // Clear related cache entries
      this._clearRelatedCache('workforce');
      
      console.log('Workforce data updated successfully with validation and indexing');
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
   * Update turnover data with validation and indexing
   */
  async updateTurnoverData(newData) {
    try {
      await this.ensureInitialized();
      
      // Validate data structure
      await this._validateData(newData, validateTurnoverData, 'turnover');
      
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
      
      // Rebuild indices after data update
      this._buildIndices();
      
      // Clear related cache entries
      this._clearRelatedCache('turnover');
      
      console.log('Turnover data updated successfully with validation and indexing');
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
  // ADVANCED QUERY OPERATIONS (PHASE 3)
  // ==========================================

  /**
   * Advanced query with filtering, caching, and performance tracking
   */
  async query(datasetType, filters = {}, options = {}) {
    const startTime = Date.now();
    const cacheKey = this._getCacheKey(`query_${datasetType}`, { filters, options });
    
    try {
      // Check cache first
      const cachedResult = this._getCache(cacheKey);
      if (cachedResult && !options.skipCache) {
        this._trackQuery('query_cached', startTime, { datasetType, filters, options });
        return cachedResult;
      }

      await this.ensureInitialized();
      
      let data;
      switch (datasetType) {
        case 'workforce':
          data = await this.getWorkforceData();
          break;
        case 'turnover':
          data = await this.getTurnoverData();
          break;
        case 'workforce_history':
          data = await this.getWorkforceHistory(options.limit || 10);
          break;
        case 'turnover_history':
          data = await this.getTurnoverHistory(options.limit || 10);
          break;
        default:
          throw new Error(`Unknown dataset type: ${datasetType}`);
      }

      // Apply advanced filtering
      const result = this._processQueryResult(data, filters, options);
      
      // Cache the result
      this._setCache(cacheKey, result, options.cacheTimeout);
      
      this._trackQuery('query', startTime, { datasetType, filters, options });
      return result;

    } catch (error) {
      this._trackQuery('query_error', startTime, { datasetType, filters, options, error: error.message });
      throw error;
    }
  }

  /**
   * Process query results with filtering, sorting, and pagination
   */
  _processQueryResult(data, filters, options) {
    let result = _.cloneDeep(data);

    // Extract queryable arrays from the data structure
    const queryableData = this._extractQueryableData(result);
    
    // Apply filters to each queryable dataset
    Object.keys(queryableData).forEach(key => {
      if (Array.isArray(queryableData[key]) && queryableData[key].length > 0) {
        queryableData[key] = this._applyFilters(queryableData[key], filters);
        
        // Apply sorting if specified
        if (options.sortBy) {
          queryableData[key] = this._applySorting(queryableData[key], options.sortBy, options.sortOrder);
        }
        
        // Apply pagination if specified
        if (options.offset || options.limit) {
          queryableData[key] = this._applyPagination(queryableData[key], options.offset, options.limit);
        }
      }
    });

    return queryableData;
  }

  /**
   * Extract queryable data arrays from complex data structures
   */
  _extractQueryableData(data) {
    const queryable = {};
    
    const extract = (obj, path = '') => {
      if (Array.isArray(obj) && obj.length > 0) {
        queryable[path || 'root'] = obj;
      } else if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => {
          const newPath = path ? `${path}.${key}` : key;
          extract(value, newPath);
        });
      }
    };
    
    extract(data);
    return queryable;
  }

  /**
   * Apply sorting to data arrays
   */
  _applySorting(data, sortBy, sortOrder = 'asc') {
    return _.orderBy(data, [sortBy], [sortOrder]);
  }

  /**
   * Apply pagination to data arrays
   */
  _applyPagination(data, offset = 0, limit = null) {
    if (limit) {
      return data.slice(offset, offset + limit);
    }
    return data.slice(offset);
  }

  /**
   * Aggregate data with grouping and calculations
   */
  async aggregate(datasetType, groupBy, aggregations = {}, filters = {}) {
    const startTime = Date.now();
    const cacheKey = this._getCacheKey('aggregate', { datasetType, groupBy, aggregations, filters });
    
    try {
      const cachedResult = this._getCache(cacheKey);
      if (cachedResult) {
        this._trackQuery('aggregate_cached', startTime, { datasetType, groupBy, aggregations, filters });
        return cachedResult;
      }

      const queryResult = await this.query(datasetType, filters, { skipCache: true });
      const result = {};
      
      // Process each queryable dataset
      Object.entries(queryResult).forEach(([datasetName, dataset]) => {
        if (Array.isArray(dataset)) {
          result[datasetName] = this._performAggregation(dataset, groupBy, aggregations);
        }
      });

      this._setCache(cacheKey, result);
      this._trackQuery('aggregate', startTime, { datasetType, groupBy, aggregations, filters });
      return result;

    } catch (error) {
      this._trackQuery('aggregate_error', startTime, { datasetType, groupBy, aggregations, filters, error: error.message });
      throw error;
    }
  }

  /**
   * Perform aggregation calculations
   */
  _performAggregation(data, groupBy, aggregations) {
    const grouped = _.groupBy(data, groupBy);
    const result = {};

    Object.entries(grouped).forEach(([key, group]) => {
      result[key] = {
        count: group.length,
        items: group
      };

      // Apply aggregation functions
      Object.entries(aggregations).forEach(([field, operations]) => {
        if (!Array.isArray(operations)) {
          operations = [operations];
        }

        operations.forEach(operation => {
          const values = group.map(item => parseFloat(item[field])).filter(val => !isNaN(val));
          
          switch (operation) {
            case 'sum':
              result[key][`${field}_sum`] = _.sum(values);
              break;
            case 'avg':
              result[key][`${field}_avg`] = _.mean(values);
              break;
            case 'min':
              result[key][`${field}_min`] = _.min(values);
              break;
            case 'max':
              result[key][`${field}_max`] = _.max(values);
              break;
            case 'median':
              result[key][`${field}_median`] = this._calculateMedian(values);
              break;
          }
        });
      });
    });

    return result;
  }

  /**
   * Calculate median value
   */
  _calculateMedian(values) {
    const sorted = values.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * Search across multiple fields with fuzzy matching
   */
  async search(datasetType, searchTerm, searchFields = [], options = {}) {
    const startTime = Date.now();
    const cacheKey = this._getCacheKey('search', { datasetType, searchTerm, searchFields, options });
    
    try {
      const cachedResult = this._getCache(cacheKey);
      if (cachedResult) {
        this._trackQuery('search_cached', startTime, { datasetType, searchTerm, searchFields });
        return cachedResult;
      }

      const queryResult = await this.query(datasetType, {}, { skipCache: true });
      const results = {};

      Object.entries(queryResult).forEach(([datasetName, dataset]) => {
        if (Array.isArray(dataset)) {
          results[datasetName] = this._performSearch(dataset, searchTerm, searchFields, options);
        }
      });

      this._setCache(cacheKey, results);
      this._trackQuery('search', startTime, { datasetType, searchTerm, searchFields });
      return results;

    } catch (error) {
      this._trackQuery('search_error', startTime, { datasetType, searchTerm, searchFields, error: error.message });
      throw error;
    }
  }

  /**
   * Perform search with scoring and ranking
   */
  _performSearch(data, searchTerm, searchFields, options = {}) {
    const { minScore = 0.3, maxResults = 100 } = options;
    const term = searchTerm.toLowerCase();
    
    const results = data.map(item => {
      let score = 0;
      const matches = {};

      // If no specific fields provided, search all string fields
      const fieldsToSearch = searchFields.length > 0 ? searchFields : 
        Object.keys(item).filter(key => typeof item[key] === 'string');

      fieldsToSearch.forEach(field => {
        if (item[field] && typeof item[field] === 'string') {
          const fieldValue = item[field].toLowerCase();
          
          // Exact match gets highest score
          if (fieldValue === term) {
            score += 1.0;
            matches[field] = 'exact';
          }
          // Starts with search term gets high score
          else if (fieldValue.startsWith(term)) {
            score += 0.8;
            matches[field] = 'startsWith';
          }
          // Contains search term gets medium score
          else if (fieldValue.includes(term)) {
            score += 0.6;
            matches[field] = 'contains';
          }
          // Fuzzy match gets lower score
          else if (this._fuzzyMatch(fieldValue, term)) {
            score += 0.4;
            matches[field] = 'fuzzy';
          }
        }
      });

      return { item, score, matches };
    })
    .filter(entry => entry.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

    return results;
  }

  /**
   * Simple fuzzy matching algorithm
   */
  _fuzzyMatch(str, pattern) {
    let patternIdx = 0;
    let strIdx = 0;
    
    while (strIdx < str.length && patternIdx < pattern.length) {
      if (str[strIdx] === pattern[patternIdx]) {
        patternIdx++;
      }
      strIdx++;
    }
    
    return patternIdx === pattern.length;
  }

  /**
   * Get query performance statistics
   */
  getPerformanceStats() {
    return {
      ...this.performance,
      recentQueries: this.queryHistory.slice(-10),
      cacheSize: this.cache.size,
      indexedFields: Array.from(this.indexedFields),
      indicesCount: this.indices.size
    };
  }

  /**
   * Clear cache and reset performance counters
   */
  clearCache() {
    this.cache.clear();
    this.cacheExpiry.clear();
    this.performance.totalCacheHits = 0;
    this.performance.totalCacheMisses = 0;
    this.performance.cacheHitRate = 0;
    console.log('Cache cleared successfully');
  }

  /**
   * Clear cache entries related to a specific dataset
   */
  _clearRelatedCache(datasetType) {
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(datasetType)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    });
    
    console.log(`Cleared ${keysToDelete.length} cache entries for ${datasetType}`);
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