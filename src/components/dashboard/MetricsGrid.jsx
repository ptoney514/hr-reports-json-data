import React from 'react';
import SummaryCard from '../ui/SummaryCard';
import { 
  Users, 
  GraduationCap, 
  Building2, 
  UserPlus, 
  UserMinus,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';

/**
 * Reusable Metrics Grid Component
 * 
 * Displays key performance metrics in a responsive grid layout using the existing SummaryCard component.
 * Optimized for both screen display and printing with proper styling and responsive design.
 * 
 * @param {Object} props
 * @param {Array} props.metrics - Array of metric objects
 * @param {string} props.layout - Grid layout type: 'default', 'compact', 'wide' (default: 'default')
 * @param {string} props.className - Additional CSS classes
 */

// Default icon mapping for common metrics
const METRIC_ICONS = {
  'total': Users,
  'headcount': Users,
  'employees': Users,
  'faculty': GraduationCap,
  'staff': Building2,
  'new_hires': UserPlus,
  'hires': UserPlus,
  'leavers': UserMinus,
  'departures': UserMinus,
  'turnover': TrendingDown,
  'retention': TrendingUp,
  'vacancies': UserMinus,
  'growth': TrendingUp,
  'analytics': BarChart3,
  'default': BarChart3
};

/**
 * Get appropriate icon for metric based on title or type
 */
const getMetricIcon = (metric) => {
  if (metric.icon) {
    return metric.icon;
  }

  // Auto-detect icon based on metric title/type
  const key = (metric.title || metric.type || '').toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z_]/g, '');

  for (const [pattern, icon] of Object.entries(METRIC_ICONS)) {
    if (key.includes(pattern)) {
      return icon;
    }
  }

  return METRIC_ICONS.default;
};

/**
 * Get grid layout classes based on layout type and number of metrics
 */
const getGridClasses = (layout, metricCount) => {
  const baseClasses = 'grid gap-4 mb-6 dashboard-section page-break-inside-avoid';
  
  switch (layout) {
    case 'compact':
      return `${baseClasses} grid-cols-2 md:grid-cols-4 lg:grid-cols-6`;
    case 'wide':
      return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`;
    case 'auto':
      // Auto-adjust based on metric count
      if (metricCount <= 3) {
        return `${baseClasses} grid-cols-1 md:grid-cols-${metricCount}`;
      } else if (metricCount <= 5) {
        return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(metricCount, 5)}`;
      } else {
        return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-6`;
      }
    default:
      // Default responsive layout
      return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(metricCount, 6)}`;
  }
};

const MetricsGrid = ({ 
  metrics = [], 
  layout = 'default', 
  className = '' 
}) => {
  if (!metrics || metrics.length === 0) {
    return (
      <div className="dashboard-section page-break-inside-avoid">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Metrics Available</h3>
          <p className="text-gray-500">Metrics data is being loaded or not available for the selected filters.</p>
        </div>
      </div>
    );
  }

  const gridClasses = getGridClasses(layout, metrics.length);

  return (
    <div className={`${gridClasses} ${className}`}>
      {metrics.map((metric, index) => {
        // Process metric data to match SummaryCard props
        const processedMetric = {
          title: metric.title || metric.label || `Metric ${index + 1}`,
          value: metric.value !== undefined ? metric.value : 0,
          change: metric.change,
          changeType: metric.changeType || metric.format || 'number',
          subtitle: metric.subtitle || metric.description,
          icon: getMetricIcon(metric),
          trend: metric.trend || (metric.change > 0 ? 'positive' : metric.change < 0 ? 'negative' : 'neutral'),
          target: metric.target,
          className: `summary-card metric-card ${metric.className || ''}`
        };

        // Handle different value formats
        if (typeof processedMetric.value === 'number') {
          if (processedMetric.changeType === 'percentage') {
            processedMetric.value = `${processedMetric.value}%`;
          } else if (processedMetric.changeType === 'currency') {
            processedMetric.value = `$${processedMetric.value.toLocaleString()}`;
          } else if (processedMetric.changeType === 'number' && processedMetric.value >= 1000) {
            processedMetric.value = processedMetric.value.toLocaleString();
          }
        }

        return (
          <SummaryCard
            key={metric.id || metric.title || index}
            {...processedMetric}
          />
        );
      })}
    </div>
  );
};

export default MetricsGrid;