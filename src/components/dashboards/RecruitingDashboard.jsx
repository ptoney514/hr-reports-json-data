import React from 'react';
import { UserPlus, TrendingUp, Briefcase, Users } from 'lucide-react';
import { getRecruitingData } from '../../data/staticData';
import SummaryCard from '../ui/SummaryCard';
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
                <h1 className="text-2xl font-bold text-gray-900">Recruiting Analytics Report</h1>
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
      </div>
    </div>
  );
};

export default RecruitingDashboard; 