import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const requireFirebaseEnv = (value: string | undefined, key: string) => {
  if (!value) throw new Error(`Missing Firebase environment variable: ${key}`);
  return value;
};

const firebaseConfig = {
  apiKey: requireFirebaseEnv(import.meta.env.VITE_FIREBASE_API_KEY, 'VITE_FIREBASE_API_KEY'),
  authDomain: requireFirebaseEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, 'VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: requireFirebaseEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID, 'VITE_FIREBASE_PROJECT_ID'),
  storageBucket: requireFirebaseEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, 'VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: requireFirebaseEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, 'VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: requireFirebaseEnv(import.meta.env.VITE_FIREBASE_APP_ID, 'VITE_FIREBASE_APP_ID'),
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(
  app,
  requireFirebaseEnv(import.meta.env.VITE_FIREBASE_DATABASE_ID, 'VITE_FIREBASE_DATABASE_ID'),
);
export const auth = getAuth(app);
