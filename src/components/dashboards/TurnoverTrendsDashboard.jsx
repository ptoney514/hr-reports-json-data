import React from 'react';
import { TrendingDown, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { QUARTERLY_TURNOVER_TRENDS } from '../../services/dataService';

/**
 * Turnover Trends Dashboard
 * Historical turnover analysis from Q1 FY23 to Q1 FY26 (13 quarters)
 * Shows overall turnover and early turnover (<1 year) trends
 * Benefit-eligible employees only: Faculty and Staff
 *
 * Design System Reference: Learning & Development Dashboard pattern
 */
const TurnoverTrendsDashboard = () => {
  const { overallTurnover, earlyTurnover } = QUARTERLY_TURNOVER_TRENDS;

  // Creighton brand colors
  const colors = {
    faculty: '#10B981',   // Green
    staff: '#3B82F6',     // Blue
    grid: '#D7D2CB',      // Light gray
    text: '#00245D',      // Dark blue
    accent: '#4366D0'     // Medium blue
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">

        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center gap-4">
              <TrendingDown style={{color: '#0054A6'}} size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Turnover Trends Analysis
                </h1>
                <p className="text-gray-600 text-lg mt-2">
                  Historical Turnover Patterns • Q1 FY23 - Q1 FY26
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Benefit-eligible employees: Faculty and Staff
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Methodology Change Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800 mb-1">Methodology Update (2025-12-04)</p>
              <p className="text-sm text-blue-700">
                Q1 FY26 data now includes Grade R employees (PT/OT/Pharmacy Residents/Fellows) as benefit-eligible under House Staff Physicians.
                This category includes 625 employees (HSR + Grade R) and 15 terminations. This methodology aligns with benefit eligibility classification.
              </p>
            </div>
          </div>
        </div>

        {/* Turnover Trends Over Time Chart */}
        <div className="bg-white rounded-2xl border p-8 mb-8" style={{ borderColor: colors.grid }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
            Overall Turnover Trends (Q1 FY23 - Q1 FY26)
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={overallTurnover} margin={{ top: 40, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis
                dataKey="quarter"
                tick={{ fontSize: 12, fill: '#5F7FC3' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#5F7FC3' }}
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

              {/* Faculty Line */}
              <Line
                type="monotone"
                dataKey="faculty"
                stroke={colors.faculty}
                strokeWidth={4}
                dot={{ r: 7, fill: colors.faculty, strokeWidth: 2, stroke: '#ffffff' }}
                name="Benefit Eligible Faculty"
                activeDot={{ r: 9, fill: colors.faculty, stroke: '#ffffff', strokeWidth: 3 }}
                label={{
                  position: 'top',
                  offset: 15,
                  style: { fontSize: 16, fontWeight: 'bold', fill: colors.faculty }
                }}
              />

              {/* Staff Line */}
              <Line
                type="monotone"
                dataKey="staff"
                stroke={colors.staff}
                strokeWidth={4}
                dot={{ r: 7, fill: colors.staff, strokeWidth: 2, stroke: '#ffffff' }}
                name="Benefit Eligible Staff"
                activeDot={{ r: 9, fill: colors.staff, stroke: '#ffffff', strokeWidth: 3 }}
                label={{
                  position: 'top',
                  offset: 15,
                  style: { fontSize: 16, fontWeight: 'bold', fill: colors.staff }
                }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Data Note */}
          <div className="text-center mt-4 rounded-lg p-3" style={{ backgroundColor: '#B5D2F3' }}>
            <span className="text-sm" style={{ color: '#5F7FC3' }}>Note: </span>
            <span className="text-sm" style={{ color: colors.text }}>
              Overall turnover includes all benefit-eligible terminations (voluntary, involuntary, retirement, end of assignment) from Q1 FY23 through Q1 FY26.
            </span>
          </div>
        </div>

        {/* Early Turnover Trends Chart */}
        <div className="bg-white rounded-2xl border p-8 mb-8" style={{ borderColor: colors.grid }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
            Early Turnover Trends (&lt;1 Year Tenure, Q1 FY23 - Q1 FY26)
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={earlyTurnover} margin={{ top: 40, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis
                dataKey="quarter"
                tick={{ fontSize: 12, fill: '#5F7FC3' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#5F7FC3' }}
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

              {/* Faculty Line */}
              <Line
                type="monotone"
                dataKey="faculty"
                stroke={colors.faculty}
                strokeWidth={4}
                dot={{ r: 7, fill: colors.faculty, strokeWidth: 2, stroke: '#ffffff' }}
                name="Benefit Eligible Faculty"
                activeDot={{ r: 9, fill: colors.faculty, stroke: '#ffffff', strokeWidth: 3 }}
                label={{
                  position: 'top',
                  offset: 15,
                  style: { fontSize: 16, fontWeight: 'bold', fill: colors.faculty }
                }}
              />

              {/* Staff Line */}
              <Line
                type="monotone"
                dataKey="staff"
                stroke={colors.staff}
                strokeWidth={4}
                dot={{ r: 7, fill: colors.staff, strokeWidth: 2, stroke: '#ffffff' }}
                name="Benefit Eligible Staff"
                activeDot={{ r: 9, fill: colors.staff, stroke: '#ffffff', strokeWidth: 3 }}
                label={{
                  position: 'top',
                  offset: 15,
                  style: { fontSize: 16, fontWeight: 'bold', fill: colors.staff }
                }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Data Note */}
          <div className="text-center mt-4 rounded-lg p-3" style={{ backgroundColor: '#B5D2F3' }}>
            <span className="text-sm" style={{ color: '#5F7FC3' }}>Note: </span>
            <span className="text-sm" style={{ color: colors.text }}>
              Early turnover shows employees who left within their first year of service. High early turnover may indicate onboarding, job fit, or expectation alignment issues.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TurnoverTrendsDashboard;
