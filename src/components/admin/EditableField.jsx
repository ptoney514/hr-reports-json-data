import React, { useState, useCallback, useEffect } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

const EditableField = ({ value, onChange, type, fieldKey }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState(null);

  // Update edit value when prop value changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Validate the input value
  const validateValue = useCallback((val) => {
    setError(null);

    if (type === 'number') {
      const num = parseFloat(val);
      if (isNaN(num)) {
        setError('Must be a valid number');
        return false;
      }
      
      // Additional validation for specific field types
      if (fieldKey.includes('Count') || fieldKey.includes('Total') || fieldKey.includes('Employees')) {
        if (num < 0) {
          setError('Count fields cannot be negative');
          return false;
        }
        if (num > 100000) {
          setError('Value seems unusually large');
          return false;
        }
      }
      
      if (fieldKey.includes('Rate') || fieldKey.includes('Percentage')) {
        if (num < 0 || num > 100) {
          setError('Percentage values should be between 0 and 100');
          return false;
        }
      }
    }

    if (type === 'string') {
      if (val.trim().length === 0) {
        setError('Value cannot be empty');
        return false;
      }
      if (val.length > 500) {
        setError('Value too long (max 500 characters)');
        return false;
      }
    }

    return true;
  }, [type, fieldKey]);

  // Handle save
  const handleSave = useCallback(() => {
    if (!validateValue(editValue)) {
      return;
    }

    let processedValue = editValue;
    if (type === 'number') {
      processedValue = parseFloat(editValue);
    }

    onChange(processedValue);
    setIsEditing(false);
    setError(null);
  }, [editValue, onChange, type, validateValue]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
  }, [value]);

  // Handle key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  // Format display value
  const formatDisplayValue = (val) => {
    if (type === 'number') {
      return val.toLocaleString();
    }
    return String(val);
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="text-left w-full px-2 py-1 rounded hover:bg-blue-50 hover:text-blue-700 transition-colors"
      >
        {formatDisplayValue(value)}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1">
        <input
          type={type === 'number' ? 'number' : 'text'}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={() => {
            // Auto-save on blur if valid
            if (validateValue(editValue)) {
              handleSave();
            }
          }}
          className={`w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          autoFocus
          step={type === 'number' ? 'any' : undefined}
        />
        {error && (
          <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
            <AlertCircle size={12} />
            {error}
          </div>
        )}
      </div>

      <div className="flex gap-1">
        <button
          onClick={handleSave}
          disabled={!!error}
          className="p-1 text-green-600 hover:bg-green-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          title="Save changes"
        >
          <Check size={14} />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 text-red-600 hover:bg-red-100 rounded"
          title="Cancel changes"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default EditableField;