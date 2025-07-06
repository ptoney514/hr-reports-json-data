import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import DashboardHeader from '../ui/DashboardHeader';
import ErrorBoundary from '../ui/ErrorBoundary';

const CombinedWorkforceDashboard = () => {
  // State for filters and actions
  const [filters, setFilters] = useState({
    reportingPeriod: 'Q2-2025',
    location: 'all',
    division: 'all',
    employeeType: 'all'
  });

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // In a real app, this would trigger data refetch
    console.log('Filters updated:', { ...filters, ...newFilters });
  };

  // Handle export functionality
  const handleExport = async (exportType) => {
    console.log('Exporting data:', exportType, 'with filters:', filters);
    
    const dashboardData = {
      title: 'Combined Workforce Analytics',
      data: {
        headcount: headcountData,
        history: historyData,
        startersLeavers: startersLeaversData,
        topDivisions: topDivisionsData,
        turnoverReasons: turnoverReasons
      },
      filters: filters,
      generatedAt: new Date().toLocaleString()
    };
    
    try {
      switch (exportType) {
        case 'pdf':
          // For now, just create a simple PDF
          window.print();
          break;
        case 'excel':
          // Create Excel export
          const { DataExporter } = await import('../../utils/exportUtils');
          const exporter = new DataExporter();
          const excelData = [
            { Metric: 'Total Headcount', Value: headcountData.total },
            { Metric: 'Faculty', Value: headcountData.faculty },
            { Metric: 'Staff', Value: headcountData.staff },
            { Metric: 'New Hires', Value: 228 },
            { Metric: 'Departures', Value: 174 }
          ];
          exporter.exportToExcel(excelData, 'combined-workforce-analytics.xlsx');
          break;
        case 'csv':
          // Create CSV export
          const { DataExporter: CSVExporter } = await import('../../utils/exportUtils');
          const csvExporter = new CSVExporter();
          const csvData = [
            { Metric: 'Total Headcount', Value: headcountData.total },
            { Metric: 'Faculty', Value: headcountData.faculty },
            { Metric: 'Staff', Value: headcountData.staff },
            { Metric: 'New Hires', Value: 228 },
            { Metric: 'Departures', Value: 174 }
          ];
          csvExporter.exportToCSV(csvData, 'combined-workforce-analytics.csv');
          break;
        case 'print':
          window.print();
          break;
        default:
          console.log('Unknown export type:', exportType);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed: ' + error.message);
    }
  };

  // Available filter options for the dashboard
  const availableFilters = {
    reportingPeriod: [
      { value: 'Q3-2025', label: 'Q3 2025' },
      { value: 'Q2-2025', label: 'Q2 2025' },
      { value: 'Q1-2025', label: 'Q1 2025' },
      { value: 'Q4-2024', label: 'Q4 2024' },
      { value: 'Q3-2024', label: 'Q3 2024' }
    ],
    location: [
      { value: 'all', label: 'All Locations' },
      { value: 'omaha', label: 'Omaha Campus' },
      { value: 'phoenix', label: 'Phoenix Campus' }
    ],
    division: [
      { value: 'all', label: 'All Divisions' },
      { value: 'medicine', label: 'School of Medicine' },
      { value: 'arts-sciences', label: 'Arts & Sciences' },
      { value: 'pharmacy', label: 'Pharmacy & Health Professions' },
      { value: 'dentistry', label: 'Dentistry' },
      { value: 'business', label: 'Business' }
    ],
    employeeType: [
      { value: 'all', label: 'All Types' },
      { value: 'faculty', label: 'Faculty' },
      { value: 'staff', label: 'Staff' }
    ]
  };
  const headcountData = {
    total: 4249,
    faculty: 684,
    staff: 1439,
    totalChange: -5.2,
    facultyChange: -0.73,
    staffChange: -0.14
  };

  const historyData = [
    { quarter: 'Q2-24', employees: 4162 },
    { quarter: 'Q3-24', employees: 4328 },
    { quarter: 'Q4-24', employees: 4131 },
    { quarter: 'Q1-24', employees: 4139 },
    { quarter: 'Q1-25', employees: 4249 },
  ];

  const startersLeaversData = [
    { month: 'Q2-24', starters: 45, leavers: 38 },
    { month: 'Q3-24', starters: 67, leavers: 42 },
    { month: 'Q4-24', starters: 52, leavers: 48 },
    { month: 'Q1-24', starters: 38, leavers: 35 },
    { month: 'Q1-25', starters: 68, leavers: 41 },
  ];

  const topDivisionsData = [
    { name: 'School of Medicine', faculty: 106, staff: 177, total: 283 },
    { name: 'Arts & Sciences', faculty: 227, staff: 37, total: 264 },
    { name: 'Medicine', faculty: 96, staff: 168, total: 264 },
    { name: 'Pharmacy & Health Professions', faculty: 108, staff: 79, total: 187 },
    { name: 'Dentistry', faculty: 70, staff: 79, total: 149 },
  ];

  const turnoverReasons = [
    { name: 'Career Advancement', value: 38 },
    { name: 'Compensation', value: 21 },
    { name: 'Work-Life Balance', value: 17 },
    { name: 'Retirement', value: 12 },
    { name: 'Relocation', value: 8 },
    { name: 'Other', value: 4 },
  ];

  const COLORS = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed'];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header with functional buttons */}
          <DashboardHeader 
            title="Combined Workforce Analytics"
            subtitle="Q2 2025 | Cached (Firebase) | Last sync: 9:52:35 AM"
            filters={filters}
            availableFilters={availableFilters}
            onFilterChange={handleFilterChange}
            onExport={handleExport}
            showFilters={true}
            showDateFilter={true}
            showExport={true}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border col-span-2">
              <h2 className="text-sm font-medium text-blue-700 mb-2">Total Headcount</h2>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">{headcountData.total.toLocaleString()}</span>
                <span className="text-red-500 text-sm">{headcountData.totalChange}%</span>
              </div>
              <p className="text-gray-500 text-sm">from previous quarter</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h2 className="text-sm font-medium text-blue-700 mb-2">Faculty</h2>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{headcountData.faculty}</span>
                <ArrowUpCircle size={16} className="text-green-500" />
              </div>
              <p className="text-gray-500 text-sm">{headcountData.facultyChange}% change</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h2 className="text-sm font-medium text-blue-700 mb-2">Staff</h2>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{headcountData.staff.toLocaleString()}</span>
                <ArrowDownCircle size={16} className="text-yellow-500" />
              </div>
              <p className="text-gray-500 text-sm">{headcountData.staffChange}% change</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h2 className="text-sm font-medium text-blue-700 mb-2">New Hires</h2>
              <div className="text-2xl font-bold">228</div>
              <p className="text-gray-500 text-sm">this quarter</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h2 className="text-sm font-medium text-blue-700 mb-2">Departures</h2>
              <div className="text-2xl font-bold">174</div>
              <p className="text-gray-500 text-sm">this quarter</p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h2 className="text-lg font-medium text-blue-700 mb-4">Historical Headcount Trend</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="employees" fill="#0088FE" name="Headcount" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h2 className="text-lg font-medium text-blue-700 mb-4">Starters vs Leavers</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={startersLeaversData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="starters" stroke="#14b8a6" strokeWidth={3} name="Starters" />
                  <Line type="monotone" dataKey="leavers" stroke="#1e3a8a" strokeWidth={3} name="Leavers" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h2 className="text-lg font-medium text-blue-700 mb-4">Top Divisions by Headcount</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart layout="vertical" data={topDivisionsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="faculty" stackId="a" fill="#1e40af" name="Faculty" />
                  <Bar dataKey="staff" stackId="a" fill="#3b82f6" name="Staff" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h2 className="text-lg font-medium text-blue-700 mb-4">Turnover Reasons</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={turnoverReasons}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {turnoverReasons.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-lg font-bold text-blue-700 mb-3">Executive Summary</h2>
            <p className="text-gray-700 text-sm mb-3">
              The current workforce of 4,249 employees represents a 5.2% decrease from the previous quarter, primarily due to seasonal patterns. Faculty headcount remained stable at 684 (-0.73%), while staff shows minimal change at 1,439 (-0.14%).
            </p>
            <p className="text-gray-700 text-sm">
              Positive momentum with 228 new hires versus 174 departures resulted in a net gain of 54 employees. Career advancement (38%) and compensation (21%) remain the top reasons for voluntary turnover.
            </p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CombinedWorkforceDashboard; 