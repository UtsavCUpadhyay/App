-- Aurelle — safety & moderation schema (Phase 8 reports_moderation, admin_users).
--
-- Closes the safety loop the app stores require: report -> human moderation
-- queue -> action, plus block, plus an append-only admin audit trail (Phase 10:
-- every admin action is logged with actor + target + timestamp).

DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM
    ('verification_reviewer', 'moderator', 'support', 'superadmin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('open', 'reviewing', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          admin_role NOT NULL,
  mfa_enabled   BOOLEAN NOT NULL DEFAULT FALSE, -- mandatory in production (Phase 10)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reports (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id   UUID REFERENCES conversations(id) ON DELETE SET NULL,
  category          TEXT NOT NULL,
  reason            TEXT NOT NULL DEFAULT '',
  status            report_status NOT NULL DEFAULT 'open',
  assigned_admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  resolution_notes  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at       TIMESTAMPTZ,
  CHECK (reporter_id <> reported_user_id)
);
-- Queue query path: open reports oldest-first (Phase 19).
CREATE INDEX IF NOT EXISTS idx_reports_status_created
  ON reports (status, created_at);

CREATE TABLE IF NOT EXISTS blocks (
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks  ENABLE ROW LEVEL SECURITY;
