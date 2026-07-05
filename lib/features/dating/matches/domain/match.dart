import 'package:flutter/material.dart';

/// A curated daily match (Phase 7 IA: "Today's Curated Matches").
///
/// Deliberately models *compatibility* rather than swipe mechanics — the brand
/// wedge is quality-scored curation, not an infinite deck.
@immutable
class Match {
  const Match({
    required this.id,
    required this.name,
    required this.age,
    required this.location,
    required this.headline,
    required this.compatibility,
    required this.highlights,
    required this.verified,
    required this.gradient,
  });

  final String id;
  final String name;
  final int age;
  final String location;
  final String headline;

  /// 0–100 compatibility score surfaced to the user for transparency.
  final int compatibility;

  /// Short, human-readable reasons this match was curated (max ~3).
  final List<String> highlights;
  final bool verified;

  /// Placeholder gradient stand-in for a profile photo (no network assets in
  /// the prototype). Real build replaces this with a cached, EXIF-stripped image.
  final List<Color> gradient;
}
