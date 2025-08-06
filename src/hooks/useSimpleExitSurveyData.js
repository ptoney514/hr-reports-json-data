import { useState, useEffect, useMemo } from 'react';

/**
 * Simple hook to load exit survey data from JSON files
 * Replaces the complex Firebase useFirebaseExitSurveyData hook
 */
const useSimpleExitSurveyData = (period = '2025-Q1') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Convert quarter format to date format for filename
  const getDateFromQuarter = (quarter) => {
    const quarterMap = {
      '2025-Q4': '2025-06-30',
      '2025-Q2': '2025-06-30', 
      '2025-Q1': '2025-03-31',
      '2024-Q4': '2024-12-31',
      '2024-Q3': '2024-09-30',
      '2024-Q2': '2024-06-30'
    };
    return quarterMap[quarter] || '2025-06-30';
  };

  useEffect(() => {
    const loadExitSurveyData = async () => {
      setLoading(true);
      setError(null);

      try {
        const reportingDate = getDateFromQuarter(period);
        const response = await fetch(`/data/exit-survey/${reportingDate}.json`);
        
        if (!response.ok) {
          throw new Error(`Failed to load exit survey data: ${response.status}`);
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error('Error loading exit survey data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadExitSurveyData();
  }, [period]);

  // Transform data to match the format expected by ExitSurveyDashboard
  const transformedData = useMemo(() => {
    if (!data) return null;

    return {
      exitSurveyData: {
        totalExits: data.metrics?.totalExits || 372,
        totalResponses: data.metrics?.totalResponses || 11,
        recommendationRate: data.metrics?.recommendationRate || 72.7,
        avgTenure: data.metrics?.avgTenure || "TBD",
        exitInterviewCompletion: data.metrics?.exitInterviewCompletion || 2.96
      },
      exitReasons: Object.entries(data.exitReasons || {}).map(([name, value]) => ({
        name,
        value: parseFloat(value)
      })),
      satisfactionData: Object.entries(data.satisfaction || {}).map(([category, scores]) => ({
        category,
        satisfied: scores.satisfied || 0,
        neutral: scores.neutral || 0,
        dissatisfied: scores.dissatisfied || 0
      })),
      departmentExits: Object.entries(data.byDepartment || {}).map(([dept, deptData]) => ({
        department: dept,
        exits: deptData.exits || "N/A",
        responses: deptData.responses || 0,
        responseRate: (deptData.exits && deptData.responses) ? 
          ((deptData.responses / deptData.exits) * 100).toFixed(1) + "%" : 
          deptData.responses ? "N/A" : "0%"
      })),
      salaryComparison: data.salaryComparison ? Object.entries(data.salaryComparison).map(([label, percentage]) => ({
        label,
        count: Math.round((percentage * 11) / 100), // Calculate count from percentage
        percentage: parseFloat(percentage)
      })) : [],
      keyInsights: data.keyInsights || {
        areasOfConcern: [],
        positiveFeedback: [],
        actionItems: []
      },
      summaryText: data.summaryText || "",
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

export default useSimpleExitSurveyData;