import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Activity } from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';
import useWorkforceData from '../../hooks/useWorkforceData';
import useTurnoverData from '../../hooks/useTurnoverData';

const HooksTestComponent = () => {
  const { actions } = useDashboard();
  const [expandedSections, setExpandedSections] = useState({
    workforce: true,
    turnover: true
  });

  const [selectedQuarter, setSelectedQuarter] = useState('Q3-2024');
  const [refreshKey, setRefreshKey] = useState(0);

  // Update dashboard context when quarter changes
  useEffect(() => {
    if (actions && actions.setReportingPeriod) {
      actions.setReportingPeriod(selectedQuarter);
    }
  }, [selectedQuarter, actions]);

  // Test all three hooks
  // useWorkforceData accepts customFilters parameter
  const workforceHook = useWorkforceData({ reportingPeriod: selectedQuarter });
  // useTurnoverData accepts customFilters parameter  
  const turnoverHook = useTurnoverData({ fiscalYear: 'FY2024' });
  // Use test version that accepts quarter parameter directly

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const renderHookStatus = (hook, name) => {
    const { loading, error, data } = hook;
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection(name.toLowerCase())}
        >
          <div className="flex items-center space-x-3">
            {expandedSections[name.toLowerCase()] ? 
              <ChevronDown className="h-5 w-5 text-gray-500" /> : 
              <ChevronRight className="h-5 w-5 text-gray-500" />
            }
            <h3 className="text-lg font-semibold">{name} Hook</h3>
            <div className="flex items-center space-x-2">
              {loading && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              )}
              {!loading && !error && data && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Ready</span>
                </div>
              )}
              {error && (
                <div className="flex items-center space-x-1 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm">Error</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {data && (
              <>
                <span className="flex items-center space-x-1">
                  <Database className="h-4 w-4" />
                  <span>{Array.isArray(data) ? data.length : Object.keys(data).length} items</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Activity className="h-4 w-4" />
                  <span>{loading ? 'Fetching...' : 'Idle'}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {expandedSections[name.toLowerCase()] && (
          <div className="border-t border-gray-200 p-4">
            <div className="space-y-3">
              {/* Hook State Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</div>
                  <div className="font-medium">
                    {loading ? 'Loading' : error ? 'Error' : data ? 'Success' : 'No Data'}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Data Type</div>
                  <div className="font-medium">
                    {data ? (Array.isArray(data) ? 'Array' : typeof data) : 'None'}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Record Count</div>
                  <div className="font-medium">
                    {data ? (Array.isArray(data) ? data.length : Object.keys(data).length) : 0}
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-red-900">Error Details</div>
                      <div className="text-sm text-red-700 mt-1">{error.message || error}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Preview */}
              {data && (
                <div className="space-y-2">
                  <div className="font-medium text-sm text-gray-700">Data Preview</div>
                  <div className="bg-gray-50 rounded-lg p-3 overflow-x-auto">
                    <pre className="text-xs text-gray-600">
                      {JSON.stringify(
                        Array.isArray(data) 
                          ? data.slice(0, 3).map(item => ({
                              ...item,
                              _preview: '...(truncated)'
                            }))
                          : Object.fromEntries(
                              Object.entries(data).slice(0, 3).map(([k, v]) => [
                                k, 
                                typeof v === 'object' ? {...v, _preview: '...(truncated)'} : v
                              ])
                            ),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  {Array.isArray(data) && data.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      ... and {data.length - 3} more records
                    </div>
                  )}
                </div>
              )}

              {/* Hook-Specific Details */}
              {name === 'Workforce' && data && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-blue-900 mb-2">Workforce Data Details</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-blue-700">Data Structure:</span>{' '}
                      <span className="font-medium">
                        {data.currentPeriod ? 'Dashboard Format' : 'Raw Array'}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Period Data:</span>{' '}
                      <span className="font-medium">
                        {data.currentPeriod ? 'Available' : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Has Filters:</span>{' '}
                      <span className="font-medium">
                        {hook.filters ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Cache Status:</span>{' '}
                      <span className="font-medium">
                        {hook.cached ? 'Cached' : 'Fresh'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {name === 'Turnover' && data && (
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-purple-900 mb-2">Turnover Data Details</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-purple-700">Data Type:</span>{' '}
                      <span className="font-medium">
                        {data.metrics ? 'Dashboard Format' : 'Raw Array'}
                      </span>
                    </div>
                    <div>
                      <span className="text-purple-700">Metrics:</span>{' '}
                      <span className="font-medium">
                        {data.metrics ? 'Available' : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-purple-700">Trends Data:</span>{' '}
                      <span className="font-medium">
                        {data.trends ? 'Available' : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-purple-700">Has Benchmarks:</span>{' '}
                      <span className="font-medium">
                        {hook.benchmarks ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">JSON Data Hooks Test Component (Hot Reload Working!)</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive testing interface for useWorkforceData and useTurnoverData hooks
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Q2-2024">2024 Q2</option>
                <option value="Q3-2024">2024 Q3</option>
                <option value="Q4-2024">2024 Q4</option>
                <option value="Q1-2025">2025 Q1</option>
                <option value="Q2-2025">2025 Q2</option>
              </select>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh All</span>
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Total Hooks</div>
                  <div className="text-2xl font-bold">3</div>
                </div>
                <Database className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Active Quarter</div>
                  <div className="text-2xl font-bold">{selectedQuarter}</div>
                </div>
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="text-2xl font-bold text-green-600">
                    {workforceHook.loading || turnoverHook.loading 
                      ? 'Loading' 
                      : 'Ready'}
                  </div>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Hook Test Results */}
        <div className="space-y-4">
          {renderHookStatus(workforceHook, 'Workforce')}
          {renderHookStatus(turnoverHook, 'Turnover')}
        </div>

        {/* Debug Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
          <div className="space-y-2 text-sm font-mono">
            <div>
              <span className="text-gray-600">Current Quarter:</span>{' '}
              <span className="text-gray-900">{selectedQuarter}</span>
            </div>
            <div>
              <span className="text-gray-600">Refresh Key:</span>{' '}
              <span className="text-gray-900">{refreshKey}</span>
            </div>
            <div>
              <span className="text-gray-600">Data Path Format:</span>{' '}
              <span className="text-gray-900">/public/data/[type]/[date].json</span>
            </div>
            <div>
              <span className="text-gray-600">Example:</span>{' '}
              <span className="text-gray-900">/public/data/workforce/2024-09-30.json (for Q3-2024)</span>
            </div>
            <div>
              <span className="text-gray-600">Hook Types:</span>{' '}
              <span className="text-gray-900">workforce, turnover</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HooksTestComponent;