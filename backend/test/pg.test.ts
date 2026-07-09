import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { createPgRepositories } from '../src/infra/pg/repositories.js';
import { createPool, runMigrations, type Pool } from '../src/infra/pg/pool.js';
import { AdminService } from '../src/modules/admin/admin.service.js';

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
      'TRUNCATE reports, blocks, admin_users, messages, conversation_participants, conversations, matches, verification_records, profiles, compatibility_answers, users, advice_articles RESTART IDENTITY CASCADE',
    );
    const seedPath = fileURLToPath(new URL('../migrations/seed.sql', import.meta.url));
    await pool.query(await readFile(seedPath, 'utf8'));

    const repos = createPgRepositories(pool);
    await new AdminService(repos).createAdmin('pgmod@aurelle.app', 'admin-strong-pass', 'moderator');
    app = await buildApp({ config, repos });
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

  it('persists a conversation + moderated messages in Postgres', async () => {
    // Two real verified users so both are participants.
    const regA = await app.inject({
      method: 'POST', url: '/auth/register',
      payload: { email: `chatA-${Date.now()}@example.com`, password: 'a-strong-passphrase', dateOfBirth: '1993-04-04' },
    });
    const regB = await app.inject({
      method: 'POST', url: '/auth/register',
      payload: { email: `chatB-${Date.now()}@example.com`, password: 'a-strong-passphrase', dateOfBirth: '1993-04-04' },
    });
    const tokenA = regA.json().accessToken as string;
    for (const t of [tokenA, regB.json().accessToken as string]) {
      await app.inject({ method: 'POST', url: '/verification/submit', headers: { authorization: `Bearer ${t}` }, payload: { vendorRef: 'vt', livenessScore: 0.95 } });
    }
    const authA = { authorization: `Bearer ${tokenA}` };

    const convoId = (
      await app.inject({ method: 'POST', url: '/conversations', headers: authA, payload: { withUserId: regB.json().user.id } })
    ).json().conversation.id as string;

    await app.inject({ method: 'POST', url: `/conversations/${convoId}/messages`, headers: authA, payload: { body: 'send me $200 on whatsapp' } });

    // Read back from Postgres — the moderation flag was persisted with the row.
    const thread = await app.inject({ method: 'GET', url: `/conversations/${convoId}/messages`, headers: authA });
    expect(thread.json().messages).toHaveLength(1);
    expect(thread.json().messages[0].moderation.category).toBe('financial_scam');

    // Verify at the SQL layer too.
    const { rows } = await pool.query('SELECT moderation_flag, moderation_category FROM messages WHERE conversation_id = $1', [convoId]);
    expect(rows[0].moderation_flag).toBe(true);
    expect(rows[0].moderation_category).toBe('financial_scam');
  });

  it('persists a report through the queue to resolution in Postgres', async () => {
    const reporter = await registerVerifiedAdult();
    const offenderReg = await app.inject({
      method: 'POST', url: '/auth/register',
      payload: { email: `off-${Date.now()}@example.com`, password: 'a-strong-passphrase', dateOfBirth: '1990-01-01' },
    });
    const offenderId = offenderReg.json().user.id as string;

    const reportId = (
      await app.inject({
        method: 'POST', url: '/reports', headers: { authorization: `Bearer ${reporter}` },
        payload: { reportedUserId: offenderId, category: 'scam', reason: 'money request' },
      })
    ).json().report.id as string;

    const adminToken = (
      await app.inject({ method: 'POST', url: '/admin/auth/login', payload: { email: 'pgmod@aurelle.app', password: 'admin-strong-pass' } })
    ).json().token as string;

    await app.inject({
      method: 'PATCH', url: `/admin/reports/${reportId}`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { status: 'resolved', notes: 'handled' },
    });

    const { rows } = await pool.query('SELECT status, assigned_admin_id, resolved_at FROM reports WHERE id = $1', [reportId]);
    expect(rows[0].status).toBe('resolved');
    expect(rows[0].assigned_admin_id).not.toBeNull();
    expect(rows[0].resolved_at).not.toBeNull();

    // The admin action was written to the append-only audit log.
    const audit = await pool.query("SELECT action FROM audit_log WHERE target_id = $1 AND actor_type = 'admin'", [reportId]);
    expect(audit.rows.map((r) => r.action)).toContain('report.resolved');
  });
});
