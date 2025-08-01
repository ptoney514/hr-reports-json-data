// src/services/DataService.js
// This replaces FirebaseService and provides the same API interface
// so existing hooks and components work without changes

import dashboardData from '../data/dashboard-data.json';

// Map quarter formats to your actual date periods
const quarterToDateMap = {
  'Q2-2025': '6-30-2025',
  'Q1-2025': '3-31-2025', 
  'Q4-2024': '12-31-2024',
  'Q3-2024': '9-30-2024',
  // Also handle Firebase format (2025-Q1) if needed
  '2025-Q2': '6-30-2025',
  '2025-Q1': '3-31-2025',
  '2024-Q4': '12-31-2024',
  '2024-Q3': '9-30-2024'
};

// Helper function to get the correct period key
const getPeriodKey = (period) => {
  // If it's already a date format, use it directly
  if (period && period.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
    return period;
  }
  // Otherwise, map from quarter format to date
  return quarterToDateMap[period] || period;
};

// Store for in-memory updates (in production, this would be saved to file)
let dataStore = { ...dashboardData };

// Mock the FirebaseService API
const dataService = {
  // Get the current data store (for saving to file)
  getDataStore: () => dataStore,
  
  // Update the entire data store (for importing JSON)
  updateDataStore: (newData) => {
    dataStore = { ...dataStore, ...newData };
  },

  // Workforce data
  getWorkforceMetrics: async (period) => {
    const datePeriod = getPeriodKey(period);
    const data = dataStore.workforce[datePeriod];
    
    if (!data) {
      console.warn(`No workforce data found for period: ${period} (mapped to ${datePeriod})`);
      return null;
    }
    
    // Add Firebase-like metadata
    return {
      ...data,
      lastUpdated: { toDate: () => new Date(data.lastUpdated) },
      version: '2.0',
      dataSource: 'json'
    };
  },
  
  // Set workforce metrics (CREATE/UPDATE)
  setWorkforceMetrics: async (period, data) => {
    const datePeriod = getPeriodKey(period);
    dataStore.workforce[datePeriod] = {
      ...data,
      period: datePeriod,
      lastUpdated: new Date().toISOString()
    };
    console.log(`Workforce data saved for period: ${datePeriod}`);
    return true;
  },

  // Turnover data
  getTurnoverMetrics: async (period) => {
    const datePeriod = getPeriodKey(period);
    const data = dataStore.turnover[datePeriod];
    
    if (!data) {
      console.warn(`No turnover data found for period: ${period} (mapped to ${datePeriod})`);
      return null;
    }
    
    return {
      ...data,
      lastUpdated: { toDate: () => new Date(data.lastUpdated) }
    };
  },
  
  // Set turnover metrics (CREATE/UPDATE)
  setTurnoverMetrics: async (period, data) => {
    const datePeriod = getPeriodKey(period);
    dataStore.turnover[datePeriod] = {
      ...data,
      period: datePeriod,
      lastUpdated: new Date().toISOString()
    };
    console.log(`Turnover data saved for period: ${datePeriod}`);
    return true;
  },

  // I-9 Compliance data
  getI9ComplianceMetrics: async (period) => {
    const datePeriod = getPeriodKey(period);
    const data = dataStore.i9Compliance[datePeriod];
    
    if (!data) {
      console.warn(`No I-9 compliance data found for period: ${period} (mapped to ${datePeriod})`);
      return null;
    }
    
    return {
      ...data,
      lastUpdated: { toDate: () => new Date(data.lastUpdated) }
    };
  },
  
  // Set compliance metrics (CREATE/UPDATE)
  setComplianceMetrics: async (period, data) => {
    const datePeriod = getPeriodKey(period);
    dataStore.i9Compliance[datePeriod] = {
      ...data,
      period: datePeriod,
      lastUpdated: new Date().toISOString()
    };
    console.log(`Compliance data saved for period: ${datePeriod}`);
    return true;
  },

  // Recruiting data
  getRecruitingMetrics: async (period) => {
    const datePeriod = getPeriodKey(period);
    const data = dataStore.recruiting[datePeriod];
    
    if (!data) {
      console.warn(`No recruiting data found for period: ${period} (mapped to ${datePeriod})`);
      return null;
    }
    
    return {
      ...data,
      lastUpdated: { toDate: () => new Date(data.lastUpdated) }
    };
  },
  
  // Set recruiting metrics (CREATE/UPDATE)
  setRecruitingMetrics: async (period, data) => {
    const datePeriod = getPeriodKey(period);
    dataStore.recruiting[datePeriod] = {
      ...data,
      period: datePeriod,
      lastUpdated: new Date().toISOString()
    };
    console.log(`Recruiting data saved for period: ${datePeriod}`);
    return true;
  },

  // Exit Survey data
  getExitSurveyMetrics: async (period) => {
    const datePeriod = getPeriodKey(period);
    const data = dataStore.exitSurvey[datePeriod];
    
    if (!data) {
      console.warn(`No exit survey data found for period: ${period} (mapped to ${datePeriod})`);
      return null;
    }
    
    return {
      ...data,
      lastUpdated: { toDate: () => new Date(data.lastUpdated) }
    };
  },
  
  // Set exit survey metrics (CREATE/UPDATE)
  setExitSurveyMetrics: async (period, data) => {
    const datePeriod = getPeriodKey(period);
    dataStore.exitSurvey[datePeriod] = {
      ...data,
      period: datePeriod,
      lastUpdated: new Date().toISOString()
    };
    console.log(`Exit survey data saved for period: ${datePeriod}`);
    return true;
  },

  // Mock real-time subscription (returns empty unsubscribe function)
  subscribeToMetrics: (metricType, period, callback) => {
    console.log(`Subscription requested for ${metricType} - ${period} (real-time disabled in JSON mode)`);
    
    // Optionally, you could still call the callback with initial data
    // to maintain compatibility
    setTimeout(async () => {
      let data = null;
      switch(metricType) {
        case 'workforce':
          data = await dataService.getWorkforceMetrics(period);
          break;
        case 'turnover':
          data = await dataService.getTurnoverMetrics(period);
          break;
        case 'i9Compliance':
          data = await dataService.getI9ComplianceMetrics(period);
          break;
        case 'recruiting':
          data = await dataService.getRecruitingMetrics(period);
          break;
        case 'exitSurvey':
          data = await dataService.getExitSurveyMetrics(period);
          break;
      }
      if (data && callback) {
        callback(data);
      }
    }, 100);
    
    // Return unsubscribe function
    return () => {
      console.log(`Unsubscribed from ${metricType} - ${period}`);
    };
  },

  // Additional helper methods
  getAvailablePeriods: () => {
    return Object.keys(dataStore.reportingPeriods);
  },

  getPeriodLabel: (period) => {
    const datePeriod = getPeriodKey(period);
    return dataStore.reportingPeriods[datePeriod]?.label || period;
  },
  
  // Generic method to get metrics by dashboard type (for admin dashboard)
  getMetricsByDashboard: async (dashboardType, period) => {
    switch(dashboardType) {
      case 'workforce':
        return dataService.getWorkforceMetrics(period);
      case 'turnover':
        return dataService.getTurnoverMetrics(period);
      case 'compliance':
        return dataService.getI9ComplianceMetrics(period);
      case 'recruiting':
        return dataService.getRecruitingMetrics(period);
      case 'exitSurvey':
        return dataService.getExitSurveyMetrics(period);
      default:
        throw new Error(`Unknown dashboard type: ${dashboardType}`);
    }
  },
  
  // Delete quarter data
  deleteQuarterData: async (dashboardType, period) => {
    const datePeriod = getPeriodKey(period);
    
    switch(dashboardType) {
      case 'workforce':
        delete dataStore.workforce[datePeriod];
        break;
      case 'turnover':
        delete dataStore.turnover[datePeriod];
        break;
      case 'compliance':
        delete dataStore.i9Compliance[datePeriod];
        break;
      case 'recruiting':
        delete dataStore.recruiting[datePeriod];
        break;
      case 'exitSurvey':
        delete dataStore.exitSurvey[datePeriod];
        break;
      default:
        throw new Error(`Unknown dashboard type: ${dashboardType}`);
    }
    
    console.log(`Deleted ${dashboardType} data for period: ${datePeriod}`);
    return true;
  }
};

// Export as default to match FirebaseService import pattern
export default dataService;

// Also export named for flexibility
export { dataService };