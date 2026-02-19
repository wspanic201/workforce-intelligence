-- Drift Monitor: Programs registered for ongoing curriculum drift tracking

CREATE TABLE drift_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name TEXT NOT NULL,
  contact_email TEXT,
  program_name TEXT NOT NULL,
  occupation_title TEXT NOT NULL,
  soc_code TEXT,
  curriculum_description TEXT NOT NULL,
  last_curriculum_update DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Historical scan results
CREATE TABLE drift_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES drift_programs(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT now(),
  postings_analyzed INTEGER,
  employer_skills JSONB,
  covered_skills TEXT[],
  gap_skills TEXT[],
  stale_skills TEXT[],
  drift_score INTEGER CHECK (drift_score >= 0 AND drift_score <= 100),
  drift_level TEXT CHECK (drift_level IN ('aligned', 'minor', 'moderate', 'significant', 'critical')),
  drift_delta INTEGER,
  narrative TEXT,
  recommendations TEXT[],
  report_html TEXT,
  report_pdf_path TEXT
);

-- Index for quick lookups
CREATE INDEX idx_drift_scans_program_id ON drift_scans(program_id);
CREATE INDEX idx_drift_scans_scanned_at ON drift_scans(scanned_at DESC);

-- View: latest scan per program
CREATE VIEW drift_programs_with_latest AS
SELECT
  p.*,
  s.drift_score AS latest_drift_score,
  s.drift_level AS latest_drift_level,
  s.scanned_at AS last_scanned_at,
  s.gap_skills AS latest_gaps
FROM drift_programs p
LEFT JOIN LATERAL (
  SELECT * FROM drift_scans
  WHERE program_id = p.id
  ORDER BY scanned_at DESC
  LIMIT 1
) s ON true;
