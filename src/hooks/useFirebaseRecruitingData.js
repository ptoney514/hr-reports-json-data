import { useState, useEffect } from 'react';
import firebaseService from '../services/DataService';

/**
 * Simple Firebase hook for Recruiting data
 */
const useFirebaseRecruitingData = (period = '2025-Q1') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRealTime, setIsRealTime] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get initial data
        const firebaseData = await firebaseService.getRecruitingMetrics(period);
        
        if (firebaseData) {
          setData(transformData(firebaseData));
          setLastSyncTime(new Date());
          
          // Set up real-time subscription
          unsubscribe = firebaseService.subscribeToMetrics('recruiting', period, (updatedData) => {
            if (updatedData) {
              setData(transformData(updatedData));
              setLastSyncTime(new Date());
              setIsRealTime(true);
            }
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (unsubscribe) {
        unsubscribe();
        setIsRealTime(false);
      }
    };
  }, [period]);

  return { data, loading, error, isRealTime, lastSyncTime };
};

// Transform Firebase data to component format
const transformData = (firebaseData) => {
  if (!firebaseData) return null;

  return {
    recruitingData: {
      totalOpenPositions: firebaseData.totalOpenPositions || 127,
      postedPositions: firebaseData.postedPositions || 89,
      notPostedPositions: firebaseData.notPostedPositions || 38,
      newHiresYTD: firebaseData.newHiresYTD || 228,
      costPerHire: firebaseData.costPerHire || 4200
    },
    openPositionsByDept: Object.entries(firebaseData.byDepartment || {}).map(([dept, data]) => ({
      name: dept,
      open: data.open || 0,
      posted: data.posted || 0,
      notPosted: data.notPosted || 0,
      filled: data.filled || 0
    })),
    hireSourceData: Object.entries(firebaseData.hireSources || {}).map(([source, hires]) => ({
      source,
      hires: parseInt(hires),
      percentage: Math.round((hires / firebaseData.newHiresYTD) * 100)
    })),
    timeToFillData: firebaseData.timeToFill || [
      { quarter: 'Q3-24', avgDays: 52, target: 45 },
      { quarter: 'Q4-24', avgDays: 48, target: 45 },
      { quarter: 'Q1-25', avgDays: 44, target: 45 },
      { quarter: 'Q2-25', avgDays: 45, target: 45 }
    ],
    metadata: {
      source: 'firebase',
      period: firebaseData.period,
      lastUpdated: firebaseData.lastUpdated
    }
  };
};

export default useFirebaseRecruitingData;