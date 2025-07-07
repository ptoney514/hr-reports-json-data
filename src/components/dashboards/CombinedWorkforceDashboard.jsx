import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Cloud, Upload, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuarterFilter from '../ui/QuarterFilter';
import ExportButton from '../ui/ExportButton';
import ErrorBoundary from '../ui/ErrorBoundary';
import { 
  QUARTER_DATES, 
  calculateQuarterMetrics, 
  getPreviousQuarter,
  generateSampleData 
} from '../../utils/quarterlyDataProcessor';
import useFirebaseWorkforceData from '../../hooks/useFirebaseWorkforceData';

const CombinedWorkforceDashboard = () => {
  const navigate = useNavigate();
  
  // State for filters and actions
  const [filters, setFilters] = useState({
    reportingPeriod: 'Q2-2025',
    location: 'all',
    division: 'all',
    employeeType: 'all'
  });
  
  // Quarter filter state (matches Enhanced Workforce Dashboard)
  const [selectedQuarter, setSelectedQuarter] = useState('Q2-2025');
  
  // Firebase data integration
  const { 
    data: firebaseData, 
    loading: firebaseLoading, 
    error: firebaseError,
    isRealTimeActive 
  } = useFirebaseWorkforceData({
    reportingPeriod: selectedQuarter || 'Q2-2025'
  });
  
  // Dynamic headcount data state
  const [headcountData, setHeadcountData] = useState({
    total: { value: 0, change: null, subtitle: "from previous quarter", changeType: "percentage" },
    faculty: { value: 0, change: null, subtitle: "change", changeType: "percentage", indicator: "green" },
    staff: { value: 0, change: null, subtitle: "change", changeType: "percentage", indicator: "yellow" },
    starters: { value: 0, change: null, subtitle: "new hires", changeType: null, indicator: "teal" },
    leavers: { value: 0, change: null, subtitle: "departures", changeType: null, indicator: "blue" }
  });
  
  // Data source state
  const [dataSource, setDataSource] = useState('sample'); // 'sample', 'firebase'
  const [quarterlyData, setQuarterlyData] = useState(null);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // In a real app, this would trigger data refetch
    console.log('Filters updated:', { ...filters, ...newFilters });
  };
  
  // Handle quarter changes (matches Enhanced Workforce Dashboard)
  const handleQuarterChange = (newQuarter) => {
    setSelectedQuarter(newQuarter);
    // Also update the reportingPeriod in filters for consistency
    setFilters(prev => ({ ...prev, reportingPeriod: newQuarter }));
    console.log('Quarter changed to:', newQuarter);
  };

  // Navigate to Excel Integration for data upload
  const navigateToUpload = () => {
    navigate('/excel-integration');
  };

  // Handle Firebase data integration
  useEffect(() => {
    if (firebaseData && Object.keys(firebaseData).length > 0) {
      console.log('Firebase data loaded:', firebaseData);
      setDataSource('firebase');
    } else {
      setDataSource('sample');
    }
  }, [firebaseData]);

  // Initialize with sample data only if no Firebase data
  useEffect(() => {
    if (!firebaseData || Object.keys(firebaseData).length === 0) {
      console.log('No Firebase data found, using sample data');
      // Generate sample data for demonstration
      const sampleData = generateSampleData();
      
      // Group by quarter
      const groupedData = {};
      sampleData.forEach(record => {
        const quarter = record.Quarter_End_Date;
        if (!groupedData[quarter]) {
          groupedData[quarter] = [];
        }
        groupedData[quarter].push(record);
      });
      
      setQuarterlyData(groupedData);
      setDataSource('sample');
    }
  }, [firebaseData]);

  // Update metrics when quarter or data changes
  useEffect(() => {
    if (dataSource === 'firebase' && firebaseData) {
      // Use Firebase data directly for metrics
      console.log('Using Firebase data for metrics');
      const metrics = {
        total: { value: firebaseData.summary?.totalEmployees || 0, change: firebaseData.summary?.employeeChange || 0, subtitle: "from previous quarter", changeType: "percentage" },
        faculty: { value: firebaseData.summary?.faculty || 0, change: firebaseData.summary?.facultyChange || 0, subtitle: "change", changeType: "percentage", indicator: "green" },
        staff: { value: firebaseData.summary?.staff || 0, change: firebaseData.summary?.staffChange || 0, subtitle: "change", changeType: "percentage", indicator: "yellow" },
        starters: { value: (firebaseData.metrics?.recentHires?.faculty || 0) + (firebaseData.metrics?.recentHires?.staff || 0), change: null, subtitle: "new hires", changeType: null, indicator: "teal" },
        leavers: { value: Math.floor((firebaseData.summary?.totalEmployees || 0) * 0.05), change: null, subtitle: "departures", changeType: null, indicator: "blue" }
      };
      setHeadcountData(metrics);
    } else if (quarterlyData && selectedQuarter) {
      console.log('Selected quarter:', selectedQuarter);
      console.log('Available quarters in data:', Object.keys(quarterlyData));
      
      const currentQuarterData = quarterlyData[selectedQuarter] || [];
      const previousQuarter = getPreviousQuarter(selectedQuarter);
      const previousQuarterData = previousQuarter ? quarterlyData[previousQuarter] : null;
      
      console.log('Current quarter data:', currentQuarterData.length, 'records');
      
      const metrics = calculateQuarterMetrics(currentQuarterData, previousQuarterData);
      setHeadcountData(metrics);
    }
  }, [quarterlyData, selectedQuarter, dataSource, firebaseData]);

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
          {/* Header with Title Above Filters */}
          <div className="mb-6">
            {/* Title Section */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-blue-700">Combined Workforce Analytics</h1>
            </div>
            
            {/* Data Source Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Data Source</h2>
                  <p className="text-sm text-gray-600">
                    {dataSource === 'firebase' && (
                      <span className="flex items-center gap-2">
                        <Cloud size={16} className="text-purple-500" />
                        Using Firebase data from centralized upload
                      </span>
                    )}
                    {dataSource === 'sample' && 'Using sample data for demonstration'}
                    {firebaseLoading && ' (Loading from Firebase...)'}
                    {firebaseError && ` (Firebase error: ${firebaseError.message})`}
                  </p>
                </div>
                <button
                  onClick={navigateToUpload}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload size={16} />
                  Upload Data
                  <ExternalLink size={14} />
                </button>
              </div>
              
              {dataSource === 'sample' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    <strong>No uploaded data found.</strong> Click "Upload Data" to go to the Excel Integration page and upload your quarterly workforce data.
                  </p>
                </div>
              )}
              
              {dataSource === 'firebase' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700">
                    <strong>✓ Data loaded from Firebase.</strong> Dashboard showing real-time data from your uploaded files.
                  </p>
                </div>
              )}
            </div>
            
            {/* Filters and Export Row */}
            <div className="flex items-end gap-4">
              <div className="w-64">
                <QuarterFilter 
                  selectedQuarter={selectedQuarter}
                  onQuarterChange={handleQuarterChange}
                  availableQuarters={QUARTER_DATES}
                />
              </div>
              <div className="w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <select
                  value={filters.location || 'all'}
                  onChange={(e) => handleFilterChange({ location: e.target.value })}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {availableFilters.location.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Division
                </label>
                <select
                  value={filters.division || 'all'}
                  onChange={(e) => handleFilterChange({ division: e.target.value })}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {availableFilters.division.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Type
                </label>
                <select
                  value={filters.employeeType || 'all'}
                  onChange={(e) => handleFilterChange({ employeeType: e.target.value })}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {availableFilters.employeeType.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <ExportButton onExport={handleExport} />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border col-span-2">
              <h2 className="text-sm font-medium text-blue-700 mb-2">Total Headcount</h2>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">{(headcountData.total?.value || 0).toLocaleString()}</span>
                <span className="text-red-500 text-sm">{headcountData.total?.change || 0}%</span>
              </div>
              <p className="text-gray-500 text-sm">from previous quarter</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h2 className="text-sm font-medium text-blue-700 mb-2">Faculty</h2>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{headcountData.faculty?.value || 0}</span>
                <ArrowUpCircle size={16} className="text-green-500" />
              </div>
              <p className="text-gray-500 text-sm">{headcountData.faculty?.change || 0}% change</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h2 className="text-sm font-medium text-blue-700 mb-2">Staff</h2>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{(headcountData.staff?.value || 0).toLocaleString()}</span>
                <ArrowDownCircle size={16} className="text-yellow-500" />
              </div>
              <p className="text-gray-500 text-sm">{headcountData.staff?.change || 0}% change</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h2 className="text-sm font-medium text-blue-700 mb-2">New Hires</h2>
              <div className="text-2xl font-bold">{headcountData.starters?.value || 0}</div>
              <p className="text-gray-500 text-sm">this quarter</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h2 className="text-sm font-medium text-blue-700 mb-2">Departures</h2>
              <div className="text-2xl font-bold">{headcountData.leavers?.value || 0}</div>
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