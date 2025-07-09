import React from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  XCircle, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Activity,
  Shield,
  CheckCircle2
} from 'lucide-react';
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

  // Enhanced risk data accessor with fallback
  const getRiskData = (risk: any) => ({
    category: risk.category,
    count: risk.count,
    risk: risk.risk,
    color: risk.color,
    severity: risk.severity || getSeverityFromRiskLevel(risk.risk),
    trend: risk.trend || 'stable',
    description: risk.description || 'Risk assessment item'
  });

  // Convert risk level to severity percentage if not provided
  const getSeverityFromRiskLevel = (risk: string): number => {
    switch (risk) {
      case 'Critical': return 90;
      case 'High': return 70;
      case 'Medium': return 45;
      case 'Low': return 20;
      default: return 0;
    }
  };

  // Get appropriate icon for risk level
  const getRiskIcon = (risk: RiskMetric['risk']) => {
    switch (risk) {
      case 'Critical': return XCircle;
      case 'High': return AlertTriangle;
      case 'Medium': return AlertCircle;
      case 'Low': return Info;
      default: return AlertCircle;
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return TrendingUp;
      case 'decreasing': return TrendingDown;
      case 'stable': return Minus;
      default: return Minus;
    }
  };

  // Get trend color
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-red-500';
      case 'decreasing': return 'text-green-500';
      case 'stable': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  // Get severity color based on percentage
  const getSeverityColor = (severity: number) => {
    if (severity >= 80) return 'bg-red-500';
    if (severity >= 60) return 'bg-red-400';
    if (severity >= 40) return 'bg-orange-400';
    if (severity >= 20) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  // Get risk badge style
  const getRiskBadgeStyle = (risk: string) => {
    switch (risk) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Low':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Calculate overall risk score
  const calculateOverallRiskScore = () => {
    if (!riskMetrics || riskMetrics.length === 0) return 0;
    const totalSeverity = riskMetrics.reduce((sum, risk) => {
      const riskData = getRiskData(risk);
      return sum + (riskData.severity * riskData.count);
    }, 0);
    const totalCount = riskMetrics.reduce((sum, risk) => sum + risk.count, 0);
    return totalCount > 0 ? Math.round(totalSeverity / totalCount) : 0;
  };

  // Handle risk item click
  const handleRiskClick = (risk: RiskMetric) => {
    if (interactive && onRiskClick) {
      onRiskClick(risk);
    }
  };

  if (loading) {
    return (
      <div className={className} {...ariaProps}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
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
        <div className="flex items-center justify-center h-32 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center">
            <XCircle className="text-red-500 w-8 h-8 mx-auto mb-2" />
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
        <div className="flex items-center justify-center h-32 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-center">
            <CheckCircle2 className="text-green-600 w-8 h-8 mx-auto mb-2" />
            <p className="text-green-700 font-medium">No risks identified</p>
            <p className="text-sm text-green-600">System is operating within acceptable parameters</p>
          </div>
        </div>
      </div>
    );
  }

  const overallRiskScore = calculateOverallRiskScore();
  const totalRisks = riskMetrics.reduce((sum, risk) => sum + risk.count, 0);
  const criticalRisks = riskMetrics.filter(risk => risk.risk === 'Critical').length;
  const highRisks = riskMetrics.filter(risk => risk.risk === 'High').length;

  return (
    <div 
      className={className}
      role="region"
      aria-label={`Risk Assessment - ${totalRisks} total risks identified`}
      {...ariaProps}
    >
      {/* Header with Overall Risk Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black">
            Risk Assessment
          </h3>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">
              Overall Risk Score: {overallRiskScore}%
            </span>
          </div>
        </div>

        {/* Overall Risk Gauge */}
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">System Risk Level</span>
            <span className={`text-sm font-bold ${overallRiskScore >= 70 ? 'text-red-600' : overallRiskScore >= 40 ? 'text-orange-600' : 'text-green-600'}`}>
              {overallRiskScore >= 70 ? 'High Risk' : overallRiskScore >= 40 ? 'Medium Risk' : 'Low Risk'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getSeverityColor(overallRiskScore)}`}
              style={{ width: `${overallRiskScore}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Risk Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-600">{criticalRisks + highRisks}</div>
            <div className="text-xs text-red-700">High Priority</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-600">{totalRisks}</div>
            <div className="text-xs text-blue-700">Total Issues</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-600">{riskMetrics.length}</div>
            <div className="text-xs text-gray-700">Categories</div>
          </div>
        </div>
      </div>

      {/* Risk Items - Modern Card Layout */}
      <div className="space-y-3">
        {riskMetrics.map((risk, index) => {
          const riskData = getRiskData(risk);
          const Icon = getRiskIcon(riskData.risk);
          const TrendIcon = getTrendIcon(riskData.trend);
          const trendColorClass = getTrendColor(riskData.trend);
          const badgeStyle = getRiskBadgeStyle(riskData.risk);
          
          return (
            <div 
              key={index} 
              className={`
                relative bg-white border rounded-lg p-4 transition-all duration-200
                ${interactive ? 'hover:shadow-md hover:border-blue-300 cursor-pointer' : ''}
                ${riskData.risk === 'Critical' ? 'border-red-300 bg-red-50' : ''}
                ${riskData.risk === 'High' ? 'border-red-200 bg-red-25' : ''}
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
              aria-label={`${riskData.category}: ${riskData.count} items, ${riskData.risk} risk level`}
            >
              {/* Risk Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${riskData.risk === 'Critical' ? 'bg-red-100' : riskData.risk === 'High' ? 'bg-red-50' : riskData.risk === 'Medium' ? 'bg-orange-50' : 'bg-green-50'}`}>
                    <Icon 
                      className={`w-5 h-5 ${riskData.risk === 'Critical' ? 'text-red-600' : riskData.risk === 'High' ? 'text-red-500' : riskData.risk === 'Medium' ? 'text-orange-500' : 'text-green-500'}`}
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{riskData.category}</h4>
                    <p className="text-sm text-gray-600">{riskData.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle}`}>
                    {riskData.risk} Risk
                  </span>
                  <div className="flex items-center space-x-1">
                    <TrendIcon className={`w-4 h-4 ${trendColorClass}`} />
                  </div>
                </div>
              </div>

              {/* Risk Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{riskData.count}</div>
                  <div className="text-sm text-gray-600">Issues Found</div>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: riskData.color }}>
                    {riskData.severity}%
                  </div>
                  <div className="text-sm text-gray-600">Severity Level</div>
                </div>
              </div>

              {/* Severity Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Risk Severity</span>
                  <span className="font-medium">{riskData.severity}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getSeverityColor(riskData.severity)}`}
                    style={{ width: `${riskData.severity}%` }}
                  />
                </div>
              </div>

              {/* Risk Trend Indicator */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Trend:</span>
                  <span className={`font-medium capitalize ${trendColorClass}`}>
                    {riskData.trend}
                  </span>
                </div>
                {riskData.risk === 'Critical' && (
                  <span className="text-xs text-red-600 font-medium bg-red-100 px-2 py-1 rounded">
                    Immediate Action Required
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk Legend */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p className="font-medium mb-2">Risk Severity Scale:</p>
          <div className="grid grid-cols-4 gap-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <span>Low (0-30%)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span>Medium (31-50%)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-400 rounded"></div>
              <span>High (51-80%)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Critical (81-100%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Screen reader accessible summary */}
      <div className="sr-only">
        <h4>Risk Assessment Summary</h4>
        <p>Overall risk score: {overallRiskScore}%</p>
        <p>Total risks identified: {totalRisks}</p>
        <p>High priority risks: {criticalRisks + highRisks}</p>
        <ul>
          {riskMetrics.map((risk, index) => {
            const riskData = getRiskData(risk);
            return (
              <li key={index}>
                {riskData.category}: {riskData.count} items at {riskData.severity}% severity, {riskData.risk} risk level, trend {riskData.trend}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default RiskIndicators;