import React, { memo, useMemo, useState, useRef, useEffect, useCallback } from 'react';
// Standard recharts imports
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { AlertCircle } from 'lucide-react';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';
import { generateChartAriaLabel, generateChartAriaDescription, handleChartKeyNavigation, announceToScreenReader } from '../../utils/accessibilityUtils';

const HeadcountChart = memo(({ 
  data = [], 
  title = "Historical Headcount",
  height = 300,
  showLegend = true,
  className = "",
  hoveredDataKey = null,
  hoveredPeriod = null,
  onMouseEnter = null,
  onMouseLeave = null,
  yAxisDomain = null,
  'aria-controls': ariaControls = null,
  'aria-describedby': ariaDescribedBy = null,
  ...otherProps
}) => {
  // Accessibility state
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);
  const chartRef = useRef(null);
  
  // Consistent color palette
  const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed'];

  // Memoize data keys calculation for performance (moved before early return)
  const dataKeys = useMemo(() => {
    return data && data.length > 0 ? Object.keys(data[0]).filter(key => 
      key !== 'period' && key !== 'quarter' && key !== 'month' && key !== 'name'
    ) : [];
  }, [data]);

  // Get x-axis key
  const xAxisKey = useMemo(() => {
    return data.length > 0 ? (
      data[0].period ? 'period' : 
      data[0].quarter ? 'quarter' : 
      data[0].month ? 'month' : 
      data[0].name ? 'name' : 
      Object.keys(data[0])[0]
    ) : 'period';
  }, [data]);

  // Generate accessibility attributes
  const ariaLabel = useMemo(() => generateChartAriaLabel('bar', data, title), [data, title]);
  const ariaDescription = useMemo(() => generateChartAriaDescription(data, 'bar'), [data]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event) => {
    if (!isKeyboardFocused) return;
    
    handleChartKeyNavigation(event, data, selectedIndex, (newIndex) => {
      setSelectedIndex(newIndex);
      // Announce the selected data point
      const item = data[newIndex];
      if (item) {
        const period = item[xAxisKey];
        const values = dataKeys.map(key => `${key}: ${item[key]?.toLocaleString() || 0}`).join(', ');
        announceToScreenReader(`${period}, ${values}`);
      }
    });
  }, [isKeyboardFocused, data, selectedIndex, dataKeys, xAxisKey]);

  // Focus handlers
  const handleFocus = useCallback(() => {
    setIsKeyboardFocused(true);
    announceToScreenReader(`Focused on ${title}. ${ariaDescription}`);
  }, [title, ariaDescription]);

  const handleBlur = useCallback(() => {
    setIsKeyboardFocused(false);
  }, []);

  // Effect to set up keyboard listeners
  useEffect(() => {
    const chartElement = chartRef.current;
    if (chartElement) {
      chartElement.addEventListener('keydown', handleKeyDown);
      return () => {
        chartElement.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown]);

  // Custom tooltip formatter
  const CustomTooltip = useCallback(({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  }, []);

  // Custom bar label formatter for top positioning
  const CustomBarLabel = useCallback(({ x, y, width, value }) => {
    if (!value || value === 0) return null;
    
    // Format value for display
    const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
    
    // Position label at the top of the bar with some padding
    const labelX = x + width / 2; // Horizontally centered
    const labelY = y - 8;          // 8px above the bar
    
    return (
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        fill="#374151"
        fontSize="12"
        fontWeight="500"
      >
        {formattedValue}
      </text>
    );
  }, []);

  // Error handling for missing or invalid data
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow-sm border ${className}`}>
        <h3 className="text-lg font-semibold text-blue-700 mb-3">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto mb-2 text-gray-400" />
            <p>No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChartErrorBoundary
      chartType="Bar Chart"
      title={title}
      height={height}
      className={className}
      onRetry={() => window.location.reload()}
    >
      <div 
        ref={chartRef}
        id={`headcount-chart-${Date.now()}`}
        data-chart-id="headcount-chart"
        data-chart-title={title}
        className={`bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray chart-focusable ${className}`}
        role="img"
        aria-label={ariaLabel}
        aria-describedby={[`headcount-chart-desc-${Date.now()}`, ariaDescribedBy].filter(Boolean).join(' ')}
        aria-controls={ariaControls}
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
          {title}
        </h3>
        
        {/* Hidden description for screen readers */}
        <div 
          id={`headcount-chart-desc-${Date.now()}`}
          className="sr-only"
        >
          {ariaDescription}
          {isKeyboardFocused && data.length > 0 && (
            <span>
              Currently focused on data point {selectedIndex + 1} of {data.length}. 
              {data[selectedIndex] && (
                <span>
                  {data[selectedIndex][xAxisKey]}: 
                  {dataKeys.map(key => 
                    ` ${key} ${data[selectedIndex][key]?.toLocaleString() || 0}`
                  ).join(',')}
                </span>
              )}
            </span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={height} className="print:h-48">
          <BarChart 
            data={data} 
            margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xAxisKey}
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
              tickFormatter={(value) => value.toLocaleString()}
              domain={yAxisDomain || [0, 'dataMax']}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="rect"
              />
            )}
            {dataKeys.map((key, index) => (
              <Bar 
                key={key}
                dataKey={key} 
                fill={colors[index % colors.length]}
                fillOpacity={hoveredDataKey && hoveredDataKey !== key ? 0.3 : 1}
                radius={[2, 2, 0, 0]}
                onMouseEnter={(data, index) => {
                  if (onMouseEnter) {
                    onMouseEnter(key, data.payload ? data.payload.period : null);
                  }
                }}
                onMouseLeave={() => {
                  if (onMouseLeave) {
                    onMouseLeave();
                  }
                }}
              >
                <LabelList content={CustomBarLabel} />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartErrorBoundary>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.data === nextProps.data &&
    prevProps.title === nextProps.title &&
    prevProps.height === nextProps.height &&
    prevProps.showLegend === nextProps.showLegend &&
    prevProps.className === nextProps.className &&
    prevProps.hoveredDataKey === nextProps.hoveredDataKey &&
    prevProps.hoveredPeriod === nextProps.hoveredPeriod &&
    prevProps.onMouseEnter === nextProps.onMouseEnter &&
    prevProps.onMouseLeave === nextProps.onMouseLeave &&
    JSON.stringify(prevProps.yAxisDomain) === JSON.stringify(nextProps.yAxisDomain)
  );
});

export default HeadcountChart; 