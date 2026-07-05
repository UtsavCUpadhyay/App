import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Aurelle type system (Phase 11).
///
/// - Display / headlines use **Fraunces** (a high-contrast serif) to signal an
///   editorial, private-members-club feel — distinct from every competitor's
///   rounded-sans branding.
/// - Body / UI uses **Inter** for legibility and a native feel.
///
/// A strict scale (5 sizes) enforces the "restraint" principle.
abstract final class AppTypography {
  static TextStyle _serif(double size, FontWeight weight, Color color,
          {double? height, double? letterSpacing}) =>
      GoogleFonts.fraunces(
        fontSize: size,
        fontWeight: weight,
        color: color,
        height: height,
        letterSpacing: letterSpacing,
      );

  static TextStyle _sans(double size, FontWeight weight, Color color,
          {double? height, double? letterSpacing}) =>
      GoogleFonts.inter(
        fontSize: size,
        fontWeight: weight,
        color: color,
        height: height,
        letterSpacing: letterSpacing,
      );

  /// Builds a Material [TextTheme] from the scale, tinted for [textPrimary].
  static TextTheme textTheme(Color textPrimary, Color textSecondary) {
    return TextTheme(
      // Display — Fraunces serif
      displayLarge: _serif(34, FontWeight.w600, textPrimary, height: 1.1),
      displayMedium: _serif(28, FontWeight.w600, textPrimary, height: 1.15),
      headlineMedium: _serif(24, FontWeight.w600, textPrimary, height: 1.2),
      titleLarge: _serif(20, FontWeight.w500, textPrimary, height: 1.25),
      // Body / UI — Inter sans
      titleMedium: _sans(16, FontWeight.w600, textPrimary, height: 1.3),
      bodyLarge: _sans(16, FontWeight.w400, textPrimary, height: 1.5),
      bodyMedium: _sans(14, FontWeight.w400, textSecondary, height: 1.5),
      bodySmall: _sans(13, FontWeight.w400, textSecondary, height: 1.4),
      labelLarge: _sans(14, FontWeight.w600, textPrimary,
          letterSpacing: 0.2, height: 1.2),
      labelSmall: _sans(12, FontWeight.w500, textSecondary,
          letterSpacing: 0.4, height: 1.2),
    );
  }
}
