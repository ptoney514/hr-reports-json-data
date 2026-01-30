import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Calendar, FileText, ArrowRight, TrendingDown, Users, Target, BarChart3, ThumbsUp, AlertTriangle } from 'lucide-react';
import { getExitSurveyData } from '../../services/dataService';

const ExitSurveyOverview = () => {
  const q1Data = getExitSurveyData("2024-06-30");
  const q4Data = getExitSurveyData("2025-06-30");

  const overviewMetrics = {
    totalExitsQ1: q1Data?.totalExits || 80,
    totalExitsQ4: q4Data?.totalExits || 51,
    improvement: Math.round(((80 - 51) / 80) * 100),
    totalFY25: (q1Data?.totalExits || 80) + (q4Data?.totalExits || 51),
    q4Satisfaction: q4Data?.wouldRecommend || 83,
    q4ResponseRate: q4Data?.responseRate || 29
  };

  const quarterComparison = [
    {
      quarter: 'Q1 FY25',
      period: 'Jul-Sep 2024',
      exits: overviewMetrics.totalExitsQ1,
      hasData: true,
      hasSurvey: false,
      dataType: 'Volume Only',
      key: 'baseline',
      status: 'Baseline Period',
      statusColor: '#95D2F3',
      link: '/dashboards/exit-survey-q1',
      icon: Calendar,
      description: 'Baseline exit volume analysis without survey feedback'
    },
    {
      quarter: 'Q4 FY25', 
      period: 'Apr-Jun 2025',
      exits: overviewMetrics.totalExitsQ4,
      hasData: true,
      hasSurvey: true,
      dataType: 'Survey Insights',
      key: 'survey',
      status: 'Survey Active',
      statusColor: '#71CC98',
      link: '/dashboards/exit-survey-q4',
      icon: FileText,
      satisfaction: overviewMetrics.q4Satisfaction,
      responseRate: overviewMetrics.q4ResponseRate,
      description: 'Comprehensive exit survey analysis with employee feedback'
    }
  ];

  return (
    <div id="exit-survey-overview" className="min-h-screen bg-gray-50 py-8 dashboard-container print:bg-white print:py-0">
      <div className="max-w-7xl mx-auto px-6 print:max-w-none print:px-0 print:mx-0">
        
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <MessageSquare style={{color: '#0054A6'}} size={32} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Exit Survey Program Overview</h1>
                  <p className="text-gray-600 text-lg mt-2">
                    FY2025 Quarterly Analysis & Strategic Insights
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Compare baseline metrics (Q1) with survey implementation results (Q4)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold" style={{color: '#0054A6'}}>
                  {overviewMetrics.totalFY25}
                </div>
                <div className="text-sm text-gray-600">Total FY25 Exits</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="rotate-180" style={{color: '#71CC98'}} size={16} />
                  <span className="text-sm font-medium" style={{color: '#71CC98'}}>
                    {overviewMetrics.improvement}% Improvement
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Users style={{color: '#0054A6'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full" style={{backgroundColor: '#95D2F3', color: '#00245D'}}>
                FY25 TOTAL
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {overviewMetrics.totalFY25}
            </div>
            <div className="text-sm text-gray-600 mb-2">Combined Exit Volume</div>
            <div className="text-xs text-gray-500">
              Q1: {overviewMetrics.totalExitsQ1} | Q4: {overviewMetrics.totalExitsQ4}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <TrendingDown style={{color: '#71CC98'}} size={24} />
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                IMPROVED
              </span>
            </div>
            <div className="text-3xl font-bold mb-1" style={{color: '#71CC98'}}>
              ↓{overviewMetrics.improvement}%
            </div>
            <div className="text-sm text-gray-600 mb-2">Exit Reduction</div>
            <div className="text-xs text-gray-500">
              Q1 to Q4 improvement
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <ThumbsUp style={{color: '#1F74DB'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full" style={{backgroundColor: '#E3F2FD', color: '#1565C0'}}>
                Q4 ONLY
              </span>
            </div>
            <div className="text-3xl font-bold mb-1" style={{color: '#1F74DB'}}>
              {overviewMetrics.q4Satisfaction}%
            </div>
            <div className="text-sm text-gray-600 mb-2">Satisfaction Rate</div>
            <div className="text-xs text-gray-500">
              Would recommend org
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 style={{color: '#FFC72C'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full" style={{backgroundColor: '#FFF9C4', color: '#F57F17'}}>
                Q4 SURVEY
              </span>
            </div>
            <div className="text-3xl font-bold mb-1" style={{color: '#FFC72C'}}>
              {overviewMetrics.q4ResponseRate}%
            </div>
            <div className="text-sm text-gray-600 mb-2">Response Rate</div>
            <div className="text-xs text-gray-500">
              First implementation
            </div>
          </div>
        </div>

        {/* Quarter Navigation Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {quarterComparison.map((quarter, index) => {
            const IconComponent = quarter.icon;
            return (
              <Link 
                key={index} 
                to={quarter.link}
                className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 p-8 group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg" style={{backgroundColor: `${quarter.statusColor}20`}}>
                      <IconComponent style={{color: quarter.statusColor}} size={28} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {quarter.quarter}
                      </h2>
                      <p className="text-gray-600">{quarter.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 group-hover:text-blue-500 transition-colors">
                    <span className="text-sm font-medium">View Details</span>
                    <ArrowRight size={18} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users style={{color: '#0054A6'}} size={20} />
                      <span className="font-medium text-gray-900">Total Exits</span>
                    </div>
                    <span className="text-2xl font-bold" style={{color: '#0054A6'}}>
                      {quarter.exits}
                    </span>
                  </div>

                  {quarter.hasSurvey ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <ThumbsUp style={{color: '#71CC98'}} size={16} />
                          <span className="text-sm font-medium text-green-800">Satisfaction</span>
                        </div>
                        <div className="text-xl font-bold text-green-700">
                          {quarter.satisfaction}%
                        </div>
                      </div>
                      
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 style={{color: '#1F74DB'}} size={16} />
                          <span className="text-sm font-medium text-blue-800">Response Rate</span>
                        </div>
                        <div className="text-xl font-bold text-blue-700">
                          {quarter.responseRate}%
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle style={{color: '#F59E0B'}} size={16} />
                        <span className="text-sm font-medium text-yellow-800">Data Available</span>
                      </div>
                      <div className="text-sm text-yellow-700">
                        Volume metrics only - No survey implementation
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {quarter.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs px-3 py-1 rounded-full font-medium" 
                          style={{backgroundColor: `${quarter.statusColor}20`, color: quarter.statusColor}}>
                      {quarter.status}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {quarter.dataType}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Strategic Overview */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Target style={{color: '#0054A6'}} size={24} />
              FY2025 Exit Survey Program Strategic Overview
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">📊 Q1 Baseline Analysis</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• {overviewMetrics.totalExitsQ1} total exits (no survey)</li>
                    <li>• Volume-only tracking established</li>
                    <li>• Department patterns identified</li>
                    <li>• Need for qualitative data recognized</li>
                  </ul>
                </div>
                <Link 
                  to="/dashboards/exit-survey-q1"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-medium transition-colors"
                >
                  View Q1 Analysis →
                </Link>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">📋 Q4 Survey Implementation</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• {overviewMetrics.totalExitsQ4} exits with {overviewMetrics.q4ResponseRate}% response</li>
                    <li>• {overviewMetrics.q4Satisfaction}% satisfaction rate achieved</li>
                    <li>• Comprehensive exit reason analysis</li>
                    <li>• Action items identified</li>
                  </ul>
                </div>
                <Link 
                  to="/dashboards/exit-survey-q4"
                  className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-lg font-medium transition-colors"
                >
                  View Q4 Insights →
                </Link>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">🎯 Program Impact</h3>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• {overviewMetrics.improvement}% reduction in exit volume</li>
                    <li>• Survey system successfully implemented</li>
                    <li>• Data-driven retention strategies</li>
                    <li>• FY26 action plan developed</li>
                  </ul>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg text-center">
                  <span className="text-sm font-medium text-purple-800">
                    Program Status: Active & Successful
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-8">
          <div className="rounded-lg border p-8" style={{background: 'linear-gradient(to right, #F3F4F6, #E5E7EB)'}}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ArrowRight style={{color: '#0054A6'}} size={24} />
              FY2026 Exit Survey Program Evolution
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🚀 Program Expansion Goals</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#0054A6'}}>•</span>
                    <span><strong>Quarterly surveys</strong> for consistent data collection across all quarters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#0054A6'}}>•</span>
                    <span><strong>50%+ response rates</strong> through process improvements and incentives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#0054A6'}}>•</span>
                    <span><strong>Real-time dashboards</strong> for immediate insight access and action</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#0054A6'}}>•</span>
                    <span><strong>Department-specific</strong> retention strategy development</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Data-Driven Action Areas</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#0054A6'}}>→</span>
                    <span><strong>Career development pathways</strong> based on 30% citing advancement concerns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#0054A6'}}>→</span>
                    <span><strong>Supervisor training programs</strong> addressing 25% reporting relationship issues</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#0054A6'}}>→</span>
                    <span><strong>Workplace culture monitoring</strong> for 22% reporting conduct concerns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1" style={{color: '#0054A6'}}>→</span>
                    <span><strong>Exit volume targets</strong> maintaining improvement trend below 62/quarter</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-300">
              <p className="text-gray-600 leading-relaxed text-center">
                <strong>FY2025 Success:</strong> The transition from Q1's volume-only tracking (80 exits) to Q4's comprehensive 
                survey insights (62 exits, 83% satisfaction) demonstrates the power of data-driven retention strategies. 
                FY2026 will build on this foundation with expanded survey coverage and targeted interventions based on 
                employee feedback, aiming to maintain the positive trajectory while continuously improving data quality and response rates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitSurveyOverview;