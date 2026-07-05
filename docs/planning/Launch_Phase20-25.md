
# Phases 20–25: Beta Launch, App Store/Play Submission, Production Deployment, Marketing Launch, Continuous Improvement
## Aurelle — Premium Dating Ecosystem

---

## PHASE 20 — BETA LAUNCH

### Approach: Closed/invite-only beta (not open beta)
**Rationale:** consistent with the exclusivity brand — a small, curated beta (target 200–500 verified Australians in 1–2 cities, e.g., Sydney + Melbourne) achieves two things simultaneously: real usage data, and manufactured early exclusivity/waitlist buzz that reinforces "private members club" positioning rather than diluting it with a mass open beta.

**Beta success gates before wider rollout:**
- Verification pass rate and false-rejection rate within acceptable range (tune vendor thresholds)
- No critical security findings from Phase 18 pen test
- D7 retention and qualitative feedback from beta cohort meets bar before spending marketing budget
- Report/moderation response time actually achievable at real volume (not just theoretical SLA)

---

## PHASE 21 — APP STORE (APPLE) SUBMISSION
## PHASE 22 — GOOGLE PLAY SUBMISSION

**Critical: dating apps face extra scrutiny on both stores.** Key requirements to prepare for, not after rejection:
- **Apple:** requires clear in-app reporting/blocking mechanisms, age rating typically 17+/18+, subscription pricing must go through Apple's in-app purchase system (no external payment links for digital subscriptions — Apple has specific "reader app" exceptions that don't apply to dating), and Apple has historically applied extra manual review to dating category apps for safety-feature completeness.
- **Google Play:** Dating apps fall under Play's "Inappropriate Content"/social features policies requiring in-app reporting, blocking, and a documented content moderation process; Play also requires the Data Safety form to accurately reflect verification-data handling (this must match Phase 10 architecture exactly — mismatches are a common rejection cause).
- Both stores: privacy policy and terms of service (Phase 23-adjacent, drafted with Australian Privacy Act + general international best-practice language) must be live and linked before submission, not added after.
- Recommend budgeting **2–4 weeks buffer** for first submission review + likely first-round rejection/resubmission — this is normal for dating-category apps, not a sign of a broken app.

---

## PHASE 23 — PRODUCTION DEPLOYMENT

- Blue/green or canary deployment via the CI/CD pipeline (Phase 15/19) — no direct-to-100%-traffic deploys, especially for a safety-critical product.
- Production monitoring stack: crash reporting (Firebase Crashlytics or Sentry), APM/uptime monitoring, and a dedicated alert channel for verification-service and payment-webhook failures specifically (these two failure modes directly damage trust/revenue if silent).
- Disaster recovery: automated PostgreSQL backups with tested restore procedure (a backup that's never been restore-tested is not a real backup) — test this before go-live, not after an incident.

---

## PHASE 24 — MARKETING LAUNCH

### Channel Strategy for a Premium/Exclusive Positioning
| Channel | Fit for Aurelle | Notes |
|---|---|---|
| Waitlist + invite mechanics | High | Reinforces exclusivity; each existing verified member gets limited invites — turns growth into a status signal rather than an ad click |
| Influencer/PR (dating & lifestyle, AU-focused) | High | Premium brand needs earned credibility, not paid-ad volume, in early stage |
| Paid social (Meta/TikTok) | Medium | Useful post-beta for volume, but should target look-alike audiences of your actual beta cohort, not broad dating-app-interest targeting (avoids attracting exactly the low-intent users you're trying to filter out) |
| SEO via Advice content | High, compounding | Advice content answers real search queries ("dating after divorce," "how to tell if he's genuine") — long-term organic funnel that also builds domain authority before Dating app ASO matters |
| ASO (App Store Optimization) | Medium-high | Category is competitive; premium/exclusive keyword positioning ("verified dating," "curated matches") differentiates from swipe-app-saturated generic keywords |
| Referral program | Medium | Design carefully — referral incentives in dating apps can attract low-intent users if not tied to verification quality; recommend referral rewards for *both* parties only unlocking after the referred user completes verification, not just signup |

---

## PHASE 25 — CONTINUOUS IMPROVEMENT

- Weekly trust & safety metrics review (fake-account rate, report resolution time, verification pass/fail patterns) — these are leading indicators for brand health, reviewed more frequently than growth metrics initially.
- Feature roadmap driven by the v1.1/v2 backlog already tagged in Phase 6, prioritized by actual beta/launch data rather than assumption.
- Quarterly compliance review (Privacy Act, Online Safety Act, App Store/Play policy changes) — dating + AI + biometric data is a fast-moving regulatory area; this can't be a "set once" task.

---

## This completes the 25-phase plan.

## Recommended Immediate Next Deliverables
Since the full plan is now documented end-to-end, the highest-leverage next steps are:
1. **Final Launch Guide** — the practical checklist you asked for at the end of your original brief (business registration, domain, developer accounts, payment gateways, GST, publishing steps) — I can produce this next as a standalone actionable document.
2. **Business Model / Investor-ready document** (revenue projections, CAC/LTV assumptions, pricing strategy) — referenced throughout but not yet built as its own deliverable.
3. Real domain/brand name options (domain-name-brainstormer skill) to replace the "Aurelle" placeholder.

I'll proceed directly to the Final Launch Guide next, since that was explicitly the stated final goal in your original brief.
