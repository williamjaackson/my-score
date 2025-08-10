-- CreateTable
CREATE TABLE "FaceDescriptor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "descriptor" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FaceDescriptor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "FaceDescriptor_userId_idx" ON "FaceDescriptor"("userId");
