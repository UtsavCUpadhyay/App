# Roadmap — the honest sequence to launch

This is the realistic order of work from the current foundation to an Australian v1 launch. It is
deliberately not a promise that any of it is done — it is the map. Effort labels are rough
team-weeks, not guarantees.

## ✅ Done (this branch)
- Feature-first Flutter foundation, Riverpod DI, repository pattern.
- Phase 11 design system as typed tokens + Material 3 themes (dark + light).
- Flagship screens with mock data: verification gate, curated matches, chat + AI safety banner,
  Advice discover, Safety Center, account.
- Reusable widgets, designed loading/empty/error states, seed tests.
- Clickable HTML prototype; full planning package preserved.

## Stage 1 — App skeleton hardening (1–2 wks)
- `flutter pub get` + compile pass; wire CI (GitHub Actions: `analyze` + `test` on every PR).
- Routing (`go_router`), app-lock scaffold, secure storage wrapper (`flutter_secure_storage`).
- Golden tests for the design system; expand widget tests to chat + matches.

## Stage 2 — Backend + auth (4–6 wks)
- ✅ **Started (`backend/`):** modular monolith (Fastify + TS — see ADR 0001), auth (register/login/
  refresh, bcrypt + JWT), hard age gate, **hard verification gate enforced server-side**, verification
  vendor-callback simulation, age-tiered Advice. 11 passing integration tests, runs with no DB.
- ✅ **Postgres wired in:** Phase 8 schema as SQL migrations (users, isolated verification_records,
  profiles, compatibility answers, matches, advice, append-only audit_log; hot-path indexes; RLS
  enabled), a migration runner + dev seed, and Postgres-backed repositories behind the same
  interfaces. The API runs on either store via `DATABASE_URL`; 14 tests pass (3 against real Postgres).
- Next: RLS *policies* per role; passkey login; MFA for billing changes; rate limiting;
  dependency/vuln scanning in CI; move curation out of the match repo into a real scoring service.

## Stage 3 — Verification + trust (3–4 wks)
- Integrate a licensed vendor (Onfido/Jumio/iDenfy/Persona-class) — store reference tokens only.
- Duplicate-face + device-fingerprint + velocity checks (Phase 10 defense-in-depth layers 1–3).
- Admin verification/moderation queue (separate web app — never in the mobile binary).

## Stage 4 — Messaging + safety (4–6 wks)
- ✅ **Started:** 1:1 conversations + messages (Phase 8 `0002_chat.sql`), gated to verified members
  and participant-authorized; **server-side scam/abuse moderation _before_ storage** with a swappable
  provider (rules now → hosted LLM per Phase 16), flag-not-block, contextual safety-banner reason
  persisted per message. Verified live over HTTP + at the SQL layer (7 chat/moderation tests).
- Next: WebSocket gateway + Redis pub/sub for real-time delivery (< 500ms p95); encrypt-at-rest;
  image NCII/CSAM detection before enabling photo messaging; voice-note transcription+scan or descope
  voice; report/block wired to the admin moderation queue with the < 24h (urgent < 2h) SLA.

## Stage 5 — Advice + AI + billing (3–5 wks)
- Advice CMS + content; guardrailed AI Coach (hosted LLM, no-training terms) with **Australian**
  crisis-resource redirects hard-coded and red-teamed; age-tiered system prompts.
- IAP subscriptions (Apple/Google) + entitlement sync; model unit economics net of store tax.

## Stage 6 — Launch readiness (2–4 wks)
- Analytics + feature flags/remote config (currently missing — needed to measure D30/conversion).
- Accessibility audit on the dark palette; localisation scaffolding; push (FCM) with
  privacy-safe notification content.
- Third-party penetration test + OWASP Mobile Top 10 review (non-negotiable, Phase 18).
- Store assets, dating-app policy compliance evidence, privacy policy / ToS, per-city seeding
  strategy to beat the matching cold-start.

## Cross-cutting risks (from AUDIT.md §2)
Store-policy scrutiny · IAP margins · AI crisis-handling liability · lifetime-membership +
Australian Consumer Law · matching cold-start · verification friction vs. funnel drop-off.
