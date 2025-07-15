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
import QuarterlyDataTable from '../admin/QuarterlyDataTable';
import DivisionDataTable from '../admin/DivisionDataTable';
import DataImportExport from '../admin/DataImportExport';

const AdminDashboard = () => {
  // State management
  const [selectedDashboard, setSelectedDashboard] = useState('workforce');
  const [isEditMode, setIsEditMode] = useState(false);
  const [allQuartersData, setAllQuartersData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTable, setActiveTable] = useState('workforce'); // 'workforce' or 'division'

  // Available dashboard types
  const dashboardTypes = [
    { id: 'workforce', label: 'Workforce Data', icon: BarChart3 },
    { id: 'turnover', label: 'Turnover Data', icon: BarChart3 },
    { id: 'compliance', label: 'Compliance Data', icon: BarChart3 },
    { id: 'recruiting', label: 'Recruiting Data', icon: BarChart3 },
    { id: 'exitSurvey', label: 'Exit Survey Data', icon: BarChart3 }
  ];

  // Load data for all quarters of selected dashboard
  const loadAllQuartersData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Loading all quarters for ${selectedDashboard} dashboard`);
      
      // Get available quarters (last 8 quarters for better performance)
      const quarters = getQuarters().slice(-8);
      const quarterPromises = quarters.map(async (quarter) => {
        try {
          // Convert quarter format to Firebase format
          let firebasePeriod = quarter.quarter;
          if (quarter.quarter.match(/^Q\d-\d{4}$/)) {
            firebasePeriod = quarter.quarter.replace(/^Q(\d)-(\d{4})$/, '$2-Q$1');
          }
          
          const data = await firebaseService.getMetricsByDashboard(
            selectedDashboard, 
            firebasePeriod, 
            'quarters'
          );
          
          return data ? { [firebasePeriod]: data } : null;
        } catch (error) {
          console.warn(`Failed to load data for ${quarter.quarter}:`, error);
          return null;
        }
      });
      
      const results = await Promise.all(quarterPromises);
      const allData = results.reduce((acc, result) => {
        if (result) {
          return { ...acc, ...result };
        }
        return acc;
      }, {});
      
      setAllQuartersData(allData);
      setOriginalData(JSON.parse(JSON.stringify(allData))); // Deep copy
      
      const quarterCount = Object.keys(allData).length;
      setStatus({
        type: 'success',
        message: `Successfully loaded ${selectedDashboard} data for ${quarterCount} reporting periods`
      });
      
    } catch (err) {
      console.error('Error loading reporting periods data:', err);
      setError(`Failed to load ${selectedDashboard} data: ${err.message}`);
      setStatus({
        type: 'error',
        message: `Failed to load ${selectedDashboard} data: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDashboard]);

  // Load data when dashboard changes
  useEffect(() => {
    loadAllQuartersData();
  }, [loadAllQuartersData]);

  // Handle single quarter data changes
  const handleQuarterDataChange = useCallback((period, newData) => {
    const updatedAllData = {
      ...allQuartersData,
      [period]: newData
    };
    setAllQuartersData(updatedAllData);
    setHasChanges(JSON.stringify(updatedAllData) !== JSON.stringify(originalData));
  }, [allQuartersData, originalData]);

  // Handle quarter deletion
  const handleDeleteQuarter = useCallback(async (period) => {
    try {
      // Remove from Firebase
      await firebaseService.deleteQuarterData(selectedDashboard, period);
      
      // Remove from local state
      const updatedAllData = { ...allQuartersData };
      delete updatedAllData[period];
      setAllQuartersData(updatedAllData);
      
      // Update original data too since this is a direct deletion
      const updatedOriginalData = { ...originalData };
      delete updatedOriginalData[period];
      setOriginalData(updatedOriginalData);
      
      setStatus({
        type: 'success',
        message: `Successfully deleted ${period} data`
      });
      
    } catch (error) {
      setStatus({
        type: 'error', 
        message: `Failed to delete ${period}: ${error.message}`
      });
    }
  }, [allQuartersData, originalData, selectedDashboard]);

  // Save changes to Firebase
  const saveChanges = async () => {
    if (!allQuartersData || !hasChanges) return;

    setLoading(true);
    setError(null);

    try {
      let savedCount = 0;
      const errors = [];

      // Save each changed quarter
      for (const [period, data] of Object.entries(allQuartersData)) {
        // Only save if this quarter's data has changed
        const originalQuarterData = originalData[period];
        if (JSON.stringify(data) !== JSON.stringify(originalQuarterData)) {
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
                await firebaseService.setWorkforceMetrics(period, dataToSave);
                break;
              case 'turnover':
                await firebaseService.setTurnoverMetrics(period, dataToSave);
                break;
              case 'compliance':
                await firebaseService.setComplianceMetrics(period, dataToSave);
                break;
              case 'recruiting':
                await firebaseService.setRecruitingMetrics(period, dataToSave);
                break;
              case 'exitSurvey':
                await firebaseService.setExitSurveyMetrics(period, dataToSave);
                break;
              default:
                throw new Error(`Unknown dashboard type: ${selectedDashboard}`);
            }
            
            savedCount++;
          } catch (err) {
            errors.push(`${period}: ${err.message}`);
          }
        }
      }

      // Update state
      setOriginalData(JSON.parse(JSON.stringify(allQuartersData)));
      setHasChanges(false);
      setIsEditMode(false);
      
      if (errors.length > 0) {
        setStatus({
          type: 'warning',
          message: `Saved ${savedCount} reporting periods, but ${errors.length} failed: ${errors.join(', ')}`
        });
      } else {
        setStatus({
          type: 'success',
          message: `Successfully saved ${savedCount} reporting periods of ${selectedDashboard} data`
        });
      }

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
    setAllQuartersData(JSON.parse(JSON.stringify(originalData)));
    setHasChanges(false);
    setIsEditMode(false);
    setStatus({
      type: 'info',
      message: 'Changes cancelled - data reverted to original values'
    });
  };


  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="text-blue-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Firebase Admin Dashboard</h1>
        </div>
        <p className="text-gray-600">
          View and edit reporting period HR data stored in Firebase. Make quick corrections without needing to re-upload entire datasets.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Dashboard Selection */}
          <div className="flex gap-4 items-center">
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
            
            <span className="text-sm text-gray-600">
              {Object.keys(allQuartersData).length} reporting periods loaded
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={loadAllQuartersData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:border-gray-400 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>

            {Object.keys(allQuartersData).length > 0 && !isEditMode && (
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



      {/* Table Selection Tabs - Only show for workforce dashboard */}
      {selectedDashboard === 'workforce' && Object.keys(allQuartersData).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTable('workforce')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTable === 'workforce'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Workforce Headcount Admin Table
              </button>
              <button
                onClick={() => setActiveTable('division')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTable === 'division'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Division Headcount Admin Table
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Data Display */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="animate-spin text-blue-500" size={24} />
            <span className="ml-2 text-gray-600">Loading reporting periods data...</span>
          </div>
        </div>
      ) : Object.keys(allQuartersData).length > 0 ? (
        selectedDashboard === 'workforce' ? (
          activeTable === 'workforce' ? (
            <>
              {console.log('AdminDashboard: Rendering QuarterlyDataTable with showSimplifiedColumns=true', {
                selectedDashboard,
                activeTable,
                showSimplifiedColumns: true
              })}
              <QuarterlyDataTable
                allQuartersData={allQuartersData}
                isEditMode={isEditMode}
                onDataChange={handleQuarterDataChange}
                onDeleteQuarter={handleDeleteQuarter}
                dashboardType={selectedDashboard}
                showSimplifiedColumns={true}
                onQuarterSelect={(period) => console.log('Selected quarter:', period)}
                onEnableEditMode={() => setIsEditMode(true)}
              />
            </>
          ) : (
            <DivisionDataTable
              allQuartersData={allQuartersData}
              isEditMode={isEditMode}
              onDataChange={handleQuarterDataChange}
              onDeleteQuarter={handleDeleteQuarter}
              onQuarterSelect={(period) => console.log('Selected quarter:', period)}
            />
          )
        ) : (
          <QuarterlyDataTable
            allQuartersData={allQuartersData}
            isEditMode={isEditMode}
            onDataChange={handleQuarterDataChange}
            onDeleteQuarter={handleDeleteQuarter}
            dashboardType={selectedDashboard}
            showSimplifiedColumns={false}
            onQuarterSelect={(period) => console.log('Selected quarter:', period)}
            onEnableEditMode={() => setIsEditMode(true)}
          />
        )
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center text-gray-500">
            <Database size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Data Found</h3>
            <p>No {selectedDashboard} data available across any reporting periods</p>
            <p className="text-sm mt-2">Upload data through the Excel Integration Dashboard first.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;