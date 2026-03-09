import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, ArrowRight } from 'lucide-react';
import { getInternalMobilityData } from '../../services/dataService';
import { useQuarter } from '../../contexts/QuarterContext';
import NoDataForQuarter from '../ui/NoDataForQuarter';

/**
 * Promotion Reasons Reference Page (quarter-aware)
 * Explains the 2 promotion reason codes with definitions and examples.
 * Counts and percentages are derived from current quarter data.
 */

// Color palette matching the Promotions Dashboard
const promotionColors = {
  INCREASE: '#7C3AED',  // Purple
  APPLIED: '#0054A6',   // Blue (brand)
};

// Static definitions (these don't change per quarter)
const reasonDefinitions = {
  INCREASE: {
    label: 'Salary/Grade Increase',
    definition: 'Career advancement within your current department through salary/grade increases',
    indicators: [
      'Same department',
      'Salary grade advancement (e.g., D → C → B)',
    ],
    example: {
      before: 'Associate Director (Grade D)',
      after: 'Director (Grade C)',
      note: 'Same department, recognized progression',
    },
  },
  APPLIED: {
    label: 'Applied for Position',
    definition: 'Moved to a different department through competitive application',
    indicators: [
      'Different department/cost center',
      'Often new or significantly changed title',
      'Competitive selection process',
    ],
    example: {
      before: 'Director Global Learning',
      after: 'Director Alumni Relations',
      note: 'Cross-department career move',
    },
  },
};

// Reason Card Component
const ReasonCard = ({ reason, quarterLabel }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
    {/* Header with badge and title */}
    <div className="flex items-center gap-3 mb-4">
      <span
        className="px-3 py-1.5 rounded-lg text-sm font-bold text-white"
        style={{ backgroundColor: reason.color }}
      >
        {reason.code}
      </span>
      <h3 className="text-lg font-bold text-gray-900">{reason.label}</h3>
    </div>

    {/* Definition */}
    <p className="text-gray-600 mb-5">{reason.definition}</p>

    {/* Key Indicators */}
    <div className="mb-5">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Key Indicators
      </h4>
      <ul className="space-y-1.5">
        {reason.indicators.map((indicator, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-gray-400 mt-0.5">•</span>
            <span>{indicator}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Example */}
    <div className="bg-gray-50 rounded-lg p-4 mb-5">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Example
      </h4>
      <div className="flex items-center gap-2 text-sm mb-2">
        <span className="text-gray-600">{reason.example.before}</span>
        <ArrowRight size={14} className="text-gray-400 flex-shrink-0" />
        <span className="font-medium text-gray-900">{reason.example.after}</span>
      </div>
      <p className="text-xs text-gray-500 italic">{reason.example.note}</p>
    </div>

    {/* Count */}
    <div
      className="flex items-center justify-between pt-4 border-t border-gray-100"
    >
      <span className="text-sm text-gray-500">{quarterLabel}</span>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold" style={{ color: reason.color }}>
          {reason.count}
        </span>
        <span className="text-sm text-gray-500">({reason.percentage}%)</span>
      </div>
    </div>
  </div>
);

const PromotionReasonsReference = () => {
  const { selectedQuarter, quarterConfig } = useQuarter();

  const mobilityData = getInternalMobilityData(selectedQuarter);

  if (!mobilityData) {
    return <NoDataForQuarter dataLabel="Promotion reasons data" />;
  }

  const { summary, promotionsByReason } = mobilityData;
  const quarterLabel = quarterConfig?.label || `${mobilityData.metadata.quarter} ${mobilityData.metadata.fiscalYear}`;

  // Build reason cards with dynamic counts from data
  const promotionReasons = ['INCREASE', 'APPLIED'].map(code => {
    const dataEntry = promotionsByReason.find(r => r.code === code);
    const count = dataEntry?.count || 0;
    const percentage = summary.totalPromotions > 0
      ? Math.round((count / summary.totalPromotions) * 100)
      : 0;

    return {
      code,
      color: promotionColors[code],
      count,
      percentage,
      ...reasonDefinitions[code],
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">

        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center gap-4">
              <BookOpen style={{ color: '#0054A6' }} size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Promotion Reason Codes
                </h1>
                <p className="text-gray-600 text-lg mt-2">
                  Understanding how promotions are classified
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Reference guide for benefit-eligible employee promotions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/dashboards/promotions-q1"
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
            style={{ color: '#0054A6' }}
          >
            <ArrowLeft size={16} />
            Back to {quarterLabel} Promotions Report
          </Link>
        </div>

        {/* 2-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {promotionReasons.map((reason) => (
            <ReasonCard key={reason.code} reason={reason} quarterLabel={quarterLabel} />
          ))}
        </div>

        {/* Footer Note */}
        <div className="rounded-lg p-4 text-sm bg-gray-100 text-gray-600">
          <strong>Note:</strong> All counts represent benefit-eligible employees only (F12, F09-F11).
          Reason codes are calculated based on title changes, department moves, and grade adjustments.
          Data source: {quarterLabel} ({getPeriodText(mobilityData.metadata.dateRange)}).
        </div>

        {/* Data Source Info */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          Total {quarterLabel} Promotions: {summary.totalPromotions} employees
        </div>
      </div>
    </div>
  );
};

// Human-readable period from metadata dateRange
const getPeriodText = (dateRange) => {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  return `${months[start.getMonth()]} - ${months[end.getMonth()]} ${end.getFullYear()}`;
};

export default PromotionReasonsReference;
