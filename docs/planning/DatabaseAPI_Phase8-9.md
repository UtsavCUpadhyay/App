
# Phases 8–9: Database Design & API Design
## Aurelle — Premium Dating Ecosystem

---

## PHASE 8 — DATABASE DESIGN

### Tech Choice: PostgreSQL (primary), with rationale

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **PostgreSQL** | Relational integrity for critical data (subscriptions, verification, matches), mature Row-Level Security for privacy isolation, strong JSONB support for flexible profile fields, excellent Australian cloud region support (AWS/GCP Sydney) | Requires more upfront schema design than NoSQL | **Recommended** |
| Firebase Firestore | Fast to prototype, real-time sync out of box | Weak for relational integrity (subscriptions/billing/verification need strong consistency), cost scales poorly at volume, less control over data residency | Use only for chat real-time layer, not system of record |
| MongoDB | Flexible schema | Same relational-integrity concerns for billing/verification-critical data | Not recommended as primary store |

**Recommendation:** PostgreSQL as source of truth for all sensitive/structured data (users, verification, subscriptions, matches, moderation). A real-time layer (Firebase Realtime DB, Supabase Realtime, or a WebSocket service) sits alongside purely for chat delivery/typing indicators/presence — never as the system of record for anything billing- or safety-related.

### Core Schema (entity-level, simplified)

```
users
 ├─ id, email/phone, auth_provider, mfa_enabled, created_at, account_status
 ├─ age_verified_at, date_of_birth (encrypted), user_type (dating|advice_only)

verification_records   [ISOLATED TABLE — strictest access control]
 ├─ user_id (FK), document_type, verification_vendor_ref, liveness_score,
 ├─ status (pending|approved|rejected|manual_review), reviewed_by_admin_id, reviewed_at
 ├─ NOTE: raw ID documents are NOT stored in our DB — only vendor reference tokens (see Phase 9/API)

profiles
 ├─ user_id (FK), display_name, photos[], prompts[], bio,
 ├─ visibility_settings (jsonb), incognito_enabled, location_suburb (NOT precise coords)

compatibility_answers
 ├─ user_id (FK), question_id, answer_value, weight

matches
 ├─ user_a_id, user_b_id, compatibility_score, match_status, created_at

conversations / messages
 ├─ conversation_id, participant_ids[], 
 ├─ messages: id, conversation_id, sender_id, content_encrypted, type (text|photo|voice),
 ├─ moderation_flag (nullable), created_at, expires_at (nullable)

subscriptions
 ├─ user_id, product (dating|advice), tier, billing_period, store_transaction_id,
 ├─ status, start_date, renewal_date, is_lifetime (bool)

reports_moderation
 ├─ reporter_id, reported_user_id, reason, evidence_refs[], status, assigned_admin_id, resolution_notes

admin_users
 ├─ id, role (verification_reviewer|moderator|support|superadmin), mfa_enabled, audit_log_id

audit_log
 ├─ actor_id, actor_type (user|admin|system), action, target_id, timestamp, ip_hash
```

### Data Privacy-by-Design Decisions
1. **Verification documents never sit in our primary DB** — only a reference token from the ID-verification vendor (data minimization principle, reduces breach blast radius, simplifies APP compliance).
2. **Precise GPS coordinates are never persisted** — only suburb/postcode-level geohash, recalculated server-side for distance display. This is a hard architectural rule from Phase 2/4 privacy commitments.
3. **Messages encrypted at rest**; end-to-end encryption evaluated further in Security Architecture (Phase 10) — trade-off is moderation capability (AI abuse detection needs plaintext access at some layer), so a hybrid model (encrypted at rest + server-side moderation before encryption, never full E2EE that blocks safety scanning) is the likely recommendation — finalized in Phase 10.
4. **Row-Level Security (Postgres RLS)** enforced so application code cannot accidentally leak one user's data to another — defense in depth beyond just application logic.

---

## PHASE 9 — API DESIGN

### Architecture Style: REST + WebSocket hybrid (not GraphQL for v1)

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| REST | Simple, well-understood, easy to secure per-endpoint, easy rate-limiting | More round trips for complex screens | **Recommended for v1** — team velocity matters more than query flexibility at this stage |
| GraphQL | Flexible client queries, less over-fetching | Harder to rate-limit/secure per-field, steeper ops learning curve for a first-time team | Reconsider post-PMF if client needs diverge a lot |
| gRPC | High performance, strong typing | Overkill for mobile-first consumer app at this stage | Not recommended for v1 |

**Real-time layer:** WebSocket (or managed service like Supabase Realtime/Pusher) for chat delivery, typing indicators, online presence — kept separate from the REST system-of-record calls.

### Core API Domains (illustrative, not exhaustive)
```
/auth/*              — signup, login, MFA, session refresh
/verification/*       — start verification, webhook receiver from ID vendor, status check
/profile/*            — CRUD profile, photos, prompts, visibility settings
/compatibility/*       — submit questionnaire, get compatibility score
/matches/*             — get today's curated matches, like/pass, match detail
/conversations/*       — list, get messages (paginated), send message (also mirrored to WebSocket)
/moderation/*          — report user, block user (user-facing)
/subscriptions/*       — get status, webhook receiver from App Store/Play billing
/advice/*              — content library, AI coach chat endpoint
/admin/*               — verification queue, reports queue, subscription lookup (strict RBAC + MFA required)
```

### Security Requirements Baked Into Every Endpoint
- All endpoints behind authenticated sessions (JWT short-lived + refresh token rotation).
- Admin endpoints require separate RBAC scopes + MFA — no shared credentials between consumer and admin auth systems.
- Every state-changing endpoint (block, report, verification decision, subscription change) writes to `audit_log`.
- Rate limiting on `/auth/*` and `/matches/*` (anti-scraping, anti-bot).
- Webhooks (ID verification vendor, App Store/Play billing) validated via signature verification — never trusted on payload alone.

---

## Continuing automatically to Phase 10 — Security Architecture next.
