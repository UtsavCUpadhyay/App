import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import type { Repositories } from '../../domain/repositories.js';
import { ageInYears } from '../auth/auth.service.js';

/**
 * Advice module. Usable independently of Dating (no verification gate) but
 * still authenticated so age-tiering can apply: under-18 accounts only ever
 * receive minor-safe content (Phase 16 age & content boundaries), enforced
 * server-side — not just hidden in the UI.
 */
export function registerAdviceRoutes(
  app: FastifyInstance,
  repos: Repositories,
): void {
  const querySchema = z.object({
    audience: z.enum(['all', 'men', 'women', 'lgbtq', 'life_stage']).optional(),
  });

  app.get(
    '/advice/articles',
    { preHandler: app.authenticate },
    async (request, reply) => {
      const { audience } = querySchema.parse(request.query);
      const user = await repos.users.findById(request.userId);
      const isMinor = user ? ageInYears(user.dateOfBirth) < 18 : true;

      const articles = await repos.advice.list({
        audience,
        minorSafeOnly: isMinor,
      });
      return reply.send({ articles });
    },
  );
}
