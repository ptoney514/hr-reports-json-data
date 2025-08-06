import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import turnoverDataJson from '../data/turnover-data.json';

// Cache for loaded data
let dataCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const useTurnoverData = (customFilters = {}) => {
  const { state, actions } = useDashboard();
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Create refs for action functions to prevent infinite loops
  const updateDataTimestampRef = useRef(actions.updateDataTimestamp);
  const setLoadingRef = useRef(actions.setLoading);
  const clearErrorRef = useRef(actions.clearError);
  const setErrorRef = useRef(actions.setError);

  // Update refs when actions change
  useEffect(() => {
    updateDataTimestampRef.current = actions.updateDataTimestamp;
    setLoadingRef.current = actions.setLoading;
    clearErrorRef.current = actions.clearError;
    setErrorRef.current = actions.setError;
  }, [actions]);

  // Merge context filters with custom filters
  const activeFilters = useMemo(() => ({
    fiscalYear: customFilters.fiscalYear || 'FY2024',
    locationFilter: customFilters.locationFilter || state.locationFilter,
    divisionFilter: customFilters.divisionFilter || state.divisionFilter,
    departmentFilter: customFilters.departmentFilter || state.departmentFilter,
    employeeTypeFilter: customFilters.employeeTypeFilter || state.employeeTypeFilter,
    gradeFilter: customFilters.gradeFilter || 'All',
    tenureFilter: customFilters.tenureFilter || 'All',
    reasonFilter: customFilters.reasonFilter || 'All'
  }), [customFilters, state]);

  // Load data from JSON (simulating API call)
  const loadData = useCallback(async () => {
    // Check cache first
    const now = Date.now();
    if (dataCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      return dataCache;
    }

    try {
      setLocalLoading(true);
      setLoadingRef.current('turnover', true);
      clearErrorRef.current('turnover');
      setLocalError(null);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 600));

      // In a real app, this would be an API call
      // const response = await fetch('/api/turnover-data');
      // const data = await response.json();
      
      const data = turnoverDataJson;

      // Cache the data
      dataCache = data;
      cacheTimestamp = now;

      return data;
    } catch (error) {
      const errorMessage = `Failed to load turnover data: ${error.message}`;
      setLocalError(errorMessage);
      setErrorRef.current('turnover', errorMessage);
      throw error;
    } finally {
      setLocalLoading(false);
      setLoadingRef.current('turnover', false);
    }
  }, []);

  // Filter turnover data based on active filters
  const filterData = useCallback((data, filters) => {
    if (!data || !data.currentFiscalYear) return null;

    let filteredData = { ...data };

    // Filter by fiscal year (historical data)
    if (filters.fiscalYear && filters.fiscalYear !== 'FY2024') {
      const historicalData = (data.historicalTrends || []).find(
        trend => trend?.fiscalYear === filters.fiscalYear
      );
      
      if (historicalData) {
        // Create a modified current fiscal year based on historical data
        filteredData.currentFiscalYear = {
          ...filteredData.currentFiscalYear,
          period: historicalData.period,
          overallTurnover: {
            ...filteredData.currentFiscalYear.overallTurnover,
            annualizedTurnoverRate: historicalData.overallTurnoverRate,
            totalDepartures: historicalData.totalDepartures
          }
        };
      }
    }

    // Filter by employee type
    if (filters.employeeTypeFilter && filters.employeeTypeFilter !== 'All') {
      const employeeType = filters.employeeTypeFilter;
      
      // Filter turnover by category
      filteredData.currentFiscalYear.turnoverByCategory = (data.currentFiscalYear?.turnoverByCategory || []).filter(
        category => category?.category === employeeType
      );

      // Filter voluntary reasons by employee type
      filteredData.currentFiscalYear.voluntaryTurnoverReasons = (data.currentFiscalYear?.voluntaryTurnoverReasons || []).map(
        reason => {
          const typeKey = `${employeeType.toLowerCase()}Count`;
          return {
            ...reason,
            count: reason?.[typeKey] || 0,
            percentage: reason?.[typeKey] ? (reason[typeKey] / (reason.count || 1) * 100) : 0
          };
        }
      ).filter(reason => (reason?.count || 0) > 0);
    }

    // Filter by grade
    if (filters.gradeFilter && filters.gradeFilter !== 'All') {
      const gradeMapping = {
        'A - Executive': 'A - Executive/Senior Leadership',
        'C - Faculty': 'C - Faculty/Academic',
        'D - Professional': 'D - Professional Staff',
        'X - Support': 'X - Support Staff',
        'Y - Student': 'Y - Student Workers'
      };
      
      const targetGrade = gradeMapping[filters.gradeFilter] || filters.gradeFilter;
      
      filteredData.currentFiscalYear.departuresByGrade = (data.currentFiscalYear?.departuresByGrade || []).filter(
        grade => grade?.grade === targetGrade
      );
    }

    // Filter by tenure range
    if (filters.tenureFilter && filters.tenureFilter !== 'All') {
      filteredData.currentFiscalYear.departuresByTenure = (data.currentFiscalYear?.departuresByTenure || []).filter(
        tenure => tenure?.tenureRange === filters.tenureFilter
      );
    }

    // Filter by department
    if (filters.departmentFilter && filters.departmentFilter !== 'All') {
      filteredData.turnoverByDepartment = (data.turnoverByDepartment || []).filter(
        dept => dept?.department === filters.departmentFilter
      );
    }

    // Filter by reason
    if (filters.reasonFilter && filters.reasonFilter !== 'All') {
      filteredData.currentFiscalYear.voluntaryTurnoverReasons = (data.currentFiscalYear?.voluntaryTurnoverReasons || []).filter(
        reason => reason?.reason === filters.reasonFilter
      );
    }

    return filteredData;
  }, []);

  // Format data for easy consumption by components
  const formatDataForComponents = useCallback((data) => {
    if (!data || !data.currentFiscalYear || !data.historicalTrends) return null;

    return {
      // Summary metrics
      summary: {
        overallTurnoverRate: data.currentFiscalYear?.overallTurnover?.annualizedTurnoverRate || 0,
        totalDepartures: data.currentFiscalYear?.overallTurnover?.totalDepartures || 0,
        voluntaryRate: (data.currentFiscalYear?.turnoverByCategory || []).reduce((sum, cat) => 
          sum + (cat?.voluntaryRate || 0), 0) / Math.max((data.currentFiscalYear?.turnoverByCategory || []).length, 1),
        involuntaryRate: (data.currentFiscalYear?.turnoverByCategory || []).reduce((sum, cat) => 
          sum + (cat?.involuntaryRate || 0), 0) / Math.max((data.currentFiscalYear?.turnoverByCategory || []).length, 1),
        changeFromPrevious: data.currentFiscalYear?.overallTurnover?.changeFromPreviousYear || 0,
        benchmarkComparison: data.benchmarkComparison?.overallComparison?.performance || 'unknown'
      },

      // Chart data
      charts: {
        // Turnover by category for bar chart
        categoryData: (data.currentFiscalYear?.turnoverByCategory || []).map(cat => ({
          category: cat?.category || '',
          turnoverRate: cat?.turnoverRate || 0,
          voluntary: cat?.voluntary || 0,
          involuntary: cat?.involuntary || 0,
          voluntaryRate: cat?.voluntaryRate || 0,
          involuntaryRate: cat?.involuntaryRate || 0,
          change: cat?.changeFromPreviousYear || 0
        })),

        // Voluntary reasons for pie chart
        reasonsData: (data.currentFiscalYear?.voluntaryTurnoverReasons || []).map(reason => ({
          reason: (reason?.reason || '').replace('/', ' /'),
          count: reason?.count || 0,
          percentage: reason?.percentage || 0,
          faculty: reason?.facultyCount || 0,
          staff: reason?.staffCount || 0,
          students: reason?.studentCount || 0
        })),

        // Tenure breakdown for bar chart
        tenureData: (data.currentFiscalYear?.departuresByTenure || []).map(tenure => ({
          tenure: tenure?.tenureRange || '',
          departures: tenure?.departures || 0,
          total: tenure?.totalInRange || 0,
          turnoverRate: tenure?.turnoverRate || 0,
          voluntary: tenure?.voluntary || 0,
          involuntary: tenure?.involuntary || 0,
          percentage: tenure?.percentOfDepartures || 0
        })),

        // Grade breakdown for horizontal bar chart
        gradeData: (data.currentFiscalYear?.departuresByGrade || []).map(grade => ({
          grade: (grade?.grade || '').split(' - ')[1] || grade?.grade || '',
          fullGrade: grade?.grade || '',
          departures: grade?.departures || 0,
          total: grade?.totalInGrade || 0,
          turnoverRate: grade?.turnoverRate || 0,
          voluntary: grade?.voluntary || 0,
          involuntary: grade?.involuntary || 0,
          averageTenure: grade?.averageTenure || 0,
          topReasons: grade?.topReasons || []
        })),

        // Historical trends for line chart
        trendsData: (data.historicalTrends || []).map(trend => ({
          year: trend?.fiscalYear || '',
          overall: trend?.overallTurnoverRate || 0,
          faculty: trend?.facultyRate || 0,
          staff: trend?.staffRate || 0,
          voluntary: trend?.voluntaryRate || 0,
          involuntary: trend?.involuntaryRate || 0,
          context: trend?.context || ''
        })),

        // Department risk analysis
        departmentRiskData: (data.turnoverByDepartment || []).map(dept => ({
          department: dept?.department || '',
          turnoverRate: dept?.turnoverRate || 0,
          departures: dept?.departures || 0,
          total: dept?.totalEmployees || 0,
          riskLevel: dept?.riskLevel || 'Low',
          voluntary: dept?.voluntary || 0,
          involuntary: dept?.involuntary || 0,
          primaryReasons: dept?.primaryReasons || [],
          benchmarkComparison: dept?.benchmarkComparison || {},
          initiatives: dept?.retentionInitiatives || []
        }))
      },

      // Benchmark data
      benchmarks: {
        overall: data.benchmarkComparison?.overallComparison || {},
        categories: data.benchmarkComparison?.categoryComparisons || [],
        regional: data.benchmarkComparison?.regionalComparison || {}
      },

      // Cost analysis
      costs: {
        totalCost: data.costAnalysis?.totalEstimatedCost?.FY2024 || 0,
        costPerDeparture: data.costAnalysis?.costPerDeparture || 0,
        breakdown: data.costAnalysis?.totalEstimatedCost?.breakdown || {},
        savings: data.costAnalysis?.savingsFromImprovement || 0
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
        await loadData();
        if (isMounted) {
          updateDataTimestampRef.current();
        }
      } catch (error) {
        // Error is already handled in loadData
        console.error('Turnover data fetch failed:', error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [loadData]);

  // Compute filtered and formatted data
  const filteredData = useMemo(() => {
    if (!dataCache) return null;
    return filterData(dataCache, activeFilters);
  }, [activeFilters, filterData]);

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
  const isLoading = localLoading || state.loading.turnover;

  // Error state (combines context and local errors)
  const error = localError || state.error.turnover;

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
      clearErrorRef.current('turnover');
      setLocalError(null);
    },
    
    // Helper functions
    getHighRiskDepartments: () => {
      if (!formattedData) return [];
      return formattedData.charts.departmentRiskData
        .filter(dept => dept.riskLevel === 'High')
        .sort((a, b) => b.turnoverRate - a.turnoverRate);
    },
    
    getTopReasons: (limit = 5) => {
      if (!formattedData) return [];
      return formattedData.charts.reasonsData
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    },

    getBenchmarkStatus: () => {
      if (!formattedData) return { status: 'unknown', message: '' };
      const benchmark = formattedData.benchmarks.overall;
      
      if (benchmark.ourRate < benchmark.benchmarkMedian) {
        return {
          status: 'good',
          message: `${(benchmark.benchmarkMedian - benchmark.ourRate).toFixed(1)}% better than median`
        };
      } else {
        return {
          status: 'warning',
          message: `${(benchmark.ourRate - benchmark.benchmarkMedian).toFixed(1)}% above median`
        };
      }
    },

    getCostImpact: () => {
      if (!formattedData) return { total: 0, formatted: '$0' };
      const total = formattedData.costs.totalCost;
      return {
        total,
        formatted: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(total)
      };
    }
  };
};

export default useTurnoverData;
export { useTurnoverData }; 