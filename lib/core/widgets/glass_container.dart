import 'dart:ui';

import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

/// A frosted-glass surface used sparingly for premium moments (Phase 11):
/// upsell sheets, verification success, chips on imagery.
///
/// Respects [MediaQuery.disableAnimations]/reduced-transparency by falling back
/// to a solid elevated surface when the platform requests less blur.
class GlassContainer extends StatelessWidget {
  const GlassContainer({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(AppSpacing.lg),
    this.borderRadius = AppSpacing.radiusMd,
    this.blur = 16,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final double borderRadius;
  final double blur;

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(borderRadius);
    final reduceTransparency =
        MediaQuery.maybeOf(context)?.disableAnimations ?? false;

    final decorated = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: reduceTransparency
            ? AppColors.bgElevated
            : AppColors.bgElevated.withValues(alpha: 0.6),
        borderRadius: radius,
        border: Border.all(color: AppColors.hairline),
      ),
      child: child,
    );

    if (reduceTransparency) return ClipRRect(borderRadius: radius, child: decorated);

    return ClipRRect(
      borderRadius: radius,
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: decorated,
      ),
    );
  }
}
