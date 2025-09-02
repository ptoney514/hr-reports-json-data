import React from 'react';
import { BarChart, Bar, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingDown, UserX, FileText, AlertCircle } from 'lucide-react';
import { getExitSurveyData } from '../../data/staticData';

const ExitSurveyQ3Dashboard = () => {
  const surveyData = getExitSurveyData("2025-03-31");

  const satisfactionData = [
    { category: 'Management Support', score: surveyData.satisfactionRatings.managementSupport, target: 3.5 },
    { category: 'Career Development', score: surveyData.satisfactionRatings.careerDevelopment, target: 3.5 },
    { category: 'Compensation', score: surveyData.satisfactionRatings.compensation, target: 3.0 },
    { category: 'Job Satisfaction', score: surveyData.satisfactionRatings.jobSatisfaction, target: 3.5 },
    { category: 'Work-Life Balance', score: surveyData.satisfactionRatings.workLifeBalance, target: 3.5 },
    { category: 'Benefits', score: surveyData.satisfactionRatings.benefits, target: 3.5 }
  ];

  const departureReasonColors = {
    'Hostile work environment': '#EF4444',
    'Lack of management support': '#F97316',
    'Career advancement opportunities': '#F59E0B',
    'Better compensation elsewhere': '#EAB308',
    'Work-life balance': '#84CC16',
    'Other': '#10B981'
  };

  const concernsTrendData = [
    { quarter: 'Q1 FY25', percentage: 0, label: 'No data' },
    { quarter: 'Q2 FY25', percentage: 0, label: 'No data' },
    { quarter: 'Q3 FY25', percentage: 40, label: 'Critical' },
    { quarter: 'Q4 FY25', percentage: 22.2, label: 'Improved' }
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header with Alert */}
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 text-red-400 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-red-800">Q3 FY25 Exit Survey Analysis - Critical Issues Identified</h1>
            <p className="text-red-600 mt-1">Significant workplace culture concerns reported requiring immediate attention</p>
          </div>
        </div>
      </div>

      {/* Critical Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Exits</p>
              <p className="text-2xl font-bold text-gray-900">{surveyData.totalExits}</p>
              <p className="text-xs text-gray-500 mt-1">Q3 FY25</p>
            </div>
            <UserX className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-blue-600">{surveyData.responseRate}%</p>
              <p className="text-xs text-gray-500 mt-1">{surveyData.totalResponses} of {surveyData.totalExits}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-red-100 rounded-lg shadow p-6 border-2 border-red-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Conduct Concerns</p>
              <p className="text-2xl font-bold text-red-600">{surveyData.concernsReported.percentage}%</p>
              <p className="text-xs text-red-600 mt-1">8 of 20 reported issues</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Would Recommend</p>
              <p className="text-2xl font-bold text-yellow-600">{surveyData.wouldRecommend}%</p>
              <p className="text-xs text-red-500 mt-1">Below 50% threshold</p>
            </div>
            <TrendingDown className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Critical Issues Alert Box */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-red-800 mb-4">Critical Workplace Issues Reported</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-red-700 mb-2">Specific Concerns (40% of respondents):</h4>
            <ul className="list-disc list-inside text-red-600 space-y-1 text-sm">
              <li>Harassment allegations reported</li>
              <li>Hostile work environment cited</li>
              <li>Discrimination concerns raised</li>
              <li>Lack of management intervention</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-red-700 mb-2">Immediate Actions Required:</h4>
            <ul className="list-disc list-inside text-red-600 space-y-1 text-sm">
              <li>Investigate all harassment claims</li>
              <li>Conduct management training</li>
              <li>Review workplace policies</li>
              <li>Implement support systems</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Departure Reasons */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Primary Departure Reasons</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={surveyData.departureReasons} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 35]} />
              <YAxis dataKey="reason" type="category" width={150} fontSize={12} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="percentage" fill={(entry) => departureReasonColors[entry.reason] || '#94A3B8'}>
                {surveyData.departureReasons.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={departureReasonColors[entry.reason] || '#94A3B8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-red-600">
            ⚠️ 30% cited hostile work environment as primary reason
          </div>
        </div>

        {/* Satisfaction Ratings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Satisfaction Ratings (1-5 Scale)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={satisfactionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} fontSize={12} />
              <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
              <Tooltip formatter={(value) => value.toFixed(1)} />
              <Bar dataKey="score" fill="#EF4444" />
              <Bar dataKey="target" fill="#E5E7EB" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-between text-xs">
            <span className="text-red-600">🔴 All categories below target</span>
            <span className="text-red-700">Lowest: Management Support (2.1)</span>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Response Rates */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Department Exit Analysis</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Exits</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Responses</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {surveyData.departmentExits.map((dept, index) => (
                  <tr key={index} className={dept.exits >= 5 ? 'bg-yellow-50' : ''}>
                    <td className="px-4 py-2 text-sm text-gray-900">{dept.department}</td>
                    <td className="px-4 py-2 text-sm text-center font-semibold">{dept.exits}</td>
                    <td className="px-4 py-2 text-sm text-center">{dept.responses}</td>
                    <td className="px-4 py-2 text-sm text-center">
                      <span className={`font-semibold ${dept.responseRate >= 40 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {dept.responseRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Concerns Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Workplace Concerns Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={concernsTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis domain={[0, 50]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Line 
                type="monotone" 
                dataKey="percentage" 
                stroke="#EF4444" 
                strokeWidth={2}
                dot={{ fill: '#EF4444', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-red-600 text-center">
            ⚠️ Q3 shows unprecedented spike in workplace conduct concerns
          </div>
        </div>
      </div>

      {/* Key Insights and Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-red-50 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4">Critical Concerns</h3>
          <ul className="space-y-2">
            {surveyData.keyInsights.areasOfConcern.map((concern, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span className="text-sm text-red-700">{concern}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-yellow-50 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">Limited Positives</h3>
          <ul className="space-y-2">
            {surveyData.keyInsights.positiveFeedback.map((feedback, index) => (
              <li key={index} className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span className="text-sm text-yellow-700">{feedback}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Immediate Actions</h3>
          <ul className="space-y-2">
            {surveyData.keyInsights.actionItems.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span className="text-sm text-blue-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExitSurveyQ3Dashboard;