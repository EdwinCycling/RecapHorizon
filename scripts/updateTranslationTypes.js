const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const typesFile = path.join(projectRoot, 'types.ts');

const targetExtensions = new Set(['.ts', '.tsx']);

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const walk = (dir, files = []) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (targetExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
};

const files = walk(path.join(projectRoot, 'src'));

const typePatterns = [
  /t:\s*\(key:\s*string\)\s*=>\s*(?:string|any)/g,
  /t:\s*\(key:\s*string,\s*params\?:\s*Record<string,\s*(?:unknown|any)>\)\s*=>\s*(?:string|any)/g,
  /t:\s*\(key:\s*string,\s*params\?:\s*any\)\s*=>\s*(?:string|any)/g,
  /t:\s*\(key:\s*string,\s*fallbackOrParams\?:[^)]*\)\s*=>\s*(?:string|any)/g
];

let updatedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  for (const pattern of typePatterns) {
    content = content.replace(pattern, 't: TranslationFunction');
  }

  // Handle destructured props typing in function signatures
  content = content.replace(/\{([^}]*?)t:\s*\(key:\s*string\)\s*=>\s*(?:string|any)([^}]*)\}/gs, (match, before, after) => {
    return `{${before.trim() ? before : ''}${before.trim() ? ' ' : ''}t: TranslationFunction${after.trim() ? ' ' : ''}${after.trim() ? after : ''}}`;
  });

  content = content.replace(/\{([^}]*?)t:\s*\(key:\s*string,\s*params\?:\s*Record<string,\s*(?:unknown|any)>\)\s*=>\s*(?:string|any)([^}]*)\}/gs, (match, before, after) => {
    return `{${before.trim() ? before : ''}${before.trim() ? ' ' : ''}t: TranslationFunction${after.trim() ? ' ' : ''}${after.trim() ? after : ''}}`;
  });

  if (content !== original) {
    const relativeImport = path.relative(path.dirname(file), typesFile).replace(/\\/g, '/').replace(/\.ts$/, '');
    const formattedImport = relativeImport.startsWith('.') ? relativeImport : `./${relativeImport}`;
    const importRegex = new RegExp(`import\\s+\\{([^}]*)\\}\\s+from\\s+['\"]${escapeRegExp(formattedImport)}['\"];`);

    if (importRegex.test(content)) {
      content = content.replace(importRegex, (full, imports) => {
        const importList = imports.split(',').map((item) => item.trim()).filter(Boolean);
        if (!importList.includes('TranslationFunction')) {
          importList.push('TranslationFunction');
        }
        return `import { ${importList.join(', ')} } from '${formattedImport}';`;
      });
    } else {
      // Try fallback: existing import with different spacing
      const importRegexWhitespace = new RegExp(`import\\s+\\{([^}]*)\\}\\s+from\\s+['\"]${escapeRegExp(formattedImport)}['\"];`);
      if (importRegexWhitespace.test(content)) {
        content = content.replace(importRegexWhitespace, (full, imports) => {
          const importList = imports.split(',').map((item) => item.trim()).filter(Boolean);
          if (!importList.includes('TranslationFunction')) {
            importList.push('TranslationFunction');
          }
          return `import { ${importList.join(', ')} } from '${formattedImport}';`;
        });
      } else {
        const lines = content.split(/\r?\n/);
        let lastImportIndex = -1;
        for (let i = 0; i < lines.length; i++) {
          if (/^import\s/.test(lines[i])) {
            lastImportIndex = i;
          } else if (lines[i].trim() !== '' && !/^\/\//.test(lines[i])) {
            break;
          }
        }
        const importStatement = `import { TranslationFunction } from '${formattedImport}';`;
        if (!lines.some((line) => line.includes(importStatement))) {
          lines.splice(lastImportIndex + 1, 0, importStatement);
          content = lines.join('\n');
        }
      }
    }

    fs.writeFileSync(file, content, 'utf8');
    updatedCount++;
  }
}

console.log(`Updated ${updatedCount} files with TranslationFunction typings.`);

