import React from 'react';
import { FileText, Users, BarChart3, ThumbsUp, Star, AlertTriangle, Activity, TrendingDown } from 'lucide-react';
import { getExitSurveyData } from '../../data/staticData';

/**
 * Q1 FY26 Exit Survey Dashboard
 * Displays quarterly exit survey analysis following the Quarterly Reports Design System
 *
 * Design System Reference: docs/QUARTERLY_REPORTS_DESIGN_SYSTEM.md
 * Exit Survey Patterns: docs/EXIT_SURVEY_DESIGN_SYSTEM.md
 * Wireframe Reference: docs/wireframes/exit-survey-q1-fy26-wireframe.html
 */
const ExitSurveyQ1FY26Dashboard = () => {
  // Get Q1 FY26 data
  const surveyData = getExitSurveyData("2025-09-30");

  // Quarterly trend data (Q1 FY26 → Q1 FY25, descending)
  // UPDATED 2025-11-19: Grade R exclusion applied to Q1 FY26
  const quarterlyData = [
    {
      quarter: 'Q1 FY26',
      terminations: 58,  // Corrected from 73 (15 Grade R excluded)
      faculty: 4,
      staff: 54,         // Corrected from 69 (15 Grade R excluded)
      responses: 15,
      responseRate: 25.9,  // Corrected from 20.5 (15/58 vs 15/73)
      satisfaction: 80 // Would recommend
    },
    {
      quarter: 'Q4 FY25',
      terminations: 51, // Assignment Category filter
      faculty: 10,
      staff: 41, // 51 - 10
      responses: 18,
      responseRate: 35.3,
      satisfaction: 83.3
    },
    {
      quarter: 'Q3 FY25',
      terminations: 51, // Assignment Category filter
      faculty: 8,
      staff: 43,
      responses: 20,
      responseRate: 39.2,
      satisfaction: 45
    },
    {
      quarter: 'Q2 FY25',
      terminations: 38, // Assignment Category filter
      faculty: 4,
      staff: 34, // 38 - 4
      responses: 26,
      responseRate: 68.4,
      satisfaction: 57.7
    },
    {
      quarter: 'Q1 FY25',
      terminations: 79, // Assignment Category filter (includes Jesuits)
      faculty: 5,
      staff: 74,
      responses: 25,
      responseRate: 31.6,
      satisfaction: 64.0
    }
  ];

  // Helper function to get satisfaction color
  const getSatisfactionColor = (score) => {
    if (score >= 3.5) return '#71CC98'; // Creighton green
    if (score >= 3.0) return '#FFC72C'; // Creighton yellow
    return '#EF4444'; // Red for low scores
  };

  // Helper function to calculate bar width percentage
  const getBarWidth = (score) => {
    return (score / 5.0) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">

        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText style={{color: '#0054A6'}} size={32} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Q1 FY26 Exit Analysis Report
                  </h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Quarterly Exit Survey Analysis • July 2025 - September 2025
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
                <div className="text-sm text-gray-600 font-medium">Total Q1 FY26 Responses</div>
                <div className="text-xs text-gray-500 mt-1">
                  Staff: {surveyData.totalResponses} (100%)
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
                Q1
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{surveyData.totalResponses}</div>
            <div className="text-sm text-gray-600 font-medium">Total Responses</div>
            <div className="text-xs text-gray-500 mt-2">All staff responses</div>
          </div>

          {/* Card 2: Survey Response Rate */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 style={{color: '#1F74DB'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                UPDATED
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {surveyData.responseRate ? `${surveyData.responseRate}%` : 'TBD'}
            </div>
            <div className="text-sm text-gray-600 font-medium">Survey Response Rate</div>
            <div className="text-xs text-gray-500 mt-2">15 of 58 terminations</div>
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

        {/* Executive Summary */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity style={{color: '#0054A6'}} size={24} />
              Executive Summary
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Key Metrics */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{color: '#0054A6'}}>
                  Key Metrics
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                    <span><strong>{surveyData.totalResponses} total responses</strong> received in Q1 FY26</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                    <span><strong>{surveyData.wouldRecommend}% would recommend</strong> Creighton as an employer ({surveyData.wouldRecommendCount.positive} of {surveyData.wouldRecommendCount.total})</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-600 mt-2"></div>
                    <span><strong>{surveyData.overallSatisfaction}/5.0 overall satisfaction</strong> rating</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-600 mt-2"></div>
                    <span><strong>{surveyData.concernsReported.percentage}% reported concerns</strong> ({surveyData.concernsReported.count} of {surveyData.concernsReported.total} respondents)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                    <span><strong>{surveyData.departmentExits.length} departments</strong> represented in responses</span>
                  </li>
                </ul>
              </div>

              {/* Top Departure Reasons */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{color: '#0054A6'}}>
                  Top Departure Reasons
                </h3>
                <ul className="space-y-3 text-sm">
                  {surveyData.departureReasons.slice(0, 4).map((reason, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded mt-2 ${
                        index === 0 ? 'bg-gray-500' :
                        index === 1 ? 'bg-red-600' :
                        'bg-blue-600'
                      }`}></div>
                      <span>
                        <strong>"{reason.reason}" ({reason.percentage}%)</strong>
                        {index === 0 && ' - Top departure reason requiring further analysis'}
                        {index === 1 && ' - Management relationship issues'}
                      </span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                    <span><strong>Distinct reasons</strong> - {surveyData.departureReasons.length - 2} additional unique departure factors cited</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                    <span><strong>Early FY26 baseline</strong> established for future tracking</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Data Quality Note */}
            <div className="mt-6 text-xs text-gray-600 text-center bg-blue-50 p-3 rounded border border-blue-200">
              <span className="font-semibold">Note:</span> Q1 FY26 includes {surveyData.totalResponses} survey responses from {surveyData.totalExits} benefit-eligible terminations ({surveyData.responseRate}% response rate). Represents initial quarter baseline for FY26 tracking.
            </div>
          </div>
        </div>

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
              {surveyData.departureReasons.slice(0, 7).map((reason, index) => {
                const colors = ['#6B7280', '#EF4444', '#3B82F6', '#3B82F6', '#3B82F6', '#10B981', '#F59E0B'];
                // Scale bar widths for better visibility: multiply percentage by 3
                // Count 3 (20%) → 60% width, Count 2 (13.3%) → 40% width, Count 1 (6.7%) → 20% width
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
                            backgroundColor: colors[index % colors.length]
                          }}
                        >
                          {reason.count} ({reason.percentage}%)
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-gray-600 mt-6 bg-yellow-50 p-3 rounded border border-yellow-200">
              <span className="font-semibold">Note:</span> "Other" is top reason requiring further investigation. {surveyData.departureReasons.length} distinct departure reasons cited across {surveyData.totalResponses} responses.
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
                const colors = ['#F59E0B', '#EF4444', '#06B6D4', '#EF4444', '#8B5CF6', '#F59E0B', '#3B82F6', '#6B7280', '#8B5CF6', '#F59E0B'];
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
                            backgroundColor: colors[index % colors.length]
                          }}
                        >
                          {reason.count} ({reason.percentage}%)
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-gray-600 mt-6 bg-blue-50 p-3 rounded border border-blue-200">
              <span className="font-semibold">Insight:</span> Respondents could select multiple contributing factors. Pay, workload, and supervisor relationships are key themes. Percentages exceed 100% due to multi-select responses.
            </div>
          </div>
        </div>

        {/* Satisfaction Ratings + Would Recommend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Satisfaction Ratings by Category */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 style={{color: '#0054A6'}} size={20} />
              Satisfaction Ratings by Category
            </h2>

            <div className="space-y-4">
              {/* Management Support */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Management Support</span>
                  <span className="font-bold" style={{color: getSatisfactionColor(surveyData.satisfactionRatings.managementSupport)}}>
                    {surveyData.satisfactionRatings.managementSupport}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full"
                    style={{
                      width: `${getBarWidth(surveyData.satisfactionRatings.managementSupport)}%`,
                      backgroundColor: getSatisfactionColor(surveyData.satisfactionRatings.managementSupport)
                    }}
                  ></div>
                </div>
              </div>

              {/* Job Satisfaction */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Job Satisfaction</span>
                  <span className="font-bold" style={{color: getSatisfactionColor(surveyData.satisfactionRatings.jobSatisfaction)}}>
                    {surveyData.satisfactionRatings.jobSatisfaction}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full"
                    style={{
                      width: `${getBarWidth(surveyData.satisfactionRatings.jobSatisfaction)}%`,
                      backgroundColor: getSatisfactionColor(surveyData.satisfactionRatings.jobSatisfaction)
                    }}
                  ></div>
                </div>
              </div>

              {/* Compensation */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Compensation</span>
                  <span className="font-bold" style={{color: getSatisfactionColor(surveyData.satisfactionRatings.compensation)}}>
                    {surveyData.satisfactionRatings.compensation}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full"
                    style={{
                      width: `${getBarWidth(surveyData.satisfactionRatings.compensation)}%`,
                      backgroundColor: getSatisfactionColor(surveyData.satisfactionRatings.compensation)
                    }}
                  ></div>
                </div>
              </div>

              {/* Career Development */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Career Development</span>
                  <span className="font-bold" style={{color: getSatisfactionColor(surveyData.satisfactionRatings.careerDevelopment)}}>
                    {surveyData.satisfactionRatings.careerDevelopment}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full"
                    style={{
                      width: `${getBarWidth(surveyData.satisfactionRatings.careerDevelopment)}%`,
                      backgroundColor: getSatisfactionColor(surveyData.satisfactionRatings.careerDevelopment)
                    }}
                  ></div>
                </div>
              </div>

              {/* Work-Life Balance */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Work-Life Balance</span>
                  <span className="font-bold" style={{color: getSatisfactionColor(surveyData.satisfactionRatings.workLifeBalance)}}>
                    {surveyData.satisfactionRatings.workLifeBalance}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full"
                    style={{
                      width: `${getBarWidth(surveyData.satisfactionRatings.workLifeBalance)}%`,
                      backgroundColor: getSatisfactionColor(surveyData.satisfactionRatings.workLifeBalance)
                    }}
                  ></div>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Benefits</span>
                  <span className="font-bold" style={{color: getSatisfactionColor(surveyData.satisfactionRatings.benefits)}}>
                    {surveyData.satisfactionRatings.benefits}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full"
                    style={{
                      width: `${getBarWidth(surveyData.satisfactionRatings.benefits)}%`,
                      backgroundColor: getSatisfactionColor(surveyData.satisfactionRatings.benefits)
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 mt-6 text-center bg-gray-50 p-2 rounded">
              Scale: 1.0 (Very Dissatisfied) to 5.0 (Very Satisfied)
            </div>
          </div>

          {/* Would Recommend Creighton */}
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
        </div>

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
