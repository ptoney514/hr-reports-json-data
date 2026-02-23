import React from 'react';
import { ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { QUARTERLY_HEADCOUNT_TRENDS } from '../../services/dataService';

/**
 * Headcount Trends Slide
 * Combines benefit-eligible and temporary worker trend charts on a single slide.
 * Data: QUARTERLY_HEADCOUNT_TRENDS (shows newest 9 quarters)
 */

const COLORS = {
  total: '#0054A6',
  staff: '#3B82F6',
  faculty: '#10B981',
  tempTotal: '#6366F1',
  hsp: '#F59E0B',
  tempNBE: '#64748B',
  students: '#10B981',
};

const HeadcountTrendsSlide = () => {
  const trendData = QUARTERLY_HEADCOUNT_TRENDS.slice(-9);

  // Derive temp worker trends
  const tempWorkerTrends = trendData.map(q => ({
    quarter: q.quarter,
    hsp: q.hsp,
    tempNBE: q.temp,
    students: q.students,
    total: q.hsp + q.temp + q.students,
  }));

  return (
    <div className="min-h-screen">
      <div className="w-[85%] max-w-[1280px] mx-auto pt-5 pb-8 space-y-6">

        {/* Benefit Eligible Headcount Trend */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Quarterly Benefit Eligible Faculty &amp; Staff Headcount Trend
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trendData} margin={{ top: 30, right: 30, left: 50, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D7D2CB" />
              <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: '#5F7FC3' }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#5F7FC3' }}
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
              <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
              <Line
                type="monotone"
                dataKey="total"
                stroke={COLORS.total}
                strokeWidth={4}
                dot={{ r: 6, fill: COLORS.total, strokeWidth: 2, stroke: '#ffffff' }}
                name="Total Headcount"
                activeDot={{ r: 8 }}
                label={{ position: 'top', offset: 12, style: { fontSize: 13, fontWeight: 'bold', fill: COLORS.total } }}
              />
              <Line
                type="monotone"
                dataKey="staff"
                stroke={COLORS.staff}
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 5, fill: COLORS.staff, strokeWidth: 2, stroke: '#ffffff' }}
                name="Benefit Eligible Staff"
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="faculty"
                stroke={COLORS.faculty}
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 5, fill: COLORS.faculty, strokeWidth: 2, stroke: '#ffffff' }}
                name="Benefit Eligible Faculty"
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-xs text-gray-600 mt-3 bg-blue-50 p-3 rounded border border-blue-200 text-center">
            <span className="font-semibold">Note:</span> All data is actual Oracle HCM headcount as of last day of each fiscal quarter. Faculty + Staff = Total Benefit Eligible.
          </div>
        </div>

        {/* Temporary Workers Headcount Trend */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Quarterly Temporary Workers Headcount Trend
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={tempWorkerTrends} margin={{ top: 30, right: 30, left: 50, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D7D2CB" />
              <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: '#5F7FC3' }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#5F7FC3' }}
                domain={[0, 4000]}
                ticks={[0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000]}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '2px solid #6366F1',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.25)',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
              <Line
                type="monotone"
                dataKey="total"
                stroke={COLORS.tempTotal}
                strokeWidth={4}
                dot={{ r: 6, fill: COLORS.tempTotal, strokeWidth: 2, stroke: '#ffffff' }}
                name="Total"
                activeDot={{ r: 8 }}
                label={{ position: 'top', offset: 12, style: { fontSize: 13, fontWeight: 'bold', fill: COLORS.tempTotal } }}
              />
              <Line
                type="monotone"
                dataKey="students"
                stroke={COLORS.students}
                strokeWidth={3}
                strokeDasharray="8 4"
                dot={{ r: 5, fill: COLORS.students, strokeWidth: 2, stroke: '#ffffff' }}
                name="Student Workers"
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="hsp"
                stroke={COLORS.hsp}
                strokeWidth={3}
                strokeDasharray="8 4"
                dot={{ r: 5, fill: COLORS.hsp, strokeWidth: 2, stroke: '#ffffff' }}
                name="House Staff Physicians"
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="tempNBE"
                stroke={COLORS.tempNBE}
                strokeWidth={3}
                strokeDasharray="4 2 1 2"
                dot={{ r: 5, fill: COLORS.tempNBE, strokeWidth: 2, stroke: '#ffffff' }}
                name="Temporary NBE"
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-xs text-gray-600 mt-3 bg-amber-50 p-3 rounded border border-amber-200 text-center">
            <span className="font-semibold">Note:</span> Student headcount peaks align with academic semesters. HSP headcount reflects residency program cycles. All quarterly data is actual headcount from Oracle HCM.
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeadcountTrendsSlide;
