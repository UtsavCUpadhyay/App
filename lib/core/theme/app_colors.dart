import 'package:flutter/material.dart';

/// Aurelle color system (Phase 11 design tokens).
///
/// Dark-mode-first: the app is designed dark-native, with a light theme as a
/// secondary variant. Every token has a semantic name — never reference raw
/// hex values in feature code, always go through [AppColors].
abstract final class AppColors {
  // ── Dark theme (primary) ────────────────────────────────────────────────
  /// App background — near-black charcoal.
  static const Color bgPrimary = Color(0xFF0B0B0F);

  /// Cards and sheets.
  static const Color bgSurface = Color(0xFF16161C);

  /// Modals and premium (glass) surfaces.
  static const Color bgElevated = Color(0xFF1F1F28);

  /// Primary CTA, verified badge, premium accents — muted champagne gold.
  static const Color accentGold = Color(0xFFC9A66B);

  /// Secondary highlights and the Advice product accent — soft violet.
  static const Color accentViolet = Color(0xFF7C6FF0);

  /// Primary text — warm off-white.
  static const Color textPrimary = Color(0xFFF5F3EE);

  /// Secondary / meta text.
  static const Color textSecondary = Color(0xFFA8A6B3);

  /// Verified / safe indicators — muted sage green.
  static const Color statusSafety = Color(0xFF4CAF7D);

  /// Reports and warnings — desaturated red, to stay premium in warning states.
  static const Color statusAlert = Color(0xFFD9695F);

  /// Hairline dividers and glass borders.
  static const Color hairline = Color(0x14FFFFFF); // white @ 8%

  // ── Light theme (secondary variant) ─────────────────────────────────────
  static const Color lightBgPrimary = Color(0xFFFAF8F3);
  static const Color lightBgSurface = Color(0xFFFFFFFF);
  static const Color lightBgElevated = Color(0xFFF2EEE6);
  static const Color lightTextPrimary = Color(0xFF1A1820);
  static const Color lightTextSecondary = Color(0xFF6B6875);
  static const Color lightHairline = Color(0x14000000);
}
