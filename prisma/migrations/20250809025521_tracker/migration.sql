/*
  Warnings:

  - You are about to drop the column `lastRatedAt` on the `Rating` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "RelatedUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "relatedUserId" TEXT NOT NULL,
    "spentTimeMs" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RelatedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CriminalRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT,
    "date" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CriminalRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RelationScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RelationScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OtherScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OtherScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "proximity_sessions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "nearby_user_id" TEXT NOT NULL,
    "start_time" BIGINT NOT NULL,
    "end_time" BIGINT,
    "duration_ms" BIGINT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "proximity_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "proximity_sessions_nearby_user_id_fkey" FOREIGN KEY ("nearby_user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_proximity_totals" (
    "user_id" TEXT NOT NULL,
    "nearby_user_id" TEXT NOT NULL,
    "total_duration_ms" BIGINT NOT NULL DEFAULT 0,
    "session_count" INTEGER NOT NULL DEFAULT 0,
    "last_session_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("user_id", "nearby_user_id"),
    CONSTRAINT "user_proximity_totals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_proximity_totals_nearby_user_id_fkey" FOREIGN KEY ("nearby_user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Rating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetId" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" TEXT NOT NULL,
    CONSTRAINT "Rating_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Rating_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Rating" ("authorId", "comment", "createdAt", "id", "rating", "targetId") SELECT "authorId", "comment", "createdAt", "id", "rating", "targetId" FROM "Rating";
DROP TABLE "Rating";
ALTER TABLE "new_Rating" RENAME TO "Rating";
CREATE INDEX "Rating_targetId_idx" ON "Rating"("targetId");
CREATE INDEX "Rating_authorId_idx" ON "Rating"("authorId");
CREATE INDEX "Rating_createdAt_idx" ON "Rating"("createdAt");
CREATE UNIQUE INDEX "Rating_authorId_targetId_key" ON "Rating"("authorId", "targetId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password") SELECT "createdAt", "email", "id", "name", "password" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "RelatedUser_userId_idx" ON "RelatedUser"("userId");

-- CreateIndex
CREATE INDEX "RelatedUser_relatedUserId_idx" ON "RelatedUser"("relatedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "RelatedUser_userId_relatedUserId_key" ON "RelatedUser"("userId", "relatedUserId");

-- CreateIndex
CREATE INDEX "CriminalRecord_userId_idx" ON "CriminalRecord"("userId");

-- CreateIndex
CREATE INDEX "CriminalRecord_date_idx" ON "CriminalRecord"("date");

-- CreateIndex
CREATE UNIQUE INDEX "RelationScore_userId_key" ON "RelationScore"("userId");

-- CreateIndex
CREATE INDEX "RelationScore_score_idx" ON "RelationScore"("score");

-- CreateIndex
CREATE INDEX "OtherScore_userId_idx" ON "OtherScore"("userId");

-- CreateIndex
CREATE INDEX "OtherScore_category_idx" ON "OtherScore"("category");

-- CreateIndex
CREATE INDEX "proximity_sessions_user_id_idx" ON "proximity_sessions"("user_id");

-- CreateIndex
CREATE INDEX "proximity_sessions_nearby_user_id_idx" ON "proximity_sessions"("nearby_user_id");

-- CreateIndex
CREATE INDEX "proximity_sessions_start_time_idx" ON "proximity_sessions"("start_time");

-- CreateIndex
CREATE INDEX "proximity_sessions_end_time_idx" ON "proximity_sessions"("end_time");

-- CreateIndex
CREATE UNIQUE INDEX "proximity_sessions_user_id_nearby_user_id_start_time_key" ON "proximity_sessions"("user_id", "nearby_user_id", "start_time");

-- CreateIndex
CREATE INDEX "user_proximity_totals_total_duration_ms_idx" ON "user_proximity_totals"("total_duration_ms");

-- CreateIndex
CREATE INDEX "user_proximity_totals_last_session_at_idx" ON "user_proximity_totals"("last_session_at");
