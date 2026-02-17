-- WorkforceOS Orders table
-- Tracks client orders, payments, pipeline status, and report delivery

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Client info
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  contact_title TEXT,

  -- Institution info
  institution_name TEXT NOT NULL,
  institution_data JSONB NOT NULL DEFAULT '{}',

  -- Order details
  service_tier TEXT NOT NULL DEFAULT 'discovery'
    CHECK (service_tier IN ('discovery', 'validation', 'discovery_validation', 'full_lifecycle')),
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',

  -- Payment
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'refunded', 'waived')),

  -- Pipeline execution
  order_status TEXT NOT NULL DEFAULT 'intake'
    CHECK (order_status IN ('intake', 'pending_payment', 'paid', 'queued', 'running', 'complete', 'review', 'delivered', 'cancelled')),
  pipeline_started_at TIMESTAMPTZ,
  pipeline_completed_at TIMESTAMPTZ,
  pipeline_metadata JSONB,

  -- Output
  discovery_cache_key TEXT,
  report_storage_path TEXT,
  report_markdown TEXT,
  delivery_token UUID DEFAULT gen_random_uuid(),

  -- Admin
  admin_created BOOLEAN NOT NULL DEFAULT false,
  admin_notes TEXT,
  delivered_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_delivery_token ON orders(delivery_token);
CREATE INDEX idx_orders_stripe_session ON orders(stripe_checkout_session_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();
