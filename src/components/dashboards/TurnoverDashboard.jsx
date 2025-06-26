import React from 'react';
import DashboardLayout from './DashboardLayout';
import { useTurnoverData } from '../../hooks/useTurnoverData';
import SummaryCard from '../ui/SummaryCard';
import TurnoverPieChart from '../charts/TurnoverPieChart';
import DivisionsChart from '../charts/DivisionsChart';
import StartersLeaversChart from '../charts/StartersLeaversChart';
import LocationChart from '../charts/LocationChart';
import { 
  TrendingDown, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Target, 
  BookOpen,
  Building2,
  Award,
  Clock,
  BarChart3
} from 'lucide-react';

const TurnoverDashboard = () => {
  const { 
    data, 
    loading, 
    error, 
    filters,
    refreshData 
  } = useTurnoverData();

  // Handle export functionality
  const handleExport = (type, context) => {
    console.log('Exporting turnover dashboard:', type, context);
    // Implementation will be added later for actual export functionality
  };

  // Available filters for this dashboard
  const availableFilters = {
    fiscalYear: [
      { value: '2024', label: 'FY 2024' },
      { value: '2023', label: 'FY 2023' },
      { value: '2022', label: 'FY 2022' },
      { value: '2021', label: 'FY 2021' },
      { value: '2020', label: 'FY 2020' }
    ],
    grade: [
      { value: 'all', label: 'All Grades' },
      { value: 'A', label: 'A - Executive' },
      { value: 'C', label: 'C - Faculty' },
      { value: 'D', label: 'D - Professional' },
      { value: 'X', label: 'X - Support' },
      { value: 'Y', label: 'Y - Student' }
    ],
    tenure: [
      { value: 'all', label: 'All Tenure' },
      { value: '0-1', label: '0-1 years' },
      { value: '1-3', label: '1-3 years' },
      { value: '3-5', label: '3-5 years' },
      { value: '5-10', label: '5-10 years' },
      { value: '10-15', label: '10-15 years' },
      { value: '15+', label: '15+ years' }
    ],
    reason: [
      { value: 'all', label: 'All Reasons' },
      { value: 'voluntary', label: 'Voluntary' },
      { value: 'involuntary', label: 'Involuntary' },
      { value: 'retirement', label: 'Retirement' }
    ]
  };

  // Generate subtitle with current period
  const subtitle = `FY ${filters.fiscalYear || '2024'} | Generated: ${new Date().toLocaleDateString()}`;

  return (
    <DashboardLayout
      title="Turnover Analysis Dashboard"
      subtitle={subtitle}
      onExport={handleExport}
      availableFilters={availableFilters}
      gridCols="grid-cols-1"  // Custom layout, we'll handle our own grid
      maxWidth="max-w-7xl"
    >
      {/* FY 2024 YTD Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:gap-2 mb-6 print:mb-4">
        <SummaryCard
          title="Overall Turnover Rate"
          value={`${data?.summary?.overallTurnoverRate?.toFixed(1) || '0.0'}%`}
          change={data?.summary?.turnoverRateChange}
          changeType="percentage"
          subtitle={`${data?.summary?.totalDepartures?.toLocaleString() || '0'} total departures`}
          icon={TrendingDown}
          trend={data?.summary?.turnoverRateChange > 0 ? 'negative' : 'positive'}
          target="10.5%"
        />
        
        <SummaryCard
          title="Faculty Turnover"
          value={`${data?.summary?.facultyTurnoverRate?.toFixed(1) || '0.0'}%`}
          change={data?.summary?.facultyTurnoverChange}
          changeType="percentage"
          subtitle={`${data?.summary?.facultyDepartures?.toLocaleString() || '0'} departures`}
          icon={BookOpen}
          trend={data?.summary?.facultyTurnoverChange > 0 ? 'negative' : 'positive'}
        />
        
        <SummaryCard
          title="Staff Turnover"
          value={`${data?.summary?.staffTurnoverRate?.toFixed(1) || '0.0'}%`}
          change={data?.summary?.staffTurnoverChange}
          changeType="percentage"
          subtitle={`${data?.summary?.staffDepartures?.toLocaleString() || '0'} departures`}
          icon={Building2}
          trend={data?.summary?.staffTurnoverChange > 0 ? 'negative' : 'positive'}
        />
        
        <SummaryCard
          title="Cost Impact"
          value={`$${((data?.summary?.totalCostImpact || 0) / 1000000).toFixed(1)}M`}
          change={data?.summary?.costImpactChange}
          changeType="percentage"
          subtitle={`$${(data?.summary?.avgCostPerDeparture || 0).toLocaleString()} avg per departure`}
          icon={DollarSign}
          trend={data?.summary?.costImpactChange > 0 ? 'negative' : 'positive'}
        />
      </div>

      {/* Charts Row 1: Primary Reasons + Tenure Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:gap-2 mb-6 print:mb-4">
        <TurnoverPieChart
          data={data?.charts?.voluntaryReasons || []}
          title="Primary Voluntary Turnover Reasons"
          height={350}
          showLegend={true}
          showLabels={true}
          showPercentages={true}
          legendPosition="bottom"
        />
        
        <DivisionsChart
          data={data?.charts?.tenureAnalysis || []}
          title="Departures by Tenure Group"
          height={350}
          maxItems={8}
          sortBy="turnoverRate"
          layout="horizontal"
          showRanking={false}
        />
      </div>

      {/* Charts Row 2: Higher Education Analysis + Grade Classification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:gap-2 mb-6 print:mb-4">
        <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
          <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
            Higher Education Benchmark Comparison
          </h3>
          <div className="space-y-4">
            {/* Benchmark comparison bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Overall Turnover</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-green-600 print:text-black">
                      {data?.benchmarks?.overall?.creighton || '12.5'}%
                    </span>
                    <span className="text-xs text-gray-500 print:text-black">
                      vs {data?.benchmarks?.overall?.industry || '14.2'}% industry
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${((data?.benchmarks?.overall?.creighton || 12.5) / 20) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Faculty Turnover</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-blue-600 print:text-black">
                      {data?.benchmarks?.faculty?.creighton || '8.8'}%
                    </span>
                    <span className="text-xs text-gray-500 print:text-black">
                      vs {data?.benchmarks?.faculty?.industry || '11.1'}% industry
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${((data?.benchmarks?.faculty?.creighton || 8.8) / 20) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Staff Turnover</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-orange-600 print:text-black">
                      {data?.benchmarks?.staff?.creighton || '15.3'}%
                    </span>
                    <span className="text-xs text-gray-500 print:text-black">
                      vs {data?.benchmarks?.staff?.industry || '16.8'}% industry
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${((data?.benchmarks?.staff?.creighton || 15.3) / 20) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Performance indicator */}
            <div className="bg-green-50 print:bg-white p-3 rounded-lg border border-green-200 print:border-gray">
              <div className="flex items-center gap-2">
                <Award className="text-green-600 print:text-black" size={16} />
                <span className="text-sm font-semibold text-green-800 print:text-black">
                  Performing {data?.benchmarks?.performance || '12'}% better than industry median
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <DivisionsChart
          data={data?.charts?.gradeClassification || []}
          title="Departures by Grade Classification"
          height={350}
          maxItems={6}
          sortBy="turnoverRate"
          layout="horizontal"
          showRanking={true}
        />
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 print:gap-2 mb-6 print:mb-4">
        <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
          <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
            High-Risk Departments
          </h3>
          <div className="space-y-3">
            {(data?.metrics?.highRiskDepartments || []).slice(0, 4).map((dept, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle 
                    className={`${dept.riskLevel === 'High' ? 'text-red-500' : 'text-orange-500'} print:text-black`} 
                    size={16} 
                  />
                  <span className="text-sm font-medium">{dept.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold print:text-black">
                    {dept.turnoverRate}%
                  </div>
                  <div className={`text-xs ${dept.riskLevel === 'High' ? 'text-red-600' : 'text-orange-600'} print:text-black`}>
                    {dept.riskLevel} Risk
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
          <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
            Retention Insights
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 print:text-black">Avg Time to Fill</span>
              <span className="font-semibold print:text-black">
                {data?.metrics?.retention?.avgTimeToFill || '45'} days
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 print:text-black">Exit Interview Rate</span>
              <span className="font-semibold print:text-black">
                {data?.metrics?.retention?.exitInterviewRate || '87'}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 print:text-black">Preventable Turnover</span>
              <span className="font-semibold text-orange-600 print:text-black">
                {data?.metrics?.retention?.preventableTurnover || '34'}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 print:text-black">Retention Rate</span>
              <span className="font-semibold text-green-600 print:text-black">
                {data?.metrics?.retention?.retentionRate || '87.5'}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
          <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
            Historical Trends
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="text-blue-500 print:text-black" size={16} />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">5-Year Average</span>
                  <span className="text-sm font-bold print:text-black">
                    {data?.metrics?.historical?.fiveYearAverage || '13.2'}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 print:text-black">
                  Trending {data?.metrics?.historical?.trend || 'downward'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="text-green-500 print:text-black" size={16} />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Best Year</span>
                  <span className="text-sm font-bold print:text-black">
                    {data?.metrics?.historical?.bestYear?.rate || '10.1'}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 print:text-black">
                  FY {data?.metrics?.historical?.bestYear?.year || '2019'}
                </div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="text-xs text-gray-500 print:text-black">
                Current vs Target: <span className={`font-semibold ${(data?.summary?.overallTurnoverRate || 12.5) <= 10.5 ? 'text-green-600' : 'text-orange-600'} print:text-black`}>
                  {(data?.summary?.overallTurnoverRate || 12.5) <= 10.5 ? 'Meeting' : 'Above'} Goal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Trend Chart */}
      <div className="mb-6 print:mb-4">
        <StartersLeaversChart
          data={data?.charts?.historicalTrends || []}
          title="5-Year Turnover Trend Analysis"
          height={300}
          showLegend={true}
          showGrid={true}
        />
      </div>

      {/* Executive Summary Section */}
      <div className="bg-gray-50 print:bg-white p-6 print:p-4 rounded-lg border border-gray-200 print:border-gray">
        <h2 className="text-xl print:text-lg font-bold text-blue-700 print:text-black mb-4 print:mb-3">
          TURNOVER ANALYSIS EXECUTIVE SUMMARY
        </h2>
        <div className="space-y-4 print:space-y-2 text-sm print:text-xs">
          <p className="text-gray-700 print:text-black">
            <strong>FY {filters.fiscalYear || '2024'} Turnover Performance:</strong> Creighton University achieved an overall turnover rate of {data?.summary?.overallTurnoverRate?.toFixed(1) || '12.5'}% in FY {filters.fiscalYear || '2024'}, representing {data?.summary?.totalDepartures?.toLocaleString() || '287'} total departures. This performance is {data?.benchmarks?.performance || '12'}% better than the higher education industry median, demonstrating effective retention strategies and competitive positioning in talent management.
          </p>
          <p className="text-gray-700 print:text-black">
            <strong>Category Analysis:</strong> Faculty turnover remained stable at {data?.summary?.facultyTurnoverRate?.toFixed(1) || '8.8'}% ({data?.summary?.facultyDepartures || '47'} departures), significantly below the industry average of {data?.benchmarks?.faculty?.industry || '11.1'}%. Staff turnover of {data?.summary?.staffTurnoverRate?.toFixed(1) || '15.3'}% ({data?.summary?.staffDepartures || '156'} departures) also outperformed industry benchmarks. Student worker turnover of {data?.summary?.studentTurnoverRate?.toFixed(1) || '15.7'}% ({data?.summary?.studentDepartures || '84'} departures) aligns with expected seasonal patterns.
          </p>
          <p className="text-gray-700 print:text-black">
            <strong>Key Drivers and Insights:</strong> Career advancement opportunities account for {data?.charts?.voluntaryReasons?.[0]?.percentage || '39.2'}% of voluntary departures, followed by compensation-related factors at {data?.charts?.voluntaryReasons?.[1]?.percentage || '22.9'}%. Early-tenure employees (0-1 years) show the highest turnover risk at {data?.charts?.tenureAnalysis?.[0]?.turnoverRate || '21.5'}%, while long-term employees (15+ years) demonstrate strong retention at {data?.charts?.tenureAnalysis?.[5]?.turnoverRate || '3.3'}% turnover rate.
          </p>
          <p className="text-gray-700 print:text-black">
            <strong>Financial Impact and Strategic Focus:</strong> The estimated total cost impact of ${((data?.summary?.totalCostImpact || 6780000) / 1000000).toFixed(1)}M reflects an average cost of ${(data?.summary?.avgCostPerDeparture || 23623).toLocaleString()} per departure. With {data?.metrics?.retention?.preventableTurnover || '34'}% of turnover classified as preventable, targeted retention initiatives focusing on career development, competitive compensation, and work-life balance could yield significant cost savings and improved organizational stability.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TurnoverDashboard; 