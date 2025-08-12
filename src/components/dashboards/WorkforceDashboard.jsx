import React from 'react';
import SummaryCard from '../ui/SummaryCard';
import ErrorBoundary from '../ui/ErrorBoundary';
import DepartmentHeadcountDisplay from '../charts/DepartmentHeadcountDisplay';
import LocationDistributionChart from '../charts/LocationDistributionChart';
import AssignmentTypeChart from '../charts/AssignmentTypeChart';
import { DataDebugOverlay } from '../ui/DataDebugOverlay';
import { getWorkforceData } from '../../data/staticData';
import { 
  Users, 
  TrendingUp, 
  BookOpen,
  Building2,
  Heart
} from 'lucide-react';

// Simplified fallback data for consistent dashboard display
const FALLBACK_DATA = {
  summary: {
    totalEmployees: 2847,
    faculty: 1203,
    staff: 1644,
    growth: 2.3,
    facultyChange: 1.8,
    staffChange: 2.7,
    growthRate: 2.3
  }
};

const WorkforceDashboard = () => {
  // Static data for 6/30/25 reporting period only
  const currentData = getWorkforceData("2025-06-30"); // Current period
  const previousData = getWorkforceData("2025-03-31"); // For percentage calculations
  
  // Calculate percentage changes using previous period
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100);
  };
  
  // Process static data for display
  const data = {
    summary: {
      totalEmployees: currentData.totalEmployees,
      faculty: currentData.faculty,
      staff: currentData.staff,
      hsp: 0, // Not in static data yet
      growth: calculateChange(currentData.totalEmployees, previousData.totalEmployees),
      facultyChange: calculateChange(currentData.faculty, previousData.faculty),
      staffChange: calculateChange(currentData.staff, previousData.staff),
      hspChange: 1.7 // Static for now
    }
  };

  // Helper function to get location counts from static data
  const getLocationCounts = (metric) => {
    const locations = currentData.locations;
    
    switch(metric) {
      case 'total':
        return `Omaha (${locations['Omaha Campus'].toLocaleString()}) | Phoenix (${locations['Phoenix Campus'].toLocaleString()})`;
      case 'faculty':
        // For now, use proportional estimates - can be updated with real data later
        const facultyOmaha = Math.round(currentData.faculty * 0.75);
        const facultyPhoenix = currentData.faculty - facultyOmaha;
        return `Omaha (${facultyOmaha.toLocaleString()}) | Phoenix (${facultyPhoenix.toLocaleString()})`;
      case 'staff':
        const staffOmaha = Math.round(currentData.staff * 0.75);
        const staffPhoenix = currentData.staff - staffOmaha;
        return `Omaha (${staffOmaha.toLocaleString()}) | Phoenix (${staffPhoenix.toLocaleString()})`;
      case 'hsp':
        return 'Omaha (0) | Phoenix (0)'; // Placeholder
      default:
        return '';
    }
  };

  // Enhanced subtitle with data source
  const dataSource = 'Static Data';


  return (
    <ErrorBoundary>
      <div id="workforce-dashboard" data-dashboard-content className="min-h-screen bg-gray-50 py-8 dashboard-container print:bg-white print:py-0">
        <div className="max-w-7xl mx-auto px-4 print:max-w-none print:px-0 print:mx-0">
          {/* Header with Title Above Filters */}
          <div className="mb-6">
            {/* Title Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="text-blue-600" size={24} />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Workforce Dashboard - Benefit Eligible</h1>
                    <p className="text-gray-600 text-sm mt-1">
                      Period Ending: 6/30/25
                    </p>
                  </div>
                </div>
                
                {/* Static period display - no date selector needed */}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 print:gap-2 mb-6 print:mb-4">
            <SummaryCard
              title="Total Headcount"
              value={`${data.summary?.totalEmployees?.toLocaleString() || '0'}`}
              change={data.summary?.growth || 0}
              changeType="percentage"
              subtitle={getLocationCounts('total') || "Total active employees"}
              icon={Users}
              trend={(data.summary?.growth || 0) >= 0 ? 'positive' : 'negative'}
            />
            
            <SummaryCard
              title="Faculty Count"
              value={`${data.summary?.faculty?.toLocaleString() || '0'}`}
              change={data.summary?.facultyChange || 0}
              changeType="percentage"
              subtitle={getLocationCounts('faculty') || "Faculty members"}
              icon={BookOpen}
              trend={(data.summary?.facultyChange || 0) >= 0 ? 'positive' : 'negative'}
            />
            
            <SummaryCard
              title="Staff Count"
              value={`${data.summary?.staff?.toLocaleString() || '0'}`}
              change={data.summary?.staffChange || 0}
              changeType="percentage"
              subtitle={getLocationCounts('staff') || "Staff members"}
              icon={Building2}
              trend={(data.summary?.staffChange || 0) >= 0 ? 'positive' : 'negative'}
            />
            
            <SummaryCard
              title="Starters"
              value={currentData.starters.total.toLocaleString()}
              change={calculateChange(currentData.starters.total, previousData.starters.total)}
              changeType="percentage"
              subtitle={`Omaha (${currentData.starters.omaha.toLocaleString()}) | Phoenix (${currentData.starters.phoenix.toLocaleString()})`}
              icon={TrendingUp}
              trend="positive"
            />
            
            <SummaryCard
              title="HSP Count"
              value={`${data.summary?.hsp?.toLocaleString() || '0'}`}
              change={data.summary?.hspChange || 0}
              changeType="percentage"
              subtitle={getLocationCounts('hsp') || "HSP members"}
              icon={Heart}
              trend={(data.summary?.hspChange || 0) >= 0 ? 'positive' : 'negative'}
            />
          </div>

          {/* Workforce Analytics Charts - Row 1: Department and Location */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-4 mb-6">
            {/* Department Headcount Display */}
            <div>
              <DepartmentHeadcountDisplay 
                data={[]} 
                maxItems={10}
                title="Top 10 Benefit Eligible Headcount by Department"
                className="h-full"
              />
            </div>
            
            {/* Location Distribution Chart */}
            <div>
              <LocationDistributionChart 
                data={[
                  { name: 'Omaha Campus', total: currentData.locations['Omaha Campus'], percentage: 75.3 },
                  { name: 'Phoenix Campus', total: currentData.locations['Phoenix Campus'], percentage: 24.7 }
                ]}
                className="print:h-80 min-h-[420px]"
              />
            </div>
          </div>

          {/* Workforce Analytics Charts - Row 2: Assignment Type (Full Width) */}
          <div className="grid grid-cols-1 gap-6 print:gap-4">
            {/* Assignment Type Chart */}
            <div>
              <AssignmentTypeChart 
                data={[]}
                className="print:h-80 min-h-[420px]"
              />
            </div>
          </div>

        </div>
      </div>
      
      {/* Data Debug Overlay - Only in development */}
      <DataDebugOverlay 
        data={currentData}
        rawData={currentData}
        source={dataSource}
        dashboardType="workforce"
      />
    </ErrorBoundary>
  );
};

export default WorkforceDashboard;