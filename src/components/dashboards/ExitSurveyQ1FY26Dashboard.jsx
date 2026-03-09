import React from 'react';
import { FileText, Users, BarChart3, ThumbsUp, Star, AlertTriangle, TrendingDown, Lightbulb, UserCheck } from 'lucide-react';
import { getExitSurveyData } from '../../services/dataService';
import { useQuarter } from '../../contexts/QuarterContext';
import NoDataForQuarter from '../ui/NoDataForQuarter';

/**
 * Exit Survey Dashboard
 * Displays quarterly exit survey analysis following the Quarterly Reports Design System
 *
 * Design System Reference: docs/QUARTERLY_REPORTS_DESIGN_SYSTEM.md
 * Exit Survey Patterns: docs/EXIT_SURVEY_DESIGN_SYSTEM.md
 */

// Color palette for departure reasons chart (12 distinct colors for all reasons)
const DEPARTURE_REASON_COLORS = [
  '#6B7280', // Gray - Other
  '#EF4444', // Red - Dissatisfied with supervisor
  '#3B82F6', // Blue - Career/Job reasons
  '#3B82F6', // Blue
  '#3B82F6', // Blue
  '#10B981', // Green - Personal reasons
  '#F59E0B', // Amber - Salary
  '#8B5CF6', // Purple - Leadership
  '#EC4899', // Pink - Relocation
  '#14B8A6', // Teal - Workload
  '#F97316', // Orange - Retirement
  '#6366F1'  // Indigo - Remote/Hybrid
];

const SATISFACTION_CATEGORIES = [
  { label: 'Management Support', key: 'managementSupport' },
  { label: 'Benefits', key: 'benefits' },
  { label: 'Job Satisfaction', key: 'jobSatisfaction' },
  { label: 'Career Development', key: 'careerDevelopment' },
  { label: 'Compensation', key: 'compensation' },
  { label: 'Work-Life Balance', key: 'workLifeBalance' },
];

// Quarterly trend data (descending by date)
const quarterlyData = [
  {
    quarter: 'Q2 FY26',
    terminations: 39,
    faculty: 5,
    staff: 29,
    hsp: 5,
    responses: 10,
    responseRate: 25.6,
    satisfaction: 90
  },
  {
    quarter: 'Q1 FY26',
    terminations: 73,
    faculty: 4,
    staff: 54,
    hsp: 15,
    responses: 15,
    responseRate: 20.5,
    satisfaction: 80
  },
  {
    quarter: 'Q4 FY25',
    terminations: 51,
    faculty: 10,
    staff: 41,
    responses: 18,
    responseRate: 35.3,
    satisfaction: 83.3
  },
  {
    quarter: 'Q3 FY25',
    terminations: 51,
    faculty: 8,
    staff: 43,
    responses: 20,
    responseRate: 39.2,
    satisfaction: 45
  },
  {
    quarter: 'Q2 FY25',
    terminations: 38,
    faculty: 4,
    staff: 34,
    responses: 26,
    responseRate: 68.4,
    satisfaction: 57.7
  },
  {
    quarter: 'Q1 FY25',
    terminations: 79,
    faculty: 5,
    staff: 74,
    responses: 25,
    responseRate: 31.6,
    satisfaction: 64.0
  }
];

const getSatisfactionColor = (score) => {
  if (score >= 3.5) return '#71CC98'; // Creighton green
  if (score >= 3.0) return '#FFC72C'; // Creighton yellow
  return '#EF4444'; // Red for low scores
};

const getBarWidth = (score) => (score / 5.0) * 100;

const ExitSurveyQ1FY26Dashboard = () => {
  const { selectedQuarter, quarterConfig } = useQuarter();

  // Get data based on global quarter
  const surveyData = getExitSurveyData(selectedQuarter);

  if (!surveyData) {
    return <NoDataForQuarter dataLabel="Exit survey data" />;
  }

  const quarterLabel = surveyData.quarter || quarterConfig?.label || 'Quarter';
  const quarterShort = quarterLabel.split(' ')[0];
  const periodText = quarterConfig?.period || '';

  // Build employee type subtitle from demographics or default to all-staff
  const getEmployeeTypeSubtitle = () => {
    if (surveyData.demographics?.employeeType) {
      return surveyData.demographics.employeeType
        .map(t => `${t.type}: ${t.count} (${t.percentage}%)`)
        .join(', ');
    }
    return `Staff: ${surveyData.totalResponses} (100%)`;
  };

  return (
    <div id="exit-survey-q1-fy26-dashboard" className="min-h-screen">
      <div className="w-[85%] max-w-[1280px] mx-auto pt-5 pb-8">

        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText style={{color: '#0054A6'}} size={32} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {quarterLabel} Exit Analysis Report
                  </h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Quarterly Exit Survey Analysis • {periodText}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Employee exit survey feedback and departure insights
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold" style={{color: '#0054A6'}}>
                  {surveyData.totalResponses}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total {quarterLabel} Responses</div>
                <div className="text-xs text-gray-500 mt-1">
                  {getEmployeeTypeSubtitle()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Cards (5-column) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">

          {/* Card 1: Total Responses */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Users style={{color: '#0054A6'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                {quarterShort}
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{surveyData.totalResponses}</div>
            <div className="text-sm text-gray-600 font-medium">Total Responses</div>
            <div className="text-xs text-gray-500 mt-2">{surveyData.totalResponses} of {surveyData.totalExits} terminations</div>
          </div>

          {/* Card 2: Survey Response Rate */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 style={{color: '#1F74DB'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                RATE
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {surveyData.responseRate ? `${surveyData.responseRate}%` : 'TBD'}
            </div>
            <div className="text-sm text-gray-600 font-medium">Survey Response Rate</div>
            <div className="text-xs text-gray-500 mt-2">{surveyData.totalResponses} of {surveyData.totalExits} terminations</div>
          </div>

          {/* Card 3: Would Recommend */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <ThumbsUp style={{color: '#71CC98'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                HIGH
              </span>
            </div>
            <div className="text-4xl font-bold mb-1" style={{color: '#71CC98'}}>
              {surveyData.wouldRecommend}%
            </div>
            <div className="text-sm text-gray-600 font-medium">Would Recommend</div>
            <div className="text-xs text-gray-500 mt-2">
              {surveyData.wouldRecommendCount.positive} of {surveyData.wouldRecommendCount.total} responses
            </div>
          </div>

          {/* Card 4: Overall Satisfaction */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Star style={{color: '#FFC72C'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                GOOD
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{surveyData.overallSatisfaction}</div>
            <div className="text-sm text-gray-600 font-medium">Avg Satisfaction</div>
            <div className="text-xs text-gray-500 mt-2">Out of 5.0 scale</div>
          </div>

          {/* Card 5: Concerns Reported */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle style={{color: '#F59E0B'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800 font-medium">
                MONITOR
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{surveyData.concernsReported.percentage}%</div>
            <div className="text-sm text-gray-600 font-medium">Concerns Reported</div>
            <div className="text-xs text-gray-500 mt-2">
              {surveyData.concernsReported.count} of {surveyData.concernsReported.total} responses
            </div>
          </div>
        </div>

        {/* Key Takeaway Banner (replaces Executive Summary) */}
        {surveyData.keyInsights && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Lightbulb style={{color: '#0054A6'}} size={20} className="mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <span className="font-semibold" style={{color: '#0054A6'}}>Key Takeaway:</span>{' '}
              {surveyData.keyInsights.positiveFeedback?.[0]}
              {surveyData.keyInsights.areasOfConcern?.[0] && (
                <> &mdash; however, {surveyData.keyInsights.areasOfConcern[0].toLowerCase()}</>
              )}
            </div>
          </div>
        )}

        {/* Primary Reasons for Leaving + Contributing Exit Reasons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Primary Reasons for Leaving */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingDown style={{color: '#0054A6'}} size={20} />
              Primary Reasons for Leaving
            </h2>
            <p className="text-sm text-gray-600 mb-6">Top reason cited by respondents</p>

            <div className="space-y-3">
              {surveyData.departureReasons.map((reason, index) => {
                const visualWidth = Math.min(reason.percentage * 3, 100);

                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-40 text-sm text-gray-700 font-medium truncate" title={reason.reason}>
                      {reason.reason.length > 25 ? reason.reason.substring(0, 22) + '...' : reason.reason}
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-8">
                        <div
                          className="h-8 rounded-full flex items-center px-4 text-white font-semibold text-sm"
                          style={{
                            width: `${visualWidth}%`,
                            minWidth: '100px',
                            backgroundColor: DEPARTURE_REASON_COLORS[index % DEPARTURE_REASON_COLORS.length]
                          }}
                        >
                          {reason.count != null ? `${reason.count} (${reason.percentage}%)` : `${reason.percentage}%`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-gray-600 mt-6 bg-yellow-50 p-3 rounded border border-yellow-200">
              <span className="font-semibold">Note:</span> {surveyData.departureReasons.length} distinct departure reasons cited across {surveyData.totalResponses} responses received in {quarterLabel}.
            </div>
          </div>

          {/* Contributing Exit Reasons */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingDown style={{color: '#0054A6'}} size={20} />
              Contributing Exit Reasons
            </h2>
            <p className="text-sm text-gray-600 mb-6">Additional factors (multi-select)</p>

            <div className="space-y-3">
              {surveyData.contributingReasons && surveyData.contributingReasons.slice(0, 10).map((reason, index) => {
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-48 text-sm text-gray-700 font-medium truncate" title={reason.reason}>
                      {reason.reason.length > 35 ? reason.reason.substring(0, 32) + '...' : reason.reason}
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-8">
                        <div
                          className="h-8 rounded-full flex items-center px-4 text-white font-semibold text-sm"
                          style={{
                            width: `${Math.max(reason.percentage, 15)}%`,
                            minWidth: '95px',
                            backgroundColor: DEPARTURE_REASON_COLORS[index % DEPARTURE_REASON_COLORS.length]
                          }}
                        >
                          {reason.count != null ? `${reason.count} (${reason.percentage}%)` : `${reason.percentage}%`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-gray-600 mt-6 bg-blue-50 p-3 rounded border border-blue-200">
              <span className="font-semibold">Insight:</span> Respondents could select multiple contributing factors. Percentages exceed 100% due to multi-select responses.
            </div>
          </div>
        </div>

        {/* Satisfaction Ratings + Demographics (or Would Recommend fallback) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Satisfaction Ratings by Category */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 style={{color: '#0054A6'}} size={20} />
              Satisfaction Ratings by Category
            </h2>

            <div className="space-y-4">
              {SATISFACTION_CATEGORIES.map(({ label, key }) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">{label}</span>
                    <span className="font-bold" style={{color: getSatisfactionColor(surveyData.satisfactionRatings[key])}}>
                      {surveyData.satisfactionRatings[key]}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full"
                      style={{
                        width: `${getBarWidth(surveyData.satisfactionRatings[key])}%`,
                        backgroundColor: getSatisfactionColor(surveyData.satisfactionRatings[key])
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-500 mt-6 text-center bg-gray-50 p-2 rounded">
              Scale: 1.0 (Very Dissatisfied) to 5.0 (Very Satisfied)
            </div>
          </div>

          {/* Demographics (Q2+) or Would Recommend (Q1 and earlier) */}
          {surveyData.demographics ? (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <UserCheck style={{color: '#0054A6'}} size={20} />
                Respondent Demographics
              </h2>

              {/* Gender */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Gender</h3>
                <div className="w-full bg-gray-200 rounded-full h-6 flex overflow-hidden">
                  {surveyData.demographics.gender.map((g, i) => (
                    <div
                      key={i}
                      className="h-6 flex items-center justify-center text-xs font-semibold text-white"
                      style={{
                        width: `${g.percentage}%`,
                        backgroundColor: i === 0 ? '#3B82F6' : '#EC4899',
                        minWidth: '50px'
                      }}
                      title={`${g.label}: ${g.count} (${g.percentage}%)`}
                    >
                      {g.label} {g.percentage}%
                    </div>
                  ))}
                </div>
              </div>

              {/* Age Distribution */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Age at Departure</h3>
                <div className="space-y-1.5">
                  {surveyData.demographics.age.map((a, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-20 text-xs text-gray-600">{a.range}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className="h-4 rounded-full flex items-center px-2 text-xs font-semibold text-white"
                          style={{
                            width: `${Math.max(a.percentage, 12)}%`,
                            minWidth: '40px',
                            backgroundColor: '#6366F1'
                          }}
                        >
                          {a.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tenure at Departure */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Tenure at Departure</h3>
                <div className="space-y-1.5">
                  {surveyData.demographics.tenure.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-24 text-xs text-gray-600">{t.range}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className="h-4 rounded-full flex items-center px-2 text-xs font-semibold text-white"
                          style={{
                            width: `${Math.max(t.percentage, 12)}%`,
                            minWidth: '40px',
                            backgroundColor: t.percentage >= 50 ? '#EF4444' : '#10B981'
                          }}
                        >
                          {t.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employee Type */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Employee Type</h3>
                <div className="flex gap-3">
                  {surveyData.demographics.employeeType.map((et, i) => (
                    <div key={i} className="flex-1 bg-gray-50 p-2 rounded border text-center">
                      <div className="text-lg font-bold text-gray-900">{et.count}</div>
                      <div className="text-xs text-gray-600">{et.type} ({et.percentage}%)</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ThumbsUp style={{color: '#71CC98'}} size={20} />
                Would Recommend Creighton
              </h2>

              <div className="text-center py-6">
                <div className="text-6xl font-bold mb-3" style={{color: '#71CC98'}}>
                  {surveyData.wouldRecommend}%
                </div>
                <div className="text-lg text-gray-700 mb-6">would recommend Creighton as an employer</div>

                {/* Visual Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-10 mb-6">
                  <div
                    className="h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                    style={{
                      width: `${surveyData.wouldRecommend}%`,
                      backgroundColor: '#71CC98'
                    }}
                  >
                    {surveyData.wouldRecommendCount.positive} of {surveyData.wouldRecommendCount.total} respondents
                  </div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-4xl font-bold" style={{color: '#71CC98'}}>
                      {surveyData.wouldRecommendCount.positive}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Would Recommend</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="text-4xl font-bold text-red-600">
                      {surveyData.wouldRecommendCount.total - surveyData.wouldRecommendCount.positive}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Would Not Recommend</div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-600 text-center mt-4 bg-green-50 p-2 rounded border border-green-200">
                <span className="font-semibold">Positive Indicator:</span> {surveyData.wouldRecommend}% recommendation rate shows strong employer brand
              </div>
            </div>
          )}
        </div>

        {/* Workplace Culture Indicators (conditional - Q2+ only) */}
        {surveyData.additionalMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-5 rounded-lg shadow-sm border text-center">
              <div className="text-3xl font-bold" style={{color: '#71CC98'}}>{surveyData.additionalMetrics.hadToolsResources}%</div>
              <div className="text-sm text-gray-600 font-medium mt-1">Had Tools & Resources</div>
              <div className="text-xs text-gray-500 mt-1">to perform their job effectively</div>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm border text-center">
              <div className="text-3xl font-bold" style={{color: '#71CC98'}}>{surveyData.additionalMetrics.inclusiveCulture}%</div>
              <div className="text-sm text-gray-600 font-medium mt-1">Inclusive Culture</div>
              <div className="text-xs text-gray-500 mt-1">felt the culture was inclusive</div>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm border text-center">
              <div className="text-3xl font-bold" style={{color: surveyData.concernsReported.percentage > 25 ? '#F59E0B' : '#71CC98'}}>
                {surveyData.concernsReported.percentage}%
              </div>
              <div className="text-sm text-gray-600 font-medium mt-1">Concerns Reported</div>
              <div className="text-xs text-gray-500 mt-1">{surveyData.concernsReported.count} of {surveyData.concernsReported.total} respondents</div>
            </div>
          </div>
        )}

        {/* Quarterly Termination Trends */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingDown style={{color: '#0054A6'}} size={20} />
            Quarterly Termination Trends
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quarter
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Exits
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faculty
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Survey Responses
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quarterlyData.map((quarter, index) => {
                  const prevQuarter = index > 0 ? quarterlyData[index - 1] : null;
                  const exitChange = prevQuarter ? quarter.terminations - prevQuarter.terminations : 0;
                  const responseChange = prevQuarter ? quarter.responseRate - prevQuarter.responseRate : 0;

                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {quarter.quarter}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="text-lg font-bold text-gray-900">{quarter.terminations}</div>
                        {prevQuarter && (
                          <div className={`text-xs ${exitChange > 0 ? 'text-red-600' : exitChange < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                            {exitChange > 0 ? '+' : ''}{exitChange} vs prev
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-blue-600 font-semibold">
                        {quarter.faculty}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-purple-600 font-semibold">
                        {quarter.staff}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-green-600">{quarter.responses}</div>
                        <div className="text-xs text-gray-500">of {quarter.terminations}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-bold text-green-700">{quarter.responseRate}%</div>
                        {prevQuarter && responseChange !== 0 && (
                          <div className={`text-xs ${responseChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {responseChange > 0 ? '+' : ''}{responseChange.toFixed(1)}pp
                          </div>
                        )}
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{width: `${Math.min(quarter.responseRate, 100)}%`}}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-4 text-xs bg-gray-50 p-3 rounded">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
              <span>Faculty Terminations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-600 rounded"></div>
              <span>Staff Terminations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded"></div>
              <span>Survey Responses</span>
            </div>
          </div>

          <div className="text-xs text-gray-600 mt-4 bg-blue-50 p-3 rounded border border-blue-200">
            <span className="font-semibold">Note:</span> All counts represent benefit-eligible employees only (Faculty + Staff). Excludes TEMP, HSR, CWS, SUE, PRN, NBE. pp = percentage points.
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExitSurveyQ1FY26Dashboard;
