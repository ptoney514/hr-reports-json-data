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
 * Simple JSON hook for Recruiting data
 */
const useFirebaseRecruitingData = (period = '2025-Q1') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRealTime, setIsRealTime] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Convert period to JSON file date
  const getJsonFileDate = (reportingPeriod) => {
    if (!reportingPeriod) return '2025-03-31'; // Default to Q1 2025
    
    // Check if it's already a date format
    if (/^\d{4}-\d{2}-\d{2}$/.test(reportingPeriod)) {
      return reportingPeriod;
    }
    
    // Try to map from quarter format
    if (QUARTER_TO_DATE_MAP[reportingPeriod]) {
      return QUARTER_TO_DATE_MAP[reportingPeriod];
    }
    
    // Default to Q1 2025
    console.warn(`Unable to map period ${reportingPeriod} to JSON file date, using default`);
    return '2025-03-31';
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsRealTime(false);

        const jsonDate = getJsonFileDate(period);
        console.log(`Loading recruiting data from JSON for date: ${jsonDate}`);
        
        // Load JSON data from public folder
        const response = await fetch(`/data/recruiting/${jsonDate}.json`);
        
        if (!response.ok) {
          throw new Error(`No recruiting data found for date ${jsonDate}`);
        }
        
        const jsonData = await response.json();
        
        if (!jsonData) {
          throw new Error(`Invalid recruiting data for date ${jsonDate}`);
        }

        setData(transformData(jsonData));
        setLastSyncTime(new Date(jsonData.lastUpdated || Date.now()));
      } catch (err) {
        setError(err.message);
        console.error('Error loading recruiting data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [period]);

  return { data, loading, error, isRealTime, lastSyncTime };
};

// Transform JSON data to component format
const transformData = (jsonData) => {
  if (!jsonData) return null;

  return {
    recruitingData: {
      totalOpenPositions: jsonData.totalOpenPositions || jsonData.metrics?.totalOpenPositions || 127,
      postedPositions: jsonData.postedPositions || jsonData.metrics?.postedPositions || 89,
      notPostedPositions: jsonData.notPostedPositions || jsonData.metrics?.notPostedPositions || 38,
      newHiresYTD: jsonData.newHiresYTD || jsonData.metrics?.newHiresYTD || 228,
      costPerHire: jsonData.costPerHire || jsonData.metrics?.costPerHire || 4200
    },
    openPositionsByDept: jsonData.byDepartment ? Object.entries(jsonData.byDepartment).map(([dept, data]) => ({
      name: dept,
      open: data.open || 0,
      posted: data.posted || 0,
      notPosted: data.notPosted || 0,
      filled: data.filled || 0
    })) : (jsonData.metrics?.departmentPositions || []),
    hireSourceData: jsonData.hireSources ? Object.entries(jsonData.hireSources).map(([source, hires]) => ({
      source,
      hires: parseInt(hires),
      percentage: Math.round((hires / (jsonData.newHiresYTD || jsonData.metrics?.newHiresYTD || 1)) * 100)
    })) : (jsonData.metrics?.hireSources || []),
    timeToFillData: jsonData.timeToFill || jsonData.metrics?.timeToFill || [
      { quarter: 'Q3-24', avgDays: 52, target: 45 },
      { quarter: 'Q4-24', avgDays: 48, target: 45 },
      { quarter: 'Q1-25', avgDays: 44, target: 45 },
      { quarter: 'Q2-25', avgDays: 45, target: 45 }
    ],
    metadata: {
      source: 'json',
      period: jsonData.quarter || jsonData.period,
      lastUpdated: jsonData.lastUpdated
    }
  };
};

export default useFirebaseRecruitingData;