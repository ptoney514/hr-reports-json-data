import React, { createContext, useContext, useState } from 'react';

// Much simpler context - just tracks current reporting date
const DataSourceContext = createContext();

export const DataSourceProvider = ({ children }) => {
  const [currentReportingDate, setCurrentReportingDate] = useState('2025-06-30');
  const [dataSource] = useState('json'); // Always JSON now
  
  const availableDates = [
    { value: '2025-06-30', label: 'Q2 2025', quarter: 'Q2-2025' },
    { value: '2025-03-31', label: 'Q1 2025', quarter: 'Q1-2025' },
    { value: '2024-12-31', label: 'Q4 2024', quarter: 'Q4-2024' },
    { value: '2024-09-30', label: 'Q3 2024', quarter: 'Q3-2024' },
    { value: '2024-06-30', label: 'Q2 2024', quarter: 'Q2-2024' }
  ];

  const value = {
    // Current state
    currentReportingDate,
    dataSource,
    availableDates,
    
    // Actions
    setReportingDate: setCurrentReportingDate,
    
    // Helper methods
    getCurrentQuarter: () => {
      const current = availableDates.find(d => d.value === currentReportingDate);
      return current?.quarter || 'Q2-2025';
    },
    
    getPreviousDate: () => {
      const currentIndex = availableDates.findIndex(d => d.value === currentReportingDate);
      return currentIndex < availableDates.length - 1 
        ? availableDates[currentIndex + 1].value 
        : null;
    },
    
    getYearAgoDate: () => {
      const currentDate = new Date(currentReportingDate);
      return availableDates.find(d => {
        const compareDate = new Date(d.value);
        const daysDiff = Math.abs(currentDate - compareDate) / (1000 * 60 * 60 * 24);
        return daysDiff >= 360 && daysDiff <= 370;
      })?.value || null;
    }
  };

  return (
    <DataSourceContext.Provider value={value}>
      {children}
    </DataSourceContext.Provider>
  );
};

export const useDataSource = () => {
  const context = useContext(DataSourceContext);
  if (!context) {
    throw new Error('useDataSource must be used within a DataSourceProvider');
  }
  return context;
};

export default DataSourceContext;