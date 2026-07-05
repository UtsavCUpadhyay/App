
# Product Requirements Document (PRD)
## Premium Dating Ecosystem — Working Name: **"Aurelle"** (placeholder — brand naming is a separate deliverable)
### Phase 2 of 25 — Australia Launch

---

## 1. Executive Summary

Aurelle is a two-sided ecosystem consisting of:
1. **Aurelle Dating** — an invite-adjacent, identity-verified, premium dating platform for Australia, positioned against Raya/The League/Inner Circle rather than Tinder/Bumble.
2. **Aurelle Advice** — a free-to-premium AI-powered relationship education platform, usable independently of the dating product, that also serves as the top-of-funnel acquisition channel (SEO + retention layer).

**Core differentiation vs. incumbents** (folded in from competitive research):
| Problem with existing apps | Aurelle's answer |
|---|---|
| Anyone can join → low quality, fake profiles | Mandatory ID + liveness verification before matching |
| Swipe fatigue, superficial | Compatibility-first matching, limited daily curated matches |
| Screenshots/harassment/scams | Screenshot-aware privacy, AI scam/moderation layer, panic/report tools |
| Cheap, ad-like feel | Apple-competitive design, dark-mode-first, subscription-only (no ads) |
| One-size pricing | Tiered subscriptions across Dating and Advice, sold separately or bundled |

---

## 2. Goals & Success Metrics (12-month post-launch, Australia only)

| Metric | Target | Why it matters |
|---|---|---|
| Verified-profile rate | 100% (verification is mandatory, not optional) | Core trust promise |
| Fake/duplicate account rate | <0.5% of active base | Differentiator vs. Tinder/Bumble (~"industry avg" fake rate is materially higher per user complaint research) |
| D30 retention | ≥25% (dating apps industry median is ~15–20%) | Premium apps monetize on retention, not volume |
| Premium conversion rate | 8–12% of verified users | Subscription-only revenue model needs this to hit unit economics |
| Advice-to-Dating funnel conversion | ≥15% of Advice free users trial Dating | Advice is the CAC-reduction engine |
| Report-to-resolution time | <24h for safety reports, <2h for urgent/harassment | Safety is the #1 stated brand pillar |
| App Store / Play rating | ≥4.6★ | Premium positioning requires premium perceived quality |

Non-goals for v1: global rollout, native Android tablet/iPad optimized layouts, live video dates, in-app events/ticketing (flagged "future-ready" only), payments beyond Australian gateways.

---

## 3. Target Users (detail expanded in Phase 3 Personas)

**Primary segment:** Australians 25–45, professionally established, previously tried Tinder/Bumble/Hinge and left due to fatigue, low quality matches, or safety concerns. Willing to pay for curation and safety.

**Secondary segment:** Advice-only users (any age 16+, education-only for under-18s, no dating features) who arrive via search/social content and may convert later.

**Explicitly out of scope for v1:** users under 18 for any dating functionality (hard age gate + ID verification enforced), which also satisfies Australian Online Safety Act obligations.

---

## 4. Product Scope — v1 (MVP) Feature Set

Scope is intentionally narrower than the full wish-list in your brief. Everything else is tagged **v1.1+ / Later**.

### 4.1 Dating — v1 MVP
- Onboarding: government ID + selfie liveness verification (mandatory gate before browsing)
- Profile creation: photos (min/max enforced), prompts (Hinge-style, not just bio), verified badge
- Matching: compatibility questionnaire (values, intentions, lifestyle) → daily curated match list (not infinite swipe)
- Messaging: text, photos, voice notes, block/report, AI scam & abuse detection
- Privacy: incognito mode, granular visibility controls, no precise location exposure (suburb-level only)
- Subscriptions: Free (limited), Premium (monthly/3/6/12mo + lifetime)
- Safety: panic/report button, human moderation queue, emergency contact share on date (basic version)

### 4.2 Dating — v1.1+ / Later
- AI-generated first messages / bio writer, profile boosts, travel mode, read receipts, exclusive events, screenshot-blocking, message expiration, advanced AI compatibility insights, device-fingerprint risk scoring dashboards.

### 4.3 Advice — v1 MVP
- Content library organized by audience segment and topic (structure per your brief)
- AI relationship Q&A chat (guardrailed, cites psychology-based frameworks, no clinical/medical claims)
- Free tier: browse content + limited AI questions/day
- Premium tier: unlimited AI coach, deeper personalized guidance
- Age-gated: under-18 accounts get education-only content, no chat with adults, no dating features

### 4.4 Advice — v1.1+ / Later
- AI breakup-recovery program, structured courses, community forums (deferred — moderation cost is high), personalized relationship "check-ins."

### 4.5 Admin Panel — v1 MVP (minimum viable, not full wish-list)
- Verification review queue, reports/moderation queue, subscription/refund lookup, basic analytics, audit log.
- Full analytics/revenue dashboards, RBAC granularity, AI-monitoring console → v1.1+.

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Privacy** | Australian Privacy Act 1988 (APPs) compliant by design; data minimization; easy export/delete; no precise geolocation stored beyond what's needed for matching radius |
| **Security** | Encrypted at rest and in transit; verification documents stored separately from profile DB with strict access control; MFA for admin accounts |
| **Availability** | 99.9% target post-launch (not before — MVP can tolerate planned maintenance windows) |
| **Performance** | Cold start <2s, chat message delivery <500ms p95 |
| **Accessibility** | WCAG 2.1 AA for Advice content (public-facing, SEO-relevant); mobile accessibility basics for Dating app |
| **Compliance** | Age verification, Online Safety Act considerations, App Store/Play dating-app-specific policies (both platforms have extra review scrutiny for dating apps — flagged for Phase 21/22) |

---

## 6. Explicit Assumptions (flag if wrong)

1. Launch is iOS + Android via Flutter, not web-first.
2. ID verification will use a licensed third-party vendor (not built in-house) — vendor comparison happens in Security Architecture phase (Phase 10).
3. Subscriptions sold via Apple/Google in-app purchase for mobile (required by store policy for digital subscriptions), not external payment links.
4. "Lifetime membership" pricing/legal implications (refund law, GST treatment) get resolved in the Business Model phase, not this PRD.
5. You (founder) will operate as a registered Australian business entity before App Store/Play submission — covered in the Final Launch Guide, not required to start design/dev.

---

## 7. Open Decisions for You (need your input before Phase 3)

1. **Working brand name** — "Aurelle" here is a placeholder. Want me to run the domain-name-brainstormer skill for real options?
2. **Verification strictness** — 100%-mandatory ID verification before any browsing (higher trust, higher signup friction) vs. verification required only to message (lower friction, matches your "zero fake profiles" goal less strictly)?
3. **Advice product relationship** — fully free forever with ads-free premium upsell, or paid-only from day one?

---

## Next Phase
**Phase 3 — User Personas**, detailing 4–6 primary personas (Dating + Advice) with goals, frustrations with existing apps, and feature-priority implications.
