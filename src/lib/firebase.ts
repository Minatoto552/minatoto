import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebasePublicDefaults = {
  apiKey: 'AIzaSyCBRgyVvxu1vlv9VaAW8lAE8JkEZD8gl1E',
  authDomain: 'gen-lang-client-0889115702.firebaseapp.com',
  projectId: 'gen-lang-client-0889115702',
  storageBucket: 'gen-lang-client-0889115702.firebasestorage.app',
  messagingSenderId: '814028031113',
  appId: '1:814028031113:web:4e0b0f1e8a9cc4b4533258',
  databaseId: 'ai-studio-0f9ba0b3-16be-43d0-b95d-488f1197f7f5',
} as const;

const getFirebaseValue = (value: string | undefined, fallback: string, key: string) => {
  const resolved = value?.trim() || fallback;
  if (!resolved) throw new Error(`Firebase configuration is missing: ${key}`);
  return resolved;
};

const firebaseConfig = {
  apiKey: getFirebaseValue(import.meta.env.VITE_FIREBASE_API_KEY, firebasePublicDefaults.apiKey, 'VITE_FIREBASE_API_KEY'),
  authDomain: getFirebaseValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, firebasePublicDefaults.authDomain, 'VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getFirebaseValue(import.meta.env.VITE_FIREBASE_PROJECT_ID, firebasePublicDefaults.projectId, 'VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getFirebaseValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, firebasePublicDefaults.storageBucket, 'VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getFirebaseValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, firebasePublicDefaults.messagingSenderId, 'VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getFirebaseValue(import.meta.env.VITE_FIREBASE_APP_ID, firebasePublicDefaults.appId, 'VITE_FIREBASE_APP_ID'),
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(
  app,
  getFirebaseValue(import.meta.env.VITE_FIREBASE_DATABASE_ID, firebasePublicDefaults.databaseId, 'VITE_FIREBASE_DATABASE_ID'),
);
export const auth = getAuth(app);
