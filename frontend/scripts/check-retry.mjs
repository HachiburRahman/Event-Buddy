// Exercises the real src/lib/axios.ts against a server that destroys sockets,
// reproducing the ERR_CONNECTION_CLOSED the deployed site hit against Render.
//
// Guards two properties:
//   1. GET survives transient connection drops instead of dead-ending the page.
//   2. A plain POST is NEVER replayed. POST /bookings creates a booking and a
//      Stripe checkout session, so a retry there would double-charge someone.
//      If you ever mark a state-changing request retryable, this fails.
//
// Run: npm run check:retry

import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const PORT = 5123;
const OUT = join(process.cwd(), 'node_modules', '.cache', 'retry-check');

// Compile the real client so this tests shipped code, not a copy of it.
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
execFileSync(
  process.execPath,
  [
    join('node_modules', 'typescript', 'bin', 'tsc'),
    join('src', 'lib', 'axios.ts'),
    '--outDir', OUT,
    '--module', 'esnext',
    '--target', 'es2020',
    '--moduleResolution', 'bundler',
    '--skipLibCheck',
  ],
  { stdio: 'inherit' },
);

const hits = {};
const failUntil = { '/flaky': 2, '/always': 99, '/post': 2, '/optin': 2 };

const server = createServer((req, res) => {
  const path = req.url.split('?')[0];
  hits[path] = (hits[path] || 0) + 1;

  if (hits[path] <= (failUntil[path] ?? 0)) {
    req.socket.destroy(); // what Render's "Connection: close" race looks like
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true, attempts: hits[path] }));
});

await new Promise((r) => server.listen(PORT, r));
process.env.NEXT_PUBLIC_API_BASE_URL = `http://localhost:${PORT}`;

const { default: api } = await import(pathToFileURL(join(OUT, 'axios.js')).href);

const results = [];
const check = (name, pass, detail) => results.push({ name, pass, detail });

try {
  const res = await api.get('/flaky');
  check('GET recovers from dropped connections', res.data.ok === true, `succeeded on attempt ${res.data.attempts}`);
} catch (e) {
  check('GET recovers from dropped connections', false, `threw ${e.code || e.message}`);
}

try {
  await api.get('/always');
  check('GET eventually gives up', false, 'unexpectedly succeeded');
} catch {
  check('GET eventually gives up', hits['/always'] === 4, `${hits['/always']} attempts (expected 4)`);
}

try {
  await api.post('/post', { seats: 2 });
  check('plain POST is never replayed', false, 'unexpectedly succeeded');
} catch {
  check('plain POST is never replayed', hits['/post'] === 1, `${hits['/post']} attempt(s) (expected exactly 1)`);
}

try {
  const res = await api.post('/optin', { id: 'x' }, { retryable: true });
  check('POST marked retryable is replayed', res.data.ok === true, `succeeded on attempt ${res.data.attempts}`);
} catch (e) {
  check('POST marked retryable is replayed', false, `threw ${e.code || e.message}`);
}

server.close();
rmSync(OUT, { recursive: true, force: true });

for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}  (${r.detail})`);
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed === 0 ? 0 : 1);
