import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'match.dart';

/// Repository abstraction for curated matches (repository pattern, Phase 14).
///
/// The prototype ships an in-memory implementation; the production build swaps
/// this for a networked implementation behind the same interface without any
/// change to the presentation layer.
abstract interface class MatchesRepository {
  Future<List<Match>> todaysMatches();
}

class MockMatchesRepository implements MatchesRepository {
  const MockMatchesRepository();

  @override
  Future<List<Match>> todaysMatches() async {
    // Simulate network latency so skeleton loaders are exercised.
    await Future<void>.delayed(const Duration(milliseconds: 650));
    return const [
      Match(
        id: 'm1',
        name: 'Charlotte',
        age: 29,
        location: 'Sydney',
        headline: 'Design Director',
        compatibility: 92,
        highlights: ['Shared values', 'Both want long-term', 'Loves the coast'],
        verified: true,
        gradient: [Color(0xFF2B2733), Color(0xFF1A1820)],
      ),
      Match(
        id: 'm2',
        name: 'Priya',
        age: 31,
        location: 'Melbourne',
        headline: 'Paediatric Registrar',
        compatibility: 88,
        highlights: ['Aligned on family', 'Both early risers', 'Weekend hikers'],
        verified: true,
        gradient: [Color(0xFF2A2630), Color(0xFF191721)],
      ),
      Match(
        id: 'm3',
        name: 'James',
        age: 34,
        location: 'Brisbane',
        headline: 'Architect',
        compatibility: 85,
        highlights: ['Shared humour', 'Both love live music', 'Career-driven'],
        verified: true,
        gradient: [Color(0xFF2C2732), Color(0xFF1B1822)],
      ),
    ];
  }
}

/// DI entry point — override in tests or in the production composition root.
final matchesRepositoryProvider = Provider<MatchesRepository>(
  (ref) => const MockMatchesRepository(),
);

/// Async view-model for the matches screen.
final todaysMatchesProvider = FutureProvider<List<Match>>((ref) {
  return ref.watch(matchesRepositoryProvider).todaysMatches();
});
