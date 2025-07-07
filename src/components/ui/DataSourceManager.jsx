import React from 'react';
import { Cloud, Upload, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDataSource } from '../../contexts/DataSourceContext';

const DataSourceManager = ({ 
  showUploadButton = true, 
  showStatusIndicator = true,
  showDetailedStatus = false,
  uploadButtonText = "Upload Data",
  className = ""
}) => {
  const navigate = useNavigate();
  const { state, utils } = useDataSource();
  
  const dataSourceInfo = utils.getDataSourceInfo();
  const uploadStatusInfo = utils.getUploadStatusInfo();

  const navigateToUpload = () => {
    navigate('/excel-integration');
  };

  const getDataSourceDisplay = () => {
    switch (state.dataSource) {
      case 'firebase':
        return {
          icon: <Cloud size={16} className="text-purple-500" />,
          text: "Using Firebase data from centralized upload",
          status: "connected"
        };
      case 'sample':
        return {
          icon: null,
          text: "Using sample data for demonstration",
          status: "sample"
        };
      default:
        return {
          icon: null,
          text: "Unknown data source",
          status: "unknown"
        };
    }
  };

  const dataSourceDisplay = getDataSourceDisplay();

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Data Source</h2>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            {dataSourceDisplay.icon}
            {dataSourceDisplay.text}
            {state.firebaseLoading && ' (Loading from Firebase...)'}
            {state.firebaseError && ` (Firebase error: ${state.firebaseError.message})`}
          </p>
        </div>
        {showUploadButton && (
          <button
            onClick={navigateToUpload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload size={16} />
            {uploadButtonText}
            <ExternalLink size={14} />
          </button>
        )}
      </div>
      
      {showStatusIndicator && (
        <>
          {state.dataSource === 'sample' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>No uploaded data found.</strong> Click "Upload Data" to go to the Excel Integration page and upload your workforce data.
              </p>
            </div>
          )}
          
          {state.dataSource === 'firebase' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">
                <strong>✓ Data loaded from Firebase.</strong> Dashboard showing real-time data from your uploaded files.
              </p>
            </div>
          )}
        </>
      )}

      {showDetailedStatus && (
        <div className="mt-4 space-y-3">
          {/* Upload Status */}
          {uploadStatusInfo.status && (
            <div className={`rounded-lg border p-3 ${
              uploadStatusInfo.status === 'success' ? 'bg-green-50 border-green-200' :
              uploadStatusInfo.status === 'error' ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-2">
                {uploadStatusInfo.status === 'success' && <CheckCircle className="text-green-600" size={16} />}
                {uploadStatusInfo.status === 'error' && <XCircle className="text-red-500" size={16} />}
                <span className={`text-sm font-medium ${
                  uploadStatusInfo.status === 'success' ? 'text-green-700' :
                  uploadStatusInfo.status === 'error' ? 'text-red-700' :
                  'text-blue-700'
                }`}>
                  {uploadStatusInfo.message}
                </span>
              </div>
              {uploadStatusInfo.lastUploadTime && (
                <p className="text-xs text-gray-500 mt-1">
                  Last uploaded: {new Date(uploadStatusInfo.lastUploadTime).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Data Availability */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Data Availability</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${state.dataAvailability.workforce ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Workforce</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${state.dataAvailability.turnover ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Turnover</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${state.dataAvailability.compliance ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Compliance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${state.dataAvailability.recruiting ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Recruiting</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSourceManager;