import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { X, Cloud } from 'lucide-react';
import QuarterFilter from '../ui/QuarterFilter';
import FileUploader from '../ui/FileUploader';
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
  const [isUsingUploadedData, setIsUsingUploadedData] = useState(false);
  const [dataSource, setDataSource] = useState('sample'); // 'sample', 'uploaded', 'firebase'

  // Simple data processing - direct field renaming
  const processAggregateData = (rawData) => {
    return rawData.map(row => ({
      Quarter_End_Date: row.Quarter_End_Date,
      Division: row.Division?.trim() || '',
      Location: row.Location?.trim() || '',
      BE_Faculty_Headcount: parseInt(row.BE_Faculty_Headcount, 10) || 0,
      BE_Staff_Headcount: parseInt(row.BE_Staff_Headcount, 10) || 0,
      NBE_Faculty_Headcount: parseInt(row.NBE_Faculty_Headcount, 10) || 0,
      NBE_Staff_Headcount: parseInt(row.NBE_Staff_Headcount, 10) || 0,
      NBE_Student_Worker_Headcount: parseInt(row.NBE_Student_Worker_Headcount, 10) || 0,
      Total_Headcount: parseInt(row.Total_Headcount, 10) || 0,
      BE_New_Hires: parseInt(row.BE_New_Hires, 10) || 0,
      BE_Departures: parseInt(row.BE_Departures, 10) || 0,
      NBE_New_Hires: parseInt(row.NBE_New_Hires, 10) || 0,
      NBE_Departures: parseInt(row.NBE_Departures, 10) || 0
    }));
  };

  // Transform quarterly data to Firebase aggregate format
  const transformToFirebaseFormat = (quarter, records) => {
    // Aggregate totals across all records for this quarter
    const totals = records.reduce((acc, record) => {
      acc.totalEmployees += record.Total_Headcount || 0;
      acc.faculty += (record.BE_Faculty_Headcount || 0) + (record.NBE_Faculty_Headcount || 0);
      acc.staff += (record.BE_Staff_Headcount || 0) + (record.NBE_Staff_Headcount || 0);
      acc.students += record.NBE_Student_Worker_Headcount || 0;
      acc.newHires += (record.BE_New_Hires || 0) + (record.NBE_New_Hires || 0);
      acc.departures += (record.BE_Departures || 0) + (record.NBE_Departures || 0);
      return acc;
    }, {
      totalEmployees: 0,
      faculty: 0,
      staff: 0,
      students: 0,
      newHires: 0,
      departures: 0
    });

    // Group by location and department
    const byLocation = {};
    const byDepartment = {};
    
    records.forEach(record => {
      // Location grouping
      const location = record.Location || 'Unknown Location';
      if (!byLocation[location]) byLocation[location] = 0;
      byLocation[location] += record.Total_Headcount || 0;
      
      // Department grouping (using Division as department)
      const department = record.Division || 'Unknown Division';
      if (!byDepartment[department]) byDepartment[department] = 0;
      byDepartment[department] += record.Total_Headcount || 0;
    });

    // Return Firebase-compatible aggregate format
    return {
      period: quarter,
      totalEmployees: totals.totalEmployees,
      demographics: {
        faculty: totals.faculty,
        staff: totals.staff,
        students: totals.students
      },
      byLocation,
      byDepartment,
      trends: {
        quarterlyGrowth: 2.5, // Estimated growth rate
        newHires: totals.newHires,
        departures: totals.departures,
        netChange: totals.newHires - totals.departures
      },
      headcountChange: totals.newHires - totals.departures,
      version: '1.0',
      dataSource: 'uploaded_csv'
    };
  };

  // File upload handler for FileUploader component
  const handleDataImported = useCallback(async (importedData) => {
    console.log('Data imported:', importedData);

    try {
      // Process data using the same format Enhanced Workforce Dashboard expects
      const processedData = processAggregateData(importedData.data);
      
      // Group by quarter and normalize quarter format
      const groupedData = {};
      processedData.forEach(record => {
        let quarter = record.Quarter_End_Date;
        
        // Enhanced date format conversion to handle various formats
        if (quarter && quarter.match(/\d{4}-\d{2}-\d{2}/)) {
          // Convert "2024-06-30" to "Q2-2024" format
          const date = new Date(quarter);
          const year = date.getFullYear();
          const month = date.getMonth() + 1; // getMonth() is 0-indexed
          const quarterNum = Math.ceil(month / 3);
          quarter = `Q${quarterNum}-${year}`;
          console.log(`Converted date ${record.Quarter_End_Date} to quarter ${quarter}`);
        }
        
        if (!groupedData[quarter]) {
          groupedData[quarter] = [];
        }
        groupedData[quarter].push(record);
      });

      console.log('Grouped data by quarters:', Object.keys(groupedData));

      // Save to Firebase
      const quarterCount = Object.keys(groupedData).length;
      let firebaseSuccessCount = 0;
      let firebaseErrors = [];
      
      for (const [quarter, records] of Object.entries(groupedData)) {
        try {
          // Transform quarterly data to Firebase aggregate format
          const aggregateMetrics = transformToFirebaseFormat(quarter, records);
          
          // Convert quarter format to Firebase period (e.g., "Q2-2024" -> "2024-Q2")
          let period = quarter;
          
          // Handle various quarter formats and convert to Firebase format
          if (quarter.match(/Q(\d)-(\d{4})/)) {
            // "Q2-2024" -> "2024-Q2"
            period = quarter.replace(/Q(\d)-(\d{4})/, '$2-Q$1');
          }
          
          console.log(`Converting quarter ${quarter} to Firebase period: ${period}`);
          
          await firebaseService.setWorkforceMetrics(period, aggregateMetrics);
          console.log(`Saved workforce metrics to Firebase for period: ${period}`);
          firebaseSuccessCount++;
        } catch (error) {
          console.error(`Failed to save Firebase data for quarter ${quarter}:`, error);
          firebaseErrors.push(`${quarter}: ${error.message}`);
        }
      }
      
      console.log(`Upload completed: ${processedData.length} records, ${firebaseSuccessCount} quarters saved to Firebase`);
      if (firebaseErrors.length > 0) {
        console.warn('Firebase save errors:', firebaseErrors);
      }
      
      setQuarterlyData(groupedData);
      setIsUsingUploadedData(true);
      setDataSource('uploaded');

      // Auto-select the first uploaded quarter if none is selected or if current selection doesn't exist
      const uploadedQuarters = Object.keys(groupedData);
      if (uploadedQuarters.length > 0) {
        const sortedQuarters = uploadedQuarters.sort((a, b) => {
          const aMatch = a.match(/Q(\d)-(\d{4})/);
          const bMatch = b.match(/Q(\d)-(\d{4})/);
          
          if (aMatch && bMatch) {
            const [, aQ, aY] = aMatch;
            const [, bQ, bY] = bMatch;
            
            if (aY !== bY) return parseInt(aY) - parseInt(bY);
            return parseInt(aQ) - parseInt(bQ);
          }
          
          return a.localeCompare(b);
        });
        
        // Select the most recent quarter from uploaded data
        const mostRecentQuarter = sortedQuarters[sortedQuarters.length - 1];
        if (!selectedQuarter || !groupedData[selectedQuarter]) {
          setSelectedQuarter(mostRecentQuarter);
          console.log(`Auto-selected quarter: ${mostRecentQuarter}`);
        }
      }

    } catch (error) {
      console.error('Data processing failed:', error);
      
      // Reset to sample data if processing fails
      setIsUsingUploadedData(false);
      setDataSource('sample');
      
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to process uploaded data';
      
      if (error.message?.includes('Quarter_End_Date')) {
        errorMessage = 'Missing required column: Quarter_End_Date. Please check your file format.';
      } else if (error.message?.includes('Division')) {
        errorMessage = 'Missing required column: Division. Please check your file format.';
      } else if (error.message?.includes('Location')) {
        errorMessage = 'Missing required column: Location. Please check your file format.';
      } else if (error.message?.includes('Firebase')) {
        errorMessage = 'Data processed successfully but failed to save to database. Your data is still available in this session.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Enhanced error details:', {
        originalError: error,
        processedMessage: errorMessage,
        dataSource: dataSource,
        hasQuarterlyData: !!quarterlyData
      });
      
      throw new Error(errorMessage);
    }
  }, []);

  const handleUploadError = useCallback((error) => {
    console.error('Upload error:', error);
    
    // Reset data source back to sample if upload fails
    if (isUsingUploadedData) {
      setIsUsingUploadedData(false);
      setDataSource('sample');
    }
    
    // Show user-friendly error message
    let errorMessage = 'Upload failed. Please try again.';
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    // Log detailed error for debugging
    console.error('Detailed upload error:', {
      error,
      type: typeof error,
      message: error?.message,
      stack: error?.stack
    });
  }, [isUsingUploadedData]);


  // Reset to sample data
  const resetToSampleData = () => {
    const sampleData = generateSampleData();
    const groupedData = {};
    sampleData.forEach(record => {
      const quarter = record.Quarter_End_Date;
      if (!groupedData[quarter]) {
        groupedData[quarter] = [];
      }
      groupedData[quarter].push(record);
    });
    
    setQuarterlyData(groupedData);
    setIsUsingUploadedData(false);
    setDataSource('sample');
  };

  // Handle Firebase data integration
  useEffect(() => {
    if (firebaseData && Object.keys(firebaseData).length > 0) {
      console.log('Firebase data loaded:', firebaseData);
      // Firebase data has a different structure - don't set it to quarterlyData
      // quarterlyData should only be used for uploaded CSV/Excel data
      // Firebase data is used directly by the dashboard components
      setIsUsingUploadedData(true); // Consider Firebase data as "uploaded" for UI purposes
      setDataSource('firebase');
    }
  }, [firebaseData]);

  // Initialize with sample data only if no uploaded or Firebase data
  useEffect(() => {
    if (!isUsingUploadedData && !quarterlyData && !firebaseData) {
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
  }, [isUsingUploadedData, quarterlyData, firebaseData]);

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
    } else if (quarterlyData && selectedQuarter && dataSource !== 'firebase') {
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

  // Get available quarters - combines default quarters with uploaded data quarters
  const getAvailableQuarters = () => {
    // If we have Firebase data, use the default QUARTER_DATES
    if (dataSource === 'firebase') {
      return QUARTER_DATES;
    }
    
    // If we have uploaded quarterly data, filter based on what's available
    if (quarterlyData && dataSource === 'uploaded') {
      const uploadedQuarters = Object.keys(quarterlyData);
      const allQuarters = [...QUARTER_DATES];
      
      // Add any uploaded quarters that aren't in the default list
      uploadedQuarters.forEach(quarter => {
        const exists = QUARTER_DATES.some(q => q.value === quarter);
        if (!exists) {
          // Create a quarter entry for uploaded data
          let label = quarter;
          let dateValue = null;
          
          // Try to extract date information from quarter format
          if (quarter.match(/Q(\d)-(\d{4})/)) {
            const [, quarterNum, year] = quarter.match(/Q(\d)-(\d{4})/);
            const month = parseInt(quarterNum) * 3; // Q1=3, Q2=6, Q3=9, Q4=12
            const endDay = (quarterNum === '2') ? 30 : (quarterNum === '4') ? 31 : 31; // June=30, others=31
            dateValue = `${year}-${month.toString().padStart(2, '0')}-${endDay}`;
            label = `${quarter} (${month}/${endDay}/${year})`;
          }
          
          allQuarters.push({
            value: quarter,
            label: label,
            quarter: quarter,
            dateValue: dateValue
          });
        }
      });
      
      // Sort quarters by year and quarter number
      allQuarters.sort((a, b) => {
        const aMatch = a.value.match(/Q(\d)-(\d{4})/);
        const bMatch = b.value.match(/Q(\d)-(\d{4})/);
        
        if (aMatch && bMatch) {
          const [, aQ, aY] = aMatch;
          const [, bQ, bY] = bMatch;
          
          if (aY !== bY) return parseInt(aY) - parseInt(bY);
          return parseInt(aQ) - parseInt(bQ);
        }
        
        return a.value.localeCompare(b.value);
      });
      
      // Only return quarters that have data
      return allQuarters.filter(q => quarterlyData && quarterlyData[q.value]);
    }
    
    // Default case - return all QUARTER_DATES
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
                availableQuarters={quarterlyData ? getAvailableQuarters() : QUARTER_DATES}
              />
            </div>
          </div>
        </div>
        
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Data Source</h2>
              <p className="text-sm text-gray-600">
                {dataSource === 'firebase' && 'Using Firebase data from Excel upload'}
                {dataSource === 'uploaded' && 'Using uploaded workforce data'}
                {dataSource === 'sample' && 'Using sample data for demonstration'}
                {firebaseLoading && ' (Loading from Firebase...)'}
                {firebaseError && ` (Firebase error: ${firebaseError.message})`}
              </p>
            </div>
            {isUsingUploadedData && (
              <button
                onClick={resetToSampleData}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:border-gray-400"
              >
                <X size={16} />
                Reset to Sample
              </button>
            )}
          </div>
          
          {!isUsingUploadedData && (
            <FileUploader
              onDataImported={handleDataImported}
              onError={handleUploadError}
              expectedColumns={['Quarter_End_Date', 'Division', 'Location']}
              title="Upload Workforce Data"
              description="Required columns: Quarter_End_Date, Division, Location, headcount fields"
            />
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