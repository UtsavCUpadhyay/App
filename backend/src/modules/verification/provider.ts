import { randomUUID } from 'node:crypto';

import { HttpError } from '../../shared/http-error.js';

/** Result of opening a verification session, handed to the mobile SDK. */
export interface VerificationSessionResult {
  /** Provider session id — the reference token we persist (never raw docs). */
  providerRef: string;
  /** Ephemeral client secret for the Stripe Identity mobile SDK. */
  clientSecret?: string;
  /** Hosted-flow URL fallback. */
  url?: string;
}

/**
 * Identity-verification provider seam (Phase 10: use a licensed vendor, never
 * build in-house). Chosen vendor: Stripe Identity. A simulation provider backs
 * local/dev/test so the whole flow runs without live keys.
 */
export interface VerificationProvider {
  createSession(userId: string): Promise<VerificationSessionResult>;
}

/** Dev/test provider — returns fake references, no network calls. */
export class SimulationVerificationProvider implements VerificationProvider {
  async createSession(userId: string): Promise<VerificationSessionResult> {
    const id = `sim_${randomUUID()}`;
    return { providerRef: id, clientSecret: `${id}_secret`, url: `https://verify.local/${userId}` };
  }
}

/**
 * Stripe Identity. Creates a document+selfie VerificationSession and returns
 * its client secret. The verification *result* arrives asynchronously via the
 * signed webhook — never as a synchronous return — which is why the outcome is
 * handled in the webhook, not here. We store only Stripe's session id; the ID
 * document itself is held by Stripe, satisfying data-minimization (Phase 10).
 */
export class StripeIdentityProvider implements VerificationProvider {
  constructor(private readonly secretKey: string) {}

  async createSession(userId: string): Promise<VerificationSessionResult> {
    const res = await fetch('https://api.stripe.com/v1/identity/verification_sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        type: 'document',
        'options[document][require_matching_selfie]': 'true',
        'metadata[user_id]': userId,
      }).toString(),
    });
    if (!res.ok) {
      throw new HttpError(502, 'Verification provider is temporarily unavailable');
    }
    const json = (await res.json()) as { id: string; client_secret?: string; url?: string };
    return { providerRef: json.id, clientSecret: json.client_secret, url: json.url };
  }
}

export function buildVerificationProvider(cfg: {
  provider: 'simulation' | 'stripe';
  stripeSecretKey: string | undefined;
}): VerificationProvider {
  if (cfg.provider === 'stripe' && cfg.stripeSecretKey) {
    return new StripeIdentityProvider(cfg.stripeSecretKey);
  }
  return new SimulationVerificationProvider();
}
