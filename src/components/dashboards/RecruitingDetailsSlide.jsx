import React from 'react';
import { Globe, Target, Users } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuarter } from '../../contexts/QuarterContext';
import NoDataForQuarter from '../ui/NoDataForQuarter';

/**
 * Recruiting Details Slide
 * Shows application sources, top jobs by applications, and new hire demographics.
 * Data: Hardcoded Q1 FY26 only (from RecruitingQ1FY26Dashboard).
 */

const Q1_DATA = {
  applicationSources: [
    { source: "LinkedIn", applications: 800, percentage: 40, color: "#0A66C2" },
    { source: "Creighton Careers", applications: 400, percentage: 20, color: "#0054A6" },
    { source: "External Career Site", applications: 380, percentage: 19, color: "#10B981" },
    { source: "jobright", applications: 120, percentage: 6, color: "#F59E0B" },
    { source: "Internal Career Site", applications: 100, percentage: 5, color: "#8B5CF6" },
    { source: "Other", applications: 200, percentage: 10, color: "#9CA3AF" },
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
    { title: "Research Laboratory Technic...", applications: 42 },
  ],
  demographics: {
    gender: { female: 34, male: 35, femalePercentage: 49.3, malePercentage: 50.7 },
    ethnicity: [
      { category: "White", count: 34, percentage: 49.3, color: "#3B82F6" },
      { category: "Not Disclosed", count: 14, percentage: 20.3, color: "#9CA3AF" },
      { category: "Asian", count: 10, percentage: 14.5, color: "#10B981" },
      { category: "More than one Ethnicity", count: 6, percentage: 8.7, color: "#8B5CF6" },
      { category: "Hispanic or Latino", count: 3, percentage: 4.3, color: "#F59E0B" },
      { category: "Black or African American", count: 2, percentage: 2.9, color: "#EF4444" },
    ],
    ageDistribution: [
      { band: "21-30", count: 21, percentage: 30.4, color: "#3B82F6" },
      { band: "31-40", count: 28, percentage: 40.6, color: "#10B981" },
      { band: "41-50", count: 11, percentage: 15.9, color: "#F59E0B" },
      { band: "51-60", count: 6, percentage: 8.7, color: "#8B5CF6" },
      { band: "61+", count: 3, percentage: 4.3, color: "#EF4444" },
    ],
    total: 69,
  },
};

// Only Q1 FY26 data is available
const AVAILABLE_QUARTERS = ['2025-09-30'];

const RecruitingDetailsSlide = () => {
  const { selectedQuarter } = useQuarter();

  if (!AVAILABLE_QUARTERS.includes(selectedQuarter)) {
    return <NoDataForQuarter dataLabel="Recruiting details data" />;
  }

  const { applicationSources, topJobs, demographics } = Q1_DATA;
  const maxApps = topJobs[0].applications;

  return (
    <div className="min-h-screen">
      <div className="w-[85%] max-w-[1280px] mx-auto pt-5 pb-8 space-y-6">

        {/* Two Column Layout: Sources + Top Jobs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Application Sources */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Globe size={18} style={{ color: '#0054A6' }} />
              Top Application Sources
            </h3>
            <div className="space-y-3">
              {applicationSources.map((source, index) => (
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
              <Target size={18} style={{ color: '#0054A6' }} />
              Top 10 Jobs by Applications
            </h3>
            <div className="space-y-2">
              {topJobs.map((job, index) => (
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
              ))}
            </div>
          </div>

        </div>

        {/* Demographics Section - Three Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Ethnicity Distribution */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
              New Hire Ethnicity
            </h3>
            <div className="flex flex-col items-center relative">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={demographics.ethnicity}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                    label={(entry) => entry.percentage >= 10 ? `${entry.count}` : null}
                    labelLine={false}
                  >
                    {demographics.ethnicity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, props.payload.category]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-[110px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{demographics.total}</div>
                  <div className="text-xs text-gray-600 uppercase">TOTAL</div>
                </div>
              </div>
              <div className="mt-2 w-full">
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                  {demographics.ethnicity.map((item, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: item.color }}></div>
                      <span className="text-gray-700 truncate">{item.category}: <strong>{item.count}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Age Distribution */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
              New Hire Age
            </h3>
            <div className="flex flex-col items-center relative">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={demographics.ageDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                    label={(entry) => entry.percentage >= 10 ? `${entry.count}` : null}
                    labelLine={false}
                  >
                    {demographics.ageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, props.payload.band]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-[110px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{demographics.total}</div>
                  <div className="text-xs text-gray-600 uppercase">TOTAL</div>
                </div>
              </div>
              <div className="mt-2 w-full">
                <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-xs">
                  {demographics.ageDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: item.color }}></div>
                      <span className="text-gray-700">{item.band}: <strong>{item.count}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Gender Distribution */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
              New Hire Gender
            </h3>
            <div className="flex flex-col items-center justify-center h-[280px]">
              <div className="w-full max-w-xs">
                <div className="flex h-10 rounded-lg overflow-hidden">
                  <div
                    className="bg-pink-500 flex items-center justify-center text-white text-sm font-semibold"
                    style={{ width: `${demographics.gender.femalePercentage}%` }}
                  >
                    {demographics.gender.femalePercentage}%
                  </div>
                  <div
                    className="bg-blue-500 flex items-center justify-center text-white text-sm font-semibold"
                    style={{ width: `${demographics.gender.malePercentage}%` }}
                  >
                    {demographics.gender.malePercentage}%
                  </div>
                </div>
                <div className="mt-4 flex justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-pink-500"></div>
                    <span className="text-gray-700">Female: {demographics.gender.female}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    <span className="text-gray-700">Male: {demographics.gender.male}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Methodology Note */}
        <div className="text-xs text-gray-500 text-center">
          Data Sources: Oracle Recruiting Cloud (myJobs) • Oracle HCM (New Hires)
        </div>

      </div>
    </div>
  );
};

export default RecruitingDetailsSlide;
