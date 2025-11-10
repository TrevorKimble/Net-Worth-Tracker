-- CreateTable
CREATE TABLE IF NOT EXISTS "income" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "income_source" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "solo_401k_conversions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
);

