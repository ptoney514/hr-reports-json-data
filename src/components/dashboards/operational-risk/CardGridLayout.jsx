import React from 'react';
import {
  Shield,
  TrendingDown,
  Clock,
  UserPlus,
  BookOpen,
  Heart,
  Settings,
  Gift,
  DollarSign,
  Info,
  CheckCircle
} from 'lucide-react';
import { operationalRiskData, getStatusColor } from '../../../data/operationalRiskData';
import RiskStatusBadge, { RiskStatusDot } from '../../ui/RiskStatusBadge';

/**
 * CardGridLayout - Concept 4
 *
 * Bento-box card design with prominent status badges.
 * Features left-border accent bars in Creighton blue.
 *
 * Structure:
 * - Header with Overall Risk Badge
 * - Two-Column Card Layout (Turnover + Open Positions)
 * - HR Management Areas (Sub-cards Grid)
 * - Info Note
 */
const CardGridLayout = () => {
  const data = operationalRiskData;

  // Icon mapping for talent management areas
  const iconMap = {
    UserPlus: UserPlus,
    BookOpen: BookOpen,
    Heart: Heart,
    Settings: Settings,
    Gift: Gift,
    DollarSign: DollarSign
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:py-4 print:bg-white">
      <div className="max-w-6xl mx-auto px-6 print:px-4">

        {/* Header with Overall Risk Badge */}
        <div className="mb-8 print:mb-4">
          <div className="bg-white rounded-xl shadow-sm border p-6 print:p-4 print:shadow-none">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="p-3 rounded-xl"
                  style={{backgroundColor: '#00245D'}}
                >
                  <Shield className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 print:text-xl">
                    {data.reportTitle}
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    {data.fiscalPeriod} | As of {data.reportingDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 border border-green-300 rounded-full px-4 py-2 flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-green-800 font-bold text-sm uppercase tracking-wide">
                    {data.overallRisk.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 print:gap-4 print:mb-4">

          {/* TURNOVER Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden print:shadow-none">
            <div
              className="h-1"
              style={{backgroundColor: '#00245D'}}
            />
            <div className="p-6 print:p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingDown style={{color: '#00245D'}} size={20} />
                  Turnover Rates
                </h2>
                <RiskStatusBadge status={data.turnover.total.status} size="sm" />
              </div>

              {/* Total Turnover Highlight */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 border-l-4" style={{borderLeftColor: '#00245D'}}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 font-medium">Total Turnover</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {data.turnover.total.current}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Checkpoint: &gt;{data.turnover.total.checkpoint}% | Tolerance: &gt;{data.turnover.total.tolerance}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">CUPA Benchmark</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {data.turnover.total.benchmark}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-3">
                {Object.values(data.turnover)
                  .filter(item => item.label !== 'Total')
                  .map((item, index) => {
                    const statusColors = getStatusColor(item.status);
                    return (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <RiskStatusDot status={item.status} size="sm" />
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-lg font-bold ${statusColors.text}`}>
                            {item.current}%
                          </span>
                          <span className="text-xs text-gray-400">
                            (Benchmark: {item.benchmark}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* OPEN POSITIONS Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden print:shadow-none">
            <div
              className="h-1"
              style={{backgroundColor: '#00245D'}}
            />
            <div className="p-6 print:p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Clock style={{color: '#00245D'}} size={20} />
                  Time to Fill
                </h2>
                <RiskStatusBadge status="good" size="sm" />
              </div>

              {/* Position Cards */}
              <div className="space-y-4">
                {Object.values(data.openPositions).map((position, index) => {
                  const statusColors = getStatusColor(position.status);
                  const percentOfCheckpoint = (position.currentDays / position.checkpoint) * 100;

                  return (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border-l-4"
                      style={{borderLeftColor: '#00245D'}}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">{position.label}</span>
                        <RiskStatusBadge status={position.status} size="sm" showLabel={false} />
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className={`text-2xl font-bold ${statusColors.text}`}>
                            {position.currentDays} days
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Average fill time
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            Checkpoint: {position.checkpoint}d
                          </div>
                          <div className="text-xs text-gray-500">
                            Tolerance: {position.tolerance}d
                          </div>
                        </div>
                      </div>

                      {/* Mini progress indicator */}
                      <div className="mt-3">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{width: `${Math.min(percentOfCheckpoint, 100)}%`}}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>0</span>
                          <span className="text-yellow-500">{position.checkpoint}d</span>
                          <span className="text-red-500">{position.tolerance}d</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* HR Management Areas - Bento Grid */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 print:p-4 print:shadow-none print:mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield style={{color: '#00245D'}} size={20} />
            HR Management Areas
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(data.talentManagement).map(([key, area], index) => {
              const IconComponent = iconMap[area.icon] || Shield;
              const statusColors = getStatusColor(area.status);

              return (
                <div
                  key={key}
                  className={`rounded-lg p-4 border-2 ${statusColors.border} ${statusColors.bg} text-center transition-all hover:shadow-md`}
                >
                  <div className="flex justify-center mb-2">
                    <div className="p-2 rounded-lg bg-white/80">
                      <IconComponent size={20} style={{color: '#00245D'}} />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{area.label}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{area.description}</div>
                  <div className="mt-2">
                    <RiskStatusBadge status={area.status} size="sm" showIcon={false} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 print:bg-gray-50">
          <div className="flex items-start gap-3">
            <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-2">About This Report</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-blue-800">
                <div>
                  <span className="font-medium">Status Thresholds:</span>
                  <ul className="mt-1 space-y-0.5">
                    <li className="flex items-center gap-1">
                      <RiskStatusDot status="good" size="sm" />
                      <span>Good - Below checkpoint</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <RiskStatusDot status="checkpoint" size="sm" />
                      <span>Checkpoint - Needs monitoring</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <RiskStatusDot status="tolerance" size="sm" />
                      <span>Tolerance - Action required</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <span className="font-medium">Data Sources:</span>
                  <ul className="mt-1 space-y-0.5">
                    <li>• Turnover: Rolling 12-month</li>
                    <li>• Benchmarks: CUPA-HR 2024</li>
                    <li>• Fill Time: 90-day average</li>
                  </ul>
                </div>
                <div>
                  <span className="font-medium">Report Details:</span>
                  <ul className="mt-1 space-y-0.5">
                    <li>• Frequency: {data.reportingFrequency}</li>
                    <li>• Period: {data.fiscalPeriod}</li>
                    <li>• Owner: {data.reportedBy}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CardGridLayout;
