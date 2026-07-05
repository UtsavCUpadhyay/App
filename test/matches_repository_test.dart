import 'package:aurelle/features/dating/matches/domain/matches_repository.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('MockMatchesRepository', () {
    test('returns a curated, non-empty list of verified matches', () async {
      const repo = MockMatchesRepository();

      final matches = await repo.todaysMatches();

      expect(matches, isNotEmpty);
      // Brand promise: 100% verified user base.
      expect(matches.every((m) => m.verified), isTrue);
      // Curated, not endless — a small daily set.
      expect(matches.length, lessThanOrEqualTo(5));
      // Compatibility is surfaced transparently as a 0–100 score.
      expect(
        matches.every((m) => m.compatibility >= 0 && m.compatibility <= 100),
        isTrue,
      );
    });
  });
}
