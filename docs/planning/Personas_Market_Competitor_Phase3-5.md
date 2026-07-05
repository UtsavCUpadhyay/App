
# Phases 3–5: User Personas, Market Analysis, Competitor Analysis
## Aurelle — Premium Dating Ecosystem (Australia)

---

## PHASE 3 — USER PERSONAS

### Dating Product Personas

**1. "Establishe​d Emma" — 32, Sydney, Marketing Director**
- Tried Hinge and Bumble for 2 years; exhausted by low-effort matches and ghosting.
- Values: verified identity, low volume/high quality, wants matches who are also financially/career established.
- Will pay: $50–80/month if it visibly filters out low-intent users.
- Feature priority: verification badge, compatibility depth over swipe volume, incognito mode for discretion (colleagues/clients might be on the app).

**2. "Cautious Chris" — 38, Melbourne, divorced, father of one**
- Previously catfished on a mainstream app; now deeply distrustful of dating apps.
- Values: safety features, transparent verification, ability to vet before meeting.
- Feature priority: ID verification, panic button/emergency contact sharing, report/block responsiveness, no fake-profile tolerance.

**3. "Ambitious Aisha" — 27, Brisbane, tech professional, LGBTQ+**
- Wants inclusive, safe, non-judgmental space with real depth, not hookup culture.
- Feature priority: inclusive identity/orientation options, strong harassment moderation, community trust signals.

**4. "Time-poor Tom" — 41, Perth, business owner**
- Doesn't want to "manage" an app; wants curated matches delivered, not endless browsing.
- Feature priority: daily curated matches (not infinite swipe), AI dating coach to save time on messaging, lifetime/annual plan appeal.

### Advice Product Personas

**5. "Anxious Anaya" — 24, first serious relationship, seeking guidance on communication/attachment**
- Feature priority: judgment-free AI chat, evidence-based content, privacy (doesn't want this linked to a dating profile).

**6. "Rebuilding Raj" — 45, recently divorced, re-entering dating after 15 years**
- Feature priority: "dating after divorce" content, confidence-building, later funnels into Dating product.

### Persona → Feature Priority Implications
- Verification, safety tooling, and low-noise curated matching outrank flashy AI gimmicks for every persona — this confirms Phase 2's MVP scoping was right to prioritize trust over feature breadth.
- Advice personas skew toward *not* wanting Advice tied visibly to a dating identity — architecturally, Advice usage should be privacy-isolated from Dating profile data even though it's one account/ecosystem.

---

## PHASE 4 — MARKET ANALYSIS (Australia focus)

### Market Size & Behaviour
- Australia's online dating market is a multi-hundred-million-dollar segment; usage skews heavily mobile-first, with Tinder/Bumble/Hinge dominating volume but with well-documented fatigue (Reddit/App Store review patterns consistently cite: low-quality matches, ghosting, catfishing, subscription paywalls that feel punitive rather than premium).
- There is a validated white space for **premium/curated** dating in AU — Inner Circle and The League have UK/US traction but limited deep Australian penetration, and Raya is invite-only/celebrity-skewed, leaving a gap for a *professionally positioned, verification-first, AU-native* premium app.
- Gen Z (18–26) trends: shifting toward "slow dating," authenticity, video-first profiles, distrust of overly-gamified swipe UX — relevant for future roadmap, less central to your initial 25–45 target.
- Millennials (27–41): most willing to pay for quality/safety curation — this is your core wedge segment, consistent with Personas 1–4 above.

### Australian Regulatory Considerations (expanded in later Security/Privacy phase)
- **Privacy Act 1988 + Australian Privacy Principles (APPs):** governs collection/storage/use of ID documents and biometric data — biometric liveness data classified as sensitive information, requiring explicit consent and stricter handling.
- **Online Safety Act 2021:** relevant to harassment/abuse reporting obligations and age-appropriate content for under-18 Advice users.
- **GST:** digital subscription sales to Australian consumers are subject to GST — factored into Business Model phase, not a technical blocker now.

### Revenue Model Benchmarking (industry-informed ranges, not exact competitor figures)
- Premium dating subscriptions in comparable markets typically range AUD $20–90/month depending on tier and duration discounting (annual/lifetime priced to lock in LTV).
- Lifetime memberships work best as a scarcity/anchor tier (limited allocation) rather than an unlimited "buy once" option — protects long-term recurring revenue.

---

## PHASE 5 — COMPETITOR ANALYSIS

| App | Positioning | Strength | Weakness (from user complaints research) | Aurelle's counter |
|---|---|---|---|---|
| Tinder | Mass market, swipe-first | Huge volume, brand recognition | Low quality, bots/scammers, superficial | Verification-first, curated not infinite |
| Bumble | Women-first messaging | Safety framing, brand trust | Ghosting, matches expire pressure, fatigue | No time-pressure gimmicks, quality-scored matches |
| Hinge | "Designed to be deleted", prompts | Good profile depth via prompts | Still swipe-based volume, algorithm opacity complaints | Deeper compatibility layer + prompts, transparent AI insights |
| Raya | Ultra-exclusive, invite-only | Strong exclusivity brand | Inaccessible, celebrity-skewed, opaque approval | Exclusivity via verification not fame/networking |
| The League | Career-focused elite | Curated matching by background | Elitist perception backlash, slow growth | Curation via compatibility, not credential gatekeeping (avoids backlash risk) |
| Inner Circle | Curated, event-based | Community/event feel | Limited AU depth | AU-native launch focus, events flagged as future roadmap |
| eHarmony/OkCupid/Match | Long-form compatibility quizzes | Deep matching data | Dated UX, older-skewing brand | Modern Apple-competitive design + same compatibility rigor |
| Grindr/HER | Community-specific | Strong community trust in niche | Security incidents reported industrywide (data/location) | Location privacy (suburb-level only) as default, not opt-in |
| Luxy/Elite Singles | Luxury/income positioning | Premium brand feel | Perceived as superficial ("rich people app"), income-gatekeeping backlash | Position luxury as *trust & experience*, not income filtering |
| Feeld/Boo/Happn | Niche (open relationships, personality-based, proximity) | Differentiated mechanics | Small niche audiences | Broader premium mainstream positioning with AI-personality depth borrowed from Boo's approach |

### Key Strategic Takeaway
No competitor currently combines **(a)** mandatory hard identity verification, **(b)** curated compatibility-first matching, **(c)** Apple-tier design, and **(d)** an integrated free-to-premium relationship education product as a funnel — that combination is Aurelle's defensible wedge in the Australian market.

---

## Continuing automatically to Phase 6 — Feature Prioritization next.
