
# Phases 16–19: AI Features, Testing, Security Testing, Performance Optimization
## Aurelle — Premium Dating Ecosystem

---

## PHASE 16 — AI FEATURES ARCHITECTURE

### Model Strategy: Hosted LLM API vs. self-hosted

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Hosted LLM API** (e.g., Gemini/OpenAI/Anthropic-class provider via API) | No ML infra team needed, state-of-the-art quality out of the box, fast iteration | Per-call cost, data leaves your infra (mitigated via provider's enterprise/no-training-on-data terms) | **Recommended for v1** |
| Self-hosted open-source LLM | Full data control, no per-call cost at scale | Requires ML infra/ops expertise you don't have yet, worse quality than frontier hosted models for nuanced relationship advice | Reconsider only at massive scale |

### AI Feature Breakdown & Guardrails

| Feature | Product | Guardrail requirement |
|---|---|---|
| AI Coach chat | Advice | System prompt restricts to psychology-informed relationship guidance; explicit refusal + crisis-resource redirect for self-harm/abuse disclosures (never attempt to "handle" a crisis disclosure conversationally) |
| AI bio/first-message writer | Dating | Never impersonate — always clearly a drafting aid the user edits/sends themselves |
| AI scam/abuse detection | Dating (safety) | Runs server-side on message content before storage (per Phase 10 encryption decision); flags, doesn't auto-block, above a risk threshold |
| AI compatibility insights | Dating | Presented as "signals," never as deterministic "you are X% compatible" pseudo-science overclaim — avoids the "fake precision" complaint common in competitor reviews |
| AI fake-profile/duplicate detection | Trust & Safety | Combines with device fingerprinting + face-match from Phase 10, not AI text analysis alone |

### Critical Guardrail: Age & Content Boundaries
Under-18 Advice accounts get a **separate, more restrictive system prompt** — no relationship/intimacy content beyond general education, hard-coded refusal patterns, and no AI chat interaction that could constitute unsupervised counseling of a minor on sensitive topics. This is enforced at the API-call level (different prompt/model config per account age-tier), not just a UI content filter — critical because Online Safety Act obligations attach to actual behavior, not just what's displayed.

---

## PHASE 17 — TESTING STRATEGY

| Testing type | Approach | Priority |
|---|---|---|
| Unit tests | Business logic (compatibility scoring, subscription state machine, verification status transitions) | High — these are the modules where bugs cause real trust/revenue damage |
| Widget/UI tests | Flutter widget tests for core flows (onboarding, chat, matches) | Medium-high |
| Integration tests | Full onboarding→verification→match→chat flow, subscription purchase→entitlement flow | High — cross-module bugs are the most damaging (e.g., paid user not getting premium features) |
| AI output QA | Human-reviewed sample sets for AI Coach responses (tone, accuracy, no harmful advice) before and after any prompt changes | High — reputational risk if AI advice is bad |
| Manual QA pass | Full regression before every release, on real iOS + Android devices, not just simulators | Required — dating apps have unusually high store-review scrutiny (Phase 21/22) |

---

## PHASE 18 — SECURITY TESTING

1. **Third-party penetration test** before public launch — non-negotiable given the sensitivity of ID/verification data. Budget and schedule this explicitly; don't treat it as optional "if time allows."
2. **Dependency/vulnerability scanning** in CI (e.g., automated scanning on every PR) — catches known-vulnerable packages before merge.
3. **OWASP Mobile Top 10 review** specifically for the Flutter client (insecure data storage, improper platform usage, insufficient cryptography).
4. **Abuse/red-team testing of the AI moderation system itself** — deliberately try to get scam messages past the filter, try to get the AI Coach to give harmful advice, before launch, not after a real incident.
5. **Verification-vendor security review** — confirm the chosen ID-verification vendor (Phase 10) holds relevant certifications (e.g., ISO 27001-class) before integrating, since you inherit their security posture for a very sensitive data category.

---

## PHASE 19 — PERFORMANCE OPTIMIZATION

- **Chat delivery:** target <500ms p95 message delivery — achieved via the WebSocket + Redis pub/sub layer from Phase 15, not polling.
- **Cold start:** target <2s — achieved via lazy-loading non-critical modules (Advice content, Admin-only code paths never bundled into consumer app at all).
- **Image delivery:** CDN-served, responsive image sizes (never ship full-resolution originals to a match-card thumbnail).
- **Database:** indexed on high-frequency query paths (match lookup by user, conversation lookup by participant) — verified via query plan review, not assumed.
- **Explicit non-goal for v1:** Kubernetes-style auto-scaling tuning, multi-region active-active — premature at pre-launch scale (consistent with Phase 15's Kubernetes rejection).

---

## Continuing automatically to Phase 20 — Beta Launch next.
