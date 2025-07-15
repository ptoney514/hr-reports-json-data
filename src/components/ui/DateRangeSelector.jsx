import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, Check, X, AlertCircle, CheckCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subDays, subMonths, startOfQuarter, endOfQuarter, isWithinInterval, parseISO } from 'date-fns';
import { QUARTER_DATES } from '../../utils/quarterlyDataProcessor';

/**
 * DateRangeSelector Component
 * Provides both quarter-based and custom date range selection
 */
const DateRangeSelector = ({ 
  value, 
  onChange, 
  availableQuarters = null,
  minDate = null,
  maxDate = null,
  className = "",
  showPresets = true,
  mode = 'quarter', // 'quarter' | 'custom' | 'both'
  dataAvailability = null // Object with quarter keys and availability status
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(mode === 'both' ? 'quarter' : mode);
  const [customRange, setCustomRange] = useState({ start: null, end: null });
  const dropdownRef = useRef(null);

  // Use provided quarters or default to all quarters
  const quarters = availableQuarters || QUARTER_DATES;

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize custom range from value if provided
  useEffect(() => {
    if (value && typeof value === 'object' && value.start && value.end) {
      setCustomRange({ start: value.start, end: value.end });
      setSelectionMode('custom');
    } else if (value && typeof value === 'string') {
      // It's a quarter value
      setSelectionMode('quarter');
    }
  }, [value]);

  // Preset date ranges
  const presetRanges = [
    {
      label: 'Last 30 days',
      getValue: () => ({
        start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
      })
    },
    {
      label: 'Last 90 days',
      getValue: () => ({
        start: format(subDays(new Date(), 90), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
      })
    },
    {
      label: 'Last 6 months',
      getValue: () => ({
        start: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
      })
    },
    {
      label: 'This Quarter',
      getValue: () => ({
        start: format(startOfQuarter(new Date()), 'yyyy-MM-dd'),
        end: format(endOfQuarter(new Date()), 'yyyy-MM-dd')
      })
    },
    {
      label: 'Last Quarter',
      getValue: () => {
        const lastQuarter = subMonths(new Date(), 3);
        return {
          start: format(startOfQuarter(lastQuarter), 'yyyy-MM-dd'),
          end: format(endOfQuarter(lastQuarter), 'yyyy-MM-dd')
        };
      }
    },
    {
      label: 'Year to Date',
      getValue: () => ({
        start: format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
      })
    }
  ];

  // Handle quarter selection
  const handleQuarterSelect = (quarterValue) => {
    onChange(quarterValue);
    setIsOpen(false);
  };

  // Handle custom date range selection
  const handleCustomRangeChange = (field, value) => {
    const newRange = { ...customRange, [field]: value };
    setCustomRange(newRange);
  };

  // Apply custom date range
  const applyCustomRange = () => {
    if (customRange.start && customRange.end) {
      onChange({
        type: 'custom',
        start: customRange.start,
        end: customRange.end,
        label: `${format(parseISO(customRange.start), 'MMM d, yyyy')} - ${format(parseISO(customRange.end), 'MMM d, yyyy')}`
      });
      setIsOpen(false);
    }
  };

  // Apply preset range
  const applyPresetRange = (preset) => {
    const range = preset.getValue();
    setCustomRange(range);
    onChange({
      type: 'preset',
      ...range,
      label: preset.label
    });
    setIsOpen(false);
  };

  // Get display text for current selection
  const getDisplayText = () => {
    if (!value) return 'Select date range';
    
    if (typeof value === 'string') {
      // It's a quarter
      const quarter = quarters.find(q => q.value === value);
      return quarter ? quarter.label : value;
    } else if (value.label) {
      return value.label;
    } else if (value.start && value.end) {
      return `${format(parseISO(value.start), 'MMM d, yyyy')} - ${format(parseISO(value.end), 'MMM d, yyyy')}`;
    }
    
    return 'Select date range';
  };

  // Check if a date is within available data range
  const isDateAvailable = (date) => {
    if (!minDate && !maxDate) return true;
    
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (minDate && dateObj < parseISO(minDate)) return false;
    if (maxDate && dateObj > parseISO(maxDate)) return false;
    
    return true;
  };

  // Check data availability for a quarter
  const getQuarterDataStatus = (quarter) => {
    if (!dataAvailability) return 'unknown';
    return dataAvailability[quarter.value] || 'unknown';
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Date Range
      </label>
      
      {/* Dropdown trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{getDisplayText()}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[400px] bg-white border border-gray-200 rounded-lg shadow-lg">
          {mode === 'both' && (
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setSelectionMode('quarter')}
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    selectionMode === 'quarter' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Select Quarter
                </button>
                <button
                  onClick={() => setSelectionMode('custom')}
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    selectionMode === 'custom' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Custom Range
                </button>
              </div>
            </div>
          )}

          <div className="p-4">
            {selectionMode === 'quarter' ? (
              // Quarter selection
              <div className="space-y-1">
                {quarters.map((quarter) => {
                  const isSelected = value === quarter.value;
                  const isAvailable = isDateAvailable(quarter.end_date);
                  const dataStatus = getQuarterDataStatus(quarter);
                  
                  return (
                    <button
                      key={quarter.value}
                      onClick={() => isAvailable && handleQuarterSelect(quarter.value)}
                      disabled={!isAvailable}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        isSelected 
                          ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200' 
                          : isAvailable
                            ? 'hover:bg-gray-50 text-gray-700 border border-transparent'
                            : 'text-gray-400 cursor-not-allowed border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{quarter.label}</span>
                          {dataStatus === 'complete' && (
                            <CheckCircle className="w-4 h-4 text-green-500" title="Data complete" />
                          )}
                          {dataStatus === 'partial' && (
                            <AlertCircle className="w-4 h-4 text-yellow-500" title="Partial data" />
                          )}
                          {dataStatus === 'empty' && (
                            <AlertCircle className="w-4 h-4 text-red-500" title="No data" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                          {!isAvailable && (
                            <span className="text-xs text-gray-400">Unavailable</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              // Custom date range selection
              <div className="space-y-4">
                {showPresets && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Select</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {presetRanges.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => applyPresetRange(preset)}
                          className="px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Range</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={customRange.start || ''}
                        onChange={(e) => handleCustomRangeChange('start', e.target.value)}
                        min={minDate}
                        max={maxDate}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={customRange.end || ''}
                        onChange={(e) => handleCustomRangeChange('end', e.target.value)}
                        min={customRange.start || minDate}
                        max={maxDate}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => {
                        setCustomRange({ start: null, end: null });
                        setIsOpen(false);
                      }}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={applyCustomRange}
                      disabled={!customRange.start || !customRange.end}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Data Availability Legend */}
          {selectionMode === 'quarter' && dataAvailability && (
            <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span className="font-medium">Data Status:</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Complete</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-yellow-500" />
                    <span>Partial</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    <span>No Data</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;