import type { FastifyInstance } from 'fastify';
import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import {
  buildStripeSignatureHeader,
  verifyStripeSignature,
} from '../src/modules/verification/stripe_signature.js';

const WHSEC = 'whsec_test_secret';

describe('Stripe webhook signature verification', () => {
  const payload = JSON.stringify({ hello: 'world' });

  it('accepts a correctly signed payload', () => {
    const header = buildStripeSignatureHeader(payload, WHSEC);
    expect(verifyStripeSignature({ payload, header, secret: WHSEC })).toBe(true);
  });

  it('rejects a tampered payload', () => {
    const header = buildStripeSignatureHeader(payload, WHSEC);
    expect(verifyStripeSignature({ payload: payload + ' ', header, secret: WHSEC })).toBe(false);
  });

  it('rejects a wrong secret', () => {
    const header = buildStripeSignatureHeader(payload, WHSEC);
    expect(verifyStripeSignature({ payload, header, secret: 'whsec_other' })).toBe(false);
  });

  it('rejects a missing header', () => {
    expect(verifyStripeSignature({ payload, header: undefined, secret: WHSEC })).toBe(false);
  });

  it('rejects a stale timestamp (replay protection)', () => {
    const old = Math.floor(Date.now() / 1000) - 10_000;
    const header = buildStripeSignatureHeader(payload, WHSEC, old);
    expect(verifyStripeSignature({ payload, header, secret: WHSEC })).toBe(false);
  });
});

// ── Full flow ──────────────────────────────────────────────────────────────

const simConfig = loadConfig({ NODE_ENV: 'test', JWT_SECRET: 'test-secret' });
const stripeConfig = loadConfig({
  NODE_ENV: 'test',
  JWT_SECRET: 'test-secret',
  STRIPE_SECRET_KEY: 'sk_test_x',
  STRIPE_WEBHOOK_SECRET: WHSEC,
});

async function registerUser(app: FastifyInstance) {
  const reg = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { email: `v-${Date.now()}-${Math.random()}@example.com`, password: 'a-strong-passphrase', dateOfBirth: '1993-04-04' },
  });
  return { token: reg.json().accessToken as string, id: reg.json().user.id as string };
}

function event(type: string, userId: string, sessionId = 'vs_123') {
  return { type, data: { object: { id: sessionId, metadata: { user_id: userId } } } };
}

async function postWebhook(app: FastifyInstance, body: object, secret = WHSEC) {
  const payload = JSON.stringify(body);
  return app.inject({
    method: 'POST',
    url: '/verification/webhook',
    headers: {
      'content-type': 'application/json',
      'stripe-signature': buildStripeSignatureHeader(payload, secret),
    },
    payload,
  });
}

describe('verification sessions (simulation provider)', () => {
  it('opens a session and marks the user pending', async () => {
    const app = await buildApp({ config: simConfig });
    await app.ready();
    const user = await registerUser(app);

    const res = await app.inject({
      method: 'POST', url: '/verification/session', headers: { authorization: `Bearer ${user.token}` },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().providerRef).toMatch(/^sim_/);
    expect(res.json().clientSecret).toBeTruthy();

    const status = await app.inject({
      method: 'GET', url: '/verification', headers: { authorization: `Bearer ${user.token}` },
    });
    expect(status.json().status).toBe('pending');
    await app.close();
  });
});

describe('Stripe webhook flow', () => {
  it('approves the user on a verified event, unlocking the hard gate', async () => {
    const app = await buildApp({ config: stripeConfig });
    await app.ready();
    const user = await registerUser(app);
    const auth = { authorization: `Bearer ${user.token}` };

    // Gate is closed before verification.
    expect((await app.inject({ method: 'GET', url: '/matches/today', headers: auth })).statusCode).toBe(403);

    const res = await postWebhook(app, event('identity.verification_session.verified', user.id));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ received: true, handled: true, status: 'approved' });

    // Gate now open.
    expect((await app.inject({ method: 'GET', url: '/verification', headers: auth })).json().status).toBe('approved');
    expect((await app.inject({ method: 'GET', url: '/matches/today', headers: auth })).statusCode).toBe(200);
    await app.close();
  });

  it('rejects an invalidly signed webhook', async () => {
    const app = await buildApp({ config: stripeConfig });
    await app.ready();
    const user = await registerUser(app);
    const res = await postWebhook(app, event('identity.verification_session.verified', user.id), 'whsec_wrong');
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('invalid_signature');
    await app.close();
  });

  it('routes requires_input to manual review and canceled to rejected', async () => {
    const app = await buildApp({ config: stripeConfig });
    await app.ready();
    const user = await registerUser(app);
    const auth = { authorization: `Bearer ${user.token}` };

    await postWebhook(app, event('identity.verification_session.requires_input', user.id));
    expect((await app.inject({ method: 'GET', url: '/verification', headers: auth })).json().status).toBe('manual_review');

    await postWebhook(app, event('identity.verification_session.canceled', user.id));
    expect((await app.inject({ method: 'GET', url: '/verification', headers: auth })).json().status).toBe('rejected');
    await app.close();
  });

  it('disables the simulation /submit shortcut when Stripe is configured', async () => {
    const app = await buildApp({ config: stripeConfig });
    await app.ready();
    const user = await registerUser(app);
    const res = await app.inject({
      method: 'POST', url: '/verification/submit', headers: { authorization: `Bearer ${user.token}` },
      payload: { vendorRef: 'x', livenessScore: 0.95 },
    });
    expect(res.statusCode).toBe(403);
    await app.close();
  });
});
