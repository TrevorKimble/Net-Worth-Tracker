/*
  Warnings:

  - The primary key for the `asset_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `asset_logs` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `monthly_inputs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `monthly_inputs` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `personal_assets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `personal_assets` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `solo_401k_assets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `solo_401k_assets` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_asset_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "portfolio" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "quantity" REAL,
    "price" REAL NOT NULL,
    "totalValue" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_asset_logs" ("action", "createdAt", "id", "notes", "portfolio", "price", "quantity", "symbol", "totalValue") SELECT "action", "createdAt", "id", "notes", "portfolio", "price", "quantity", "symbol", "totalValue" FROM "asset_logs";
DROP TABLE "asset_logs";
ALTER TABLE "new_asset_logs" RENAME TO "asset_logs";
CREATE TABLE "new_monthly_inputs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "cash" REAL NOT NULL DEFAULT 0,
    "stocks" REAL NOT NULL DEFAULT 0,
    "crypto" REAL NOT NULL DEFAULT 0,
    "gold" REAL NOT NULL DEFAULT 0,
    "silver" REAL NOT NULL DEFAULT 0,
    "misc" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_monthly_inputs" ("cash", "createdAt", "crypto", "gold", "id", "misc", "month", "notes", "silver", "stocks", "updatedAt", "year") SELECT "cash", "createdAt", "crypto", "gold", "id", "misc", "month", "notes", "silver", "stocks", "updatedAt", "year" FROM "monthly_inputs";
DROP TABLE "monthly_inputs";
ALTER TABLE "new_monthly_inputs" RENAME TO "monthly_inputs";
CREATE UNIQUE INDEX "monthly_inputs_month_year_key" ON "monthly_inputs"("month", "year");
CREATE TABLE "new_personal_assets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "currentPrice" REAL NOT NULL DEFAULT 0,
    "totalValue" REAL NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_personal_assets" ("createdAt", "currentPrice", "id", "lastUpdated", "name", "quantity", "symbol", "totalValue", "type", "updatedAt") SELECT "createdAt", "currentPrice", "id", "lastUpdated", "name", "quantity", "symbol", "totalValue", "type", "updatedAt" FROM "personal_assets";
DROP TABLE "personal_assets";
ALTER TABLE "new_personal_assets" RENAME TO "personal_assets";
CREATE UNIQUE INDEX "personal_assets_symbol_key" ON "personal_assets"("symbol");
CREATE TABLE "new_solo_401k_assets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "currentPrice" REAL NOT NULL DEFAULT 0,
    "totalValue" REAL NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_solo_401k_assets" ("createdAt", "currentPrice", "id", "lastUpdated", "name", "quantity", "symbol", "totalValue", "type", "updatedAt") SELECT "createdAt", "currentPrice", "id", "lastUpdated", "name", "quantity", "symbol", "totalValue", "type", "updatedAt" FROM "solo_401k_assets";
DROP TABLE "solo_401k_assets";
ALTER TABLE "new_solo_401k_assets" RENAME TO "solo_401k_assets";
CREATE UNIQUE INDEX "solo_401k_assets_symbol_key" ON "solo_401k_assets"("symbol");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
