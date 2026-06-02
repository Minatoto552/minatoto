const fs = require('fs');
const path = require('path');

const dir = process.cwd();
const files = fs.readdirSync(dir);

const mapping = {};

for (const file of files) {
  if (fs.statSync(file).isDirectory()) continue;
  
  const content = fs.readFileSync(file, 'utf8');
  let newName = null;
  
  if (content.includes('"name": "react-example"') && content.includes('"dependencies": {')) {
    // package.json might be duplicated, let's keep package.json as is if possible
    newName = 'package.json';
  } else if (content.includes('<div id="root"></div>')) {
    newName = 'index.html';
  } else if (content.includes('createRoot(document.getElementById')) {
    newName = 'main.tsx';
  } else if (content.includes("import { getApps, initializeApp } from 'firebase/app'") && content.includes('const TABLES')) {
    newName = 'fix-rotations.ts';
  } else if (content.includes('export default function App()')) {
    newName = 'App.tsx';
  } else if (content.includes('@tailwind base;')) {
    newName = 'index.css';
  } else if (content.includes('export function cn(')) {
    newName = 'utils.ts'; // Actually utils in this codebase is in lib/utils but here it's flat? Wait, there is a `utils.ts` in root.
  } else if (content.includes('export const db = getFirestore')) {
    newName = 'firebase.ts';
  } else if (content.includes('export const MockAppContext')) {
    newName = 'MockAppContext.tsx';
  } else if (content.includes('export function getBusinessDate(')) {
    newName = 'utils2.ts'; // wait, maybe utils.ts?
  } else if (content.match(/export (?:default )?function ([A-Z][a-zA-Z0-9_]*)/)) {
    const match = content.match(/export (?:default )?function ([A-Z][a-zA-Z0-9_]*)/);
    newName = match[1] + '.tsx';
  } else if (content.match(/export function (use[A-Z][a-zA-Z0-9_]*)/)) {
    const match = content.match(/export function (use[A-Z][a-zA-Z0-9_]*)/);
    newName = match[1] + '.ts';
  }
  
  if (newName) {
    mapping[file] = newName;
  }
}

console.log(JSON.stringify(mapping, null, 2));
