import React, { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from 'recharts';
import {
  getQuarterlyWorkforceData,
  getQuarterlyTurnoverData,
  getExitSurveyData,
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

// Benefit-eligible employee residence counts by state per quarter
const EMPLOYEES_BY_STATE = {
  "2025-09-30": {
    NE: 2218, AZ: 487, IA: 9, MN: 5,
    CO: 4, FL: 4, OH: 4, IL: 3,
    CA: 2, KS: 2, OR: 2,
    CT: 1, GA: 1, MD: 1, MO: 1, NJ: 1, NV: 1, PA: 1, UT: 1, VA: 1,
  }
};

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// All 50 states + DC FIPS codes (used by us-atlas TopoJSON)
const STATE_FIPS = {
  AL: "01", AK: "02", AZ: "04", AR: "05", CA: "06", CO: "08", CT: "09",
  DE: "10", DC: "11", FL: "12", GA: "13", HI: "15", ID: "16", IL: "17",
  IN: "18", IA: "19", KS: "20", KY: "21", LA: "22", ME: "23", MD: "24",
  MA: "25", MI: "26", MN: "27", MS: "28", MO: "29", MT: "30", NE: "31",
  NV: "32", NH: "33", NJ: "34", NM: "35", NY: "36", NC: "37", ND: "38",
  OH: "39", OK: "40", OR: "41", PA: "42", RI: "44", SC: "45", SD: "46",
  TN: "47", TX: "48", UT: "49", VT: "50", VA: "51", WA: "53", WV: "54",
  WI: "55", WY: "56",
};

// Reverse lookup: FIPS code -> state abbreviation
const FIPS_TO_STATE = Object.fromEntries(
  Object.entries(STATE_FIPS).map(([state, fips]) => [fips, state])
);

// State names for accessible data table
const STATE_NAMES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

// Choropleth color ranges (7 tiers)
const COLOR_RANGES = [
  { min: 500, max: Infinity, color: '#00245D', label: '500+' },
  { min: 50,  max: 499,     color: '#1D4ED8', label: '50-499' },
  { min: 10,  max: 49,      color: '#3B82F6', label: '10-49' },
  { min: 5,   max: 9,       color: '#60A5FA', label: '5-9' },
  { min: 2,   max: 4,       color: '#93C5FD', label: '2-4' },
  { min: 1,   max: 1,       color: '#DBEAFE', label: '1' },
  { min: 0,   max: 0,       color: '#E5E7EB', label: '0' },
];

function getColorForCount(count) {
  for (const range of COLOR_RANGES) {
    if (count >= range.min && count <= range.max) return range.color;
  }
  return '#E5E7EB';
}


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
          {/* Employees by Type */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
              Employees by Type
            </h2>

            <div className="space-y-2.5">
              {donutData.map((d) => {
                const maxValue = Math.max(...donutData.map(item => item.value));
                return (
                  <div key={d.name} className="flex items-center gap-3">
                    <div className="w-20 text-sm text-gray-700 font-medium truncate" title={d.fullName || d.name}>{d.name}</div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-100 rounded overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded"
                          style={{ width: `${(d.value / maxValue) * 100}%` }}
                          role="meter"
                          aria-valuenow={d.value}
                          aria-valuemin={0}
                          aria-valuemax={maxValue}
                          aria-label={`${d.fullName || d.name}: ${d.value.toLocaleString()}`}
                        />
                      </div>
                    </div>
                    <div className="w-14 text-right text-sm font-semibold text-gray-700">{d.value.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>

            {/* Screen-reader accessible data table */}
            <table className="sr-only">
              <caption>Benefit eligible workforce by employee type</caption>
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

          {/* Gender Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="text-base font-bold text-gray-900 mb-4">Gender Breakdown</h2>
            {demographics?.gender && (
              <div className="space-y-4">
                {/* Faculty Gender */}
                <div>
                  <span className="text-sm font-medium text-gray-700">Benefit Eligible Faculty</span>
                  <div className="flex h-7 rounded-full overflow-hidden bg-gray-100 mt-1.5">
                    <div
                      className="bg-emerald-500 flex items-center justify-center transition-all"
                      style={{ width: `${demographics.gender.faculty.distribution[0].percentage}%` }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {demographics.gender.faculty.distribution[0].percentage}%
                      </span>
                    </div>
                    <div className="bg-blue-400 flex-1 flex items-center justify-center">
                      <span className="text-xs font-semibold text-white">
                        {(100 - demographics.gender.faculty.distribution[0].percentage).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Staff Gender */}
                <div>
                  <span className="text-sm font-medium text-gray-700">Benefit Eligible Staff</span>
                  <div className="flex h-7 rounded-full overflow-hidden bg-gray-100 mt-1.5">
                    <div
                      className="bg-emerald-500 flex items-center justify-center transition-all"
                      style={{ width: `${demographics.gender.staff.distribution[0].percentage}%` }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {demographics.gender.staff.distribution[0].percentage}%
                      </span>
                    </div>
                    <div className="bg-blue-400 flex-1 flex items-center justify-center">
                      <span className="text-xs font-semibold text-white">
                        {(100 - demographics.gender.staff.distribution[0].percentage).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />Female
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />Male
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Exit Surveys */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Exit Surveys</h2>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${
                exitSurveyData.wouldRecommend >= 75
                  ? 'bg-green-50 text-green-700'
                  : exitSurveyData.wouldRecommend >= 50
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                {exitSurveyData.wouldRecommend >= 75 ? 'High' : exitSurveyData.wouldRecommend >= 50 ? 'Moderate' : 'Low'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-bold text-[#00695C]">{exitSurveyData.wouldRecommend}%</span>
              <span className="text-base font-medium text-gray-700">Would Recommend</span>
            </div>
            <div className="h-2.5 bg-green-100 rounded-full overflow-hidden mb-3" role="meter" aria-valuenow={exitSurveyData.wouldRecommend} aria-valuemin={0} aria-valuemax={100} aria-label={`${exitSurveyData.wouldRecommend}% would recommend`}>
              <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${exitSurveyData.wouldRecommend}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {Math.round(exitSurveyData.wouldRecommend / 100 * exitSurveyData.totalResponses)} of {exitSurveyData.totalResponses} responses
              </span>
              <div className="flex gap-0.5" aria-hidden="true">
                {Array.from({ length: exitSurveyData.totalResponses }, (_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${i < Math.round(exitSurveyData.wouldRecommend / 100 * exitSurveyData.totalResponses) ? 'bg-[#10B981]' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── CHART ROW (60/40 split) ── */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Benefit Eligible Employee by State — Choropleth Map */}
          <div className="bg-white rounded-lg shadow-sm border p-4" style={{ flex: 3 }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900">Benefit Eligible Employee by State</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 uppercase tracking-wide">
                {quarterConfig?.label}
              </span>
            </div>
            {employeesByState && (
              <>
                <div
                  role="img"
                  aria-label={`US choropleth map showing benefit-eligible employee distribution across ${Object.keys(employeesByState).length} states. Total: ${Object.values(employeesByState).reduce((s, c) => s + c, 0).toLocaleString()} employees.`}
                >
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
                          const stateCode = FIPS_TO_STATE[fips];
                          const count = stateCode ? (employeesByState[stateCode] || 0) : 0;
                          return (
                            <Geography
                              key={geo.rsmKey || geo.id}
                              geography={geo}
                              fill={getColorForCount(count)}
                              stroke="#FFFFFF"
                              strokeWidth={0.5}
                              style={{
                                default: { outline: 'none' },
                                hover: { outline: 'none', opacity: 0.85 },
                                pressed: { outline: 'none' },
                              }}
                            />
                          );
                        })
                      }
                    </Geographies>
                  </ComposableMap>
                </div>

                {/* Color legend */}
                <div className="mt-3">
                  <div className="text-xs font-semibold text-gray-600 mb-1.5 text-center">Employees by State</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {COLOR_RANGES.slice().reverse().map((range) => (
                      <div key={range.label} className="flex items-center gap-1">
                        <span
                          className="w-4 h-3 rounded-sm inline-block border border-gray-300"
                          style={{ backgroundColor: range.color }}
                          aria-hidden="true"
                        />
                        <span className="text-[10px] text-gray-600">{range.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Screen-reader accessible data table */}
                <table className="sr-only">
                  <caption>Benefit-eligible employee count by state of residence</caption>
                  <thead>
                    <tr><th>State</th><th>Employees</th></tr>
                  </thead>
                  <tbody>
                    {Object.entries(employeesByState)
                      .sort((a, b) => b[1] - a[1])
                      .map(([code, count]) => (
                        <tr key={code}><td>{STATE_NAMES[code] || code}</td><td>{count}</td></tr>
                      ))
                    }
                  </tbody>
                </table>
              </>
            )}
          </div>

          {/* Turnover by Length of Service */}
          <div className="bg-white rounded-lg shadow-sm border p-4" style={{ flex: 2 }}>
            <h2 className="text-base font-bold text-gray-900 mb-3">Turnover by Length of Service</h2>
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
