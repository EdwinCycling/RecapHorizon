const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

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

async function testPrompts() {
  try {
    console.log('Testing prompts collection read access...');
    
    const promptsRef = collection(db, 'prompts');
    const snapshot = await getDocs(promptsRef);
    
    console.log(`Found ${snapshot.size} prompts in the collection`);
    
    snapshot.forEach((doc) => {
      console.log(`- ${doc.id}:`, doc.data());
    });
    
  } catch (error) {
    console.error('Error reading prompts:', error);
  }
}

testPrompts();