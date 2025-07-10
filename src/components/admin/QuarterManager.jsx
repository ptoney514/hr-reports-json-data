import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Edit2, 
  Trash2, 
  Download, 
  Upload, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  RefreshCw,
  Eye
} from 'lucide-react';
import quarterConfigService, { 
  getQuarters, 
  addQuarter, 
  updateQuarter, 
  deactivateQuarter,
  generateFutureQuarters,
  getMetadata,
  exportConfig,
  importConfig,
  getFiscalYears
} from '../../services/QuarterConfigService';

/**
 * Quarter Management Component
 * Administrative interface for managing quarter configurations
 */
const QuarterManager = () => {
  const [quarters, setQuarters] = useState([]);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [selectedYear, setSelectedYear] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuarter, setEditingQuarter] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form state for adding/editing quarters
  const [quarterForm, setQuarterForm] = useState({
    id: '',
    label: '',
    quarter: '',
    end_date: '',
    start_date: '',
    fiscal_year: new Date().getFullYear(),
    active: true
  });

  // Load quarters and metadata
  const loadData = () => {
    try {
      const allQuarters = getQuarters();
      const years = getFiscalYears();
      const meta = getMetadata();
      
      setQuarters(allQuarters);
      setFiscalYears(years);
      setMetadata(meta);
    } catch (error) {
      showNotification('Error loading quarter data', 'error');
      console.error('Failed to load quarters:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Filter quarters by selected year
  const filteredQuarters = selectedYear === 'all' ? 
    quarters : 
    quarters.filter(q => q.fiscalYear === parseInt(selectedYear));

  // Handle form input changes
  const handleFormChange = (field, value) => {
    setQuarterForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Generate quarter ID from form data
  const generateQuarterId = (quarterNum, year) => {
    return `Q${quarterNum}-${year}`;
  };

  // Auto-fill form when quarter number and year change
  const handleQuarterNumChange = (quarterNum) => {
    const year = quarterForm.fiscal_year;
    const quarterId = generateQuarterId(quarterNum, year);
    
    // Calculate dates
    const quarterStartMonth = (quarterNum - 1) * 3 + 1;
    const startDate = new Date(year, quarterStartMonth - 1, 1);
    const endDate = new Date(year, quarterStartMonth + 2, 0);
    
    setQuarterForm(prev => ({
      ...prev,
      id: quarterId,
      quarter: quarterId,
      label: `Q${quarterNum} ${year} (${(endDate.getMonth() + 1)}/${endDate.getDate()}/${year})`,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    }));
  };

  // Add new quarter
  const handleAddQuarter = async () => {
    try {
      const success = addQuarter(quarterForm);
      if (success) {
        showNotification('Quarter added successfully', 'success');
        loadData();
        setShowAddForm(false);
        resetForm();
      } else {
        showNotification('Failed to add quarter', 'error');
      }
    } catch (error) {
      showNotification(`Error adding quarter: ${error.message}`, 'error');
    }
  };

  // Update existing quarter
  const handleUpdateQuarter = async () => {
    try {
      const success = updateQuarter(editingQuarter.value, quarterForm);
      if (success) {
        showNotification('Quarter updated successfully', 'success');
        loadData();
        setIsEditing(false);
        setEditingQuarter(null);
        resetForm();
      } else {
        showNotification('Failed to update quarter', 'error');
      }
    } catch (error) {
      showNotification(`Error updating quarter: ${error.message}`, 'error');
    }
  };

  // Start editing quarter
  const startEditing = (quarter) => {
    setEditingQuarter(quarter);
    setQuarterForm({
      id: quarter.value,
      label: quarter.label,
      quarter: quarter.quarter,
      end_date: quarter.dateValue,
      start_date: quarter.startDate,
      fiscal_year: quarter.fiscalYear,
      active: quarter.active !== false
    });
    setIsEditing(true);
  };

  // Deactivate quarter
  const handleDeactivateQuarter = async (quarterId) => {
    if (!window.confirm('Are you sure you want to deactivate this quarter?')) {
      return;
    }

    try {
      const success = deactivateQuarter(quarterId);
      if (success) {
        showNotification('Quarter deactivated successfully', 'success');
        loadData();
      } else {
        showNotification('Failed to deactivate quarter', 'error');
      }
    } catch (error) {
      showNotification(`Error deactivating quarter: ${error.message}`, 'error');
    }
  };

  // Generate future quarters
  const handleGenerateFutureQuarters = async () => {
    try {
      const newQuarters = generateFutureQuarters(2);
      
      if (newQuarters.length === 0) {
        showNotification('No new quarters to generate', 'info');
        return;
      }

      // Add each new quarter
      let addedCount = 0;
      for (const quarter of newQuarters) {
        const success = addQuarter(quarter);
        if (success) addedCount++;
      }

      if (addedCount > 0) {
        showNotification(`Generated ${addedCount} future quarters`, 'success');
        loadData();
      } else {
        showNotification('Failed to generate quarters', 'error');
      }
    } catch (error) {
      showNotification(`Error generating quarters: ${error.message}`, 'error');
    }
  };

  // Export configuration
  const handleExportConfig = () => {
    try {
      const config = exportConfig();
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quarter-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('Configuration exported successfully', 'success');
    } catch (error) {
      showNotification(`Error exporting configuration: ${error.message}`, 'error');
    }
  };

  // Reset form
  const resetForm = () => {
    setQuarterForm({
      id: '',
      label: '',
      quarter: '',
      end_date: '',
      start_date: '',
      fiscal_year: new Date().getFullYear(),
      active: true
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setEditingQuarter(null);
    setShowAddForm(false);
    resetForm();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="text-blue-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Quarter Management</h1>
        </div>
        <p className="text-gray-600">
          Manage quarter configurations for the HR Analytics system. Add, edit, and organize quarters for dashboard filtering.
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`rounded-lg border p-4 ${
          notification.type === 'success' ? 'bg-green-50 border-green-200' :
          notification.type === 'error' ? 'bg-red-50 border-red-200' :
          notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <CheckCircle className="text-green-600" size={20} />}
            {notification.type === 'error' && <XCircle className="text-red-600" size={20} />}
            {notification.type === 'warning' && <AlertTriangle className="text-yellow-600" size={20} />}
            <span className={`font-medium ${
              notification.type === 'success' ? 'text-green-700' :
              notification.type === 'error' ? 'text-red-700' :
              notification.type === 'warning' ? 'text-yellow-700' :
              'text-blue-700'
            }`}>
              {notification.message}
            </span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Quarter Configuration</h2>
          <div className="flex items-center gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Years</option>
              {fiscalYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              Add Quarter
            </button>
            
            <button
              onClick={handleGenerateFutureQuarters}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <RefreshCw size={16} />
              Generate Future
            </button>
            
            <button
              onClick={handleExportConfig}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              <Download size={16} />
              Export Config
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-600">Total Quarters</div>
            <div className="text-lg font-semibold text-blue-900">{metadata.totalQuarters || 0}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-600">Active Quarters</div>
            <div className="text-lg font-semibold text-green-900">{metadata.activeQuarters || 0}</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-sm text-purple-600">Fiscal Years</div>
            <div className="text-lg font-semibold text-purple-900">{fiscalYears.length}</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-sm text-orange-600">Fiscal Year Type</div>
            <div className="text-lg font-semibold text-orange-900">{metadata.fiscalYearType || 'Calendar'}</div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || isEditing) && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isEditing ? 'Edit Quarter' : 'Add New Quarter'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quarter Number</label>
              <select
                value={quarterForm.id.includes('Q') ? quarterForm.id.split('-')[0].replace('Q', '') : ''}
                onChange={(e) => handleQuarterNumChange(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select Quarter</option>
                <option value="1">Q1</option>
                <option value="2">Q2</option>
                <option value="3">Q3</option>
                <option value="4">Q4</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fiscal Year</label>
              <input
                type="number"
                value={quarterForm.fiscal_year}
                onChange={(e) => handleFormChange('fiscal_year', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={quarterForm.start_date}
                onChange={(e) => handleFormChange('start_date', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={quarterForm.end_date}
                onChange={(e) => handleFormChange('end_date', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                value={quarterForm.label}
                onChange={(e) => handleFormChange('label', e.target.value)}
                placeholder="Q1 2025 (3/31/2025)"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={quarterForm.active}
                  onChange={(e) => handleFormChange('active', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={isEditing ? handleUpdateQuarter : handleAddQuarter}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {isEditing ? 'Update Quarter' : 'Add Quarter'}
            </button>
            <button
              onClick={cancelEditing}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Quarters List */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quarters {selectedYear !== 'all' && `for ${selectedYear}`}
        </h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quarter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiscal Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuarters.map((quarter) => (
                <tr key={quarter.value}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {quarter.quarter}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quarter.label}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quarter.startDate} to {quarter.dateValue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quarter.fiscalYear}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      quarter.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {quarter.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing(quarter)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Quarter"
                      >
                        <Edit2 size={16} />
                      </button>
                      {quarter.active !== false && (
                        <button
                          onClick={() => handleDeactivateQuarter(quarter.value)}
                          className="text-red-600 hover:text-red-900"
                          title="Deactivate Quarter"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredQuarters.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No quarters found {selectedYear !== 'all' && `for ${selectedYear}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuarterManager;