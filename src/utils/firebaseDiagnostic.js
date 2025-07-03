// Firebase diagnostic utility
import { db } from '../config/firebase';
import { doc } from 'firebase/firestore';

export const runFirebaseDiagnostic = () => {
  console.log('🔍 Running Firebase diagnostic...');
  
  try {
    // Check if db is initialized
    if (!db) {
      return {
        success: false,
        issue: 'Database not initialized',
        guidance: 'Firebase configuration may be incorrect'
      };
    }
    
    // Check db properties
    console.log('📊 Firebase DB info:', {
      app: db.app?.name || 'unknown',
      type: db.type || 'unknown',
      settings: JSON.stringify(db._settings || {})
    });
    
    // Check if we can create a document reference (this doesn't make network calls)
    try {
      const testRef = doc(db, 'diagnostic', 'test');
      console.log('✅ Document reference created:', testRef.id);
      
      return {
        success: true,
        message: 'Firebase initialized successfully',
        nextStep: 'Ready for network test'
      };
      
    } catch (refError) {
      return {
        success: false,
        issue: 'Cannot create document reference',
        error: refError.message,
        guidance: 'Check Firebase imports'
      };
    }
    
  } catch (error) {
    return {
      success: false,
      issue: 'Diagnostic failed',
      error: error.message,
      guidance: 'Check Firebase configuration'
    };
  }
};

export const checkFirebaseConfig = () => {
  console.log('🔧 Checking Firebase configuration...');
  
  try {
    if (!db) {
      return {
        valid: false,
        issue: 'Database not exported from config'
      };
    }
    
    if (!db.app) {
      return {
        valid: false,
        issue: 'Firebase app not attached to database'
      };
    }
    
    const appOptions = db.app.options;
    
    return {
      valid: true,
      config: {
        projectId: appOptions.projectId || 'missing',
        apiKey: appOptions.apiKey ? `${appOptions.apiKey.substring(0, 10)}...` : 'missing',
        authDomain: appOptions.authDomain || 'missing'
      }
    };
    
  } catch (error) {
    return {
      valid: false,
      issue: 'Configuration import failed',
      error: error.message
    };
  }
};