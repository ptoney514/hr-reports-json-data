import React, { useState } from 'react';
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Database,
  Calendar,
  History,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
  X
} from 'lucide-react';
import dataSourceRegistry from '../../data/dataSourceRegistry.json';
import {
  getFileStatus,
  formatDate,
  getFileTypeIcon,
  getDaysSinceRefresh,
  getRefreshFrequencyLabel,
  isRefreshRecommended,
  groupSourcesByCategory
  // getCategoryStats // Commented out - will use later
} from '../../utils/dataSourceMonitor';

const DataSourceAdmin = () => {
  const [sources, setSources] = useState(dataSourceRegistry.sources || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedSources, setExpandedSources] = useState(new Set());
  const [refreshHistory, setRefreshHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(dataSourceRegistry.metadata?.lastScan);

  // Filter sources based on search and category
  const filteredSources = sources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          source.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || source.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group sources by category
  const groupedSources = groupSourcesByCategory(filteredSources);
  // const categoryStats = getCategoryStats(sources); // Commented out - will use later

  // Toggle source expansion
  const toggleSourceExpansion = (sourceId) => {
    const newExpanded = new Set(expandedSources);
    if (newExpanded.has(sourceId)) {
      newExpanded.delete(sourceId);
    } else {
      newExpanded.add(sourceId);
    }
    setExpandedSources(newExpanded);
  };

  // Handle individual source refresh
  const handleRefreshSource = async (sourceId) => {
    setIsRefreshing(true);
    try {
      // Simulate refresh process
      console.log(`Refreshing source: ${sourceId}`);
      
      // Update source status
      const updatedSources = sources.map(source => {
        if (source.id === sourceId) {
          return {
            ...source,
            lastRefreshed: new Date().toISOString(),
            status: 'up-to-date'
          };
        }
        return source;
      });
      
      setSources(updatedSources);
      
      // Add to refresh history
      const historyEntry = {
        sourceId,
        timestamp: new Date().toISOString(),
        action: 'manual-refresh',
        changes: [],
        user: 'Admin'
      };
      
      setRefreshHistory([historyEntry, ...refreshHistory]);
      
    } catch (error) {
      console.error('Error refreshing source:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle bulk refresh
  const handleBulkRefresh = async () => {
    const sourcesToRefresh = sources.filter(isRefreshRecommended);
    if (sourcesToRefresh.length === 0) {
      alert('No sources need refreshing');
      return;
    }
    
    setIsRefreshing(true);
    try {
      for (const source of sourcesToRefresh) {
        await handleRefreshSource(source.id);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Scan for file changes
  const handleScanFiles = async () => {
    setIsRefreshing(true);
    try {
      console.log('Scanning source files for changes...');
      
      // Update last scan time
      setLastScanTime(new Date().toISOString());
      
      // In production, this would call a backend API to scan files
      // For now, we'll simulate the process
      const updatedSources = sources.map(source => ({
        ...source,
        lastModified: new Date().toISOString()
      }));
      
      setSources(updatedSources);
      
    } catch (error) {
      console.error('Error scanning files:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Show refresh history modal
  const showHistory = (source) => {
    setSelectedSource(source);
    setShowHistoryModal(true);
  };

  // Get status badge component
  const StatusBadge = ({ source }) => {
    const status = getFileStatus(source);
    const icons = {
      'up-to-date': <CheckCircle size={16} />,
      'changed': <AlertCircle size={16} />,
      'refresh-due': <Clock size={16} />,
      'never-refreshed': <AlertTriangle size={16} />,
      'pending-scan': <Clock size={16} />
    };
    
    const colors = {
      'green': 'bg-green-100 text-green-800 border-green-200',
      'orange': 'bg-orange-100 text-orange-800 border-orange-200',
      'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'gray': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${colors[status.color]}`}>
        {icons[status.status]}
        {status.label}
      </span>
    );
  };

  // Get overview statistics
  const getOverviewStats = () => {
    const total = sources.length;
    const upToDate = sources.filter(s => getFileStatus(s).status === 'up-to-date').length;
    const needsRefresh = sources.filter(isRefreshRecommended).length;
    const neverRefreshed = sources.filter(s => !s.lastRefreshed).length;
    
    return { total, upToDate, needsRefresh, neverRefreshed };
  };

  const stats = getOverviewStats();

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Data Source Management</h1>
        <p className="text-gray-600">Track and manage source data files with version control and refresh history</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sources</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Database className="text-blue-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Up to Date</p>
              <p className="text-2xl font-bold text-green-600">{stats.upToDate}</p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Needs Refresh</p>
              <p className="text-2xl font-bold text-orange-600">{stats.needsRefresh}</p>
            </div>
            <AlertCircle className="text-orange-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Scan</p>
              <p className="text-sm font-semibold text-gray-900">
                {lastScanTime ? formatDate(lastScanTime).split(',')[0] : 'Never'}
              </p>
            </div>
            <Clock className="text-gray-500" size={32} />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="workforce">Workforce</option>
              <option value="turnover">Turnover</option>
              <option value="exit-surveys">Exit Surveys</option>
              <option value="hr-slides">HR Slides</option>
            </select>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleScanFiles}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search size={16} />
              Scan Files
            </button>
            
            <button
              onClick={handleBulkRefresh}
              disabled={isRefreshing || stats.needsRefresh === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              Bulk Refresh ({stats.needsRefresh})
            </button>
          </div>
        </div>
      </div>

      {/* Sources List by Category */}
      <div className="space-y-6">
        {Object.entries(groupedSources).map(([category, categorySources]) => (
          <div key={category} className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {category.replace('-', ' ')} ({categorySources.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {categorySources.map(source => {
                const isExpanded = expandedSources.has(source.id);
                const daysSince = getDaysSinceRefresh(source.lastRefreshed);
                
                return (
                  <div key={source.id} className="p-6">
                    {/* Main Source Row */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleSourceExpansion(source.id)}
                            className="mt-1 text-gray-500 hover:text-gray-700"
                          >
                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </button>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">{getFileTypeIcon(source.type)}</span>
                              <h3 className="text-base font-semibold text-gray-900">{source.name}</h3>
                              <StatusBadge source={source} />
                              <span className="text-xs text-gray-500">v{source.currentVersion}</span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">{source.description}</p>
                            
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                Last Refreshed: {formatDate(source.lastRefreshed)}
                                {daysSince !== null && ` (${daysSince} days ago)`}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                Frequency: {getRefreshFrequencyLabel(source.refreshFrequency)}
                              </span>
                              <span>Owner: {source.owner}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => showHistory(source)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="View History"
                        >
                          <History size={18} />
                        </button>
                        <button
                          onClick={() => handleRefreshSource(source.id)}
                          disabled={isRefreshing}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                          title="Refresh Source"
                        >
                          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 ml-8 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">File Information</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Path:</span>
                                <span className="font-mono text-xs text-gray-900">{source.path}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Last Modified:</span>
                                <span className="text-gray-900">{formatDate(source.lastModified)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">File Hash:</span>
                                <span className="font-mono text-xs text-gray-900">
                                  {source.lastHash ? source.lastHash.substring(0, 12) + '...' : 'Not calculated'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Data Outputs</h4>
                            <div className="space-y-1">
                              {source.dataOutputs.map((output, idx) => (
                                <div key={idx} className="text-sm text-gray-600 flex items-center gap-1">
                                  <ExternalLink size={12} />
                                  <span className="font-mono text-xs">{output}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {source.notes && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">Notes</h4>
                            <p className="text-sm text-gray-600">{source.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* History Modal */}
      {showHistoryModal && selectedSource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Refresh History: {selectedSource.name}
                </h3>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {refreshHistory.filter(h => h.sourceId === selectedSource.id).length > 0 ? (
                <div className="space-y-4">
                  {refreshHistory
                    .filter(h => h.sourceId === selectedSource.id)
                    .map((entry, idx) => (
                      <div key={idx} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {entry.action === 'manual-refresh' ? 'Manual Refresh' : 'Auto Refresh'}
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(entry.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-600">Initiated by: {entry.user}</p>
                        {entry.changes && entry.changes.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-semibold text-gray-700">Changes:</p>
                            <ul className="text-xs text-gray-600 mt-1">
                              {entry.changes.map((change, i) => (
                                <li key={i}>• {change}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No refresh history available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSourceAdmin;