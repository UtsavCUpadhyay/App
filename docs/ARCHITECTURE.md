# Architecture & Conventions

This document explains _how_ the Aurelle Flutter client is structured and _why_, so a new engineer
(or agency) can be productive on day one. It implements the decisions from `docs/planning/`
(Phases 11, 14, 15).

## Principles

1. **Feature-first, not layer-first.** Top-level folders are features (`dating`, `advice`,
   `onboarding`, `account`), not `models/`/`views/`/`controllers/`. This keeps Dating and Advice
   cleanly separable — reinforcing the Phase 7 IA decision that they are independent products
   sharing one shell, and makes it trivial to later spin Advice out as its own app.
2. **Repository pattern for all data.** Presentation never talks to a data source directly. It talks
   to a repository _interface_; the implementation (mock now, networked later) is injected. See
   `features/dating/matches/domain/matches_repository.dart` for the reference pattern.
3. **Dependency injection via Riverpod.** `ProviderScope` in `main.dart` is the composition root.
   Swap implementations by overriding a `Provider` — no service locator, no globals.
4. **Design tokens, never raw values.** Feature code references `AppColors`, `AppSpacing`,
   `AppTypography` — never a hex string or a magic padding number. Changing a token restyles the app.
5. **Every state is designed.** Loading (skeletons), empty, and error states are first-class, not
   afterthoughts — see `matches_screen.dart`.

## Layers within a feature

```
features/<feature>/
├── domain/          # entities + repository interfaces + Riverpod providers (no Flutter UI)
└── presentation/    # screens + widgets (depend on domain, never the reverse)
```

`core/` holds cross-feature primitives: the theme system and shared widgets. `core` never imports
from `features`.

## State management

- **Riverpod** (Phase 14 recommendation: compile-safe, testable, great async/streaming for chat).
- Async data uses `FutureProvider`/`AsyncValue` with `.when(data/loading/error)` so every screen
  handles all three states explicitly (see `matches_screen.dart`).
- Local ephemeral UI state (e.g. the verification checklist, chat composer) stays in
  `StatefulWidget`s — Riverpod is reserved for shared/injected state, not every toggle.

## Design system (`core/theme/`)

| File | Responsibility |
|---|---|
| `app_colors.dart` | Phase 11 color tokens (dark primary + light variant) |
| `app_typography.dart` | Fraunces (display/serif) + Inter (body) type scale via `google_fonts` |
| `app_spacing.dart` | 4pt spacing scale, radii, min touch target |
| `app_theme.dart` | Assembles tokens into Material 3 `ThemeData` (dark + light) |

## Accessibility (Phase 11 / WCAG 2.1 AA)

- Interactive targets ≥ 44pt (`AppSpacing.minTouchTarget`, enforced in button themes).
- `Semantics` on custom composites (match card, pills).
- Reduced-motion / reduced-transparency respected in `Skeleton` and `GlassContainer`
  (`MediaQuery.disableAnimations`).
- Dynamic type flows through the Material `TextTheme`.

## Testing

- **Unit** — business/domain invariants (`test/matches_repository_test.dart`).
- **Widget** — critical-flow behaviour (`test/verification_screen_test.dart` proves the gate blocks
  until both steps complete).
- Next up (see roadmap): integration test for onboarding → match → chat, and golden tests for the
  design system.

## Conventions

- `abstract final class` for token/util namespaces (no instantiation).
- `withValues(alpha:)` (not the deprecated `withOpacity`).
- Trailing commas everywhere (enforced by `analysis_options.yaml`) for clean diffs & formatting.
- Doc comments (`///`) on every public class explaining its role and the phase decision behind it.

## Where the backend plugs in

Each `*Repository` interface is the seam. To go live you implement a networked repository against
the NestJS API (Phase 15) and override the corresponding provider in the composition root — no
presentation-layer changes. The same seam makes every screen testable with fake data today.
