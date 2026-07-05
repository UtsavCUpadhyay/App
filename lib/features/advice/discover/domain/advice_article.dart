import 'package:flutter/foundation.dart';

/// Audience segments for the Advice product (Phase 7 IA).
enum AdviceAudience { all, men, women, lgbtq, lifeStage }

extension AdviceAudienceLabel on AdviceAudience {
  String get label => switch (this) {
        AdviceAudience.all => 'For You',
        AdviceAudience.men => 'Men',
        AdviceAudience.women => 'Women',
        AdviceAudience.lgbtq => 'LGBTQ+',
        AdviceAudience.lifeStage => 'Life Stage',
      };
}

@immutable
class AdviceArticle {
  const AdviceArticle({
    required this.id,
    required this.title,
    required this.readMinutes,
    required this.category,
    required this.audience,
    this.featured = false,
  });

  final String id;
  final String title;
  final int readMinutes;
  final String category;
  final AdviceAudience audience;
  final bool featured;
}
