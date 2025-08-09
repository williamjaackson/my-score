/*
  Warnings:

  - You are about to drop the `OtherScore` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RelationScore` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OtherScore";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RelationScore";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Scores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "ratingScore" INTEGER NOT NULL,
    "communityScore" INTEGER NOT NULL,
    "criminalScore" INTEGER NOT NULL,
    "otherScore" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Scores_userId_idx" ON "Scores"("userId");

-- CreateIndex
CREATE INDEX "Scores_createdAt_idx" ON "Scores"("createdAt");
