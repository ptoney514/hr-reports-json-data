import { useState, useEffect } from 'react';
import firebaseService from '../services/DataService';

/**
 * Simple Firebase hook for Exit Survey data
 */
const useFirebaseExitSurveyData = (period = '2025-Q1') => {
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
        const firebaseData = await firebaseService.getExitSurveyMetrics(period);
        
        if (firebaseData) {
          setData(transformData(firebaseData));
          setLastSyncTime(new Date());
          
          // Set up real-time subscription
          unsubscribe = firebaseService.subscribeToMetrics('exitSurvey', period, (updatedData) => {
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
    exitSurveyData: {
      totalExits: firebaseData.totalExits || 98,
      totalResponses: firebaseData.totalResponses || 20,
      recommendationRate: firebaseData.recommendationRate || 55,
      avgTenure: firebaseData.avgTenure || 2.4,
      exitInterviewCompletion: firebaseData.exitInterviewCompletion || 20.4
    },
    exitReasons: Object.entries(firebaseData.exitReasons || {}).map(([name, value]) => ({
      name,
      value: parseInt(value)
    })),
    satisfactionData: Object.entries(firebaseData.satisfaction || {}).map(([category, scores]) => ({
      category,
      satisfied: scores.satisfied || 0,
      neutral: scores.neutral || 0,
      dissatisfied: scores.dissatisfied || 0
    })),
    departmentExits: Object.entries(firebaseData.byDepartment || {}).map(([dept, data]) => ({
      department: dept,
      exits: data.exits || 0,
      responses: data.responses || 0,
      responseRate: data.responses ? Math.round((data.responses / data.exits) * 100) : 0
    })),
    metadata: {
      source: 'firebase',
      period: firebaseData.period,
      lastUpdated: firebaseData.lastUpdated
    }
  };
};

export default useFirebaseExitSurveyData;