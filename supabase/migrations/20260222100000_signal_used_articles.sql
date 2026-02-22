-- Signal newsletter article deduplication
-- Tracks URLs used in previous editions to prevent repeats

CREATE TABLE IF NOT EXISTS signal_used_articles (
  url TEXT PRIMARY KEY,
  used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for cleanup queries (delete old entries)
CREATE INDEX IF NOT EXISTS idx_signal_used_articles_used_at 
  ON signal_used_articles (used_at);

-- RLS: service role only (this table is only accessed server-side)
ALTER TABLE signal_used_articles ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access" ON signal_used_articles
  FOR ALL USING (true) WITH CHECK (true);
