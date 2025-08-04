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
 * Simple JSON hook for Exit Survey data
 */
const useFirebaseExitSurveyData = (period = '2025-Q1') => {
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
        console.log(`Loading exit survey data from JSON for date: ${jsonDate}`);
        
        // Load JSON data from public folder
        const response = await fetch(`/data/exitSurvey/${jsonDate}.json`);
        
        if (!response.ok) {
          throw new Error(`No exit survey data found for date ${jsonDate}`);
        }
        
        const jsonData = await response.json();
        
        if (!jsonData) {
          throw new Error(`Invalid exit survey data for date ${jsonDate}`);
        }

        setData(transformData(jsonData));
        setLastSyncTime(new Date(jsonData.lastUpdated || Date.now()));
      } catch (err) {
        setError(err.message);
        console.error('Error loading exit survey data:', err);
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
    exitSurveyData: {
      totalExits: jsonData.totalExits || jsonData.metrics?.totalExits || 98,
      totalResponses: jsonData.totalResponses || jsonData.metrics?.totalResponses || 20,
      recommendationRate: jsonData.recommendationRate || jsonData.metrics?.recommendationRate || 55,
      avgTenure: jsonData.avgTenure || jsonData.metrics?.avgTenure || 2.4,
      exitInterviewCompletion: jsonData.exitInterviewCompletion || jsonData.metrics?.exitInterviewCompletion || 20.4
    },
    exitReasons: jsonData.exitReasons ? Object.entries(jsonData.exitReasons).map(([name, value]) => ({
      name,
      value: parseInt(value)
    })) : (jsonData.metrics?.exitReasons || []).map(reason => ({
      name: reason.name || reason,
      value: reason.value || reason.count || 0
    })),
    satisfactionData: jsonData.satisfaction ? Object.entries(jsonData.satisfaction).map(([category, scores]) => ({
      category,
      satisfied: scores.satisfied || 0,
      neutral: scores.neutral || 0,
      dissatisfied: scores.dissatisfied || 0
    })) : (jsonData.metrics?.satisfaction || []),
    departmentExits: jsonData.byDepartment ? Object.entries(jsonData.byDepartment).map(([dept, data]) => ({
      department: dept,
      exits: data.exits || 0,
      responses: data.responses || 0,
      responseRate: data.responses ? Math.round((data.responses / data.exits) * 100) : 0
    })) : (jsonData.metrics?.departmentExits || []),
    metadata: {
      source: 'json',
      period: jsonData.quarter || jsonData.period,
      lastUpdated: jsonData.lastUpdated
    }
  };
};

export default useFirebaseExitSurveyData;