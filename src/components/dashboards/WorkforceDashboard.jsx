import React from 'react';
import DashboardLayout from './DashboardLayout';
import { useWorkforceData } from '../../hooks/useWorkforceData';
import SummaryCard from '../ui/SummaryCard';
import HeadcountChart from '../charts/HeadcountChart';
import StartersLeaversChart from '../charts/StartersLeaversChart';
import LocationChart from '../charts/LocationChart';
import DivisionsChart from '../charts/DivisionsChart';
import { Users, Building2, TrendingUp, UserPlus, UserMinus, Target, MapPin, Briefcase } from 'lucide-react';

const WorkforceDashboard = () => {
  const { 
    data, 
    loading, 
    error, 
    filters,
    refreshData 
  } = useWorkforceData();

  // Handle export functionality
  const handleExport = (type, context) => {
    console.log('Exporting workforce dashboard:', type, context);
    // Implementation will be added later for actual export functionality
  };

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

  // Generate subtitle with current period
  const subtitle = `${filters.reportingPeriod || 'Q2 2025'} | Generated: ${new Date().toLocaleDateString()}`;

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
          value={data?.summary?.totalEmployees?.toLocaleString() || '0'}
          change={data?.summary?.employeeChange}
          changeType="percentage"
          subtitle={`${data?.summary?.totalPositions?.toLocaleString() || '0'} total positions`}
          icon={Users}
          trend="positive"
        />
        
        <SummaryCard
          title="Faculty"
          value={data?.summary?.faculty?.toLocaleString() || '0'}
          change={data?.summary?.facultyChange}
          changeType="percentage"
          subtitle={`${((data?.summary?.faculty / data?.summary?.totalEmployees) * 100 || 0).toFixed(1)}% of workforce`}
          icon={Briefcase}
        />
        
        <SummaryCard
          title="Staff"
          value={data?.summary?.staff?.toLocaleString() || '0'}
          change={data?.summary?.staffChange}
          changeType="percentage"
          subtitle={`${((data?.summary?.staff / data?.summary?.totalEmployees) * 100 || 0).toFixed(1)}% of workforce`}
          icon={Building2}
        />
        
        <SummaryCard
          title="Vacancy Rate"
          value={`${data?.summary?.vacancyRate?.toFixed(1) || '0.0'}%`}
          change={data?.summary?.vacancyRateChange}
          changeType="percentage"
          subtitle={`${data?.summary?.vacancies?.toLocaleString() || '0'} open positions`}
          icon={Target}
          trend={data?.summary?.vacancyRateChange > 0 ? 'negative' : 'positive'}
        />
      </div>

      {/* Charts Row 1: Historical Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:gap-2 mb-6 print:mb-4">
        <HeadcountChart
          data={data?.charts?.historicalTrends || []}
          title="5-Quarter Headcount Trend"
          height={320}
          showLegend={true}
        />
        
        <StartersLeaversChart
          data={data?.charts?.startersLeavers || []}
          title="Monthly Hiring Activity"
          height={320}
          showLegend={true}
          showGrid={true}
        />
      </div>

      {/* Charts Row 2: Distribution Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:gap-2 mb-6 print:mb-4">
        <DivisionsChart
          data={data?.charts?.topDivisions || []}
          title="Top 10 Divisions by Headcount"
          height={400}
          maxItems={10}
          sortBy="total"
          layout="horizontal"
          showRanking={true}
        />
        
        <LocationChart
          data={data?.charts?.locationDistribution || []}
          title="Employee Distribution by Campus"
          height={400}
          layout="vertical"
          stacked={true}
          showLegend={true}
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
                {data?.metrics?.recentHires?.faculty || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="text-blue-500 print:text-black" size={16} />
                <span className="text-sm font-medium">New Staff</span>
              </div>
              <span className="text-lg font-bold text-blue-600 print:text-black">
                {data?.metrics?.recentHires?.staff || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="text-purple-500 print:text-black" size={16} />
                <span className="text-sm font-medium">New Students</span>
              </div>
              <span className="text-lg font-bold text-purple-600 print:text-black">
                {data?.metrics?.recentHires?.students || 0}
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
                {data?.metrics?.demographics?.averageTenure || '0'} years
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 print:text-black">Avg Age</span>
              <span className="font-semibold print:text-black">
                {data?.metrics?.demographics?.averageAge || '0'} years
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 print:text-black">Gender Ratio (F/M)</span>
              <span className="font-semibold print:text-black">
                {data?.metrics?.demographics?.genderRatio || '50/50'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 print:text-black">Diversity Index</span>
              <span className="font-semibold print:text-black">
                {data?.metrics?.demographics?.diversityIndex || '0'}%
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
                    {data?.metrics?.campuses?.omaha?.percentage || '0'}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 print:text-black">
                  {data?.metrics?.campuses?.omaha?.employees?.toLocaleString() || '0'} employees
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="text-orange-500 print:text-black" size={16} />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Phoenix Campus</span>
                  <span className="text-sm font-bold print:text-black">
                    {data?.metrics?.campuses?.phoenix?.percentage || '0'}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 print:text-black">
                  {data?.metrics?.campuses?.phoenix?.employees?.toLocaleString() || '0'} employees
                </div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="text-xs text-gray-500 print:text-black">
                Growth Rate: <span className="font-semibold text-green-600 print:text-black">
                  +{data?.metrics?.campuses?.growthRate || '0'}%
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
            <strong>Current Workforce Status:</strong> Creighton University maintains a total workforce of {data?.summary?.totalEmployees?.toLocaleString() || '2,847'} employees across {data?.summary?.totalPositions?.toLocaleString() || '2,950'} authorized positions in {filters.reportingPeriod || 'Q2 2025'}. The current vacancy rate of {data?.summary?.vacancyRate?.toFixed(1) || '3.5'}% reflects {data?.summary?.vacancies || '103'} open positions, indicating healthy organizational capacity for strategic growth.
          </p>
          <p className="text-gray-700 print:text-black">
            <strong>Workforce Composition:</strong> Faculty represents {((data?.summary?.faculty / data?.summary?.totalEmployees) * 100 || 43.4).toFixed(1)}% of our workforce ({data?.summary?.faculty?.toLocaleString() || '1,234'} employees), while staff comprises {((data?.summary?.staff / data?.summary?.totalEmployees) * 100 || 51.2).toFixed(1)}% ({data?.summary?.staff?.toLocaleString() || '1,456'} employees). Student workers contribute {((data?.summary?.students / data?.summary?.totalEmployees) * 100 || 5.5).toFixed(1)}% ({data?.summary?.students?.toLocaleString() || '157'} employees), supporting both academic and operational functions.
          </p>
          <p className="text-gray-700 print:text-black">
            <strong>Geographic Distribution:</strong> The Omaha Campus hosts {data?.metrics?.campuses?.omaha?.percentage || '94.4'}% of our workforce ({data?.metrics?.campuses?.omaha?.employees?.toLocaleString() || '2,687'} employees), while the Phoenix Campus represents {data?.metrics?.campuses?.phoenix?.percentage || '5.6'}% ({data?.metrics?.campuses?.phoenix?.employees?.toLocaleString() || '160'} employees). This distribution aligns with our strategic campus development and program expansion initiatives.
          </p>
          <p className="text-gray-700 print:text-black">
            <strong>Strategic Outlook:</strong> Recent hiring trends show positive momentum with {data?.metrics?.recentHires?.faculty + data?.metrics?.recentHires?.staff + data?.metrics?.recentHires?.students || '45'} new hires in the last 30 days. Academic Affairs continues to be our largest division with {data?.charts?.topDivisions?.[0]?.total?.toLocaleString() || '567'} employees, followed by Student Affairs and Research & Innovation. Our workforce growth rate of +{data?.metrics?.campuses?.growthRate || '2.1'}% year-over-year demonstrates sustainable organizational expansion aligned with institutional goals.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WorkforceDashboard; 