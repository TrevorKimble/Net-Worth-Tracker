-- Add is_self_employment_income boolean field to income table
ALTER TABLE income ADD COLUMN IF NOT EXISTS is_self_employment_income BOOLEAN NOT NULL DEFAULT false;

