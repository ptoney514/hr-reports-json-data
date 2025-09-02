import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LogOut, AlertTriangle, TrendingDown, Users, Calendar } from 'lucide-react';
import { getExitSurveyData, AVAILABLE_DATES } from '../../data/staticData';
import { getHistoricalComparison, getExitReasonAnalysis, getSurveyQualityMetrics } from '../../utils/exitSurveyAnalytics';
import ExitVolumeAlert from '../alerts/ExitVolumeAlert';
import ExitVolumeHistoryChart from '../charts/ExitVolumeHistoryChart';
import DepartmentExitAnalysis from '../charts/DepartmentExitAnalysis';

// Enhanced fallback data matching the screenshot for better visual testing
const FALLBACK_DATA = {
  exitSurveyData: {
    totalExits: 62,
    totalResponses: 11,
    recommendationRate: 72.7,
    avgTenure: "TBD",
    exitInterviewCompletion: 17.74,
    concernsReported: {
      percentage: 30,
      count: 3,
      total: 10,
      description: "reported improper conduct"
    }
  },
  exitReasons: [
    { name: 'Family/Personal reasons', value: 36.4 },
    { name: 'Dissatisfied with supervisor', value: 18.2 },
    { name: 'Retirement', value: 9.1 },
    { name: 'Relocation', value: 9.1 },
    { name: 'Unsatisfactory salary', value: 9.1 },
    { name: 'Career advancement', value: 9.1 },
    { name: 'Other', value: 9.1 }
  ],
  satisfactionData: [
    { category: 'Career Development', satisfied: 50, neutral: 40, dissatisfied: 10 },
    { category: 'Recognition', satisfied: 40, neutral: 30, dissatisfied: 30 },
    { category: 'Leadership', satisfied: 46, neutral: 18, dissatisfied: 36 },
    { category: 'Compensation', satisfied: 50, neutral: 20, dissatisfied: 30 }
  ],
  departmentExits: [
    { department: 'Arts & Sciences', exits: 11, responses: 0, responseRate: '0%' },
    { department: 'Athletics', exits: 4, responses: 1, responseRate: '25%' },
    { department: 'CFE', exits: 2, responses: 0, responseRate: '0%' },
    { department: 'Dentistry', exits: 5, responses: 4, responseRate: '80%' },
    { department: 'Facilities', exits: 7, responses: 0, responseRate: '0%' },
    { department: 'GENC', exits: 2, responses: 0, responseRate: '0%' },
    { department: 'Heider Business', exits: 3, responses: 0, responseRate: '0%' },
    { department: 'Law School', exits: 2, responses: 0, responseRate: '0%' },
    { department: 'Medicine', exits: 5, responses: 3, responseRate: '60%' },
    { department: 'Nursing', exits: 3, responses: 0, responseRate: '0%' },
    { department: 'Pharmacy & Health Prof', exits: 5, responses: 0, responseRate: '0%' },
    { department: 'Provost', exits: 1, responses: 0, responseRate: '0%' },
    { department: 'Public Safety', exits: 2, responses: 0, responseRate: '0%' },
    { department: 'Research', exits: 1, responses: 0, responseRate: '0%' },
    { department: 'UCOM', exits: 1, responses: 1, responseRate: '100%' },
    { department: 'VPEM', exits: 1, responses: 0, responseRate: '0%' },
    { department: 'VPGE', exits: 1, responses: 0, responseRate: '0%' },
    { department: 'VPIT', exits: 3, responses: 2, responseRate: '66.7%' },
    { department: 'VPSL', exits: 3, responses: 3, responseRate: '100%' },
    { department: 'Other Departments', exits: 0, responses: 6, responseRate: '-' }
  ],
  keyInsights: {
    areasOfConcern: [
      "40% dissatisfied with career development opportunities",
      "42% dissatisfied with direct supervisor (8 of 19 who answered)", 
      "High concern about supervisor relationships and communication",
      "Salary dissatisfaction at 30% (6 of 20 responses)"
    ],
    positiveFeedback: [
      "60% satisfied with work environment",
      "Students & colleagues highly valued",
      "Benefits package generally well-received (except salary)",
      "University culture appreciated by those not reporting issues"
    ],
    actionItems: [
      "Investigate reported improper conduct (40% of respondents)",
      "Implement comprehensive supervisor training program",
      "Enhanced career development and advancement programs",
      "Address salary competitiveness concerns",
      "Improve exit survey participation strategies"
    ]
  },
  summaryText: "With a 17.74% response rate (11 of 62 exits), the exit survey provides meaningful insights, though increased participation would strengthen data reliability. 72.7% of respondents would still recommend Creighton as a workplace. Key improvement areas include supervisor relationships, career advancement opportunities, and addressing reported improper conduct.\n\nNotable patterns: Athletics and Medicine/Dentistry show higher response rates (40-50%), while larger departments like Arts & Sciences show low participation. Focus on improving response rates in underrepresented departments for comprehensive retention insights."
};

const ExitSurveyDashboard = () => {
  // Period selection state - default to Q4 FY25 (most recent complete quarter)
  const [selectedPeriod, setSelectedPeriod] = useState("2025-06-30");
  
  // Get current period data
  const currentData = getExitSurveyData(selectedPeriod);
  const historicalComparison = getHistoricalComparison();
  const exitReasonAnalysis = getExitReasonAnalysis();
  const surveyQualityMetrics = getSurveyQualityMetrics();

  // Calculate percentage changes using previous period
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100);
  };

  // Transform static data to dashboard format
  const exitSurveyData = {
    totalExits: currentData.totalExits || 62,
    totalResponses: currentData.totalResponses,
    recommendationRate: currentData.wouldRecommend,
    avgTenure: "TBD",
    exitInterviewCompletion: currentData.responseRate,
    concernsReported: currentData.concernsReported || {
      percentage: 40,
      count: 8,
      total: currentData.totalResponses,
      description: "reported improper conduct"
    }
  };
  
  const exitReasons = currentData.departureReasons.map(reason => ({
    name: reason.reason,
    value: reason.percentage
  }));
  
  const satisfactionData = [
    { category: 'Job Satisfaction', satisfied: Math.round(currentData.satisfactionRatings.jobSatisfaction * 20), neutral: 30, dissatisfied: Math.round((5 - currentData.satisfactionRatings.jobSatisfaction) * 15) },
    { category: 'Management Support', satisfied: Math.round(currentData.satisfactionRatings.managementSupport * 20), neutral: 35, dissatisfied: Math.round((5 - currentData.satisfactionRatings.managementSupport) * 15) },
    { category: 'Career Development', satisfied: Math.round(currentData.satisfactionRatings.careerDevelopment * 20), neutral: 40, dissatisfied: Math.round((5 - currentData.satisfactionRatings.careerDevelopment) * 15) },
    { category: 'Compensation', satisfied: Math.round(currentData.satisfactionRatings.compensation * 20), neutral: 25, dissatisfied: Math.round((5 - currentData.satisfactionRatings.compensation) * 15) }
  ];
  
  const departmentExits = currentData.departmentExits || FALLBACK_DATA.departmentExits;
  const keyInsights = currentData.keyInsights || FALLBACK_DATA.keyInsights;
  const summaryText = FALLBACK_DATA.summaryText; // Keep fallback for now
  const salaryComparison = []; // Keep empty for now

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Fixed reporting period - no quarter changes

  return (
    <div id="exit-survey-dashboard" data-dashboard-content className="min-h-screen bg-gray-50 py-8 dashboard-container print:bg-white print:py-0">
      <div className="max-w-7xl mx-auto px-6 print:max-w-none print:px-0 print:mx-0">
        {/* Header with Title Above Filters */}
        <div className="mb-6">
          {/* Title Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LogOut className="text-blue-600" size={24} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Exit Survey Insights Report</h1>
                  <p className="text-gray-700 text-base mt-1">
                    {currentData?.quarter ? `${currentData.quarter} Analysis` : 'Historical Analysis'} - {currentData?.reportingDate || 'Selected Period'}
                  </p>
                </div>
              </div>
              {/* Fixed reporting period - no quarter selector */}
            </div>
          </div>
        </div>

        {/* Response Rate Banner - Needs Improvement */}
        <div className="bg-amber-50 border border-amber-200 print:border-gray p-4 rounded-lg mb-6 print:mb-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded-full flex-shrink-0"></div>
            <div>
              <p className="text-base font-medium text-amber-800 print:text-black">
                Response Rate Below Industry Standard
              </p>
              <p className="text-sm text-amber-800 print:text-black mt-1">
                With a {currentData.responseRate}% response rate ({currentData.totalResponses} of {currentData.totalExits} exits), this falls below the typical 50%+ benchmark. 
                Improved participation strategies needed for comprehensive insights.
              </p>
            </div>
          </div>
        </div>

        {/* Exit Survey Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:gap-2 mb-8 print:mb-4">
          <div className="bg-white print:bg-white p-6 print:p-2 rounded-lg shadow-sm border print:border-gray">
            <h2 className="text-base font-semibold text-blue-700 mb-3">Response Rate</h2>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold">{exitSurveyData.exitInterviewCompletion}%</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{exitSurveyData.totalResponses} of {exitSurveyData.totalExits} exits</p>
          </div>
          <div className="bg-white print:bg-white p-6 print:p-2 rounded-lg shadow-sm border print:border-gray">
            <h2 className="text-base font-semibold text-blue-700 mb-3">Would Recommend</h2>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold">{exitSurveyData.recommendationRate}%</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{currentData.wouldRecommendCount?.positive || 15} of {currentData.wouldRecommendCount?.total || 18} respondents</p>
          </div>
          <div className="bg-white print:bg-white p-6 print:p-2 rounded-lg shadow-sm border print:border-gray">
            <h2 className="text-base font-semibold text-amber-700 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600" />
              Concerns Reported
            </h2>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-amber-600">
                {exitSurveyData.concernsReported?.percentage || 22}%
              </span>
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full ml-2 print:hidden">
                ALERT
              </span>
            </div>
            <p className="text-sm text-amber-600 mt-2">
              {exitSurveyData.concernsReported?.count || 4} of {exitSurveyData.concernsReported?.total || 18} {exitSurveyData.concernsReported?.description || "reported improper conduct"}
            </p>
          </div>
          <div className="bg-white print:bg-white p-6 print:p-2 rounded-lg shadow-sm border print:border-gray">
            <h2 className="text-base font-semibold text-blue-700 mb-3">Top Exit Reason</h2>
            <div className="text-2xl font-bold">{exitReasons[0]?.name || 'Career Advancement'}</div>
            <p className="text-sm text-gray-600 mt-2">{exitReasons[0]?.value || 22}% of responses</p>
          </div>
        </div>

        {/* Primary Reasons, Salary Impact, and Areas of Concern - Combined Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 print:mb-4">
          {/* Left Column: Primary Reasons for Leaving */}
          <div className="bg-white print:bg-white p-8 print:p-4 rounded-lg shadow-sm border print:border-gray" 
               role="img" 
               aria-labelledby="chart-title" 
               aria-describedby="chart-desc">
            <h2 id="chart-title" className="text-lg font-semibold text-gray-900 mb-6">Primary Reasons for Leaving</h2>
            <div id="chart-desc" className="sr-only">
              Horizontal bar chart displaying the primary reasons employees cited for leaving. 
              Career advancement leads at 30%, followed by supervisor relationship issues at 25%, 
              salary and benefits concerns at 20%, work-life balance at 15%, and other reasons at 10%. 
              Data represents 20 survey responses from 62 total employee exits in Q1 2025.
            </div>
            <div className="space-y-4">
              {exitReasons.map((reason, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span className="text-sm font-medium text-gray-800 min-w-0 flex-1">{reason.name}</span>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="w-24 bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${reason.value}%`, 
                          backgroundColor: COLORS[index % COLORS.length] 
                        }}
                      ></div>
                    </div>
                    <span className="font-bold text-sm text-gray-900 w-8 text-right">{reason.value}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-gray-600 print:text-black">
              Based on {currentData.totalResponses} survey responses from {currentData.totalExits} employee exits in {currentData.quarter}
            </div>
          </div>
          
          {/* Right Column: Stacked Salary Impact and Areas of Concern */}
          <div className="flex flex-col gap-6">
            {/* Salary Comparison Widget */}
            <div className="bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Salary Impact on Exit Decision</h2>
              <div className="space-y-3">
                {salaryComparison && salaryComparison.length > 0 ? salaryComparison.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium text-gray-800">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-gray-800">{item.count}</span>
                      <span className="text-xs text-gray-500">({item.percentage}%)</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-gray-700">No salary comparison data available</p>
                )}
              </div>
            </div>

            {/* Areas of Concern Alert Box */}
            <div className="bg-red-50 print:bg-white border border-red-200 print:border-gray p-6 print:p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <h2 className="text-base font-semibold text-red-800 print:text-black">Areas Requiring Immediate Attention</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded">{currentData.concernsReported?.percentage || 22}%</span>
                  <span className="text-sm text-red-800 print:text-black">{currentData.concernsReported?.description || "reported improper conduct"}</span>
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded ml-auto print:hidden">CRITICAL</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-orange-600 text-white text-xs font-bold px-2.5 py-1 rounded">{Math.round((exitReasons.find(r => r.name.includes('supervisor')) || {}).value || 11)}%</span>
                  <span className="text-sm text-red-800 print:text-black">cited supervisor relationship issues</span>
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded ml-auto print:hidden">URGENT</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-yellow-600 text-white text-xs font-bold px-2.5 py-1 rounded">{Math.round((exitReasons.find(r => r.name.includes('advancement')) || {}).value || 17)}%</span>
                  <span className="text-sm text-red-800 print:text-black">lack career advancement opportunities</span>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded ml-auto print:hidden">WARNING</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exit Survey Key Insights */}
        <div className="bg-white print:bg-white p-8 print:p-4 rounded-lg shadow-sm border print:border-gray mb-8 print:mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Exit Survey Key Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-base">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">⚠️ Areas of Concern</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                {keyInsights?.areasOfConcern?.map((item, index) => (
                  <li key={index}>• {item}</li>
                )) || [
                  <li key="1">• 25% cite supervisor relationships as primary issue</li>,
                  <li key="2">• 40% dissatisfied with career development opportunities</li>,
                  <li key="3">• Early tenure departures (64% leave within 3 years)</li>,
                  <li key="4">• Leadership communication gaps identified</li>
                ]}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">✅ Positive Feedback</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                {keyInsights?.positiveFeedback?.map((item, index) => (
                  <li key={index}>• {item}</li>
                )) || [
                  <li key="1">• 60% satisfied with work environment</li>,
                  <li key="2">• Students & colleagues highly valued</li>,
                  <li key="3">• Benefits package generally well-received</li>,
                  <li key="4">• University culture appreciated by most</li>
                ]}
              </ul>
            </div>
          </div>
        </div>

        {/* Department Exit Trends */}
        <div className="bg-white print:bg-white p-8 print:p-4 rounded-lg shadow-sm border print:border-gray">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Exit Survey Responses by Department</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <table className="w-full text-sm" role="table">
                <caption className="sr-only">
                  Exit survey response rates by department for Q1 2025, showing total exits, survey responses received, and calculated response rate percentage for each department.
                </caption>
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="text-left p-4">Department</th>
                    <th scope="col" className="text-center p-4">Total Exits</th>
                    <th scope="col" className="text-center p-4">Survey Responses</th>
                    <th scope="col" className="text-center p-4">Response Rate Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentExits.map((dept, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-4">{dept.department}</td>
                      <td className="p-4 text-center">{dept.exits}</td>
                      <td className="p-4 text-center">{dept.responses}</td>
                      <td className={`p-4 text-center ${
                        dept.responseRate === 'N/A' ? 'text-gray-500' :
                        parseFloat(dept.responseRate) >= 30 ? 'text-green-600' : 
                        parseFloat(dept.responseRate) >= 20 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {dept.responseRate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">{currentData.quarter} Exit Survey Summary</h3>
              <div className="text-base text-blue-800">
                <p className="mb-4 leading-relaxed">
                  With a {currentData.responseRate}% response rate ({currentData.totalResponses} of {currentData.totalExits} exits), the exit survey reveals {currentData.wouldRecommend >= 75 ? 'positive' : 'concerning'} trends. 
                  {currentData.wouldRecommend}% of respondents would recommend Creighton as a workplace. 
                  {currentData.concernsReported?.percentage > 30 ? 'Critical areas include reported improper conduct and supervisor relationship issues.' : 'Key areas for improvement include career advancement opportunities and supervisor relationships.'}
                </p>
                <p className="leading-relaxed">
                  {currentData.wouldRecommend >= 75 ? 'Positive feedback indicates strong workplace satisfaction with continued appreciation for university culture and meaningful work.' : 'While employees appreciate university culture and meaningful work with students, addressing supervisor training and career development programs remain priorities.'}
                  Departments with high response rates provide models for improvement across the institution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitSurveyDashboard; 