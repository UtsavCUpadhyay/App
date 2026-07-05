import fastifyJwt from '@fastify/jwt';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import type { AppConfig } from '../config.js';
import type { Repositories } from '../domain/repositories.js';

/**
 * Registers JWT auth and two guards:
 *  - `authenticate`  — requires a valid access token, sets `request.userId`.
 *  - `requireVerified` — additionally enforces the HARD verification gate:
 *    an approved verification record is mandatory before any Dating browsing
 *    (the founder's chosen "verify before browsing" policy, Phase 7 IA).
 */
export async function registerAuth(
  app: FastifyInstance,
  repos: Repositories,
  config: AppConfig,
): Promise<void> {
  await app.register(fastifyJwt, { secret: config.jwtSecret });

  // Pre-declare the per-request property so assignments are on the fast path.
  app.decorateRequest('userId', '');

  app.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const payload = await request.jwtVerify<{ sub: string; typ: string }>();
        if (payload.typ !== 'access') {
          return reply.code(401).send({ error: 'Invalid token type' });
        }
        request.userId = payload.sub;
      } catch {
        return reply.code(401).send({ error: 'Authentication required' });
      }
    },
  );

  app.decorate(
    'requireVerified',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const record = await repos.verification.get(request.userId);
      if (!record || record.status !== 'approved') {
        return reply.code(403).send({
          error: 'verification_required',
          message:
            'Identity verification must be approved before browsing matches.',
          status: record?.status ?? 'unverified',
        });
      }
    },
  );
}
