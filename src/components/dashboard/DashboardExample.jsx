import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import DashboardTemplate from './DashboardTemplate';
import MetricsGrid from './MetricsGrid';
import ChartContainer, { ChartGrid } from './ChartContainer';
import useDashboardExport from '../../hooks/useDashboardExport';
import { QUARTER_DATES } from '../../utils/quarterlyDataProcessor';

/**
 * Example Dashboard using the new reusable template pattern
 * 
 * This demonstrates how to use the new reusable components to create
 * a clean, maintainable, and print-optimized dashboard with minimal code.
 */
const DashboardExample = () => {
  // Dashboard state
  const [filters, setFilters] = useState({
    reportingPeriod: 'Q1-2025',
    location: 'all',
    division: 'all',
    employeeType: 'all'
  });

  // Sample data
  const metricsData = [
    {
      id: 'total-employees',
      title: 'Total Employees',
      value: 4249,
      change: 2.6,
      changeType: 'percentage',
      subtitle: 'from previous quarter',
      trend: 'positive'
    },
    {
      id: 'faculty',
      title: 'Faculty',
      value: 684,
      change: -0.73,
      changeType: 'percentage',
      subtitle: 'faculty members',
      trend: 'negative'
    },
    {
      id: 'staff',
      title: 'Staff',
      value: 1439,
      change: -0.14,
      changeType: 'percentage',
      subtitle: 'staff members',
      trend: 'negative'
    },
    {
      id: 'new-hires',
      title: 'New Hires',
      value: 228,
      subtitle: 'this quarter',
      trend: 'neutral'
    }
  ];

  const chartData = [
    { quarter: 'Q1 2024', employees: 4139 },
    { quarter: 'Q2 2024', employees: 4162 },
    { quarter: 'Q3 2024', employees: 4328 },
    { quarter: 'Q4 2024', employees: 4131 },
    { quarter: 'Q1 2025', employees: 4249 }
  ];

  // Filter options
  const filterOptions = {
    quarters: QUARTER_DATES,
    location: [
      { value: 'all', label: 'All Locations' },
      { value: 'omaha', label: 'Omaha Campus' },
      { value: 'phoenix', label: 'Phoenix Campus' }
    ],
    division: [
      { value: 'all', label: 'All Divisions' },
      { value: 'medicine', label: 'School of Medicine' },
      { value: 'arts-sciences', label: 'Arts & Sciences' },
      { value: 'pharmacy', label: 'Pharmacy & Health Professions' }
    ],
    employeeType: [
      { value: 'all', label: 'All Types' },
      { value: 'faculty', label: 'Faculty' },
      { value: 'staff', label: 'Staff' }
    ]
  };

  // Export configuration
  const exportConfig = {
    dashboardTitle: 'Example Dashboard',
    data: { chartData, metrics: metricsData },
    filters,
    chartIds: ['example-headcount-chart'],
    metrics: metricsData,
    executiveSummary: 'This is an example dashboard demonstrating the new reusable template pattern with professional PDF export, print optimization, and consistent component styling.'
  };

  // Use the export hook
  const { handleExport } = useDashboardExport(exportConfig);

  // Filter change handler
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <DashboardTemplate
      title="Example Dashboard"
      subtitle="Demonstrating the new reusable template pattern"
      filters={filters}
      onFilterChange={handleFilterChange}
      onExport={handleExport}
      filterOptions={filterOptions}
      showFilters={true}
      showExport={true}
    >
      {/* Metrics Section using MetricsGrid */}
      <MetricsGrid 
        metrics={metricsData}
        layout="auto"
      />

      {/* Charts Section using ChartGrid and ChartContainer */}
      <ChartGrid columns="auto">
        <ChartContainer
          id="example-headcount-chart"
          title="Historical Headcount Trend"
          subtitle="Employee growth over time"
          dataSource="sample"
          height="300px"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="employees" fill="#1e40af" name="Employees" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer
          title="Sample Chart 2"
          subtitle="Another chart example"
          isEmpty={true}
          height="300px"
        />
      </ChartGrid>

      {/* Executive Summary */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 dashboard-section page-break-inside-avoid">
        <h2 className="text-lg font-bold text-blue-700 mb-3">Executive Summary</h2>
        <p className="text-gray-700 text-sm mb-3">
          This example dashboard demonstrates the new reusable template pattern that provides:
        </p>
        <ul className="text-gray-700 text-sm space-y-1 ml-4">
          <li>• Professional PDF export with chart capture</li>
          <li>• Print-optimized layouts without navigation</li>
          <li>• Consistent component styling and spacing</li>
          <li>• Reusable template for other dashboards</li>
          <li>• Improved code maintainability and quality</li>
        </ul>
      </div>
    </DashboardTemplate>
  );
};

export default DashboardExample;