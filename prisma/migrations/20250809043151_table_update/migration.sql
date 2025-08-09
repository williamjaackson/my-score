/*
  Warnings:

  - You are about to drop the column `communityScore` on the `Scores` table. All the data in the column will be lost.
  - Added the required column `relationScore` to the `Scores` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Scores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "ratingScore" INTEGER NOT NULL,
    "relationScore" INTEGER NOT NULL,
    "criminalScore" INTEGER NOT NULL,
    "otherScore" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Scores" ("createdAt", "criminalScore", "id", "otherScore", "ratingScore", "updatedAt", "userId") SELECT "createdAt", "criminalScore", "id", "otherScore", "ratingScore", "updatedAt", "userId" FROM "Scores";
DROP TABLE "Scores";
ALTER TABLE "new_Scores" RENAME TO "Scores";
CREATE INDEX "Scores_userId_idx" ON "Scores"("userId");
CREATE INDEX "Scores_createdAt_idx" ON "Scores"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
