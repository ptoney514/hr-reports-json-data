import React from 'react';

const WorkforceCategoryCard = ({ category, count, selectedQuarter }) => {
  const Icon = category.icon;
  
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-800'
    },
    blue: {
      bg: 'bg-blue-50', 
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-800'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200', 
      icon: 'text-purple-600',
      text: 'text-purple-800'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600', 
      text: 'text-orange-800'
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: 'text-gray-600',
      text: 'text-gray-800'
    }
  };

  const colors = colorClasses[category.color] || colorClasses.gray;

  return (
    <div className={`
      min-w-[200px] max-w-[200px] h-[140px] 
      bg-white rounded-lg border-2 p-4 relative
      hover:shadow-md transition-all duration-200
      ${colors.bg} ${colors.border}
    `}>
      {/* Card Header - Title and Icon */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 truncate pr-2">
          {category.title}
        </h3>
        <Icon className={`w-5 h-5 flex-shrink-0 ${colors.icon}`} />
      </div>
      
      {/* Main Count */}
      <div className="mb-8">
        <p className="text-2xl font-bold text-gray-900">{count}</p>
        <p className={`text-xs font-medium ${colors.text}`}>{category.displayName}</p>
      </div>
      
      {/* Footer - Selected Quarter */}
      <div className="absolute bottom-3 left-4 right-4">
        <p className="text-xs text-gray-500 truncate">
          {selectedQuarter || 'No date selected'}
        </p>
      </div>
    </div>
  );
};

export default WorkforceCategoryCard;