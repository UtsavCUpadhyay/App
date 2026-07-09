/**
 * Core domain entities, modelled on the Phase 8 database schema.
 *
 * Privacy-by-design notes carried over from the plan:
 *  - `verification` stores only a vendor *reference token* + score, never raw
 *    ID documents (those live with the licensed vendor, Phase 10).
 *  - Location is suburb-level only — never precise coordinates.
 *  - Advice usage is isolated from the dating profile.
 */

export type UserType = 'dating' | 'advice_only';
export type AccountStatus = 'active' | 'suspended' | 'deleted';

export interface User {
  id: string;
  email: string;
  /** bcrypt hash — never the plaintext. */
  passwordHash: string;
  userType: UserType;
  dateOfBirth: string; // ISO date; encrypted at rest in production
  mfaEnabled: boolean;
  accountStatus: AccountStatus;
  createdAt: string;
}

export type VerificationStatus =
  | 'unverified'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'manual_review';

export interface VerificationRecord {
  userId: string;
  status: VerificationStatus;
  /** Opaque token from the licensed vendor; NOT the document itself. */
  vendorRef: string | null;
  livenessScore: number | null;
  reviewedAt: string | null;
}

export interface Profile {
  userId: string;
  displayName: string;
  headline: string;
  locationSuburb: string;
  photos: string[];
  prompts: { prompt: string; answer: string }[];
  incognito: boolean;
}

export interface Match {
  id: string;
  userId: string;
  candidateId: string;
  compatibility: number; // 0–100
  highlights: string[];
  createdAt: string;
}

export interface AdviceArticle {
  id: string;
  title: string;
  category: string;
  audience: 'all' | 'men' | 'women' | 'lgbtq' | 'life_stage';
  readMinutes: number;
  featured: boolean;
  /** Under-18 advice_only accounts only ever see `minor`-safe content. */
  minorSafe: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  createdAt: string;
}

export type MessageKind = 'text' | 'photo' | 'voice';
export type ModerationCategory =
  | 'none'
  | 'financial_scam'
  | 'contact_exfiltration'
  | 'harassment';

/**
 * Result of scanning a message before it is stored (Phase 10: server-side AI
 * moderation runs at the point of send, before content is sealed at rest).
 */
export interface ModerationResult {
  flagged: boolean;
  category: ModerationCategory;
  /** User-facing safety-banner copy, shown contextually next to the message. */
  reason: string | null;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  kind: MessageKind;
  body: string; // content_encrypted at rest in production
  moderation: ModerationResult;
  createdAt: string;
}

export type AdminRole =
  | 'verification_reviewer'
  | 'moderator'
  | 'support'
  | 'superadmin';

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  mfaEnabled: boolean;
  createdAt: string;
}

export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';
export type ReportCategory =
  | 'scam'
  | 'harassment'
  | 'fake_profile'
  | 'inappropriate'
  | 'other';

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  conversationId: string | null;
  category: ReportCategory;
  reason: string;
  status: ReportStatus;
  assignedAdminId: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface Block {
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

export interface AuditEntry {
  actorId: string | null;
  actorType: 'user' | 'admin' | 'system';
  action: string;
  targetId: string | null;
}

/** Public shape of a user — never leaks the password hash. */
export type PublicUser = Omit<User, 'passwordHash'>;

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _ignored, ...rest } = user;
  return rest;
}

/** Public shape of an admin — never leaks the password hash. */
export type PublicAdmin = Omit<AdminUser, 'passwordHash'>;

export function toPublicAdmin(admin: AdminUser): PublicAdmin {
  const { passwordHash: _ignored, ...rest } = admin;
  return rest;
}
