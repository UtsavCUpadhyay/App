import 'package:aurelle/features/onboarding/presentation/verification_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('verification gate blocks continue until both steps complete',
      (tester) async {
    var verified = false;

    await tester.pumpWidget(MaterialApp(
      home: VerificationScreen(onVerified: () => verified = true),
    ));

    // The gate opens with continue disabled.
    expect(find.text('Complete both steps'), findsOneWidget);

    // Complete only the ID step — still blocked.
    await tester.tap(find.text('Scan government ID'));
    await tester.pump();
    await tester.tap(find.text('Complete both steps'));
    expect(verified, isFalse);

    // Complete the liveness step — now the CTA enables and fires.
    await tester.tap(find.text('Take a liveness selfie'));
    await tester.pump();
    expect(find.text('Continue'), findsOneWidget);
    await tester.tap(find.text('Continue'));
    expect(verified, isTrue);
  });
}
