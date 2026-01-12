import React from 'react';
import { TrendingUp, Users, ArrowUp, ArrowLeftRight, BarChart3, AlertTriangle } from 'lucide-react';
import { internalMobilityData } from '../../data/internalMobilityData';

/**
 * Q1 FY26 Job Changes Dashboard
 * Displays promotions and transfers with calculated reason codes
 *
 * Data Source: source-metrics via scripts/processInternalMobility.py
 * Design: Based on internal-mobility-final.jsx wireframe
 */

// Color scheme for reason codes
const reasonColors = {
  APPLIED: '#0066b3',      // Primary blue
  MERIT: '#22c55e',        // Green
  RECLASS: '#f59e0b',      // Orange
  PROGRESSION: '#8b5cf6',  // Purple
  REORG: '#ec4899',        // Pink
  BUSN_NEED: '#14b8a6',    // Teal
  ACCOMMODATION: '#3b82f6', // Blue
  UNABLE_TO_DETERMINE: '#9ca3af' // Gray
};

// Format date as M/D/YY
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(-2)}`;
};

// Progress Bar Component
const ProgressBar = ({ label, value, maxValue, color }) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100">
        <div
          className="h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// Reason Badge Component
const ReasonBadge = ({ value, color }) => (
  <span
    className="inline-flex items-center justify-center w-9 h-7 rounded text-sm font-semibold text-white"
    style={{ backgroundColor: color }}
  >
    {value}
  </span>
);

// Action Badge Component (for detail tables)
const ActionBadge = ({ action }) => {
  const isPromotion = action === 'PROMOTION';
  return (
    <span
      className="inline-flex items-center justify-center px-3 py-1 rounded text-xs font-semibold text-white"
      style={{ backgroundColor: isPromotion ? '#0066b3' : '#22c55e' }}
    >
      {action}
    </span>
  );
};

// Mobility Table Component (Summary by School/Area)
const MobilityTable = ({ title, data, columns }) => {
  const totals = columns.reduce((acc, col) => {
    acc[col.key] = data.reduce((sum, row) => sum + (row[col.key] || 0), 0);
    return acc;
  }, {});
  const grandTotal = data.reduce((sum, row) => sum + row.total, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 pb-0">
        <div className="flex items-center gap-2 mb-4 px-1">
          <BarChart3 size={20} style={{ color: '#0054A6' }} />
          <span className="font-semibold" style={{ color: '#0054A6' }}>{title}</span>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: '#0054A6' }}>
            <th className="text-left py-3 px-4 text-white font-medium w-48">School/Area</th>
            <th className="text-center py-3 px-4 text-white font-medium w-20">Total</th>
            {columns.map((col, i) => (
              <th key={i} className="text-center py-3 px-4 text-white font-medium">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className={i % 2 !== 0 ? 'bg-gray-50' : 'bg-white'}
              style={{ borderBottom: '1px solid #e5e7eb' }}
            >
              <td className="py-3 px-4 font-medium text-gray-900">{row.area}</td>
              <td className="py-3 px-4 text-center font-bold text-gray-900">{row.total}</td>
              {columns.map((col, j) => (
                <td key={j} className="py-3 px-4 text-center">
                  {row[col.key] > 0 ? (
                    <ReasonBadge value={row[col.key]} color={col.color} />
                  ) : (
                    <span className="text-gray-400">–</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50" style={{ borderTop: '2px solid #9ca3af' }}>
            <td className="py-3 px-4 font-bold text-gray-900">Total</td>
            <td className="py-3 px-4 text-center font-bold text-lg text-gray-900">{grandTotal}</td>
            {columns.map((col, i) => (
              <td key={i} className="py-3 px-4 text-center">
                <ReasonBadge value={totals[col.key]} color={col.color} />
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

// Reason Code Badge Component
const ReasonCodeBadge = ({ code }) => {
  const color = reasonColors[code] || reasonColors.UNABLE_TO_DETERMINE;
  return (
    <span
      className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {code}
    </span>
  );
};

// Promotions Detail Table Component
const PromotionsDetailTable = ({ data }) => {
  const promotions = data.filter(r => r.actionCode === 'PROMOTION')
    .sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));

  // Check if department changed
  const hasDeptChange = (row) => {
    return row.beforeState?.department &&
           row.afterState?.department &&
           row.beforeState.department !== row.afterState.department;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 pb-0">
        <div className="flex items-center gap-2 mb-4 px-1">
          <ArrowUp size={20} style={{ color: '#0054A6' }} />
          <span className="font-semibold" style={{ color: '#0054A6' }}>Promotions Detail</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#0054A6' }}>
              <th className="text-left py-3 px-4 text-white font-medium">Name</th>
              <th className="text-left py-3 px-4 text-white font-medium">Date</th>
              <th className="text-center py-3 px-4 text-white font-medium">Action</th>
              <th className="text-center py-3 px-4 text-white font-medium">Calculated Reason</th>
              <th className="text-left py-3 px-4 text-white font-medium">Title Change</th>
              <th className="text-left py-3 px-4 text-white font-medium">Dept Change</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((row, i) => (
              <tr
                key={i}
                className={i % 2 !== 0 ? 'bg-gray-50' : 'bg-white'}
                style={{ borderBottom: '1px solid #e5e7eb' }}
              >
                <td className="py-3 px-4 font-medium text-gray-900">{row.personName}</td>
                <td className="py-3 px-4 text-gray-600">{formatDate(row.effectiveDate)}</td>
                <td className="py-3 px-4 text-center">
                  <ActionBadge action={row.actionCode} />
                </td>
                <td className="py-3 px-4 text-center">
                  <ReasonCodeBadge code={row.customReasonCode} />
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {row.beforeState?.jobName ? (
                    <>
                      <span className="text-gray-500">{row.beforeState.jobName}</span>
                      <span className="mx-2 text-gray-400">→</span>
                      <span className="font-medium">{row.afterState.jobName}</span>
                    </>
                  ) : (
                    <span className="font-medium">{row.afterState.jobName}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {hasDeptChange(row) ? (
                    <>
                      <span className="text-gray-500">{row.beforeState.department}</span>
                      <span className="mx-2 text-gray-400">→</span>
                      <span className="font-medium text-orange-600">{row.afterState.department}</span>
                    </>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Transfers Detail Table Component
const TransfersDetailTable = ({ data }) => {
  const transfers = data.filter(r => r.actionCode === 'TRANSFER')
    .sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));

  // Check if department changed
  const hasDeptChange = (row) => {
    return row.beforeState?.department &&
           row.afterState?.department &&
           row.beforeState.department !== row.afterState.department;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 pb-0">
        <div className="flex items-center gap-2 mb-4 px-1">
          <ArrowLeftRight size={20} style={{ color: '#22c55e' }} />
          <span className="font-semibold" style={{ color: '#22c55e' }}>Transfers Detail</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#22c55e' }}>
              <th className="text-left py-3 px-4 text-white font-medium">Name</th>
              <th className="text-left py-3 px-4 text-white font-medium">Date</th>
              <th className="text-center py-3 px-4 text-white font-medium">Action</th>
              <th className="text-center py-3 px-4 text-white font-medium">Calculated Reason</th>
              <th className="text-left py-3 px-4 text-white font-medium">New Title</th>
              <th className="text-left py-3 px-4 text-white font-medium">Dept Change</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((row, i) => (
              <tr
                key={i}
                className={i % 2 !== 0 ? 'bg-gray-50' : 'bg-white'}
                style={{ borderBottom: '1px solid #e5e7eb' }}
              >
                <td className="py-3 px-4 font-medium text-gray-900">{row.personName}</td>
                <td className="py-3 px-4 text-gray-600">{formatDate(row.effectiveDate)}</td>
                <td className="py-3 px-4 text-center">
                  <ActionBadge action={row.actionCode} />
                </td>
                <td className="py-3 px-4 text-center">
                  <ReasonCodeBadge code={row.customReasonCode} />
                </td>
                <td className="py-3 px-4 text-gray-700 font-medium">{row.afterState.jobName}</td>
                <td className="py-3 px-4 text-gray-600">
                  {hasDeptChange(row) ? (
                    <>
                      <span className="text-gray-500">{row.beforeState.department}</span>
                      <span className="mx-2 text-gray-400">→</span>
                      <span>{row.afterState.department}</span>
                    </>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-1">
                      <AlertTriangle size={14} />
                      Same Dept
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Reason Breakdown Card Component
const ReasonBreakdownCard = ({ accentColor, title, count, description, items, maxValue }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 flex-1">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: accentColor }} />
      <h3 className="text-xl font-bold text-gray-900">{title} ({count})</h3>
    </div>
    <p className="text-sm mb-6 text-gray-500">{description}</p>
    <div className="space-y-1">
      {items.map((item, i) => (
        <ProgressBar
          key={i}
          label={item.label}
          value={item.count}
          maxValue={maxValue}
          color={reasonColors[item.code] || reasonColors.UNABLE_TO_DETERMINE}
        />
      ))}
    </div>
  </div>
);

const InternalMobilityQ1FY26Dashboard = () => {
  const { metadata, summary, promotionsByReason, transfersByReason, promotionsBySchool, transfersBySchool, employeeDetails } = internalMobilityData;

  const maxPromotionValue = Math.max(...promotionsByReason.map(r => r.count));
  const maxTransferValue = Math.max(...transfersByReason.map(r => r.count));

  // Column definitions for tables
  const promotionColumns = [
    { key: 'applied', label: 'Applied', color: reasonColors.APPLIED },
    { key: 'merit', label: 'Merit', color: reasonColors.MERIT },
    { key: 'reclass', label: 'Reclass', color: reasonColors.RECLASS },
    { key: 'progression', label: 'Progression', color: reasonColors.PROGRESSION },
  ];

  const transferColumns = [
    { key: 'applied', label: 'Applied', color: reasonColors.APPLIED },
    { key: 'reorg', label: 'Reorg', color: reasonColors.REORG },
    { key: 'busn_need', label: 'Busn Need', color: reasonColors.BUSN_NEED },
    { key: 'accommodation', label: 'Accomm.', color: reasonColors.ACCOMMODATION },
  ];

  return (
    <div id="job-changes-q1-fy26-dashboard" className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">

        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <TrendingUp style={{ color: '#0054A6' }} size={32} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {metadata.quarter} {metadata.fiscalYear} Job Changes Report
                  </h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Benefit Eligible Employees • July - September 2025
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Promotions and transfers by calculated reason code
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold" style={{ color: '#0054A6' }}>
                  {summary.totalMobilityActions}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total {metadata.quarter} Job Changes</div>
                <div className="text-xs text-gray-500 mt-1">
                  Promotions: {summary.totalPromotions} | Transfers: {summary.totalTransfers}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

          {/* Total Job Changes */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Users style={{ color: '#0054A6' }} size={20} />
              <span className="text-xs px-2 py-1 rounded-full font-medium uppercase"
                style={{ backgroundColor: '#0054A615', color: '#0054A6' }}>
                {metadata.fiscalYear}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{summary.totalMobilityActions}</div>
            <div className="text-xs text-gray-600 font-medium mb-2">Total Job Changes</div>
            <div className="text-xs text-gray-500">
              100% matched with workforce history
            </div>
          </div>

          {/* Total Promotions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <ArrowUp style={{ color: '#0054A6' }} size={20} />
              <span className="text-xs px-2 py-1 rounded-full font-medium uppercase"
                style={{ backgroundColor: '#0054A615', color: '#0054A6' }}>
                PROMOTIONS
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{summary.totalPromotions}</div>
            <div className="text-xs text-gray-600 font-medium mb-2">Total Promotions</div>
            <div className="text-xs text-gray-500">
              Career advancement and grade increases
            </div>
          </div>

          {/* Total Transfers */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <ArrowLeftRight style={{ color: '#22c55e' }} size={20} />
              <span className="text-xs px-2 py-1 rounded-full font-medium uppercase"
                style={{ backgroundColor: '#22c55e15', color: '#22c55e' }}>
                TRANSFERS
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{summary.totalTransfers}</div>
            <div className="text-xs text-gray-600 font-medium mb-2">Total Transfers</div>
            <div className="text-xs text-gray-500">
              Lateral and cross-department moves
            </div>
          </div>
        </div>

        {/* Reason Breakdown Cards - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ReasonBreakdownCard
            accentColor="#0054A6"
            title="Promotions by Reason"
            count={summary.totalPromotions}
            description="Grade increases through competitive hiring, performance recognition, and career development"
            items={promotionsByReason}
            maxValue={maxPromotionValue}
          />
          <ReasonBreakdownCard
            accentColor="#22c55e"
            title="Transfers by Reason"
            count={summary.totalTransfers}
            description="Lateral or downward moves between departments through applications or business needs"
            items={transfersByReason}
            maxValue={maxTransferValue}
          />
        </div>

        {/* Promotions by School/Area Table */}
        <div className="mb-6">
          <MobilityTable
            title="Job Changes by School/Area – Promotions"
            data={promotionsBySchool}
            columns={promotionColumns}
          />
        </div>

        {/* Transfers by School/Area Table */}
        <div className="mb-6">
          <MobilityTable
            title="Job Changes by School/Area – Transfers"
            data={transfersBySchool}
            columns={transferColumns}
          />
        </div>

        {/* Promotions Detail Table */}
        <div className="mb-6">
          <PromotionsDetailTable data={employeeDetails} />
        </div>

        {/* Transfers Detail Table */}
        <div className="mb-6">
          <TransfersDetailTable data={employeeDetails} />
        </div>

        {/* Note Box */}
        <div className="rounded-lg p-4 mt-6 text-sm bg-gray-100 text-gray-600">
          <strong>Note:</strong> All counts represent benefit-eligible employees only (F12, F09-F11).{' '}
          <strong>Applied</strong> = employee moved to different department.{' '}
          <strong>Merit</strong> = promotion in place (same title).{' '}
          <strong>Progression</strong> = career ladder advancement (title pattern).{' '}
          <strong>Reclass</strong> = significant title change in same department.{' '}
          <strong>Reorg</strong> = same department transfer (cost center change).
        </div>

        {/* Data Source Info */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          Data generated: {new Date(metadata.generatedAt).toLocaleDateString()} |
          Records: {metadata.totalRecordsProcessed} |
          Match rate: {Math.round((metadata.matchedWithHistory / metadata.totalRecordsProcessed) * 100)}%
        </div>
      </div>
    </div>
  );
};

export default InternalMobilityQ1FY26Dashboard;
