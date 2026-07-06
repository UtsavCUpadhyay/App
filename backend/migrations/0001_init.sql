-- Aurelle — initial schema (Phase 8).
--
-- Privacy-by-design carried over from the plan:
--   * verification_records holds only a vendor reference token + score, never
--     raw ID documents (Phase 10).
--   * profiles store suburb-level location only, never precise coordinates.
--   * Advice usage is isolated from the dating profile (separate concerns).
--   * Row-Level Security is enabled as the enforcement seam; production defines
--     per-role policies. Data residency: an Australian region (Phase 10).

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()

-- ── enums ──────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_type AS ENUM ('dating', 'advice_only');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE account_status AS ENUM ('active', 'suspended', 'deleted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM
    ('unverified', 'pending', 'approved', 'rejected', 'manual_review');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE advice_audience AS ENUM ('all', 'men', 'women', 'lgbtq', 'life_stage');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  user_type      user_type NOT NULL DEFAULT 'dating',
  date_of_birth  DATE NOT NULL,           -- encrypted at rest in production
  mfa_enabled    BOOLEAN NOT NULL DEFAULT FALSE,
  account_status account_status NOT NULL DEFAULT 'active',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── verification_records  [ISOLATED — strictest access control] ─────────────
CREATE TABLE IF NOT EXISTS verification_records (
  user_id        UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  status         verification_status NOT NULL DEFAULT 'unverified',
  vendor_ref     TEXT,                    -- vendor token only; NOT the document
  liveness_score REAL,
  reviewed_at    TIMESTAMPTZ
);

-- ── profiles ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name    TEXT NOT NULL,
  headline        TEXT NOT NULL DEFAULT '',
  location_suburb TEXT NOT NULL DEFAULT '',   -- suburb-level ONLY
  photos          JSONB NOT NULL DEFAULT '[]'::jsonb,
  prompts         JSONB NOT NULL DEFAULT '[]'::jsonb,
  incognito       BOOLEAN NOT NULL DEFAULT FALSE
);

-- ── compatibility answers ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compatibility_answers (
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id  TEXT NOT NULL,
  answer_value TEXT NOT NULL,
  weight       REAL NOT NULL DEFAULT 1.0,
  PRIMARY KEY (user_id, question_id)
);

-- ── matches ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matches (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  candidate_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  compatibility      SMALLINT NOT NULL CHECK (compatibility BETWEEN 0 AND 100),
  highlights         JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, candidate_id)
);
-- High-frequency query path: a user's matches for today (Phase 19).
CREATE INDEX IF NOT EXISTS idx_matches_user_created
  ON matches (user_id, created_at DESC);

-- ── advice_articles ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS advice_articles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  category     TEXT NOT NULL,
  audience     advice_audience NOT NULL DEFAULT 'all',
  read_minutes SMALLINT NOT NULL DEFAULT 5,
  featured     BOOLEAN NOT NULL DEFAULT FALSE,
  minor_safe   BOOLEAN NOT NULL DEFAULT FALSE
);

-- ── audit_log (append-only) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id   UUID,
  actor_type TEXT NOT NULL,             -- user | admin | system
  action     TEXT NOT NULL,
  target_id  UUID,
  ip_hash    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS enforcement seam (policies defined per deployment role).
ALTER TABLE verification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches              ENABLE ROW LEVEL SECURITY;
