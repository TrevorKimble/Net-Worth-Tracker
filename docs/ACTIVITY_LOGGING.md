# Activity Logging with Database Triggers

## Overview

This project uses **database-level triggers** to automatically log all changes to the database tables. This is similar to PostgreSQL triggers but adapted for SQLite.

## How It Works

### Current Setup

**Manual Logging** (Existing):
- The `AssetLog` model is manually populated in API routes (`src/app/api/assets/*/route.ts`)
- This logs high-level business actions (BUY, SELL, UPDATE_PRICE, etc.)

**Automatic Logging** (New):
- Database triggers automatically log ALL database changes (INSERT, UPDATE, DELETE)
- Logs are stored in the `activity_logs` table
- Captures complete before/after states as JSON

### Database Triggers

Triggers are created for:
- `personal_assets` - INSERT, UPDATE, DELETE
- `solo_401k_assets` - INSERT, UPDATE, DELETE  
- `monthly_inputs` - INSERT, UPDATE, DELETE

Each trigger automatically:
1. Captures the old values (for UPDATE/DELETE)
2. Captures the new values (for INSERT/UPDATE)
3. Stores everything as JSON in the `activity_logs` table

## Setup

### 1. Apply the Migration

```bash
npx prisma migrate dev --name add_activity_log_triggers
```

Or if you want to apply it manually:

```bash
npx prisma db execute --file prisma/migrations/20250115000000_add_activity_log_triggers/migration.sql
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

## Usage

### Query Activity Logs

```typescript
// Get all logs
const logs = await prisma.activityLog.findMany({
  orderBy: { created_at: 'desc' },
  take: 100
})

// Parse JSON values
logs.forEach(log => {
  const oldValues = log.old_values ? JSON.parse(log.old_values) : null
  const newValues = log.new_values ? JSON.parse(log.new_values) : null
})
```

### Via API

```bash
# Get all activity logs
GET /api/activity-logs

# Filter by table
GET /api/activity-logs?table_name=personal_assets

# Filter by record ID
GET /api/activity-logs?table_name=personal_assets&record_id=1

# Filter by operation
GET /api/activity-logs?operation=UPDATE

# Limit results
GET /api/activity-logs?limit=50
```

## Example Output

```json
{
  "id": 1,
  "table_name": "personal_assets",
  "record_id": 5,
  "operation": "UPDATE",
  "old_values": {
    "id": 5,
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "quantity": 100,
    "currentPrice": 150.25,
    "totalValue": 15025.00
  },
  "new_values": {
    "id": 5,
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "quantity": 150,
    "currentPrice": 150.25,
    "totalValue": 22537.50
  },
  "created_at": "01/15/25"
}
```

## Differences from PostgreSQL

### SQLite Limitations

1. **No JSONB**: SQLite stores JSON as TEXT and uses `json_object()` function
2. **No Exception Handling**: Unlike PostgreSQL, SQLite triggers don't support exception handling. If logging fails, the transaction fails.
3. **No Stored Procedures**: All trigger logic must be inline

### SQLite Advantages

1. **Simple**: No need for separate function definitions
2. **Fast**: Triggers execute atomically with the transaction
3. **Reliable**: If logging fails, the entire operation rolls back

## Future Enhancements

If you want PostgreSQL-like features:
1. Migrate to PostgreSQL: Change `provider = "postgresql"` in `schema.prisma`
2. Use the original PostgreSQL trigger function provided
3. PostgreSQL supports JSONB, exception handling, and stored procedures

## Maintenance

### View All Triggers

```sql
SELECT name, sql FROM sqlite_master WHERE type = 'trigger';
```

### Drop a Trigger

```sql
DROP TRIGGER IF EXISTS log_personal_assets_insert;
```

### Disable Logging Temporarily

You can disable triggers by dropping them, but remember to recreate them:

```sql
-- Disable
DROP TRIGGER log_personal_assets_insert;
DROP TRIGGER log_personal_assets_update;
DROP TRIGGER log_personal_assets_delete;

-- Re-enable (re-run migration)
```

## Performance Considerations

- Indexes are created on `(table_name, record_id)` and `created_at` for fast queries
- Consider periodic cleanup of old logs:
  ```sql
  DELETE FROM activity_logs WHERE created_at < date('now', '-1 year');
  ```

