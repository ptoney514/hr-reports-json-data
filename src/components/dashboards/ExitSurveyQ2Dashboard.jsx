import React from 'react';
import { BarChart, Bar, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, UserX, FileText, AlertCircle } from 'lucide-react';
import { getExitSurveyData } from '../../services/dataService';

const ExitSurveyQ2Dashboard = () => {
  const surveyData = getExitSurveyData("2024-12-31");

  const satisfactionData = [
    { category: 'Management Support', score: surveyData.satisfactionRatings.managementSupport, target: 3.5 },
    { category: 'Career Development', score: surveyData.satisfactionRatings.careerDevelopment, target: 3.5 },
    { category: 'Compensation', score: surveyData.satisfactionRatings.compensation, target: 3.0 },
    { category: 'Job Satisfaction', score: surveyData.satisfactionRatings.jobSatisfaction, target: 3.5 },
    { category: 'Work-Life Balance', score: surveyData.satisfactionRatings.workLifeBalance, target: 3.5 },
    { category: 'Benefits', score: surveyData.satisfactionRatings.benefits, target: 3.5 }
  ];

  const departureReasonColors = {
    'Better compensation elsewhere': '#EF4444',
    'Career advancement opportunities': '#F97316',
    'Dissatisfied with supervisor': '#F59E0B',
    'Work-life balance': '#EAB308',
    'Relocation': '#84CC16',
    'Retirement': '#6B7280',
    'Hostile work environment': '#DC2626',
    'Other': '#94A3B8'
  };

  const concernsTrendData = [
    { quarter: 'Q1 FY25', percentage: 20.0, label: 'Moderate' },
    { quarter: 'Q2 FY25', percentage: 26.9, label: 'Rising' }
  ];

  return (
    <div className="min-h-screen">
      <div className="w-[85%] max-w-[1280px] mx-auto pt-5 pb-8 space-y-6">
      {/* Header with Warning */}
      <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
        <div className="flex items-center">
          <TrendingDown className="h-6 w-6 text-orange-400 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-orange-800">Q2 FY25 Exit Survey Analysis - Declining Trends</h1>
            <p className="text-orange-600 mt-1">Compensation concerns emerging as primary driver of departures</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Exits</p>
              <p className="text-2xl font-bold text-gray-900">{surveyData.totalExits}</p>
              <p className="text-xs text-gray-500 mt-1">Q2 FY25</p>
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

        <div className="bg-orange-50 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Conduct Concerns</p>
              <p className="text-2xl font-bold text-orange-600">{surveyData.concernsReported.percentage}%</p>
              <p className="text-xs text-orange-600 mt-1">{surveyData.concernsReported.count} of {surveyData.concernsReported.total} reported</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Would Recommend</p>
              <p className="text-2xl font-bold text-yellow-600">{surveyData.wouldRecommend}%</p>
              <p className="text-xs text-red-500 mt-1">Below 60% threshold</p>
            </div>
            <TrendingDown className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Key Issues Alert Box */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-orange-800 mb-4">Emerging Concerns - Q2 FY25</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-orange-700 mb-2">Negative Trends:</h4>
            <ul className="list-disc list-inside text-orange-600 space-y-1 text-sm">
              <li>Compensation now #1 departure reason (23.1%)</li>
              <li>Workplace concerns increased to 26.9%</li>
              <li>Recommendation rate dropped to 57.7%</li>
              <li>Management satisfaction declining (2.7/5.0)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-orange-700 mb-2">Areas Requiring Action:</h4>
            <ul className="list-disc list-inside text-orange-600 space-y-1 text-sm">
              <li>Compensation competitiveness review urgent</li>
              <li>Supervisor satisfaction deteriorating</li>
              <li>Hostile environment reports emerging (7.7%)</li>
              <li>Career development remains weak (2.6/5.0)</li>
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
              <XAxis type="number" domain={[0, 25]} />
              <YAxis dataKey="reason" type="category" width={180} fontSize={11} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="percentage">
                {surveyData.departureReasons.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={departureReasonColors[entry.reason] || '#94A3B8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-red-600">
            ⚠️ Compensation issues now primary driver at 23.1%
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
              <Bar dataKey="score" fill="#F97316" />
              <Bar dataKey="target" fill="#E5E7EB" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-between text-xs">
            <span className="text-orange-600">🟠 Most categories below target</span>
            <span className="text-orange-700">Lowest: Career Development (2.6)</span>
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
                  <tr key={index} className={dept.exits >= 8 ? 'bg-yellow-50' : ''}>
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
                stroke="#F97316" 
                strokeWidth={2}
                dot={{ fill: '#F97316', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-orange-600 text-center">
            ⚠️ Workplace concerns trending upward from Q1 to Q2
          </div>
        </div>
      </div>

      {/* Key Insights and Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-orange-50 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-orange-800 mb-4">Areas of Concern</h3>
          <ul className="space-y-2">
            {surveyData.keyInsights.areasOfConcern.map((concern, index) => (
              <li key={index} className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span className="text-sm text-orange-700">{concern}</span>
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
    </div>
  );
};

export default ExitSurveyQ2Dashboard;