import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// 🔥 VERVANG DIT MET JE EIGEN FIREBASE CONFIGURATIE
const firebaseConfig = {
  apiKey: "AIzaSyDJN_IVciPV_2CFhY15xl5gvsyp4qqLPss",
  authDomain: "recapsmart-ed.firebaseapp.com",
  projectId: "recapsmart-ed",
  storageBucket: "recapsmart-ed.firebasestorage.app",
  messagingSenderId: "272169568677",
  appId: "1:272169568677:web:33b0ca5dfefd525621004c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Connect to emulators in development (optional)
if (process.env.NODE_ENV === 'development') {
  // Uncomment these lines if you want to use Firebase emulators for development
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

export default app;
