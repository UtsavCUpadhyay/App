import { beforeEach, describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import type { FastifyInstance } from 'fastify';

const config = loadConfig({ NODE_ENV: 'test', JWT_SECRET: 'test-secret' });

let app: FastifyInstance;

beforeEach(async () => {
  // Fresh in-memory repositories per test → full isolation.
  app = await buildApp({ config });
  await app.ready();
});

const adultDob = '1994-05-01';

async function registerAdult(email = 'emma@example.com') {
  return app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { email, password: 'a-strong-passphrase', dateOfBirth: adultDob, userType: 'dating' },
  });
}

describe('auth', () => {
  it('registers an adult and issues tokens', async () => {
    const res = await registerAdult();
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.user.email).toBe('emma@example.com');
    expect(body.user).not.toHaveProperty('passwordHash');
    expect(body.accessToken).toBeTypeOf('string');
    expect(body.refreshToken).toBeTypeOf('string');
  });

  it('rejects a minor from Dating (hard age gate)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'teen@example.com',
        password: 'a-strong-passphrase',
        dateOfBirth: '2012-01-01',
        userType: 'dating',
      },
    });
    expect(res.statusCode).toBe(403);
  });

  it('rejects duplicate email', async () => {
    await registerAdult();
    const res = await registerAdult();
    expect(res.statusCode).toBe(409);
  });

  it('rejects bad credentials without leaking which field failed', async () => {
    await registerAdult();
    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'emma@example.com', password: 'wrong-password' },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('Invalid email or password');
  });

  it('validates weak passwords (400)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'x@example.com', password: 'short', dateOfBirth: adultDob },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('validation_error');
  });
});

describe('hard verification gate', () => {
  it('blocks matches until verification is approved, then allows them', async () => {
    const token = (await registerAdult()).json().accessToken as string;
    const auth = { authorization: `Bearer ${token}` };

    // Unverified → matches are blocked server-side.
    const blocked = await app.inject({ method: 'GET', url: '/matches/today', headers: auth });
    expect(blocked.statusCode).toBe(403);
    expect(blocked.json().error).toBe('verification_required');

    // Submit a high-liveness verification → approved.
    const submit = await app.inject({
      method: 'POST',
      url: '/verification/submit',
      headers: auth,
      payload: { vendorRef: 'vendor-token-abc', livenessScore: 0.95 },
    });
    expect(submit.json().status).toBe('approved');

    // Now browsing is permitted, and matches are curated + verified.
    const ok = await app.inject({ method: 'GET', url: '/matches/today', headers: auth });
    expect(ok.statusCode).toBe(200);
    expect(ok.json().count).toBeGreaterThan(0);
    expect(ok.json().matches.length).toBeLessThanOrEqual(5);
  });

  it('routes a middling liveness score to manual review (not auto-reject)', async () => {
    const token = (await registerAdult()).json().accessToken as string;
    const res = await app.inject({
      method: 'POST',
      url: '/verification/submit',
      headers: { authorization: `Bearer ${token}` },
      payload: { vendorRef: 'v', livenessScore: 0.6 },
    });
    expect(res.json().status).toBe('manual_review');
  });

  it('requires authentication', async () => {
    const res = await app.inject({ method: 'GET', url: '/matches/today' });
    expect(res.statusCode).toBe(401);
  });
});

describe('advice', () => {
  it('returns articles for an authenticated adult', async () => {
    const token = (await registerAdult()).json().accessToken as string;
    const res = await app.inject({
      method: 'GET',
      url: '/advice/articles',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().articles.length).toBeGreaterThan(0);
  });

  it('serves only minor-safe content to under-18 advice_only accounts', async () => {
    const reg = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'anaya@example.com',
        password: 'a-strong-passphrase',
        dateOfBirth: '2010-01-01',
        userType: 'advice_only',
      },
    });
    expect(reg.statusCode).toBe(201);
    const token = reg.json().accessToken as string;

    const res = await app.inject({
      method: 'GET',
      url: '/advice/articles',
      headers: { authorization: `Bearer ${token}` },
    });
    const articles = res.json().articles as { title: string }[];
    expect(articles.length).toBeGreaterThan(0);
    // The mature "dating after divorce" piece must not reach a minor.
    expect(articles.some((a) => a.title.includes('divorce'))).toBe(false);
  });
});

describe('health', () => {
  it('reports ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.json()).toEqual({ status: 'ok', service: 'aurelle-api' });
  });
});
