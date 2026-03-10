import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowUp, BarChart3, Calendar, Activity, HelpCircle } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getInternalMobilityData } from '../../services/dataService';
import { useQuarter } from '../../contexts/QuarterContext';
import NoDataForQuarter from '../ui/NoDataForQuarter';

/**
 * Promotions Dashboard (quarter-aware)
 * Displays promotions with calculated reason codes.
 * Data Source: internalMobilityData via dataService (date-keyed).
 */

// Updated color scheme for promotion reasons (WCAG AA compliant)
const promotionColors = {
  INCREASE: '#7C3AED',  // Purple - Salary/Grade Increase (most common)
  APPLIED: '#0054A6',   // Blue - Applied for Position (brand color)
};

// Format date as M/D/YY (use UTC to avoid timezone shift on YYYY-MM-DD strings)
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${String(date.getUTCFullYear()).slice(-2)}`;
};

// Human-readable period from metadata dateRange (parse strings directly to avoid timezone shift)
const getPeriodText = (dateRange) => {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const [, startMonth] = dateRange.start.split('-').map(Number);
  const [endYear, endMonth] = dateRange.end.split('-').map(Number);
  return `${months[startMonth - 1]} - ${months[endMonth - 1]} ${endYear}`;
};

// Reason Code Badge Component (for detail table)
const ReasonCodeBadge = ({ code }) => {
  const color = promotionColors[code] || '#9ca3af';
  return (
    <span
      className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {code}
    </span>
  );
};

// Enhanced Promotions Table Component - Matches Turnover by School/Area styling
const PromotionsTable = ({ title, data, columns }) => {
  const totals = columns.reduce((acc, col) => {
    acc[col.key] = data.reduce((sum, row) => sum + (row[col.key] || 0), 0);
    return acc;
  }, {});
  const grandTotal = data.reduce((sum, row) => sum + row.total, 0);
  const maxTotal = Math.max(...data.map(row => row.total));

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <BarChart3 style={{ color: '#0054A6' }} size={20} />
        {title}
      </h2>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">School/Area</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: col.color }}
                >
                  {col.label}
                </th>
              ))}
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Distribution</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const percentage = ((row.total / grandTotal) * 100).toFixed(1);
              const barWidthPercent = (row.total / maxTotal) * 100;

              return (
                <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-gray-900">{row.area}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="text-lg font-bold text-gray-900">{row.total}</div>
                  </td>
                  {columns.map((col, j) => (
                    <td key={j} className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-semibold ${row[col.key] > 0 ? 'text-white' : 'bg-gray-100 text-gray-400'}`}
                        style={row[col.key] > 0 ? { backgroundColor: col.color } : {}}
                      >
                        {row[col.key]}
                      </span>
                    </td>
                  ))}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-4 bg-gray-100 rounded overflow-hidden" style={{ width: '120px' }}>
                        {/* Applied portion */}
                        {row.applied > 0 && (
                          <div
                            className="h-full"
                            style={{
                              width: `${(row.applied / row.total) * barWidthPercent}%`,
                              backgroundColor: columns[0].color
                            }}
                          />
                        )}
                        {/* Increase portion */}
                        {row.increase > 0 && (
                          <div
                            className="h-full"
                            style={{
                              width: `${(row.increase / row.total) * barWidthPercent}%`,
                              backgroundColor: columns[1].color
                            }}
                          />
                        )}
                      </div>
                      <span className="text-xs text-gray-500 w-10">{percentage}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300 bg-gray-50">
              <td className="py-4 px-4 font-semibold text-gray-900">Total</td>
              <td className="py-4 px-4 text-center">
                <div className="text-xl font-bold text-gray-900">{grandTotal}</div>
              </td>
              {columns.map((col, i) => (
                <td key={i} className="py-4 px-4 text-center">
                  <span
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-white text-sm font-bold"
                    style={{ backgroundColor: col.color }}
                  >
                    {totals[col.key]}
                  </span>
                </td>
              ))}
              <td className="py-4 px-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-6 text-sm">
        {columns.map((col, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: col.color }}></div>
            <span className="text-gray-700">{col.label}</span>
          </div>
        ))}
      </div>

      {/* Data Note */}
      <div className="text-xs text-gray-600 mt-4 bg-blue-50 p-3 rounded border border-blue-200 text-center">
        <span className="font-semibold">Note:</span> All counts represent benefit-eligible employees only. Sorted by total promotions descending.
      </div>
    </div>
  );
};

// Promotions Detail Table Component (without Action column)
const PromotionsDetailTable = ({ data }) => {
  const promotions = data.filter(r => r.actionCode === 'PROMOTION')
    .sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));

  const hasDeptChange = (row) => {
    return row.beforeState?.department &&
           row.afterState?.department &&
           row.beforeState.department !== row.afterState.department;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <ArrowUp size={20} style={{ color: '#0054A6' }} />
            <span className="font-semibold" style={{ color: '#0054A6' }}>
              Employee Promotion Details ({promotions.length} records)
            </span>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#0054A6' }}>
              <th className="text-left py-3 px-4 text-white font-medium">Name</th>
              <th className="text-left py-3 px-4 text-white font-medium">Date</th>
              <th className="text-center py-3 px-4 text-white font-medium">Reason</th>
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

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, totalPromotions }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900">{data.label}</p>
        <p className="text-gray-600">{data.count} promotions ({((data.count / totalPromotions) * 100).toFixed(0)}%)</p>
      </div>
    );
  }
  return null;
};

// Over-Time Placeholder Component
const OverTimePlaceholder = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-8">
    <div className="flex items-center gap-3 mb-6">
      <Activity size={24} style={{ color: '#0054A6' }} />
      <h2 className="text-xl font-semibold text-gray-900">
        Promotion Trends Over Time
      </h2>
      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
        Coming Soon
      </span>
    </div>

    <div className="relative h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8">
      {/* Placeholder chart wireframe */}
      <div className="flex items-end justify-around h-full opacity-30">
        <div className="w-12 bg-[#0054A6] h-1/4 rounded-t" />
        <div className="w-12 bg-[#0054A6] h-2/5 rounded-t" />
        <div className="w-12 bg-[#0054A6] h-3/5 rounded-t" />
        <div className="w-12 bg-[#0054A6] h-2/5 rounded-t" />
        <div className="w-12 bg-[#0054A6] h-4/5 rounded-t" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <TrendingUp size={40} className="text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-2">
            Quarter-over-Quarter Promotion Trends
          </p>
          <p className="text-gray-500 text-sm max-w-md">
            This section will display promotion trends across quarters,
            year-over-year comparisons, and seasonal patterns.
          </p>
        </div>
      </div>
    </div>

    <div className="mt-4 text-xs text-gray-500">
      Historical data: FY25 Q1-Q4 will be available
    </div>
  </div>
);

const PromotionsQ1FY26Dashboard = () => {
  const { selectedQuarter } = useQuarter();

  // Get data for the selected quarter
  const mobilityData = getInternalMobilityData(selectedQuarter);

  if (!mobilityData) {
    return <NoDataForQuarter dataLabel="Promotions data" />;
  }

  const { metadata, summary, promotionsByReason, promotionsBySchool, employeeDetails } = mobilityData;
  const periodText = getPeriodText(metadata.dateRange);

  // Calculate derived metrics
  const mostCommonReason = promotionsByReason.reduce((a, b) => a.count > b.count ? a : b);
  const promotionsPerMonth = (summary.totalPromotions / 3).toFixed(1); // Each quarter = 3 months

  // Chart data with color mapping
  const chartData = promotionsByReason.map(item => ({
    ...item,
    color: promotionColors[item.code] || '#9ca3af'
  }));

  // Dynamic axis domain based on data
  const maxReasonCount = Math.max(...promotionsByReason.map(r => r.count));
  const xAxisMax = Math.ceil(maxReasonCount / 10) * 10 + 10;
  const xAxisTicks = Array.from({ length: Math.floor(xAxisMax / 10) + 1 }, (_, i) => i * 10);

  // Custom label renderer for external pie labels (print-friendly)
  const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, count, color }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percent = ((count / summary.totalPromotions) * 100).toFixed(0);

    return (
      <text
        x={x}
        y={y}
        fill={color}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={13}
        fontWeight={600}
      >
        {`${count} (${percent}%)`}
      </text>
    );
  };

  // Column definitions for table
  const promotionColumns = [
    { key: 'applied', label: 'Applied', color: promotionColors.APPLIED },
    { key: 'increase', label: 'Increase', color: promotionColors.INCREASE },
  ];

  return (
    <div id="promotions-q1-fy26-dashboard" className="min-h-screen">
      <div className="w-[85%] max-w-[1280px] mx-auto pt-5 pb-8">

        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ArrowUp style={{ color: '#0054A6' }} size={32} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {metadata.quarter} {metadata.fiscalYear} Promotions Report
                  </h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Employee Promotions & Career Advancement
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {periodText} • Benefit Eligible Employees
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold" style={{ color: '#0054A6' }}>
                  {summary.totalPromotions}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total Promotions</div>
                <div className="text-xs text-gray-500 mt-1">
                  {metadata.quarter} {metadata.fiscalYear}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards - 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

          {/* Total Promotions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <ArrowUp style={{ color: '#0054A6' }} size={20} />
              <span className="text-xs px-2 py-1 rounded-full font-medium uppercase"
                style={{ backgroundColor: '#0054A615', color: '#0054A6' }}>
                {metadata.quarter} {metadata.fiscalYear}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{summary.totalPromotions}</div>
            <div className="text-xs text-gray-600 font-medium mb-2">Total Promotions</div>
            <div className="text-xs text-gray-500">
              {metadata.matchedWithHistory} of {metadata.totalRecordsProcessed} matched with history
            </div>
          </div>

          {/* Most Common Reason */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 style={{ color: '#7C3AED' }} size={20} />
              <span className="text-xs px-2 py-1 rounded-full font-medium uppercase"
                style={{ backgroundColor: '#7C3AED15', color: '#7C3AED' }}>
                TOP REASON
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{mostCommonReason.count}</div>
            <div className="text-xs text-gray-600 font-medium mb-2">{mostCommonReason.label}</div>
            <div className="text-xs text-gray-500">
              {((mostCommonReason.count / summary.totalPromotions) * 100).toFixed(0)}% of all promotions
            </div>
          </div>

          {/* Average Rate */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Calendar style={{ color: '#10B981' }} size={20} />
              <span className="text-xs px-2 py-1 rounded-full font-medium uppercase"
                style={{ backgroundColor: '#10B98115', color: '#10B981' }}>
                RATE
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{promotionsPerMonth}</div>
            <div className="text-xs text-gray-600 font-medium mb-2">Promotions/Month</div>
            <div className="text-xs text-gray-500">
              Average across {metadata.quarter} period
            </div>
          </div>
        </div>

        {/* Dual Visualization - Donut + Bar Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: '#0054A6' }} />
              <h2 className="text-xl font-bold text-gray-900">Promotions by Reason Code</h2>
            </div>
            <Link
              to="/dashboards/promotion-reasons"
              className="flex items-center gap-1.5 text-sm font-medium hover:underline"
              style={{ color: '#0054A6' }}
              title="View detailed reason code definitions"
            >
              <HelpCircle size={16} />
              <span>What do these mean?</span>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Career advancement and grade increases through competitive hiring, performance recognition, and career development
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Donut Chart */}
            <div className="relative">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={2}
                    label={renderCustomLabel}
                    labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className="text-gray-700">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginBottom: '70px' }}>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{summary.totalPromotions}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
            </div>

            {/* Horizontal Bar Chart */}
            <div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ left: 10, right: 50, top: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, xAxisMax]}
                    ticks={xAxisTicks}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={120}
                    tick={{ fontSize: 13 }}
                  />
                  <Tooltip content={<CustomTooltip totalPromotions={summary.totalPromotions} />} />
                  <Bar
                    dataKey="count"
                    radius={[0, 4, 4, 0]}
                    label={{
                      position: 'right',
                      fill: '#111827',
                      fontSize: 13,
                      fontWeight: 600,
                      formatter: (value) => `${value} (${((value/summary.totalPromotions)*100).toFixed(0)}%)`
                    }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Promotions by School/Area Table */}
        <div className="mb-8">
          <PromotionsTable
            title="Promotions by School/Area"
            data={promotionsBySchool}
            columns={promotionColumns}
          />
        </div>

        {/* Promotions Detail Table */}
        <div className="mb-8">
          <PromotionsDetailTable data={employeeDetails} />
        </div>

        {/* Over Time Placeholder */}
        <div className="mb-8">
          <OverTimePlaceholder />
        </div>

        {/* Note Box */}
        <div className="rounded-lg p-4 text-sm bg-gray-100 text-gray-600">
          <strong>Note:</strong> All counts represent benefit-eligible employees only (F12, F09-F11).{' '}
          <strong className="text-[#7C3AED]">Increase</strong> = salary/grade advancement, title update, or performance recognition within same department.{' '}
          <strong className="text-[#0054A6]">Applied</strong> = employee moved to a different department.
        </div>

        {/* Data Source Info */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          Data generated: {new Date(metadata.generatedAt).toLocaleDateString()} |
          Promotion records: {summary.totalPromotions} |
          Match rate: {Math.round((metadata.matchedWithHistory / metadata.totalRecordsProcessed) * 100)}%
        </div>
      </div>
    </div>
  );
};

export default PromotionsQ1FY26Dashboard;
