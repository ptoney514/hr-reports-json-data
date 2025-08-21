import React from 'react';
import { TrendingDown, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { getHistoricalComparison, getManagerImpactAnalysis } from '../../utils/exitSurveyAnalytics';

const ExitVolumeAlert = ({ className = "" }) => {
  const comparison = getHistoricalComparison();
  const managerAnalysis = getManagerImpactAnalysis();
  
  if (!comparison) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <AlertCircle className="text-gray-500" size={20} />
          <span className="text-sm text-gray-700">Historical data not available for comparison</span>
        </div>
      </div>
    );
  }

  const { baseline, current, changes } = comparison;
  const isImproving = changes.direction === 'improving';
  const changePercentage = Math.abs(changes.exitVolumeChange || 0);

  // Determine alert type based on data
  const getAlertConfig = () => {
    // Positive trend: exits decreased AND satisfaction is high (>75%)
    if (isImproving && current.wouldRecommend >= 75) {
      return {
        type: 'success',
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600',
        titleColor: 'text-green-800',
        textColor: 'text-green-700',
        title: 'Positive Retention Trend',
        badge: 'IMPROVED'
      };
    }
    
    // Caution: exits decreased but satisfaction is concerning (<75%)
    if (isImproving && current.wouldRecommend < 75) {
      return {
        type: 'warning',
        icon: AlertCircle,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-600',
        titleColor: 'text-yellow-800',
        textColor: 'text-yellow-700',
        title: 'Mixed Retention Signals',
        badge: 'MONITOR'
      };
    }
    
    // Negative trend: exits increased
    if (!isImproving) {
      return {
        type: 'danger',
        icon: AlertCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        titleColor: 'text-red-800',
        textColor: 'text-red-700',
        title: 'Retention Concerns',
        badge: 'ACTION NEEDED'
      };
    }

    // Default info state
    return {
      type: 'info',
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      textColor: 'text-blue-700',
      title: 'Retention Update',
      badge: 'INFO'
    };
  };

  const alertConfig = getAlertConfig();
  const { icon: Icon, ...config } = alertConfig;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon className={config.iconColor} size={24} />
          <div>
            <h3 className={`text-lg font-semibold ${config.titleColor}`}>
              {config.title}
            </h3>
            <p className={`text-sm ${config.textColor} mt-1`}>
              {baseline.period} to {current.period} Comparison
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          config.type === 'success' ? 'bg-green-100 text-green-800' :
          config.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          config.type === 'danger' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {config.badge}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <TrendingDown 
              className={isImproving ? 'text-green-600 rotate-180' : 'text-red-600'} 
              size={16} 
            />
            <span className={`text-lg font-bold ${config.textColor}`}>
              {changePercentage}%
            </span>
          </div>
          <div className={`text-sm ${config.textColor} opacity-80`}>
            Exit Volume Change
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-lg font-bold ${config.textColor}`}>
            {current.wouldRecommend || 'N/A'}%
          </div>
          <div className={`text-sm ${config.textColor} opacity-80`}>
            Would Recommend
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-lg font-bold ${config.textColor}`}>
            {current.responseRate || 'N/A'}%
          </div>
          <div className={`text-sm ${config.textColor} opacity-80`}>
            Response Rate
          </div>
        </div>
      </div>

      {/* Analysis Message */}
      <div className={`text-sm ${config.textColor} leading-relaxed`}>
        {isImproving ? (
          <>
            <p className="mb-2">
              <strong>Positive Development:</strong> Exit volume decreased by {changePercentage}% 
              from {baseline.totalExits} to {current.totalExits} exits between quarters.
            </p>
            {current.wouldRecommend >= 75 ? (
              <p>
                <strong>Strong Satisfaction:</strong> {current.wouldRecommend}% of departing employees 
                would still recommend the organization, indicating healthy retention practices.
              </p>
            ) : (
              <p>
                <strong>Monitor Satisfaction:</strong> While exits decreased, only {current.wouldRecommend}% 
                would recommend the organization. Focus needed on employee experience improvements.
              </p>
            )}
          </>
        ) : (
          <p>
            <strong>Attention Required:</strong> Exit volume increased by {changePercentage}% 
            from {baseline.totalExits} to {current.totalExits} exits. Review retention strategies 
            and address identified concerns.
          </p>
        )}
      </div>

      {/* Manager Impact Alert */}
      {managerAnalysis && managerAnalysis.supervisorIssuePercentage > 0 && (
        <div className={`mt-4 pt-4 border-t ${config.borderColor} ${config.textColor}`}>
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            <span className="font-medium">
              Manager Impact: {managerAnalysis.supervisorIssuePercentage}% of exits cite supervisor issues
            </span>
          </div>
          <p className="text-xs mt-1 opacity-80">
            {managerAnalysis.recommendation}
          </p>
        </div>
      )}
    </div>
  );
};

export default ExitVolumeAlert;