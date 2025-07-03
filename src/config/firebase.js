// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBa1dbGKkaCqDq2_C_dCKMDL8_G-gojodo",
  authDomain: "hr-reports-app.firebaseapp.com",
  databaseURL: "https://hr-reports-app-default-rtdb.firebaseio.com",
  projectId: "hr-reports-app",
  storageBucket: "hr-reports-app.firebasestorage.app",
  messagingSenderId: "30506643677",
  appId: "1:30506643677:web:a8604045feaec671cd6b34"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database
export const db = getFirestore(app);

// Analytics disabled for development
// In production, you can enable analytics by adding the getAnalytics import
let analytics = null;
export { analytics };

// Development mode: Connect to Firestore emulator if running locally
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Uncomment the line below to use Firestore emulator in development
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

export default app;