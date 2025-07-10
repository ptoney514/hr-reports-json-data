import React from 'react';
import { Circle, AlertTriangle } from 'lucide-react';

const RiskAssessmentCard = ({ className = '', ...ariaProps }) => {
  // Risk data matching the screenshot
  const riskData = [
    {
      id: 'late-section-2',
      title: 'Late Section 2',
      riskLevel: 'Medium Risk',
      count: 40,
      icon: 'circle',
      color: '#f59e0b', // Orange
      backgroundColor: '#fef3c7' // Light orange/amber background
    },
    {
      id: 'missing-training',
      title: 'Missing Training',
      riskLevel: 'High Risk', 
      count: 12,
      icon: 'triangle',
      color: '#ef4444', // Red
      backgroundColor: '#fee2e2' // Light red/pink background
    },
    {
      id: 'audit-findings',
      title: 'Audit Findings',
      riskLevel: 'High Risk',
      count: 3,
      icon: 'triangle', 
      color: '#ef4444', // Red
      backgroundColor: '#fee2e2' // Light red/pink background
    }
  ];

  // Summary statistics
  const totalRisks = riskData.reduce((sum, item) => sum + item.count, 0);
  const highPriorityCount = riskData.filter(item => item.riskLevel === 'High Risk').length;

  const renderIcon = (iconType, color) => {
    const iconProps = {
      size: 16,
      style: { color },
      fill: iconType === 'circle' ? color : 'none'
    };

    if (iconType === 'circle') {
      return <Circle {...iconProps} />;
    } else {
      return <AlertTriangle {...iconProps} />;
    }
  };

  return (
    <div 
      className={className}
      role="region"
      aria-label="Risk Assessment - Current system risks and priorities"
      {...ariaProps}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-1">
          Risk Assessment
        </h3>
        <p className="text-sm print:text-xs text-gray-600 print:text-black">
          Total risks: {totalRisks} | High priority: {highPriorityCount}
        </p>
      </div>
      
      {/* Risk Items List */}
      <div className="space-y-3 mb-6 print:mb-4">
        {riskData.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between p-3 rounded-lg print:bg-white"
            style={{ backgroundColor: item.backgroundColor }}
          >
            {/* Left side: Icon and Title */}
            <div className="flex items-center gap-3">
              {renderIcon(item.icon, item.color)}
              <span className="text-sm print:text-xs font-medium text-gray-700 print:text-black">
                {item.title}
              </span>
            </div>
            
            {/* Right side: Count and Risk Level */}
            <div className="text-right">
              <div className="text-lg print:text-base font-bold text-gray-900 print:text-black">
                {item.count}
              </div>
              <div 
                className="text-xs print:text-xs font-medium"
                style={{ color: item.color }}
              >
                {item.riskLevel}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="border-t border-gray-200 print:border-gray pt-3 print:pt-2">
        <p className="text-xs print:text-xs text-gray-500 print:text-black mb-2">
          Risk Levels:
        </p>
        <div className="flex items-center gap-4 print:gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500 print:bg-black"></div>
            <span className="text-xs print:text-xs text-gray-600 print:text-black">High/Critical</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500 print:bg-gray-600"></div>
            <span className="text-xs print:text-xs text-gray-600 print:text-black">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 print:bg-gray-400"></div>
            <span className="text-xs print:text-xs text-gray-600 print:text-black">Low</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAssessmentCard;