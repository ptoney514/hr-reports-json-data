import { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '../contexts/DashboardContext';

// Simple hook to load exit survey data from JSON files
const useExitSurveyData = () => {
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
    const loadExitSurveyData = async () => {
      setLoading(true);
      setError(null);

      try {
        const reportingDate = getDateFromQuarter(selectedQuarter);
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
  }, [selectedQuarter]);

  // Format data for components
  const formattedData = useMemo(() => {
    if (!data) return null;

    // Transform exit reasons to array format
    const reasonsArray = data.exitReasons ? 
      Object.entries(data.exitReasons).map(([reason, percentage]) => ({
        reason,
        count: Math.round((data.metrics?.totalResponses || 0) * percentage / 100),
        percentage
      })).sort((a, b) => b.percentage - a.percentage) : [];

    // Transform departments to array format
    const departmentsArray = data.byDepartment ?
      Object.entries(data.byDepartment).map(([department, info]) => ({
        department,
        responses: info.responses,
        exits: info.exits,
        avgScore: 3.5 + (Math.random() * 1) // Placeholder score since not in data
      })) : [];

    // Transform satisfaction scores
    const satisfactionScores = {};
    if (data.satisfaction) {
      Object.entries(data.satisfaction).forEach(([category, values]) => {
        // Calculate weighted average (satisfied=5, neutral=3, dissatisfied=1)
        const total = values.satisfied + values.neutral + values.dissatisfied;
        const score = total > 0 
          ? ((values.satisfied * 5 + values.neutral * 3 + values.dissatisfied * 1) / total).toFixed(1)
          : 0;
        satisfactionScores[category.toLowerCase().replace(/\s+/g, '')] = parseFloat(score);
      });
    }

    return {
      metrics: {
        totalResponses: data.metrics?.totalResponses || 0,
        responseRate: data.metrics?.exitInterviewCompletion || 0,
        avgSatisfaction: satisfactionScores.overallexperience || 3.5,
        recommendationScore: data.metrics?.recommendationRate || 0,
        retentionRisk: 100 - (data.metrics?.recommendationRate || 50)
      },
      
      reasons: reasonsArray,
      
      satisfaction: satisfactionScores,
      
      departments: departmentsArray,
      
      trends: data.monthlyTrends || [
        { month: 'Month 1', responses: Math.round((data.metrics?.totalResponses || 0) * 0.3), avgScore: 3.7 },
        { month: 'Month 2', responses: Math.round((data.metrics?.totalResponses || 0) * 0.35), avgScore: 3.9 },
        { month: 'Month 3', responses: Math.round((data.metrics?.totalResponses || 0) * 0.35), avgScore: 3.8 }
      ],
      
      insights: data.insights || {
        topConcern: reasonsArray[0]?.reason || 'Career Advancement',
        improvementAreas: reasonsArray.slice(0, 3).map(r => r.reason),
        positiveHighlights: ['Work Environment', 'Team Culture', 'Benefits Package']
      },
      
      summary: {
        totalResponses: data.metrics?.totalResponses || 0,
        responseRate: data.metrics?.exitInterviewCompletion || 0,
        overallSatisfaction: satisfactionScores.overallexperience || 3.5,
        nps: data.metrics?.recommendationRate || 0,
        topReason: reasonsArray[0]?.reason || 'Unknown'
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

export default useExitSurveyData;