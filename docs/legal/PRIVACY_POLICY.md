# Privacy Policy — Aurelle (DRAFT TEMPLATE)

> ⚠️ **This is a drafting template, not legal advice.** Fill the bracketed fields and have an
> Australian privacy lawyer review it before publishing. It reflects the Phase 10 architecture and
> Australian Privacy Act 1988 (APPs).

**Effective date:** [DATE] · **Entity:** [LEGAL ENTITY NAME, ABN] · **Contact:** [privacy@domain]

## 1. Who we are
Aurelle ("we") operates a verification-first dating service and a relationship-advice service. This
policy explains how we handle your personal information under the Australian Privacy Act 1988 and the
Australian Privacy Principles (APPs).

## 2. Information we collect
- **Account:** email/phone, password (stored only as a hash), date of birth, account type.
- **Identity verification (sensitive information):** a government ID scan and a liveness selfie are
  processed by our licensed verification provider, **[VENDOR]**. We do **not** store your raw ID
  documents — we retain only the provider's pass/fail result, a risk/liveness score, and a reference
  token.
- **Profile:** display name, photos, prompts, compatibility answers, and **suburb-level** location
  only (never precise coordinates).
- **Messages:** message content, encrypted at rest. See §5.
- **Advice usage:** kept **separate** from your dating profile.
- **Device/technical:** device identifiers, IP (hashed in logs), and fraud-prevention signals.

## 3. Why we collect it (purpose)
Matching, safety and fraud prevention, identity verification, providing the Advice service, billing,
and legal compliance. We do not sell your personal information. We are subscription-funded and do not
show third-party ads.

## 4. Consent for sensitive information
Biometric liveness data and government ID are **sensitive information**. We collect them only with
your explicit consent at verification, and only for the purpose of confirming your identity and
preventing fraud.

## 5. Message privacy and safety moderation
Messages are encrypted in transit and at rest. Before a message is stored, automated safety systems
scan it for scams, abuse, and prohibited content. Staff cannot read your messages except during a
formal investigation of a report you or another member makes — and every such access is logged. We do
not offer end-to-end encryption in this version because it would make this safety scanning impossible.

## 6. Who we share with
Service providers acting on our behalf under contract: **[VERIFICATION VENDOR]**, **[CLOUD/HOSTING —
AU region]**, **[PAYMENT/STORE — Apple/Google]**, **[AI PROVIDER, under no-training terms]**. We may
disclose information where required by law or to prevent serious harm.

## 7. Where your data lives
Primary storage is in an Australian cloud region ([AWS ap-southeast-2 / GCP australia-southeast1]).
Some providers may process limited data overseas under APP 8 safeguards — listed at [LINK].

## 8. Retention and deletion
You can export or delete your account in-app at any time (Account → Your data). On deletion we remove
your profile and messages within [N] days, retaining only what law requires (e.g. billing records,
safety-report audit trails).

## 9. Your rights
Access, correction, and complaint rights under the APPs. Contact [privacy@domain]; unresolved
complaints can go to the Office of the Australian Information Commissioner (OAIC).

## 10. Security
Encryption in transit and at rest; verification data isolated from profile data with strict access
control; MFA for staff/admin; regular third-party penetration testing.

## 11. Children
Dating is 18+. The Advice service is available to 16–17-year-olds in an education-only mode with no
dating features and no unsupervised AI counseling on sensitive topics. Not available under 16.

## 12. Changes
We will notify you of material changes in-app and update the effective date above.
