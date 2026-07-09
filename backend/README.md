# Aurelle API

The Aurelle backend — a **modular monolith** (Phase 15) in **Fastify + TypeScript**.

> **Why Fastify, not NestJS?** The Phase 15 plan recommended NestJS. This v0 uses
> Fastify instead — a conscious, reversible call recorded in
> [`docs/adr/0001-backend-framework.md`](../docs/adr/0001-backend-framework.md). Short version:
> Fastify is lighter, has zero native/build dependencies, and runs and is fully test-verifiable in
> a constrained CI/agent environment today. The module boundaries below are identical to the NestJS
> plan, so migrating — or staying on Fastify — remains a clean decision later.

## Run it

```bash
npm install
npm start          # boots on :3000 (config via env; see .env.example)
npm run typecheck  # tsc --noEmit, strict
npm test           # vitest via fastify.inject (no network)
```

**Storage is pluggable.** With no `DATABASE_URL`, the API uses in-memory repositories — zero setup,
instant run, 11 passing integration tests. Point it at Postgres and it uses the real schema instead:

```bash
export DATABASE_URL="postgresql://user:pass@localhost:5432/aurelle"
npm run seed       # applies migrations (migrations/NNNN_*.sql) + dev seed data
npm start          # migrations run automatically on boot; seed does not
npm test           # now also runs the 3 Postgres-backed tests (14 total)
```

Migrations live in [`migrations/`](migrations/) and implement the Phase 8 schema (users, isolated
`verification_records`, profiles, compatibility answers, matches, advice, append-only `audit_log`),
with indexes on the hot query paths and Row-Level Security enabled as the enforcement seam.

## What works today

- **Auth** — register / login / refresh / me. bcrypt password hashing, short-lived access JWT +
  long-lived refresh (Phase 10 session model). User-enumeration-resistant login errors.
- **Hard age gate** — Dating is 18+; under-16 blocked entirely (Phase 2).
- **Hard verification gate** — the founder's chosen "verify before browsing" policy, enforced
  **server-side**: `/matches/today` sits behind `authenticate` + `requireVerified`, so an unverified
  account gets `403 verification_required` even if the client is bypassed.
- **Verification** — simulates the licensed-vendor callback (Phase 10): stores only a vendor
  reference token + liveness score (never raw ID docs); high score auto-approves, middling score
  routes to **manual review** rather than auto-rejecting.
- **Advice** — age-tiered server-side: under-18 accounts only ever receive minor-safe content
  (Phase 16), not just a hidden UI filter.
- **Chat + AI safety moderation** — 1:1 conversations + messages (gated: verified members only,
  participant-authorized). Every text message is scanned by a moderation provider **before storage**
  (Phase 10); scam/abuse patterns are flagged with a user-facing reason (the contextual safety
  banner) and still delivered — we flag, never auto-block. The rules-based provider is swappable for
  a hosted-LLM one (Phase 16) behind one interface.

## Structure (module boundaries mirror the Phase 15 plan)

```
src/
├── config.ts                 # env-driven config; secrets never in source
├── domain/                   # entities (Phase 8 schema) + repository interfaces
├── infra/memory/             # in-memory repositories (default; zero-setup)
├── infra/pg/                 # Postgres pool, migration runner + repositories
├── plugins/auth.ts           # JWT + `authenticate` and `requireVerified` guards
├── modules/
│   ├── auth/                 # register / login / refresh / me
│   ├── verification/         # vendor-callback simulation, status
│   ├── matching/             # curated daily matches (gated)
│   ├── advice/               # age-tiered content
│   ├── chat/                 # conversations + messages (gated, moderated)
│   └── moderation/           # scam/abuse scan provider (swappable for an LLM)
├── shared/http-error.ts
├── app.ts                    # composition root (buildApp)
└── server.ts                 # process entry + graceful shutdown
```

## The seam to production

Every module depends on a repository *interface*, never a concrete store. Both an in-memory and a
**Postgres** implementation exist behind that seam; `buildApp({ repos })` picks whichever is passed.
That is why the whole API is testable with zero dependencies *and* runs on the real Phase 8 schema
with one env var. Production adds Row-Level Security policies, a Sydney region, and TLS.

## Not yet built (see ../docs/ROADMAP.md)

Real vendor integration, WebSocket chat + AI moderation, IAP billing/entitlements, the admin portal,
rate limiting, and MFA. Structured so each drops into an existing module boundary.
