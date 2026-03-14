import React, { useState } from 'react';
import { Database, ChevronRight, ChevronDown, MessageSquareText } from 'lucide-react';
import { getExitSurveyData } from '../../services/dataService';
import { getExitSurveyVerbatim } from '../../data/exitSurveyVerbatim';
import { useQuarter } from '../../contexts/QuarterContext';

/**
 * Raw Exit Surveys Dashboard
 * Displays raw exit survey data for FY26 quarters using the global quarter context.
 * No interpretation or insights — just the data as-is from staticData.js.
 */

const FY26_QUARTERS = { '2025-09-30': 'Q1 FY26', '2025-12-31': 'Q2 FY26' };

// Normalize responseRate to a display string (handles "33%", 50, "100%", etc.)
const formatResponseRate = (rate) => {
  if (rate == null) return '—';
  if (typeof rate === 'string') return rate;
  return `${rate}%`;
};

const SectionHeading = ({ children }) => (
  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
    <ChevronRight size={18} className="text-blue-600" />
    {children}
  </h2>
);

const RawExitSurveysDashboard = () => {
  const { selectedQuarter } = useQuarter();
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const dateKey = selectedQuarter;
  const quarterLabel = FY26_QUARTERS[dateKey];
  const isFY26 = !!quarterLabel;
  const data = isFY26 ? getExitSurveyData(dateKey) : null;
  const verbatimData = isFY26 ? getExitSurveyVerbatim(dateKey) : null;

  const toggleQuestion = (questionId) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const expandAll = () => {
    if (!verbatimData) return;
    const allExpanded = {};
    verbatimData.forEach((q) => { allExpanded[q.questionId] = true; });
    setExpandedQuestions(allExpanded);
  };

  const collapseAll = () => setExpandedQuestions({});

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:bg-white print:py-0">
      <div className="max-w-7xl mx-auto px-6">

        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center gap-4">
              <Database style={{ color: '#0054A6' }} size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Raw Exit Survey Data
                </h1>
                <p className="text-gray-500 mt-1">
                  Raw exit survey data for FY26 quarters
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Panel */}
        <div>
          {!isFY26 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-12 text-center">
              <Database size={32} className="mx-auto mb-3 text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">FY26 Data Only</h2>
              <p className="text-gray-600">Raw exit survey data is available for FY26 quarters only (Q1 and Q2). Please select a FY26 quarter from the global dropdown.</p>
            </div>
          ) : !data ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center text-gray-500">
              No data available for {quarterLabel}.
            </div>
          ) : (
            <div className="space-y-8">
              {/* Response Overview */}
              <section>
                <SectionHeading>Response Overview</SectionHeading>
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-gray-100">
                    <MetricCell label="Quarter" value={data.quarter} />
                    <MetricCell label="Reporting Date" value={data.reportingDate} />
                    <MetricCell label="Total Exits" value={data.totalExits} />
                    <MetricCell label="Total Responses" value={data.totalResponses} />
                    <MetricCell label="Response Rate" value={`${data.responseRate}%`} />
                    <MetricCell label="Overall Satisfaction" value={`${data.overallSatisfaction} / 5.0`} />
                  </div>
                  <div className="border-t border-gray-100 grid grid-cols-2 md:grid-cols-3 divide-x divide-gray-100">
                    <MetricCell label="Would Recommend" value={`${data.wouldRecommend}%`} />
                    <MetricCell
                      label="Recommend Count"
                      value={`${data.wouldRecommendCount.positive} of ${data.wouldRecommendCount.total}`}
                    />
                    <MetricCell
                      label="Concerns Reported"
                      value={`${data.concernsReported.percentage}% (${data.concernsReported.count}/${data.concernsReported.total})`}
                      sublabel={data.concernsReported.description}
                    />
                  </div>
                </div>
              </section>

              {/* Satisfaction Ratings */}
              <section>
                <SectionHeading>Satisfaction Ratings</SectionHeading>
                <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Category</th>
                        <th scope="col" className="text-right px-4 py-3 font-semibold text-gray-700">Rating (out of 5.0)</th>
                        <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700 w-1/3">Visual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {Object.entries(data.satisfactionRatings).map(([key, value]) => (
                        <tr key={key} className="hover:bg-gray-50/60">
                          <td className="px-4 py-3 text-gray-800 font-medium">{formatCamelCase(key)}</td>
                          <td className="px-4 py-3 text-right font-mono text-gray-900">{value.toFixed(1)}</td>
                          <td className="px-4 py-3">
                            <RatingBar value={value} max={5} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Departure Reasons */}
              <section>
                <SectionHeading>Departure Reasons (Primary)</SectionHeading>
                <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Reason</th>
                        {data.departureReasons[0]?.count != null && (
                          <th scope="col" className="text-right px-4 py-3 font-semibold text-gray-700">Count</th>
                        )}
                        <th scope="col" className="text-right px-4 py-3 font-semibold text-gray-700">Percentage</th>
                        <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700 w-1/4">Visual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.departureReasons.map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50/60">
                          <td className="px-4 py-3 text-gray-800">{item.reason}</td>
                          {data.departureReasons[0]?.count != null && (
                            <td className="px-4 py-3 text-right font-mono text-gray-900">{item.count}</td>
                          )}
                          <td className="px-4 py-3 text-right font-mono text-gray-900">{item.percentage}%</td>
                          <td className="px-4 py-3">
                            <PercentBar value={item.percentage} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Contributing Reasons (conditional — only FY26 quarters) */}
              {data.contributingReasons && data.contributingReasons.length > 0 && (
                <section>
                  <SectionHeading>Contributing Reasons</SectionHeading>
                  <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Reason</th>
                          <th scope="col" className="text-right px-4 py-3 font-semibold text-gray-700">Count</th>
                          <th scope="col" className="text-right px-4 py-3 font-semibold text-gray-700">Percentage</th>
                          <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700 w-1/4">Visual</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data.contributingReasons.map((item, i) => (
                          <tr key={i} className="hover:bg-gray-50/60">
                            <td className="px-4 py-3 text-gray-800">{item.reason}</td>
                            <td className="px-4 py-3 text-right font-mono text-gray-900">{item.count}</td>
                            <td className="px-4 py-3 text-right font-mono text-gray-900">{item.percentage}%</td>
                            <td className="px-4 py-3">
                              <PercentBar value={item.percentage} color="#F59E0B" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Department Breakdown */}
              <section>
                <SectionHeading>Department Breakdown</SectionHeading>
                <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Department</th>
                        <th scope="col" className="text-right px-4 py-3 font-semibold text-gray-700">Exits</th>
                        <th scope="col" className="text-right px-4 py-3 font-semibold text-gray-700">Responses</th>
                        <th scope="col" className="text-right px-4 py-3 font-semibold text-gray-700">Response Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.departmentExits.map((dept, i) => (
                        <tr key={i} className="hover:bg-gray-50/60">
                          <td className="px-4 py-3 text-gray-800 font-medium">{dept.department}</td>
                          <td className="px-4 py-3 text-right font-mono text-gray-900">{dept.exits}</td>
                          <td className="px-4 py-3 text-right font-mono text-gray-900">{dept.responses}</td>
                          <td className="px-4 py-3 text-right font-mono text-gray-900">
                            {formatResponseRate(dept.responseRate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 border-t border-gray-200 font-semibold">
                        <td className="px-4 py-3 text-gray-900">Total</td>
                        <td className="px-4 py-3 text-right font-mono text-gray-900">
                          {data.departmentExits.reduce((s, d) => s + d.exits, 0)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-gray-900">
                          {data.departmentExits.reduce((s, d) => s + d.responses, 0)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-gray-900">—</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>

              {/* Demographics (conditional — Q2 FY26 only currently) */}
              {data.demographics && (
                <section>
                  <SectionHeading>Demographics</SectionHeading>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(data.demographics).map(([category, items]) => (
                      <DemographicCard key={category} title={formatCamelCase(category)} items={items} />
                    ))}
                  </div>
                </section>
              )}

              {/* Additional Metrics (conditional) */}
              {data.additionalMetrics && (
                <section>
                  <SectionHeading>Additional Metrics</SectionHeading>
                  <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-gray-100">
                      {data.additionalMetrics.hadToolsResources != null && (
                        <MetricCell label="Had Tools & Resources" value={`${data.additionalMetrics.hadToolsResources}%`} />
                      )}
                      {data.additionalMetrics.inclusiveCulture != null && (
                        <MetricCell label="Inclusive Culture" value={`${data.additionalMetrics.inclusiveCulture}%`} />
                      )}
                      {data.additionalMetrics.newPositionScope != null && (
                        <MetricCell label="New Position Scope" value={data.additionalMetrics.newPositionScope} />
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Verbatim Comments */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquareText size={18} className="text-blue-600" />
                    Verbatim Comments
                  </h2>
                  {verbatimData && (
                    <div className="flex gap-2">
                      <button
                        onClick={expandAll}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Expand All
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={collapseAll}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Collapse All
                      </button>
                    </div>
                  )}
                </div>

                {!verbatimData ? (
                  <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
                    <MessageSquareText size={24} className="mx-auto mb-2 text-gray-300" />
                    No verbatim data available for {quarterLabel}.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {verbatimData.map((question) => {
                      const isExpanded = expandedQuestions[question.questionId];
                      return (
                        <div
                          key={question.questionId}
                          className="bg-white rounded-lg shadow-sm border overflow-hidden"
                        >
                          <button
                            onClick={() => toggleQuestion(question.questionId)}
                            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
                            aria-expanded={isExpanded}
                          >
                            <div className="min-w-0">
                              <span className="block text-sm font-semibold text-gray-900 truncate">
                                Question #{question.questionId.replace('Q', '')} &mdash; {question.context}
                              </span>
                              <span className="block text-xs text-gray-500 mt-0.5">
                                {question.questionTitle} &middot; {question.responses.length} response{question.responses.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <ChevronDown
                              size={18}
                              className={`shrink-0 ml-3 text-gray-400 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {isExpanded && (
                            <div className="border-t border-gray-100 px-5 py-4">
                              <ul className="space-y-3">
                                {question.responses.map((response, idx) => (
                                  <li key={idx} className="flex gap-3 text-sm">
                                    <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center font-medium">
                                      {idx + 1}
                                    </span>
                                    <span className="text-gray-700 leading-relaxed">{response}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Data Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 text-sm text-amber-800">
                <strong>Note:</strong> This page displays raw, unprocessed data from the exit survey dataset.
                FY25 quarters do not include departure reason counts. Contributing reasons,
                demographics, and additional metrics are only available for select quarters.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

const MetricCell = ({ label, value, sublabel }) => (
  <div className="px-4 py-4">
    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
    <dd className="mt-1 text-lg font-semibold text-gray-900">{value}</dd>
    {sublabel && <dd className="mt-0.5 text-xs text-gray-500">{sublabel}</dd>}
  </div>
);

const RatingBar = ({ value, max }) => {
  const pct = (value / max) * 100;
  const hue = pct < 50 ? 0 : pct < 70 ? 35 : 200; // red → amber → blue
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: `hsl(${hue}, 70%, 50%)` }}
        />
      </div>
    </div>
  );
};

const PercentBar = ({ value, color = '#3B82F6' }) => (
  <div className="flex items-center gap-2" aria-hidden="true">
    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

const DemographicCard = ({ title, items }) => {
  // Items may use `label` or `range` or `type` as the name key
  const getName = (item) => item.label || item.range || item.type || '—';
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">{title}</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th scope="col" className="text-left px-4 py-2 text-xs font-medium text-gray-500">Value</th>
            <th scope="col" className="text-right px-4 py-2 text-xs font-medium text-gray-500">Count</th>
            <th scope="col" className="text-right px-4 py-2 text-xs font-medium text-gray-500">%</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map((item, i) => (
            <tr key={i} className="hover:bg-gray-50/60">
              <td className="px-4 py-2 text-gray-800">{getName(item)}</td>
              <td className="px-4 py-2 text-right font-mono text-gray-900">{item.count}</td>
              <td className="px-4 py-2 text-right font-mono text-gray-900">{item.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Convert camelCase key to Title Case label */
const formatCamelCase = (str) =>
  str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();

export default RawExitSurveysDashboard;
