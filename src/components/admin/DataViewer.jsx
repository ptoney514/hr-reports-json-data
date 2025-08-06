import React, { useState, useEffect } from 'react';
import { Calendar, Eye, Edit, Trash2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { DataService } from '../../services/DataService';
import { ConfirmDialog } from './ConfirmDialog';

export const DataViewer = ({ collection, onPeriodSelect, onEditPeriod }) => {
  const [periods, setPeriods] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, period: null });
  const [loadingPeriods, setLoadingPeriods] = useState({});

  // Load available periods for the selected collection
  useEffect(() => {
    loadPeriods();
  }, [collection]);

  const loadPeriods = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Loading periods for collection: ${collection}`);
      // Get all available periods for this collection
      const availablePeriods = await DataService.getAvailablePeriods(collection);
      console.log(`Found periods:`, availablePeriods);
      setPeriods(availablePeriods);
    } catch (err) {
      console.error(`Error loading periods:`, err);
      setError(`Failed to load periods: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadPeriodData = async (period) => {
    setLoadingPeriods(prev => ({ ...prev, [period]: true }));
    setError(null);
    try {
      console.log(`Loading period data for: ${period}`);
      const data = await DataService.getRawMetrics(collection, period);
      console.log(`Received data:`, data);
      setSelectedData({ period, data });
      onPeriodSelect?.(period);
      console.log(`Called onPeriodSelect with: ${period}`);
    } catch (err) {
      console.error(`Error loading period ${period}:`, err);
      setError(`Failed to load data for ${period}: ${err.message}`);
    } finally {
      setLoadingPeriods(prev => ({ ...prev, [period]: false }));
    }
  };

  const openDeleteDialog = (period) => {
    setDeleteDialog({ isOpen: true, period });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, period: null });
  };

  const confirmDelete = async () => {
    const { period } = deleteDialog;
    if (!period) return;

    try {
      setError(null);
      setSuccessMessage(null);
      
      await DataService.deleteMetrics(collection, period);
      
      // Update periods list
      setPeriods(periods.filter(p => p !== period));
      
      // Clear selected data if it was the deleted period
      if (selectedData?.period === period) {
        setSelectedData(null);
      }
      
      // Show success message
      setSuccessMessage(`Successfully deleted data for ${period}`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      
    } catch (err) {
      setError(`Failed to delete data: ${err.message}`);
    }
  };

  const renderDataPreview = (data) => {
    if (!data || typeof data !== 'object') return null;

    return (
      <div className="space-y-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="border-b border-gray-100 pb-2">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-700">{key}</span>
              <span className="text-sm text-gray-600 ml-4">
                {typeof value === 'object' && value !== null 
                  ? JSON.stringify(value, null, 2).substring(0, 100) + '...'
                  : String(value)
                }
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Data Viewer - {collection.charAt(0).toUpperCase() + collection.slice(1)}
        </h3>
        <button
          onClick={loadPeriods}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-green-700">{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Periods List */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Available Reporting Periods</h4>
          {loading && periods.length === 0 ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : periods.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-lg font-medium mb-2">No reporting periods found</p>
              <p className="text-sm mb-4">Create test data or upload your own data to get started with the admin interface</p>
            </div>
          ) : (
            <div className="space-y-2">
              {periods.map((period) => (
                <div
                  key={period}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedData?.period === period
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => loadPeriodData(period)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{period}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          loadPeriodData(period);
                        }}
                        disabled={loadingPeriods[period]}
                        className={`p-1 transition-colors ${
                          loadingPeriods[period] 
                            ? 'text-blue-500 cursor-not-allowed' 
                            : 'text-gray-400 hover:text-blue-500'
                        }`}
                        title="View"
                      >
                        {loadingPeriods[period] ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onEditPeriod) {
                            onEditPeriod(period);
                          } else {
                            loadPeriodData(period);
                          }
                        }}
                        disabled={loadingPeriods[period]}
                        className={`p-1 transition-colors ${
                          loadingPeriods[period] 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-400 hover:text-green-500'
                        }`}
                        title="Edit this period"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(period);
                        }}
                        disabled={loadingPeriods[period]}
                        className={`p-1 transition-colors ${
                          loadingPeriods[period] 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                        title="Delete this period"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Data Preview */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Data Preview</h4>
          {selectedData ? (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="mb-4 pb-3 border-b border-gray-200">
                <h5 className="font-medium text-gray-900">Period: {selectedData.period}</h5>
                <p className="text-sm text-gray-600">
                  {Object.keys(selectedData.data || {}).length} fields
                </p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {renderDataPreview(selectedData.data)}
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
              <Eye className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Select a period to view data</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Data Period"
        message={`Are you sure you want to delete ${collection} data for ${deleteDialog.period}? This action cannot be undone and will permanently remove all metrics data for this reporting period.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};