import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Verifies a Stripe webhook signature (the `Stripe-Signature` header) against
 * the raw request body, implementing Stripe's documented scheme:
 *
 *   signed_payload = `${timestamp}.${rawBody}`
 *   expected       = HMAC_SHA256(webhookSecret, signed_payload)  (hex)
 *
 * We compare in constant time and reject stale timestamps (replay protection).
 * Implemented directly (no SDK) so it is deterministic and unit-testable, and
 * so the security-critical path has no hidden dependency (Phase 10).
 */
export function verifyStripeSignature(opts: {
  payload: string;
  header: string | undefined;
  secret: string;
  toleranceSeconds?: number;
  now?: number;
}): boolean {
  const { payload, header, secret } = opts;
  if (!header) return false;

  const parts = new Map<string, string[]>();
  for (const kv of header.split(',')) {
    const [key, value] = kv.split('=');
    if (!key || value === undefined) continue;
    const list = parts.get(key) ?? [];
    list.push(value);
    parts.set(key, list);
  }

  const timestamp = parts.get('t')?.[0];
  const signatures = parts.get('v1') ?? [];
  if (!timestamp || signatures.length === 0) return false;

  const tolerance = opts.toleranceSeconds ?? 300;
  const now = opts.now ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > tolerance) return false;

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`, 'utf8')
    .digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');

  // Accept if any provided v1 signature matches (Stripe may send several).
  return signatures.some((sig) => {
    const sigBuf = Buffer.from(sig, 'utf8');
    return sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf);
  });
}

/** Builds a valid `Stripe-Signature` header — used by tests and by Stripe's CLI. */
export function buildStripeSignatureHeader(
  payload: string,
  secret: string,
  timestamp = Math.floor(Date.now() / 1000),
): string {
  const signature = createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`, 'utf8')
    .digest('hex');
  return `t=${timestamp},v1=${signature}`;
}
