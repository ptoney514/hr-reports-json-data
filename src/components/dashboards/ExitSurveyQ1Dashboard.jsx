import React from 'react';
import { Calendar, TrendingUp, Users, AlertTriangle, Building2, Clock } from 'lucide-react';
import { getExitSurveyData } from '../../data/staticData';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

const ExitSurveyQ1Dashboard = () => {
  const q1Data = getExitSurveyData("2024-06-30");

  const quarterMetrics = {
    totalExits: q1Data?.totalExits || 80,
    avgMonthly: Math.round((q1Data?.totalExits || 80) / 3),
    surveyStatus: 'Not Implemented',
    impact: 'Baseline Period'
  };

  const departmentData = q1Data?.departmentExits?.map(dept => ({
    name: dept.department.replace('School of ', '').replace('University ', ''),
    exits: dept.exits,
    risk: dept.exits >= 8 ? 'High' : dept.exits >= 4 ? 'Medium' : 'Low'
  })) || [];

  const monthlyPattern = [
    { month: 'July', exits: 28, pattern: 'Summer Start' },
    { month: 'August', exits: 26, pattern: 'Pre-Semester' },
    { month: 'September', exits: 26, pattern: 'Term Begin' }
  ];

  const exitTiming = [
    { category: 'Early Quarter', count: 28, percentage: 35 },
    { category: 'Mid Quarter', count: 26, percentage: 32.5 },
    { category: 'Late Quarter', count: 26, percentage: 32.5 }
  ];

  const COLORS = ['#0054A6', '#1F74DB', '#71CC98', '#FFC72C', '#95D2F3'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label || data.name}</p>
          <p className="text-sm" style={{color: payload[0].color}}>
            Exits: <strong>{data.exits || payload[0].value}</strong>
          </p>
          {data.risk && (
            <p className="text-xs text-gray-600">Risk Level: {data.risk}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="exit-survey-q1-dashboard" className="min-h-screen bg-gray-50 py-8 dashboard-container print:bg-white print:py-0">
      <div className="max-w-7xl mx-auto px-6 print:max-w-none print:px-0 print:mx-0">
        
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Calendar style={{color: '#0054A6'}} size={32} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Q1 FY25 Exit Analysis</h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Baseline Period: July - September 2024
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Volume-focused analysis establishing pre-survey implementation benchmarks
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold" style={{color: '#0054A6'}}>
                  {quarterMetrics.totalExits}
                </div>
                <div className="text-sm text-gray-600">Total Q1 Exits</div>
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle style={{color: '#FFC72C'}} size={16} />
                  <span className="text-sm font-medium text-gray-600">
                    {quarterMetrics.surveyStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Users style={{color: '#0054A6'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full" style={{backgroundColor: '#95D2F3', color: '#00245D'}}>
                BASELINE
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {quarterMetrics.totalExits}
            </div>
            <div className="text-sm text-gray-600 mb-2">Quarter Total Exits</div>
            <div className="text-xs text-gray-500">
              {quarterMetrics.avgMonthly}/month average
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Clock style={{color: '#FFC72C'}} size={24} />
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                PRE-SURVEY
              </span>
            </div>
            <div className="text-3xl font-bold mb-1" style={{color: '#FFC72C'}}>
              0%
            </div>
            <div className="text-sm text-gray-600 mb-2">Response Rate</div>
            <div className="text-xs text-gray-500">
              No survey implemented
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Building2 style={{color: '#1F74DB'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full" style={{backgroundColor: '#E3F2FD', color: '#1565C0'}}>
                SPREAD
              </span>
            </div>
            <div className="text-3xl font-bold mb-1" style={{color: '#1F74DB'}}>
              {departmentData.length}
            </div>
            <div className="text-sm text-gray-600 mb-2">Departments Affected</div>
            <div className="text-xs text-gray-500">
              Across organization
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp style={{color: '#71CC98'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full" style={{backgroundColor: '#E8F5E8', color: '#2E7D32'}}>
                STABLE
              </span>
            </div>
            <div className="text-3xl font-bold mb-1" style={{color: '#71CC98'}}>
              ±5%
            </div>
            <div className="text-sm text-gray-600 mb-2">Monthly Variation</div>
            <div className="text-xs text-gray-500">
              Consistent pattern
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 style={{color: '#0054A6'}} size={20} />
              Department Exit Distribution
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="exits" fill="#0054A6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock style={{color: '#0054A6'}} size={20} />
              Monthly Exit Pattern
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyPattern} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="exits" 
                    stroke="#0054A6" 
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#0054A6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Key Insight:</strong> Consistent ~26-28 exits per month indicates stable baseline</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar style={{color: '#0054A6'}} size={20} />
              Exit Timing Distribution
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={exitTiming}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                  >
                    {exitTiming.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle style={{color: '#0054A6'}} size={20} />
              Q1 Baseline Insights
            </h2>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">🎯 Key Findings</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• <strong>80 total exits</strong> across 3 months (26.7/month avg)</li>
                  <li>• <strong>Distributed pattern</strong> across {departmentData.length} departments</li>
                  <li>• <strong>Consistent timing</strong> with even quarterly spread</li>
                  <li>• <strong>No survey data</strong> available for exit reasons</li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-amber-900 mb-2">⚠️ Data Limitations</h3>
                <ul className="text-sm text-amber-800 space-y-2">
                  <li>• No employee satisfaction feedback</li>
                  <li>• No exit reason categorization</li>
                  <li>• No supervisor relationship data</li>
                  <li>• No career development insights</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">✅ Strategic Value</h3>
                <ul className="text-sm text-green-800 space-y-2">
                  <li>• Establishes baseline for improvement measurement</li>
                  <li>• Identifies departments needing attention</li>
                  <li>• Shows need for qualitative data collection</li>
                  <li>• Validates survey implementation decision</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="rounded-lg border p-8" style={{background: 'linear-gradient(to right, #FFF3E0, #FFE0B2)'}}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp style={{color: '#FF6F00'}} size={24} />
              Q1 FY25 Strategic Analysis & Survey Implementation Rationale
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Baseline Metrics Established</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#FF6F00'}}>•</span>
                    <span><strong>80 exits</strong> provided foundation for measuring improvement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#FF6F00'}}>•</span>
                    <span><strong>Department patterns</strong> identified high-risk areas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#FF6F00'}}>•</span>
                    <span><strong>Consistent timing</strong> showed stable organizational patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#FF6F00'}}>•</span>
                    <span><strong>Volume benchmark</strong> established target for reduction</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Survey Implementation Justification</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#FF6F00'}}>→</span>
                    <span><strong>Missing insights</strong> on why employees leave</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#FF6F00'}}>→</span>
                    <span><strong>No satisfaction data</strong> to guide retention strategies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#FF6F00'}}>→</span>
                    <span><strong>Department-specific needs</strong> unclear without feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#FF6F00'}}>→</span>
                    <span><strong>Improvement strategies</strong> needed data-driven foundation</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600 leading-relaxed">
                <strong>Q1 Impact:</strong> While Q1 FY25 provided essential baseline metrics with 80 exits across 
                {departmentData.length} departments, the absence of qualitative feedback highlighted the critical need 
                for exit survey implementation. This quarter's data established the foundation for measuring the 22.5% 
                improvement achieved by Q4 FY25, demonstrating the value of transitioning from volume-only tracking 
                to comprehensive exit analysis including employee satisfaction and feedback collection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitSurveyQ1Dashboard;