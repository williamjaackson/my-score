-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "criminalScore" INTEGER NOT NULL DEFAULT 250,
    "otherScore" INTEGER NOT NULL DEFAULT 250,
    "ratingScore" INTEGER NOT NULL DEFAULT 250,
    "relationScore" INTEGER NOT NULL DEFAULT 250
);
INSERT INTO "new_User" ("createdAt", "criminalScore", "email", "id", "name", "otherScore", "password", "ratingScore", "relationScore", "updatedAt") SELECT "createdAt", "criminalScore", "email", "id", "name", "otherScore", "password", "ratingScore", "relationScore", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
