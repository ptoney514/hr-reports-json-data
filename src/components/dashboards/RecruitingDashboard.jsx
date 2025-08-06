import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUpCircle, Wifi, WifiOff, UserPlus, Filter, Download } from 'lucide-react';
import useSimpleRecruitingData from '../../hooks/useSimpleRecruitingData';
// Quarter filter removed - using fixed reporting period

// Fallback data to ensure the dashboard always works
const FALLBACK_DATA = {
  recruitingData: {
    totalOpenPositions: 127,
    postedPositions: 89,
    notPostedPositions: 38,
    newHiresYTD: 228,
    costPerHire: 4200
  },
  openPositionsByDept: [
    { name: 'Academic Affairs', open: 28, posted: 20, notPosted: 8, filled: 35 },
    { name: 'Student Services', open: 22, posted: 16, notPosted: 6, filled: 28 },
    { name: 'Administration', open: 19, posted: 15, notPosted: 4, filled: 32 },
    { name: 'Research', open: 16, posted: 12, notPosted: 4, filled: 24 },
    { name: 'Health Sciences', open: 24, posted: 16, notPosted: 8, filled: 41 },
    { name: 'Other', open: 18, posted: 10, notPosted: 8, filled: 68 }
  ],
  hireSourceData: [
    { source: 'Employee Referral', hires: 68, percentage: 30 },
    { source: 'University Career Page', hires: 52, percentage: 23 },
    { source: 'LinkedIn', hires: 34, percentage: 15 },
    { source: 'Higher Ed Jobs', hires: 29, percentage: 13 },
    { source: 'Indeed', hires: 25, percentage: 11 },
    { source: 'Other', hires: 20, percentage: 8 }
  ],
  timeToFillData: [
    { quarter: 'Q3-24', avgDays: 52, target: 45 },
    { quarter: 'Q4-24', avgDays: 48, target: 45 },
    { quarter: 'Q1-25', avgDays: 44, target: 45 },
    { quarter: 'Q2-25', avgDays: 45, target: 45 }
  ]
};

const RecruitingDashboard = () => {
  // Fixed reporting period - June 30, 2025
  const REPORTING_DATE = '6/30/2025';
  const REPORTING_QUARTER = '2025-Q2';
  
  // Use JSON data with fallback
  const { 
    data: jsonData, 
    loading, 
    isRealTime, 
    lastSyncTime 
  } = useSimpleRecruitingData(REPORTING_QUARTER);

  // Use JSON data if available, otherwise fallback
  const data = jsonData || FALLBACK_DATA;
  const { recruitingData, openPositionsByDept, hireSourceData, timeToFillData } = data;

  // Fixed reporting period - no quarter changes
  
  const handleFilterClick = () => {
    // Filter functionality
  };

  const handleExportClick = () => {
    window.print();
  };

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
      {/* Professional Header Card */}
      <div className="bg-white rounded-lg shadow-sm border mb-6 print:mb-4 print:shadow-none">
        <div className="p-6 print:p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title Section */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <UserPlus className="w-8 h-8 text-blue-600 print:text-black" />
              </div>
              <div>
                <h1 className="text-2xl print:text-xl font-bold text-gray-900 print:text-black">
                  Recruiting Analytics Report
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm print:text-xs text-gray-600 print:text-black">
                    Period Ending: June 30, 2025 | University-wide
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 print:hidden">
                    <span className={isRealTime ? 'text-green-600' : 'text-gray-400'}>
                      {isRealTime ? '🔴 Live' : '📊 Cached'} (JSON)
                    </span>
                    {isRealTime && <Wifi size={14} className="text-green-500" />}
                    {!isRealTime && <WifiOff size={14} className="text-gray-400" />}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Controls Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 print:hidden">
              {/* Fixed reporting period - no quarter selector */}
              <div className="flex gap-2">
                <button 
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  onClick={handleFilterClick}
                  aria-label="Open filters"
                >
                  <Filter size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Filters</span>
                </button>
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  onClick={handleExportClick}
                  aria-label="Export dashboard as PDF"
                >
                  <Download size={16} />
                  <span className="text-sm font-medium">Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 print:gap-2 mb-6 print:mb-4">
        <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
          <h2 className="text-sm font-medium text-blue-700 print:text-black mb-2">Total Open Positions</h2>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-2xl font-bold text-gray-900 print:text-black">{recruitingData.totalOpenPositions}</span>
            <span className="text-red-500 print:text-black text-sm">
              <ArrowUpCircle size={16} className="text-red-500 print:text-black inline" />
            </span>
          </div>
          <p className="text-gray-600 print:text-black text-sm">+12% from last quarter</p>
        </div>
        
        <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
          <h2 className="text-sm font-medium text-blue-700 print:text-black mb-2">Posted Positions</h2>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-2xl font-bold text-gray-900 print:text-black">{recruitingData.postedPositions}</span>
            <span className="text-green-500 print:text-black text-sm">
              <div className="w-4 h-4 bg-green-500 print:bg-black rounded-full"></div>
            </span>
          </div>
          <p className="text-gray-600 print:text-black text-sm">70% of open roles</p>
        </div>
        
        <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
          <h2 className="text-sm font-medium text-blue-700 print:text-black mb-2">Not Posted</h2>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-2xl font-bold text-gray-900 print:text-black">{recruitingData.notPostedPositions}</span>
            <span className="text-yellow-500 print:text-black text-sm">
              <div className="w-4 h-4 bg-yellow-500 print:bg-black rounded-full"></div>
            </span>
          </div>
          <p className="text-gray-600 print:text-black text-sm">30% of open roles</p>
        </div>
        
        <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
          <h2 className="text-sm font-medium text-blue-700 print:text-black mb-2">New Hires YTD</h2>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-teal-500 print:bg-black rounded-full"></div>
            <span className="text-2xl font-bold text-gray-900 print:text-black">{recruitingData.newHiresYTD}</span>
          </div>
          <p className="text-gray-600 print:text-black text-sm">+8% vs last year</p>
        </div>
        
        <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
          <h2 className="text-sm font-medium text-blue-700 print:text-black mb-2">Cost per Hire</h2>
          <div className="text-2xl font-bold text-gray-900 print:text-black mb-2">${recruitingData.costPerHire.toLocaleString()}</div>
          <p className="text-gray-600 print:text-black text-sm">-5% from last year</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:gap-2 mb-6 print:mb-4">
        <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
          <h2 className="text-lg font-medium text-gray-900 print:text-black mb-4 print:mb-2">Open Positions by Department</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm print:text-xs">
              <thead className="bg-gray-100 print:bg-gray-200">
                <tr>
                  <th className="text-left p-2 print:p-1 font-medium">Department</th>
                  <th className="text-center p-2 print:p-1 font-medium">Open</th>
                  <th className="text-center p-2 print:p-1 font-medium">Posted</th>
                  <th className="text-center p-2 print:p-1 font-medium">Not Posted</th>
                  <th className="text-center p-2 print:p-1 font-medium">Filled YTD</th>
                  </tr>
                </thead>
                <tbody>
                  {openPositionsByDept.map((dept, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-2 print:p-1 font-medium">{dept.name}</td>
                      <td className="p-2 print:p-1 text-center">{dept.open}</td>
                      <td className="p-2 print:p-1 text-center">{dept.posted}</td>
                      <td className="p-2 print:p-1 text-center">
                        <span className={dept.notPosted > 6 ? "text-red-600 print:text-black font-medium" : "text-gray-700 print:text-black"}>
                          {dept.notPosted}
                        </span>
                      </td>
                      <td className="p-2 print:p-1 text-center">{dept.filled}</td>
                    </tr>
                  ))}
                </tbody>
              <tfoot className="bg-gray-100 print:bg-gray-200 font-medium">
                <tr>
                  <td className="p-2 print:p-1">Total</td>
                  <td className="p-2 print:p-1 text-center">{recruitingData.totalOpenPositions}</td>
                  <td className="p-2 print:p-1 text-center">{recruitingData.postedPositions}</td>
                  <td className="p-2 print:p-1 text-center">{recruitingData.notPostedPositions}</td>
                  <td className="p-2 print:p-1 text-center">{recruitingData.newHiresYTD}</td>
                  </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
          <h2 className="text-lg font-medium text-gray-900 print:text-black mb-4 print:mb-2">Source of Hires (YTD)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              layout="vertical"
              data={hireSourceData}
              margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{fontSize: 12}} />
              <YAxis dataKey="source" type="category" tick={{fontSize: 12}} />
              <Tooltip contentStyle={{fontSize: 12}} />
              <Bar dataKey="hires" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time to Fill Trend */}
      <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray mb-6 print:mb-4">
        <h2 className="text-lg font-medium text-gray-900 print:text-black mb-4 print:mb-2">Time to Fill Trend</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={timeToFillData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" tick={{fontSize: 12}} />
            <YAxis tick={{fontSize: 12}} domain={[35, 55]} />
            <Tooltip contentStyle={{fontSize: 12}} />
            <Legend wrapperStyle={{fontSize: 12}} />
            <Bar dataKey="avgDays" fill="#0088FE" name="Avg Days to Fill" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RecruitingDashboard; 