import React, { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from 'recharts';
import {
  getQuarterlyWorkforceData,
  getQuarterlyTurnoverData,
  getExitSurveyData,
  QUARTERLY_HEADCOUNT_TRENDS
} from '../../data/staticData';

// Quarter configuration
const EXECUTIVE_QUARTERS = [
  { value: "2025-09-30", label: "Q1 FY26", period: "July - September 2025" },
];

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

// Employee distribution by state per quarter
const EMPLOYEES_BY_STATE = {
  "2025-09-30": {
    NE: { count: 4834, label: "Omaha Campus" },
    AZ: { count: 694, label: "Phoenix Campus" },
  }
};

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const STATE_FIPS = {
  NE: "31",
  AZ: "04",
};

const DONUT_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#6B7280', '#8B5CF6'];

const ExecutiveDashboard = () => {
  const [selectedQuarter, setSelectedQuarter] = useState("2025-09-30");

  const quarterConfig = EXECUTIVE_QUARTERS.find(q => q.value === selectedQuarter);

  // Load data from staticData.js
  const workforceData = useMemo(
    () => getQuarterlyWorkforceData(selectedQuarter),
    [selectedQuarter]
  );
  const turnoverData = useMemo(
    () => getQuarterlyTurnoverData(selectedQuarter),
    [selectedQuarter]
  );
  const exitSurveyData = useMemo(
    () => getExitSurveyData(selectedQuarter),
    [selectedQuarter]
  );
  const newHireData = NEWHIRE_DATA[selectedQuarter];
  const openReqs = OPEN_REQUISITIONS[selectedQuarter];
  const employeesByState = EMPLOYEES_BY_STATE[selectedQuarter];

  // Core metrics (safe with optional chaining for null-data guard below)
  const summary = workforceData?.summary;
  const totalHeadcount = summary?.total?.count || 0;
  const newHires = newHireData?.total || 0;
  const separations = turnoverData?.summary?.total?.count || 0;
  const netChange = newHires - separations;
  const requisitions = openReqs?.count || 0;

  // Donut chart data (5 employee type segments)
  const donutData = summary
    ? [
        { name: 'Faculty', value: summary.faculty.count },
        { name: 'Staff', value: summary.staff.count },
        { name: 'HSP', value: summary.houseStaffPhysicians.count },
        { name: 'NBE', value: summary.temporary.count, fullName: 'Non-Benefit Eligible' },
        { name: 'Student', value: summary.studentWorkers.count },
      ]
    : [];


  // Years of service chart data for stacked bar
  const losChartData = useMemo(() => {
    const yos = turnoverData?.yearsOfService;
    if (!yos) return [];
    return yos.map(band => ({
      range: band.range,
      faculty: band.faculty,
      staff: band.staff,
      total: band.faculty + band.staff,
    }));
  }, [turnoverData]);

  // QoQ benefit-eligible headcount changes from QUARTERLY_HEADCOUNT_TRENDS
  const qoqData = useMemo(() => {
    const qLabel = EXECUTIVE_QUARTERS.find(q => q.value === selectedQuarter)?.label;
    const trends = QUARTERLY_HEADCOUNT_TRENDS;
    const currentIdx = trends.findIndex(t => t.quarter === qLabel);
    if (currentIdx <= 0) return { facultyQoQ: 0, staffQoQ: 0 };
    const current = trends[currentIdx];
    const previous = trends[currentIdx - 1];
    return {
      facultyQoQ: ((current.faculty - previous.faculty) / previous.faculty) * 100,
      staffQoQ: ((current.staff - previous.staff) / previous.staff) * 100,
    };
  }, [selectedQuarter]);


  // Demographics references
  const demographics = workforceData?.demographics;


  // Exit survey data points
  const topFactors = exitSurveyData?.contributingReasons?.slice(0, 3)
    || exitSurveyData?.departureReasons?.slice(0, 3)
    || [];
  const satisfactionRatings = exitSurveyData?.satisfactionRatings;

  // Key insights — dynamically computed, never hardcoded
  const insights = useMemo(() => {
    if (!exitSurveyData) return [];
    const items = [];

    // 1) Net headcount direction
    if (netChange < 0) {
      items.push({
        type: 'warning',
        title: 'Net Headcount Decline',
        text: `${Math.abs(netChange)} more separations than hires. Monitor hiring pipeline.`,
      });
    } else if (netChange > 0) {
      items.push({
        type: 'success',
        title: 'Net Headcount Growth',
        text: `${netChange} more hires than separations. Positive growth trajectory.`,
      });
    } else {
      items.push({
        type: 'neutral',
        title: 'Headcount Stable',
        text: 'Hires and separations are balanced.',
      });
    }

    // 2) Top compensation / exit concern
    const topFactor = topFactors[0];
    if (topFactor) {
      const reasonLower = topFactor.reason.toLowerCase();
      const payRelated =
        reasonLower.includes('pay') ||
        reasonLower.includes('salary') ||
        reasonLower.includes('compensation');
      if (payRelated) {
        items.push({
          type: 'warning',
          title: 'Compensation Concerns',
          text: `${topFactor.percentage}% cite pay as exit factor. Comp rated ${satisfactionRatings?.compensation || 'N/A'}/5.`,
        });
      } else {
        items.push({
          type: 'warning',
          title: 'Top Exit Factor',
          text: `${topFactor.reason}: ${topFactor.percentage}% of respondents.`,
        });
      }
    }

    // 3) Employer brand strength
    const recommend = exitSurveyData.wouldRecommend;
    if (recommend >= 75) {
      items.push({
        type: 'success',
        title: 'Strong Employer Brand',
        text: `${recommend}% would recommend Creighton. Benefits rated ${satisfactionRatings?.benefits || 'N/A'}/5.`,
      });
    } else if (recommend >= 50) {
      items.push({
        type: 'neutral',
        title: 'Moderate Employer Brand',
        text: `${recommend}% would recommend Creighton.`,
      });
    } else {
      items.push({
        type: 'warning',
        title: 'Employer Brand at Risk',
        text: `Only ${recommend}% would recommend Creighton.`,
      });
    }

    return items;
  }, [netChange, topFactors, exitSurveyData, satisfactionRatings]);

  // Satisfaction rating rows (ordered by value descending)
  const satisfactionRows = satisfactionRatings
    ? [
        { label: 'Benefits', key: 'benefits' },
        { label: 'Management', key: 'managementSupport' },
        { label: 'Job Satisfaction', key: 'jobSatisfaction' },
        { label: 'Compensation', key: 'compensation' },
        { label: 'Career Dev', key: 'careerDevelopment' },
      ]
    : [];

  // Check if data exists for selected quarter (after all hooks)
  if (!workforceData || !turnoverData || !exitSurveyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm border">
          <h1 className="text-xl font-semibold text-gray-700 mb-2">Data Not Yet Available</h1>
          <p className="text-gray-500">
            Data for {quarterConfig?.label || selectedQuarter} has not been loaded yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white print:min-h-0">
      {/* ── HEADER ── */}
      <header className="bg-gradient-to-r from-[#00245D] to-[#0054A6] text-white px-6 py-4 print:py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">HR Executive Dashboard</h1>
            <p className="text-blue-200 text-sm">
              {quarterConfig?.label} &mdash; {quarterConfig?.period}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-blue-200 uppercase tracking-wider">
                Creighton University
              </div>
              <div className="text-xs text-blue-300">Omaha &amp; Phoenix</div>
            </div>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="bg-white/10 border border-white/20 rounded px-3 py-1.5 text-sm text-white print:hidden focus:ring-2 focus:ring-white/40 focus:outline-none"
              aria-label="Select quarter"
            >
              {EXECUTIVE_QUARTERS.map(q => (
                <option key={q.value} value={q.value} className="text-gray-900">
                  {q.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="px-4 py-3 space-y-3 print:px-2 print:py-1 print:space-y-2">
        {/* ── KPI ROW ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" role="region" aria-label="Key performance indicators">
          {/* Total Headcount */}
          <div className="bg-white rounded-lg shadow-sm border p-3 border-t-4 border-t-blue-500">
            <h2 className="text-xs font-semibold text-gray-500 uppercase">Total Headcount</h2>
            <div className="text-2xl font-bold text-gray-900">{totalHeadcount.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">
              OMA: {summary.total.oma.toLocaleString()} | PHX: {summary.total.phx.toLocaleString()}
            </div>
          </div>

          {/* New Hires */}
          <div className="bg-white rounded-lg shadow-sm border p-3 border-t-4 border-t-green-500">
            <h2 className="text-xs font-semibold text-gray-500 uppercase">Q1 New Hires</h2>
            <div className="text-2xl font-bold text-gray-900">{newHires}</div>
            <div className="text-xs text-gray-500 mt-1">
              Fac: {newHireData?.faculty || 0} | Staff: {newHireData?.staff || 0}
            </div>
            {newHireData?.note && (
              <div className="text-xs text-amber-600 mt-0.5">({newHireData.note})</div>
            )}
          </div>

          {/* Separations */}
          <div className="bg-white rounded-lg shadow-sm border p-3 border-t-4 border-t-red-500">
            <h2 className="text-xs font-semibold text-gray-500 uppercase">Q1 Separations</h2>
            <div className="text-2xl font-bold text-gray-900">{separations}</div>
            <div className="text-xs text-gray-500 mt-1">
              Fac: {turnoverData.summary.faculty.count} | Staff: {turnoverData.summary.staff.count}
              {turnoverData.summary.houseStaffPhysicians?.count > 0 && (
                <> | HSP: {turnoverData.summary.houseStaffPhysicians.count}</>
              )}
            </div>
          </div>

          {/* Open Requisitions */}
          <div className="bg-white rounded-lg shadow-sm border p-3 border-t-4 border-t-amber-500">
            <h2 className="text-xs font-semibold text-gray-500 uppercase">Open Reqs</h2>
            <div className="text-2xl font-bold text-gray-900">{requisitions}</div>
            <div className="text-xs text-gray-500 mt-1">{openReqs?.source || ''}</div>
          </div>
        </div>

        {/* ── MIDDLE ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Workforce by Type (Donut) */}
          <div className="bg-white rounded-lg shadow-sm border p-3">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Workforce by Type</h2>
            {/* Centered donut chart */}
            <div className="flex justify-center">
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={DONUT_COLORS[i]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-gray-900">
                    {totalHeadcount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase">Total</span>
                </div>
              </div>
            </div>
            {/* Legend below chart */}
            <div className="grid grid-cols-3 gap-x-3 gap-y-1 mt-2">
              {donutData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: DONUT_COLORS[i] }}
                    aria-hidden="true"
                  />
                  <span className="text-gray-600">{d.name}:</span>
                  <span className="font-semibold text-gray-900">{d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
            {/* Screen-reader accessible data table */}
            <table className="sr-only">
              <caption>Workforce breakdown by employee type</caption>
              <thead>
                <tr><th>Type</th><th>Count</th></tr>
              </thead>
              <tbody>
                {donutData.map(d => (
                  <tr key={d.name}><td>{d.fullName || d.name}</td><td>{d.value}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Q1 Talent Movement */}
          <div className="bg-white rounded-lg shadow-sm border p-3">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Q1 Talent Movement</h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-700">+{newHires}</div>
                <div className="text-xs text-green-600">Hires</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded">
                <div className="text-lg font-bold text-red-700">-{separations}</div>
                <div className="text-xs text-red-600">Separations</div>
              </div>
            </div>
            <div
              className={`text-center p-2 rounded mb-3 ${
                netChange < 0 ? 'bg-red-50' : netChange > 0 ? 'bg-green-50' : 'bg-gray-50'
              }`}
            >
              <div className="text-xs text-gray-500 uppercase font-semibold">Net Change</div>
              <div
                className={`text-xl font-bold ${
                  netChange < 0
                    ? 'text-red-700'
                    : netChange > 0
                    ? 'text-green-700'
                    : 'text-gray-700'
                }`}
              >
                {netChange > 0 ? '+' : ''}{netChange}
              </div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="text-xs text-gray-500 uppercase font-semibold mb-1">
                Open Requisitions
              </div>
              <div className="text-sm font-medium text-gray-900">{requisitions} Staff Reqs</div>
            </div>
          </div>

          {/* Exit Survey Insights */}
          <div className="bg-white rounded-lg shadow-sm border p-3">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Exit Survey Insights</h2>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {exitSurveyData.totalResponses}
                </div>
                <div className="text-[10px] text-gray-500">Responses</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {exitSurveyData.responseRate}%
                </div>
                <div className="text-[10px] text-gray-500">Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {exitSurveyData.wouldRecommend}%
                </div>
                <div className="text-[10px] text-gray-500">Recommend</div>
              </div>
            </div>

            {/* Top Exit Factors */}
            <div className="mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Top Exit Factors
              </h3>
              {topFactors.map((f, i) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-gray-600 truncate" title={f.reason}>
                      {f.reason}
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-red-400 h-1.5 rounded-full"
                        style={{ width: `${Math.min(f.percentage, 100)}%` }}
                        role="meter"
                        aria-valuenow={f.percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${f.reason}: ${f.percentage}%`}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-10 text-right flex-shrink-0">
                    {f.percentage}%
                  </span>
                </div>
              ))}
            </div>

            {/* Satisfaction Ratings */}
            {satisfactionRatings && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Satisfaction (1-5)
                </h3>
                {satisfactionRows.map(item => (
                  <div key={item.key} className="flex items-center gap-1 mb-0.5">
                    <span className="text-[10px] text-gray-600 w-20 truncate">{item.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-400 h-1.5 rounded-full"
                        style={{ width: `${(satisfactionRatings[item.key] / 5) * 100}%` }}
                        role="meter"
                        aria-valuenow={satisfactionRatings[item.key]}
                        aria-valuemin={0}
                        aria-valuemax={5}
                        aria-label={`${item.label}: ${satisfactionRatings[item.key]} out of 5`}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-gray-700 w-6 text-right">
                      {satisfactionRatings[item.key]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Benefit-Eligible Faculty */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                </svg>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 uppercase tracking-wide">Faculty</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-gray-900">{summary.faculty.count.toLocaleString()}</span>
              <span className={`text-sm font-semibold ${qoqData.facultyQoQ >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {qoqData.facultyQoQ >= 0 ? '+' : ''}{qoqData.facultyQoQ.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs font-medium text-gray-500">Benefit Eligible Faculty</div>
            <div className="text-xs text-gray-400 mt-1">
              OMA: {summary.faculty.oma.toLocaleString()} | PHX: {summary.faculty.phx.toLocaleString()}
            </div>
          </div>

          {/* Benefit-Eligible Staff */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 uppercase tracking-wide">Staff</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-gray-900">{summary.staff.count.toLocaleString()}</span>
              <span className={`text-sm font-semibold ${qoqData.staffQoQ >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {qoqData.staffQoQ >= 0 ? '+' : ''}{qoqData.staffQoQ.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs font-medium text-gray-500">Benefit Eligible Staff</div>
            <div className="text-xs text-gray-400 mt-1">
              OMA: {summary.staff.oma.toLocaleString()} | PHX: {summary.staff.phx.toLocaleString()}
            </div>
          </div>

          {/* Demographics Snapshot */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Gender Breakdown</h2>
            {demographics?.gender && (
              <div className="space-y-4">
                {/* Faculty Gender */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-700">Faculty</span>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-pink-400 inline-block" />Female {demographics.gender.faculty.distribution[0].percentage}%</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />Male {(100 - demographics.gender.faculty.distribution[0].percentage).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="flex h-6 rounded-full overflow-hidden bg-gray-100">
                    <div
                      className="bg-pink-400 flex items-center justify-center transition-all"
                      style={{
                        width: `${demographics.gender.faculty.distribution[0].percentage}%`,
                      }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {demographics.gender.faculty.distribution[0].percentage}%
                      </span>
                    </div>
                    <div className="bg-blue-400 flex-1" />
                  </div>
                </div>

                {/* Staff Gender */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-700">Staff</span>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-pink-400 inline-block" />Female {demographics.gender.staff.distribution[0].percentage}%</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />Male {(100 - demographics.gender.staff.distribution[0].percentage).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="flex h-6 rounded-full overflow-hidden bg-gray-100">
                    <div
                      className="bg-pink-400 flex items-center justify-center transition-all"
                      style={{
                        width: `${demographics.gender.staff.distribution[0].percentage}%`,
                      }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {demographics.gender.staff.distribution[0].percentage}%
                      </span>
                    </div>
                    <div className="bg-blue-400 flex-1" />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ── CHART ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Turnover by Length of Service */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Turnover by Length of Service</h2>
            {losChartData.length > 0 && (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={losChartData} margin={{ top: 25, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="range" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(value, name) => [value, name === 'faculty' ? 'Faculty' : 'Staff']}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    formatter={(value) => value === 'faculty' ? 'Benefit Eligible Faculty' : 'Benefit Eligible Staff'}
                  />
                  <Bar dataKey="staff" stackId="a" fill="#4F7BE8" name="staff">
                    <LabelList dataKey="staff" position="center" fill="#fff" fontSize={13} fontWeight={600} formatter={(v) => v > 0 ? v : ''} />
                  </Bar>
                  <Bar dataKey="faculty" stackId="a" fill="#4ADE80" radius={[4, 4, 0, 0]} name="faculty">
                    <LabelList dataKey="total" position="top" fill="#374151" fontSize={14} fontWeight={700} offset={8} />
                    <LabelList dataKey="faculty" position="center" fill="#fff" fontSize={13} fontWeight={600} formatter={(v) => v > 0 ? v : ''} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Employee Locations */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Employee Locations</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 uppercase tracking-wide">
                {quarterConfig?.label}
              </span>
            </div>
            {employeesByState && (
              <>
                <div role="img" aria-label="US map showing employee distribution: Nebraska 4,834 employees, Arizona 694 employees">
                  <ComposableMap
                    projection="geoAlbersUsa"
                    projectionConfig={{ scale: 800 }}
                    width={600}
                    height={400}
                    style={{ width: '100%', height: 'auto' }}
                  >
                    <Geographies geography={GEO_URL}>
                      {({ geographies }) =>
                        geographies.map((geo) => {
                          const fips = geo.id;
                          let fill = '#E5E7EB';
                          if (fips === STATE_FIPS.NE) fill = '#00245D';
                          if (fips === STATE_FIPS.AZ) fill = '#0054A6';
                          return (
                            <Geography
                              key={geo.rsmKey || geo.id}
                              geography={geo}
                              fill={fill}
                              stroke="#FFFFFF"
                              strokeWidth={0.5}
                              style={{
                                default: { outline: 'none' },
                                hover: { outline: 'none' },
                                pressed: { outline: 'none' },
                              }}
                            />
                          );
                        })
                      }
                    </Geographies>
                  </ComposableMap>
                </div>
                <div className="flex gap-3 mt-3 justify-center">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#00245D' }} aria-hidden="true" />
                    <span className="text-xs font-semibold text-gray-700">
                      NE: {employeesByState.NE.count.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">({employeesByState.NE.label})</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#0054A6' }} aria-hidden="true" />
                    <span className="text-xs font-semibold text-gray-700">
                      AZ: {employeesByState.AZ.count.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">({employeesByState.AZ.label})</span>
                  </div>
                </div>
                <table className="sr-only">
                  <caption>Employee distribution by campus location</caption>
                  <thead>
                    <tr><th>State</th><th>Campus</th><th>Employees</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Nebraska</td><td>{employeesByState.NE.label}</td><td>{employeesByState.NE.count}</td></tr>
                    <tr><td>Arizona</td><td>{employeesByState.AZ.label}</td><td>{employeesByState.AZ.count}</td></tr>
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>

        {/* ── KEY INSIGHTS & ACTION ITEMS ── */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-3"
          role="region"
          aria-label="Key insights"
        >
          {insights.map((insight, i) => (
            <div
              key={i}
              className={`rounded-lg border p-3 ${
                insight.type === 'warning'
                  ? 'bg-red-50 border-red-200'
                  : insight.type === 'success'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start gap-2">
                <span
                  className={`text-sm font-bold ${
                    insight.type === 'warning'
                      ? 'text-red-500'
                      : insight.type === 'success'
                      ? 'text-green-500'
                      : 'text-gray-500'
                  }`}
                  aria-hidden="true"
                >
                  {insight.type === 'warning' ? '!' : insight.type === 'success' ? '\u2713' : '\u2022'}
                </span>
                <div>
                  <h3
                    className={`text-xs font-semibold ${
                      insight.type === 'warning'
                        ? 'text-red-800'
                        : insight.type === 'success'
                        ? 'text-green-800'
                        : 'text-gray-800'
                    }`}
                  >
                    {insight.title}
                  </h3>
                  <p
                    className={`text-xs mt-0.5 ${
                      insight.type === 'warning'
                        ? 'text-red-700'
                        : insight.type === 'success'
                        ? 'text-green-700'
                        : 'text-gray-700'
                    }`}
                  >
                    {insight.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
