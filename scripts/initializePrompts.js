const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, getDocs, serverTimestamp } = require('firebase/firestore');
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

const testPrompts = [
  {
    id: 'innovatie-brainstorm',
    title: 'Innovatie Brainstorm',
    prompt_text: 'Genereer 5 radicale innovatie-ideeën gebaseerd op de problemen en behoeften die in deze transcriptie worden genoemd. Denk buiten de gebaande paden.',
    requires_topic: false,
    is_active: true,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    language: null // Alle talen
  },
  {
    id: 'project-risico-overzicht',
    title: 'Project Risico Overzicht',
    prompt_text: 'Analyseer de discussie rondom dit onderwerp en identificeer de top 3 meest kritieke risico\'s voor de succesvolle afronding. Geef per risico ook een korte mitigatiestrategie.',
    requires_topic: true,
    is_active: true,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    language: null // Alle talen
  }
];

async function initializePrompts() {
  try {
    console.log('Initializing prompts collection...');
    
    for (const prompt of testPrompts) {
      const promptRef = doc(db, 'prompts', prompt.id);
      await setDoc(promptRef, prompt);
      console.log(`Added prompt: ${prompt.title}`);
    }
    
    console.log('Successfully initialized prompts collection with test data');
    
    // Verify the data was added
    const promptsSnapshot = await getDocs(collection(db, 'prompts'));
    console.log(`Total prompts in collection: ${promptsSnapshot.size}`);
    
    promptsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${data.title} (requires_topic: ${data.requires_topic})`);
    });
    
  } catch (error) {
    console.error('Error initializing prompts:', error);
  } finally {
    process.exit(0);
  }
}

initializePrompts();