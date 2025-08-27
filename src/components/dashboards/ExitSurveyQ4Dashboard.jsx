import React from 'react';
import { FileText, ThumbsUp, AlertCircle, TrendingDown, Target, Users, BarChart3, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import { getExitSurveyData } from '../../data/staticData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ExitSurveyQ4Dashboard = () => {
  const q4Data = getExitSurveyData("2025-06-30");

  const quarterMetrics = {
    totalExits: q4Data?.totalExits || 62,
    responseRate: q4Data?.responseRate || 29,
    totalResponses: q4Data?.totalResponses || 18,
    satisfaction: q4Data?.wouldRecommend || 83,
    concernsReported: q4Data?.concernsReported?.percentage || 22,
    surveyQuarters: 1
  };

  const satisfactionBreakdown = [
    { category: 'Job Satisfaction', rating: q4Data?.satisfactionRatings?.jobSatisfaction || 2.9, outOf: 5 },
    { category: 'Management Support', rating: q4Data?.satisfactionRatings?.managementSupport || 2.3, outOf: 5 },
    { category: 'Career Development', rating: q4Data?.satisfactionRatings?.careerDevelopment || 2.1, outOf: 5 },
    { category: 'Work-Life Balance', rating: q4Data?.satisfactionRatings?.workLifeBalance || 2.8, outOf: 5 },
    { category: 'Compensation', rating: q4Data?.satisfactionRatings?.compensation || 2.5, outOf: 5 },
    { category: 'Benefits', rating: q4Data?.satisfactionRatings?.benefits || 3.4, outOf: 5 }
  ];

  const exitReasonData = q4Data?.departureReasons?.map(reason => ({
    ...reason,
    color: getReasonColor(reason.percentage)
  })) || [];

  const departmentResponseData = q4Data?.departmentExits?.map(dept => ({
    department: dept.department.replace('School of ', '').replace('University ', ''),
    exits: dept.exits,
    responses: dept.responses,
    responseRate: parseInt(dept.responseRate),
    hasExits: dept.exits > 0,
    hasResponses: dept.responses > 0
  })) || [];

  // Calculate missing exits and responses (departments not in top 10 list)
  const listedExits = departmentResponseData.reduce((sum, dept) => sum + dept.exits, 0);
  const listedResponses = departmentResponseData.reduce((sum, dept) => sum + dept.responses, 0);
  const otherExits = quarterMetrics.totalExits - listedExits;
  const otherResponses = quarterMetrics.totalResponses - listedResponses;

  // Add "Other Departments" to the data if there are unlisted exits
  if (otherExits > 0) {
    departmentResponseData.push({
      department: 'Other Departments (Combined)',
      exits: otherExits,
      responses: otherResponses,
      responseRate: Math.round((otherResponses / otherExits) * 100),
      hasExits: true,
      hasResponses: otherResponses > 0,
      isOther: true
    });
  }

  // Group departments by response status - only including departments with exits
  const respondingDepts = departmentResponseData.filter(dept => dept.hasExits && dept.hasResponses);
  const nonRespondingDepts = departmentResponseData.filter(dept => dept.hasExits && !dept.hasResponses);

  const improvementTracker = [
    { metric: 'Exit Volume', q1Value: 80, q4Value: 62, improvement: 22.5, unit: 'exits' },
    { metric: 'Survey Response', q1Value: 0, q4Value: 29, improvement: 29, unit: '%' },
    { metric: 'Satisfaction Score', q1Value: 0, q4Value: 83, improvement: 83, unit: '%' },
    { metric: 'Data Quality', q1Value: 0, q4Value: 100, improvement: 100, unit: '% available' }
  ];

  function getReasonColor(percentage) {
    if (percentage >= 20) return '#EF4444';
    if (percentage >= 15) return '#F59E0B'; 
    if (percentage >= 10) return '#3B82F6';
    return '#10B981';
  }


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-semibold text-gray-900 mb-2">{label || data.category || data.reason}</p>
          {data.rating && (
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm">Rating:</span>
                <span className="font-bold">{data.rating}/5.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Percentage:</span>
                <span className="font-bold">{Math.round((data.rating/5)*100)}%</span>
              </div>
            </div>
          )}
          {data.percentage && (
            <div className="flex justify-between">
              <span className="text-sm">Responses:</span>
              <span className="font-bold">{data.percentage}%</span>
            </div>
          )}
          {data.improvement && (
            <div className="flex justify-between">
              <span className="text-sm">Improvement:</span>
              <span className="font-bold text-green-600">+{data.improvement}%</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="exit-survey-q4-dashboard" className="min-h-screen bg-gray-50 py-8 dashboard-container print:bg-white print:py-0">
      <div className="max-w-7xl mx-auto px-6 print:max-w-none print:px-0 print:mx-0">
        
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText style={{color: '#0054A6'}} size={32} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Q4 FY25 Exit Survey Insights</h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Survey Implementation Period: April - June 2025
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    First comprehensive exit survey data with actionable employee feedback
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold" style={{color: '#0054A6'}}>
                  {quarterMetrics.totalExits}
                </div>
                <div className="text-sm text-gray-600">Total Q4 Exits</div>
                <div className="flex items-center gap-1 mt-1">
                  <ThumbsUp style={{color: '#71CC98'}} size={16} />
                  <span className="text-sm font-medium" style={{color: '#71CC98'}}>
                    {quarterMetrics.satisfaction}% Satisfaction
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
              <span className="text-xs px-2 py-1 rounded-full" style={{backgroundColor: '#71CC98', color: 'white'}}>
                IMPROVED
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {quarterMetrics.totalExits}
            </div>
            <div className="text-sm text-gray-600 mb-2">Total Exits (Q4)</div>
            <div className="text-xs text-gray-500">
              22.5% reduction from Q1
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 style={{color: '#1F74DB'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full" style={{backgroundColor: '#E3F2FD', color: '#1565C0'}}>
                ACTIVE
              </span>
            </div>
            <div className="text-3xl font-bold mb-1" style={{color: '#1F74DB'}}>
              {quarterMetrics.responseRate}%
            </div>
            <div className="text-sm text-gray-600 mb-2">Survey Response Rate</div>
            <div className="text-xs text-gray-500">
              {quarterMetrics.totalResponses} of {quarterMetrics.totalExits} exits
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <ThumbsUp style={{color: '#71CC98'}} size={24} />
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                STRONG
              </span>
            </div>
            <div className="text-3xl font-bold mb-1" style={{color: '#71CC98'}}>
              {quarterMetrics.satisfaction}%
            </div>
            <div className="text-sm text-gray-600 mb-2">Would Recommend</div>
            <div className="text-xs text-gray-500">
              Organization recommendation rate
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <AlertCircle style={{color: '#F59E0B'}} size={24} />
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                MONITOR
              </span>
            </div>
            <div className="text-3xl font-bold mb-1" style={{color: '#F59E0B'}}>
              {quarterMetrics.concernsReported}%
            </div>
            <div className="text-sm text-gray-600 mb-2">Concerns Reported</div>
            <div className="text-xs text-gray-500">
              Improper conduct issues
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target style={{color: '#0054A6'}} size={20} />
              Exit Reasons Analysis
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exitReasonData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="reason" 
                    angle={-45} 
                    textAnchor="end" 
                    height={120}
                    fontSize={11}
                    width={150}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="percentage" fill="#0054A6" radius={[4, 4, 0, 0]}>
                    {exitReasonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Critical (20%+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Moderate (15-19%)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ThumbsUp style={{color: '#0054A6'}} size={20} />
              Satisfaction Ratings
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={satisfactionBreakdown} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    fontSize={11}
                  />
                  <YAxis domain={[0, 5]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="rating" fill="#1F74DB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-between text-xs text-gray-600">
              <span>1.0 - Poor</span>
              <span>3.0 - Average</span>
              <span>5.0 - Excellent</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 style={{color: '#0054A6'}} size={20} />
              Department Response Analysis
            </h2>
            
            {/* Summary Stats */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{quarterMetrics.totalResponses}</div>
                  <div className="text-xs text-green-600">Exits with Survey Response</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-700">{quarterMetrics.totalExits - quarterMetrics.totalResponses}</div>
                  <div className="text-xs text-red-600">Exits without Survey Response</div>
                </div>
              </div>
              <div className="text-center text-sm text-gray-600">
                Total: {quarterMetrics.totalExits} exits | Response Rate: {quarterMetrics.responseRate}%
              </div>
            </div>

            <div className="space-y-4">
              {/* Departments with Responses */}
              {respondingDepts.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle style={{color: '#71CC98'}} size={16} />
                    <h3 className="font-semibold text-green-800">Departments with Survey Responses</h3>
                  </div>
                  {respondingDepts.map((dept, index) => (
                    <div key={`responding-${index}`} className={`flex items-center justify-between p-3 rounded-lg border ${
                      dept.isOther ? 'bg-blue-50 border-blue-200 border-dashed' : 'bg-green-50 border-green-200'
                    }`}>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">
                          {dept.department}
                          {dept.isOther && <span className="ml-2 text-xs text-blue-600 font-normal">(Multiple Depts)</span>}
                        </div>
                        <div className="text-xs text-gray-600">{dept.responses} responses of {dept.exits} exits</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${dept.responseRate}%`, 
                              backgroundColor: dept.isOther ? '#3B82F6' : '#71CC98'
                            }}
                          />
                        </div>
                        <span className={`font-bold text-sm w-12 text-right ${
                          dept.isOther ? 'text-blue-700' : 'text-green-700'
                        }`}>
                          {dept.responseRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Departments with No Responses */}
              {nonRespondingDepts.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mb-3 mt-6">
                    <XCircle style={{color: '#EF4444'}} size={16} />
                    <h3 className="font-semibold text-red-800">Departments with No Survey Responses</h3>
                  </div>
                  {nonRespondingDepts.map((dept, index) => (
                    <div key={`non-responding-${index}`} className={`flex items-center justify-between p-3 rounded-lg border ${
                      dept.isOther ? 'bg-red-50 border-red-200 border-dashed' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">
                          {dept.department}
                          {dept.isOther && <span className="ml-2 text-xs text-red-600 font-normal">(Multiple Depts)</span>}
                        </div>
                        <div className="text-xs text-gray-600">{dept.exits} exits - No survey responses</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="h-2 bg-red-400 rounded-full" style={{ width: '0%' }} />
                        </div>
                        <span className="font-bold text-sm w-12 text-right text-red-700">0%</span>
                      </div>
                    </div>
                  ))}
                </>
              )}

            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb style={{color: '#0054A6'}} size={20} />
              Q4 Survey Insights
            </h2>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">🎯 Key Discoveries</h3>
                <ul className="text-sm text-green-800 space-y-2">
                  <li>• <strong>Career advancement</strong> primary concern (30%)</li>
                  <li>• <strong>Supervisor issues</strong> affect 25% of exits</li>
                  <li>• <strong>High satisfaction</strong> (83%) despite exit</li>
                  <li>• <strong>Benefits rated highest</strong> (3.4/5.0)</li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">📊 Response Quality</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• <strong>29% response rate</strong> provides solid sample</li>
                  <li>• <strong>18 detailed responses</strong> offer rich insights</li>
                  <li>• <strong>Multiple departments</strong> represented in data</li>
                  <li>• <strong>First-time implementation</strong> successful</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-2">⚡ Action Areas</h3>
                <ul className="text-sm text-yellow-800 space-y-2">
                  <li>• Improve career development pathways</li>
                  <li>• Address supervisor relationship training</li>
                  <li>• Monitor workplace conduct concerns</li>
                  <li>• Increase survey participation rates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingDown style={{color: '#0054A6'}} size={20} />
              Q1 to Q4 Improvement Tracking
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {improvementTracker.map((metric, index) => (
                <div key={index} className="text-center p-4 bg-gradient-to-b from-blue-50 to-white rounded-lg border">
                  <div className="text-sm font-medium text-gray-600 mb-2">{metric.metric}</div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-400">Q1: {metric.q1Value}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold" style={{color: '#0054A6'}}>Q4: {metric.q4Value}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold" style={{color: '#71CC98'}}>
                    +{metric.improvement}%
                  </div>
                  <div className="text-xs text-gray-500">{metric.unit}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="rounded-lg border p-8" style={{background: 'linear-gradient(to right, #E8F5E8, #F1F8E9)'}}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Target style={{color: '#2E7D32'}} size={24} />
              Q4 FY25 Strategic Impact & FY26 Action Plan
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">✅ Q4 Survey Success Metrics</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#2E7D32'}}>✓</span>
                    <span><strong>22.5% exit reduction</strong> from Q1 baseline (80→62)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#2E7D32'}}>✓</span>
                    <span><strong>83% satisfaction rate</strong> among departing employees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#2E7D32'}}>✓</span>
                    <span><strong>29% survey response</strong> providing actionable data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#2E7D32'}}>✓</span>
                    <span><strong>Survey system implemented</strong> successfully in first quarter</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 FY26 Data-Driven Action Plan</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#2E7D32'}}>→</span>
                    <span><strong>Career pathway expansion</strong> to address 30% citing advancement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#2E7D32'}}>→</span>
                    <span><strong>Supervisor training program</strong> for 25% reporting issues</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#2E7D32'}}>→</span>
                    <span><strong>Response rate improvement</strong> target: 50%+ participation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#2E7D32'}}>→</span>
                    <span><strong>Culture monitoring</strong> for 22% reporting concerns</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600 leading-relaxed">
                <strong>Q4 Transformation:</strong> The implementation of exit surveys in Q4 FY25 marked a strategic 
                shift from volume-only tracking to comprehensive retention analytics. With 62 exits generating 18 detailed 
                responses (29% rate), the data revealed that despite 83% satisfaction, career advancement (30%) and 
                supervisor relationships (25%) drive departures. This intelligence enables targeted FY26 interventions 
                while maintaining the positive trajectory that achieved 22.5% exit reduction from Q1 baseline.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitSurveyQ4Dashboard;