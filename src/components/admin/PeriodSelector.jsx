import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { getQuarters } from '../../services/QuarterConfigService';

const PeriodSelector = ({ selectedPeriod, onPeriodChange, className = '' }) => {
  // Get available quarters and format them for display
  const quarters = useMemo(() => {
    const allQuarters = getQuarters();
    
    // Convert to the format expected by Firebase (2025-Q1)
    return allQuarters.map(quarter => {
      // Handle both "Q1-2025" and "2025-Q1" formats
      let firebasePeriod = quarter.quarter;
      if (quarter.quarter.match(/^Q\d-\d{4}$/)) {
        // Convert Q1-2025 to 2025-Q1
        firebasePeriod = quarter.quarter.replace(/^Q(\d)-(\d{4})$/, '$2-Q$1');
      }
      
      return {
        id: firebasePeriod,
        label: quarter.quarter,
        dateValue: quarter.dateValue,
        endDate: quarter.end_date
      };
    });
  }, []);

  // Add some additional quarters if needed
  const additionalQuarters = [
    { id: '2024-Q1', label: 'Q1-2024', dateValue: '2024-03-31', endDate: '2024-03-31' },
    { id: '2024-Q2', label: 'Q2-2024', dateValue: '2024-06-30', endDate: '2024-06-30' },
    { id: '2024-Q3', label: 'Q3-2024', dateValue: '2024-09-30', endDate: '2024-09-30' },
    { id: '2024-Q4', label: 'Q4-2024', dateValue: '2024-12-31', endDate: '2024-12-31' },
    { id: '2025-Q1', label: 'Q1-2025', dateValue: '2025-03-31', endDate: '2025-03-31' },
    { id: '2025-Q2', label: 'Q2-2025', dateValue: '2025-06-30', endDate: '2025-06-30' },
    { id: '2025-Q3', label: 'Q3-2025', dateValue: '2025-09-30', endDate: '2025-09-30' },
    { id: '2025-Q4', label: 'Q4-2025', dateValue: '2025-12-31', endDate: '2025-12-31' }
  ];

  // Combine and deduplicate quarters
  const allAvailableQuarters = useMemo(() => {
    const combined = [...quarters, ...additionalQuarters];
    const unique = combined.filter((quarter, index, self) => 
      index === self.findIndex(q => q.id === quarter.id)
    );
    
    // Sort by date (newest first)
    return unique.sort((a, b) => new Date(b.dateValue) - new Date(a.dateValue));
  }, [quarters]);

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <Calendar size={16} className="text-gray-500" />
        <select
          value={selectedPeriod}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="pl-2 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          {allAvailableQuarters.map(quarter => (
            <option key={quarter.id} value={quarter.id}>
              {quarter.label} ({quarter.endDate})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default PeriodSelector;