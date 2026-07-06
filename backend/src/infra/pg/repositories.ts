import type {
  AdviceRepository,
  MatchRepository,
  ProfileRepository,
  Repositories,
  UserRepository,
  VerificationRepository,
} from '../../domain/repositories.js';
import type {
  AdviceArticle,
  Match,
  Profile,
  User,
  VerificationRecord,
} from '../../domain/types.js';
import type { Pool } from './pool.js';

/**
 * PostgreSQL implementations of every repository (Phase 8 schema).
 * Same interfaces as the in-memory store — swapping is a one-line change in the
 * composition root. All queries are parameterised (no string interpolation).
 */

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  user_type: User['userType'];
  date_of_birth: Date | string;
  mfa_enabled: boolean;
  account_status: User['accountStatus'];
  created_at: Date | string;
}

function isoDate(v: Date | string): string {
  return v instanceof Date ? v.toISOString() : v;
}

function mapUser(r: UserRow): User {
  return {
    id: r.id,
    email: r.email,
    passwordHash: r.password_hash,
    userType: r.user_type,
    // date_of_birth is a DATE — keep it as a YYYY-MM-DD string.
    dateOfBirth: isoDate(r.date_of_birth).slice(0, 10),
    mfaEnabled: r.mfa_enabled,
    accountStatus: r.account_status,
    createdAt: isoDate(r.created_at),
  };
}

class PgUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async create(user: User): Promise<User> {
    await this.pool.query(
      `INSERT INTO users
         (id, email, password_hash, user_type, date_of_birth, mfa_enabled, account_status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [user.id, user.email, user.passwordHash, user.userType, user.dateOfBirth,
        user.mfaEnabled, user.accountStatus, user.createdAt],
    );
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const { rows } = await this.pool.query<UserRow>('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] ? mapUser(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await this.pool.query<UserRow>(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()],
    );
    return rows[0] ? mapUser(rows[0]) : null;
  }

  async save(user: User): Promise<User> {
    await this.pool.query(
      `UPDATE users SET email=$2, password_hash=$3, user_type=$4, date_of_birth=$5,
         mfa_enabled=$6, account_status=$7 WHERE id=$1`,
      [user.id, user.email, user.passwordHash, user.userType, user.dateOfBirth,
        user.mfaEnabled, user.accountStatus],
    );
    return user;
  }
}

class PgVerificationRepository implements VerificationRepository {
  constructor(private readonly pool: Pool) {}

  async get(userId: string): Promise<VerificationRecord | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM verification_records WHERE user_id = $1',
      [userId],
    );
    const r = rows[0];
    if (!r) return null;
    return {
      userId: r.user_id,
      status: r.status,
      vendorRef: r.vendor_ref,
      livenessScore: r.liveness_score,
      reviewedAt: r.reviewed_at ? isoDate(r.reviewed_at) : null,
    };
  }

  async save(record: VerificationRecord): Promise<VerificationRecord> {
    await this.pool.query(
      `INSERT INTO verification_records (user_id, status, vendor_ref, liveness_score, reviewed_at)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (user_id) DO UPDATE SET
         status = EXCLUDED.status, vendor_ref = EXCLUDED.vendor_ref,
         liveness_score = EXCLUDED.liveness_score, reviewed_at = EXCLUDED.reviewed_at`,
      [record.userId, record.status, record.vendorRef, record.livenessScore, record.reviewedAt],
    );
    return record;
  }
}

class PgProfileRepository implements ProfileRepository {
  constructor(private readonly pool: Pool) {}

  async get(userId: string): Promise<Profile | null> {
    const { rows } = await this.pool.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
    const r = rows[0];
    if (!r) return null;
    return {
      userId: r.user_id,
      displayName: r.display_name,
      headline: r.headline,
      locationSuburb: r.location_suburb,
      photos: r.photos,
      prompts: r.prompts,
      incognito: r.incognito,
    };
  }

  async save(profile: Profile): Promise<Profile> {
    await this.pool.query(
      `INSERT INTO profiles (user_id, display_name, headline, location_suburb, photos, prompts, incognito)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (user_id) DO UPDATE SET
         display_name=EXCLUDED.display_name, headline=EXCLUDED.headline,
         location_suburb=EXCLUDED.location_suburb, photos=EXCLUDED.photos,
         prompts=EXCLUDED.prompts, incognito=EXCLUDED.incognito`,
      [profile.userId, profile.displayName, profile.headline, profile.locationSuburb,
        JSON.stringify(profile.photos), JSON.stringify(profile.prompts), profile.incognito],
    );
    return profile;
  }
}

class PgMatchRepository implements MatchRepository {
  constructor(private readonly pool: Pool) {}

  /**
   * Returns today's matches, curating them on first request. Real curation
   * scores the compatibility questionnaire; this stub picks from the verified
   * candidate pool and persists the result so repeat calls are stable.
   */
  async todaysMatches(userId: string): Promise<Match[]> {
    const existing = await this.pool.query(
      `SELECT * FROM matches
       WHERE user_id = $1 AND created_at >= date_trunc('day', now())
       ORDER BY compatibility DESC`,
      [userId],
    );
    if (existing.rows.length > 0) return existing.rows.map(this.mapMatch);

    // Curate from other verified, profiled candidates (never the user themself).
    const pool = await this.pool.query(
      `SELECT u.id FROM users u
         JOIN verification_records v ON v.user_id = u.id AND v.status = 'approved'
         JOIN profiles p ON p.user_id = u.id
       WHERE u.id <> $1 AND u.account_status = 'active'
       ORDER BY u.created_at
       LIMIT 3`,
      [userId],
    );

    const scores = [92, 88, 85];
    const highlightSets = [
      ['Shared values', 'Both want long-term', 'Loves the coast'],
      ['Aligned on family', 'Both early risers', 'Weekend hikers'],
      ['Shared humour', 'Both love live music', 'Career-driven'],
    ];

    const created: Match[] = [];
    for (let i = 0; i < pool.rows.length; i++) {
      const candidateId = pool.rows[i]!.id as string;
      const compatibility = scores[i] ?? 80;
      const highlights = highlightSets[i] ?? [];
      const { rows } = await this.pool.query(
        `INSERT INTO matches (user_id, candidate_id, compatibility, highlights)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (user_id, candidate_id) DO NOTHING
         RETURNING *`,
        [userId, candidateId, compatibility, JSON.stringify(highlights)],
      );
      if (rows[0]) created.push(this.mapMatch(rows[0]));
    }
    return created;
  }

  private mapMatch(r: Record<string, unknown>): Match {
    return {
      id: r.id as string,
      userId: r.user_id as string,
      candidateId: r.candidate_id as string,
      compatibility: r.compatibility as number,
      highlights: r.highlights as string[],
      createdAt: isoDate(r.created_at as Date | string),
    };
  }
}

class PgAdviceRepository implements AdviceRepository {
  constructor(private readonly pool: Pool) {}

  async list(opts: { audience?: string; minorSafeOnly: boolean }): Promise<AdviceArticle[]> {
    const clauses: string[] = [];
    const params: unknown[] = [];
    if (opts.minorSafeOnly) clauses.push('minor_safe = TRUE');
    if (opts.audience && opts.audience !== 'all') {
      params.push(opts.audience);
      clauses.push(`(audience = $${params.length} OR audience = 'all')`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const { rows } = await this.pool.query(
      `SELECT * FROM advice_articles ${where} ORDER BY featured DESC, title`,
      params,
    );
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      audience: r.audience,
      readMinutes: r.read_minutes,
      featured: r.featured,
      minorSafe: r.minor_safe,
    }));
  }
}

export function createPgRepositories(pool: Pool): Repositories {
  return {
    users: new PgUserRepository(pool),
    verification: new PgVerificationRepository(pool),
    profiles: new PgProfileRepository(pool),
    matches: new PgMatchRepository(pool),
    advice: new PgAdviceRepository(pool),
  };
}
