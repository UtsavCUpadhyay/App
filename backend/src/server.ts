import { buildApp } from './app.js';
import { loadConfig } from './config.js';

/** Process entry point. Boots the API and handles graceful shutdown. */
async function main(): Promise<void> {
  const config = loadConfig();
  const app = await buildApp({ config });

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => {
      app.log.info(`${signal} received, shutting down`);
      void app.close().then(() => process.exit(0));
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
