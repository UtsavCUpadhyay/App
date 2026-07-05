import 'package:flutter/foundation.dart';

enum MessageKind { text, voiceNote, photo }

/// A single conversation message. The `riskFlagged` field drives the contextual
/// AI safety banner (Phase 12 / Phase 16) — surfaced only when a scam/abuse
/// signal is detected, never as a persistent nag.
@immutable
class Message {
  const Message({
    required this.id,
    required this.fromMe,
    required this.kind,
    required this.body,
    required this.time,
    this.voiceSeconds,
    this.riskFlagged = false,
    this.riskReason,
  });

  final String id;
  final bool fromMe;
  final MessageKind kind;
  final String body;
  final String time;
  final int? voiceSeconds;
  final bool riskFlagged;
  final String? riskReason;
}
