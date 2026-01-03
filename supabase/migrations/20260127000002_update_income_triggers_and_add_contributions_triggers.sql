-- Update income trigger function to include is_self_employment_income
CREATE OR REPLACE FUNCTION log_income_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_logs (table_name, record_id, operation, new_values, created_at)
    VALUES (
      'income',
      NEW.id,
      'INSERT',
      jsonb_build_object(
        'id', NEW.id,
        'date', NEW.date,
        'income_source', NEW.income_source,
        'amount', NEW.amount,
        'notes', NEW.notes,
        'is_self_employment_income', NEW.is_self_employment_income,
        'createdAt', NEW."createdAt",
        'updatedAt', NEW."updatedAt"
      ),
      TO_CHAR(NOW(), 'MM/DD/YY')
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO activity_logs (table_name, record_id, operation, old_values, new_values, created_at)
    VALUES (
      'income',
      NEW.id,
      'UPDATE',
      jsonb_build_object(
        'id', OLD.id,
        'date', OLD.date,
        'income_source', OLD.income_source,
        'amount', OLD.amount,
        'notes', OLD.notes,
        'is_self_employment_income', OLD.is_self_employment_income,
        'createdAt', OLD."createdAt",
        'updatedAt', OLD."updatedAt"
      ),
      jsonb_build_object(
        'id', NEW.id,
        'date', NEW.date,
        'income_source', NEW.income_source,
        'amount', NEW.amount,
        'notes', NEW.notes,
        'is_self_employment_income', NEW.is_self_employment_income,
        'createdAt', NEW."createdAt",
        'updatedAt', NEW."updatedAt"
      ),
      TO_CHAR(NOW(), 'MM/DD/YY')
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO activity_logs (table_name, record_id, operation, old_values, created_at)
    VALUES (
      'income',
      OLD.id,
      'DELETE',
      jsonb_build_object(
        'id', OLD.id,
        'date', OLD.date,
        'income_source', OLD.income_source,
        'amount', OLD.amount,
        'notes', OLD.notes,
        'is_self_employment_income', OLD.is_self_employment_income,
        'createdAt', OLD."createdAt",
        'updatedAt', OLD."updatedAt"
      ),
      TO_CHAR(NOW(), 'MM/DD/YY')
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Update solo_401k_conversions trigger function to include contribution fields
CREATE OR REPLACE FUNCTION log_solo_401k_conversions_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_logs (table_name, record_id, operation, new_values, created_at)
    VALUES (
      'solo_401k_conversions',
      NEW.id,
      'INSERT',
      jsonb_build_object(
        'id', NEW.id,
        'date', NEW.date,
        'amount', NEW.amount,
        'is_employer_contribution', NEW.is_employer_contribution,
        'is_employee_contribution', NEW.is_employee_contribution,
        'notes', NEW.notes,
        'createdAt', NEW."createdAt",
        'updatedAt', NEW."updatedAt"
      ),
      TO_CHAR(NOW(), 'MM/DD/YY')
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO activity_logs (table_name, record_id, operation, old_values, new_values, created_at)
    VALUES (
      'solo_401k_conversions',
      NEW.id,
      'UPDATE',
      jsonb_build_object(
        'id', OLD.id,
        'date', OLD.date,
        'amount', OLD.amount,
        'is_employer_contribution', OLD.is_employer_contribution,
        'is_employee_contribution', OLD.is_employee_contribution,
        'notes', OLD.notes,
        'createdAt', OLD."createdAt",
        'updatedAt', OLD."updatedAt"
      ),
      jsonb_build_object(
        'id', NEW.id,
        'date', NEW.date,
        'amount', NEW.amount,
        'is_employer_contribution', NEW.is_employer_contribution,
        'is_employee_contribution', NEW.is_employee_contribution,
        'notes', NEW.notes,
        'createdAt', NEW."createdAt",
        'updatedAt', NEW."updatedAt"
      ),
      TO_CHAR(NOW(), 'MM/DD/YY')
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO activity_logs (table_name, record_id, operation, old_values, created_at)
    VALUES (
      'solo_401k_conversions',
      OLD.id,
      'DELETE',
      jsonb_build_object(
        'id', OLD.id,
        'date', OLD.date,
        'amount', OLD.amount,
        'is_employer_contribution', OLD.is_employer_contribution,
        'is_employee_contribution', OLD.is_employee_contribution,
        'notes', OLD.notes,
        'createdAt', OLD."createdAt",
        'updatedAt', OLD."updatedAt"
      ),
      TO_CHAR(NOW(), 'MM/DD/YY')
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

