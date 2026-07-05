import Fastify, { type FastifyInstance } from 'fastify';
import { ZodError } from 'zod';

import { loadConfig, type AppConfig } from './config.js';
import type { Repositories } from './domain/repositories.js';
import { createMemoryRepositories } from './infra/memory/store.js';
import { registerAdviceRoutes } from './modules/advice/advice.routes.js';
import { registerAuthRoutes } from './modules/auth/auth.routes.js';
import { registerMatchingRoutes } from './modules/matching/matching.routes.js';
import { registerVerificationRoutes } from './modules/verification/verification.routes.js';
import { registerAuth } from './plugins/auth.js';
import { HttpError } from './shared/http-error.js';

export interface BuildOptions {
  config?: AppConfig;
  repos?: Repositories;
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

  registerAuthRoutes(app, repos, config);
  registerVerificationRoutes(app, repos);
  registerMatchingRoutes(app, repos);
  registerAdviceRoutes(app, repos);

  return app;
}
