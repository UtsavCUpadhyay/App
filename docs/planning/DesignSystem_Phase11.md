
# Phase 11: UI Design System
## Aurelle — Premium Dating Ecosystem

---

## 11.1 Design Principles
1. **Restraint over decoration** — luxury reads as negative space, not ornamentation. Every unnecessary border, icon, or label is removed.
2. **Dark mode first** — designed dark-native, with a light theme as a secondary variant, not the reverse (this is the opposite of most dating apps, and signals premium intent immediately).
3. **Motion with purpose** — animations communicate state changes (match found, message sent, verification approved), never decorative bounce-for-bounce's-sake.
4. **Trust is visualized, not just claimed** — verification badges, safety status, and privacy state are always visible in-context, not buried in settings.

---

## 11.2 Color System

| Token | Value (dark theme) | Usage |
|---|---|---|
| `bg.primary` | `#0B0B0F` near-black charcoal | App background |
| `bg.surface` | `#16161C` | Cards, sheets |
| `bg.elevated` | `#1F1F28` with subtle glass blur | Modals, premium surfaces |
| `accent.primary` | `#C9A66B` muted champagne gold | Primary CTA, verified badge, premium accents |
| `accent.secondary` | `#7C6FF0` soft violet | Secondary highlights, Advice product accent (differentiates the two sections while staying in-family) |
| `text.primary` | `#F5F3EE` warm off-white | Primary text |
| `text.secondary` | `#A8A6B3` | Secondary/meta text |
| `status.safety` | `#4CAF7D` muted sage green | Verified/safe indicators |
| `status.alert` | `#D9695F` muted red | Reports, warnings — desaturated, not alarm-red, to stay premium even in warning states |

**Rationale:** Gold/champagne + near-black is a deliberate departure from every competitor's palette (Tinder red/flame, Bumble yellow, Hinge off-white/black text-only) — signals "private members club" rather than "app," per your brand brief.

## 11.3 Typography
- **Display/Headlines:** A refined serif or high-contrast humanist sans (e.g., a licensed font in the family of Canela/Reckless or a premium Google Fonts alternative like "Fraunces" for budget-conscious v1) — serif touches signal editorial/luxury, distinct from every competitor's rounded sans-only branding.
- **Body/UI:** A clean geometric sans (Inter or SF Pro-equivalent) for legibility and native feel.
- Strict type scale (4–5 sizes max) to enforce restraint.

## 11.4 Component Library (core set for v1)
- Buttons: primary (filled gold), secondary (outline), tertiary (text-only) — no more than 3 button styles system-wide.
- Cards: profile card, match card, message bubble, advice content card — consistent corner radius (16px) and subtle elevation via shadow, not heavy borders.
- Glass surfaces: used sparingly — premium upsell sheets, verification success states — not overused to the point of reducing legibility.
- Verified badge: single consistent iconographic mark (not a generic checkmark — a custom subtle seal motif reinforcing "exclusive club" positioning).
- Empty states, loading states, error states: all designed with the same restraint principle — no cartoonish illustrations, minimal line-art only.

## 11.5 Accessibility Requirements (WCAG 2.1 AA baseline)
- Minimum 4.5:1 contrast for body text even within the dark, muted palette (validated per token above).
- All interactive elements ≥44x44pt touch targets.
- Full VoiceOver/TalkBack support, dynamic type scaling support.
- Motion-reduction respect (`prefers-reduced-motion` equivalent in Flutter) for users with vestibular sensitivity.

---

## Continuing automatically to Phase 12 — Wireframes next.
