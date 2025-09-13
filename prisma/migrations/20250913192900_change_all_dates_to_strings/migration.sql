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
    "createdAt" TEXT NOT NULL
);
INSERT INTO "new_asset_logs" ("action", "createdAt", "id", "notes", "portfolio", "price", "quantity", "symbol", "totalValue") SELECT "action", "createdAt", "id", "notes", "portfolio", "price", "quantity", "symbol", "totalValue" FROM "asset_logs";
DROP TABLE "asset_logs";
ALTER TABLE "new_asset_logs" RENAME TO "asset_logs";
CREATE TABLE "new_personal_assets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "currentPrice" REAL NOT NULL DEFAULT 0,
    "totalValue" REAL NOT NULL DEFAULT 0,
    "lastUpdated" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
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
    "lastUpdated" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
);
INSERT INTO "new_solo_401k_assets" ("createdAt", "currentPrice", "id", "lastUpdated", "name", "quantity", "symbol", "totalValue", "type", "updatedAt") SELECT "createdAt", "currentPrice", "id", "lastUpdated", "name", "quantity", "symbol", "totalValue", "type", "updatedAt" FROM "solo_401k_assets";
DROP TABLE "solo_401k_assets";
ALTER TABLE "new_solo_401k_assets" RENAME TO "solo_401k_assets";
CREATE UNIQUE INDEX "solo_401k_assets_symbol_key" ON "solo_401k_assets"("symbol");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
