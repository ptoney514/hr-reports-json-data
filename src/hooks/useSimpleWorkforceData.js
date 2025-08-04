import { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '../contexts/DashboardContext';

// Simple hook to load workforce data from JSON files
const useSimpleWorkforceData = () => {
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
    const loadWorkforceData = async () => {
      setLoading(true);
      setError(null);

      try {
        const reportingDate = getDateFromQuarter(selectedQuarter);
        const response = await fetch(`/data/workforce/${reportingDate}.json`);
        
        if (!response.ok) {
          throw new Error(`Failed to load workforce data: ${response.status}`);
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error('Error loading workforce data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadWorkforceData();
  }, [selectedQuarter]);

  // Format data for components
  const formattedData = useMemo(() => {
    if (!data) return null;

    return {
      // Summary metrics
      summary: {
        totalEmployees: data.metrics?.totalEmployees || 0,
        faculty: data.metrics?.faculty || 0,
        staff: data.metrics?.staff || 0,
        students: data.metrics?.students || 0,
        hsr: data.metrics?.hsr || 0,
        vacancyRate: data.metrics?.vacancyRate || 0,
        vacancies: data.metrics?.vacancies || 0,
        totalPositions: data.metrics?.totalPositions || 0,
        newHires: data.metrics?.newHires || 0,
        departures: data.metrics?.departures || 0,
        netChange: data.metrics?.netChange || 0,
        turnoverRate: data.metrics?.turnoverRate || 0
      },

      // Location data
      locations: Object.entries(data.byLocation || {}).map(([name, count]) => ({
        name,
        total: count,
        percentage: Math.round((count / (data.metrics?.totalEmployees || 1)) * 100)
      })),

      // Division data
      divisions: data.byDivision || [],

      // Monthly trends
      monthlyTrends: data.monthlyTrends || [],

      // Demographics
      demographics: data.demographics || {},

      // Chart-ready data
      charts: {
        historicalTrends: [], // Would need historical data from multiple quarters
        
        startersLeavers: data.monthlyTrends?.map(month => ({
          month: month.month,
          starters: month.starters || 0,
          leavers: month.leavers || 0,
          netChange: month.netChange || 0
        })) || [],

        topDivisions: data.byDivision?.map(div => ({
          name: div.name,
          total: div.count,
          faculty: div.faculty || 0,
          staff: div.staff || 0,
          vacancyRate: div.vacancyRate || 0
        })) || [],

        locationDistribution: Object.entries(data.byLocation || {}).map(([name, value]) => ({
          name: name.replace(' Campus', ''),
          value,
          percentage: Math.round((value / (data.metrics?.totalEmployees || 1)) * 100)
        }))
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
    getTotalsByType: () => {
      if (!formattedData) return { faculty: 0, staff: 0, students: 0 };
      return {
        faculty: formattedData.summary.faculty,
        staff: formattedData.summary.staff,
        students: formattedData.summary.students
      };
    },

    getGrowthMetrics: () => {
      if (!formattedData) return { growth: 0, isPositive: false };
      const growth = formattedData.summary.netChange || 0;
      return {
        growth: Math.abs(growth),
        isPositive: growth >= 0,
        formatted: `${growth >= 0 ? '+' : ''}${growth}`
      };
    }
  };
};

export default useSimpleWorkforceData;