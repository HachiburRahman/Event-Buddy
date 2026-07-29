// Fails if any internal href in src/ points at a route that does not exist under src/app.
// Next.js prefetches in-viewport <Link>s, so a dangling href shows up as a console 404
// on every page that renders it — silently, without breaking the UI.
//
// Run: npm run check:routes

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const SRC = join(process.cwd(), 'src');
const APP = join(SRC, 'app');

const walk = (dir, out = []) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
};

// src/app/(auth)/login/page.tsx -> /login ; src/app/events/[id]/page.tsx -> /events/[id]
const toRoute = (file) => {
  const segments = relative(APP, file).split(sep).slice(0, -1);
  const path = segments
    .filter((s) => !(s.startsWith('(') && s.endsWith(')')))
    .join('/');
  return '/' + path;
};

const routeMatcher = (route) => {
  const pattern = route
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\\[\\\.\\\.\\\.[^\\]*\\\]/g, '.+')
    .replace(/\\\[[^\\]*\\\]/g, '[^/]+');
  return new RegExp(`^${pattern}$`);
};

const files = walk(SRC);

const routes = files.filter((f) => /[\\/]page\.tsx$/.test(f)).map(toRoute);
const matchers = routes.map(routeMatcher);

const broken = [];
for (const file of files) {
  if (!/\.tsx$/.test(file)) continue;
  const source = readFileSync(file, 'utf8');
  for (const [, href] of source.matchAll(/href=\{?["'`](\/[^"'`{}\s]*)["'`]/g)) {
    const path = href.split(/[?#]/)[0].replace(/\/$/, '') || '/';
    if (matchers.some((m) => m.test(path))) continue;
    broken.push({ file: relative(process.cwd(), file), href });
  }
}

if (broken.length > 0) {
  console.error('Broken internal links (no matching route under src/app):\n');
  for (const { file, href } of broken) console.error(`  ${href}  <-  ${file}`);
  console.error(`\n${broken.length} broken link(s). Known routes: ${routes.sort().join(', ')}`);
  process.exit(1);
}

console.log(`OK - ${routes.length} routes, no broken internal links.`);
