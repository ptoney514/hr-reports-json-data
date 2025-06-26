import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import workforceDataJson from '../data/workforce-data.json';
import { useErrorHandler, handleNetworkError, validateData, ERROR_TYPES } from '../utils/errorHandler';
import { globalCache } from '../utils/cacheUtils';

// Cache configuration
const CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5 minutes
  KEY_PREFIX: 'workforce_data',
  VERSION: '1.0'
};

const useWorkforceData = (customFilters = {}) => {
  const { state, actions } = useDashboard();
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const { handleError } = useErrorHandler('useWorkforceData');

  // Merge context filters with custom filters
  const activeFilters = useMemo(() => ({
    reportingPeriod: customFilters.reportingPeriod || state.reportingPeriod,
    locationFilter: customFilters.locationFilter || state.locationFilter,
    divisionFilter: customFilters.divisionFilter || state.divisionFilter,
    departmentFilter: customFilters.departmentFilter || state.departmentFilter,
    employeeTypeFilter: customFilters.employeeTypeFilter || state.employeeTypeFilter,
    dateRange: customFilters.dateRange || state.dateRange
  }), [customFilters, state]);

  // Data validation schema
  const workforceDataSchema = {
    required: ['currentPeriod', 'historicalTrends', 'startersLeavers'],
    properties: {
      currentPeriod: { type: 'object' },
      historicalTrends: { type: 'array' },
      startersLeavers: { type: 'array' }
    },
    arrayFields: ['historicalTrends', 'startersLeavers']
  };

  // Generate cache key based on filters
  const getCacheKey = useCallback((filters) => {
    return `${CACHE_CONFIG.KEY_PREFIX}_${JSON.stringify(filters)}`;
  }, []);

  // Load data from JSON (simulating API call) with advanced caching
  const loadData = useCallback(async () => {
    const cacheKey = getCacheKey(activeFilters);
    
    // Check cache first
    try {
      const cachedResult = await globalCache.get(cacheKey, {
        params: activeFilters
      });
      
      if (cachedResult) {
        // Validate cached data
        try {
          validateData(cachedResult.data, workforceDataSchema, 'useWorkforceData-cache');
          
          // Track cache hit performance
          if (window.performanceMonitor) {
            window.performanceMonitor.recordCacheHit(cacheKey, cachedResult.source);
          }
          
          console.log(`Cache hit for workforce data (${cachedResult.source})`);
          return cachedResult.data;
        } catch (validationError) {
          // Clear invalid cache
          await globalCache.delete(cacheKey, { params: activeFilters });
          console.warn('Invalid cached data removed:', validationError);
        }
      } else {
        // Track cache miss
        if (window.performanceMonitor) {
          window.performanceMonitor.recordCacheMiss(cacheKey);
        }
      }
    } catch (cacheError) {
      console.warn('Cache read error:', cacheError);
    }

    const fetchData = async () => {
      setLocalLoading(true);
      actions.setLoading('workforce', true);
      actions.clearError('workforce');
      setLocalError(null);

      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // In a real app, this would be an API call
        // const response = await fetch('/api/workforce-data');
        // if (!response.ok) {
        //   throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        // }
        // const data = await response.json();
        
        const data = workforceDataJson;

        // Validate data structure
        validateData(data, workforceDataSchema, 'useWorkforceData');

        // Cache the validated data with metadata
        try {
          await globalCache.set(cacheKey, data, {
            ttl: CACHE_CONFIG.TTL,
            params: activeFilters,
            metadata: {
              version: CACHE_CONFIG.VERSION,
              timestamp: Date.now(),
              filters: activeFilters,
              dataSource: 'json',
              dependencies: {
                workforceDataVersion: data.metadata?.version || '1.0'
              }
            }
          });
          console.log('Workforce data cached successfully');
        } catch (cacheError) {
          console.warn('Failed to cache workforce data:', cacheError);
        }

        return data;
      } catch (error) {
        const { errorLog, strategy } = handleError(error, {
          operation: 'loadWorkforceData',
          filters: activeFilters
        });

        const errorMessage = `Failed to load workforce data: ${error.message}`;
        setLocalError(errorMessage);
        actions.setError('workforce', errorMessage);
        
        throw error;
      } finally {
        setLocalLoading(false);
        actions.setLoading('workforce', false);
      }
    };

    // Use network error handler with retry logic
    return handleNetworkError(
      new Error('Network request for workforce data'),
      fetchData,
      3 // maxRetries
    );
  }, [actions, activeFilters, handleError, getCacheKey]);

  // Filter workforce data based on active filters
  const filterData = useCallback((data, filters) => {
    if (!data) return null;

    let filteredData = { ...data };

    // Filter by reporting period
    if (filters.reportingPeriod && filters.reportingPeriod !== 'Q2-2025') {
      // Find historical data for the selected period
      const historicalData = data.historicalTrends.find(
        trend => trend.quarter === filters.reportingPeriod
      );
      
      if (historicalData) {
        // Replace current period data with historical data
        filteredData.currentPeriod = {
          ...filteredData.currentPeriod,
          quarter: historicalData.quarter,
          headcount: historicalData.headcount,
          positions: historicalData.positions
        };
      }
    }

    // Filter by location
    if (filters.locationFilter && filters.locationFilter !== 'All') {
      const selectedLocation = data.currentPeriod.locations.find(
        loc => loc.name === filters.locationFilter
      );
      
      if (selectedLocation) {
        // Adjust headcount based on location
        const locationPercentage = selectedLocation.percentOfTotal / 100;
        filteredData.currentPeriod.headcount = {
          ...filteredData.currentPeriod.headcount,
          total: selectedLocation.total,
          faculty: selectedLocation.breakdown.faculty,
          staff: selectedLocation.breakdown.staff,
          students: selectedLocation.breakdown.students
        };
        
        // Filter locations array
        filteredData.currentPeriod.locations = [selectedLocation];
      }
    }

    // Filter by division/department
    if (filters.divisionFilter && filters.divisionFilter !== 'All') {
      const selectedDivision = data.currentPeriod.topDivisions.find(
        div => div.name === filters.divisionFilter
      );
      
      if (selectedDivision) {
        // Focus on selected division
        filteredData.currentPeriod.topDivisions = [selectedDivision];
        
        // Adjust overall headcount (simplified calculation)
        const divisionPercentage = selectedDivision.headcount / data.currentPeriod.headcount.total;
        filteredData.currentPeriod.headcount = {
          ...filteredData.currentPeriod.headcount,
          total: selectedDivision.headcount,
          faculty: selectedDivision.faculty,
          staff: selectedDivision.staff
        };
      }
    }

    // Filter by employee type
    if (filters.employeeTypeFilter && filters.employeeTypeFilter !== 'All') {
      const employeeType = filters.employeeTypeFilter.toLowerCase();
      
      if (employeeType === 'faculty') {
        filteredData.currentPeriod.headcount = {
          ...filteredData.currentPeriod.headcount,
          total: data.currentPeriod.headcount.faculty,
          faculty: data.currentPeriod.headcount.faculty,
          staff: 0,
          students: 0
        };
      } else if (employeeType === 'staff') {
        filteredData.currentPeriod.headcount = {
          ...filteredData.currentPeriod.headcount,
          total: data.currentPeriod.headcount.staff,
          faculty: 0,
          staff: data.currentPeriod.headcount.staff,
          students: 0
        };
      } else if (employeeType === 'students') {
        filteredData.currentPeriod.headcount = {
          ...filteredData.currentPeriod.headcount,
          total: data.currentPeriod.headcount.students,
          faculty: 0,
          staff: 0,
          students: data.currentPeriod.headcount.students
        };
      }
    }

    return filteredData;
  }, []);

  // Format data for easy consumption by components
  const formatDataForComponents = useCallback((data) => {
    if (!data) return null;

    return {
      // Summary metrics
      summary: {
        totalHeadcount: data.currentPeriod.headcount.total,
        faculty: data.currentPeriod.headcount.faculty,
        staff: data.currentPeriod.headcount.staff,
        students: data.currentPeriod.headcount.students,
        totalPositions: data.currentPeriod.positions.total,
        vacancies: data.currentPeriod.positions.vacant,
        vacancyRate: data.currentPeriod.positions.vacancyRate,
        growth: data.currentPeriod.headcount.changeFromPrevious?.percentChange || 0
      },

      // Chart data
      charts: {
        // Headcount by location for pie chart
        locationDistribution: data.currentPeriod.locations.map(loc => ({
          name: loc.name.replace(' Campus', ''),
          value: loc.total,
          percentage: loc.percentOfTotal,
          faculty: loc.breakdown.faculty,
          staff: loc.breakdown.staff,
          students: loc.breakdown.students
        })),

        // Division data for bar chart
        divisionData: data.currentPeriod.topDivisions.map(div => ({
          name: div.name,
          headcount: div.headcount,
          faculty: div.faculty,
          staff: div.staff,
          vacancies: div.vacancies,
          vacancyRate: div.vacancyRate,
          change: div.changeFromPrevious
        })),

        // Historical trends for line chart
        trendsData: data.historicalTrends.map(trend => ({
          quarter: trend.quarter,
          total: trend.headcount.total,
          faculty: trend.headcount.faculty,
          staff: trend.headcount.staff,
          students: trend.headcount.students,
          vacancyRate: trend.positions.vacancyRate
        })),

        // Starters vs Leavers for area chart
        startersLeaversData: data.startersLeaversDetail.monthlyData.map(month => ({
          month: month.month,
          starters: month.starters,
          leavers: month.leavers,
          netChange: month.netChange,
          facultyStarters: month.categories.starters.faculty,
          staffStarters: month.categories.starters.staff,
          facultyLeavers: month.categories.leavers.faculty,
          staffLeavers: month.categories.leavers.staff
        }))
      },

      // Demographics data
      demographics: {
        ageGroups: data.demographics.ageGroups,
        tenure: data.demographics.tenure
      },

      // Raw data for advanced filtering
      raw: data
    };
  }, []);

  // Main data fetching effect
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const rawData = await loadData();
        if (isMounted) {
          actions.updateDataTimestamp();
        }
      } catch (error) {
        // Error is already handled in loadData
        console.error('Workforce data fetch failed:', error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [loadData, actions]);

  // Compute filtered and formatted data
  const filteredData = useMemo(() => {
    if (!dataCache) return null;
    return filterData(dataCache, activeFilters);
  }, [dataCache, activeFilters, filterData]);

  const formattedData = useMemo(() => {
    return formatDataForComponents(filteredData);
  }, [filteredData, formatDataForComponents]);

  // Utility functions
  const refetch = useCallback(async () => {
    // Clear cache to force refetch
    dataCache = null;
    cacheTimestamp = null;
    await loadData();
  }, [loadData]);

  const isStale = useCallback(() => {
    if (!cacheTimestamp) return true;
    return (Date.now() - cacheTimestamp) > CACHE_DURATION;
  }, []);

  // Loading state (combines context and local loading)
  const isLoading = localLoading || state.loading.workforce;

  // Error state (combines context and local errors)
  const error = localError || state.error.workforce;

  return {
    // Data
    data: formattedData,
    rawData: filteredData,
    
    // States
    loading: isLoading,
    error,
    
    // Metadata
    filters: activeFilters,
    lastUpdated: state.dataLastUpdated,
    isStale: isStale(),
    
    // Actions
    refetch,
    clearError: () => {
      actions.clearError('workforce');
      setLocalError(null);
    },
    
    // Helper functions
    getFilteredDivisions: () => {
      if (!formattedData) return [];
      return formattedData.charts.divisionData;
    },
    
    getTotalsByType: () => {
      if (!formattedData) return { faculty: 0, staff: 0, students: 0 };
      return {
        faculty: formattedData.summary.faculty,
        staff: formattedData.summary.staff,
        students: formattedData.summary.students
      };
    },

    getGrowthMetrics: () => {
      if (!formattedData) return { growth: 0, isPositive: false };
      const growth = formattedData.summary.growth;
      return {
        growth: Math.abs(growth),
        isPositive: growth >= 0,
        formatted: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`
      };
    }
  };
};

export default useWorkforceData; 