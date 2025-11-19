import React, { useState } from 'react';
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  History,
  Search,
  FileText,
  AlertTriangle,
  Activity,
  Zap,
  HardDrive,
  X,
  ChevronRight,
  FolderOpen,
  FileSpreadsheet
} from 'lucide-react';
import { useDataSync } from '../../hooks/useDataSync';
import { formatDistanceToNow } from 'date-fns';

const DataSourceAdmin = () => {
  const {
    syncStatus,
    syncSource,
    syncAll,
    checkModified,
    clearCache,
    getCachedData,
    isInitialized
  } = useDataSync();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedSources, setExpandedSources] = useState(new Set());
  const [selectedSource, setSelectedSource] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [syncingSource, setSyncingSource] = useState(null);

  // Auto-check disabled - sync is now manual-only
  // User must press "Sync All Sources" or individual "Quick Sync" buttons
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (!syncStatus.inProgress) {
  //       checkModified();
  //     }
  //   }, 30000);
  //
  //   return () => clearInterval(interval);
  // }, [checkModified, syncStatus.inProgress]);

  // Filter sources
  const filteredSources = Object.entries(syncStatus.sources || {}).filter(([key, source]) => {
    const matchesSearch = source.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || source.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get statistics
  const stats = {
    total: Object.keys(syncStatus.sources || {}).length,
    synced: Object.values(syncStatus.sources || {}).filter(s => s.status === 'synced').length,
    pending: Object.values(syncStatus.sources || {}).filter(s => s.status === 'pending').length,
    errors: syncStatus.errors?.length || 0
  };

  // Handle individual source sync
  const handleSyncSource = async (sourceKey) => {
    setSyncingSource(sourceKey);
    try {
      await syncSource(sourceKey);
    } catch (error) {
      console.error(`Failed to sync ${sourceKey}:`, error);
    } finally {
      setSyncingSource(null);
    }
  };

  // Handle sync all
  const handleSyncAll = async () => {
    try {
      await syncAll();
    } catch (error) {
      console.error('Failed to sync all sources:', error);
    }
  };

  // Get source icon
  const getSourceIcon = (source) => {
    switch (source.type) {
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
      case 'csv':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'directory':
        return <FolderOpen className="w-5 h-5 text-purple-600" />;
      default:
        return <Database className="w-5 h-5 text-gray-600" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'synced':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Synced
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Initializing data sync service...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Database className="text-blue-600 w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Data Source Management</h1>
                <p className="text-gray-600">Hybrid Smart Cache System - Real-time sync with source files</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => checkModified()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={syncStatus.inProgress}
              >
                <Activity className="w-4 h-4 mr-2" />
                Check Modified
              </button>
              
              <button
                onClick={handleSyncAll}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={syncStatus.inProgress}
              >
                {syncStatus.inProgress ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync All Sources
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Real-time Status Bar */}
          {syncStatus.inProgress && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <div className="flex items-center">
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin mr-2" />
                <span className="text-sm text-blue-700">
                  Syncing {syncStatus.currentSource || 'data sources'}...
                </span>
              </div>
              <div className="mt-2 bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(syncStatus.syncedSources / syncStatus.totalSources) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sources</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Database className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Up to Date</p>
                <p className="text-2xl font-bold text-green-600">{stats.synced}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Needs Refresh</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Sync</p>
                <p className="text-lg font-semibold text-gray-900">
                  {syncStatus.lastSync 
                    ? formatDistanceToNow(new Date(syncStatus.lastSync), { addSuffix: true })
                    : 'Never'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search sources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="workforce">Workforce</option>
              <option value="turnover">Turnover</option>
              <option value="surveys">Exit Surveys</option>
            </select>
          </div>
        </div>

        {/* Data Sources Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSources.map(([key, source]) => {
            const cachedData = getCachedData(key);
            const hasData = cachedData !== null;
            const isExpanded = expandedSources.has(key);
            const isSyncing = syncingSource === key || (syncStatus.inProgress && syncStatus.currentSource === key);

            return (
              <div key={key} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      {getSourceIcon(source)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{source.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{source.path}</p>
                      </div>
                    </div>
                    {getStatusBadge(source.status)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{source.type?.toUpperCase()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Sync:</span>
                      <span className="font-medium">
                        {source.lastSync 
                          ? formatDistanceToNow(new Date(source.lastSync), { addSuffix: true })
                          : 'Never'}
                      </span>
                    </div>

                    {hasData && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cached Records:</span>
                        <span className="font-medium">
                          {Array.isArray(cachedData) 
                            ? cachedData.length 
                            : Object.keys(cachedData).length}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleSyncSource(key)}
                      disabled={isSyncing}
                      className="flex-1 inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSyncing ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-1" />
                          Quick Sync
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedSource(key);
                        setShowHistoryModal(true);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <History className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        const newExpanded = new Set(expandedSources);
                        if (isExpanded) {
                          newExpanded.delete(key);
                        } else {
                          newExpanded.add(key);
                        }
                        setExpandedSources(newExpanded);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <ChevronRight className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && hasData && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Cache Size:</span>
                          <span className="font-medium">
                            {(JSON.stringify(cachedData).length / 1024).toFixed(2)} KB
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>File Modified:</span>
                          <span className="font-medium">
                            {source.lastModified || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {source.status === 'error' && syncStatus.errors?.find(e => e.source === key) && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                      {syncStatus.errors.find(e => e.source === key)?.error}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sync History */}
        {syncStatus.history?.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sync Activity</h2>
            <div className="space-y-2">
              {syncStatus.history.slice(-5).reverse().map((entry, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">{entry.source}</span>
                    <span className="text-sm text-gray-600">
                      {entry.recordsProcessed} records
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Modal */}
        {showHistoryModal && selectedSource && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Sync History - {syncStatus.sources[selectedSource]?.name}
                  </h3>
                  <button
                    onClick={() => {
                      setShowHistoryModal(false);
                      setSelectedSource(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 overflow-y-auto max-h-80">
                {syncStatus.history?.filter(h => h.source === selectedSource).length > 0 ? (
                  <div className="space-y-2">
                    {syncStatus.history
                      .filter(h => h.source === selectedSource)
                      .reverse()
                      .map((entry, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <div>
                              <p className="text-sm font-medium">
                                {entry.recordsProcessed} records processed
                              </p>
                              <p className="text-xs text-gray-500">
                                Status: {entry.status}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No sync history available for this source
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cache Management */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              if (window.confirm('Clear all cached data? This will require re-syncing all sources.')) {
                clearCache();
              }
            }}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700"
          >
            <HardDrive className="w-4 h-4 mr-2" />
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataSourceAdmin;