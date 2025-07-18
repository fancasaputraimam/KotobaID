import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: 'admin' | 'user') => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, role: 'admin' | 'user' = 'user') => {
    let userCredential;
    
    try {
      // Step 1: Create Firebase Authentication user
      console.log('Creating Firebase user...');
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Firebase user created successfully:', user.uid);
      
      // Step 2: Prepare user data for Firestore
      const userData: User = {
        uid: user.uid,
        email: user.email!,
        role,
        displayName: user.displayName || undefined,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // Step 3: Save user data to Firestore
      console.log('Saving user data to Firestore...');
      try {
        await setDoc(doc(db, 'users', user.uid), userData);
        console.log('User data saved to Firestore successfully');
      } catch (firestoreError: any) {
        console.error('Firestore error:', firestoreError);
        
        // If Firestore fails, we still have a valid Firebase user
        // We can either continue (user can login) or clean up
        console.warn('User was created in Firebase Auth but Firestore save failed');
        
        // Option 1: Continue without Firestore data (user can still login)
        // This allows the app to work even if Firestore has permission issues
        console.log('Continuing with Firebase Auth user only');
        return; // Success - user can login even without Firestore data
        
        // Option 2: Clean up by deleting the Firebase user (uncomment if needed)
        // try {
        //   await user.delete();
        //   console.log('Cleaned up Firebase user due to Firestore error');
        // } catch (cleanupError) {
        //   console.error('Failed to cleanup Firebase user:', cleanupError);
        // }
        // throw new Error('firestore-permission-denied');
      }
      
    } catch (error: any) {
      console.error('Error in register function:', error);
      
      // If this is an auth error, throw it as-is
      if (error.code && error.code.startsWith('auth/')) {
        throw error;
      }
      
      // If this is our custom Firestore error
      if (error.message === 'firestore-permission-denied') {
        const customError = new Error('Akun berhasil dibuat di Firebase tetapi gagal menyimpan data profil. Anda masih bisa login.');
        customError.name = 'FirestoreError';
        throw customError;
      }
      
      // For any other error, re-throw
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setCurrentUser({
              ...userData,
              createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(userData.createdAt),
              lastLogin: userData.lastLogin instanceof Date ? userData.lastLogin : new Date(userData.lastLogin)
            });
          } else {
            // User exists in Firebase Auth but not in Firestore
            // Create a minimal user object from Firebase Auth data
            console.log('User found in Firebase Auth but not in Firestore, creating minimal profile');
            const minimalUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              role: 'user',
              displayName: firebaseUser.displayName || undefined,
              createdAt: new Date(),
              lastLogin: new Date()
            };
            
            // Try to save to Firestore (optional - if it fails, user can still use the app)
            try {
              await setDoc(doc(db, 'users', firebaseUser.uid), minimalUser);
              console.log('Successfully created Firestore profile for existing Firebase user');
            } catch (firestoreError) {
              console.warn('Could not save to Firestore, but user can still use the app:', firestoreError);
            }
            
            setCurrentUser(minimalUser);
          }
        } catch (error) {
          console.error('Error loading user data from Firestore:', error);
          // If Firestore is completely unavailable, still allow the user to use the app
          const fallbackUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            role: 'user',
            displayName: firebaseUser.displayName || undefined,
            createdAt: new Date(),
            lastLogin: new Date()
          };
          setCurrentUser(fallbackUser);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};