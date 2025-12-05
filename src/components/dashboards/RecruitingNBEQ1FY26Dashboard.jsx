import React from 'react';
import { UserPlus, Users, GraduationCap, Stethoscope, Clock, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { QUARTERLY_HEADCOUNT_TRENDS } from '../../data/staticData';

// Chart styling constants
const CHART_MAX_SCALE = 4000;
const CHART_TICKS = [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000];
const CHART_Y_COLOR = '#5F7FC3';
const CHART_BORDER_COLOR = '#D7D2CB';
const CHART_PRIMARY_COLOR = '#8B5CF6';

// Campus comparison scale
const CAMPUS_SCALE_MAX = 3000;
const CAMPUS_SCALE_LABELS = [0, 500, 1000, 1500, 2000, 2500, 3000];
const CAMPUS_SCALE_STEP = 500;

/**
 * Q1 FY26 Temporary Workers Headcount Dashboard
 * Displays quarterly headcount data for Temporary Workers:
 * - Student Workers (non-benefit eligible)
 * - House Staff Physicians (HSPs/Residents - benefit eligible but temporary)
 * - Temporary NBE employees
 *
 * Note: "Temporary" refers to non-permanent employment status, not benefit eligibility.
 * HSPs are benefit-eligible but are included here as temporary/rotating positions.
 *
 * Data Sources:
 * - Oracle HCM: Validated new hire counts
 *
 * Methodology: NEW_HIRES_METHODOLOGY.md
 * Design System Reference: docs/QUARTERLY_REPORTS_DESIGN_SYSTEM.md
 */

// Q1 FY26 Temporary Workers Headcount Data - extracted from Oracle HCM
// Source: staticData.js QUARTERLY_WORKFORCE_DATA["2025-09-30"]
const Q1_FY26_TEMP_DATA = {
  reportingDate: "9/30/25",
  quarter: "Q1 FY26",
  fiscalPeriod: "July 2025 - September 2025",
  dataAsOf: "2025-09-30",
  note: "Headcount data as of end of Q1 FY26. HSPs are benefit-eligible but included here as rotating positions.",
  summary: {
    total: { count: 3412, oma: 2859, phx: 553 }, // Students + HSP + Temp NBE
    students: { count: 2157, oma: 2088, phx: 69 },
    hsp: { count: 625, oma: 282, phx: 343 },  // 613 HSR + 12 Grade R
    temp: { count: 630, oma: 489, phx: 141 }  // TEMP + NBE + PRN
  },
  bySchool: [
    { school: "Arts & Sciences", students: 325, hsp: 0, temp: 48, total: 373 },
    { school: "Medicine", students: 154, hsp: 269, temp: 19, total: 442 },
    { school: "Nursing", students: 14, hsp: 0, temp: 72, total: 86 },
    { school: "Dentistry", students: 76, hsp: 0, temp: 54, total: 130 },
    { school: "Pharmacy & Health Professions", students: 120, hsp: 11, temp: 115, total: 246 },
    { school: "Law School", students: 61, hsp: 0, temp: 26, total: 87 },
    { school: "Heider College of Business", students: 40, hsp: 0, temp: 18, total: 58 },
    { school: "Phoenix", students: 0, hsp: 347, temp: 0, total: 347 },
    { school: "Other Administrative", students: 1063, hsp: 0, temp: 306, total: 1369 }
  ],
  byMonth: [
    { month: "July 2025", students: 0, hsp: 0, temp: 0, total: 0 },
    { month: "August 2025", students: 1860, hsp: 627, temp: 608, total: 3095 },
    { month: "September 2025", students: 297, hsp: 0, temp: 22, total: 319 }
  ]
};

// Quarterly Headcount Trends - Temporary Workers (Q1 FY23-Q3 FY26)
// Source: QUARTERLY_HEADCOUNT_TRENDS from staticData.js
// Transform to show only temporary worker categories (students, hsp, temp)
// Note: All quarterly data is actual headcount from Oracle HCM (since Q1 FY23)
const QUARTERLY_TEMP_HEADCOUNT_TRENDS = QUARTERLY_HEADCOUNT_TRENDS.map(q => ({
  quarter: q.quarter,
  students: q.students,
  hsp: q.hsp,
  temp: q.temp,
  total: q.students + q.hsp + q.temp  // Sum of temporary worker categories only
}));

const RecruitingNBEQ1FY26Dashboard = () => {
  const data = Q1_FY26_TEMP_DATA;
  const summary = data.summary;

  return (
    <div id="recruiting-temp-q1-fy26-dashboard" className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">

        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <UserPlus style={{color: '#8B5CF6'}} size={32} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {data.quarter} Temporary Workers Headcount Report
                  </h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Students, House Staff Physicians & Temporary • {data.fiscalPeriod}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold" style={{color: '#8B5CF6'}}>
                  {summary.total.count}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total {data.quarter} Temporary Headcount</div>
                <div className="text-xs text-gray-500 mt-1">
                  Students: {summary.students.count} | HSPs: {summary.hsp.count} | Temp: {summary.temp.count}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New Hire Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

          {/* Total Temp Hires Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Users style={{color: '#8B5CF6'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 font-medium">
                Q1
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{summary.total.count}</div>
            <div className="text-sm text-gray-600 font-medium">Total Temp Hires</div>
            <div className="text-xs text-gray-500 mt-2">
              OMA: {summary.total.oma} | PHX: {summary.total.phx}
            </div>
          </div>

          {/* House Staff Physicians Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Stethoscope style={{color: '#F59E0B'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">
                HSP
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{summary.hsp.count}</div>
            <div className="text-sm text-gray-600 font-medium">House Staff Physicians</div>
            <div className="text-xs text-gray-500 mt-2">
              OMA: {summary.hsp.oma} | PHX: {summary.hsp.phx}
            </div>
          </div>

          {/* Temporary NBE Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Clock style={{color: '#6B7280'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 font-medium">
                TEMP
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{summary.temp.count}</div>
            <div className="text-sm text-gray-600 font-medium">Temporary NBE</div>
            <div className="text-xs text-gray-500 mt-2">
              OMA: {summary.temp.oma} | PHX: {summary.temp.phx}
            </div>
          </div>

          {/* Student Workers Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <GraduationCap style={{color: '#10B981'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                STUDENT
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{summary.students.count}</div>
            <div className="text-sm text-gray-600 font-medium">Student Workers</div>
            <div className="text-xs text-gray-500 mt-2">
              OMA: {summary.students.oma} | PHX: {summary.students.phx}
            </div>
          </div>

        </div>

        {/* Hiring Trends Chart - Matches Workforce Dashboard Style */}
        <div className="bg-white rounded-2xl border p-8 mb-8" style={{ borderColor: '#D7D2CB' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#00245D' }}>
            Quarterly Temporary Workers Headcount Trend
          </h2>
          <ResponsiveContainer width="100%" height={385}>
            <LineChart data={QUARTERLY_TEMP_HEADCOUNT_TRENDS} margin={{ top: 40, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_BORDER_COLOR} />
              <XAxis
                dataKey="quarter"
                tick={{ fontSize: 12, fill: CHART_Y_COLOR }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: CHART_Y_COLOR }}
                domain={[0, CHART_MAX_SCALE]}
                ticks={CHART_TICKS}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '2px solid #8B5CF6',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.25)'
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />

              {/* Total Temporary Workers Line */}
              <Line
                type="monotone"
                dataKey="total"
                stroke={CHART_PRIMARY_COLOR}
                strokeWidth={4}
                dot={{ r: 7, fill: CHART_PRIMARY_COLOR, strokeWidth: 2, stroke: '#ffffff' }}
                name="Total Temporary Headcount"
                activeDot={{ r: 9, fill: CHART_PRIMARY_COLOR, stroke: '#ffffff', strokeWidth: 3 }}
                label={{
                  position: 'top',
                  offset: 15,
                  style: { fontSize: 14, fontWeight: 'bold', fill: CHART_PRIMARY_COLOR }
                }}
              />

              {/* HSP Line (Dashed) */}
              <Line
                type="monotone"
                dataKey="hsp"
                stroke="#F59E0B"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 6, fill: '#F59E0B', strokeWidth: 2, stroke: '#ffffff' }}
                name="House Staff Physicians"
                activeDot={{ r: 8, fill: '#F59E0B', stroke: '#ffffff', strokeWidth: 3 }}
              />

              {/* Temp Line (Dashed) */}
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#6B7280"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 6, fill: '#6B7280', strokeWidth: 2, stroke: '#ffffff' }}
                name="Temporary NBE"
                activeDot={{ r: 8, fill: '#6B7280', stroke: '#ffffff', strokeWidth: 3 }}
              />

              {/* Students Line (Dashed) */}
              <Line
                type="monotone"
                dataKey="students"
                stroke="#10B981"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 6, fill: '#10B981', strokeWidth: 2, stroke: '#ffffff' }}
                name="Student Workers"
                activeDot={{ r: 8, fill: '#10B981', stroke: '#ffffff', strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Trend Note */}
          <div className="text-xs text-gray-600 mt-4 bg-purple-50 p-3 rounded border border-purple-200 text-center">
            <span className="font-semibold">Note:</span> All quarterly data is actual headcount from Oracle HCM (since Q1 FY23). Student headcount peaks align with academic semesters. HSP headcount reflects residency program cycles.
          </div>
        </div>

        {/* ============================================== */}
        {/* CAMPUS COMPARISON BY EMPLOYEE TYPE            */}
        {/* ============================================== */}

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin style={{color: '#8B5CF6'}} size={20} />
            Campus Comparison - Temporary Workers by Type
          </h2>

          {/* Legend */}
          <div className="mb-6 flex justify-center gap-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-700">House Staff Physicians</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-gray-700">Temporary NBE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Student Workers</span>
            </div>
          </div>

          {/* Horizontal Stacked Bar Chart */}
          <div className="space-y-8">
            {/* X-axis scale */}
            <div className="relative">
              <div className="flex justify-between text-xs text-gray-500 mb-2 px-32">
                {CAMPUS_SCALE_LABELS.map((label) => (
                  <span key={label}>{label.toLocaleString()}</span>
                ))}
              </div>

              {/* Vertical grid lines */}
              <div className="absolute top-6 left-32 right-32 bottom-0 flex justify-between pointer-events-none">
                {CAMPUS_SCALE_LABELS.map((_, idx) => (
                  <div key={idx} className="border-l border-gray-200 h-full"></div>
                ))}
              </div>

              {/* Omaha Bar */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-700 font-medium text-right">Omaha (OMA)</div>
                  <div className="flex-1 relative">
                    <div className="flex h-12 rounded overflow-hidden">
                      {/* HSP - Orange */}
                      <div
                        className="bg-orange-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${(summary.hsp.oma / CAMPUS_SCALE_MAX) * 100}%` }}
                      >
                        {summary.hsp.oma >= 80 && summary.hsp.oma}
                      </div>
                      {/* Temp NBE - Gray */}
                      <div
                        className="bg-gray-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${(summary.temp.oma / CAMPUS_SCALE_MAX) * 100}%` }}
                      >
                        {summary.temp.oma >= 80 && summary.temp.oma}
                      </div>
                      {/* Students - Green */}
                      <div
                        className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${(summary.students.oma / CAMPUS_SCALE_MAX) * 100}%` }}
                      >
                        {summary.students.oma >= 80 && summary.students.oma.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="w-20 text-right text-base font-bold text-gray-900">
                    {summary.total.oma.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Phoenix Bar */}
              <div>
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-700 font-medium text-right">Phoenix (PHX)</div>
                  <div className="flex-1 relative">
                    <div className="flex h-12 rounded overflow-hidden">
                      {/* HSP - Orange */}
                      <div
                        className="bg-orange-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${(summary.hsp.phx / CAMPUS_SCALE_MAX) * 100}%` }}
                      >
                        {summary.hsp.phx >= 80 && summary.hsp.phx}
                      </div>
                      {/* Temp NBE - Gray */}
                      <div
                        className="bg-gray-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${(summary.temp.phx / CAMPUS_SCALE_MAX) * 100}%` }}
                      >
                        {summary.temp.phx >= 80 && summary.temp.phx}
                      </div>
                      {/* Students - Green */}
                      <div
                        className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${(summary.students.phx / CAMPUS_SCALE_MAX) * 100}%` }}
                      >
                        {summary.students.phx >= 80 && summary.students.phx}
                      </div>
                    </div>
                  </div>
                  <div className="w-20 text-right text-base font-bold text-gray-900">
                    {summary.total.phx}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Note */}
          <div className="text-xs text-gray-600 mt-6 bg-purple-50 p-3 rounded border border-purple-200 text-center">
            <span className="font-semibold">Note:</span> Campus comparison shows {summary.total.count.toLocaleString()} total temporary workers across Omaha ({summary.total.oma.toLocaleString()}) and Phoenix ({summary.total.phx}) campuses as of end of {data.quarter}.
          </div>
        </div>

        {/* Methodology Note */}
        <div className="text-xs text-gray-500 text-center">
          <p>Data Sources: Oracle HCM (Temporary Workers Headcount)</p>
          <p className="mt-1">Methodology: WORKFORCE_METHODOLOGY.md • Includes Students, HSPs, and Temporary NBE positions</p>
        </div>

      </div>
    </div>
  );
};

export default RecruitingNBEQ1FY26Dashboard;
