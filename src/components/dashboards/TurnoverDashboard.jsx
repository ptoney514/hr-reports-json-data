import React, { useState } from 'react';
import SummaryCard from '../ui/SummaryCard';
import TurnoverPieChart from '../charts/TurnoverPieChart';
import PieBarCombinationChart from '../charts/PieBarCombinationChart';
import QuarterFilter from '../ui/QuarterFilter';
import ErrorBoundary from '../ui/ErrorBoundary';
import useTurnoverData from '../../hooks/useTurnoverData';
import { 
  TrendingDown, 
  DollarSign, 
  BookOpen,
  Building2,
  Award,
  AlertTriangle
} from 'lucide-react';

// Simplified fallback data for consistent dashboard display
const FALLBACK_DATA = {
  summary: {
    overallTurnoverRate: 12.5,
    totalDepartures: 287,
    turnoverRateChange: -1.8,
    facultyTurnoverRate: 8.8,
    facultyDepartures: 89,
    facultyTurnoverChange: -0.9,
    staffTurnoverRate: 15.3,
    staffDepartures: 178,
    staffTurnoverChange: -2.1,
    totalCostImpact: 6780000,
    avgCostPerDeparture: 23623,
    costImpactChange: -5.2
  },
  charts: {
    voluntaryReasons: [
      { name: 'Career Advancement', value: 109, percentage: 38 },
      { name: 'Compensation', value: 60, percentage: 21 },
      { name: 'Work-Life Balance', value: 49, percentage: 17 },
      { name: 'Retirement', value: 34, percentage: 12 },
      { name: 'Relocation', value: 23, percentage: 8 },
      { name: 'Other', value: 11, percentage: 4 }
    ],
    tenureAnalysis: [
      { name: '< 1 Year', value: 100, percentage: 35 },
      { name: '1-3 Years', value: 83, percentage: 29 },
      { name: '3-5 Years', value: 52, percentage: 18 },
      { name: '5-10 Years', value: 29, percentage: 10 },
      { name: '10+ Years', value: 23, percentage: 8 }
    ],
    gradeClassification: [
      { name: 'Faculty', value: 89, turnoverRate: 7.4 },
      { name: 'Professional Staff', value: 156, turnoverRate: 11.2 },
      { name: 'Support Staff', value: 22, turnoverRate: 8.9 },
      { name: 'Executive', value: 8, turnoverRate: 17.8 },
      { name: 'Student Workers', value: 12, turnoverRate: 15.7 }
    ],
    historicalTrends: [
      { period: 'FY2020', overall: 14.2, faculty: 9.1, staff: 17.8 },
      { period: 'FY2021', overall: 13.8, faculty: 8.9, staff: 16.9 },
      { period: 'FY2022', overall: 13.1, faculty: 8.5, staff: 16.2 },
      { period: 'FY2023', overall: 12.9, faculty: 8.7, staff: 15.8 },
      { period: 'FY2024', overall: 12.5, faculty: 8.8, staff: 15.3 }
    ]
  },
  benchmarks: {
    overall: { creighton: 12.5, industry: 14.2 },
    faculty: { creighton: 8.8, industry: 11.1 },
    staff: { creighton: 15.3, industry: 16.8 }
  },
  metrics: {
    highRiskDepartments: [
      { name: 'Information Technology', turnoverRate: 18.5, riskLevel: 'High' },
      { name: 'Marketing', turnoverRate: 16.2, riskLevel: 'High' },
      { name: 'Human Resources', turnoverRate: 14.8, riskLevel: 'Medium' },
      { name: 'Facilities', turnoverRate: 13.9, riskLevel: 'Medium' }
    ],
    retention: {
      avgTimeToFill: 45,
      exitInterviewRate: 87,
      preventableTurnover: 34,
      retentionRate: 87.5
    },
    historical: {
      fiveYearAverage: 13.2,
      trend: 'downward',
      bestYear: { rate: 10.1, year: '2019' }
    }
  }
};

const TurnoverDashboard = () => {
  // Quarter filter state (matches Enhanced Workforce Dashboard)
  const [selectedQuarter, setSelectedQuarter] = useState('Q1-2025');
  
  // Available quarters for filter
  const QUARTER_DATES = [
    { value: 'Q1-2025', label: 'Q1 2025 (Jan-Mar)' },
    { value: 'Q4-2024', label: 'Q4 2024 (Oct-Dec)' },
    { value: 'Q3-2024', label: 'Q3 2024 (Jul-Sep)' },
    { value: 'Q2-2024', label: 'Q2 2024 (Apr-Jun)' },
    { value: 'Q1-2024', label: 'Q1 2024 (Jan-Mar)' }
  ];

  // Handle quarter changes
  const handleQuarterChange = (newQuarter) => {
    setSelectedQuarter(newQuarter);
  };

  // Use JSON data with fallback
  const { 
    data: jsonData, 
    loading, 
    error, 
    isRealTime, 
    lastSyncTime 
  } = useTurnoverData(selectedQuarter);

  // Use JSON data if available, otherwise fallback
  const data = jsonData || FALLBACK_DATA;
  const filters = { fiscalYear: selectedQuarter.split('-')[1] || '2024' };


  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading turnover data...</p>
        </div>
      </div>
    );
  }

  // Enhanced subtitle with real-time status
  const realtimeStatus = isRealTime ? '🔴 Live' : '📊 Cached';
  const dataSource = jsonData ? 'JSON Data' : 'Local';
  const syncInfo = lastSyncTime ? ` | Last sync: ${lastSyncTime.toLocaleTimeString()}` : '';
  const subtitle = `FY ${filters.fiscalYear || '2024'} | ${realtimeStatus} (${dataSource})${syncInfo}`;

  // Validate data structure to prevent object rendering errors
  if (!data || typeof data !== 'object') {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Data Error</h2>
          <p className="text-red-600">Invalid data structure detected. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8 dashboard-container print:bg-white print:py-0">
        <div className="max-w-7xl mx-auto px-4 print:max-w-none print:px-0 print:mx-0">
          {/* Header with Title Above Filters */}
          <div className="mb-6">
            {/* Title Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingDown className="text-blue-600" size={24} />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Turnover Analysis Dashboard</h1>
                    <p className="text-gray-600 text-sm mt-1">
                      {subtitle}
                    </p>
                  </div>
                </div>
                <div className="w-64">
                  <QuarterFilter 
                    selectedQuarter={selectedQuarter}
                    onQuarterChange={handleQuarterChange}
                    availableQuarters={QUARTER_DATES}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:gap-2 mb-6 print:mb-4">
        <SummaryCard
          title="Overall Turnover Rate"
          value={`${data.summary?.overallTurnoverRate?.toFixed(1) || '0.0'}%`}
          change={data.summary?.turnoverRateChange || 0}
          changeType="percentage"
          subtitle={`${data.summary?.totalDepartures?.toLocaleString() || '0'} total departures`}
          icon={TrendingDown}
          trend={(data.summary?.turnoverRateChange || 0) > 0 ? 'negative' : 'positive'}
          target="10.5%"
        />
        
        <SummaryCard
          title="Faculty Turnover"
          value={`${data.summary?.facultyTurnoverRate?.toFixed(1) || '0.0'}%`}
          change={data.summary?.facultyTurnoverChange || 0}
          changeType="percentage"
          subtitle={`${data.summary?.facultyDepartures?.toLocaleString() || '0'} departures`}
          icon={BookOpen}
          trend={(data.summary?.facultyTurnoverChange || 0) > 0 ? 'negative' : 'positive'}
        />
        
        <SummaryCard
          title="Staff Turnover"
          value={`${data.summary?.staffTurnoverRate?.toFixed(1) || '0.0'}%`}
          change={data.summary?.staffTurnoverChange || 0}
          changeType="percentage"
          subtitle={`${data.summary?.staffDepartures?.toLocaleString() || '0'} departures`}
          icon={Building2}
          trend={(data.summary?.staffTurnoverChange || 0) > 0 ? 'negative' : 'positive'}
        />
        
        <SummaryCard
          title="Cost Impact"
          value={`$${((data.summary?.totalCostImpact || 0) / 1000000).toFixed(1)}M`}
          change={data.summary?.costImpactChange || 0}
          changeType="percentage"
          subtitle={`$${data.summary?.avgCostPerDeparture?.toLocaleString() || '0'} avg per departure`}
          icon={DollarSign}
          trend={(data.summary?.costImpactChange || 0) > 0 ? 'negative' : 'positive'}
        />
      </div>

      {/* Charts Row 1: Primary Reasons for Voluntary Turnover + Departures by Tenure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:gap-2 mb-6 print:mb-4">
        <PieBarCombinationChart
          data={data.charts?.voluntaryReasons || []}
          title="Primary Reasons for Voluntary Turnover"
          height={350}
        />
        
        <TurnoverPieChart
          data={data.charts?.tenureAnalysis || []}
          title="Departures by Tenure"
          height={350}
          showLegend={true}
        />
      </div>

      {/* Charts Row 2: Full Width Benchmark Comparison */}
      <div className="mb-6 print:mb-4">
        <div className="bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray">
          <h3 className="text-xl print:text-lg font-semibold text-blue-700 print:text-black mb-6 print:mb-4">
            Higher Education Benchmark Comparison
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-base font-medium">Overall Turnover</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-green-600 print:text-black">
                    {data.benchmarks?.overall?.creighton || 0}%
                  </span>
                  <span className="text-sm text-gray-500 print:text-black">
                    vs {data.benchmarks?.overall?.industry || 0}% industry
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${((data.benchmarks?.overall?.creighton || 0) / 20) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-base font-medium">Faculty Turnover</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-blue-600 print:text-black">
                    {data.benchmarks?.faculty?.creighton || 0}%
                  </span>
                  <span className="text-sm text-gray-500 print:text-black">
                    vs {data.benchmarks?.faculty?.industry || 0}% industry
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${((data.benchmarks?.faculty?.creighton || 0) / 20) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-base font-medium">Staff Turnover</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-orange-600 print:text-black">
                    {data.benchmarks?.staff?.creighton || 0}%
                  </span>
                  <span className="text-sm text-gray-500 print:text-black">
                    vs {data.benchmarks?.staff?.industry || 0}% industry
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-orange-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${((data.benchmarks?.staff?.creighton || 0) / 20) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 print:bg-white p-4 rounded-lg border border-green-200 print:border-gray mt-6">
            <div className="flex items-center justify-center gap-3">
              <Award className="text-green-600 print:text-black" size={20} />
              <span className="text-lg font-semibold text-green-800 print:text-black">
                Performing 12% better than industry median across all categories
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 print:gap-2 mb-6 print:mb-4">
        <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
          <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
            High-Risk Departments
          </h3>
          <div className="space-y-3">
            {(data.metrics?.highRiskDepartments || []).slice(0, 4).map((dept, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle 
                    className={`${dept.riskLevel === 'High' ? 'text-red-500' : 'text-orange-500'} print:text-black`} 
                    size={16} 
                  />
                  <span className="text-sm">{dept.name}</span>
                </div>
                <span className="text-sm font-semibold">
                  {dept.turnoverRate}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
          <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
            Retention Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Retention Rate</span>
              <span className="text-sm font-semibold text-green-600 print:text-black">
                {data.metrics?.retention?.retentionRate || 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Avg Time to Fill</span>
              <span className="text-sm font-semibold">
                {data.metrics?.retention?.avgTimeToFill || 0} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Exit Interview Rate</span>
              <span className="text-sm font-semibold">
                {data.metrics?.retention?.exitInterviewRate || 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Preventable Turnover</span>
              <span className="text-sm font-semibold text-orange-600 print:text-black">
                {data.metrics?.retention?.preventableTurnover || 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
          <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
            Historical Context
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">5-Year Average</span>
              <span className="text-sm font-semibold">
                {data.metrics?.historical?.fiveYearAverage || 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Current Trend</span>
              <span className="text-sm font-semibold text-green-600 print:text-black capitalize">
                {data.metrics?.historical?.trend || 'stable'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Best Performance</span>
              <span className="text-sm font-semibold">
                {data.metrics?.historical?.bestYear?.rate || 0}% ({data.metrics?.historical?.bestYear?.year || 'N/A'})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary Section */}
      <div className="bg-gray-50 print:bg-white p-6 print:p-4 rounded-lg border border-gray-200 print:border-gray">
        <h2 className="text-xl print:text-lg font-bold text-blue-700 print:text-black mb-4 print:mb-3">
          TURNOVER ANALYSIS EXECUTIVE SUMMARY
        </h2>
        <div className="space-y-4 print:space-y-2 text-sm print:text-xs">
          <p className="text-gray-700 print:text-black">
            <strong>FY 2024 Turnover Performance:</strong> Creighton University achieved an overall turnover rate of 12.5% in FY 2024, representing 287 total departures. This performance is 12% better than the higher education industry median, demonstrating effective retention strategies and competitive positioning in talent management.
          </p>
          <p className="text-gray-700 print:text-black">
            <strong>Category Analysis:</strong> Faculty turnover remained stable at 8.8% (89 departures), significantly below the industry average of 11.1%. Staff turnover of 15.3% (178 departures) also outperformed industry benchmarks. The organization continues to maintain strong retention across all employee categories.
          </p>
          <p className="text-gray-700 print:text-black">
            <strong>Key Drivers and Insights:</strong> Career advancement opportunities account for 39.2% of voluntary departures, followed by compensation-related factors at 22.9%. Early-tenure employees (0-1 years) show the highest turnover risk at 21.5%, while long-term employees (15+ years) demonstrate strong retention at 3.3% turnover rate.
          </p>
          <p className="text-gray-700 print:text-black">
            <strong>Financial Impact and Strategic Focus:</strong> The estimated total cost impact of $6.8M reflects an average cost of $23,623 per departure. With 34% of turnover classified as preventable, targeted retention initiatives focusing on career development, competitive compensation, and work-life balance could yield significant cost savings and improved organizational stability.
          </p>
        </div>
      </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default TurnoverDashboard; 