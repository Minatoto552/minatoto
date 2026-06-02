const fs = require('fs');
const path = require('path');

const dir = process.cwd();
const recoveredDir = path.join(dir, 'recovered');
if (!fs.existsSync(recoveredDir)) {
  fs.mkdirSync(recoveredDir);
}

const files = fs.readdirSync(dir);
const mapping = {};

for (const file of files) {
  if (fs.statSync(file).isDirectory()) continue;
  if (file.startsWith('recover')) continue;
  
  const content = fs.readFileSync(file, 'utf8');
  let newName = file; // default
  
  if (file === 'package-lock.json' || file === 'package.json' || file === 'tsconfig.json' || file === 'vite.config.ts' || file === 'eslint.config.mjs' || file === 'firebase-applet-config.json' || file === 'firebase-blueprint.json' || file === 'metadata.json') {
    newName = file;
  } else if (content.includes('<div id="root"></div>')) {
    newName = 'index.html';
  } else if (content.includes('createRoot(document.getElementById')) {
    newName = 'main.tsx';
  } else if (content.includes("import { getApps, initializeApp } from 'firebase/app'") && content.includes('const TABLES')) {
    newName = 'fix-rotations.ts';
  } else if (content.includes('export default function App()')) {
    newName = 'App.tsx';
  } else if (content.includes('@import "tailwindcss";') || content.includes('@tailwind base;')) {
    newName = 'index.css';
  } else if (content.includes('export function cn(') || content.includes('export function getBusinessDate(')) {
    newName = 'utils.ts';
  } else if (content.includes('export const db = getFirestore')) {
    newName = 'firebase.ts';
  } else if (content.includes('export const MockAppContext')) {
    newName = 'MockAppContext.tsx';
  } else if (content.match(/export (?:default )?function ([A-Z][a-zA-Z0-9_]*)/)) {
    const match = content.match(/export (?:default )?function ([A-Z][a-zA-Z0-9_]*)/);
    newName = match[1] + '.tsx';
  } else if (content.match(/export function (use[A-Z][a-zA-Z0-9_]*)/)) {
    const match = content.match(/export function (use[A-Z][a-zA-Z0-9_]*)/);
    newName = match[1] + '.ts';
  } else if (content.includes('VITE_FIREBASE_')) {
    newName = 'env.example';
  } else if (content.includes('updateMockData')) {
    newName = 'update_mock.js';
  } else if (content.includes('# VRC Bar Creator')) {
    newName = 'README.md';
  } else if (content.includes('React + TypeScript + Vite')) {
    newName = 'README.md';
  }
  
  if (newName !== file && file.endsWith('.tsx') && newName === 'package.json') {
     // A .tsx file contains package.json (like App.tsx). Let's not write it if package.json already exists.
     continue;
  }

  mapping[file] = newName;
  fs.writeFileSync(path.join(recoveredDir, newName), content);
}

console.log("Recovery complete!");
