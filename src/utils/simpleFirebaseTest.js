// Simple Firebase test without analytics
import { db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const testBasicFirebaseConnection = async () => {
  try {
    console.log('🔍 Testing basic Firebase connection...');
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000);
    });
    
    // Test document reference
    const testDoc = doc(db, 'test', 'connection');
    
    // Try to write a simple document with timeout
    await Promise.race([
      setDoc(testDoc, {
        message: 'Hello Firebase!',
        timestamp: new Date(),
        test: true
      }),
      timeoutPromise
    ]);
    
    console.log('✅ Write test successful');
    
    // Try to read the document with timeout
    const docSnap = await Promise.race([
      getDoc(testDoc),
      timeoutPromise
    ]);
    
    if (docSnap.exists()) {
      console.log('✅ Read test successful:', docSnap.data());
      return { success: true, data: docSnap.data() };
    } else {
      throw new Error('Document was not found after writing');
    }
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    
    // Provide specific error guidance
    let errorGuidance = '';
    if (error.code === 'permission-denied') {
      errorGuidance = 'Firestore security rules may be too restrictive. Check Firebase console > Firestore > Rules.';
    } else if (error.code === 'unavailable') {
      errorGuidance = 'Firestore may not be enabled. Check Firebase console > Firestore Database.';
    } else if (error.message.includes('API key')) {
      errorGuidance = 'Invalid API key. Check Firebase console > Project Settings > General.';
    } else if (error.message.includes('analytics')) {
      errorGuidance = 'Analytics error (this is optional and can be ignored).';
    }
    
    return { 
      success: false, 
      error: error.message,
      code: error.code,
      guidance: errorGuidance
    };
  }
};