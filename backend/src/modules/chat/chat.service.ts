import { randomUUID } from 'node:crypto';

import type { Repositories } from '../../domain/repositories.js';
import type { ChatMessage, Conversation, MessageKind } from '../../domain/types.js';
import { HttpError } from '../../shared/http-error.js';
import type { ModerationProvider } from '../moderation/moderation.service.js';

/**
 * Chat orchestration. Every send runs through the moderation provider BEFORE
 * the message is persisted (Phase 10) — the flag/reason is stored alongside the
 * message and surfaced to the client as the contextual safety banner. We flag,
 * we never auto-block: delivery still happens, the recipient just gets a warning
 * and a report path.
 */
export class ChatService {
  constructor(
    private readonly repos: Repositories,
    private readonly moderation: ModerationProvider,
  ) {}

  async startConversation(userId: string, withUserId: string): Promise<Conversation> {
    if (userId === withUserId) {
      throw new HttpError(400, 'You cannot start a conversation with yourself');
    }
    const other = await this.repos.users.findById(withUserId);
    if (!other) throw new HttpError(404, 'That member does not exist');
    return this.repos.chat.findOrCreateConversation(userId, withUserId);
  }

  async listConversations(userId: string): Promise<Conversation[]> {
    return this.repos.chat.listConversations(userId);
  }

  /** Loads messages, enforcing that the requester is a participant. */
  async getMessages(userId: string, conversationId: string): Promise<ChatMessage[]> {
    await this.assertParticipant(userId, conversationId);
    return this.repos.chat.getMessages(conversationId);
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    kind: MessageKind,
    body: string,
  ): Promise<ChatMessage> {
    await this.assertParticipant(userId, conversationId);

    // Only text is scanned for scam/abuse here; voice/photo moderation
    // (transcription, NCII/CSAM detection) is a separate pipeline (Roadmap S4).
    const moderation =
      kind === 'text' ? await this.moderation.scan(body) : { flagged: false, category: 'none' as const, reason: null };

    const message: ChatMessage = {
      id: randomUUID(),
      conversationId,
      senderId: userId,
      kind,
      body,
      moderation,
      createdAt: new Date().toISOString(),
    };
    return this.repos.chat.addMessage(message);
  }

  private async assertParticipant(userId: string, conversationId: string): Promise<void> {
    const convo = await this.repos.chat.getConversation(conversationId);
    if (!convo) throw new HttpError(404, 'Conversation not found');
    if (!convo.participantIds.includes(userId)) {
      throw new HttpError(403, 'You are not a participant in this conversation');
    }
  }
}
