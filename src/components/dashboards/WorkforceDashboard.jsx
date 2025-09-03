import React from 'react';
import { Link } from 'react-router-dom';
import SummaryCard from '../ui/SummaryCard';
import ErrorBoundary from '../ui/ErrorBoundary';
import LocationDistributionChart from '../charts/LocationDistributionChart';
import AssignmentTypeChart from '../charts/AssignmentTypeChart';
import { DataDebugOverlay } from '../ui/DataDebugOverlay';
import { getWorkforceData, getAllSchoolOrgData, getTempTotal, getBenefitEligibleBreakdown } from '../../data/staticData';
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
  
  // Process static data for display
  const data = {
    summary: {
      totalEmployees: currentData.totalEmployees,
      faculty: currentData.faculty,
      staff: currentData.staff,
      hsp: currentData.hsp,
      temp: currentTempTotal,
      growth: calculateChange(currentData.totalEmployees, previousData.totalEmployees),
      facultyChange: calculateChange(currentData.faculty, previousData.faculty),
      staffChange: calculateChange(currentData.staff, previousData.staff),
      hspChange: calculateChange(currentData.hsp, previousData.hsp),
      tempChange: calculateChange(currentTempTotal, previousTempTotal)
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
        case 'students':
          return `OMA (${locationDetails.omaha.students?.toLocaleString() || Math.round(currentData.studentCount.total * 0.75).toLocaleString()}) | PHX (${locationDetails.phoenix.students?.toLocaleString() || Math.round(currentData.studentCount.total * 0.25).toLocaleString()})`;
        case 'temp':
          const tempTotal = getTempTotal("2025-06-30");
          return `OMA (${locationDetails.omaha.temp?.toLocaleString() || Math.round(tempTotal * 0.85).toLocaleString()}) | PHX (${locationDetails.phoenix.temp?.toLocaleString() || Math.round(tempTotal * 0.15).toLocaleString()})`;
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
              change={calculateChange(currentData.staff, previousData.staff)}
              changeType="percentage"
              subtitle={`vs ${previousData.staff?.toLocaleString() || '0'} FY24`}
              icon={Building2}
              trend={(calculateChange(currentData.staff, previousData.staff)) >= 0 ? 'positive' : 'negative'}
            />
            
            <SummaryCard
              title="BE Faculty"
              value={`${currentData.faculty?.toLocaleString() || '0'}`}
              change={calculateChange(currentData.faculty, previousData.faculty)}
              changeType="percentage"
              subtitle={`vs ${previousData.faculty?.toLocaleString() || '0'} FY24`}
              icon={BookOpen}
              trend={(calculateChange(currentData.faculty, previousData.faculty)) >= 0 ? 'positive' : 'negative'}
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

          {/* Executive Summary Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3" style={{color: '#00245D'}}>
              <div className="p-2 rounded-lg" style={{backgroundColor: '#0054A6'}}>
                <Calculator className="text-white" size={24} />
              </div>
              Executive Summary - Workforce Composition
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calculation Breakdown */}
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{color: '#0054A6'}}>
                  <BarChart3 size={20} />
                  Total Workforce Calculation (FY25)
                </h3>
                <div className="rounded-xl p-6 shadow-sm" style={{backgroundColor: '#F3F3F0', border: '1px solid #E5E7EB'}}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white shadow-sm">
                      <div className="flex items-center gap-3">
                        <Building2 className="text-blue-600" size={18} />
                        <span className="font-medium" style={{color: '#00245D'}}>Benefit-Eligible Staff</span>
                      </div>
                      <span className="font-bold text-lg" style={{color: '#0054A6'}}>{currentData.staff.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white shadow-sm">
                      <div className="flex items-center gap-3">
                        <BookOpen className="text-green-600" size={18} />
                        <span className="font-medium" style={{color: '#00245D'}}>Benefit-Eligible Faculty</span>
                      </div>
                      <span className="font-bold text-lg" style={{color: '#0054A6'}}>{currentData.faculty.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white shadow-sm">
                      <div className="flex items-center gap-3">
                        <Heart className="text-red-500" size={18} />
                        <span className="font-medium" style={{color: '#00245D'}}>House Staff Physicians (HSP)</span>
                      </div>
                      <span className="font-bold text-lg" style={{color: '#0054A6'}}>{currentData.hsp.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white shadow-sm">
                      <div className="flex items-center gap-3">
                        <GraduationCap style={{color: '#71CC98'}} size={18} />
                        <span className="font-medium" style={{color: '#00245D'}}>Student Workers</span>
                      </div>
                      <span className="font-bold text-lg" style={{color: '#0054A6'}}>{currentData.studentCount.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white shadow-sm">
                      <div className="flex items-center gap-3">
                        <Clock style={{color: '#FFC72C'}} size={18} />
                        <span className="font-medium" style={{color: '#00245D'}}>Temporary Employees</span>
                      </div>
                      <span className="font-bold text-lg" style={{color: '#0054A6'}}>{currentTempTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 px-4 mt-4 rounded-lg shadow-md" style={{backgroundColor: '#0054A6'}}>
                      <div className="flex items-center gap-3">
                        <Users className="text-white" size={20} />
                        <span className="font-extrabold text-white text-lg">Total Workforce</span>
                      </div>
                      <span className="font-extrabold text-2xl text-white">
                        {(currentData.staff + currentData.faculty + currentData.studentCount.total + currentData.hsp + currentTempTotal).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-sm p-3 rounded-lg whitespace-nowrap" style={{color: '#5A6168', backgroundColor: '#F8F9FA'}}>
                  <span className="font-medium">Note:</span> Employee counts include Jesuits (17) as well as grant-funded positions (482)
                </div>
              </div>
              
              {/* Year-over-Year Key Insights */}
              <div>
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
                        <Heart className="text-white" size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg mb-2" style={{color: '#00245D'}}>House Staff Physician Growth</div>
                        <div className="text-sm font-medium" style={{color: '#00245D'}}>
                          HSP increased by <span className="font-extrabold px-2 py-1 rounded" style={{color: '#71CC98', backgroundColor: 'white'}}>4</span> positions (0.7%) with Omaha growing to 268 residents while Phoenix maintained 344 residents
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200" style={{backgroundColor: '#F8F9FA', border: '1px solid #E5E7EB'}}>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg" style={{backgroundColor: '#FFC72C'}}>
                        <MapPin className="text-white" size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg mb-2" style={{color: '#00245D'}}>Phoenix Campus Expansion</div>
                        <div className="text-sm font-medium" style={{color: '#00245D'}}>
                          Phoenix campus grew by <span className="font-extrabold px-2 py-1 rounded" style={{color: '#FFC72C', backgroundColor: 'white'}}>236</span> employees (45.9%), 
                          primarily driven by an expansion in the School of Medicine with over 20% increase in Faculty and Staff
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campus Breakdown Analysis */}
              <div className="mt-6 lg:col-span-2">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{color: '#0054A6'}}>
                  <MapPin size={20} />
                  Campus Breakdown (as of 6/30/2025)
                </h3>
                <div className="rounded-xl p-4" style={{backgroundColor: '#FAFAFA'}}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{borderColor: '#E5E7EB'}}>
                        <th className="text-left py-3 px-3 font-bold" style={{color: '#00245D'}}>Campus</th>
                        <th className="text-center py-3 px-3 font-bold" style={{color: '#00245D'}}>Omaha</th>
                        <th className="text-center py-3 px-3 font-bold" style={{color: '#00245D'}}>Phoenix</th>
                        <th className="text-center py-3 px-3 font-bold" style={{color: '#00245D'}}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 bg-white">
                        <td className="py-3 px-3 font-semibold" style={{color: '#00245D'}}>Total by Campus</td>
                        <td className="text-center py-3 px-3 font-bold" style={{color: '#0054A6'}}>4,287</td>
                        <td className="text-center py-3 px-3 font-bold" style={{color: '#0054A6'}}>750</td>
                        <td className="text-center py-3 px-3 font-extrabold text-lg" style={{color: '#0054A6'}}>5,037</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="py-3 px-3" colSpan="4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg" style={{backgroundColor: '#95D2F3'}}>
                              <div className="font-bold mb-2 flex items-center gap-2" style={{color: '#00245D'}}>
                                <Building2 size={16} />
                                Omaha Breakdown:
                              </div>
                              <div className="text-sm font-medium" style={{color: '#00245D'}}>1,245 BE Staff | 650 Faculty | 248 Residents | 192 Temp Fac | 198 Temp Staff | 1,612 Students</div>
                            </div>
                            <div className="p-3 rounded-lg" style={{backgroundColor: '#95D2F3'}}>
                              <div className="font-bold mb-2 flex items-center gap-2" style={{color: '#00245D'}}>
                                <Building2 size={16} />
                                Phoenix Breakdown:
                              </div>
                              <div className="text-sm font-medium" style={{color: '#00245D'}}>104 BE Staff | 138 Faculty | 364 Residents | 20 Temp Fac | 22 Temp Staff | 102 Students</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Workforce Analytics Charts - Row 1: Assignment Type and Non-Benefit Eligible */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-4 mb-6">
            {/* Assignment Type Chart */}
            <div>
              <AssignmentTypeChart 
                title=""
                data={currentData.assignmentTypes.filter(item => 
                  !['Jesuits', 'Other', 'Temporary'].includes(item.type)
                ).map(item => ({
                  name: item.type,
                  total: item.count,
                  icon: item.type === 'Student Workers' ? 'student' : 
                        item.type === 'House Staff Physicians' ? 'medical' : 
                        item.type === 'Full-Time' ? 'briefcase' : 'users'
                }))}
                className="print:h-80 min-h-[420px]"
              />
            </div>
            
            {/* Non-Benefit Eligible Chart */}
            <div>
              <AssignmentTypeChart 
                title=""
                data={[
                  { name: 'Temporary', total: currentData.temp || 457, icon: 'clock' },
                  { name: 'Jesuits', total: currentData.jesuits || 17, icon: 'cross' },
                  { name: 'Other (PRN/NBE)', total: currentData.other || 100, icon: 'users' }
                ]}
                className="print:h-80 min-h-[420px]"
              />
            </div>
          </div>

          {/* Category Breakdown Table - Year-over-Year Comparison */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={20} />
              Category Breakdown (14 categories)
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">CATEGORY</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">6/29/2025</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">6/29/2024</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">CHANGE</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">CHANGE %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentData.categories && Object.entries(currentData.categories).map(([category, value]) => {
                    const previousValue = previousData.categories?.[category] || 0;
                    const change = value - previousValue;
                    const changePercent = previousValue > 0 ? ((change / previousValue) * 100).toFixed(1) : 0;
                    const isPositive = change >= 0;
                    
                    return (
                      <tr key={category} className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">{category}</td>
                        <td className="py-2 px-3 text-right">{value.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right">{previousValue.toLocaleString()}</td>
                        <td className={`py-2 px-3 text-right font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{change.toLocaleString()}
                        </td>
                        <td className={`py-2 px-3 text-right font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{changePercent}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>


          {/* Workforce Analytics Charts - Row 2: Headcount Overview Link */}
          <div className="grid grid-cols-1 gap-6 print:gap-4 mb-6">
            {/* Headcount Details Summary Card */}
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Building2 style={{color: '#0054A6'}} size={24} />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Organization Headcount Overview</h2>
                    <p className="text-gray-600 mt-1">
                      Benefit-eligible employees distributed across {getAllSchoolOrgData("2025-06-30")?.filter(org => (org.faculty || 0) + (org.staff || 0) + (org.hsp || 0) > 0).length || 0} organizations
                    </p>
                  </div>
                </div>
                <Link
                  to="/dashboards/headcount-details"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <BarChart3 size={20} />
                  View Details
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Top Organizations Preview */}
                {getAllSchoolOrgData("2025-06-30")?.slice(0, 3).map((org, index) => {
                  const total = (org.faculty || 0) + (org.staff || 0) + (org.hsp || 0);
                  const percentage = (total / currentData.totalEmployees * 100).toFixed(1);
                  
                  return (
                    <div key={org.name} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`px-2 py-1 rounded text-xs font-bold text-white ${
                          index === 0 ? 'bg-blue-600' : index === 1 ? 'bg-blue-500' : 'bg-blue-400'
                        }`}>
                          #{index + 1}
                        </div>
                        <div className="text-lg font-bold" style={{color: '#0054A6'}}>
                          {total.toLocaleString()}
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">
                        {org.name.length > 25 ? org.name.substring(0, 25) + '...' : org.name}
                      </h3>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>Faculty: {org.faculty || 0} | Staff: {org.staff || 0}</div>
                        <div>{percentage}% of total workforce</div>
                      </div>
                    </div>
                  );
                }) || []}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold" style={{color: '#0054A6'}}>
                      {getAllSchoolOrgData("2025-06-30")?.filter(org => (org.faculty || 0) + (org.staff || 0) + (org.hsp || 0) > 0).length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Organizations</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{color: '#1F74DB'}}>
                      {getAllSchoolOrgData("2025-06-30")?.filter(org => (org.faculty || 0) + (org.staff || 0) + (org.hsp || 0) >= 200).length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Large (200+)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{color: '#71CC98'}}>
                      {Math.round((getAllSchoolOrgData("2025-06-30")?.reduce((sum, org) => sum + ((org.faculty || 0) + (org.staff || 0) + (org.hsp || 0)), 0) || 0) / (getAllSchoolOrgData("2025-06-30")?.filter(org => (org.faculty || 0) + (org.staff || 0) + (org.hsp || 0) > 0).length || 1))}
                    </div>
                    <div className="text-sm text-gray-600">Avg per Org</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{color: '#FFC72C'}}>
                      {Math.max(...(getAllSchoolOrgData("2025-06-30")?.map(org => (org.faculty || 0) + (org.staff || 0) + (org.hsp || 0)) || [0])).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Largest Org</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Raw Data Table Section - Year-over-Year */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Year-over-Year Workforce Raw Data</h3>
            
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
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">Temp</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">Total</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">YoY %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Phoenix Data */}
                  <tr className="bg-blue-50">
                    <td className="py-2 px-3 font-medium" rowSpan="2">Phoenix</td>
                    <td className="py-2 px-3 text-gray-600">FY25</td>
                    <td className="py-2 px-3 text-center">6/30/25</td>
                    <td className="py-2 px-3 text-right">{currentData.locationDetails?.phoenix.faculty.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{currentData.locationDetails?.phoenix.staff.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{currentData.locationDetails?.phoenix.hsp.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{currentData.locationDetails?.phoenix.temp?.toLocaleString() || '70'}</td>
                    <td className="py-2 px-3 text-right font-semibold">{currentData.locations['Phoenix Campus'].toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-semibold text-green-600">
                      +{calculateChange(currentData.locations['Phoenix Campus'], previousData.locations['Phoenix Campus']).toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-2 px-3 text-gray-600">FY24</td>
                    <td className="py-2 px-3 text-center">6/30/24</td>
                    <td className="py-2 px-3 text-right">{previousData.locationDetails?.phoenix.faculty.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{previousData.locationDetails?.phoenix.staff.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{previousData.locationDetails?.phoenix.hsp.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{previousData.locationDetails?.phoenix.temp?.toLocaleString() || '67'}</td>
                    <td className="py-2 px-3 text-right font-semibold">{previousData.locations['Phoenix Campus'].toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">-</td>
                  </tr>

                  {/* Omaha Data */}
                  <tr className="bg-blue-50">
                    <td className="py-2 px-3 font-medium" rowSpan="2">Omaha</td>
                    <td className="py-2 px-3 text-gray-600">FY25</td>
                    <td className="py-2 px-3 text-center">6/30/25</td>
                    <td className="py-2 px-3 text-right">{currentData.locationDetails?.omaha.faculty.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{currentData.locationDetails?.omaha.staff.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{currentData.locationDetails?.omaha.hsp.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{currentData.locationDetails?.omaha.temp?.toLocaleString() || '387'}</td>
                    <td className="py-2 px-3 text-right font-semibold">{currentData.locations['Omaha Campus'].toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-semibold text-green-600">
                      +{calculateChange(currentData.locations['Omaha Campus'], previousData.locations['Omaha Campus']).toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-2 px-3 text-gray-600">FY24</td>
                    <td className="py-2 px-3 text-center">6/30/24</td>
                    <td className="py-2 px-3 text-right">{previousData.locationDetails?.omaha.faculty.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{previousData.locationDetails?.omaha.staff.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{previousData.locationDetails?.omaha.hsp.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{previousData.locationDetails?.omaha.temp?.toLocaleString() || '380'}</td>
                    <td className="py-2 px-3 text-right font-semibold">{previousData.locations['Omaha Campus'].toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">-</td>
                  </tr>

                  {/* Total Summary */}
                  <tr className="bg-yellow-50 border-t-2 border-gray-300">
                    <td className="py-2 px-3 font-bold" rowSpan="2">Total</td>
                    <td className="py-2 px-3 text-gray-600">FY25</td>
                    <td className="py-2 px-3 text-center font-semibold">6/30/25</td>
                    <td className="py-2 px-3 text-right font-bold">{currentData.faculty.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold">{currentData.staff.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold">{currentData.hsp.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold">{currentData.temp?.toLocaleString() || '457'}</td>
                    <td className="py-2 px-3 text-right font-bold text-lg">
                      {(currentData.staff + currentData.faculty + currentData.studentCount.total + currentData.hsp + currentData.temp).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-green-600">
                      +{calculateChange(
                        currentData.staff + currentData.faculty + currentData.studentCount.total + currentData.hsp + currentData.temp,
                        previousData.staff + previousData.faculty + previousData.studentCount.total + previousData.hsp + previousData.temp
                      ).toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-2 px-3 text-gray-600">FY24</td>
                    <td className="py-2 px-3 text-center font-semibold">6/30/24</td>
                    <td className="py-2 px-3 text-right font-bold">{previousData.faculty.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold">{previousData.staff.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold">{previousData.hsp.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold">{previousData.temp?.toLocaleString() || '447'}</td>
                    <td className="py-2 px-3 text-right font-bold text-lg">
                      {(previousData.staff + previousData.faculty + previousData.studentCount.total + previousData.hsp + previousData.temp).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right">-</td>
                  </tr>

                  {/* Year-over-Year Changes Row */}
                  <tr className="bg-gray-100 border-t-2 border-gray-300">
                    <td className="py-2 px-3 font-semibold" colSpan="3">Year-over-Year % Change</td>
                    <td className="py-2 px-3 text-right font-semibold text-blue-600">
                      {calculateChange(currentData.faculty, previousData.faculty).toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-blue-600">
                      {calculateChange(currentData.staff, previousData.staff).toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-blue-600">
                      {calculateChange(currentData.hsp, previousData.hsp).toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-blue-600">
                      {calculateChange(currentData.temp || 457, previousData.temp || 447).toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-blue-600">
                      {calculateChange(
                        currentData.staff + currentData.faculty + currentData.studentCount.total + currentData.hsp + currentData.temp,
                        previousData.staff + previousData.faculty + previousData.studentCount.total + previousData.hsp + previousData.temp
                      ).toFixed(1)}%
                    </td>
                    <td className="py-2 px-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Location Breakdown Table - Year-over-Year (Moved Below) */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="text-blue-600" size={20} />
              Location Breakdown (2 locations)
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">LOCATION</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">6/30/2025</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">6/30/2024</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">CHANGE</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">CHANGE %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium">PHOENIX</td>
                    <td className="py-2 px-3 text-right">{currentData.locations['Phoenix Campus'].toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{previousData.locations['Phoenix Campus'].toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-medium text-green-600">
                      +{(currentData.locations['Phoenix Campus'] - previousData.locations['Phoenix Campus']).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-green-600">
                      +{calculateChange(currentData.locations['Phoenix Campus'], previousData.locations['Phoenix Campus']).toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium">OMAHA</td>
                    <td className="py-2 px-3 text-right">{currentData.locations['Omaha Campus'].toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{previousData.locations['Omaha Campus'].toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-medium text-green-600">
                      +{(currentData.locations['Omaha Campus'] - previousData.locations['Omaha Campus']).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-green-600">
                      +{calculateChange(currentData.locations['Omaha Campus'], previousData.locations['Omaha Campus']).toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="bg-yellow-50 font-semibold border-t-2 border-gray-300">
                    <td className="py-2 px-3">TOTAL</td>
                    <td className="py-2 px-3 text-right">
                      {(currentData.locations['Phoenix Campus'] + currentData.locations['Omaha Campus']).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {(previousData.locations['Phoenix Campus'] + previousData.locations['Omaha Campus']).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-green-600">
                      +{((currentData.locations['Phoenix Campus'] + currentData.locations['Omaha Campus']) - 
                        (previousData.locations['Phoenix Campus'] + previousData.locations['Omaha Campus'])).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-green-600">
                      +{calculateChange(
                        currentData.locations['Phoenix Campus'] + currentData.locations['Omaha Campus'],
                        previousData.locations['Phoenix Campus'] + previousData.locations['Omaha Campus']
                      ).toFixed(1)}%
                    </td>
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