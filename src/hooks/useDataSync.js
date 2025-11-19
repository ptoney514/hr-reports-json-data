import { useState, useEffect, useCallback } from 'react';
import dataSyncService, { initializeDataSync } from '../services/dataSyncService';

export const useDataSync = () => {
  const [syncStatus, setSyncStatus] = useState({
    inProgress: false,
    lastSync: null,
    totalSources: 0,
    syncedSources: 0,
    pendingSources: 0,
    errors: [],
    sources: {},
    history: []
  });
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Subscribe to sync service events
  useEffect(() => {
    const unsubscribe = dataSyncService.subscribe((event) => {
      switch (event.event) {
        case 'sync-start':
          setSyncStatus(prev => ({
            ...prev,
            inProgress: true,
            currentSource: event.data.source
          }));
          break;
          
        case 'sync-complete':
          setSyncStatus(prev => ({
            ...prev,
            syncedSources: prev.syncedSources + 1,
            pendingSources: prev.pendingSources - 1,
            sources: {
              ...prev.sources,
              [event.data.source]: {
                ...prev.sources[event.data.source],
                status: 'synced',
                lastSync: new Date().toISOString()
              }
            }
          }));
          break;
          
        case 'sync-error':
          setSyncStatus(prev => ({
            ...prev,
            errors: [...prev.errors, {
              source: event.data.source,
              error: event.data.error,
              timestamp: new Date().toISOString()
            }]
          }));
          break;
          
        case 'sync-all-complete':
          setSyncStatus(prev => ({
            ...prev,
            inProgress: false,
            lastSync: new Date().toISOString(),
            currentSource: null
          }));
          break;
          
        case 'modified-sources-detected':
          setSyncStatus(prev => ({
            ...prev,
            modifiedSources: event.data.sources
          }));
          break;
          
        default:
          break;
      }
    });

    // Initial status load
    setSyncStatus(dataSyncService.getSyncStatus());
    
    return unsubscribe;
  }, []);

  // Initialize sync on mount
  useEffect(() => {
    if (!isInitialized) {
      const initialize = async () => {
        try {
          const status = await initializeDataSync();
          setSyncStatus(status);
          setIsInitialized(true);
        } catch (error) {
          console.error('Failed to initialize data sync:', error);
        }
      };

      initialize();
    }
  }, [isInitialized]);

  // Sync single source
  const syncSource = useCallback(async (sourceKey) => {
    try {
      const result = await dataSyncService.syncDataSource(sourceKey);
      setSyncStatus(dataSyncService.getSyncStatus());
      return result;
    } catch (error) {
      console.error(`Failed to sync ${sourceKey}:`, error);
      throw error;
    }
  }, []);

  // Sync all sources
  const syncAll = useCallback(async () => {
    try {
      const results = await dataSyncService.syncAllSources();
      setSyncStatus(dataSyncService.getSyncStatus());
      return results;
    } catch (error) {
      console.error('Failed to sync all sources:', error);
      throw error;
    }
  }, []);

  // Check for modified sources
  const checkModified = useCallback(async () => {
    try {
      const modified = await dataSyncService.checkAndSyncModified();
      setSyncStatus(dataSyncService.getSyncStatus());
      return modified;
    } catch (error) {
      console.error('Failed to check modified sources:', error);
      throw error;
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    dataSyncService.clearCache();
    setSyncStatus(dataSyncService.getSyncStatus());
  }, []);

  // Get cached data for a source
  const getCachedData = useCallback((sourceKey) => {
    return dataSyncService.getCachedData(sourceKey);
  }, []);

  return {
    syncStatus,
    syncSource,
    syncAll,
    checkModified,
    clearCache,
    getCachedData,
    isInitialized
  };
};