-- Phase A: integrity constraints + explicit order/report linkage

-- 1) Explicit linkage from orders to generated project/run/report records
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS validation_project_id uuid REFERENCES validation_projects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pipeline_run_id uuid REFERENCES pipeline_runs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS validation_report_id uuid REFERENCES validation_reports(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_validation_project_id ON orders(validation_project_id);
CREATE INDEX IF NOT EXISTS idx_orders_pipeline_run_id ON orders(pipeline_run_id);
CREATE INDEX IF NOT EXISTS idx_orders_validation_report_id ON orders(validation_report_id);

-- 2) report_id format guardrail
ALTER TABLE pipeline_runs
  DROP CONSTRAINT IF EXISTS pipeline_runs_report_id_format_chk;
ALTER TABLE pipeline_runs
  ADD CONSTRAINT pipeline_runs_report_id_format_chk
  CHECK (report_id IS NULL OR report_id ~ '^WV-[A-Z0-9]{3}-[0-9]{8}-[0-9]{3}$');

-- 3) Status guardrails (using observed values + safe future states)
ALTER TABLE validation_projects
  DROP CONSTRAINT IF EXISTS validation_projects_status_chk;
ALTER TABLE validation_projects
  ADD CONSTRAINT validation_projects_status_chk
  CHECK (status IN ('intake','researching','review','error','complete'));

ALTER TABLE research_components
  DROP CONSTRAINT IF EXISTS research_components_status_chk;
ALTER TABLE research_components
  ADD CONSTRAINT research_components_status_chk
  CHECK (status IN ('pending','in_progress','completed','error'));

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_order_status_chk;
ALTER TABLE orders
  ADD CONSTRAINT orders_order_status_chk
  CHECK (order_status IN ('draft','pending_payment','paid','queued','running','review','delivered','error','canceled'));

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_payment_status_chk;
ALTER TABLE orders
  ADD CONSTRAINT orders_payment_status_chk
  CHECK (payment_status IN ('waived','unpaid','pending','paid','refunded','failed'));

-- 4) Lightweight format checks
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_currency_fmt_chk;
ALTER TABLE orders
  ADD CONSTRAINT orders_currency_fmt_chk
  CHECK (currency IS NULL OR currency ~ '^[a-z]{3}$');

ALTER TABLE intel_institutions
  DROP CONSTRAINT IF EXISTS intel_institutions_state_fmt_chk;
ALTER TABLE intel_institutions
  ADD CONSTRAINT intel_institutions_state_fmt_chk
  CHECK (state IS NULL OR state ~ '^[A-Z]{2}$');

ALTER TABLE intel_state_priorities
  DROP CONSTRAINT IF EXISTS intel_state_priorities_state_fmt_chk;
ALTER TABLE intel_state_priorities
  ADD CONSTRAINT intel_state_priorities_state_fmt_chk
  CHECK (state IS NULL OR state ~ '^[A-Z]{2}$');

ALTER TABLE intel_wages
  DROP CONSTRAINT IF EXISTS intel_wages_soc_fmt_chk;
ALTER TABLE intel_wages
  ADD CONSTRAINT intel_wages_soc_fmt_chk
  CHECK (soc_code IS NULL OR soc_code ~ '^\d{2}-\d{4}(\.\d{2})?$');

ALTER TABLE intel_completions
  DROP CONSTRAINT IF EXISTS intel_completions_cip_fmt_chk;
ALTER TABLE intel_completions
  ADD CONSTRAINT intel_completions_cip_fmt_chk
  CHECK (cip_code IS NULL OR cip_code ~ '^\d{2}\.\d{4}$');

ALTER TABLE intel_employers
  DROP CONSTRAINT IF EXISTS intel_employers_naics_fmt_chk;
ALTER TABLE intel_employers
  ADD CONSTRAINT intel_employers_naics_fmt_chk
  CHECK (naics_code IS NULL OR naics_code ~ '^(\d{2}|\d{3}|\d{4}|\d{5}|\d{6}|\d{2}-\d{2})$');
