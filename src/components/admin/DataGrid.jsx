import React, { useState, useCallback } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Edit, 
  Check, 
  X, 
  AlertTriangle,
  Hash,
  Type,
  Calendar,
  Database
} from 'lucide-react';
import EditableField from './EditableField';

const DataGrid = ({ data, isEditMode, onChange, dashboardType, period }) => {
  const [expandedSections, setExpandedSections] = useState(new Set(['root']));
  const [editingField, setEditingField] = useState(null);

  // Toggle section expansion
  const toggleSection = useCallback((sectionKey) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
  }, []);

  // Handle field value changes
  const handleFieldChange = useCallback((fieldPath, newValue) => {
    if (!isEditMode) return;

    const pathArray = fieldPath.split('.');
    const newData = JSON.parse(JSON.stringify(data));
    
    // Navigate to the nested field and update it
    let current = newData;
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]];
    }
    current[pathArray[pathArray.length - 1]] = newValue;

    onChange(newData);
  }, [data, isEditMode, onChange]);

  // Get field type icon
  const getFieldTypeIcon = (value) => {
    if (typeof value === 'number') return <Hash size={14} className="text-blue-500" />;
    if (typeof value === 'string') return <Type size={14} className="text-green-500" />;
    if (value instanceof Date) return <Calendar size={14} className="text-purple-500" />;
    if (typeof value === 'object') return <Database size={14} className="text-orange-500" />;
    return null;
  };

  // Format value for display
  const formatValue = (value) => {
    if (value === null || value === undefined) return 'null';
    
    try {
      // Handle Firebase timestamp objects
      if (typeof value === 'object' && value.toDate && typeof value.toDate === 'function') {
        return value.toDate().toLocaleString();
      }
      // Handle regular Date objects
      if (value instanceof Date) {
        return value.toLocaleString();
      }
      // Handle date strings
      if (typeof value === 'string' && value.length > 0) {
        const dateObj = new Date(value);
        if (!isNaN(dateObj.getTime()) && (value.includes('T') || value.includes('-') || value.includes('/'))) {
          return dateObj.toLocaleString();
        }
      }
      // Handle objects
      if (typeof value === 'object') {
        return `{${Object.keys(value).length} properties}`;
      }
      return String(value);
    } catch (error) {
      console.warn('Error formatting value:', value, error);
      return String(value);
    }
  };

  // Check if value is editable
  const isEditableField = (key, value) => {
    // Don't edit timestamps, complex objects with many properties, or system fields
    if (key === 'lastUpdated' && (typeof value === 'object' || value instanceof Date)) return false;
    if (typeof value === 'object' && value !== null && Object.keys(value).length > 10) return false;
    if (key.startsWith('_')) return false; // System fields
    return true;
  };

  // Validate field value
  const validateField = (key, value, fieldPath) => {
    const warnings = [];
    
    // Check for negative values where they shouldn't exist
    if (typeof value === 'number' && value < 0 && 
        (key.includes('Count') || key.includes('Total') || key.includes('Employees'))) {
      warnings.push('Negative values not expected for count fields');
    }
    
    // Check for unreasonably large values
    if (typeof value === 'number' && value > 50000 && 
        (key.includes('Count') || key.includes('Employees'))) {
      warnings.push('Unusually large value - please verify');
    }
    
    return warnings;
  };

  // Render a single field
  const renderField = (key, value, fieldPath, depth = 0) => {
    const isExpanded = expandedSections.has(fieldPath);
    const isObject = typeof value === 'object' && value !== null && !value.toDate;
    const canEdit = isEditableField(key, value);
    const warnings = validateField(key, value, fieldPath);
    const hasWarnings = warnings.length > 0;

    return (
      <div key={fieldPath} className={`border-l-2 ${depth > 0 ? 'border-gray-200 ml-4' : 'border-transparent'}`}>
        <div className={`flex items-center gap-2 p-2 hover:bg-gray-50 ${hasWarnings ? 'bg-yellow-50' : ''}`}>
          {/* Expand/Collapse for objects */}
          {isObject && (
            <button
              onClick={() => toggleSection(fieldPath)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown size={14} className="text-gray-500" />
              ) : (
                <ChevronRight size={14} className="text-gray-500" />
              )}
            </button>
          )}
          
          {/* Field type icon */}
          <div className="w-5 flex justify-center">
            {getFieldTypeIcon(value)}
          </div>

          {/* Field name */}
          <div className="font-medium text-gray-700 min-w-[150px]">
            {key}
            {hasWarnings && (
              <AlertTriangle size={12} className="inline ml-1 text-yellow-500" />
            )}
          </div>

          {/* Field value */}
          <div className="flex-1">
            {isObject ? (
              <span className="text-gray-500 text-sm">
                {Array.isArray(value) ? `Array[${value.length}]` : `Object{${Object.keys(value).length}}`}
              </span>
            ) : canEdit && isEditMode ? (
              <EditableField
                value={value}
                onChange={(newValue) => handleFieldChange(fieldPath, newValue)}
                type={typeof value}
                fieldKey={key}
              />
            ) : (
              <span className="text-gray-900">
                {formatValue(value)}
              </span>
            )}
          </div>

          {/* Edit indicator */}
          {!isObject && canEdit && isEditMode && (
            <Edit size={14} className="text-blue-500" />
          )}
        </div>

        {/* Warnings */}
        {hasWarnings && (
          <div className="ml-8 mb-2">
            {warnings.map((warning, index) => (
              <div key={index} className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                ⚠️ {warning}
              </div>
            ))}
          </div>
        )}

        {/* Nested fields for expanded objects */}
        {isObject && isExpanded && (
          <div className="ml-4">
            {Object.entries(value).map(([nestedKey, nestedValue]) =>
              renderField(nestedKey, nestedValue, `${fieldPath}.${nestedKey}`, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
        No data to display
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {dashboardType.charAt(0).toUpperCase() + dashboardType.slice(1)} Data - {period}
            </h3>
            <p className="text-sm text-gray-600">
              {isEditMode ? 'Edit mode: Click on values to modify them' : 'View mode: Switch to edit mode to make changes'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditMode && (
              <div className="flex items-center gap-1 text-sm text-orange-600">
                <Edit size={14} />
                Edit Mode
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="max-h-[600px] overflow-y-auto">
        {Object.entries(data).map(([key, value]) =>
          renderField(key, value, key, 0)
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            {Object.keys(data).length} top-level fields
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Hash size={12} className="text-blue-500" />
              Numbers
            </div>
            <div className="flex items-center gap-1">
              <Type size={12} className="text-green-500" />
              Text
            </div>
            <div className="flex items-center gap-1">
              <Database size={12} className="text-orange-500" />
              Objects
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={12} className="text-purple-500" />
              Dates
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataGrid;