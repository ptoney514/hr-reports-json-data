import React from 'react';
import { CheckCircle, Clock, Users, AlertTriangle } from 'lucide-react';
import { MetricsGridProps } from '../../../types/components';
import SummaryCard from '../../ui/SummaryCard';

const MetricsGrid: React.FC<MetricsGridProps> = ({
  currentMetrics,
  previousMetrics,
  layout = 'grid',
  cardSize = 'medium',
  showComparison = true,
  showTrends = true,
  animateChanges = true,
  loading = false,
  className = '',
  ...ariaProps
}) => {
  // Calculate percentage changes
  const complianceChange = previousMetrics 
    ? ((currentMetrics.overallCompliance - previousMetrics.overallCompliance) / previousMetrics.overallCompliance * 100)
    : 0;
  
  const section2Change = previousMetrics 
    ? ((currentMetrics.section2Compliance - previousMetrics.section2Compliance) / previousMetrics.section2Compliance * 100)
    : 0;

  const totalFormsChange = previousMetrics 
    ? currentMetrics.totalI9s - previousMetrics.totalI9s
    : 0;

  const gridClass = layout === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-4 gap-4 print:gap-2' 
    : layout === 'row' 
    ? 'flex flex-wrap gap-4 print:gap-2'
    : 'flex flex-col gap-4 print:gap-2';

  if (loading) {
    return (
      <div className={`${gridClass} ${className}`} {...ariaProps}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm border animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div 
      className={`${gridClass} ${className}`}
      role="region"
      aria-label="Key Performance Metrics"
      {...ariaProps}
    >
      <SummaryCard
        title="Overall Compliance"
        value={`${currentMetrics.overallCompliance}%`}
        change={complianceChange}
        changeType="percentage"
        subtitle={`Target: 95% | Prev: ${previousMetrics?.overallCompliance || 'N/A'}%`}
        icon={CheckCircle}
        trend={complianceChange > 0 ? 'positive' : complianceChange < 0 ? 'negative' : 'neutral'}
        target="95%"
        className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray"
      />

      <SummaryCard
        title="Section 2 Timeliness"
        value={`${currentMetrics.section2Compliance}%`}
        change={section2Change}
        changeType="percentage"
        subtitle={`${currentMetrics.section2OnTime} on-time / ${currentMetrics.totalI9s} total`}
        icon={Clock}
        trend={section2Change > 0 ? 'positive' : section2Change < 0 ? 'negative' : 'neutral'}
        target="95%"
        className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray"
      />

      <SummaryCard
        title="Forms Processed"
        value={currentMetrics.totalI9s.toLocaleString()}
        change={totalFormsChange}
        changeType="number"
        subtitle={`${totalFormsChange >= 0 ? '+' : ''}${totalFormsChange} vs prev quarter`}
        icon={Users}
        trend={totalFormsChange > 0 ? 'positive' : totalFormsChange < 0 ? 'negative' : 'neutral'}
        target={previousMetrics?.totalI9s ? `${previousMetrics.totalI9s}` : undefined}
        className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray"
      />

      <SummaryCard
        title="Audit Readiness"
        value={`${currentMetrics.auditReady}%`}
        change={0}
        changeType="percentage"
        subtitle="Risk factors identified: 4"
        icon={AlertTriangle}
        trend="neutral"
        target="90%"
        className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray"
      />
    </div>
  );
};

export default MetricsGrid;