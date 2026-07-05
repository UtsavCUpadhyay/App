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
- NestJS modular monolith (Auth, Verification, Matching, Chat, Advice, Billing, Admin) + Postgres
  in Sydney region; schema per Phase 8; Row-Level Security for privacy isolation.
- Real auth (email/phone + passkey), short-lived JWT + rotating refresh, MFA for billing changes.
- Swap mock repositories for networked implementations behind the existing interfaces.

## Stage 3 — Verification + trust (3–4 wks)
- Integrate a licensed vendor (Onfido/Jumio/iDenfy/Persona-class) — store reference tokens only.
- Duplicate-face + device-fingerprint + velocity checks (Phase 10 defense-in-depth layers 1–3).
- Admin verification/moderation queue (separate web app — never in the mobile binary).

## Stage 4 — Messaging + safety (4–6 wks)
- WebSocket gateway + Redis pub/sub (chat delivery < 500ms p95); encrypt-at-rest.
- Server-side AI scam/abuse moderation _before_ storage; image NCII/CSAM detection (legal
  requirement before enabling photo messaging); voice-note transcription+scan or descope voice.
- Report/block with < 24h (urgent < 2h) resolution SLA wired to the admin queue.

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
