import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowDownCircle, Wifi, WifiOff, Filter, Download, LogOut } from 'lucide-react';
import useSimpleExitSurveyData from '../../hooks/useSimpleExitSurveyData';
// Quarter filter removed - using fixed reporting period

// Enhanced fallback data matching the screenshot for better visual testing
const FALLBACK_DATA = {
  exitSurveyData: {
    totalExits: 98,
    totalResponses: 20,
    recommendationRate: 55,
    avgTenure: 2.4,
    exitInterviewCompletion: 20.4
  },
  exitReasons: [
    { name: 'Career Advancement', value: 30 },
    { name: 'Supervisor Issues', value: 25 },
    { name: 'Compensation', value: 15 },
    { name: 'Work-Life Balance', value: 12 },
    { name: 'Retirement', value: 10 },
    { name: 'Other', value: 8 }
  ],
  satisfactionData: [
    { category: 'Overall Experience', satisfied: 40, neutral: 35, dissatisfied: 25 },
    { category: 'Career Development', satisfied: 30, neutral: 30, dissatisfied: 40 },
    { category: 'Leadership', satisfied: 45, neutral: 30, dissatisfied: 25 },
    { category: 'Compensation', satisfied: 35, neutral: 35, dissatisfied: 30 },
    { category: 'Work Environment', satisfied: 65, neutral: 20, dissatisfied: 15 }
  ],
  departmentExits: [
    { department: 'School of Dentistry', exits: 12, responses: 4, responseRate: 33 },
    { department: 'Student Services', exits: 15, responses: 3, responseRate: 20 },
    { department: 'School of Medicine', exits: 18, responses: 3, responseRate: 17 },
    { department: 'Information Technology', exits: 8, responses: 2, responseRate: 25 },
    { department: 'Administration', exits: 22, responses: 5, responseRate: 23 },
    { department: 'Other Departments', exits: 23, responses: 3, responseRate: 13 }
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
  summaryText: "With a 20% response rate (20 of 98 exits), the exit survey provides valuable but limited insights. 55% of respondents would recommend Creighton as a workplace. Key improvement areas include supervisor relationships, career development opportunities, and early career support.\n\nPositive aspects include strong university culture, meaningful work with students, and competitive benefits. Improving exit survey participation and focusing on management development could significantly improve retention insights and outcomes."
};

const ExitSurveyDashboard = () => {
  // Fixed reporting period - June 30, 2025 (Q4 2025)
  const REPORTING_DATE = '6/30/2025';
  const REPORTING_QUARTER = '2025-Q4';

  // Use JSON data with fallback
  const { 
    data: jsonData, 
    loading, 
    error, 
    isRealTime, 
    lastSyncTime 
  } = useSimpleExitSurveyData(REPORTING_QUARTER);

  // Use JSON data if available, otherwise fallback
  const data = jsonData || FALLBACK_DATA;
  const { 
    exitSurveyData = FALLBACK_DATA.exitSurveyData, 
    exitReasons = FALLBACK_DATA.exitReasons, 
    satisfactionData = FALLBACK_DATA.satisfactionData, 
    departmentExits = FALLBACK_DATA.departmentExits, 
    keyInsights = FALLBACK_DATA.keyInsights, 
    summaryText = FALLBACK_DATA.summaryText,
    salaryComparison = [] 
  } = data;

  // Show loading state only if JSON data is actively loading AND no fallback data available
  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exit survey data...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Fixed reporting period - no quarter changes

  const handleFilterClick = () => {
    console.log('Filter clicked');
  };

  const handleExportClick = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 dashboard-container print:bg-white print:py-0">
      <div className="max-w-7xl mx-auto px-4 print:max-w-none print:px-0 print:mx-0">
        {/* Professional Header Card */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 print:mb-4 print:shadow-none">
          <div className="p-6 print:p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Title Section */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <LogOut className="w-8 h-8 text-blue-600 print:text-black" />
                </div>
                <div>
                  <h1 className="text-2xl print:text-xl font-bold text-gray-900 print:text-black">
                    Exit Survey Insights Report
                  </h1>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm print:text-xs text-gray-600 print:text-black">
                      Period Ending: June 30, 2025 | University-wide
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 print:hidden">
                      <span className={isRealTime ? 'text-green-600' : 'text-gray-400'}>
                        {isRealTime ? '🔴 Live' : '📊 Cached'} (JSON)
                      </span>
                      {isRealTime && <Wifi size={14} className="text-green-500" />}
                      {!isRealTime && <WifiOff size={14} className="text-gray-400" />}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Controls Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 print:hidden">
                {/* Fixed reporting period - no quarter selector */}
                <div className="flex gap-2">
                  <button 
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    onClick={handleFilterClick}
                    aria-label="Open filters"
                  >
                    <Filter size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Filters</span>
                  </button>
                  <button 
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    onClick={handleExportClick}
                    aria-label="Export dashboard as PDF"
                  >
                    <Download size={16} />
                    <span className="text-sm font-medium">Export</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Response Rate Warning Banner */}
        <div className="bg-yellow-50 border border-yellow-200 print:border-gray p-3 rounded-lg mb-4 print:mb-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-yellow-800 print:text-black">
                Low Response Rate Alert: Statistical Significance Limited
              </p>
              <p className="text-xs text-yellow-700 print:text-black mt-1">
                With only 2.96% response rate (11 of 372 exits), these insights should be interpreted with caution. 
                Improving participation rates is recommended for more reliable data.
              </p>
            </div>
          </div>
        </div>

        {/* Exit Survey Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:gap-2 mb-6 print:mb-4">
          <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
            <h2 className="text-xs font-medium text-blue-700 mb-1">Response Rate</h2>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold">{exitSurveyData.exitInterviewCompletion}%</span>
              <span className="text-red-500 text-xs">
                <ArrowDownCircle size={12} className="text-red-500 inline" />
              </span>
            </div>
            <p className="text-gray-500 text-xs">{exitSurveyData.totalResponses} of {exitSurveyData.totalExits} exits</p>
          </div>
          <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
            <h2 className="text-xs font-medium text-blue-700 mb-1">Would Recommend</h2>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold">{exitSurveyData.recommendationRate}%</span>
              <span className="text-green-500 text-xs">
                <ArrowDownCircle size={12} className="text-green-500 inline transform rotate-180" />
              </span>
            </div>
            <p className="text-gray-500 text-xs">8 of 11 respondents</p>
          </div>
          <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
            <h2 className="text-xs font-medium text-blue-700 mb-1">Avg Tenure at Exit</h2>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold">{exitSurveyData.avgTenure}</span>
              {exitSurveyData.avgTenure !== "TBD" && <span className="text-xs">years</span>}
            </div>
            <p className="text-gray-500 text-xs">Pending calculation</p>
          </div>
          <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
            <h2 className="text-xs font-medium text-blue-700 mb-1">Top Exit Reason</h2>
            <div className="text-lg font-bold">Family/Personal</div>
            <p className="text-gray-500 text-xs">36.4% of responses</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:gap-2 mb-6 print:mb-4">
          <div className="bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray">
            <h2 className="text-sm font-medium text-blue-700 mb-2">Primary Reasons for Leaving</h2>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={exitReasons}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {exitReasons.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, ""]} contentStyle={{fontSize: 10}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="col-span-2">
                <div className="space-y-2">
                  {exitReasons.map((reason, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                          <span className="text-xs">{reason.name}</span>
                        </span>
                        <span className="font-medium text-xs">{reason.value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div className="h-1 rounded-full" style={{ width: `${reason.value}%`, backgroundColor: COLORS[index % COLORS.length] }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray">
            <h2 className="text-sm font-medium text-blue-700 mb-2">Exit Survey Satisfaction Scores</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={satisfactionData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{fontSize: 9}} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{fontSize: 10}} domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, ""]} contentStyle={{fontSize: 10}} />
                <Legend wrapperStyle={{fontSize: 10}} />
                <Bar dataKey="dissatisfied" stackId="a" fill="#FF8042" name="Dissatisfied" />
                <Bar dataKey="neutral" stackId="a" fill="#FFBB28" name="Neutral" />
                <Bar dataKey="satisfied" stackId="a" fill="#00C49F" name="Satisfied" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Salary Comparison and Areas of Concern Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:gap-2 mb-6 print:mb-4">
          {/* Salary Comparison Widget */}
          <div className="bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray">
            <h2 className="text-sm font-medium text-blue-700 mb-4">Salary Impact on Exit Decision</h2>
            <div className="space-y-3">
              {salaryComparison && salaryComparison.length > 0 ? salaryComparison.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs font-medium text-gray-700">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">{item.count}</span>
                    <span className="text-xs text-gray-500">({item.percentage}%)</span>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-gray-500">No salary comparison data available</p>
              )}
            </div>
          </div>

          {/* Areas of Concern Alert Box */}
          <div className="bg-red-50 print:bg-white border border-red-200 print:border-gray p-6 print:p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="text-sm font-bold text-red-800 print:text-black">Areas Requiring Immediate Attention</h2>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">30%</span>
                <span className="text-xs text-red-800 print:text-black">reported witnessing improper conduct</span>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded ml-auto print:hidden">CRITICAL</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded">2</span>
                <span className="text-xs text-red-800 print:text-black">employees cited racial inequality concerns</span>
                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded ml-auto print:hidden">URGENT</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-yellow-600 text-white text-xs font-bold px-2 py-1 rounded">18%</span>
                <span className="text-xs text-red-800 print:text-black">cited supervisor relationship issues</span>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded ml-auto print:hidden">WARNING</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exit Survey Key Insights */}
        <div className="bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray mb-6 print:mb-4">
          <h2 className="text-sm font-medium text-blue-700 mb-2">Exit Survey Key Insights</h2>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <h3 className="font-medium text-gray-800 mb-1">⚠️ Areas of Concern</h3>
              <ul className="space-y-1 text-gray-600">
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
              <h3 className="font-medium text-gray-800 mb-1">✅ Positive Feedback</h3>
              <ul className="space-y-1 text-gray-600">
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
            <div>
              <h3 className="font-medium text-gray-800 mb-1">🎯 Action Items</h3>
              <ul className="space-y-1 text-gray-600">
                {keyInsights?.actionItems?.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-1 ${
                      item.priority === 'critical' ? 'bg-red-500' :
                      item.priority === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                    }`}></span>
                    <span>{item.text}</span>
                  </li>
                )) || [
                  <li key="1" className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-2 h-2 rounded-full mt-1 bg-red-500"></span>
                    <span>Investigate reported improper conduct (3 of 11 respondents)</span>
                  </li>,
                  <li key="2" className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-2 h-2 rounded-full mt-1 bg-orange-500"></span>
                    <span>Implement supervisor training program - cited by 18% as exit reason</span>
                  </li>,
                  <li key="3" className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-2 h-2 rounded-full mt-1 bg-orange-500"></span>
                    <span>Address retention in Medicine (82 exits) and Phoenix (92 exits)</span>
                  </li>,
                  <li key="4" className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-2 h-2 rounded-full mt-1 bg-blue-500"></span>
                    <span>Enhance career development programs - limited advancement cited</span>
                  </li>,
                  <li key="5" className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-2 h-2 rounded-full mt-1 bg-blue-500"></span>
                    <span>Improve exit survey response rate (currently 2.96%)</span>
                  </li>
                ]}
              </ul>
            </div>
          </div>
        </div>

        {/* Department Exit Trends */}
        <div className="bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray">
          <h2 className="text-sm font-medium text-blue-700 mb-2">Exit Survey Responses by Department</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <table className="w-full text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2">Department</th>
                    <th className="text-center p-2">Exits</th>
                    <th className="text-center p-2">Responses</th>
                    <th className="text-center p-2">Response Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentExits.map((dept, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{dept.department}</td>
                      <td className="p-2 text-center">{dept.exits}</td>
                      <td className="p-2 text-center">{dept.responses}</td>
                      <td className={`p-2 text-center ${
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
            <div className="bg-blue-50 p-3 rounded">
              <h3 className="font-medium text-blue-800 mb-2">Q4 2025 Exit Survey Summary</h3>
              <div className="text-xs text-blue-700">
                {summaryText ? summaryText.split('\n\n').map((paragraph, index) => (
                  <p key={index} className={index > 0 ? "mt-2" : ""}>
                    {paragraph}
                  </p>
                )) : (
                  <>
                    <p className="mb-2">
                      With a 20% response rate (20 of 98 exits), the exit survey provides valuable but limited insights. 
                      55% of respondents would recommend Creighton as a workplace. Key improvement areas include supervisor 
                      relationships, career development opportunities, and early career support.
                    </p>
                    <p>
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