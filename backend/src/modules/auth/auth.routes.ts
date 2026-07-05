import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import type { AppConfig } from '../../config.js';
import type { Repositories } from '../../domain/repositories.js';
import { toPublicUser } from '../../domain/types.js';
import { AuthService } from './auth.service.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10, 'Use at least 10 characters'),
  dateOfBirth: z.string().date(),
  userType: z.enum(['dating', 'advice_only']).default('dating'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Auth module routes: register, login, refresh, me.
 * Tokens are short-lived JWT access + long-lived refresh (Phase 10 session mgmt).
 */
export function registerAuthRoutes(
  app: FastifyInstance,
  repos: Repositories,
  config: AppConfig,
): void {
  const service = new AuthService(repos, config);

  const issueTokens = (userId: string) => ({
    accessToken: app.jwt.sign({ sub: userId, typ: 'access' }, { expiresIn: config.accessTokenTtl }),
    refreshToken: app.jwt.sign({ sub: userId, typ: 'refresh' }, { expiresIn: config.refreshTokenTtl }),
  });

  app.post('/auth/register', async (request, reply) => {
    const input = registerSchema.parse(request.body);
    const user = await service.register(input);
    return reply.code(201).send({ user, ...issueTokens(user.id) });
  });

  app.post('/auth/login', async (request, reply) => {
    const { email, password } = loginSchema.parse(request.body);
    const user = await service.validateCredentials(email, password);
    return reply.send({ user: toPublicUser(user), ...issueTokens(user.id) });
  });

  app.post('/auth/refresh', async (request, reply) => {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(request.body);
    const payload = app.jwt.verify<{ sub: string; typ: string }>(refreshToken);
    if (payload.typ !== 'refresh') {
      return reply.code(401).send({ error: 'Not a refresh token' });
    }
    return reply.send(issueTokens(payload.sub));
  });

  app.get('/auth/me', { preHandler: app.authenticate }, async (request, reply) => {
    const user = await repos.users.findById(request.userId);
    if (!user) return reply.code(404).send({ error: 'User not found' });
    return reply.send({ user: toPublicUser(user) });
  });
}
