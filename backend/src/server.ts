import { buildApp } from './app.js';
import { loadConfig } from './config.js';
import type { Repositories } from './domain/repositories.js';
import { createPgRepositories } from './infra/pg/repositories.js';
import { createPool, runMigrations, type Pool } from './infra/pg/pool.js';

/** Process entry point. Boots the API and handles graceful shutdown. */
async function main(): Promise<void> {
  const config = loadConfig();

  // Use Postgres when DATABASE_URL is set; otherwise fall back to in-memory.
  let repos: Repositories | undefined;
  let pool: Pool | undefined;
  if (config.databaseUrl) {
    pool = createPool(config.databaseUrl);
    const applied = await runMigrations(pool);
    repos = createPgRepositories(pool);
    // eslint-disable-next-line no-console
    console.log(`[db] Postgres connected; migrations applied: ${applied.join(', ')}`);
  }

  const app = await buildApp({ config, repos });

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => {
      app.log.info(`${signal} received, shutting down`);
      void app
        .close()
        .then(() => pool?.end())
        .then(() => process.exit(0));
    });
  }

  try {
    await app.listen({ port: config.port, host: config.host });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void main();
