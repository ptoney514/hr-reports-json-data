import React from 'react';
import SummaryCard from '../ui/SummaryCard';
import ErrorBoundary from '../ui/ErrorBoundary';
import SchoolOrgHeadcountChart from '../charts/SchoolOrgHeadcountChart';
import LocationDistributionChart from '../charts/LocationDistributionChart';
import AssignmentTypeChart from '../charts/AssignmentTypeChart';
import { DataDebugOverlay } from '../ui/DataDebugOverlay';
import { getWorkforceData, getAllSchoolOrgData } from '../../data/staticData';
import { 
  Users, 
  TrendingUp, 
  BookOpen,
  Building2,
  Heart,
  GraduationCap
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
      hsp: currentData.hsp,
      growth: calculateChange(currentData.totalEmployees, previousData.totalEmployees),
      facultyChange: calculateChange(currentData.faculty, previousData.faculty),
      staffChange: calculateChange(currentData.staff, previousData.staff),
      hspChange: calculateChange(currentData.hsp, previousData.hsp)
    }
  };

  // Helper function to get location counts from static data
  const getLocationCounts = (metric) => {
    const locations = currentData.locations;
    const locationDetails = currentData.locationDetails;
    
    // Use locationDetails if available, otherwise fall back to estimates
    if (locationDetails) {
      switch(metric) {
        case 'total':
          return `OMA (${locations['Omaha Campus'].toLocaleString()}) | PHX (${locations['Phoenix Campus'].toLocaleString()})`;
        case 'faculty':
          return `OMA (${locationDetails.omaha.faculty.toLocaleString()}) | PHX (${locationDetails.phoenix.faculty.toLocaleString()})`;
        case 'staff':
          return `OMA (${locationDetails.omaha.staff.toLocaleString()}) | PHX (${locationDetails.phoenix.staff.toLocaleString()})`;
        case 'hsp':
          return `OMA (${locationDetails.omaha.hsp.toLocaleString()}) | PHX (${locationDetails.phoenix.hsp.toLocaleString()})`;
        default:
          return '';
      }
    } else {
      // Fallback for older data without locationDetails
      switch(metric) {
        case 'total':
          return `OMA (${locations['Omaha Campus'].toLocaleString()}) | PHX (${locations['Phoenix Campus'].toLocaleString()})`;
        case 'faculty':
          const facultyOmaha = Math.round(currentData.faculty * 0.75);
          const facultyPhoenix = currentData.faculty - facultyOmaha;
          return `OMA (${facultyOmaha.toLocaleString()}) | PHX (${facultyPhoenix.toLocaleString()})`;
        case 'staff':
          const staffOmaha = Math.round(currentData.staff * 0.75);
          const staffPhoenix = currentData.staff - staffOmaha;
          return `OMA (${staffOmaha.toLocaleString()}) | PHX (${staffPhoenix.toLocaleString()})`;
        case 'hsp':
          return 'OMA (0) | PHX (0)';
        default:
          return '';
      }
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
              title="Student Count"
              value={currentData.studentCount.total.toLocaleString()}
              change={calculateChange(currentData.studentCount.total, previousData.studentCount.total)}
              changeType="percentage"
              subtitle={`Student Worker (${currentData.studentCount.studentWorker.toLocaleString()}) | FWS (${currentData.studentCount.fws.toLocaleString()})`}
              icon={GraduationCap}
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

          {/* Workforce Analytics Charts - Row 1: Assignment Type and Location */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-4 mb-6">
            {/* Assignment Type Chart */}
            <div>
              <AssignmentTypeChart 
                title="Benefit Eligible Employees by Assignment Type"
                data={currentData.assignmentTypes.map(item => ({
                  name: item.type,
                  total: item.count
                }))}
                className="print:h-80 min-h-[420px]"
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

          {/* Workforce Analytics Charts - Row 2: School/Organization Headcount (Full Width) */}
          <div className="grid grid-cols-1 gap-6 print:gap-4 mb-6">
            {/* School/Organization Headcount Chart */}
            <div>
              <SchoolOrgHeadcountChart 
                data={getAllSchoolOrgData("2025-06-30")}
                height={450}
                className="h-full"
              />
            </div>
          </div>

          {/* Raw Data Table Section */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Workforce Raw Data</h3>
            
            {/* Benefit Eligible Headcount Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700" colSpan="2">Location</th>
                    <th className="text-center py-2 px-3 font-semibold text-gray-700">Period</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">Faculty</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">Staff</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">HSP</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">Total</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">% Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Phoenix Data */}
                  <tr className="bg-blue-50">
                    <td className="py-2 px-3 font-medium" rowSpan="2">Phoenix</td>
                    <td className="py-2 px-3 text-gray-600">Current</td>
                    <td className="py-2 px-3 text-center">6/30/25</td>
                    <td className="py-2 px-3 text-right">{currentData.locationDetails?.phoenix.faculty.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{currentData.locationDetails?.phoenix.staff.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{currentData.locationDetails?.phoenix.hsp.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-semibold">{currentData.locations['Phoenix Campus'].toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-semibold text-green-600">
                      +{calculateChange(currentData.locations['Phoenix Campus'], previousData.locations['Phoenix Campus']).toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-2 px-3 text-gray-600">Previous</td>
                    <td className="py-2 px-3 text-center">3/31/25</td>
                    <td className="py-2 px-3 text-right">{previousData.locationDetails?.phoenix.faculty.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{previousData.locationDetails?.phoenix.staff.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{previousData.locationDetails?.phoenix.hsp.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-semibold">{previousData.locations['Phoenix Campus'].toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">-</td>
                  </tr>

                  {/* Omaha Data */}
                  <tr className="bg-blue-50">
                    <td className="py-2 px-3 font-medium" rowSpan="2">Omaha</td>
                    <td className="py-2 px-3 text-gray-600">Current</td>
                    <td className="py-2 px-3 text-center">6/30/25</td>
                    <td className="py-2 px-3 text-right">{currentData.locationDetails?.omaha.faculty.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{currentData.locationDetails?.omaha.staff.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{currentData.locationDetails?.omaha.hsp.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-semibold">{currentData.locations['Omaha Campus'].toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-semibold text-red-600">
                      {calculateChange(currentData.locations['Omaha Campus'], previousData.locations['Omaha Campus']).toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-2 px-3 text-gray-600">Previous</td>
                    <td className="py-2 px-3 text-center">3/31/25</td>
                    <td className="py-2 px-3 text-right">{previousData.locationDetails?.omaha.faculty.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{previousData.locationDetails?.omaha.staff.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{previousData.locationDetails?.omaha.hsp.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-semibold">{previousData.locations['Omaha Campus'].toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">-</td>
                  </tr>

                  {/* Total Summary */}
                  <tr className="bg-yellow-50 border-t-2 border-gray-300">
                    <td className="py-2 px-3 font-bold" rowSpan="2">Total</td>
                    <td className="py-2 px-3 text-gray-600">Current</td>
                    <td className="py-2 px-3 text-center font-semibold">6/30/25</td>
                    <td className="py-2 px-3 text-right font-bold">{currentData.faculty.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold">{currentData.staff.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold">{currentData.hsp.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold text-lg">{currentData.totalEmployees.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold text-blue-600">
                      {calculateChange(currentData.totalEmployees, previousData.totalEmployees).toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-2 px-3 text-gray-600">Previous</td>
                    <td className="py-2 px-3 text-center font-semibold">3/31/25</td>
                    <td className="py-2 px-3 text-right font-bold">{previousData.faculty.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold">{previousData.staff.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold">{previousData.hsp.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold text-lg">{previousData.totalEmployees.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">-</td>
                  </tr>

                  {/* Percentage Changes Row */}
                  <tr className="bg-gray-100 border-t-2 border-gray-300">
                    <td className="py-2 px-3 font-semibold" colSpan="3">% Change from Previous</td>
                    <td className="py-2 px-3 text-right font-semibold text-blue-600">
                      {calculateChange(currentData.faculty, previousData.faculty).toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-blue-600">
                      {calculateChange(currentData.staff, previousData.staff).toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-blue-600">
                      {calculateChange(currentData.hsp, previousData.hsp).toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-blue-600">
                      {calculateChange(currentData.totalEmployees, previousData.totalEmployees).toFixed(1)}%
                    </td>
                    <td className="py-2 px-3"></td>
                  </tr>
                </tbody>
              </table>
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