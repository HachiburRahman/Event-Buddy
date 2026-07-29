// Guards the CORS allow-list against a real browser preflight.
//
// The bug this exists to catch: enableCors() was given a single string, so the
// API answered every caller with one fixed Access-Control-Allow-Origin. The
// canonical Vercel alias worked and every deployment URL failed, with a 200
// body the browser threw away. A unit test on the matcher would not have caught
// a regression in how the option reaches Express, so this drives the real
// middleware over real HTTP, including the OPTIONS preflight.
//
// Deliberately does not boot Nest: no database, no seeder, no side effects.
// Reads dist/, so it checks the JavaScript that actually ships to Render.
//
//   npm run build && node scripts/check-cors.mjs
//
// or just: npm run check:cors

import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import express from 'express';
import cors from 'cors';

const compiled = new URL('../dist/config/cors.config.js', import.meta.url);
if (!existsSync(compiled)) {
  console.error('dist/config/cors.config.js is missing. Run "npm run build" first.');
  process.exit(1);
}

const { buildCorsOptions } = await import(compiled.href);

const CANONICAL = 'https://event-lounge-lyart.vercel.app';
const DEPLOYMENT = 'https://event-lounge-4mt5jk56f-hachiburrahman15-2228s-projects.vercel.app';
const BRANCH = 'https://event-lounge-git-main-hachiburrahman15-2228s-projects.vercel.app';
const FRONTEND_URL = `${CANONICAL},https://event-lounge-*-hachiburrahman15-2228s-projects.vercel.app`;

const app = express();
app.use(cors(buildCorsOptions(FRONTEND_URL)));
app.get('/events/upcoming', (_req, res) => res.json({ data: [], total: 0 }));
app.post('/auth/login', (_req, res) => res.status(401).json({ message: 'Invalid credentials' }));

const server = createServer(app);
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;

// What the browser actually enforces: the returned header must equal the
// origin that asked, or the response is discarded no matter its status.
const allowedFor = async (origin, path = '/events/upcoming', method = 'GET') => {
  const response = await fetch(`${base}${path}`, { method, headers: { Origin: origin } });
  return response.headers.get('access-control-allow-origin') === origin;
};

const preflightAllows = async (origin, method) => {
  const response = await fetch(`${base}/auth/login`, {
    method: 'OPTIONS',
    headers: {
      Origin: origin,
      'Access-Control-Request-Method': method,
      'Access-Control-Request-Headers': 'content-type,authorization',
    },
  });
  return response.headers.get('access-control-allow-origin') === origin;
};

const checks = [
  ['canonical alias is allowed', async () => await allowedFor(CANONICAL)],
  ['deployment URL is allowed', async () => await allowedFor(DEPLOYMENT)],
  ['branch preview is allowed', async () => await allowedFor(BRANCH)],
  ['login preflight passes from a deployment URL', async () => await preflightAllows(DEPLOYMENT, 'POST')],
  ['login POST is allowed from a deployment URL', async () => await allowedFor(DEPLOYMENT, '/auth/login', 'POST')],
  ['credentials stay enabled', async () => {
    const response = await fetch(`${base}/events/upcoming`, { headers: { Origin: DEPLOYMENT } });
    return response.headers.get('access-control-allow-credentials') === 'true';
  }],
  ['an unlisted vercel.app project is refused', async () => !(await allowedFor('https://someone-elses-app.vercel.app'))],
  ['an unrelated origin is refused', async () => !(await allowedFor('https://evil.example.com'))],
  ['a refused origin still gets a normal status, not a 500', async () => {
    const response = await fetch(`${base}/events/upcoming`, { headers: { Origin: 'https://evil.example.com' } });
    return response.status === 200;
  }],
  ['a request with no Origin still works (curl, health checks, Stripe)', async () => {
    const response = await fetch(`${base}/events/upcoming`);
    return response.status === 200;
  }],
];

let failed = 0;
for (const [name, run] of checks) {
  const passed = await run();
  if (!passed) failed += 1;
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${name}`);
}

server.close();
console.log(`\n${checks.length - failed}/${checks.length} passed`);
process.exit(failed === 0 ? 0 : 1);
