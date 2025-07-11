import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, X, Edit } from 'lucide-react';

const EditableTableCell = ({ 
  value, 
  format = 'text', 
  onChange, 
  isEditing, 
  onEditStart, 
  onEditEnd,
  disabled = false
}) => {
  const [editValue, setEditValue] = useState(value);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef(null);

  // Update edit value when prop value changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Validate input value
  const validateValue = useCallback((val) => {
    setHasError(false);
    setErrorMessage('');

    if (format === 'number') {
      const num = parseFloat(val);
      if (isNaN(num)) {
        setHasError(true);
        setErrorMessage('Must be a valid number');
        return false;
      }
      if (num < 0) {
        setHasError(true);
        setErrorMessage('Cannot be negative');
        return false;
      }
      if (num > 1000000) {
        setHasError(true);
        setErrorMessage('Value seems too large');
        return false;
      }
    }

    if (format === 'percentage') {
      const num = parseFloat(val);
      if (isNaN(num)) {
        setHasError(true);
        setErrorMessage('Must be a valid percentage');
        return false;
      }
      if (num < -100 || num > 1000) {
        setHasError(true);
        setErrorMessage('Percentage should be between -100 and 1000');
        return false;
      }
    }

    if (format === 'text' && typeof val === 'string' && val.trim().length === 0) {
      setHasError(true);
      setErrorMessage('Cannot be empty');
      return false;
    }

    return true;
  }, [format]);

  // Handle save
  const handleSave = useCallback(() => {
    if (!validateValue(editValue)) {
      return;
    }

    let processedValue = editValue;
    if (format === 'number' || format === 'percentage') {
      processedValue = parseFloat(editValue);
    }

    onChange(processedValue);
    onEditEnd();
  }, [editValue, format, onChange, onEditEnd, validateValue]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setEditValue(value);
    setHasError(false);
    setErrorMessage('');
    onEditEnd();
  }, [value, onEditEnd]);

  // Handle key press
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Tab') {
      // Allow tab to move to next cell
      handleSave();
    }
  }, [handleSave, handleCancel]);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setEditValue(newValue);
    
    // Clear error when user starts typing
    if (hasError) {
      setHasError(false);
      setErrorMessage('');
    }
  }, [hasError]);

  // Format display value
  const formatDisplayValue = useCallback((val) => {
    if (val === null || val === undefined || val === '') return '-';
    
    switch (format) {
      case 'number':
        return typeof val === 'number' ? val.toLocaleString() : val;
      case 'percentage':
        return typeof val === 'number' ? `${val.toFixed(1)}%` : val;
      case 'date':
        if (val?.toDate) return val.toDate().toLocaleDateString();
        if (val instanceof Date) return val.toLocaleDateString();
        return val;
      default:
        return String(val);
    }
  }, [format]);

  // Get input type
  const getInputType = () => {
    if (format === 'number' || format === 'percentage') return 'number';
    if (format === 'date') return 'date';
    return 'text';
  };

  // Get input step for numbers
  const getInputStep = () => {
    if (format === 'percentage') return '0.1';
    if (format === 'number') return '1';
    return undefined;
  };

  if (disabled) {
    return (
      <span className="text-gray-500">
        {formatDisplayValue(value)}
      </span>
    );
  }

  if (!isEditing) {
    return (
      <button
        onClick={onEditStart}
        className="text-left w-full px-2 py-1 rounded hover:bg-blue-50 hover:text-blue-700 transition-colors group flex items-center gap-1"
        disabled={disabled}
      >
        <span className="flex-1">
          {formatDisplayValue(value)}
        </span>
        <Edit size={12} className="opacity-0 group-hover:opacity-50 text-gray-400" />
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type={getInputType()}
          value={editValue || ''}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          step={getInputStep()}
          className={`w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          style={{ minWidth: '80px' }}
        />
        
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            disabled={hasError}
            className="p-1 text-green-600 hover:bg-green-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Save"
          >
            <Check size={12} />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
            title="Cancel"
          >
            <X size={12} />
          </button>
        </div>
      </div>
      
      {hasError && (
        <div className="absolute top-full left-0 z-10 mt-1 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700 whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default EditableTableCell;