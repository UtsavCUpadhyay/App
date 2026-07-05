# Aurelle

**A premium, verification-first dating & relationship-advice ecosystem for Australia.**

Aurelle is positioned against Raya / The League / Inner Circle — not Tinder / Bumble — on four
pillars no incumbent combines: **mandatory identity verification**, **curated compatibility-first
matching** (not an infinite swipe deck), **editorial, dark-native design**, and an integrated
free-to-premium **Advice** product that doubles as the acquisition funnel.

> **Status: foundation / prototype.** This repository contains a real Flutter app foundation
> (design system, architecture, flagship screens with mock data) plus the full product plan. It is
> **not** a shippable product yet — the backend, verification vendor, billing, and AI services are
> deliberately out of scope for this stage. See [`AUDIT.md`](AUDIT.md) and
> [`docs/ROADMAP.md`](docs/ROADMAP.md).

## See it now (no toolchain needed)

Open [`docs/prototype/index.html`](docs/prototype/index.html) in any browser — a clickable,
phone-framed prototype of the flagship screens in the real design system.

## Run the Flutter app

```bash
flutter pub get
flutter run          # dark-mode-first; try an iOS/Android device or simulator
flutter test         # unit + widget tests
flutter analyze      # lints (analysis_options.yaml)
```

Requires Flutter ≥ 3.27 / Dart ≥ 3.6.

## Backend API

A runnable, tested backend lives in [`backend/`](backend/) — a Fastify + TypeScript modular monolith
(Phase 15) that enforces the **hard verification gate server-side** (verify before browsing), the
18+ age gate, and age-tiered Advice. It runs with no database (in-memory repositories behind the same
interfaces a Postgres layer will implement) and ships 11 passing integration tests.

```bash
cd backend && npm install && npm test && npm start
```

## Architecture at a glance

Feature-first, Riverpod for state/DI, repository pattern (Phase 14). Full write-up in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

```
lib/
├── core/
│   ├── theme/      # Phase 11 design tokens: colors, typography, spacing, ThemeData
│   └── widgets/    # reusable: glass surface, verified seal, pills, skeletons
└── features/
    ├── onboarding/ # mandatory ID + liveness verification gate
    ├── dating/
    │   ├── matches/  # today's curated matches (one card, not a deck)
    │   ├── chat/     # messaging + contextual AI safety banner
    │   └── safety/   # Safety Center (reachable in ≤2 taps)
    ├── advice/       # evidence-based content + AI coach entry point
    ├── account/      # billing, privacy, data export/delete
    └── shell/        # root tab shell
```

## Documentation

- [`AUDIT.md`](AUDIT.md) — project audit, plan strengths, gaps & risks
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — client architecture & conventions
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — honest build sequence from here to launch
- [`docs/adr/`](docs/adr/) — architecture decision records (e.g. Fastify vs. NestJS)
- [`docs/launch/`](docs/launch/) — App Store / Play dating-app compliance checklist
- [`docs/legal/`](docs/legal/) — privacy policy & terms draft templates (need legal review)
- [`docs/planning/`](docs/planning/) — the full 25-phase product/strategy package

## License

Proprietary — all rights reserved.
