-- Aurelle — chat schema (Phase 8 conversations/messages).
--
-- Messages carry a moderation flag/category/reason computed at send time
-- (Phase 10: server-side scan before storage). `body` is content_encrypted at
-- rest in production. `expires_at` is reserved for the v2 disappearing-message
-- feature (Phase 6 "could have").

CREATE TABLE IF NOT EXISTS conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_participants_user
  ON conversation_participants (user_id);

DO $$ BEGIN
  CREATE TYPE message_kind AS ENUM ('text', 'photo', 'voice');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id     UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind                message_kind NOT NULL DEFAULT 'text',
  body                TEXT NOT NULL,      -- content_encrypted at rest in prod
  moderation_flag     BOOLEAN NOT NULL DEFAULT FALSE,
  moderation_category TEXT NOT NULL DEFAULT 'none',
  moderation_reason   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at          TIMESTAMPTZ
);
-- Hot path: a conversation's messages in order (Phase 19).
CREATE INDEX IF NOT EXISTS idx_messages_convo_created
  ON messages (conversation_id, created_at);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;
