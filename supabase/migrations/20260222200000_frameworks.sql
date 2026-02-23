-- Frameworks & Best Practices Knowledge Library
-- Curated reference library for agents: CBE, competency models, program design,
-- workforce training, employer partnerships, quality standards, credential frameworks.
-- Used by agents when generating recommendations, feasibility studies, and program designs.

CREATE TABLE IF NOT EXISTS intel_frameworks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identity
  framework_name TEXT NOT NULL,
  short_name TEXT,                          -- e.g. "C-BEN Quality Framework", "NICE Framework"
  version TEXT,                             -- e.g. "2.0", "2024 Edition"
  
  -- Classification
  framework_type TEXT NOT NULL,             -- competency_model, cbe_framework, program_design, 
                                            -- employer_partnership, quality_standard, policy_framework,
                                            -- credential_framework, adult_learning, training_design,
                                            -- accreditation, assessment
  category TEXT NOT NULL,                   -- workforce_development, higher_ed, industry_specific,
                                            -- continuing_education, k12_cte, apprenticeship
  
  -- Publisher
  organization TEXT NOT NULL,               -- "C-BEN", "DOL", "Lumina Foundation", etc.
  organization_type TEXT,                   -- federal, nonprofit, industry, accreditor, consortium
  
  -- Content (the actual value — what agents pull into reports)
  summary TEXT NOT NULL,                    -- 2-4 paragraph overview agents can reference
  key_principles JSONB DEFAULT '[]',        -- Array of actionable principles/components
  implementation_steps JSONB DEFAULT '[]',  -- How to apply this framework
  quality_indicators JSONB DEFAULT '[]',    -- What "good" looks like
  common_pitfalls JSONB DEFAULT '[]',       -- What to watch out for
  
  -- Applicability
  applicable_sectors JSONB DEFAULT '[]',    -- ["healthcare", "manufacturing", "IT", "all"]
  applicable_program_types JSONB DEFAULT '[]', -- ["certificate", "degree", "apprenticeship", "noncredit"]
  institution_types JSONB DEFAULT '[]',     -- ["community_college", "technical_college", "4yr_public"]
  
  -- Source & Verification
  source_url TEXT,
  source_document TEXT,                     -- Document/report title
  publication_year INTEGER,
  last_updated_year INTEGER,
  is_current BOOLEAN DEFAULT true,          -- false if superseded by newer version
  
  -- Agent instructions
  when_to_use TEXT,                         -- Guidance for agents: "Use when recommending CBE program structure"
  citation_text TEXT,                       -- Pre-formatted citation for reports
  
  -- Metadata
  tags JSONB DEFAULT '[]',
  related_frameworks JSONB DEFAULT '[]',    -- UUIDs or names of related frameworks
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(framework_name, version)
);

CREATE INDEX IF NOT EXISTS idx_frameworks_type ON intel_frameworks(framework_type);
CREATE INDEX IF NOT EXISTS idx_frameworks_category ON intel_frameworks(category);
CREATE INDEX IF NOT EXISTS idx_frameworks_org ON intel_frameworks(organization);
CREATE INDEX IF NOT EXISTS idx_frameworks_current ON intel_frameworks(is_current) WHERE is_current = true;

ALTER TABLE intel_frameworks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intel_frameworks_all" ON intel_frameworks FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER set_updated_at_intel_frameworks
  BEFORE UPDATE ON intel_frameworks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
