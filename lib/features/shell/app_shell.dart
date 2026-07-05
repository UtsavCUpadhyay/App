import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../account/presentation/account_screen.dart';
import '../advice/discover/presentation/advice_screen.dart';
import '../dating/matches/presentation/matches_screen.dart';
import '../dating/safety/presentation/safety_center_sheet.dart';

/// Root tab shell (Phase 7 IA: Dating · Advice · Notifications · Account).
///
/// A Dating/Advice segmented control lives in the header of the first tab, per
/// the high-fidelity mockup; the bottom bar handles top-level navigation.
class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _index = 0;

  static const _titles = ['Aurelle', 'Advice', 'Notifications', 'Account'];

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final showSafety = _index == 0;

    return Scaffold(
      appBar: AppBar(
        title: Text(_titles[_index],
            style: text.titleLarge?.copyWith(color: AppColors.accentGold)),
        actions: [
          if (showSafety)
            IconButton(
              tooltip: 'Safety Center',
              icon: const Icon(Icons.shield_outlined,
                  color: AppColors.accentGold),
              onPressed: () => showSafetyCenter(context),
            ),
          const SizedBox(width: AppSpacing.sm),
        ],
      ),
      body: IndexedStack(
        index: _index,
        children: const [
          MatchesScreen(),
          AdviceScreen(),
          _NotificationsPlaceholder(),
          AccountScreen(),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        backgroundColor: AppColors.bgSurface,
        indicatorColor: AppColors.accentGold.withValues(alpha: 0.18),
        destinations: const [
          NavigationDestination(
              icon: Icon(Icons.favorite_border),
              selectedIcon: Icon(Icons.favorite, color: AppColors.accentGold),
              label: 'Dating'),
          NavigationDestination(
              icon: Icon(Icons.menu_book_outlined),
              selectedIcon: Icon(Icons.menu_book, color: AppColors.accentViolet),
              label: 'Advice'),
          NavigationDestination(
              icon: Icon(Icons.notifications_none),
              selectedIcon:
                  Icon(Icons.notifications, color: AppColors.accentGold),
              label: 'Alerts'),
          NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person, color: AppColors.accentGold),
              label: 'Account'),
        ],
      ),
    );
  }
}

class _NotificationsPlaceholder extends StatelessWidget {
  const _NotificationsPlaceholder();

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.notifications_none,
              color: AppColors.textSecondary, size: 40),
          const SizedBox(height: AppSpacing.lg),
          Text('You’re all caught up', style: text.titleLarge),
          const SizedBox(height: AppSpacing.sm),
          Text('New matches and messages will appear here.',
              style: text.bodyMedium),
        ],
      ),
    );
  }
}
