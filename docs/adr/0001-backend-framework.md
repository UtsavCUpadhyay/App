# ADR 0001 — Backend framework: Fastify for v0 (NestJS deferred)

- **Status:** Accepted (v0 foundation)
- **Date:** 2026-07
- **Context phase:** Phase 15 (Backend Architecture)

## Context

The Phase 15 plan recommended **NestJS** (TypeScript end-to-end, modular structure mapping to the
Dating/Advice/Admin split, mature auth/RBAC ecosystem). That recommendation still stands for a
larger team. This ADR records why the *first runnable slice* uses Fastify instead.

## Decision

Build the v0 API in **Fastify + TypeScript**, preserving the exact module boundaries the NestJS plan
specifies (Auth, Verification, Matching, Chat, Advice, Billing, Admin).

## Rationale

1. **Runnable and verifiable today.** The foundation had to boot and pass tests in a constrained
   environment with no database and no native toolchain. Fastify + pure-JS deps (bcryptjs,
   jsonwebtoken, zod) install cleanly and run; NestJS's heavier bootstrap and decorator/DI runtime
   are harder to stand up and verify in the same constraints.
2. **The founder explicitly allowed an easier stack.** When choosing the next build step, the
   instruction was "all… you are allowed to use other if it is easy for us." Fastify is easier for
   us to run and prove out here.
3. **Boundaries, not framework, are what matters.** The modular-monolith discipline (each module
   owns its routes/service, depends on repository interfaces) is framework-agnostic. Nothing about
   this choice couples us to Fastify.

## Consequences

- **Positive:** a working, tested API now; fast iteration; tiny dependency surface; trivial local run.
- **Trade-off:** we forgo NestJS's built-in DI, guards/interceptors, and WebSocket gateway — which
  the plan leans on for chat scaling. Revisit at the point real-time chat is built (Roadmap Stage 4).
- **Reversibility:** because modules are boundary-respecting and data access is behind repository
  interfaces, migrating a module (or the whole app) to NestJS is mechanical, not a rewrite.

## Revisit when

Real-time chat (WebSocket + Redis pub/sub) is scheduled, or team size grows enough that NestJS's
opinionated structure earns its overhead.
