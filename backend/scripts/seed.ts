import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { loadConfig } from '../src/config.js';
import { createPool, runMigrations } from '../src/infra/pg/pool.js';

/**
 * Dev-only seeding: runs migrations, then loads the idempotent seed (advice
 * content + the verified candidate pool used by the curation stub).
 * Requires DATABASE_URL. Never wire this into production startup.
 */
async function main(): Promise<void> {
  const { databaseUrl } = loadConfig();
  if (!databaseUrl) throw new Error('DATABASE_URL is required to seed');

  const pool = createPool(databaseUrl);
  const applied = await runMigrations(pool);
  const seedPath = fileURLToPath(new URL('../migrations/seed.sql', import.meta.url));
  await pool.query(await readFile(seedPath, 'utf8'));
  await pool.end();

  // eslint-disable-next-line no-console
  console.log(`Seeded. Migrations applied: ${applied.join(', ') || 'none'}`);
}

void main();
