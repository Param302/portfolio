ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS subject TEXT NOT NULL DEFAULT 'Portfolio enquiry';

CREATE INDEX IF NOT EXISTS contact_messages_status_created_at_idx ON contact_messages (status, created_at DESC);
