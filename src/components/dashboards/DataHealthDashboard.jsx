/* eslint-disable */
/**
 * DataHealthDashboard Component
 *
 * Admin monitoring dashboard for data source health and comparison.
 * Shows current data source status, parity validation results,
 * and fallback event logs.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useDataSourceHealth, useDataSourceInfo } from '../../hooks/useHRData';
import { DataSourceStatus, DataSourceBadge } from '../ui/DataSourceIndicator';
import {
  validateAllEndpoints,
  checkCriticalParity,
  generateComparisonReport
} from '../../services/dataComparisonService';

/**
 * ValidationResultCard - Displays validation result for a single endpoint
 */
function ValidationResultCard({ name, result }) {
  const getStatusColor = () => {
    if (result.error || result.apiError) return 'border-red-200 bg-red-50';
    if (result.match) return 'border-green-200 bg-green-50';
    return 'border-yellow-200 bg-yellow-50';
  };

  const getStatusIcon = () => {
    if (result.error || result.apiError) return '⚠';
    if (result.match) return '✓';
    return '✗';
  };

  const getStatusLabel = () => {
    if (result.error || result.apiError) return 'Error';
    if (result.match) return 'Match';
    return 'Mismatch';
  };

  return (
    <div className={`rounded-lg border p-3 ${getStatusColor()}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="font-medium text-gray-900 capitalize">{name}</span>
        <span className="flex items-center gap-1 text-sm">
          <span aria-hidden="true">{getStatusIcon()}</span>
          <span>{getStatusLabel()}</span>
        </span>
      </div>

      {result.error && (
        <p className="text-xs text-red-600">{result.error}</p>
      )}

      {result.apiError && (
        <p className="text-xs text-red-600">API Error: {result.apiError}</p>
      )}

      {!result.match && result.differences && result.differences.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-600 mb-1">
            {result.differences.length} difference(s) found
          </p>
          <ul className="text-xs text-gray-500 list-disc list-inside">
            {result.differences.slice(0, 3).map((diff, i) => (
              <li key={i}>{diff.path}: {diff.type}</li>
            ))}
            {result.differences.length > 3 && (
              <li>...and {result.differences.length - 3} more</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * CriticalCheckCard - Displays a critical business rule check
 */
function CriticalCheckCard({ check }) {
  const passed = check.passed;

  return (
    <div className={`rounded-lg border p-3 ${
      passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
    }`}>
      <div className="flex justify-between items-center">
        <span className="font-medium text-gray-900">{check.name}</span>
        <span className={`text-sm ${passed ? 'text-green-600' : 'text-red-600'}`}>
          {passed ? 'Passed' : 'Failed'}
        </span>
      </div>

      {check.expected !== undefined && (
        <p className="text-xs text-gray-600 mt-1">
          Expected: {check.expected}
        </p>
      )}

      <div className="flex gap-4 mt-2 text-xs">
        {check.jsonValue !== undefined && (
          <span className="text-gray-500">
            JSON: <span className="font-mono">{check.jsonValue}</span>
          </span>
        )}
        {check.apiValue !== undefined && (
          <span className="text-gray-500">
            API: <span className="font-mono">{check.apiValue}</span>
          </span>
        )}
      </div>

      {check.error && (
        <p className="text-xs text-red-600 mt-1">{check.error}</p>
      )}
    </div>
  );
}

/**
 * DataHealthDashboard - Main dashboard component
 */
export function DataHealthDashboard() {
  const { health, loading: healthLoading } = useDataSourceHealth();
  const sourceInfo = useDataSourceInfo();

  const [validationResult, setValidationResult] = useState(null);
  const [criticalChecks, setCriticalChecks] = useState(null);
  const [validating, setValidating] = useState(false);
  const [lastValidated, setLastValidated] = useState(null);
  const [fallbackEvents, setFallbackEvents] = useState([]);

  // Run validation
  const runValidation = useCallback(async () => {
    setValidating(true);
    try {
      const [validation, critical] = await Promise.all([
        validateAllEndpoints('2025-06-30'),
        checkCriticalParity('2025-06-30')
      ]);
      setValidationResult(validation);
      setCriticalChecks(critical);
      setLastValidated(new Date());
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setValidating(false);
    }
  }, []);

  // Listen for fallback events (logged to console in production)
  useEffect(() => {
    const originalWarn = console.warn;
    const capturedEvents = [];

    console.warn = (...args) => {
      if (args[0]?.includes?.('[DataService]') && args[0]?.includes?.('fallback')) {
        capturedEvents.push({
          timestamp: new Date(),
          message: args.join(' ')
        });
        setFallbackEvents(prev => [...prev, {
          timestamp: new Date(),
          message: args.join(' ')
        }].slice(-10)); // Keep last 10
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Data Health Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor data source status and parity between JSON and API
            </p>
          </div>
          <DataSourceBadge />
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Status */}
          <DataSourceStatus />

          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Validation Summary
            </h3>
            {validationResult ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`text-sm font-medium ${
                    validationResult.allMatch ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {validationResult.allMatch ? 'All Match' : 'Issues Found'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Endpoints</span>
                  <span className="text-sm text-gray-900">
                    {validationResult.summary.matched}/{validationResult.summary.total}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Errors</span>
                  <span className={`text-sm ${
                    validationResult.summary.errors > 0 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {validationResult.summary.errors}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Run validation to see results
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Actions
            </h3>
            <button
              onClick={runValidation}
              disabled={validating}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                validating
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              aria-busy={validating}
            >
              {validating ? 'Validating...' : 'Run Validation'}
            </button>
            {lastValidated && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Last run: {lastValidated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Critical Checks */}
        {criticalChecks && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Critical Business Rules
              <span className={`ml-2 text-xs font-normal ${
                criticalChecks.allPassed ? 'text-green-600' : 'text-red-600'
              }`}>
                ({criticalChecks.allPassed ? 'All Passed' : 'Issues Found'})
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {criticalChecks.checks.map((check, i) => (
                <CriticalCheckCard key={i} check={check} />
              ))}
            </div>
          </div>
        )}

        {/* Endpoint Validation Results */}
        {validationResult && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Endpoint Parity
              <span className="text-xs font-normal text-gray-500 ml-2">
                {validationResult.timestamp}
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(validationResult.results).map(([name, result]) => (
                <ValidationResultCard key={name} name={name} result={result} />
              ))}
            </div>
          </div>
        )}

        {/* Fallback Events Log */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Fallback Events
            <span className="text-xs font-normal text-gray-500 ml-2">
              (Last 10)
            </span>
          </h3>
          {fallbackEvents.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {fallbackEvents.map((event, i) => (
                <div
                  key={i}
                  className="text-xs font-mono bg-yellow-50 border border-yellow-200 rounded p-2"
                >
                  <span className="text-yellow-600">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="text-gray-600 ml-2">{event.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No fallback events recorded. This is good - all API calls are succeeding.
            </p>
          )}
        </div>

        {/* Environment Info */}
        <div className="mt-6 text-xs text-gray-400 text-center">
          <p>
            Data Source: {sourceInfo?.source || 'unknown'} |
            API URL: {sourceInfo?.apiUrl || 'N/A'} |
            Environment: {process.env.NODE_ENV}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DataHealthDashboard;
