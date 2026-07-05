import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/verified_badge.dart';

/// Tab 4 → Account: billing, verification status, privacy controls, data
/// export/delete (Phase 7 IA). Data export/delete surfaced prominently to honour
/// the Australian Privacy Act "easy export/delete" requirement (Phase 2 NFRs).
class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return ListView(
      padding: const EdgeInsets.fromLTRB(AppSpacing.screenInset, AppSpacing.sm,
          AppSpacing.screenInset, AppSpacing.xxxl),
      children: [
        Text('Account', style: text.displayMedium),
        const SizedBox(height: AppSpacing.xl),
        Row(
          children: [
            const CircleAvatar(
                radius: 28, backgroundColor: AppColors.bgElevated),
            const SizedBox(width: AppSpacing.lg),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Alex Morgan', style: text.titleLarge),
                  const SizedBox(height: AppSpacing.xs),
                  const VerifiedBadge(),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.xl),
        _PremiumCard(),
        const SizedBox(height: AppSpacing.xl),
        const _Section(title: 'Membership', tiles: [
          _Tile(Icons.workspace_premium_outlined, 'Subscription & billing'),
          _Tile(Icons.verified_user_outlined, 'Verification status'),
        ]),
        const _Section(title: 'Privacy & safety', tiles: [
          _Tile(Icons.visibility_off_outlined, 'Incognito & visibility'),
          _Tile(Icons.place_outlined, 'Location sharing (suburb-level)'),
          _Tile(Icons.fingerprint, 'Biometric app lock'),
        ]),
        const _Section(title: 'Your data', tiles: [
          _Tile(Icons.download_outlined, 'Export my data'),
          _Tile(Icons.delete_outline, 'Delete my account', danger: true),
        ]),
      ],
    );
  }
}

class _PremiumCard extends StatelessWidget {
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
          colors: [Color(0xFF2E2718), Color(0xFF191510)],
        ),
        border: Border.all(color: AppColors.accentGold.withValues(alpha: 0.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Aurelle Premium', style: text.titleLarge),
          const SizedBox(height: AppSpacing.xs),
          Text('Unlimited AI coach, deeper compatibility insights, incognito.',
              style: text.bodySmall),
          const SizedBox(height: AppSpacing.lg),
          FilledButton(onPressed: () {}, child: const Text('See plans')),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.tiles});

  final String title;
  final List<_Tile> tiles;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.sm),
          child: Text(title.toUpperCase(),
              style: text.labelSmall
                  ?.copyWith(letterSpacing: 1, color: AppColors.textSecondary)),
        ),
        Container(
          decoration: BoxDecoration(
            color: AppColors.bgSurface,
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          ),
          child: Column(children: tiles),
        ),
        const SizedBox(height: AppSpacing.xl),
      ],
    );
  }
}

class _Tile extends StatelessWidget {
  const _Tile(this.icon, this.label, {this.danger = false});

  final IconData icon;
  final String label;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    final color = danger ? AppColors.statusAlert : AppColors.textPrimary;
    return ListTile(
      leading: Icon(icon, color: danger ? AppColors.statusAlert : AppColors.accentGold),
      title: Text(label,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: color)),
      trailing:
          const Icon(Icons.chevron_right, color: AppColors.textSecondary, size: 20),
      onTap: () {},
    );
  }
}
