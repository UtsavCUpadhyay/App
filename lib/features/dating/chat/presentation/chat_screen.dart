import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/verified_badge.dart';
import '../../safety/presentation/safety_center_sheet.dart';
import '../domain/message.dart';

/// Tab 1 → Conversation view (Phase 12 wireframe screen 3).
///
/// The AI safety banner is *contextual* — it renders inline only next to a
/// message the moderation layer flagged, never as a persistent nag, preserving
/// the premium feel while still delivering the safety promise when it matters.
class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key, required this.matchName});

  final String matchName;

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _controller = TextEditingController();
  final _scroll = ScrollController();

  late final List<Message> _messages = [
    Message(
      id: '1',
      fromMe: false,
      kind: MessageKind.text,
      body: 'Hi! Your profile mentioned you love the coast — favourite beach?',
      time: '09:12',
    ),
    Message(
      id: '2',
      fromMe: true,
      kind: MessageKind.text,
      body: 'Tamarama on a quiet morning. You?',
      time: '09:15',
    ),
    Message(
      id: '3',
      fromMe: false,
      kind: MessageKind.voiceNote,
      body: 'Voice note',
      time: '09:16',
      voiceSeconds: 12,
    ),
    Message(
      id: '4',
      fromMe: false,
      kind: MessageKind.text,
      body: 'This is lovely — could you help me out with a \$200 transfer today?',
      time: '09:18',
      riskFlagged: true,
      riskReason:
          'This message mentions sending money. Aurelle members never ask for '
          'transfers — be cautious and consider reporting.',
    ),
  ];

  @override
  void dispose() {
    _controller.dispose();
    _scroll.dispose();
    super.dispose();
  }

  void _send() {
    final txt = _controller.text.trim();
    if (txt.isEmpty) return;
    setState(() {
      _messages.add(Message(
        id: '${_messages.length + 1}',
        fromMe: true,
        kind: MessageKind.text,
        body: txt,
        time: 'now',
      ));
      _controller.clear();
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(_scroll.position.maxScrollExtent,
            duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: Row(
          children: [
            CircleAvatar(
              radius: 16,
              backgroundColor: AppColors.bgElevated,
              child: Text(widget.matchName.characters.first,
                  style: text.labelLarge),
            ),
            const SizedBox(width: AppSpacing.md),
            Text(widget.matchName, style: text.titleLarge),
            const SizedBox(width: AppSpacing.sm),
            const VerifiedBadge(compact: true),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Safety Center',
            icon: const Icon(Icons.shield_outlined, color: AppColors.accentGold),
            onPressed: () => showSafetyCenter(context, matchName: widget.matchName),
          ),
          const SizedBox(width: AppSpacing.sm),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scroll,
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemCount: _messages.length,
              itemBuilder: (context, i) => _MessageBubble(message: _messages[i]),
            ),
          ),
          _Composer(controller: _controller, onSend: _send),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({required this.message});

  final Message message;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final align = message.fromMe ? Alignment.centerRight : Alignment.centerLeft;
    final bubbleColor =
        message.fromMe ? AppColors.accentGold : AppColors.bgSurface;
    final fg = message.fromMe ? AppColors.bgPrimary : AppColors.textPrimary;

    return Column(
      crossAxisAlignment:
          message.fromMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        Align(
          alignment: align,
          child: Container(
            margin: const EdgeInsets.only(bottom: AppSpacing.xs),
            padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg, vertical: AppSpacing.md),
            constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.72),
            decoration: BoxDecoration(
              color: bubbleColor,
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(AppSpacing.radiusMd),
                topRight: const Radius.circular(AppSpacing.radiusMd),
                bottomLeft: Radius.circular(
                    message.fromMe ? AppSpacing.radiusMd : AppSpacing.xs),
                bottomRight: Radius.circular(
                    message.fromMe ? AppSpacing.xs : AppSpacing.radiusMd),
              ),
            ),
            child: message.kind == MessageKind.voiceNote
                ? _VoiceNote(seconds: message.voiceSeconds ?? 0, color: fg)
                : Text(message.body,
                    style: text.bodyLarge?.copyWith(color: fg)),
          ),
        ),
        if (message.riskFlagged) _SafetyBanner(reason: message.riskReason ?? ''),
        const SizedBox(height: AppSpacing.sm),
      ],
    );
  }
}

class _VoiceNote extends StatelessWidget {
  const _VoiceNote({required this.seconds, required this.color});

  final int seconds;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.play_arrow_rounded, color: color),
        const SizedBox(width: AppSpacing.sm),
        // Static waveform preview.
        Row(
          children: List.generate(14, (i) {
            final heights = [8.0, 14, 20, 12, 22, 10, 18, 24, 12, 16, 9, 20, 13, 7];
            return Container(
              width: 2.5,
              height: heights[i % heights.length],
              margin: const EdgeInsets.symmetric(horizontal: 1.5),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.7),
                borderRadius: BorderRadius.circular(2),
              ),
            );
          }),
        ),
        const SizedBox(width: AppSpacing.sm),
        Text('0:${seconds.toString().padLeft(2, '0')}',
            style: Theme.of(context)
                .textTheme
                .labelSmall
                ?.copyWith(color: color)),
      ],
    );
  }
}

class _SafetyBanner extends StatelessWidget {
  const _SafetyBanner({required this.reason});

  final String reason;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Container(
      margin: const EdgeInsets.only(top: AppSpacing.xs, bottom: AppSpacing.xs),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.statusAlert.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        border: Border.all(color: AppColors.statusAlert.withValues(alpha: 0.4)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.info_outline,
              color: AppColors.statusAlert, size: 18),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(reason,
                style: text.bodySmall
                    ?.copyWith(color: AppColors.textPrimary, height: 1.4)),
          ),
        ],
      ),
    );
  }
}

class _Composer extends StatelessWidget {
  const _Composer({required this.controller, required this.onSend});

  final TextEditingController controller;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, AppSpacing.md),
        child: Column(
          children: [
            // Icebreaker suggestion chip (Phase 16 AI assist).
            Align(
              alignment: Alignment.centerLeft,
              child: ActionChip(
                avatar: const Icon(Icons.auto_awesome,
                    size: 16, color: AppColors.accentViolet),
                label: const Text('Suggest an icebreaker'),
                backgroundColor: AppColors.bgSurface,
                side: const BorderSide(color: AppColors.hairline),
                labelStyle: Theme.of(context).textTheme.labelSmall,
                onPressed: () => controller.text =
                    'What’s the best thing you’ve read or listened to lately?',
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: controller,
                    minLines: 1,
                    maxLines: 4,
                    style: Theme.of(context).textTheme.bodyLarge,
                    textInputAction: TextInputAction.send,
                    onSubmitted: (_) => onSend(),
                    decoration: InputDecoration(
                      hintText: 'Message',
                      hintStyle: Theme.of(context).textTheme.bodyMedium,
                      filled: true,
                      fillColor: AppColors.bgSurface,
                      prefixIcon: const Icon(Icons.mic_none_rounded,
                          color: AppColors.textSecondary),
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.lg, vertical: AppSpacing.md),
                      border: OutlineInputBorder(
                        borderRadius:
                            BorderRadius.circular(AppSpacing.radiusPill),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                IconButton.filled(
                  onPressed: onSend,
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.accentGold,
                    foregroundColor: AppColors.bgPrimary,
                    minimumSize: const Size(48, 48),
                  ),
                  icon: const Icon(Icons.arrow_upward_rounded),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
