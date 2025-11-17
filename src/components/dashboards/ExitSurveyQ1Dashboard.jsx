import React from 'react';
import { BarChart, Bar, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, UserX, FileText, AlertCircle } from 'lucide-react';
import { getExitSurveyData } from '../../data/staticData';

const ExitSurveyQ1Dashboard = () => {
  const surveyData = getExitSurveyData("2025-09-30"); // Q1 FY26

  const satisfactionData = [
    { category: 'Management Support', score: surveyData.satisfactionRatings.managementSupport, target: 3.5 },
    { category: 'Career Development', score: surveyData.satisfactionRatings.careerDevelopment, target: 3.5 },
    { category: 'Compensation', score: surveyData.satisfactionRatings.compensation, target: 3.0 },
    { category: 'Job Satisfaction', score: surveyData.satisfactionRatings.jobSatisfaction, target: 3.5 },
    { category: 'Work-Life Balance', score: surveyData.satisfactionRatings.workLifeBalance, target: 3.5 },
    { category: 'Benefits', score: surveyData.satisfactionRatings.benefits, target: 3.5 }
  ];

  const departureReasonColors = {
    'Career advancement opportunities': '#F59E0B',
    'Relocation': '#10B981',
    'Better compensation elsewhere': '#EAB308',
    'Work-life balance': '#84CC16',
    'Retirement': '#6B7280',
    'Dissatisfied with supervisor': '#F97316',
    'Other': '#94A3B8'
  };

  const quarterlyTrendData = [
    { quarter: 'Q1 FY26', exits: surveyData.totalExits || 15, responses: surveyData.totalResponses, rate: surveyData.responseRate || 0 }
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex items-center">
          <TrendingUp className="h-6 w-6 text-blue-400 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-blue-800">Q1 FY26 Exit Survey Analysis - First Quarter Results</h1>
            <p className="text-blue-600 mt-1">Fiscal Year 2026 Q1 exit survey data and insights (July - September 2025)</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Exits</p>
              <p className="text-2xl font-bold text-gray-900">{surveyData.totalExits || 'TBD'}</p>
              <p className="text-xs text-gray-500 mt-1">Q1 FY26 (pending termination data)</p>
            </div>
            <UserX className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-blue-600">{surveyData.responseRate ? `${surveyData.responseRate}%` : 'TBD'}</p>
              <p className="text-xs text-gray-500 mt-1">{surveyData.totalResponses} responses{surveyData.totalExits ? ` of ${surveyData.totalExits}` : ''}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Workplace Concerns</p>
              <p className="text-2xl font-bold text-yellow-600">{surveyData.concernsReported.percentage}%</p>
              <p className="text-xs text-yellow-600 mt-1">{surveyData.concernsReported.count} of {surveyData.concernsReported.total} reported</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Would Recommend</p>
              <p className="text-2xl font-bold text-green-600">{surveyData.wouldRecommend}%</p>
              <p className="text-xs text-green-600 mt-1">Above 60% threshold</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Key Findings Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-yellow-800 mb-4">Key First Quarter Findings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-yellow-700 mb-2">Primary Concerns:</h4>
            <ul className="list-disc list-inside text-yellow-600 space-y-1 text-sm">
              {surveyData.keyInsights.areasOfConcern.map((concern, index) => (
                <li key={index}>{concern}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-green-700 mb-2">Positive Indicators:</h4>
            <ul className="list-disc list-inside text-green-600 space-y-1 text-sm">
              {surveyData.keyInsights.positiveFeedback.map((feedback, index) => (
                <li key={index}>{feedback}</li>
              ))}
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
              <XAxis type="number" domain={[0, 30]} />
              <YAxis dataKey="reason" type="category" width={180} fontSize={11} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="percentage">
                {surveyData.departureReasons.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={departureReasonColors[entry.reason] || '#94A3B8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-yellow-600">
            ⚠️ Career advancement is primary concern at 28%
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
              <Bar dataKey="score" fill="#3B82F6" />
              <Bar dataKey="target" fill="#E5E7EB" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-between text-xs">
            <span className="text-blue-600">🔵 Mixed results - some below target</span>
            <span className="text-gray-700">Lowest: Career Development (2.7)</span>
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
                  <tr key={index} className={dept.exits >= 10 ? 'bg-yellow-50' : ''}>
                    <td className="px-4 py-2 text-sm text-gray-900">{dept.department}</td>
                    <td className="px-4 py-2 text-sm text-center font-semibold">{dept.exits}</td>
                    <td className="px-4 py-2 text-sm text-center">{dept.responses}</td>
                    <td className="px-4 py-2 text-sm text-center">
                      <span className={`font-semibold ${parseInt(dept.responseRate) >= 35 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {dept.responseRate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quarterly Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Q1 FY25 Summary</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={quarterlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="exits" fill="#8884d8" name="Total Exits" />
              <Bar yAxisId="left" dataKey="responses" fill="#82ca9d" name="Responses" />
              <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#ff7300" name="Response Rate %" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600">
            <p className="font-semibold">Program Launch Metrics:</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Exit survey program initiated July 2024</li>
              <li>• 31.6% response rate achieved</li>
              <li>• Baseline metrics established for tracking</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Key Insights and Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-yellow-50 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">Areas of Concern</h3>
          <ul className="space-y-2">
            {surveyData.keyInsights.areasOfConcern.map((concern, index) => (
              <li key={index} className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span className="text-sm text-yellow-700">{concern}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-green-50 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Positive Feedback</h3>
          <ul className="space-y-2">
            {surveyData.keyInsights.positiveFeedback.map((feedback, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span className="text-sm text-green-700">{feedback}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Action Items</h3>
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

export default ExitSurveyQ1Dashboard;