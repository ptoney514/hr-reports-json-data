import React from 'react';
import { Users, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getQuarterlyWorkforceData } from '../../services/dataService';

/**
 * Q1 FY26 Ethnicity Distribution Report
 * Standalone page extracting ethnicity donut charts from DemographicsQ1FY26Dashboard
 *
 * Data Source: source-metrics/workforce/raw/FY26_Q1/
 * Methodology: WORKFORCE_METHODOLOGY.md v2.0
 */
const EthnicityDistributionQ1 = () => {
  const data = getQuarterlyWorkforceData("2025-09-30");

  return (
    <div id="ethnicity-q1-dashboard" className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">

        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Users style={{color: '#0054A6'}} size={32} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {data.quarter} Ethnicity Distribution Report
                  </h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Benefit Eligible Employees • {data.fiscalPeriod}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Ethnicity distribution analysis for faculty and staff
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold" style={{color: '#0054A6'}}>
                  {(data.summary.faculty.count + data.summary.staff.count).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-medium">Benefit Eligible Employees</div>
                <div className="text-xs text-gray-500 mt-1">
                  Faculty: {data.summary.faculty.count} | Staff: {data.summary.staff.count.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ethnicity Distribution - Two Pie Charts */}
        {data.demographics?.ethnicity && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Faculty Ethnicity Distribution */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">
              Ethnicity Distribution for Benefit Eligible Faculty
            </h2>

            <div className="flex flex-col items-center relative">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={data.demographics.ethnicity.faculty.distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={1}
                    dataKey="count"
                    label={(entry) => {
                      const d = entry.payload || entry;
                      return d.percentage >= 2 ? `${d.count} (${d.percentage}%)` : null;
                    }}
                    labelLine={true}
                    style={{ fontSize: '12px', fontWeight: '500' }}
                  >
                    {data.demographics.ethnicity.faculty.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(_, __, props) => [
                      `${props.payload.count} (${props.payload.percentage}%)`,
                      props.payload.ethnicity
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Label */}
              <div className="absolute top-[175px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">{data.demographics.ethnicity.faculty.total}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">TOTAL</div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 w-full">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  {data.demographics.ethnicity.faculty.distribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{backgroundColor: item.color}}></div>
                      <span className="text-gray-700">{item.ethnicity}: <strong>{item.count}</strong> ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Staff Ethnicity Distribution */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">
              Ethnicity Distribution for Benefit Eligible Staff
            </h2>

            <div className="flex flex-col items-center relative">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={data.demographics.ethnicity.staff.distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={1}
                    dataKey="count"
                    label={(entry) => {
                      const d = entry.payload || entry;
                      return d.percentage >= 2 ? `${d.count} (${d.percentage}%)` : null;
                    }}
                    labelLine={true}
                    style={{ fontSize: '12px', fontWeight: '500' }}
                  >
                    {data.demographics.ethnicity.staff.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(_, __, props) => [
                      `${props.payload.count} (${props.payload.percentage}%)`,
                      props.payload.ethnicity
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Label */}
              <div className="absolute top-[175px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">{data.demographics.ethnicity.staff.total.toLocaleString()}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">TOTAL</div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 w-full">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  {data.demographics.ethnicity.staff.distribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{backgroundColor: item.color}}></div>
                      <span className="text-gray-700">{item.ethnicity}: <strong>{item.count}</strong> ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
        )}

        {/* Data Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText style={{color: '#0054A6'}} size={20} />
            Data Information
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Data as of:</strong> 2025-09-30
          </p>
          <p className="text-sm text-gray-600">
            <strong>Data Sources:</strong> Oracle HCM
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <strong>Methodology:</strong> WORKFORCE_METHODOLOGY.md
          </p>
        </div>

      </div>
    </div>
  );
};

export default EthnicityDistributionQ1;
