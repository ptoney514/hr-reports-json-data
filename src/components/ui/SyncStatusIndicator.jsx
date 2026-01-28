import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Clock, Database } from 'lucide-react';
import { useDataSync } from '../../hooks/useDataSync';

const SyncStatusIndicator = ({ className = '', showDetails = false }) => {
  const { syncStatus } = useDataSync();
  const [isHovered, setIsHovered] = useState(false);
  
  // Determine status color and icon
  const getStatusDisplay = () => {
    // Guard against undefined syncStatus
    if (!syncStatus) {
      return {
        icon: <Database className="w-4 h-4" />,
        color: 'text-gray-400',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        text: 'Not Synced',
        detail: 'No sync data'
      };
    }

    if (syncStatus.inProgress) {
      return {
        icon: <RefreshCw className="w-4 h-4 animate-spin" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        text: 'Syncing...',
        detail: `${syncStatus.syncedSources}/${syncStatus.totalSources} sources`
      };
    }
    
    if (syncStatus.errors && syncStatus.errors.length > 0) {
      return {
        icon: <AlertCircle className="w-4 h-4" />,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        text: 'Sync Warning',
        detail: `${syncStatus.errors.length} error${syncStatus.errors.length > 1 ? 's' : ''}`
      };
    }
    
    if (syncStatus.lastSync) {
      const lastSyncDate = new Date(syncStatus.lastSync);
      const minutesAgo = Math.floor((Date.now() - lastSyncDate) / 60000);
      
      if (minutesAgo < 5) {
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          text: 'Synced',
          detail: 'Just now'
        };
      } else if (minutesAgo < 60) {
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          text: 'Synced',
          detail: `${minutesAgo}m ago`
        };
      } else {
        const hoursAgo = Math.floor(minutesAgo / 60);
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          text: 'Synced',
          detail: `${hoursAgo}h ago`
        };
      }
    }
    
    return {
      icon: <Database className="w-4 h-4" />,
      color: 'text-gray-400',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      text: 'Not Synced',
      detail: 'No sync data'
    };
  };
  
  const status = getStatusDisplay();
  
  if (!showDetails) {
    // Compact mode for navigation bar
    return (
      <div 
        className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${status.bgColor} ${status.borderColor} ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className={status.color}>{status.icon}</span>
        <span className={`text-sm font-medium ${status.color}`}>
          {status.text}
        </span>
        {isHovered && status.detail && (
          <span className={`text-xs ${status.color} opacity-75`}>
            ({status.detail})
          </span>
        )}
      </div>
    );
  }
  
  // Detailed mode for dashboard pages
  return (
    <div className={`rounded-lg border ${status.borderColor} ${status.bgColor} p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className={status.color}>{status.icon}</span>
          <div>
            <h3 className={`text-sm font-semibold ${status.color}`}>
              Data Sync Status
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {status.text} - {status.detail}
            </p>
          </div>
        </div>
        
        {syncStatus?.lastSync && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Last sync</p>
            <p className="text-xs font-medium text-gray-700">
              {new Date(syncStatus.lastSync).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
      
      {syncStatus?.totalSources > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Sources synced</span>
            <span className="font-medium text-gray-900">
              {syncStatus.syncedSources} / {syncStatus.totalSources}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ 
                width: `${(syncStatus.syncedSources / syncStatus.totalSources) * 100}%` 
              }}
            />
          </div>
        </div>
      )}
      
      {syncStatus?.errors && syncStatus.errors.length > 0 && (
        <div className="mt-3 p-2 bg-amber-50 rounded border border-amber-200">
          <p className="text-xs font-medium text-amber-700 mb-1">
            Recent Errors:
          </p>
          {syncStatus.errors.slice(0, 2).map((error, idx) => (
            <p key={idx} className="text-xs text-amber-600">
              • {error.source}: {error.error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default SyncStatusIndicator;