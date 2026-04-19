const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS customers (
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
)`,

  `CREATE TABLE IF NOT EXISTS riders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`,

  `CREATE TABLE IF NOT EXISTS orders (
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`,

  `CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_rider ON orders(rider_id)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC)`,

  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS rider_cancellations JSONB NOT NULL DEFAULT '[]'::jsonb`,

  `ALTER TABLE riders ADD COLUMN IF NOT EXISTS phone VARCHAR(100)`,
  `ALTER TABLE riders ADD COLUMN IF NOT EXISTS barangay VARCHAR(255) NOT NULL DEFAULT ''`,
  `ALTER TABLE riders ADD COLUMN IF NOT EXISTS availability VARCHAR(50) NOT NULL DEFAULT 'Available'`,
  `ALTER TABLE riders ADD COLUMN IF NOT EXISTS account_status VARCHAR(50) NOT NULL DEFAULT 'Active'`,
];

async function seedDemoRider() {
  const { ADMIN_RIDER_DEFAULT_PASSWORD } = require('../constants/riderAuth');
  const hash = await bcrypt.hash(ADMIN_RIDER_DEFAULT_PASSWORD, 10);
  const email = 'rider@shaw.com';
  const phone = '09171234567';
  const { rowCount } = await pool.query(
    `SELECT 1 FROM riders WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [email],
  );
  if (rowCount > 0) return;
  await pool.query(
    `INSERT INTO riders (
      email, password_hash, name, phone, barangay, availability, account_status
    ) VALUES ($1, $2, $3, $4, '', 'Available', 'Active')`,
    [email, hash, 'Demo Rider', phone],
  );
}

/**
 * Creates tables if they are missing and seeds the demo rider.
 * Safe to run on every server start (idempotent).
 * Requires PostgreSQL 13+ for gen_random_uuid() without extensions.
 */
async function initDatabase() {
  for (const sql of STATEMENTS) {
    await pool.query(sql);
  }
  await seedDemoRider();
  console.log('✅ Database schema ready (tables verified/created).');
}

module.exports = { initDatabase };
