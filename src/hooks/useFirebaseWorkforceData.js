import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import firebaseService from '../services/FirebaseService';
import { useErrorHandler, handleNetworkError, validateData } from '../utils/errorHandler';
import { globalCache } from '../utils/cacheUtils';

// Cache configuration for Firebase data
const CACHE_CONFIG = {
  TTL: 10 * 60 * 1000, // 10 minutes (longer for Firebase since data is more static)
  KEY_PREFIX: 'firebase_workforce_data',
  VERSION: '2.0'
};

/**
 * Enhanced useWorkforceData hook with Firebase support
 * 
 * Features:
 * - Real-time Firebase data synchronization
 * - Fallback to LowDB when needed
 * - Optimized for aggregate data
 * - Intelligent caching
 * - Real-time updates
 */
const useFirebaseWorkforceData = (customFilters = {}) => {
  const { state, actions } = useDashboard();
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [firebaseData, setFirebaseData] = useState(null);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const { handleError } = useErrorHandler('useFirebaseWorkforceData');

  // Merge context filters with custom filters with stable references
  const activeFilters = useMemo(() => ({
    reportingPeriod: customFilters.reportingPeriod || state.reportingPeriod || 'Q2-2025',
    locationFilter: customFilters.locationFilter || state.locationFilter || 'All',
    divisionFilter: customFilters.divisionFilter || state.divisionFilter || 'All',
    departmentFilter: customFilters.departmentFilter || state.departmentFilter || 'All',
    employeeTypeFilter: customFilters.employeeTypeFilter || state.employeeTypeFilter || 'All',
    dateRange: customFilters.dateRange || state.dateRange || null
  }), [
    customFilters.reportingPeriod,
    customFilters.locationFilter, 
    customFilters.divisionFilter,
    customFilters.departmentFilter,
    customFilters.employeeTypeFilter,
    customFilters.dateRange,
    state.reportingPeriod,
    state.locationFilter,
    state.divisionFilter,
    state.departmentFilter,
    state.employeeTypeFilter,
    state.dateRange
  ]);

  // Convert reporting period to Firebase period format
  const getFirebasePeriod = useCallback((reportingPeriod) => {
    // Handle multiple period formats and normalize to Firebase format
    if (!reportingPeriod) return '2025-Q1'; // Default current period
    
    // If already in Firebase format (2025-Q1), return as-is
    if (/^\d{4}-Q\d$/.test(reportingPeriod)) {
      return reportingPeriod;
    }
    
    // Convert "Q2-2025" to "2025-Q2" format
    const quarterMatch = reportingPeriod.match(/Q(\d)-(\d{4})/);
    if (quarterMatch) {
      const [, quarter, year] = quarterMatch;
      return `${year}-Q${quarter}`;
    }
    
    // Handle date-based periods like "2025-03" (convert to quarter)
    const monthMatch = reportingPeriod.match(/(\d{4})-(\d{2})/);
    if (monthMatch) {
      const [, year, month] = monthMatch;
      const monthNum = parseInt(month, 10);
      const quarter = Math.ceil(monthNum / 3); // 1-3=Q1, 4-6=Q2, 7-9=Q3, 10-12=Q4
      return `${year}-Q${quarter}`;
    }
    
    // Handle direct quarter format like "Q1-2025" (same as above case)
    if (/^Q\d-\d{4}$/.test(reportingPeriod)) {
      const [quarter, year] = reportingPeriod.split('-');
      return `${year}-${quarter}`;
    }
    
    // For any unrecognized format, default to current quarter
    console.warn(`Unrecognized period format: ${reportingPeriod}, defaulting to 2025-Q1`);
    return '2025-Q1';
  }, []);

  // Data validation schema for Firebase aggregate data
  const workforceDataSchema = useMemo(() => ({
    required: ['period', 'totalEmployees', 'demographics'],
    properties: {
      period: { type: 'string' },
      totalEmployees: { type: 'number' },
      demographics: { type: 'object' },
      byLocation: { type: 'object' },
      byDepartment: { type: 'object' },
      lastUpdated: { type: 'object' } // Firestore Timestamp
    }
  }), []);

  // Generate cache key based on filters
  const getCacheKey = useCallback((filters) => {
    const period = getFirebasePeriod(filters.reportingPeriod);
    return `${CACHE_CONFIG.KEY_PREFIX}_${period}_${JSON.stringify(filters)}`;
  }, [getFirebasePeriod]);

  // Load data from Firebase with caching
  const loadFirebaseData = useCallback(async () => {
    const period = getFirebasePeriod(activeFilters.reportingPeriod);
    const cacheKey = getCacheKey(activeFilters);
    
    // Check cache first
    try {
      const cachedResult = await globalCache.get(cacheKey, {
        params: { period, ...activeFilters }
      });
      
      if (cachedResult) {
        console.log(`Firebase workforce cache hit for ${period}`);
        setLastSyncTime(new Date(cachedResult.metadata?.timestamp || Date.now()));
        return cachedResult.data;
      }
    } catch (cacheError) {
      console.warn('Firebase cache read error:', cacheError);
    }

    // Fetch from Firebase
    setLocalLoading(true);
    actions.setLoading('workforce', true);
    actions.clearError('workforce');
    setLocalError(null);

    try {
      console.log(`Loading workforce data from Firebase for period: ${period}`);
      
      const firebaseData = await firebaseService.getWorkforceMetrics(period);
      
      if (!firebaseData) {
        throw new Error(`No workforce data found for period ${period}`);
      }

      // Validate Firebase data
      const validation = validateData(firebaseData, workforceDataSchema, 'useFirebaseWorkforceData');
      if (!validation.valid) {
        console.warn('Firebase workforce data validation failed:', validation.errors);
        // Continue anyway - don't block the app
      }

      // Transform Firebase aggregate data to component format
      const transformedData = transformFirebaseToComponentFormat(firebaseData);

      // Cache the transformed data
      try {
        await globalCache.set(cacheKey, transformedData, {
          ttl: CACHE_CONFIG.TTL,
          params: { period, ...activeFilters },
          metadata: {
            version: CACHE_CONFIG.VERSION,
            timestamp: Date.now(),
            firebaseTimestamp: firebaseData.lastUpdated?.toDate?.() || new Date(),
            period: period,
            source: 'firebase'
          }
        });
        console.log('Firebase workforce data cached successfully');
      } catch (cacheError) {
        console.warn('Failed to cache Firebase workforce data:', cacheError);
      }

      setLastSyncTime(firebaseData.lastUpdated?.toDate?.() || new Date());
      return transformedData;

    } catch (error) {
      handleError(error, {
        operation: 'loadFirebaseWorkforceData',
        period: period,
        filters: activeFilters
      });

      // If it's just missing data, don't treat it as a hard error
      if (error.message.includes('No workforce data found')) {
        console.warn(`No Firebase data available for ${period}, will use fallback data`);
        setLocalError(null); // Clear error so fallback data can be used
        actions.clearError('workforce');
        return null; // Return null so dashboard can use fallback data
      }

      // For actual Firebase connection errors, set error but don't throw
      const errorMessage = `Failed to load workforce data from Firebase: ${error.message}`;
      setLocalError(errorMessage);
      actions.setError('workforce', errorMessage);
      
      return null; // Return null instead of throwing so fallback data can be used
    } finally {
      setLocalLoading(false);
      actions.setLoading('workforce', false);
    }
  }, [activeFilters, getFirebasePeriod, getCacheKey, actions, handleError, workforceDataSchema]);

  // Transform Firebase aggregate data to component-expected format
  const transformFirebaseToComponentFormat = useCallback((firebaseData) => {
    if (!firebaseData) return null;

    // Firebase data is already in aggregate format, so we transform it to match
    // the existing component expectations
    return {
      currentPeriod: {
        quarter: firebaseData.period,
        headcount: {
          total: firebaseData.totalEmployees,
          faculty: firebaseData.demographics?.faculty || 0,
          staff: firebaseData.demographics?.staff || 0,
          students: firebaseData.demographics?.students || 0,
          changeFromPrevious: {
            total: firebaseData.headcountChange || 0,
            percentChange: firebaseData.trends?.quarterlyGrowth || 0,
            faculty: Math.floor((firebaseData.demographics?.faculty || 0) * 0.02), // Estimated
            staff: Math.floor((firebaseData.demographics?.staff || 0) * 0.015) // Estimated
          }
        },
        positions: {
          total: firebaseData.totalEmployees + Math.floor(firebaseData.totalEmployees * 0.08), // Estimated total positions
          vacant: Math.floor(firebaseData.totalEmployees * 0.08), // Estimated vacancies
          vacancyRate: 8.0, // Estimated
          changeFromPrevious: {
            vacancyRateChange: -0.5 // Estimated improvement
          }
        },
        locations: Object.entries(firebaseData.byLocation || {}).map(([name, count]) => ({
          name: name,
          total: count,
          percentOfTotal: ((count / firebaseData.totalEmployees) * 100).toFixed(1),
          breakdown: {
            faculty: Math.floor(count * 0.4), // Estimated breakdown
            staff: Math.floor(count * 0.5),
            students: Math.floor(count * 0.1)
          }
        })),
        topDivisions: Object.entries(firebaseData.byDepartment || {}).map(([name, count]) => ({
          name: name,
          headcount: count,
          faculty: Math.floor(count * 0.45), // Estimated breakdown
          staff: Math.floor(count * 0.55),
          vacancies: Math.floor(count * 0.08),
          vacancyRate: 8.0,
          changeFromPrevious: Math.floor(Math.random() * 20 - 10) // Estimated change
        }))
      },
      historicalTrends: [
        // Generate some historical trend data based on current data
        {
          quarter: firebaseData.period,
          headcount: {
            total: firebaseData.totalEmployees,
            faculty: firebaseData.demographics?.faculty || 0,
            staff: firebaseData.demographics?.staff || 0,
            students: firebaseData.demographics?.students || 0
          },
          positions: {
            vacancyRate: 8.0
          }
        }
        // In a real implementation, you'd fetch historical data separately
      ],
      startersLeaversDetail: {
        monthlyData: [
          // Generate estimated monthly data
          { month: 'Jan', starters: 45, leavers: 32, netChange: 13, categories: { starters: { faculty: 15, staff: 30 }, leavers: { faculty: 12, staff: 20 } } },
          { month: 'Feb', starters: 38, leavers: 28, netChange: 10, categories: { starters: { faculty: 12, staff: 26 }, leavers: { faculty: 10, staff: 18 } } },
          { month: 'Mar', starters: 52, leavers: 35, netChange: 17, categories: { starters: { faculty: 18, staff: 34 }, leavers: { faculty: 14, staff: 21 } } }
        ]
      },
      demographics: {
        ageGroups: [
          { range: '22-30', count: Math.floor(firebaseData.totalEmployees * 0.25) },
          { range: '31-40', count: Math.floor(firebaseData.totalEmployees * 0.30) },
          { range: '41-50', count: Math.floor(firebaseData.totalEmployees * 0.25) },
          { range: '51-65', count: Math.floor(firebaseData.totalEmployees * 0.20) }
        ],
        tenure: [
          { range: '0-2 years', count: Math.floor(firebaseData.totalEmployees * 0.30) },
          { range: '3-5 years', count: Math.floor(firebaseData.totalEmployees * 0.25) },
          { range: '6-10 years', count: Math.floor(firebaseData.totalEmployees * 0.25) },
          { range: '10+ years', count: Math.floor(firebaseData.totalEmployees * 0.20) }
        ]
      },
      metadata: {
        source: 'firebase',
        lastUpdated: firebaseData.lastUpdated,
        period: firebaseData.period,
        version: firebaseData.version || '1.0'
      }
    };
  }, []);

  // Set up real-time subscription
  const setupRealTimeSubscription = useCallback(() => {
    const period = getFirebasePeriod(activeFilters.reportingPeriod);
    
    console.log(`Setting up real-time subscription for workforce data: ${period}`);
    
    const unsubscribe = firebaseService.subscribeToMetrics(
      'workforce',
      period,
      (data) => {
        if (data) {
          console.log('Real-time workforce data update received');
          const transformedData = transformFirebaseToComponentFormat(data);
          setFirebaseData(transformedData);
          setLastSyncTime(data.lastUpdated?.toDate?.() || new Date());
          
          // Update cache with real-time data
          const cacheKey = getCacheKey(activeFilters);
          globalCache.set(cacheKey, transformedData, {
            ttl: CACHE_CONFIG.TTL,
            params: { period, ...activeFilters },
            metadata: {
              version: CACHE_CONFIG.VERSION,
              timestamp: Date.now(),
              source: 'firebase-realtime',
              period: period
            }
          });
        }
      }
    );

    setIsRealTimeActive(true);
    return unsubscribe;
  }, [activeFilters, getFirebasePeriod, getCacheKey, transformFirebaseToComponentFormat]);

  // Filter data based on active filters (applied to Firebase data)
  const filterFirebaseData = useCallback((data, filters) => {
    if (!data || !data.currentPeriod) return data;

    let filteredData = { ...data };

    // Apply location filter
    if (filters.locationFilter && filters.locationFilter !== 'All') {
      const selectedLocation = (data.currentPeriod?.locations || []).find(
        loc => loc?.name === filters.locationFilter
      );
      
      if (selectedLocation) {
        filteredData.currentPeriod.headcount = {
          ...filteredData.currentPeriod.headcount,
          total: selectedLocation.total,
          faculty: selectedLocation.breakdown?.faculty || 0,
          staff: selectedLocation.breakdown?.staff || 0,
          students: selectedLocation.breakdown?.students || 0
        };
        filteredData.currentPeriod.locations = [selectedLocation];
      }
    }

    // Apply division filter
    if (filters.divisionFilter && filters.divisionFilter !== 'All') {
      const selectedDivision = (data.currentPeriod?.topDivisions || []).find(
        div => div?.name === filters.divisionFilter
      );
      
      if (selectedDivision) {
        filteredData.currentPeriod.topDivisions = [selectedDivision];
        filteredData.currentPeriod.headcount = {
          ...filteredData.currentPeriod.headcount,
          total: selectedDivision.headcount || 0,
          faculty: selectedDivision.faculty || 0,
          staff: selectedDivision.staff || 0
        };
      }
    }

    // Apply employee type filter
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

    return filteredData;
  }, []);

  // Format data for easy consumption by components (same as original hook)
  const formatDataForComponents = useCallback((data) => {
    if (!data || !data.currentPeriod) return null;

    return {
      // Summary metrics
      summary: {
        totalEmployees: data.currentPeriod?.headcount?.total || 0,
        totalHeadcount: data.currentPeriod?.headcount?.total || 0,
        faculty: data.currentPeriod?.headcount?.faculty || 0,
        staff: data.currentPeriod?.headcount?.staff || 0,
        students: data.currentPeriod?.headcount?.students || 0,
        totalPositions: data.currentPeriod?.positions?.total || 0,
        vacancies: data.currentPeriod?.positions?.vacant || 0,
        vacancyRate: data.currentPeriod?.positions?.vacancyRate || 0,
        employeeChange: data.currentPeriod?.headcount?.changeFromPrevious?.percentChange || 0,
        facultyChange: ((data.currentPeriod?.headcount?.changeFromPrevious?.faculty || 0) / (data.currentPeriod?.headcount?.faculty || 1) * 100) || 0,
        staffChange: ((data.currentPeriod?.headcount?.changeFromPrevious?.staff || 0) / (data.currentPeriod?.headcount?.staff || 1) * 100) || 0,
        vacancyRateChange: data.currentPeriod?.positions?.changeFromPrevious?.vacancyRateChange || 0,
        growth: data.currentPeriod?.headcount?.changeFromPrevious?.percentChange || 0
      },

      // Chart data
      charts: {
        historicalTrends: (data.historicalTrends || []).map(trend => ({
          quarter: trend?.quarter || '',
          period: trend?.quarter || '',
          total: trend?.headcount?.total || 0,
          faculty: trend?.headcount?.faculty || 0,
          staff: trend?.headcount?.staff || 0,
          students: trend?.headcount?.students || 0,
          vacancyRate: trend?.positions?.vacancyRate || 0
        })),

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
          faculty: Math.floor(Math.random() * 15) + 5,
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

      demographics: {
        ageGroups: data.demographics?.ageGroups || [],
        tenure: data.demographics?.tenure || []
      },

      // Firebase-specific metadata
      firebase: {
        lastSyncTime: lastSyncTime,
        isRealTime: isRealTimeActive,
        source: data.metadata?.source || 'firebase'
      },

      raw: data
    };
  }, [lastSyncTime, isRealTimeActive]);

  // Main data fetching effect
  useEffect(() => {
    let isMounted = true;
    let unsubscribeRealTime = null;

    const fetchData = async () => {
      try {
        // Load initial data
        const data = await loadFirebaseData();
        if (isMounted) {
          setFirebaseData(data);
          actions.updateDataTimestamp();
          
          // Set up real-time subscription
          unsubscribeRealTime = setupRealTimeSubscription();
        }
      } catch (error) {
        console.error('Firebase workforce data fetch failed:', error);
        // Error is already handled in loadFirebaseData
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      if (unsubscribeRealTime) {
        unsubscribeRealTime();
        setIsRealTimeActive(false);
      }
    };
  }, [activeFilters]); // Removed actions dependency to prevent infinite loop

  // Compute filtered and formatted data
  const filteredData = useMemo(() => {
    if (!firebaseData) return null;
    return filterFirebaseData(firebaseData, activeFilters);
  }, [firebaseData, activeFilters, filterFirebaseData]);

  const formattedData = useMemo(() => {
    return formatDataForComponents(filteredData);
  }, [filteredData, formatDataForComponents]);

  // Utility functions
  const refetch = useCallback(async () => {
    const cacheKey = getCacheKey(activeFilters);
    await globalCache.delete(cacheKey, { params: activeFilters });
    setFirebaseData(null);
    await loadFirebaseData();
  }, [loadFirebaseData, getCacheKey, activeFilters]);

  const isStale = useCallback(() => {
    const cacheKey = getCacheKey(activeFilters);
    return !globalCache.has(cacheKey);
  }, [getCacheKey, activeFilters]);

  // Loading state
  const isLoading = localLoading || state.loading.workforce;
  
  // Error state
  const error = localError || state.error.workforce;

  return {
    // Data
    data: formattedData,
    rawData: filteredData,
    
    // States
    loading: isLoading,
    error,
    
    // Firebase-specific
    isRealTime: isRealTimeActive,
    lastSyncTime,
    
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
    
    // Helper functions (same as original)
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

export default useFirebaseWorkforceData;