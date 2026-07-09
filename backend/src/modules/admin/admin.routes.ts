import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import type { AppConfig } from '../../config.js';
import type { Repositories } from '../../domain/repositories.js';
import { toPublicAdmin } from '../../domain/types.js';
import { AdminService } from './admin.service.js';

const MODERATION_ROLES = new Set(['moderator', 'superadmin']);

/**
 * Admin portal API: separate login (admin token type) + the moderation queue.
 * Only moderator/superadmin roles may action reports; every action is audited
 * in the service layer.
 */
export function registerAdminRoutes(
  app: FastifyInstance,
  repos: Repositories,
  config: AppConfig,
): void {
  const service = new AdminService(repos);

  app.post('/admin/auth/login', async (request, reply) => {
    const { email, password } = z
      .object({ email: z.string().email(), password: z.string().min(1) })
      .parse(request.body);
    const admin = await service.authenticate(email, password);
    const token = app.jwt.sign(
      { sub: admin.id, typ: 'admin', role: admin.role },
      { expiresIn: config.accessTokenTtl },
    );
    return reply.send({ admin: toPublicAdmin(admin), token });
  });

  const requireModerator = async (
    request: Parameters<typeof app.requireAdmin>[0],
    reply: Parameters<typeof app.requireAdmin>[1],
  ) => {
    await app.requireAdmin(request, reply);
    if (reply.sent) return;
    if (!MODERATION_ROLES.has(request.adminRole)) {
      return reply.code(403).send({ error: 'This role cannot moderate reports' });
    }
  };

  app.get('/admin/reports', { preHandler: requireModerator }, async (request, reply) => {
    const { status } = z
      .object({ status: z.enum(['open', 'reviewing', 'resolved', 'dismissed']).optional() })
      .parse(request.query);
    return reply.send({ reports: await service.listQueue(status ?? 'open') });
  });

  app.patch('/admin/reports/:id', { preHandler: requireModerator }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const { status, notes } = z
      .object({
        status: z.enum(['reviewing', 'resolved', 'dismissed']),
        notes: z.string().max(4000).optional(),
      })
      .parse(request.body);
    const report = await service.actOnReport(request.adminId, id, { status, notes });
    return reply.send({ report });
  });
}
