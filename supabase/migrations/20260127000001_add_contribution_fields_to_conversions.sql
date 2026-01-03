-- Add is_employer_contribution and is_employee_contribution boolean fields to solo_401k_conversions table
ALTER TABLE solo_401k_conversions 
  ADD COLUMN IF NOT EXISTS is_employer_contribution BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_employee_contribution BOOLEAN NOT NULL DEFAULT false;

-- Add constraint to ensure only one can be true (or both false)
ALTER TABLE solo_401k_conversions
  DROP CONSTRAINT IF EXISTS check_contribution_type;

ALTER TABLE solo_401k_conversions
  ADD CONSTRAINT check_contribution_type CHECK (
    (is_employer_contribution = true AND is_employee_contribution = false) OR
    (is_employer_contribution = false AND is_employee_contribution = true) OR
    (is_employer_contribution = false AND is_employee_contribution = false)
  );

