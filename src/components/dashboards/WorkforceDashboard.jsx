import React from 'react';
import { Link } from 'react-router-dom';
import SummaryCard from '../ui/SummaryCard';
import ErrorBoundary from '../ui/ErrorBoundary';
import GenderDistributionChart from '../charts/GenderDistributionChart';
import EthnicityBreakdownChart from '../charts/EthnicityBreakdownChart';
import AgeDistributionChart from '../charts/AgeDistributionChart';
import AgeDistributionCurve from '../charts/AgeDistributionCurve';
import AgeGenderPyramid from '../charts/AgeGenderPyramid';
import { DataDebugOverlay } from '../ui/DataDebugOverlay';
import { getWorkforceData, getAllSchoolOrgData, getTempTotal } from '../../data/staticData';
import { 
  Users, 
  BookOpen,
  Building2,
  Heart,
  GraduationCap,
  BarChart3,
  Clock,
  TrendingUp,
  MapPin,
  Calculator
} from 'lucide-react';


const WorkforceDashboard = () => {
  // Year-over-Year comparison data
  const currentData = getWorkforceData("2025-06-30"); // Current year (6/30/25)
  const previousData = getWorkforceData("2024-06-30"); // Prior year (6/30/24) for YoY comparison
  
  // Get corrected temp totals
  const currentTempTotal = getTempTotal("2025-06-30");
  const previousTempTotal = getTempTotal("2024-06-30");
  
  // Calculate Year-over-Year percentage changes
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100);
  };
  
  // Process static data for display - values are used directly from currentData

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
        case 'students':
          return `OMA (${locationDetails.omaha.students?.toLocaleString()}) | PHX (${locationDetails.phoenix.students?.toLocaleString()})`;
        case 'temp':
          return `OMA (${locationDetails.omaha.temp?.toLocaleString()}) | PHX (${locationDetails.phoenix.temp?.toLocaleString()})`;
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
        case 'students':
          const studentsOmaha = Math.round(currentData.studentCount.total * 0.75);
          const studentsPhoenix = currentData.studentCount.total - studentsOmaha;
          return `OMA (${studentsOmaha.toLocaleString()}) | PHX (${studentsPhoenix.toLocaleString()})`;
        case 'temp':
          const tempTotalFallback = getTempTotal("2025-06-30");
          const tempOmaha = Math.round(tempTotalFallback * 0.85);
          const tempPhoenix = tempTotalFallback - tempOmaha;
          return `OMA (${tempOmaha.toLocaleString()}) | PHX (${tempPhoenix.toLocaleString()})`;
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
                    <h1 className="text-2xl font-bold text-gray-900">Workforce Dashboard - Year-over-Year Comparison</h1>
                    <p className="text-gray-600 text-sm mt-1">
                      Comparing: 6/30/25 vs 6/30/24
                    </p>
                  </div>
                </div>
                
                {/* Static period display - no date selector needed */}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3 print:gap-2 mb-6 print:mb-4">
            <SummaryCard
              title="BE Staff"
              value={`${currentData.staff?.toLocaleString() || '0'}`}
              subtitle={getLocationCounts('staff')}
              icon={Building2}
            />
            
            <SummaryCard
              title="BE Faculty"
              value={`${currentData.faculty?.toLocaleString() || '0'}`}
              subtitle={getLocationCounts('faculty')}
              icon={BookOpen}
            />
            
            <SummaryCard
              title="HSP"
              value={`${currentData.hsp?.toLocaleString() || '0'}`}
              subtitle={getLocationCounts('hsp')}
              icon={Heart}
            />
            
            <SummaryCard
              title="Students"
              value={currentData.studentCount.total.toLocaleString()}
              subtitle={getLocationCounts('students')}
              icon={GraduationCap}
            />
            
            <SummaryCard
              title="Temp"
              value={`${currentTempTotal.toLocaleString()}`}
              subtitle={getLocationCounts('temp')}
              icon={Users}
            />
            
            <SummaryCard
              title="Total"
              value={`${(currentData.staff + currentData.faculty + currentData.studentCount.total + currentData.hsp + currentTempTotal).toLocaleString()}`}
              subtitle={getLocationCounts('total')}
              icon={Users}
            />
          </div>

          {/* Year-over-Year Key Insights */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{color: '#0054A6'}}>
                <TrendingUp size={20} />
                Year-over-Year Key Insights
              </h3>
              <div className="space-y-4">
                <div className="rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200" style={{backgroundColor: '#F8F9FA', border: '1px solid #E5E7EB'}}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg" style={{backgroundColor: '#1F74DB'}}>
                      <Users className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg mb-2" style={{color: '#00245D'}}>Benefit-Eligible Workforce Expansion</div>
                      <div className="text-sm font-medium" style={{color: '#00245D'}}>
                        BE Staff increased by <span className="font-extrabold px-2 py-1 rounded" style={{color: '#1F74DB', backgroundColor: 'white'}}>26</span> positions (2.0%), 
                        while BE Faculty increased by <span className="font-extrabold px-2 py-1 rounded" style={{color: '#1F74DB', backgroundColor: 'white'}}>2</span> positions (0.3%)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200" style={{backgroundColor: '#F8F9FA', border: '1px solid #E5E7EB'}}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg" style={{backgroundColor: '#71CC98'}}>
                      <Building2 className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg mb-2" style={{color: '#00245D'}}>Omaha Campus Growth</div>
                      <div className="text-sm font-medium" style={{color: '#00245D'}}>
                        BE Staff increased by <span className="font-extrabold px-2 py-1 rounded" style={{color: '#71CC98', backgroundColor: 'white'}}>17</span> positions (1.3%), 
                        while BE Faculty increased by <span className="font-extrabold px-2 py-1 rounded" style={{color: '#71CC98', backgroundColor: 'white'}}>11</span> positions (1.7%)
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200" style={{backgroundColor: '#F8F9FA', border: '1px solid #E5E7EB'}}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg" style={{backgroundColor: '#FFC72C'}}>
                      <Building2 className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg mb-2" style={{color: '#00245D'}}>Phoenix Campus Stability</div>
                      <div className="text-sm font-medium" style={{color: '#00245D'}}>
                        BE Staff and BE Faculty remained unchanged from prior year
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-sm p-3 rounded-lg" style={{color: '#5A6168', backgroundColor: '#F8F9FA'}}>
                <span className="font-medium">Note:</span> Employee counts include Jesuits (17) as well as grant-funded positions (482)
              </div>
            </div>
          </div>



          {/* Demographic Analysis Section - Benefit Eligible Employees */}
          {currentData.demographics && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3" style={{color: '#00245D'}}>
                <div className="p-2 rounded-lg" style={{backgroundColor: '#0054A6'}}>
                  <Users className="text-white" size={24} />
                </div>
                Benefit Eligible Employee Demographics
              </h2>
              
              {/* Age/Gender Distribution */}
              <div className="mb-6">
                <AgeGenderPyramid data={currentData.demographics} />
              </div>
              
              {/* Gender Distribution */}
              <div className="mb-6">
                <GenderDistributionChart data={currentData.demographics} />
              </div>
              
              {/* Ethnicity Breakdown */}
              <div className="mb-6">
                <EthnicityBreakdownChart data={currentData.demographics} />
              </div>
            </div>
          )}



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