import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowDownCircle, Wifi, WifiOff } from 'lucide-react';
import useFirebaseExitSurveyData from '../../hooks/useFirebaseExitSurveyData';

// Fallback data to ensure the dashboard always works
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
    { category: 'Overall Experience', satisfied: 45, neutral: 30, dissatisfied: 25 },
    { category: 'Career Development', satisfied: 35, neutral: 25, dissatisfied: 40 },
    { category: 'Leadership', satisfied: 40, neutral: 35, dissatisfied: 25 },
    { category: 'Compensation', satisfied: 50, neutral: 20, dissatisfied: 30 },
    { category: 'Work Environment', satisfied: 60, neutral: 20, dissatisfied: 20 }
  ],
  departmentExits: [
    { department: 'School of Dentistry', exits: 12, responses: 4, responseRate: 33 },
    { department: 'Student Services', exits: 15, responses: 3, responseRate: 20 },
    { department: 'School of Medicine', exits: 18, responses: 3, responseRate: 17 },
    { department: 'Information Technology', exits: 8, responses: 2, responseRate: 25 },
    { department: 'Administration', exits: 22, responses: 5, responseRate: 23 },
    { department: 'Other Departments', exits: 23, responses: 3, responseRate: 13 }
  ]
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
  const { exitSurveyData, exitReasons, satisfactionData, departmentExits } = data;

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exit survey data...</p>
        </div>
      </div>
    );
  }

  // Enhanced subtitle with real-time status
  const realtimeStatus = isRealTime ? '🔴 Live' : '📊 Cached';
  const dataSource = firebaseData ? 'Firebase' : 'Local';
  const syncInfo = lastSyncTime ? ` | Last sync: ${lastSyncTime.toLocaleTimeString()}` : '';
  const subtitle = `FY25 Q3 | 20 Responses | ${realtimeStatus} (${dataSource})${syncInfo}`;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="text-xs">
      {/* PAGE 2: EXIT SURVEY INSIGHTS */}
      <div className="bg-gray-50 p-4 min-h-screen">
        {/* Header */}
        <div className="mb-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-blue-700">Exit Survey Insights</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-600">{subtitle}</span>
              {isRealTime && <Wifi size={14} className="text-green-500" />}
              {!isRealTime && <WifiOff size={14} className="text-gray-400" />}
            </div>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 bg-blue-100 rounded">FY25 Q3</span>
            <span className="px-2 py-1 bg-blue-100 rounded">{exitSurveyData.totalResponses} Responses</span>
          </div>
        </div>

        {/* Exit Survey Summary Cards */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <h2 className="text-xs font-medium text-blue-700 mb-1">Response Rate</h2>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold">{exitSurveyData.exitInterviewCompletion}%</span>
              <span className="text-red-500 text-xs">
                <ArrowDownCircle size={12} className="text-red-500 inline" />
              </span>
            </div>
            <p className="text-gray-500 text-xs">{exitSurveyData.totalResponses} of {exitSurveyData.totalExits} exits</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <h2 className="text-xs font-medium text-blue-700 mb-1">Would Recommend</h2>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold">{exitSurveyData.recommendationRate}%</span>
              <span className="text-yellow-500 text-xs">
                <ArrowDownCircle size={12} className="text-yellow-500 inline" />
              </span>
            </div>
            <p className="text-gray-500 text-xs">11 of 20 respondents</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <h2 className="text-xs font-medium text-blue-700 mb-1">Avg Tenure at Exit</h2>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold">{exitSurveyData.avgTenure}</span>
              <span className="text-xs">years</span>
            </div>
            <p className="text-gray-500 text-xs">64% left in first 3 years</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <h2 className="text-xs font-medium text-blue-700 mb-1">Top Exit Reason</h2>
            <div className="text-lg font-bold">Career Growth</div>
            <p className="text-gray-500 text-xs">30% of responses</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-white p-3 rounded-lg shadow-sm border">
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
          <div className="bg-white p-3 rounded-lg shadow-sm border">
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
        <div className="bg-white p-3 rounded-lg shadow-sm border mb-3">
          <h2 className="text-sm font-medium text-blue-700 mb-2">Exit Survey Key Insights</h2>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <h3 className="font-medium text-gray-800 mb-1">⚠️ Areas of Concern</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• 25% cite supervisor relationships as primary issue</li>
                <li>• 40% dissatisfied with career development opportunities</li>
                <li>• Early tenure departures (64% leave within 3 years)</li>
                <li>• Leadership communication gaps identified</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-1">✅ Positive Feedback</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• 60% satisfied with work environment</li>
                <li>• Students & colleagues highly valued</li>
                <li>• Benefits package generally well-received</li>
                <li>• University culture appreciated by most</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-1">🎯 Action Items</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• Improve exit survey response rates (currently 20%)</li>
                <li>• Management training for supervisors</li>
                <li>• Enhanced career development programs</li>
                <li>• Improved onboarding for retention</li>
                <li>• Regular check-ins for new hires</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Department Exit Trends */}
        <div className="bg-white p-3 rounded-lg shadow-sm border">
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
              <p className="text-xs text-blue-700 mb-2">
                With a 20% response rate (20 of 98 exits), the exit survey provides valuable but limited insights. 
                55% of respondents would recommend Creighton as a workplace. Key improvement areas include supervisor 
                relationships, career development opportunities, and early career support.
              </p>
              <p className="text-xs text-blue-700">
                Positive aspects include strong university culture, meaningful work with students, and competitive 
                benefits. Improving exit survey participation and focusing on management development could significantly 
                improve retention insights and outcomes.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* TODO: Add export, print, and accessibility features as in other dashboards */}
    </div>
  );
};

export default ExitSurveyDashboard; 