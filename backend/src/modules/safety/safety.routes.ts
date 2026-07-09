import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import type { Repositories } from '../../domain/repositories.js';
import { SafetyService } from './safety.service.js';

/** Consumer Safety Center endpoints — gated to authenticated members. */
export function registerSafetyRoutes(app: FastifyInstance, repos: Repositories): void {
  const service = new SafetyService(repos);
  const gated = { preHandler: app.authenticate };

  const reportSchema = z.object({
    reportedUserId: z.string().uuid(),
    category: z.enum(['scam', 'harassment', 'fake_profile', 'inappropriate', 'other']),
    reason: z.string().max(2000).optional(),
    conversationId: z.string().uuid().optional(),
  });

  app.post('/reports', gated, async (request, reply) => {
    const input = reportSchema.parse(request.body);
    const report = await service.report(request.userId, input);
    return reply.code(201).send({ report });
  });

  app.post('/blocks', gated, async (request, reply) => {
    const { blockedId } = z.object({ blockedId: z.string().uuid() }).parse(request.body);
    const block = await service.block(request.userId, blockedId);
    return reply.code(201).send({ block });
  });

  app.get('/blocks', gated, async (request, reply) => {
    return reply.send({ blocks: await service.listBlocks(request.userId) });
  });

  app.delete('/blocks/:blockedId', gated, async (request, reply) => {
    const { blockedId } = z.object({ blockedId: z.string().uuid() }).parse(request.params);
    await service.unblock(request.userId, blockedId);
    return reply.code(204).send();
  });
}
