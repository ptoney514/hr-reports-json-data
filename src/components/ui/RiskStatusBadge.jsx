import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

/**
 * RiskStatusBadge - Displays a status indicator for risk metrics
 *
 * @param {string} status - 'good', 'checkpoint', or 'tolerance'
 * @param {string} size - 'sm', 'md', or 'lg'
 * @param {boolean} showLabel - Whether to show text label
 * @param {boolean} showIcon - Whether to show the icon
 * @param {string} className - Additional CSS classes
 */
const RiskStatusBadge = ({
  status = 'good',
  size = 'md',
  showLabel = true,
  showIcon = true,
  className = ''
}) => {
  // Status configurations
  const statusConfig = {
    good: {
      label: 'GOOD',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
      dotColor: 'bg-green-500',
      icon: CheckCircle,
      iconColor: 'text-green-600'
    },
    checkpoint: {
      label: 'CHECKPOINT',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200',
      dotColor: 'bg-yellow-500',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600'
    },
    tolerance: {
      label: 'TOLERANCE',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
      dotColor: 'bg-red-500',
      icon: XCircle,
      iconColor: 'text-red-600'
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'px-2 py-0.5',
      fontSize: 'text-xs',
      iconSize: 12,
      dotSize: 'w-2 h-2'
    },
    md: {
      padding: 'px-3 py-1',
      fontSize: 'text-sm',
      iconSize: 14,
      dotSize: 'w-2.5 h-2.5'
    },
    lg: {
      padding: 'px-4 py-1.5',
      fontSize: 'text-base',
      iconSize: 18,
      dotSize: 'w-3 h-3'
    }
  };

  const config = statusConfig[status] || statusConfig.good;
  const sizeStyles = sizeConfig[size] || sizeConfig.md;
  const IconComponent = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeStyles.padding} ${sizeStyles.fontSize}
        border
        print:bg-transparent print:border-gray-400
        ${className}
      `}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {showIcon && (
        <IconComponent
          size={sizeStyles.iconSize}
          className={`${config.iconColor} print:text-black`}
          aria-hidden="true"
        />
      )}
      {!showIcon && (
        <span
          className={`${sizeStyles.dotSize} ${config.dotColor} rounded-full print:bg-black`}
          aria-hidden="true"
        />
      )}
      {showLabel && (
        <span className="print:text-black">{config.label}</span>
      )}
    </span>
  );
};

/**
 * RiskStatusDot - Simplified dot-only version
 */
export const RiskStatusDot = ({ status = 'good', size = 'md', className = '' }) => {
  const dotConfig = {
    good: 'bg-green-500',
    checkpoint: 'bg-yellow-500',
    tolerance: 'bg-red-500'
  };

  const sizeConfig = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <span
      className={`
        ${sizeConfig[size] || sizeConfig.md}
        ${dotConfig[status] || dotConfig.good}
        rounded-full inline-block
        print:bg-black
        ${className}
      `}
      role="status"
      aria-label={`Status: ${status}`}
    />
  );
};

export default RiskStatusBadge;
