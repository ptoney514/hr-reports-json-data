import React from 'react';
import { UserPlus, TrendingUp, Briefcase, Users } from 'lucide-react';
import useSimpleRecruitingData from '../../hooks/useSimpleRecruitingData';
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
  // Fixed reporting period - June 30, 2025
  const REPORTING_QUARTER = '2025-Q2';
  
  // Use JSON data with fallback
  const { 
    data: jsonData, 
    loading
  } = useSimpleRecruitingData(REPORTING_QUARTER);

  // Use JSON data if available, otherwise fallback
  const data = jsonData || FALLBACK_DATA;
  const { recruitingData } = data;

  // Standardized recruiting metrics for SummaryCard components
  const recruitingMetrics = [
    {
      title: "Open Requisitions",
      value: recruitingData.totalOpenPositions,
      change: -25,
      changeType: "percentage",
      subtitle: "Omaha (57) | Phoenix (36)",
      icon: Briefcase,
      trend: "negative"
    },
    {
      title: "Applications Fiscal YTD", 
      value: "4,423",
      change: 16.4,
      changeType: "percentage",
      subtitle: "Faculty: 1,651 | Staff: 2,772",
      icon: Users,
      trend: "positive"
    }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recruiting data...</p>
        </div>
      </div>
    );
  }


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
          subtitle="Omaha (162) | Phoenix (100)"
          icon={TrendingUp}
          trend="positive"
        />
      </div>
    </div>
  );
};

export default RecruitingDashboard; 