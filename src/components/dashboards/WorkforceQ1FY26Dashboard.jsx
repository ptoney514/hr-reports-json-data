import React from 'react';
import { MapPin } from 'lucide-react';
import { ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { getQuarterlyWorkforceData, QUARTERLY_HEADCOUNT_TRENDS } from '../../services/dataService';
import { useQuarter } from '../../contexts/QuarterContext';
import NoDataForQuarter from '../ui/NoDataForQuarter';

/**
 * Q1 FY26 Workforce and Headcount Dashboard
 * Displays quarterly workforce composition and headcount analysis
 *
 * Data Source: source-metrics/workforce/raw/FY26_Q1/ (Calculated from raw Excel)
 * Methodology: WORKFORCE_METHODOLOGY.md v2.0 (Person Type + Assignment Category)
 * Design System Reference: docs/QUARTERLY_REPORTS_DESIGN_SYSTEM.md
 */

// Helper to generate common Line chart props for secondary trend lines (dashed style)

const WorkforceQ1FY26Dashboard = () => {
  const { selectedQuarter } = useQuarter();

  // Load workforce data based on selected quarter
  const data = getQuarterlyWorkforceData(selectedQuarter);

  if (!data) {
    return <NoDataForQuarter dataLabel="Workforce data" />;
  }

  const headcountData = data.summary;

  // Employee Group Distribution - Use data from employeeGroups


  return (
    <div id="workforce-q1-fy26-dashboard" className="min-h-screen print:bg-white print:min-h-0">
      <div className="w-[85%] max-w-[1280px] mx-auto pt-5 pb-8 space-y-3 print:w-full print:max-w-none print:px-2 print:py-1 print:space-y-2">
        {/* Headcount Metric Cards - 6 Cards */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3" role="region" aria-label="Key performance indicators">

          {/* Total Headcount Card */}
          <div className="bg-white rounded-lg shadow-sm border p-3 border-t-4 border-t-blue-500">
            <h2 className="text-sm font-semibold text-gray-500 uppercase">Total Headcount</h2>
            <div className="text-3xl font-bold text-gray-900">{headcountData.total.count.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">
              OMA: {headcountData.total.oma.toLocaleString()} | PHX: {headcountData.total.phx}
            </div>
          </div>

          {/* Benefit Eligible Faculty Card */}
          <div className="bg-white rounded-lg shadow-sm border p-3 border-t-4 border-t-purple-500">
            <h2 className="text-sm font-semibold text-gray-500 uppercase">BE Faculty</h2>
            <div className="text-3xl font-bold text-gray-900">{headcountData.faculty.count}</div>
            <div className="text-xs text-gray-500 mt-1">
              OMA: {headcountData.faculty.oma} | PHX: {headcountData.faculty.phx}
            </div>
          </div>

          {/* Benefit Eligible Staff Card */}
          <div className="bg-white rounded-lg shadow-sm border p-3 border-t-4 border-t-green-500">
            <h2 className="text-sm font-semibold text-gray-500 uppercase">BE Staff</h2>
            <div className="text-3xl font-bold text-gray-900">{headcountData.staff.count.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">
              OMA: {headcountData.staff.oma.toLocaleString()} | PHX: {headcountData.staff.phx}
            </div>
          </div>

          {/* House Staff Physicians Card */}
          <div className="bg-white rounded-lg shadow-sm border p-3 border-t-4 border-t-cyan-500">
            <h2 className="text-sm font-semibold text-gray-500 uppercase">House Staff</h2>
            <div className="text-3xl font-bold text-gray-900">{headcountData.houseStaffPhysicians.count}</div>
            <div className="text-xs text-gray-500 mt-1">
              OMA: {headcountData.houseStaffPhysicians.oma} | PHX: {headcountData.houseStaffPhysicians.phx}
            </div>
          </div>

          {/* Non-Benefit Eligible Card */}
          <div className="bg-white rounded-lg shadow-sm border p-3 border-t-4 border-t-orange-500">
            <h2 className="text-sm font-semibold text-gray-500 uppercase">Non-Benefit Eligible</h2>
            <div className="text-3xl font-bold text-gray-900">{headcountData.temporary.count}</div>
            <div className="text-xs text-gray-500 mt-1">
              OMA: {headcountData.temporary.oma} | PHX: {headcountData.temporary.phx}
            </div>
          </div>

          {/* Student Workers Card */}
          <div className="bg-white rounded-lg shadow-sm border p-3 border-t-4 border-t-yellow-500">
            <h2 className="text-sm font-semibold text-gray-500 uppercase">Student Workers</h2>
            <div className="text-3xl font-bold text-gray-900">{headcountData.studentWorkers.count.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">
              OMA: {headcountData.studentWorkers.oma.toLocaleString()} | PHX: {headcountData.studentWorkers.phx}
            </div>
          </div>

        </div>

        {/* Category Definition Note */}
        <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
          <span className="font-semibold">Note:</span> Non-Benefit Eligible (NBE) includes TEMP, PRN workers. House Staff Physicians (HSP) includes Grade R employees (PT Residents, OT Fellows, Pharmacy Residents/Fellows) and HSR and are benefit-eligible. Student Workers are tracked separately and are non-benefit eligible.
        </div>

        {/* Headcount Trends Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Quarterly Benefit Eligible Faculty &amp; Staff Headcount Trend
          </h2>
          <ResponsiveContainer width="100%" height={385}>
            <LineChart data={QUARTERLY_HEADCOUNT_TRENDS.slice(-9)} margin={{ top: 40, right: 30, left: 50, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D7D2CB" />
              <XAxis
                dataKey="quarter"
                tick={{ fontSize: 12, fill: '#5F7FC3' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#5F7FC3' }}
                domain={[0, 2500]}
                ticks={[0, 500, 1000, 1500, 2000, 2500]}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '2px solid #4366D0',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 10px 25px -5px rgba(67, 102, 208, 0.25)'
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />

              {/* Total Headcount Line */}
              <Line
                type="monotone"
                dataKey="total"
                stroke="#0054A6"
                strokeWidth={4}
                dot={{ r: 7, fill: '#0054A6', strokeWidth: 2, stroke: '#ffffff' }}
                name="Total Headcount"
                activeDot={{ r: 9, fill: '#0054A6', stroke: '#ffffff', strokeWidth: 3 }}
                label={{
                  position: 'top',
                  offset: 15,
                  style: { fontSize: 16, fontWeight: 'bold', fill: '#0054A6' }
                }}
              />

              {/* Staff Line (Dashed) */}
              <Line
                type="monotone"
                dataKey="staff"
                stroke="#3B82F6"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#ffffff' }}
                name="Benefit Eligible Staff"
                activeDot={{ r: 8, fill: '#3B82F6', stroke: '#ffffff', strokeWidth: 3 }}
                label={{
                  position: 'top',
                  offset: 10,
                  style: { fontSize: 11, fontWeight: 'bold', fill: '#3B82F6' }
                }}
              />

              {/* Faculty Line (Dashed) */}
              <Line
                type="monotone"
                dataKey="faculty"
                stroke="#10B981"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 6, fill: '#10B981', strokeWidth: 2, stroke: '#ffffff' }}
                name="Benefit Eligible Faculty"
                activeDot={{ r: 8, fill: '#10B981', stroke: '#ffffff', strokeWidth: 3 }}
                label={{
                  position: 'top',
                  offset: 10,
                  style: { fontSize: 11, fontWeight: 'bold', fill: '#10B981' }
                }}
              />
            </LineChart>
          </ResponsiveContainer>


        </div>

        {/* Campus Comparison by Employee Type */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin style={{color: '#0054A6'}} size={18} />
            Campus Comparison by Employee Type
          </h2>

          {/* Legend */}
          <div className="mb-4 flex justify-center gap-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">Staff</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Faculty</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-700">House Staff</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-700">Non-Benefit Eligible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-700">Student Workers</span>
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
                      {/* Non-Benefit Eligible - Red */}
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
                      {/* Non-Benefit Eligible - Red */}
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

        </div>

      </div>
    </div>
  );
};

export default WorkforceQ1FY26Dashboard;
