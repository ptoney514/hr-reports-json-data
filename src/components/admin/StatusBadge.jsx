import React from 'react';
import { CheckCircle, AlertCircle, Clock, FileText, XCircle } from 'lucide-react';

const StatusBadge = ({ status, size = 'default', showIcon = true, showText = true }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'complete':
        return {
          icon: CheckCircle,
          text: 'Complete',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600'
        };
      case 'incomplete':
        return {
          icon: AlertCircle,
          text: 'Issues',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600'
        };
      case 'outdated':
        return {
          icon: Clock,
          text: 'Outdated',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600'
        };
      case 'draft':
        return {
          icon: FileText,
          text: 'Draft',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600'
        };
      case 'empty':
        return {
          icon: XCircle,
          text: 'No Data',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600'
        };
      default:
        return {
          icon: FileText,
          text: 'Unknown',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600'
        };
    }
  };

  const getSizeClasses = (size) => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 8,
          gap: 'gap-1'
        };
      case 'lg':
        return {
          container: 'px-4 py-2 text-sm',
          icon: 16,
          gap: 'gap-2'
        };
      default:
        return {
          container: 'px-3 py-1 text-xs',
          icon: 12,
          gap: 'gap-1.5'
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);
  const IconComponent = config.icon;

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        ${config.bgColor} 
        ${config.textColor} 
        ${config.borderColor}
        ${sizeClasses.container}
        ${showIcon && showText ? sizeClasses.gap : ''}
      `}
    >
      {showIcon && (
        <IconComponent 
          size={sizeClasses.icon} 
          className={config.iconColor} 
        />
      )}
      {showText && config.text}
    </span>
  );
};

export default StatusBadge;