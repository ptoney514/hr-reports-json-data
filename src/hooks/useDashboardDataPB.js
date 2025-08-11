import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import pocketBaseDataService from '../../core/services/pocketbase-data.service.js';
import { useAppStore } from '../../core/store/index.js';

/**
 * Enhanced hook for PocketBase dashboard data with real-time subscriptions
 * Provides comprehensive data management for HR Reports v2
 */
export const useDashboardDataPB = (dashboardType = 'workforce', options = {}) => {
  const { 
    includeTrends = false,
    trendPeriods = 6,
    enableRealTime = true,
    ...queryOptions 
  } = options;

  const period = useAppStore((state) => state.period);
  const filters = useAppStore((state) => state.filters);
  const queryClient = useQueryClient();

  // Create stable query keys
  const dataQueryKey = ['pocketbase', dashboardType, period?.date, JSON.stringify(filters)];
  const trendsQueryKey = ['pocketbase-trends', dashboardType, trendPeriods];

  // Main dashboard data query
  const dataQuery = useQuery({
    queryKey: dataQueryKey,
    queryFn: async ({ signal }) => {
      console.log(`🔄 Fetching ${dashboardType} data from PocketBase...`);
      
      // Add signal support for proper cancellation
      switch (dashboardType) {
        case 'workforce':
          return await pocketBaseDataService.getWorkforceData(period?.label || period?.date, filters, signal);
        case 'turnover':
          return await pocketBaseDataService.getTurnoverData(period?.label || period?.date, filters, signal);
        case 'exit-surveys':
          return await pocketBaseDataService.getExitSurveyData(period?.label || period?.date, filters, signal);
        default:
          throw new Error(`Unknown dashboard type: ${dashboardType}`);
      }
    },
    staleTime: 10 * 60 * 1000, // Increased to 10 minutes to reduce refetches
    gcTime: 30 * 60 * 1000, // Increased to 30 minutes
    retry: (failureCount, error) => {
      // Don't retry on autocancellation errors
      if (error?.message?.includes('autocancelled')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: false,
    refetchOnReconnect: false, // Prevent refetch on network reconnect
    enabled: Boolean(period), // Only fetch when period is available
    ...queryOptions
  });

  // Trends data query (optional)
  const trendsQuery = useQuery({
    queryKey: trendsQueryKey,
    queryFn: async ({ signal }) => {
      console.log(`📈 Fetching ${dashboardType} trends from PocketBase...`);
      
      switch (dashboardType) {
        case 'workforce':
          return await pocketBaseDataService.getWorkforceTrends(trendPeriods, signal);
        case 'turnover':
          return await pocketBaseDataService.getTurnoverTrends(trendPeriods, signal);
        case 'exit-surveys':
          // Exit surveys may not have trends implemented yet
          return null;
        default:
          return null;
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes for trends (they change less frequently)
    gcTime: 60 * 60 * 1000, // 60 minutes
    enabled: includeTrends,
    retry: (failureCount, error) => {
      // Don't retry on autocancellation
      if (error?.message?.includes('autocancelled')) {
        return false;
      }
      return failureCount < 1;
    },
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  // Real-time subscription management - DISABLED to prevent connection errors
  useEffect(() => {
    // Temporarily disabled real-time subscriptions to prevent connection refused errors
    // The PocketBase realtime endpoint needs WebSocket connection which is causing issues
    return;
    
    /*
    if (!enableRealTime || !dashboardType) return;

    const handleRealtimeUpdate = (update) => {
      console.log(`🔄 Real-time ${dashboardType} update:`, update.action);
      
      // Invalidate and refetch data
      queryClient.invalidateQueries({ 
        queryKey: ['pocketbase', dashboardType] 
      });
      
      // Also invalidate trends if enabled
      if (includeTrends) {
        queryClient.invalidateQueries({ 
          queryKey: ['pocketbase-trends', dashboardType] 
        });
      }
    };

    let unsubscribe;
    
    switch (dashboardType) {
      case 'workforce':
        unsubscribe = pocketBaseDataService.subscribeToWorkforce(handleRealtimeUpdate);
        break;
      case 'turnover':
        unsubscribe = pocketBaseDataService.subscribeToTurnover(handleRealtimeUpdate);
        break;
      case 'exit-surveys':
        unsubscribe = pocketBaseDataService.subscribeToExitSurveys(handleRealtimeUpdate);
        break;
    }

    return () => {
      if (unsubscribe) {
        console.log(`🔌 Unsubscribing from ${dashboardType} real-time updates`);
        switch (dashboardType) {
          case 'workforce':
            pocketBaseDataService.unsubscribeFromWorkforce();
            break;
          case 'turnover':
            pocketBaseDataService.unsubscribeFromTurnover();
            break;
          case 'exit-surveys':
            pocketBaseDataService.unsubscribeFromExitSurveys();
            break;
        }
      }
    };
    */
  }, [dashboardType, enableRealTime, queryClient, includeTrends]);

  // Manual refetch function
  const refetchData = useCallback(async () => {
    console.log(`🔄 Manual refetch for ${dashboardType}`);
    await dataQuery.refetch();
    if (includeTrends) {
      await trendsQuery.refetch();
    }
  }, [dataQuery, trendsQuery, dashboardType, includeTrends]);

  // Clear cache function
  const clearCache = useCallback(() => {
    console.log(`🧹 Clearing cache for ${dashboardType}`);
    queryClient.removeQueries({ 
      queryKey: ['pocketbase', dashboardType] 
    });
    if (includeTrends) {
      queryClient.removeQueries({ 
        queryKey: ['pocketbase-trends', dashboardType] 
      });
    }
    pocketBaseDataService.clearCache();
  }, [queryClient, dashboardType, includeTrends]);

  // Determine if we have actual data
  const hasData = dataQuery.data && Object.keys(dataQuery.data).length > 0;
  const hasTrendData = trendsQuery.data && Array.isArray(trendsQuery.data) && trendsQuery.data.length > 0;

  // Combined loading state
  const isLoading = dataQuery.isLoading || (includeTrends && trendsQuery.isLoading);
  
  // Combined error state
  const error = dataQuery.error || (includeTrends ? trendsQuery.error : null);

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[useDashboardDataPB] ${dashboardType}:`, {
      isLoading,
      hasData,
      hasTrendData,
      error: error?.message,
      dataStructure: dataQuery.data ? Object.keys(dataQuery.data) : 'no data',
      cacheKey: dataQueryKey.join('_')
    });
  }

  return {
    // Data
    data: dataQuery.data,
    trendData: trendsQuery.data,
    
    // Status
    hasData,
    hasTrendData,
    isLoading,
    error,
    
    // Query states
    isDataLoading: dataQuery.isLoading,
    isTrendsLoading: trendsQuery.isLoading,
    isDataError: Boolean(dataQuery.error),
    isTrendsError: Boolean(trendsQuery.error),
    
    // Actions
    refetch: refetchData,
    clearCache,
    refetchData: dataQuery.refetch,
    refetchTrends: trendsQuery.refetch,
    
    // Real-time status
    isRealTime: enableRealTime,
    subscriptionActive: enableRealTime && hasData,
    
    // Service information
    serviceReady: pocketBaseDataService.isReady(),
    cacheStats: pocketBaseDataService.getCacheStats()
  };
};

/**
 * Specialized hooks for different dashboard types
 */
export const useWorkforceDataPB = (options = {}) => {
  return useDashboardDataPB('workforce', options);
};

export const useTurnoverDataPB = (options = {}) => {
  return useDashboardDataPB('turnover', options);
};

export const useExitSurveyDataPB = (options = {}) => {
  return useDashboardDataPB('exit-surveys', options);
};

/**
 * Hook for PocketBase service health monitoring
 */
export const usePocketBaseHealth = () => {
  return useQuery({
    queryKey: ['pocketbase-health'],
    queryFn: async () => {
      return await pocketBaseDataService.getHealthStatus();
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Check every minute
    retry: false
  });
};

/**
 * Hook for managing PocketBase cache
 */
export const usePocketBaseCache = () => {
  const queryClient = useQueryClient();
  
  const clearAllCache = useCallback(() => {
    console.log('🧹 Clearing all PocketBase cache');
    queryClient.removeQueries({ queryKey: ['pocketbase'] });
    queryClient.removeQueries({ queryKey: ['pocketbase-trends'] });
    pocketBaseDataService.clearCache();
  }, [queryClient]);
  
  const getCacheStats = useCallback(() => {
    return {
      service: pocketBaseDataService.getCacheStats(),
      reactQuery: {
        queries: queryClient.getQueryCache().getAll().length,
        pocketbaseQueries: queryClient.getQueryCache().getAll().filter(
          query => query.queryKey[0] === 'pocketbase'
        ).length
      }
    };
  }, [queryClient]);
  
  return {
    clearAllCache,
    getCacheStats,
    serviceCache: pocketBaseDataService.getCacheStats()
  };
};