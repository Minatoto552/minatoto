import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyCBRgyVvxu1vlv9VaAW8lAE8JkEZD8gl1E",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "gen-lang-client-0889115702.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "gen-lang-client-0889115702",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "gen-lang-client-0889115702.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "814028031113",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:814028031113:web:4e0b0f1e8a9cc4b4533258"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, import.meta.env.VITE_FIREBASE_DATABASE_ID ?? "ai-studio-0f9ba0b3-16be-43d0-b95d-488f1197f7f5");
export const auth = getAuth(app);
