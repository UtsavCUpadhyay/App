import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/pill.dart';
import '../domain/advice_article.dart';

/// Tab 2 → Advice "Discover" (Phase 12 wireframe screen 4).
///
/// Advice uses the violet accent to distinguish it from Dating (gold) while
/// staying in-family. Data is privacy-isolated from the dating profile per the
/// Phase 7 IA decision.
class AdviceScreen extends StatefulWidget {
  const AdviceScreen({super.key});

  @override
  State<AdviceScreen> createState() => _AdviceScreenState();
}

class _AdviceScreenState extends State<AdviceScreen> {
  AdviceAudience _audience = AdviceAudience.all;

  static const _articles = <AdviceArticle>[
    AdviceArticle(
      id: 'a1',
      title: 'How to spot secure vs. anxious attachment early',
      readMinutes: 6,
      category: 'Attachment',
      audience: AdviceAudience.all,
      featured: true,
    ),
    AdviceArticle(
      id: 'a2',
      title: 'Dating again after divorce: the first 30 days',
      readMinutes: 8,
      category: 'Life Stage',
      audience: AdviceAudience.lifeStage,
    ),
    AdviceArticle(
      id: 'a3',
      title: 'Communicating boundaries without conflict',
      readMinutes: 5,
      category: 'Communication',
      audience: AdviceAudience.women,
    ),
    AdviceArticle(
      id: 'a4',
      title: 'Building a safe, affirming first date checklist',
      readMinutes: 4,
      category: 'Safety',
      audience: AdviceAudience.lgbtq,
    ),
    AdviceArticle(
      id: 'a5',
      title: 'Beating swipe fatigue: dating with intention',
      readMinutes: 7,
      category: 'Mindset',
      audience: AdviceAudience.men,
    ),
  ];

  List<AdviceArticle> get _filtered => _audience == AdviceAudience.all
      ? _articles
      : _articles
          .where((a) =>
              a.audience == _audience || a.audience == AdviceAudience.all)
          .toList();

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final featured = _filtered.where((a) => a.featured).toList();
    final rest = _filtered.where((a) => !a.featured).toList();

    return ListView(
      padding: const EdgeInsets.fromLTRB(AppSpacing.screenInset, AppSpacing.sm,
          AppSpacing.screenInset, AppSpacing.xxxl),
      children: [
        Text('Advice', style: text.displayMedium),
        const SizedBox(height: AppSpacing.xs),
        Text('Evidence-based guidance. Private from your dating profile.',
            style: text.bodyMedium),
        const SizedBox(height: AppSpacing.lg),
        // AI Coach entry point — persistent, not buried.
        _AiCoachCard(),
        const SizedBox(height: AppSpacing.xl),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              for (final a in AdviceAudience.values) ...[
                Pill(
                  label: a.label,
                  selected: _audience == a,
                  accent: AppColors.accentViolet,
                  onTap: () => setState(() => _audience = a),
                ),
                const SizedBox(width: AppSpacing.sm),
              ],
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.xl),
        for (final a in featured) ...[
          _FeaturedArticleCard(article: a),
          const SizedBox(height: AppSpacing.lg),
        ],
        for (final a in rest) ...[
          _ArticleRow(article: a),
          const SizedBox(height: AppSpacing.md),
        ],
      ],
    );
  }
}

class _AiCoachCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Container(
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF2A2540), Color(0xFF1A1826)],
        ),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.accentViolet.withValues(alpha: 0.18),
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            ),
            child: const Icon(Icons.auto_awesome, color: AppColors.accentViolet),
          ),
          const SizedBox(width: AppSpacing.lg),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Ask the AI Coach', style: text.titleMedium),
                const SizedBox(height: 2),
                Text('Judgment-free, evidence-based answers',
                    style: text.bodySmall),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: AppColors.textSecondary),
        ],
      ),
    );
  }
}

class _FeaturedArticleCard extends StatelessWidget {
  const _FeaturedArticleCard({required this.article});

  final AdviceArticle article;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Container(
      height: 200,
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF221F2E), Color(0xFF14131B)],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Pill(label: article.category, accent: AppColors.accentViolet),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(article.title, style: text.titleLarge),
              const SizedBox(height: AppSpacing.sm),
              Text('${article.readMinutes} min read', style: text.bodySmall),
            ],
          ),
        ],
      ),
    );
  }
}

class _ArticleRow extends StatelessWidget {
  const _ArticleRow({required this.article});

  final AdviceArticle article;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.bgSurface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(article.category.toUpperCase(),
                    style: text.labelSmall
                        ?.copyWith(color: AppColors.accentViolet)),
                const SizedBox(height: AppSpacing.xs),
                Text(article.title, style: text.titleMedium),
                const SizedBox(height: AppSpacing.xs),
                Text('${article.readMinutes} min read', style: text.bodySmall),
              ],
            ),
          ),
          const Icon(Icons.bookmark_border, color: AppColors.textSecondary),
        ],
      ),
    );
  }
}
