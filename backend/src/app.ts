import Fastify, { type FastifyInstance } from 'fastify';
import { ZodError } from 'zod';

import { loadConfig, type AppConfig } from './config.js';
import type { Repositories } from './domain/repositories.js';
import { createMemoryRepositories } from './infra/memory/store.js';
import type { ModerationProvider } from './modules/moderation/moderation.service.js';
import { registerAdminRoutes } from './modules/admin/admin.routes.js';
import { ensureBootstrapAdmin } from './modules/admin/admin.service.js';
import { registerAdviceRoutes } from './modules/advice/advice.routes.js';
import { registerAuthRoutes } from './modules/auth/auth.routes.js';
import { registerChatRoutes } from './modules/chat/chat.routes.js';
import { registerMatchingRoutes } from './modules/matching/matching.routes.js';
import { RulesModerationProvider } from './modules/moderation/moderation.service.js';
import { registerSafetyRoutes } from './modules/safety/safety.routes.js';
import {
  buildVerificationProvider,
  type VerificationProvider,
} from './modules/verification/provider.js';
import { registerVerificationRoutes } from './modules/verification/verification.routes.js';
import { registerAuth } from './plugins/auth.js';
import { HttpError } from './shared/http-error.js';

export interface BuildOptions {
  config?: AppConfig;
  repos?: Repositories;
  moderation?: ModerationProvider;
  verificationProvider?: VerificationProvider;
}

/**
 * Composition root: wires config, repositories, plugins and every module into
 * one Fastify instance. Tests build an app with in-memory repos; production
 * passes Postgres-backed repositories through the same seam.
 */
export async function buildApp(opts: BuildOptions = {}): Promise<FastifyInstance> {
  const config = opts.config ?? loadConfig();
  const repos = opts.repos ?? createMemoryRepositories();

  const app = Fastify({
    // Structured logging; never log tokens or PII (Phase 10 secure logging).
    logger: { level: process.env.LOG_LEVEL ?? 'info' },
    disableRequestLogging: process.env.NODE_ENV === 'test',
  });

  // Retain the raw JSON body so the Stripe webhook can verify its signature
  // against the exact bytes Stripe signed, while normal routes still get parsed
  // JSON.
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (request, body, done) => {
      (request as { rawBody?: string }).rawBody = body as string;
      try {
        done(null, (body as string).length ? JSON.parse(body as string) : {});
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

  // Uniform error handling: Zod → 400, HttpError → its status, else 500.
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: 'validation_error',
        details: error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
    if (error instanceof HttpError) {
      return reply.code(error.statusCode).send({ error: error.message, code: error.code });
    }
    app.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  });

  await registerAuth(app, repos, config);

  app.get('/health', async () => ({ status: 'ok', service: 'aurelle-api' }));

  // Swap this for a hosted-LLM provider (Phase 16) without touching chat.
  const moderation = opts.moderation ?? new RulesModerationProvider();

  // Create the first superadmin from env if configured and none exists.
  await ensureBootstrapAdmin(repos);

  // Identity verification provider (Stripe Identity when keys are present).
  const verificationProvider =
    opts.verificationProvider ??
    buildVerificationProvider({
      provider: config.verification.provider,
      stripeSecretKey: config.verification.stripeSecretKey,
    });

  registerAuthRoutes(app, repos, config);
  registerVerificationRoutes(app, repos, config, verificationProvider);
  registerMatchingRoutes(app, repos);
  registerAdviceRoutes(app, repos);
  registerChatRoutes(app, repos, moderation);
  registerSafetyRoutes(app, repos);
  registerAdminRoutes(app, repos, config);

  return app;
}
