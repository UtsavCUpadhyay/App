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

/** Public shape of a user — never leaks the password hash. */
export type PublicUser = Omit<User, 'passwordHash'>;

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _ignored, ...rest } = user;
  return rest;
}
