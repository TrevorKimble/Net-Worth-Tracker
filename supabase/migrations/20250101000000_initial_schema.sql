-- Create enum type for asset types
CREATE TYPE asset_type AS ENUM ('CASH', 'STOCK', 'CRYPTO', 'GOLD', 'SILVER', 'MISC');

-- Monthly Input Table - Simple estimates
CREATE TABLE monthly_inputs (
  id SERIAL PRIMARY KEY,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  cash DOUBLE PRECISION NOT NULL DEFAULT 0,
  stocks DOUBLE PRECISION NOT NULL DEFAULT 0,
  crypto DOUBLE PRECISION NOT NULL DEFAULT 0,
  gold DOUBLE PRECISION NOT NULL DEFAULT 0,
  silver DOUBLE PRECISION NOT NULL DEFAULT 0,
  misc DOUBLE PRECISION NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(month, year)
);

-- Personal Portfolio - Detailed tracking
CREATE TABLE personal_assets (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type asset_type NOT NULL,
  quantity DOUBLE PRECISION NOT NULL,
  "currentPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
  notes TEXT,
  "lastUpdated" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

-- Solo 401k Trust Portfolio - Detailed tracking
CREATE TABLE solo_401k_assets (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type asset_type NOT NULL,
  quantity DOUBLE PRECISION NOT NULL,
  "currentPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
  notes TEXT,
  "lastUpdated" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

-- Generic activity log table for all database changes (populated by database triggers)
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  operation TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TEXT NOT NULL
);

-- Create indexes for activity_logs
CREATE INDEX idx_activity_logs_table_record ON activity_logs(table_name, record_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Income tracking table
CREATE TABLE income (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  income_source TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  notes TEXT,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

-- Solo 401k Conversions tracking table
CREATE TABLE solo_401k_conversions (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  notes TEXT,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);



