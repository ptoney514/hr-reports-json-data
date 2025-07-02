import React, { useMemo } from 'react';
import { CheckCircle, Clock, Pause, AlertCircle, User, Target } from 'lucide-react';
import { ProcessImprovementsProps } from '../../../types/components';
import { ProcessImprovement } from '../../../types';

const ProcessImprovements: React.FC<ProcessImprovementsProps> = ({
  improvements,
  layout = 'cards',
  showProgress = true,
  showOwners = true,
  showTargets = true,
  sortBy = 'status',
  filterBy,
  onImprovementClick,
  loading = false,
  error = null,
  className = '',
  ...ariaProps
}) => {
  // Get appropriate icon for status
  const getStatusIcon = (status: ProcessImprovement['status']) => {
    switch (status) {
      case 'Completed':
        return CheckCircle;
      case 'In Progress':
        return Clock;
      case 'On Hold':
        return Pause;
      case 'Not Started':
        return AlertCircle;
      default:
        return AlertCircle;
    }
  };

  // Get status color
  const getStatusColor = (status: ProcessImprovement['status']) => {
    switch (status) {
      case 'Completed':
        return 'text-green-800 bg-green-100 print:bg-white print:text-black';
      case 'In Progress':
        return 'text-blue-800 bg-blue-100 print:bg-white print:text-black';
      case 'On Hold':
        return 'text-yellow-800 bg-yellow-100 print:bg-white print:text-black';
      case 'Not Started':
        return 'text-gray-800 bg-gray-100 print:bg-white print:text-black';
      default:
        return 'text-gray-800 bg-gray-100 print:bg-white print:text-black';
    }
  };

  // Get progress bar color
  const getProgressColor = (progress: number, status: ProcessImprovement['status']) => {
    if (status === 'Completed') return 'bg-green-500';
    if (status === 'On Hold') return 'bg-yellow-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-blue-400';
    if (progress >= 25) return 'bg-blue-300';
    return 'bg-gray-300';
  };

  // Filter and sort improvements
  const processedImprovements = useMemo(() => {
    let filtered = improvements;
    
    // Apply filter
    if (filterBy && filterBy.length > 0) {
      filtered = filtered.filter(improvement => filterBy.includes(improvement.status));
    }
    
    // Apply sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return b.progress - a.progress;
        case 'status':
          const statusOrder = { 'In Progress': 0, 'Not Started': 1, 'On Hold': 2, 'Completed': 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        case 'target':
          return a.target.localeCompare(b.target);
        case 'owner':
          return a.owner.localeCompare(b.owner);
        default:
          return 0;
      }
    });
  }, [improvements, filterBy, sortBy]);

  // Handle improvement click
  const handleImprovementClick = (improvement: ProcessImprovement) => {
    if (onImprovementClick) {
      onImprovementClick(improvement);
    }
  };

  // Calculate summary statistics
  const completedCount = improvements.filter(item => item.status === 'Completed').length;
  const inProgressCount = improvements.filter(item => item.status === 'In Progress').length;
  const averageProgress = improvements.reduce((sum, item) => sum + item.progress, 0) / improvements.length;

  if (loading) {
    return (
      <div className={className} {...ariaProps}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} {...ariaProps}>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Process Improvements</h3>
        <div className="flex items-center justify-center h-32 bg-red-50 border border-red-200 rounded">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading improvements</p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!improvements || improvements.length === 0) {
    return (
      <div className={className} {...ariaProps}>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Process Improvements</h3>
        <div className="flex items-center justify-center h-32 bg-gray-50 border border-gray-200 rounded">
          <p className="text-gray-500">No process improvements tracked</p>
        </div>
      </div>
    );
  }

  const containerClass = layout === 'table' 
    ? 'overflow-x-auto'
    : layout === 'timeline'
    ? 'space-y-4 relative'
    : 'space-y-2 print:space-y-1';

  return (
    <div 
      className={className}
      role="region"
      aria-label={`Process Improvements - ${completedCount} completed, ${inProgressCount} in progress, ${averageProgress.toFixed(0)}% average progress`}
      {...ariaProps}
    >
      <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
        Process Improvements
      </h3>

      {/* Summary stats */}
      <div className="mb-3 text-sm text-gray-600 print:text-black">
        <p>
          Completed: <span className="font-medium text-green-600 print:text-black">{completedCount}</span> | 
          In Progress: <span className="font-medium text-blue-600 print:text-black">{inProgressCount}</span> | 
          Avg Progress: <span className="font-medium">{averageProgress.toFixed(0)}%</span>
        </p>
      </div>

      {layout === 'table' ? (
        <div className={containerClass}>
          <table className="w-full text-sm print:text-xs">
            <thead>
              <tr className="border-b border-gray-200 print:border-gray-400">
                <th className="text-left p-2 print:p-1 font-semibold">Initiative</th>
                <th className="text-left p-2 print:p-1 font-semibold">Status</th>
                {showProgress && <th className="text-left p-2 print:p-1 font-semibold">Progress</th>}
                {showTargets && <th className="text-left p-2 print:p-1 font-semibold">Target</th>}
                {showOwners && <th className="text-left p-2 print:p-1 font-semibold">Owner</th>}
              </tr>
            </thead>
            <tbody>
              {processedImprovements.map((improvement, index) => {
                const StatusIcon = getStatusIcon(improvement.status);
                const statusColorClass = getStatusColor(improvement.status);
                
                return (
                  <tr 
                    key={index} 
                    className="border-b border-gray-200 print:border-gray-400 hover:bg-gray-50 print:hover:bg-white cursor-pointer"
                    onClick={() => handleImprovementClick(improvement)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${improvement.initiative}: ${improvement.status}, ${improvement.progress}% complete`}
                  >
                    <td className="p-2 print:p-1 font-medium">{improvement.initiative}</td>
                    <td className="p-2 print:p-1">
                      <span className={`text-xs px-2 py-1 rounded inline-flex items-center gap-1 ${statusColorClass}`}>
                        <StatusIcon size={12} />
                        {improvement.status}
                      </span>
                    </td>
                    {showProgress && (
                      <td className="p-2 print:p-1">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(improvement.progress, improvement.status)}`}
                            style={{ width: `${improvement.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 print:text-black">{improvement.progress}%</span>
                      </td>
                    )}
                    {showTargets && <td className="p-2 print:p-1 text-gray-600 print:text-black">{improvement.target}</td>}
                    {showOwners && <td className="p-2 print:p-1 text-gray-600 print:text-black">{improvement.owner}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={containerClass}>
          {processedImprovements.map((improvement, index) => {
            const StatusIcon = getStatusIcon(improvement.status);
            const statusColorClass = getStatusColor(improvement.status);
            
            return (
              <div 
                key={index} 
                className="flex justify-between items-center p-2 print:p-1 bg-gray-50 print:bg-white rounded border print:border-gray-300 hover:bg-gray-100 print:hover:bg-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => handleImprovementClick(improvement)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleImprovementClick(improvement);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`${improvement.initiative}: ${improvement.status}, ${improvement.progress}% complete, target: ${improvement.target}, owner: ${improvement.owner}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="text-sm print:text-xs font-medium text-gray-900 print:text-black truncate">
                      {improvement.initiative}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ml-2 flex-shrink-0 ${statusColorClass}`}>
                      <StatusIcon size={12} />
                      {improvement.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {showProgress && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(improvement.progress, improvement.status)}`}
                            style={{ width: `${improvement.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 print:text-black font-medium">
                          {improvement.progress}%
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 print:text-black">
                      {showTargets && (
                        <div className="flex items-center gap-1">
                          <Target size={12} />
                          <span>{improvement.target}</span>
                        </div>
                      )}
                      {showOwners && (
                        <div className="flex items-center gap-1">
                          <User size={12} />
                          <span>{improvement.owner}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Screen reader accessible summary */}
      <div className="sr-only">
        <h4>Process Improvements Summary</h4>
        <ul>
          {processedImprovements.map((improvement, index) => (
            <li key={index}>
              {improvement.initiative}: {improvement.status} status, {improvement.progress}% complete, 
              target {improvement.target}, owned by {improvement.owner}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProcessImprovements;