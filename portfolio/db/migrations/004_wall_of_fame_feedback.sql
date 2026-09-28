CREATE TABLE IF NOT EXISTS wall_of_fame_feedbacks (
  id TEXT PRIMARY KEY,
  feedback_text TEXT NOT NULL UNIQUE,
  like_count INTEGER NOT NULL DEFAULT 0 CHECK (like_count >= 0),
  sort_order INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS wall_of_fame_feedbacks_order_idx
  ON wall_of_fame_feedbacks (active, sort_order);

CREATE TABLE IF NOT EXISTS wall_of_fame_likes (
  feedback_id TEXT NOT NULL REFERENCES wall_of_fame_feedbacks(id) ON DELETE CASCADE,
  visitor_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (feedback_id, visitor_hash)
);

CREATE INDEX IF NOT EXISTS wall_of_fame_likes_created_at_idx
  ON wall_of_fame_likes (created_at DESC);
