import React, { useState } from 'react';
import SummaryCard from '../ui/SummaryCard';
import ErrorBoundary from '../ui/ErrorBoundary';
import useWorkforceData from '../../hooks/useWorkforceData';
import DepartmentHeadcountDisplay from '../charts/DepartmentHeadcountDisplay';
import LocationDistributionChart from '../charts/LocationDistributionChart';
import AssignmentTypeChart from '../charts/AssignmentTypeChart';
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
  // Fixed reporting period - June 30, 2025
  const REPORTING_DATE = '6/30/2025';
  const REPORTING_QUARTER = 'Q2-2025';

  // Use JSON data with fallback
  const { 
    data: jsonData,
    rawData,
    loading, 
    error, 
    lastUpdated
  } = useWorkforceData({ reportingPeriod: REPORTING_QUARTER });

  // Use JSON data if available, otherwise fallback
  const data = jsonData || FALLBACK_DATA;
  
  // Extract location data for display - use rawData which contains the full structure
  const locationData = rawData?.currentPeriod?.locations || [];
  
  // Helper function to get location counts
  const getLocationCounts = (metric) => {
    const omaha = locationData.find(loc => loc.name === 'Omaha Campus');
    const phoenix = locationData.find(loc => loc.name === 'Phoenix Campus');
    
    if (!omaha || !phoenix) {
      // Fallback if location data not available
      return '';
    }
    
    let omahaCount = 0;
    let phoenixCount = 0;
    
    switch(metric) {
      case 'total':
        omahaCount = omaha.total || 0;
        phoenixCount = phoenix.total || 0;
        break;
      case 'faculty':
        omahaCount = omaha.breakdown?.faculty || 0;
        phoenixCount = phoenix.breakdown?.faculty || 0;
        break;
      case 'staff':
        omahaCount = omaha.breakdown?.staff || 0;
        phoenixCount = phoenix.breakdown?.staff || 0;
        break;
      case 'hsp':
        omahaCount = omaha.breakdown?.hsp || 0;
        phoenixCount = phoenix.breakdown?.hsp || 0;
        break;
      default:
        return '';
    }
    
    return `Omaha (${omahaCount.toLocaleString()}) | Phoenix (${phoenixCount.toLocaleString()})`;
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

  // Enhanced subtitle with data source
  const dataSource = jsonData ? 'JSON Data' : 'Local';
  const syncInfo = ''; // Removed Last sync display per user request

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
                  <Users className="text-blue-600" size={24} />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Workforce Dashboard - Benefit Eligible</h1>
                    <p className="text-gray-600 text-sm mt-1">
                      Period Ending: June 30, 2025
                    </p>
                  </div>
                </div>
                {/* Fixed reporting period - no quarter selector */}
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
              value="262"
              change={16.4}
              changeType="percentage"
              subtitle="Omaha (162) | Phoenix (100)"
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
              {(() => {
                const deptData = rawData?.currentPeriod?.departmentalBreakdown || [];
                console.log('🔍 WorkforceDashboard - Departmental data being passed:', deptData);
                console.log('🔍 WorkforceDashboard - Data length:', deptData.length);
                console.log('🔍 WorkforceDashboard - Raw data structure:', rawData);
                return (
                  <DepartmentHeadcountDisplay 
                    data={deptData}
                    maxItems={10}
                    title="Top 10 Benefit Eligible Headcount by Department"
                    className="h-full"
                  />
                );
              })()}
            </div>
            
            {/* Location Distribution Chart */}
            <div>
              <LocationDistributionChart 
                data={rawData?.currentPeriod?.locations || []}
                className="print:h-80 min-h-[420px]"
              />
            </div>
          </div>

          {/* Workforce Analytics Charts - Row 2: Assignment Type (Full Width) */}
          <div className="grid grid-cols-1 gap-6 print:gap-4">
            {/* Assignment Type Chart */}
            <div>
              <AssignmentTypeChart 
                data={rawData?.currentPeriod?.byAssignmentType || []}
                className="print:h-80 min-h-[420px]"
              />
            </div>
          </div>

        </div>
      </div>
    </ErrorBoundary>
  );
};

export default WorkforceDashboard;