import React, { useState } from 'react';
import { Target, AlertTriangle, TrendingUp, Users, Calendar, CheckSquare, Clock, Flag } from 'lucide-react';

const FY2026PlanningMatrix = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState('priorities');

  const planningData = {
    strategicPriorities: [
      {
        id: 1,
        title: "Implement Quarterly Exit Surveys",
        description: "Establish consistent exit survey process for all quarters starting Q1 FY26",
        owner: "HR Operations",
        timeline: "Q1 FY26",
        priority: "Critical",
        impact: "High",
        effort: "Medium",
        kpis: ["50%+ response rate", "Quarterly trend data", "Consistent methodology"],
        risks: ["Low participation", "Survey fatigue", "Resource constraints"]
      },
      {
        id: 2,
        title: "Response Rate Enhancement",
        description: "Achieve 50%+ survey response rate through process improvements and engagement strategies",
        owner: "HR Analytics",
        timeline: "Q1-Q2 FY26",
        priority: "High",
        impact: "High",
        effort: "Medium",
        kpis: ["≥50% response rate", "Reduced time-to-survey", "Higher completion rates"],
        risks: ["Employee resistance", "System limitations", "Manager buy-in"]
      },
      {
        id: 3,
        title: "Supervisor Development Program",
        description: "Address 11% supervisor-related exits through targeted management training",
        owner: "L&D Team",
        timeline: "Q2 FY26",
        priority: "High",
        impact: "Medium",
        effort: "High",
        kpis: ["<5% supervisor-related exits", "Manager satisfaction scores", "Training completion"],
        risks: ["Manager availability", "Behavior change time", "Budget constraints"]
      },
      {
        id: 4,
        title: "Career Development Initiative",
        description: "Address 17% career advancement exits through clearer pathways and communication",
        owner: "Talent Management",
        timeline: "Q3 FY26",
        priority: "Medium",
        impact: "Medium",
        effort: "High",
        kpis: ["<10% career-related exits", "Internal promotion rates", "Development plan completion"],
        risks: ["Limited advancement opportunities", "Budget for growth roles", "Cross-department coordination"]
      },
      {
        id: 5,
        title: "Workplace Culture Monitoring",
        description: "Address 22% reporting concerns through proactive culture assessment and response",
        owner: "Employee Relations",
        timeline: "Q1 FY26",
        priority: "High",
        impact: "High",
        effort: "Medium",
        kpis: ["<15% concern reports", "Faster response times", "Resolution satisfaction"],
        risks: ["Underreporting", "Complex investigations", "Legal considerations"]
      }
    ],
    riskIndicators: [
      {
        category: "Volume Risk",
        indicator: "Quarterly Exit Count",
        target: "≤62 per quarter",
        warning: ">70 per quarter", 
        critical: ">80 per quarter",
        currentStatus: "Good",
        monitoring: "Monthly"
      },
      {
        category: "Satisfaction Risk", 
        indicator: "Would Recommend %",
        target: "≥80%",
        warning: "<75%",
        critical: "<65%",
        currentStatus: "Good",
        monitoring: "Quarterly"
      },
      {
        category: "Response Risk",
        indicator: "Survey Response Rate",
        target: "≥50%",
        warning: "<40%",
        critical: "<25%", 
        currentStatus: "Warning",
        monitoring: "Quarterly"
      },
      {
        category: "Concern Risk",
        indicator: "Workplace Concerns %",
        target: "≤15%",
        warning: ">20%",
        critical: ">30%",
        currentStatus: "Warning",
        monitoring: "Quarterly"
      },
      {
        category: "Manager Risk",
        indicator: "Supervisor-Related Exits %",
        target: "≤5%",
        warning: ">10%",
        critical: ">15%",
        currentStatus: "Warning", 
        monitoring: "Quarterly"
      }
    ],
    actionItems: [
      {
        id: 1,
        action: "Design Q1 FY26 exit survey process",
        owner: "HR Operations",
        due: "Sep 2025",
        status: "Not Started",
        priority: "High"
      },
      {
        id: 2,
        action: "Develop response rate improvement plan", 
        owner: "HR Analytics",
        due: "Oct 2025",
        status: "Not Started",
        priority: "High"
      },
      {
        id: 3,
        action: "Create supervisor training curriculum",
        owner: "L&D Team",
        due: "Dec 2025",
        status: "Not Started",
        priority: "Medium"
      },
      {
        id: 4,
        action: "Establish quarterly monitoring dashboard",
        owner: "HR Analytics",
        due: "Sep 2025", 
        status: "Not Started",
        priority: "High"
      },
      {
        id: 5,
        action: "Review and update exit interview questions",
        owner: "Employee Relations",
        due: "Aug 2025",
        status: "Not Started",
        priority: "Medium"
      }
    ]
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Good': return 'bg-green-100 text-green-800';
      case 'Warning': return 'bg-yellow-100 text-yellow-800'; 
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Complete': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStrategicPriorities = () => (
    <div className="space-y-6">
      {planningData.strategicPriorities.map((priority) => (
        <div key={priority.id} className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{priority.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{priority.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(priority.priority)}`}>
              {priority.priority}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Owner</div>
              <div className="text-sm font-medium text-gray-900">{priority.owner}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Timeline</div>
              <div className="text-sm font-medium text-gray-900">{priority.timeline}</div>
            </div>
            <div className="flex gap-4">
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Impact</div>
                <div className="text-sm font-medium text-gray-900">{priority.impact}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Effort</div>
                <div className="text-sm font-medium text-gray-900">{priority.effort}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-medium text-green-700 mb-2">Success KPIs</div>
              <ul className="text-sm text-green-600 space-y-1">
                {priority.kpis.map((kpi, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckSquare size={14} />
                    {kpi}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-medium text-red-700 mb-2">Key Risks</div>
              <ul className="text-sm text-red-600 space-y-1">
                {priority.risks.map((risk, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <AlertTriangle size={14} />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderRiskIndicators = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {planningData.riskIndicators.map((indicator, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{indicator.indicator}</h3>
                <p className="text-sm text-gray-600">{indicator.category}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(indicator.currentStatus)}`}>
                {indicator.currentStatus}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-green-600 font-medium">Target</div>
                <div className="text-gray-900">{indicator.target}</div>
              </div>
              <div>
                <div className="text-yellow-600 font-medium">Warning</div>
                <div className="text-gray-900">{indicator.warning}</div>
              </div>
              <div>
                <div className="text-red-600 font-medium">Critical</div>
                <div className="text-gray-900">{indicator.critical}</div>
              </div>
              <div>
                <div className="text-gray-600 font-medium">Frequency</div>
                <div className="text-gray-900">{indicator.monitoring}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderActionItems = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 font-medium text-gray-700">Action Item</th>
              <th className="text-left p-3 font-medium text-gray-700">Owner</th>
              <th className="text-left p-3 font-medium text-gray-700">Due Date</th>
              <th className="text-center p-3 font-medium text-gray-700">Priority</th>
              <th className="text-center p-3 font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {planningData.actionItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-medium text-gray-900">{item.action}</div>
                </td>
                <td className="p-3 text-gray-600">{item.owner}</td>
                <td className="p-3 text-gray-600">{item.due}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="text-purple-600" size={24} />
          FY2026 Strategic Planning & Risk Management
        </h2>
        <p className="text-gray-600 mt-2">
          Strategic priorities, risk indicators, and action items for FY2026 based on FY2025 learnings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('priorities')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'priorities'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Target size={16} className="inline mr-2" />
          Strategic Priorities
        </button>
        <button
          onClick={() => setActiveTab('risks')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'risks'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <AlertTriangle size={16} className="inline mr-2" />
          Risk Indicators
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'actions'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <CheckSquare size={16} className="inline mr-2" />
          Action Items
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'priorities' && renderStrategicPriorities()}
        {activeTab === 'risks' && renderRiskIndicators()}
        {activeTab === 'actions' && renderActionItems()}
      </div>

      {/* Summary Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-600">5</div>
            <div className="text-sm text-gray-600">Strategic Priorities</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">5</div>
            <div className="text-sm text-gray-600">Risk Indicators</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">5</div>
            <div className="text-sm text-gray-600">Action Items</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">Q1</div>
            <div className="text-sm text-gray-600">FY26 Start Date</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FY2026PlanningMatrix;