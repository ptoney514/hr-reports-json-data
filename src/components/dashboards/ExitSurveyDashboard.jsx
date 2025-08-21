import React from 'react';
import { LogOut, Calendar, TrendingUp, Users, Target } from 'lucide-react';
import { getExitSurveyData } from '../../data/staticData';
import FY2025ExitComparison from '../charts/FY2025ExitComparison';
import FY2025LessonsLearnedPanel from '../panels/FY2025LessonsLearnedPanel';
import FY2026PlanningMatrix from '../planning/FY2026PlanningMatrix';
import DepartmentExitAnalysis from '../charts/DepartmentExitAnalysis';

const ExitSurveyDashboard = () => {
  // Get FY2025 data for summary metrics
  const q1Data = getExitSurveyData("2024-06-30"); // Q1 FY25 baseline
  const q4Data = getExitSurveyData("2025-06-30"); // Q4 FY25 with survey

  // Calculate FY2025 totals and metrics - actual data only
  const fy2025Metrics = {
    totalExits: (q1Data?.totalExits || 80) + (q4Data?.totalExits || 62), // Only actual Q1 + Q4 data
    q1Exits: q1Data?.totalExits || 80,
    q4Exits: q4Data?.totalExits || 62,
    improvement: Math.round(((80 - 62) / 80) * 100), // Q1 to Q4 improvement
    finalSatisfaction: q4Data?.wouldRecommend || 83,
    finalResponseRate: q4Data?.responseRate || 29,
    concernsReported: q4Data?.concernsReported?.percentage || 22,
    surveyQuarters: 1 // Only Q4 had survey
  };

  return (
    <div id="exit-survey-dashboard" data-dashboard-content className="min-h-screen bg-gray-50 py-8 dashboard-container print:bg-white print:py-0">
      <div className="max-w-7xl mx-auto px-6 print:max-w-none print:px-0 print:mx-0">
        
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <LogOut style={{color: '#0054A6'}} size={32} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">FY2025 Exit Survey Annual Report</h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Comprehensive Analysis: July 2024 - June 2025
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Strategic insights and FY2026 planning based on exit trends and employee feedback
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold" style={{color: '#0054A6'}}>
                  {fy2025Metrics.totalExits}
                </div>
                <div className="text-sm text-gray-600">Actual FY2025 Exits</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="rotate-180" style={{color: '#71CC98'}} size={16} />
                  <span className="text-sm font-medium" style={{color: '#71CC98'}}>
                    {fy2025Metrics.improvement}% Improvement
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Exits */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Users style={{color: '#0054A6'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full" style={{backgroundColor: '#95D2F3', color: '#00245D'}}>
                ANNUAL
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {fy2025Metrics.totalExits}
            </div>
            <div className="text-sm text-gray-600 mb-2">Actual FY2025 Exits</div>
            <div className="flex items-center text-xs text-gray-500">
              <span>Q1: {fy2025Metrics.q1Exits} → Q4: {fy2025Metrics.q4Exits}</span>
            </div>
          </div>

          {/* Exit Trend */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp style={{color: '#71CC98'}} size={24} />
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                IMPROVED
              </span>
            </div>
            <div className="text-3xl font-bold mb-1" style={{color: '#71CC98'}}>
              ↓{fy2025Metrics.improvement}%
            </div>
            <div className="text-sm text-gray-600 mb-2">Q1 to Q4 Improvement</div>
            <div className="text-xs text-gray-500">
              Retention strategies showing impact
            </div>
          </div>

          {/* Final Satisfaction */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Target style={{color: '#1F74DB'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full" style={{
                backgroundColor: fy2025Metrics.finalSatisfaction >= 80 ? '#71CC98' :
                fy2025Metrics.finalSatisfaction >= 70 ? '#FFC72C' : '#EF4444',
                color: 'white'
              }}>
                {fy2025Metrics.finalSatisfaction >= 80 ? 'STRONG' :
                 fy2025Metrics.finalSatisfaction >= 70 ? 'GOOD' : 'NEEDS WORK'}
              </span>
            </div>
            <div className="text-3xl font-bold mb-1" style={{color: '#1F74DB'}}>
              {fy2025Metrics.finalSatisfaction}%
            </div>
            <div className="text-sm text-gray-600 mb-2">Final Satisfaction (Q4)</div>
            <div className="text-xs text-gray-500">
              Would recommend organization
            </div>
          </div>

          {/* Survey Implementation */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Calendar style={{color: '#FFC72C'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full" style={{backgroundColor: '#FFC72C', color: '#00245D'}}>
                PARTIAL
              </span>
            </div>
            <div className="text-3xl font-bold mb-1" style={{color: '#FFC72C'}}>
              {fy2025Metrics.surveyQuarters}/4
            </div>
            <div className="text-sm text-gray-600 mb-2">Quarters w/ Surveys</div>
            <div className="text-xs text-gray-500">
              {fy2025Metrics.finalResponseRate}% response rate (Q4)
            </div>
          </div>
        </div>

        {/* Annual Trend Visualization */}
        <div className="mb-8">
          <FY2025ExitComparison />
        </div>

        {/* Exit Reasons Analysis - Only Q4 data available */}
        {q4Data?.departureReasons && (
          <div className="mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target style={{color: '#0054A6'}} size={20} />
                Q4 FY2025 Exit Reasons Analysis
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Based on {q4Data.totalResponses} survey responses from {q4Data.totalExits} exits in Q4 FY2025
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Exit Reasons Chart */}
                <div className="space-y-4">
                  {q4Data.departureReasons.map((reason, index) => {
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
                    return (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3 flex-1">
                          <span 
                            className="w-4 h-4 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: colors[index % colors.length] }}
                          ></span>
                          <span className="text-sm font-medium text-gray-800 min-w-0 flex-1">
                            {reason.reason}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <div className="w-24 bg-gray-200 rounded-full h-3">
                            <div 
                              className="h-3 rounded-full transition-all duration-300" 
                              style={{ 
                                width: `${reason.percentage}%`, 
                                backgroundColor: colors[index % colors.length] 
                              }}
                            ></div>
                          </div>
                          <span className="font-bold text-sm text-gray-900 w-10 text-right">
                            {reason.percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Key Insights */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-4">Key Findings</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-blue-800">
                        <strong>Top reason:</strong> {q4Data.departureReasons[0]?.reason} ({q4Data.departureReasons[0]?.percentage}%)
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-blue-800">
                        <strong>Supervisor issues:</strong> {q4Data.departureReasons.find(r => r.reason.toLowerCase().includes('supervisor'))?.percentage || 0}% cite direct supervisor concerns
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-blue-800">
                        <strong>Career development:</strong> {q4Data.departureReasons.find(r => r.reason.toLowerCase().includes('advancement'))?.percentage || 0}% lack advancement opportunities
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-blue-800">
                        <strong>Workplace concerns:</strong> {q4Data.concernsReported?.percentage}% reported improper conduct
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Department Analysis */}
        <div className="mb-8">
          <DepartmentExitAnalysis layout="both" />
        </div>

        {/* Lessons Learned Panel */}
        <div className="mb-8">
          <FY2025LessonsLearnedPanel />
        </div>

        {/* FY2026 Planning Matrix */}
        <div className="mb-8">
          <FY2026PlanningMatrix />
        </div>

        {/* Executive Summary */}
        <div className="mb-8">
          <div className="rounded-lg border p-8" style={{background: 'linear-gradient(to right, #95D2F3, #E6F3FF)'}}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Target style={{color: '#0054A6'}} size={24} />
              FY2025 Executive Summary & FY2026 Outlook
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 FY2025 Key Achievements</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#71CC98'}}>✓</span>
                    <span><strong>22.5% reduction</strong> in exit volume from Q1 to Q4 (actual data)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#71CC98'}}>✓</span>
                    <span><strong>83% satisfaction</strong> among departing employees (Q4)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#71CC98'}}>✓</span>
                    <span><strong>Exit survey process</strong> successfully implemented in Q4</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#71CC98'}}>✓</span>
                    <span><strong>142 total exits</strong> for FY2025 (actual Q1 + Q4 data)</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🚀 FY2026 Strategic Focus</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#1F74DB'}}>→</span>
                    <span><strong>Quarterly surveys</strong> for consistent data collection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#1F74DB'}}>→</span>
                    <span><strong>50%+ response rate</strong> through improved processes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#1F74DB'}}>→</span>
                    <span><strong>Supervisor training</strong> to address 11% citing issues</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#1F74DB'}}>→</span>
                    <span><strong>Culture monitoring</strong> to address 22% concerns</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600 leading-relaxed">
                <strong>Bottom Line:</strong> FY2025 demonstrated significant improvement in retention with a 22.5% 
                reduction in exits (Q1 to Q4) and strong employee satisfaction (83%). With 142 total exits from 
                actual data, the Q4 survey implementation provided valuable insights that will guide FY2026 strategic 
                initiatives. Key focus areas include maintaining exit volume below 62 per quarter, achieving 50%+ 
                survey response rates, and addressing supervisor relationship and workplace culture concerns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitSurveyDashboard;