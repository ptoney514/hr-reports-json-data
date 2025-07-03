import { useState, useEffect } from 'react';
import firebaseService from '../services/FirebaseService';

/**
 * Simple Firebase hook for Turnover data
 */
const useFirebaseTurnoverData = (period = '2025-Q1') => {
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
        const firebaseData = await firebaseService.getTurnoverMetrics(period);
        
        if (firebaseData) {
          setData(transformData(firebaseData));
          setLastSyncTime(new Date());
          
          // Set up real-time subscription
          unsubscribe = firebaseService.subscribeToMetrics('turnover', period, (updatedData) => {
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
    summary: {
      overallTurnoverRate: parseFloat(firebaseData.turnoverRate) || 0,
      totalDepartures: firebaseData.totalSeparations || 0,
      turnoverRateChange: parseFloat(firebaseData.trends?.quarterlyChange) || 0,
      facultyTurnoverRate: parseFloat(firebaseData.byDepartment?.['Academic Affairs']) || 0,
      facultyDepartures: Math.floor(firebaseData.totalSeparations * 0.3) || 0,
      facultyTurnoverChange: -0.9,
      staffTurnoverRate: parseFloat(firebaseData.byDepartment?.['Administration']) || 0,
      staffDepartures: Math.floor(firebaseData.totalSeparations * 0.7) || 0,
      staffTurnoverChange: parseFloat(firebaseData.trends?.quarterlyChange) || 0,
      totalCostImpact: firebaseData.costOfTurnover || 0,
      avgCostPerDeparture: Math.floor((firebaseData.costOfTurnover || 0) / (firebaseData.totalSeparations || 1)),
      costImpactChange: -5.2
    },
    charts: {
      byReason: Object.entries(firebaseData.byReason || {}).map(([reason, count]) => ({
        reason,
        count: parseInt(count),
        percentage: ((count / firebaseData.totalSeparations) * 100).toFixed(1)
      })),
      byDepartment: Object.entries(firebaseData.byDepartment || {}).map(([dept, rate]) => ({
        department: dept,
        rate: parseFloat(rate),
        departures: Math.floor(parseFloat(rate) * 10) // Estimate
      })),
      trends: [
        {
          quarter: firebaseData.period,
          overall: parseFloat(firebaseData.turnoverRate),
          voluntary: parseFloat(firebaseData.voluntaryRate),
          involuntary: parseFloat(firebaseData.involuntaryRate)
        }
      ]
    },
    metadata: {
      source: 'firebase',
      period: firebaseData.period,
      lastUpdated: firebaseData.lastUpdated
    }
  };
};

export default useFirebaseTurnoverData;