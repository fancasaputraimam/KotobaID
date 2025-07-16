import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDvaS7MyBVjxfP7MAbEmAklVmgoP4Sh8jI",
  authDomain: "app-kotoba-id.firebaseapp.com",
  databaseURL: "https://app-kotoba-id-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "app-kotoba-id",
  storageBucket: "app-kotoba-id.firebasestorage.app",
  messagingSenderId: "560683819747",
  appId: "1:560683819747:web:77f97dfc45e24880b11bd6",
  measurementId: "G-YS4C2NK2HK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;