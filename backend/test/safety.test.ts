import type { FastifyInstance } from 'fastify';
import { beforeEach, describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { createMemoryRepositories } from '../src/infra/memory/store.js';
import { AdminService } from '../src/modules/admin/admin.service.js';
import type { Repositories } from '../src/domain/repositories.js';

const config = loadConfig({ NODE_ENV: 'test', JWT_SECRET: 'test-secret' });

let app: FastifyInstance;
let repos: Repositories;

beforeEach(async () => {
  repos = createMemoryRepositories();
  // Seed a moderator admin for the queue tests.
  await new AdminService(repos).createAdmin('mod@aurelle.app', 'admin-strong-pass', 'moderator');
  app = await buildApp({ config, repos });
  await app.ready();
});

let seq = 0;
async function registerVerified(): Promise<{ token: string; id: string }> {
  seq += 1;
  const reg = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: {
      email: `s${seq}-${Date.now()}@example.com`,
      password: 'a-strong-passphrase',
      dateOfBirth: '1993-04-04',
    },
  });
  const token = reg.json().accessToken as string;
  await app.inject({
    method: 'POST',
    url: '/verification/submit',
    headers: { authorization: `Bearer ${token}` },
    payload: { vendorRef: 'vt', livenessScore: 0.95 },
  });
  return { token, id: reg.json().user.id as string };
}
const bearer = (t: string) => ({ authorization: `Bearer ${t}` });

async function adminToken(): Promise<string> {
  const res = await app.inject({
    method: 'POST',
    url: '/admin/auth/login',
    payload: { email: 'mod@aurelle.app', password: 'admin-strong-pass' },
  });
  return res.json().token as string;
}

describe('blocking', () => {
  it('prevents starting or sending in a conversation once blocked', async () => {
    const a = await registerVerified();
    const b = await registerVerified();

    // A and B open a conversation and exchange a message.
    const convoId = (
      await app.inject({ method: 'POST', url: '/conversations', headers: bearer(a.token), payload: { withUserId: b.id } })
    ).json().conversation.id as string;
    await app.inject({ method: 'POST', url: `/conversations/${convoId}/messages`, headers: bearer(a.token), payload: { body: 'hello' } });

    // A blocks B.
    const block = await app.inject({ method: 'POST', url: '/blocks', headers: bearer(a.token), payload: { blockedId: b.id } });
    expect(block.statusCode).toBe(201);

    // B can no longer send into the shared conversation (block is bidirectional).
    const send = await app.inject({ method: 'POST', url: `/conversations/${convoId}/messages`, headers: bearer(b.token), payload: { body: 'still there?' } });
    expect(send.statusCode).toBe(403);

    // B can no longer start a fresh conversation with A either.
    const start = await app.inject({ method: 'POST', url: '/conversations', headers: bearer(b.token), payload: { withUserId: a.id } });
    expect(start.statusCode).toBe(403);
  });

  it('lists and clears blocks', async () => {
    const a = await registerVerified();
    const b = await registerVerified();
    await app.inject({ method: 'POST', url: '/blocks', headers: bearer(a.token), payload: { blockedId: b.id } });
    expect((await app.inject({ method: 'GET', url: '/blocks', headers: bearer(a.token) })).json().blocks).toHaveLength(1);
    await app.inject({ method: 'DELETE', url: `/blocks/${b.id}`, headers: bearer(a.token) });
    expect((await app.inject({ method: 'GET', url: '/blocks', headers: bearer(a.token) })).json().blocks).toHaveLength(0);
  });
});

describe('reporting + moderation queue', () => {
  it('routes a report into the admin queue and lets a moderator resolve it (audited)', async () => {
    const reporter = await registerVerified();
    const offender = await registerVerified();

    const report = await app.inject({
      method: 'POST',
      url: '/reports',
      headers: bearer(reporter.token),
      payload: { reportedUserId: offender.id, category: 'scam', reason: 'asked me to send money' },
    });
    expect(report.statusCode).toBe(201);
    const reportId = report.json().report.id as string;

    const admin = await adminToken();

    // Report shows in the open queue.
    const queue = await app.inject({ method: 'GET', url: '/admin/reports?status=open', headers: bearer(admin) });
    expect(queue.json().reports.map((r: { id: string }) => r.id)).toContain(reportId);

    // Moderator resolves it.
    const resolve = await app.inject({
      method: 'PATCH',
      url: `/admin/reports/${reportId}`,
      headers: bearer(admin),
      payload: { status: 'resolved', notes: 'warned and monitored' },
    });
    expect(resolve.json().report.status).toBe('resolved');
    expect(resolve.json().report.resolvedAt).toBeTruthy();

    // It leaves the open queue.
    const openAfter = await app.inject({ method: 'GET', url: '/admin/reports?status=open', headers: bearer(admin) });
    expect(openAfter.json().reports.map((r: { id: string }) => r.id)).not.toContain(reportId);

    // Both the report and its resolution are in the audit trail.
    const actions = (repos.audit as unknown as { entries: { action: string }[] }).entries.map((e) => e.action);
    expect(actions).toContain('report.created');
    expect(actions).toContain('report.resolved');
  });

  it('rejects reporting yourself', async () => {
    const u = await registerVerified();
    const res = await app.inject({
      method: 'POST', url: '/reports', headers: bearer(u.token),
      payload: { reportedUserId: u.id, category: 'other' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('denies the moderation queue to a normal user token', async () => {
    const u = await registerVerified();
    const res = await app.inject({ method: 'GET', url: '/admin/reports', headers: bearer(u.token) });
    // A consumer access token is not an admin token.
    expect(res.statusCode).toBe(403);
  });

  it('denies admin login with wrong credentials', async () => {
    const res = await app.inject({
      method: 'POST', url: '/admin/auth/login',
      payload: { email: 'mod@aurelle.app', password: 'wrong' },
    });
    expect(res.statusCode).toBe(401);
  });
});
