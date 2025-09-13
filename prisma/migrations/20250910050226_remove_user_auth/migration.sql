/*
  Warnings:

  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verificationtokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `userId` on the `asset_logs` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `monthly_inputs` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `personal_assets` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `solo_401k_assets` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "accounts_provider_providerAccountId_key";

-- DropIndex
DROP INDEX "sessions_sessionToken_key";

-- DropIndex
DROP INDEX "users_email_key";

-- DropIndex
DROP INDEX "verificationtokens_identifier_token_key";

-- DropIndex
DROP INDEX "verificationtokens_token_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "accounts";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "sessions";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "users";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "verificationtokens";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_asset_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "id" TEXT NOT NULL PRIMARY KEY,
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
