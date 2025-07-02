import React from 'react';
import { AlertTriangle, AlertCircle, Info, XCircle } from 'lucide-react';
import { RiskIndicatorsProps } from '../../../types/components';
import { RiskMetric } from '../../../types';

const RiskIndicators: React.FC<RiskIndicatorsProps> = ({
  riskMetrics,
  layout = 'list',
  showCounts = true,
  showColors = true,
  interactive = true,
  onRiskClick,
  loading = false,
  error = null,
  className = '',
  ...ariaProps
}) => {
  // Get appropriate icon for risk level
  const getRiskIcon = (risk: RiskMetric['risk']) => {
    switch (risk) {
      case 'Critical':
        return XCircle;
      case 'High':
        return AlertTriangle;
      case 'Medium':
        return AlertCircle;
      case 'Low':
        return Info;
      default:
        return AlertCircle;
    }
  };

  // Get risk level color
  const getRiskColor = (risk: RiskMetric['risk']) => {
    switch (risk) {
      case 'Critical':
        return 'text-red-800';
      case 'High':
        return 'text-red-600';
      case 'Medium':
        return 'text-orange-600';
      case 'Low':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get background color for risk level
  const getRiskBgColor = (risk: RiskMetric['risk']) => {
    switch (risk) {
      case 'Critical':
        return 'bg-red-100 hover:bg-red-200';
      case 'High':
        return 'bg-red-50 hover:bg-red-100';
      case 'Medium':
        return 'bg-orange-50 hover:bg-orange-100';
      case 'Low':
        return 'bg-yellow-50 hover:bg-yellow-100';
      default:
        return 'bg-gray-50 hover:bg-gray-100';
    }
  };

  // Handle risk item click
  const handleRiskClick = (risk: RiskMetric) => {
    if (interactive && onRiskClick) {
      onRiskClick(risk);
    }
  };

  // Calculate total risk count
  const totalRisks = riskMetrics.reduce((sum, risk) => sum + risk.count, 0);
  const highRisks = riskMetrics.filter(risk => risk.risk === 'High' || risk.risk === 'Critical').length;

  if (loading) {
    return (
      <div className={className} {...ariaProps}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} {...ariaProps}>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Risk Assessment</h3>
        <div className="flex items-center justify-center h-32 bg-red-50 border border-red-200 rounded">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading risk data</p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!riskMetrics || riskMetrics.length === 0) {
    return (
      <div className={className} {...ariaProps}>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Risk Assessment</h3>
        <div className="flex items-center justify-center h-32 bg-green-50 border border-green-200 rounded">
          <div className="text-center">
            <div className="text-green-600 mb-2">✓</div>
            <p className="text-green-700">No risks identified</p>
          </div>
        </div>
      </div>
    );
  }

  const containerClass = layout === 'grid' 
    ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' 
    : layout === 'cards'
    ? 'grid grid-cols-1 gap-3'
    : 'space-y-2 print:space-y-1';

  return (
    <div 
      className={className}
      role="region"
      aria-label={`Risk Assessment - ${totalRisks} total risks identified, ${highRisks} high priority`}
      {...ariaProps}
    >
      <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
        Risk Assessment
      </h3>

      {/* Risk summary */}
      <div className="mb-3 text-sm text-gray-600 print:text-black">
        <p>
          Total risks: <span className="font-medium">{totalRisks}</span> | 
          High priority: <span className="font-medium text-red-600 print:text-black">{highRisks}</span>
        </p>
      </div>

      <div className={containerClass}>
        {riskMetrics.map((risk, index) => {
          const Icon = getRiskIcon(risk.risk);
          const riskColorClass = getRiskColor(risk.risk);
          const bgColorClass = interactive ? getRiskBgColor(risk.risk) : 'bg-gray-50 print:bg-white';
          
          return (
            <div 
              key={index} 
              className={`
                flex justify-between items-center p-2 print:p-1 rounded transition-colors
                ${bgColorClass}
                ${interactive ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500' : ''}
                print:bg-white print:border-gray-300 print:border
              `}
              onClick={() => handleRiskClick(risk)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRiskClick(risk);
                }
              }}
              tabIndex={interactive ? 0 : -1}
              role={interactive ? 'button' : 'group'}
              aria-label={`${risk.category}: ${risk.count} items, ${risk.risk} risk level`}
            >
              <div className="flex items-center gap-2">
                {showColors && (
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: risk.color }}
                      aria-hidden="true"
                    />
                    <Icon 
                      size={16} 
                      className={`${riskColorClass} print:text-black flex-shrink-0`}
                      aria-hidden="true"
                    />
                  </div>
                )}
                <span className="text-sm print:text-xs font-medium">
                  {risk.category}
                </span>
              </div>
              
              <div className="text-right">
                {showCounts && (
                  <div className="text-sm print:text-xs font-bold">
                    {risk.count}
                  </div>
                )}
                <div className={`text-xs ${riskColorClass} print:text-black`}>
                  {risk.risk} Risk
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk level legend */}
      <div className="mt-3 pt-2 border-t border-gray-200 print:border-gray-400">
        <div className="text-xs text-gray-500 print:text-black">
          <p className="font-medium mb-1">Risk Levels:</p>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              High/Critical
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Medium
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              Low
            </span>
          </div>
        </div>
      </div>

      {/* Screen reader accessible list */}
      <div className="sr-only">
        <h4>Risk Assessment Details</h4>
        <ul>
          {riskMetrics.map((risk, index) => (
            <li key={index}>
              {risk.category}: {risk.count} items at {risk.risk} risk level
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RiskIndicators;