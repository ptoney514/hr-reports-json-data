import React from 'react';
import { Users, BarChart3, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getQuarterlyWorkforceData } from '../../data/staticData';

/**
 * Q1 FY26 Workforce Demographics Dashboard
 * Displays demographic breakdowns for benefit-eligible faculty and staff
 *
 * Data Source: source-metrics/workforce/raw/FY26_Q1/ (Calculated from raw Excel)
 * Methodology: WORKFORCE_METHODOLOGY.md v2.0 (Person Type + Assignment Category)
 * Design System Reference: docs/QUARTERLY_REPORTS_DESIGN_SYSTEM.md
 */

const DemographicsQ1FY26Dashboard = () => {
  // Load Q1 FY26 workforce data from staticData.js
  const data = getQuarterlyWorkforceData("2025-09-30");

  return (
    <div id="demographics-q1-fy26-dashboard" className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">

        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Users style={{color: '#0054A6'}} size={32} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {data.quarter} Workforce Demographics Report
                  </h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Benefit Eligible Employees • {data.fiscalPeriod}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Ethnicity and age/gender distribution analysis for faculty and staff
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold" style={{color: '#0054A6'}}>
                  {data.summary.total.count.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total {data.quarter} Employees</div>
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
              {/* Donut Chart */}
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
                      const data = entry.payload || entry;
                      return data.percentage >= 2 ? `${data.count} (${data.percentage}%)` : null;
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
              {/* Donut Chart */}
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
                      const data = entry.payload || entry;
                      return data.percentage >= 2 ? `${data.count} (${data.percentage}%)` : null;
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

        {/* Age/Gender Distribution - Diverging Bar Chart */}
        {data.demographics?.ageGender && (
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Age/Gender Distribution
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Faculty Age/Gender - Diverging Chart */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Faculty ({data.demographics.ageGender.faculty.total} total)
              </h3>
              <div className="text-sm text-center mb-6">
                <span className="text-pink-600 font-medium">♀ {data.demographics.ageGender.faculty.femalePercentage}% Female</span>
                <span className="text-gray-400 mx-2">|</span>
                <span className="text-blue-600 font-medium">♂ {data.demographics.ageGender.faculty.malePercentage}% Male</span>
              </div>

              {/* Diverging bar chart - females left, males right */}
              <div className="relative">
                {/* Vertical grid lines */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {/* Left side grid lines */}
                  <div className="flex-1 flex justify-between pr-10">
                    {[0, 50, 100, 150].reverse().map((_, idx) => (
                      <div key={`left-${idx}`} className="border-l border-gray-200 h-full"></div>
                    ))}
                  </div>
                  {/* Center spacing (no line) */}
                  <div className="w-16"></div>
                  {/* Right side grid lines */}
                  <div className="flex-1 flex justify-between pl-10">
                    {[0, 50, 100, 150].map((_, idx) => (
                      <div key={`right-${idx}`} className="border-l border-gray-200 h-full"></div>
                    ))}
                  </div>
                </div>

                {/* Age bands - reverse order for display (61+ at top) */}
                <div className="relative space-y-2">
                  {[...data.demographics.ageGender.faculty.ageGenderBreakdown].reverse().map((ageBand, index) => {
                    const maxCount = 150; // Max scale for each side
                    return (
                      <div key={index} className="flex items-center gap-2">
                        {/* Female bar (extends left from center) */}
                        <div className="flex-1 flex justify-end pr-2">
                          <div
                            className="bg-pink-500 h-10 flex items-center justify-center text-white text-xs font-medium rounded"
                            style={{ width: `${(ageBand.female / maxCount) * 100}%` }}
                          >
                            {ageBand.female >= 15 && ageBand.female}
                          </div>
                        </div>

                        {/* Age band label (center) */}
                        <div className="w-16 text-sm text-gray-700 font-medium text-center bg-white z-10">{ageBand.ageBand}</div>

                        {/* Male bar (extends right from center) */}
                        <div className="flex-1 pl-2">
                          <div
                            className="bg-blue-500 h-10 flex items-center justify-center text-white text-xs font-medium rounded"
                            style={{ width: `${(ageBand.male / maxCount) * 100}%` }}
                          >
                            {ageBand.male >= 15 && ageBand.male}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* X-axis scale labels */}
                <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                  <div className="flex-1 flex justify-between text-right pr-2">
                    <span>150</span>
                    <span>100</span>
                    <span>50</span>
                    <span>0</span>
                  </div>
                  <div className="w-16 text-center font-semibold">0</div>
                  <div className="flex-1 flex justify-between text-left pl-2">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                    <span>150</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Staff Age/Gender - Diverging Chart */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Staff ({data.demographics.ageGender.staff.total.toLocaleString()} total)
              </h3>
              <div className="text-sm text-center mb-6">
                <span className="text-pink-600 font-medium">♀ {data.demographics.ageGender.staff.femalePercentage}% Female</span>
                <span className="text-gray-400 mx-2">|</span>
                <span className="text-blue-600 font-medium">♂ {data.demographics.ageGender.staff.malePercentage}% Male</span>
              </div>

              {/* Diverging bar chart - females left, males right */}
              <div className="relative">
                {/* Vertical grid lines */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {/* Left side grid lines */}
                  <div className="flex-1 flex justify-between pr-10">
                    {[0, 100, 200].reverse().map((_, idx) => (
                      <div key={`left-${idx}`} className="border-l border-gray-200 h-full"></div>
                    ))}
                  </div>
                  {/* Center spacing (no line) */}
                  <div className="w-16"></div>
                  {/* Right side grid lines */}
                  <div className="flex-1 flex justify-between pl-10">
                    {[0, 100, 200].map((_, idx) => (
                      <div key={`right-${idx}`} className="border-l border-gray-200 h-full"></div>
                    ))}
                  </div>
                </div>

                {/* Age bands - reverse order for display (61+ at top) */}
                <div className="relative space-y-2">
                  {[...data.demographics.ageGender.staff.ageGenderBreakdown].reverse().map((ageBand, index) => {
                    const maxCount = 250; // Max scale for each side (staff has larger numbers)
                    return (
                      <div key={index} className="flex items-center gap-2">
                        {/* Female bar (extends left from center) */}
                        <div className="flex-1 flex justify-end pr-2">
                          <div
                            className="bg-pink-500 h-10 flex items-center justify-center text-white text-xs font-medium rounded"
                            style={{ width: `${(ageBand.female / maxCount) * 100}%` }}
                          >
                            {ageBand.female >= 30 && ageBand.female}
                          </div>
                        </div>

                        {/* Age band label (center) */}
                        <div className="w-16 text-sm text-gray-700 font-medium text-center bg-white z-10">{ageBand.ageBand}</div>

                        {/* Male bar (extends right from center) */}
                        <div className="flex-1 pl-2">
                          <div
                            className="bg-blue-500 h-10 flex items-center justify-center text-white text-xs font-medium rounded"
                            style={{ width: `${(ageBand.male / maxCount) * 100}%` }}
                          >
                            {ageBand.male >= 30 && ageBand.male}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* X-axis scale labels */}
                <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                  <div className="flex-1 flex justify-between text-right pr-2">
                    <span>250</span>
                    <span>200</span>
                    <span>100</span>
                    <span>0</span>
                  </div>
                  <div className="w-16 text-center font-semibold">0</div>
                  <div className="flex-1 flex justify-between text-left pl-2">
                    <span>0</span>
                    <span>100</span>
                    <span>200</span>
                    <span>250</span>
                  </div>
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

export default DemographicsQ1FY26Dashboard;
