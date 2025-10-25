const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Subscription tiers
const SubscriptionTier = {
  FREE: 'free',
  SILVER: 'silver',
  GOLD: 'gold',
  ENTERPRISE: 'enterprise',
  DIAMOND: 'diamond'
};

// Tier-specific model configurations
const TIER_MODEL_CONFIGS = {
  [SubscriptionTier.FREE]: {
    audioTranscription: 'gemini-2.5-flash-lite',
    expertChat: 'gemini-2.5-flash-lite',
    emailComposition: 'gemini-2.5-flash-lite',
    analysisGeneration: 'gemini-2.5-flash-lite',
    pptExport: 'gemini-2.5-flash-lite',
    businessCase: 'gemini-2.5-flash-lite',
    sessionImport: 'gemini-2.5-flash-lite',
    generalAnalysis: 'gemini-2.5-flash-lite'
  },
  [SubscriptionTier.SILVER]: {
    audioTranscription: 'gemini-2.5-flash',
    expertChat: 'gemini-2.5-flash-lite',
    emailComposition: 'gemini-2.5-flash-lite',
    analysisGeneration: 'gemini-2.5-flash',
    pptExport: 'gemini-2.5-flash',
    businessCase: 'gemini-2.5-flash',
    sessionImport: 'gemini-2.5-flash-lite',
    generalAnalysis: 'gemini-2.5-flash'
  },
  [SubscriptionTier.GOLD]: {
    audioTranscription: 'gemini-2.5-flash',
    expertChat: 'gemini-2.5-flash',
    emailComposition: 'gemini-2.5-flash',
    analysisGeneration: 'gemini-2.0-flash-exp',
    pptExport: 'gemini-2.5-flash',
    businessCase: 'gemini-2.0-flash-exp',
    sessionImport: 'gemini-2.5-flash',
    generalAnalysis: 'gemini-2.0-flash-exp'
  },
  [SubscriptionTier.DIAMOND]: {
    audioTranscription: 'gemini-2.5-flash-lite',
    expertChat: 'gemini-2.5-flash-lite',
    emailComposition: 'gemini-2.5-flash-lite',
    analysisGeneration: 'gemini-2.5-flash-lite',
    pptExport: 'gemini-2.5-flash-lite',
    businessCase: 'gemini-2.5-flash-lite',
    sessionImport: 'gemini-2.5-flash-lite',
    generalAnalysis: 'gemini-2.5-flash-lite'
  },
  [SubscriptionTier.ENTERPRISE]: {
    audioTranscription: 'gemini-2.0-flash-exp',
    expertChat: 'gemini-2.0-flash-exp',
    emailComposition: 'gemini-2.0-flash-exp',
    analysisGeneration: 'gemini-2.0-flash-exp',
    pptExport: 'gemini-2.0-flash-exp',
    businessCase: 'gemini-2.0-flash-exp',
    sessionImport: 'gemini-2.0-flash-exp',
    generalAnalysis: 'gemini-2.0-flash-exp'
  }
};

async function initializeTierModelConfigs() {
  try {
    console.log('🔧 Initializing Firebase...');
    
    // Check if all required environment variables are present
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
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('📊 Creating tier-specific model configurations...');
    
    // Create model configurations for each tier
    for (const [tier, config] of Object.entries(TIER_MODEL_CONFIGS)) {
      const docRef = doc(db, 'settings', `modelConfig_${tier}`);
      
      await setDoc(docRef, {
        ...config,
        tier: tier,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        description: `Model configuration for ${tier} subscription tier`
      });
      
      console.log(`✅ Created model configuration for ${tier.toUpperCase()} tier`);
      console.log(`   Document: settings/modelConfig_${tier}`);
      console.log(`   Configuration:`, JSON.stringify(config, null, 2));
      console.log('');
    }
    
    console.log('🎉 All tier-specific model configurations have been created successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   - FREE tier: Uses gemini-2.5-flash-lite for all functions (most cost-effective)`);
    console.log(`   - SILVER tier: Uses gemini-2.5-flash for important functions, lite for simple ones`);
    console.log(`   - GOLD tier: Uses gemini-2.0-flash-exp for advanced functions, flash for others`);
    console.log(`   - DIAMOND tier: Uses gemini-2.5-flash-lite for all functions (cost-effective)`);
    console.log(`   - ENTERPRISE tier: Uses gemini-2.0-flash-exp for all functions (best quality)`);
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Update your application code to use getModelForFunctionByTier() method');
    console.log('   2. Pass the user\'s subscription tier when requesting models');
    console.log('   3. Test the tier-based model selection in your application');
    
  } catch (error) {
    console.error('❌ Error initializing tier model configurations:', error);
    console.log('');
    console.log('🔍 Troubleshooting steps:');
    console.log('1. Check that your .env file contains all required Firebase variables');
    console.log('2. Verify that your Firebase project has Firestore enabled');
    console.log('3. Ensure your Firestore security rules allow write access to the settings collection');
    console.log('4. Check your internet connection and Firebase project status');
    process.exit(1);
  }
}

// Run the initialization
initializeTierModelConfigs();