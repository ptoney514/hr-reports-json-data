import _ from 'lodash';
import { format, parseISO, startOfQuarter, endOfQuarter, differenceInDays } from 'date-fns';

/**
 * Advanced Data Transformation Pipeline
 * 
 * This module provides comprehensive data transformation capabilities:
 * - ETL (Extract, Transform, Load) operations
 * - Data aggregation and rollup calculations
 * - Time-series data processing
 * - Cross-dataset joins and correlations
 * - Statistical analysis and derived metrics
 * - Data normalization and formatting
 */

export class DataTransformationPipeline {
  constructor(options = {}) {
    this.config = {
      enableCaching: true,
      enableValidation: true,
      preserveOriginal: true,
      enableMetrics: true,
      ...options
    };

    this.transformationCache = new Map();
    this.transformationMetrics = {
      totalTransformations: 0,
      successfulTransformations: 0,
      failedTransformations: 0,
      averageTransformationTime: 0,
      cacheHits: 0
    };

    this.registeredTransformers = new Map();
    this.initializeDefaultTransformers();
  }

  // ==========================================
  // PIPELINE ORCHESTRATION
  // ==========================================

  /**
   * Execute transformation pipeline
   */
  async executePipeline(data, transformations, options = {}) {
    const startTime = Date.now();
    const pipelineId = this.generatePipelineId();
    
    try {
      let currentData = this.config.preserveOriginal ? _.cloneDeep(data) : data;
      const results = {
        pipelineId,
        originalData: this.config.preserveOriginal ? data : null,
        transformations: [],
        finalData: null,
        metadata: {
          startTime,
          duration: null,
          success: false,
          error: null
        }
      };

      // Execute each transformation in sequence
      for (let i = 0; i < transformations.length; i++) {
        const transformation = transformations[i];
        const stepStartTime = Date.now();

        try {
          const stepResult = await this.executeTransformation(
            currentData, 
            transformation, 
            { ...options, stepIndex: i }
          );

          currentData = stepResult.data;
          results.transformations.push({
            step: i,
            transformation: transformation.name || transformation.type,
            success: true,
            duration: Date.now() - stepStartTime,
            metadata: stepResult.metadata || {}
          });

        } catch (stepError) {
          results.transformations.push({
            step: i,
            transformation: transformation.name || transformation.type,
            success: false,
            error: stepError.message,
            duration: Date.now() - stepStartTime
          });

          if (!transformation.optional) {
            throw stepError;
          }
        }
      }

      results.finalData = currentData;
      results.metadata.success = true;
      results.metadata.duration = Date.now() - startTime;

      this.updateMetrics(true, results.metadata.duration);
      return results;

    } catch (error) {
      this.updateMetrics(false, Date.now() - startTime);
      throw new Error(`Pipeline execution failed: ${error.message}`);
    }
  }

  /**
   * Execute single transformation
   */
  async executeTransformation(data, transformation, options = {}) {
    const { type, config = {}, name } = transformation;

    // Check cache first
    if (this.config.enableCaching) {
      const cacheKey = this.generateCacheKey(data, transformation);
      const cached = this.transformationCache.get(cacheKey);
      if (cached) {
        this.transformationMetrics.cacheHits++;
        return cached;
      }
    }

    // Get transformer
    const transformer = this.registeredTransformers.get(type);
    if (!transformer) {
      throw new Error(`Unknown transformation type: ${type}`);
    }

    // Execute transformation
    const result = await transformer(data, config, options);

    // Cache result
    if (this.config.enableCaching && result) {
      const cacheKey = this.generateCacheKey(data, transformation);
      this.transformationCache.set(cacheKey, result);
    }

    return result;
  }

  // ==========================================
  // DEFAULT TRANSFORMERS
  // ==========================================

  initializeDefaultTransformers() {
    // Data aggregation transformers
    this.registerTransformer('aggregate', this.aggregateTransformer.bind(this));
    this.registerTransformer('groupBy', this.groupByTransformer.bind(this));
    this.registerTransformer('pivot', this.pivotTransformer.bind(this));
    this.registerTransformer('unpivot', this.unpivotTransformer.bind(this));

    // Time series transformers
    this.registerTransformer('timeSeries', this.timeSeriesTransformer.bind(this));
    this.registerTransformer('timeWindow', this.timeWindowTransformer.bind(this));
    this.registerTransformer('trendAnalysis', this.trendAnalysisTransformer.bind(this));

    // Statistical transformers
    this.registerTransformer('statistics', this.statisticsTransformer.bind(this));
    this.registerTransformer('percentiles', this.percentilesTransformer.bind(this));
    this.registerTransformer('correlation', this.correlationTransformer.bind(this));

    // Data cleaning transformers
    this.registerTransformer('clean', this.cleanDataTransformer.bind(this));
    this.registerTransformer('normalize', this.normalizeTransformer.bind(this));
    this.registerTransformer('deduplicate', this.deduplicateTransformer.bind(this));

    // Format transformers
    this.registerTransformer('format', this.formatTransformer.bind(this));
    this.registerTransformer('chartData', this.chartDataTransformer.bind(this));
    this.registerTransformer('tableData', this.tableDataTransformer.bind(this));

    // Join transformers
    this.registerTransformer('join', this.joinTransformer.bind(this));
    this.registerTransformer('lookup', this.lookupTransformer.bind(this));
  }

  // ==========================================
  // TRANSFORMER IMPLEMENTATIONS
  // ==========================================

  /**
   * Aggregate data transformer
   */
  async aggregateTransformer(data, config) {
    const { groupBy, aggregations, filters } = config;
    
    let processedData = this.extractDataArrays(data);
    
    // Apply filters if specified
    if (filters) {
      processedData = this.applyFilters(processedData, filters);
    }

    const results = {};
    
    Object.entries(processedData).forEach(([datasetName, dataset]) => {
      if (Array.isArray(dataset)) {
        const grouped = _.groupBy(dataset, groupBy);
        
        results[datasetName] = {};
        Object.entries(grouped).forEach(([key, group]) => {
          results[datasetName][key] = this.calculateAggregations(group, aggregations);
        });
      }
    });

    return { 
      data: results, 
      metadata: { 
        type: 'aggregation',
        groupBy,
        aggregations,
        groupCount: Object.keys(results).length
      }
    };
  }

  /**
   * Time series transformer
   */
  async timeSeriesTransformer(data, config) {
    const { 
      dateField = 'date',
      valueField = 'value',
      interval = 'monthly',
      fillGaps = true,
      sortBy = 'date'
    } = config;

    const datasets = this.extractDataArrays(data);
    const results = {};

    Object.entries(datasets).forEach(([datasetName, dataset]) => {
      if (Array.isArray(dataset)) {
        const timeSeries = this.createTimeSeries(dataset, {
          dateField,
          valueField,
          interval,
          fillGaps,
          sortBy
        });
        
        results[datasetName] = timeSeries;
      }
    });

    return {
      data: results,
      metadata: {
        type: 'timeSeries',
        interval,
        fillGaps,
        seriesCount: Object.keys(results).length
      }
    };
  }

  /**
   * Statistical analysis transformer
   */
  async statisticsTransformer(data, config) {
    const { fields = [], includeDistribution = false } = config;
    
    const datasets = this.extractDataArrays(data);
    const results = {};

    Object.entries(datasets).forEach(([datasetName, dataset]) => {
      if (Array.isArray(dataset)) {
        results[datasetName] = {};
        
        fields.forEach(field => {
          const values = dataset
            .map(item => parseFloat(item[field]))
            .filter(val => !isNaN(val));
          
          if (values.length > 0) {
            results[datasetName][field] = this.calculateStatistics(values, includeDistribution);
          }
        });
      }
    });

    return {
      data: results,
      metadata: {
        type: 'statistics',
        fields,
        includeDistribution
      }
    };
  }

  /**
   * Chart data transformer
   */
  async chartDataTransformer(data, config) {
    const { 
      chartType = 'line',
      xField = 'name',
      yField = 'value',
      seriesField = null,
      sortBy = null,
      limit = null
    } = config;

    const datasets = this.extractDataArrays(data);
    const results = {};

    Object.entries(datasets).forEach(([datasetName, dataset]) => {
      if (Array.isArray(dataset)) {
        let chartData = dataset.map(item => ({
          x: item[xField],
          y: parseFloat(item[yField]) || 0,
          series: seriesField ? item[seriesField] : 'default',
          original: item
        }));

        // Apply sorting
        if (sortBy) {
          chartData = _.orderBy(chartData, [sortBy], ['asc']);
        }

        // Apply limit
        if (limit) {
          chartData = chartData.slice(0, limit);
        }

        // Group by series if specified
        if (seriesField) {
          results[datasetName] = _.groupBy(chartData, 'series');
        } else {
          results[datasetName] = chartData;
        }
      }
    });

    return {
      data: results,
      metadata: {
        type: 'chartData',
        chartType,
        xField,
        yField,
        seriesField
      }
    };
  }

  /**
   * Join transformer
   */
  async joinTransformer(data, config) {
    const { 
      leftDataset,
      rightDataset,
      leftKey,
      rightKey,
      joinType = 'inner', // inner, left, right, full
      prefix = ''
    } = config;

    const leftData = this.extractDataset(data, leftDataset);
    const rightData = this.extractDataset(data, rightDataset);

    if (!leftData || !rightData) {
      throw new Error('Join datasets not found');
    }

    const joinedData = this.performJoin(leftData, rightData, {
      leftKey,
      rightKey,
      joinType,
      prefix
    });

    return {
      data: joinedData,
      metadata: {
        type: 'join',
        joinType,
        leftCount: leftData.length,
        rightCount: rightData.length,
        resultCount: joinedData.length
      }
    };
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Extract data arrays from complex structures
   */
  extractDataArrays(data) {
    const arrays = {};
    
    const extract = (obj, path = '') => {
      if (Array.isArray(obj) && obj.length > 0) {
        arrays[path || 'root'] = obj;
      } else if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => {
          const newPath = path ? `${path}.${key}` : key;
          extract(value, newPath);
        });
      }
    };
    
    extract(data);
    return arrays;
  }

  /**
   * Extract specific dataset
   */
  extractDataset(data, datasetPath) {
    return _.get(data, datasetPath);
  }

  /**
   * Apply filters to dataset
   */
  applyFilters(datasets, filters) {
    const filtered = {};
    
    Object.entries(datasets).forEach(([name, dataset]) => {
      if (Array.isArray(dataset)) {
        filtered[name] = dataset.filter(item => {
          return Object.entries(filters).every(([key, value]) => {
            if (Array.isArray(value)) {
              return value.includes(item[key]);
            }
            if (typeof value === 'object' && value.min !== undefined) {
              const itemValue = parseFloat(item[key]);
              return itemValue >= value.min && itemValue <= value.max;
            }
            return item[key] === value;
          });
        });
      }
    });
    
    return filtered;
  }

  /**
   * Calculate aggregations
   */
  calculateAggregations(group, aggregations) {
    const result = { count: group.length, items: group };
    
    Object.entries(aggregations).forEach(([field, operations]) => {
      const values = group
        .map(item => parseFloat(item[field]))
        .filter(val => !isNaN(val));
      
      if (!Array.isArray(operations)) {
        operations = [operations];
      }
      
      operations.forEach(operation => {
        switch (operation) {
          case 'sum':
            result[`${field}_sum`] = _.sum(values);
            break;
          case 'avg':
            result[`${field}_avg`] = _.mean(values);
            break;
          case 'min':
            result[`${field}_min`] = _.min(values);
            break;
          case 'max':
            result[`${field}_max`] = _.max(values);
            break;
          case 'median':
            result[`${field}_median`] = this.calculateMedian(values);
            break;
          case 'stddev':
            result[`${field}_stddev`] = this.calculateStandardDeviation(values);
            break;
        }
      });
    });
    
    return result;
  }

  /**
   * Create time series
   */
  createTimeSeries(dataset, config) {
    const { dateField, valueField, interval, fillGaps, sortBy } = config;
    
    let timeSeries = dataset.map(item => ({
      date: parseISO(item[dateField]),
      value: parseFloat(item[valueField]) || 0,
      original: item
    }));

    // Sort by date
    timeSeries = _.orderBy(timeSeries, ['date'], ['asc']);

    // Fill gaps if requested
    if (fillGaps && timeSeries.length > 1) {
      timeSeries = this.fillTimeSeriesGaps(timeSeries, interval);
    }

    return timeSeries.map(item => ({
      ...item,
      dateFormatted: format(item.date, 'yyyy-MM-dd')
    }));
  }

  /**
   * Fill time series gaps
   */
  fillTimeSeriesGaps(timeSeries, interval) {
    if (timeSeries.length < 2) return timeSeries;
    
    const filled = [timeSeries[0]];
    
    for (let i = 1; i < timeSeries.length; i++) {
      const current = timeSeries[i];
      const previous = filled[filled.length - 1];
      
      const daysDiff = differenceInDays(current.date, previous.date);
      const expectedInterval = this.getIntervalDays(interval);
      
      if (daysDiff > expectedInterval * 1.5) {
        // Fill the gap
        const gapsToFill = Math.floor(daysDiff / expectedInterval) - 1;
        
        for (let gap = 1; gap <= gapsToFill; gap++) {
          const gapDate = new Date(previous.date);
          gapDate.setDate(gapDate.getDate() + (expectedInterval * gap));
          
          filled.push({
            date: gapDate,
            value: 0, // or interpolated value
            original: null,
            filled: true
          });
        }
      }
      
      filled.push(current);
    }
    
    return filled;
  }

  /**
   * Calculate statistics
   */
  calculateStatistics(values, includeDistribution = false) {
    const sorted = values.sort((a, b) => a - b);
    const n = values.length;
    const mean = _.mean(values);
    
    const stats = {
      count: n,
      sum: _.sum(values),
      mean,
      median: this.calculateMedian(sorted),
      mode: this.calculateMode(values),
      min: _.min(values),
      max: _.max(values),
      range: _.max(values) - _.min(values),
      variance: this.calculateVariance(values, mean),
      standardDeviation: this.calculateStandardDeviation(values),
      skewness: this.calculateSkewness(values, mean),
      kurtosis: this.calculateKurtosis(values, mean)
    };

    if (includeDistribution) {
      stats.percentiles = {
        p25: this.calculatePercentile(sorted, 25),
        p50: this.calculatePercentile(sorted, 50),
        p75: this.calculatePercentile(sorted, 75),
        p90: this.calculatePercentile(sorted, 90),
        p95: this.calculatePercentile(sorted, 95),
        p99: this.calculatePercentile(sorted, 99)
      };
      
      stats.quartiles = {
        q1: stats.percentiles.p25,
        q2: stats.percentiles.p50,
        q3: stats.percentiles.p75,
        iqr: stats.percentiles.p75 - stats.percentiles.p25
      };
    }

    return stats;
  }

  /**
   * Perform data join
   */
  performJoin(leftData, rightData, config) {
    const { leftKey, rightKey, joinType, prefix } = config;
    const result = [];
    
    // Create lookup map for right data
    const rightLookup = new Map();
    rightData.forEach(item => {
      const key = item[rightKey];
      if (!rightLookup.has(key)) {
        rightLookup.set(key, []);
      }
      rightLookup.get(key).push(item);
    });

    // Perform join
    leftData.forEach(leftItem => {
      const key = leftItem[leftKey];
      const rightItems = rightLookup.get(key) || [];
      
      if (rightItems.length > 0) {
        // Match found
        rightItems.forEach(rightItem => {
          const joined = { ...leftItem };
          
          // Add right item properties with prefix
          Object.entries(rightItem).forEach(([rightProp, value]) => {
            const propName = prefix ? `${prefix}${rightProp}` : rightProp;
            if (!joined.hasOwnProperty(propName)) {
              joined[propName] = value;
            }
          });
          
          result.push(joined);
        });
      } else if (joinType === 'left' || joinType === 'full') {
        // Left join - include left item even without match
        result.push(leftItem);
      }
    });

    // For full outer join, add unmatched right items
    if (joinType === 'full') {
      const matchedRightKeys = new Set();
      result.forEach(item => matchedRightKeys.add(item[rightKey]));
      
      rightData.forEach(rightItem => {
        if (!matchedRightKeys.has(rightItem[rightKey])) {
          result.push(rightItem);
        }
      });
    }

    return result;
  }

  // ==========================================
  // MATHEMATICAL UTILITIES
  // ==========================================

  calculateMedian(sortedValues) {
    const n = sortedValues.length;
    if (n === 0) return 0;
    
    const mid = Math.floor(n / 2);
    return n % 2 !== 0 ? sortedValues[mid] : (sortedValues[mid - 1] + sortedValues[mid]) / 2;
  }

  calculateMode(values) {
    const frequency = {};
    let maxFreq = 0;
    let mode = null;
    
    values.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1;
      if (frequency[value] > maxFreq) {
        maxFreq = frequency[value];
        mode = value;
      }
    });
    
    return mode;
  }

  calculateVariance(values, mean) {
    if (values.length === 0) return 0;
    const sumSquares = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0);
    return sumSquares / values.length;
  }

  calculateStandardDeviation(values) {
    const mean = _.mean(values);
    const variance = this.calculateVariance(values, mean);
    return Math.sqrt(variance);
  }

  calculateSkewness(values, mean) {
    if (values.length === 0) return 0;
    const n = values.length;
    const stdDev = this.calculateStandardDeviation(values);
    
    const sumCubes = values.reduce((sum, value) => sum + Math.pow((value - mean) / stdDev, 3), 0);
    return (n / ((n - 1) * (n - 2))) * sumCubes;
  }

  calculateKurtosis(values, mean) {
    if (values.length === 0) return 0;
    const n = values.length;
    const stdDev = this.calculateStandardDeviation(values);
    
    const sumFourths = values.reduce((sum, value) => sum + Math.pow((value - mean) / stdDev, 4), 0);
    return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sumFourths - (3 * (n - 1) * (n - 1)) / ((n - 2) * (n - 3));
  }

  calculatePercentile(sortedValues, percentile) {
    if (sortedValues.length === 0) return 0;
    
    const index = (percentile / 100) * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sortedValues[lower];
    }
    
    const weight = index - lower;
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }

  getIntervalDays(interval) {
    switch (interval) {
      case 'daily': return 1;
      case 'weekly': return 7;
      case 'monthly': return 30;
      case 'quarterly': return 91;
      case 'yearly': return 365;
      default: return 30;
    }
  }

  // ==========================================
  // PIPELINE MANAGEMENT
  // ==========================================

  registerTransformer(name, transformer) {
    this.registeredTransformers.set(name, transformer);
  }

  unregisterTransformer(name) {
    this.registeredTransformers.delete(name);
  }

  generatePipelineId() {
    return `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateCacheKey(data, transformation) {
    const dataHash = this.simpleHash(JSON.stringify(data));
    const transformHash = this.simpleHash(JSON.stringify(transformation));
    return `${dataHash}_${transformHash}`;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  updateMetrics(success, duration) {
    this.transformationMetrics.totalTransformations++;
    
    if (success) {
      this.transformationMetrics.successfulTransformations++;
    } else {
      this.transformationMetrics.failedTransformations++;
    }
    
    const total = this.transformationMetrics.totalTransformations;
    const currentAvg = this.transformationMetrics.averageTransformationTime;
    this.transformationMetrics.averageTransformationTime = 
      (currentAvg * (total - 1) + duration) / total;
  }

  getMetrics() {
    return {
      ...this.transformationMetrics,
      registeredTransformers: Array.from(this.registeredTransformers.keys()),
      cacheSize: this.transformationCache.size
    };
  }

  clearCache() {
    this.transformationCache.clear();
  }
}

// Create singleton instance
export const dataTransformationPipeline = new DataTransformationPipeline();

// Export convenience methods
export const executeTransformation = (data, transformations, options) =>
  dataTransformationPipeline.executePipeline(data, transformations, options);

export const registerTransformer = (name, transformer) =>
  dataTransformationPipeline.registerTransformer(name, transformer);

export const getTransformationMetrics = () =>
  dataTransformationPipeline.getMetrics();

export default dataTransformationPipeline;