import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import type { Repositories } from '../../domain/repositories.js';
import type { ModerationProvider } from '../moderation/moderation.service.js';
import { ChatService } from './chat.service.js';

/**
 * Chat module routes. All sit behind BOTH guards (`authenticate` +
 * `requireVerified`): messaging requires an approved identity, consistent with
 * the founder's verify-before-browsing policy (Phase 7 IA).
 */
export function registerChatRoutes(
  app: FastifyInstance,
  repos: Repositories,
  moderation: ModerationProvider,
): void {
  const service = new ChatService(repos, moderation);
  const gated = { preHandler: [app.authenticate, app.requireVerified] };

  app.post('/conversations', gated, async (request, reply) => {
    const { withUserId } = z.object({ withUserId: z.string().uuid() }).parse(request.body);
    const convo = await service.startConversation(request.userId, withUserId);
    return reply.code(201).send({ conversation: convo });
  });

  app.get('/conversations', gated, async (request, reply) => {
    const conversations = await service.listConversations(request.userId);
    return reply.send({ conversations });
  });

  app.get('/conversations/:id/messages', gated, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const messages = await service.getMessages(request.userId, id);
    return reply.send({ messages });
  });

  const sendSchema = z.object({
    kind: z.enum(['text', 'photo', 'voice']).default('text'),
    body: z.string().min(1).max(4000),
  });

  app.post('/conversations/:id/messages', gated, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const { kind, body } = sendSchema.parse(request.body);
    const message = await service.sendMessage(request.userId, id, kind, body);
    return reply.code(201).send({ message });
  });
}
