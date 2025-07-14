import React from 'react';
import { Building, TrendingUp } from 'lucide-react';

const EmployeeDetailedBreakdown = ({ stats }) => {
  const topSchools = stats.schools.slice(0, 3);
  const topAssignmentCodes = Object.entries(stats.byAssignmentCode)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-6 mb-6">
      {/* Detailed Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Schools */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-500" />
            Top Schools/Divisions
          </h3>
          <div className="space-y-3">
            {topSchools.length > 0 ? (
              topSchools.map(({ school, total, faculty, staff }) => (
                <div key={school} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{school}</p>
                    <p className="text-sm text-gray-600">
                      Faculty: {faculty} | Staff: {staff}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{total}</p>
                    <p className="text-xs text-gray-500">
                      {stats.total > 0 ? `${((total / stats.total) * 100).toFixed(1)}%` : '0%'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No school data available</p>
            )}
          </div>
        </div>

        {/* Top Assignment Codes */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Top Assignment Codes
          </h3>
          <div className="space-y-3">
            {topAssignmentCodes.length > 0 ? (
              topAssignmentCodes.map(([code, count]) => (
                <div key={code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{code || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">Assignment Category</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{count}</p>
                    <p className="text-xs text-gray-500">
                      {stats.total > 0 ? `${((count / stats.total) * 100).toFixed(1)}%` : '0%'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No assignment code data available</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default EmployeeDetailedBreakdown;