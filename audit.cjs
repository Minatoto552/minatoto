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

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const basename = path.basename(file);
  const noext = basename.replace(/\.(tsx|ts)$/, '');
  
  // Check for JSX in .ts files (not .tsx)
  if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
    if (content.includes('onClick={') || content.includes('className={') || content.includes('return (') && content.includes('<')) {
      issues.push({ file, issue: 'JSX in .ts file' });
    }
  }

  // For .tsx files, detect if exported component name matches filename
  if (file.endsWith('.tsx')) {
    const exportMatches = [...content.matchAll(/export (?:default )?(?:function|class|const) ([A-Z][a-zA-Z0-9_]*)/g)];
    const exportedNames = exportMatches.map(m => m[1]);
    
    if (exportedNames.length > 0 && !exportedNames.includes(noext) && noext !== 'main' && noext !== 'App' && noext !== 'index') {
      issues.push({ file, issue: `File is named ${noext} but exports: ${exportedNames.join(', ')}` });
    }
    
    if (exportedNames.length === 0 && !content.includes('export default')) {
      issues.push({ file, issue: 'No exports found' });
    }
  }
}

for (const issue of issues) {
  console.log(`[ISSUE] ${issue.file}: ${issue.issue}`);
}

if (issues.length === 0) {
  console.log('No issues found!');
} else {
  console.log(`\nTotal issues: ${issues.length}`);
}
