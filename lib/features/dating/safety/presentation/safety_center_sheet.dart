import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';

/// Presents the Safety Center (Phase 12 wireframe screen 5).
///
/// Reachable in ≤2 taps from anywhere in the Dating tab, per the IA decision
/// that safety must never be buried in settings.
Future<void> showSafetyCenter(BuildContext context, {String? matchName}) {
  return showModalBottomSheet<void>(
    context: context,
    backgroundColor: AppColors.bgSurface,
    showDragHandle: true,
    isScrollControlled: true,
    shape: const RoundedRectangleBorder(
      borderRadius:
          BorderRadius.vertical(top: Radius.circular(AppSpacing.radiusLg)),
    ),
    builder: (context) => SafetyCenterSheet(matchName: matchName),
  );
}

class SafetyCenterSheet extends StatelessWidget {
  const SafetyCenterSheet({super.key, this.matchName});

  final String? matchName;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(AppSpacing.xl, 0, AppSpacing.xl,
            AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Safety Center', style: text.headlineMedium),
            const SizedBox(height: AppSpacing.xs),
            Text('Your safety is always one tap away.', style: text.bodyMedium),
            const SizedBox(height: AppSpacing.xl),
            // Panic action — prominent, top.
            _SafetyAction(
              icon: Icons.emergency_share_outlined,
              title: 'Emergency — share my location',
              subtitle: 'Alerts your emergency contact with your live location',
              tone: _Tone.alert,
              onTap: () => _confirm(context, 'Emergency contact notified'),
            ),
            const SizedBox(height: AppSpacing.md),
            _SafetyAction(
              icon: Icons.flag_outlined,
              title: matchName == null ? 'Report a user' : 'Report $matchName',
              subtitle: 'Reviewed by a human moderator, urgent cases < 2 hours',
              onTap: () => _confirm(context, 'Report submitted for review'),
            ),
            const SizedBox(height: AppSpacing.md),
            _SafetyAction(
              icon: Icons.block_outlined,
              title: matchName == null ? 'Block a user' : 'Block $matchName',
              subtitle: 'They can no longer see you or message you',
              onTap: () => _confirm(context, 'User blocked'),
            ),
            const SizedBox(height: AppSpacing.md),
            _SafetyAction(
              icon: Icons.share_outlined,
              title: 'Share my date details',
              subtitle: 'Send who, where and when to a trusted contact',
              onTap: () => _confirm(context, 'Date details shared'),
            ),
            const SizedBox(height: AppSpacing.md),
            _SafetyAction(
              icon: Icons.visibility_off_outlined,
              title: 'Privacy & visibility',
              subtitle: 'Incognito mode, suburb-level location only',
              onTap: () {},
            ),
          ],
        ),
      ),
    );
  }

  void _confirm(BuildContext context, String message) {
    Navigator.of(context).pop();
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }
}

enum _Tone { normal, alert }

class _SafetyAction extends StatelessWidget {
  const _SafetyAction({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.tone = _Tone.normal,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final _Tone tone;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final isAlert = tone == _Tone.alert;
    final accent = isAlert ? AppColors.statusAlert : AppColors.textPrimary;

    return Material(
      color: isAlert
          ? AppColors.statusAlert.withValues(alpha: 0.10)
          : AppColors.bgElevated,
      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Row(
            children: [
              Icon(icon, color: accent),
              const SizedBox(width: AppSpacing.lg),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title,
                        style: text.titleMedium?.copyWith(color: accent)),
                    const SizedBox(height: 2),
                    Text(subtitle, style: text.bodySmall),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right,
                  color: AppColors.textSecondary, size: 20),
            ],
          ),
        ),
      ),
    );
  }
}
