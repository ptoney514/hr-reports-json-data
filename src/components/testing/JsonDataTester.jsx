import React, { useState, useEffect } from 'react';
import useSimpleWorkforceData from '../../hooks/useSimpleWorkforceData';
import useSimpleTurnoverData from '../../hooks/useSimpleTurnoverData';
import useRecruitingData from '../../hooks/useRecruitingData';
import useExitSurveyData from '../../hooks/useExitSurveyData';

const JsonDataTester = () => {
  const [selectedDataType, setSelectedDataType] = useState('workforce');
  const [selectedQuarter, setSelectedQuarter] = useState('Q2-2025');
  const [directFetchData, setDirectFetchData] = useState(null);
  const [directFetchLoading, setDirectFetchLoading] = useState(false);
  const [directFetchError, setDirectFetchError] = useState(null);

  // Use all the hooks
  const workforceHook = useSimpleWorkforceData();
  const turnoverHook = useSimpleTurnoverData();
  const recruitingHook = useRecruitingData();
  const exitSurveyHook = useExitSurveyData();

  // Map data types to hooks
  const hooks = {
    workforce: workforceHook,
    turnover: turnoverHook,
    recruiting: recruitingHook,
    'exit-survey': exitSurveyHook
  };

  const currentHook = hooks[selectedDataType];

  // Quarter to date mapping
  const quarterToDate = {
    'Q2-2025': '2025-06-30',
    'Q1-2025': '2025-03-31',
    'Q4-2024': '2024-12-31',
    'Q3-2024': '2024-09-30',
    'Q2-2024': '2024-06-30'
  };

  // Test direct JSON file fetch
  useEffect(() => {
    const testDirectFetch = async () => {
      setDirectFetchLoading(true);
      setDirectFetchError(null);
      setDirectFetchData(null);

      try {
        const date = quarterToDate[selectedQuarter];
        const response = await fetch(`/data/${selectedDataType}/${date}.json`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setDirectFetchData(data);
      } catch (err) {
        setDirectFetchError(err.message);
      } finally {
        setDirectFetchLoading(false);
      }
    };

    testDirectFetch();
  }, [selectedDataType, selectedQuarter, quarterToDate]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">JSON Data Tester</h1>
      
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Type
            </label>
            <select
              value={selectedDataType}
              onChange={(e) => setSelectedDataType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="workforce">Workforce</option>
              <option value="turnover">Turnover</option>
              <option value="recruiting">Recruiting</option>
              <option value="exit-survey">Exit Survey</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quarter
            </label>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Q2-2025">Q2-2025</option>
              <option value="Q1-2025">Q1-2025</option>
              <option value="Q4-2024">Q4-2024</option>
              <option value="Q3-2024">Q3-2024</option>
              <option value="Q2-2024">Q2-2024</option>
            </select>
          </div>
        </div>
      </div>

      {/* Test Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Direct Fetch Test */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Direct JSON Fetch Test
          </h2>
          <div className="text-sm">
            <p className="mb-2">
              <span className="font-medium">URL:</span>{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">
                /data/{selectedDataType}/{quarterToDate[selectedQuarter]}.json
              </code>
            </p>
            <p className="mb-2">
              <span className="font-medium">Status:</span>{' '}
              {directFetchLoading && <span className="text-yellow-600">Loading...</span>}
              {!directFetchLoading && directFetchError && (
                <span className="text-red-600">Error: {directFetchError}</span>
              )}
              {!directFetchLoading && !directFetchError && directFetchData && (
                <span className="text-green-600">Success ✓</span>
              )}
            </p>
            {directFetchData && (
              <div className="mt-4">
                <p className="font-medium mb-2">Data Preview:</p>
                <div className="bg-gray-50 p-3 rounded max-h-64 overflow-y-auto">
                  <pre className="text-xs">{JSON.stringify(directFetchData, null, 2).slice(0, 500)}...</pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hook Test */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            React Hook Test
          </h2>
          <div className="text-sm">
            <p className="mb-2">
              <span className="font-medium">Hook:</span>{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">
                use{selectedDataType === 'exit-survey' ? 'ExitSurvey' : selectedDataType.charAt(0).toUpperCase() + selectedDataType.slice(1)}Data()
              </code>
            </p>
            <p className="mb-2">
              <span className="font-medium">Status:</span>{' '}
              {currentHook.loading && <span className="text-yellow-600">Loading...</span>}
              {!currentHook.loading && currentHook.error && (
                <span className="text-red-600">Error: {currentHook.error}</span>
              )}
              {!currentHook.loading && !currentHook.error && currentHook.data && (
                <span className="text-green-600">Success ✓</span>
              )}
            </p>
            {currentHook.data && (
              <div className="mt-4">
                <p className="font-medium mb-2">Formatted Data:</p>
                <div className="bg-gray-50 p-3 rounded max-h-64 overflow-y-auto">
                  <pre className="text-xs">{JSON.stringify(currentHook.data, null, 2).slice(0, 500)}...</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      {currentHook.data && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {selectedDataType === 'exit-survey' ? 'Exit Survey' : selectedDataType.charAt(0).toUpperCase() + selectedDataType.slice(1)} Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedDataType === 'workforce' && (
              <>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {currentHook.data.summary?.totalEmployees || 0}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Faculty</p>
                  <p className="text-2xl font-bold text-green-600">
                    {currentHook.data.summary?.faculty || 0}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Staff</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {currentHook.data.summary?.staff || 0}
                  </p>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Vacancy Rate</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {currentHook.data.summary?.vacancyRate || 0}%
                  </p>
                </div>
              </>
            )}
            
            {selectedDataType === 'turnover' && (
              <>
                <div className="bg-red-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Turnover Rate</p>
                  <p className="text-2xl font-bold text-red-600">
                    {currentHook.data.summary?.turnoverRate || 0}%
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Total Departures</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {currentHook.data.summary?.totalDepartures || 0}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Retention Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {currentHook.data.summary?.retentionRate || 0}%
                  </p>
                </div>
                <div className="bg-yellow-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Avg Tenure</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {currentHook.data.summary?.avgTenure || 0} yrs
                  </p>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* File Validation Status */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          JSON File Validation
        </h2>
        <div className="space-y-2">
          {Object.entries(quarterToDate).map(([quarter, date]) => (
            <div key={quarter} className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">
                <code className="bg-gray-100 px-2 py-1 rounded">
                  /data/{selectedDataType}/{date}.json
                </code>
              </span>
              <span className="text-sm">
                {quarter === selectedQuarter && !directFetchError ? (
                  <span className="text-green-600 font-medium">✓ Valid</span>
                ) : quarter === selectedQuarter && directFetchError ? (
                  <span className="text-red-600 font-medium">✗ Error</span>
                ) : (
                  <span className="text-gray-400">Not tested</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JsonDataTester;