-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_proximity_sessions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT,
    "nearby_user_id" TEXT,
    "start_time" BIGINT NOT NULL,
    "end_time" BIGINT,
    "duration_ms" BIGINT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "proximity_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "proximity_sessions_nearby_user_id_fkey" FOREIGN KEY ("nearby_user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_proximity_sessions" ("created_at", "duration_ms", "end_time", "id", "nearby_user_id", "start_time", "updated_at", "user_id") SELECT "created_at", "duration_ms", "end_time", "id", "nearby_user_id", "start_time", "updated_at", "user_id" FROM "proximity_sessions";
DROP TABLE "proximity_sessions";
ALTER TABLE "new_proximity_sessions" RENAME TO "proximity_sessions";
CREATE INDEX "proximity_sessions_user_id_idx" ON "proximity_sessions"("user_id");
CREATE INDEX "proximity_sessions_nearby_user_id_idx" ON "proximity_sessions"("nearby_user_id");
CREATE INDEX "proximity_sessions_start_time_idx" ON "proximity_sessions"("start_time");
CREATE INDEX "proximity_sessions_end_time_idx" ON "proximity_sessions"("end_time");
CREATE UNIQUE INDEX "proximity_sessions_user_id_nearby_user_id_start_time_key" ON "proximity_sessions"("user_id", "nearby_user_id", "start_time");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
