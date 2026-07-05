import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/skeleton.dart';
import '../domain/matches_repository.dart';
import '../../chat/presentation/chat_screen.dart';
import 'match_card.dart';

/// Tab 1 → "Today's Curated Matches" (Phase 7 IA / Phase 12 wireframe).
class MatchesScreen extends ConsumerWidget {
  const MatchesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final matchesAsync = ref.watch(todaysMatchesProvider);
    final text = Theme.of(context).textTheme;

    return RefreshIndicator(
      color: AppColors.accentGold,
      backgroundColor: AppColors.bgSurface,
      onRefresh: () async => ref.refresh(todaysMatchesProvider.future),
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(AppSpacing.screenInset, AppSpacing.sm,
            AppSpacing.screenInset, AppSpacing.xxxl),
        children: [
          Text("Today's Matches", style: text.displayMedium),
          const SizedBox(height: AppSpacing.xs),
          matchesAsync.when(
            data: (matches) => Text(
              '${matches.length} curated for you, based on compatibility',
              style: text.bodyMedium,
            ),
            loading: () =>
                Text('Curating your matches…', style: text.bodyMedium),
            error: (_, __) => const SizedBox.shrink(),
          ),
          const SizedBox(height: AppSpacing.xl),
          matchesAsync.when(
            loading: () => const _MatchesSkeleton(),
            error: (err, _) => _ErrorState(
              onRetry: () => ref.invalidate(todaysMatchesProvider),
            ),
            data: (matches) {
              if (matches.isEmpty) return const _EmptyState();
              return Column(
                children: [
                  for (var i = 0; i < matches.length; i++) ...[
                    MatchCard(
                      match: matches[i],
                      onViewProfile: () {},
                      onSayHello: () => Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => ChatScreen(matchName: matches[i].name),
                        ),
                      ),
                    ),
                    if (i != matches.length - 1)
                      const SizedBox(height: AppSpacing.xxl),
                  ],
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}

class _MatchesSkeleton extends StatelessWidget {
  const _MatchesSkeleton();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        AspectRatio(
          aspectRatio: 0.82,
          child: Skeleton(height: double.infinity, radius: AppSpacing.radiusLg),
        ),
        const SizedBox(height: AppSpacing.lg),
        Row(
          children: const [
            Expanded(child: Skeleton(height: 52, radius: AppSpacing.radiusMd)),
            SizedBox(width: AppSpacing.md),
            Expanded(child: Skeleton(height: 52, radius: AppSpacing.radiusMd)),
          ],
        ),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.xxxl),
      child: Column(
        children: [
          const Icon(Icons.auto_awesome_outlined,
              color: AppColors.textSecondary, size: 40),
          const SizedBox(height: AppSpacing.lg),
          Text('No matches yet today', style: text.titleLarge),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'We curate a fresh, quality-scored selection each morning.\nCheck back soon.',
            textAlign: TextAlign.center,
            style: text.bodyMedium,
          ),
        ],
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.xxxl),
      child: Column(
        children: [
          const Icon(Icons.cloud_off_outlined,
              color: AppColors.statusAlert, size: 40),
          const SizedBox(height: AppSpacing.lg),
          Text('Couldn’t load your matches', style: text.titleLarge),
          const SizedBox(height: AppSpacing.sm),
          Text('Check your connection and try again.',
              textAlign: TextAlign.center, style: text.bodyMedium),
          const SizedBox(height: AppSpacing.lg),
          OutlinedButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}
