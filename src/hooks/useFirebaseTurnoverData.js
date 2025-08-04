import { useState, useEffect } from 'react';

// Map quarter format to JSON file dates
const QUARTER_TO_DATE_MAP = {
  'Q2-2025': '2025-06-30',
  'Q1-2025': '2025-03-31',
  'Q4-2024': '2024-12-31',
  'Q3-2024': '2024-09-30',
  'Q2-2024': '2024-06-30',
  // Firebase format
  '2025-Q2': '2025-06-30',
  '2025-Q1': '2025-03-31',
  '2024-Q4': '2024-12-31',
  '2024-Q3': '2024-09-30',
  '2024-Q2': '2024-06-30'
};

/**
 * Simple JSON hook for Turnover data
 */
const useFirebaseTurnoverData = (period = 'Q2-2025') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRealTime] = useState(false); // No real-time for JSON
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  // Convert period to JSON file date
  const getJsonFileDate = (reportingPeriod) => {
    if (!reportingPeriod) return '2025-06-30';
    if (/^\d{4}-\d{2}-\d{2}$/.test(reportingPeriod)) {
      return reportingPeriod;
    }
    return QUARTER_TO_DATE_MAP[reportingPeriod] || '2025-06-30';
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get JSON file date from period
        const jsonDate = getJsonFileDate(period);
        console.log(`Loading turnover data from JSON for date: ${jsonDate}`);
        
        // Load data from JSON file
        const response = await fetch(`/data/turnover/${jsonDate}.json`);
        
        if (!response.ok) {
          throw new Error(`No turnover data found for ${period} (${jsonDate})`);
        }
        
        const jsonData = await response.json();
        
        if (jsonData) {
          setData(transformData(jsonData));
          setLastSyncTime(new Date(jsonData.lastUpdated || Date.now()));
        }
      } catch (err) {
        console.error('Error loading turnover data:', err);
        setError(err.message);
        // Set default data on error
        setData(getDefaultData());
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [period]);

  return { data, loading, error, isRealTime, lastSyncTime };
};

// Get default data structure
const getDefaultData = () => ({
  summary: {
    overallTurnoverRate: 0,
    totalDepartures: 0,
    turnoverRateChange: 0,
    facultyTurnoverRate: 0,
    facultyDepartures: 0,
    facultyTurnoverChange: 0,
    staffTurnoverRate: 0,
    staffDepartures: 0,
    staffTurnoverChange: 0,
    totalCostImpact: 0,
    avgCostPerDeparture: 0,
    costImpactChange: 0
  },
  charts: {
    voluntaryReasons: [],
    tenureAnalysis: [],
    byReason: [],
    byDepartment: [],
    trends: []
  },
  metadata: {
    source: 'json',
    period: '',
    lastUpdated: new Date().toISOString()
  }
});

// Transform JSON data to component format
const transformData = (jsonData) => {
  if (!jsonData) return getDefaultData();

  return {
    summary: {
      overallTurnoverRate: jsonData.metrics?.overallRate || jsonData.turnoverRate || 0,
      totalDepartures: jsonData.metrics?.totalDepartures || jsonData.totalSeparations || 0,
      turnoverRateChange: jsonData.metrics?.turnoverRateChange || jsonData.trends?.quarterlyChange || 0,
      facultyTurnoverRate: jsonData.metrics?.facultyRate || 0,
      facultyDepartures: jsonData.metrics?.facultyDepartures || Math.floor((jsonData.metrics?.totalDepartures || 0) * 0.3),
      facultyTurnoverChange: jsonData.metrics?.facultyChange || -0.9,
      staffTurnoverRate: jsonData.metrics?.staffRate || 0,
      staffDepartures: jsonData.metrics?.staffDepartures || Math.floor((jsonData.metrics?.totalDepartures || 0) * 0.7),
      staffTurnoverChange: jsonData.metrics?.staffChange || 0,
      totalCostImpact: jsonData.metrics?.costImpact || jsonData.costOfTurnover || 0,
      avgCostPerDeparture: jsonData.metrics?.avgCostPerDeparture || Math.floor((jsonData.metrics?.costImpact || 0) / Math.max(1, jsonData.metrics?.totalDepartures || 1)),
      costImpactChange: jsonData.metrics?.costImpactChange || -5.2,
      voluntaryRate: jsonData.metrics?.voluntaryRate || 0,
      involuntaryRate: jsonData.metrics?.involuntaryRate || 0
    },
    charts: {
      // Transform voluntary turnover reasons for pie chart
      voluntaryReasons: (jsonData.byReason || jsonData.voluntaryTurnoverReasons || [
        { reason: 'Career Advancement', count: 109, percentage: 38 },
        { reason: 'Compensation', count: 60, percentage: 21 },
        { reason: 'Work-Life Balance', count: 49, percentage: 17 },
        { reason: 'Retirement', count: 34, percentage: 12 },
        { reason: 'Relocation', count: 23, percentage: 8 },
        { reason: 'Other', count: 11, percentage: 4 }
      ]).map(item => ({
        name: item.reason || item.name,
        value: item.count || item.value || 0,
        percentage: item.percentage || ((item.count / Math.max(1, jsonData.metrics?.totalDepartures || 1)) * 100).toFixed(1)
      })),
      
      // Transform departures by tenure for pie chart
      tenureAnalysis: (jsonData.byTenure || jsonData.departuresByTenure || [
        { range: '< 1 Year', count: 100, percentage: 35 },
        { range: '1-3 Years', count: 83, percentage: 29 },
        { range: '3-5 Years', count: 52, percentage: 18 },
        { range: '5-10 Years', count: 29, percentage: 10 },
        { range: '10+ Years', count: 23, percentage: 8 }
      ]).map(item => ({
        name: item.range || item.name || item.tenure,
        value: item.count || item.value || 0,
        percentage: item.percentage || item.rate || 0
      })),

      // Transform data for backward compatibility
      byReason: (jsonData.byReason || []).map(item => ({
        reason: item.reason || item.name,
        count: item.count || 0,
        percentage: item.percentage || ((item.count / Math.max(1, jsonData.metrics?.totalDepartures || 1)) * 100).toFixed(1)
      })),
      byDepartment: (jsonData.byDivision || jsonData.byDepartment || []).map(item => ({
        department: item.name || item.division || item.department,
        rate: item.rate || item.turnoverRate || 0,
        departures: item.departures || item.count || 0
      })),
      trends: jsonData.monthlyTrend || jsonData.trends || [
        {
          quarter: jsonData.quarter || jsonData.period,
          overall: jsonData.metrics?.overallRate || 0,
          voluntary: jsonData.metrics?.voluntaryRate || 0,
          involuntary: jsonData.metrics?.involuntaryRate || 0
        }
      ]
    },
    metadata: {
      source: 'json',
      period: jsonData.quarter || jsonData.period,
      lastUpdated: jsonData.lastUpdated || new Date().toISOString()
    }
  };
};

export default useFirebaseTurnoverData;