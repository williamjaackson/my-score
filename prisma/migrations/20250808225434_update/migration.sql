/*
  Warnings:

  - You are about to drop the column `lastRated` on the `Rating` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Rating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetId" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "lastRatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Rating_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Rating_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Rating" ("authorId", "comment", "createdAt", "id", "rating", "targetId") SELECT "authorId", "comment", "createdAt", "id", "rating", "targetId" FROM "Rating";
DROP TABLE "Rating";
ALTER TABLE "new_Rating" RENAME TO "Rating";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
