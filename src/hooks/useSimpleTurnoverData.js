import { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '../contexts/DashboardContext';

// Simple hook to load turnover data from JSON files
const useSimpleTurnoverData = () => {
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
    const loadTurnoverData = async () => {
      setLoading(true);
      setError(null);

      try {
        const reportingDate = getDateFromQuarter(selectedQuarter);
        const response = await fetch(`/data/turnover/${reportingDate}.json`);
        
        if (!response.ok) {
          throw new Error(`Failed to load turnover data: ${response.status}`);
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error('Error loading turnover data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTurnoverData();
  }, [selectedQuarter]);

  // Format data for components
  const formattedData = useMemo(() => {
    if (!data) return null;

    return {
      // Summary metrics
      summary: {
        turnoverRate: data.metrics?.turnoverRate || 0,
        voluntaryTurnoverRate: data.metrics?.voluntaryTurnoverRate || 0,
        involuntaryTurnoverRate: data.metrics?.involuntaryTurnoverRate || 0,
        totalDepartures: data.metrics?.totalDepartures || 0,
        avgTenure: data.metrics?.avgTenure || 0,
        retentionRate: data.metrics?.retentionRate || 0,
        regrettableLosses: data.metrics?.regrettableLosses || 0
      },

      // Reasons for leaving
      reasonsForLeaving: data.reasonsForLeaving || [],

      // Turnover by division
      byDivision: data.byDivision || [],

      // Monthly trends
      monthlyTrends: data.monthlyTrends || [],

      // Employee category breakdown
      byCategory: [
        { category: 'Faculty', rate: data.metrics?.facultyTurnoverRate || 0, count: data.metrics?.facultyDepartures || 0 },
        { category: 'Staff', rate: data.metrics?.staffTurnoverRate || 0, count: data.metrics?.staffDepartures || 0 },
        { category: 'Students', rate: data.metrics?.studentTurnoverRate || 0, count: data.metrics?.studentDepartures || 0 }
      ],

      // Chart-ready data
      charts: {
        // Turnover trends
        trendData: data.monthlyTrends?.map(month => ({
          month: month.month,
          turnoverRate: month.turnoverRate || 0,
          voluntary: month.voluntary || 0,
          involuntary: month.involuntary || 0
        })) || [],

        // Reasons pie chart
        reasonsData: data.reasonsForLeaving?.map(reason => ({
          name: reason.reason,
          value: reason.count,
          percentage: reason.percentage
        })) || [],

        // Division bar chart
        divisionData: data.byDivision?.map(div => ({
          name: div.name,
          turnoverRate: div.turnoverRate || 0,
          departures: div.departures || 0,
          headcount: div.headcount || 0
        })) || []
      },

      // Metadata
      quarter: data.quarter,
      reportingDate: data.reportingDate,
      lastUpdated: data.lastUpdated
    };
  }, [data]);

  return {
    data: formattedData,
    loading,
    error,
    refetch: () => {
      setData(null);
    },
    
    // Helper functions for compatibility
    getTurnoverRate: () => {
      return formattedData?.summary?.turnoverRate || 0;
    },

    getTopReasons: () => {
      return formattedData?.reasonsForLeaving?.slice(0, 3) || [];
    }
  };
};

export default useSimpleTurnoverData;