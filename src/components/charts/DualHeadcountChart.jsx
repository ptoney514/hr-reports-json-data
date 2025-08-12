import React, { memo, useState, useCallback, useEffect } from 'react';
import HeadcountChart from './HeadcountChart';
import { announceToScreenReader } from '../../utils/accessibilityUtils';

/**
 * DualHeadcountChart - Synchronized dual location headcount charts
 * Provides synchronized hover interactions between Phoenix and Omaha charts
 */
const DualHeadcountChart = memo(({ 
  phoenixData = [], 
  omahaData = [],
  phoenixTitle = "Phoenix Headcount Trends",
  omahaTitle = "Omaha Headcount Trends",
  height = 350,
  showLegend = true,
  className = ""
}) => {
  // Shared hover state for synchronization
  const [hoveredDataKey, setHoveredDataKey] = useState(null);
  const [hoveredPeriod, setHoveredPeriod] = useState(null);

  // Synchronized hover handlers
  const handleMouseEnter = useCallback((dataKey, period) => {
    setHoveredDataKey(dataKey);
    setHoveredPeriod(period);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredDataKey(null);
    setHoveredPeriod(null);
  }, []);

  // Announce synchronized interactions to screen readers
  useEffect(() => {
    if (hoveredDataKey && hoveredPeriod) {
      announceToScreenReader(
        `Highlighting ${hoveredDataKey} for ${hoveredPeriod} in both Phoenix and Omaha charts`,
        'polite'
      );
    }
  }, [hoveredDataKey, hoveredPeriod]);

  return (
    <section 
      role="region" 
      aria-labelledby="dual-headcount-title"
      aria-describedby="dual-headcount-description"
      className={`space-y-4 ${className}`}
    >
      {/* Hidden description for screen readers */}
      <div id="dual-headcount-description" className="sr-only">
        Synchronized headcount charts for Phoenix and Omaha locations. 
        Hover or focus on data points to highlight corresponding values in both charts. 
        Navigate with Tab and arrow keys. Charts display Faculty, Staff, and HSP employee counts over time.
      </div>

      {/* Section Header */}
      <div className="mb-4">
        <h2 id="dual-headcount-title" className="text-xl font-semibold text-gray-900 mb-2">
          Headcount Trends by Location
        </h2>
        <p className="text-sm text-gray-600">
          Employee counts by category across Phoenix and Omaha campuses
        </p>
      </div>

      {/* Dual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-2">
        <HeadcountChart
          data={phoenixData}
          title={phoenixTitle}
          height={height}
          showLegend={showLegend}
          hoveredDataKey={hoveredDataKey}
          hoveredPeriod={hoveredPeriod}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          yAxisDomain={[0, 1000]}
          className="transition-all duration-200"
          aria-controls="omaha-headcount-chart"
          aria-describedby="sync-explanation"
        />
        <HeadcountChart
          data={omahaData}
          title={omahaTitle}
          height={height}
          showLegend={showLegend}
          hoveredDataKey={hoveredDataKey}
          hoveredPeriod={hoveredPeriod}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="transition-all duration-200"
          aria-controls="phoenix-headcount-chart"
          aria-describedby="sync-explanation"
        />
      </div>

      {/* Synchronization explanation for screen readers */}
      <div id="sync-explanation" className="sr-only">
        These charts are synchronized. Interactions with one chart will highlight corresponding data in the other chart.
      </div>

      {/* Data Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-1">Phoenix Campus</h4>
          <p>Smaller scale with visible trends in all employee categories</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <h4 className="font-medium text-green-900 mb-1">Omaha Campus</h4>
          <p>Main campus with larger workforce and detailed category breakdown</p>
        </div>
      </div>
    </section>
  );
});

DualHeadcountChart.displayName = 'DualHeadcountChart';

export default DualHeadcountChart;