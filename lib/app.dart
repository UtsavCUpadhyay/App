import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';
import 'features/onboarding/presentation/verification_screen.dart';
import 'features/shell/app_shell.dart';

/// Root application widget.
///
/// Drives the top-level flow: the mandatory verification gate precedes the tab
/// shell (Phase 7 IA: verification is a hard gate inside onboarding, not a
/// settings toggle). Real build replaces this local flag with auth/session
/// state from the security layer.
class AurelleApp extends StatefulWidget {
  const AurelleApp({super.key});

  @override
  State<AurelleApp> createState() => _AurelleAppState();
}

class _AurelleAppState extends State<AurelleApp> {
  bool _verified = false;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Aurelle',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: ThemeMode.dark, // dark-mode-first (Phase 11)
      home: _verified
          ? const AppShell()
          : VerificationScreen(
              onVerified: () => setState(() => _verified = true),
            ),
    );
  }
}
