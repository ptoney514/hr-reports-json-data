import React from 'react';
import { Users, UserCheck, Briefcase, BarChart3, MapPin, GraduationCap, Stethoscope, FileText, TrendingDown, TrendingUp, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getQuarterlyWorkforceData } from '../../data/staticData';

/**
 * Q1 FY26 Workforce and Headcount Dashboard
 * Displays quarterly workforce composition and headcount analysis
 *
 * Data Source: source-metrics/workforce/raw/FY26_Q1/ (Calculated from raw Excel)
 * Methodology: WORKFORCE_METHODOLOGY.md v2.0 (Person Type + Assignment Category)
 * Design System Reference: docs/QUARTERLY_REPORTS_DESIGN_SYSTEM.md
 */
const WorkforceQ1FY26Dashboard = () => {
  // Load Q1 FY26 workforce data from staticData.js (calculated from raw Excel)
  const data = getQuarterlyWorkforceData("2025-09-30");

  const headcountData = data.summary;

  // Employee Group Distribution - Use data from employeeGroups
  const employeeGroupData = data.employeeGroups;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">

        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Users style={{color: '#0054A6'}} size={32} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {data.quarter} Workforce and Headcount Report
                  </h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Quarterly Workforce Analysis • {data.fiscalPeriod}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Employee headcount, workforce composition, and organizational trends
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold" style={{color: '#0054A6'}}>
                  {headcountData.total.count.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total {data.quarter} Headcount</div>
                <div className="text-xs text-gray-500 mt-1">
                  Faculty: {headcountData.faculty.count} | Staff: {headcountData.staff.count}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Headcount Metric Cards - 6 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">

          {/* Total Headcount Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Users style={{color: '#0054A6'}} size={20} />
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 font-medium uppercase">
                Total
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{headcountData.total.count.toLocaleString()}</div>
            <div className="text-xs text-gray-600 font-medium mb-2">Total Headcount</div>
            <div className="text-xs text-gray-500">
              OMA: {headcountData.total.oma.toLocaleString()} | PHX: {headcountData.total.phx}
            </div>
          </div>

          {/* Benefit Eligible Faculty Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <UserCheck style={{color: '#0054A6'}} size={20} />
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 font-medium uppercase">
                Faculty
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{headcountData.faculty.count}</div>
            <div className="text-xs text-gray-600 font-medium mb-2">Benefit Eligible Faculty</div>
            <div className="text-xs text-gray-500">
              OMA: {headcountData.faculty.oma} | PHX: {headcountData.faculty.phx}
            </div>
          </div>

          {/* Benefit Eligible Staff Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Briefcase style={{color: '#0054A6'}} size={20} />
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium uppercase">
                Staff
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{headcountData.staff.count.toLocaleString()}</div>
            <div className="text-xs text-gray-600 font-medium mb-2">Benefit Eligible Staff</div>
            <div className="text-xs text-gray-500">
              OMA: {headcountData.staff.oma.toLocaleString()} | PHX: {headcountData.staff.phx}
            </div>
          </div>

          {/* House Staff Physicians Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Stethoscope style={{color: '#0054A6'}} size={20} />
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium uppercase">
                HSP
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{headcountData.houseStaffPhysicians.count}</div>
            <div className="text-xs text-gray-600 font-medium mb-2">House Staff Physicians</div>
            <div className="text-xs text-gray-500">
              OMA: {headcountData.houseStaffPhysicians.oma} | PHX: {headcountData.houseStaffPhysicians.phx}
            </div>
          </div>

          {/* Student Workers Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <GraduationCap style={{color: '#0054A6'}} size={20} />
              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium uppercase">
                Students
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{headcountData.studentWorkers.count.toLocaleString()}</div>
            <div className="text-xs text-gray-600 font-medium mb-2">Student Workers</div>
            <div className="text-xs text-gray-500">
              OMA: {headcountData.studentWorkers.oma.toLocaleString()} | PHX: {headcountData.studentWorkers.phx}
            </div>
          </div>

          {/* Temporary Employees Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Users style={{color: '#0054A6'}} size={20} />
              <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800 font-medium uppercase">
                Temp
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{headcountData.temporary.count}</div>
            <div className="text-xs text-gray-600 font-medium mb-2">Temporary Employees</div>
            <div className="text-xs text-gray-500">
              OMA: {headcountData.temporary.oma} | PHX: {headcountData.temporary.phx}
            </div>
          </div>

        </div>

        {/* Workforce by Employee Type */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 style={{color: '#0054A6'}} size={20} />
            Workforce by Employee Type
          </h2>

          {/* Chart Area */}
          <div className="relative" style={{ height: '360px' }}>
            {/* Y-axis with horizontal grid lines */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
              {[2400, 2000, 1600, 1200, 800, 400, 0].map((step, index) => (
                <div key={index} className="relative">
                  <span className="absolute -left-2 -top-2">{step}</span>
                </div>
              ))}
            </div>

            {/* Horizontal grid lines */}
            <div className="absolute left-12 right-0 top-0 bottom-0">
              {[0, 400, 800, 1200, 1600, 2000, 2400].map((step, index) => (
                <div
                  key={index}
                  className="absolute left-0 right-0 border-t border-gray-200"
                  style={{ bottom: `${(step / 2400) * 100}%` }}
                />
              ))}
            </div>

            {/* Vertical Stacked Bar Chart */}
            <div className="absolute left-12 right-0 bottom-0 flex items-end justify-around" style={{ height: '320px' }}>
              {employeeGroupData.map((group, index) => {
                // Calculate bar height as percentage of chart height based on y-axis max (2400)
                const barHeightPx = (group.total / 2400) * 320;

                return (
                  <div key={index} className="flex flex-col items-center" style={{ width: '14%' }}>
                    {/* Total label above bar */}
                    <div className="text-base font-semibold text-gray-900 mb-1">
                      {group.total.toLocaleString()}
                    </div>

                    {/* Bar */}
                    <div
                      className="w-full flex items-center justify-center text-white text-sm font-medium bg-blue-600"
                      style={{ height: `${barHeightPx}px` }}
                    >
                      {group.total >= 50 && group.total}
                    </div>

                    {/* Group label */}
                    <div className="text-xs text-gray-600 mt-2 text-center leading-tight">
                      {group.group}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data Note */}
          <div className="text-xs text-gray-600 mt-6 bg-blue-50 p-3 rounded border border-blue-200 text-center">
            <span className="font-semibold">Note:</span> Workforce composition shows all employee categories as of end of {data.quarter}.
          </div>
        </div>

        {/* Campus Comparison by Employee Type */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin style={{color: '#0054A6'}} size={20} />
            Campus Comparison by Employee Type
          </h2>

          {/* Legend */}
          <div className="mb-6 flex justify-center gap-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">Staff</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Faculty</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-700">Students</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-700">House Staff</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-700">Non-Benefit</span>
            </div>
          </div>

          {/* Horizontal Stacked Bar Chart */}
          <div className="space-y-8">
            {/* X-axis scale */}
            <div className="relative">
              <div className="flex justify-between text-xs text-gray-500 mb-2 px-32">
                <span>0</span>
                <span>500</span>
                <span>1,000</span>
                <span>1,500</span>
                <span>2,000</span>
                <span>2,500</span>
                <span>3,000</span>
                <span>3,500</span>
                <span>4,000</span>
                <span>4,500</span>
              </div>

              {/* Vertical grid lines */}
              <div className="absolute top-6 left-32 right-32 bottom-0 flex justify-between pointer-events-none">
                {[0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500].map((_, idx) => (
                  <div key={idx} className="border-l border-gray-200 h-full"></div>
                ))}
              </div>

              {/* Omaha Bar */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-700 font-medium text-right">Omaha (OMA)</div>
                  <div className="flex-1 relative">
                    <div className="flex h-12 rounded overflow-hidden">
                      {/* Staff - Blue */}
                      <div
                        className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${(data.locationDetails.omaha.staff / 5000) * 100}%` }}
                      >
                        {data.locationDetails.omaha.staff >= 120 && data.locationDetails.omaha.staff.toLocaleString()}
                      </div>
                      {/* Faculty - Green */}
                      <div
                        className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${(data.locationDetails.omaha.faculty / 5000) * 100}%` }}
                      >
                        {data.locationDetails.omaha.faculty >= 120 && data.locationDetails.omaha.faculty}
                      </div>
                      {/* Students - Purple */}
                      <div
                        className="bg-purple-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${(data.locationDetails.omaha.students / 5000) * 100}%` }}
                      >
                        {data.locationDetails.omaha.students >= 120 && data.locationDetails.omaha.students.toLocaleString()}
                      </div>
                      {/* House Staff - Orange */}
                      <div
                        className="bg-orange-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${(data.locationDetails.omaha.hsp / 5000) * 100}%` }}
                      >
                        {data.locationDetails.omaha.hsp >= 120 && data.locationDetails.omaha.hsp}
                      </div>
                      {/* Temporary - Red */}
                      <div
                        className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${(data.locationDetails.omaha.temp / 5000) * 100}%` }}
                      >
                        {data.locationDetails.omaha.temp >= 120 && data.locationDetails.omaha.temp}
                      </div>
                    </div>
                  </div>
                  <div className="w-20 text-right text-base font-bold text-gray-900">
                    {data.locationDetails.omaha.total.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Phoenix Bar */}
              <div>
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-700 font-medium text-right">Phoenix (PHX)</div>
                  <div className="flex-1 relative">
                    <div className="flex h-12 rounded overflow-hidden">
                      {/* Staff - Blue */}
                      <div
                        className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${(data.locationDetails.phoenix.staff / 5000) * 100}%` }}
                      >
                        {data.locationDetails.phoenix.staff >= 120 && data.locationDetails.phoenix.staff}
                      </div>
                      {/* Faculty - Green */}
                      <div
                        className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${(data.locationDetails.phoenix.faculty / 5000) * 100}%` }}
                      >
                        {data.locationDetails.phoenix.faculty >= 120 && data.locationDetails.phoenix.faculty}
                      </div>
                      {/* Students - Purple */}
                      <div
                        className="bg-purple-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${(data.locationDetails.phoenix.students / 5000) * 100}%` }}
                      >
                        {data.locationDetails.phoenix.students >= 120 && data.locationDetails.phoenix.students}
                      </div>
                      {/* House Staff - Orange */}
                      <div
                        className="bg-orange-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${(data.locationDetails.phoenix.hsp / 5000) * 100}%` }}
                      >
                        {data.locationDetails.phoenix.hsp >= 120 && data.locationDetails.phoenix.hsp}
                      </div>
                      {/* Temporary - Red */}
                      <div
                        className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${(data.locationDetails.phoenix.temp / 5000) * 100}%` }}
                      >
                        {data.locationDetails.phoenix.temp >= 120 && data.locationDetails.phoenix.temp}
                      </div>
                    </div>
                  </div>
                  <div className="w-20 text-right text-base font-bold text-gray-900">
                    {data.locationDetails.phoenix.total}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Note */}
          <div className="text-xs text-gray-600 mt-6 bg-blue-50 p-3 rounded border border-blue-200 text-center">
            <span className="font-semibold">Note:</span> Campus comparison shows {headcountData.total.count.toLocaleString()} total employees across Omaha ({data.locationDetails.omaha.total.toLocaleString()}) and Phoenix ({data.locationDetails.phoenix.total}) campuses as of end of {data.quarter}.
          </div>
        </div>

        {/* Ethnicity Distribution - Two Pie Charts */}
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

        {/* Age/Gender Distribution - Diverging Bar Chart */}
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

        {/* Executive Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText style={{color: '#0054A6'}} size={24} />
            Executive Summary
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Key Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-4">Key Metrics</h3>
              <div className="space-y-3">

                {/* Net headcount decrease */}
                <div className="flex items-start gap-3">
                  <TrendingDown className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">8 net headcount decrease</span> from prior quarter (-0.3%)
                  </div>
                </div>

                {/* Total benefit-eligible */}
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">2,741 total benefit-eligible employees</span> as of 09/30/2025
                  </div>
                </div>

                {/* Faculty increase */}
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">697 benefit-eligible faculty</span> up 8 from prior quarter (+1.2%)
                  </div>
                </div>

                {/* Staff decrease */}
                <div className="flex items-start gap-3">
                  <TrendingDown className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">1,431 benefit-eligible staff</span> down 17 from prior quarter (-1.2%)
                  </div>
                </div>

                {/* Omaha campus */}
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">82.3% Omaha campus employees</span> 2,257 of 2,741 benefit-eligible workforce
                  </div>
                </div>

              </div>
            </div>

            {/* Critical Insights */}
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-4">Critical Insights</h3>
              <div className="space-y-3">

                {/* Faculty succession planning */}
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">Faculty succession planning needs:</span> 25.7% of faculty are 61+ (179 of 697)
                  </div>
                </div>

                {/* Faculty gender balance */}
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">Faculty gender balance positive:</span> 52.9% female representation (369 of 697)
                  </div>
                </div>

                {/* House Staff concentration */}
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">House Staff concentration:</span> 22.4% of benefit-eligible workforce (613 positions)
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default WorkforceQ1FY26Dashboard;
