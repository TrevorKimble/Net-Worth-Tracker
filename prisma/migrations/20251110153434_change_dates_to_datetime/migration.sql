-- Convert date columns from TEXT to DATETIME
-- SQLite stores DateTime as TEXT in ISO format, so we need to recreate the tables
-- This preserves existing data by copying it to new tables with the correct schema

-- For income table: recreate with DateTime column
CREATE TABLE "income_temp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "income_source" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
);
-- Copy existing data, converting date strings to ISO format if needed
INSERT INTO "income_temp" SELECT "id", "date", "income_source", "amount", "notes", "createdAt", "updatedAt" FROM "income";
DROP TABLE "income";
ALTER TABLE "income_temp" RENAME TO "income";

-- For solo_401k_conversions table: recreate with DateTime column
CREATE TABLE "solo_401k_conversions_temp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
);
-- Copy existing data
INSERT INTO "solo_401k_conversions_temp" SELECT "id", "date", "amount", "notes", "createdAt", "updatedAt" FROM "solo_401k_conversions";
DROP TABLE "solo_401k_conversions";
ALTER TABLE "solo_401k_conversions_temp" RENAME TO "solo_401k_conversions";

