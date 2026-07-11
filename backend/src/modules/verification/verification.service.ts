import type { Repositories } from '../../domain/repositories.js';
import type { VerificationStatus } from '../../domain/types.js';
import type { VerificationProvider, VerificationSessionResult } from './provider.js';

/** Minimal shape of a Stripe Identity webhook event we consume. */
export interface StripeIdentityEvent {
  type: string;
  data: {
    object: {
      id: string;
      status?: string;
      metadata?: { user_id?: string } | null;
    };
  };
}

export interface WebhookOutcome {
  handled: boolean;
  userId?: string;
  status?: VerificationStatus;
}

/**
 * Maps a Stripe Identity event type to our verification status. `verified` is
 * the only auto-approve; `requires_input` routes to human review rather than a
 * hard reject (Phase 10 layer 5); `canceled` rejects.
 */
function statusForEvent(type: string): VerificationStatus | null {
  switch (type) {
    case 'identity.verification_session.verified':
      return 'approved';
    case 'identity.verification_session.processing':
      return 'pending';
    case 'identity.verification_session.requires_input':
      return 'manual_review';
    case 'identity.verification_session.canceled':
      return 'rejected';
    default:
      return null;
  }
}

export class VerificationService {
  constructor(
    private readonly repos: Repositories,
    private readonly provider: VerificationProvider,
  ) {}

  /** Opens a provider session and marks the user's verification pending. */
  async createSession(userId: string): Promise<VerificationSessionResult> {
    const result = await this.provider.createSession(userId);
    await this.repos.verification.save({
      userId,
      status: 'pending',
      vendorRef: result.providerRef,
      livenessScore: null,
      reviewedAt: null,
    });
    return result;
  }

  /**
   * Applies a verified webhook event to the user's record. Idempotent — Stripe
   * may deliver an event more than once. Stores only the session id, never any
   * document. Callers MUST verify the signature before invoking this.
   */
  async handleEvent(event: StripeIdentityEvent): Promise<WebhookOutcome> {
    const status = statusForEvent(event.type);
    const userId = event.data.object.metadata?.user_id;
    if (!status || !userId) return { handled: false };

    // Only act on users we know about.
    if (!(await this.repos.users.findById(userId))) return { handled: false };

    await this.repos.verification.save({
      userId,
      status,
      vendorRef: event.data.object.id,
      livenessScore: null,
      reviewedAt: status === 'approved' ? new Date().toISOString() : null,
    });
    await this.repos.audit.append({
      actorId: null,
      actorType: 'system',
      action: `verification.${status}`,
      targetId: userId,
    });
    return { handled: true, userId, status };
  }
}
