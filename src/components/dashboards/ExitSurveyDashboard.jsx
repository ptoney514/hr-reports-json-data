import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowDownCircle, LogOut, AlertTriangle } from 'lucide-react';
import { getExitSurveyData } from '../../data/staticData';
// Quarter filter removed - using fixed reporting period

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
    { department: 'Arts & Sciences', exits: 11, responses: 0, responseRate: 0 },
    { department: 'Facilities', exits: 7, responses: 0, responseRate: 0 },
    { department: 'Medicine', exits: 5, responses: 2, responseRate: 40 },
    { department: 'Dentistry', exits: 5, responses: 2, responseRate: 40 },
    { department: 'Pharmacy & Health Prof', exits: 5, responses: 0, responseRate: 0 },
    { department: 'Athletics', exits: 4, responses: 2, responseRate: 50 },
    { department: 'Heider Business', exits: 3, responses: 0, responseRate: 0 },
    { department: 'Nursing', exits: 3, responses: 0, responseRate: 0 },
    { department: 'VPIT', exits: 3, responses: 1, responseRate: 33.3 },
    { department: 'VPSL', exits: 3, responses: 0, responseRate: 0 },
    { department: 'Other Departments', exits: 13, responses: 4, responseRate: 30.8 }
  ],
  keyInsights: {
    areasOfConcern: [
      "25% cite supervisor relationships as primary issue",
      "40% dissatisfied with career development opportunities", 
      "Early tenure departures (64% leave within 3 years)",
      "Leadership communication gaps identified"
    ],
    positiveFeedback: [
      "60% satisfied with work environment",
      "Students & colleagues highly valued",
      "Benefits package generally well-received", 
      "University culture appreciated by most"
    ],
    actionItems: [
      "Improve exit survey response rates (currently 20%)",
      "Management training for supervisors",
      "Enhanced career development programs",
      "Improved onboarding for retention",
      "Regular check-ins for new hires"
    ]
  },
  summaryText: "With a 17.74% response rate (11 of 62 exits), the exit survey provides meaningful insights, though increased participation would strengthen data reliability. 72.7% of respondents would still recommend Creighton as a workplace. Key improvement areas include supervisor relationships, career advancement opportunities, and addressing reported improper conduct.\n\nNotable patterns: Athletics and Medicine/Dentistry show higher response rates (40-50%), while larger departments like Arts & Sciences show low participation. Focus on improving response rates in underrepresented departments for comprehensive retention insights."
};

const ExitSurveyDashboard = () => {
  // Static data for 6/30/25 reporting period only
  const currentData = getExitSurveyData("2025-06-30"); // Current period
  const previousData = getExitSurveyData("2025-03-31"); // For percentage calculations

  // Calculate percentage changes using previous period
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100);
  };

  // Transform static data to dashboard format
  const exitSurveyData = {
    totalExits: 72, // From turnover data
    totalResponses: currentData.totalResponses,
    recommendationRate: currentData.wouldRecommend,
    avgTenure: "TBD",
    exitInterviewCompletion: currentData.responseRate,
    concernsReported: {
      percentage: 25,
      count: 13,
      total: currentData.totalResponses,
      description: "reported workplace concerns"
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
  
  const departmentExits = FALLBACK_DATA.departmentExits; // Keep fallback for now
  const keyInsights = FALLBACK_DATA.keyInsights; // Keep fallback for now
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
                    Period Ending: June 30, 2025
                  </p>
                </div>
              </div>
              {/* Fixed reporting period - no quarter selector */}
            </div>
          </div>
        </div>

        {/* Response Rate Banner - Positive Framing */}
        <div className="bg-green-50 border border-green-200 print:border-gray p-4 rounded-lg mb-6 print:mb-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
            <div>
              <p className="text-base font-medium text-green-800 print:text-black">
                Good Response Rate: Above Industry Average
              </p>
              <p className="text-sm text-green-800 print:text-black mt-1">
                With a 17.74% response rate (11 of 62 exits), this exceeds the typical 10-15% benchmark. 
                Broader participation would strengthen insights further.
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
              <span className="text-red-500 text-xs">
                <ArrowDownCircle size={12} className="text-red-500 inline" />
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{exitSurveyData.totalResponses} of {exitSurveyData.totalExits} exits</p>
          </div>
          <div className="bg-white print:bg-white p-6 print:p-2 rounded-lg shadow-sm border print:border-gray">
            <h2 className="text-base font-semibold text-blue-700 mb-3">Would Recommend</h2>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold">{exitSurveyData.recommendationRate}%</span>
              <span className="text-green-500 text-xs">
                <ArrowDownCircle size={12} className="text-green-500 inline transform rotate-180" />
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">8 of 11 respondents</p>
          </div>
          <div className="bg-white print:bg-white p-6 print:p-2 rounded-lg shadow-sm border print:border-gray">
            <h2 className="text-base font-semibold text-amber-700 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600" />
              Concerns Reported
            </h2>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-amber-600">
                {exitSurveyData.concernsReported?.percentage || 30}%
              </span>
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full ml-2 print:hidden">
                ALERT
              </span>
            </div>
            <p className="text-sm text-amber-600 mt-2">
              {exitSurveyData.concernsReported?.count || 3} of {exitSurveyData.concernsReported?.total || 10} {exitSurveyData.concernsReported?.description || "reported improper conduct"}
            </p>
          </div>
          <div className="bg-white print:bg-white p-6 print:p-2 rounded-lg shadow-sm border print:border-gray">
            <h2 className="text-base font-semibold text-blue-700 mb-3">Top Exit Reason</h2>
            <div className="text-2xl font-bold">Family/Personal</div>
            <p className="text-sm text-gray-600 mt-2">36.4% of responses</p>
          </div>
        </div>

        {/* Primary Reasons for Leaving - Full Width */}
        <div className="bg-white print:bg-white p-8 print:p-4 rounded-lg shadow-sm border print:border-gray mb-8 print:mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Primary Reasons for Leaving</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex justify-center items-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={exitReasons}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {exitReasons.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, ""]} contentStyle={{fontSize: 14}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center">
              <div className="w-full space-y-3">
                {exitReasons.map((reason, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        <span className="text-base font-medium text-gray-800">{reason.name}</span>
                      </span>
                      <span className="font-bold text-base text-gray-900">{reason.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${reason.value}%`, backgroundColor: COLORS[index % COLORS.length] }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Salary Comparison and Areas of Concern Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-2 mb-8 print:mb-4">
          {/* Salary Comparison Widget */}
          <div className="bg-white print:bg-white p-8 print:p-4 rounded-lg shadow-sm border print:border-gray">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Salary Impact on Exit Decision</h2>
            <div className="space-y-4">
              {salaryComparison && salaryComparison.length > 0 ? salaryComparison.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-base font-medium text-gray-800">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-800">{item.count}</span>
                    <span className="text-sm text-gray-500">({item.percentage}%)</span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-700">No salary comparison data available</p>
              )}
            </div>
          </div>

          {/* Areas of Concern Alert Box */}
          <div className="bg-red-50 print:bg-white border border-red-200 print:border-gray p-8 print:p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="text-lg font-semibold text-red-800 print:text-black">Areas Requiring Immediate Attention</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="bg-red-600 text-white text-sm font-bold px-3 py-1.5 rounded">30%</span>
                <span className="text-sm text-red-800 print:text-black">reported witnessing improper conduct</span>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded ml-auto print:hidden">CRITICAL</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-orange-600 text-white text-sm font-bold px-3 py-1.5 rounded">2</span>
                <span className="text-sm text-red-800 print:text-black">employees cited racial inequality concerns</span>
                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded ml-auto print:hidden">URGENT</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-yellow-600 text-white text-sm font-bold px-3 py-1.5 rounded">18%</span>
                <span className="text-sm text-red-800 print:text-black">cited supervisor relationship issues</span>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded ml-auto print:hidden">WARNING</span>
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
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Action Items</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {keyInsights?.actionItems?.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-3 h-3 rounded-full mt-1 ${
                    item.priority === 'critical' ? 'bg-red-500' :
                    item.priority === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                  }`}></span>
                  <span>{item.text}</span>
                </li>
              )) || [
                <li key="1" className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-3 h-3 rounded-full mt-1 bg-red-500"></span>
                  <span>Investigate reported improper conduct (3 of 11 respondents)</span>
                </li>,
                <li key="2" className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-3 h-3 rounded-full mt-1 bg-orange-500"></span>
                  <span>Implement supervisor training program - cited by 18% as exit reason</span>
                </li>,
                <li key="3" className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-3 h-3 rounded-full mt-1 bg-orange-500"></span>
                  <span>Address retention in Medicine (82 exits) and Phoenix (92 exits)</span>
                </li>,
                <li key="4" className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-3 h-3 rounded-full mt-1 bg-blue-500"></span>
                  <span>Enhance career development programs - limited advancement cited</span>
                </li>,
                <li key="5" className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-3 h-3 rounded-full mt-1 bg-blue-500"></span>
                  <span>Improve exit survey response rate (currently 2.96%)</span>
                </li>
              ]}
            </ul>
          </div>
        </div>

        {/* Department Exit Trends */}
        <div className="bg-white print:bg-white p-8 print:p-4 rounded-lg shadow-sm border print:border-gray">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Exit Survey Responses by Department</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-4">Department</th>
                    <th className="text-center p-4">Exits</th>
                    <th className="text-center p-4">Responses</th>
                    <th className="text-center p-4">Response Rate</th>
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
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Q4 2025 Exit Survey Summary</h3>
              <div className="text-base text-blue-800">
                {summaryText ? summaryText.split('\n\n').map((paragraph, index) => (
                  <p key={index} className={index > 0 ? "mt-4" : ""}>
                    {paragraph}
                  </p>
                )) : (
                  <>
                    <p className="mb-4 leading-relaxed">
                      With a 20% response rate (20 of 98 exits), the exit survey provides valuable but limited insights. 
                      55% of respondents would recommend Creighton as a workplace. Key improvement areas include supervisor 
                      relationships, career development opportunities, and early career support.
                    </p>
                    <p className="leading-relaxed">
                      Positive aspects include strong university culture, meaningful work with students, and competitive 
                      benefits. Improving exit survey participation and focusing on management development could significantly 
                      improve retention insights and outcomes.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitSurveyDashboard; 