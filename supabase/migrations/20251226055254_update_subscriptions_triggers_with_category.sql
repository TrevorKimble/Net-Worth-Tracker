-- Update the subscriptions trigger function to include category field
CREATE OR REPLACE FUNCTION log_subscriptions_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_logs (table_name, record_id, operation, new_values, created_at)
    VALUES (
      'subscriptions',
      NEW.id,
      'INSERT',
      jsonb_build_object(
        'id', NEW.id,
        'name', NEW.name,
        'purpose', NEW.purpose,
        'category', NEW.category,
        'cost', NEW.cost,
        'billing_frequency', NEW.billing_frequency,
        'start_date', NEW.start_date,
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
      'subscriptions',
      NEW.id,
      'UPDATE',
      jsonb_build_object(
        'id', OLD.id,
        'name', OLD.name,
        'purpose', OLD.purpose,
        'category', OLD.category,
        'cost', OLD.cost,
        'billing_frequency', OLD.billing_frequency,
        'start_date', OLD.start_date,
        'notes', OLD.notes,
        'createdAt', OLD."createdAt",
        'updatedAt', OLD."updatedAt"
      ),
      jsonb_build_object(
        'id', NEW.id,
        'name', NEW.name,
        'purpose', NEW.purpose,
        'category', NEW.category,
        'cost', NEW.cost,
        'billing_frequency', NEW.billing_frequency,
        'start_date', NEW.start_date,
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
      'subscriptions',
      OLD.id,
      'DELETE',
      jsonb_build_object(
        'id', OLD.id,
        'name', OLD.name,
        'purpose', OLD.purpose,
        'category', OLD.category,
        'cost', OLD.cost,
        'billing_frequency', OLD.billing_frequency,
        'start_date', OLD.start_date,
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

