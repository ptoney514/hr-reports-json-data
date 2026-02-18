import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  getQuarterlyWorkforceData,
  getQuarterlyTurnoverData,
} from '../../data/staticData';
import { useQuarter } from '../../contexts/QuarterContext';
import NoDataForQuarter from '../ui/NoDataForQuarter';

// New hire data per quarter (sourced from RecruitingQ1FY26Dashboard)
const NEWHIRE_DATA = {
  "2025-09-30": {
    total: 69,
    faculty: 31,
    staff: 38,
    note: "thru 8/31"
  }
};

// Open requisitions per quarter (sourced from RecruitingQ1FY26Dashboard MYJOBS_DATA)
const OPEN_REQUISITIONS = {
  "2025-09-30": { count: 143, source: "Staff (myJobs)" }
};

// Muted palette for non-highlighted tenure bands (light grays → light blues)
const MUTED_COLORS = ['#CBD5E1', '#94A3B8', '#93C5FD', '#BFDBFE', '#D1D5DB', '#E2E8F0', '#C7D2FE'];
// Accent color for the largest (concern) band
const ACCENT_COLOR = '#DC2626';

const ExecutiveDashboardNew = () => {
  const { selectedQuarter, quarterConfig } = useQuarter();

  const workforceData = useMemo(
    () => getQuarterlyWorkforceData(selectedQuarter),
    [selectedQuarter]
  );
  const turnoverData = useMemo(
    () => getQuarterlyTurnoverData(selectedQuarter),
    [selectedQuarter]
  );
  const newHireData = NEWHIRE_DATA[selectedQuarter];
  const openReqs = OPEN_REQUISITIONS[selectedQuarter];

  // Core metrics
  const summary = workforceData?.summary;
  const totalHeadcount = summary?.total?.count || 0;
  const newHires = newHireData?.total || 0;
  const separations = turnoverData?.summary?.total?.count || 0;
  const netChange = newHires - separations;
  const requisitions = openReqs?.count || 0;

  // Demographics
  const demographics = workforceData?.demographics;

  // Turnover by tenure donut data
  const tenureDonutData = useMemo(() => {
    const yos = turnoverData?.yearsOfService;
    if (!yos) return [];
    return yos
      .map(band => ({
        name: band.range,
        value: band.faculty + band.staff + (band.hsp || 0),
      }))
      .filter(d => d.value > 0);
  }, [turnoverData]);

  const totalTenureSeparations = tenureDonutData.reduce((sum, d) => sum + d.value, 0);

  // Find the largest tenure band for the donut center label
  const largestBand = tenureDonutData.reduce(
    (max, d) => (d.value > max.value ? d : max),
    { name: '', value: 0 }
  );

  // Check if data exists
  if (!workforceData || !turnoverData) {
    return <NoDataForQuarter dataLabel="Executive dashboard data" />;
  }

  return (
    <div className="min-h-screen print:bg-white print:min-h-0">
      <div className="w-[90%] max-w-[1400px] mx-auto pt-5 pb-8 space-y-5 print:w-full print:max-w-none print:px-2 print:py-1 print:space-y-2">
        {/* Period context */}
        <p className="text-sm text-gray-500 print:hidden">
          {quarterConfig?.label} &mdash; {quarterConfig?.period}
        </p>

        {/* ── KPI ROW ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Key performance indicators">
          {/* Total Headcount */}
          <div className="bg-white rounded-lg shadow-sm border p-5 border-t-4 border-t-blue-500">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Headcount</h2>
            </div>
            <div className="text-5xl font-bold text-gray-900 my-2">{totalHeadcount.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-2">
              All categories &middot; BE &amp; non-BE
            </div>
          </div>

          {/* New Hires */}
          <div className="bg-white rounded-lg shadow-sm border p-5 border-t-4 border-t-green-500">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{quarterConfig?.label} New Hires</h2>
            </div>
            <div className="text-5xl font-bold text-gray-900 my-2">{newHires}</div>
            <div className="text-sm text-gray-500 mt-2">
              Faculty {newHireData?.faculty || 0} &middot; Staff {newHireData?.staff || 0}
            </div>
          </div>

          {/* Separations */}
          <div className="bg-white rounded-lg shadow-sm border p-5 border-t-4 border-t-red-500">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{quarterConfig?.label} Separations</h2>
            </div>
            <div className="text-5xl font-bold text-gray-900 my-2">{separations}</div>
            <div className="text-sm text-gray-500 mt-2">
              Fac {turnoverData.summary.faculty.count} &middot; Staff {turnoverData.summary.staff.count}
              {turnoverData.summary.houseStaffPhysicians?.count > 0 && (
                <> &middot; HSP {turnoverData.summary.houseStaffPhysicians.count}</>
              )}
            </div>
            {netChange !== 0 && (
              <div className={`text-sm font-medium mt-1 ${netChange < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {netChange < 0 ? '\u25BC' : '\u25B2'} {Math.abs(netChange)} net {netChange < 0 ? 'deficit' : 'gain'}
              </div>
            )}
          </div>

          {/* Open Requisitions */}
          <div className="bg-white rounded-lg shadow-sm border p-5 border-t-4 border-t-amber-500">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Open Reqs</h2>
            </div>
            <div className="text-5xl font-bold text-gray-900 my-2">{requisitions}</div>
            <div className="text-sm text-gray-500 mt-2">
              {openReqs?.source || 'Staff'}
            </div>
            <div className="text-sm text-gray-500">Active postings</div>
          </div>
        </div>

        {/* ── WORKFORCE SNAPSHOT ── */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Workforce Snapshot</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Turnover by Tenure Donut */}
            <div className="bg-white rounded-lg shadow-sm border p-6" style={{ minHeight: 280 }}>
              <h3 className="text-base font-bold text-gray-900 mb-1">Turnover by Tenure</h3>
              <p className="text-sm text-gray-500 mb-4">
                {quarterConfig?.label} &middot; Faculty &amp; Staff &middot; {totalTenureSeparations} total separations
              </p>

              <div className="flex items-center gap-8">
                {/* Donut — largest band highlighted in red, rest muted */}
                <div className="relative flex-shrink-0" style={{ width: 180, height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tenureDonutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        stroke="#fff"
                        strokeWidth={2}
                      >
                        {tenureDonutData.map((d, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={d.name === largestBand.name ? ACCENT_COLOR : MUTED_COLORS[index % MUTED_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value} separations`, name]}
                        contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e5e7eb' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center label — shows the concern band */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-red-600">{largestBand.value}</span>
                    <span className="text-xs text-red-400 font-medium">{largestBand.name}</span>
                  </div>
                </div>

                {/* Legend — highlighted row for the largest band */}
                <div className="flex-1 space-y-1.5">
                  {tenureDonutData.map((d, i) => {
                    const isHighlighted = d.name === largestBand.name;
                    return (
                      <div
                        key={d.name}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-md ${
                          isHighlighted ? 'bg-red-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full inline-block flex-shrink-0"
                            style={{ backgroundColor: isHighlighted ? ACCENT_COLOR : MUTED_COLORS[i % MUTED_COLORS.length] }}
                            aria-hidden="true"
                          />
                          <span className={`text-sm ${isHighlighted ? 'text-red-700 font-semibold' : 'text-gray-600'}`}>
                            {d.name}
                          </span>
                        </div>
                        <span className={`text-base font-bold tabular-nums ${isHighlighted ? 'text-red-700' : 'text-gray-900'}`}>
                          {d.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Accessible table */}
              <table className="sr-only">
                <caption>Turnover by tenure band</caption>
                <thead>
                  <tr><th>Tenure Band</th><th>Separations</th></tr>
                </thead>
                <tbody>
                  {tenureDonutData.map(d => (
                    <tr key={d.name}><td>{d.name}</td><td>{d.value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Gender Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border p-6" style={{ minHeight: 280 }}>
              <h3 className="text-base font-bold text-gray-900 mb-1">Gender Breakdown</h3>
              <p className="text-sm text-gray-500 mb-5">Benefit-eligible faculty &amp; staff</p>

              {demographics?.gender && (
                <div className="space-y-6">
                  {/* Faculty Gender */}
                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-800">Faculty</span>
                      <span className="text-sm text-gray-500">{demographics.gender.faculty.total?.toLocaleString() || ''} total</span>
                    </div>
                    <div className="flex h-9 rounded-lg overflow-hidden bg-gray-100">
                      <div
                        className="bg-emerald-500 flex items-center justify-center transition-all"
                        style={{ width: `${demographics.gender.faculty.distribution[0].percentage}%` }}
                      >
                        <span className="text-sm font-semibold text-white">
                          {demographics.gender.faculty.distribution[0].percentage}% F
                        </span>
                      </div>
                      <div className="bg-blue-400 flex-1 flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {demographics.gender.faculty.distribution[1].percentage}% M
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        Female {demographics.gender.faculty.distribution[0].count.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
                        Male {demographics.gender.faculty.distribution[1].count.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Staff Gender */}
                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-800">Staff</span>
                      <span className="text-sm text-gray-500">{demographics.gender.staff.total?.toLocaleString() || ''} total</span>
                    </div>
                    <div className="flex h-9 rounded-lg overflow-hidden bg-gray-100">
                      <div
                        className="bg-emerald-500 flex items-center justify-center transition-all"
                        style={{ width: `${demographics.gender.staff.distribution[0].percentage}%` }}
                      >
                        <span className="text-sm font-semibold text-white">
                          {demographics.gender.staff.distribution[0].percentage}% F
                        </span>
                      </div>
                      <div className="bg-blue-400 flex-1 flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {demographics.gender.staff.distribution[1].percentage}% M
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        Female {demographics.gender.staff.distribution[0].count.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
                        Male {demographics.gender.staff.distribution[1].count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── WORKFORCE DISTRIBUTION ── */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Workforce Distribution</h2>
          <div className="bg-white rounded-lg shadow-sm border p-5">
            <div className="flex items-stretch rounded-lg overflow-hidden h-16" role="region" aria-label="Workforce distribution by campus">
              {/* Omaha */}
              <div
                className="bg-blue-600 flex items-center justify-center text-white px-5"
                style={{ width: `${((summary.total.oma / totalHeadcount) * 100).toFixed(1)}%` }}
              >
                <div className="text-center">
                  <div className="text-lg font-bold">OMAHA</div>
                  <div className="text-sm font-medium opacity-90">
                    {summary.total.oma.toLocaleString()} &middot; {((summary.total.oma / totalHeadcount) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              {/* Phoenix */}
              <div
                className="bg-amber-500 flex items-center justify-center text-white px-5"
                style={{ width: `${((summary.total.phx / totalHeadcount) * 100).toFixed(1)}%` }}
              >
                <div className="text-center">
                  <div className="text-lg font-bold">PHOENIX</div>
                  <div className="text-sm font-medium opacity-90">
                    {summary.total.phx.toLocaleString()} &middot; {((summary.total.phx / totalHeadcount) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center mt-3 text-sm text-gray-500">
              <span className="font-semibold text-gray-700">{totalHeadcount.toLocaleString()}</span> Total Workforce
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboardNew;
