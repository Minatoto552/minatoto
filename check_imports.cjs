const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) results = results.concat(walk(full));
    else if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(full);
  }
  return results;
}

const files = walk('src');
const issues = [];

// Map of what App.tsx and other top-level files import
// Gather all import statements across all files
const allImports = {}; // path -> [{importedName, fromFile}]
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const importMatches = [...content.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g)];
  for (const m of importMatches) {
    const names = m[1].split(',').map(s => s.trim());
    const from = m[2];
    if (!from.startsWith('.')) continue; // skip node_modules
    const resolved = path.resolve(path.dirname(file), from).replace(/\\/g, '/');
    const key = resolved;
    if (!allImports[key]) allImports[key] = [];
    for (const name of names) {
      if (name) allImports[key].push({ name: name.trim(), fromFile: file });
    }
  }
}

// For each file, get its exports and check against what's imported
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const fileNoExt = file.replace(/\.(tsx|ts)$/, '').replace(/\\/g, '/');
  
  const exportMatches = [...content.matchAll(/export\s+(?:default\s+)?(?:function|class|const|let|var|type|interface|enum)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g)];
  const exports = new Set(exportMatches.map(m => m[1]));
  
  // Check what's imported from this file
  const imported = allImports[fileNoExt] || [];
  for (const {name, fromFile} of imported) {
    if (!exports.has(name)) {
      issues.push(`MISSING EXPORT: "${name}" expected in ${file.replace(/\\/g,'/')} (imported by ${fromFile.replace(/\\/g,'/')})`);
    }
  }
}

if (issues.length === 0) {
  console.log('✅ All imports resolved correctly!');
} else {
  for (const issue of issues) {
    console.log('❌ ' + issue);
  }
}
