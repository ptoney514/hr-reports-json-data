import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { useErrorHandler, handleNetworkError, validateData } from '../utils/errorHandler';
import { globalCache } from '../utils/cacheUtils';

// Load comprehensive workforce data from public directory
// Using fetch instead of import to access the full data file
const loadWorkforceDataJson = async () => {
  const response = await fetch('/data/workforce-data.json');
  if (!response.ok) {
    throw new Error(`Failed to load workforce data: ${response.status} ${response.statusText}`);
  }
  return await response.json();
};

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
  const [cachedData, setCachedData] = useState(null);
  const { handleError } = useErrorHandler('useWorkforceData');
  
  // Store action refs to prevent infinite loops
  const handleErrorRef = useRef(handleError);
  const updateDataTimestampRef = useRef(actions.updateDataTimestamp);
  const setLoadingRef = useRef(actions.setLoading);
  const setErrorRef = useRef(actions.setError);
  const clearErrorRef = useRef(actions.clearError);
  
  useEffect(() => {
    handleErrorRef.current = handleError;
    updateDataTimestampRef.current = actions.updateDataTimestamp;
    setLoadingRef.current = actions.setLoading;
    setErrorRef.current = actions.setError;
    clearErrorRef.current = actions.clearError;
  }, [handleError, actions.updateDataTimestamp, actions.setLoading, actions.setError, actions.clearError]);

  // Stabilize activeFilters to prevent unnecessary re-renders
  const activeFiltersRef = useRef();
  const activeFilters = useMemo(() => {
    const newFilters = {
      reportingPeriod: customFilters.reportingPeriod || state.reportingPeriod,
      locationFilter: customFilters.locationFilter || state.locationFilter,
      divisionFilter: customFilters.divisionFilter || state.divisionFilter,
      departmentFilter: customFilters.departmentFilter || state.departmentFilter,
      employeeTypeFilter: customFilters.employeeTypeFilter || state.employeeTypeFilter,
      dateRange: customFilters.dateRange || state.dateRange
    };
    
    // Only update if filters actually changed to prevent circular dependencies
    if (!activeFiltersRef.current || JSON.stringify(activeFiltersRef.current) !== JSON.stringify(newFilters)) {
      activeFiltersRef.current = newFilters;
    }
    
    return activeFiltersRef.current;
  }, [customFilters, state.reportingPeriod, state.locationFilter, state.divisionFilter, state.departmentFilter, state.employeeTypeFilter, state.dateRange]);

  // Data validation schema - memoized to prevent re-creation on every render
  const workforceDataSchema = useMemo(() => ({
    required: ['currentPeriod', 'historicalTrends', 'startersLeaversDetail'],
    properties: {
      currentPeriod: { type: 'object' },
      historicalTrends: { type: 'object' },
      startersLeaversDetail: { type: 'object' }
    },
    arrayFields: []
  }), []);

  // Generate cache key based on filters
  const getCacheKey = useCallback((filters) => {
    return `${CACHE_CONFIG.KEY_PREFIX}_${JSON.stringify(filters)}`;
  }, []);

  // Load data from JSON (simulating API call) with advanced caching
  const loadData = useCallback(async (filters, skipStateUpdates = false) => {
    const cacheKey = getCacheKey(filters);
    
    // Check cache first
    try {
      const cachedResult = await globalCache.get(cacheKey, {
        params: filters
      });
      
      if (cachedResult) {
        // Validate cached data (non-throwing)
        try {
          const validation = validateData(cachedResult.data, workforceDataSchema, 'useWorkforceData-cache');
          if (!validation.valid) {
            console.warn('Cached data validation failed:', validation.errors);
            // Clear invalid cache but don't throw
            await globalCache.delete(cacheKey, { params: filters });
          } else {
            // Track cache hit performance
            if (window.performanceMonitor) {
              window.performanceMonitor.recordCacheHit(cacheKey, cachedResult.source);
            }
            
            console.log(`Cache hit for workforce data (${cachedResult.source})`);
            return cachedResult.data;
          }
        } catch (validationError) {
          // Clear invalid cache
          await globalCache.delete(cacheKey, { params: filters });
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
      if (!skipStateUpdates) {
        setLocalLoading(true);
        if (setLoadingRef.current) setLoadingRef.current('workforce', true);
        if (clearErrorRef.current) clearErrorRef.current('workforce');
        setLocalError(null);
      }

      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Load comprehensive workforce data from public directory
        const data = await loadWorkforceDataJson();

        // Validate data structure (non-throwing)
        const validation = validateData(data, workforceDataSchema, 'useWorkforceData');
        if (!validation.valid) {
          console.warn('Workforce data validation failed:', validation.errors);
          // Continue anyway - don't block the app for validation issues
        }

        // Cache the validated data with metadata
        try {
          await globalCache.set(cacheKey, data, {
            ttl: CACHE_CONFIG.TTL,
            params: filters,
            metadata: {
              version: CACHE_CONFIG.VERSION,
              timestamp: Date.now(),
              filters: filters,
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
        if (!skipStateUpdates) {
          handleErrorRef.current(error, {
            operation: 'loadWorkforceData',
            filters: filters
          });

          const errorMessage = `Failed to load workforce data: ${error.message}`;
          setLocalError(errorMessage);
          if (setErrorRef.current) setErrorRef.current('workforce', errorMessage);
        }
        
        throw error;
      } finally {
        if (!skipStateUpdates) {
          setLocalLoading(false);
          if (setLoadingRef.current) setLoadingRef.current('workforce', false);
        }
      }
    };

    // Use network error handler with retry logic
    return handleNetworkError(
      new Error('Network request for workforce data'),
      fetchData,
      3 // maxRetries
    );
  }, [getCacheKey, workforceDataSchema]); // Removed handleError to prevent re-creation

  // Filter workforce data based on active filters
  const filterData = useCallback((data, filters) => {
    if (!data || !data.currentPeriod) return null;

    let filteredData = { ...data };

    // Filter by reporting period
    if (filters.reportingPeriod && filters.reportingPeriod !== 'Q2-2025') {
      // Find historical data for the selected period
      const historicalData = (data.historicalTrends?.periods || []).find(
        trend => trend?.quarter === filters.reportingPeriod
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
      const selectedLocation = (data.currentPeriod?.locations || []).find(
        loc => loc?.name === filters.locationFilter
      );
      
      if (selectedLocation) {
        // Adjust headcount based on location
        filteredData.currentPeriod.headcount = {
          ...filteredData.currentPeriod.headcount,
          total: selectedLocation.total,
          faculty: selectedLocation.breakdown?.faculty || 0,
          staff: selectedLocation.breakdown?.staff || 0,
          students: selectedLocation.breakdown?.students || 0
        };
        
        // Filter locations array
        filteredData.currentPeriod.locations = [selectedLocation];
      }
    }

    // Filter by division/department
    if (filters.divisionFilter && filters.divisionFilter !== 'All') {
      const selectedDivision = (data.currentPeriod?.topDivisions || []).find(
        div => div?.name === filters.divisionFilter
      );
      
      if (selectedDivision) {
        // Focus on selected division
        filteredData.currentPeriod.topDivisions = [selectedDivision];
        
        // Adjust overall headcount (simplified calculation)
        filteredData.currentPeriod.headcount = {
          ...filteredData.currentPeriod.headcount,
          total: selectedDivision.headcount || 0,
          faculty: selectedDivision.faculty || 0,
          staff: selectedDivision.staff || 0
        };
      }
    }

    // Filter by employee type
    if (filters.employeeTypeFilter && filters.employeeTypeFilter !== 'All') {
      const employeeType = filters.employeeTypeFilter.toLowerCase();
      
      if (employeeType === 'faculty') {
        filteredData.currentPeriod.headcount = {
          ...filteredData.currentPeriod.headcount,
          total: data.currentPeriod?.headcount?.faculty || 0,
          faculty: data.currentPeriod?.headcount?.faculty || 0,
          staff: 0,
          students: 0
        };
      } else if (employeeType === 'staff') {
        filteredData.currentPeriod.headcount = {
          ...filteredData.currentPeriod.headcount,
          total: data.currentPeriod?.headcount?.staff || 0,
          faculty: 0,
          staff: data.currentPeriod?.headcount?.staff || 0,
          students: 0
        };
      } else if (employeeType === 'students') {
        filteredData.currentPeriod.headcount = {
          ...filteredData.currentPeriod.headcount,
          total: data.currentPeriod?.headcount?.students || 0,
          faculty: 0,
          staff: 0,
          students: data.currentPeriod?.headcount?.students || 0
        };
      }
    }

    // Always preserve departmentalBreakdown and other important data structures
    filteredData.currentPeriod.departmentalBreakdown = data.currentPeriod?.departmentalBreakdown || [];
    filteredData.currentPeriod.topDivisions = data.currentPeriod?.topDivisions || [];

    return filteredData;
  }, []);

  // Format data for easy consumption by components
  const formatDataForComponents = useCallback((data) => {
    if (!data || !data.currentPeriod || !data.historicalTrends?.periods) return null;

    return {
      // Summary metrics
      summary: {
        totalEmployees: data.currentPeriod?.headcount?.total || 0,
        totalHeadcount: data.currentPeriod?.headcount?.total || 0,
        faculty: data.currentPeriod?.headcount?.faculty || 0,
        staff: data.currentPeriod?.headcount?.staff || 0,
        hsp: data.currentPeriod?.headcount?.hsp || 0,
        students: data.currentPeriod?.headcount?.students || 0,
        benefitEligible: data.currentPeriod?.headcount?.benefitEligible || 0,
        benefitEligibleFaculty: data.currentPeriod?.headcount?.benefitEligibleFaculty || 0,
        benefitEligibleStaff: data.currentPeriod?.headcount?.benefitEligibleStaff || 0,
        nonBenefitEligible: data.currentPeriod?.headcount?.nonBenefitEligible || 0,
        totalPositions: data.currentPeriod?.positions?.total || 0,
        vacancies: data.currentPeriod?.positions?.vacant || 0,
        vacancyRate: data.currentPeriod?.positions?.vacancyRate || 0,
        employeeChange: data.currentPeriod?.headcount?.changeFromPrevious?.percentChange || 0,
        facultyChange: ((data.currentPeriod?.headcount?.changeFromPrevious?.faculty || 0) / (data.currentPeriod?.headcount?.faculty || 1) * 100) || 0,
        staffChange: ((data.currentPeriod?.headcount?.changeFromPrevious?.staff || 0) / (data.currentPeriod?.headcount?.staff || 1) * 100) || 0,
        hspChange: ((data.currentPeriod?.headcount?.changeFromPrevious?.hsp || 0) / (data.currentPeriod?.headcount?.hsp || 1) * 100) || 0,
        vacancyRateChange: data.currentPeriod?.positions?.changeFromPrevious?.vacancyRateChange || 0,
        growth: data.currentPeriod?.headcount?.changeFromPrevious?.percentChange || 0,
        growthRate: data.currentPeriod?.headcount?.changeFromPrevious?.percentChange || 0,
        benefitEligibleChange: data.currentPeriod?.headcount?.changeFromPrevious?.benefitEligiblePercentChange || 0
      },

      // Chart data
      charts: {
        // Historical trends for line chart
        historicalTrends: (data.historicalTrends?.periods || []).map(trend => ({
          quarter: trend?.quarter || '',
          period: trend?.quarter || '',
          total: trend?.headcount?.total || 0,
          faculty: trend?.headcount?.faculty || 0,
          staff: trend?.headcount?.staff || 0,
          students: trend?.headcount?.students || 0,
          vacancyRate: trend?.positions?.vacancyRate || 0
        })),

        // Starters vs Leavers for area chart
        startersLeavers: data.startersLeaversDetail?.monthlyData?.map(month => ({
          month: month?.month || '',
          starters: month?.starters || 0,
          leavers: month?.leavers || 0,
          netChange: month?.netChange || 0,
          facultyStarters: month?.categories?.starters?.faculty || 0,
          staffStarters: month?.categories?.starters?.staff || 0,
          facultyLeavers: month?.categories?.leavers?.faculty || 0,
          staffLeavers: month?.categories?.leavers?.staff || 0
        })) || [],

        // Division data for bar chart
        topDivisions: (data.currentPeriod?.topDivisions || []).map(div => ({
          name: div?.name || '',
          division: div?.name || '',
          total: div?.headcount || 0,
          headcount: div?.headcount || 0,
          faculty: div?.faculty || 0,
          staff: div?.staff || 0,
          vacancies: div?.vacancies || 0,
          vacancyRate: div?.vacancyRate || 0,
          change: div?.changeFromPrevious || 0
        })),

        // Headcount by location for pie chart
        locationDistribution: (data.currentPeriod?.locations || []).map(loc => ({
          name: (loc?.name || '').replace(' Campus', ''),
          value: loc?.total || 0,
          percentage: loc?.percentOfTotal || 0,
          faculty: loc?.breakdown?.faculty || 0,
          staff: loc?.breakdown?.staff || 0,
          students: loc?.breakdown?.students || 0
        }))
      },

      // Metrics for additional cards
      metrics: {
        recentHires: {
          faculty: Math.floor(Math.random() * 15) + 5, // Simulated data
          staff: Math.floor(Math.random() * 25) + 10,
          students: Math.floor(Math.random() * 8) + 2
        },
        demographics: {
          averageTenure: '7.2',
          averageAge: '42',
          genderRatio: '52/48',
          diversityIndex: '34'
        },
        campuses: {
          omaha: {
            percentage: data.currentPeriod?.locations?.[0]?.percentOfTotal || 0,
            employees: data.currentPeriod?.locations?.[0]?.total || 0
          },
          phoenix: {
            percentage: data.currentPeriod?.locations?.[1]?.percentOfTotal || 0,
            employees: data.currentPeriod?.locations?.[1]?.total || 0
          }
        }
      },

      // Demographics data
      demographics: {
        ageGroups: data.demographics?.ageGroups || [],
        tenure: data.demographics?.tenure || []
      },

      // Raw data for advanced filtering
      raw: data
    };
  }, []);

  // Separate effect for loading data - removed circular dependency
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const rawData = await loadData(activeFilters, false);
        if (isMounted) {
          setCachedData(rawData);
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
  }, [activeFilters, loadData]); // Only depend on activeFilters and loadData

  // Separate effect for updating timestamp - prevents circular dependency
  useEffect(() => {
    if (cachedData && updateDataTimestampRef.current) {
      updateDataTimestampRef.current();
    }
  }, [cachedData]); // Use ref to prevent infinite loop

  // Compute filtered and formatted data
  const filteredData = useMemo(() => {
    console.log('🔍 useWorkforceData - cachedData:', cachedData);
    console.log('🔍 useWorkforceData - activeFilters:', activeFilters);
    if (!cachedData) {
      console.log('🚫 useWorkforceData - No cachedData, returning null');
      return null;
    }
    const filtered = filterData(cachedData, activeFilters);
    console.log('🔍 useWorkforceData - filteredData result:', filtered);
    console.log('🔍 useWorkforceData - filteredData departmentalBreakdown:', filtered?.currentPeriod?.departmentalBreakdown);
    return filtered;
  }, [cachedData, activeFilters, filterData]);

  const formattedData = useMemo(() => {
    console.log('🔍 useWorkforceData - filteredData for formatting:', filteredData);
    const formatted = formatDataForComponents(filteredData);
    console.log('🔍 useWorkforceData - formattedData result:', formatted);
    return formatted;
  }, [filteredData, formatDataForComponents]);

  // Utility functions
  const refetch = useCallback(async () => {
    // Clear cache to force refetch
    const cacheKey = getCacheKey(activeFilters);
    await globalCache.delete(cacheKey, { params: activeFilters });
    setCachedData(null);
    const rawData = await loadData(activeFilters, false);
    setCachedData(rawData);
  }, [getCacheKey, activeFilters, loadData]);

  const isStale = useCallback(() => {
    // Check if cache is stale using global cache
    const cacheKey = getCacheKey(activeFilters);
    return !globalCache.has(cacheKey);
  }, [getCacheKey, activeFilters]);

  // Loading state (combines context and local loading)
  const isLoading = localLoading || state.loading.workforce;

  // Error state (combines context and local errors)
  const error = localError || state.error.workforce;

  console.log('🔍 useWorkforceData - RETURNING:', {
    formattedData,
    filteredData,
    rawDataHasDepartmental: filteredData?.currentPeriod?.departmentalBreakdown?.length
  });

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
      if (clearErrorRef.current) clearErrorRef.current('workforce');
      setLocalError(null);
    },
    
    // Helper functions
    getFilteredDivisions: () => {
      if (!formattedData) return [];
      return formattedData.charts.topDivisions;
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
export { useWorkforceData }; 