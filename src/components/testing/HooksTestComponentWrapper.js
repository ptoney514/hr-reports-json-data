import React from 'react';
import { DashboardProvider } from '../../contexts/DashboardContext';
import { DataSourceProvider } from '../../contexts/DataSourceContext';
import HooksTestComponent from './HooksTestComponent';

// Wrapper component that provides required contexts
const HooksTestComponentWrapper = () => {
  return (
    <DataSourceProvider>
      <DashboardProvider>
        <HooksTestComponent />
      </DashboardProvider>
    </DataSourceProvider>
  );
};

export default HooksTestComponentWrapper;