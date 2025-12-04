import React from 'react';
import { UserPlus, Users, UserCheck, Briefcase, BarChart3, MapPin, Building2, Calendar, TrendingUp, FileText, CheckCircle, AlertCircle, Info, Clock, Target, Filter, Award, Linkedin, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from 'recharts';

/**
 * Q1 FY26 Recruiting Dashboard
 * Displays quarterly new hire data for benefit-eligible Faculty and Staff
 * Plus recruitment pipeline metrics from Oracle Recruiting Cloud (myJobs) and Interfolio
 *
 * Data Sources:
 * - Oracle HCM: Validated new hire counts
 * - Oracle Recruiting Cloud (myJobs): Staff recruitment pipeline
 * - Interfolio: Faculty recruitment pipeline
 *
 * Methodology: NEW_HIRES_METHODOLOGY.md
 * Design System Reference: docs/QUARTERLY_REPORTS_DESIGN_SYSTEM.md
 */

// Q1 FY26 New Hire Data - extracted from Oracle HCM (Source of Truth)
const Q1_FY26_DATA = {
  reportingDate: "9/30/25",
  quarter: "Q1 FY26",
  fiscalPeriod: "July 2025 - September 2025",
  dataAsOf: "2025-08-31",
  note: "Data available through August 2025. September hires pending next data refresh.",
  summary: {
    total: { count: 69, oma: 68, phx: 1 },
    faculty: { count: 31, oma: 31, phx: 0 },
    staff: { count: 38, oma: 37, phx: 1 }
  },
  bySchool: [
    { school: "Arts & Sciences", faculty: 17, staff: 0, total: 17 },
    { school: "Medicine", faculty: 2, staff: 6, total: 8 },
    { school: "Facilities", faculty: 0, staff: 8, total: 8 },
    { school: "Dentistry", faculty: 4, staff: 3, total: 7 },
    { school: "Heider College of Business", faculty: 3, staff: 2, total: 5 },
    { school: "Nursing", faculty: 3, staff: 1, total: 4 },
    { school: "Athletics", faculty: 0, staff: 3, total: 3 },
    { school: "Law School", faculty: 1, staff: 2, total: 3 },
    { school: "Other", faculty: 1, staff: 13, total: 14 }
  ],
  byMonth: [
    { month: "July 2025", faculty: 25, staff: 17, total: 42 },
    { month: "August 2025", faculty: 6, staff: 21, total: 27 },
    { month: "September 2025", faculty: 0, staff: 0, total: 0 }
  ],
  demographics: {
    gender: {
      female: 34,
      male: 35,
      femalePercentage: 49.3,
      malePercentage: 50.7
    },
    ethnicity: [
      { category: "White", count: 34, percentage: 49.3, color: "#3B82F6" },
      { category: "Not Disclosed", count: 14, percentage: 20.3, color: "#9CA3AF" },
      { category: "Asian", count: 10, percentage: 14.5, color: "#10B981" },
      { category: "More than one Ethnicity", count: 6, percentage: 8.7, color: "#8B5CF6" },
      { category: "Hispanic or Latino", count: 3, percentage: 4.3, color: "#F59E0B" },
      { category: "Black or African American", count: 2, percentage: 2.9, color: "#EF4444" }
    ],
    ageDistribution: [
      { band: "21-30", count: 21, percentage: 30.4, color: "#3B82F6" },
      { band: "31-40", count: 28, percentage: 40.6, color: "#10B981" },
      { band: "41-50", count: 11, percentage: 15.9, color: "#F59E0B" },
      { band: "51-60", count: 6, percentage: 8.7, color: "#8B5CF6" },
      { band: "61+", count: 3, percentage: 4.3, color: "#EF4444" }
    ]
  }
};

// Oracle Recruiting Cloud (myJobs) - Staff Pipeline Data
const MYJOBS_DATA = {
  source: "Oracle Recruiting Cloud (myJobs)",
  asOf: "Q1 FY26",
  requisitions: {
    open: 143,
    perRecruiter: 28.6,
    avgDaysOpen: 71,
    avgTimeToFill: 35.5,
    jobPostings: 0
  },
  applications: {
    active: 767,
    new: 2000,
    perRequisition: 11.1,
    internalPercentage: 3.0,
    referrals: 7
  },
  hires: {
    total: 40,
    internal: 13,
    internalRate: 32.5,
    avgDaysToHire: 15.5,
    hrProcessing: 35
  },
  offerAcceptance: 97.7,
  topJobFamilies: [
    { name: "Academic & Student Affairs", openings: 45 },
    { name: "Administration", openings: 32 },
    { name: "Health Services", openings: 12 },
    { name: "Information Technology", openings: 10 },
    { name: "Research", openings: 9 },
    { name: "Facilities", openings: 8 },
    { name: "Mission and Ministry", openings: 5 },
    { name: "Public Safety & Transport", openings: 4 },
    { name: "Communications & Marketing", openings: 3 },
    { name: "Athletics & Recreation", openings: 2 }
  ],
  applicationSources: [
    { source: "LinkedIn", applications: 800, percentage: 40, color: "#0A66C2" },
    { source: "Creighton Careers", applications: 400, percentage: 20, color: "#0054A6" },
    { source: "External Career Site", applications: 380, percentage: 19, color: "#10B981" },
    { source: "jobright", applications: 120, percentage: 6, color: "#F59E0B" },
    { source: "Internal Career Site", applications: 100, percentage: 5, color: "#8B5CF6" },
    { source: "Other", applications: 200, percentage: 10, color: "#9CA3AF" }
  ],
  topJobs: [
    { title: "Senior Software Developer", applications: 165 },
    { title: "Senior Data Engineer", applications: 140 },
    { title: "Senior Human Resource Gen...", applications: 95 },
    { title: "Assistant Director for Leader...", applications: 85 },
    { title: "Data Manager/IT and Commu...", applications: 72 },
    { title: "Program Planner CPCE", applications: 65 },
    { title: "Director of Corporate Partner...", applications: 58 },
    { title: "Events Management Specialist", applications: 52 },
    { title: "Administrative Assistant II", applications: 48 },
    { title: "Research Laboratory Technic...", applications: 42 }
  ],
  requisitionAging: [
    { range: "0-30 Days", count: 45, percentage: 31.5, color: "#10B981" },
    { range: "31-60 Days", count: 38, percentage: 26.6, color: "#3B82F6" },
    { range: "61-90 Days", count: 28, percentage: 19.6, color: "#F59E0B" },
    { range: "91-120 Days", count: 18, percentage: 12.6, color: "#EF4444" },
    { range: ">120 Days", count: 14, percentage: 9.8, color: "#7F1D1D" }
  ]
};

// Interfolio - Faculty Pipeline Data
const INTERFOLIO_DATA = {
  source: "Interfolio",
  asOf: "Q1 FY26",
  hires: [
    { name: "Matthew Cheung", degree: "Pharm.D.", position: "Asst/Assoc Professor of Pharmacy Practice", department: "Pharmacy Practice", hireDate: "8/11/2025", type: "Tenure Track" },
    { name: "Hannah Clark", degree: "M.F.A.", position: "Non-Tenure Track Asst Professor", department: "Fine & Performing Arts", hireDate: "8/17/2025", type: "Non-Tenure" },
    { name: "Bryan Harmer", degree: "Ph.D.", position: "Assistant Professor", department: "Paramedicine (Nursing)", hireDate: "7/10/2025", type: "Tenure Track" },
    { name: "Jessie Kernagis", degree: "M.H.A.", position: "AHA Instructor", department: "Phoenix Campus", hireDate: "7/22/2025", type: "Instructor" },
    { name: "McKenzie Lehman", degree: "Ph.D.", position: "Asst/Assoc Professor (tenure track)", department: "Medical Microbiology", hireDate: "8/23/2025", type: "Tenure Track" },
    { name: "Casey Marriott", degree: "B.Sc.", position: "Special Faculty", department: "Nursing - Omaha", hireDate: "9/29/2025", type: "Special Faculty" }
  ],
  summary: {
    total: 6,
    tenureTrack: 3,
    nonTenure: 1,
    instructor: 1,
    specialFaculty: 1
  }
};

const RecruitingQ1FY26Dashboard = () => {
  const data = Q1_FY26_DATA;
  const summary = data.summary;
  const myJobs = MYJOBS_DATA;
  const interfolio = INTERFOLIO_DATA;

  // Colors for charts
  const COLORS = {
    faculty: '#10B981',  // Green
    staff: '#3B82F6',    // Blue
    primary: '#0054A6'   // Creighton Blue
  };

  // Prepare bar chart data for schools
  const schoolChartData = data.bySchool.slice(0, 8).map(s => ({
    name: s.school.length > 15 ? s.school.substring(0, 12) + '...' : s.school,
    fullName: s.school,
    Faculty: s.faculty,
    Staff: s.staff,
    total: s.total
  }));

  // Recruitment funnel data
  const funnelData = [
    { name: 'Applications', value: myJobs.applications.new, fill: '#3B82F6' },
    { name: 'Active', value: myJobs.applications.active, fill: '#10B981' },
    { name: 'HR Processing', value: myJobs.hires.hrProcessing, fill: '#F59E0B' },
    { name: 'Hired', value: myJobs.hires.total, fill: '#0054A6' }
  ];

  return (
    <div id="recruiting-q1-fy26-dashboard" className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">

        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <UserPlus style={{color: '#0054A6'}} size={32} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {data.quarter} Recruiting & New Hires Report
                  </h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Benefit Eligible Employees • {data.fiscalPeriod}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    New hire counts, recruitment pipeline, and hiring analytics
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold" style={{color: '#0054A6'}}>
                  {summary.total.count}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total {data.quarter} New Hires</div>
                <div className="text-xs text-gray-500 mt-1">
                  Benefit Eligible - Faculty: {summary.faculty.count} | Staff: {summary.staff.count}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Freshness Note */}
        <div className="text-xs text-amber-700 mb-6 bg-amber-50 p-3 rounded border border-amber-200">
          <span className="font-semibold">Note:</span> {data.note} Data as of {data.dataAsOf}.
        </div>

        {/* New Hire Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Total New Hires Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Users style={{color: '#0054A6'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                Q1
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{summary.total.count}</div>
            <div className="text-sm text-gray-600 font-medium">Total New Hires</div>
            <div className="text-xs text-gray-500 mt-2">
              OMA: {summary.total.oma} | PHX: {summary.total.phx}
            </div>
          </div>

          {/* Faculty New Hires Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <UserCheck style={{color: '#10B981'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                FACULTY
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{summary.faculty.count}</div>
            <div className="text-sm text-gray-600 font-medium">Benefit Eligible Faculty Hires</div>
            <div className="text-xs text-gray-500 mt-2">
              OMA: {summary.faculty.oma} | PHX: {summary.faculty.phx}
            </div>
          </div>

          {/* Staff New Hires Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Briefcase style={{color: '#3B82F6'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                STAFF
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{summary.staff.count}</div>
            <div className="text-sm text-gray-600 font-medium">Benefit Eligible Staff Hires</div>
            <div className="text-xs text-gray-500 mt-2">
              OMA: {summary.staff.oma} | PHX: {summary.staff.phx}
            </div>
          </div>

        </div>

        {/* ============================================== */}
        {/* RECRUITMENT PIPELINE SECTION (from myJobs)    */}
        {/* ============================================== */}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Filter style={{color: '#0054A6'}} size={28} />
            Staff Recruitment Pipeline
            <span className="text-sm font-normal text-gray-500 ml-2">(Oracle Recruiting Cloud - myJobs)</span>
          </h2>

          {/* Pipeline Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Open Requisitions</div>
              <div className="text-2xl font-bold text-gray-900">{myJobs.requisitions.open}</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Active Applications</div>
              <div className="text-2xl font-bold text-gray-900">{myJobs.applications.active}</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Apps per Req</div>
              <div className="text-2xl font-bold text-gray-900">{myJobs.applications.perRequisition}</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Avg Days to Fill</div>
              <div className="text-2xl font-bold text-gray-900">{myJobs.requisitions.avgTimeToFill}</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Offer Accept Rate</div>
              <div className="text-2xl font-bold text-green-600">{myJobs.offerAcceptance}%</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Internal Hire Rate</div>
              <div className="text-2xl font-bold text-blue-600">{myJobs.hires.internalRate}%</div>
            </div>

          </div>

          {/* Two Column Layout: Sources + Top Jobs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Application Sources */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Globe size={18} style={{color: '#0054A6'}} />
                Top Application Sources
              </h3>

              <div className="space-y-3">
                {myJobs.applicationSources.map((source, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-28 text-sm text-gray-700 truncate">{source.source}</div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-100 rounded overflow-hidden">
                        <div
                          className="h-full flex items-center justify-end pr-2 text-xs text-white font-medium"
                          style={{ width: `${source.percentage}%`, backgroundColor: source.color }}
                        >
                          {source.percentage >= 10 && `${source.percentage}%`}
                        </div>
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm text-gray-600">{source.applications}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                LinkedIn leads with 40% of applications
              </div>
            </div>

            {/* Top Jobs Attracting Candidates */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target size={18} style={{color: '#0054A6'}} />
                Top 10 Jobs by Applications
              </h3>

              <div className="space-y-2">
                {myJobs.topJobs.map((job, index) => {
                  const maxApps = myJobs.topJobs[0].applications;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-48 text-xs text-gray-700 truncate" title={job.title}>{job.title}</div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-100 rounded overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${(job.applications / maxApps) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-10 text-right text-xs font-semibold text-gray-700">{job.applications}</div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Two Column Layout: Job Families + Requisition Aging */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Top Job Families */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 size={18} style={{color: '#0054A6'}} />
                Job Openings by Family
              </h3>

              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={myJobs.topJobFamilies}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#374151' }}
                      width={135}
                    />
                    <Tooltip />
                    <Bar dataKey="openings" fill="#0054A6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Requisition Aging */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={18} style={{color: '#0054A6'}} />
                Requisition Aging
              </h3>

              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={myJobs.requisitionAging}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="count"
                      label={(entry) => `${entry.count}`}
                      labelLine={false}
                    >
                      {myJobs.requisitionAging.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value} reqs (${props.payload.percentage}%)`, props.payload.range]} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                  {myJobs.requisitionAging.map((item, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded" style={{backgroundColor: item.color}}></div>
                      <span className="text-gray-700">{item.range}: {item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 text-xs text-amber-600 text-center">
                22.4% of requisitions open 90+ days
              </div>
            </div>

          </div>
        </div>

        {/* ============================================== */}
        {/* FACULTY HIRING SECTION (from Interfolio)      */}
        {/* ============================================== */}

        <div className="bg-gradient-to-r from-green-50 to-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Award style={{color: '#10B981'}} size={24} />
            Faculty Hiring Detail
            <span className="text-sm font-normal text-gray-500 ml-2">(Interfolio)</span>
          </h2>

          {/* Faculty Hire Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-gray-900">{interfolio.summary.total}</div>
              <div className="text-xs text-gray-600">Total Hires</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-green-600">{interfolio.summary.tenureTrack}</div>
              <div className="text-xs text-gray-600">Tenure Track</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-blue-600">{interfolio.summary.nonTenure}</div>
              <div className="text-xs text-gray-600">Non-Tenure</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-purple-600">{interfolio.summary.instructor}</div>
              <div className="text-xs text-gray-600">Instructor</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-amber-600">{interfolio.summary.specialFaculty}</div>
              <div className="text-xs text-gray-600">Special Faculty</div>
            </div>
          </div>

          {/* Faculty Hires Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Degree</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Position</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Department</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Hire Date</th>
                </tr>
              </thead>
              <tbody>
                {interfolio.hires.map((hire, index) => (
                  <tr key={index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{hire.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{hire.degree}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{hire.position}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{hire.department}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                        hire.type === 'Tenure Track' ? 'bg-green-100 text-green-800' :
                        hire.type === 'Non-Tenure' ? 'bg-blue-100 text-blue-800' :
                        hire.type === 'Instructor' ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {hire.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-600">{hire.hireDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">
            50% tenure-track positions (3 of 6 faculty hires)
          </div>
        </div>

        {/* ============================================== */}
        {/* NEW HIRES BREAKDOWN SECTION                   */}
        {/* ============================================== */}

        {/* Monthly Hiring Trend */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar style={{color: '#0054A6'}} size={20} />
            Monthly Hiring Trend
          </h2>

          {/* Chart Area */}
          <div className="relative" style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.byMonth} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => value.replace(' 2025', '')}
                />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="faculty" name="Faculty" fill={COLORS.faculty} radius={[4, 4, 0, 0]} />
                <Bar dataKey="staff" name="Staff" fill={COLORS.staff} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Note */}
          <div className="text-xs text-gray-600 mt-4 bg-blue-50 p-3 rounded border border-blue-200 text-center">
            <span className="font-semibold">Note:</span> July shows highest hiring activity with 42 new hires (25 Faculty, 17 Staff), aligning with academic year start. September data pending.
          </div>
        </div>

        {/* New Hires by School/Organization */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Building2 style={{color: '#0054A6'}} size={20} />
            New Hires by School/Organization
          </h2>

          {/* Horizontal Bar Chart */}
          <div style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={schoolChartData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#374151' }}
                  width={110}
                />
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="Faculty" stackId="a" fill={COLORS.faculty} />
                <Bar dataKey="Staff" stackId="a" fill={COLORS.staff} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Data Note */}
          <div className="text-xs text-gray-600 mt-4 bg-blue-50 p-3 rounded border border-blue-200 text-center">
            <span className="font-semibold">Note:</span> Arts & Sciences leads with 17 faculty hires (all academic positions). Facilities and Medicine tied for second with 8 hires each, primarily staff positions.
          </div>
        </div>

        {/* Demographics Section - Two Charts Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Ethnicity Distribution */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">
              New Hire Ethnicity Distribution
            </h2>

            <div className="flex flex-col items-center relative">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.demographics.ethnicity}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    label={(entry) => entry.percentage >= 5 ? `${entry.count}` : null}
                    labelLine={false}
                  >
                    {data.demographics.ethnicity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, props.payload.category]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Label */}
              <div className="absolute top-[140px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{summary.total.count}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">TOTAL</div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 w-full">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  {data.demographics.ethnicity.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{backgroundColor: item.color}}></div>
                      <span className="text-gray-700">{item.category}: <strong>{item.count}</strong> ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Age Distribution */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">
              New Hire Age Distribution
            </h2>

            <div className="flex flex-col items-center relative">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.demographics.ageDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    label={(entry) => entry.percentage >= 5 ? `${entry.count}` : null}
                    labelLine={false}
                  >
                    {data.demographics.ageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, props.payload.band]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Label */}
              <div className="absolute top-[140px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{summary.total.count}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">TOTAL</div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 w-full">
                <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-xs">
                  {data.demographics.ageDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{backgroundColor: item.color}}></div>
                      <span className="text-gray-700">{item.band}: <strong>{item.count}</strong> ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Gender Distribution Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users style={{color: '#0054A6'}} size={20} />
            New Hire Gender Distribution
          </h2>

          <div className="max-w-2xl mx-auto">
            {/* Horizontal stacked bar */}
            <div className="flex h-12 rounded-lg overflow-hidden">
              <div
                className="bg-pink-500 flex items-center justify-center text-white font-semibold"
                style={{ width: `${data.demographics.gender.femalePercentage}%` }}
              >
                {data.demographics.gender.female} Female ({data.demographics.gender.femalePercentage}%)
              </div>
              <div
                className="bg-blue-500 flex items-center justify-center text-white font-semibold"
                style={{ width: `${data.demographics.gender.malePercentage}%` }}
              >
                {data.demographics.gender.male} Male ({data.demographics.gender.malePercentage}%)
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-pink-500"></div>
                <span className="text-gray-700">Female: {data.demographics.gender.female} ({data.demographics.gender.femalePercentage}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span className="text-gray-700">Male: {data.demographics.gender.male} ({data.demographics.gender.malePercentage}%)</span>
              </div>
            </div>
          </div>

          {/* Data Note */}
          <div className="text-xs text-gray-600 mt-6 bg-blue-50 p-3 rounded border border-blue-200 text-center">
            <span className="font-semibold">Note:</span> Gender distribution shows near-equal representation with 49.3% female and 50.7% male new hires in {data.quarter}.
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

                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">69 benefit-eligible new hires</span> in Q1 FY26 (July-August data)
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">97.7% offer acceptance rate</span> - strong candidate experience
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">32.5% internal hire rate</span> - promoting from within
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">35.5 avg days to fill</span> - efficient hiring process
                  </div>
                </div>

              </div>
            </div>

            {/* Critical Insights */}
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-4">Critical Insights</h3>
              <div className="space-y-3">

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">LinkedIn top source:</span> 40% of applications from LinkedIn
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">22% of reqs open 90+ days:</span> May need sourcing support
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">Academic & Student Affairs:</span> 45 openings (largest job family)
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">50% tenure-track faculty:</span> 3 of 6 faculty hires on tenure track
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Methodology Note */}
        <div className="text-xs text-gray-500 text-center">
          <p>Data Sources: Oracle HCM (New Hires) • Oracle Recruiting Cloud/myJobs (Staff Pipeline) • Interfolio (Faculty Pipeline)</p>
          <p className="mt-1">Methodology: NEW_HIRES_METHODOLOGY.md • Excludes Grade R (Residents/Fellows)</p>
        </div>

      </div>
    </div>
  );
};

export default RecruitingQ1FY26Dashboard;
