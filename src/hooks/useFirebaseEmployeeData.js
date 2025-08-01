import { useState, useCallback } from 'react';
import firebaseService from '../services/DataService';
import { 
  transformToFirebaseWorkforceData, 
  endDateToQuarterPeriod, 
  validateWorkforceData 
} from '../utils/workforceAggregateTransform';

export const useFirebaseEmployeeData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Clear any existing individual employee records from Firebase
   * This function is used for privacy compliance - removing PII from database
   */
  const clearAllIndividualEmployeeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In JSON mode, there are no individual employee records to clear
      console.log('JSON mode: No individual employee records stored - privacy compliant by design');
      return { success: true, count: 0, message: 'JSON mode: No individual employee records stored' };
    } catch (err) {
      console.error('Error clearing individual employee data:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Import aggregated workforce data to Firebase workforce metrics
   * @param {Object} summaryStats - Summary statistics from Employee Import Dashboard
   * @param {string} endDate - The end date for the reporting period
   * @param {Function} onProgress - Optional progress callback
   * @returns {Promise<Object>} Import result
   */
  const importAggregateWorkforceData = useCallback(async (summaryStats, endDate, onProgress) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate input parameters
      if (!summaryStats || typeof summaryStats !== 'object') {
        throw new Error('Invalid summaryStats: must be a valid object');
      }
      
      if (!endDate || typeof endDate !== 'string') {
        throw new Error('Invalid endDate: must be a valid date string');
      }
      
      console.log('Input validation passed');
      console.log('SummaryStats keys:', Object.keys(summaryStats));
      console.log('Total employees in summaryStats:', summaryStats.total);
      
      // Convert end date to quarter period
      const quarterPeriod = endDateToQuarterPeriod(endDate);
      if (!quarterPeriod) {
        throw new Error(`Unable to determine quarter period from end date: ${endDate}`);
      }
      
      // Transform the 12 workforce categories to Firebase structure
      console.log('Transforming data with period:', quarterPeriod);
      const firebaseData = transformToFirebaseWorkforceData(summaryStats, quarterPeriod, endDate);
      
      // Log the transformed data structure
      console.log('Transformed Firebase data:', {
        totalEmployees: firebaseData.totalEmployees,
        period: firebaseData.period,
        demographicsKeys: Object.keys(firebaseData.demographics || {}),
        byLocationKeys: Object.keys(firebaseData.byLocation || {}),
        byDepartmentKeys: Object.keys(firebaseData.byDepartment || {})
      });
      
      // Validate the transformed data
      const validation = validateWorkforceData(firebaseData);
      if (!validation.isValid) {
        console.error('Validation failed:', validation.errors);
        throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
      }
      
      console.log('Data validation passed successfully');
      
      if (onProgress) {
        onProgress({ status: 'transforming', message: 'Data transformed and validated' });
      }
      
      // Save to Firebase using the workforce metrics service
      console.log('Attempting to save to Firebase...');
      console.log('Quarter period:', quarterPeriod);
      console.log('Data sample:', {
        totalEmployees: firebaseData.totalEmployees,
        period: firebaseData.period,
        hasMetadata: !!firebaseData.metadata
      });
      
      if (onProgress) {
        onProgress({ status: 'saving', message: 'Saving to Firebase' });
      }
      
      try {
        await firebaseService.setWorkforceMetrics(quarterPeriod, firebaseData, 'quarters');
        console.log('Firebase save successful');
      } catch (firebaseError) {
        console.error('Firebase save error:', firebaseError);
        
        // Check for specific Firebase errors
        if (firebaseError.code === 'permission-denied') {
          throw new Error('Permission denied: Unable to save data to Firebase. Please check your access rights.');
        } else if (firebaseError.code === 'unavailable') {
          throw new Error('Firebase is currently unavailable. Please try again later.');
        } else if (firebaseError.code === 'invalid-argument') {
          throw new Error('Invalid data format. Please check your data and try again.');
        } else {
          throw new Error(`Firebase error: ${firebaseError.message || 'Unknown error occurred'}`);
        }
      }
      
      // Note: Individual employee records are no longer stored for privacy compliance
      // Only aggregate workforce metrics are saved to the database
      
      if (onProgress) {
        onProgress({ status: 'completed', message: 'Aggregate data imported successfully' });
      }
      
      console.log(`Aggregate workforce data imported for ${quarterPeriod} (${endDate})`);
      
      return { 
        success: true, 
        period: quarterPeriod,
        endDate: endDate,
        totalEmployees: firebaseData.totalEmployees,
        dataPreview: {
          beFaculty: firebaseData.demographics.beFaculty,
          beStaff: firebaseData.demographics.beStaff,
          students: firebaseData.demographics.students,
          omaha: firebaseData.byLocation.omaha.total,
          phoenix: firebaseData.byLocation.phoenix.total
        }
      };
    } catch (err) {
      console.error('Error importing aggregate workforce data:', err);
      setError(err.message);
      
      if (onProgress) {
        onProgress({ status: 'error', message: err.message });
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get existing aggregate workforce data for a quarter
   * @param {string} endDate - The end date for the reporting period
   * @returns {Promise<Object|null>} Existing workforce data or null
   */
  const getAggregateWorkforceData = useCallback(async (endDate) => {
    setLoading(true);
    setError(null);
    
    try {
      const quarterPeriod = endDateToQuarterPeriod(endDate);
      if (!quarterPeriod) {
        return null;
      }
      
      const data = await firebaseService.getWorkforceMetrics(quarterPeriod, 'quarters');
      return data;
    } catch (err) {
      console.error('Error fetching aggregate workforce data:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Aggregate data functions (privacy compliant - no individual PII)
    importAggregateWorkforceData,
    getAggregateWorkforceData,
    
    // Privacy compliance function
    clearAllIndividualEmployeeData,
    
    // State
    loading,
    error,
    
    // Clear error
    clearError: () => setError(null)
  };
};