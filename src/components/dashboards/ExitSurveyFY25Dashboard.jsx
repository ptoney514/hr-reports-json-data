import React, { useState, useEffect } from 'react';
import { FileText, ThumbsUp, AlertCircle, TrendingDown, Target, Users, BarChart3, Lightbulb, CheckCircle, XCircle, Calendar, Activity } from 'lucide-react';
// Chart imports removed - using print-friendly tables and data displays

const ExitSurveyFY25Dashboard = () => {
  const [turnoverData, setTurnoverData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load FY25 turnover data
    import('../../data/fy25TurnoverData.json')
      .then(data => {
        setTurnoverData(data.default);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading turnover data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading FY25 Analysis...</div>
      </div>
    );
  }

  // Get Q3 survey data (used for updated metrics calculation)
  // const q3SurveyData = getExitSurveyData("2025-03-31");

  // FY25 Combined Metrics (using corrected audit values)
  const fy25Metrics = {
    totalTerminations: turnoverData?.summary?.totalTerminations || 222,
    uniqueEmployees: turnoverData?.summary?.uniqueEmployees || 222,
    facultyCount: turnoverData?.summary?.facultyCount || 36,
    staffCount: turnoverData?.summary?.staffCount || 186,
    avgYearsOfService: turnoverData?.summary?.averageYearsOfService || 6.5,
    
    // Exit Survey Data (from PDFs)
    q1Responses: 20,
    q2Responses: 11,
    q3Responses: 20, // Now available from Q3 data
    q4Responses: 18,
    totalSurveyResponses: 69,
    
    // Calculated response rates using corrected turnover data
    q1ResponseRate: ((20 / 76) * 100).toFixed(1),
    q2ResponseRate: ((11 / 36) * 100).toFixed(1),
    q3ResponseRate: ((20 / 52) * 100).toFixed(1),
    q4ResponseRate: ((18 / 51) * 100).toFixed(1),
    overallResponseRate: ((69 / 222) * 100).toFixed(1),
    
    // Satisfaction metrics from surveys
    q1Satisfaction: 60, // Would recommend
    q2Satisfaction: 72.7,
    q3Satisfaction: 45, // From Q3 data
    q4Satisfaction: 83.3,
    avgSatisfaction: ((60 + 72.7 + 45 + 83.3) / 4).toFixed(1)
  };

  // Quarterly turnover data
  const quarterlyData = [
    { 
      quarter: 'Q1 FY25', 
      terminations: turnoverData?.quarterly?.Q1?.count || 76,
      faculty: turnoverData?.quarterly?.Q1?.faculty || 5,
      staff: turnoverData?.quarterly?.Q1?.staff || 71,
      responses: 20,
      responseRate: parseFloat(fy25Metrics.q1ResponseRate),
      satisfaction: fy25Metrics.q1Satisfaction
    },
    { 
      quarter: 'Q2 FY25', 
      terminations: turnoverData?.quarterly?.Q2?.count || 36,
      faculty: turnoverData?.quarterly?.Q2?.faculty || 3,
      staff: turnoverData?.quarterly?.Q2?.staff || 33,
      responses: 11,
      responseRate: parseFloat(fy25Metrics.q2ResponseRate),
      satisfaction: fy25Metrics.q2Satisfaction
    },
    { 
      quarter: 'Q3 FY25', 
      terminations: turnoverData?.quarterly?.Q3?.count || 52,
      faculty: turnoverData?.quarterly?.Q3?.faculty || 9,
      staff: turnoverData?.quarterly?.Q3?.staff || 43,
      responses: 20,
      responseRate: parseFloat(fy25Metrics.q3ResponseRate),
      satisfaction: fy25Metrics.q3Satisfaction
    },
    { 
      quarter: 'Q4 FY25', 
      terminations: turnoverData?.quarterly?.Q4?.count || 51,
      faculty: turnoverData?.quarterly?.Q4?.faculty || 15,
      staff: turnoverData?.quarterly?.Q4?.staff || 36,
      responses: 18,
      responseRate: parseFloat(fy25Metrics.q4ResponseRate),
      satisfaction: fy25Metrics.q4Satisfaction
    }
  ];

  // Top termination reasons from HR data
  const topTermReasons = !loading && turnoverData ? Object.entries(turnoverData.termReasons || {})
    .slice(0, 8)
    .map(([reason, count]) => ({
      reason: reason,
      count: count,
      percentage: turnoverData.termReasonPercentages?.[reason] || 0,
      color: getReasonColor(turnoverData.termReasonPercentages?.[reason] || 0)
    })) : [];

  // Data loaded successfully for print-friendly display

  // Years of service distribution
  const yearsOfServiceData = !loading && turnoverData ? Object.entries(turnoverData.yearsOfService || {})
    .map(([range, count]) => ({
      range,
      count,
      percentage: ((count / fy25Metrics.uniqueEmployees) * 100).toFixed(1)
    })) : [];

  // Faculty vs Staff termination data
  const facultyStaffData = !loading && turnoverData ? [
    {
      category: 'Staff',
      count: turnoverData.summary?.staffCount || 186,
      percentage: ((turnoverData.summary?.staffCount || 186) / fy25Metrics.uniqueEmployees * 100).toFixed(1),
      color: '#7C3AED',
      quarterly: [
        { quarter: 'Q1', count: turnoverData.quarterly?.Q1?.staff || 71 },
        { quarter: 'Q2', count: turnoverData.quarterly?.Q2?.staff || 33 },
        { quarter: 'Q3', count: turnoverData.quarterly?.Q3?.staff || 43 },
        { quarter: 'Q4', count: turnoverData.quarterly?.Q4?.staff || 36 }
      ]
    },
    {
      category: 'Faculty',
      count: turnoverData.summary?.facultyCount || 36,
      percentage: ((turnoverData.summary?.facultyCount || 32) / fy25Metrics.uniqueEmployees * 100).toFixed(1),
      color: '#0054A6',
      quarterly: [
        { quarter: 'Q1', count: turnoverData.quarterly?.Q1?.faculty || 5 },
        { quarter: 'Q2', count: turnoverData.quarterly?.Q2?.faculty || 3 },
        { quarter: 'Q3', count: turnoverData.quarterly?.Q3?.faculty || 9 },
        { quarter: 'Q4', count: turnoverData.quarterly?.Q4?.faculty || 15 }
      ]
    }
  ] : [];

  // Survey insights comparison
  const surveyInsights = [
    {
      category: 'Career Development',
      q1: 2.2,
      q2: 2.5,
      q4: 2.8,
      trend: 'improving'
    },
    {
      category: 'Management Support',
      q1: 2.8,
      q2: 3.0,
      q4: 3.2,
      trend: 'improving'
    },
    {
      category: 'Work-Life Balance',
      q1: 3.1,
      q2: 3.2,
      q4: 3.3,
      trend: 'stable'
    },
    {
      category: 'Compensation',
      q1: 2.8,
      q2: 2.9,
      q4: 3.0,
      trend: 'stable'
    },
    {
      category: 'Benefits',
      q1: 3.4,
      q2: 3.5,
      q4: 3.6,
      trend: 'stable'
    }
  ];

  // Key findings from exit surveys
  const keyFindings = {
    topExitReasons: [
      { reason: 'Career Advancement', percentage: 28, quarters: ['Q1', 'Q2', 'Q4'] },
      { reason: 'Supervisor Issues', percentage: 25, quarters: ['Q1', 'Q2', 'Q4'] },
      { reason: 'Relocation', percentage: 22, quarters: ['Q1', 'Q4'] },
      { reason: 'Compensation', percentage: 18, quarters: ['Q1', 'Q2'] },
      { reason: 'Work-Life Balance', percentage: 15, quarters: ['Q2', 'Q4'] }
    ],
    conductConcerns: {
      q1: 15,
      q2: 18,
      q4: 22.2,
      trend: 'increasing'
    }
  };

  function getReasonColor(percentage) {
    if (percentage >= 25) return '#EF4444';
    if (percentage >= 15) return '#F59E0B';
    if (percentage >= 10) return '#3B82F6';
    if (percentage >= 5) return '#10B981';
    return '#6B7280';
  }

  // CustomTooltip removed - using embedded data labels for print-friendly display

  // Colors now defined inline in facultyStaffData structure

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText style={{color: '#0054A6'}} size={32} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">FY25 Complete Exit Analysis Report</h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Comprehensive Turnover & Exit Survey Analysis • July 2024 - June 2025
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Combining HR turnover data with employee exit survey feedback
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold" style={{color: '#0054A6'}}>
                  {fy25Metrics.uniqueEmployees}
                </div>
                <div className="text-sm text-gray-600">Total FY25 Terminations</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm">Faculty: {fy25Metrics.facultyCount}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-sm">Staff: {fy25Metrics.staffCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity style={{color: '#0054A6'}} size={24} />
              Executive Summary
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{color: '#0054A6'}}>Key Metrics</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5" />
                    <span><strong>{fy25Metrics.uniqueEmployees} unique terminations</strong> in FY25</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5" />
                    <span><strong>{fy25Metrics.overallResponseRate}% overall response rate</strong> to exit surveys ({fy25Metrics.totalSurveyResponses} of {fy25Metrics.uniqueEmployees})</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5" />
                    <span><strong>{fy25Metrics.avgSatisfaction}% average satisfaction</strong> among survey respondents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Activity size={16} className="text-blue-600 mt-0.5" />
                    <span><strong>{fy25Metrics.avgYearsOfService} years average tenure</strong> at termination</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                    <span><strong>Q1 spike:</strong> {((turnoverData?.quarterly?.Q1?.count || 76) / fy25Metrics.uniqueEmployees * 100).toFixed(1)}% of all terminations occurred in Q1</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{color: '#0054A6'}}>Critical Insights</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <XCircle size={16} className="text-red-600 mt-0.5" />
                    <span><strong>Career development crisis:</strong> Lowest satisfaction (2.5/5.0 average)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle size={16} className="text-red-600 mt-0.5" />
                    <span><strong>Conduct concerns rising:</strong> 15% → 22% from Q1 to Q4</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                    <span><strong>Top HR reasons:</strong> Resigned (27%), Graduated (25%), End Assignment (23%)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                    <span><strong>Survey participation low:</strong> Need to improve from 11% to 40%+</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5" />
                    <span><strong>Mission alignment strong:</strong> 72% would still recommend Creighton</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <Users style={{color: '#0054A6'}} size={20} className="mb-3" />
            <div className="text-3xl font-bold text-gray-900">{fy25Metrics.uniqueEmployees}</div>
            <div className="text-sm text-gray-600">Total Terminations</div>
            <div className="text-xs text-gray-500 mt-1">9.3% Faculty | 89.5% Staff</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <BarChart3 style={{color: '#1F74DB'}} size={20} className="mb-3" />
            <div className="text-3xl font-bold" style={{color: '#1F74DB'}}>
              {fy25Metrics.overallResponseRate}%
            </div>
            <div className="text-sm text-gray-600">Survey Response Rate</div>
            <div className="text-xs text-gray-500 mt-1">49 total responses</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <ThumbsUp style={{color: '#71CC98'}} size={20} className="mb-3" />
            <div className="text-3xl font-bold" style={{color: '#71CC98'}}>
              {fy25Metrics.avgSatisfaction}%
            </div>
            <div className="text-sm text-gray-600">Avg Satisfaction</div>
            <div className="text-xs text-gray-500 mt-1">Would recommend</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <Calendar style={{color: '#FFC72C'}} size={20} className="mb-3" />
            <div className="text-3xl font-bold" style={{color: '#F59E0B'}}>
              {fy25Metrics.avgYearsOfService}
            </div>
            <div className="text-sm text-gray-600">Avg Years of Service</div>
            <div className="text-xs text-gray-500 mt-1">At termination</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <AlertCircle style={{color: '#EF4444'}} size={20} className="mb-3" />
            <div className="text-3xl font-bold" style={{color: '#EF4444'}}>186</div>
            <div className="text-sm text-gray-600">Q4 Terminations</div>
            <div className="text-xs text-gray-500 mt-1">42.3% of total</div>
          </div>
        </div>

        {/* Quarterly Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingDown style={{color: '#0054A6'}} size={20} />
              Quarterly Termination Trends
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quarter
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Exits
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faculty
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Survey Responses
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response Rate
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Satisfaction
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quarterlyData.map((quarter, index) => {
                    const prevQuarter = index > 0 ? quarterlyData[index - 1] : null;
                    const exitChange = prevQuarter ? quarter.terminations - prevQuarter.terminations : 0;
                    const responseChange = prevQuarter ? quarter.responseRate - prevQuarter.responseRate : 0;
                    
                    return (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {quarter.quarter}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <div className="text-lg font-bold text-gray-900">{quarter.terminations}</div>
                          {prevQuarter && (
                            <div className={`text-xs ${exitChange > 0 ? 'text-red-600' : exitChange < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {exitChange > 0 ? '+' : ''}{exitChange} vs prev
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-blue-600 font-semibold">
                          {quarter.faculty}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-purple-600 font-semibold">
                          {quarter.staff}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <div className="text-sm font-semibold text-green-600">{quarter.responses}</div>
                          <div className="text-xs text-gray-500">of {quarter.terminations}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <div className="text-sm font-bold text-green-700">{quarter.responseRate}%</div>
                          {prevQuarter && responseChange !== 0 && (
                            <div className={`text-xs ${responseChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {responseChange > 0 ? '+' : ''}{responseChange.toFixed(1)}pp
                            </div>
                          )}
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{width: `${Math.min(quarter.responseRate, 100)}%`}}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          {quarter.satisfaction ? (
                            <div>
                              <div className="text-sm font-bold text-blue-600">{quarter.satisfaction}%</div>
                              <div className="text-xs text-gray-500">recommend</div>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400">No data</div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs bg-gray-50 p-3 rounded">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>Faculty Terminations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-600 rounded"></div>
                <span>Staff Terminations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span>Survey Responses</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">pp = percentage points</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target style={{color: '#0054A6'}} size={20} />
              Response Rate & Satisfaction Trend
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Response Rate Progress */}
              <div>
                <h3 className="text-lg font-semibold text-blue-700 mb-4">Response Rate Progress</h3>
                <div className="space-y-4">
                  {quarterlyData.map((quarter, index) => {
                    const prevQuarter = index > 0 ? quarterlyData[index - 1] : null;
                    const change = prevQuarter ? quarter.responseRate - prevQuarter.responseRate : 0;
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex-shrink-0 w-16">
                          <div className="text-sm font-medium text-gray-900">{quarter.quarter.replace(' FY25', '')}</div>
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-semibold text-blue-700">{quarter.responseRate}%</span>
                            {change !== 0 && (
                              <span className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {change > 0 ? '+' : ''}{change.toFixed(1)}pp
                              </span>
                            )}
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-3">
                            <div 
                              className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                              style={{width: `${Math.min(quarter.responseRate, 100)}%`}}
                            />
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {quarter.responses} of {quarter.terminations} exits
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          {index > 0 && (
                            <div className={`text-lg ${change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                              {change > 0 ? '↗' : change < 0 ? '↘' : '→'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Satisfaction Scores */}
              <div>
                <h3 className="text-lg font-semibold text-green-700 mb-4">Satisfaction Scores</h3>
                <div className="space-y-4">
                  {quarterlyData.map((quarter, index) => {
                    const prevQuarter = index > 0 ? quarterlyData[index - 1] : null;
                    const change = prevQuarter && quarter.satisfaction && prevQuarter.satisfaction 
                      ? quarter.satisfaction - prevQuarter.satisfaction 
                      : 0;
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex-shrink-0 w-16">
                          <div className="text-sm font-medium text-gray-900">{quarter.quarter.replace(' FY25', '')}</div>
                        </div>
                        <div className="flex-1 mx-4">
                          {quarter.satisfaction ? (
                            <>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-semibold text-green-700">{quarter.satisfaction}%</span>
                                {change !== 0 && (
                                  <span className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {change > 0 ? '+' : ''}{change.toFixed(1)}pp
                                  </span>
                                )}
                              </div>
                              <div className="w-full bg-green-200 rounded-full h-3">
                                <div 
                                  className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                                  style={{width: `${Math.min(quarter.satisfaction, 100)}%`}}
                                />
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                Would recommend employer
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-2">
                              <span className="text-sm text-gray-400">No survey data</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-right">
                          {index > 0 && quarter.satisfaction && prevQuarter?.satisfaction && (
                            <div className={`text-lg ${change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                              {change > 0 ? '↗' : change < 0 ? '↘' : '→'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {fy25Metrics.overallResponseRate}%
                </div>
                <div className="text-xs text-gray-600">Overall Response Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {fy25Metrics.avgSatisfaction}%
                </div>
                <div className="text-xs text-gray-600">Avg Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700">
                  {fy25Metrics.totalSurveyResponses}
                </div>
                <div className="text-xs text-gray-600">Total Responses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {fy25Metrics.uniqueEmployees}
                </div>
                <div className="text-xs text-gray-600">Total Exits</div>
              </div>
            </div>
          </div>
        </div>

        {/* Termination Reasons Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 style={{color: '#0054A6'}} size={20} />
              HR System Termination Reasons
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Termination Reason
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Level
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topTermReasons.length > 0 ? topTermReasons.map((reason, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reason.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        {reason.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold">
                        {reason.percentage}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          reason.percentage >= 25 
                            ? 'bg-red-100 text-red-800' 
                            : reason.percentage >= 15 
                            ? 'bg-yellow-100 text-yellow-800'
                            : reason.percentage >= 10
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {reason.percentage >= 25 
                            ? 'Critical' 
                            : reason.percentage >= 15 
                            ? 'High'
                            : reason.percentage >= 10
                            ? 'Moderate'
                            : 'Low'
                          }
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        {loading ? 'Loading termination data...' : 'No termination data available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {topTermReasons.length > 0 && (
              <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Critical (25%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>High (15-24%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Moderate (10-14%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Low (&lt;10%)</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Faculty vs Staff Terminations</h2>
            
            {/* Main Faculty/Staff Comparison */}
            <div className="space-y-4 mb-6">
              {facultyStaffData.length > 0 ? facultyStaffData.map((group, index) => {
                const maxValue = Math.max(...facultyStaffData.map(d => d.count));
                const widthPercent = (group.count / maxValue) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: group.color }}
                        />
                        <span className="font-medium text-gray-900">{group.category}</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-700">
                        {group.count} ({group.percentage}%)
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-8">
                        <div 
                          className="h-8 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-500"
                          style={{ 
                            width: `${widthPercent}%`, 
                            backgroundColor: group.color,
                            minWidth: '120px'
                          }}
                        >
                          {group.count} employees
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8 text-gray-500">
                  {loading ? 'Loading faculty/staff data...' : 'No faculty/staff data available'}
                </div>
              )}
            </div>

            {/* Quarterly Breakdown */}
            {facultyStaffData.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quarterly Distribution</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {facultyStaffData.map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded" 
                          style={{ backgroundColor: group.color }}
                        />
                        <h4 className="font-medium text-gray-900">{group.category} by Quarter</h4>
                      </div>
                      <div className="space-y-2">
                        {group.quarterly.map((quarter, qIndex) => {
                          const maxQuarterly = Math.max(...group.quarterly.map(q => q.count));
                          const quarterPercent = maxQuarterly > 0 ? (quarter.count / maxQuarterly) * 100 : 0;
                          
                          return (
                            <div key={qIndex} className="flex items-center gap-3">
                              <div className="w-8 text-xs font-medium text-gray-600">
                                {quarter.quarter}
                              </div>
                              <div className="flex-1">
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                  <div 
                                    className="h-4 rounded-full flex items-center justify-center text-white text-xs font-medium"
                                    style={{ 
                                      width: `${quarterPercent}%`, 
                                      backgroundColor: group.color,
                                      minWidth: quarter.count > 0 ? '30px' : '0px'
                                    }}
                                  >
                                    {quarter.count > 0 ? quarter.count : ''}
                                  </div>
                                </div>
                              </div>
                              <div className="w-6 text-xs font-semibold text-gray-700">
                                {quarter.count}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Summary Statistics */}
            {facultyStaffData.length > 0 && (
              <div className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded">
                  <div className="text-center">
                    <div className="font-semibold text-gray-700 mb-1">Faculty-to-Staff Ratio</div>
                    <div className="text-xl font-bold text-blue-600">
                      1:{(facultyStaffData[0]?.count / facultyStaffData[1]?.count).toFixed(1) || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">staff per faculty exit</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-700 mb-1">Peak Faculty Quarter</div>
                    <div className="text-xl font-bold text-blue-600">Q4</div>
                    <div className="text-xs text-gray-500">{facultyStaffData[1]?.quarterly?.[3]?.count || 0} exits (academic year end)</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-700 mb-1">Peak Staff Quarter</div>
                    <div className="text-xl font-bold text-purple-600">Q1</div>
                    <div className="text-xs text-gray-500">{facultyStaffData[0]?.quarterly?.[0]?.count || 0} exits (post-holiday period)</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-4 text-xs text-gray-600 text-center bg-blue-50 p-2 rounded">
              <span className="font-semibold">Note:</span> Staff terminations significantly exceed faculty (5.8x ratio). Faculty exits peak in Q4 (academic calendar), staff exits peak in Q1 (operational calendar).
            </div>
          </div>
        </div>

        {/* Years of Service Distribution */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Years of Service at Termination</h2>
            <div className="grid grid-cols-7 gap-4">
              {yearsOfServiceData.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="h-24 flex flex-col justify-end mb-2">
                    <div 
                      className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                      style={{ height: `${(item.count / 154) * 100}%` }}
                    />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                  <div className="text-xs text-gray-600">{item.range} years</div>
                  <div className="text-xs text-gray-500">{item.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Exit Survey Insights */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Lightbulb style={{color: '#0054A6'}} size={24} />
              Exit Survey Key Findings (49 Responses)
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{color: '#0054A6'}}>
                  Satisfaction Ratings Progression
                </h3>
                <div className="space-y-3">
                  {surveyInsights.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{item.category}</span>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2 text-xs">
                          <span>Q1: {item.q1}</span>
                          <span>Q2: {item.q2}</span>
                          <span>Q4: {item.q4}</span>
                        </div>
                        {item.trend === 'improving' && (
                          <span className="text-green-600">↑</span>
                        )}
                        {item.trend === 'stable' && (
                          <span className="text-gray-600">→</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> All satisfaction categories remain below target (3.5/5.0), 
                    with Career Development critically low at 2.5/5.0 average.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4" style={{color: '#0054A6'}}>
                  Employee-Reported Exit Reasons
                </h3>
                <div className="space-y-3">
                  {keyFindings.topExitReasons.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <span className="text-sm font-medium">{item.reason}</span>
                        <div className="text-xs text-gray-500 mt-1">
                          Reported in: {item.quarters.join(', ')}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-blue-600" 
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold w-10 text-right">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800">
                    <strong>Concern:</strong> Workplace conduct issues increased from 15% (Q1) to 22% (Q4), 
                    requiring immediate leadership attention.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Recommendations */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Target style={{color: '#2E7D32'}} size={24} />
              FY26 Strategic Recommendations
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-red-600">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Immediate Actions</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-red-600 mt-0.5" />
                    <span>Launch anonymous workplace climate survey</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-red-600 mt-0.5" />
                    <span>Investigate departments with high Q4 exits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-red-600 mt-0.5" />
                    <span>Strengthen conduct reporting mechanisms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-red-600 mt-0.5" />
                    <span>Address 186 Q4 termination spike causes</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-yellow-600">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">90-Day Initiatives</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-yellow-600 mt-0.5" />
                    <span>Implement supervisor training program</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-yellow-600 mt-0.5" />
                    <span>Create career development pathways</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-yellow-600 mt-0.5" />
                    <span>Improve exit survey response to 40%+</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-yellow-600 mt-0.5" />
                    <span>Establish retention task force</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-green-600">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">FY26 Goals</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-green-600 mt-0.5" />
                    <span>Reduce total terminations by 15%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-green-600 mt-0.5" />
                    <span>Achieve 50%+ survey response rate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-green-600 mt-0.5" />
                    <span>Lift all satisfaction scores above 3.5/5.0</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-green-600 mt-0.5" />
                    <span>Reduce conduct concerns below 10%</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 bg-white rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Success Metrics Dashboard</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">Current</div>
                  <div className="text-2xl font-bold text-gray-900">{fy25Metrics.uniqueEmployees}</div>
                  <div className="text-xs text-green-600">Target: 374</div>
                  <div className="text-xs text-gray-500">Terminations</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">Current</div>
                  <div className="text-2xl font-bold text-gray-900">11.1%</div>
                  <div className="text-xs text-green-600">Target: 50%</div>
                  <div className="text-xs text-gray-500">Response Rate</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">Current</div>
                  <div className="text-2xl font-bold text-gray-900">2.5</div>
                  <div className="text-xs text-green-600">Target: 3.5</div>
                  <div className="text-xs text-gray-500">Career Dev Score</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">Current</div>
                  <div className="text-2xl font-bold text-gray-900">18.5%</div>
                  <div className="text-xs text-green-600">Target: &lt;10%</div>
                  <div className="text-xs text-gray-500">Conduct Concerns</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Quality Note */}
        <div className="mb-8">
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Data Quality & Methodology Notes</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Turnover data extracted from HR system "Terms Since 2017 Detail PT.xlsx" excluding TEMPS category</li>
                  <li>• Exit survey data available for Q1 (20 responses), Q2 (11 responses), and Q4 (18 responses) only</li>
                  <li>• Q3 FY25 exit survey not yet implemented - 66 terminations without survey data</li>
                  <li>• Response rates calculated using actual termination counts from HR data, not survey-reported exits</li>
                  <li>• See TURNOVER_METHODOLOGY.md and EXIT_SURVEY_METHODOLOGY.md for detailed calculation methods</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print-specific CSS */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          /* Ensure tables break properly */
          table {
            break-inside: auto;
          }
          
          tr {
            break-inside: avoid;
            break-after: auto;
          }
          
          thead {
            display: table-header-group;
          }
          
          /* Optimize spacing for print */
          .space-y-4 > * + * {
            margin-top: 1rem !important;
          }
          
          .space-y-6 > * + * {
            margin-top: 1.5rem !important;
          }
          
          .gap-8 {
            gap: 2rem !important;
          }
          
          /* Ensure color contrast for print */
          .text-blue-600, .text-blue-700 {
            color: #000 !important;
          }
          
          .text-green-600, .text-green-700 {
            color: #000 !important;
          }
          
          .text-red-600, .text-red-700 {
            color: #000 !important;
          }
          
          .text-yellow-600, .text-yellow-700 {
            color: #000 !important;
          }
          
          /* Ensure progress bars are visible */
          .bg-blue-600, .bg-green-600 {
            background-color: #333 !important;
          }
          
          .bg-blue-200, .bg-green-200 {
            background-color: #e5e5e5 !important;
            border: 1px solid #ccc !important;
          }
          
          /* Optimize font sizes for print */
          .text-xs {
            font-size: 10px !important;
          }
          
          .text-sm {
            font-size: 12px !important;
          }
          
          /* Ensure badges are visible */
          .bg-red-100, .bg-yellow-100, .bg-blue-100, .bg-green-100 {
            background-color: #f5f5f5 !important;
            border: 1px solid #ddd !important;
          }
          
          /* Page break optimization */
          .mb-8 {
            page-break-after: auto;
          }
          
          h2 {
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default ExitSurveyFY25Dashboard;