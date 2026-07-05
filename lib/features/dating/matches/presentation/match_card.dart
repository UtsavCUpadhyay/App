import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/glass_container.dart';
import '../../../../core/widgets/verified_badge.dart';
import '../domain/match.dart';

/// The hero match card — one match at a time (NOT a swipe deck), reinforcing
/// the "curated, not endless" brand promise architecturally (Phase 12).
class MatchCard extends StatelessWidget {
  const MatchCard({
    super.key,
    required this.match,
    required this.onViewProfile,
    required this.onSayHello,
  });

  final Match match;
  final VoidCallback onViewProfile;
  final VoidCallback onSayHello;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AspectRatio(
          aspectRatio: 0.82,
          child: Semantics(
            label:
                '${match.name}, ${match.age}, ${match.location}. ${match.compatibility} percent compatible.',
            child: DecoratedBox(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: match.gradient,
                ),
              ),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  // Scrim so text stays legible over imagery.
                  DecoratedBox(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
                      gradient: const LinearGradient(
                        begin: Alignment.center,
                        end: Alignment.bottomCenter,
                        colors: [Colors.transparent, Color(0xF20B0B0F)],
                      ),
                    ),
                  ),
                  if (match.verified)
                    const Positioned(
                      top: AppSpacing.lg,
                      left: AppSpacing.lg,
                      child: VerifiedBadge(),
                    ),
                  Positioned(
                    left: AppSpacing.xl,
                    right: AppSpacing.xl,
                    bottom: AppSpacing.xl,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('${match.name}, ${match.age}',
                            style: text.headlineMedium),
                        const SizedBox(height: AppSpacing.xs),
                        Text('${match.location} · ${match.headline}',
                            style: text.bodyMedium),
                        const SizedBox(height: AppSpacing.md),
                        Wrap(
                          spacing: AppSpacing.sm,
                          runSpacing: AppSpacing.sm,
                          children: [
                            GlassContainer(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: AppSpacing.md,
                                  vertical: AppSpacing.xs + 1),
                              borderRadius: AppSpacing.radiusPill,
                              child: Text('${match.compatibility}% compatible',
                                  style: text.labelSmall?.copyWith(
                                      color: AppColors.accentGold,
                                      fontWeight: FontWeight.w600)),
                            ),
                            if (match.highlights.isNotEmpty)
                              GlassContainer(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: AppSpacing.md,
                                    vertical: AppSpacing.xs + 1),
                                borderRadius: AppSpacing.radiusPill,
                                child: Text(match.highlights.first,
                                    style: text.labelSmall),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: onViewProfile,
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.textSecondary,
                  side: const BorderSide(color: AppColors.hairline),
                  minimumSize: const Size.fromHeight(52),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                  ),
                ),
                child: const Text('View Profile'),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: FilledButton(
                onPressed: onSayHello,
                child: const Text('Say Hello'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
