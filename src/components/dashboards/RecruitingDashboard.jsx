import React from 'react';
import { UserPlus, TrendingUp, Briefcase, Users } from 'lucide-react';
import { getRecruitingData, getPhoenixHeadcountData, getOmahaHeadcountData } from '../../data/staticData';
import SummaryCard from '../ui/SummaryCard';
import DualHeadcountChart from '../charts/DualHeadcountChart';
import FacultyHireRateCard from '../charts/FacultyHireRateCard';
import StaffHireRateCard from '../charts/StaffHireRateCard';
import StaffHiringAnalyticsCard from '../charts/StaffHiringAnalyticsCard';
import InternalExternalComparisonChart from '../charts/InternalExternalComparisonChart';
import HiringCompetitivenessChart from '../charts/HiringCompetitivenessChart';
import StaffHiringInsightsCard from '../charts/StaffHiringInsightsCard';
// Quarter filter removed - using fixed reporting period

const RecruitingDashboard = () => {
  // FY 2025 vs FY 2024 comparison
  const currentData = getRecruitingData("2025-06-30"); // FY 2025 end
  const previousData = getRecruitingData("2024-06-30"); // FY 2024 baseline for year-over-year comparisons
  
  // Chart data
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
      value: ((currentData.staffHiring?.totalApplications || 6362) + (currentData.facultyHiring?.applications || 1746)).toLocaleString(),
      change: calculateChange(
        (currentData.staffHiring?.totalApplications || 6362) + (currentData.facultyHiring?.applications || 1746),
        (previousData.staffHiring?.totalApplications || 6200) + (previousData.facultyHiring?.applications || 1450)
      ),
      changeType: "percentage",
      subtitle: `${(currentData.staffHiring?.totalApplications || 6362).toLocaleString()} Taleo | ${(currentData.facultyHiring?.applications || 1746).toLocaleString()} Interfolio applications`,
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
                <h1 className="text-2xl font-bold text-gray-900">FY 2025 Recruiting Dashboard - Benefit Eligible</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Reporting Period: July 1, 2024 - June 30, 2025
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards - Enhanced layout for better spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:gap-2 mb-6 print:mb-4">
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
          title="Total Benefit Eligible Starters"
          value="262"
          change={16.4}
          changeType="percentage"
          subtitle="OMA (162) | PHX (100)"
          icon={TrendingUp}
          trend="positive"
        />
      </div>

      {/* Charts Section */}
      <div className="space-y-6 print:space-y-2 mb-6 print:mb-4">
        {/* Staff and Faculty Hire Rate Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:gap-2">
          {/* Staff Hire Rate Card */}
          <StaffHireRateCard
            applications={currentData.staffHiring?.totalApplications || 6362}
            hires={currentData.staffHiring?.totalHired || 340}
            hireRate={currentData.staffHiring?.overallHireRate || 4.3}
          />
          
          {/* Faculty Hire Rate Card */}
          <FacultyHireRateCard
            applications={currentData.facultyHiring?.applications || 1746}
            hires={currentData.facultyHiring?.hires || 53}
            hireRate={currentData.facultyHiring?.hireRate || 3.0}
          />
        </div>

        {/* Taleo Hiring Analytics */}
        <div className="w-full">
          <StaffHiringAnalyticsCard
            internalSuccessRate={currentData.staffHiring?.internalSuccessRate || 24.0}
            externalSuccessRate={currentData.staffHiring?.externalSuccessRate || 3.7}
            internalAdvantage={currentData.staffHiring?.internalAdvantage || 6.4}
            internalApplicants={currentData.staffHiring?.internalApplicants || 225}
            externalApplicants={currentData.staffHiring?.externalApplicants || 6137}
            internalHired={currentData.staffHiring?.internalHired || 54}
            externalHired={currentData.staffHiring?.externalHired || 286}
          />
        </div>

        {/* Additional Staff Hiring Analytics */}
        <div className="space-y-6 print:space-y-2">
          <HiringCompetitivenessChart
            totalApplications={((currentData.staffHiring?.totalApplications || 6362) + (currentData.facultyHiring?.applications || 1746))}
            totalHired={((currentData.staffHiring?.totalHired || 340) + (currentData.facultyHiring?.hires || 53))}
            internalApplicants={currentData.staffHiring?.internalApplicants || 225}
            externalApplicants={currentData.staffHiring?.externalApplicants || 6137}
            internalHired={currentData.staffHiring?.internalHired || 54}
            externalHired={currentData.staffHiring?.externalHired || 286}
            facultyHired={currentData.facultyHiring?.hires || 53}
            staffHired={currentData.staffHiring?.totalHired || 340}
            internalSuccessRate={currentData.staffHiring?.internalSuccessRate || 24.0}
            externalSuccessRate={currentData.staffHiring?.externalSuccessRate || 3.7}
            overallHireRate={((currentData.staffHiring?.totalHired || 340) + (currentData.facultyHiring?.hires || 53)) / ((currentData.staffHiring?.totalApplications || 6362) + (currentData.facultyHiring?.applications || 1746)) * 100}
          />

          {/* Internal vs External Comparison */}
          <InternalExternalComparisonChart
            internalApplicants={currentData.staffHiring?.internalApplicants || 225}
            externalApplicants={currentData.staffHiring?.externalApplicants || 6137}
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