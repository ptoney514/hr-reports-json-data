import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown } from 'lucide-react';

const SummaryCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'percentage', // 'percentage', 'number', 'currency'
  subtitle,
  icon: Icon,
  trend = 'neutral', // 'positive', 'negative', 'neutral'
  arrowDirection = null, // 'up', 'down', or null (auto-detect from change value)
  target,
  className = ''
}) => {
  // Determine trend based on change value if not explicitly provided
  const actualTrend = trend === 'neutral' && change !== undefined 
    ? (change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral')
    : trend;

  // Format change value based on type
  const formatChange = (changeValue) => {
    if (changeValue === undefined || changeValue === null) return '';
    
    const absValue = Math.abs(changeValue);
    const sign = changeValue >= 0 ? '+' : '';
    
    switch (changeType) {
      case 'percentage':
        return `${sign}${changeValue.toFixed(1)}%`;
      case 'currency':
        return `${sign}$${absValue.toLocaleString()}`;
      case 'number':
        return `${sign}${changeValue.toLocaleString()}`;
      default:
        return `${sign}${changeValue}`;
    }
  };

  // Get trend styling - color based on business impact (positive/negative trend)
  const getTrendStyling = () => {
    switch (actualTrend) {
      case 'positive':
        return {
          text: 'text-green-500 print:text-black',
          bg: 'bg-green-50'
        };
      case 'negative':
        return {
          text: 'text-red-500 print:text-black',
          bg: 'bg-red-50'
        };
      case 'custom-positive':
        return {
          text: 'text-blue-700 print:text-black',
          bg: 'bg-blue-50'
        };
      default:
        return {
          text: 'text-gray-500 print:text-black',
          bg: 'bg-gray-50'
        };
    }
  };

  const trendStyle = getTrendStyling();
  
  // Determine arrow direction based on the actual change value or explicit direction
  const getArrowIcon = () => {
    if (arrowDirection === 'up' || (!arrowDirection && change > 0)) {
      return TrendingUp;
    } else if (arrowDirection === 'down' || (!arrowDirection && change < 0)) {
      return TrendingDown;
    }
    return null;
  };
  
  const TrendIcon = getArrowIcon();

  return (
    <div className={`bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray ${className}`}>
      {/* Header with icon and title */}
      <div className="flex items-center gap-2 mb-1 print:mb-1">
        {Icon && (
          <Icon 
            className="text-blue-500 print:text-black" 
            size={16} 
          />
        )}
        <h2 className="text-sm print:text-xs font-medium text-blue-700 print:text-black">
          {title}
        </h2>
      </div>

      {/* Main value and change indicator */}
      <div className="flex items-end gap-2 mb-1">
        <span className="text-2xl print:text-xl font-bold print:text-black">
          {value}
        </span>
        
        {change !== undefined && change !== null && (
          <div className="flex items-center gap-1">
            {TrendIcon && (
              <TrendIcon size={12} className={trendStyle.text} />
            )}
            <span className={`text-xs ${trendStyle.text}`}>
              {formatChange(change)}
            </span>
          </div>
        )}
      </div>

      {/* Subtitle or additional info */}
      {(subtitle || target) && (
        <div className="text-gray-500 print:text-black text-xs print:text-xs">
          {target && (
            <span>Target: {target} | </span>
          )}
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default SummaryCard; 