import 'package:flutter/material.dart';

import 'app_colors.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// Central [ThemeData] factory for Aurelle.
///
/// Dark is the primary theme; light is a faithful secondary variant sharing the
/// same type scale, spacing, and component shapes.
abstract final class AppTheme {
  static ThemeData get dark => _build(
        brightness: Brightness.dark,
        bgPrimary: AppColors.bgPrimary,
        bgSurface: AppColors.bgSurface,
        bgElevated: AppColors.bgElevated,
        textPrimary: AppColors.textPrimary,
        textSecondary: AppColors.textSecondary,
        hairline: AppColors.hairline,
      );

  static ThemeData get light => _build(
        brightness: Brightness.light,
        bgPrimary: AppColors.lightBgPrimary,
        bgSurface: AppColors.lightBgSurface,
        bgElevated: AppColors.lightBgElevated,
        textPrimary: AppColors.lightTextPrimary,
        textSecondary: AppColors.lightTextSecondary,
        hairline: AppColors.lightHairline,
      );

  static ThemeData _build({
    required Brightness brightness,
    required Color bgPrimary,
    required Color bgSurface,
    required Color bgElevated,
    required Color textPrimary,
    required Color textSecondary,
    required Color hairline,
  }) {
    final colorScheme = ColorScheme(
      brightness: brightness,
      primary: AppColors.accentGold,
      onPrimary: AppColors.bgPrimary,
      secondary: AppColors.accentViolet,
      onSecondary: AppColors.textPrimary,
      error: AppColors.statusAlert,
      onError: AppColors.textPrimary,
      surface: bgSurface,
      onSurface: textPrimary,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      scaffoldBackgroundColor: bgPrimary,
      colorScheme: colorScheme,
      canvasColor: bgPrimary,
      dividerColor: hairline,
      splashFactory: InkRipple.splashFactory,
      textTheme: AppTypography.textTheme(textPrimary, textSecondary),
      appBarTheme: AppBarTheme(
        backgroundColor: bgPrimary,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        titleTextStyle:
            AppTypography.textTheme(textPrimary, textSecondary).titleLarge,
      ),
      cardTheme: CardThemeData(
        color: bgSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.accentGold,
          foregroundColor: AppColors.bgPrimary,
          minimumSize: const Size.fromHeight(AppSpacing.minTouchTarget + 8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          ),
          textStyle:
              AppTypography.textTheme(textPrimary, textSecondary).labelLarge,
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: bgElevated,
        contentTextStyle:
            AppTypography.textTheme(textPrimary, textSecondary).bodyMedium,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        ),
      ),
    );
  }
}
