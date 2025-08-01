import React, { createContext, useContext, useReducer, useEffect } from 'react';
import firebaseService from '../services/DataService';

// Initial state
const initialState = {
  dataSource: 'sample', // 'sample', 'firebase', 'uploaded'
  isFirebaseConnected: false,
  firebaseData: null,
  firebaseLoading: false,
  firebaseError: null,
  uploadStatus: null, // null, 'uploading', 'success', 'error'
  uploadMessage: '',
  lastUploadTime: null,
  dataAvailability: {
    workforce: false,
    turnover: false,
    compliance: false,
    recruiting: false,
    exitSurvey: false
  },
  globalDataState: {
    hasUploadedData: false,
    activeDataSource: 'sample',
    lastDataUpdate: null
  }
};

// Action types
const actionTypes = {
  SET_DATA_SOURCE: 'SET_DATA_SOURCE',
  SET_FIREBASE_LOADING: 'SET_FIREBASE_LOADING',
  SET_FIREBASE_DATA: 'SET_FIREBASE_DATA',
  SET_FIREBASE_ERROR: 'SET_FIREBASE_ERROR',
  SET_UPLOAD_STATUS: 'SET_UPLOAD_STATUS',
  SET_DATA_AVAILABILITY: 'SET_DATA_AVAILABILITY',
  RESET_UPLOAD_STATUS: 'RESET_UPLOAD_STATUS',
  SET_GLOBAL_DATA_STATE: 'SET_GLOBAL_DATA_STATE'
};

// Reducer
const dataSourceReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_DATA_SOURCE:
      return {
        ...state,
        dataSource: action.payload,
        globalDataState: {
          ...state.globalDataState,
          activeDataSource: action.payload
        }
      };
    
    case actionTypes.SET_FIREBASE_LOADING:
      return {
        ...state,
        firebaseLoading: action.payload
      };
    
    case actionTypes.SET_FIREBASE_DATA:
      return {
        ...state,
        firebaseData: action.payload,
        isFirebaseConnected: action.payload !== null,
        firebaseError: null,
        dataSource: action.payload ? 'firebase' : 'sample',
        globalDataState: {
          ...state.globalDataState,
          hasUploadedData: action.payload !== null,
          activeDataSource: action.payload ? 'firebase' : 'sample',
          lastDataUpdate: action.payload ? new Date().toISOString() : null
        }
      };
    
    case actionTypes.SET_FIREBASE_ERROR:
      return {
        ...state,
        firebaseError: action.payload,
        firebaseLoading: false
      };
    
    case actionTypes.SET_UPLOAD_STATUS:
      return {
        ...state,
        uploadStatus: action.payload.status,
        uploadMessage: action.payload.message,
        lastUploadTime: action.payload.status === 'success' ? new Date().toISOString() : state.lastUploadTime
      };
    
    case actionTypes.SET_DATA_AVAILABILITY:
      return {
        ...state,
        dataAvailability: {
          ...state.dataAvailability,
          ...action.payload
        }
      };
    
    case actionTypes.RESET_UPLOAD_STATUS:
      return {
        ...state,
        uploadStatus: null,
        uploadMessage: '',
        dataSource: 'sample',
        globalDataState: {
          ...state.globalDataState,
          hasUploadedData: false,
          activeDataSource: 'sample'
        }
      };
    
    case actionTypes.SET_GLOBAL_DATA_STATE:
      return {
        ...state,
        globalDataState: {
          ...state.globalDataState,
          ...action.payload
        }
      };
    
    default:
      return state;
  }
};

// Create context
const DataSourceContext = createContext();

// Provider component
export const DataSourceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataSourceReducer, initialState);

  // Action creators
  const actions = {
    setDataSource: (source) => {
      dispatch({ type: actionTypes.SET_DATA_SOURCE, payload: source });
    },

    setFirebaseLoading: (loading) => {
      dispatch({ type: actionTypes.SET_FIREBASE_LOADING, payload: loading });
    },

    setFirebaseData: (data) => {
      dispatch({ type: actionTypes.SET_FIREBASE_DATA, payload: data });
    },

    setFirebaseError: (error) => {
      dispatch({ type: actionTypes.SET_FIREBASE_ERROR, payload: error });
    },

    setUploadStatus: (status, message) => {
      dispatch({ 
        type: actionTypes.SET_UPLOAD_STATUS, 
        payload: { status, message } 
      });
    },

    setDataAvailability: (availability) => {
      dispatch({ type: actionTypes.SET_DATA_AVAILABILITY, payload: availability });
    },

    resetUploadStatus: () => {
      dispatch({ type: actionTypes.RESET_UPLOAD_STATUS });
    },

    setGlobalDataState: (dataState) => {
      dispatch({ type: actionTypes.SET_GLOBAL_DATA_STATE, payload: dataState });
    }
  };

  // Auto-detect Firebase data availability on mount
  useEffect(() => {
    const checkFirebaseData = async () => {
      actions.setFirebaseLoading(true);
      
      try {
        // Check for workforce data in Firebase
        const workforceData = await firebaseService.getWorkforceMetrics('2025-Q1');
        
        if (workforceData && Object.keys(workforceData).length > 0) {
          actions.setFirebaseData(workforceData);
          actions.setDataAvailability({ workforce: true });
        } else {
          actions.setFirebaseData(null);
          actions.setDataAvailability({ workforce: false });
        }
      } catch (error) {
        console.error('Firebase data check failed:', error);
        actions.setFirebaseError(error);
        actions.setFirebaseData(null);
      } finally {
        actions.setFirebaseLoading(false);
      }
    };

    checkFirebaseData();
  }, []);

  // Utility functions
  const utils = {
    isDataAvailable: (dashboardType) => {
      return state.dataAvailability[dashboardType] || false;
    },

    getDataSourceInfo: () => {
      return {
        source: state.dataSource,
        isConnected: state.isFirebaseConnected,
        hasData: state.firebaseData !== null,
        lastUpdate: state.globalDataState.lastDataUpdate
      };
    },

    shouldShowUploadPrompt: () => {
      return !state.isFirebaseConnected && state.dataSource === 'sample';
    },

    getUploadStatusInfo: () => {
      return {
        status: state.uploadStatus,
        message: state.uploadMessage,
        lastUploadTime: state.lastUploadTime
      };
    }
  };

  const value = {
    state,
    actions,
    utils
  };

  return (
    <DataSourceContext.Provider value={value}>
      {children}
    </DataSourceContext.Provider>
  );
};

// Custom hook
export const useDataSource = () => {
  const context = useContext(DataSourceContext);
  if (!context) {
    throw new Error('useDataSource must be used within a DataSourceProvider');
  }
  return context;
};

export default DataSourceContext;