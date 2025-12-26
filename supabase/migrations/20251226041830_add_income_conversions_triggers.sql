-- Function to log activity for income
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
        'createdAt', OLD."createdAt",
        'updatedAt', OLD."updatedAt"
      ),
      jsonb_build_object(
        'id', NEW.id,
        'date', NEW.date,
        'income_source', NEW.income_source,
        'amount', NEW.amount,
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
      'income',
      OLD.id,
      'DELETE',
      jsonb_build_object(
        'id', OLD.id,
        'date', OLD.date,
        'income_source', OLD.income_source,
        'amount', OLD.amount,
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

-- Triggers for income
CREATE TRIGGER log_income_insert
  AFTER INSERT ON income
  FOR EACH ROW EXECUTE FUNCTION log_income_changes();

CREATE TRIGGER log_income_update
  AFTER UPDATE ON income
  FOR EACH ROW EXECUTE FUNCTION log_income_changes();

CREATE TRIGGER log_income_delete
  AFTER DELETE ON income
  FOR EACH ROW EXECUTE FUNCTION log_income_changes();

-- Function to log activity for solo_401k_conversions
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
        'notes', OLD.notes,
        'createdAt', OLD."createdAt",
        'updatedAt', OLD."updatedAt"
      ),
      jsonb_build_object(
        'id', NEW.id,
        'date', NEW.date,
        'amount', NEW.amount,
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

-- Triggers for solo_401k_conversions
CREATE TRIGGER log_solo_401k_conversions_insert
  AFTER INSERT ON solo_401k_conversions
  FOR EACH ROW EXECUTE FUNCTION log_solo_401k_conversions_changes();

CREATE TRIGGER log_solo_401k_conversions_update
  AFTER UPDATE ON solo_401k_conversions
  FOR EACH ROW EXECUTE FUNCTION log_solo_401k_conversions_changes();

CREATE TRIGGER log_solo_401k_conversions_delete
  AFTER DELETE ON solo_401k_conversions
  FOR EACH ROW EXECUTE FUNCTION log_solo_401k_conversions_changes();

