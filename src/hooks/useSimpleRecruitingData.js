import { useState, useEffect, useMemo } from 'react';

/**
 * Simple hook to load recruiting data from JSON files
 * Replaces the complex Firebase useFirebaseRecruitingData hook
 */
const useSimpleRecruitingData = (period = '2025-Q2') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Convert quarter format to date format for filename
  const getDateFromQuarter = (quarter) => {
    const quarterMap = {
      '2025-Q2': '2025-06-30',
      '2025-Q1': '2025-03-31',
      '2024-Q4': '2024-12-31',
      '2024-Q3': '2024-09-30',
      '2024-Q2': '2024-06-30'
    };
    return quarterMap[quarter] || '2025-06-30';
  };

  useEffect(() => {
    const loadRecruitingData = async () => {
      setLoading(true);
      setError(null);

      try {
        const reportingDate = getDateFromQuarter(period);
        const response = await fetch(`/data/recruiting/${reportingDate}.json`);
        
        if (!response.ok) {
          throw new Error(`Failed to load recruiting data: ${response.status}`);
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error('Error loading recruiting data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRecruitingData();
  }, [period]);

  // Transform data to match the format expected by RecruitingDashboard
  const transformedData = useMemo(() => {
    if (!data) return null;

    return {
      recruitingData: {
        totalOpenPositions: data.metrics?.totalOpenPositions || 127,
        postedPositions: data.metrics?.postedPositions || 89,
        notPostedPositions: data.metrics?.notPostedPositions || 38,
        newHiresYTD: data.metrics?.newHiresYTD || 228,
        costPerHire: data.metrics?.costPerHire || 4200
      },
      openPositionsByDept: Object.entries(data.byDepartment || {}).map(([dept, data]) => ({
        name: dept,
        open: data.open || 0,
        posted: data.posted || 0,
        notPosted: data.notPosted || 0,
        filled: data.filled || 0
      })),
      hireSourceData: Object.entries(data.hireSources || {}).map(([source, hires]) => ({
        source,
        hires: parseInt(hires),
        percentage: Math.round((hires / (data.metrics?.newHiresYTD || 1)) * 100)
      })),
      timeToFillData: data.timeToFill || [
        { quarter: 'Q3-24', avgDays: 52, target: 45 },
        { quarter: 'Q4-24', avgDays: 48, target: 45 },
        { quarter: 'Q1-25', avgDays: 44, target: 45 },
        { quarter: 'Q2-25', avgDays: 45, target: 45 }
      ],
      metadata: {
        source: 'json',
        period: data.quarter,
        lastUpdated: data.lastUpdated
      }
    };
  }, [data]);

  return {
    data: transformedData,
    loading,
    error,
    isRealTime: false, // JSON data is static, not real-time
    lastSyncTime: data ? new Date(data.lastUpdated) : null
  };
};

export default useSimpleRecruitingData;