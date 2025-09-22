const { initializeApp } = require('firebase/app');
const { getFirestore, doc, deleteDoc } = require('firebase/firestore');
require('dotenv').config({ path: '../.env' });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function removeOldModelConfig() {
  try {
    console.log('Removing old modelConfig document...');
    
    // Delete the old modelConfig document
    const modelConfigRef = doc(db, 'settings', 'modelConfig');
    await deleteDoc(modelConfigRef);
    
    console.log('✅ Old modelConfig document removed successfully!');
    console.log('The tier-based model configurations are now the only source of truth.');
    
  } catch (error) {
    console.error('❌ Error removing old modelConfig:', error);
    process.exit(1);
  }
}

removeOldModelConfig()
  .then(() => {
    console.log('🎉 Cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });