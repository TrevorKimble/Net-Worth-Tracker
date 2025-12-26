-- Create enum type for billing frequency
CREATE TYPE billing_frequency AS ENUM ('MONTHLY', 'YEARLY', 'QUARTERLY', 'WEEKLY', 'BIANNUAL');

-- Subscriptions tracking table
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  cost DOUBLE PRECISION NOT NULL,
  billing_frequency billing_frequency NOT NULL,
  start_date TEXT NOT NULL,
  notes TEXT,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_subscriptions_start_date ON subscriptions(start_date);

