import { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '../contexts/DashboardContext';

// Simple hook to load compliance data from JSON files
const useComplianceData = () => {
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
    const loadComplianceData = async () => {
      setLoading(true);
      setError(null);

      try {
        const reportingDate = getDateFromQuarter(selectedQuarter);
        const response = await fetch(`/data/compliance/${reportingDate}.json`);
        
        if (!response.ok) {
          throw new Error(`Failed to load compliance data: ${response.status}`);
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error('Error loading compliance data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadComplianceData();
  }, [selectedQuarter]);

  // Format data for components
  const formattedData = useMemo(() => {
    if (!data) return null;

    return {
      metrics: {
        overallCompliance: data.metrics?.overallCompliance || 0,
        i9Compliance: data.metrics?.i9Compliance || 0,
        documentsProcessed: data.metrics?.documentsProcessed || 0,
        pendingReviews: data.metrics?.pendingReviews || 0,
        expiringDocuments: data.metrics?.expiringDocuments || 0,
        complianceRate: data.metrics?.complianceRate || 0,
        auditReadiness: data.metrics?.auditReadiness || 0
      },
      
      byDivision: data.byDivision || [],
      
      trends: data.monthlyTrends || [],
      
      riskIndicators: {
        highRisk: data.riskIndicators?.highRisk || 0,
        mediumRisk: data.riskIndicators?.mediumRisk || 0,
        lowRisk: data.riskIndicators?.lowRisk || 0,
        totalIssues: data.riskIndicators?.totalIssues || 0
      },
      
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
      // Trigger re-fetch by changing a dependency
      setData(null);
    }
  };
};

export default useComplianceData;