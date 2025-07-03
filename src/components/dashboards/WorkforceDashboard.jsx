import React from 'react';
import { Users, Building2, UserPlus, AlertTriangle, MapPin, Wifi, WifiOff } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import HeadcountChart from '../charts/HeadcountChart';
import LocationChart from '../charts/LocationChart';
import DivisionsChart from '../charts/DivisionsChart';
import StartersLeaversChart from '../charts/StartersLeaversChart';
import SummaryCard from '../ui/SummaryCard';
import useFirebaseWorkforceData from '../../hooks/useFirebaseWorkforceData';

// Hardcoded fallback data following I-9 dashboard pattern
const WORKFORCE_FALLBACK_DATA = {
  summary: {
    totalEmployees: 2847,
    totalPositions: 2950,
    faculty: 1234,
    staff: 1456,
    students: 157,
    vacancies: 103,
    vacancyRate: 3.5,
    employeeChange: 1.5,
    facultyChange: 1.4,
    staffChange: 1.5,
    vacancyRateChange: -0.9
  },
  charts: {
    historicalTrends: [
      { quarter: 'Q2-2024', total: 2675, faculty: 1189, staff: 1342, students: 144 },
      { quarter: 'Q3-2024', total: 2712, faculty: 1198, staff: 1368, students: 146 },
      { quarter: 'Q4-2024', total: 2756, faculty: 1205, staff: 1398, students: 153 },
      { quarter: 'Q1-2025', total: 2804, faculty: 1216, staff: 1434, students: 154 },
      { quarter: 'Q2-2025', total: 2847, faculty: 1234, staff: 1456, students: 157 }
    ],
    startersLeavers: [
      { month: 'Oct 2024', starters: 45, leavers: 32, netChange: 13 },
      { month: 'Nov 2024', starters: 38, leavers: 28, netChange: 10 },
      { month: 'Dec 2024', starters: 52, leavers: 41, netChange: 11 },
      { month: 'Jan 2025', starters: 67, leavers: 35, netChange: 32 },
      { month: 'Feb 2025', starters: 43, leavers: 31, netChange: 12 },
      { month: 'Mar 2025', starters: 39, leavers: 27, netChange: 12 }
    ],
    topDivisions: [
      { name: 'Academic Affairs', total: 567, faculty: 423, staff: 144, vacancies: 12, vacancyRate: 2.1 },
      { name: 'Student Affairs', total: 234, faculty: 45, staff: 189, vacancies: 6, vacancyRate: 2.5 },
      { name: 'Research & Innovation', total: 189, faculty: 134, staff: 55, vacancies: 8, vacancyRate: 4.1 },
      { name: 'Information Technology', total: 156, faculty: 23, staff: 133, vacancies: 7, vacancyRate: 4.3 },
      { name: 'Finance & Administration', total: 145, faculty: 12, staff: 133, vacancies: 4, vacancyRate: 2.7 },
      { name: 'Human Resources', total: 89, faculty: 8, staff: 81, vacancies: 3, vacancyRate: 3.3 },
      { name: 'Facilities Management', total: 123, faculty: 5, staff: 118, vacancies: 9, vacancyRate: 6.8 },
      { name: 'Marketing & Communications', total: 67, faculty: 15, staff: 52, vacancies: 2, vacancyRate: 2.9 },
      { name: 'Library Services', total: 78, faculty: 34, staff: 44, vacancies: 3, vacancyRate: 3.7 },
      { name: 'Athletics', total: 92, faculty: 28, staff: 64, vacancies: 5, vacancyRate: 5.2 }
    ],
    locationDistribution: [
      { name: 'Omaha Campus', total: 2687, faculty: 1156, staff: 1374, students: 157, percentage: 94.4 },
      { name: 'Phoenix Campus', total: 160, faculty: 78, staff: 82, students: 0, percentage: 5.6 }
    ]
  },
  metrics: {
    recentHires: {
      faculty: 23,
      staff: 34,
      students: 12
    },
    demographics: {
      averageTenure: '8.2',
      averageAge: '42',
      genderRatio: '52/48',
      diversityIndex: '34'
    },
    campuses: {
      omaha: {
        percentage: 94.4,
        employees: 2687
      },
      phoenix: {
        percentage: 5.6,
        employees: 160
      },
      growthRate: 2.1
    }
  }
};

const WorkforceDashboard = () => {
  // Use Firebase data with fallback to hardcoded data
  const { 
    data: firebaseData, 
    loading, 
    error, 
    isRealTime, 
    lastSyncTime, 
    refetch 
  } = useFirebaseWorkforceData({ reportingPeriod: 'Q2-2025' });

  // Use Firebase data if available, otherwise fallback
  const data = firebaseData || WORKFORCE_FALLBACK_DATA;
  const filters = { reportingPeriod: 'Q2-2025' };

  // Handle export functionality
  const handleExport = (type, context) => {
    console.log('Exporting workforce dashboard:', type, context);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workforce data...</p>
        </div>
      </div>
    );
  }

  // Show error state with fallback option
  if (error && !firebaseData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
          <p className="text-sm text-gray-500 mt-2">Using cached data if available</p>
        </div>
      </div>
    );
  }

  // Defensive check - ensure data is available
  if (!data || !data.summary || !data.charts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  // Available filters for this dashboard
  const availableFilters = {
    reportingPeriod: [
      { value: 'Q2-2025', label: 'Q2 2025' },
      { value: 'Q1-2025', label: 'Q1 2025' },
      { value: 'Q4-2024', label: 'Q4 2024' },
      { value: 'Q3-2024', label: 'Q3 2024' },
      { value: 'Q2-2024', label: 'Q2 2024' }
    ],
    location: [
      { value: 'all', label: 'All Locations' },
      { value: 'omaha', label: 'Omaha Campus' },
      { value: 'phoenix', label: 'Phoenix Campus' }
    ],
    employeeType: [
      { value: 'all', label: 'All Types' },
      { value: 'faculty', label: 'Faculty' },
      { value: 'staff', label: 'Staff' },
      { value: 'student', label: 'Students' }
    ],
    division: [
      { value: 'all', label: 'All Divisions' },
      { value: 'academic-affairs', label: 'Academic Affairs' },
      { value: 'student-affairs', label: 'Student Affairs' },
      { value: 'research-innovation', label: 'Research & Innovation' },
      { value: 'business-finance', label: 'Business & Finance' },
      { value: 'advancement', label: 'University Advancement' },
      { value: 'athletics', label: 'Athletics' },
      { value: 'facilities', label: 'Facilities Management' },
      { value: 'it', label: 'Information Technology' },
      { value: 'library', label: 'Library Services' },
      { value: 'marketing', label: 'Marketing & Communications' }
    ]
  };

  // Generate subtitle with current period and real-time status
  const realtimeStatus = isRealTime ? '🔴 Live' : '📊 Cached';
  const dataSource = firebaseData ? 'Firebase' : 'Local';
  const syncInfo = lastSyncTime ? ` | Last sync: ${lastSyncTime.toLocaleTimeString()}` : '';
  const subtitle = `${filters.reportingPeriod || 'Q2 2025'} | ${realtimeStatus} (${dataSource})${syncInfo}`;

  return (
    <DashboardLayout
      title="Workforce Analytics Dashboard"
      subtitle={subtitle}
      onExport={handleExport}
      availableFilters={availableFilters}
      gridCols="grid-cols-1"  // Custom layout, we'll handle our own grid
      maxWidth="max-w-7xl"
    >
      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:gap-2 mb-6 print:mb-4">
        <SummaryCard
          title="Total Employees"
          value={data.summary.totalEmployees.toLocaleString()}
          change={data.summary.employeeChange}
          changeType="percentage"
          subtitle={`${data.summary.totalPositions.toLocaleString()} total positions`}
          icon={Users}
          trend="positive"
        />
        
        <SummaryCard
          title="Faculty"
          value={data.summary.faculty.toLocaleString()}
          change={data.summary.facultyChange}
          changeType="percentage"
          subtitle={`${((data.summary.faculty / data.summary.totalEmployees) * 100).toFixed(1)}% of workforce`}
          icon={Users}
        />
        
        <SummaryCard
          title="Staff"
          value={data.summary.staff.toLocaleString()}
          change={data.summary.staffChange}
          changeType="percentage"
          subtitle={`${((data.summary.staff / data.summary.totalEmployees) * 100).toFixed(1)}% of workforce`}
          icon={Building2}
        />
        
        <SummaryCard
          title="Vacancy Rate"
          value={`${data.summary.vacancyRate.toFixed(1)}%`}
          change={data.summary.vacancyRateChange}
          changeType="percentage"
          subtitle={`${data.summary.vacancies.toLocaleString()} open positions`}
          icon={AlertTriangle}
          trend={data.summary.vacancyRateChange > 0 ? 'negative' : 'positive'}
        />
      </div>

      {/* Charts Row 1: Historical Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:gap-2 mb-6 print:mb-4">
        <HeadcountChart
          data={data.charts.historicalTrends}
          title="5-Quarter Headcount Trend"
          height={320}
          showLegend={true}
        />
        
        <StartersLeaversChart
          data={data.charts.startersLeavers}
          title="Monthly Hiring Activity"
          height={320}
          showLegend={true}
          showGrid={true}
        />
      </div>

      {/* Charts Row 2: Distribution Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:gap-2 mb-6 print:mb-4">
        <DivisionsChart
          data={data.charts.topDivisions}
          title="Top 10 Divisions by Headcount"
          height={400}
          maxItems={10}
          sortBy="total"
          layout="horizontal"
          showRanking={true}
        />
        
        <LocationChart
          data={data.charts.locationDistribution}
          title="Employee Distribution by Campus"
          height={400}
          showLegend={true}
          showLabels={true}
          showPercentages={true}
        />
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 print:gap-2 mb-6 print:mb-4">
        <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
          <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
            Recent Hires (Last 30 Days)
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="text-green-500 print:text-black" size={16} />
                <span className="text-sm font-medium">New Faculty</span>
              </div>
              <span className="text-lg font-bold text-green-600 print:text-black">
                {data.metrics.recentHires.faculty}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="text-blue-500 print:text-black" size={16} />
                <span className="text-sm font-medium">New Staff</span>
              </div>
              <span className="text-lg font-bold text-blue-600 print:text-black">
                {data.metrics.recentHires.staff}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="text-purple-500 print:text-black" size={16} />
                <span className="text-sm font-medium">New Students</span>
              </div>
              <span className="text-lg font-bold text-purple-600 print:text-black">
                {data.metrics.recentHires.students}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
          <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
            Demographics Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 print:text-black">Average Tenure</span>
              <span className="font-semibold print:text-black">
                {data.metrics.demographics.averageTenure} years
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 print:text-black">Avg Age</span>
              <span className="font-semibold print:text-black">
                {data.metrics.demographics.averageAge} years
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 print:text-black">Gender Ratio (F/M)</span>
              <span className="font-semibold print:text-black">
                {data.metrics.demographics.genderRatio}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 print:text-black">Diversity Index</span>
              <span className="font-semibold print:text-black">
                {data.metrics.demographics.diversityIndex}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
          <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
            Campus Highlights
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="text-blue-500 print:text-black" size={16} />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Omaha Campus</span>
                  <span className="text-sm font-bold print:text-black">
                    {data.metrics.campuses.omaha.percentage}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 print:text-black">
                  {data.metrics.campuses.omaha.employees.toLocaleString()} employees
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="text-orange-500 print:text-black" size={16} />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Phoenix Campus</span>
                  <span className="text-sm font-bold print:text-black">
                    {data.metrics.campuses.phoenix.percentage}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 print:text-black">
                  {data.metrics.campuses.phoenix.employees.toLocaleString()} employees
                </div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="text-xs text-gray-500 print:text-black">
                Growth Rate: <span className="font-semibold text-green-600 print:text-black">
                  +{data.metrics.campuses.growthRate}%
                </span> YoY
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary Section */}
      <div className="bg-gray-50 print:bg-white p-6 print:p-4 rounded-lg border border-gray-200 print:border-gray">
        <h2 className="text-xl print:text-lg font-bold text-blue-700 print:text-black mb-4 print:mb-3">
          WORKFORCE ANALYTICS EXECUTIVE SUMMARY
        </h2>
        <div className="space-y-4 print:space-y-2 text-sm print:text-xs">
          <p className="text-gray-700 print:text-black">
            <strong>Current Workforce Status:</strong> Creighton University maintains a total workforce of {data.summary.totalEmployees.toLocaleString()} employees across {data.summary.totalPositions.toLocaleString()} authorized positions in {filters?.reportingPeriod || 'Q2 2025'}. The current vacancy rate of {data.summary.vacancyRate.toFixed(1)}% reflects {data.summary.vacancies.toLocaleString()} open positions, indicating healthy organizational capacity for strategic growth.
          </p>
          <p className="text-gray-700 print:text-black">
            <strong>Workforce Composition:</strong> Faculty represents {((data.summary.faculty / data.summary.totalEmployees) * 100).toFixed(1)}% of our workforce ({data.summary.faculty.toLocaleString()} employees), while staff comprises {((data.summary.staff / data.summary.totalEmployees) * 100).toFixed(1)}% ({data.summary.staff.toLocaleString()} employees). Student workers contribute {((data.summary.students / data.summary.totalEmployees) * 100).toFixed(1)}% ({data.summary.students.toLocaleString()} employees), supporting both academic and operational functions.
          </p>
          <p className="text-gray-700 print:text-black">
            <strong>Geographic Distribution:</strong> The Omaha Campus hosts {data.metrics.campuses.omaha.percentage}% of our workforce ({data.metrics.campuses.omaha.employees.toLocaleString()} employees), while the Phoenix Campus represents {data.metrics.campuses.phoenix.percentage}% ({data.metrics.campuses.phoenix.employees.toLocaleString()} employees). This distribution aligns with our strategic campus development and program expansion initiatives.
          </p>
          <p className="text-gray-700 print:text-black">
            <strong>Strategic Outlook:</strong> Recent hiring trends show positive momentum with {(data.metrics.recentHires.faculty + data.metrics.recentHires.staff + data.metrics.recentHires.students).toLocaleString()} new hires in the last 30 days. Academic Affairs continues to be our largest division with {data.charts.topDivisions[0].total.toLocaleString()} employees, followed by Student Affairs and Research & Innovation. Our workforce growth rate of +{data.metrics.campuses.growthRate}% year-over-year demonstrates sustainable organizational expansion aligned with institutional goals.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WorkforceDashboard; 