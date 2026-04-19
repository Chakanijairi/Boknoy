-- Shaw's Delivery — reference schema (PostgreSQL 13+).
-- Tables are also created automatically when you start the Node server (see server/db/init.js).
-- Use this file in pgAdmin: Query Tool → paste → Execute (F5) if you prefer manual setup.

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  sex VARCHAR(50),
  birthdate VARCHAR(50),
  address TEXT,
  addresses_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS riders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_ref VARCHAR(64) NOT NULL UNIQUE,
  service_type TEXT NOT NULL,
  details TEXT,
  address TEXT,
  payment_type VARCHAR(100),
  amount TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  rider_id UUID REFERENCES riders(id) ON DELETE SET NULL,
  rider_name VARCHAR(255),
  declined_rider_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  assigned_at TIMESTAMPTZ,
  transit_started_at TIMESTAMPTZ,
  customer_location JSONB,
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  feedback JSONB,
  completed_at TIMESTAMPTZ,
  rider_cancellations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_rider ON orders(rider_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
