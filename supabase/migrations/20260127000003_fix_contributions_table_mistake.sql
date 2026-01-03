-- Fix mistake: Drop solo_401k_contributions table if it was mistakenly created
-- and ensure fields are on solo_401k_conversions instead

-- Drop triggers for solo_401k_contributions if they exist
DROP TRIGGER IF EXISTS log_solo_401k_contributions_insert ON solo_401k_contributions;
DROP TRIGGER IF EXISTS log_solo_401k_contributions_update ON solo_401k_contributions;
DROP TRIGGER IF EXISTS log_solo_401k_contributions_delete ON solo_401k_contributions;

-- Drop the function if it exists (it was for the wrong table)
DROP FUNCTION IF EXISTS log_solo_401k_contributions_changes();

-- Drop the solo_401k_contributions table if it exists
DROP TABLE IF EXISTS solo_401k_contributions;

-- Ensure fields exist on solo_401k_conversions (in case migration 20260127000001 didn't run)
ALTER TABLE solo_401k_conversions 
  ADD COLUMN IF NOT EXISTS is_employer_contribution BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_employee_contribution BOOLEAN NOT NULL DEFAULT false;

-- Ensure constraint exists on solo_401k_conversions
ALTER TABLE solo_401k_conversions
  DROP CONSTRAINT IF EXISTS check_contribution_type;

ALTER TABLE solo_401k_conversions
  ADD CONSTRAINT check_contribution_type CHECK (
    (is_employer_contribution = true AND is_employee_contribution = false) OR
    (is_employer_contribution = false AND is_employee_contribution = true) OR
    (is_employer_contribution = false AND is_employee_contribution = false)
  );

