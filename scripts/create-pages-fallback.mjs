import { copyFile, mkdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const distDir = resolve('dist');
const indexPath = resolve(distDir, 'index.html');
const fallbackPath = resolve(distDir, '404.html');
const routeFallbacks = [
  'app',
  'app/order',
  'app/announcements',
  'app/maintenance',
  'app/placement',
  'app/recipes',
  'app/members',
  'app/profile',
  'app/pending',
  'app/rejected',
  'app/deleted',
  'app/attendance',
  'app/staff',
  'app/admin',
  'login',
  'register',
  'guest-login',
  'guest-register',
  'opening',
  'guest',
  'guest/casts',
  'guest/menu',
  'guest/order',
  'guest/lottery',
  'guest/game',
  'guest/point',
  'guest/profile',
];

await stat(indexPath);
await copyFile(indexPath, fallbackPath);

for (const route of routeFallbacks) {
  const routeDir = resolve(distDir, route);
  await mkdir(routeDir, { recursive: true });
  await copyFile(indexPath, resolve(routeDir, 'index.html'));
}
