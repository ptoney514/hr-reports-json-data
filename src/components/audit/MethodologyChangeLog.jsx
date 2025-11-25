import React, { useState } from 'react';
import { Calendar, FileText, AlertCircle, Code, GitCommit, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { METHODOLOGY_CHANGELOG } from '../../data/methodologyChangelog';

const MethodologyChangeLog = () => {
  const [expandedChange, setExpandedChange] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const filteredChanges = filterType === 'all'
    ? METHODOLOGY_CHANGELOG
    : METHODOLOGY_CHANGELOG.filter(change => change.type === filterType);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'major': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'minor': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      major: 'bg-orange-100 text-orange-800',
      minor: 'bg-blue-100 text-blue-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderDataImpact = (dataImpact) => {
    if (!dataImpact || !dataImpact.q1_fy26) return null;

    const { workforce, terminations, exitSurvey } = dataImpact.q1_fy26;

    return (
      <div className="space-y-4 mt-4">
        <h4 className="font-semibold text-gray-900">Data Impact - Q1 FY26</h4>

        {/* Workforce Impact */}
        {workforce && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">Workforce</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-blue-700">Benefit-Eligible Staff</div>
                <div className="font-semibold text-blue-900">
                  {workforce.before.benefitEligibleStaff} → {workforce.after.benefitEligibleStaff}
                  <span className={`ml-2 ${workforce.change.benefitEligibleStaff < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ({workforce.change.benefitEligibleStaff > 0 ? '+' : ''}{workforce.change.benefitEligibleStaff})
                  </span>
                </div>
              </div>
              <div>
                <div className="text-blue-700">Temporary Employees</div>
                <div className="font-semibold text-blue-900">
                  {workforce.before.temporary} → {workforce.after.temporary}
                  <span className={`ml-2 ${workforce.change.temporary > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    (+{workforce.change.temporary})
                  </span>
                </div>
              </div>
              <div className="col-span-1 md:col-span-3">
                <div className="text-blue-700 text-xs mt-1">{workforce.notes}</div>
              </div>
            </div>
          </div>
        )}

        {/* Terminations Impact */}
        {terminations && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h5 className="font-medium text-purple-900 mb-2">Terminations</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-purple-700">Total Terminations</div>
                <div className="font-semibold text-purple-900">
                  {terminations.before.total} → {terminations.after.total}
                  <span className="ml-2 text-red-600">
                    ({terminations.change.total})
                  </span>
                </div>
              </div>
              <div>
                <div className="text-purple-700">Staff Exempt</div>
                <div className="font-semibold text-purple-900">
                  {terminations.before.staffExempt} → {terminations.after.staffExempt}
                  <span className="ml-2 text-red-600">
                    ({terminations.change.staffExempt})
                  </span>
                </div>
              </div>
              <div>
                <div className="text-purple-700">End of Assignment</div>
                <div className="font-semibold text-purple-900">
                  {terminations.before.endOfAssignment} → {terminations.after.endOfAssignment}
                  <span className="ml-2 text-red-600">
                    ({terminations.change.endOfAssignment})
                  </span>
                </div>
              </div>
              <div className="col-span-1 md:col-span-3">
                <div className="text-purple-700 text-xs mt-1">{terminations.notes}</div>
              </div>
            </div>
          </div>
        )}

        {/* Exit Survey Impact */}
        {exitSurvey && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-medium text-green-900 mb-2">Exit Survey</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-green-700">Response Rate</div>
                <div className="font-semibold text-green-900">
                  {exitSurvey.before.responseRate}% → {exitSurvey.after.responseRate}%
                  <span className="ml-2 text-green-600">
                    (+{exitSurvey.change.responseRate.toFixed(1)} pts)
                  </span>
                </div>
              </div>
              <div>
                <div className="text-green-700">Total Exits</div>
                <div className="font-semibold text-green-900">
                  {exitSurvey.before.totalExits} → {exitSurvey.after.totalExits}
                  <span className="ml-2 text-red-600">
                    ({exitSurvey.change.totalExits})
                  </span>
                </div>
              </div>
              <div>
                <div className="text-green-700">Responses</div>
                <div className="font-semibold text-green-900">
                  {exitSurvey.after.responses}
                  <span className="ml-2 text-gray-600">
                    (unchanged)
                  </span>
                </div>
              </div>
              <div className="col-span-1 md:col-span-3">
                <div className="text-green-700 text-xs mt-1">{exitSurvey.notes}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Methodology Change Log</h3>
          <p className="text-sm text-gray-600">Track formula and calculation methodology changes over time</p>
        </div>

        {/* Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Changes</option>
          <option value="formula_change">Formula Changes</option>
          <option value="data_source_change">Data Source Changes</option>
          <option value="calculation_update">Calculation Updates</option>
        </select>
      </div>

      {/* Change Log Items */}
      <div className="space-y-4">
        {filteredChanges.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No methodology changes found</p>
          </div>
        ) : (
          filteredChanges.map((change) => (
            <div
              key={change.id}
              className={`border rounded-lg overflow-hidden transition-all ${
                expandedChange === change.id ? 'ring-2 ring-blue-500' : ''
              } ${getSeverityColor(change.severity)}`}
            >
              {/* Change Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50/50"
                onClick={() => setExpandedChange(expandedChange === change.id ? null : change.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">{formatDate(change.date)}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityBadge(change.severity)}`}>
                        {change.severity.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="text-base font-semibold text-gray-900 mb-1">{change.title}</h4>
                    <p className="text-sm text-gray-700">{change.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {change.affectedReports.length} reports affected
                      </span>
                      <span className="flex items-center gap-1">
                        <GitCommit className="h-3 w-3" />
                        {change.commitHash}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {expandedChange === change.id ? (
                      <TrendingUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedChange === change.id && (
                <div className="border-t border-gray-200 bg-white p-4 space-y-6">
                  {/* Formula Change */}
                  {change.formulaChange && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Formula Change
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Before */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="text-xs font-medium text-red-800 mb-2">{change.formulaChange.before.label}</div>
                          <code className="text-xs text-red-900 block font-mono bg-red-100 p-2 rounded">
                            {change.formulaChange.before.formula}
                          </code>
                          {change.formulaChange.before.issue && (
                            <div className="mt-2 text-xs text-red-700">⚠️ {change.formulaChange.before.issue}</div>
                          )}
                        </div>

                        {/* After */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="text-xs font-medium text-green-800 mb-2">{change.formulaChange.after.label}</div>
                          <div className="space-y-1">
                            {Array.isArray(change.formulaChange.after.formula) ? (
                              change.formulaChange.after.formula.map((line, idx) => (
                                <code key={idx} className="text-xs text-green-900 block font-mono bg-green-100 p-2 rounded">
                                  {line}
                                </code>
                              ))
                            ) : (
                              <code className="text-xs text-green-900 block font-mono bg-green-100 p-2 rounded">
                                {change.formulaChange.after.formula}
                              </code>
                            )}
                          </div>
                          {change.formulaChange.after.rationale && (
                            <div className="mt-2 text-xs text-green-700">✓ {change.formulaChange.after.rationale}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Data Impact */}
                  {change.dataImpact && renderDataImpact(change.dataImpact)}

                  {/* Affected Reports */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Affected Reports</h4>
                    <div className="flex flex-wrap gap-2">
                      {change.affectedReports.map((report, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {report}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Validation */}
                  {change.validation && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Validation
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {change.validation.checks?.map((check, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{check}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Documentation Link */}
                  {change.documentation && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Documentation: {change.documentation}</span>
                      <a
                        href={`/${change.documentation}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Full Details →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {filteredChanges.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{filteredChanges.length}</div>
              <div className="text-xs text-gray-600">Total Changes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {filteredChanges.filter(c => c.severity === 'critical').length}
              </div>
              <div className="text-xs text-gray-600">Critical</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {filteredChanges.filter(c => c.severity === 'major').length}
              </div>
              <div className="text-xs text-gray-600">Major</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredChanges.filter(c => c.severity === 'minor').length}
              </div>
              <div className="text-xs text-gray-600">Minor</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MethodologyChangeLog;
