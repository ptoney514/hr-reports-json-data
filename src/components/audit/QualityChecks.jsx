import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Play, Clock } from 'lucide-react';
import dataBreakdownService from '../../services/dataBreakdownService';

const QualityChecks = ({ quarterDate = '2025-09-30' }) => {
  const [checks, setChecks] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState(null);

  useEffect(() => {
    // Load last run results from localStorage
    const savedResults = localStorage.getItem(`qualityChecks_${quarterDate}`);
    if (savedResults) {
      const { checks: savedChecks, timestamp } = JSON.parse(savedResults);
      setChecks(savedChecks);
      setLastRun(new Date(timestamp));
    }
  }, [quarterDate]);

  const runChecks = async () => {
    setIsRunning(true);

    // Simulate async checking with a small delay for UX
    await new Promise(resolve => setTimeout(resolve, 1000));

    const results = dataBreakdownService.runQualityChecks(quarterDate);
    const timestamp = new Date();

    setChecks(results);
    setLastRun(timestamp);

    // Save to localStorage
    localStorage.setItem(`qualityChecks_${quarterDate}`, JSON.stringify({
      checks: results,
      timestamp: timestamp.toISOString()
    }));

    setIsRunning(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getImpactBadge = (impact) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return colors[impact] || 'bg-gray-100 text-gray-800';
  };

  const summary = {
    total: checks.length,
    passed: checks.filter(c => c.status === 'pass').length,
    warnings: checks.filter(c => c.status === 'warning').length,
    errors: checks.filter(c => c.status === 'error').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Data Quality Checks</h3>
          <p className="text-sm text-gray-600">
            Automated validation checks for Q1 FY26 data
            {lastRun && (
              <span className="ml-2 text-gray-500">
                • Last run: {lastRun.toLocaleTimeString()} on {lastRun.toLocaleDateString()}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={runChecks}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Running...' : 'Run All Checks'}
        </button>
      </div>

      {/* Summary Cards */}
      {checks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-700 font-medium">Total Checks</div>
            <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-700 font-medium">Passed</div>
            <div className="text-2xl font-bold text-green-900">{summary.passed}</div>
            <div className="text-xs text-green-700 mt-1">
              {((summary.passed / summary.total) * 100).toFixed(0)}% success rate
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-700 font-medium">Warnings</div>
            <div className="text-2xl font-bold text-yellow-900">{summary.warnings}</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-700 font-medium">Errors</div>
            <div className="text-2xl font-bold text-red-900">{summary.errors}</div>
          </div>
        </div>
      )}

      {/* Checks List */}
      <div className="space-y-3">
        {checks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
            <Play className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 mb-4">No quality checks have been run yet</p>
            <button
              onClick={runChecks}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Run Quality Checks Now
            </button>
          </div>
        ) : (
          checks.map((check) => (
            <div
              key={check.id}
              className={`border rounded-lg p-4 ${getStatusColor(check.status)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(check.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900">{check.category}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getImpactBadge(check.impact)}`}>
                      {check.impact}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700">{check.message}</p>

                  {check.details && (
                    <div className="mt-2 p-2 bg-white/50 rounded text-xs font-mono text-gray-600">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(check.details, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">About Quality Checks</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• <strong>Grade R Inclusion:</strong> Verifies that Residents/Fellows are properly included as benefit-eligible under House Staff Physicians</li>
          <li>• <strong>Data Integrity:</strong> Ensures Faculty + Staff = Total benefit-eligible employees</li>
          <li>• <strong>Cross-Dashboard Consistency:</strong> Validates that turnover counts match exit survey denominators</li>
          <li>• <strong>Calculation Accuracy:</strong> Checks that all percentages and derived metrics are correct</li>
        </ul>
      </div>
    </div>
  );
};

export default QualityChecks;
