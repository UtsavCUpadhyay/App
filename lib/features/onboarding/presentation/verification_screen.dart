import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/glass_container.dart';

/// Onboarding → Verification Gate (Phase 12 wireframe screen 1).
///
/// Design intent: turn the highest-friction step (mandatory ID + liveness) into
/// a trust-building moment, not a compliance checkbox. The primary CTA stays
/// disabled until both steps are complete.
class VerificationScreen extends StatefulWidget {
  const VerificationScreen({super.key, required this.onVerified});

  final VoidCallback onVerified;

  @override
  State<VerificationScreen> createState() => _VerificationScreenState();
}

class _VerificationScreenState extends State<VerificationScreen> {
  bool _idDone = false;
  bool _selfieDone = false;

  bool get _canContinue => _idDone && _selfieDone;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.screenInset),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Progress indicator: Step 3 of 5.
              Row(
                children: List.generate(5, (i) {
                  final active = i <= 2;
                  return Expanded(
                    child: Container(
                      height: 4,
                      margin: EdgeInsets.only(right: i == 4 ? 0 : AppSpacing.xs),
                      decoration: BoxDecoration(
                        color: active
                            ? AppColors.accentGold
                            : AppColors.bgElevated,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  );
                }),
              ),
              const SizedBox(height: AppSpacing.xl),
              Text('Let’s verify it’s really you', style: text.displayMedium),
              const SizedBox(height: AppSpacing.md),
              Text(
                'Every Aurelle member is identity-verified. It’s a one-time step '
                'that keeps this a space free of fakes, bots and catfish — the '
                'reason you’re here.',
                style: text.bodyMedium,
              ),
              const SizedBox(height: AppSpacing.xl),
              _VerifyStep(
                icon: Icons.badge_outlined,
                title: 'Scan government ID',
                subtitle: 'Encrypted, stored separately, never shown on your profile',
                done: _idDone,
                onTap: () => setState(() => _idDone = true),
              ),
              const SizedBox(height: AppSpacing.md),
              _VerifyStep(
                icon: Icons.face_retouching_natural_outlined,
                title: 'Take a liveness selfie',
                subtitle: 'Confirms you’re a real person, in real time',
                done: _selfieDone,
                onTap: () => setState(() => _selfieDone = true),
              ),
              const Spacer(),
              GlassContainer(
                padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.lg, vertical: AppSpacing.md),
                child: Row(
                  children: [
                    const Icon(Icons.lock_outline,
                        color: AppColors.statusSafety, size: 18),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Text('Why we verify — and how your data is protected',
                          style: text.bodySmall),
                    ),
                    const Icon(Icons.chevron_right,
                        color: AppColors.textSecondary, size: 18),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              FilledButton(
                onPressed: _canContinue ? widget.onVerified : null,
                style: FilledButton.styleFrom(
                  disabledBackgroundColor: AppColors.bgElevated,
                  disabledForegroundColor: AppColors.textSecondary,
                ),
                child: Text(_canContinue ? 'Continue' : 'Complete both steps'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _VerifyStep extends StatelessWidget {
  const _VerifyStep({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.done,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final bool done;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Material(
      color: AppColors.bgSurface,
      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      child: InkWell(
        onTap: done ? null : onTap,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            border: Border.all(
              color: done ? AppColors.statusSafety : AppColors.hairline,
            ),
          ),
          child: Row(
            children: [
              Icon(icon,
                  color: done ? AppColors.statusSafety : AppColors.accentGold),
              const SizedBox(width: AppSpacing.lg),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: text.titleMedium),
                    const SizedBox(height: 2),
                    Text(subtitle, style: text.bodySmall),
                  ],
                ),
              ),
              Icon(
                done ? Icons.check_circle : Icons.arrow_forward_ios,
                color: done ? AppColors.statusSafety : AppColors.textSecondary,
                size: done ? 24 : 16,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
