import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import type { Repositories } from '../../domain/repositories.js';
import type { VerificationStatus } from '../../domain/types.js';

/**
 * Verification module. Aurelle never receives raw ID documents — the client
 * talks to a licensed vendor (Onfido/Jumio/iDenfy/Persona-class, Phase 10),
 * which returns a reference token + liveness score that we record here.
 *
 * This endpoint simulates the vendor callback: given a vendor reference and a
 * liveness score, it approves (or routes to manual review) the account.
 */
export function registerVerificationRoutes(
  app: FastifyInstance,
  repos: Repositories,
): void {
  app.get(
    '/verification',
    { preHandler: app.authenticate },
    async (request, reply) => {
      const record = await repos.verification.get(request.userId);
      return reply.send({ status: record?.status ?? 'unverified' });
    },
  );

  const submitSchema = z.object({
    vendorRef: z.string().min(1),
    livenessScore: z.number().min(0).max(1),
  });

  app.post(
    '/verification/submit',
    { preHandler: app.authenticate },
    async (request, reply) => {
      const { vendorRef, livenessScore } = submitSchema.parse(request.body);

      // Vendor decision simulation: high liveness auto-approves; a middling
      // score routes to the human review queue rather than auto-rejecting
      // (Phase 10 layer 5 — avoid false-positive lockouts without oversight).
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
    },
  );
}
