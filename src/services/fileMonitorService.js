// File monitoring service - watches source files for changes
// Uses polling strategy for cross-platform compatibility

class FileMonitorService {
  constructor() {
    this.watchList = new Map();
    this.pollingInterval = null;
    this.listeners = new Set();
    this.isMonitoring = false;
    this.checkInterval = 5000; // Check every 5 seconds when monitoring
  }

  // Subscribe to file change events
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notify(event, data) {
    this.listeners.forEach(callback => callback({ event, data }));
  }

  // Add file to watch list
  addFile(path, metadata = {}) {
    this.watchList.set(path, {
      path,
      lastModified: null,
      lastSize: null,
      lastHash: null,
      ...metadata
    });
    
    this.notify('file-added', { path, metadata });
  }

  // Remove file from watch list
  removeFile(path) {
    this.watchList.delete(path);
    this.notify('file-removed', { path });
  }

  // Check if file has been modified (simplified for browser environment)
  async checkFileModified(fileInfo) {
    try {
      // In browser environment, we'll use a simplified approach
      // Real implementation would need server-side support or File API
      const response = await fetch(fileInfo.path, { 
        method: 'HEAD',
        cache: 'no-cache' 
      });
      
      const lastModified = response.headers.get('last-modified');
      const contentLength = response.headers.get('content-length');
      
      // Check if file has changed
      const hasChanged = fileInfo.lastModified && 
        (fileInfo.lastModified !== lastModified || 
         fileInfo.lastSize !== contentLength);
      
      // Update file info
      fileInfo.lastModified = lastModified;
      fileInfo.lastSize = contentLength;
      
      return hasChanged;
    } catch (error) {
      console.error(`Error checking file ${fileInfo.path}:`, error);
      return false;
    }
  }

  // Check all watched files for changes
  async checkAllFiles() {
    const changes = [];
    
    for (const [path, fileInfo] of this.watchList) {
      const hasChanged = await this.checkFileModified(fileInfo);
      
      if (hasChanged) {
        changes.push({
          path,
          timestamp: new Date().toISOString(),
          lastModified: fileInfo.lastModified,
          size: fileInfo.lastSize
        });
        
        this.notify('file-changed', { 
          path, 
          fileInfo,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    if (changes.length > 0) {
      this.notify('changes-detected', { changes });
    }
    
    return changes;
  }

  // Start monitoring files
  startMonitoring(intervalMs = 5000) {
    if (this.isMonitoring) {
      console.warn('File monitoring already active');
      return;
    }
    
    this.checkInterval = intervalMs;
    this.isMonitoring = true;
    
    // Initial check
    this.checkAllFiles();
    
    // Set up polling
    this.pollingInterval = setInterval(() => {
      this.checkAllFiles();
    }, this.checkInterval);
    
    this.notify('monitoring-started', { 
      interval: this.checkInterval,
      watchedFiles: Array.from(this.watchList.keys())
    });
  }

  // Stop monitoring files
  stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    this.isMonitoring = false;
    
    this.notify('monitoring-stopped', {
      watchedFiles: Array.from(this.watchList.keys())
    });
  }

  // Get monitoring status
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      checkInterval: this.checkInterval,
      watchedFiles: Array.from(this.watchList.entries()).map(([path, info]) => ({
        path,
        lastModified: info.lastModified,
        lastSize: info.lastSize,
        metadata: info.metadata
      }))
    };
  }

  // Clear all watched files
  clearWatchList() {
    this.stopMonitoring();
    this.watchList.clear();
    this.notify('watchlist-cleared', {});
  }
}

// Create singleton instance
const fileMonitorService = new FileMonitorService();

// Initialize with default files to watch
export const initializeFileMonitor = () => {
  // Add source metric files to watch list
  const filesToWatch = [
    {
      path: '/source-metrics/workforce/fy25/New Emp List since FY20 to Q1FY25 1031 PT.csv',
      metadata: { category: 'workforce', type: 'csv' }
    },
    {
      path: '/source-metrics/terms-fy25/Terms FY25 Detail.xlsx',
      metadata: { category: 'turnover', type: 'excel' }
    },
    {
      path: '/source-metrics/exit-surveys/fy25/',
      metadata: { category: 'surveys', type: 'directory' }
    }
  ];
  
  filesToWatch.forEach(file => {
    fileMonitorService.addFile(file.path, file.metadata);
  });
  
  return fileMonitorService;
};

export default fileMonitorService;