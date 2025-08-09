/*
  Warnings:

  - You are about to drop the `Scores` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "Scores_createdAt_idx";

-- DropIndex
DROP INDEX "Scores_userId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Scores";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Other" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Other_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "criminalScore" INTEGER NOT NULL DEFAULT 250,
    "otherScore" INTEGER NOT NULL DEFAULT 250,
    "ratingScore" INTEGER NOT NULL DEFAULT 250,
    "relationScore" INTEGER NOT NULL DEFAULT 250
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Other_userId_idx" ON "Other"("userId");

-- CreateIndex
CREATE INDEX "Other_category_idx" ON "Other"("category");
