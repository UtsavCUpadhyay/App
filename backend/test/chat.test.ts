import type { FastifyInstance } from 'fastify';
import { beforeEach, describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';

const config = loadConfig({ NODE_ENV: 'test', JWT_SECRET: 'test-secret' });

let app: FastifyInstance;

beforeEach(async () => {
  app = await buildApp({ config });
  await app.ready();
});

let seq = 0;
async function registerVerified(): Promise<{ token: string; id: string }> {
  seq += 1;
  const reg = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: {
      email: `u${seq}-${Date.now()}@example.com`,
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
  return { token, id: reg.json().user.id as string };
}

const bearer = (t: string) => ({ authorization: `Bearer ${t}` });

describe('chat gating', () => {
  it('requires verification before messaging', async () => {
    // Registered but NOT verified.
    const reg = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: `nv-${Date.now()}@example.com`, password: 'a-strong-passphrase', dateOfBirth: '1993-04-04' },
    });
    const token = reg.json().accessToken as string;
    const other = await registerVerified();

    const res = await app.inject({
      method: 'POST',
      url: '/conversations',
      headers: bearer(token),
      payload: { withUserId: other.id },
    });
    expect(res.statusCode).toBe(403);
    expect(res.json().error).toBe('verification_required');
  });

  it('requires authentication', async () => {
    const res = await app.inject({ method: 'GET', url: '/conversations' });
    expect(res.statusCode).toBe(401);
  });
});

describe('conversations and moderation', () => {
  it('runs the full flow: start, send clean + flagged, read back with banners', async () => {
    const a = await registerVerified();
    const b = await registerVerified();

    const convoRes = await app.inject({
      method: 'POST',
      url: '/conversations',
      headers: bearer(a.token),
      payload: { withUserId: b.id },
    });
    expect(convoRes.statusCode).toBe(201);
    const convoId = convoRes.json().conversation.id as string;
    expect(convoRes.json().conversation.participantIds).toContain(a.id);
    expect(convoRes.json().conversation.participantIds).toContain(b.id);

    // A clean message is not flagged.
    const clean = await app.inject({
      method: 'POST',
      url: `/conversations/${convoId}/messages`,
      headers: bearer(a.token),
      payload: { body: 'Tamarama on a quiet morning. You?' },
    });
    expect(clean.statusCode).toBe(201);
    expect(clean.json().message.moderation.flagged).toBe(false);

    // A scam message is flagged with a user-facing reason — but still delivered.
    const scam = await app.inject({
      method: 'POST',
      url: `/conversations/${convoId}/messages`,
      headers: bearer(a.token),
      payload: { body: 'This is lovely — could you help me with a $200 transfer?' },
    });
    expect(scam.statusCode).toBe(201);
    expect(scam.json().message.moderation.flagged).toBe(true);
    expect(scam.json().message.moderation.category).toBe('financial_scam');
    expect(scam.json().message.moderation.reason).toBeTruthy();

    // B reads the thread and sees both messages, flag included.
    const thread = await app.inject({
      method: 'GET',
      url: `/conversations/${convoId}/messages`,
      headers: bearer(b.token),
    });
    expect(thread.json().messages).toHaveLength(2);
    expect(thread.json().messages[1].moderation.flagged).toBe(true);
  });

  it('reuses the same 1:1 conversation instead of duplicating', async () => {
    const a = await registerVerified();
    const b = await registerVerified();
    const first = await app.inject({
      method: 'POST', url: '/conversations', headers: bearer(a.token), payload: { withUserId: b.id },
    });
    // B starting with A resolves to the same conversation.
    const second = await app.inject({
      method: 'POST', url: '/conversations', headers: bearer(b.token), payload: { withUserId: a.id },
    });
    expect(second.json().conversation.id).toBe(first.json().conversation.id);
  });

  it('blocks a non-participant from reading a conversation', async () => {
    const a = await registerVerified();
    const b = await registerVerified();
    const c = await registerVerified();
    const convoId = (
      await app.inject({
        method: 'POST', url: '/conversations', headers: bearer(a.token), payload: { withUserId: b.id },
      })
    ).json().conversation.id as string;

    const res = await app.inject({
      method: 'GET',
      url: `/conversations/${convoId}/messages`,
      headers: bearer(c.token),
    });
    expect(res.statusCode).toBe(403);
  });
});
