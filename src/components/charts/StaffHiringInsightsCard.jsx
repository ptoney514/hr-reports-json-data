import React, { memo } from 'react';
import { Lightbulb, TrendingUp, Users, AlertTriangle } from 'lucide-react';

const StaffHiringInsightsCard = memo(({ 
  title = "Staff Hiring Strategic Insights & Recommendations",
  className = ""
}) => {
  const insights = [
    {
      category: "Hiring Competitiveness",
      icon: AlertTriangle,
      color: "#DC2626",
      bgColor: "#FEF2F2",
      borderColor: "#DC2626",
      items: [
        "Highly competitive: Only 4.3% overall success rate means 23 people compete for every position",
        "External challenge: 3.7% success rate for external candidates indicates strong employer brand and selectivity",
        "Quality control: Low hire rate suggests rigorous screening and high standards"
      ]
    },
    {
      category: "Internal Candidate Value",
      icon: TrendingUp,
      color: "#10B981",
      bgColor: "#F0FDF4",
      borderColor: "#10B981",
      items: [
        "Significant advantage: 24% success rate is 6.4x higher than external candidates",
        "Institutional knowledge valued: Internal familiarity with culture and processes highly prioritized",
        "Career development: Strong internal mobility supports employee retention and growth"
      ]
    }
  ];

  const recommendations = [
    {
      title: "For HR Strategy",
      description: "Continue investing in internal development programs as they yield 6x better hiring success rates and likely improve retention.",
      icon: Users,
      color: "#0054A6"
    },
    {
      title: "For Candidates",
      description: "External candidates should expect a highly competitive process, while internal employees should be encouraged to apply for growth opportunities given their strong success rate.",
      icon: Lightbulb,
      color: "#FFC72C"
    }
  ];

  return (
    <div className={`bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb 
          className="print:text-black" 
          style={{color: '#0054A6'}}
          size={24} 
        />
        <h3 className="text-lg font-semibold print:text-black" style={{color: '#0054A6'}}>
          {title}
        </h3>
      </div>

      {/* Key Findings */}
      <div className="space-y-6 mb-8">
        {insights.map((insight, index) => {
          const IconComponent = insight.icon;
          return (
            <div key={index}>
              <div className="flex items-center gap-2 mb-3">
                <IconComponent size={18} style={{color: insight.color}} />
                <h4 className="text-md font-semibold print:text-black" style={{color: insight.color}}>
                  {insight.category}
                </h4>
              </div>
              <div 
                className="p-4 rounded-lg border-l-4"
                style={{
                  backgroundColor: insight.bgColor,
                  borderColor: insight.borderColor
                }}
              >
                <ul className="space-y-2">
                  {insight.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2">
                      <span className="text-sm mt-0.5" style={{color: insight.color}}>•</span>
                      <span className="text-sm print:text-black" style={{color: '#00245D'}}>
                        <strong>{item.split(':')[0]}:</strong> {item.split(':').slice(1).join(':')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Strategic Recommendations */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={18} style={{color: '#0054A6'}} />
          <h4 className="text-md font-semibold print:text-black" style={{color: '#0054A6'}}>
            Strategic Recommendations
          </h4>
        </div>
        
        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const IconComponent = rec.icon;
            return (
              <div 
                key={index}
                className="p-4 rounded-lg"
                style={{backgroundColor: '#F3F3F0'}}
              >
                <div className="flex items-center gap-2 mb-2">
                  <IconComponent size={16} style={{color: rec.color}} />
                  <span className="font-semibold text-sm print:text-black" style={{color: rec.color}}>
                    {rec.title}:
                  </span>
                </div>
                <p className="text-sm print:text-black" style={{color: '#00245D'}}>
                  {rec.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Line Summary */}
      <div className="mt-6 p-4 rounded-lg border-2" style={{borderColor: '#0054A6', backgroundColor: '#F0F8FF'}}>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} style={{color: '#0054A6'}} />
          <span className="font-semibold text-sm print:text-black" style={{color: '#0054A6'}}>
            Bottom Line
          </span>
        </div>
        <p className="text-sm print:text-black" style={{color: '#00245D'}}>
          Creighton is a highly selective employer with a strong preference for internal candidates, 
          making it challenging for external applicants but offering excellent advancement opportunities 
          for current employees.
        </p>
      </div>
    </div>
  );
});

export default StaffHiringInsightsCard;