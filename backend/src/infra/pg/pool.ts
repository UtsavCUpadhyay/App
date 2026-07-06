import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import pg from 'pg';

/**
 * PostgreSQL connection pool + a minimal migration runner.
 *
 * The pool is the only place that knows about `pg`; repositories receive it and
 * speak SQL. Data residency, TLS and pool sizing are configured here in
 * production (Phase 10/15) — the connection string comes from the environment.
 */
export type Pool = pg.Pool;

export function createPool(connectionString: string): Pool {
  return new pg.Pool({ connectionString, max: 10 });
}

const here = dirname(fileURLToPath(import.meta.url));
// migrations/ sits at the backend root, three levels up from src/infra/pg.
const migrationsDir = join(here, '..', '..', '..', 'migrations');

/**
 * Applies numbered migrations (`NNNN_*.sql`) in order, idempotently. `seed.sql`
 * and other non-numbered files are intentionally excluded — seeding is a
 * separate, dev-only step (`npm run seed`), never run automatically in prod.
 */
export async function runMigrations(pool: Pool): Promise<string[]> {
  const files = (await readdir(migrationsDir))
    .filter((f) => /^\d+_.*\.sql$/.test(f))
    .sort();
  const applied: string[] = [];
  for (const file of files) {
    const sql = await readFile(join(migrationsDir, file), 'utf8');
    await pool.query(sql);
    applied.push(file);
  }
  return applied;
}
