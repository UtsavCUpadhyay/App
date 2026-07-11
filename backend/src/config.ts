/**
 * Runtime configuration. Secrets come from the environment only — never
 * committed to source (Phase 10 infra security baseline). Sensible dev
 * defaults keep local runs frictionless without weakening production.
 */
export interface AppConfig {
  port: number;
  host: string;
  jwtSecret: string;
  accessTokenTtl: string;
  refreshTokenTtl: string;
  /** Minimum age for any Dating functionality (Phase 2 hard age gate). */
  minDatingAge: number;
  /** Postgres connection string. When unset, the app uses in-memory storage. */
  databaseUrl: string | undefined;
  /** Identity-verification provider. 'stripe' when Stripe keys are present. */
  verification: {
    provider: 'simulation' | 'stripe';
    stripeSecretKey: string | undefined;
    stripeWebhookSecret: string | undefined;
  };
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const jwtSecret = env.JWT_SECRET ?? 'dev-only-insecure-secret-change-me';
  if (env.NODE_ENV === 'production' && jwtSecret.startsWith('dev-only')) {
    throw new Error('JWT_SECRET must be set in production');
  }
  return {
    port: Number(env.PORT ?? 3000),
    host: env.HOST ?? '0.0.0.0',
    jwtSecret,
    accessTokenTtl: env.ACCESS_TOKEN_TTL ?? '15m',
    refreshTokenTtl: env.REFRESH_TOKEN_TTL ?? '30d',
    minDatingAge: 18,
    databaseUrl: env.DATABASE_URL,
    verification: {
      provider: env.STRIPE_SECRET_KEY ? 'stripe' : 'simulation',
      stripeSecretKey: env.STRIPE_SECRET_KEY,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
    },
  };
}
