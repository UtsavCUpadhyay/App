
# Phases 14–15: Flutter Development & Backend Development Architecture
## Aurelle — Premium Dating Ecosystem

*Note: These phases represent the actual coding effort — realistically weeks/months of engineering work by a Flutter + backend team, not something completed in a chat session. What follows is the architecture, folder structure, and technical decisions a development team would execute against, plus the reasoning behind each choice, so this can be handed directly to engineers or an agency.*

---

## PHASE 14 — FLUTTER APP ARCHITECTURE

### State Management: Riverpod (recommended)

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Riverpod** | Compile-safe, testable, scales well for a large feature set (Dating + Advice as separate but related domains), excellent async/streaming support for chat | Slightly steeper learning curve than Provider | **Recommended** |
| Bloc | Very structured, great for large teams | More boilerplate, slower to iterate for a small early team | Good alternative if team already knows it |
| Provider (legacy) | Simple | Not built for an app this complex long-term | Not recommended |
| GetX | Fast to write | Known maintainability/testability issues at scale, discouraged for apps handling sensitive data | Not recommended for a security-sensitive product |

### Folder Structure (feature-first, not layer-first)
```
lib/
├── core/
│   ├── theme/           (design tokens from Phase 11 — colors, typography, spacing)
│   ├── network/         (API client, interceptors, error handling)
│   ├── security/        (secure storage wrapper, biometric lock, session mgmt)
│   └── widgets/         (shared UI components: buttons, cards, glass surfaces)
├── features/
│   ├── onboarding/       (auth, age-gate, verification flow)
│   ├── dating/
│   │   ├── matches/
│   │   ├── profile/
│   │   ├── chat/
│   │   └── safety/
│   ├── advice/
│   │   ├── discover/
│   │   ├── ai_coach/
│   │   └── library/
│   └── account/          (billing, privacy controls, data export/delete)
└── main.dart
```

**Rationale:** Feature-first structure (not `models/`, `views/`, `controllers/` at the top level) keeps Dating and Advice cleanly separable — reinforcing the Phase 7 IA decision that they're independent products sharing one shell, and makes it trivial to later spin Advice out as its own release if needed.

### Key Technical Decisions
- **Local secure storage:** Flutter Secure Storage (Keychain/Keystore-backed) for tokens — never plain SharedPreferences for anything sensitive.
- **Image handling:** client-side compression before upload, EXIF metadata stripped automatically (privacy — photos should never leak GPS metadata).
- **Biometric app-lock:** optional but strongly encouraged at first launch — reinforces safety brand even at the OS level.
- **Push notifications:** Firebase Cloud Messaging (cross-platform, free tier generous, integrates cleanly regardless of backend choice below).

---

## PHASE 15 — BACKEND ARCHITECTURE

### Overall Stack Recommendation

| Layer | Choice | Rationale |
|---|---|---|
| Primary datastore | PostgreSQL (Phase 8) | Already justified — relational integrity for billing/verification/safety data |
| Application backend | **Node.js (NestJS framework)** | TypeScript end-to-end (shared types/validation with any web admin panel), NestJS's modular structure maps cleanly to Aurelle's Dating/Advice/Admin domain split, mature ecosystem for auth/RBAC | 
| Alternative considered | Go | Better raw performance/concurrency | Slower initial development velocity for a small team; reconsider if/when chat volume demands it post-PMF |
| Real-time/chat | WebSocket gateway (NestJS built-in) backed by Redis pub/sub for horizontal scaling | Keeps chat delivery separate from REST system-of-record, as decided in Phase 9 |
| File/object storage | Cloud object storage (AWS S3 or GCP Cloud Storage), Sydney region | Verification reference assets (vendor-hosted, not ours), profile photos, encrypted before storage |
| CDN | Cloudflare | Fast AU delivery, DDoS protection, also useful for the Advice content (SEO-relevant, needs to load fast) |
| Hosting/compute | Cloud Run (GCP) or ECS Fargate (AWS) — containerized, not raw VMs | Managed scaling without a DevOps team of your own initially; Kubernetes explicitly NOT justified at this stage (Phase 19 note) |
| CI/CD | GitHub Actions | Already have GitHub connected; free tier sufficient for early stage |

### Why NOT Kubernetes yet
Your brief listed Kubernetes as a candidate — recommendation is to explicitly avoid it for v1. Managed container services (Cloud Run/Fargate) give you auto-scaling without needing a dedicated DevOps engineer, which you don't have yet as a first-time founder. Revisit only if/when you have dedicated infra headcount and multi-region scaling needs — premature Kubernetes adoption is one of the most common ways early-stage teams waste engineering time.

### Service Boundaries (modular monolith, not microservices, for v1)

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| Microservices from day one | Scales cleanly later | Massive overhead for a pre-PMF team — deployment complexity, distributed debugging | Rejected for v1 |
| **Modular monolith** (NestJS modules: Auth, Verification, Matching, Chat, Advice, Admin, Billing) | Fast to build/deploy, still cleanly separable later since modules are boundary-respecting | Requires discipline to avoid tight coupling between modules | **Recommended for v1** |

**Migration path:** Because modules are built with clear boundaries (own DB schemas/RLS policies, own service classes), the Verification or Chat module can be extracted into a standalone microservice later without a rewrite — this is deliberate future-proofing without paying the operational cost today.

---

## Continuing automatically to Phase 16 — AI Features next.
