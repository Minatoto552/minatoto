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
const report = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const basename = path.basename(file);
  const noext = basename.replace(/\.(tsx|ts)$/, '');

  // Get all exports
  const exportMatches = [...content.matchAll(/export (?:default )?(?:function|class|const|type|interface|enum) ([A-Z][a-zA-Z0-9_]*)/g)];
  const exportedNames = exportMatches.map(m => m[1]);

  // Get first import source to detect wrong files
  const importMatches = [...content.matchAll(/from ['"]([^'"]+)['"]/g)];
  const importSources = importMatches.map(m => m[1]);

  // Check the first line signature for obvious wrong file
  const firstLine = content.split('\n')[0];

  report.push({
    file: file.replace(/\\/g, '/'),
    exports: exportedNames,
    firstImport: importSources[0] || null,
    firstLine: firstLine.trim(),
  });
}

// Output summary
for (const r of report) {
  const basename = path.basename(r.file).replace(/\.(tsx|ts)$/, '');
  const nameMatch = r.exports.includes(basename);
  const flag = !nameMatch && basename !== 'main' && basename !== 'App' && basename !== 'index' ? '⚠️ MISMATCH' : '✓';
  console.log(`${flag} [${basename}] exports: [${r.exports.join(', ')}] | ${r.file}`);
}
