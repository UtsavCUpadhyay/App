import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

/// The Aurelle verification seal — a single, consistent iconographic mark
/// (a subtle four-point seal, not a generic checkmark) reinforcing the
/// "exclusive club" positioning. Trust is visualized in-context (Phase 11).
class VerifiedBadge extends StatelessWidget {
  const VerifiedBadge({super.key, this.label = 'Verified', this.compact = false});

  final String label;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final seal = CustomPaint(
      size: const Size(14, 14),
      painter: _SealPainter(),
    );

    if (compact) return seal;

    return Container(
      padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md, vertical: AppSpacing.xs + 1),
      decoration: BoxDecoration(
        color: AppColors.bgElevated.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          seal,
          const SizedBox(width: AppSpacing.xs + 2),
          Text(
            label,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: AppColors.statusSafety,
                  fontWeight: FontWeight.w600,
                ),
          ),
        ],
      ),
    );
  }
}

class _SealPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final c = Offset(size.width / 2, size.height / 2);
    final paint = Paint()..color = AppColors.accentGold;
    // A four-point star / seal motif.
    final path = Path();
    final r = size.width / 2;
    final inner = r * 0.38;
    for (var i = 0; i < 8; i++) {
      final isPoint = i.isEven;
      final radius = isPoint ? r : inner;
      // Start at the top point (-90°) so the seal sits upright.
      final angle = (i * 45 - 90) * math.pi / 180;
      final p =
          Offset(c.dx + radius * math.cos(angle), c.dy + radius * math.sin(angle));
      i == 0 ? path.moveTo(p.dx, p.dy) : path.lineTo(p.dx, p.dy);
    }
    path.close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
