import React from 'react';
import { BarChart, Bar, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle, UserX, FileText, AlertCircle, TrendingUp } from 'lucide-react';
import { getExitSurveyData } from '../../services/dataService';

const ExitSurveyQ4Dashboard = () => {
  const surveyData = getExitSurveyData("2025-06-30");

  const satisfactionData = [
    { category: 'Management Support', score: surveyData.satisfactionRatings.managementSupport, target: 3.5 },
    { category: 'Career Development', score: surveyData.satisfactionRatings.careerDevelopment, target: 3.5 },
    { category: 'Compensation', score: surveyData.satisfactionRatings.compensation, target: 3.0 },
    { category: 'Job Satisfaction', score: surveyData.satisfactionRatings.jobSatisfaction, target: 3.5 },
    { category: 'Work-Life Balance', score: surveyData.satisfactionRatings.workLifeBalance, target: 3.5 },
    { category: 'Benefits', score: surveyData.satisfactionRatings.benefits, target: 3.5 }
  ];

  const departureReasonColors = {
    'Relocation': '#10B981',
    'Lack of career advancement opportunities': '#F59E0B',
    'Other': '#94A3B8',
    'Retirement': '#6B7280',
    'Dissatisfied with direct supervisor': '#F97316',
    'Pursue other career or education': '#3B82F6',
    'Remote/Hybrid option not available': '#8B5CF6',
    'Leaving the workforce': '#EC4899'
  };

  const concernsTrendData = [
    { quarter: 'Q1 FY25', percentage: 20.0, label: 'Moderate' },
    { quarter: 'Q2 FY25', percentage: 26.9, label: 'Rising' },
    { quarter: 'Q3 FY25', percentage: 40.0, label: 'Critical' },
    { quarter: 'Q4 FY25', percentage: 22.2, label: 'Improved' }
  ];

  const yearOverYearData = [
    { quarter: 'Q1', exits: 79, satisfaction: 3.1, concerns: 20.0 },
    { quarter: 'Q2', exits: 76, satisfaction: 3.0, concerns: 26.9 },
    { quarter: 'Q3', exits: 52, satisfaction: 2.8, concerns: 40.0 },
    { quarter: 'Q4', exits: 51, satisfaction: 3.4, concerns: 22.2 }
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-green-50 border-l-4 border-green-400 p-4">
        <div className="flex items-center">
          <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-green-800">Q4 FY25 Exit Survey Analysis - Year-End Recovery</h1>
            <p className="text-green-600 mt-1">Improvement in key metrics following Q3 interventions</p>
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
              <p className="text-xs text-gray-500 mt-1">Q4 FY25</p>
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

        <div className="bg-green-50 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Conduct Concerns</p>
              <p className="text-2xl font-bold text-green-600">{surveyData.concernsReported.percentage}%</p>
              <p className="text-xs text-green-600 mt-1">Improved from Q3</p>
            </div>
            <AlertCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Would Recommend</p>
              <p className="text-2xl font-bold text-green-600">{surveyData.wouldRecommend}%</p>
              <p className="text-xs text-green-600 mt-1">Strong recovery</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Year-End Summary Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-800 mb-4">FY25 Year-End Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Annual Metrics:</h4>
            <ul className="list-disc list-inside text-blue-600 space-y-1 text-sm">
              <li>Total FY25 exits: 269</li>
              <li>Average response rate: 33.2%</li>
              <li>Q4 recommendation rate: 83.3%</li>
              <li>Year-end satisfaction: 3.4/5.0</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-green-700 mb-2">Q4 Improvements:</h4>
            <ul className="list-disc list-inside text-green-600 space-y-1 text-sm">
              <li>Conduct concerns reduced to 22.2%</li>
              <li>Satisfaction increased to 3.4</li>
              <li>Recommendation rate recovered to 83%</li>
              <li>Benefits satisfaction strong at 3.6</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-yellow-700 mb-2">Persistent Challenges:</h4>
            <ul className="list-disc list-inside text-yellow-600 space-y-1 text-sm">
              <li>Career development still weak (2.8)</li>
              <li>Response rate below 30%</li>
              <li>Remote work policy concerns</li>
              <li>Supervisor satisfaction issues</li>
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
              <YAxis dataKey="reason" type="category" width={200} fontSize={10} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="percentage">
                {surveyData.departureReasons.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={departureReasonColors[entry.reason] || '#94A3B8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-blue-600">
            ℹ️ Relocation and career advancement remain top reasons
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
              <Bar dataKey="score" fill="#10B981" />
              <Bar dataKey="target" fill="#E5E7EB" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-between text-xs">
            <span className="text-green-600">🟢 Improvement from Q3</span>
            <span className="text-gray-700">Highest: Benefits (3.6)</span>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Concerns Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">FY25 Workplace Concerns Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={concernsTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis domain={[0, 50]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Line 
                type="monotone" 
                dataKey="percentage" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-green-600 text-center">
            ✓ Q4 shows significant improvement after Q3 interventions
          </div>
        </div>

        {/* Year Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">FY25 Quarterly Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={yearOverYearData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" domain={[0, 50]} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="exits" fill="#8884d8" name="Total Exits" />
              <Bar yAxisId="right" dataKey="concerns" fill="#ff7300" name="Concerns %" />
              <Line yAxisId="left" type="monotone" dataKey="satisfaction" stroke="#10B981" strokeWidth={2} name="Satisfaction" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-gray-600 text-center">
            Full fiscal year comparison showing Q4 recovery
          </div>
        </div>
      </div>

      {/* Department Response Rates */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Q4 Department Exit Analysis</h3>
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
                <tr key={index} className={dept.exits >= 3 ? 'bg-yellow-50' : ''}>
                  <td className="px-4 py-2 text-sm text-gray-900">{dept.department}</td>
                  <td className="px-4 py-2 text-sm text-center font-semibold">{dept.exits}</td>
                  <td className="px-4 py-2 text-sm text-center">{dept.responses}</td>
                  <td className="px-4 py-2 text-sm text-center">
                    <span className={`font-semibold ${parseInt(dept.responseRate) >= 50 ? 'text-green-600' : parseInt(dept.responseRate) > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                      {dept.responseRate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights and Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-yellow-50 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">Remaining Concerns</h3>
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
          <h3 className="text-lg font-semibold text-green-800 mb-4">Positive Progress</h3>
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
          <h3 className="text-lg font-semibold text-blue-800 mb-4">FY26 Priorities</h3>
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

export default ExitSurveyQ4Dashboard;