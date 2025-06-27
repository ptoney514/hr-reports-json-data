import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { ArrowUpCircle } from 'lucide-react';

const RecruitingDashboard = () => {
  // Recruiting Metrics
  const recruitingData = {
    totalOpenPositions: 127,
    postedPositions: 89,
    notPostedPositions: 38,
    newHiresYTD: 228,
    costPerHire: 4200
  };

  // Open positions by department
  const openPositionsByDept = [
    { name: 'Academic Affairs', open: 28, posted: 20, notPosted: 8, filled: 35 },
    { name: 'Student Services', open: 22, posted: 16, notPosted: 6, filled: 28 },
    { name: 'Administration', open: 19, posted: 15, notPosted: 4, filled: 32 },
    { name: 'Research', open: 16, posted: 12, notPosted: 4, filled: 24 },
    { name: 'Health Sciences', open: 24, posted: 16, notPosted: 8, filled: 41 },
    { name: 'Other', open: 18, posted: 10, notPosted: 8, filled: 68 }
  ];

  // Source of hires
  const hireSourceData = [
    { source: 'Employee Referral', hires: 68, percentage: 30 },
    { source: 'University Career Page', hires: 52, percentage: 23 },
    { source: 'LinkedIn', hires: 34, percentage: 15 },
    { source: 'Higher Ed Jobs', hires: 29, percentage: 13 },
    { source: 'Indeed', hires: 25, percentage: 11 },
    { source: 'Other', hires: 20, percentage: 8 }
  ];

  // Time to fill trends
  const timeToFillData = [
    { quarter: 'Q3-24', avgDays: 52, target: 45 },
    { quarter: 'Q4-24', avgDays: 48, target: 45 },
    { quarter: 'Q1-25', avgDays: 44, target: 45 },
    { quarter: 'Q2-25', avgDays: 45, target: 45 }
  ];

  return (
    <div className="text-xs">
      {/* PAGE 1: RECRUITING METRICS */}
      <div className="bg-gray-50 p-4 min-h-screen">
        {/* Header */}
        <div className="mb-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-700">Recruiting & Retention Analytics Dashboard</h1>
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 bg-blue-100 rounded">Q2 2025</span>
            <span className="px-2 py-1 bg-blue-100 rounded">University-wide</span>
          </div>
        </div>

        {/* Summary Cards - First Row */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <h2 className="text-xs font-medium text-blue-700 mb-1">Total Open Positions</h2>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold">{recruitingData.totalOpenPositions}</span>
              <span className="text-red-500 text-xs">
                <ArrowUpCircle size={12} className="text-red-500 inline" />
              </span>
            </div>
            <p className="text-gray-500 text-xs">+12% from last quarter</p>
          </div>
          {/* ...other summary cards... */}
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <h2 className="text-xs font-medium text-blue-700 mb-1">Posted</h2>
            <div className="flex items-end gap-1">
              <span className="text-xl font-bold">{recruitingData.postedPositions}</span>
              <span className="text-green-500 text-xs">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </span>
            </div>
            <p className="text-gray-500 text-xs">70% of open roles</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <h2 className="text-xs font-medium text-blue-700 mb-1">Not Posted</h2>
            <div className="flex items-end gap-1">
              <span className="text-xl font-bold">{recruitingData.notPostedPositions}</span>
              <span className="text-yellow-500 text-xs">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </span>
            </div>
            <p className="text-gray-500 text-xs">30% of open roles</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <h2 className="text-xs font-medium text-blue-700 mb-1">New Hires YTD</h2>
            <div className="flex items-center gap-1 mb-1">
              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
              <span className="text-xl font-bold">{recruitingData.newHiresYTD}</span>
            </div>
            <p className="text-gray-500 text-xs">+8% vs last year</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <h2 className="text-xs font-medium text-blue-700 mb-1">Cost per Hire</h2>
            <div className="text-xl font-bold">${recruitingData.costPerHire.toLocaleString()}</div>
            <p className="text-gray-500 text-xs">-5% from last year</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <h2 className="text-sm font-medium text-blue-700 mb-2">Open Positions by Department</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-1">Department</th>
                    <th className="text-center p-1">Open</th>
                    <th className="text-center p-1">Posted</th>
                    <th className="text-center p-1">Not Posted</th>
                    <th className="text-center p-1">Filled YTD</th>
                  </tr>
                </thead>
                <tbody>
                  {openPositionsByDept.map((dept, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-1 font-medium">{dept.name}</td>
                      <td className="p-1 text-center">{dept.open}</td>
                      <td className="p-1 text-center">{dept.posted}</td>
                      <td className="p-1 text-center">
                        <span className={dept.notPosted > 6 ? "text-red-600 font-medium" : "text-gray-700"}>
                          {dept.notPosted}
                        </span>
                      </td>
                      <td className="p-1 text-center">{dept.filled}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-medium">
                  <tr>
                    <td className="p-1">Total</td>
                    <td className="p-1 text-center">{recruitingData.totalOpenPositions}</td>
                    <td className="p-1 text-center">{recruitingData.postedPositions}</td>
                    <td className="p-1 text-center">{recruitingData.notPostedPositions}</td>
                    <td className="p-1 text-center">{recruitingData.newHiresYTD}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <h2 className="text-sm font-medium text-blue-700 mb-2">Source of Hires (YTD)</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                layout="vertical"
                data={hireSourceData}
                margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{fontSize: 10}} />
                <YAxis dataKey="source" type="category" tick={{fontSize: 10}} />
                <Tooltip contentStyle={{fontSize: 10}} />
                <Bar dataKey="hires" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time to Fill Trend */}
        <div className="bg-white p-3 rounded-lg shadow-sm border mb-3">
          <h2 className="text-sm font-medium text-blue-700 mb-2">Time to Fill Trend</h2>
          <ResponsiveContainer width="100%" height={160}>
            <ComposedChart data={timeToFillData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" tick={{fontSize: 10}} />
              <YAxis tick={{fontSize: 10}} domain={[35, 55]} />
              <Tooltip contentStyle={{fontSize: 10}} />
              <Legend wrapperStyle={{fontSize: 10}} />
              <Bar dataKey="avgDays" fill="#0088FE" name="Avg Days to Fill" />
              <Line type="monotone" dataKey="target" stroke="#FF8042" name="Target" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* TODO: Add export, print, and accessibility features as in other dashboards */}
    </div>
  );
};

export default RecruitingDashboard; 