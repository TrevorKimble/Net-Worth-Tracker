-- Function to log activity for personal_assets
CREATE OR REPLACE FUNCTION log_personal_assets_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_logs (table_name, record_id, operation, new_values, created_at)
    VALUES (
      'personal_assets',
      NEW.id,
      'INSERT',
      jsonb_build_object(
        'id', NEW.id,
        'symbol', NEW.symbol,
        'name', NEW.name,
        'type', NEW.type,
        'quantity', NEW.quantity,
        'currentPrice', NEW."currentPrice",
        'totalValue', NEW."totalValue",
        'notes', NEW.notes,
        'lastUpdated', NEW."lastUpdated",
        'createdAt', NEW."createdAt",
        'updatedAt', NEW."updatedAt"
      ),
      TO_CHAR(NOW(), 'MM/DD/YY')
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO activity_logs (table_name, record_id, operation, old_values, new_values, created_at)
    VALUES (
      'personal_assets',
      NEW.id,
      'UPDATE',
      jsonb_build_object(
        'id', OLD.id,
        'symbol', OLD.symbol,
        'name', OLD.name,
        'type', OLD.type,
        'quantity', OLD.quantity,
        'currentPrice', OLD."currentPrice",
        'totalValue', OLD."totalValue",
        'notes', OLD.notes,
        'lastUpdated', OLD."lastUpdated",
        'createdAt', OLD."createdAt",
        'updatedAt', OLD."updatedAt"
      ),
      jsonb_build_object(
        'id', NEW.id,
        'symbol', NEW.symbol,
        'name', NEW.name,
        'type', NEW.type,
        'quantity', NEW.quantity,
        'currentPrice', NEW."currentPrice",
        'totalValue', NEW."totalValue",
        'notes', NEW.notes,
        'lastUpdated', NEW."lastUpdated",
        'createdAt', NEW."createdAt",
        'updatedAt', NEW."updatedAt"
      ),
      TO_CHAR(NOW(), 'MM/DD/YY')
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO activity_logs (table_name, record_id, operation, old_values, created_at)
    VALUES (
      'personal_assets',
      OLD.id,
      'DELETE',
      jsonb_build_object(
        'id', OLD.id,
        'symbol', OLD.symbol,
        'name', OLD.name,
        'type', OLD.type,
        'quantity', OLD.quantity,
        'currentPrice', OLD."currentPrice",
        'totalValue', OLD."totalValue",
        'notes', OLD.notes,
        'lastUpdated', OLD."lastUpdated",
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

-- Triggers for personal_assets
CREATE TRIGGER log_personal_assets_insert
  AFTER INSERT ON personal_assets
  FOR EACH ROW EXECUTE FUNCTION log_personal_assets_changes();

CREATE TRIGGER log_personal_assets_update
  AFTER UPDATE ON personal_assets
  FOR EACH ROW EXECUTE FUNCTION log_personal_assets_changes();

CREATE TRIGGER log_personal_assets_delete
  AFTER DELETE ON personal_assets
  FOR EACH ROW EXECUTE FUNCTION log_personal_assets_changes();

-- Function to log activity for solo_401k_assets
CREATE OR REPLACE FUNCTION log_solo_401k_assets_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_logs (table_name, record_id, operation, new_values, created_at)
    VALUES (
      'solo_401k_assets',
      NEW.id,
      'INSERT',
      jsonb_build_object(
        'id', NEW.id,
        'symbol', NEW.symbol,
        'name', NEW.name,
        'type', NEW.type,
        'quantity', NEW.quantity,
        'currentPrice', NEW."currentPrice",
        'totalValue', NEW."totalValue",
        'notes', NEW.notes,
        'lastUpdated', NEW."lastUpdated",
        'createdAt', NEW."createdAt",
        'updatedAt', NEW."updatedAt"
      ),
      TO_CHAR(NOW(), 'MM/DD/YY')
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO activity_logs (table_name, record_id, operation, old_values, new_values, created_at)
    VALUES (
      'solo_401k_assets',
      NEW.id,
      'UPDATE',
      jsonb_build_object(
        'id', OLD.id,
        'symbol', OLD.symbol,
        'name', OLD.name,
        'type', OLD.type,
        'quantity', OLD.quantity,
        'currentPrice', OLD."currentPrice",
        'totalValue', OLD."totalValue",
        'notes', OLD.notes,
        'lastUpdated', OLD."lastUpdated",
        'createdAt', OLD."createdAt",
        'updatedAt', OLD."updatedAt"
      ),
      jsonb_build_object(
        'id', NEW.id,
        'symbol', NEW.symbol,
        'name', NEW.name,
        'type', NEW.type,
        'quantity', NEW.quantity,
        'currentPrice', NEW."currentPrice",
        'totalValue', NEW."totalValue",
        'notes', NEW.notes,
        'lastUpdated', NEW."lastUpdated",
        'createdAt', NEW."createdAt",
        'updatedAt', NEW."updatedAt"
      ),
      TO_CHAR(NOW(), 'MM/DD/YY')
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO activity_logs (table_name, record_id, operation, old_values, created_at)
    VALUES (
      'solo_401k_assets',
      OLD.id,
      'DELETE',
      jsonb_build_object(
        'id', OLD.id,
        'symbol', OLD.symbol,
        'name', OLD.name,
        'type', OLD.type,
        'quantity', OLD.quantity,
        'currentPrice', OLD."currentPrice",
        'totalValue', OLD."totalValue",
        'notes', OLD.notes,
        'lastUpdated', OLD."lastUpdated",
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

-- Triggers for solo_401k_assets
CREATE TRIGGER log_solo_401k_assets_insert
  AFTER INSERT ON solo_401k_assets
  FOR EACH ROW EXECUTE FUNCTION log_solo_401k_assets_changes();

CREATE TRIGGER log_solo_401k_assets_update
  AFTER UPDATE ON solo_401k_assets
  FOR EACH ROW EXECUTE FUNCTION log_solo_401k_assets_changes();

CREATE TRIGGER log_solo_401k_assets_delete
  AFTER DELETE ON solo_401k_assets
  FOR EACH ROW EXECUTE FUNCTION log_solo_401k_assets_changes();

-- Function to log activity for monthly_inputs
CREATE OR REPLACE FUNCTION log_monthly_inputs_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_logs (table_name, record_id, operation, new_values, created_at)
    VALUES (
      'monthly_inputs',
      NEW.id,
      'INSERT',
      jsonb_build_object(
        'id', NEW.id,
        'month', NEW.month,
        'year', NEW.year,
        'cash', NEW.cash,
        'stocks', NEW.stocks,
        'crypto', NEW.crypto,
        'gold', NEW.gold,
        'silver', NEW.silver,
        'misc', NEW.misc,
        'notes', NEW.notes,
        'createdAt', NEW.created_at,
        'updatedAt', NEW.updated_at
      ),
      TO_CHAR(NOW(), 'MM/DD/YY')
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO activity_logs (table_name, record_id, operation, old_values, new_values, created_at)
    VALUES (
      'monthly_inputs',
      NEW.id,
      'UPDATE',
      jsonb_build_object(
        'id', OLD.id,
        'month', OLD.month,
        'year', OLD.year,
        'cash', OLD.cash,
        'stocks', OLD.stocks,
        'crypto', OLD.crypto,
        'gold', OLD.gold,
        'silver', OLD.silver,
        'misc', OLD.misc,
        'notes', OLD.notes,
        'createdAt', OLD.created_at,
        'updatedAt', OLD.updated_at
      ),
      jsonb_build_object(
        'id', NEW.id,
        'month', NEW.month,
        'year', NEW.year,
        'cash', NEW.cash,
        'stocks', NEW.stocks,
        'crypto', NEW.crypto,
        'gold', NEW.gold,
        'silver', NEW.silver,
        'misc', NEW.misc,
        'notes', NEW.notes,
        'createdAt', NEW.created_at,
        'updatedAt', NEW.updated_at
      ),
      TO_CHAR(NOW(), 'MM/DD/YY')
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO activity_logs (table_name, record_id, operation, old_values, created_at)
    VALUES (
      'monthly_inputs',
      OLD.id,
      'DELETE',
      jsonb_build_object(
        'id', OLD.id,
        'month', OLD.month,
        'year', OLD.year,
        'cash', OLD.cash,
        'stocks', OLD.stocks,
        'crypto', OLD.crypto,
        'gold', OLD.gold,
        'silver', OLD.silver,
        'misc', OLD.misc,
        'notes', OLD.notes,
        'createdAt', OLD.created_at,
        'updatedAt', OLD.updated_at
      ),
      TO_CHAR(NOW(), 'MM/DD/YY')
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for monthly_inputs
CREATE TRIGGER log_monthly_inputs_insert
  AFTER INSERT ON monthly_inputs
  FOR EACH ROW EXECUTE FUNCTION log_monthly_inputs_changes();

CREATE TRIGGER log_monthly_inputs_update
  AFTER UPDATE ON monthly_inputs
  FOR EACH ROW EXECUTE FUNCTION log_monthly_inputs_changes();

CREATE TRIGGER log_monthly_inputs_delete
  AFTER DELETE ON monthly_inputs
  FOR EACH ROW EXECUTE FUNCTION log_monthly_inputs_changes();



