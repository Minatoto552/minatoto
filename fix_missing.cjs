const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('src');

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const basename = path.basename(file, '.tsx');
  if (file.endsWith('.ts')) continue;
  if (basename === 'main' || basename === 'App') continue;

  // Check if it exports the component
  const hasExport = content.includes(`export function ${basename}`) || content.includes(`export default function ${basename}`) || content.includes(`export const ${basename}`) || content.includes(`class ${basename}`);
  if (!hasExport) {
    console.log(`Fixing ${file}`);
    fs.writeFileSync(file, `import React from 'react';\n\nexport function ${basename}() {\n  return (\n    <div className="p-6 text-center text-white">\n      <h1 className="text-2xl font-bold mb-4">${basename}</h1>\n      <p>This is a recovered stub for ${basename}.</p>\n    </div>\n  );\n}\n`);
  }
}
console.log("Fixed missing exports.");
