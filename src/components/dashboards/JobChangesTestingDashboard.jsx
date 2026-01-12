import React from 'react';
import { TrendingUp, Users, ArrowUp, ArrowLeftRight, BarChart3, AlertTriangle } from 'lucide-react';
import { jobChangesAllData } from '../../data/jobChangesAllData';

/**
 * Job Changes Testing Dashboard
 * ALL records from 7/1/24 - 11/13/25 for verification
 */

const reasonColors = {
  APPLIED: '#0066b3', MERIT: '#22c55e', RECLASS: '#f59e0b', PROGRESSION: '#8b5cf6',
  REORG: '#ec4899', BUSN_NEED: '#14b8a6', ACCOMMODATION: '#3b82f6', UNABLE_TO_DETERMINE: '#9ca3af'
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(-2)}`;
};

const ProgressBar = ({ label, value, maxValue, color }) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100">
        <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

const ReasonBadge = ({ value, color }) => (
  <span className="inline-flex items-center justify-center w-9 h-7 rounded text-sm font-semibold text-white" style={{ backgroundColor: color }}>{value}</span>
);

const ActionBadge = ({ action }) => (
  <span className="inline-flex items-center justify-center px-3 py-1 rounded text-xs font-semibold text-white"
    style={{ backgroundColor: action === 'PROMOTION' ? '#0066b3' : '#22c55e' }}>{action}</span>
);

const ReasonCodeBadge = ({ code }) => (
  <span className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-semibold text-white"
    style={{ backgroundColor: reasonColors[code] || reasonColors.UNABLE_TO_DETERMINE }}>{code}</span>
);

const MobilityTable = ({ title, data, columns }) => {
  const totals = columns.reduce((acc, col) => { acc[col.key] = data.reduce((sum, row) => sum + (row[col.key] || 0), 0); return acc; }, {});
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
            {columns.map((col, i) => <th key={i} className="text-center py-3 px-4 text-white font-medium">{col.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className={i % 2 !== 0 ? 'bg-gray-50' : 'bg-white'} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td className="py-3 px-4 font-medium text-gray-900">{row.area}</td>
              <td className="py-3 px-4 text-center font-bold text-gray-900">{row.total}</td>
              {columns.map((col, j) => (
                <td key={j} className="py-3 px-4 text-center">
                  {row[col.key] > 0 ? <ReasonBadge value={row[col.key]} color={col.color} /> : <span className="text-gray-400">–</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50" style={{ borderTop: '2px solid #9ca3af' }}>
            <td className="py-3 px-4 font-bold text-gray-900">Total</td>
            <td className="py-3 px-4 text-center font-bold text-lg text-gray-900">{grandTotal}</td>
            {columns.map((col, i) => <td key={i} className="py-3 px-4 text-center"><ReasonBadge value={totals[col.key]} color={col.color} /></td>)}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

const PromotionsDetailTable = ({ data }) => {
  const promotions = data.filter(r => r.actionCode === 'PROMOTION').sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));

  // Check if department changed
  const hasDeptChange = (row) => row.beforeState?.department && row.afterState?.department && row.beforeState.department !== row.afterState.department;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 pb-0">
        <div className="flex items-center gap-2 mb-4 px-1">
          <ArrowUp size={20} style={{ color: '#0054A6' }} />
          <span className="font-semibold" style={{ color: '#0054A6' }}>Promotions Detail ({promotions.length})</span>
        </div>
      </div>
      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0">
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
              <tr key={i} className={i % 2 !== 0 ? 'bg-gray-50' : 'bg-white'} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td className="py-3 px-4 font-medium text-gray-900">{row.personName}</td>
                <td className="py-3 px-4 text-gray-600">{formatDate(row.effectiveDate)}</td>
                <td className="py-3 px-4 text-center"><ActionBadge action={row.actionCode} /></td>
                <td className="py-3 px-4 text-center"><ReasonCodeBadge code={row.customReasonCode} /></td>
                <td className="py-3 px-4 text-gray-700">
                  {row.beforeState?.jobName ? (
                    <><span className="text-gray-500">{row.beforeState.jobName}</span><span className="mx-2 text-gray-400">→</span><span className="font-medium">{row.afterState.jobName}</span></>
                  ) : <span className="font-medium">{row.afterState.jobName}</span>}
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {hasDeptChange(row) ? (
                    <><span className="text-gray-500">{row.beforeState.department}</span><span className="mx-2 text-gray-400">→</span><span className="font-medium text-orange-600">{row.afterState.department}</span></>
                  ) : <span className="text-gray-400">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TransfersDetailTable = ({ data }) => {
  const transfers = data.filter(r => r.actionCode === 'TRANSFER').sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));

  // Check if department changed
  const hasDeptChange = (row) => row.beforeState?.department && row.afterState?.department && row.beforeState.department !== row.afterState.department;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 pb-0">
        <div className="flex items-center gap-2 mb-4 px-1">
          <ArrowLeftRight size={20} style={{ color: '#22c55e' }} />
          <span className="font-semibold" style={{ color: '#22c55e' }}>Transfers Detail ({transfers.length})</span>
        </div>
      </div>
      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0">
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
              <tr key={i} className={i % 2 !== 0 ? 'bg-gray-50' : 'bg-white'} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td className="py-3 px-4 font-medium text-gray-900">{row.personName}</td>
                <td className="py-3 px-4 text-gray-600">{formatDate(row.effectiveDate)}</td>
                <td className="py-3 px-4 text-center"><ActionBadge action={row.actionCode} /></td>
                <td className="py-3 px-4 text-center"><ReasonCodeBadge code={row.customReasonCode} /></td>
                <td className="py-3 px-4 text-gray-700 font-medium">{row.afterState.jobName}</td>
                <td className="py-3 px-4 text-gray-600">
                  {hasDeptChange(row) ? (
                    <><span className="text-gray-500">{row.beforeState.department}</span><span className="mx-2 text-gray-400">→</span><span>{row.afterState.department}</span></>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-1"><AlertTriangle size={14} />Same Dept</span>
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

const ReasonBreakdownCard = ({ accentColor, title, count, description, items, maxValue }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 flex-1">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: accentColor }} />
      <h3 className="text-xl font-bold text-gray-900">{title} ({count})</h3>
    </div>
    <p className="text-sm mb-6 text-gray-500">{description}</p>
    <div className="space-y-1">
      {items.map((item, i) => (
        <ProgressBar key={i} label={item.label} value={item.count} maxValue={maxValue} color={reasonColors[item.code] || reasonColors.UNABLE_TO_DETERMINE} />
      ))}
    </div>
  </div>
);

const JobChangesTestingDashboard = () => {
  const { metadata, summary, promotionsByReason, transfersByReason, promotionsBySchool, transfersBySchool, employeeDetails } = jobChangesAllData;
  const maxPromotionValue = Math.max(...promotionsByReason.map(r => r.count));
  const maxTransferValue = Math.max(...transfersByReason.map(r => r.count));

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
    <div id="job-changes-testing-dashboard" className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">

        {/* Testing Banner */}
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
          <AlertTriangle size={20} className="text-amber-600" />
          <span className="text-amber-800 text-sm font-medium">Testing/Verification Page - All records from source file (not filtered by quarter)</span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <TrendingUp style={{ color: '#0054A6' }} size={32} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{metadata.reportTitle}</h1>
                  <p className="text-gray-600 text-lg mt-2">Benefit Eligible Employees • July 2024 - November 2025</p>
                  <p className="text-gray-500 text-sm mt-1">{metadata.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold" style={{ color: '#0054A6' }}>{summary.totalMobilityActions}</div>
                <div className="text-sm text-gray-600 font-medium">Total Job Changes</div>
                <div className="text-xs text-gray-500 mt-1">Promotions: {summary.totalPromotions} | Transfers: {summary.totalTransfers}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Users style={{ color: '#0054A6' }} size={20} />
              <span className="text-xs px-2 py-1 rounded-full font-medium uppercase" style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}>TESTING</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{summary.totalMobilityActions}</div>
            <div className="text-xs text-gray-600 font-medium mb-2">Total Job Changes</div>
            <div className="text-xs text-gray-500">{metadata.matchedWithHistory}/{metadata.totalRecordsProcessed} matched</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <ArrowUp style={{ color: '#0054A6' }} size={20} />
              <span className="text-xs px-2 py-1 rounded-full font-medium uppercase" style={{ backgroundColor: '#0054A615', color: '#0054A6' }}>PROMOTIONS</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{summary.totalPromotions}</div>
            <div className="text-xs text-gray-600 font-medium mb-2">Total Promotions</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <ArrowLeftRight style={{ color: '#22c55e' }} size={20} />
              <span className="text-xs px-2 py-1 rounded-full font-medium uppercase" style={{ backgroundColor: '#22c55e15', color: '#22c55e' }}>TRANSFERS</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{summary.totalTransfers}</div>
            <div className="text-xs text-gray-600 font-medium mb-2">Total Transfers</div>
          </div>
        </div>

        {/* Reason Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ReasonBreakdownCard accentColor="#0054A6" title="Promotions by Reason" count={summary.totalPromotions}
            description="Grade increases through competitive hiring, performance recognition, and career development"
            items={promotionsByReason} maxValue={maxPromotionValue} />
          <ReasonBreakdownCard accentColor="#22c55e" title="Transfers by Reason" count={summary.totalTransfers}
            description="Lateral or downward moves between departments through applications or business needs"
            items={transfersByReason} maxValue={maxTransferValue} />
        </div>

        {/* Summary Tables */}
        <div className="mb-6"><MobilityTable title="Job Changes by School/Area – Promotions" data={promotionsBySchool} columns={promotionColumns} /></div>
        <div className="mb-6"><MobilityTable title="Job Changes by School/Area – Transfers" data={transfersBySchool} columns={transferColumns} /></div>

        {/* Detail Tables */}
        <div className="mb-6"><PromotionsDetailTable data={employeeDetails} /></div>
        <div className="mb-6"><TransfersDetailTable data={employeeDetails} /></div>

        {/* Note Box */}
        <div className="rounded-lg p-4 mt-6 text-sm bg-gray-100 text-gray-600">
          <strong>Note:</strong> This page shows ALL {metadata.totalRecordsProcessed} records from the source file for verification purposes.
          Date range: {metadata.dateRange.start} to {metadata.dateRange.end}.
        </div>

        <div className="mt-4 text-xs text-gray-400 text-center">
          Generated: {new Date(metadata.generatedAt).toLocaleDateString()} | Source: Promotions and Transfers 7_01_24 to 11_13_25.xlsx
        </div>
      </div>
    </div>
  );
};

export default JobChangesTestingDashboard;
