-- Create generic activity log table for all database changes
CREATE TABLE IF NOT EXISTS "activity_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "table_name" TEXT NOT NULL,
    "record_id" INTEGER NOT NULL,
    "operation" TEXT NOT NULL,
    "old_values" TEXT, -- JSON string (SQLite doesn't have JSONB, but we can store JSON as TEXT)
    "new_values" TEXT, -- JSON string
    "created_at" TEXT NOT NULL DEFAULT (strftime('%m/%d/%y', 'now'))
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "idx_activity_logs_table_record" ON "activity_logs"("table_name", "record_id");
CREATE INDEX IF NOT EXISTS "idx_activity_logs_created_at" ON "activity_logs"("created_at");

-- Trigger function to handle logging (SQLite version)
-- Note: SQLite doesn't support stored procedures like PostgreSQL, so we'll create triggers directly

-- Trigger for personal_assets INSERT
CREATE TRIGGER IF NOT EXISTS "log_personal_assets_insert"
AFTER INSERT ON "personal_assets"
BEGIN
    INSERT INTO "activity_logs" ("table_name", "record_id", "operation", "new_values", "created_at")
    VALUES (
        'personal_assets',
        NEW.id,
        'INSERT',
        json_object(
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
        strftime('%m/%d/%y', 'now')
    );
END;

-- Trigger for personal_assets UPDATE
CREATE TRIGGER IF NOT EXISTS "log_personal_assets_update"
AFTER UPDATE ON "personal_assets"
BEGIN
    INSERT INTO "activity_logs" ("table_name", "record_id", "operation", "old_values", "new_values")
    VALUES (
        'personal_assets',
        NEW.id,
        'UPDATE',
        json_object(
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
        json_object(
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
        strftime('%m/%d/%y', 'now')
    );
END;

-- Trigger for personal_assets DELETE
CREATE TRIGGER IF NOT EXISTS "log_personal_assets_delete"
AFTER DELETE ON "personal_assets"
BEGIN
    INSERT INTO "activity_logs" ("table_name", "record_id", "operation", "old_values", "created_at")
    VALUES (
        'personal_assets',
        OLD.id,
        'DELETE',
        json_object(
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
        strftime('%m/%d/%y', 'now')
    );
END;

-- Trigger for solo_401k_assets INSERT
CREATE TRIGGER IF NOT EXISTS "log_solo_401k_assets_insert"
AFTER INSERT ON "solo_401k_assets"
BEGIN
    INSERT INTO "activity_logs" ("table_name", "record_id", "operation", "new_values")
    VALUES (
        'solo_401k_assets',
        NEW.id,
        'INSERT',
        json_object(
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
        strftime('%m/%d/%y', 'now')
    );
END;

-- Trigger for solo_401k_assets UPDATE
CREATE TRIGGER IF NOT EXISTS "log_solo_401k_assets_update"
AFTER UPDATE ON "solo_401k_assets"
BEGIN
    INSERT INTO "activity_logs" ("table_name", "record_id", "operation", "old_values", "new_values")
    VALUES (
        'solo_401k_assets',
        NEW.id,
        'UPDATE',
        json_object(
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
        json_object(
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
        strftime('%m/%d/%y', 'now')
    );
END;

-- Trigger for solo_401k_assets DELETE
CREATE TRIGGER IF NOT EXISTS "log_solo_401k_assets_delete"
AFTER DELETE ON "solo_401k_assets"
BEGIN
    INSERT INTO "activity_logs" ("table_name", "record_id", "operation", "old_values")
    VALUES (
        'solo_401k_assets',
        OLD.id,
        'DELETE',
        json_object(
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
        strftime('%m/%d/%y', 'now')
    );
END;

-- Trigger for monthly_inputs INSERT
CREATE TRIGGER IF NOT EXISTS "log_monthly_inputs_insert"
AFTER INSERT ON "monthly_inputs"
BEGIN
    INSERT INTO "activity_logs" ("table_name", "record_id", "operation", "new_values")
    VALUES (
        'monthly_inputs',
        NEW.id,
        'INSERT',
        json_object(
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
            'createdAt', NEW."createdAt",
            'updatedAt', NEW."updatedAt"
        ),
        strftime('%m/%d/%y', 'now')
    );
END;

-- Trigger for monthly_inputs UPDATE
CREATE TRIGGER IF NOT EXISTS "log_monthly_inputs_update"
AFTER UPDATE ON "monthly_inputs"
BEGIN
    INSERT INTO "activity_logs" ("table_name", "record_id", "operation", "old_values", "new_values")
    VALUES (
        'monthly_inputs',
        NEW.id,
        'UPDATE',
        json_object(
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
            'createdAt', OLD."createdAt",
            'updatedAt', OLD."updatedAt"
        ),
        json_object(
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
            'createdAt', NEW."createdAt",
            'updatedAt', NEW."updatedAt"
        ),
        strftime('%m/%d/%y', 'now')
    );
END;

-- Trigger for monthly_inputs DELETE
CREATE TRIGGER IF NOT EXISTS "log_monthly_inputs_delete"
AFTER DELETE ON "monthly_inputs"
BEGIN
    INSERT INTO "activity_logs" ("table_name", "record_id", "operation", "old_values")
    VALUES (
        'monthly_inputs',
        OLD.id,
        'DELETE',
        json_object(
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
            'createdAt', OLD."createdAt",
            'updatedAt', OLD."updatedAt"
        ),
        strftime('%m/%d/%y', 'now')
    );
END;
