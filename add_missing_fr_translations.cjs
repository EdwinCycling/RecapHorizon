const fs = require('fs');
const path = require('path');

// Simple translation mapping for common Dutch to French translations
const dutchToFrench = {
  'Ja': 'Oui',
  'Nee': 'Non',
  'Chat klaar, overgaan naar analyse?': 'Chat terminé, passer à l\'analyse ?',
  'De volledige chat wordt geanalyseerd en toegevoegd aan je RecapHorizon analyse.': 'Le chat complet sera analysé et ajouté à votre analyse RecapHorizon.',
  'Transcriptie geannuleerd door gebruiker.': 'Transcription annulée par l\'utilisateur.',
  'Transcriptie gestopt na te veel fouten.': 'Transcription arrêtée après trop d\'erreurs.',
  'Te veel opeenvolgende fouten.': 'Trop d\'erreurs consécutives.',
  'Transcriptie voltooid met waarschuwingen.': 'Transcription terminée avec des avertissements.',
  'Transcriptie voltooid.': 'Transcription terminée.'
};

function parseTranslationFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const translations = new Map();
  
  // Remove comments and clean content
  const cleanContent = content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Match key-value pairs with proper handling of nested quotes
  const regex = /([a-zA-Z_][a-zA-Z0-9_.-]*)\s*:\s*("(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`|'(?:[^'\\]|\\.)*')/g;
  let match;
  
  while ((match = regex.exec(cleanContent)) !== null) {
    const key = match[1];
    const value = match[2];
    
    // Skip TypeScript keywords
    if (!['export', 'const', 'let', 'var', 'function', 'if', 'else', 'for', 'while', 'return', 'import', 'from'].includes(key)) {
      translations.set(key, value);
    }
  }
  
  return translations;
}

function addMissingTranslations() {
  const nlPath = path.join(__dirname, 'src', 'locales', 'nl.ts');
  const frPath = path.join(__dirname, 'src', 'locales', 'fr.ts');
  
  console.log('Parsing Dutch translations...');
  const nlTranslations = parseTranslationFile(nlPath);
  console.log(`Found ${nlTranslations.size} Dutch translations`);
  
  console.log('Parsing French translations...');
  const frTranslations = parseTranslationFile(frPath);
  console.log(`Found ${frTranslations.size} French translations`);
  
  // Find missing keys
  const missingKeys = [];
  for (const [key, value] of nlTranslations) {
    if (!frTranslations.has(key)) {
      missingKeys.push({ key, value });
    }
  }
  
  console.log(`Found ${missingKeys.length} missing translations in French file`);
  
  if (missingKeys.length === 0) {
    console.log('✅ All translations are synchronized!');
    return;
  }
  
  // Read the French file content
  let frContent = fs.readFileSync(frPath, 'utf8');
  
  // Find the position after "export const fr = {" to insert missing translations
  const insertPosition = frContent.indexOf('export const fr = {') + 'export const fr = {'.length;
  
  if (insertPosition === -1 + 'export const fr = {'.length) {
    console.error('❌ Could not find export statement in French file');
    return;
  }
  
  // Prepare translations to add
  let translationsToAdd = '';
  
  for (const { key, value } of missingKeys) {
    // Try to get French translation from mapping, otherwise use Dutch as placeholder
    const dutchValue = value.replace(/^["'`]|["'`]$/g, ''); // Remove quotes
    const frenchValue = dutchToFrench[dutchValue] || `[FR] ${dutchValue}`;
    
    translationsToAdd += `\n  ${key}: "${frenchValue}",`;
  }
  
  // Insert the missing translations at the beginning of the object
  const beforeInsert = frContent.substring(0, insertPosition);
  const afterInsert = frContent.substring(insertPosition);
  
  const newContent = beforeInsert + translationsToAdd + afterInsert;
  
  // Write the updated content back to the file
  fs.writeFileSync(frPath, newContent, 'utf8');
  
  console.log(`✅ Added ${missingKeys.length} missing translations to French file`);
  console.log('Missing translations added:');
  missingKeys.forEach(({ key }) => console.log(`  - ${key}`));
  
  // Verify the result
  console.log('\nVerifying result...');
  const updatedFrTranslations = parseTranslationFile(frPath);
  console.log(`French file now has ${updatedFrTranslations.size} translations`);
  
  const stillMissing = [];
  for (const [key] of nlTranslations) {
    if (!updatedFrTranslations.has(key)) {
      stillMissing.push(key);
    }
  }
  
  if (stillMissing.length === 0) {
    console.log('✅ Perfect! All translations are now synchronized.');
  } else {
    console.log(`⚠️  Still missing ${stillMissing.length} translations:`, stillMissing);
  }
}

// Run the script
try {
  addMissingTranslations();
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}