import hrDatabase from '../../database/HRDatabase.js';
import { dataValidator } from '../../utils/dataValidation.js';
import _ from 'lodash';

/**
 * Advanced API Abstraction Layer for HR Reports Dashboard
 * 
 * This comprehensive API layer provides:
 * - Intelligent retry logic with exponential backoff
 * - Request/response transformation
 * - Comprehensive error handling
 * - Performance monitoring and optimization
 * - Caching strategies
 * - Data validation integration
 * - Request queuing and throttling
 */

export class DashboardAPI {
  constructor() {
    this.baseConfig = {
      timeout: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelay: 1000, // 1 second initial delay
      retryDelayMultiplier: 2, // Exponential backoff
      maxRetryDelay: 10000, // 10 seconds max delay
      enableCache: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      throttleLimit: 10, // requests per second
      queueMaxSize: 100
    };

    this.requestQueue = [];
    this.activeRequests = new Map();
    this.rateLimiter = {
      requests: [],
      limit: this.baseConfig.throttleLimit
    };
    
    this.performance = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      retryCount: 0
    };

    this.errorCounts = new Map();
    this.lastErrorReset = Date.now();

    // Initialize circuit breaker
    this.circuitBreaker = {
      isOpen: false,
      failureCount: 0,
      failureThreshold: 5,
      resetTimeout: 30000, // 30 seconds
      lastFailureTime: null
    };
  }

  // ==========================================
  // CORE API METHODS
  // ==========================================

  /**
   * Get workforce data with comprehensive error handling
   */
  async getWorkforceData(filters = {}, options = {}) {
    return this._executeRequest('getWorkforceData', async () => {
      const data = await hrDatabase.query('workforce', filters, {
        ...options,
        skipCache: options.forceRefresh
      });
      
      return this._transformWorkforceData(data, options);
    }, { ...this.baseConfig, ...options });
  }

  /**
   * Get turnover data with validation
   */
  async getTurnoverData(filters = {}, options = {}) {
    return this._executeRequest('getTurnoverData', async () => {
      const data = await hrDatabase.query('turnover', filters, {
        ...options,
        skipCache: options.forceRefresh
      });
      
      return this._transformTurnoverData(data, options);
    }, { ...this.baseConfig, ...options });
  }

  /**
   * Get I9 compliance data with specialized processing
   */
  async getI9ComplianceData(filters = {}, options = {}) {
    return this._executeRequest('getI9ComplianceData', async () => {
      // I9 compliance data typically comes from workforce data
      const workforceData = await hrDatabase.query('workforce', filters, options);
      
      return this._transformI9ComplianceData(workforceData, filters, options);
    }, { ...this.baseConfig, ...options });
  }

  /**
   * Get historical data with trend analysis
   */
  async getHistoricalData(dataType, options = {}) {
    return this._executeRequest('getHistoricalData', async () => {
      const data = await hrDatabase.query(`${dataType}_history`, {}, {
        limit: options.limit || 24, // Default 24 months
        ...options
      });
      
      return this._transformHistoricalData(data, dataType, options);
    }, { ...this.baseConfig, ...options });
  }

  /**
   * Search across all datasets
   */
  async searchData(searchTerm, options = {}) {
    return this._executeRequest('searchData', async () => {
      const searchOptions = {
        minScore: options.minScore || 0.3,
        maxResults: options.maxResults || 50,
        searchFields: options.searchFields || []
      };

      const [workforceResults, turnoverResults] = await Promise.all([
        hrDatabase.search('workforce', searchTerm, searchOptions.searchFields, searchOptions),
        hrDatabase.search('turnover', searchTerm, searchOptions.searchFields, searchOptions)
      ]);

      return this._transformSearchResults({
        workforce: workforceResults,
        turnover: turnoverResults
      }, searchTerm, options);
    }, { ...this.baseConfig, ...options });
  }

  /**
   * Aggregate data across multiple dimensions
   */
  async aggregateData(dataType, aggregationConfig, options = {}) {
    return this._executeRequest('aggregateData', async () => {
      const { groupBy, metrics, filters = {} } = aggregationConfig;
      
      const data = await hrDatabase.aggregate(dataType, groupBy, metrics, filters);
      
      return this._transformAggregatedData(data, aggregationConfig, options);
    }, { ...this.baseConfig, ...options });
  }

  /**
   * Update data with validation and conflict resolution
   */
  async updateData(dataType, newData, options = {}) {
    return this._executeRequest('updateData', async () => {
      // Validate data before update
      if (options.validate !== false) {
        const validationResult = await dataValidator.validateAndSanitize(
          newData, 
          dataType, 
          options.validationOptions || {}
        );

        if (!validationResult.isValid) {
          throw new APIError(
            'DATA_VALIDATION_FAILED',
            'Data validation failed',
            { validationErrors: validationResult.validation.errors }
          );
        }

        newData = validationResult.data;
      }

      // Check for conflicts if enabled
      if (options.checkConflicts) {
        await this._checkDataConflicts(dataType, newData);
      }

      // Update data
      let result;
      switch (dataType) {
        case 'workforce':
          result = await hrDatabase.updateWorkforceData(newData);
          break;
        case 'turnover':
          result = await hrDatabase.updateTurnoverData(newData);
          break;
        default:
          throw new APIError('UNSUPPORTED_DATA_TYPE', `Unsupported data type: ${dataType}`);
      }

      return {
        success: result,
        dataType,
        timestamp: new Date().toISOString(),
        recordsUpdated: 1
      };
    }, { ...this.baseConfig, ...options });
  }

  // ==========================================
  // REQUEST EXECUTION FRAMEWORK
  // ==========================================

  /**
   * Execute request with comprehensive error handling and retry logic
   */
  async _executeRequest(operationName, operation, config = {}) {
    const requestId = this._generateRequestId();
    const startTime = Date.now();

    try {
      // Check circuit breaker
      if (this._isCircuitBreakerOpen()) {
        throw new APIError(
          'CIRCUIT_BREAKER_OPEN',
          'Service temporarily unavailable due to repeated failures'
        );
      }

      // Apply rate limiting
      await this._applyRateLimit();

      // Queue request if necessary
      if (this.activeRequests.size >= config.maxConcurrentRequests || 10) {
        await this._queueRequest(requestId);
      }

      this.activeRequests.set(requestId, { operationName, startTime });

      // Execute with retry logic
      const result = await this._executeWithRetry(operation, config);

      // Update performance metrics
      this._updatePerformanceMetrics(true, Date.now() - startTime);
      
      // Reset circuit breaker on success
      this._resetCircuitBreaker();

      return result;

    } catch (error) {
      this._updatePerformanceMetrics(false, Date.now() - startTime);
      this._updateCircuitBreaker(error);
      
      // Transform error for consistent API
      throw this._transformError(error, operationName, requestId);
    } finally {
      this.activeRequests.delete(requestId);
      this._processQueue();
    }
  }

  /**
   * Execute operation with retry logic
   */
  async _executeWithRetry(operation, config) {
    let lastError;
    let delay = config.retryDelay || this.baseConfig.retryDelay;

    for (let attempt = 0; attempt <= (config.retryAttempts || this.baseConfig.retryAttempts); attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retry attempt ${attempt} after ${delay}ms delay`);
          await this._delay(delay);
          this.performance.retryCount++;
          delay = Math.min(delay * (config.retryDelayMultiplier || this.baseConfig.retryDelayMultiplier), 
                          config.maxRetryDelay || this.baseConfig.maxRetryDelay);
        }

        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry certain types of errors
        if (!this._shouldRetry(error, attempt, config)) {
          break;
        }
      }
    }

    throw lastError;
  }

  /**
   * Determine if an error should trigger a retry
   */
  _shouldRetry(error, attempt, config) {
    const maxAttempts = config.retryAttempts || this.baseConfig.retryAttempts;
    
    if (attempt >= maxAttempts) {
      return false;
    }

    // Don't retry validation errors or client errors
    if (error instanceof APIError) {
      const nonRetryableCodes = [
        'DATA_VALIDATION_FAILED',
        'INVALID_PARAMETERS',
        'PERMISSION_DENIED',
        'UNSUPPORTED_DATA_TYPE'
      ];
      
      if (nonRetryableCodes.includes(error.code)) {
        return false;
      }
    }

    // Don't retry if circuit breaker should open
    if (error.code === 'CIRCUIT_BREAKER_OPEN') {
      return false;
    }

    return true;
  }

  // ==========================================
  // DATA TRANSFORMATION METHODS
  // ==========================================

  /**
   * Transform workforce data for API consumption
   */
  _transformWorkforceData(data, options = {}) {
    if (!data) return null;

    const transformed = {
      ...data,
      apiMeta: {
        transformedAt: new Date().toISOString(),
        version: '3.0',
        dataSource: 'HRDatabase'
      }
    };

    // Apply additional transformations based on options
    if (options.includeCalculatedFields) {
      transformed.calculations = this._calculateWorkforceMetrics(data);
    }

    if (options.format === 'chart') {
      transformed.chartData = this._formatForCharts(data, 'workforce');
    }

    return transformed;
  }

  /**
   * Transform turnover data for API consumption
   */
  _transformTurnoverData(data, options = {}) {
    if (!data) return null;

    const transformed = {
      ...data,
      apiMeta: {
        transformedAt: new Date().toISOString(),
        version: '3.0',
        dataSource: 'HRDatabase'
      }
    };

    if (options.includeCalculatedFields) {
      transformed.calculations = this._calculateTurnoverMetrics(data);
    }

    if (options.format === 'chart') {
      transformed.chartData = this._formatForCharts(data, 'turnover');
    }

    return transformed;
  }

  /**
   * Transform I9 compliance data
   */
  _transformI9ComplianceData(workforceData, filters, options) {
    // Extract I9-relevant information from workforce data
    const i9Data = {
      complianceOverview: {
        totalEmployees: 0,
        compliantEmployees: 0,
        nonCompliantEmployees: 0,
        complianceRate: 0,
        lastUpdated: new Date().toISOString()
      },
      complianceByType: [],
      riskIndicators: [],
      processImprovements: [],
      apiMeta: {
        transformedAt: new Date().toISOString(),
        derivedFrom: 'workforce',
        version: '3.0'
      }
    };

    // Mock I9 compliance calculation (would be based on real data structure)
    if (workforceData && workforceData.currentPeriod) {
      const total = workforceData.currentPeriod.headcount?.total || 0;
      i9Data.complianceOverview.totalEmployees = total;
      i9Data.complianceOverview.compliantEmployees = Math.floor(total * 0.94); // 94% compliance rate
      i9Data.complianceOverview.nonCompliantEmployees = total - i9Data.complianceOverview.compliantEmployees;
      i9Data.complianceOverview.complianceRate = total > 0 ? 
        (i9Data.complianceOverview.compliantEmployees / total) * 100 : 0;
    }

    return i9Data;
  }

  /**
   * Transform historical data with trend analysis
   */
  _transformHistoricalData(data, dataType, options) {
    if (!data || !Array.isArray(data)) return { trends: [], summary: {} };

    const trends = data.map((item, index) => ({
      ...item,
      periodIndex: index,
      changeFromPrevious: index > 0 ? this._calculateChange(data[index - 1], item) : null
    }));

    const summary = {
      totalPeriods: trends.length,
      avgGrowthRate: this._calculateAverageGrowthRate(trends),
      volatility: this._calculateVolatility(trends),
      trend: this._determineTrend(trends)
    };

    return {
      trends,
      summary,
      dataType,
      apiMeta: {
        transformedAt: new Date().toISOString(),
        trendsCalculated: true,
        version: '3.0'
      }
    };
  }

  /**
   * Transform search results
   */
  _transformSearchResults(results, searchTerm, options) {
    const transformed = {
      query: searchTerm,
      totalResults: 0,
      datasets: {},
      aggregatedResults: [],
      apiMeta: {
        transformedAt: new Date().toISOString(),
        searchVersion: '3.0'
      }
    };

    Object.entries(results).forEach(([dataset, datasetResults]) => {
      if (datasetResults && Object.keys(datasetResults).length > 0) {
        const flattened = this._flattenSearchResults(datasetResults);
        transformed.datasets[dataset] = flattened;
        transformed.totalResults += flattened.length;
        transformed.aggregatedResults.push(...flattened.map(result => ({
          ...result,
          dataset
        })));
      }
    });

    // Sort aggregated results by score
    transformed.aggregatedResults.sort((a, b) => (b.score || 0) - (a.score || 0));

    return transformed;
  }

  /**
   * Transform aggregated data
   */
  _transformAggregatedData(data, config, options) {
    return {
      aggregationConfig: config,
      results: data,
      summary: this._generateAggregationSummary(data),
      apiMeta: {
        transformedAt: new Date().toISOString(),
        aggregationType: config.groupBy,
        version: '3.0'
      }
    };
  }

  // ==========================================
  // UTILITY AND HELPER METHODS
  // ==========================================

  /**
   * Calculate workforce metrics
   */
  _calculateWorkforceMetrics(data) {
    if (!data || !data.currentPeriod) return {};

    const current = data.currentPeriod;
    return {
      totalGrowthRate: this._calculateGrowthRate(
        current.headcount?.changeFromPrevious?.total || 0,
        current.headcount?.total || 0
      ),
      vacancyImpact: current.positions ? 
        (current.positions.vacant / current.positions.total) * 100 : 0,
      facultyToStaffRatio: current.headcount?.faculty && current.headcount?.staff ?
        current.headcount.faculty / current.headcount.staff : 0
    };
  }

  /**
   * Calculate turnover metrics
   */
  _calculateTurnoverMetrics(data) {
    if (!data || !data.currentFiscalYear) return {};

    const current = data.currentFiscalYear;
    return {
      voluntaryVsInvoluntary: this._calculateVoluntaryInvoluntaryRatio(current),
      retentionRate: current.overallTurnover?.annualizedTurnoverRate ? 
        100 - current.overallTurnover.annualizedTurnoverRate : 0,
      seasonalTrend: this._analyzeSeasonalTrend(current.overallTurnover?.quarterlyProgression || [])
    };
  }

  /**
   * Generate request ID
   */
  _generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Apply rate limiting
   */
  async _applyRateLimit() {
    const now = Date.now();
    
    // Clean old requests (older than 1 second)
    this.rateLimiter.requests = this.rateLimiter.requests.filter(
      timestamp => now - timestamp < 1000
    );

    // Check if limit exceeded
    if (this.rateLimiter.requests.length >= this.rateLimiter.limit) {
      const oldestRequest = Math.min(...this.rateLimiter.requests);
      const waitTime = 1000 - (now - oldestRequest);
      if (waitTime > 0) {
        await this._delay(waitTime);
      }
    }

    this.rateLimiter.requests.push(now);
  }

  /**
   * Queue request if needed
   */
  async _queueRequest(requestId) {
    return new Promise((resolve, reject) => {
      if (this.requestQueue.length >= this.baseConfig.queueMaxSize) {
        reject(new APIError('QUEUE_FULL', 'Request queue is full'));
        return;
      }

      this.requestQueue.push({ requestId, resolve, reject });
    });
  }

  /**
   * Process queued requests
   */
  _processQueue() {
    while (this.requestQueue.length > 0 && 
           this.activeRequests.size < (this.baseConfig.maxConcurrentRequests || 10)) {
      const { resolve } = this.requestQueue.shift();
      resolve();
    }
  }

  /**
   * Circuit breaker management
   */
  _isCircuitBreakerOpen() {
    if (!this.circuitBreaker.isOpen) return false;

    const timeSinceLastFailure = Date.now() - this.circuitBreaker.lastFailureTime;
    if (timeSinceLastFailure > this.circuitBreaker.resetTimeout) {
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.failureCount = 0;
      console.log('Circuit breaker reset');
      return false;
    }

    return true;
  }

  _updateCircuitBreaker(error) {
    this.circuitBreaker.failureCount++;
    this.circuitBreaker.lastFailureTime = Date.now();

    if (this.circuitBreaker.failureCount >= this.circuitBreaker.failureThreshold) {
      this.circuitBreaker.isOpen = true;
      console.warn('Circuit breaker opened due to repeated failures');
    }
  }

  _resetCircuitBreaker() {
    this.circuitBreaker.failureCount = 0;
    this.circuitBreaker.isOpen = false;
  }

  /**
   * Performance metrics
   */
  _updatePerformanceMetrics(success, responseTime) {
    this.performance.totalRequests++;
    
    if (success) {
      this.performance.successfulRequests++;
    } else {
      this.performance.failedRequests++;
    }

    // Update average response time
    this.performance.averageResponseTime = 
      (this.performance.averageResponseTime * (this.performance.totalRequests - 1) + responseTime) / 
      this.performance.totalRequests;
  }

  /**
   * Error transformation
   */
  _transformError(error, operationName, requestId) {
    if (error instanceof APIError) {
      return error;
    }

    const apiError = new APIError(
      'OPERATION_FAILED',
      `${operationName} failed: ${error.message}`,
      {
        originalError: error.message,
        requestId,
        timestamp: new Date().toISOString()
      }
    );

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
      apiError.stack = error.stack;
    }

    return apiError;
  }

  /**
   * Utility delay function
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check for data conflicts
   */
  async _checkDataConflicts(dataType, newData) {
    const currentData = dataType === 'workforce' ? 
      await hrDatabase.getWorkforceData() : 
      await hrDatabase.getTurnoverData();

    if (currentData && currentData.lastUpdated) {
      const currentTime = new Date(currentData.lastUpdated);
      const updateTime = new Date(newData.lastUpdated || new Date());

      if (currentTime > updateTime) {
        throw new APIError(
          'DATA_CONFLICT',
          'Attempting to update with older data',
          { currentTimestamp: currentTime, updateTimestamp: updateTime }
        );
      }
    }
  }

  /**
   * Additional helper methods for data transformation
   */
  _calculateGrowthRate(change, total) {
    return total > 0 ? (change / total) * 100 : 0;
  }

  _calculateVoluntaryInvoluntaryRatio(data) {
    const voluntary = data.turnoverByCategory?.reduce((sum, cat) => sum + (cat.voluntary || 0), 0) || 0;
    const involuntary = data.turnoverByCategory?.reduce((sum, cat) => sum + (cat.involuntary || 0), 0) || 0;
    return voluntary + involuntary > 0 ? voluntary / (voluntary + involuntary) : 0;
  }

  _analyzeSeasonalTrend(quarterlyData) {
    if (!Array.isArray(quarterlyData) || quarterlyData.length < 2) return 'insufficient_data';
    
    const rates = quarterlyData.map(q => q.rate || 0);
    const increases = rates.filter((rate, index) => index > 0 && rate > rates[index - 1]).length;
    const decreases = rates.filter((rate, index) => index > 0 && rate < rates[index - 1]).length;
    
    if (increases > decreases) return 'increasing';
    if (decreases > increases) return 'decreasing';
    return 'stable';
  }

  _calculateChange(previous, current) {
    if (!previous || !current) return null;
    
    // Simple change calculation for headcount
    const prevTotal = previous.headcount?.total || 0;
    const currTotal = current.headcount?.total || 0;
    
    return {
      absolute: currTotal - prevTotal,
      percentage: prevTotal > 0 ? ((currTotal - prevTotal) / prevTotal) * 100 : 0
    };
  }

  _calculateAverageGrowthRate(trends) {
    if (!trends || trends.length < 2) return 0;
    
    const growthRates = trends.filter(t => t.changeFromPrevious?.percentage)
                            .map(t => t.changeFromPrevious.percentage);
    
    return growthRates.length > 0 ? 
      growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length : 0;
  }

  _calculateVolatility(trends) {
    if (!trends || trends.length < 3) return 0;
    
    const changes = trends.filter(t => t.changeFromPrevious?.percentage)
                         .map(t => t.changeFromPrevious.percentage);
    
    if (changes.length < 2) return 0;
    
    const mean = changes.reduce((sum, val) => sum + val, 0) / changes.length;
    const variance = changes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / changes.length;
    
    return Math.sqrt(variance);
  }

  _determineTrend(trends) {
    if (!trends || trends.length < 3) return 'insufficient_data';
    
    const recentChanges = trends.slice(-3).filter(t => t.changeFromPrevious?.percentage);
    if (recentChanges.length < 2) return 'insufficient_data';
    
    const positiveChanges = recentChanges.filter(t => t.changeFromPrevious.percentage > 0).length;
    const negativeChanges = recentChanges.filter(t => t.changeFromPrevious.percentage < 0).length;
    
    if (positiveChanges > negativeChanges) return 'upward';
    if (negativeChanges > positiveChanges) return 'downward';
    return 'stable';
  }

  _flattenSearchResults(datasetResults) {
    const flattened = [];
    
    Object.values(datasetResults).forEach(resultArray => {
      if (Array.isArray(resultArray)) {
        flattened.push(...resultArray);
      }
    });
    
    return flattened;
  }

  _generateAggregationSummary(data) {
    if (!data || typeof data !== 'object') return {};
    
    const summary = {
      totalGroups: Object.keys(data).length,
      totalRecords: 0,
      groupSizes: []
    };
    
    Object.values(data).forEach(group => {
      if (group && typeof group === 'object') {
        const groupSize = group.count || 0;
        summary.totalRecords += groupSize;
        summary.groupSizes.push(groupSize);
      }
    });
    
    if (summary.groupSizes.length > 0) {
      summary.averageGroupSize = summary.totalRecords / summary.groupSizes.length;
      summary.largestGroup = Math.max(...summary.groupSizes);
      summary.smallestGroup = Math.min(...summary.groupSizes);
    }
    
    return summary;
  }

  _formatForCharts(data, dataType) {
    // Basic chart formatting - would be expanded based on specific chart requirements
    const chartData = {
      type: dataType,
      prepared: true,
      timestamp: new Date().toISOString()
    };
    
    if (dataType === 'workforce' && data.currentPeriod) {
      chartData.headcountSeries = [
        { name: 'Faculty', value: data.currentPeriod.headcount?.faculty || 0 },
        { name: 'Staff', value: data.currentPeriod.headcount?.staff || 0 },
        { name: 'Students', value: data.currentPeriod.headcount?.students || 0 }
      ];
      
      chartData.locationSeries = data.currentPeriod.locations?.map(loc => ({
        name: loc.name,
        value: loc.total
      })) || [];
    }
    
    if (dataType === 'turnover' && data.currentFiscalYear) {
      chartData.turnoverByCategory = data.currentFiscalYear.turnoverByCategory?.map(cat => ({
        name: cat.category,
        value: cat.turnoverRate
      })) || [];
      
      chartData.quarterlyTrend = data.currentFiscalYear.overallTurnover?.quarterlyProgression || [];
    }
    
    return chartData;
  }

  // ==========================================
  // PUBLIC API METHODS
  // ==========================================

  /**
   * Get API performance statistics
   */
  getPerformanceStats() {
    return {
      ...this.performance,
      circuitBreaker: { ...this.circuitBreaker },
      queueSize: this.requestQueue.length,
      activeRequests: this.activeRequests.size,
      rateLimiter: {
        currentRequests: this.rateLimiter.requests.length,
        limit: this.rateLimiter.limit
      }
    };
  }

  /**
   * Reset performance counters
   */
  resetPerformanceStats() {
    this.performance = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      retryCount: 0
    };
  }

  /**
   * Health check for the API layer
   */
  async healthCheck() {
    try {
      const dbHealth = await hrDatabase.healthCheck();
      const apiHealth = {
        status: 'healthy',
        circuitBreakerOpen: this.circuitBreaker.isOpen,
        queueSize: this.requestQueue.length,
        activeRequests: this.activeRequests.size,
        timestamp: new Date().toISOString()
      };

      return {
        overall: dbHealth.status === 'healthy' && apiHealth.status === 'healthy' ? 'healthy' : 'degraded',
        database: dbHealth,
        api: apiHealth
      };
    } catch (error) {
      return {
        overall: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Create singleton instance
export const dashboardAPI = new DashboardAPI();

// Export convenience methods
export const getWorkforceData = (filters, options) => dashboardAPI.getWorkforceData(filters, options);
export const getTurnoverData = (filters, options) => dashboardAPI.getTurnoverData(filters, options);
export const getI9ComplianceData = (filters, options) => dashboardAPI.getI9ComplianceData(filters, options);
export const searchData = (searchTerm, options) => dashboardAPI.searchData(searchTerm, options);
export const updateData = (dataType, newData, options) => dashboardAPI.updateData(dataType, newData, options);

export default dashboardAPI; 