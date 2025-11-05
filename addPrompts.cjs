const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local explicitly
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

function getServiceAccount() {
  // Prefer JSON string in env
  let serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  // Alternatively support file path
  const serviceAccountFile = process.env.FIREBASE_SERVICE_ACCOUNT_FILE || process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!serviceAccountJson && serviceAccountFile) {
    try {
      const resolved = path.isAbsolute(serviceAccountFile) ? serviceAccountFile : path.join(__dirname, serviceAccountFile);
      const content = fs.readFileSync(resolved, 'utf8');
      serviceAccountJson = content;
      console.log(`🔑 Loaded service account from file: ${resolved}`);
    } catch (err) {
      console.error('❌ Failed to read service account file:', err);
      process.exit(1);
    }
  }

  if (!serviceAccountJson) {
    console.error('❌ Firebase Admin not initialized: missing FIREBASE_SERVICE_ACCOUNT, FIREBASE_SERVICE_ACCOUNT_KEY, or FIREBASE_SERVICE_ACCOUNT_FILE');
    process.exit(1);
  }

  const serviceAccount = JSON.parse(serviceAccountJson);
  // Normalize private key newlines
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }
  return serviceAccount;
}

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  try {
    if (admin.apps.length === 0) {
      const serviceAccount = getServiceAccount();
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key
        })
      });
      console.log('✅ Firebase Admin SDK initialized successfully');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    process.exit(1);
  }
}

// Test prompts to add
const testPrompts = [
  {
    id: 'innovatie-brainstorm',
    title: 'Innovatie Brainstorm',
    prompt_text: 'Genereer 5 radicale innovatie-ideeën gebaseerd op de problemen en behoeften die in deze transcriptie worden genoemd. Denk buiten de gebaande paden.',
    requires_topic: false,
    is_active: true,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
    language: null // Alle talen
  },
  {
    id: 'project-risico-overzicht',
    title: 'Project Risico Overzicht',
    prompt_text: 'Analyseer de discussie rondom dit onderwerp en identificeer de top 3 meest kritieke risico\'s voor de succesvolle afronding. Geef per risico ook een korte mitigatiestrategie.',
    requires_topic: true,
    is_active: true,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
    language: null // Alle talen
  }
];

// Add prompts to Firestore
async function addPromptsToFirestore() {
  try {
    console.log('🚀 Starting to add test prompts to Firestore...');
    const db = admin.firestore();

    for (const prompt of testPrompts) {
      console.log(`📝 Adding prompt: ${prompt.title}`);
      const promptRef = db.collection('prompts').doc(prompt.id);
      await promptRef.set(prompt);
      console.log(`✅ Successfully added: ${prompt.title} (requires_topic: ${prompt.requires_topic})`);
    }

    console.log('\n🔍 Verifying prompts in database...');
    const promptsSnapshot = await db.collection('prompts').get();
    console.log(`📊 Total prompts in collection: ${promptsSnapshot.size}`);
    promptsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${data.title} (ID: ${doc.id}, requires_topic: ${data.requires_topic})`);
    });
    console.log('\n🎉 All test prompts have been successfully added to Firestore!');
  } catch (error) {
    console.error('❌ Error adding prompts to Firestore:', error);
    process.exit(1);
  }
}

// Main execution
async function main() {
  console.log('🔧 Initializing Firebase Admin SDK...');
  initializeFirebaseAdmin();
  console.log('📋 Adding test prompts for Specials functionality...');
  await addPromptsToFirestore();
  console.log('\n✨ Script completed successfully!');
  process.exit(0);
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});