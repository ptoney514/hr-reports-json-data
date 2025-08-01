import React, { useState, useEffect } from 'react';
import { 
  testFirebaseConnection, 
  seedFirebaseWithSampleData, 
  checkDataIntegrity, 
  getFirebaseUsageStats 
} from '../../utils/firebaseMigration';
import { testBasicFirebaseConnection } from '../../utils/simpleFirebaseTest';
import { runFirebaseDiagnostic, checkFirebaseConfig } from '../../utils/firebaseDiagnostic';
import firebaseService from '../../services/DataService';

/**
 * Firebase Test Component
 * 
 * A test component to verify Firebase integration, run migrations,
 * and check the health of the Firebase connection.
 */
const FirebaseTestComponent = () => {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [sampleData, setSampleData] = useState(null);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const runDiagnostic = async () => {
    addLog('🔍 Running Firebase diagnostic...', 'info');
    
    try {
      // Check configuration
      const configCheck = checkFirebaseConfig();
      if (configCheck.valid) {
        addLog(`✅ Firebase config valid`, 'success');
        addLog(`📋 Project ID: ${configCheck.config.projectId}`, 'info');
        addLog(`🔑 API Key: ${configCheck.config.apiKey}`, 'info');
      } else {
        addLog(`❌ Config invalid: ${configCheck.issue}`, 'error');
        if (configCheck.error) {
          addLog(`🔍 Error: ${configCheck.error}`, 'error');
        }
        return;
      }
      
      // Run diagnostic
      const diagnostic = runFirebaseDiagnostic();
      if (diagnostic.success) {
        addLog(`✅ ${diagnostic.message}`, 'success');
        addLog(`➡️ ${diagnostic.nextStep}`, 'info');
      } else {
        addLog(`❌ Diagnostic failed: ${diagnostic.issue}`, 'error');
        if (diagnostic.guidance) {
          addLog(`💡 ${diagnostic.guidance}`, 'warning');
        }
      }
      
      setTestResults(prev => ({ ...prev, diagnostic }));
      
    } catch (error) {
      addLog(`💥 Diagnostic error: ${error.message}`, 'error');
    }
  };

  const runBasicConnectivityTest = async () => {
    setIsLoading(true);
    addLog('🔍 Testing basic Firebase connectivity...', 'info');
    
    try {
      const result = await testBasicFirebaseConnection();
      setTestResults(prev => ({ ...prev, basicConnectivity: result }));
      
      if (result.success) {
        addLog('✅ Basic Firebase connectivity test passed', 'success');
        addLog(`📄 Test data: ${result.data.message}`, 'info');
      } else {
        addLog(`❌ Basic connectivity test failed: ${result.error}`, 'error');
        if (result.guidance) {
          addLog(`💡 Guidance: ${result.guidance}`, 'warning');
        }
        if (result.code) {
          addLog(`🔍 Error code: ${result.code}`, 'info');
        }
      }
    } catch (error) {
      addLog(`💥 Basic connectivity test error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const runConnectivityTest = async () => {
    setIsLoading(true);
    addLog('🔍 Testing Firebase connectivity...', 'info');
    
    try {
      const result = await testFirebaseConnection();
      setTestResults(prev => ({ ...prev, connectivity: result }));
      
      if (result.connected) {
        addLog('✅ Firebase connectivity test passed', 'success');
      } else {
        addLog(`❌ Firebase connectivity test failed: ${result.error}`, 'error');
      }
    } catch (error) {
      addLog(`💥 Connectivity test error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const runDataSeeding = async () => {
    setIsLoading(true);
    addLog('🌱 Seeding Firebase with sample data...', 'info');
    
    try {
      const result = await seedFirebaseWithSampleData();
      setTestResults(prev => ({ ...prev, seeding: result }));
      
      if (result.errors === 0) {
        addLog(`✅ Successfully seeded ${result.seeded} data entries`, 'success');
      } else {
        addLog(`⚠️ Seeded ${result.seeded} entries with ${result.errors} errors`, 'warning');
      }
    } catch (error) {
      addLog(`💥 Data seeding error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const runIntegrityCheck = async () => {
    setIsLoading(true);
    addLog('🔍 Checking Firebase data integrity...', 'info');
    
    try {
      const result = await checkDataIntegrity();
      setTestResults(prev => ({ ...prev, integrity: result }));
      
      const healthScore = ((result.valid / result.total) * 100).toFixed(1);
      addLog(`📊 Data integrity: ${result.valid}/${result.total} valid (${healthScore}%)`, 'info');
      
      if (result.issues.length > 0) {
        addLog(`⚠️ Found ${result.issues.length} issues`, 'warning');
      }
    } catch (error) {
      addLog(`💥 Integrity check error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const testWorkforceDataRead = async () => {
    setIsLoading(true);
    addLog('📖 Testing workforce data read...', 'info');
    
    try {
      const data = await firebaseService.getWorkforceMetrics('2025-Q1');
      setSampleData(data);
      
      if (data) {
        addLog(`✅ Successfully read workforce data for 2025-Q1`, 'success');
        addLog(`📊 Total Employees: ${data.totalEmployees}`, 'info');
      } else {
        addLog('ℹ️ No workforce data found for 2025-Q1', 'warning');
      }
    } catch (error) {
      addLog(`💥 Data read error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const testRealTimeSubscription = async () => {
    setIsLoading(true);
    addLog('📡 Testing real-time subscription...', 'info');
    
    try {
      let updateReceived = false;
      
      // Set up subscription
      const unsubscribe = firebaseService.subscribeToMetrics(
        'workforce',
        '2025-Q1',
        (data) => {
          if (data) {
            updateReceived = true;
            addLog('📨 Real-time update received!', 'success');
            setSampleData(data);
          }
        }
      );
      
      // Wait a moment for subscription to be active
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Trigger an update
      const testUpdate = {
        period: '2025-Q1',
        totalEmployees: 2847,
        demographics: {
          faculty: 1200,
          staff: 1547,
          students: 100
        },
        byLocation: {
          'Main Campus': 1800,
          'Downtown': 600,
          'Phoenix Campus': 347,
          'Remote': 100
        },
        byDepartment: {
          'Engineering': 450,
          'Academic Affairs': 650,
          'Student Services': 400,
          'Administration': 300,
          'Facilities': 200,
          'Other': 847
        },
        lastUpdated: new Date(),
        testUpdate: true
      };
      
      await firebaseService.setWorkforceMetrics('2025-Q1', testUpdate);
      addLog('📝 Test update sent to Firebase', 'info');
      
      // Wait for real-time update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      unsubscribe();
      
      if (updateReceived) {
        addLog('✅ Real-time subscription working correctly', 'success');
      } else {
        addLog('⚠️ Real-time update not received', 'warning');
      }
      
    } catch (error) {
      addLog(`💥 Real-time test error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    setLogs([]);
    addLog('🚀 Starting comprehensive Firebase tests...', 'info');
    
    await runConnectivityTest();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await runDataSeeding();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testWorkforceDataRead();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testRealTimeSubscription();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await runIntegrityCheck();
    
    addLog('🎉 All tests completed!', 'success');
  };

  const getUsageStats = async () => {
    addLog('📊 Getting Firebase usage statistics...', 'info');
    
    try {
      const stats = await getFirebaseUsageStats();
      setTestResults(prev => ({ ...prev, usage: stats }));
      addLog(`📈 Cache size: ${stats.cacheSize} items`, 'info');
    } catch (error) {
      addLog(`💥 Usage stats error: ${error.message}`, 'error');
    }
  };

  useEffect(() => {
    addLog('🔧 Firebase Test Component initialized', 'info');
    
    // Run automatic diagnostic on load
    setTimeout(() => {
      runDiagnostic();
    }, 1000);
    
    getUsageStats();
  }, []);

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          🔥 Firebase Integration Test Suite
        </h1>
        
        {/* Test Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={runDiagnostic}
            disabled={isLoading}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            🔍 Diagnostic
          </button>
          
          <button
            onClick={runBasicConnectivityTest}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            🔍 Basic Test
          </button>
          
          <button
            onClick={runConnectivityTest}
            disabled={isLoading}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            🔍 Full Test
          </button>
          
          <button
            onClick={runDataSeeding}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            🌱 Seed Data
          </button>
          
          <button
            onClick={testWorkforceDataRead}
            disabled={isLoading}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            📖 Test Read
          </button>
          
          <button
            onClick={testRealTimeSubscription}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            📡 Test Real-time
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={runIntegrityCheck}
            disabled={isLoading}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            🔍 Check Integrity
          </button>
          
          <button
            onClick={getUsageStats}
            disabled={isLoading}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            📊 Usage Stats
          </button>
          
          <button
            onClick={runAllTests}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            🚀 Run All Tests
          </button>
        </div>

        {/* Test Results Summary */}
        {Object.keys(testResults).length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Test Results Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {testResults.basicConnectivity && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700">Basic Connection</h3>
                  <div className={`text-sm ${testResults.basicConnectivity.success ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.basicConnectivity.success ? '✅ Connected' : '❌ Failed'}
                  </div>
                  {testResults.basicConnectivity.data && (
                    <div className="text-xs text-gray-600">
                      {testResults.basicConnectivity.data.message}
                    </div>
                  )}
                </div>
              )}

              {testResults.connectivity && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700">Full Connectivity</h3>
                  <div className={`text-sm ${testResults.connectivity.connected ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.connectivity.connected ? '✅ Connected' : '❌ Failed'}
                  </div>
                  {testResults.connectivity.realtimeWorking !== undefined && (
                    <div className={`text-xs ${testResults.connectivity.realtimeWorking ? 'text-green-600' : 'text-yellow-600'}`}>
                      Real-time: {testResults.connectivity.realtimeWorking ? 'Working' : 'Inconclusive'}
                    </div>
                  )}
                </div>
              )}

              {testResults.seeding && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700">Data Seeding</h3>
                  <div className="text-sm text-gray-600">
                    Seeded: {testResults.seeding.seeded}
                  </div>
                  <div className="text-sm text-gray-600">
                    Errors: {testResults.seeding.errors}
                  </div>
                </div>
              )}

              {testResults.integrity && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700">Data Integrity</h3>
                  <div className="text-sm text-gray-600">
                    Valid: {testResults.integrity.valid}/{testResults.integrity.total}
                  </div>
                  <div className="text-sm text-gray-600">
                    Health: {((testResults.integrity.valid / testResults.integrity.total) * 100).toFixed(1)}%
                  </div>
                </div>
              )}

              {testResults.usage && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700">Usage Stats</h3>
                  <div className="text-sm text-gray-600">
                    Cache: {testResults.usage.cacheSize} items
                  </div>
                  <div className="text-sm text-gray-600">
                    Status: {testResults.usage.error ? 'Error' : 'OK'}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Sample Data Display */}
        {sampleData && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Sample Data</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Period:</span> {sampleData.period}
                </div>
                <div>
                  <span className="font-medium">Total Employees:</span> {sampleData.totalEmployees?.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Faculty:</span> {sampleData.demographics?.faculty?.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Staff:</span> {sampleData.demographics?.staff?.toLocaleString()}
                </div>
              </div>
              
              {sampleData.lastUpdated && (
                <div className="mt-2 text-xs text-gray-500">
                  Last Updated: {new Date(sampleData.lastUpdated.seconds * 1000).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Logs */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Test Logs</h2>
          <div className="bg-black text-white p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-400">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-400">[{log.timestamp}]</span>{' '}
                  <span className={getLogColor(log.type)}>{log.message}</span>
                </div>
              ))
            )}
            {isLoading && (
              <div className="text-yellow-400 animate-pulse">
                🔄 Running test...
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Instructions:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Click "Test Connection" to verify Firebase connectivity</li>
            <li>2. Click "Seed Data" to populate Firebase with sample data</li>
            <li>3. Click "Test Read" to verify data retrieval</li>
            <li>4. Click "Test Real-time" to verify real-time updates</li>
            <li>5. Click "Run All Tests" to execute the complete test suite</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTestComponent;