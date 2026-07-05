
# Phases 6–7: Feature Prioritization & Information Architecture
## Aurelle — Premium Dating Ecosystem

---

## PHASE 6 — FEATURE PRIORITIZATION

Using a MoSCoW framework, cross-referenced against Persona priorities (Phase 3) and competitive wedge (Phase 5).

### MUST HAVE (v1 launch blockers)
| Feature | Justification |
|---|---|
| ID + liveness verification gate | Core trust differentiator, non-negotiable per brand promise |
| Compatibility questionnaire + curated daily matches | Anti-"another Tinder" positioning |
| Secure messaging (text/photo/voice) + block/report | Baseline safety expectation |
| AI abuse/scam detection on messages | Differentiator vs. reactive-only moderation competitors use |
| Incognito mode + suburb-level location only | Directly answers Cautious Chris & Aisha personas |
| Panic/emergency-contact-share on date | Safety brand promise |
| Subscription tiers (Dating + Advice, separate) | Revenue model foundation |
| Advice content library + guardrailed AI Q&A | Funnel engine, low cost relative to Dating build |
| Admin: verification review + moderation queue | Can't operate safely without this from day one |

### SHOULD HAVE (fast-follow, v1.1, within ~90 days of launch)
- AI bio writer / first-message assistant
- Profile boosts, travel mode
- Read receipts (optional, premium)
- Deeper compatibility insights/analytics for premium users
- Admin: revenue dashboards, RBAC granularity

### COULD HAVE (v2, opportunistic)
- Message expiration / temporary photos
- Screenshot detection where platform allows
- Exclusive in-person events
- Community forums in Advice (deferred — moderation cost is nontrivial and reputational risk if unmoderated)

### WON'T HAVE (explicitly out of scope, revisit only post-PMF)
- Global/multi-country launch
- Web app (mobile-only for v1)
- Video dates/live streaming
- Any under-18 dating functionality (permanently out of scope, not just deferred — legal/safety risk)

---

## PHASE 7 — INFORMATION ARCHITECTURE

### Top-Level App Structure
```
Aurelle
├── Onboarding (forced, linear, cannot be skipped)
│   ├── Account creation (email/phone + MFA)
│   ├── Age gate (18+ for Dating; 16+ education-only for Advice)
│   ├── ID + Liveness Verification (Dating only — hard gate before browsing)
│   ├── Profile builder (photos, prompts, compatibility questionnaire)
│   └── Privacy preferences (visibility, location sharing level)
│
├── Home (Tab Bar Root)
│   ├── Tab 1: Dating
│   │   ├── Today's Curated Matches
│   │   ├── Compatibility Detail View (per match)
│   │   ├── Conversations / Chat
│   │   ├── Profile / Settings (visibility, incognito, boosts)
│   │   └── Safety Center (report, block, panic, emergency contacts)
│   │
│   ├── Tab 2: Advice
│   │   ├── Discover (segmented by audience: Men/Women/LGBTQ+/Life-stage)
│   │   ├── AI Coach Chat
│   │   ├── Saved/Library
│   │   └── Premium upsell surface
│   │
│   ├── Tab 3: Notifications
│   └── Tab 4: Account (billing, verification status, privacy controls, data export/delete)
│
└── Admin Portal (separate web app, not in consumer app)
    ├── Verification Review Queue
    ├── Reports & Moderation Queue
    ├── Subscription/Refund Management
    ├── Analytics (basic v1 → full v1.1)
    └── Audit Log
```

### Key IA Decisions & Rationale
1. **Verification is a hard gate inside onboarding, not a settings toggle** — ensures 100% verified user base per Phase 2 decision.
2. **Advice and Dating share one account but isolated data models** — satisfies persona insight that Advice users don't want their questions/chat history linked visibly to a dating profile; also reduces sensitive-data blast radius (privacy-by-design).
3. **Safety Center is a persistent, always-reachable surface**, not buried in settings — panic/report/block must be discoverable in under 2 taps from anywhere in the Dating tab.
4. **Admin Portal is fully separate from the consumer app** (web-based, RBAC-gated) — never bundle admin/moderation tooling inside the shipped mobile binary (security best practice: reduces attack surface, prevents reverse-engineering exposure of moderation logic).

---

## Continuing automatically to Phase 8 — Database Design next.
