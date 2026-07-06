-- Idempotent seed data for local/dev runs (safe to re-run).
-- Candidate accounts have a non-usable password hash — they exist only as a
-- pool for the curation stub, not as login-able users.

-- ── Advice articles (mirror the client/mock content) ────────────────────────
INSERT INTO advice_articles (id, title, category, audience, read_minutes, featured, minor_safe) VALUES
  ('a1111111-0000-0000-0000-000000000001', 'How to spot secure vs. anxious attachment early', 'Attachment', 'all', 6, TRUE, TRUE),
  ('a1111111-0000-0000-0000-000000000002', 'Dating again after divorce: the first 30 days', 'Life Stage', 'life_stage', 8, FALSE, FALSE),
  ('a1111111-0000-0000-0000-000000000003', 'Communicating boundaries without conflict', 'Communication', 'women', 5, FALSE, TRUE),
  ('a1111111-0000-0000-0000-000000000004', 'Building a safe, affirming first date checklist', 'Safety', 'lgbtq', 4, FALSE, FALSE),
  ('a1111111-0000-0000-0000-000000000005', 'Beating swipe fatigue: dating with intention', 'Mindset', 'men', 7, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- ── Candidate users (curation pool) ─────────────────────────────────────────
INSERT INTO users (id, email, password_hash, user_type, date_of_birth, account_status) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'charlotte@seed.aurelle', 'x-not-usable', 'dating', '1996-03-14', 'active'),
  ('c0000000-0000-0000-0000-000000000002', 'priya@seed.aurelle',     'x-not-usable', 'dating', '1994-07-02', 'active'),
  ('c0000000-0000-0000-0000-000000000003', 'james@seed.aurelle',     'x-not-usable', 'dating', '1991-11-20', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO verification_records (user_id, status, vendor_ref, liveness_score, reviewed_at) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'approved', 'seed', 0.99, now()),
  ('c0000000-0000-0000-0000-000000000002', 'approved', 'seed', 0.99, now()),
  ('c0000000-0000-0000-0000-000000000003', 'approved', 'seed', 0.99, now())
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO profiles (user_id, display_name, headline, location_suburb) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Charlotte', 'Design Director',    'Bondi'),
  ('c0000000-0000-0000-0000-000000000002', 'Priya',     'Paediatric Registrar','Fitzroy'),
  ('c0000000-0000-0000-0000-000000000003', 'James',     'Architect',          'New Farm')
ON CONFLICT (user_id) DO NOTHING;
