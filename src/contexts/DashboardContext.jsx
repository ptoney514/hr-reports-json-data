import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { getCurrentReportingPeriod, getCurrentReportingDate } from '../services/QuarterConfigService';

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_REPORTING_PERIOD: 'SET_REPORTING_PERIOD',
  SET_LOCATION_FILTER: 'SET_LOCATION_FILTER',
  SET_DIVISION_FILTER: 'SET_DIVISION_FILTER',
  SET_DEPARTMENT_FILTER: 'SET_DEPARTMENT_FILTER',
  SET_EMPLOYEE_TYPE_FILTER: 'SET_EMPLOYEE_TYPE_FILTER',
  SET_DATE_RANGE: 'SET_DATE_RANGE',
  SET_CUSTOM_DATE_RANGE: 'SET_CUSTOM_DATE_RANGE',
  RESET_FILTERS: 'RESET_FILTERS',
  SET_DASHBOARD_TYPE: 'SET_DASHBOARD_TYPE',
  UPDATE_DATA_TIMESTAMP: 'UPDATE_DATA_TIMESTAMP'
};

// Get current reporting period for default state (lazy evaluation)
const getCurrentReportingPeriodSafe = () => {
  try {
    return getCurrentReportingPeriod();
  } catch (error) {
    console.warn('Could not get current reporting period, using fallback');
    return { value: 'Q2-2025', label: '6/30/2025' };
  }
};

// Create default state function to avoid calling service during module load
const createDefaultState = () => {
  const currentPeriod = getCurrentReportingPeriodSafe();
  return {
    // Filter states - now uses fixed current reporting period
    reportingPeriod: currentPeriod?.value || 'Q2-2025',
    locationFilter: 'All',
    divisionFilter: 'All',
    departmentFilter: 'All',
    employeeTypeFilter: 'All',
    dateRange: {
      type: 'fixed', // 'fixed' instead of quarter since it's now fixed
      startDate: new Date('2025-04-01'),
      endDate: new Date('2025-06-30'),
      label: currentPeriod?.label || '6/30/2025'
    },
  
  // UI states
  loading: {
    workforce: false,
    turnover: false,
    general: false
  },
  error: {
    workforce: null,
    turnover: null,
    general: null
  },
  
  // Dashboard state
  currentDashboard: 'workforce', // 'workforce', 'turnover', 'i9'
  dataLastUpdated: null,
  
  // Available filter options (populated from data)
  availableOptions: {
    reportingPeriods: ['Q2-2024', 'Q3-2024', 'Q4-2024', 'Q1-2025', 'Q2-2025'],
    locations: ['All', 'Omaha Campus', 'Phoenix Campus'],
    divisions: [
      'All',
      'Academic Affairs',
      'Student Affairs',
      'Research & Innovation',
      'Information Technology',
      'Finance & Administration',
      'Human Resources',
      'Facilities Management',
      'Marketing & Communications',
      'Library Services',
      'Athletics'
    ],
    employeeTypes: ['All', 'Faculty', 'Staff', 'Students'],
    fiscalYears: ['FY2020', 'FY2021', 'FY2022', 'FY2023', 'FY2024']
  }
  };
};

// Static fallback state for when createDefaultState fails
const staticDefaultState = {
  reportingPeriod: 'Q2-2025',
  locationFilter: 'All',
  divisionFilter: 'All',
  departmentFilter: 'All',
  employeeTypeFilter: 'All',
  dateRange: {
    type: 'fixed',
    startDate: new Date('2025-04-01'),
    endDate: new Date('2025-06-30'),
    label: '6/30/2025'
  },
  loading: { workforce: false, turnover: false, general: false },
  error: { workforce: null, turnover: null, general: null },
  currentDashboard: 'workforce',
  dataLastUpdated: null,
  availableOptions: {
    reportingPeriods: ['Q2-2024', 'Q3-2024', 'Q4-2024', 'Q1-2025', 'Q2-2025'],
    locations: ['All', 'Omaha Campus', 'Phoenix Campus'],
    divisions: ['All', 'Academic Affairs', 'Student Affairs', 'Research & Innovation', 'Information Technology', 'Finance & Administration', 'Human Resources', 'Facilities Management', 'Marketing & Communications', 'Library Services', 'Athletics'],
    employeeTypes: ['All', 'Faculty', 'Staff', 'Students'],
    fiscalYears: ['FY2020', 'FY2021', 'FY2022', 'FY2023', 'FY2024']
  }
};

// Reducer function
const dashboardReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.type]: action.payload.loading
        }
      };

    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: {
          ...state.error,
          [action.payload.type]: action.payload.error
        },
        loading: {
          ...state.loading,
          [action.payload.type]: false
        }
      };

    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: {
          ...state.error,
          [action.payload.type]: null
        }
      };

    case actionTypes.SET_REPORTING_PERIOD:
      return {
        ...state,
        reportingPeriod: action.payload,
        // Auto-update date range based on reporting period
        dateRange: getDateRangeFromPeriod(action.payload)
      };

    case actionTypes.SET_LOCATION_FILTER:
      return {
        ...state,
        locationFilter: action.payload
      };

    case actionTypes.SET_DIVISION_FILTER:
      return {
        ...state,
        divisionFilter: action.payload,
        // Reset department filter when division changes
        departmentFilter: 'All'
      };

    case actionTypes.SET_DEPARTMENT_FILTER:
      return {
        ...state,
        departmentFilter: action.payload
      };

    case actionTypes.SET_EMPLOYEE_TYPE_FILTER:
      return {
        ...state,
        employeeTypeFilter: action.payload
      };

    case actionTypes.SET_DATE_RANGE:
      return {
        ...state,
        dateRange: {
          ...state.dateRange,
          type: action.payload.type,
          startDate: action.payload.startDate,
          endDate: action.payload.endDate,
          label: action.payload.label
        }
      };

    case actionTypes.SET_CUSTOM_DATE_RANGE:
      return {
        ...state,
        dateRange: {
          type: 'custom',
          startDate: action.payload.startDate,
          endDate: action.payload.endDate,
          label: `${format(action.payload.startDate, 'MMM d')} - ${format(action.payload.endDate, 'MMM d, yyyy')}`
        }
      };

    case actionTypes.SET_DASHBOARD_TYPE:
      return {
        ...state,
        currentDashboard: action.payload
      };

    case actionTypes.UPDATE_DATA_TIMESTAMP:
      return {
        ...state,
        dataLastUpdated: new Date()
      };

    case actionTypes.RESET_FILTERS:
      try {
        const freshState = createDefaultState();
        return {
          ...freshState,
          // Preserve UI states and current dashboard
          loading: state.loading,
          error: state.error,
          currentDashboard: state.currentDashboard,
          dataLastUpdated: state.dataLastUpdated,
          availableOptions: state.availableOptions
        };
      } catch (error) {
        console.warn('Failed to reset to default state, using static fallback:', error);
        return {
          ...staticDefaultState,
          // Preserve UI states and current dashboard
          loading: state.loading,
          error: state.error,
          currentDashboard: state.currentDashboard,
          dataLastUpdated: state.dataLastUpdated,
          availableOptions: state.availableOptions
        };
      }

    default:
      return state;
  }
};

// Helper function to get date range from reporting period
const getDateRangeFromPeriod = (period) => {
  const quarterMappings = {
    'Q1-2024': { start: '2023-10-01', end: '2023-12-31', label: 'Q1 2024' },
    'Q2-2024': { start: '2024-01-01', end: '2024-03-31', label: 'Q2 2024' },
    'Q3-2024': { start: '2024-04-01', end: '2024-06-30', label: 'Q3 2024' },
    'Q4-2024': { start: '2024-07-01', end: '2024-09-30', label: 'Q4 2024' },
    'Q1-2025': { start: '2024-10-01', end: '2024-12-31', label: 'Q1 2025' },
    'Q2-2025': { start: '2025-01-01', end: '2025-03-31', label: 'Q2 2025' }
  };

  const mapping = quarterMappings[period];
  if (mapping) {
    return {
      type: 'quarter',
      startDate: new Date(mapping.start),
      endDate: new Date(mapping.end),
      label: mapping.label
    };
  }

  // Default fallback
  return {
    type: 'quarter',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-03-31'),
    label: 'Q2 2025'
  };
};

// Create context
const DashboardContext = createContext();

// Provider component
export const DashboardProvider = ({ children }) => {
  // Use lazy initialization to prevent calling services during module load
  const [state, dispatch] = useReducer(dashboardReducer, undefined, () => {
    try {
      return createDefaultState();
    } catch (error) {
      console.warn('Failed to create default state, using static fallback:', error);
      return staticDefaultState;
    }
  });

  // Action creators
  const actions = {
    // Loading actions
    setLoading: (type, loading) => {
      dispatch({
        type: actionTypes.SET_LOADING,
        payload: { type, loading }
      });
    },

    // Error actions
    setError: (type, error) => {
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: { type, error }
      });
    },

    clearError: (type) => {
      dispatch({
        type: actionTypes.CLEAR_ERROR,
        payload: { type }
      });
    },

    // Filter actions
    setReportingPeriod: (period) => {
      dispatch({
        type: actionTypes.SET_REPORTING_PERIOD,
        payload: period
      });
    },

    setLocationFilter: (location) => {
      dispatch({
        type: actionTypes.SET_LOCATION_FILTER,
        payload: location
      });
    },

    setDivisionFilter: (division) => {
      dispatch({
        type: actionTypes.SET_DIVISION_FILTER,
        payload: division
      });
    },

    setDepartmentFilter: (department) => {
      dispatch({
        type: actionTypes.SET_DEPARTMENT_FILTER,
        payload: department
      });
    },

    setEmployeeTypeFilter: (employeeType) => {
      dispatch({
        type: actionTypes.SET_EMPLOYEE_TYPE_FILTER,
        payload: employeeType
      });
    },

    // Date range actions
    setQuarterRange: (quarter) => {
      const dateRange = getDateRangeFromPeriod(quarter);
      dispatch({
        type: actionTypes.SET_DATE_RANGE,
        payload: dateRange
      });
    },

    setMonthRange: (monthsBack = 0) => {
      const endDate = endOfMonth(subMonths(new Date(), monthsBack));
      const startDate = startOfMonth(endDate);
      
      dispatch({
        type: actionTypes.SET_DATE_RANGE,
        payload: {
          type: 'month',
          startDate,
          endDate,
          label: format(startDate, 'MMMM yyyy')
        }
      });
    },

    setCustomDateRange: (startDate, endDate) => {
      dispatch({
        type: actionTypes.SET_CUSTOM_DATE_RANGE,
        payload: { startDate, endDate }
      });
    },

    // Dashboard actions
    setCurrentDashboard: (dashboard) => {
      dispatch({
        type: actionTypes.SET_DASHBOARD_TYPE,
        payload: dashboard
      });
    },

    updateDataTimestamp: () => {
      dispatch({
        type: actionTypes.UPDATE_DATA_TIMESTAMP
      });
    },

    // Reset action
    resetFilters: () => {
      dispatch({
        type: actionTypes.RESET_FILTERS
      });
    },

    // Utility actions
    applyPresetFilter: (preset) => {
      switch (preset) {
        case 'current-quarter':
          const currentPeriod = getCurrentReportingPeriodSafe();
          actions.setReportingPeriod(currentPeriod?.value || 'Q2-2025');
          actions.setLocationFilter('All');
          actions.setDivisionFilter('All');
          actions.setEmployeeTypeFilter('All');
          break;
        
        case 'omaha-only':
          actions.setLocationFilter('Omaha Campus');
          break;
        
        case 'faculty-only':
          actions.setEmployeeTypeFilter('Faculty');
          break;
        
        case 'staff-only':
          actions.setEmployeeTypeFilter('Staff');
          break;
        
        case 'last-month':
          actions.setMonthRange(1);
          break;
        
        default:
          break;
      }
    }
  };

  // Computed values
  const computed = {
    // Check if any filters are active (not default)
    hasActiveFilters: () => {
      return (
        state.locationFilter !== 'All' ||
        state.divisionFilter !== 'All' ||
        state.departmentFilter !== 'All' ||
        state.employeeTypeFilter !== 'All' ||
        state.dateRange.type !== 'quarter'
      );
    },

    // Get filter summary for display
    getFilterSummary: () => {
      const filters = [];
      
      if (state.locationFilter !== 'All') {
        filters.push(`Location: ${state.locationFilter}`);
      }
      
      if (state.divisionFilter !== 'All') {
        filters.push(`Division: ${state.divisionFilter}`);
      }
      
      if (state.departmentFilter !== 'All') {
        filters.push(`Department: ${state.departmentFilter}`);
      }
      
      if (state.employeeTypeFilter !== 'All') {
        filters.push(`Type: ${state.employeeTypeFilter}`);
      }
      
      return filters;
    },

    // Check if loading any data
    isLoading: () => {
      return Object.values(state.loading).some(loading => loading);
    },

    // Check if any errors exist
    hasErrors: () => {
      return Object.values(state.error).some(error => error !== null);
    },

    // Get all active errors
    getErrors: () => {
      return Object.entries(state.error)
        .filter(([, error]) => error !== null)
        .map(([type, error]) => ({ type, error }));
    }
  };

  // Provide context value
  const contextValue = {
    state,
    actions,
    computed
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

// Custom hook for using the context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  
  return context;
};

export default DashboardContext; 