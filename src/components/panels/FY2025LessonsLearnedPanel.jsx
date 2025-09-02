import React from 'react';
import { CheckCircle, AlertTriangle, Target, TrendingUp, Users, BarChart3 } from 'lucide-react';

const FY2025LessonsLearnedPanel = ({ className = "" }) => {
  const lessonsData = {
    whatWorked: [
      {
        title: "Exit Volume Reduction",
        description: "22.5% decrease from Q1 (80) to Q4 (62) exits shows retention strategies gaining traction",
        metric: "↓22.5%",
        impact: "High"
      },
      {
        title: "Strong Employee Satisfaction", 
        description: "83% of Q4 survey respondents would recommend the organization",
        metric: "83%",
        impact: "High"
      },
      {
        title: "Survey Implementation",
        description: "Successfully launched exit survey process in Q4 with meaningful response data",
        metric: "Q4 Launch",
        impact: "Medium"
      },
      {
        title: "Department Engagement",
        description: "Several departments achieved 100% survey response rates",
        metric: "100%",
        impact: "Medium"
      }
    ],
    challenges: [
      {
        title: "Low Response Rate",
        description: "29% response rate falls short of 50%+ industry benchmark",
        metric: "29%",
        severity: "High"
      },
      {
        title: "Workplace Concerns",
        description: "22% of respondents reported improper conduct or workplace issues",
        metric: "22%",
        severity: "High"
      },
      {
        title: "Data Gaps",
        description: "No exit survey data for Q1-Q3, limiting year-over-year trend analysis",
        metric: "3/4 Quarters",
        severity: "Medium"
      },
      {
        title: "Supervisor Relationships",
        description: "11% of exits specifically cite supervisor-related issues",
        metric: "11%",
        severity: "Medium"
      }
    ],
    opportunities: [
      {
        title: "Quarterly Survey Implementation",
        description: "Establish consistent exit surveys every quarter starting FY2026",
        timeline: "Q1 FY26",
        priority: "High"
      },
      {
        title: "Response Rate Improvement",
        description: "Target 50%+ response rate through process improvements and incentives",
        timeline: "Q1 FY26",
        priority: "High"
      },
      {
        title: "Supervisor Training Program",
        description: "Address the 11% citing supervisor issues with targeted management development",
        timeline: "Q2 FY26",
        priority: "Medium"
      },
      {
        title: "Career Development Focus",
        description: "17% cite career advancement - develop clearer pathways and communication",
        timeline: "Q2 FY26", 
        priority: "Medium"
      },
      {
        title: "Proactive Retention",
        description: "Use positive Q4 satisfaction to build momentum for continued improvement",
        timeline: "Ongoing",
        priority: "Medium"
      }
    ]
  };

  const getImpactColor = (impact) => {
    switch(impact) {
      case 'High': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-blue-600 bg-blue-50';
      case 'Low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-orange-600 bg-orange-50';
      case 'Low': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="text-blue-600" size={24} />
          FY2025 Lessons Learned & Strategic Insights
        </h2>
        <p className="text-gray-600 mt-2">
          Analysis of what worked, challenges faced, and opportunities for FY2026
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* What Worked */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="text-green-600" size={20} />
            <h3 className="text-lg font-semibold text-green-800">What Worked</h3>
          </div>
          
          {lessonsData.whatWorked.map((item, index) => (
            <div key={index} className="border border-green-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-green-900 text-sm">{item.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getImpactColor(item.impact)}`}>
                  {item.impact}
                </span>
              </div>
              <p className="text-sm text-green-700 mb-3 leading-relaxed">{item.description}</p>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-green-600" />
                <span className="text-sm font-bold text-green-800">{item.metric}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Challenges */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-600" size={20} />
            <h3 className="text-lg font-semibold text-red-800">Challenges</h3>
          </div>
          
          {lessonsData.challenges.map((item, index) => (
            <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-red-900 text-sm">{item.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSeverityColor(item.severity)}`}>
                  {item.severity}
                </span>
              </div>
              <p className="text-sm text-red-700 mb-3 leading-relaxed">{item.description}</p>
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-600" />
                <span className="text-sm font-bold text-red-800">{item.metric}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Opportunities */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-purple-600" size={20} />
            <h3 className="text-lg font-semibold text-purple-800">FY2026 Opportunities</h3>
          </div>
          
          {lessonsData.opportunities.map((item, index) => (
            <div key={index} className={`border rounded-lg p-4 ${getPriorityColor(item.priority)}`}>
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-purple-900 text-sm">{item.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getPriorityColor(item.priority)}`}>
                  {item.priority}
                </span>
              </div>
              <p className="text-sm text-purple-700 mb-3 leading-relaxed">{item.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-purple-600" />
                  <span className="text-sm font-bold text-purple-800">{item.timeline}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">4</div>
            <div className="text-sm text-green-700">Major Successes</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">4</div>
            <div className="text-sm text-red-700">Key Challenges</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">5</div>
            <div className="text-sm text-purple-700">FY2026 Opportunities</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">83%</div>
            <div className="text-sm text-blue-700">Final Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FY2025LessonsLearnedPanel;