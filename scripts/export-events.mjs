// Regenerates backend/src/seed/events.seed.ts from your local database.
//
// Data does not travel with a deploy. This snapshots whatever events exist in
// local development so a fresh production database can seed itself on first boot.
//
// Usage: start the backend locally, then:
//   node scripts/export-events.mjs

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = process.env.LOCAL_API_URL || 'http://localhost:5007';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'backend', 'src', 'seed', 'events.seed.ts');
const LIMIT = 100; // PaginationDto caps limit at 100

const fetchAll = async (type) => {
  const rows = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${API}/events/${type}?page=${page}&limit=${LIMIT}`);
    if (!res.ok) throw new Error(`GET /events/${type} returned ${res.status}. Is the backend running on ${API}?`);
    const body = await res.json();
    rows.push(...body.data);
    if (page >= (body.totalPages || 1)) break;
  }
  return rows;
};

const [upcoming, past] = await Promise.all([fetchAll('upcoming'), fetchAll('past')]);

const events = [...past, ...upcoming]
  .map((e) => ({
    title: e.title,
    description: e.description,
    date: e.date,
    location: e.location,
    capacity: e.capacity,
    tags: e.tags ?? [],
    price: Number(e.price) || 0,
    imageUrl: e.imageUrl ?? null,
  }))
  .sort((a, b) => new Date(a.date) - new Date(b.date));

const header = `// Snapshot of the events that existed in local development, used to populate a
// fresh database on first boot. Kept as .ts (not .json) so it is compiled into
// dist/ by 'nest build' with no assets config to get wrong.
//
// Regenerate after adding events locally:
//   node scripts/export-events.mjs

export type SeedEvent = {
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  tags: string[];
  price: number;
  imageUrl: string | null;
};

export const SEED_EVENTS: SeedEvent[] = `;

writeFileSync(OUT, header + JSON.stringify(events, null, 2) + ';\n');

const missingImages = events.filter((e) => !e.imageUrl).length;
console.log(`Wrote ${events.length} events to backend/src/seed/events.seed.ts`);
if (missingImages > 0) console.log(`${missingImages} have no image and will fall back to the placeholder.`);
console.log('Images live in backend/uploads/ and must be committed to appear in production.');
