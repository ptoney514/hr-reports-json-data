import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, TrendingUp, ArrowLeft, Filter, BarChart3, PieChart, Award, MapPin } from 'lucide-react';
import { getWorkforceData, getAllSchoolOrgData } from '../../data/staticData';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';

const HeadcountDetailsDashboard = () => {
  const [sortBy, setSortBy] = useState('total');
  const [filterType, setFilterType] = useState('all');
  
  // Get current data
  const currentData = getWorkforceData("2025-06-30");
  const previousData = getWorkforceData("2025-03-31");
  const orgData = getAllSchoolOrgData("2025-06-30");

  // Calculate percentage change
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100);
  };

  // Process organization data with sorting and filtering
  const processedData = useMemo(() => {
    if (!orgData || orgData.length === 0) return [];
    
    let data = orgData
      .map((item) => ({
        name: item.name || 'Unknown',
        faculty: item.faculty || 0,
        staff: item.staff || 0,
        hsp: item.hsp || 0,
        total: (item.faculty || 0) + (item.staff || 0) + (item.hsp || 0),
        facultyPercentage: ((item.faculty || 0) / ((item.faculty || 0) + (item.staff || 0) + (item.hsp || 0)) * 100),
        staffPercentage: ((item.staff || 0) / ((item.faculty || 0) + (item.staff || 0) + (item.hsp || 0)) * 100),
        hspPercentage: ((item.hsp || 0) / ((item.faculty || 0) + (item.staff || 0) + (item.hsp || 0)) * 100)
      }))
      .filter(item => item.total > 0);

    // Filter by type
    if (filterType !== 'all') {
      data = data.filter(item => {
        switch(filterType) {
          case 'faculty-heavy':
            return item.facultyPercentage >= 50;
          case 'staff-heavy':
            return item.staffPercentage >= 50;
          case 'large':
            return item.total >= 200;
          case 'medium':
            return item.total >= 50 && item.total < 200;
          case 'small':
            return item.total < 50;
          default:
            return true;
        }
      });
    }

    // Sort by selected metric
    return data.sort((a, b) => {
      switch(sortBy) {
        case 'faculty':
          return b.faculty - a.faculty;
        case 'staff':
          return b.staff - a.staff;
        case 'hsp':
          return b.hsp - a.hsp;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return b.total - a.total;
      }
    });
  }, [orgData, sortBy, filterType]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalEmployees = processedData.reduce((sum, item) => sum + item.total, 0);
    const totalFaculty = processedData.reduce((sum, item) => sum + item.faculty, 0);
    const totalStaff = processedData.reduce((sum, item) => sum + item.staff, 0);
    const totalHsp = processedData.reduce((sum, item) => sum + item.hsp, 0);
    
    return {
      totalEmployees,
      totalFaculty,
      totalStaff,
      totalHsp,
      organizationCount: processedData.length,
      avgSize: Math.round(totalEmployees / processedData.length),
      largestOrg: processedData[0]?.name || 'N/A',
      facultyRatio: Math.round((totalFaculty / totalEmployees) * 100),
      staffRatio: Math.round((totalStaff / totalEmployees) * 100),
      hspRatio: Math.round((totalHsp / totalEmployees) * 100)
    };
  }, [processedData]);

  // Get max value for scaling bars
  const maxValue = useMemo(() => {
    return Math.max(...processedData.map(item => item.total), 1);
  }, [processedData]);

  // Color function based on ranking
  const getBarColor = (index, total) => {
    if (index === 0) return { bg: 'bg-blue-600', text: 'text-white', rank: '#1' };
    if (index <= 2) return { bg: 'bg-blue-500', text: 'text-white', rank: `#${index + 1}` };
    if (index <= 4) return { bg: 'bg-blue-400', text: 'text-white', rank: `#${index + 1}` };
    if (total >= 200) return { bg: 'bg-blue-300', text: 'text-gray-800', rank: '' };
    if (total >= 100) return { bg: 'bg-blue-200', text: 'text-gray-800', rank: '' };
    return { bg: 'bg-blue-100', text: 'text-gray-700', rank: '' };
  };

  return (
    <div id="headcount-details-dashboard" className="min-h-screen bg-gray-50 py-8 dashboard-container print:bg-white print:py-0">
      <div className="max-w-7xl mx-auto px-6 print:max-w-none print:px-0 print:mx-0">
        
        {/* Header with Back Navigation */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link 
                  to="/dashboards/workforce" 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Back to Workforce Dashboard"
                >
                  <ArrowLeft style={{color: '#6B7280'}} size={20} />
                </Link>
                <Building2 style={{color: '#0054A6'}} size={32} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Headcount Details by Organization</h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Comprehensive breakdown of benefit-eligible employees by School/College/Department
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Analysis of {summaryStats.organizationCount} organizations with detailed workforce composition
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold" style={{color: '#0054A6'}}>
                  {summaryStats.totalEmployees.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Employees</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp style={{color: '#71CC98'}} size={16} />
                  <span className="text-sm font-medium" style={{color: '#71CC98'}}>
                    {calculateChange(currentData.totalEmployees, previousData.totalEmployees).toFixed(1)}% Growth
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Users style={{color: '#0054A6'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full" style={{backgroundColor: '#95D2F3', color: '#00245D'}}>
                FACULTY
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {summaryStats.totalFaculty.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-2">Total Faculty</div>
            <div className="text-xs text-gray-500">
              {summaryStats.facultyRatio}% of workforce
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Building2 style={{color: '#1F74DB'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full" style={{backgroundColor: '#E3F2FD', color: '#1565C0'}}>
                STAFF
              </span>
            </div>
            <div className="text-3xl font-bold mb-1" style={{color: '#1F74DB'}}>
              {summaryStats.totalStaff.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-2">Total Staff</div>
            <div className="text-xs text-gray-500">
              {summaryStats.staffRatio}% of workforce
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 style={{color: '#71CC98'}} size={24} />
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                HSP
              </span>
            </div>
            <div className="text-3xl font-bold mb-1" style={{color: '#71CC98'}}>
              {summaryStats.totalHsp.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-2">Health System Personnel</div>
            <div className="text-xs text-gray-500">
              {summaryStats.hspRatio}% of workforce
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Award style={{color: '#FFC72C'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full" style={{backgroundColor: '#FFF9C4', color: '#F57F17'}}>
                TOP ORG
              </span>
            </div>
            <div className="text-lg font-bold mb-1" style={{color: '#FFC72C'}}>
              {summaryStats.largestOrg.length > 15 ? summaryStats.largestOrg.substring(0, 15) + '...' : summaryStats.largestOrg}
            </div>
            <div className="text-sm text-gray-600 mb-2">Largest Organization</div>
            <div className="text-xs text-gray-500">
              {summaryStats.avgSize} avg per org
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg border p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter style={{color: '#0054A6'}} size={20} />
              <h2 className="font-semibold text-gray-900">View Options</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="total">Total Headcount</option>
                  <option value="faculty">Faculty Count</option>
                  <option value="staff">Staff Count</option>
                  <option value="hsp">HSP Count</option>
                  <option value="name">Organization Name</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Filter:</label>
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Organizations</option>
                  <option value="large">Large (200+ employees)</option>
                  <option value="medium">Medium (50-199 employees)</option>
                  <option value="small">Small (&lt;50 employees)</option>
                  <option value="faculty-heavy">Faculty-Heavy (50%+ Faculty)</option>
                  <option value="staff-heavy">Staff-Heavy (50%+ Staff)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Headcount Visualization */}
        <div className="bg-white rounded-lg border shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 style={{color: '#0054A6'}} size={24} />
              <h2 className="text-xl font-bold text-gray-900">Benefit Eligible Headcount by Organization</h2>
            </div>
            <div className="text-sm text-gray-600">
              Showing {processedData.length} of {summaryStats.organizationCount} organizations
            </div>
          </div>

          <ChartErrorBoundary>
            <div className="space-y-4">
              {processedData.map((item, index) => {
                const colors = getBarColor(index, item.total);
                const percentage = (item.total / summaryStats.totalEmployees * 100).toFixed(1);
                
                return (
                  <div key={item.name} className="relative">
                    {/* Organization Name and Metrics */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded text-xs font-bold ${colors.bg} ${colors.text} min-w-[40px] text-center`}>
                          {colors.rank || `${index + 1}`}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Faculty: <strong>{item.faculty}</strong></span>
                            <span>Staff: <strong>{item.staff}</strong></span>
                            <span>HSP: <strong>{item.hsp}</strong></span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{color: '#0054A6'}}>
                          {item.total.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {percentage}% of total
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative bg-gray-100 rounded-full h-8 overflow-hidden">
                      {/* Faculty Bar */}
                      <div 
                        className="absolute top-0 left-0 h-full bg-blue-600 rounded-l-full"
                        style={{ width: `${(item.faculty / maxValue) * 100}%` }}
                        title={`Faculty: ${item.faculty}`}
                      />
                      
                      {/* Staff Bar */}
                      <div 
                        className="absolute top-0 h-full bg-blue-400"
                        style={{ 
                          left: `${(item.faculty / maxValue) * 100}%`,
                          width: `${(item.staff / maxValue) * 100}%` 
                        }}
                        title={`Staff: ${item.staff}`}
                      />
                      
                      {/* HSP Bar */}
                      {item.hsp > 0 && (
                        <div 
                          className="absolute top-0 h-full bg-blue-200 rounded-r-full"
                          style={{ 
                            left: `${((item.faculty + item.staff) / maxValue) * 100}%`,
                            width: `${(item.hsp / maxValue) * 100}%` 
                          }}
                          title={`HSP: ${item.hsp}`}
                        />
                      )}
                      
                      {/* Total Label */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-semibold text-white drop-shadow">
                          {item.total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Percentage Breakdown */}
                    <div className="mt-2 flex gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-600 rounded"></div>
                        Faculty: {item.facultyPercentage.toFixed(1)}%
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-400 rounded"></div>
                        Staff: {item.staffPercentage.toFixed(1)}%
                      </span>
                      {item.hsp > 0 && (
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-blue-200 rounded"></div>
                          HSP: {item.hspPercentage.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartErrorBoundary>
        </div>

        {/* Campus Distribution Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin style={{color: '#0054A6'}} size={20} />
              Campus Distribution
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-semibold text-gray-900">Omaha Campus</div>
                  <div className="text-sm text-gray-600">
                    Faculty: {currentData.locationDetails?.omaha.faculty.toLocaleString()} | 
                    Staff: {currentData.locationDetails?.omaha.staff.toLocaleString()} | 
                    HSP: {currentData.locationDetails?.omaha.hsp.toLocaleString()}
                  </div>
                </div>
                <div className="text-xl font-bold" style={{color: '#0054A6'}}>
                  {currentData.locations['Omaha Campus'].toLocaleString()}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                <div>
                  <div className="font-semibold text-gray-900">Phoenix Campus</div>
                  <div className="text-sm text-gray-600">
                    Faculty: {currentData.locationDetails?.phoenix.faculty.toLocaleString()} | 
                    Staff: {currentData.locationDetails?.phoenix.staff.toLocaleString()} | 
                    HSP: {currentData.locationDetails?.phoenix.hsp.toLocaleString()}
                  </div>
                </div>
                <div className="text-xl font-bold" style={{color: '#F59E0B'}}>
                  {currentData.locations['Phoenix Campus'].toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart style={{color: '#0054A6'}} size={20} />
              Key Insights
            </h2>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">📊 Organization Analysis</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• <strong>{summaryStats.organizationCount} organizations</strong> with benefit-eligible employees</li>
                  <li>• <strong>{summaryStats.largestOrg}</strong> is the largest organization</li>
                  <li>• <strong>{summaryStats.avgSize} employees</strong> average per organization</li>
                  <li>• <strong>{processedData.filter(org => org.total >= 200).length}</strong> organizations have 200+ employees</li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">🎯 Workforce Composition</h3>
                <ul className="text-sm text-green-800 space-y-2">
                  <li>• <strong>Faculty:</strong> {summaryStats.facultyRatio}% of total workforce</li>
                  <li>• <strong>Staff:</strong> {summaryStats.staffRatio}% of total workforce</li>
                  <li>• <strong>HSP:</strong> {summaryStats.hspRatio}% of total workforce</li>
                  <li>• <strong>Growth:</strong> +{calculateChange(currentData.totalEmployees, previousData.totalEmployees).toFixed(1)}% quarter over quarter</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items Section */}
        <div className="mb-8">
          <div className="rounded-lg border p-8" style={{background: 'linear-gradient(to right, #F0F9FF, #E0F2FE)'}}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp style={{color: '#0054A6'}} size={24} />
              Strategic Workforce Insights & Planning
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Growth Opportunities</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#0054A6'}}>•</span>
                    <span><strong>Large organizations</strong> drive majority of workforce growth</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#0054A6'}}>•</span>
                    <span><strong>Faculty expansion</strong> opportunities in high-performing schools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#0054A6'}}>•</span>
                    <span><strong>Cross-campus collaboration</strong> potential for resource sharing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#0054A6'}}>•</span>
                    <span><strong>HSP integration</strong> across health-focused organizations</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Optimization Areas</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#0054A6'}}>→</span>
                    <span><strong>Smaller organizations</strong> may benefit from consolidation review</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#0054A6'}}>→</span>
                    <span><strong>Staff-to-faculty ratios</strong> optimization opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#0054A6'}}>→</span>
                    <span><strong>Resource allocation</strong> based on headcount distribution</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#0054A6'}}>→</span>
                    <span><strong>Campus balance</strong> for optimal service delivery</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600 leading-relaxed">
                <strong>Strategic Summary:</strong> With {summaryStats.totalEmployees.toLocaleString()} benefit-eligible employees across {summaryStats.organizationCount} organizations, 
                the university demonstrates strong workforce diversity. The {summaryStats.facultyRatio}% faculty ratio supports academic excellence, 
                while {summaryStats.staffRatio}% staff composition ensures operational effectiveness. Continued growth of +{calculateChange(currentData.totalEmployees, previousData.totalEmployees).toFixed(1)}% 
                indicates healthy organizational expansion requiring strategic planning for optimal resource allocation and cross-organizational collaboration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadcountDetailsDashboard;