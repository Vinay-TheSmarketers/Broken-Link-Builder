CREATE TABLE IF NOT EXISTS campaigns (id TEXT PRIMARY KEY, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', target_count INTEGER NOT NULL DEFAULT 0, qualified_count INTEGER NOT NULL DEFAULT 0, broken_count INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS targets (id TEXT PRIMARY KEY, campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE, url TEXT NOT NULL, domain TEXT NOT NULL, authority INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'queued', http_status INTEGER, is_soft_404 INTEGER NOT NULL DEFAULT 0, archived_url TEXT, contact_email TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS content_reconstructions (id TEXT PRIMARY KEY, target_id TEXT NOT NULL UNIQUE REFERENCES targets(id) ON DELETE CASCADE, title TEXT NOT NULL, draft TEXT NOT NULL, source_url TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sequence_steps (id TEXT PRIMARY KEY, target_id TEXT NOT NULL REFERENCES targets(id) ON DELETE CASCADE, step_number INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'queued', scheduled_for TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_targets_campaign_status ON targets(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_targets_created_at ON targets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sequence_steps_target_status ON sequence_steps(target_id, status);
PRAGMA optimize;
