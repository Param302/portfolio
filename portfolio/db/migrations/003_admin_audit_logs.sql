ALTER TABLE admin_sessions ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE admin_sessions ADD COLUMN IF NOT EXISTS browser TEXT;
ALTER TABLE admin_sessions ADD COLUMN IF NOT EXISTS os TEXT;
ALTER TABLE admin_sessions ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS admin_audit_events (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES admin_users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'failed', 'throttled')),
  ip_address TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  browser TEXT,
  os TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_audit_events_created_at_idx ON admin_audit_events (created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_events_type_created_at_idx ON admin_audit_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_sessions_user_created_at_idx ON admin_sessions (user_id, created_at DESC);
