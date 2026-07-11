import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import type { AppConfig } from '../../config.js';
import type { Repositories } from '../../domain/repositories.js';
import type { VerificationStatus } from '../../domain/types.js';
import type { VerificationProvider } from './provider.js';
import { verifyStripeSignature } from './stripe_signature.js';
import { VerificationService, type StripeIdentityEvent } from './verification.service.js';

/**
 * Verification module (vendor: Stripe Identity, Phase 10).
 *
 * Aurelle never receives raw ID documents — the client opens a provider session
 * (`POST /verification/session`), completes it in Stripe's SDK, and the result
 * arrives asynchronously via the signed webhook. We persist only the session id.
 * `POST /verification/submit` remains as a simulation-only dev shortcut.
 */
export function registerVerificationRoutes(
  app: FastifyInstance,
  repos: Repositories,
  config: AppConfig,
  provider: VerificationProvider,
): void {
  const service = new VerificationService(repos, provider);

  app.get('/verification', { preHandler: app.authenticate }, async (request, reply) => {
    const record = await repos.verification.get(request.userId);
    return reply.send({ status: record?.status ?? 'unverified' });
  });

  // Open a verification session; returns a client secret for the mobile SDK.
  app.post('/verification/session', { preHandler: app.authenticate }, async (request, reply) => {
    const result = await service.createSession(request.userId);
    return reply.code(201).send({
      providerRef: result.providerRef,
      clientSecret: result.clientSecret,
      url: result.url,
    });
  });

  // Stripe webhook — signature-verified, unauthenticated (Stripe calls it).
  app.post('/verification/webhook', async (request, reply) => {
    const secret = config.verification.stripeWebhookSecret;
    if (config.verification.provider !== 'stripe' || !secret) {
      return reply.code(503).send({ error: 'Webhook is not configured' });
    }
    const valid = verifyStripeSignature({
      payload: request.rawBody ?? '',
      header: request.headers['stripe-signature'] as string | undefined,
      secret,
    });
    if (!valid) return reply.code(400).send({ error: 'invalid_signature' });

    const outcome = await service.handleEvent(request.body as StripeIdentityEvent);
    return reply.send({ received: true, ...outcome });
  });

  // Simulation-only dev shortcut (disabled once a real provider is configured).
  const submitSchema = z.object({
    vendorRef: z.string().min(1),
    livenessScore: z.number().min(0).max(1),
  });
  app.post('/verification/submit', { preHandler: app.authenticate }, async (request, reply) => {
    if (config.verification.provider !== 'simulation') {
      return reply.code(403).send({ error: 'Use the verification session flow' });
    }
    const { vendorRef, livenessScore } = submitSchema.parse(request.body);
    const status: VerificationStatus =
      livenessScore >= 0.8 ? 'approved' : livenessScore >= 0.5 ? 'manual_review' : 'rejected';
    await repos.verification.save({
      userId: request.userId,
      status,
      vendorRef,
      livenessScore,
      reviewedAt: new Date().toISOString(),
    });
    return reply.send({ status });
  });
}
