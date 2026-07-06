import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { createPgRepositories } from '../src/infra/pg/repositories.js';
import { createPool, runMigrations, type Pool } from '../src/infra/pg/pool.js';

// Runs only when a database is available — keeps the default `npm test` green
// in environments without Postgres.
const dbUrl = process.env.DATABASE_URL;
const d = dbUrl ? describe : describe.skip;

d('Postgres-backed API', () => {
  let app: FastifyInstance;
  let pool: Pool;
  const config = loadConfig({ NODE_ENV: 'test', JWT_SECRET: 'test-secret' });

  beforeAll(async () => {
    pool = createPool(dbUrl!);
    await runMigrations(pool);
    // Reset to a clean slate, then seed the curation pool + advice content.
    await pool.query(
      'TRUNCATE matches, verification_records, profiles, compatibility_answers, users, advice_articles RESTART IDENTITY CASCADE',
    );
    const seedPath = fileURLToPath(new URL('../migrations/seed.sql', import.meta.url));
    await pool.query(await readFile(seedPath, 'utf8'));

    app = await buildApp({ config, repos: createPgRepositories(pool) });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  async function registerVerifiedAdult() {
    const reg = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: `real-${Date.now()}@example.com`,
        password: 'a-strong-passphrase',
        dateOfBirth: '1993-04-04',
        userType: 'dating',
      },
    });
    const token = reg.json().accessToken as string;
    await app.inject({
      method: 'POST',
      url: '/verification/submit',
      headers: { authorization: `Bearer ${token}` },
      payload: { vendorRef: 'vt', livenessScore: 0.95 },
    });
    return token;
  }

  it('persists a user and blocks matches until verified, then curates from the DB pool', async () => {
    const reg = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: `gate-${Date.now()}@example.com`,
        password: 'a-strong-passphrase',
        dateOfBirth: '1993-04-04',
      },
    });
    const token = reg.json().accessToken as string;
    const auth = { authorization: `Bearer ${token}` };

    const blocked = await app.inject({ method: 'GET', url: '/matches/today', headers: auth });
    expect(blocked.statusCode).toBe(403);

    await app.inject({
      method: 'POST',
      url: '/verification/submit',
      headers: auth,
      payload: { vendorRef: 'vt', livenessScore: 0.95 },
    });

    const ok = await app.inject({ method: 'GET', url: '/matches/today', headers: auth });
    expect(ok.statusCode).toBe(200);
    // Curated from the three seeded candidate accounts.
    expect(ok.json().count).toBe(3);
    expect(ok.json().matches[0].compatibility).toBe(92);
  });

  it('curation is stable across repeat requests (idempotent persistence)', async () => {
    const token = await registerVerifiedAdult();
    const auth = { authorization: `Bearer ${token}` };
    const first = await app.inject({ method: 'GET', url: '/matches/today', headers: auth });
    const second = await app.inject({ method: 'GET', url: '/matches/today', headers: auth });
    expect(second.json().count).toBe(first.json().count);
    expect(second.json().matches.map((m: { id: string }) => m.id))
      .toEqual(first.json().matches.map((m: { id: string }) => m.id));
  });

  it('reads advice content from the DB', async () => {
    const token = await registerVerifiedAdult();
    const res = await app.inject({
      method: 'GET',
      url: '/advice/articles',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.json().articles.length).toBeGreaterThan(0);
    // Featured article sorts first.
    expect(res.json().articles[0].featured).toBe(true);
  });
});
