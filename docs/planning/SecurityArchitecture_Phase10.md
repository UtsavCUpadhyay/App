
# Phase 10: Security Architecture
## Aurelle — Premium Dating Ecosystem

---

## 10.1 Messaging Encryption: The E2EE Trade-off (resolved decision)

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| Full end-to-end encryption (E2EE) | Maximum privacy, server can never read messages | Blocks server-side AI scam/abuse/harassment detection entirely — the safety feature you explicitly prioritized becomes impossible | Rejected for v1 |
| No encryption beyond transport (TLS only) | Simple, full moderation capability | Fails "military-grade" privacy promise, unacceptable for a trust-first brand | Rejected |
| **Encrypted at rest + in transit, server-side AI moderation before storage** | Balances privacy (data is encrypted at rest, protected from breach/leak) with safety (AI can scan content at the point of send, before it's sealed) | Server technically has momentary plaintext access | **Recommended for v1** |

**Rationale:** Your brief explicitly asks for both "military-grade encryption" AND "AI moderation/scam/abuse detection." These are in direct tension — true E2EE (like Signal) makes server-side content moderation architecturally impossible. Every credible safety-first messaging product (including ones marketed as "secure") makes this same trade-off. We disclose this clearly in the Privacy Policy: messages are encrypted at rest and in transit, scanned by automated safety systems, never accessible to staff except during a formal reported-abuse investigation (logged in `audit_log`).

Revisit in v2: optional "vault mode" per-conversation E2EE toggle for users who accept losing AI safety scanning on that thread — flagged as v1.1+/v2, not a v1 blocker.

---

## 10.2 Identity Verification Vendor Selection

| Vendor category | Pros | Cons | Verdict |
|---|---|---|---|
| Build in-house (custom liveness/face-match models) | Full control | Extremely high regulatory risk, expensive, slow, and reinventing a solved problem — first-time founder team has no reason to own this liability | Rejected |
| **Licensed specialist vendor** (e.g. Onfido, Jumio, iDenfy, Persona-class providers — final vendor selection via RFP once budget is set) | Regulatorily compliant out of the box, liveness + document + face-match bundled, AU-compliant data handling available, reference-token integration keeps raw docs out of our DB | Ongoing per-verification cost | **Recommended** |

**Integration pattern:** Aurelle never stores raw ID documents. The vendor performs verification, returns a pass/fail + risk score + reference token, which we store in `verification_records` (Phase 8 schema). This satisfies both data-minimization principle and dramatically reduces breach liability.

---

## 10.3 Fraud & Fake-Profile Detection Layers (defense in depth)

1. **Layer 1 — Onboarding:** mandatory ID + liveness + duplicate-face detection against existing verified users (prevents one person running multiple accounts).
2. **Layer 2 — Device/behavioral:** device fingerprinting, velocity checks (e.g., many accounts from one device/IP), disposable-email/phone detection.
3. **Layer 3 — Ongoing risk scoring:** anomalous login location, sudden behavior changes (mass messaging, external link sharing patterns typical of scams) trigger a risk score increase → auto-throttle or flag for manual review.
4. **Layer 4 — Content-level AI moderation:** message/photo scanning for scam patterns (financial requests, crypto solicitation — the dominant real-world dating-scam pattern), toxic language, non-consensual image detection.
5. **Layer 5 — Human review queue:** anything above a risk threshold routes to the Admin verification/moderation queue (Phase 7 IA) rather than being auto-actioned — avoids false-positive account bans without human oversight, which is both a fairness and reputational-risk safeguard.

---

## 10.4 Authentication & Access Control

- **Consumer accounts:** email/phone + password or passkey, MFA optional-but-encouraged for users, MFA **mandatory** for any account with active subscription billing changes.
- **Admin accounts:** MFA mandatory, no exceptions, role-based scopes (verification_reviewer / moderator / support / superadmin), all admin actions logged to `audit_log` with actor + target + timestamp.
- **Session management:** short-lived JWTs + rotating refresh tokens, forced re-auth on sensitive actions (changing payment method, deleting account).

## 10.5 Infrastructure Security Baseline
- Secrets management via cloud provider's secrets manager (never in code/config files).
- Principle of least privilege for all service-to-service access (verification service cannot read message content; messaging service cannot read verification documents).
- Data residency: Australian cloud region (AWS ap-southeast-2 Sydney, or GCP australia-southeast1) as primary, satisfying data-sovereignty expectations even though not strictly mandated by the Privacy Act for all data types.
- Regular penetration testing before public launch (Phase 18 — Security Testing) — not optional given the sensitivity of verification data.

---

## Continuing automatically to Phase 11 — UI Design System next.
