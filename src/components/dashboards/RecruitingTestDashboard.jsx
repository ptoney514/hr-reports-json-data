import React, { useState, useCallback, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Database,
  FileSpreadsheet,
  Download,
  Clock,
  Info,
  AlertTriangle,
  Users
} from 'lucide-react';
import {
  validateRecruitingData,
  getValidationRulesCounts,
  formatValue,
  exportResults
} from '../../services/recruitingValidationService';

/**
 * RecruitingTestDashboard
 *
 * Validation page that compares Excel data against Neon database data
 * for the Recruiting Dashboard to ensure parity.
 *
 * Validates:
 * - 7 Summary Metrics (total hires, faculty/staff, campus breakdown)
 * - 13 Pipeline Staff Metrics (myJobs pipeline data)
 * - 7 Pipeline Faculty Metrics (Interfolio pipeline data)
 * - 6 Application Sources (LinkedIn, Indeed, etc.)
 * - 10 Top Jobs (by application count)
 * - 13 Demographics (gender, ethnicity, age band)
 * - 5 Requisition Aging (0-30, 31-60, etc.)
 * - 9 Hires by School (school breakdown)
 */
const RecruitingTestDashboard = () => {
  const [validationResults, setValidationResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [lastRunTime, setLastRunTime] = useState(null);

  // Auto-run validation on mount
  useEffect(() => {
    runValidation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Run validation
  const runValidation = useCallback(async () => {
    setIsValidating(true);
    try {
      const results = await validateRecruitingData('FY2026', 1);
      setValidationResults(results);
      setLastRunTime(new Date());
    } catch (error) {
      console.error('Validation failed:', error);
    }
    setIsValidating(false);
  }, []);

  // Export results as JSON
  const handleExport = useCallback(() => {
    if (!validationResults) return;

    const json = exportResults(validationResults);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruiting-validation-${validationResults.fiscalYear}-Q${validationResults.quarter}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [validationResults]);

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'api_unavailable':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'api_missing':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  // Get status badge styles
  const getStatusBadge = (status) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'api_unavailable':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Validation table component
  const ValidationTable = ({ title, results, showApi = true }) => {
    if (!results || results.length === 0) return null;

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">
            {title} ({results.length} checks)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center justify-end gap-1">
                    <FileSpreadsheet className="h-3 w-3" />
                    Excel
                  </div>
                </th>
                {showApi && (
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-end gap-1">
                      <Database className="h-3 w-3" />
                      Neon
                    </div>
                  </th>
                )}
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result) => (
                <tr
                  key={result.id}
                  className={result.status === 'failed' ? 'bg-red-50' : ''}
                >
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {result.label}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right font-mono">
                    {formatValue(result.jsonValue, result.unit)}
                  </td>
                  {showApi && (
                    <td className="px-4 py-2 text-sm text-gray-900 text-right font-mono">
                      {result.status === 'api_missing' ? (
                        <span className="text-gray-400 text-xs">--</span>
                      ) : (
                        formatValue(result.apiValue, result.unit)
                      )}
                    </td>
                  )}
                  <td className="px-4 py-2 text-sm text-gray-500 text-right font-mono">
                    {formatValue(result.expected, result.unit)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getStatusIcon(result.status)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Count rules
  const ruleCounts = getValidationRulesCounts();

  // Tabs configuration
  const tabs = [
    { id: 'summary', label: 'Summary', count: ruleCounts.summaryMetrics },
    { id: 'pipeline-staff', label: 'Staff Pipeline', count: ruleCounts.pipelineStaff },
    { id: 'pipeline-faculty', label: 'Faculty Pipeline', count: ruleCounts.pipelineFaculty },
    { id: 'sources', label: 'App Sources', count: ruleCounts.applicationSources },
    { id: 'top-jobs', label: 'Top Jobs', count: ruleCounts.topJobs },
    { id: 'demographics', label: 'Demographics', count: ruleCounts.demographics },
    { id: 'aging', label: 'Req Aging', count: ruleCounts.requisitionAging },
    { id: 'schools', label: 'By School', count: ruleCounts.hiresBySchool },
    { id: 'mismatches', label: 'Mismatches', count: validationResults?.summary?.failedChecks || 0 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Recruiting Data Validation
                </h1>
                <p className="text-sm text-gray-500">
                  Comparing: Q1 FY2026 Excel vs Neon Database
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                disabled={!validationResults}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                onClick={runValidation}
                disabled={isValidating}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run Validation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Validation Summary Card */}
        {validationResults && (
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(validationResults.status)}`}>
                    {validationResults.status === 'passed' ? 'PASSED' :
                     validationResults.status === 'failed' ? 'FAILED' :
                     validationResults.status === 'api_unavailable' ? 'API UNAVAILABLE' :
                     validationResults.status.toUpperCase()}
                  </span>
                </div>

                {/* Last Run */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    Last Run: {lastRunTime ? lastRunTime.toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {validationResults.summary.totalChecks}
                  </div>
                  <div className="text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">
                    {validationResults.summary.passedChecks}
                  </div>
                  <div className="text-gray-500">Passed</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-red-600">
                    {validationResults.summary.failedChecks}
                  </div>
                  <div className="text-gray-500">Failed</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-600">
                    {validationResults.summary.apiMissingChecks}
                  </div>
                  <div className="text-gray-500">API Missing</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Match Rate (when API available)</span>
                <span className="font-medium">
                  {validationResults.summary.matchRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    validationResults.summary.matchRate === 100
                      ? 'bg-green-500'
                      : validationResults.summary.matchRate >= 80
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${validationResults.summary.matchRate || 0}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* API Status Warning */}
        {validationResults && !validationResults.apiAvailable && (
          <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-100">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                <strong>API Unavailable:</strong> {validationResults.apiError || 'Recruiting API endpoints not responding. Start API with: npm run api:dev'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {validationResults && (
        <div>
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <ValidationTable
              title="Summary Metrics"
              results={validationResults.results.summaryMetrics}
            />
          )}

          {/* Pipeline Staff Tab */}
          {activeTab === 'pipeline-staff' && (
            <ValidationTable
              title="Staff Pipeline Metrics (myJobs/ORC)"
              results={validationResults.results.pipelineStaff}
            />
          )}

          {/* Pipeline Faculty Tab */}
          {activeTab === 'pipeline-faculty' && (
            <ValidationTable
              title="Faculty Pipeline Metrics (Interfolio)"
              results={validationResults.results.pipelineFaculty}
            />
          )}

          {/* Application Sources Tab */}
          {activeTab === 'sources' && (
            <ValidationTable
              title="Application Sources"
              results={validationResults.results.applicationSources}
            />
          )}

          {/* Top Jobs Tab */}
          {activeTab === 'top-jobs' && (
            <ValidationTable
              title="Top 10 Jobs by Applications"
              results={validationResults.results.topJobs}
            />
          )}

          {/* Demographics Tab */}
          {activeTab === 'demographics' && (
            <ValidationTable
              title="New Hire Demographics"
              results={validationResults.results.demographics}
            />
          )}

          {/* Requisition Aging Tab */}
          {activeTab === 'aging' && (
            <ValidationTable
              title="Requisition Aging Distribution"
              results={validationResults.results.requisitionAging}
            />
          )}

          {/* Hires by School Tab */}
          {activeTab === 'schools' && (
            <ValidationTable
              title="Hires by School"
              results={validationResults.results.hiresBySchool}
            />
          )}

          {/* Mismatches Tab */}
          {activeTab === 'mismatches' && (
            <>
              {validationResults.summary.failedChecks === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-green-800">No Mismatches Found</h3>
                  <p className="text-green-700 mt-2">
                    {validationResults.apiAvailable
                      ? 'All validated metrics match between Excel and Neon database.'
                      : 'API is not available. Start API server and re-run validation.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(validationResults.results).map(([category, results]) => {
                    const mismatches = results.filter(r => r.status === 'failed');
                    if (mismatches.length === 0) return null;

                    return (
                      <div key={category} className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </h3>
                        <div className="space-y-2">
                          {mismatches.map((mismatch) => (
                            <div
                              key={mismatch.id}
                              className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                            >
                              <div>
                                <div className="font-medium text-gray-900">
                                  {mismatch.label}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Excel: <span className="font-mono">{formatValue(mismatch.jsonValue, mismatch.unit)}</span>
                                  {' | '}
                                  Neon: <span className="font-mono">{formatValue(mismatch.apiValue, mismatch.unit)}</span>
                                  {' | '}
                                  Expected: <span className="font-mono">{formatValue(mismatch.expected, mismatch.unit)}</span>
                                </div>
                              </div>
                              <XCircle className="h-5 w-5 text-red-500" />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Loading State */}
      {isValidating && !validationResults && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900">Running Validation</h3>
          <p className="text-gray-500 mt-2">Comparing Excel and Neon data sources...</p>
        </div>
      )}

      {/* Data Sources Footer */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Data Sources</h3>
        <p className="text-xs text-gray-500 mb-3">Data lineage: Excel → ETL → Neon → API → Dashboard</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 mt-0.5" />
            <div>
              <span className="font-medium">Excel:</span>{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">
                source-metrics/recruiting/Recruiting_Metrics_Master.xlsx
              </code>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Database className="h-4 w-4 text-green-500 mt-0.5" />
            <div>
              <span className="font-medium">Neon:</span>{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">
                fact_recruiting_* tables
              </code>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5" />
            <div>
              <span className="font-medium">ETL:</span>{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">
                npm run etl:recruiting
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* API Implementation Note */}
      {validationResults && !validationResults.apiAvailable && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">
                Next Steps: Enable Full Validation
              </h4>
              <ol className="text-sm text-blue-700 mt-2 list-decimal list-inside space-y-1">
                <li>Start API server: <code className="bg-blue-100 px-1 rounded">npm run api:dev</code></li>
                <li>Run ETL if needed: <code className="bg-blue-100 px-1 rounded">npm run etl:recruiting</code></li>
                <li>Re-run validation to compare Excel vs Neon</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruitingTestDashboard;
