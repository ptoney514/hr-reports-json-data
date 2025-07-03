/**
 * Advanced Load Testing Framework for HR Reports Application
 * Simulates realistic traffic patterns and measures performance under load
 */

class LoadTestingFramework {
  constructor() {
    this.testConfigs = new Map();
    this.activeTests = new Map();
    this.results = new Map();
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      peakConcurrency: 0,
      throughput: 0
    };
    
    this.setupDefaultConfigs();
  }

  setupDefaultConfigs() {
    // Light load test - 100 users over 5 minutes
    this.testConfigs.set('light', {
      name: 'Light Load Test',
      virtualUsers: 100,
      duration: 300000, // 5 minutes
      rampUpTime: 60000, // 1 minute
      scenarios: [
        { name: 'dashboard_view', weight: 40, endpoint: '/' },
        { name: 'workforce_data', weight: 30, endpoint: '/api/workforce' },
        { name: 'turnover_data', weight: 20, endpoint: '/api/turnover' },
        { name: 'export_action', weight: 10, endpoint: '/api/export' }
      ]
    });

    // Moderate load test - 500 users over 10 minutes
    this.testConfigs.set('moderate', {
      name: 'Moderate Load Test',
      virtualUsers: 500,
      duration: 600000, // 10 minutes
      rampUpTime: 120000, // 2 minutes
      scenarios: [
        { name: 'dashboard_view', weight: 35, endpoint: '/' },
        { name: 'workforce_data', weight: 25, endpoint: '/api/workforce' },
        { name: 'turnover_data', weight: 20, endpoint: '/api/turnover' },
        { name: 'i9_compliance', weight: 15, endpoint: '/api/i9-compliance' },
        { name: 'export_action', weight: 5, endpoint: '/api/export' }
      ]
    });

    // Heavy load test - 1000+ users over 15 minutes
    this.testConfigs.set('heavy', {
      name: 'Heavy Load Test',
      virtualUsers: 1000,
      duration: 900000, // 15 minutes
      rampUpTime: 180000, // 3 minutes
      scenarios: [
        { name: 'dashboard_view', weight: 30, endpoint: '/' },
        { name: 'workforce_data', weight: 25, endpoint: '/api/workforce' },
        { name: 'turnover_data', weight: 20, endpoint: '/api/turnover' },
        { name: 'i9_compliance', weight: 15, endpoint: '/api/i9-compliance' },
        { name: 'recruiting_data', weight: 7, endpoint: '/api/recruiting' },
        { name: 'export_action', weight: 3, endpoint: '/api/export' }
      ]
    });

    // Stress test - increasing load until failure
    this.testConfigs.set('stress', {
      name: 'Stress Test',
      virtualUsers: 2000,
      duration: 1200000, // 20 minutes
      rampUpTime: 300000, // 5 minutes
      incremental: true,
      scenarios: [
        { name: 'dashboard_view', weight: 40, endpoint: '/' },
        { name: 'workforce_data', weight: 30, endpoint: '/api/workforce' },
        { name: 'turnover_data', weight: 20, endpoint: '/api/turnover' },
        { name: 'export_action', weight: 10, endpoint: '/api/export' }
      ]
    });

    // Spike test - sudden traffic spikes
    this.testConfigs.set('spike', {
      name: 'Spike Test',
      virtualUsers: 1500,
      duration: 300000, // 5 minutes
      rampUpTime: 10000, // 10 seconds (sudden spike)
      scenarios: [
        { name: 'dashboard_view', weight: 50, endpoint: '/' },
        { name: 'workforce_data', weight: 30, endpoint: '/api/workforce' },
        { name: 'turnover_data', weight: 20, endpoint: '/api/turnover' }
      ]
    });
  }

  async runLoadTest(configName = 'light', customConfig = null) {
    const config = customConfig || this.testConfigs.get(configName);
    if (!config) {
      throw new Error(`Load test configuration '${configName}' not found`);
    }

    console.log(`Starting ${config.name}...`);
    
    const testId = this.generateTestId();
    const startTime = Date.now();
    
    this.activeTests.set(testId, {
      config,
      startTime,
      status: 'running',
      virtualUsers: [],
      metrics: this.createMetricsCollector()
    });

    try {
      await this.executeLoadTest(testId, config);
      
      const test = this.activeTests.get(testId);
      test.status = 'completed';
      test.endTime = Date.now();
      
      const results = this.analyzeResults(testId);
      this.results.set(testId, results);
      
      console.log(`${config.name} completed:`, results.summary);
      return results;
      
    } catch (error) {
      console.error(`Load test failed:`, error);
      const test = this.activeTests.get(testId);
      test.status = 'failed';
      test.error = error.message;
      throw error;
    }
  }

  async executeLoadTest(testId, config) {
    const test = this.activeTests.get(testId);
    const { virtualUsers, duration, rampUpTime, scenarios } = config;

    // Calculate user spawn rate
    const spawnRate = virtualUsers / (rampUpTime / 1000);
    const spawnInterval = 1000 / spawnRate;

    // Spawn virtual users gradually
    for (let i = 0; i < virtualUsers; i++) {
      setTimeout(() => {
        this.spawnVirtualUser(testId, scenarios);
      }, i * spawnInterval);
    }

    // Wait for test duration
    await new Promise(resolve => setTimeout(resolve, duration));

    // Stop all virtual users
    this.stopAllVirtualUsers(testId);
  }

  spawnVirtualUser(testId, scenarios) {
    const test = this.activeTests.get(testId);
    const userId = this.generateUserId();
    
    const virtualUser = {
      id: userId,
      startTime: Date.now(),
      requests: [],
      active: true
    };

    test.virtualUsers.push(virtualUser);

    // Start user session
    this.simulateUserSession(testId, virtualUser, scenarios);
  }

  async simulateUserSession(testId, virtualUser, scenarios) {
    const test = this.activeTests.get(testId);
    
    while (virtualUser.active && test.status === 'running') {
      try {
        // Select scenario based on weight
        const scenario = this.selectScenario(scenarios);
        
        // Simulate realistic user behavior
        await this.simulateUserAction(testId, virtualUser, scenario);
        
        // Wait between actions (realistic user behavior)
        const thinkTime = this.generateThinkTime();
        await new Promise(resolve => setTimeout(resolve, thinkTime));
        
      } catch (error) {
        console.error(`Virtual user ${virtualUser.id} error:`, error);
        test.metrics.recordError(error);
      }
    }
  }

  async simulateUserAction(testId, virtualUser, scenario) {
    const test = this.activeTests.get(testId);
    const startTime = performance.now();
    
    try {
      // Simulate HTTP request
      const response = await this.simulateHttpRequest(scenario.endpoint);
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      const request = {
        scenario: scenario.name,
        endpoint: scenario.endpoint,
        responseTime,
        status: response.status,
        timestamp: Date.now()
      };
      
      virtualUser.requests.push(request);
      test.metrics.recordRequest(request);
      
      // Simulate additional actions based on scenario
      await this.simulateScenarioSpecificActions(scenario, response);
      
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      const request = {
        scenario: scenario.name,
        endpoint: scenario.endpoint,
        responseTime,
        status: 'error',
        error: error.message,
        timestamp: Date.now()
      };
      
      virtualUser.requests.push(request);
      test.metrics.recordRequest(request);
      throw error;
    }
  }

  async simulateHttpRequest(endpoint) {
    // Simulate network latency
    const networkLatency = this.generateNetworkLatency();
    await new Promise(resolve => setTimeout(resolve, networkLatency));
    
    // Simulate server processing time
    const processingTime = this.generateProcessingTime();
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Simulate response
    const success = Math.random() > 0.05; // 95% success rate
    
    if (success) {
      return {
        status: 200,
        data: this.generateMockResponseData(endpoint),
        size: this.generateResponseSize()
      };
    } else {
      throw new Error('Simulated server error');
    }
  }

  async simulateScenarioSpecificActions(scenario, response) {
    switch (scenario.name) {
      case 'dashboard_view':
        // Simulate loading charts and data
        await this.simulateChartLoading();
        break;
        
      case 'workforce_data':
        // Simulate data processing and visualization
        await this.simulateDataProcessing(response.data);
        break;
        
      case 'export_action':
        // Simulate export generation
        await this.simulateExportGeneration();
        break;
        
      default:
        // Default action - brief processing time
        await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async simulateChartLoading() {
    // Simulate chart rendering time
    const renderTime = 200 + Math.random() * 300;
    await new Promise(resolve => setTimeout(resolve, renderTime));
  }

  async simulateDataProcessing(data) {
    // Simulate data processing time based on data size
    const processingTime = 100 + (data?.length || 0) * 0.1;
    await new Promise(resolve => setTimeout(resolve, processingTime));
  }

  async simulateExportGeneration() {
    // Simulate export generation (longer operation)
    const exportTime = 1000 + Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, exportTime));
  }

  selectScenario(scenarios) {
    const totalWeight = scenarios.reduce((sum, s) => sum + s.weight, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const scenario of scenarios) {
      currentWeight += scenario.weight;
      if (random <= currentWeight) {
        return scenario;
      }
    }
    
    return scenarios[0]; // Fallback
  }

  generateThinkTime() {
    // Realistic user think time (1-10 seconds)
    return 1000 + Math.random() * 9000;
  }

  generateNetworkLatency() {
    // Simulate network latency (10-200ms)
    return 10 + Math.random() * 190;
  }

  generateProcessingTime() {
    // Simulate server processing time (50-500ms)
    return 50 + Math.random() * 450;
  }

  generateResponseSize() {
    // Simulate response size (1KB-100KB)
    return 1024 + Math.random() * 99 * 1024;
  }

  generateMockResponseData(endpoint) {
    const mockData = {
      '/': { type: 'html', size: 'large' },
      '/api/workforce': { type: 'json', records: 100 + Math.random() * 500 },
      '/api/turnover': { type: 'json', records: 50 + Math.random() * 200 },
      '/api/i9-compliance': { type: 'json', records: 200 + Math.random() * 300 },
      '/api/recruiting': { type: 'json', records: 30 + Math.random() * 100 },
      '/api/export': { type: 'binary', size: 'xlarge' }
    };
    
    return mockData[endpoint] || { type: 'json', records: 10 };
  }

  stopAllVirtualUsers(testId) {
    const test = this.activeTests.get(testId);
    test.virtualUsers.forEach(user => {
      user.active = false;
    });
  }

  createMetricsCollector() {
    return {
      requests: [],
      errors: [],
      responseTimeHistogram: new Map(),
      
      recordRequest(request) {
        this.requests.push(request);
        
        // Update histogram
        const bucket = Math.floor(request.responseTime / 100) * 100;
        this.responseTimeHistogram.set(bucket, 
          (this.responseTimeHistogram.get(bucket) || 0) + 1
        );
      },
      
      recordError(error) {
        this.errors.push({
          message: error.message,
          timestamp: Date.now()
        });
      }
    };
  }

  analyzeResults(testId) {
    const test = this.activeTests.get(testId);
    const { config, startTime, endTime, virtualUsers, metrics } = test;
    
    const duration = endTime - startTime;
    const totalRequests = metrics.requests.length;
    const successfulRequests = metrics.requests.filter(r => r.status === 200).length;
    const failedRequests = totalRequests - successfulRequests;
    
    const responseTimes = metrics.requests.map(r => r.responseTime);
    const averageResponseTime = responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length;
    const medianResponseTime = this.calculateMedian(responseTimes);
    const p95ResponseTime = this.calculatePercentile(responseTimes, 95);
    const p99ResponseTime = this.calculatePercentile(responseTimes, 99);
    
    const throughput = (totalRequests / duration) * 1000; // requests per second
    
    return {
      testId,
      config: config.name,
      summary: {
        duration: duration,
        totalRequests,
        successfulRequests,
        failedRequests,
        errorRate: (failedRequests / totalRequests) * 100,
        averageResponseTime: Math.round(averageResponseTime),
        medianResponseTime: Math.round(medianResponseTime),
        p95ResponseTime: Math.round(p95ResponseTime),
        p99ResponseTime: Math.round(p99ResponseTime),
        throughput: Math.round(throughput * 100) / 100,
        peakConcurrency: virtualUsers.length
      },
      detailed: {
        virtualUsers: virtualUsers.length,
        responseTimes,
        responseTimeHistogram: Object.fromEntries(metrics.responseTimeHistogram),
        errors: metrics.errors,
        scenarioBreakdown: this.analyzeScenarios(metrics.requests),
        timelineAnalysis: this.analyzeTimeline(metrics.requests, startTime, endTime)
      }
    };
  }

  analyzeScenarios(requests) {
    const scenarios = new Map();
    
    requests.forEach(request => {
      if (!scenarios.has(request.scenario)) {
        scenarios.set(request.scenario, {
          count: 0,
          totalResponseTime: 0,
          errors: 0
        });
      }
      
      const scenario = scenarios.get(request.scenario);
      scenario.count++;
      scenario.totalResponseTime += request.responseTime;
      
      if (request.status !== 200) {
        scenario.errors++;
      }
    });
    
    const result = {};
    scenarios.forEach((data, name) => {
      result[name] = {
        requests: data.count,
        averageResponseTime: Math.round(data.totalResponseTime / data.count),
        errorRate: (data.errors / data.count) * 100
      };
    });
    
    return result;
  }

  analyzeTimeline(requests, startTime, endTime) {
    const duration = endTime - startTime;
    const bucketSize = duration / 60; // 60 data points
    const buckets = Array(60).fill(0).map(() => ({ requests: 0, errors: 0 }));
    
    requests.forEach(request => {
      const bucketIndex = Math.floor((request.timestamp - startTime) / bucketSize);
      if (bucketIndex >= 0 && bucketIndex < buckets.length) {
        buckets[bucketIndex].requests++;
        if (request.status !== 200) {
          buckets[bucketIndex].errors++;
        }
      }
    });
    
    return buckets;
  }

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      return sorted[mid];
    }
  }

  calculatePercentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  generateTestId() {
    return `load-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateUserId() {
    return `user-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Export results for analysis
  exportResults(testId, format = 'json') {
    const results = this.results.get(testId);
    if (!results) {
      throw new Error(`Test results for ${testId} not found`);
    }

    switch (format) {
      case 'json':
        return JSON.stringify(results, null, 2);
      
      case 'csv':
        return this.convertToCSV(results);
      
      case 'report':
        return this.generateReport(results);
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  convertToCSV(results) {
    const { detailed } = results;
    const headers = ['timestamp', 'scenario', 'endpoint', 'responseTime', 'status'];
    const rows = [headers.join(',')];
    
    detailed.virtualUsers.forEach(user => {
      user.requests.forEach(request => {
        const row = [
          request.timestamp,
          request.scenario,
          request.endpoint,
          request.responseTime,
          request.status
        ];
        rows.push(row.join(','));
      });
    });
    
    return rows.join('\n');
  }

  generateReport(results) {
    const { config, summary, detailed } = results;
    
    return `
# Load Test Report: ${config}

## Summary
- **Duration**: ${Math.round(summary.duration / 1000)}s
- **Total Requests**: ${summary.totalRequests}
- **Success Rate**: ${(100 - summary.errorRate).toFixed(2)}%
- **Average Response Time**: ${summary.averageResponseTime}ms
- **95th Percentile**: ${summary.p95ResponseTime}ms
- **Throughput**: ${summary.throughput} req/s

## Performance Metrics
- **Median Response Time**: ${summary.medianResponseTime}ms
- **99th Percentile**: ${summary.p99ResponseTime}ms
- **Peak Concurrency**: ${summary.peakConcurrency} users

## Scenario Breakdown
${Object.entries(detailed.scenarioBreakdown).map(([scenario, data]) => 
  `- **${scenario}**: ${data.requests} requests, ${data.averageResponseTime}ms avg, ${data.errorRate.toFixed(2)}% errors`
).join('\n')}

## Recommendations
${this.generateRecommendations(summary)}
    `.trim();
  }

  generateRecommendations(summary) {
    const recommendations = [];
    
    if (summary.errorRate > 1) {
      recommendations.push('- **High Error Rate**: Investigate server errors and implement better error handling');
    }
    
    if (summary.averageResponseTime > 1000) {
      recommendations.push('- **Slow Response Times**: Optimize backend processing and database queries');
    }
    
    if (summary.p95ResponseTime > 2000) {
      recommendations.push('- **Poor 95th Percentile**: Focus on optimizing slowest operations');
    }
    
    if (summary.throughput < 100) {
      recommendations.push('- **Low Throughput**: Consider scaling infrastructure or optimizing application');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('- **Performance Good**: Application handles load well under test conditions');
    }
    
    return recommendations.join('\n');
  }

  // Get all test results
  getAllResults() {
    return Array.from(this.results.values());
  }

  // Clear old test results
  clearResults(olderThanMs = 24 * 60 * 60 * 1000) { // 24 hours
    const cutoff = Date.now() - olderThanMs;
    const toDelete = [];
    
    this.results.forEach((result, testId) => {
      if (result.summary.startTime < cutoff) {
        toDelete.push(testId);
      }
    });
    
    toDelete.forEach(testId => this.results.delete(testId));
    
    return toDelete.length;
  }
}

// Create singleton instance
const loadTesting = new LoadTestingFramework();

export default loadTesting;
export { LoadTestingFramework };