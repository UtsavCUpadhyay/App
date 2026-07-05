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

/**
 * In-memory implementations of every repository. Deliberately dependency-free
 * so the API runs and is fully testable without an external database — the
 * seam to a real Postgres layer (Phase 8) is the interface, not the caller.
 */

class MemoryUserRepository implements UserRepository {
  private byId = new Map<string, User>();
  private byEmail = new Map<string, string>();

  async create(user: User): Promise<User> {
    this.byId.set(user.id, user);
    this.byEmail.set(user.email.toLowerCase(), user.id);
    return user;
  }
  async findById(id: string): Promise<User | null> {
    return this.byId.get(id) ?? null;
  }
  async findByEmail(email: string): Promise<User | null> {
    const id = this.byEmail.get(email.toLowerCase());
    return id ? (this.byId.get(id) ?? null) : null;
  }
  async save(user: User): Promise<User> {
    this.byId.set(user.id, user);
    return user;
  }
}

class MemoryVerificationRepository implements VerificationRepository {
  private records = new Map<string, VerificationRecord>();
  async get(userId: string): Promise<VerificationRecord | null> {
    return this.records.get(userId) ?? null;
  }
  async save(record: VerificationRecord): Promise<VerificationRecord> {
    this.records.set(record.userId, record);
    return record;
  }
}

class MemoryProfileRepository implements ProfileRepository {
  private profiles = new Map<string, Profile>();
  async get(userId: string): Promise<Profile | null> {
    return this.profiles.get(userId) ?? null;
  }
  async save(profile: Profile): Promise<Profile> {
    this.profiles.set(profile.userId, profile);
    return profile;
  }
}

class MemoryMatchRepository implements MatchRepository {
  // The prototype curates from a fixed candidate pool; the production build
  // scores the compatibility questionnaire against the verified user base.
  async todaysMatches(userId: string): Promise<Match[]> {
    const now = new Date().toISOString();
    const seed: Omit<Match, 'userId' | 'createdAt'>[] = [
      {
        id: 'm1',
        candidateId: 'cand-charlotte',
        compatibility: 92,
        highlights: ['Shared values', 'Both want long-term', 'Loves the coast'],
      },
      {
        id: 'm2',
        candidateId: 'cand-priya',
        compatibility: 88,
        highlights: ['Aligned on family', 'Both early risers', 'Weekend hikers'],
      },
      {
        id: 'm3',
        candidateId: 'cand-james',
        compatibility: 85,
        highlights: ['Shared humour', 'Both love live music', 'Career-driven'],
      },
    ];
    return seed.map((m) => ({ ...m, userId, createdAt: now }));
  }
}

class MemoryAdviceRepository implements AdviceRepository {
  private articles: AdviceArticle[] = [
    { id: 'a1', title: 'How to spot secure vs. anxious attachment early', category: 'Attachment', audience: 'all', readMinutes: 6, featured: true, minorSafe: true },
    { id: 'a2', title: 'Dating again after divorce: the first 30 days', category: 'Life Stage', audience: 'life_stage', readMinutes: 8, featured: false, minorSafe: false },
    { id: 'a3', title: 'Communicating boundaries without conflict', category: 'Communication', audience: 'women', readMinutes: 5, featured: false, minorSafe: true },
    { id: 'a4', title: 'Building a safe, affirming first date checklist', category: 'Safety', audience: 'lgbtq', readMinutes: 4, featured: false, minorSafe: false },
    { id: 'a5', title: 'Beating swipe fatigue: dating with intention', category: 'Mindset', audience: 'men', readMinutes: 7, featured: false, minorSafe: false },
  ];

  async list(opts: { audience?: string; minorSafeOnly: boolean }): Promise<AdviceArticle[]> {
    return this.articles.filter((a) => {
      if (opts.minorSafeOnly && !a.minorSafe) return false;
      if (opts.audience && opts.audience !== 'all') {
        return a.audience === opts.audience || a.audience === 'all';
      }
      return true;
    });
  }
}

export function createMemoryRepositories(): Repositories {
  return {
    users: new MemoryUserRepository(),
    verification: new MemoryVerificationRepository(),
    profiles: new MemoryProfileRepository(),
    matches: new MemoryMatchRepository(),
    advice: new MemoryAdviceRepository(),
  };
}
