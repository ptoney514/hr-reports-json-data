import React from 'react';
import { Shield, Lightbulb, TrendingDown, BarChart3, Info } from 'lucide-react';
import { operationalRiskData, getStatusColor } from '../../../data/operationalRiskData';
import RiskStatusBadge from '../../ui/RiskStatusBadge';

/**
 * DataTableFocus - Concept 5
 *
 * Professional table-first design with insight callouts.
 * Emphasizes data clarity with benchmark comparisons.
 *
 * Structure:
 * - Header with icon + title + date
 * - Key Insight Box (yellow-50 callout)
 * - Main Risk Indicators Table
 * - Benchmark Comparison Cards
 * - Legend
 */
const DataTableFocus = () => {
  const data = operationalRiskData;
  const turnoverData = Object.values(data.turnover);

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:py-4 print:bg-white">
      <div className="max-w-6xl mx-auto px-6 print:px-4">

        {/* Page Header */}
        <div className="mb-6 print:mb-4">
          <div className="bg-white rounded-lg shadow-sm border p-6 print:p-4 print:shadow-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Shield style={{color: '#00245D'}} size={28} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 print:text-xl">
                    {data.reportTitle}
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    {data.fiscalPeriod} | Reported: {data.reportingDate}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <RiskStatusBadge status={data.overallRisk.status} size="lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Key Insight Callout */}
        <div className="mb-6 print:mb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 print:bg-gray-50">
            <div className="flex items-start gap-3">
              <Lightbulb className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h2 className="font-semibold text-yellow-900 text-sm">Key Insight</h2>
                <p className="text-yellow-800 text-sm mt-1">
                  {data.overallRisk.summary} All turnover rates are tracking below both
                  checkpoint thresholds and industry benchmarks, indicating strong workforce
                  stability.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Risk Indicators Table */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 print:p-4 print:shadow-none print:mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown style={{color: '#00245D'}} size={20} />
            Turnover Risk Indicators
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Indicator
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Current
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-yellow-600 uppercase tracking-wider">
                    Checkpoint
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-red-600 uppercase tracking-wider">
                    Tolerance
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    CUPA Benchmark
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    vs Benchmark
                  </th>
                </tr>
              </thead>
              <tbody>
                {turnoverData.map((item, index) => {
                  const diff = item.current - item.benchmark;
                  const diffPercent = ((diff / item.benchmark) * 100).toFixed(1);
                  const isBelow = diff < 0;
                  const statusColors = getStatusColor(item.status);

                  return (
                    <tr
                      key={index}
                      className={`border-b border-gray-100 ${
                        item.label === 'Total' ? 'bg-gray-50 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className={`text-sm ${item.label === 'Total' ? 'font-bold' : 'font-medium'} text-gray-900`}>
                          {item.label === 'Total' ? (
                            <span className="flex items-center gap-2">
                              <BarChart3 size={14} style={{color: '#00245D'}} />
                              {item.label}
                            </span>
                          ) : (
                            <span className="pl-6">{item.label}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-lg font-bold ${statusColors.text}`}>
                          {item.current}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                          &gt;{item.checkpoint}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-sm text-red-700 bg-red-50 px-2 py-1 rounded">
                          &gt;{item.tolerance}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <RiskStatusBadge status={item.status} size="sm" showIcon={false} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-sm text-gray-600">
                          {item.benchmark}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-sm font-medium ${isBelow ? 'text-green-600' : 'text-red-600'}`}>
                          {isBelow ? '' : '+'}{diff.toFixed(1)}pp
                          <span className="text-xs text-gray-400 ml-1">
                            ({isBelow ? '' : '+'}{diffPercent}%)
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Data Note */}
          <div className="mt-4 text-xs text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
            <span className="font-semibold">Note:</span> Turnover rates are calculated on a rolling
            12-month basis. Benchmarks sourced from CUPA-HR.
          </div>
        </div>

        {/* Open Positions Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 print:p-4 print:shadow-none print:mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 style={{color: '#00245D'}} size={20} />
            Open Position Fill Time
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Position Type
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Current Avg
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-yellow-600 uppercase tracking-wider">
                    Checkpoint
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-red-600 uppercase tracking-wider">
                    Tolerance
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.values(data.openPositions).map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-900">{item.label}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-lg font-bold text-gray-900">
                        {item.currentDays} {item.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                        &gt;{item.checkpoint} {item.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm text-red-700 bg-red-50 px-2 py-1 rounded">
                        &gt;{item.tolerance} {item.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <RiskStatusBadge status={item.status} size="sm" showIcon={false} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Talent Management Areas */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 print:p-4 print:shadow-none print:mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield style={{color: '#00245D'}} size={20} />
            HR Management Areas
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.values(data.talentManagement).map((area, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">{area.label}</div>
                  <div className="text-xs text-gray-500">{area.description}</div>
                </div>
                <RiskStatusBadge status={area.status} size="sm" showLabel={false} />
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg shadow-sm border p-4 print:shadow-none">
          <div className="flex items-center gap-2 mb-3">
            <Info size={16} className="text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Status Legend</h3>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <RiskStatusBadge status="good" size="sm" />
              <span className="text-xs text-gray-600">Below checkpoint threshold</span>
            </div>
            <div className="flex items-center gap-2">
              <RiskStatusBadge status="checkpoint" size="sm" />
              <span className="text-xs text-gray-600">At or above checkpoint, below tolerance</span>
            </div>
            <div className="flex items-center gap-2">
              <RiskStatusBadge status="tolerance" size="sm" />
              <span className="text-xs text-gray-600">At or above tolerance threshold</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DataTableFocus;
