import React from 'react';
import { UserPlus, TrendingUp, Briefcase, Users, UserMinus } from 'lucide-react';
import { getRecruitingData, getStartersLeaversData, getPhoenixHeadcountData, getOmahaHeadcountData } from '../../data/staticData';
import SummaryCard from '../ui/SummaryCard';
import StartersLeaversChart from '../charts/StartersLeaversChart';
import DualHeadcountChart from '../charts/DualHeadcountChart';
import FacultyHireRateCard from '../charts/FacultyHireRateCard';
import StaffHiringAnalyticsCard from '../charts/StaffHiringAnalyticsCard';
import InternalExternalComparisonChart from '../charts/InternalExternalComparisonChart';
import HiringCompetitivenessChart from '../charts/HiringCompetitivenessChart';
import StaffHiringInsightsCard from '../charts/StaffHiringInsightsCard';
// Quarter filter removed - using fixed reporting period

// Fallback data to ensure the dashboard always works
const FALLBACK_DATA = {
  recruitingData: {
    totalOpenPositions: 93,
    postedPositions: 65,
    notPostedPositions: 28,
    newHiresYTD: 228,
    costPerHire: 4200
  }
};

const RecruitingDashboard = () => {
  // Static data for 6/30/25 reporting period only
  const currentData = getRecruitingData("2025-06-30"); // Current period
  const previousData = getRecruitingData("2025-03-31"); // For percentage calculations
  
  // Chart data
  const startersLeaversData = getStartersLeaversData();
  const phoenixHeadcountData = getPhoenixHeadcountData();
  const omahaHeadcountData = getOmahaHeadcountData();

  // Calculate percentage changes using previous period
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100);
  };

  // Standardized recruiting metrics for SummaryCard components
  const recruitingMetrics = [
    {
      title: "Open Requisitions",
      value: currentData.openPositions,
      change: calculateChange(currentData.openPositions, previousData.openPositions),
      changeType: "percentage",
      subtitle: `${currentData.positionsByDepartment.reduce((sum, dept) => sum + dept.openings, 0)} total openings across departments`,
      icon: Briefcase,
      trend: calculateChange(currentData.openPositions, previousData.openPositions) >= 0 ? "positive" : "negative"
    },
    {
      title: "Applications Fiscal YTD", 
      value: currentData.applicationCount.toLocaleString(),
      change: calculateChange(currentData.applicationCount, previousData.applicationCount),
      changeType: "percentage",
      subtitle: `${currentData.newHiresYTD} hires from applications`,
      icon: Users,
      trend: "positive"
    }
  ];


  return (
    <div className="bg-gray-50 p-4 min-h-screen print:bg-white print:p-2 print:text-black max-w-7xl mx-auto">
      {/* Header with Title */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserPlus className="text-blue-600" size={24} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Recruiting Dashboard - Benefit Eligible</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Period Ending: June 30, 2025
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards - Enhanced layout for better spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:gap-2 mb-8 print:mb-4">
        {recruitingMetrics.map((metric, index) => (
          <SummaryCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            changeType={metric.changeType}
            subtitle={metric.subtitle}
            icon={metric.icon}
            trend={metric.trend}
          />
        ))}
        
        <SummaryCard
          title="Starters"
          value="262"
          change={16.4}
          changeType="percentage"
          subtitle="OMA (162) | PHX (100)"
          icon={TrendingUp}
          trend="positive"
        />
        
        <SummaryCard
          title="Leavers"
          value="250"
          subtitle="Reason goes here."
          icon={UserMinus}
          trend="neutral"
        />
      </div>

      {/* Charts Section */}
      <div className="space-y-6 print:space-y-2 mb-8 print:mb-4">
        {/* Starters vs Leavers Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-2">
          <StartersLeaversChart
            data={startersLeaversData}
            title="Starters vs Leavers Over Time"
            height={350}
            showLegend={true}
            showGrid={true}
          />
          
          {/* Faculty Hire Rate Card */}
          <FacultyHireRateCard
            applications={currentData.facultyHiring?.applications || 1746}
            hires={currentData.facultyHiring?.hires || 53}
            hireRate={currentData.facultyHiring?.hireRate || 3.0}
          />
        </div>

        {/* Staff Hiring Analytics Section */}
        <div className="space-y-6 print:space-y-2">
          {/* Staff Hiring Analytics Header */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Staff Position Hiring Analytics</h2>
            <p className="text-gray-600 text-sm">
              Comprehensive analysis of staff hiring patterns and candidate success rates
            </p>
          </div>

          {/* Staff Analytics Cards Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-2">
            <StaffHiringAnalyticsCard
              internalSuccessRate={currentData.staffHiring?.internalSuccessRate || 24.0}
              externalSuccessRate={currentData.staffHiring?.externalSuccessRate || 3.7}
              internalAdvantage={currentData.staffHiring?.internalAdvantage || 6.4}
            />
            
            <HiringCompetitivenessChart
              totalApplications={currentData.staffHiring?.totalApplications || 7860}
              totalHired={currentData.staffHiring?.totalHired || 340}
              internalSuccessRate={currentData.staffHiring?.internalSuccessRate || 24.0}
              externalSuccessRate={currentData.staffHiring?.externalSuccessRate || 3.7}
              overallHireRate={currentData.staffHiring?.overallHireRate || 4.3}
            />
          </div>

          {/* Internal vs External Comparison */}
          <InternalExternalComparisonChart
            internalApplicants={currentData.staffHiring?.internalApplicants || 225}
            externalApplicants={currentData.staffHiring?.externalApplicants || 7635}
            internalHired={currentData.staffHiring?.internalHired || 54}
            externalHired={currentData.staffHiring?.externalHired || 286}
          />

          {/* Strategic Insights */}
          <StaffHiringInsightsCard />
        </div>
        
        {/* Dual Headcount Trends Charts */}
        <DualHeadcountChart
          phoenixData={phoenixHeadcountData}
          omahaData={omahaHeadcountData}
          height={350}
          showLegend={true}
        />
      </div>
    </div>
  );
};

export default RecruitingDashboard; 