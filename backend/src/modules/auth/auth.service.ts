import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

import type { AppConfig } from '../../config.js';
import type { Repositories } from '../../domain/repositories.js';
import { type PublicUser, toPublicUser, type User } from '../../domain/types.js';
import { HttpError } from '../../shared/http-error.js';

export interface RegisterInput {
  email: string;
  password: string;
  dateOfBirth: string; // ISO date
  userType: 'dating' | 'advice_only';
}

/** Years between `dob` and `now`, floored. */
export function ageInYears(dob: string, now = new Date()): number {
  const birth = new Date(dob);
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

export class AuthService {
  constructor(
    private readonly repos: Repositories,
    private readonly config: AppConfig,
  ) {}

  async register(input: RegisterInput): Promise<PublicUser> {
    const existing = await this.repos.users.findByEmail(input.email);
    if (existing) {
      throw new HttpError(409, 'An account with this email already exists');
    }

    const age = ageInYears(input.dateOfBirth);
    // Hard age gate (Phase 2): Dating is 18+, no exceptions.
    if (input.userType === 'dating' && age < this.config.minDatingAge) {
      throw new HttpError(
        403,
        `You must be at least ${this.config.minDatingAge} to use Aurelle Dating`,
      );
    }
    if (age < 16) {
      throw new HttpError(403, 'Aurelle is not available under 16');
    }

    const user: User = {
      id: randomUUID(),
      email: input.email.toLowerCase(),
      passwordHash: await bcrypt.hash(input.password, 10),
      userType: input.userType,
      dateOfBirth: input.dateOfBirth,
      mfaEnabled: false,
      accountStatus: 'active',
      createdAt: new Date().toISOString(),
    };
    await this.repos.users.create(user);

    // Every user starts unverified — the hard gate is enforced downstream.
    await this.repos.verification.save({
      userId: user.id,
      status: 'unverified',
      vendorRef: null,
      livenessScore: null,
      reviewedAt: null,
    });

    return toPublicUser(user);
  }

  async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.repos.users.findByEmail(email);
    // Constant-ish message regardless of which half failed — avoid user enumeration.
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new HttpError(401, 'Invalid email or password');
    }
    if (user.accountStatus !== 'active') {
      throw new HttpError(403, 'This account is not active');
    }
    return user;
  }
}
