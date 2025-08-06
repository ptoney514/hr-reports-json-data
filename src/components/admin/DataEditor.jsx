import React, { useState, useEffect } from 'react';
import { Save, X, RefreshCw, AlertCircle, CheckCircle, Edit3 } from 'lucide-react';
import { DataService } from '../../services/DataService';

export const DataEditor = ({ collection, period }) => {
  const [data, setData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [editMode, setEditMode] = useState('form'); // 'form' or 'json'
  const [jsonText, setJsonText] = useState('');
  
  // Format the reporting period for display
  const formatReportingPeriod = (dateStr) => {
    if (!dateStr) return '';
    
    // Handle different date formats
    if (dateStr.includes('-')) {
      // Format: YYYY-MM-DD
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (dateStr.includes('/')) {
      // Format: M/D/YYYY
      const [month, day, year] = dateStr.split('/');
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    return dateStr;
  };

  // Field labels mapping for better UX
  const fieldLabels = {
    // Core metrics
    total_employees: 'Total Employees',
    total_faculty: 'Total Faculty',
    total_staff: 'Total Staff',
    total_students: 'Total Students',
    benefit_eligible_faculty: 'Benefit Eligible Faculty',
    benefit_eligible_staff: 'Benefit Eligible Staff',
    non_benefit_eligible_faculty: 'Non-Benefit Eligible Faculty',
    non_benefit_eligible_staff: 'Non-Benefit Eligible Staff',
    
    // Movement and rates
    vacancy_rate: 'Vacancy Rate (%)',
    new_hires: 'New Hires',
    terminations: 'Terminations',
    
    // Demographics
    average_tenure: 'Average Tenure (years)',
    average_age: 'Average Age (years)',
    gender_ratio: 'Gender Ratio (F/M)',
    diversity_index: 'Diversity Index (%)',
    
    // Compliance fields
    total_certifications: 'Total Certifications',
    expiring_soon: 'Expiring Soon',
    expired: 'Expired',
    compliant_rate: 'Compliance Rate (%)',
    
    // Turnover fields
    total_turnover_rate: 'Total Turnover Rate (%)',
    faculty_turnover_rate: 'Faculty Turnover Rate (%)',
    staff_exempt_turnover_rate: 'Staff Exempt Turnover Rate (%)',
    staff_non_exempt_turnover_rate: 'Staff Non-Exempt Turnover Rate (%)',
    voluntary_turnover_rate: 'Voluntary Turnover Rate (%)',
    involuntary_turnover_rate: 'Involuntary Turnover Rate (%)',
    total_separations: 'Total Separations',
    faculty_separations: 'Faculty Separations',
    staff_separations: 'Staff Separations'
  };

  useEffect(() => {
    if (period && collection) {
      loadData();
    }
  }, [period, collection]);

  const loadData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      console.log(`Loading data for collection: ${collection}, period: ${period}`);
      
      // Validate inputs
      if (!collection || !period) {
        throw new Error('Collection and period are required');
      }
      
      // Use getRawMetrics for admin editing (expects string period)
      const result = await DataService.getRawMetrics(collection, period);
      
      if (!result) {
        throw new Error(`No data found for period ${period}`);
      }
      
      console.log(`Data loaded successfully:`, result);
      
      setData(result);
      setOriginalData(JSON.parse(JSON.stringify(result)));
      setJsonText(JSON.stringify(result, null, 2));
      setHasChanges(false);
    } catch (err) {
      console.error(`Error loading data:`, err);
      setMessage({ type: 'error', text: `Failed to load data: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (path, value) => {
    const newData = { ...data };
    
    // Handle nested paths like 'employeeTypes.faculty.total'
    const pathParts = path.split('.');
    let current = newData;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }
    
    // Convert to number if it looks like a number
    const finalValue = isNaN(value) ? value : Number(value);
    current[pathParts[pathParts.length - 1]] = finalValue;
    
    setData(newData);
    setJsonText(JSON.stringify(newData, null, 2));
    setHasChanges(true);
    setMessage(null);
  };

  const handleJsonChange = (e) => {
    setJsonText(e.target.value);
    try {
      const parsed = JSON.parse(e.target.value);
      setData(parsed);
      setHasChanges(true);
      setMessage(null);
    } catch (err) {
      // Don't update data if JSON is invalid, just keep typing
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      let dataToSave = data;
      
      if (editMode === 'json') {
        try {
          dataToSave = JSON.parse(jsonText);
        } catch (err) {
          throw new Error('Invalid JSON format');
        }
      }

      // Add update metadata
      const updatedData = {
        ...dataToSave,
        metadata: {
          ...dataToSave.metadata,
          lastUpdated: new Date(),
          lastEditedBy: 'admin'
        }
      };

      await DataService.saveMetrics(collection, period, updatedData);
      
      setData(updatedData);
      setOriginalData(JSON.parse(JSON.stringify(updatedData)));
      setHasChanges(false);
      setMessage({ type: 'success', text: 'Data saved successfully!' });
      
    } catch (err) {
      setMessage({ type: 'error', text: `Save failed: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm('Are you sure you want to discard all changes?')) {
      return;
    }
    
    setData(JSON.parse(JSON.stringify(originalData)));
    setJsonText(JSON.stringify(originalData, null, 2));
    setHasChanges(false);
    setMessage(null);
  };

  const getFieldLabel = (fieldName) => {
    return fieldLabels[fieldName] || fieldName.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Specialized array field renderer for departmental breakdown
  const renderArrayField = (key, value, path) => {
    if (key === 'departmentalBreakdown') {
      return (
        <div key={path} className="border border-gray-200 rounded-lg p-4 mb-6">
          <div className="mb-4">
            <h4 className="font-medium text-gray-900">Departmental Breakdown</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage benefit-eligible headcount by department ({value.length} departments)
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-700 border-b border-gray-300 pb-2">
                <div>Department Name</div>
                <div>Faculty (BE)</div>
                <div>Staff (BE)</div>
                <div>Total</div>
              </div>
              
              {value.map((dept, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 items-center py-2 border-b border-gray-200 last:border-b-0">
                  <input
                    type="text"
                    value={dept.name || ''}
                    onChange={(e) => handleFieldChange(`${path}.${index}.name`, e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Department name"
                  />
                  <input
                    type="number"
                    value={dept.faculty || 0}
                    onChange={(e) => {
                      const facultyValue = parseInt(e.target.value) || 0;
                      handleFieldChange(`${path}.${index}.faculty`, facultyValue);
                      // Auto-calculate total
                      const staffValue = dept.staff || 0;
                      handleFieldChange(`${path}.${index}.total`, facultyValue + staffValue);
                      // Update type based on faculty count
                      const newType = facultyValue > 0 ? 'mixed' : 'staff-only';
                      handleFieldChange(`${path}.${index}.type`, newType);
                    }}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                  <input
                    type="number"
                    value={dept.staff || 0}
                    onChange={(e) => {
                      const staffValue = parseInt(e.target.value) || 0;
                      handleFieldChange(`${path}.${index}.staff`, staffValue);
                      // Auto-calculate total
                      const facultyValue = dept.faculty || 0;
                      handleFieldChange(`${path}.${index}.total`, facultyValue + staffValue);
                    }}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                  <input
                    type="number"
                    value={dept.total || 0}
                    readOnly
                    className="px-2 py-1 text-sm border border-gray-300 rounded bg-gray-100 text-gray-600"
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-xs text-gray-600">
              <p><strong>Note:</strong> Total is automatically calculated from Faculty + Staff.</p>
              <p>Type is automatically set based on faculty count (mixed/staff-only).</p>
            </div>
          </div>
        </div>
      );
    }

    // Default array handling for other arrays
    return (
      <div key={path} className="border border-gray-200 rounded-lg p-4 mb-4">
        <div className="mb-3">
          <h4 className="font-medium text-gray-900">{getFieldLabel(key)} ({value.length} items)</h4>
          <p className="text-xs text-gray-500 mt-0.5">{key}</p>
        </div>
        {value.map((item, index) => (
          <div key={index} className="mb-3 p-3 bg-gray-50 rounded-lg">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Item {index + 1}</h5>
            {typeof item === 'object' && item !== null 
              ? Object.entries(item).map(([subKey, subValue]) => 
                  renderFormField(subKey, subValue, `${path}.${index}.${subKey}`)
                )
              : (
                <input
                  type={typeof item === 'number' ? 'number' : 'text'}
                  value={item ?? ''}
                  onChange={(e) => handleFieldChange(`${path}.${index}`, e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              )
            }
          </div>
        ))}
      </div>
    );
  };

  const renderFormField = (key, value, path = key) => {
    // Handle arrays (like departmentalBreakdown)
    if (Array.isArray(value)) {
      return renderArrayField(key, value, path);
    }
    
    if (typeof value === 'object' && value !== null) {
      return (
        <div key={path} className="border border-gray-200 rounded-lg p-4 mb-4">
          <div className="mb-3">
            <h4 className="font-medium text-gray-900">{getFieldLabel(key)}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{key}</p>
          </div>
          {Object.entries(value).map(([subKey, subValue]) => 
            renderFormField(subKey, subValue, `${path}.${subKey}`)
          )}
        </div>
      );
    }

    const fieldName = path.split('.').pop();
    const label = getFieldLabel(fieldName);

    return (
      <div key={path} className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          <span className="text-xs text-gray-500 font-normal ml-2">({fieldName})</span>
        </label>
        <input
          type={typeof value === 'number' ? 'number' : 'text'}
          value={value ?? ''}
          onChange={(e) => handleFieldChange(path, e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
          step={typeof value === 'number' && !Number.isInteger(value) ? '0.01' : '1'}
          placeholder={label}
        />
      </div>
    );
  };

  if (!period) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Edit3 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <div>
          <p className="text-lg font-medium mb-2">No data selected for editing</p>
          <p className="text-sm">To edit data:</p>
          <ol className="text-sm mt-2 text-left max-w-md mx-auto space-y-1">
            <li>1. Go to the "View Data" tab</li>
            <li>2. Click on a period from the list</li>
            <li>3. Return to this "Edit Data" tab</li>
          </ol>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Edit Data - {collection.charAt(0).toUpperCase() + collection.slice(1)}
          </h3>
          <p className="text-sm text-gray-600">Reporting Period: {formatReportingPeriod(period)}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg border border-gray-300">
            <button
              onClick={() => setEditMode('form')}
              className={`px-3 py-1.5 text-sm font-medium ${
                editMode === 'form'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Form
            </button>
            <button
              onClick={() => setEditMode('json')}
              className={`px-3 py-1.5 text-sm font-medium ${
                editMode === 'json'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              JSON
            </button>
          </div>
          <button
            onClick={loadData}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'error' 
            ? 'bg-red-50 border border-red-200' 
            : message.type === 'warning'
            ? 'bg-yellow-50 border border-yellow-200'
            : 'bg-green-50 border border-green-200'
        }`}>
          {message.type === 'error' ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : message.type === 'warning' ? (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          <span className={
            message.type === 'error' 
              ? 'text-red-700' 
              : message.type === 'warning'
              ? 'text-yellow-700'
              : 'text-green-700'
          }>
            {message.text}
          </span>
        </div>
      )}

      {/* Editor Content */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {editMode === 'form' ? (
          <div className="p-6 max-h-96 overflow-y-auto">
            {data && Object.entries(data).map(([key, value]) => 
              renderFormField(key, value)
            )}
          </div>
        ) : (
          <div className="p-4">
            <textarea
              value={jsonText}
              onChange={handleJsonChange}
              className="w-full h-96 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="Enter JSON data..."
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {hasChanges && (
        <div className="mt-6 flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800">You have unsaved changes</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-1 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className={`h-4 w-4 ${saving ? 'animate-pulse' : ''}`} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};