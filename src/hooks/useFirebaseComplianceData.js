import { useState, useEffect } from 'react';
import firebaseService from '../services/FirebaseService';

/**
 * Simple Firebase hook for I9 Compliance data
 */
const useFirebaseComplianceData = (period = '2025-Q1') => {
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
        const firebaseData = await firebaseService.getComplianceMetrics(period);
        
        if (firebaseData) {
          setData(transformData(firebaseData));
          setLastSyncTime(new Date());
          
          // Set up real-time subscription
          unsubscribe = firebaseService.subscribeToMetrics('compliance', period, (updatedData) => {
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
    currentMetrics: {
      totalI9s: firebaseData.totalI9s || 619,
      section2OnTime: firebaseData.section2OnTime || 579,
      section2Late: firebaseData.section2Late || 40,
      section2Compliance: firebaseData.section2Compliance || 94,
      overallCompliance: firebaseData.overallCompliance || 90,
      reverifications: firebaseData.reverifications || 10,
      auditReady: firebaseData.auditReady || 88
    },
    previousMetrics: {
      totalI9s: firebaseData.previousPeriod?.totalI9s || 587,
      section2Compliance: firebaseData.previousPeriod?.section2Compliance || 91,
      overallCompliance: firebaseData.previousPeriod?.overallCompliance || 87
    },
    complianceByType: Object.entries(firebaseData.byType || {}).map(([name, data]) => ({
      name,
      total: data.total || 0,
      onTime: data.onTime || 0,
      late: data.late || 0,
      rate: data.rate || 0
    })),
    trendData: firebaseData.trendData || [
      { quarter: 'Q1-24', compliance: 85, processed: 532 },
      { quarter: 'Q2-24', compliance: 87, processed: 598 },
      { quarter: 'Q3-24', compliance: 89, processed: 612 },
      { quarter: 'Q4-24', compliance: 91, processed: 587 },
      { quarter: 'Q1-25', compliance: 87, processed: 645 },
      { quarter: 'Q2-25', compliance: 90, processed: 619 }
    ],
    riskMetrics: Object.entries(firebaseData.risks || {}).map(([category, data]) => ({
      category,
      count: data.count || 0,
      risk: data.risk || 'Medium',
      color: data.color || '#f59e0b'
    })),
    improvements: firebaseData.improvements || [
      { 
        initiative: 'SOP v2 Implementation', 
        status: 'Completed', 
        progress: 100,
        target: '+3% compliance',
        owner: 'HR Team'
      },
      { 
        initiative: 'Annual Training Program', 
        status: 'In Progress', 
        progress: 75,
        target: '100% completion',
        owner: 'Training Team'
      },
      { 
        initiative: 'Interfolio Integration', 
        status: 'In Progress', 
        progress: 60,
        target: 'Pilot completion',
        owner: 'IT Team'
      },
      { 
        initiative: 'Dashboard Automation', 
        status: 'Completed', 
        progress: 100,
        target: '+15% efficiency',
        owner: 'Analytics Team'
      }
    ],
    metadata: {
      source: 'firebase',
      period: firebaseData.period,
      lastUpdated: firebaseData.lastUpdated
    }
  };
};

export default useFirebaseComplianceData;