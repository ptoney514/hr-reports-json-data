import { useState, useEffect } from 'react';
import { 
  Database, 
  Upload, 
  Download, 
  RefreshCw, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Eye,
  Trash2,
  ExternalLink,
  Zap,
  BarChart3,
  UserPlus,
  Users
} from 'lucide-react';
import DataMigrationService from '../../../services/migration/json-to-pocketbase.js';
import pocketBaseDataService from '../../../core/services/pocketbase-data.service.js';
import { usePocketBaseHealth, usePocketBaseCache } from '../../../shared/hooks/useDashboardDataPB.js';
import SuperUserCreator from './SuperUserCreator.jsx';

/**
 * Comprehensive PocketBase Administration Component
 * Provides tools for managing PocketBase data, monitoring health, and performing migrations
 */
const PocketBaseAdmin = () => {
  const [migrationStatus, setMigrationStatus] = useState('idle');
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationMessage, setMigrationMessage] = useState('');
  const [migrationStats, setMigrationStats] = useState(null);
  const [collections, setCollections] = useState([]);
  const [collectionStats, setCollectionStats] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [showBootstrap, setShowBootstrap] = useState(false);
  
  // Use custom hooks for health and cache management
  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = usePocketBaseHealth();
  const { clearAllCache, getCacheStats, serviceCache } = usePocketBaseCache();

  // Load initial data
  useEffect(() => {
    loadCollectionStats();
  }, []);

  /**
   * Load collection statistics
   */
  const loadCollectionStats = async () => {
    try {
      const migrationService = new DataMigrationService();
      const [collectionList, stats] = await Promise.all([
        migrationService.listCollections(),
        migrationService.getCollectionStats()
      ]);
      
      setCollections(collectionList);
      setCollectionStats(stats);
    } catch (error) {
      console.error('Error loading collection stats:', error);
    }
  };

  /**
   * Open PocketBase Admin UI in new tab
   */
  const openPocketBaseAdmin = () => {
    window.open('http://localhost:8091/_/', '_blank');
  };

  /**
   * Handle superuser creation success
   */
  const handleSuperUserSuccess = (email, password) => {
    setMigrationMessage(`Successfully created admin user: ${email}`);
    setTimeout(() => {
      setMigrationMessage('');
      setShowBootstrap(false);
      setActiveTab('overview');
    }, 3000);
  };

  /**
   * Handle superuser creation error
   */
  const handleSuperUserError = (error) => {
    setMigrationMessage(`Error creating admin user: ${error}`);
  };

  /**
   * Run full JSON to PocketBase migration
   */
  const runMigration = async () => {
    setMigrationStatus('running');
    setMigrationProgress(0);
    setMigrationMessage('Initializing migration...');
    setMigrationStats(null);

    try {
      const migrationService = new DataMigrationService();
      
      // Test connection first
      const connectionTest = await migrationService.testConnection();
      if (!connectionTest.success) {
        throw new Error(`Connection failed: ${connectionTest.message}`);
      }

      // Run migration with progress callback
      const stats = await migrationService.migrateAll((progress) => {
        setMigrationProgress(progress.progress || 0);
        setMigrationMessage(progress.message || '');
      });

      setMigrationStats(stats);
      setMigrationStatus('completed');
      setMigrationMessage('Migration completed successfully!');
      
      // Refresh collection stats and health
      await loadCollectionStats();
      refetchHealth();

    } catch (error) {
      setMigrationStatus('error');
      setMigrationMessage(error.message);
      console.error('Migration failed:', error);
    }
  };

  /**
   * Clear all caches
   */
  const handleClearCache = async () => {
    try {
      clearAllCache();
      
      // Also clear PocketBase service cache
      pocketBaseDataService.clearCache();
      
      setMigrationMessage('All caches cleared successfully');
      setTimeout(() => setMigrationMessage(''), 3000);
    } catch (error) {
      setMigrationMessage(`Error clearing cache: ${error.message}`);
      console.error('Cache clear error:', error);
    }
  };

  /**
   * Force refresh health status
   */
  const handleRefreshHealth = async () => {
    await refetchHealth();
    await loadCollectionStats();
  };

  /**
   * Export data backup (placeholder - would implement full backup)
   */
  const handleExportBackup = () => {
    setMigrationMessage('Backup export feature coming soon...');
    setTimeout(() => setMigrationMessage(''), 3000);
  };

  // Render health status indicator
  const renderHealthStatus = () => {
    if (healthLoading) {
      return (
        <div className="flex items-center gap-2 text-gray-500">
          <RefreshCw className="animate-spin" size={16} />
          <span>Checking...</span>
        </div>
      );
    }

    if (!healthData) {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle size={16} />
          <span>Unknown Status</span>
        </div>
      );
    }

    if (healthData.status === 'healthy') {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle size={16} />
          <span>Healthy (Public Access)</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle size={16} />
        <span>Unhealthy: {healthData.error}</span>
      </div>
    );
  };

  // Render migration progress
  const renderMigrationProgress = () => {
    if (migrationStatus === 'idle') return null;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Migration Progress</span>
          <span className="text-sm text-gray-600">{migrationProgress}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              migrationStatus === 'error' ? 'bg-red-500' : 
              migrationStatus === 'completed' ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${migrationProgress}%` }}
          ></div>
        </div>
        
        {migrationMessage && (
          <p className={`text-sm ${
            migrationStatus === 'error' ? 'text-red-600' : 
            migrationStatus === 'completed' ? 'text-green-600' : 'text-gray-600'
          }`}>
            {migrationMessage}
          </p>
        )}

        {migrationStats && (
          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-green-600">
                {migrationStats.workforce.success}
              </div>
              <div className="text-gray-500">Workforce</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-green-600">
                {migrationStats.turnover.success}
              </div>
              <div className="text-gray-500">Turnover</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-green-600">
                {migrationStats.exitSurvey.success}
              </div>
              <div className="text-gray-500">Exit Survey</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Check if we should show bootstrap mode based on health status
  const shouldShowBootstrap = healthData && !healthData.initialized && !showBootstrap;

  // Render tab navigation
  const renderTabNav = () => (
    <div className="flex border-b mb-6">
      <button
        onClick={() => setActiveTab('overview')}
        className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
      >
        Overview
      </button>
      <button
        onClick={() => setActiveTab('superuser')}
        className={`px-4 py-2 font-medium ${activeTab === 'superuser' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
      >
        <Users className="inline mr-2" size={16} />
        Create Admin
      </button>
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="text-blue-600" size={24} />
          <div>
            <h2 className="text-xl font-bold">PocketBase Data Management</h2>
            <p className="text-sm text-gray-600">Monitor health, manage data, and perform migrations</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('superuser')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <UserPlus size={16} />
            Create Admin
          </button>
          <button
            onClick={openPocketBaseAdmin}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <ExternalLink size={16} />
            Open Admin UI
          </button>
        </div>
      </div>

      {/* Bootstrap Alert */}
      {shouldShowBootstrap && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle size={20} />
            <span className="font-medium">Setup Required</span>
          </div>
          <p className="text-yellow-700 mt-1">
            No admin users found. You need to create a superuser to access the PocketBase Admin UI.
          </p>
          <button
            onClick={() => setActiveTab('superuser')}
            className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
          >
            Create Admin User
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      {renderTabNav()}

      {/* Tab Content */}
      {activeTab === 'superuser' ? (
        <div className="mb-6">
          <SuperUserCreator 
            onSuccess={handleSuperUserSuccess}
            onError={handleSuperUserError}
          />
        </div>
      ) : (
        <>
          {/* Health Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="text-blue-600" size={20} />
            <span className="font-medium">Service Health</span>
          </div>
          <div className="flex items-center gap-3">
            {renderHealthStatus()}
            <button
              onClick={handleRefreshHealth}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
        
        {healthData && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Initialized</div>
              <div className="font-medium">
                {healthData.initialized ? 'Yes' : 'No'}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Cache Size</div>
              <div className="font-medium">
                {healthData.cacheSize || 0} items
              </div>
            </div>
            <div>
              <div className="text-gray-500">Subscriptions</div>
              <div className="font-medium">
                {healthData.subscriptions?.length || 0} active
              </div>
            </div>
            <div>
              <div className="text-gray-500">Collections</div>
              <div className="font-medium">
                {collections.length} found
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Collection Statistics */}
      {collections.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <BarChart3 size={18} />
            Collection Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <div key={collection.name} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{collection.name}</span>
                  <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                    {collection.type}
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {collectionStats[collection.name] || 0}
                </div>
                <div className="text-sm text-gray-500">records</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Zap size={18} />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={runMigration}
            disabled={migrationStatus === 'running'}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {migrationStatus === 'running' ? (
              <RefreshCw className="animate-spin" size={16} />
            ) : (
              <Upload size={16} />
            )}
            <span className="text-sm">
              {migrationStatus === 'running' ? 'Migrating...' : 'Migrate Data'}
            </span>
          </button>

          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Download size={16} />
            <span className="text-sm">Export Backup</span>
          </button>

          <button
            onClick={handleClearCache}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
          >
            <Trash2 size={16} />
            <span className="text-sm">Clear Cache</span>
          </button>

          <button
            onClick={handleRefreshHealth}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            <RefreshCw size={16} />
            <span className="text-sm">Refresh Status</span>
          </button>
        </div>
      </div>

      {/* Migration Progress */}
      {renderMigrationProgress()}

      {/* Information Panel */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <Eye className="text-blue-600 mt-0.5" size={16} />
          <div className="text-sm text-blue-700">
            <strong>PocketBase Admin Features:</strong>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>View and edit data directly in collections</li>
              <li>Manage schema and field configurations</li>
              <li>Monitor real-time connections and subscriptions</li>
              <li>Set up automated backups and API rules</li>
              <li>Access logs and performance metrics</li>
            </ul>
            
            <div className="mt-3">
              <strong>URLs:</strong>
              <div className="mt-1">
                <div>• Admin UI: <code>http://localhost:8091/_/</code></div>
                <div>• API Health: <code>http://localhost:8091/api/health</code></div>
                <div>• Collections: <code>http://localhost:8091/_/#/collections</code></div>
              </div>
            </div>
          </div>
        </div>
      </div>

          {/* Cache Information */}
          <div className="mt-4 text-xs text-gray-500">
            Service Cache: {serviceCache.size} items | 
            React Query Cache: Available via DevTools
          </div>
        </>
      )}
    </div>
  );
};

export default PocketBaseAdmin;