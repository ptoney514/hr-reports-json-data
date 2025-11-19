import React from 'react';
import { Users, UserCheck, Briefcase, BarChart3, MapPin, GraduationCap, Stethoscope } from 'lucide-react';
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

        {/* Workforce by Employee Group */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 style={{color: '#0054A6'}} size={20} />
            Workforce by Employee Group
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

        {/* Location Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin style={{color: '#0054A6'}} size={20} />
            Workforce by Location
          </h2>

          {/* Chart Area */}
          <div className="relative" style={{ height: '360px' }}>
            {/* Y-axis with horizontal grid lines */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
              {[5000, 4000, 3000, 2000, 1000, 0].map((step, index) => (
                <div key={index} className="relative">
                  <span className="absolute -left-2 -top-2">{step}</span>
                </div>
              ))}
            </div>

            {/* Horizontal grid lines */}
            <div className="absolute left-12 right-0 top-0 bottom-0">
              {[0, 1000, 2000, 3000, 4000, 5000].map((step, index) => (
                <div
                  key={index}
                  className="absolute left-0 right-0 border-t border-gray-200"
                  style={{ bottom: `${(step / 5000) * 100}%` }}
                />
              ))}
            </div>

            {/* Vertical Stacked Bar Chart */}
            <div className="absolute left-12 right-0 bottom-0 flex items-end justify-center gap-24" style={{ height: '320px' }}>
              {/* OMA Bar */}
              <div className="flex flex-col items-center" style={{ width: '200px' }}>
                <div className="text-base font-semibold text-gray-900 mb-2">
                  {data.locationDetails.omaha.total.toLocaleString()}
                </div>
                <div className="w-full relative flex flex-col-reverse">
                  {/* Faculty segment (bottom, green) */}
                  <div
                    className="w-full bg-green-500 flex items-center justify-center text-white text-sm font-medium"
                    style={{ height: `${(data.locationDetails.omaha.faculty / 5000) * 320}px` }}
                  >
                    {data.locationDetails.omaha.faculty >= 50 && data.locationDetails.omaha.faculty}
                  </div>

                  {/* Staff segment */}
                  <div
                    className="w-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium"
                    style={{ height: `${(data.locationDetails.omaha.staff / 5000) * 320}px` }}
                  >
                    {data.locationDetails.omaha.staff >= 50 && data.locationDetails.omaha.staff.toLocaleString()}
                  </div>

                  {/* HSP segment */}
                  <div
                    className="w-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium"
                    style={{ height: `${(data.locationDetails.omaha.hsp / 5000) * 320}px` }}
                  >
                    {data.locationDetails.omaha.hsp >= 50 && data.locationDetails.omaha.hsp}
                  </div>

                  {/* Students segment */}
                  <div
                    className="w-full bg-yellow-500 flex items-center justify-center text-white text-sm font-medium"
                    style={{ height: `${(data.locationDetails.omaha.students / 5000) * 320}px` }}
                  >
                    {data.locationDetails.omaha.students >= 50 && data.locationDetails.omaha.students.toLocaleString()}
                  </div>

                  {/* Temp segment (top) */}
                  <div
                    className="w-full bg-gray-500 flex items-center justify-center text-white text-sm font-medium"
                    style={{ height: `${(data.locationDetails.omaha.temp / 5000) * 320}px` }}
                  >
                    {data.locationDetails.omaha.temp >= 50 && data.locationDetails.omaha.temp}
                  </div>
                </div>

                {/* Location label */}
                <div className="text-sm text-gray-700 mt-3 text-center">
                  Omaha
                </div>
              </div>

              {/* PHX Bar */}
              <div className="flex flex-col items-center" style={{ width: '200px' }}>
                <div className="text-base font-semibold text-gray-900 mb-2">
                  {data.locationDetails.phoenix.total}
                </div>
                <div className="w-full relative flex flex-col-reverse">
                  {/* Faculty segment (bottom, green) */}
                  <div
                    className="w-full bg-green-500 flex items-center justify-center text-white text-sm font-medium"
                    style={{ height: `${(data.locationDetails.phoenix.faculty / 5000) * 320}px` }}
                  >
                    {data.locationDetails.phoenix.faculty >= 50 && data.locationDetails.phoenix.faculty}
                  </div>

                  {/* Staff segment */}
                  <div
                    className="w-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium"
                    style={{ height: `${(data.locationDetails.phoenix.staff / 5000) * 320}px` }}
                  >
                    {data.locationDetails.phoenix.staff >= 50 && data.locationDetails.phoenix.staff}
                  </div>

                  {/* HSP segment */}
                  <div
                    className="w-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium"
                    style={{ height: `${(data.locationDetails.phoenix.hsp / 5000) * 320}px` }}
                  >
                    {data.locationDetails.phoenix.hsp >= 50 && data.locationDetails.phoenix.hsp}
                  </div>

                  {/* Students segment */}
                  <div
                    className="w-full bg-yellow-500 flex items-center justify-center text-white text-sm font-medium"
                    style={{ height: `${(data.locationDetails.phoenix.students / 5000) * 320}px` }}
                  >
                    {data.locationDetails.phoenix.students >= 50 && data.locationDetails.phoenix.students}
                  </div>

                  {/* Temp segment (top) */}
                  <div
                    className="w-full bg-gray-500 flex items-center justify-center text-white text-sm font-medium"
                    style={{ height: `${(data.locationDetails.phoenix.temp / 5000) * 320}px` }}
                  >
                    {data.locationDetails.phoenix.temp >= 50 && data.locationDetails.phoenix.temp}
                  </div>
                </div>

                {/* Location label */}
                <div className="text-sm text-gray-700 mt-3 text-center">
                  Phoenix
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex justify-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-700">Faculty</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span className="text-gray-700">Staff</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-600 rounded"></div>
              <span className="text-gray-700">House Staff</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-gray-700">Students</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span className="text-gray-700">Temporary</span>
            </div>
          </div>

          {/* Data Note */}
          <div className="text-xs text-gray-600 mt-6 bg-blue-50 p-3 rounded border border-blue-200 text-center">
            <span className="font-semibold">Note:</span> Location distribution shows {headcountData.total.count.toLocaleString()} total employees across Omaha ({data.locationDetails.omaha.total.toLocaleString()}) and Phoenix ({data.locationDetails.phoenix.total}) campuses as of end of {data.quarter}.
          </div>
        </div>

        {/* Future: Additional workforce charts and visualizations will go here */}

      </div>
    </div>
  );
};

export default WorkforceQ1FY26Dashboard;
