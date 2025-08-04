import { useState, useEffect } from 'react';

// Test version of compliance hook that accepts quarter as parameter
const useTestComplianceData = (quarter) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Convert quarter format to date format for filename
  const getDateFromQuarter = (q) => {
    const quarterMap = {
      'Q2-2025': '2025-06-30',
      'Q1-2025': '2025-03-31',
      'Q4-2024': '2024-12-31',
      'Q3-2024': '2024-09-30',
      'Q2-2024': '2024-06-30'
    };
    return quarterMap[q] || '2024-09-30';
  };

  useEffect(() => {
    const loadData = async () => {
      if (!quarter) return;
      
      setLoading(true);
      setError(null);

      try {
        const reportingDate = getDateFromQuarter(quarter);
        console.log(`Loading compliance data for ${quarter} -> ${reportingDate}`);
        
        // Add timestamp to prevent caching issues
        const response = await fetch(`/data/compliance/${reportingDate}.json?t=${Date.now()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const jsonData = await response.json();
        console.log('Compliance data loaded successfully:', jsonData);
        setData(jsonData);
      } catch (err) {
        console.error('Error loading compliance data:', err);
        setError(err.message);
        
        // Set fallback data for testing
        setData({
          reportingDate: getDateFromQuarter(quarter),
          quarter: quarter,
          riskCategories: [
            { category: 'Expired I-9s', count: 12, severity: 'high' },
            { category: 'Missing Documentation', count: 8, severity: 'medium' },
            { category: 'Upcoming Expirations', count: 15, severity: 'low' }
          ],
          trends: [
            { month: 'Jan', compliance: 95 },
            { month: 'Feb', compliance: 96 },
            { month: 'Mar', compliance: 94 }
          ],
          summary: {
            totalEmployees: 1000,
            compliantCount: 950,
            complianceRate: 95
          }
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [quarter]);

  return { data, loading, error };
};

export default useTestComplianceData;