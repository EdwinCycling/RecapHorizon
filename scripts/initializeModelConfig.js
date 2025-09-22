// Script to initialize the model configuration in Firestore
// Run this script to create the settings/modelConfig document

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Load environment variables
require('dotenv').config({ path: '../.env' });

// Firebase configuration from environment variables (same as main app)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Validate that all required Firebase environment variables are present
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required Firebase environment variables:', missingVars);
  console.error('💡 Make sure your .env file in the project root contains all required variables.');
  process.exit(1);
}

// Default model configuration
const DEFAULT_MODEL_CONFIG = {
  audioTranscription: 'gemini-2.5-flash', // High quality needed for audio
  expertChat: 'gemini-2.5-flash-lite', // Simple conversations
  emailComposition: 'gemini-2.5-flash-lite', // Simple text generation
  analysisGeneration: 'gemini-2.5-flash', // Complex analysis needs quality
  pptExport: 'gemini-2.5-flash', // Structured output needs quality
  businessCase: 'gemini-2.5-flash', // Complex reasoning needed
  sessionImport: 'gemini-2.5-flash-lite', // Simple processing
  generalAnalysis: 'gemini-2.5-flash', // Balanced for various tasks
  updatedBy: 'system-initialization',
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString()
};

async function initializeModelConfig() {
  try {
    console.log('🚀 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('📝 Creating model configuration document...');
    await setDoc(doc(db, 'settings', 'modelConfig'), DEFAULT_MODEL_CONFIG);
    
    console.log('✅ Model configuration document created successfully!');
    console.log('📍 Location: Firestore > settings > modelConfig');
    console.log('🔧 You can now manage this configuration from your admin application.');
    
    // Display the created configuration
    console.log('\n📋 Created configuration:');
    console.log(JSON.stringify(DEFAULT_MODEL_CONFIG, null, 2));
    
  } catch (error) {
    console.error('❌ Error initializing model configuration:', error);
    console.error('\n🔍 Troubleshooting:');
    console.error('1. Make sure you have updated the Firebase configuration above');
    console.error('2. Ensure your Firebase project has Firestore enabled');
    console.error('3. Check that your service account has write permissions');
    console.error('4. Verify your internet connection');
  }
}

// Run the initialization
initializeModelConfig();