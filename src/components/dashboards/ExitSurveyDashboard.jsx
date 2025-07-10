import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowDownCircle, Wifi, WifiOff, Filter, Download, LogOut } from 'lucide-react';
import useFirebaseExitSurveyData from '../../hooks/useFirebaseExitSurveyData';

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
  // Use Firebase data with fallback
  const { 
    data: firebaseData, 
    loading, 
    error, 
    isRealTime, 
    lastSyncTime 
  } = useFirebaseExitSurveyData('2025-Q1');

  // Use Firebase data if available, otherwise fallback
  const data = firebaseData || FALLBACK_DATA;
  const { 
    exitSurveyData = FALLBACK_DATA.exitSurveyData, 
    exitReasons = FALLBACK_DATA.exitReasons, 
    satisfactionData = FALLBACK_DATA.satisfactionData, 
    departmentExits = FALLBACK_DATA.departmentExits, 
    keyInsights = FALLBACK_DATA.keyInsights, 
    summaryText = FALLBACK_DATA.summaryText 
  } = data;

  // Show loading state only if Firebase is actively loading AND no fallback data available
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

  // Debug logging to check data
  console.log('Exit Survey Data Debug:', {
    firebaseData,
    fallbackData: FALLBACK_DATA,
    finalData: data,
    exitReasons,
    satisfactionData,
    exitSurveyData
  });

  const handleFilterClick = () => {
    console.log('Filter clicked');
  };

  const handleExportClick = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 dashboard-container print:bg-white print:py-0">
      <div className="max-w-7xl mx-auto px-4 print:max-w-none print:px-0 print:mx-0">
        {/* Header - Match Turnover dashboard layout exactly */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogOut className="text-blue-600" size={24} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Exit Survey Insights</h1>
              <p className="text-gray-600 text-sm mt-1">
                FY 2025 | {isRealTime ? '🔴 Live' : '📊 Cached'} ({firebaseData ? 'Firebase' : 'Local'})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 no-print">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="px-2 py-1 bg-blue-100 rounded">FY25 Q3</span>
              <span className="px-2 py-1 bg-blue-100 rounded">{exitSurveyData.totalResponses} Responses</span>
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
              <span className="text-yellow-500 text-xs">
                <ArrowDownCircle size={12} className="text-yellow-500 inline" />
              </span>
            </div>
            <p className="text-gray-500 text-xs">11 of 20 respondents</p>
          </div>
          <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
            <h2 className="text-xs font-medium text-blue-700 mb-1">Avg Tenure at Exit</h2>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold">{exitSurveyData.avgTenure}</span>
              <span className="text-xs">years</span>
            </div>
            <p className="text-gray-500 text-xs">64% left in first 3 years</p>
          </div>
          <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
            <h2 className="text-xs font-medium text-blue-700 mb-1">Top Exit Reason</h2>
            <div className="text-lg font-bold">Career Growth</div>
            <p className="text-gray-500 text-xs">30% of responses</p>
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
                  <li key={index}>• {item}</li>
                )) || [
                  <li key="1">• Improve exit survey response rates (currently 20%)</li>,
                  <li key="2">• Management training for supervisors</li>,
                  <li key="3">• Enhanced career development programs</li>,
                  <li key="4">• Improved onboarding for retention</li>,
                  <li key="5">• Regular check-ins for new hires</li>
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
                        dept.responseRate >= 30 ? 'text-green-600' : 
                        dept.responseRate >= 20 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {dept.responseRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <h3 className="font-medium text-blue-800 mb-2">Q3 Exit Survey Summary</h3>
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