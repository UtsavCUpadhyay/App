
# Final Launch Guide — Aurelle (Australia)
## From legal entity to live on both app stores

*This is the practical, sequential checklist referenced throughout the 25-phase plan. Items are ordered by actual dependency (you can't do some steps before others).*

---

## 1. Business Structure & Registration

| Step | Detail | Recommendation |
|---|---|---|
| Choose entity type | Sole trader vs. Company (Pty Ltd) | **Pty Ltd recommended** — handling biometric/ID data and payment processing carries liability exposure a sole trader structure doesn't shield against; a company structure is also what App Store/Play and payment processors expect for a data-sensitive commercial app, and it's investor-ready if you raise later |
| Register with ASIC | Company registration + ACN | Required before Pty Ltd exists |
| Apply for ABN | Australian Business Number | Required for GST registration, invoicing, store developer accounts |
| Register for GST | Required once turnover is likely to exceed $75,000/year — recommended to register from day one given subscription revenue intent | GST applies to Australian consumer digital subscription sales |
| Business name/trademark check | Once real brand name is chosen (not "Aurelle" placeholder) | Do a trademark search before committing marketing spend to a name |

---

## 2. Domain & Brand Assets
- Register primary `.com.au` (and `.com` if available) once brand name is finalized — I can run the domain-name-brainstormer skill on request to generate real options and check availability.
- Set up business email (e.g., Google Workspace) under the domain before developer account registration — both Apple and Google want a verifiable business contact.

---

## 3. Developer Accounts

| Platform | Requirement | Cost/notes |
|---|---|---|
| **Apple Developer Program** | Enroll as **Organization** (not Individual) — requires D-U-N-S number, which can take 1–5 business days to obtain/verify if you don't already have one | ~USD $99/year |
| **Google Play Console** | Developer account under the registered company | One-time ~USD $25 fee |
| Both | Set up well before your target submission date — D-U-N-S verification is the most common delay | Start this in parallel with Phase 20 beta, not after |

---

## 4. Payment Gateway & Subscriptions
- **Mobile subscriptions must go through Apple In-App Purchase and Google Play Billing** — this is a store policy requirement for digital subscription content, not a choice.
- Configure subscription products in App Store Connect and Play Console matching the tiers from Phase 2 (1/3/6/12 month + lifetime, for both Dating and Advice).
- If you ever add a web version, a separate gateway (Stripe supports AU businesses well) can be used there — but not as a workaround for mobile store policy.
- Reconcile store payouts against your GST obligations — Apple/Google handle marketplace facilitator tax rules differently by region; confirm current treatment with an Australian accountant before go-live (this is genuinely worth a paid professional, not something to guess on).

---

## 5. Legal Documents (must be live before submission)
- Privacy Policy — must explicitly address biometric/ID verification data handling per Australian Privacy Principles, and disclose the AI moderation trade-off from Phase 10 in plain language.
- Terms of Service — including age restrictions, zero-tolerance conduct policy, and dispute resolution.
- In-app Community Guidelines / Safety Standards — both Apple and Google expect this to exist for dating category apps specifically.
- Recommend a lawyer review before launch given the sensitivity of biometric data — this guide gives you the structure, not a substitute for legal sign-off.

---

## 6. Pre-Submission Technical Checklist
- Phase 18 penetration test completed and critical findings resolved.
- Data Safety form (Google) / App Privacy details (Apple) filled out to exactly match your actual data handling (Phase 8/10 architecture) — mismatches are a common rejection/removal cause.
- In-app reporting/blocking fully functional (both stores require this for dating apps specifically).
- Age-gating and verification flow tested end-to-end.

---

## 7. Submission Process
1. Submit to **Google Play first** (typically faster review) to catch obvious issues early.
2. Submit to **Apple** in parallel or shortly after — budget extra time, dating apps get manual review scrutiny.
3. Expect at least one round of rejection/clarification on first submission — build this into your launch timeline, don't treat it as failure.

---

## 8. Post-Launch Operations
- **Analytics:** Firebase Analytics or a privacy-conscious alternative (avoid over-collecting — consistent with data minimization principle) + a dashboard for the trust/safety metrics defined in Phase 25.
- **Crash monitoring:** Firebase Crashlytics or Sentry, alerting the founding team directly at launch (no dedicated ops team yet).
- **Customer support:** start with a shared inbox/helpdesk tool (e.g., a lightweight helpdesk) — don't over-invest in support tooling before you have support volume.
- **Marketing execution:** per Phase 24 — waitlist/invite mechanics and Advice-content SEO first; paid social only after beta validates retention.

---

## Sequencing Summary (what to actually do first)
1. Register Pty Ltd + ABN + GST (Section 1) — start immediately, has the longest lead time.
2. In parallel: Apple Developer (D-U-N-S) + Google Play accounts (Section 3) — also long lead time.
3. Finalize brand name + domain (Section 2).
4. Legal docs drafted alongside Phase 18 security testing, not after.
5. Beta (Phase 20) while store accounts and legal docs finalize.
6. Submit to stores (Section 7) once Phase 18 security testing + Section 6 checklist are both complete.

---

This closes out the full 25-phase build plan plus launch operations. Natural next deliverables, if useful: the **Business Model / investor-ready projections document**, or running the **domain-name-brainstormer** skill to replace the "Aurelle" placeholder with real, available brand names.
