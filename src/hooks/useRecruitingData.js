import { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '../contexts/DashboardContext';

// Simple hook to load recruiting data from JSON files
const useRecruitingData = () => {
  const { state } = useDashboard();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the selected quarter from context
  const selectedQuarter = state.reportingPeriod || 'Q2-2025';

  // Convert quarter format to date format for filename
  const getDateFromQuarter = (quarter) => {
    const quarterMap = {
      'Q2-2025': '2025-06-30',
      'Q1-2025': '2025-03-31',
      'Q4-2024': '2024-12-31',
      'Q3-2024': '2024-09-30',
      'Q2-2024': '2024-06-30'
    };
    return quarterMap[quarter] || '2025-06-30';
  };

  useEffect(() => {
    const loadRecruitingData = async () => {
      setLoading(true);
      setError(null);

      try {
        // For now, create sample recruiting data structure
        // In production, this would load from /data/recruiting/{date}.json
        const recruitingData = {
          reportingDate: getDateFromQuarter(selectedQuarter),
          quarter: selectedQuarter,
          metrics: {
            openPositions: 127,
            applicationsReceived: 3456,
            interviewsConducted: 234,
            offersExtended: 89,
            offersAccepted: 67,
            timeToFill: 45,
            acceptanceRate: 75.3,
            diversityRate: 42.5
          },
          byDepartment: [
            { name: 'Engineering', openings: 34, filled: 12, timeToFill: 52 },
            { name: 'Sales', openings: 28, filled: 19, timeToFill: 38 },
            { name: 'Marketing', openings: 15, filled: 8, timeToFill: 41 },
            { name: 'Operations', openings: 22, filled: 14, timeToFill: 45 },
            { name: 'HR', openings: 8, filled: 5, timeToFill: 35 }
          ],
          pipeline: {
            screening: 1234,
            firstInterview: 456,
            secondInterview: 234,
            finalInterview: 123,
            offerStage: 89
          },
          monthlyTrends: [
            { month: 'Month 1', applications: 1123, hires: 22 },
            { month: 'Month 2', applications: 1245, hires: 24 },
            { month: 'Month 3', applications: 1088, hires: 21 }
          ]
        };

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setData(recruitingData);
      } catch (err) {
        console.error('Error loading recruiting data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRecruitingData();
  }, [selectedQuarter]);

  // Format data for components
  const formattedData = useMemo(() => {
    if (!data) return null;

    return {
      metrics: data.metrics || {},
      
      departments: data.byDepartment || [],
      
      pipeline: data.pipeline || {},
      
      trends: data.monthlyTrends || [],
      
      summary: {
        totalOpenings: data.metrics?.openPositions || 0,
        avgTimeToFill: data.metrics?.timeToFill || 0,
        acceptanceRate: data.metrics?.acceptanceRate || 0,
        applicationsPerOpening: Math.round((data.metrics?.applicationsReceived || 0) / (data.metrics?.openPositions || 1))
      },
      
      quarter: data.quarter,
      reportingDate: data.reportingDate
    };
  }, [data]);

  return {
    data: formattedData,
    loading,
    error,
    refetch: () => {
      setData(null);
    }
  };
};

export default useRecruitingData;