const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
const imports = {};
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const matches = [...content.matchAll(/from\s+['"](\.[^'"]+)['"]/g)];
  for (const match of matches) {
    const importPath = match[1];
    if (!imports[importPath]) imports[importPath] = [];
    imports[importPath].push(file);
  }
}
console.log(JSON.stringify(imports, null, 2));
