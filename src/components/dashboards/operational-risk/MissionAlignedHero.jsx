import React from 'react';
import {
  Shield,
  TrendingDown,
  Clock,
  Users,
  UserPlus,
  BookOpen,
  Heart,
  Settings,
  Gift,
  DollarSign,
  Award,
  CheckCircle,
  Info
} from 'lucide-react';
import { operationalRiskData, getStatusColor } from '../../../data/operationalRiskData';
import RiskStatusBadge, { RiskStatusDot } from '../../ui/RiskStatusBadge';
import RiskProgressBar from '../../ui/RiskProgressBar';

/**
 * MissionAlignedHero - Concept 3
 *
 * Dark navy hero design with mission-aligned inspirational messaging.
 * Features horizontal progress bars with risk zones.
 *
 * Structure:
 * - Dark Hero Section (bg-gray-900)
 * - Key Risk Indicators (horizontal bars)
 * - Category Cards Grid
 */
const MissionAlignedHero = () => {
  const data = operationalRiskData;

  // Creighton University brand color
  const creightonNavy = '#00245D';

  // Icon mapping
  const iconMap = {
    UserPlus: UserPlus,
    BookOpen: BookOpen,
    Heart: Heart,
    Settings: Settings,
    Gift: Gift,
    DollarSign: DollarSign
  };

  // Calculate overall performance message
  const getPerformanceMessage = () => {
    const allGood = Object.values(data.turnover).every(t => t.status === 'good');
    if (allGood) {
      return "All turnover indicators are performing well, supporting our commitment to workforce stability and mission continuity.";
    }
    return "Some indicators require attention. Review the details below for areas needing focus.";
  };

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">

      {/* Dark Hero Section */}
      <div
        className="text-white py-12 px-6 print:py-6 print:bg-gray-800"
        style={{
          background: `linear-gradient(135deg, ${creightonNavy} 0%, #001a47 100%)`
        }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-6 mb-8 print:mb-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <Shield className="text-white" size={36} />
              </div>
              <div>
                <h1 className="text-3xl font-bold print:text-2xl">
                  {data.reportTitle}
                </h1>
                <p className="text-blue-200 text-sm mt-1">
                  {data.fiscalPeriod} | {data.reportingFrequency} Report
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 border border-green-400/40 rounded-full px-5 py-2 flex items-center gap-2">
                <CheckCircle className="text-green-400" size={22} />
                <span className="text-green-300 font-bold text-sm uppercase tracking-wide">
                  {data.overallRisk.label}
                </span>
              </div>
            </div>
          </div>

          {/* Inspirational Message */}
          <div className="bg-white/5 rounded-xl p-6 mb-8 backdrop-blur-sm border border-white/10 print:bg-transparent print:border-gray-600">
            <div className="flex items-start gap-4">
              <Award className="text-yellow-400 flex-shrink-0" size={28} />
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Sustaining Our Mission Through Workforce Stability
                </h2>
                <p className="text-blue-100 text-sm leading-relaxed">
                  {getPerformanceMessage()}
                </p>
              </div>
            </div>
          </div>

          {/* Key Risk Indicators - Horizontal Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
            {/* Turnover Indicator */}
            <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="text-blue-300" size={20} />
                  <span className="text-sm font-medium text-blue-200 uppercase tracking-wide">
                    Total Turnover
                  </span>
                </div>
                <RiskStatusBadge status={data.turnover.total.status} size="sm" />
              </div>
              <div className="flex items-end gap-4 mb-4">
                <span className="text-4xl font-bold text-white">
                  {data.turnover.total.current}%
                </span>
                <span className="text-sm text-blue-300 pb-1">
                  CUPA Benchmark: {data.turnover.total.benchmark}%
                </span>
              </div>
              {/* Custom styled progress bar for dark background */}
              <div className="relative h-3 rounded-full overflow-hidden">
                <div className="absolute inset-0 flex">
                  <div className="bg-green-600/60" style={{width: `${(data.turnover.total.checkpoint / 30) * 100}%`}} />
                  <div className="bg-yellow-600/60" style={{width: `${((data.turnover.total.tolerance - data.turnover.total.checkpoint) / 30) * 100}%`}} />
                  <div className="bg-red-600/60 flex-1" />
                </div>
                <div
                  className="absolute top-0 left-0 h-full bg-white rounded-full transition-all"
                  style={{width: `${(data.turnover.total.current / 30) * 100}%`}}
                />
              </div>
              <div className="flex justify-between text-xs text-blue-300 mt-1">
                <span>0%</span>
                <span className="text-yellow-400">{data.turnover.total.checkpoint}%</span>
                <span className="text-red-400">{data.turnover.total.tolerance}%</span>
                <span>30%</span>
              </div>
            </div>

            {/* Time to Fill Indicator */}
            <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="text-blue-300" size={20} />
                  <span className="text-sm font-medium text-blue-200 uppercase tracking-wide">
                    Average Time to Fill
                  </span>
                </div>
                <RiskStatusBadge status="good" size="sm" />
              </div>
              <div className="flex items-end gap-4 mb-4">
                <span className="text-4xl font-bold text-white">
                  {Math.round((data.openPositions.staffExempt.currentDays + data.openPositions.staffNonExempt.currentDays) / 2)} days
                </span>
                <span className="text-sm text-blue-300 pb-1">
                  Target: &lt;{data.openPositions.staffExempt.checkpoint} days
                </span>
              </div>
              {/* Custom styled progress bar for dark background */}
              <div className="relative h-3 rounded-full overflow-hidden">
                <div className="absolute inset-0 flex">
                  <div className="bg-green-600/60" style={{width: `${(90 / 150) * 100}%`}} />
                  <div className="bg-yellow-600/60" style={{width: `${((120 - 90) / 150) * 100}%`}} />
                  <div className="bg-red-600/60 flex-1" />
                </div>
                <div
                  className="absolute top-0 left-0 h-full bg-white rounded-full transition-all"
                  style={{width: `${(62 / 150) * 100}%`}}
                />
              </div>
              <div className="flex justify-between text-xs text-blue-300 mt-1">
                <span>0d</span>
                <span className="text-yellow-400">90d</span>
                <span className="text-red-400">120d</span>
                <span>150d</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8 print:py-4">

        {/* Turnover by Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:gap-4 print:mb-4">
          {Object.values(data.turnover)
            .filter(item => item.label !== 'Total')
            .map((item, index) => {
              const statusColors = getStatusColor(item.status);
              const diff = item.current - item.benchmark;
              const isBelow = diff < 0;

              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border p-6 print:p-4 print:shadow-none hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users style={{color: creightonNavy}} size={18} />
                      <span className="text-sm font-semibold text-gray-900">{item.label}</span>
                    </div>
                    <RiskStatusBadge status={item.status} size="sm" showLabel={false} />
                  </div>

                  <div className="text-center py-4">
                    <div className={`text-4xl font-bold ${statusColors.text}`}>
                      {item.current}%
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Turnover Rate
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Checkpoint: &gt;{item.checkpoint}%</span>
                      <span>Tolerance: &gt;{item.tolerance}%</span>
                    </div>
                    <RiskProgressBar
                      value={item.current}
                      checkpoint={item.checkpoint}
                      tolerance={item.tolerance}
                      max={item.tolerance * 1.2}
                      showValue={false}
                      showLabels={false}
                      size="sm"
                    />
                    <div className="mt-3 text-center">
                      <span className="text-xs text-gray-500">vs CUPA Benchmark ({item.benchmark}%): </span>
                      <span className={`text-xs font-semibold ${isBelow ? 'text-green-600' : 'text-red-600'}`}>
                        {isBelow ? '' : '+'}{diff.toFixed(1)}pp
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Open Positions */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8 print:p-4 print:shadow-none print:mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock style={{color: creightonNavy}} size={20} />
            Time to Fill by Position Type
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(data.openPositions).map((position, index) => {
              const statusColors = getStatusColor(position.status);

              return (
                <div key={index} className="bg-gray-50 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-900">{position.label}</span>
                    <RiskStatusBadge status={position.status} size="sm" />
                  </div>
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <span className={`text-3xl font-bold ${statusColors.text}`}>
                        {position.currentDays}
                      </span>
                      <span className="text-lg text-gray-500 ml-1">days</span>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <div>Checkpoint: {position.checkpoint}d</div>
                      <div>Tolerance: {position.tolerance}d</div>
                    </div>
                  </div>
                  <RiskProgressBar
                    value={position.currentDays}
                    checkpoint={position.checkpoint}
                    tolerance={position.tolerance}
                    max={150}
                    showValue={false}
                    showLabels={false}
                    size="md"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* HR Management Areas */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 print:p-4 print:shadow-none print:mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield style={{color: creightonNavy}} size={20} />
            HR Management Areas
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(data.talentManagement).map(([key, area], index) => {
              const IconComponent = iconMap[area.icon] || Shield;
              const statusColors = getStatusColor(area.status);

              return (
                <div
                  key={key}
                  className={`rounded-xl p-4 border text-center transition-all hover:shadow-md ${statusColors.bg} ${statusColors.border}`}
                >
                  <div className="flex justify-center mb-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{backgroundColor: creightonNavy}}
                    >
                      <IconComponent size={18} className="text-white" />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{area.label}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{area.description}</div>
                  <div className="mt-3">
                    <RiskStatusDot status={area.status} size="md" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend & Notes */}
        <div className="bg-gray-100 rounded-xl p-4 print:bg-gray-50">
          <div className="flex items-start gap-3">
            <Info className="text-gray-500 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-gray-600">
              <p className="font-semibold text-gray-700 mb-2">Report Notes</p>
              <ul className="space-y-1">
                {data.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-6 mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-1">
                  <RiskStatusDot status="good" size="sm" />
                  <span>Good</span>
                </div>
                <div className="flex items-center gap-1">
                  <RiskStatusDot status="checkpoint" size="sm" />
                  <span>Checkpoint</span>
                </div>
                <div className="flex items-center gap-1">
                  <RiskStatusDot status="tolerance" size="sm" />
                  <span>Tolerance</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MissionAlignedHero;
