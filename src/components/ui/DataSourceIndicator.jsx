/**
 * DataSourceIndicator Component
 *
 * Visual indicator showing the current data source (API or JSON).
 * Displays a colored dot and label to help developers and admins
 * understand where data is coming from.
 */

import React from 'react';
import { useDataSourceHealth, useDataSourceInfo } from '../../hooks/useHRData';

/**
 * DataSourceIndicator - Shows current data source status
 *
 * @param {Object} props
 * @param {string} [props.size='sm'] - Size variant: 'sm', 'md', 'lg'
 * @param {boolean} [props.showDetails=false] - Show additional details
 * @param {string} [props.className] - Additional CSS classes
 */
export function DataSourceIndicator({
  size = 'sm',
  showDetails = false,
  className = ''
}) {
  const { health, loading } = useDataSourceHealth();
  const sourceInfo = useDataSourceInfo();

  const isApiSource = sourceInfo?.source === 'api' || health?.source === 'api';
  const isHealthy = health?.status === 'ok';

  // Size classes
  const sizeClasses = {
    sm: {
      container: 'text-xs',
      dot: 'w-2 h-2'
    },
    md: {
      container: 'text-sm',
      dot: 'w-2.5 h-2.5'
    },
    lg: {
      container: 'text-base',
      dot: 'w-3 h-3'
    }
  };

  const sizes = sizeClasses[size] || sizeClasses.sm;

  // Status colors
  const getStatusColor = () => {
    if (loading) return 'bg-gray-400 animate-pulse';
    if (!isHealthy) return 'bg-red-500';
    return isApiSource ? 'bg-green-500' : 'bg-blue-500';
  };

  const getStatusLabel = () => {
    if (loading) return 'Checking...';
    if (!isHealthy) return 'Error';
    return isApiSource ? 'Live API' : 'Local JSON';
  };

  const getStatusDescription = () => {
    if (loading) return 'Checking data source connection...';
    if (!isHealthy) return health?.message || 'Data source unavailable';
    return isApiSource
      ? 'Connected to Neon Postgres API'
      : 'Using local JSON data files';
  };

  return (
    <div
      className={`flex items-center gap-2 ${sizes.container} text-gray-500 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={`Data source: ${getStatusLabel()}`}
    >
      {/* Status dot */}
      <span
        className={`${sizes.dot} rounded-full ${getStatusColor()}`}
        aria-hidden="true"
      />

      {/* Label */}
      <span className="font-medium">
        {getStatusLabel()}
      </span>

      {/* Optional details */}
      {showDetails && (
        <span className="text-gray-400 ml-1">
          - {getStatusDescription()}
        </span>
      )}
    </div>
  );
}

/**
 * DataSourceBadge - Compact badge version of the indicator
 */
export function DataSourceBadge({ className = '' }) {
  const { health, loading } = useDataSourceHealth();
  const sourceInfo = useDataSourceInfo();

  const isApiSource = sourceInfo?.source === 'api' || health?.source === 'api';
  const isHealthy = health?.status === 'ok';

  const getBadgeClasses = () => {
    if (loading) return 'bg-gray-100 text-gray-600';
    if (!isHealthy) return 'bg-red-100 text-red-700';
    return isApiSource
      ? 'bg-green-100 text-green-700'
      : 'bg-blue-100 text-blue-700';
  };

  const getLabel = () => {
    if (loading) return '...';
    if (!isHealthy) return 'Error';
    return isApiSource ? 'API' : 'JSON';
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getBadgeClasses()} ${className}`}
      role="status"
      aria-label={`Data source: ${getLabel()}`}
    >
      {getLabel()}
    </span>
  );
}

/**
 * DataSourceStatus - Full status panel for admin views
 */
export function DataSourceStatus({ className = '' }) {
  const { health, loading } = useDataSourceHealth();
  const sourceInfo = useDataSourceInfo();

  const isApiSource = sourceInfo?.source === 'api';
  const isHealthy = health?.status === 'ok';

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
      role="region"
      aria-label="Data source status"
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Data Source Status
      </h3>

      <div className="space-y-3">
        {/* Current source */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Source</span>
          <DataSourceBadge />
        </div>

        {/* Connection status */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Status</span>
          <span className={`text-sm font-medium ${
            loading ? 'text-gray-500' :
            isHealthy ? 'text-green-600' : 'text-red-600'
          }`}>
            {loading ? 'Checking...' : isHealthy ? 'Connected' : 'Error'}
          </span>
        </div>

        {/* API URL (if applicable) */}
        {isApiSource && sourceInfo?.apiUrl && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">API URL</span>
            <span className="text-sm text-gray-900 font-mono text-xs">
              {sourceInfo.apiUrl}
            </span>
          </div>
        )}

        {/* Error message */}
        {!isHealthy && health?.message && (
          <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
            {health.message}
          </div>
        )}

        {/* Fallback indicator */}
        {health?.fallbackAvailable && (
          <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-700">
            Fallback to JSON data is available
          </div>
        )}
      </div>
    </div>
  );
}

export default DataSourceIndicator;
