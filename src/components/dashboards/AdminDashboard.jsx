import React, { useState, useEffect, useCallback } from 'react';
import { 
  Database, 
  Eye, 
  Edit, 
  Save, 
  X, 
  RefreshCw, 
  Download, 
  Upload,
  AlertCircle,
  CheckCircle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { getQuarters } from '../../services/QuarterConfigService';
import firebaseService from '../../services/FirebaseService';
import DataGrid from '../admin/DataGrid';
import PeriodSelector from '../admin/PeriodSelector';
import DataImportExport from '../admin/DataImportExport';

const AdminDashboard = () => {
  // State management
  const [selectedPeriod, setSelectedPeriod] = useState('2025-Q1');
  const [selectedDashboard, setSelectedDashboard] = useState('workforce');
  const [isEditMode, setIsEditMode] = useState(false);
  const [data, setData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Available dashboard types
  const dashboardTypes = [
    { id: 'workforce', label: 'Workforce Data', icon: BarChart3 },
    { id: 'turnover', label: 'Turnover Data', icon: BarChart3 },
    { id: 'compliance', label: 'Compliance Data', icon: BarChart3 },
    { id: 'recruiting', label: 'Recruiting Data', icon: BarChart3 },
    { id: 'exitSurvey', label: 'Exit Survey Data', icon: BarChart3 }
  ];

  // Load data for selected period and dashboard
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Loading ${selectedDashboard} data for ${selectedPeriod}`);
      
      const firebaseData = await firebaseService.getMetricsByDashboard(
        selectedDashboard, 
        selectedPeriod, 
        'quarters'
      );
      
      if (firebaseData) {
        setData(firebaseData);
        setOriginalData(JSON.parse(JSON.stringify(firebaseData))); // Deep copy
        setStatus({
          type: 'success',
          message: `Successfully loaded ${selectedDashboard} data for ${selectedPeriod}`
        });
      } else {
        setData(null);
        setOriginalData(null);
        setStatus({
          type: 'warning',
          message: `No ${selectedDashboard} data found for ${selectedPeriod}`
        });
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(`Failed to load ${selectedDashboard} data: ${err.message}`);
      setStatus({
        type: 'error',
        message: `Failed to load ${selectedDashboard} data: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedDashboard]);

  // Load data when period or dashboard changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle data changes
  const handleDataChange = useCallback((newData) => {
    setData(newData);
    setHasChanges(JSON.stringify(newData) !== JSON.stringify(originalData));
  }, [originalData]);

  // Save changes to Firebase
  const saveChanges = async () => {
    if (!data || !hasChanges) return;

    setLoading(true);
    setError(null);

    try {
      // Add metadata for audit trail
      const dataToSave = {
        ...data,
        lastUpdated: new Date(),
        lastEditedBy: 'Admin Dashboard',
        editTimestamp: new Date(),
        version: data.version || '2.0'
      };

      // Save to Firebase using the appropriate method
      switch (selectedDashboard) {
        case 'workforce':
          await firebaseService.setWorkforceMetrics(selectedPeriod, dataToSave);
          break;
        case 'turnover':
          await firebaseService.setTurnoverMetrics(selectedPeriod, dataToSave);
          break;
        case 'compliance':
          await firebaseService.setComplianceMetrics(selectedPeriod, dataToSave);
          break;
        case 'recruiting':
          await firebaseService.setRecruitingMetrics(selectedPeriod, dataToSave);
          break;
        case 'exitSurvey':
          await firebaseService.setExitSurveyMetrics(selectedPeriod, dataToSave);
          break;
        default:
          throw new Error(`Unknown dashboard type: ${selectedDashboard}`);
      }

      // Update state
      setOriginalData(JSON.parse(JSON.stringify(dataToSave)));
      setHasChanges(false);
      setIsEditMode(false);
      
      setStatus({
        type: 'success',
        message: `Successfully saved ${selectedDashboard} data for ${selectedPeriod}`
      });

    } catch (err) {
      console.error('Error saving data:', err);
      setError(`Failed to save data: ${err.message}`);
      setStatus({
        type: 'error',
        message: `Failed to save data: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing and revert changes
  const cancelEdit = () => {
    setData(JSON.parse(JSON.stringify(originalData)));
    setHasChanges(false);
    setIsEditMode(false);
    setStatus({
      type: 'info',
      message: 'Changes cancelled - data reverted to original values'
    });
  };

  // Handle data import from file
  const handleDataImport = useCallback((importedData) => {
    setData(importedData);
    setHasChanges(true);
    setStatus({
      type: 'info',
      message: 'Data imported successfully. Remember to save changes to update Firebase.'
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="text-blue-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Firebase Admin Dashboard</h1>
        </div>
        <p className="text-gray-600">
          View and edit quarterly HR data stored in Firebase. Make quick corrections without needing to re-upload entire datasets.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Period and Dashboard Selection */}
          <div className="flex gap-4 items-center">
            <PeriodSelector 
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              className="min-w-[150px]"
            />
            
            <select
              value={selectedDashboard}
              onChange={(e) => setSelectedDashboard(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {dashboardTypes.map(dashboard => (
                <option key={dashboard.id} value={dashboard.id}>
                  {dashboard.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:border-gray-400 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>


            {data && !isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit size={14} />
                Edit Mode
              </button>
            )}

            {isEditMode && (
              <>
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:border-gray-400"
                >
                  <X size={14} />
                  Cancel
                </button>
                <button
                  onClick={saveChanges}
                  disabled={!hasChanges || loading}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Save size={14} />
                  Save Changes
                  {hasChanges && <span className="text-xs">(Modified)</span>}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {status && (
        <div className={`rounded-lg border p-4 ${
          status.type === 'success' ? 'bg-green-50 border-green-200' :
          status.type === 'error' ? 'bg-red-50 border-red-200' :
          status.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            {status.type === 'success' && <CheckCircle className="text-green-600" size={20} />}
            {status.type === 'error' && <AlertCircle className="text-red-500" size={20} />}
            {status.type === 'warning' && <AlertCircle className="text-yellow-600" size={20} />}
            {status.type === 'info' && <RefreshCw className="text-blue-500" size={20} />}
            <span className={`font-medium ${
              status.type === 'success' ? 'text-green-700' :
              status.type === 'error' ? 'text-red-700' :
              status.type === 'warning' ? 'text-yellow-700' :
              'text-blue-700'
            }`}>
              {status.message}
            </span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-500" size={20} />
            <span className="font-medium text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Data Display */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="animate-spin text-blue-500" size={24} />
            <span className="ml-2 text-gray-600">Loading data...</span>
          </div>
        </div>
      ) : data ? (
        <>
          <DataGrid
            data={data}
            isEditMode={isEditMode}
            onChange={handleDataChange}
            dashboardType={selectedDashboard}
            period={selectedPeriod}
          />
          
          {/* Import/Export Section */}
          <DataImportExport
            data={data}
            onImport={handleDataImport}
            dashboardType={selectedDashboard}
            period={selectedPeriod}
          />
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center text-gray-500">
            <Database size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Data Found</h3>
            <p>No {selectedDashboard} data available for {selectedPeriod}</p>
            <p className="text-sm mt-2">Upload data through the Excel Integration Dashboard first.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;