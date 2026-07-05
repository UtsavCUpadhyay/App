# App Store & Google Play — Dating-App Compliance Checklist

Dating apps get **extra review scrutiny** on both stores. Rejections here are the single most common
cause of blown launch dates. Treat this as a launch blocker, not a launch-week task. (Phases 21–22.)

> This is engineering/product guidance, not legal advice. Have an Australian lawyer review the legal
> items before submission.

## Both stores — must-haves

- [ ] **In-app reporting** of objectionable content/users, reachable in ≤2 taps (✅ Safety Center is
      designed for this — must be wired to a real backend queue before submission).
- [ ] **Block** a user, with immediate effect.
- [ ] **Content moderation** with a stated action SLA (Aurelle: <24h; urgent <2h). Document the
      human moderation queue for reviewers.
- [ ] **EULA with zero-tolerance for objectionable content/abuse** shown at signup (Apple 1.2 requires
      this for UGC apps specifically).
- [ ] **Age gate 18+** for Dating, enforced (✅ server-side hard age gate implemented).
- [ ] **Account deletion in-app** (both stores now mandate in-app delete if you support in-app
      creation) — ✅ surfaced in Account → Your data; must be wired to real deletion.
- [ ] **Privacy policy + terms** linked from the store listing and in-app.
- [ ] **Data-safety / privacy-nutrition disclosures** accurate: ID docs, biometric liveness, photos,
      location (suburb-level), messages. Under-disclosure = rejection or removal.
- [ ] **IAP for all digital subscriptions** — no external payment links for digital goods.

## Apple App Store specifics

- [ ] Guideline **1.2 (UGC):** filter, report, block, published contact for reports, act on reports.
- [ ] Guideline **5.1.2 / 5.1.1:** justify collection of ID + biometric data; explicit consent;
      data-minimization. Note verification docs are vendor-held, not stored by us — say so.
- [ ] **Sign in with Apple** required if you offer any third-party social login.
- [ ] App Privacy "Data Used to Track You" — only if true; a subscription-only, ad-free app should
      have a clean tracking profile (a selling point — keep it clean).
- [ ] Demo account + reviewer notes explaining the verification gate (reviewers must be able to get
      past it — provide a pre-verified test account or a reviewer bypass flag).

## Google Play specifics

- [ ] **Data safety form** matches actual behaviour and the privacy policy exactly.
- [ ] Play **UGC policy:** in-app reporting + moderation, same as Apple.
- [ ] Sensitive permissions (camera for liveness) justified in the listing; no background location.
- [ ] Target the current required `targetSdkVersion`.
- [ ] Provide reviewer credentials that clear the verification gate.

## Australia-specific

- [ ] **Privacy Act 1988 / APPs:** consent for sensitive info (biometrics), easy access/correction,
      data export + delete (✅ surfaced in-app), breach-notification readiness.
- [ ] **Online Safety Act 2021:** reporting pathways, no under-18 dating functionality
      (permanently out of scope), age-appropriate Advice for 16–17 (✅ server-side minor-safe tiering).
- [ ] **Australian Consumer Law:** subscription auto-renewal disclosure, cooling-off/refund handling,
      and careful treatment of any "lifetime" tier (see AUDIT.md §2.4 — cap it and get legal review).
- [ ] **GST** on digital subscriptions to AU consumers (handled at the store/billing layer).

## Pre-submission dry run

1. Fresh install → signup → hit the verification gate → verify → match → chat → report → block →
   delete account. Screenshot each safety-relevant step for the reviewer notes.
2. Confirm privacy disclosures == privacy policy == actual network traffic.
3. Confirm no crash, no placeholder text, no dead links (common auto-rejection triggers).
