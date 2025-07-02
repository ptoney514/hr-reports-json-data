import React, { useState } from 'react';
import { Database, CheckCircle, XCircle, Info, RefreshCw } from 'lucide-react';

const DatabaseTestComponent = () => {
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const runDatabaseTest = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Dynamic import to avoid build issues
      const { testDatabaseSetup } = await import('../../database/testDatabase.js');
      console.log('Running database test...');
      const results = await testDatabaseSetup();
      setTestResults(results);
    } catch (err) {
      setError(err.message);
      console.error('Database test error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (success) => {
    if (success) {
      return <CheckCircle className="text-green-500" size={20} />;
    }
    return <XCircle className="text-red-500" size={20} />;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Database Test Suite</h2>
          <button
            onClick={runDatabaseTest}
            disabled={isLoading}
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={isLoading ? 'animate-spin' : ''} size={16} />
            {isLoading ? 'Testing...' : 'Run Test'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <XCircle className="text-red-500" size={20} />
              <span className="text-red-700 font-medium">Test Error</span>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        )}

        {testResults && (
          <div className="space-y-4">
            <div className={`${testResults.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.success)}
                <span className={`font-medium ${testResults.success ? 'text-green-700' : 'text-red-700'}`}>
                  {testResults.message}
                </span>
              </div>
              {testResults.error && (
                <p className="text-red-600 mt-2">{testResults.error}</p>
              )}
            </div>

            {testResults.success && testResults.details && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Info size={16} />
                  Test Results
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Workforce Data:</span>
                    <div className={`font-medium ${testResults.details.workforceDataAvailable ? 'text-green-600' : 'text-red-600'}`}>
                      {testResults.details.workforceDataAvailable ? 'Available' : 'Missing'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Turnover Data:</span>
                    <div className={`font-medium ${testResults.details.turnoverDataAvailable ? 'text-green-600' : 'text-red-600'}`}>
                      {testResults.details.turnoverDataAvailable ? 'Available' : 'Missing'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">What This Test Validates:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Database initialization and connection</li>
            <li>• Data integrity and structure validation</li>
            <li>• CRUD operations functionality</li>
            <li>• Migration system readiness</li>
            <li>• Backup and recovery capabilities</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DatabaseTestComponent; 