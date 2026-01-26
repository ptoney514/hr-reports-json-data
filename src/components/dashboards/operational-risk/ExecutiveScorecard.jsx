import React from 'react';
import {
  Shield,
  TrendingDown,
  Users,
  UserPlus,
  Heart,
  Clock,
  Info,
  CheckCircle
} from 'lucide-react';
import { operationalRiskData, getStatusColor } from '../../../data/operationalRiskData';
import RiskStatusBadge from '../../ui/RiskStatusBadge';
import { RiskProgressBarCompact } from '../../ui/RiskProgressBar';

/**
 * ExecutiveScorecard - Concept 1
 *
 * Clean, executive-focused design with large status tiles.
 * Emphasizes quick visual assessment with detailed table below.
 *
 * Structure:
 * - Header (icon + title + date)
 * - Status Tiles Grid (4 large tiles)
 * - Turnover Risk Detail Table
 * - Legend + Notes
 */
const ExecutiveScorecard = () => {
  const data = operationalRiskData;

  // Summary tiles data
  const summaryTiles = [
    {
      id: 'turnover',
      label: 'Turnover Rate',
      value: `${data.turnover.total.current}%`,
      sublabel: 'Total (Rolling 12mo)',
      status: data.turnover.total.status,
      icon: TrendingDown,
      benchmark: `CUPA: ${data.turnover.total.benchmark}%`
    },
    {
      id: 'openPositions',
      label: 'Time to Fill',
      value: `${data.openPositions.staffExempt.currentDays}d`,
      sublabel: 'Staff Exempt Avg',
      status: data.openPositions.staffExempt.status,
      icon: Clock,
      benchmark: `Target: <${data.openPositions.staffExempt.checkpoint}d`
    },
    {
      id: 'acquisition',
      label: 'Talent Acquisition',
      value: 'Strong',
      sublabel: data.talentManagement.acquisition.description,
      status: data.talentManagement.acquisition.status,
      icon: UserPlus,
      benchmark: null
    },
    {
      id: 'retention',
      label: 'Retention',
      value: 'Strong',
      sublabel: data.talentManagement.retention.description,
      status: data.talentManagement.retention.status,
      icon: Heart,
      benchmark: null
    }
  ];

  // Status tile background colors
  const getTileBackground = (status) => {
    switch (status) {
      case 'good':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'checkpoint':
        return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      case 'tolerance':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:py-4 print:bg-white">
      <div className="max-w-7xl mx-auto px-6 print:px-4">

        {/* Page Header */}
        <div className="mb-8 print:mb-4">
          <div className="bg-white rounded-lg shadow-sm border p-8 print:p-4 print:shadow-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg" style={{backgroundColor: '#00245D'}}>
                  <Shield className="text-white" size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">
                    {data.reportTitle}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {data.fiscalPeriod} | Reporting Frequency: {data.reportingFrequency}
                  </p>
                  <p className="text-gray-500 text-sm">
                    As of {data.reportingDate} | Reported by: {data.reportedBy}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-2">
                  <CheckCircle className="text-green-600" size={24} />
                  <span className="text-xl font-bold text-green-700">
                    {data.overallRisk.label}
                  </span>
                </div>
                <p className="text-sm text-gray-500 max-w-xs">
                  {data.overallRisk.summary}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 print:grid-cols-4 print:gap-4 print:mb-4">
          {summaryTiles.map((tile) => {
            const IconComponent = tile.icon;

            return (
              <div
                key={tile.id}
                className={`rounded-xl border-2 p-6 transition-colors print:p-4 ${getTileBackground(tile.status)}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <IconComponent
                    size={24}
                    style={{color: '#00245D'}}
                    className="print:text-black"
                  />
                  <RiskStatusBadge status={tile.status} size="sm" showLabel={false} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1 print:text-2xl">
                  {tile.value}
                </div>
                <div className="text-sm font-medium text-gray-700">{tile.label}</div>
                <div className="text-xs text-gray-500 mt-1">{tile.sublabel}</div>
                {tile.benchmark && (
                  <div className="text-xs text-blue-600 mt-2 font-medium">
                    {tile.benchmark}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Turnover Risk Detail Table */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 print:p-4 print:shadow-none print:mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingDown style={{color: '#00245D'}} size={24} />
            Turnover Risk Detail
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Current Rate
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                    Risk Level
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
                </tr>
              </thead>
              <tbody>
                {Object.values(data.turnover).map((item, index) => {
                  const statusColors = getStatusColor(item.status);
                  const isTotal = item.label === 'Total';

                  return (
                    <tr
                      key={index}
                      className={`border-b border-gray-100 ${isTotal ? 'bg-blue-50' : ''}`}
                    >
                      <td className="py-4 px-4">
                        <span className={`text-sm ${isTotal ? 'font-bold' : 'font-medium'} text-gray-900`}>
                          {item.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`text-xl font-bold ${statusColors.text}`}>
                          {item.current}%
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <RiskProgressBarCompact
                          value={item.current}
                          checkpoint={item.checkpoint}
                          tolerance={item.tolerance}
                        />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm text-gray-600">&gt;{item.checkpoint}%</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm text-gray-600">&gt;{item.tolerance}%</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <RiskStatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm text-gray-600">{item.benchmark}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* HR Management Areas Grid */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 print:p-4 print:shadow-none print:mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users style={{color: '#00245D'}} size={24} />
            HR Management Areas
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.values(data.talentManagement).map((area, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border text-center ${getTileBackground(area.status)}`}
              >
                <RiskStatusBadge status={area.status} size="sm" showLabel={false} />
                <div className="text-sm font-semibold text-gray-900 mt-2">{area.label}</div>
                <div className="text-xs text-gray-500 mt-1">{area.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
          {/* Legend */}
          <div className="bg-white rounded-lg shadow-sm border p-4 print:shadow-none">
            <div className="flex items-center gap-2 mb-3">
              <Info size={16} className="text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">Status Legend</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <RiskStatusBadge status="good" size="sm" />
                <span className="text-xs text-gray-600">Below checkpoint threshold</span>
              </div>
              <div className="flex items-center gap-3">
                <RiskStatusBadge status="checkpoint" size="sm" />
                <span className="text-xs text-gray-600">At or above checkpoint, below tolerance</span>
              </div>
              <div className="flex items-center gap-3">
                <RiskStatusBadge status="tolerance" size="sm" />
                <span className="text-xs text-gray-600">At or above tolerance threshold</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Notes</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              {data.notes.map((note, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExecutiveScorecard;
