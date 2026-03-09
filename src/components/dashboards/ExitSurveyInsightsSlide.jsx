import React from 'react';
import { Users, DollarSign, Clock, ThumbsUp, TrendingUp, TrendingDown, AlertTriangle, Target } from 'lucide-react';
import { getExitSurveyData } from '../../services/dataService';
import { useQuarter } from '../../contexts/QuarterContext';
import NoDataForQuarter from '../ui/NoDataForQuarter';

/**
 * Exit Survey Insights Slide
 * Narrative insights page showing combined exit reasons, key themes,
 * recommended actions with urgency, and quarter-over-quarter trends.
 *
 * Design System Reference: docs/QUARTERLY_REPORTS_DESIGN_SYSTEM.md
 */

const REASON_COLORS = ['#F97316', '#3B82F6', '#14B8A6', '#F59E0B', '#8B5CF6'];

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

const ExitSurveyInsightsSlide = () => {
  const { selectedQuarter, quarterConfig } = useQuarter();
  const surveyData = getExitSurveyData(selectedQuarter);

  if (!surveyData?.insights) {
    return <NoDataForQuarter dataLabel="Exit survey insights" />;
  }

  const { insights } = surveyData;
  const quarterLabel = surveyData.quarter || quarterConfig?.label || '';
  const dateRange = quarterConfig?.dateRange || '';

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4 print:space-y-2">
      {/* Dark Navy Header */}
      <header
        className="bg-[#1e293b] text-white rounded-lg px-6 py-4 flex items-center justify-between print:py-3"
        role="banner"
      >
        <h1 className="text-xl font-bold">Exit Survey Insights</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-300">{quarterLabel} {dateRange}</span>
          <span className="text-gray-400">Creighton University / HR</span>
        </div>
      </header>

      {/* Hero Metric Cards */}
      <section aria-label="Key metrics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            icon={Users}
            iconColor="#6366F1"
            value={surveyData.totalExits}
            label="Total Sep"
            subtitle={`${surveyData.totalResponses} survey responses`}
          />
          <MetricCard
            icon={DollarSign}
            iconColor="#EF4444"
            value={`${insights.compAsFactor}%`}
            label="Comp Factor"
            subtitle={insights.compAsFactorDetail}
          />
          <MetricCard
            icon={Clock}
            iconColor="#F59E0B"
            value={insights.avgTenureBucket}
            label="Avg Tenure"
            subtitle={insights.avgTenureDetail}
          />
          <MetricCard
            icon={ThumbsUp}
            iconColor="#10B981"
            value={`${surveyData.wouldRecommend}%`}
            label="Recommend"
            subtitle={`${surveyData.wouldRecommendCount.positive} of ${surveyData.wouldRecommendCount.total} respondents`}
          />
        </div>
      </section>

      {/* Middle Row: Exit Reasons + Key Themes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Exit Reasons */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4" aria-label="Top exit reasons">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
            Top Exit Reasons (Combined)
          </h2>
          <div className="space-y-3">
            {insights.topExitReasons.map((item, idx) => (
              <div key={item.reason}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.reason}</span>
                  <span className="text-sm font-bold text-gray-900">{item.combinedPct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3" role="progressbar" aria-valuenow={item.combinedPct} aria-valuemin={0} aria-valuemax={100} aria-label={`${item.reason}: ${item.combinedPct}%`}>
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{ width: `${item.combinedPct}%`, backgroundColor: REASON_COLORS[idx] }}
                  />
                </div>
                <div className="flex gap-3 mt-1 text-xs text-gray-500">
                  <span>Primary: {item.primary}%</span>
                  <span>Contributing: {item.contributing}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Key Themes */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4" aria-label="Key themes and patterns">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
            Key Themes & Patterns
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {insights.themes.map((theme) => (
              <div
                key={theme.title}
                className="rounded-lg border border-gray-200 overflow-hidden"
              >
                <div className="h-1" style={{ backgroundColor: theme.color }} />
                <div className="p-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {theme.title}
                  </div>
                  <div className="text-sm font-bold text-gray-900 mt-0.5">{theme.subtitle}</div>
                  <ul className="mt-2 space-y-1">
                    {theme.items.map((item, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                        <span className="mt-1.5 h-1 w-1 rounded-full flex-shrink-0" style={{ backgroundColor: theme.color }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Row: Actions + QoQ Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recommended Actions */}
        <section className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4" aria-label="Recommended actions">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
            Recommended Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {insights.recommendedActions.map((item, idx) => (
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

        {/* QoQ Trend */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4" aria-label="Quarter-over-quarter trends">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-500" aria-hidden="true" />
            QoQ Trend
          </h2>
          <div className="text-xs text-gray-500 mb-3">
            {insights.yoyTrend.currentLabel} vs {insights.yoyTrend.previousLabel}
          </div>
          <div className="space-y-3">
            {insights.yoyTrend.metrics.map((metric) => {
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
        Data based on {surveyData.totalResponses} exit survey responses from {surveyData.totalExits} separations ({surveyData.responseRate}% response rate).
        Combined percentages reflect primary + contributing reasons and may exceed 100%.
      </footer>
    </div>
  );
};

export default ExitSurveyInsightsSlide;
