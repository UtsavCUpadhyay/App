import 'package:flutter/widgets.dart';

/// Spacing and radius scale (Phase 11: "luxury reads as negative space").
///
/// A strict 4pt-based scale enforces restraint — feature code should compose
/// layouts from these constants rather than inventing arbitrary padding.
abstract final class AppSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 24;
  static const double xxl = 32;
  static const double xxxl = 48;

  /// Standard screen horizontal inset.
  static const double screenInset = 24;

  // Corner radii — consistent 16–20px, subtle elevation over heavy borders.
  static const double radiusSm = 12;
  static const double radiusMd = 16;
  static const double radiusLg = 20;
  static const double radiusPill = 999;

  /// Minimum interactive touch target (WCAG 2.1 AA / Phase 11 accessibility).
  static const double minTouchTarget = 44;
}

/// Convenience gap widgets to avoid `SizedBox(height: ...)` noise in layouts.
abstract final class Gap {
  static const Widget xs = SizedBox(height: AppSpacing.xs, width: AppSpacing.xs);
  static const Widget sm = SizedBox(height: AppSpacing.sm, width: AppSpacing.sm);
  static const Widget md = SizedBox(height: AppSpacing.md, width: AppSpacing.md);
  static const Widget lg = SizedBox(height: AppSpacing.lg, width: AppSpacing.lg);
  static const Widget xl = SizedBox(height: AppSpacing.xl, width: AppSpacing.xl);
  static const Widget xxl =
      SizedBox(height: AppSpacing.xxl, width: AppSpacing.xxl);
}
