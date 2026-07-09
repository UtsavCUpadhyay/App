import type {
  AdminUser,
  AdviceArticle,
  AuditEntry,
  Block,
  ChatMessage,
  Conversation,
  Match,
  Profile,
  Report,
  ReportStatus,
  User,
  VerificationRecord,
} from './types.js';

/**
 * Repository interfaces (repository pattern, Phase 14/15). The application
 * services depend only on these; the in-memory implementations under
 * `infra/memory` can be swapped for a Postgres-backed layer (Phase 8) without
 * touching any module logic.
 */

export interface UserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

export interface VerificationRepository {
  get(userId: string): Promise<VerificationRecord | null>;
  save(record: VerificationRecord): Promise<VerificationRecord>;
}

export interface ProfileRepository {
  get(userId: string): Promise<Profile | null>;
  save(profile: Profile): Promise<Profile>;
}

export interface MatchRepository {
  todaysMatches(userId: string): Promise<Match[]>;
}

export interface AdviceRepository {
  list(opts: { audience?: string; minorSafeOnly: boolean }): Promise<AdviceArticle[]>;
}

export interface ChatRepository {
  /** Returns the existing 1:1 conversation between the two users, or creates it. */
  findOrCreateConversation(userA: string, userB: string): Promise<Conversation>;
  getConversation(conversationId: string): Promise<Conversation | null>;
  listConversations(userId: string): Promise<Conversation[]>;
  addMessage(message: ChatMessage): Promise<ChatMessage>;
  getMessages(conversationId: string): Promise<ChatMessage[]>;
}

export interface AdminRepository {
  create(admin: AdminUser): Promise<AdminUser>;
  findByEmail(email: string): Promise<AdminUser | null>;
  findById(id: string): Promise<AdminUser | null>;
  count(): Promise<number>;
}

export interface ReportRepository {
  create(report: Report): Promise<Report>;
  get(id: string): Promise<Report | null>;
  list(opts: { status?: ReportStatus }): Promise<Report[]>;
  save(report: Report): Promise<Report>;
}

export interface BlockRepository {
  create(block: Block): Promise<Block>;
  remove(blockerId: string, blockedId: string): Promise<void>;
  /** True if either user has blocked the other (bidirectional check). */
  blockedBetween(a: string, b: string): Promise<boolean>;
  listByBlocker(blockerId: string): Promise<Block[]>;
}

export interface AuditRepository {
  append(entry: AuditEntry): Promise<void>;
}

export interface Repositories {
  users: UserRepository;
  verification: VerificationRepository;
  profiles: ProfileRepository;
  matches: MatchRepository;
  advice: AdviceRepository;
  chat: ChatRepository;
  admins: AdminRepository;
  reports: ReportRepository;
  blocks: BlockRepository;
  audit: AuditRepository;
}
