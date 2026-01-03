-- Solo 401k Contributions tracking table
CREATE TABLE IF NOT EXISTS solo_401k_contributions (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  is_employer_contribution BOOLEAN NOT NULL DEFAULT false,
  is_employee_contribution BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL,
  -- Ensure only one of the contribution types is true
  CHECK (
    (is_employer_contribution = true AND is_employee_contribution = false) OR
    (is_employer_contribution = false AND is_employee_contribution = true) OR
    (is_employer_contribution = false AND is_employee_contribution = false)
  )
);

