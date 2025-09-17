// Data sync service - handles synchronization between source files and cached JSON
// Note: For initial implementation, we'll use static data and add real file processing later

// Data source configuration
const DATA_SOURCES = {
  workforce: {
    id: 'workforce-fy25',
    name: 'Workforce Headcount',
    path: '/source-metrics/workforce/fy25/New Emp List since FY20 to Q1FY25 1031 PT.csv',
    type: 'csv',
    category: 'workforce',
    lastSync: null,
    lastModified: null,
    status: 'pending'
  },
  turnover: {
    id: 'turnover-fy25',
    name: 'Turnover Data',
    path: '/source-metrics/terms-fy25/Terms FY25 Detail.xlsx',
    type: 'excel',
    category: 'turnover',
    lastSync: null,
    lastModified: null,
    status: 'pending'
  },
  exitSurveys: {
    id: 'exit-surveys-fy25',
    name: 'Exit Surveys',
    path: '/source-metrics/exit-surveys/fy25/',
    type: 'directory',
    category: 'surveys',
    lastSync: null,
    lastModified: null,
    status: 'pending'
  }
};

// Sync status management
class DataSyncService {
  constructor() {
    this.syncHistory = [];
    this.currentSync = null;
    this.listeners = new Set();
    this.syncStatus = {
      inProgress: false,
      lastSync: null,
      totalSources: Object.keys(DATA_SOURCES).length,
      syncedSources: 0,
      pendingSources: Object.keys(DATA_SOURCES).length,
      errors: []
    };
  }

  // Subscribe to sync events
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notify(event, data) {
    this.listeners.forEach(callback => callback({ event, data }));
  }

  // Check if file has been modified
  async checkFileModified(source) {
    try {
      const response = await fetch(source.path, { method: 'HEAD' });
      const lastModified = response.headers.get('last-modified');
      
      if (!source.lastSync) return true;
      
      const fileDate = new Date(lastModified);
      const syncDate = new Date(source.lastSync);
      
      return fileDate > syncDate;
    } catch (error) {
      console.error(`Error checking file modification for ${source.id}:`, error);
      return true; // Assume modified if we can't check
    }
  }

  // Process CSV file - simplified for now, will add real CSV parsing later
  async processCSV(path) {
    // For now, return mock data - will implement real CSV parsing
    console.log('Processing CSV:', path);
    return [];
  }

  // Process Excel file - simplified for now, will add real Excel parsing later
  async processExcel(path) {
    // For now, return mock data - will implement real Excel parsing
    console.log('Processing Excel:', path);
    return {};
  }
  
  // Process directory of files
  async processDirectory(path) {
    // For now, return mock data - will implement real directory processing
    console.log('Processing directory:', path);
    return {};
  }

  // Process workforce data
  async processWorkforceData(data) {
    const BE_CATEGORIES = ['F12', 'F11', 'F09', 'F10', 'PT12', 'PT9', 'PT11', 'PT10'];
    const STUDENT_CATEGORIES = ['SUE', 'CWS'];
    const TEMP_CATEGORIES = ['TEMP', 'NBE', 'PRN'];
    
    const results = {
      '6/30/25': {
        total: 0,
        beFaculty: 0,
        beStaff: 0,
        hsp: 0,
        students: 0,
        temp: 0,
        byLocation: {
          omaha: { beFaculty: 0, beStaff: 0, hsp: 0, students: 0, temp: 0 },
          phoenix: { beFaculty: 0, beStaff: 0, hsp: 0, students: 0, temp: 0 }
        }
      },
      '6/30/24': {
        total: 0,
        beFaculty: 0,
        beStaff: 0,
        hsp: 0,
        students: 0,
        temp: 0,
        byLocation: {
          omaha: { beFaculty: 0, beStaff: 0, hsp: 0, students: 0, temp: 0 },
          phoenix: { beFaculty: 0, beStaff: 0, hsp: 0, students: 0, temp: 0 }
        }
      }
    };

    data.forEach(row => {
      const endDate = row['END DATE'];
      const location = row['Location']?.toLowerCase().includes('phoenix') ? 'phoenix' : 'omaha';
      const personType = row['Person Type'];
      const assignmentCategory = row['Assignment Category Code'];
      
      if (results[endDate]) {
        results[endDate].total++;
        
        if (assignmentCategory === 'HSR') {
          results[endDate].hsp++;
          results[endDate].byLocation[location].hsp++;
        } else if (STUDENT_CATEGORIES.includes(assignmentCategory)) {
          results[endDate].students++;
          results[endDate].byLocation[location].students++;
        } else if (TEMP_CATEGORIES.includes(assignmentCategory)) {
          results[endDate].temp++;
          results[endDate].byLocation[location].temp++;
        } else if (personType === 'FACULTY' && BE_CATEGORIES.includes(assignmentCategory)) {
          results[endDate].beFaculty++;
          results[endDate].byLocation[location].beFaculty++;
        } else if (personType === 'STAFF' && BE_CATEGORIES.includes(assignmentCategory)) {
          results[endDate].beStaff++;
          results[endDate].byLocation[location].beStaff++;
        }
      }
    });

    return results;
  }

  // Sync a single data source
  async syncDataSource(sourceKey) {
    const source = DATA_SOURCES[sourceKey];
    if (!source) throw new Error(`Unknown data source: ${sourceKey}`);

    this.notify('sync-start', { source: sourceKey });
    
    try {
      let processedData = null;
      
      // Process based on file type
      switch (source.type) {
        case 'csv':
          const csvData = await this.processCSV(source.path);
          if (sourceKey === 'workforce') {
            processedData = await this.processWorkforceData(csvData);
          } else {
            processedData = csvData;
          }
          break;
          
        case 'excel':
          processedData = await this.processExcel(source.path);
          break;
          
        case 'directory':
          // Handle directory of files
          processedData = await this.processDirectory(source.path);
          break;
          
        default:
          throw new Error(`Unsupported file type: ${source.type}`);
      }

      // Update source status
      source.lastSync = new Date().toISOString();
      source.status = 'synced';
      
      // Store processed data
      const cacheKey = `processed_${sourceKey}`;
      localStorage.setItem(cacheKey, JSON.stringify(processedData));
      
      // Add to sync history
      this.syncHistory.push({
        source: sourceKey,
        timestamp: source.lastSync,
        recordsProcessed: Array.isArray(processedData) ? processedData.length : Object.keys(processedData).length,
        status: 'success'
      });
      
      this.notify('sync-complete', { source: sourceKey, data: processedData });
      
      return processedData;
      
    } catch (error) {
      source.status = 'error';
      this.syncStatus.errors.push({
        source: sourceKey,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      this.notify('sync-error', { source: sourceKey, error: error.message });
      throw error;
    }
  }

  // Sync all data sources
  async syncAllSources() {
    if (this.syncStatus.inProgress) {
      console.warn('Sync already in progress');
      return;
    }

    this.syncStatus.inProgress = true;
    this.syncStatus.errors = [];
    this.notify('sync-all-start', { sources: Object.keys(DATA_SOURCES) });

    const results = {};
    
    for (const sourceKey of Object.keys(DATA_SOURCES)) {
      try {
        const data = await this.syncDataSource(sourceKey);
        results[sourceKey] = data;
        this.syncStatus.syncedSources++;
        this.syncStatus.pendingSources--;
      } catch (error) {
        console.error(`Failed to sync ${sourceKey}:`, error);
        results[sourceKey] = { error: error.message };
      }
    }

    this.syncStatus.inProgress = false;
    this.syncStatus.lastSync = new Date().toISOString();
    
    // Store sync status
    localStorage.setItem('syncStatus', JSON.stringify(this.syncStatus));
    localStorage.setItem('syncHistory', JSON.stringify(this.syncHistory));
    
    this.notify('sync-all-complete', { results, status: this.syncStatus });
    
    return results;
  }

  // Check and sync modified sources
  async checkAndSyncModified() {
    const modifiedSources = [];
    
    for (const [key, source] of Object.entries(DATA_SOURCES)) {
      const isModified = await this.checkFileModified(source);
      if (isModified) {
        modifiedSources.push(key);
      }
    }

    if (modifiedSources.length > 0) {
      this.notify('modified-sources-detected', { sources: modifiedSources });
      
      for (const sourceKey of modifiedSources) {
        await this.syncDataSource(sourceKey);
      }
    }

    return modifiedSources;
  }

  // Get sync status
  getSyncStatus() {
    return {
      ...this.syncStatus,
      sources: DATA_SOURCES,
      history: this.syncHistory.slice(-10) // Last 10 syncs
    };
  }

  // Get cached data
  getCachedData(sourceKey) {
    const cacheKey = `processed_${sourceKey}`;
    const cached = localStorage.getItem(cacheKey);
    return cached ? JSON.parse(cached) : null;
  }

  // Clear all cached data
  clearCache() {
    Object.keys(DATA_SOURCES).forEach(sourceKey => {
      const cacheKey = `processed_${sourceKey}`;
      localStorage.removeItem(cacheKey);
    });
    
    localStorage.removeItem('syncStatus');
    localStorage.removeItem('syncHistory');
    
    this.syncHistory = [];
    this.syncStatus.syncedSources = 0;
    this.syncStatus.pendingSources = Object.keys(DATA_SOURCES).length;
    
    this.notify('cache-cleared', {});
  }
}

// Create singleton instance
const dataSyncService = new DataSyncService();

// Auto-sync on app start
export const initializeDataSync = async () => {
  // Check for modified sources on startup
  const modified = await dataSyncService.checkAndSyncModified();
  
  if (modified.length === 0) {
    // No modifications, check if we have any cached data
    const hasCache = Object.keys(DATA_SOURCES).some(key => 
      dataSyncService.getCachedData(key) !== null
    );
    
    if (!hasCache) {
      // No cache, do initial sync
      await dataSyncService.syncAllSources();
    }
  }
  
  return dataSyncService.getSyncStatus();
};

export default dataSyncService;