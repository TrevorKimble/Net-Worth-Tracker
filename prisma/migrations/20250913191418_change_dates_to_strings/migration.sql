-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
);
INSERT INTO "new_monthly_inputs" ("cash", "createdAt", "crypto", "gold", "id", "misc", "month", "notes", "silver", "stocks", "updatedAt", "year") SELECT "cash", "createdAt", "crypto", "gold", "id", "misc", "month", "notes", "silver", "stocks", "updatedAt", "year" FROM "monthly_inputs";
DROP TABLE "monthly_inputs";
ALTER TABLE "new_monthly_inputs" RENAME TO "monthly_inputs";
CREATE UNIQUE INDEX "monthly_inputs_month_year_key" ON "monthly_inputs"("month", "year");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
