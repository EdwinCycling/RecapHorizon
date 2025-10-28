const fs = require('fs');
const path = require('path');

// Function to extract keys from a translation file more accurately
function extractKeys(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const keys = new Set();
    
    // Remove comments first
    const cleanContent = content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Match key patterns more precisely
    // Pattern 1: "key": value
    const quotedKeyRegex = /"([^"]+)"\s*:\s*(?:"[^"]*"|`[^`]*`|'[^']*'|{[^}]*})/g;
    let match;
    while ((match = quotedKeyRegex.exec(cleanContent)) !== null) {
        keys.add(match[1]);
    }
    
    // Pattern 2: key: value (unquoted keys)
    const unquotedKeyRegex = /(?:^|\s|,)([a-zA-Z_][a-zA-Z0-9_.-]*)\s*:\s*(?:"[^"]*"|`[^`]*`|'[^']*'|{[^}]*})/g;
    while ((match = unquotedKeyRegex.exec(cleanContent)) !== null) {
        const key = match[1];
        // Skip JavaScript keywords and common non-key words
        if (!['export', 'const', 'let', 'var', 'function', 'if', 'else', 'for', 'while', 'return', 'import', 'from'].includes(key)) {
            keys.add(key);
        }
    }
    
    return keys;
}

// Extract keys from both files
const nlPath = path.join(__dirname, 'src', 'locales', 'nl.ts');
const frPath = path.join(__dirname, 'src', 'locales', 'fr.ts');

console.log('Extracting keys from Dutch file...');
const nlKeys = extractKeys(nlPath);
console.log(`Found ${nlKeys.size} keys in Dutch file`);

console.log('Extracting keys from French file...');
const frKeys = extractKeys(frPath);
console.log(`Found ${frKeys.size} keys in French file`);

// Find missing keys
const missingInFrench = [...nlKeys].filter(key => !frKeys.has(key));
const missingInDutch = [...frKeys].filter(key => !nlKeys.has(key));

console.log('\n=== MISSING IN FRENCH FILE ===');
console.log(`Count: ${missingInFrench.length}`);
missingInFrench.sort().forEach(key => console.log(`- ${key}`));

console.log('\n=== MISSING IN DUTCH FILE ===');
console.log(`Count: ${missingInDutch.length}`);
missingInDutch.sort().forEach(key => console.log(`- ${key}`));

// Save results to files for reference
fs.writeFileSync('missing_in_french.txt', missingInFrench.sort().join('\n'));
fs.writeFileSync('missing_in_dutch_from_fr.txt', missingInDutch.sort().join('\n'));

console.log('\nResults saved to missing_in_french.txt and missing_in_dutch_from_fr.txt');