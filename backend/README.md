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
npm start          # boots on :3000 (PORT/HOST/JWT_SECRET via env)
npm run typecheck  # tsc --noEmit, strict
npm test           # vitest — 11 integration tests via fastify.inject (no DB, no network)
```

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

## Structure (module boundaries mirror the Phase 15 plan)

```
src/
├── config.ts                 # env-driven config; secrets never in source
├── domain/                   # entities (Phase 8 schema) + repository interfaces
├── infra/memory/             # in-memory repositories (swap for Postgres via the same seam)
├── plugins/auth.ts           # JWT + `authenticate` and `requireVerified` guards
├── modules/
│   ├── auth/                 # register / login / refresh / me
│   ├── verification/         # vendor-callback simulation, status
│   ├── matching/             # curated daily matches (gated)
│   └── advice/               # age-tiered content
├── shared/http-error.ts
├── app.ts                    # composition root (buildApp)
└── server.ts                 # process entry + graceful shutdown
```

## The seam to production

Every module depends on a repository *interface*, never a concrete store. To go live, implement
those interfaces against Postgres (Phase 8 schema, Sydney region, Row-Level Security) and pass them
to `buildApp({ repos })`. No module logic changes. The same seam is why the whole API is testable
today with zero external dependencies.

## Not yet built (see ../docs/ROADMAP.md)

Real vendor integration, WebSocket chat + AI moderation, IAP billing/entitlements, the admin portal,
rate limiting, and MFA. Structured so each drops into an existing module boundary.
