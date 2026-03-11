import React from 'react';
import { FileText, Users, BarChart3, ThumbsUp, Star, TrendingUp, TrendingDown, AlertTriangle, Target } from 'lucide-react';
import { H1_FY26_EXIT_SURVEY_SUMMARY } from '../../data/staticData';

/**
 * FY26 H1 Exit Survey Annual Summary Dashboard
 * Combines Q1 + Q2 FY26 exit survey data into a meaningful half-year summary.
 * Static page — does NOT use useQuarter() since this is a fixed H1 summary.
 *
 * Design System Reference: docs/QUARTERLY_REPORTS_DESIGN_SYSTEM.md
 */

const data = H1_FY26_EXIT_SURVEY_SUMMARY;

// --- Reusable sub-components ---

const MetricCard = ({ icon: Icon, iconColor, value, label, subtitle }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div className="flex items-center justify-between mb-2">
      <Icon className="h-5 w-5" style={{ color: iconColor }} aria-hidden="true" />
      <span
        className="text-xs font-medium px-2 py-0.5 rounded-full"
        style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
      >
        {label}
      </span>
    </div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
  </div>
);

const HorizontalBar = ({ label, value, max, percentage, color }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-sm text-gray-700 truncate mr-2">{label}</span>
      <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
        {value} ({percentage}%)
      </span>
    </div>
    <div
      className="w-full bg-gray-100 rounded-full h-2.5"
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label}: ${percentage}%`}
    >
      <div
        className="h-2.5 rounded-full transition-all"
        style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

const DeltaArrow = ({ delta, isGood, suffix = '' }) => {
  if (delta === 0) return <span className="text-gray-400">--</span>;
  const isUp = delta > 0;
  const color = isGood === null ? '#6B7280' : isGood ? '#10B981' : '#EF4444';
  const arrow = isUp ? '\u2191' : '\u2193';
  return (
    <span className="font-semibold" style={{ color }}>
      {arrow}{Math.abs(delta)}{suffix}
    </span>
  );
};

// --- Main component ---

const ExitSurveyAnnualSummary = () => {
  const maxContributing = data.contributingReasons[0]?.count || 1;
  const BAR_COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#EC4899', '#F43F5E', '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#06B6D4', '#0EA5E9'];

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4 print:space-y-2">
      {/* Page Header */}
      <header
        className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between print:py-3"
        role="banner"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#0054A615' }}>
            <FileText className="h-8 w-8" style={{ color: '#0054A6' }} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">FY26 H1 Exit Survey Summary</h1>
            <p className="text-sm text-gray-500">Comprehensive H1 Analysis &middot; {data.dateRange}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">{data.totalExits}</div>
          <div className="text-xs text-gray-500">Total H1 Exits</div>
        </div>
      </header>

      {/* Hero Metric Cards */}
      <section aria-label="Key metrics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            icon={Users}
            iconColor="#6366F1"
            value={data.totalExits}
            label="Total Exits"
            subtitle={`${data.totalResponses} survey responses`}
          />
          <MetricCard
            icon={BarChart3}
            iconColor="#F59E0B"
            value={`${data.responseRate}%`}
            label="Response Rate"
            subtitle={`${data.totalResponses} of ${data.totalExits} exits`}
          />
          <MetricCard
            icon={ThumbsUp}
            iconColor="#10B981"
            value={`${data.wouldRecommend}%`}
            label="Would Recommend"
            subtitle={`${data.wouldRecommendCount.positive} of ${data.wouldRecommendCount.total} respondents`}
          />
          <MetricCard
            icon={Star}
            iconColor="#8B5CF6"
            value={data.overallSatisfaction.toFixed(2)}
            label="Avg Satisfaction"
            subtitle="Out of 5.0"
          />
        </div>
      </section>

      {/* Q1 vs Q2 Comparison Strip */}
      <section
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 overflow-x-auto"
        aria-label="Quarter comparison"
      >
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
          Q1 vs Q2 Comparison
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500 font-medium">Metric</th>
              <th className="text-center py-2 text-gray-500 font-medium">Q1 FY26</th>
              <th className="text-center py-2 text-gray-500 font-medium">Q2 FY26</th>
              <th className="text-center py-2 text-gray-500 font-medium">Change</th>
            </tr>
          </thead>
          <tbody>
            {data.quarterComparison.map((row) => (
              <tr key={row.metric} className="border-b border-gray-100 last:border-b-0">
                <td className="py-2 font-medium text-gray-700">{row.metric}</td>
                <td className="py-2 text-center text-gray-600">
                  {row.q1}{row.suffix || ''}
                </td>
                <td className="py-2 text-center text-gray-600">
                  {row.q2}{row.suffix || ''}
                </td>
                <td className="py-2 text-center">
                  <DeltaArrow delta={row.delta} isGood={row.isGood} suffix={row.suffix === '%' ? 'pp' : ''} />
                  {row.deltaLabel && (
                    <span className="text-xs text-gray-400 ml-1">({row.deltaLabel})</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Two-column: Departure Reasons + Satisfaction Ratings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Combined Departure Reasons */}
        <section
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          aria-label="Combined departure reasons"
        >
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
            Combined Top Departure Reasons
          </h2>
          <p className="text-xs text-gray-500 mb-3">Primary reasons from {data.totalResponses} respondents</p>
          <div className="space-y-2.5">
            {data.departureReasons.map((item, idx) => (
              <HorizontalBar
                key={item.reason}
                label={item.reason}
                value={item.count}
                max={data.departureReasons[0].count}
                percentage={item.percentage}
                color={BAR_COLORS[idx % BAR_COLORS.length]}
              />
            ))}
          </div>
        </section>

        {/* Satisfaction Ratings Q1 vs Q2 */}
        <section
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          aria-label="Satisfaction ratings comparison"
        >
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
            Satisfaction Ratings Q1 vs Q2
          </h2>
          <div className="space-y-3">
            {data.satisfactionRatings.map((cat) => {
              const diff = cat.q2 - cat.q1;
              const arrow = diff > 0 ? '\u2191' : diff < 0 ? '\u2193' : '\u2192';
              const arrowColor = diff > 0 ? '#10B981' : diff < 0 ? '#EF4444' : '#6B7280';
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                    <span className="font-semibold text-sm" style={{ color: arrowColor }}>
                      {arrow} {cat.combined.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-1 items-center">
                    {/* Q1 bar */}
                    <span className="text-xs text-gray-500 w-7">Q1</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-400"
                        style={{ width: `${(cat.q1 / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-7 text-right">{cat.q1}</span>
                  </div>
                  <div className="flex gap-1 items-center mt-0.5">
                    {/* Q2 bar */}
                    <span className="text-xs text-gray-500 w-7">Q2</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-indigo-500"
                        style={{ width: `${(cat.q2 / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-7 text-right">{cat.q2}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded bg-blue-400" /> Q1 FY26</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded bg-indigo-500" /> Q2 FY26</span>
          </div>
        </section>
      </div>

      {/* Contributing Factors - Full Width */}
      <section
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        aria-label="Combined contributing factors"
      >
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
          Combined Contributing Factors
        </h2>
        <p className="text-xs text-gray-500 mb-3">Factors contributing to departure (respondents may select multiple)</p>
        <div className="space-y-2">
          {data.contributingReasons.map((item, idx) => (
            <HorizontalBar
              key={item.reason}
              label={item.reason}
              value={item.count}
              max={maxContributing}
              percentage={item.percentage}
              color={BAR_COLORS[idx % BAR_COLORS.length]}
            />
          ))}
        </div>
      </section>

      {/* Key Themes - 3 cards */}
      <section aria-label="Key themes">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {data.themes.map((theme) => (
            <div
              key={theme.title}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="h-1.5" style={{ backgroundColor: theme.color }} />
              <div className="p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {theme.title}
                </div>
                <div className="text-sm font-bold text-gray-900 mt-0.5">{theme.subtitle}</div>
                <ul className="mt-2 space-y-1.5">
                  {theme.items.map((item, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: theme.color }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Row: Actions (2/3) + YoY Trend (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recommended Actions */}
        <section
          className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          aria-label="Recommended actions"
        >
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
            Recommended Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.recommendedActions.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-md bg-gray-50 border border-gray-100"
              >
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
                  style={{
                    backgroundColor: `${item.urgencyColor}15`,
                    color: item.urgencyColor,
                  }}
                >
                  {item.urgency}
                </span>
                <span className="text-sm text-gray-700">{item.action}</span>
              </div>
            ))}
          </div>
        </section>

        {/* H1 FY26 vs H1 FY25 Trend */}
        <section
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          aria-label="Year-over-year trends"
        >
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-500" aria-hidden="true" />
            H1 YoY Trend
          </h2>
          <div className="text-xs text-gray-500 mb-3">
            {data.yoyTrend.currentLabel} vs {data.yoyTrend.previousLabel}
          </div>
          <div className="space-y-3">
            {data.yoyTrend.metrics.map((metric) => {
              const isUp = metric.direction === 'up';
              const TrendIcon = isUp ? TrendingUp : TrendingDown;
              const trendColor = metric.isGood ? '#10B981' : '#EF4444';

              return (
                <div key={metric.label} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-700">{metric.label}</div>
                    <div className="text-xs text-gray-500">
                      {metric.previous} &rarr; {metric.current}
                    </div>
                  </div>
                  <div className="flex items-center gap-1" style={{ color: trendColor }}>
                    <TrendIcon className="h-4 w-4" aria-hidden="true" />
                    <span className="text-sm font-bold">
                      {Math.abs(metric.current - metric.previous).toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-700 print:py-1">
        Data based on {data.totalResponses} exit survey responses from {data.totalExits} separations ({data.responseRate}% response rate).
        Q1 FY26 (Jul-Sep 2025) + Q2 FY26 (Oct-Dec 2025).
      </footer>
    </div>
  );
};

export default ExitSurveyAnnualSummary;
