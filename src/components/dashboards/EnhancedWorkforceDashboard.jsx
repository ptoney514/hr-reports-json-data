import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Cloud, Upload, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuarterFilter from '../ui/QuarterFilter';
import { 
  QUARTER_DATES, 
  calculateQuarterMetrics, 
  calculateDivisionBreakdown, 
  calculateLocationBreakdown,
  getPreviousQuarter,
  generateSampleData 
} from '../../utils/quarterlyDataProcessor';
import firebaseService from '../../services/FirebaseService';
import useFirebaseWorkforceData from '../../hooks/useFirebaseWorkforceData';

const EnhancedWorkforceDashboard = () => {
  const navigate = useNavigate();
  
  // State management for quarterly data
  const [selectedQuarter, setSelectedQuarter] = useState('Q1-2025');
  const [quarterlyData, setQuarterlyData] = useState(null);
  
  // Firebase data integration
  const { 
    data: firebaseData, 
    loading: firebaseLoading, 
    error: firebaseError,
    isRealTimeActive 
  } = useFirebaseWorkforceData({
    reportingPeriod: selectedQuarter || 'Q1-2025'
  });
  const [headcountData, setHeadcountData] = useState({
    total: { value: 0, change: null, subtitle: "from previous quarter", changeType: "percentage" },
    faculty: { value: 0, change: null, subtitle: "change", changeType: "percentage", indicator: "green" },
    staff: { value: 0, change: null, subtitle: "change", changeType: "percentage", indicator: "yellow" },
    starters: { value: 0, change: null, subtitle: "new hires", changeType: null, indicator: "teal" },
    leavers: { value: 0, change: null, subtitle: "departures", changeType: null, indicator: "blue" }
  });

  // Data source state
  const [dataSource, setDataSource] = useState('sample'); // 'sample', 'firebase'






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

  // Calculate dynamic data based on selected quarter
  const divisionsData = dataSource === 'firebase' && firebaseData
    ? firebaseData.charts?.topDivisions || []
    : quarterlyData && selectedQuarter 
      ? calculateDivisionBreakdown(quarterlyData[selectedQuarter] || [])
      : [];

  const locationData = dataSource === 'firebase' && firebaseData
    ? firebaseData.charts?.locationDistribution || []
    : quarterlyData && selectedQuarter 
      ? calculateLocationBreakdown(quarterlyData[selectedQuarter] || [])
      : [];

  // Calculate trend data across all quarters
  const trendData = dataSource === 'firebase' && firebaseData
    ? firebaseData.charts?.historicalTrends || []
    : quarterlyData 
      ? QUARTER_DATES.map(quarter => {
          const quarterInfo = quarterlyData[quarter.value] || [];
          const metrics = calculateQuarterMetrics(quarterInfo);
          return {
            quarter: quarter.quarter,
            total: metrics.total.value,
            faculty: metrics.faculty.value,
            staff: metrics.staff.value
          };
        })
      : [];

  // Handle quarter change
  const handleQuarterChange = (newQuarter) => {
    setSelectedQuarter(newQuarter);
  };

  // Get available quarters - primarily use default QUARTER_DATES
  const getAvailableQuarters = () => {
    // Always use the default QUARTER_DATES for consistency
    return QUARTER_DATES;
  };


  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">Enhanced Workforce Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="w-64">
              <QuarterFilter 
                selectedQuarter={selectedQuarter}
                onQuarterChange={handleQuarterChange}
                availableQuarters={getAvailableQuarters()}
              />
            </div>
          </div>
        </div>
        
        {/* Data Source Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
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
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {/* Total Headcount */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-blue-500 mb-2">Total Headcount</h2>
            <div className="flex items-end gap-2 mb-1">
              <p className="text-4xl font-bold text-black">{(headcountData.total?.value || 0).toLocaleString()}</p>
              <span className="text-sm font-medium text-red-500 mb-1">
                {headcountData.total?.change || 0}%
              </span>
            </div>
            <p className="text-xs text-gray-500">{headcountData.total?.subtitle || 'from previous quarter'}</p>
          </div>
          
          {/* Faculty */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-blue-500 mb-2">Faculty</h2>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-4xl font-bold text-black">{headcountData.faculty?.value || 0}</p>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <p className="text-xs text-gray-500">{headcountData.faculty?.change || 0}% {headcountData.faculty?.subtitle || 'change'}</p>
          </div>
          
          {/* Staff */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-blue-500 mb-2">Staff</h2>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-4xl font-bold text-black">{(headcountData.staff?.value || 0).toLocaleString()}</p>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            </div>
            <p className="text-xs text-gray-500">{headcountData.staff?.change || 0}% {headcountData.staff?.subtitle || 'change'}</p>
          </div>

          {/* Starters */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-blue-500 mb-2">Starters</h2>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-teal-500"></div>
              <p className="text-4xl font-bold text-black">{headcountData.starters?.value || 0}</p>
            </div>
            <p className="text-xs text-gray-500">{headcountData.starters?.subtitle || 'new hires'}</p>
          </div>

          {/* Leavers */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-blue-500 mb-2">Leavers</h2>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <p className="text-4xl font-bold text-black">{headcountData.leavers?.value || 0}</p>
            </div>
            <p className="text-xs text-gray-500">{headcountData.leavers?.subtitle || 'departures'}</p>
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top 10 Benefit Eligible Headcount by Division */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Top 10 Benefit Eligible Headcount by Division</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={divisionsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="division" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="faculty" stackId="division" fill="#1e40af" name="(BE) Faculty" />
                <Bar dataKey="staff" stackId="division" fill="#3b82f6" name="(BE) Staff" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Headcount, Starters and Leavers Trend */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Headcount, Faculty, and Staff Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#1e40af" 
                  strokeWidth={2}
                  dot={{ fill: '#1e40af', strokeWidth: 2, r: 4 }}
                  name="Total Benefit Eligible Headcount"
                />
                <Line 
                  type="monotone" 
                  dataKey="faculty" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  name="Faculty"
                />
                <Line 
                  type="monotone" 
                  dataKey="staff" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="Staff"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Benefit Eligible Employees by Location */}
        <div className="mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-blue-600">Benefit Eligible Employees by Location</h3>
            <div className="space-y-6">
              {locationData.map((location, index) => (
                <div key={location.location} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{location.location}</span>
                    <span className="font-bold text-gray-900">{(location.count || 0).toLocaleString()}</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div 
                        className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2" 
                        style={{ width: `${location.percentage || 0}%` }}
                      >
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {location.percentage || 0}% of total workforce
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedWorkforceDashboard;