import { copyFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const distDir = resolve('dist');
const indexPath = resolve(distDir, 'index.html');
const fallbackPath = resolve(distDir, '404.html');

await stat(indexPath);
await copyFile(indexPath, fallbackPath);
