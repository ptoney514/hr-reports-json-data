import React from 'react';

/**
 * RiskProgressBar - Horizontal bar showing value within risk zones
 *
 * Displays a progress bar with color-coded zones:
 * - Green zone: 0 to checkpoint (good)
 * - Yellow zone: checkpoint to tolerance (warning)
 * - Red zone: tolerance to max (critical)
 *
 * @param {number} value - Current value to display
 * @param {number} checkpoint - Checkpoint threshold (start of yellow zone)
 * @param {number} tolerance - Tolerance threshold (start of red zone)
 * @param {number} max - Maximum value for the scale (defaults to tolerance * 1.25)
 * @param {boolean} showLabels - Whether to show threshold labels
 * @param {boolean} showValue - Whether to show the current value
 * @param {string} unit - Unit to display with value (e.g., '%', 'days')
 * @param {string} size - 'sm', 'md', or 'lg'
 * @param {string} className - Additional CSS classes
 */
const RiskProgressBar = ({
  value = 0,
  checkpoint = 16,
  tolerance = 24,
  max = null,
  showLabels = false,
  showValue = true,
  unit = '%',
  size = 'md',
  className = ''
}) => {
  // Calculate max if not provided
  const effectiveMax = max || Math.max(tolerance * 1.25, value * 1.1);

  // Calculate percentages for zone widths
  const checkpointPercent = (checkpoint / effectiveMax) * 100;
  const tolerancePercent = ((tolerance - checkpoint) / effectiveMax) * 100;
  const redZonePercent = 100 - checkpointPercent - tolerancePercent;

  // Calculate value position
  const valuePercent = Math.min((value / effectiveMax) * 100, 100);

  // Determine current status
  const getStatus = () => {
    if (value >= tolerance) return 'tolerance';
    if (value >= checkpoint) return 'checkpoint';
    return 'good';
  };

  const status = getStatus();

  // Size configurations
  const sizeConfig = {
    sm: {
      height: 'h-2',
      markerHeight: 'h-4',
      fontSize: 'text-xs',
      valueFontSize: 'text-sm'
    },
    md: {
      height: 'h-3',
      markerHeight: 'h-5',
      fontSize: 'text-xs',
      valueFontSize: 'text-base'
    },
    lg: {
      height: 'h-4',
      markerHeight: 'h-6',
      fontSize: 'text-sm',
      valueFontSize: 'text-lg'
    }
  };

  const sizeStyles = sizeConfig[size] || sizeConfig.md;

  // Status colors for the value indicator
  const statusColors = {
    good: 'bg-green-600',
    checkpoint: 'bg-yellow-600',
    tolerance: 'bg-red-600'
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Value display */}
      {showValue && (
        <div className="flex justify-between items-center mb-1">
          <span className={`font-semibold ${sizeStyles.valueFontSize} text-gray-900`}>
            {value}{unit}
          </span>
          <span className={`${sizeStyles.fontSize} text-gray-500`}>
            Max: {effectiveMax.toFixed(0)}{unit}
          </span>
        </div>
      )}

      {/* Progress bar container */}
      <div className="relative">
        {/* Background zones */}
        <div className={`flex ${sizeStyles.height} rounded-full overflow-hidden bg-gray-100`}>
          {/* Green zone (0 to checkpoint) */}
          <div
            className="bg-green-200 print:bg-gray-200"
            style={{ width: `${checkpointPercent}%` }}
          />
          {/* Yellow zone (checkpoint to tolerance) */}
          <div
            className="bg-yellow-200 print:bg-gray-300"
            style={{ width: `${tolerancePercent}%` }}
          />
          {/* Red zone (tolerance to max) */}
          <div
            className="bg-red-200 print:bg-gray-400"
            style={{ width: `${redZonePercent}%` }}
          />
        </div>

        {/* Value indicator bar */}
        <div
          className={`absolute top-0 left-0 ${sizeStyles.height} rounded-full transition-all duration-300 ${statusColors[status]} print:bg-black`}
          style={{ width: `${valuePercent}%` }}
        />

        {/* Threshold markers */}
        {showLabels && (
          <>
            {/* Checkpoint marker */}
            <div
              className="absolute top-0 w-0.5 bg-yellow-600 print:bg-gray-600"
              style={{
                left: `${checkpointPercent}%`,
                height: sizeStyles.markerHeight
              }}
            />
            {/* Tolerance marker */}
            <div
              className="absolute top-0 w-0.5 bg-red-600 print:bg-gray-800"
              style={{
                left: `${(checkpoint + (tolerance - checkpoint)) / effectiveMax * 100}%`,
                height: sizeStyles.markerHeight
              }}
            />
          </>
        )}
      </div>

      {/* Labels below bar */}
      {showLabels && (
        <div className="flex justify-between mt-1">
          <span className={`${sizeStyles.fontSize} text-gray-500`}>0</span>
          <span
            className={`${sizeStyles.fontSize} text-yellow-600 print:text-gray-600`}
            style={{ marginLeft: `${checkpointPercent - 5}%` }}
          >
            {checkpoint}
          </span>
          <span
            className={`${sizeStyles.fontSize} text-red-600 print:text-gray-800`}
            style={{ marginLeft: `${tolerancePercent - 5}%` }}
          >
            {tolerance}
          </span>
          <span className={`${sizeStyles.fontSize} text-gray-500`}>
            {effectiveMax.toFixed(0)}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * RiskProgressBarCompact - Simplified inline version without labels
 */
export const RiskProgressBarCompact = ({
  value = 0,
  checkpoint = 16,
  tolerance = 24,
  max = null,
  className = ''
}) => {
  const effectiveMax = max || Math.max(tolerance * 1.25, value * 1.1);
  const valuePercent = Math.min((value / effectiveMax) * 100, 100);

  const getStatus = () => {
    if (value >= tolerance) return 'tolerance';
    if (value >= checkpoint) return 'checkpoint';
    return 'good';
  };

  const status = getStatus();
  const statusColors = {
    good: 'bg-green-500',
    checkpoint: 'bg-yellow-500',
    tolerance: 'bg-red-500'
  };

  return (
    <div className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-300 ${statusColors[status]} print:bg-black`}
        style={{ width: `${valuePercent}%` }}
      />
    </div>
  );
};

export default RiskProgressBar;
