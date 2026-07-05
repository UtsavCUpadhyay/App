# Aurelle — Project Audit & Redesign Assessment

_Prepared as Step 1 of the build. Read this before the code._

## 0. The single most important finding

**There was no existing application to audit.** The uploaded ZIP ("Aurelle Planning
Package") is a **25-phase strategy & design package** — 12 well-written documents plus one
static HTML mockup — not a codebase. The repository itself contained only a 10-byte
`README.md`.

So the master-prompt framing ("find bugs, performance issues, security holes in my existing
app") does not literally apply — there is nothing built yet. The honest, high-value job is
different and better: **turn an excellent plan into a real, premium foundation, and pressure-test
the plan itself.** That is what this branch does.

A second, practical constraint worth stating plainly: **Flutter/Dart are not installed in this
build environment**, so the Dart code committed here has been written to be idiomatic and
analyzer-clean but has **not been compiled or run here** — it needs one `flutter pub get` +
`flutter run` pass on your machine. The interactive prototype (`docs/prototype/index.html`) is the
part you can see and click _today_, on any phone or browser.

---

## 1. What the plan gets genuinely right (keep all of this)

| Area | Why it's strong |
|---|---|
| **Wedge** | Mandatory ID+liveness verification + curated (not swipe) matching + editorial design + an Advice funnel is a real, defensible combination no incumbent offers in AU. |
| **Scope discipline** | MoSCoW prioritisation is honest — it defers boosts, travel mode, events, forums, E2EE "vault mode", and web/global to v1.1+. This is the #1 thing first-time founders get wrong, and it's handled well. |
| **The E2EE trade-off is correctly resolved** | The Phase 10 call — encrypt at rest/in transit + server-side AI moderation _before_ sealing, rather than true Signal-style E2EE — is the only coherent way to honour both "military-grade privacy" _and_ "AI scam detection." Most briefs never notice these conflict. |
| **Verification as a hard onboarding gate, not a setting** | Architecturally guarantees the "100% verified" promise instead of hoping users opt in. |
| **Data isolation** | Advice data isolated from the Dating profile, verification docs in a separate table storing only vendor _reference tokens_ (never raw IDs), suburb-level location only — all privacy-by-design, all correct for the Australian Privacy Act. |
| **"Don't use Kubernetes yet"** | Correctly rejects premature infra. Modular monolith → extractable modules is the right migration path. |
| **Design system** | Dark-first, champagne-gold-on-charcoal, Fraunces serif + Inter, restraint-over-decoration. Distinct from every competitor and genuinely premium. Tokens are specific and WCAG-checked. |

Verdict: **this is a top-decile plan.** The gaps below are refinements, not rewrites.

---

## 2. Gaps, risks & things that will bite you (ranked)

### 🔴 High — address before/at build start

1. **Store policy is an existential risk, not a Phase 21 detail.** Apple (Guideline 1.2 / 5.1.2)
   and Google apply *extra* scrutiny to dating apps: mandatory content moderation, reporting,
   block, and a clear method to report objectionable content with 24h action. Your safety design
   satisfies this — but it must be demonstrably wired up and _screenshot-documented_ for review, or
   you get rejected repeatedly. Treat "reject-proof safety UX" as a MUST, not a launch-week task.
2. **In-app-purchase-only for subscriptions is a margin fact, not a footnote.** Apple/Google take
   15–30%. Your unit economics (8–12% conversion target) must be modelled _net_ of that. Also: you
   cannot link out to a cheaper web payment inside the app in most regions — plan the pricing around
   the store tax from day one.
3. **AI Coach crisis-handling is a liability surface.** The plan says "refuse + redirect to crisis
   resources" — good, but this needs a concrete, tested list of **Australian** resources (Lifeline
   13 11 14, Beyond Blue, 1800RESPECT) hard-coded, and red-teamed before launch, not after.
4. **"Lifetime membership" + Australian Consumer Law.** Lifetime digital subscriptions interact
   badly with mandatory-refund/consumer-guarantee law and store policies. Cap allocation, define
   "lifetime" precisely in the ToS, and get one hour of Australian legal review before selling it.

### 🟡 Medium — decide during v1

5. **Matching cold-start problem.** Curated daily matches require a critical mass of verified users
   in each city _before_ curation feels good. Day-1 in Sydney with 40 users produces bad matches and
   churn. Needs a seeding/waitlist-by-city launch strategy — this is a growth risk the plan under-weights.
6. **Verification friction vs. funnel.** 100%-mandatory ID before _any_ browsing is the highest-trust
   / highest-drop-off choice. Recommend instrumenting the funnel from day one and A/B-testing a
   "verify-to-message" fallback if signup completion craters. (Open Decision #2 in the PRD — still open.)
7. **Voice notes + photos raise the moderation bar.** AI scam detection on _text_ is tractable; on
   voice (needs transcription) and images (needs CSAM/NCII detection — a legal obligation, not a nicety)
   it is materially harder and more expensive. Budget for it or descope voice/photo from v1 messaging.
8. **No analytics/experimentation layer is specified.** For a retention-monetised premium app you need
   event analytics + funnel instrumentation + a feature-flag/remote-config system from launch, or you're
   flying blind on the exact metrics (D30, conversion) the plan is optimising for.

### 🟢 Lower — track, don't block

9. Accessibility is specified (WCAG 2.1 AA) but needs a real audit pass on the _dark, muted_ palette —
   champagne-on-charcoal can fail 4.5:1 for secondary text; verify every pairing with a contrast tool.
10. Push-notification strategy (FCM) is named but not designed — notification content for a dating app
    is a retention lever _and_ a privacy risk (don't leak match names on the lock screen).
11. Offline behaviour is unspecified. "Offline-first where practical" from the master prompt mostly
    means: cached Advice content + graceful chat-send queueing. Scope it explicitly.

---

## 3. What this branch delivers now

1. **A real Flutter foundation** implementing the Phase 14 architecture — feature-first, Riverpod DI,
   repository pattern — with the Phase 11 design system as typed tokens (`lib/core/theme/`).
2. **The five flagship screens**, faithful to the wireframes + high-fidelity mockup:
   verification gate · curated matches (one card, not a deck) · chat with the contextual AI safety
   banner · Advice discover · Safety Center (≤2 taps).
3. **Reusable core widgets** (buttons via theme, glass surface, verified seal, pills, skeleton loaders)
   and designed empty/loading/error states.
4. **Tests** demonstrating the pattern: a unit test on the matches repository (verified-only, curated,
   score-bounded invariants) and a widget test proving the verification gate blocks until complete.
5. **A clickable HTML prototype** (`docs/prototype/index.html`) so the redesign is viewable immediately.
6. **Your full planning package preserved** in `docs/planning/`.

## 4. What is deliberately _not_ here (and why)

The backend (NestJS + Postgres), the verification-vendor integration, real auth/session/secure
storage, IAP billing, FCM, the AI moderation/coach services, and the admin portal are **weeks-to-months
of team engineering** — the Phase 14–15 doc says so itself. Shipping stubs of those as if they were
real would be the opposite of the "no hacks, no fake precision" bar the brief sets. The foundation here
is structured so each of those slots into an existing module boundary without a rewrite. See
`docs/ROADMAP.md` for the honest sequence.
