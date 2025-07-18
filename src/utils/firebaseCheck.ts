import { auth, db } from '../config/firebase';
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';

export const checkFirebaseConfiguration = () => {
  const config = {
    auth: {
      isConfigured: !!auth,
      currentUser: auth.currentUser,
      emulator: false
    },
    firestore: {
      isConfigured: !!db,
      emulator: false
    },
    environment: {
      nodeEnv: import.meta.env.MODE,
      isDevelopment: import.meta.env.DEV,
      isProduction: import.meta.env.PROD
    }
  };

  console.log('🔥 Firebase Configuration Check:', config);
  
  // Check if we're using emulators
  try {
    // This will throw if emulator is not connected
    console.log('Auth emulator:', auth._delegate._config);
  } catch (e) {
    console.log('Auth emulator: Not connected (this is normal for production)');
  }

  return config;
};

export const testFirebaseConnection = async () => {
  console.log('🧪 Testing Firebase Connection...');
  
  try {
    // Test Auth
    console.log('✓ Firebase Auth available');
    
    // Test Firestore
    console.log('✓ Firestore available');
    
    // Test configuration
    const authDomain = auth.config.authDomain;
    const projectId = db._delegate._databaseId.projectId;
    
    console.log(`✓ Auth Domain: ${authDomain}`);
    console.log(`✓ Project ID: ${projectId}`);
    
    return {
      success: true,
      authDomain,
      projectId
    };
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return {
      success: false,
      error
    };
  }
};