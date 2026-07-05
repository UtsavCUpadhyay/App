import type { FastifyInstance } from 'fastify';

import type { Repositories } from '../../domain/repositories.js';

/**
 * Matching module. The curated-matches endpoint sits behind BOTH guards:
 * `authenticate` then `requireVerified` — enforcing the hard verification gate
 * server-side, so an unverified account cannot browse even if the client is
 * bypassed. Curated (small, scored) rather than an endless deck (Phase 6).
 */
export function registerMatchingRoutes(
  app: FastifyInstance,
  repos: Repositories,
): void {
  app.get(
    '/matches/today',
    { preHandler: [app.authenticate, app.requireVerified] },
    async (request, reply) => {
      const matches = await repos.matches.todaysMatches(request.userId);
      return reply.send({ count: matches.length, matches });
    },
  );
}
